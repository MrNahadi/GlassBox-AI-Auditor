# Glassbox AI Documentation

Welcome to the comprehensive documentation for Glassbox AI - a multi-modal AI-powered risk assessment system for government procurement tenders achieving **96.16% accuracy**.

## 📚 Documentation Index

### Getting Started

#### [QUICKSTART.md](./QUICKSTART.md)

**Get up and running in 5 minutes**

- Automated setup scripts for Linux/Mac/Windows
- Step-by-step installation guide
- Sample test cases for different risk levels
- Common troubleshooting tips
- **Best for**: First-time users who want to start quickly

#### [SHAP_VALIDATION.md](./SHAP_VALIDATION.md)

**SHAP Explainability Validation**

- Comprehensive SHAP testing framework
- Validation of AI explainability
- How to run SHAP tests
- Understanding SHAP visualizations
- **Best for**: Ensuring model transparency and compliance

---

## Project Overview

**Glassbox AI** is a multi-modal AI-powered government tender risk assessment system that combines:

- 🎯 **96.16% Accuracy** - Enhanced XGBoost pipeline with feature engineering
- 🔍 **SHAP Explainability** - Transparent AI decisions with Shapley values
- 📊 **Text + Numeric Features** - Multi-modal analysis (43 total features: 13 engineered + 30 text)
- ⚡ **Real-time Analysis** - FastAPI backend with React frontend
- 📄 **PDF Reports** - Automated report generation with AI summaries
- 🎨 **5 Themes** - Customizable interface (Light, Dark, Slate, Midnight, Ocean)

---

## Quick Reference

### Common Tasks

| Task                         | Documentation                                              |
| ---------------------------- | ---------------------------------------------------------- |
| Install and run the system   | [QUICKSTART.md](./QUICKSTART.md)                           |
| Validate SHAP explainability | [SHAP_VALIDATION.md](./SHAP_VALIDATION.md)                 |
| Train the model              | See main [README.md](../README.md#training)                |
| API documentation            | Visit `http://localhost:8000/docs` when backend is running |

### By User Type

**End Users / Auditors:**

- Start with: [QUICKSTART.md](./QUICKSTART.md)
- In-app: Glossary page for parameter explanations

**Developers / Technical Staff:**

- Start with: [QUICKSTART.md](./QUICKSTART.md)
- SHAP Testing: [SHAP_VALIDATION.md](./SHAP_VALIDATION.md)
- Code: Review `backend/app/main.py` and `backend/scripts/train_model.py`
- API: `http://localhost:8000/docs` (Swagger UI)

**Project Managers / Stakeholders:**

- Overview: [Main README](../README.md)
- Features: Check dashboard at `http://localhost:5174/dashboard`

---

## Project Structure

```
project/
├── src/                    # React frontend (TypeScript + Vite)
├── backend/
│   ├── app/                # FastAPI application
│   ├── scripts/            # Training & validation scripts
│   ├── models/             # Trained ML models
│   ├── data/               # Training data & statistics
│   └── tests/              # Backend tests
└── docs/                   # Documentation (you are here)
```

---

## Additional Resources

### Main Documentation

- **[../README.md](../README.md)** - Main project README with installation and training

### API Documentation

When the backend is running, visit:

- `http://localhost:8000/docs` - Interactive Swagger API documentation
- `http://localhost:8000/redoc` - ReDoc API documentation

### In-App Documentation

The application includes:

- **Glossary Page** - Comprehensive guide to model parameters and risk factors
- **Dashboard** - Model transparency with performance metrics
- **Tooltips** - Context-sensitive help throughout the interface

---

## Documentation Philosophy

This documentation follows a few key principles:

1. **Minimal & Essential**: Only the documentation you actually need
2. **Task-Oriented**: Organized by what you want to accomplish
3. **Self-Contained**: Each document stands alone
4. **Up-to-Date**: Reflects current v2 enhanced pipeline model

---

**Last Updated**: 2025-11-07  
**Model Version**: Enhanced Pipeline v2 (96.16% accuracy)  
**Glassbox AI** - Every prediction explained. Every decision transparent.
