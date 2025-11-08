# SHAP Integration Guide - Glassbox AI

## Overview

This guide explains how SHAP (SHapley Additive exPlanations) is integrated into Glassbox AI and how to use the validation framework to ensure your model is working correctly.

## What is SHAP?

**SHAP** provides transparent, explainable AI by breaking down each prediction into individual feature contributions:

- **Based on Game Theory**: Uses Shapley values from cooperative game theory for fair attribution
- **Local Explanations**: Shows why each specific tender got its particular risk score
- **Global Insights**: Reveals which features are most important across all predictions
- **Mathematically Proven**: Guarantees fair and consistent explanations

### SHAP Value Interpretation

```
Positive SHAP (+) = Feature INCREASES risk score (pushes toward "High Risk")
Negative SHAP (-) = Feature DECREASES risk score (pushes toward "Low Risk")
Magnitude = Strength of influence (larger absolute value = stronger impact)
```

## SHAP in Your Workflow

### 1. Training Phase (One-Time Setup)

```bash
cd backend/scripts

# Train the enhanced pipeline model (includes SHAP calculation)
python train_model.py

# This creates:
# - backend/models/auditor_model_pipeline.joblib (XGBoost model)
# - backend/models/shap_explainer_pipeline.joblib (SHAP explainer)
# - backend/data/model_stats_pipeline.json (accuracy, AUC, feature importance)
# - backend/data/full_dataset_pipeline.csv (40,000 synthetic training records)
```

**What happens during training:**

- XGBoost multi-class model is trained on 30K tenders
- SHAP TreeExplainer is created for the trained model
- Global feature importance is calculated using mean absolute SHAP values
- Model statistics (including SHAP-based importance) are saved

### 2. Validation Phase (Recommended)

```bash
# Run SHAP validation tests
cd backend/scripts
python validate_shap.py

# This will:
# ✅ Load your trained model
# ✅ Create 5 test tender profiles (Excellent → High Risk)
# ✅ Calculate SHAP values for each test case
# ✅ Validate expected model behavior
# ✅ Generate visualizations in backend/shap_plots/
```

**Validation Checks Performed:**

| Check                       | What it Tests               | Why it Matters                                 |
| --------------------------- | --------------------------- | ---------------------------------------------- |
| PEP Involvement Important   | SHAP importance > average   | Ensures critical factors are weighted properly |
| Risk Ranking Correct        | Low-risk < High-risk scores | Validates model logic is sound                 |
| Fewer Bidders = Higher Risk | Competition impacts score   | Confirms business rules work                   |
| Mathematical Consistency    | base + Σ(SHAP) = prediction | Verifies SHAP math is correct                  |

**Generated Outputs:**

```
backend/shap_plots/
├── shap_summary.png              # Feature importance overview
├── shap_bar.png                  # Simple ranking chart
├── shap_waterfall_EXCELLENT_TENDER.png
├── shap_waterfall_GOOD_TENDER.png
├── shap_waterfall_AVERAGE_TENDER.png
├── shap_waterfall_CONCERNING_TENDER.png
└── shap_waterfall_HIGH_RISK_TENDER.png
```

### 3. Production Phase (Runtime)

```bash
# Start the FastAPI backend
cd backend
start.bat     # Windows
# OR
./start.sh    # Linux/Mac
```

**When a tender is audited:**

1. **User submits tender data** → Frontend sends to `/api/v1/audit`
2. **Model predicts risk level** → XGBoost returns probability distribution
3. **SHAP calculates contributions** → Shows which features drove the decision
4. **Results returned** → Risk score + SHAP values + AI summary

**API Response includes:**

```json
{
  "risk_score": 0.85,
  "risk_level": "High",
  "shap_values": {
    "tender_value_kes": +0.4205,
    "pep_involvement": +0.8732,
    "number_of_bidders": -0.0112,
    ...
  },
  "interpretation": "AI-generated summary...",
  "text_contribution_percentage": 15.2,
  "numeric_contribution_percentage": 84.8
}
```

## SHAP in the User Interface

### Dashboard Page (`/dashboard`)

**Displays Global SHAP Insights:**

- **Diverging Horizontal Bar Chart** (like validation test)
  - Red bars (positive SHAP) = Features that typically increase risk
  - Green bars (negative SHAP) = Features that typically decrease risk
  - Bar length = Average impact strength across all training data
- **Model Statistics Cards**
  - Accuracy: How often the model is correct
  - AUC Score: Ability to distinguish risk levels
  - Training Dataset: Number of records used

**What you see:**

- Top 10 most impactful features by mean absolute SHAP value
- Color-coded by direction (increase vs. decrease risk)
- Sorted by importance (most impactful at top)

### Live Audit Page (`/`)

**Displays Per-Tender SHAP Explanations:**

1. **Risk Factor Analysis (Radar Chart)**
   - Shows top 5 features for THIS specific tender
   - Larger area = stronger influence on THIS prediction
2. **Top Risk Contributors List**

   - Red/green values show direction of influence
   - Text vs. Numeric icons differentiate feature types

3. **Feature Contribution Breakdown**

   - Pie chart: Text vs. Numeric feature impact %
   - Unique to Glassbox AI (multi-modal analysis)

4. **AI Auditor's Summary**
   - Gemini-powered natural language explanation
   - References SHAP insights in human-readable format

## File Structure

```
AI_Auditor/
├── backend/
│   ├── app/
│   │   ├── main.py                # SHAP used in /api/v1/audit endpoint
│   │   └── chart_generator.py     # PDF chart generation
│   ├── scripts/
│   │   ├── train_model.py         # Training script (creates SHAP explainer)
│   │   └── validate_shap.py       # Validation framework
│   ├── models/
│   │   ├── auditor_model_pipeline.joblib   # Trained XGBoost model
│   │   └── shap_explainer_pipeline.joblib  # SHAP TreeExplainer (saved)
│   ├── data/
│   │   ├── model_stats_pipeline.json       # Includes SHAP-based feature importance
│   │   └── full_dataset_pipeline.csv       # Training dataset (40K records)
│   └── shap_plots/                # Validation visualizations (generated)
└── docs/
    ├── SHAP_INTEGRATION_GUIDE.md  # This file
    └── SHAP_VALIDATION.md         # Detailed validation docs
```

## When to Run SHAP Validation

### ✅ Always Run After:

- Training a new model
- Changing feature engineering
- Updating the training dataset
- Modifying risk calculation logic

### ✅ Recommended For:

- Initial setup (verify everything works)
- Before deploying to production
- When debugging unexpected predictions
- Creating documentation/reports

### ⚠️ Not Required For:

- Normal operation (already validated)
- Every single prediction (too slow)
- Frontend-only changes

## Troubleshooting SHAP Issues

### Issue: "Model stats not available"

**Cause:** Model was trained with old script that doesn't include `model_auc_score`

**Fix:**

```bash
# Retrain with updated script
python train_multimodal_1.py
```

### Issue: SHAP validation fails

**Check:**

1. Model file exists: `backend/models/auditor_model.joblib`
2. Model stats exists: `backend/data/model_stats.json`
3. Dependencies installed: `pip install -r requirements.txt`

**Debug:**

```bash
# Check if model loads
python -c "import joblib; model = joblib.load('backend/models/auditor_model.joblib'); print(type(model))"

# Check if SHAP can import
python -c "import shap; print(shap.__version__)"
```

### Issue: Waterfall plots not generating

**Cause:** Multi-class models have `expected_value` as list instead of scalar

**Fix:** Already handled in `scripts/validate_shap.py` (updated version)

### Issue: Dashboard shows no SHAP values

**Cause:** Backend not returning `average_shap_values` in model stats

**Fix:** Ensure `scripts/train_model.py` includes:

```python
model_stats = {
    'model_accuracy': float(accuracy),
    'model_auc_score': float(auc_score),
    'global_feature_importance': global_feature_importance,
    # ... other fields
}
```

## Advanced Usage

### Custom Test Tenders

Edit `backend/scripts/validate_shap.py` to add your own test cases:

```python
test_samples = {
    'MY_CUSTOM_TENDER': {
        'tender_value_kes': 100_000_000,
        'number_of_bidders': 3,
        'project_duration_days': 180,
        'process_complexity': 7,
        'pep_involvement': 0,
    }
}
```

### Export SHAP Data

Access SHAP values programmatically:

```python
import joblib
import pandas as pd
import numpy as np

# Load model and explainer
model = joblib.load('backend/models/auditor_model.joblib')
explainer = joblib.load('backend/models/shap_explainer.joblib')

# Prepare data
tender = pd.DataFrame({
    'tender_value_kes': [50_000_000],
    'number_of_bidders': [5],
    # ... other features
})

# Calculate SHAP
shap_values = explainer.shap_values(tender)[0]
feature_names = tender.columns

# Create dictionary
shap_dict = dict(zip(feature_names, shap_values))
print(shap_dict)
```

### Integration with CI/CD

Add validation to your deployment pipeline:

```yaml
# .github/workflows/validate-model.yml
name: Validate Model
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run SHAP validation
        run: python backend/test_shap_validation.py
```

## Best Practices

### ✅ DO:

- Run validation after every model retrain
- Check validation results before deployment
- Document SHAP insights in audit reports
- Show SHAP explanations to end users
- Keep validation visualizations for reference

### ❌ DON'T:

- Skip validation (catches bugs early!)
- Modify SHAP values manually (breaks mathematical guarantees)
- Calculate SHAP on every request without caching (too slow)
- Ignore failed validation tests (indicates model issues)

## Further Reading

- **SHAP Documentation**: https://shap.readthedocs.io/
- **Original Paper**: "A Unified Approach to Interpreting Model Predictions" (Lundberg & Lee, 2017)
- **Backend Implementation**: `backend/app/main.py` - search for `shap_explainer`
- **Frontend Visualization**: `src/pages/Dashboard.tsx` and `src/components/RiskResults.tsx`
- **Validation Framework**: `backend/scripts/validate_shap.py`

---

**Questions?** Check `docs/SHAP_VALIDATION.md` for detailed validation test documentation.

**Last Updated**: November 7, 2025
