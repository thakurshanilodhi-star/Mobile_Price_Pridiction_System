@echo off
echo 📱 Mobile Price Range Predictor
echo ================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.10+ first.
    exit /b 1
)

echo ✅ Python found
echo.

REM Setup backend
echo 🔧 Setting up backend...
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo 🚀 Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo Swagger UI: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo ================================

uvicorn app:app --reload --host 0.0.0.0 --port 8000
