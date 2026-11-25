#!/bin/bash
# Mobile Price Predictor - Quick Start Script

echo " Mobile Price Range Predictor"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo " Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

echo " Python found: $(python3 --version)"
echo ""

# Setup backend
echo " Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo " Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "Swagger UI: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"

uvicorn app:app --reload --host 0.0.0.0 --port 8000
