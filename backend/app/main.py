from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from typing import Optional
import io
from dotenv import load_dotenv
from pathlib import Path
from sklearn.base import BaseEstimator, TransformerMixin

# Load environment variables at module level
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# FeatureEngineer class - needed for loading the pipeline
class FeatureEngineer(BaseEstimator, TransformerMixin):
    """Create engineered features - must match training script"""
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        X_copy = X.copy()
        
        # Create interaction features
        X_copy['value_per_bidder'] = X_copy['tender_value_kes'] / (X_copy['number_of_bidders'] + 1)
        X_copy['complexity_duration'] = X_copy['process_complexity'] * X_copy['project_duration_days']
        X_copy['high_value_low_competition'] = (
            (X_copy['tender_value_kes'] > 50000000) & (X_copy['number_of_bidders'] <= 2)
        ).astype(int)
        
        # Log transformations
        X_copy['log_tender_value'] = np.log1p(X_copy['tender_value_kes'])
        X_copy['log_duration'] = np.log1p(X_copy['project_duration_days'])
        
        # Binned features
        X_copy['is_high_value'] = (X_copy['tender_value_kes'] > 100000000).astype(int)
        X_copy['is_low_competition'] = (X_copy['number_of_bidders'] <= 2).astype(int)
        X_copy['is_complex'] = (X_copy['process_complexity'] >= 7).astype(int)
        
        return X_copy
    
    def get_feature_names_out(self, input_features=None):
        """Return feature names for output features"""
        return np.array([
            'tender_value_kes', 'number_of_bidders', 'project_duration_days',
            'process_complexity', 'pep_involvement', 'value_per_bidder',
            'complexity_duration', 'high_value_low_competition', 'log_tender_value',
            'log_duration', 'is_high_value', 'is_low_competition', 'is_complex'
        ])

app = FastAPI(
    title="Glassbox AI API",
    version="0.3.0",
    description="Multi-modal AI-powered government tender risk assessment with text analysis"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = None
preprocessor = None
model = None
shap_explainer = None
feature_names = None
model_stats = None

@app.on_event("startup")
async def load_models():
    global pipeline, preprocessor, model, shap_explainer, feature_names, model_stats

    try:
        # Try to load pipeline model first (enhanced accuracy)
        pipeline_model_path = Path(__file__).parent.parent / "models" / "auditor_model_pipeline.joblib"
        pipeline_stats_path = Path(__file__).parent.parent / "data" / "model_stats_pipeline.json"
        
        if pipeline_model_path.exists():
            print("Loading ENHANCED XGBoost Pipeline model...")
            pipeline = joblib.load(str(pipeline_model_path))
            model = pipeline.named_steps['classifier']
            preprocessor = pipeline.named_steps['preprocessor']
            
            print("Loading SHAP explainer for pipeline...")
            shap_explainer_path = Path(__file__).parent.parent / "models" / "shap_explainer_pipeline.joblib"
            import shap
            if shap_explainer_path.exists():
                shap_explainer = joblib.load(str(shap_explainer_path))
            else:
                print("Creating new SHAP explainer...")
                shap_explainer = shap.TreeExplainer(model)
            
            print("Setting feature names from pipeline...")
            # Get feature names from preprocessor
            feature_names = []
            numeric_cols = preprocessor.named_transformers_['num'].get_feature_names_out()
            feature_names.extend([col.replace('scaler__', '') for col in numeric_cols])
            try:
                text_cols = preprocessor.named_transformers_['text'].named_steps['tfidf'].get_feature_names_out()
                feature_names.extend([f'text__{col}' for col in text_cols])
            except:
                pass
            
            print("Loading pipeline model statistics...")
            with open(str(pipeline_stats_path), "r") as f:
                model_stats = json.load(f)
            
            print("=" * 70)
            print("GLASSBOX AI ENHANCED PIPELINE MODEL LOADED!")
            print("=" * 70)
        
        else:
            # Fallback to simple model
            print("Loading simple XGBoost model...")
            model_path = Path(__file__).parent.parent / "models" / "auditor_model.joblib"
            model = joblib.load(str(model_path))
            
            # For the simple model (no pipeline), we don't have a preprocessor
            pipeline = None
            preprocessor = None

            print("Setting feature names...")
            # Feature names for the simple model
            feature_names = [
                'tender_value_kes',
                'number_of_bidders',
                'project_duration_days',
                'process_complexity',
                'pep_involvement'
            ]
            
            print("Creating SHAP explainer...")
            import shap
            shap_explainer = shap.TreeExplainer(model)

            print("Loading model statistics...")
            stats_path = Path(__file__).parent.parent / "data" / "model_stats.json"
            with open(str(stats_path), "r") as f:
                model_stats = json.load(f)
            
            print("=" * 70)
            print("GLASSBOX AI SIMPLE MODEL LOADED!")
            print("=" * 70)
        
        print(f"Model Accuracy: {model_stats['model_accuracy']*100:.2f}%")
        print(f"AUC Score: {model_stats.get('model_auc_score', 'N/A')}")
        print(f"Training Dataset: {model_stats['total_tenders_trained_on']:,} tenders")
        print(f"Total Features: {len(feature_names)}")
        print(f"Model Type: {model_stats.get('model_type', 'XGBoost Multi-Class')}")
        print(f"Pipeline: {'Yes' if pipeline else 'No'}")
        print("=" * 70)

    except Exception as e:
        print(f"ERROR loading models: {e}")
        import traceback
        traceback.print_exc()
        print("Please run: python backend/scripts/train_model.py")

class TenderInput(BaseModel):
    tender_title: str = Field(..., min_length=1, max_length=500)
    tender_value_kes: float = Field(..., gt=0, le=1e12)
    number_of_bidders: int = Field(..., ge=1, le=100)
    project_duration_days: int = Field(..., ge=1, le=3650)
    process_complexity: int = Field(..., ge=1, le=10)
    pep_involvement: bool
    tender_description: str = Field(..., min_length=10, max_length=2000)

class AuditResponse(BaseModel):
    risk_score: float
    risk_level: str
    shap_values: dict
    interpretation: Optional[str]
    text_analysis: Optional[str]
    text_contribution_percentage: float
    numeric_contribution_percentage: float
    error: Optional[str]

class ReportRequest(BaseModel):
    tender_title: str
    tender_value_kes: float
    number_of_bidders: int
    project_duration_days: int
    process_complexity: int
    pep_involvement: bool
    tender_description: str
    risk_score: float
    risk_level: str
    interpretation: Optional[str]
    text_analysis: Optional[str]
    shap_values: dict
    text_contribution_percentage: float
    numeric_contribution_percentage: float
    timestamp: str

@app.get("/")
async def root():
    return {
        "message": "Glassbox AI API - Multi-Modal Edition",
        "tagline": "Transparent Governance Through AI with Text Analysis",
        "version": "0.3.0",
        "status": "online",
        "features": ["numeric_analysis", "text_analysis", "shap_explainability"]
    }

@app.get("/api/v1/model-stats")
async def get_model_stats():
    if model_stats is None:
        raise HTTPException(status_code=503, detail="Model stats not available")

    return model_stats

@app.post("/api/v1/audit", response_model=AuditResponse)
async def audit_tender(tender: TenderInput):
    if model is None or shap_explainer is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please train a model first."
        )

    try:
        # Prepare input data
        if pipeline:
            # PIPELINE MODEL: Include tender_description for text features
            input_data = pd.DataFrame([{
                'tender_value_kes': tender.tender_value_kes,
                'number_of_bidders': tender.number_of_bidders,
                'project_duration_days': tender.project_duration_days,
                'process_complexity': tender.process_complexity,
                'pep_involvement': 1 if tender.pep_involvement else 0,
                'tender_description': tender.tender_description
            }])
            
            # Get prediction using pipeline
            risk_proba = pipeline.predict_proba(input_data)[0]
            predicted_level = int(pipeline.predict(input_data)[0])
            
            # Transform data for SHAP
            input_transformed = preprocessor.transform(input_data)
            
        else:
            # SIMPLE MODEL: Only numeric features
            input_data = pd.DataFrame([{
                'tender_value_kes': tender.tender_value_kes,
                'number_of_bidders': tender.number_of_bidders,
                'project_duration_days': tender.project_duration_days,
                'process_complexity': tender.process_complexity,
                'pep_involvement': 1 if tender.pep_involvement else 0,
            }])
            
            # Get prediction
            risk_proba = model.predict_proba(input_data)[0]
            predicted_level = int(model.predict(input_data)[0])
            
            # Data is already numeric for SHAP
            input_transformed = input_data.values
        
        # Map to risk levels
        risk_labels = {0: 'Minimal', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical'}
        risk_level = risk_labels.get(predicted_level, 'Unknown')
        
        # Calculate risk score: convert predicted level (0-4) to percentage (0-100%)
        # Level 0 (Minimal) = 0-20%, Level 1 (Low) = 20-40%, etc.
        # Use the probability as confidence within that range
        base_risk = predicted_level * 0.20  # Maps 0->0%, 1->20%, 2->40%, 3->60%, 4->80%
        confidence = float(risk_proba[predicted_level])  # How confident in this level
        
        # Risk score is base risk + confidence adjustment within the 20% range
        risk_score = base_risk + (confidence * 0.20)  # Add up to 20% based on confidence
        risk_score = min(risk_score, 1.0)  # Cap at 100%

        # Calculate SHAP values
        shap_values_raw = shap_explainer.shap_values(input_transformed)
        
        # For multi-class, use the SHAP values for the predicted class
        if isinstance(shap_values_raw, list):
            shap_values = shap_values_raw[predicted_level][0]
        else:
            shap_values = shap_values_raw[0]

        shap_dict = {
            name: float(value)
            for name, value in zip(feature_names, shap_values)
        }

        # Separate text and numeric features
        text_features = {k: v for k, v in shap_dict.items() if k.startswith('text__')}
        numeric_features = {k: v for k, v in shap_dict.items() if not k.startswith('text__')}
        
        text_impact = sum(abs(v) for v in text_features.values())
        numeric_impact = sum(abs(v) for v in numeric_features.values())
        total_impact = text_impact + numeric_impact

        if total_impact > 0:
            text_percentage = (text_impact / total_impact) * 100
            numeric_percentage = (numeric_impact / total_impact) * 100
        else:
            text_percentage = 0.0
            numeric_percentage = 100.0

        interpretation = None
        error = None

        try:
            interpretation = await generate_ai_interpretation(
                tender.dict(),
                risk_score,
                risk_level,
                shap_dict,
                text_features,
                text_percentage
            )
        except Exception as e:
            error = "AI summary generation failed."
            print(f"Gemini API error: {e}")

        return AuditResponse(
            risk_score=risk_score,
            risk_level=risk_level,
            shap_values=shap_dict,
            interpretation=interpretation,
            text_analysis=None,  # No text features in simple model
            text_contribution_percentage=text_percentage,
            numeric_contribution_percentage=numeric_percentage,
            error=error
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")

def clean_feature_names(shap_dict):
    cleaned = {}
    for feature_name, value in shap_dict.items():
        if feature_name.startswith('text__'):
            clean_name = feature_name.replace('text__', 'text: ')
        elif feature_name.startswith('num__'):
            clean_name = feature_name.replace('num__', '')
        else:
            clean_name = feature_name

        cleaned[clean_name] = value

    return cleaned

async def generate_ai_interpretation(tender_data: dict, risk_score: float, risk_level: str, shap_values: dict, text_features: dict, text_percentage: float):
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

    top_features = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    top_features_str = "\n".join([f"  - {name}: {value:+.4f}" for name, value in top_features])
    
    top_text_features = sorted(text_features.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
    text_features_str = "\n".join([f"  - {name}: {value:+.4f}" for name, value in top_text_features]) if top_text_features else "None"

    prompt = f"""You are an expert government auditor. Provide a brief, actionable summary of this tender's risk assessment.

Tender: {tender_data['tender_title']}
Description: "{tender_data['tender_description']}"
Value: KES {tender_data['tender_value_kes']:,.0f} | Bidders: {tender_data['number_of_bidders']} | Duration: {tender_data['project_duration_days']} days
Risk Score: {risk_score:.1%} ({risk_level} Risk)

Top Risk Factors:
{top_features_str}

Key Text Patterns (contributed {text_percentage:.0f}% to risk):
{text_features_str}

Provide a concise 3-point summary (2-3 sentences each):
1. Risk verdict and key concern
2. Main risk factors (mention specific text patterns if significant)
3. Recommended action

IMPORTANT: Return plain text only. Do NOT use markdown formatting (no **, *, #, or bullet points). Use numbered points (1., 2., 3.) with regular text."""

    response = model.generate_content(prompt)
    # Strip any remaining markdown formatting
    text = response.text
    # Remove markdown bold (**text** or __text__)
    import re
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    # Remove markdown italic (*text* or _text_)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    # Remove markdown headers (### or ##)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove markdown bullet points (- or * at start of line)
    text = re.sub(r'^\s*[-*]\s+', '', text, flags=re.MULTILINE)
    
    return text

@app.post("/api/v1/generate-report")
async def generate_report(report_data: ReportRequest):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
        from reportlab.pdfgen import canvas
        
        # Import chart generator
        try:
            from .chart_generator import generate_radar_chart, generate_contribution_chart, generate_shap_diverging_chart
        except ImportError:
            from chart_generator import generate_radar_chart, generate_contribution_chart, generate_shap_diverging_chart

        buffer = io.BytesIO()

        # Custom header and footer
        def add_header_footer(canvas_obj, doc):
            canvas_obj.saveState()
            
            # Header
            canvas_obj.setFillColor(colors.HexColor('#1e293b'))
            canvas_obj.rect(0, letter[1] - 0.8*inch, letter[0], 0.8*inch, fill=True, stroke=False)
            
            canvas_obj.setFillColor(colors.white)
            canvas_obj.setFont('Helvetica-Bold', 20)
            canvas_obj.drawString(0.75*inch, letter[1] - 0.5*inch, "GLASSBOX AI")
            
            canvas_obj.setFont('Helvetica', 10)
            canvas_obj.drawString(0.75*inch, letter[1] - 0.65*inch, "Procurement Risk Assessment Report")
            
            # Footer
            canvas_obj.setFillColor(colors.HexColor('#f1f5f9'))
            canvas_obj.rect(0, 0, letter[0], 0.6*inch, fill=True, stroke=False)
            
            canvas_obj.setFillColor(colors.HexColor('#64748b'))
            canvas_obj.setFont('Helvetica', 8)
            canvas_obj.drawString(0.75*inch, 0.35*inch, f"Generated: {report_data.timestamp}")
            
            canvas_obj.drawRightString(letter[0] - 0.75*inch, 0.35*inch, f"Page {doc.page}")
            
            canvas_obj.setFont('Helvetica-Oblique', 7)
            canvas_obj.drawCentredString(letter[0]/2, 0.15*inch, "Empowering Transparent Governance Through AI")
            
            canvas_obj.restoreState()

        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter,
            topMargin=0.9*inch,
            bottomMargin=0.7*inch,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch
        )
        
        story = []
        styles = getSampleStyleSheet()

        # Custom styles - Compact
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=8,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=6,
            spaceBefore=10,
            fontName='Helvetica-Bold',
            borderPadding=3,
            leftIndent=0
        )

        body_style = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#334155'),
            spaceAfter=4,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=11
        )

        # Title
        story.append(Paragraph(report_data.tender_title, title_style))
        story.append(Spacer(1, 0.15*inch))

        # Risk Score Card - Color scheme: Green for Minimal/Low, Amber for Medium, Red for High/Critical
        if report_data.risk_level in ["Minimal", "Low"]:
            risk_color = colors.HexColor('#22c55e')  # Green
        elif report_data.risk_level == "Medium":
            risk_color = colors.HexColor('#f59e0b')  # Amber/Orange
        else:  # High or Critical
            risk_color = colors.HexColor('#ef4444')  # Red

        risk_table = Table([
            ['RISK ASSESSMENT', ''],
            ['Risk Score:', f'{report_data.risk_score:.1%}'],
            ['Risk Level:', report_data.risk_level.upper()],
        ], colWidths=[2*inch, 4.5*inch])

        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('SPAN', (0, 0), (-1, 0)),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#334155')),
            ('TEXTCOLOR', (1, 2), (1, 2), risk_color),
            ('FONTNAME', (1, 2), (1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (1, 2), (1, 2), 12),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 0.15*inch))

        # Tender Details
        story.append(Paragraph("Tender Information", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=6))

        tender_data = [
            ['Tender Value', f'KES {report_data.tender_value_kes:,.0f}'],
            ['Number of Bidders', str(report_data.number_of_bidders)],
            ['Project Duration', f'{report_data.project_duration_days} days'],
            ['Process Complexity', f'{report_data.process_complexity}/10'],
            ['PEP Involvement', 'Yes' if report_data.pep_involvement else 'No']
        ]

        table = Table(tender_data, colWidths=[2*inch, 4.5*inch])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#334155')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.12*inch))

        # Description
        story.append(Paragraph("Description", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=6))
        story.append(Paragraph(report_data.tender_description, body_style))
        story.append(Spacer(1, 0.15*inch))

        # Visual Analysis - Smaller chart
        story.append(Paragraph("Visual Risk Analysis", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=6))

        radar_chart = generate_radar_chart(report_data.shap_values, report_data.risk_level)
        radar_img = Image(radar_chart, width=3.5*inch, height=3.5*inch)
        story.append(radar_img)
        story.append(Spacer(1, 0.12*inch))

        # SHAP Feature Impact Analysis
        story.append(Paragraph("SHAP Feature Impact Analysis", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=6))

        shap_diverging_chart = generate_shap_diverging_chart(report_data.shap_values)
        shap_img = Image(shap_diverging_chart, width=6.5*inch, height=4*inch)
        story.append(shap_img)
        story.append(Spacer(1, 0.12*inch))

        # Feature Contribution Summary (text only)
        story.append(Paragraph("Feature Contribution", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=6))

        contrib_text = f"Text Features: {report_data.text_contribution_percentage:.1f}% | Numeric Features: {report_data.numeric_contribution_percentage:.1f}%"
        story.append(Paragraph(contrib_text, body_style))
        story.append(Spacer(1, 0.15*inch))

        # AI Summary
        if report_data.interpretation:
            story.append(Paragraph("AI Auditor's Summary", section_style))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=6))

            interpretation_paragraphs = report_data.interpretation.split('\n')
            for para in interpretation_paragraphs:
                if para.strip():
                    story.append(Paragraph(para.strip(), body_style))
                    story.append(Spacer(1, 0.05*inch))

        doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)

        buffer.seek(0)
        filename = f"glassbox_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        print(f"ERROR generating report: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
