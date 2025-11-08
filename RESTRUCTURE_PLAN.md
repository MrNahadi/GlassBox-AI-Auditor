# Project Restructure Plan

## Current Issues

1. Nested `backend/backend/` folder (should be `backend/data/` and `backend/models/`)
2. 5 different training scripts (confusing!)
3. Duplicate .env files
4. Too many documentation files
5. Old/unused files

## Proposed Clean Structure

```
project/
├── .env                          # Root environment variables
├── .gitignore
├── README.md                     # Main project documentation
├── package.json                  # Frontend dependencies
├── package-lock.json
├── components.json               # shadcn/ui config
├── vite.config.ts                # Vite config
├── tailwind.config.js            # Tailwind config
├── postcss.config.js
├── tsconfig.json                 # TypeScript config
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── index.html
│
├── src/                          # Frontend source
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── App.css
│   ├── vite-env.d.ts
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities
│   ├── pages/                    # Page components
│   └── services/                 # API services
│
├── backend/                      # Python backend
│   ├── .env                      # Backend environment variables
│   ├── .env.example              # Example env file
│   ├── requirements.txt          # Python dependencies
│   ├── start.sh                  # Start script (Unix)
│   ├── start.bat                 # Start script (Windows)
│   │
│   ├── app/                      # FastAPI application
│   │   ├── __init__.py
│   │   ├── main.py               # Main FastAPI app
│   │   └── chart_generator.py   # Chart generation utility
│   │
│   ├── models/                   # Trained ML models
│   │   ├── auditor_model_pipeline.joblib
│   │   └── shap_explainer_pipeline.joblib
│   │
│   ├── data/                     # Training data & stats
│   │   ├── model_stats_pipeline.json
│   │   └── full_dataset_pipeline.csv
│   │
│   ├── scripts/                  # Training & utility scripts
│   │   ├── train_model.py        # MAIN training script (v2)
│   │   └── validate_shap.py      # SHAP validation
│   │
│   └── tests/                    # Backend tests
│       └── test_api.py
│
└── docs/                         # Documentation (consolidated)
    ├── README.md                 # Docs overview
    ├── QUICKSTART.md             # Quick start guide
    ├── API.md                    # API documentation
    └── DEPLOYMENT.md             # Deployment guide
```

## Files to DELETE

- `backend/backend/` folder (move contents up)
- `backend/train.py` (old)
- `backend/train_multimodal.py` (old)
- `backend/train_multimodal_1.py` (superseded)
- `backend/train_pipeline_enhanced.py` (superseded)
- `backend/generate_data.py` (not needed)
- `CHANGES.md` (redundant)
- `docs/CHANGELOG.md` (redundant)
- `docs/FEATURES.md` (merge into README)
- `docs/IMPLEMENTATION_COMPLETE.md` (not needed)
- `docs/MULTIMODAL_SETUP.md` (outdated)
- `docs/PROJECT_SUMMARY.md` (redundant)
- `docs/THEMES.md` (redundant)
- `docs/UPGRADE_NOTES.md` (not needed)

## Files to RENAME/MOVE

- `backend/train_pipeline_v2.py` → `backend/scripts/train_model.py`
- `backend/test_shap_validation.py` → `backend/scripts/validate_shap.py`
- `backend/SHAP_VALIDATION_README.md` → `docs/SHAP_VALIDATION.md`
- `backend/backend/data/*` → `backend/data/`
- `backend/backend/models/*` → `backend/models/`

## Files to KEEP

- All `src/` frontend files
- `backend/app/` files
- `backend/.env` and `.env.example`
- `backend/requirements.txt`
- `backend/start.sh` and `start.bat`
- Root config files (package.json, vite.config.ts, etc.)
- `README.md`
- Essential docs: QUICKSTART.md

## New Files to CREATE

- `docs/API.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
- `backend/tests/test_api.py` - API tests
- `.env.example` at root level
