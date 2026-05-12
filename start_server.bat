@echo off
REM ================================================
REM 개와 고양이 인식 웹 서비스 - 웹 서버 시작 파일
REM ================================================

REM 현재 폴더에서 Python 웹 서버 실행
REM Python이 설치되어 있어야 합니다

echo.
echo ================================================
echo   개와 고양이 인식 웹 서비스 - 웹 서버 시작
echo ================================================
echo.

REM Python 버전 확인
python --version
if errorlevel 1 (
    echo.
    echo [오류] Python이 설치되지 않았습니다.
    echo Python을 먼저 설치하고 다시 실행해주세요.
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo.
echo [시작] 웹 서버를 8000 포트에서 시작합니다...
echo.
echo ========================================
echo 브라우저에서 다음 주소를 입력하세요:
echo http://localhost:8000
echo ========================================
echo.
echo 종료하려면 Ctrl+C를 누르세요
echo.

REM Python 웹 서버 실행 (포트 8000)
python -m http.server 8000

REM 오류 발생 시
if errorlevel 1 (
    echo.
    echo [오류] 웹 서버 시작에 실패했습니다.
    pause
    exit /b 1
)
