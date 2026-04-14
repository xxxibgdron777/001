@echo off
REM ========================================
REM 产品成本分解 Agent - GitHub 推送脚本
REM ========================================
REM 使用方法：
REM   1. 双击运行此脚本
REM   2. 或在命令行执行: git-push.bat
REM
REM 前提条件：
REM   1. 已安装 Git
REM   2. 已配置 GitHub SSH Key 或 Personal Access Token
REM   3. 已在 GitHub 创建仓库
REM ========================================

cd /d "%~dp0"

echo.
echo ========================================
echo   产品成本分解 Agent - GitHub 推送
echo ========================================
echo.

REM 检查 Git 是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 未检测到 Git，开始安装指引...
    echo.
    echo 请选择部署方式：
    echo   1. 安装 Git（推荐）- 自动化推送
    echo   2. 手动上传 dist 目录到云服务器
    echo   3. 手动上传到腾讯云静态托管
    echo.
    set /p CHOICE="请选择 (1/2/3): "
    
    if "%CHOICE%"=="1" (
        echo.
        echo [步骤] 请下载并安装 Git:
        echo   https://git-scm.com/download/win
        echo.
        echo 安装完成后，重新运行此脚本
        echo.
        pause
        exit /b 1
    )
    
    if "%CHOICE%"=="2" (
        echo.
        echo [步骤] 手动部署到云服务器
        echo   dist 目录已构建完成
        echo   请将 dist 目录内容上传到你的服务器
        echo   然后配置 Nginx（参考 README.md）
        echo.
        echo 构建目录: %CD%\dist
        echo.
        pause
        exit /b 0
    )
    
    if "%CHOICE%"=="3" (
        echo.
        echo [步骤] 腾讯云静态托管部署
        echo   请访问腾讯云控制台:
        echo   https://console.cloud.tencent.com/cloudbase
        echo.
        echo   1. 创建/选择环境
        echo   2. 进入静态网站托管
        echo   3. 上传 dist 目录中的所有文件
        echo.
        echo 构建目录: %CD%\dist
        echo.
        pause
        exit /b 0
    )
    
    echo [错误] 无效选择
    pause
    exit /b 1
)

REM 初始化 Git 仓库（如果还没有）
if not exist ".git" (
    echo [步骤 1] 初始化 Git 仓库...
    git init
    git branch -M main
    echo.
)

REM 配置用户信息（如果还没有配置）
git config user.email "cost-agent@example.com" 2>nul
git config user.name "Cost Agent" 2>nul

REM 检查远程仓库
git remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo [步骤 2] 添加远程仓库...
    echo 请输入你的 GitHub 仓库地址（推荐使用 SSH 格式）：
    echo   git@github.com:xxxibgdron777/001.git
    echo 或 HTTPS 格式：
    echo   https://github.com/xxxibgdron777/001.git
    echo.
    set /p REPO_URL="仓库地址: "
    git remote add origin %REPO_URL%
    echo.
)

REM 添加所有文件
echo [步骤 3] 暂存所有文件...
git add -A

REM 检查是否有内容提交
git status | findstr "nothing to commit" >nul
if %errorlevel% equ 0 (
    echo [提示] 没有新的更改需要提交
) else (
    echo.
    echo 即将提交以下更改：
    git status --short
    echo.
    set /p COMMIT_MSG="提交信息（直接回车使用默认）: "
    if not defined COMMIT_MSG set COMMIT_MSG=feat: 产品成本分解Agent 健康管理模板
    echo.
    echo [步骤 4] 提交更改...
    git commit -m "%COMMIT_MSG%"
)

REM 推送到 GitHub
echo.
echo [步骤 5] 推送到 GitHub...
echo.
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   推送成功！
    echo ========================================
    echo.
    echo 下一步操作：
    echo   1. 在 GitHub 仓库页面确认代码已上传
    echo   2. 可以使用 GitHub Pages 或其他方式部署
    echo   3. 详细部署说明请查看 README.md
) else (
    echo.
    echo [错误] 推送失败！
    echo 请检查：
    echo   1. 网络连接
    echo   2. GitHub 认证是否有效
    echo   3. 仓库地址是否正确
)

echo.
pause
