#!/bin/bash
# ========================================
# 产品成本分解 Agent - 部署脚本
# ========================================

set -e

echo "========================================"
echo "  产品成本分解Agent - 部署"
echo "========================================"
echo ""

# 检查Git
if ! command -v git &> /dev/null; then
    echo "[ERROR] Git 未安装"
    echo "请从 https://git-scm.com 下载安装"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm 未安装"
    exit 1
fi

cd "$(dirname "$0")"

# 构建
echo "[步骤1] 构建生产版本..."
npm run build

# 初始化Git（如需要）
if [ ! -d ".git" ]; then
    echo ""
    echo "[步骤2] 初始化Git仓库..."
    git init
    git branch -M main
    git add -A
    git commit -m "feat: 产品成本分解Agent"
fi

# 添加远程仓库（如需要）
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "[步骤3] 配置远程仓库..."
    echo "请输入GitHub仓库地址:"
    read -p "仓库地址: " REPO_URL
    git remote add origin "$REPO_URL"
fi

# 推送
echo ""
echo "[步骤4] 推送到GitHub..."
git push -u origin main --force

echo ""
echo "========================================"
echo "  推送完成！"
echo "========================================"
echo ""
echo "下一步："
echo "1. 在GitHub仓库 -> Settings -> Pages"
echo "2. Source选择 'Deploy from a branch'"
echo "3. Branch选择 'gh-pages / (root)'"
echo "4. 等待部署完成后访问:"
echo "   https://xxxibgdron777.github.io/001"
