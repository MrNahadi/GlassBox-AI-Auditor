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
- **Live Auditing**: Real-time risk scoring (Low/Medium/High/Critical) for individual tenders
- **Batch Processing**: Upload CSV files to audit multiple tenders simultaneously with parallel processing
- **Audit History**: Automatic saving and management of all audits with search, filtering, and analytics
- **Explainable AI**: SHAP values show which factors contribute most to risk scores
- **Text Analysis**: NLP identifies risk keywords ("sole-source", "urgent", "expedited")
- **AI-Powered Insights**: Gemini 2.5 Flash generates human-readable summaries for non-technical users
- **Professional PDF Reports**: Download comprehensive audit reports with charts and AI insights
- **Advanced Analytics**: Trend analysis, risk distribution charts, and statistical insights

### User Experience

- **Quick Fill Generator**: One-click population of realistic tender data
  - Risk-targeted buttons (Low, Medium, High)
  - Adjustable slider mode for precise risk targeting
- **Blinking Eye Animation**: Brand-aligned loading indicator during audits
- **4-Step Progress Indicator**: Visual feedback (Analyzing → Processing → Computing → Generating)
- **Toast Notifications**: Real-time feedback throughout the application
- **Model Transparency Dashboard**: View accuracy, AUC score, and global feature importance
- **Educational Glossary**: Comprehensive guide explaining the model and risk parameters
- **5 Beautiful Themes**: Light, Dark, Slate, Midnight, Ocean with optimized contrast
- **Fully Responsive**: Works on desktop, tablet, and mobile
- **Optimized Layouts**: Side-by-side visualizations, compact spacing, minimal scrolling

### Batch Processing Features

- **CSV Upload**: Drag & drop or select CSV files with tender data
- **Template Download**: Pre-formatted CSV template for easy batch uploads
- **Parallel Processing**: Process up to 10 tenders concurrently (~300 tenders/min vs ~120 sequential)
- **Real-time Progress**: Live progress bar and status updates
- **Batch Statistics**: Completion rate, average risk, total value, processing time
- **Risk Distribution Chart**: Visual breakdown of risk levels across the batch
- **Results Export**: Download complete batch results as CSV
- **Auto-save to History**: All batch audits automatically saved for later review
- **Abort Capability**: Stop processing at any time

### Audit History Features

- **Automatic Saving**: All audits (live and batch) saved to localStorage
- **Search & Filter**: Find audits by tender title or filter by risk level
- **30-Day Trend Analysis**: Line chart showing average risk score over time
- **Risk Distribution**: Pie chart showing breakdown by risk category
- **Statistics Dashboard**: Total audits, average risk, high-risk count, total value
- **Quick Actions**: Re-audit from history, view details, delete individual audits
- **Export Options**: Export history to JSON or CSV
- **Bulk Delete**: Clear all history with confirmation
- **Storage Limit**: Automatic management of 100 most recent audits

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

- **React 18** + **TypeScript** - Modern component architecture with full type safety
- **Vite** - Lightning-fast dev server and optimized production builds
- **React Router v7** - Multi-page SPA navigation with 5 pages
- **shadcn/ui** - Beautiful, accessible UI components based on Radix UI
- **Recharts** - Interactive data visualizations (line charts, pie charts, diverging bar charts, radar charts)
- **Tailwind CSS** - Utility-first styling with custom theme system
- **Lucide React v0.553.0** - Modern icon library with 1000+ icons
- **React Hook Form** + **Zod** - Type-safe form validation
- **Sonner** - Elegant toast notification system
- **date-fns** - Modern date utility library

### Backend

- **Python 3.10+** - Modern Python features with type hints
- **FastAPI** - High-performance async API framework with automatic OpenAPI docs
- **XGBoost** - State-of-the-art gradient boosting classifier
- **scikit-learn** - ML Pipeline with feature engineering and preprocessing
- **SHAP** - Model explainability framework (TreeExplainer)
- **Gemini 2.5 Flash API** - Google's latest AI model for text generation
- **ReportLab** - Professional PDF generation with charts
- **matplotlib** - Chart generation for reports and validation
- **python-dotenv** - Environment variable management
- **uvicorn** - ASGI server for production deployment

### Machine Learning

- **Algorithm**: XGBoost Multi-Class Classifier (5 risk levels: Minimal, Low, Medium, High, Critical)
- **Training Data**: 40,000 synthetic tender records with realistic patterns
- **Features**: 43 total (13 engineered numeric + 30 TF-IDF text features)
- **Accuracy**: 96.16% on test data
- **AUC Score**: 99.29% (multi-class ROC AUC)
- **Explainability**: Real-time SHAP (SHapley Additive exPlanations) for every prediction
- **Validation**: Comprehensive SHAP testing framework with automated behavior validation
- **Pipeline**: Full scikit-learn pipeline with StandardScaler, feature engineering, and TfidfVectorizer
- **Feature Engineering**: Interactions, log transforms, binning, and derived features
- **Processing Speed**: ~500ms per audit including SHAP calculation and AI summary
- **Batch Processing**: Parallel processing with configurable concurrency (default: 5 concurrent requests)

## Project Structure

```
AI_Auditor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application with XGBoost + SHAP + Gemini
│   │   └── chart_generator.py   # PDF chart generation (matplotlib)
│   ├── scripts/
│   │   ├── train_model.py       # Enhanced pipeline training (96.16% accuracy)
│   │   └── validate_shap.py     # SHAP validation testing with visualizations
│   ├── models/                  # Trained ML models (generated by training)
│   │   ├── auditor_model_pipeline.joblib  # XGBoost pipeline model
│   │   └── shap_explainer_pipeline.joblib # SHAP TreeExplainer
│   ├── data/                    # Datasets and stats (generated by training)
│   │   ├── model_stats_pipeline.json      # Model metrics (accuracy, AUC, etc.)
│   │   └── full_dataset_pipeline.csv      # Training data (40K records)
│   ├── tests/                   # Backend tests (expandable)
│   ├── shap_plots/              # SHAP validation visualizations (generated)
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment template (Gemini API key)
│   ├── start.sh                # Linux/Mac startup script
│   └── start.bat               # Windows startup script
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # App layout with 5-page navigation
│   │   ├── RiskResults.tsx     # Results visualization with SHAP charts
│   │   ├── ThemeSelector.tsx   # Theme picker (5 themes)
│   │   └── ui/                 # shadcn/ui components (40+ components)
│   │       ├── blinking-eye.tsx    # Brand loading animation
│   │       ├── audit-progress.tsx  # 4-step progress indicator
│   │       ├── button.tsx          # Button component
│   │       ├── card.tsx            # Card component
│   │       ├── input.tsx           # Input component
│   │       ├── toast.tsx           # Toast notification
│   │       └── ...                 # 35+ more UI components
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Theme management (Light, Dark, Slate, Midnight, Ocean)
│   ├── hooks/
│   │   └── use-toast.ts        # Toast notifications hook
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, formatters, etc.)
│   ├── pages/
│   │   ├── LiveAudit.tsx       # Main audit page with Quick Fill
│   │   ├── BatchAudit.tsx      # Batch processing with CSV upload
│   │   ├── History.tsx         # Audit history with analytics
│   │   ├── Dashboard.tsx       # Model transparency metrics
│   │   └── Glossary.tsx        # Educational content
│   ├── services/
│   │   ├── api.ts              # API client (axios-based)
│   │   ├── auditHistory.ts     # localStorage CRUD + analytics + export
│   │   └── batchProcessor.ts   # Parallel batch processing engine
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles + theme definitions
├── docs/                        # Comprehensive documentation
│   ├── README.md               # Documentation index
│   ├── QUICKSTART.md           # Quick start guide (5 minutes)
│   ├── SHAP_INTEGRATION_GUIDE.md # SHAP integration details
│   ├── SHAP_VALIDATION.md      # SHAP testing guide
│   └── COLOR_SCHEME.md         # Color reference for all themes
├── index.html                   # HTML entry point
├── package.json                 # Frontend dependencies (React, Vite, etc.)
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config with custom colors
├── tsconfig.json                # TypeScript config (strict mode)
├── tsconfig.app.json            # App-specific TypeScript config
├── tsconfig.node.json           # Node-specific TypeScript config
├── components.json              # shadcn/ui configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint configuration
├── RESTRUCTURE_PLAN.md          # Project restructuring plan
├── RESTRUCTURING_COMPLETE.md    # Restructuring completion notes
└── README.md                    # This file
```

## API Endpoints

| Method | Endpoint                  | Description                                   |
| ------ | ------------------------- | --------------------------------------------- |
| GET    | `/`                       | Health check and API status                   |
| POST   | `/api/v1/audit`           | Submit tender for risk assessment with SHAP   |
| GET    | `/api/v1/model-stats`     | Get model performance metrics (accuracy, AUC) |
| POST   | `/api/v1/generate-report` | Generate and download PDF report with charts  |
| GET    | `/docs`                   | Interactive API documentation (Swagger UI)    |
| GET    | `/redoc`                  | Alternative API documentation (ReDoc)         |

### Request/Response Examples

**POST /api/v1/audit**

```json
// Request
{
  "tender_title": "Road Construction Project",
  "tender_value_kes": 50000000,
  "number_of_bidders": 3,
  "project_duration_days": 180,
  "process_complexity": 7,
  "pep_involvement": false,
  "tender_description": "Competitive bidding for standard road construction"
}

// Response
{
  "risk_score": 0.45,
  "risk_level": "Medium",
  "shap_values": {
    "tender_value_kes": 0.12,
    "number_of_bidders": -0.08,
    // ... more features
  },
  "shap_base_value": 0.41,
  "ai_interpretation": "This tender shows moderate risk factors...",
  "confidence_intervals": {
    "low": 0.38,
    "high": 0.52
  }
}
```

## Risk Assessment

### Risk Levels

- **Minimal Risk** (0-20%): 🟢 Very safe procurement with excellent transparency
- **Low Risk** (20-40%): 🟢 Safe procurement with good competition
- **Medium Risk** (40-60%): 🟠 Moderate concerns requiring review
- **High Risk** (60-80%): 🔴 Significant red flags requiring investigation
- **Critical Risk** (80-100%): 🔴 Severe issues requiring immediate attention

### Risk Factors Analyzed

#### Numeric Features (13 Engineered Features)

1. **Tender Value (KES)**: Higher values increase complexity and risk
2. **Number of Bidders**: Fewer bidders = less competition = higher risk
3. **Project Duration**: Very short or very long durations raise concerns
4. **Process Complexity** (1-10): Higher complexity = more room for irregularities
5. **PEP Involvement**: Politically Exposed Persons trigger enhanced scrutiny
6. **Log Tender Value**: Logarithmic transformation for better modeling
7. **Value per Day**: Tender value divided by duration
8. **Bidder Density**: Number of bidders relative to tender value
9. **Value Category**: Binned tender values (Small/Medium/Large/Very Large)
10. **Duration Category**: Binned duration (Short/Medium/Long/Very Long)
11. **Value × Complexity**: Interaction feature
12. **Bidders × Duration**: Interaction feature
13. **Complexity × PEP**: Interaction feature

#### Text Features (30 TF-IDF Features)

- **Risk Keywords**: "sole-source", "urgent", "emergency", "expedited", "direct", "restricted", "single", "exclusive"
- **Safe Keywords**: "competitive", "open", "transparent", "standard", "regular", "public", "fair", "equal"
- **Context Analysis**: Phrase combinations and frequency patterns
- **TF-IDF Vectorization**: 30 most important text features extracted from descriptions

### SHAP Explainability

Every prediction includes:

- **Feature Importance**: Which factors increased or decreased the risk score
- **SHAP Values**: Exact contribution of each feature to the final prediction
- **Base Value**: Average model prediction across all tenders
- **Diverging Bar Chart**: Visual representation of positive/negative contributions
- **Color Coding**: Red (increases risk) vs Blue (decreases risk)

## Documentation

- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Get running in 5 minutes
- **[SHAP_INTEGRATION_GUIDE.md](./docs/SHAP_INTEGRATION_GUIDE.md)** - SHAP integration and usage guide
- **[SHAP_VALIDATION.md](./docs/SHAP_VALIDATION.md)** - SHAP testing and validation guide
- **[COLOR_SCHEME.md](./docs/COLOR_SCHEME.md)** - Color scheme reference
- **[docs/README.md](./docs/README.md)** - Documentation index

For API documentation, visit `http://localhost:8000/docs` when the backend is running.

## Performance

- **Model Training**: ~2-3 minutes for 40,000 records with feature engineering
- **Single Audit API Response**: ~500ms including SHAP calculation and AI summary
- **Batch Processing Speed**:
  - Sequential: ~120 tenders/minute
  - Parallel (5 concurrent): ~300 tenders/minute (2.5x faster)
  - Parallel (10 concurrent): ~400 tenders/minute (3.3x faster)
- **Frontend Build**: ~7 seconds with Vite
- **Bundle Size**: ~827KB (240KB gzipped)
- **Memory Usage**:
  - Backend with loaded model: ~200MB
  - Frontend runtime: ~50MB
- **Lighthouse Scores**:
  - Performance: 95+
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 100

## Example Use Cases

### 1. Live Single Tender Audit

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

**Expected Result:** Risk Score: ~15%, Risk Level: Minimal

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

**Expected Result:** Risk Score: ~85%, Risk Level: Critical

### 2. Batch CSV Upload

**Sample CSV Format:**

```csv
tender_title,tender_value_kes,number_of_bidders,project_duration_days,process_complexity,pep_involvement,tender_description
Road Construction,50000000,5,180,7,false,Competitive bidding for standard road construction
School Renovation,10000000,8,90,4,false,Open tender for school building renovation
Emergency Supplies,25000000,1,30,8,true,Urgent sole-source procurement for emergency supplies
```

**Processing:**

- Upload CSV with 100+ tenders
- Parallel processing at ~300 tenders/minute
- Automatic saving to audit history
- Export results as CSV with risk scores and levels

### 3. Audit History Analysis

**Use Cases:**

- View all past audits with search and filtering
- Analyze risk trends over the last 30 days
- Export audit history for compliance reporting
- Re-audit previous tenders with updated model
- Track high-risk tenders across batches

## Development

### Build Commands

```bash
# Frontend Development
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Production build to dist/
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run typecheck   # TypeScript type checking (strict mode)

# Frontend Testing
npm run test        # Run unit tests (when implemented)
```

### Backend Commands

```bash
# Model Training
cd backend/scripts
python train_model.py       # Train XGBoost pipeline (96.16% accuracy)
python validate_shap.py     # Validate SHAP explainability

# Start Backend Server
cd backend
start.bat                   # Windows
./start.sh                  # Linux/Mac
# OR manually:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Backend Testing
cd backend/tests
pytest                      # Run backend tests (when implemented)
```

### Development Tips

**Hot Reload:**

- Frontend: Vite HMR (instant updates)
- Backend: uvicorn --reload (auto-restart on changes)

**Environment Setup:**

```bash
# Backend .env file
GEMINI_API_KEY=your_api_key_here

# Optional environment variables
PORT=8000
HOST=0.0.0.0
RELOAD=true
```

**Debugging:**

- Frontend: Browser DevTools + React DevTools
- Backend: FastAPI auto-docs at http://localhost:8000/docs
- SHAP Validation: Check backend/shap_plots/ for visualizations

## Roadmap

### Current Version (v1.0.0 - Production Ready)

✅ **Core Features**

- Multi-modal risk assessment (96.16% accuracy)
- Live single tender auditing with Quick Fill
- Batch CSV processing with parallel execution
- Audit history with search, filtering, and analytics
- SHAP explainability for all predictions
- Gemini AI-powered insights
- Professional PDF report generation
- 5 beautiful themes with optimized contrast

✅ **UI/UX Enhancements**

- Blinking eye loading animation
- 4-step progress indicator
- Toast notifications throughout
- Diverging SHAP bar charts
- Side-by-side visualizations
- Compact, responsive layouts
- Optimized for minimal scrolling

✅ **Performance Optimizations**

- Parallel batch processing (5x faster)
- Real-time progress tracking
- Automatic audit history management
- localStorage-based persistence

### Future Enhancements (Planned)

🔄 **Version 1.1 - Authentication & Cloud Storage**

- [ ] User authentication system
- [ ] Cloud-based audit history (Supabase/Firebase)
- [ ] Multi-user collaboration features
- [ ] Role-based access control (Admin, Auditor, Viewer)

🔄 **Version 1.2 - Advanced Analytics**

- [ ] Custom risk threshold configuration
- [ ] Advanced analytics dashboard with more charts
- [ ] Predictive analytics for future tenders
- [ ] Risk pattern detection across organizations
- [ ] Anomaly detection system

🔄 **Version 1.3 - Integration & Automation**

- [ ] Integration with actual procurement systems (IFMIS, e-Procurement)
- [ ] Email alert notifications for high-risk tenders
- [ ] Scheduled batch processing (cron jobs)
- [ ] Webhook support for real-time notifications
- [ ] REST API for third-party integrations

🔄 **Version 1.4 - AI & ML Improvements**

- [ ] Real-world training data integration
- [ ] Model retraining interface
- [ ] A/B testing for model improvements
- [ ] Multi-language support (Swahili, French)
- [ ] Natural language query interface ("Show me high-risk tenders from last month")

🔄 **Version 1.5 - Mobile & Accessibility**

- [ ] Progressive Web App (PWA) support
- [ ] Native mobile apps (iOS/Android)
- [ ] Offline mode with sync
- [ ] Enhanced accessibility features (WCAG AAA compliance)
- [ ] Voice input for tender data

### Research & Development

- [ ] Blockchain integration for audit trail
- [ ] Graph neural networks for relationship detection
- [ ] Computer vision for document analysis
- [ ] Federated learning for privacy-preserving model training

## Contributing

This project was built for the AI for National Prosperity Hackathon. Contributions are welcome!

### Development Setup

1. **Fork the repository**

   ```bash
   # On GitHub, click "Fork" button
   git clone https://github.com/YOUR_USERNAME/GlassBox-AI-Auditor.git
   cd GlassBox-AI-Auditor/AI_Auditor
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up development environment**

   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend
   cd ..
   npm install
   ```

4. **Make your changes**

   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes thoroughly

5. **Run tests and build**

   ```bash
   # Frontend
   npm run typecheck
   npm run lint
   npm run build

   # Backend
   cd backend/scripts
   python train_model.py
   python validate_shap.py
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

7. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   # On GitHub, create Pull Request from your branch
   ```

### Contribution Guidelines

**Code Style:**

- TypeScript: Follow existing patterns, use strict types
- Python: PEP 8 style guide, type hints preferred
- Components: Functional components with hooks
- Comments: Explain "why", not "what"

**Commit Messages:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Areas for Contribution:**

- 🐛 Bug fixes
- ✨ New features from roadmap
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)
- ⚡ Performance optimizations

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the project
- Show empathy towards other contributors

## Troubleshooting

### Backend Issues

**Models not loaded**

```bash
# Solution: Train the model
cd backend/scripts
python train_model.py
```

**Port 8000 already in use**

```bash
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Linux/Mac: Find and kill process
lsof -ti:8000 | xargs kill -9
```

**Gemini API errors**

```bash
# Solution: Check your API key
# 1. Get API key from https://makersuite.google.com/app/apikey
# 2. Create backend/.env file
echo "GEMINI_API_KEY=your_api_key_here" > backend/.env
```

**SHAP validation fails**

```bash
# Solution: Check SHAP plots
cd backend/shap_plots
# View generated validation visualizations
# If empty, run: python ../scripts/validate_shap.py
```

**FeatureEngineer errors**

```bash
# Solution: Ensure consistency between training and inference
# The FeatureEngineer class in main.py MUST match train_model.py
# Check that all engineered features are identical in both files
```

**Import errors**

```bash
# Solution: Reinstall dependencies
cd backend
pip install --upgrade -r requirements.txt
```

### Frontend Issues

**Build failures**

```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

**Port 5173 in use**

```bash
# Vite will automatically use the next available port (5174, 5175, etc.)
# Or specify a custom port:
npm run dev -- --port 3000
```

**Type errors**

```bash
# Solution: Run type check to identify issues
npm run typecheck
# Fix errors in the identified files
```

**Blank page after build**

```bash
# Solution: Check base path in vite.config.ts
# For GitHub Pages: base: '/repository-name/'
# For root domain: base: '/'
```

**Theme not persisting**

```bash
# Solution: Check localStorage
# Open DevTools > Application > Local Storage
# Verify 'theme' key exists
# Clear localStorage and refresh if corrupted
```

**Audit history missing**

```bash
# Solution: Check localStorage
# Open DevTools > Application > Local Storage
# Verify 'glassbox_audit_history' key exists
# Max 100 records stored (oldest deleted automatically)
```

### Common Issues

**API connection refused**

```bash
# Solution: Ensure backend is running
cd backend
start.bat  # Windows
./start.sh # Linux/Mac
# Check http://localhost:8000 in browser
```

**CORS errors**

```bash
# Solution: Check FastAPI CORS configuration in app/main.py
# Should allow origins: ["http://localhost:5173", "http://localhost:3000"]
```

**Slow batch processing**

```bash
# Solution: Increase concurrency in BatchAudit.tsx
# Default: 5 concurrent requests
# Increase to 10 for faster processing (if backend can handle it)
# Note: Too high may cause API rate limiting
```

**Charts not rendering**

```bash
# Solution: Check console for Recharts errors
# Ensure data format matches chart component props
# Verify isDarkMode detection for theme-specific styling
```

See [docs/QUICKSTART.md](./docs/QUICKSTART.md) for more detailed troubleshooting.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Screenshots

### Live Audit Page

- Quick Fill buttons for instant testing
- Real-time risk scoring with SHAP explanations
- AI-powered insights from Gemini 2.5 Flash
- Diverging bar chart showing feature contributions
- Download PDF reports

### Batch Audit Page

- CSV upload with drag & drop
- Parallel processing with real-time progress
- Statistics dashboard with completion metrics
- Risk distribution pie chart
- Export results to CSV

### Audit History

- Search and filter all past audits
- 30-day risk trend analysis
- Risk distribution breakdown
- Re-audit functionality
- Export to JSON or CSV

### Dashboard

- Model transparency metrics (96.16% accuracy)
- Global feature importance
- AUC score visualization
- Educational content

### Glossary

- Comprehensive explanations of all risk factors
- Model architecture overview
- SHAP methodology guide
- Best practices for risk assessment

## Team

**Glassbox AI** - Built for the AI for National Prosperity Hackathon

**Project Goal:** Empower transparent and accountable governance through AI-powered procurement auditing.

**Contact:** [GitHub Repository](https://github.com/MrNahadi/GlassBox-AI-Auditor)

## Acknowledgments

- **shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **Google Gemini** - AI-powered text generation and interpretation
- **XGBoost** - High-performance gradient boosting framework
- **SHAP** - Model explainability toolkit for transparent AI
- **FastAPI** - Modern, fast Python web framework
- **Vite** - Next-generation frontend tooling
- **Recharts** - Composable charting library for React
- **Lucide** - Beautiful open-source icon library
- **Tailwind CSS** - Utility-first CSS framework
- **React** - Declarative UI library
- **TypeScript** - Type-safe JavaScript

### Special Thanks

- AI for National Prosperity Hackathon organizers
- Open-source community for amazing tools
- Contributors and users providing feedback

---

**Glassbox AI** - Every prediction explained. Every decision transparent.

🔍 **Empowering transparent and accountable governance through AI.**

💡 **Making AI auditing accessible, explainable, and actionable.**

🌍 **Built for the people of Kenya and beyond.**

---

### Quick Links

- **Live Demo:** [Coming Soon]
- **Documentation:** [docs/](./docs/)
- **API Docs:** http://localhost:8000/docs (when running)
- **Issues:** [GitHub Issues](https://github.com/MrNahadi/GlassBox-AI-Auditor/issues)
- **Discussions:** [GitHub Discussions](https://github.com/MrNahadi/GlassBox-AI-Auditor/discussions)

### Statistics

- **Lines of Code:** ~15,000+ (TypeScript + Python)
- **Components:** 40+ React components
- **API Endpoints:** 6 RESTful endpoints
- **ML Features:** 43 engineered features
- **Training Data:** 40,000 synthetic records
- **Test Coverage:** 96.16% model accuracy
- **Themes:** 5 carefully crafted color schemes
- **Documentation Pages:** 5+ comprehensive guides

---

Made with ❤️ for transparent governance
