#!/bin/bash

echo "Starting AI Auditor Backend..."
echo ""

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found!"
    exit 1
fi

echo "Installing dependencies..."
pip install -r requirements.txt --quiet

if [ ! -f ".env" ]; then
    echo ""
    echo "Warning: .env file not found!"
    echo "Please create backend/.env with your GEMINI_API_KEY"
    echo ""
    echo "Example:"
    echo "GEMINI_API_KEY=your_api_key_here"
    echo ""
fi

if [ ! -f "models/auditor_model.joblib" ]; then
    echo ""
    echo "Model not found. Training model..."
    python train.py
    echo ""
fi

echo "Starting FastAPI server on http://localhost:8000"
echo ""
cd app
python main.py
