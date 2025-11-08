# Quick Start Guide - Glassbox AI

This guide will get you up and running in under 5 minutes.

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Gemini API key (get it from https://makersuite.google.com/app/apikey)

## Step 1: Backend Setup (2 minutes)

### Option A: Automated (Linux/Mac)
```bash
cd backend
./start.sh
```

### Option B: Automated (Windows)
```cmd
cd backend
start.bat
```

### Option C: Manual Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Train the model (generates synthetic data)
python train.py

# Start the server
cd app
python main.py
```

The backend will start on **http://localhost:8000**

## Step 2: Frontend Setup (1 minute)

In a new terminal:

```bash
# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

The frontend will start on **http://localhost:5173**

## Step 3: Use the Application

1. Open http://localhost:5173 in your browser
2. Fill in a sample tender:
   - **Title**: Road Construction Project
   - **Value**: 50000000 (50 million KES)
   - **Bidders**: 3
   - **Duration**: 180 days
   - **Complexity**: 7
   - **PEP Involvement**: Toggle on
3. Click **"Audit Now"**
4. View the risk assessment, charts, and AI summary
5. Download the PDF report

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (must be 3.10+)
- Verify virtual environment is activated (you'll see `(venv)` in prompt)
- Check if port 8000 is available

### Frontend won't start
- Check Node version: `node --version` (must be 18+)
- Run `npm install` again if dependencies are missing
- Check if port 5173 is available

### "AI summary unavailable" message
- Verify your Gemini API key is correct in `backend/.env`
- Check your internet connection
- The risk assessment will still work without Gemini

### Model training fails
- Ensure you have enough disk space (models are ~50MB)
- Check Python dependencies are fully installed
- Try running `pip install -r requirements.txt` again

## What's Next?

- Explore the **Dashboard** to see model transparency metrics
- Try different tender values and parameters
- Download and review PDF reports
- Check the main README.md for detailed documentation

## Sample Test Cases

### Low Risk Tender
- Value: 1,000,000 KES
- Bidders: 8
- Duration: 90 days
- Complexity: 3
- PEP: No

### High Risk Tender
- Value: 500,000,000 KES
- Bidders: 1
- Duration: 365 days
- Complexity: 10
- PEP: Yes

### Medium Risk Tender
- Value: 25,000,000 KES
- Bidders: 4
- Duration: 120 days
- Complexity: 6
- PEP: No

Happy auditing!
