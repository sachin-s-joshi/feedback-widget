@echo off
echo 🚀 CSV to JSON Converter - Local Setup
echo =====================================

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Run the application
echo 🌟 Starting the application...
echo 🌐 Open your browser and go to: http://localhost:5000
echo ⏹️  Press Ctrl+C to stop the server
echo.

python main.py
