@echo off
echo Starting AI Auditor Backend...
echo.

if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

if not exist "requirements.txt" (
    echo Error: requirements.txt not found!
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt --quiet

if not exist ".env" (
    echo.
    echo Warning: .env file not found!
    echo Please create backend\.env with your GEMINI_API_KEY
    echo.
    echo Example:
    echo GEMINI_API_KEY=your_api_key_here
    echo.
)

if not exist "models\auditor_model_pipeline.joblib" (
    echo.
    echo Model not found. Training model...
    python train.py
    echo.
)

echo Starting FastAPI server on http://localhost:8000
echo.
cd app
python main.py
