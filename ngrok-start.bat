@echo off
REM ========================================
REM 内网穿透 - ngrok 配置脚本
REM ========================================

echo.
echo ========================================
echo   内网穿透工具 - ngrok
echo ========================================
echo.

REM 检查ngrok
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [下载] 正在下载 ngrok...
    echo.
    echo 请访问 https://ngrok.com/download
    echo 选择 Windows 版本下载
    echo.
    echo 下载后解压得到 ngrok.exe，放入此目录
    echo 然后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [启动] ngrok 转发端口 5174...
echo.
echo 注意：ngrok 免费版每次重启会更换地址
echo 隧道地址会在下方显示
echo.
ngrok http 5174

pause
