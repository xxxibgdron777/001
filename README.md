# 产品成本分解 Agent

基于 CVP（本量利）分析的成本分解工具，支持动态合作分成计算，适用于健康管理产品、体检服务、慢病管理等场景。

## 功能特性

### 核心功能
- **成本结构配置**：动态增删成本项（固定成本/变动成本）
- **健康管理产品模板**：一键套用含 10 个成本项的示例配置
- **动态合作分成**：按公式 `(单价 - 基数项之和) × 分成比例` 自动计算
- **定价与边际贡献**：实时计算单客户边际贡献与边际贡献率
- **盈亏平衡分析**：计算盈亏平衡客户数量与销售额
- **利润模拟器**：滑动选择客户数量，实时预测利润
- **目标利润倒推**：输入目标利润，自动计算所需客户数
- **PDF 导出**：生成完整的成本分解分析报告

### 界面特点
- 移动端优先设计，完美适配手机/小程序风格
- 触控区域 ≥ 44px，操作便捷
- 实时计算，无需提交按钮
- localStorage 本地持久化

## 技术栈

- **前端框架**：React 18 + TypeScript
- **样式**：Tailwind CSS（移动优先，rem/vw）
- **图表**：Recharts（适配触摸）
- **PDF 生成**：jspdf + html2canvas
- **构建工具**：Vite
- **持久化**：localStorage

## 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 本地开发

```bash
# 克隆仓库（如果是首次）
git clone https://github.com/xxxibgdron777/001.git
cd cost-agent

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 预览应用。

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建产物
npm run preview
```

构建产物在 `dist/` 目录。

## 部署方式

### 方式一：静态文件部署（Nginx）

构建后，将 `dist/` 目录内容上传到服务器：

```bash
# 上传到服务器
scp -r dist/* user@your-server:/usr/share/nginx/html/
```

Nginx 配置示例（参见 `nginx.conf`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(css|js|jpg|png|svg)$ {
        expires 1y;
    }
}
```

### 方式二：Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

访问 http://localhost:8080

### 方式三：Docker 单独构建

```bash
# 构建镜像
docker build -t cost-agent:latest .

# 运行容器
docker run -d -p 8080:80 --name cost-agent cost-agent:latest
```

### 方式四：GitHub Pages

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. Source 选择 `gh-pages` 分支
3. 访问 `https://xxxibgdron777.github.io/001`

### 方式五：自有服务器（完整部署）

```bash
# 1. 安装 Nginx
sudo apt update && sudo apt install nginx

# 2. 上传构建产物
sudo scp -r dist/* your-server:/var/www/cost-agent/

# 3. 配置 Nginx
sudo cp nginx.conf /etc/nginx/sites-available/cost-agent
sudo ln -s /etc/nginx/sites-available/cost-agent /etc/nginx/sites-enabled/

# 4. 测试并重载
sudo nginx -t
sudo systemctl reload nginx

# 5. 配置 SSL（可选，推荐使用 Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 项目结构

```
cost-agent/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── Step1CostConfig.tsx    # 成本结构配置
│   │   ├── Step2Pricing.tsx       # 定价与边际贡献
│   │   ├── Step3BreakEven.tsx     # 盈亏平衡分析
│   │   └── Step4TargetProfit.tsx   # 目标利润倒推
│   ├── hooks/
│   │   └── useCostAgent.ts        # 核心数据 Hook
│   ├── types/
│   │   └── index.ts               # TypeScript 类型定义
│   ├── utils/
│   │   ├── index.ts               # 工具函数
│   │   └── pdfExport.ts           # PDF 导出
│   ├── App.tsx             # 主应用
│   ├── index.css           # 全局样式
│   └── main.tsx            # 入口文件
├── nginx.conf              # Nginx 配置
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker Compose 配置
└── package.json
```

## 核心概念

### 成本类型
- **固定成本**：与客户量无关的成本（如房租、工资）
- **变动成本**：随客户量线性增长的成本（如材料、服务成本）

### 合作分成（动态计算）
```
合作分成 = (单价 - 已勾选基数项之和) × 分成比例%
```

- 基数项：由用户在配置面板勾选哪些变动成本计入分成基数
- 分成比例：默认为 20%，可在配置面板调整

### CVP 分析
- **边际贡献** = 单价 - 单客户变动成本
- **边际贡献率** = 边际贡献 ÷ 单价 × 100%
- **盈亏平衡客户数** = 总固定成本 ÷ 边际贡献
- **目标客户数** = (总固定成本 + 目标利润) ÷ 边际贡献

## 数字显示规则

所有展示给用户的数字均为整数（不显示小数）：
- 金额：四舍五入取整
- 百分比：四舍五入取整
- 客户数量：四舍五入取整

## 使用示例

### 场景：健康管理产品定价分析

1. 点击「🏥 健康管理产品」模板一键填充
2. 在「步骤 2」调整单价（如 ¥5000/客户）
3. 查看「步骤 3」盈亏平衡点
4. 在「步骤 4」输入目标利润（如 ¥100,000）
5. 点击右上角「PDF」按钮导出报告

## 开发指南

### 添加新的成本模板

在 `src/utils/index.ts` 中添加模板：

```typescript
export const MY_TEMPLATE: CostTemplate = {
  id: 'my-template',
  name: '我的产品',
  icon: '📦',
  items: [
    { name: '成本项A', amount: 100, type: 'variable', templateId: 'my-1' },
    { name: '成本项B', amount: 200, type: 'fixed', templateId: 'my-2' },
  ],
}
```

### 修改计算逻辑

核心计算在 `src/hooks/useCostAgent.ts` 的 `useMemo` 中：
- 依赖项变化时自动重新计算
- 包括合作分成、边际贡献、盈亏平衡点等

## 注意事项

- 所有数据存储在浏览器 localStorage，清理浏览器会丢失
- 如需导出数据，请使用 PDF 导出功能
- 建议定期备份重要配置

## License

MIT
