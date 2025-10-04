@echo off
echo Starting Volatility API Server...
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting server on http://localhost:8001
echo Press Ctrl+C to stop the server
echo.
python volatility.py
pause