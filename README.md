# Glassbox AI - Transparent Governance Through AI

An AI-powered multi-modal risk assessment system for government procurement tenders. Built for the AI for National Prosperity Hackathon, Glassbox AI combines machine learning, explainable AI, and natural language processing to empower transparent and accountable governance.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

## Overview

Glassbox AI analyzes government tenders in real-time using a multi-modal approach that examines both:

- **Structured data**: Tender value, number of bidders, duration, complexity, PEP involvement
- **Unstructured text**: Tender descriptions analyzed with NLP to detect risk patterns

The system provides instant risk scoring with SHAP-based explainability and AI-generated insights powered by Google's Gemini API.

## Key Features

### Core Capabilities

- **Multi-Modal Risk Assessment**: Analyzes both numeric features and tender description text
- **Real-Time Auditing**: Instant risk scoring (Low/Medium/High) for submitted tenders
- **Explainable AI**: SHAP values show which factors contribute most to risk scores
- **Text Analysis**: NLP identifies risk keywords ("sole-source", "urgent", "expedited")
- **AI-Powered Insights**: Gemini generates human-readable summaries for non-technical users
- **Professional PDF Reports**: Download comprehensive audit reports with charts and AI insights

### User Experience

- **Quick Fill Generator**: One-click population of realistic tender data
  - Risk-targeted buttons (Low, Medium, High)
  - Adjustable slider mode for precise risk targeting
- **Model Transparency Dashboard**: View accuracy, AUC score, and global feature importance
- **Educational Glossary**: Comprehensive guide explaining the model and risk parameters
- **5 Beautiful Themes**: Light, Dark, Slate, Midnight, Ocean
- **Fully Responsive**: Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Gemini API key ([get one here](https://makersuite.google.com/app/apikey))

### Installation (5 minutes)

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Gemini API
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Train the enhanced pipeline model (96.16% accuracy)
cd scripts
python train_model.py

# (Optional) Validate SHAP explainability
python validate_shap.py

# Start backend server
cd ..
start.bat  # Windows
# OR: ./start.sh  # Linux/Mac
```

Backend runs on `http://localhost:8000`

**Note**: The training process generates 40,000 synthetic tender records and trains a multi-modal XGBoost pipeline achieving 96.16% accuracy. This takes about 2-3 minutes.

#### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Usage

1. Open `http://localhost:5173` in your browser
2. Fill in tender details or use Quick Fill buttons
3. Click "Audit Now" to receive instant risk assessment
4. View risk score, SHAP visualizations, and AI analysis
5. Download PDF report if needed

## Tech Stack

### Frontend

- **React 18** + **TypeScript** - Modern component architecture
- **Vite** - Lightning-fast dev server and build tool
- **React Router** - Multi-page navigation
- **shadcn/ui** - Beautiful, accessible UI components
- **Recharts** - Interactive data visualizations
- **Tailwind CSS** - Utility-first styling

### Backend

- **Python 3.10+** - Modern Python features
- **FastAPI** - High-performance async API framework
- **XGBoost** - State-of-the-art gradient boosting
- **scikit-learn** - ML Pipeline with preprocessing
- **SHAP** - Model explainability framework
- **Gemini API** - AI-powered text generation
- **ReportLab** - Professional PDF generation
- **matplotlib** - Chart generation for reports

### Machine Learning

- **Algorithm**: XGBoost Multi-Class Classifier (5 risk levels: Minimal, Low, Medium, High, Critical)
- **Training Data**: 40,000 synthetic tender records with strong patterns
- **Features**: 43 total (13 engineered numeric + 30 text features)
- **Accuracy**: 96.16% on test data (up from 80.3%)
- **AUC Score**: 99.29% (multi-class ROC AUC)
- **Explainability**: Real-time SHAP (SHapley Additive exPlanations) for every prediction
- **Validation**: Comprehensive SHAP testing framework with automated behavior validation
- **Pipeline**: Full scikit-learn pipeline with feature engineering and text vectorization

## Project Structure

```
glassbox-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   └── chart_generator.py   # PDF chart generation
│   ├── scripts/
│   │   ├── train_model.py       # Enhanced pipeline training (96.16% accuracy)
│   │   └── validate_shap.py     # SHAP validation testing
│   ├── models/                  # Trained ML models (generated)
│   │   ├── auditor_model_pipeline.joblib  # Enhanced model
│   │   └── shap_explainer_pipeline.joblib # SHAP explainer
│   ├── data/                    # Datasets and stats (generated)
│   │   ├── model_stats_pipeline.json      # Model metrics
│   │   └── full_dataset_pipeline.csv      # Training data
│   ├── tests/                   # Backend tests (ready for expansion)
│   ├── shap_plots/              # SHAP validation visualizations (generated)
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment template
│   ├── start.sh                # Linux/Mac startup script
│   └── start.bat               # Windows startup script
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App layout with navigation
│   │   ├── RiskResults.tsx     # Results visualization
│   │   ├── ThemeSelector.tsx   # Theme picker
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Theme management
│   ├── pages/
│   │   ├── LiveAudit.tsx       # Main audit page
│   │   ├── Dashboard.tsx       # Model transparency
│   │   └── Glossary.tsx        # Educational content
│   ├── services/
│   │   └── api.ts              # API client
│   └── App.tsx                 # Root component
├── docs/                        # Documentation
│   ├── README.md               # Documentation index
│   ├── QUICKSTART.md           # Quick start guide
│   └── SHAP_VALIDATION.md      # SHAP testing guide
└── README.md                    # This file
```

## API Endpoints

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/`                       | Health check                      |
| POST   | `/api/v1/audit`           | Submit tender for risk assessment |
| GET    | `/api/v1/model-stats`     | Get model performance metrics     |
| POST   | `/api/v1/generate-report` | Generate and download PDF report  |

## Risk Assessment

### Risk Levels

- **Low Risk** (0-30%): Green - Safe procurement with good competition
- **Medium Risk** (30-70%): Orange - Moderate concerns requiring review
- **High Risk** (70-100%): Red - Significant red flags requiring investigation

### Risk Factors Analyzed

#### Numeric Features

1. **Tender Value (KES)**: Higher values increase complexity and risk
2. **Number of Bidders**: Fewer bidders = less competition = higher risk
3. **Project Duration**: Very short or very long durations raise concerns
4. **Process Complexity** (1-10): Higher complexity = more room for irregularities
5. **PEP Involvement**: Politically Exposed Persons trigger enhanced scrutiny

#### Text Features (100 TF-IDF features)

- **Risk Keywords**: "sole-source", "urgent", "emergency", "expedited", "direct", "restricted"
- **Safe Keywords**: "competitive", "open", "transparent", "standard", "regular"
- **Context Analysis**: Phrase combinations and frequency patterns

## Documentation

- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Get running in 5 minutes
- **[SHAP_VALIDATION.md](./docs/SHAP_VALIDATION.md)** - SHAP testing and validation guide
- **[docs/README.md](./docs/README.md)** - Documentation index

For API documentation, visit `http://localhost:8000/docs` when the backend is running.

## Performance

- **Model Training**: ~30 seconds for 30K records
- **API Response**: ~500ms including SHAP calculation and NLP
- **Frontend Build**: ~7 seconds
- **Bundle Size**: 827KB (240KB gzipped)
- **Memory Usage**: ~200MB for backend with loaded model

## Example Use Cases

### Testing Different Risk Levels

**Low Risk Tender:**

```json
{
  "tender_title": "Office Supplies Procurement",
  "tender_value_kes": 1000000,
  "number_of_bidders": 8,
  "project_duration_days": 90,
  "process_complexity": 3,
  "pep_involvement": false,
  "tender_description": "Standard competitive bidding with transparent evaluation"
}
```

**High Risk Tender:**

```json
{
  "tender_title": "Infrastructure Development",
  "tender_value_kes": 500000000,
  "number_of_bidders": 1,
  "project_duration_days": 365,
  "process_complexity": 10,
  "pep_involvement": true,
  "tender_description": "Urgent sole-source procurement without competitive bidding"
}
```

## Development

### Build Commands

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run typecheck   # TypeScript type checking
```

### Backend Commands

```bash
# Train the enhanced pipeline model
cd backend/scripts
python train_model.py

# Validate SHAP (optional)
python validate_shap.py

# Start backend server
cd backend
start.bat  # Windows
./start.sh # Linux/Mac
```

## Roadmap

### Current Version (v0.4.0 - Enhanced Pipeline)

- ✅ **96.16% accuracy** with enhanced XGBoost pipeline
- ✅ **43 features** (13 engineered numeric + 30 text)
- ✅ Multi-modal risk assessment (text + numeric)
- ✅ Feature engineering (interactions, log transforms, binning)
- ✅ SHAP explainability with real-time calculations
- ✅ Gemini AI insights and natural language summaries
- ✅ PDF reports with charts and visualizations
- ✅ 5 theme options (Light, Dark, Slate, Midnight, Ocean)
- ✅ Quick Fill generator with risk targeting
- ✅ Educational glossary
- ✅ Clean, professional project structure

### Future Enhancements

- [ ] Batch CSV upload for multiple tenders
- [ ] User authentication and audit history
- [ ] Real-time collaboration features
- [ ] Integration with actual procurement systems
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom risk threshold configuration
- [ ] Email alert notifications
- [ ] Mobile app

## Contributing

This project was built for the AI for National Prosperity Hackathon. Contributions are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a pull request

## Troubleshooting

### Backend Issues

- **Models not loaded**: Run `cd backend/scripts && python train_model.py` to train the model
- **Port 8000 in use**: Change port in `app/main.py` or kill existing process
- **Gemini API errors**: Verify your API key in `backend/.env`
- **SHAP validation fails**: Check `backend/shap_plots/` for generated visualizations
- **FeatureEngineer errors**: The `FeatureEngineer` class in `main.py` must match `train_model.py`

### Frontend Issues

- **Build failures**: Run `npm install` again to ensure all dependencies are installed
- **Port 5173 in use**: Vite will automatically use next available port
- **Type errors**: Run `npm run typecheck` to identify issues

See [docs/QUICKSTART.md](./docs/QUICKSTART.md) for more troubleshooting tips.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Team

Glassbox AI - Built for the AI for National Prosperity Hackathon

## Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Google Gemini** - AI-powered text generation
- **XGBoost** - High-performance ML framework
- **SHAP** - Model explainability toolkit
- **FastAPI** - Modern Python API framework

---

**Glassbox AI** - Every prediction explained. Every decision transparent.

🔍 Empowering transparent and accountable governance through AI.
