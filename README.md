# 产品成本分解 Agent

> 基于 React 18 + TypeScript + Tailwind CSS + Recharts 构建的纯前端 CVP（本量利）分析工具。  
> 数据存储在 localStorage，无需后端，可一键部署到任何静态托管服务。

---

## 功能概览

| 功能模块 | 说明 |
|---|---|
| **成本项管理** | 动态增删改，区分固定/变动成本，支持三类预置模板 |
| **本量利模型** | 售价滑块 + 实时计算贡献毛益、利润、收入 |
| **盈亏平衡分析** | 自动计算 BEP 销量与收入，图形标注 |
| **目标利润推算** | 输入目标利润 → 反推所需销量和收入 |
| **数据可视化** | 成本结构饼图、BEP 折线图、不同售价利润柱状图 |
| **持久化存储** | localStorage，刷新不丢失 |

---

## 本地开发

### 前置要求

- Node.js ≥ 18
- npm ≥ 9（或 pnpm / yarn）

### 启动步骤

```bash
# 1. 进入项目目录
cd cost-agent

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

### 构建生产版本

```bash
npm run build
# 产物输出到 dist/ 目录
```

构建完成后可本地预览：

```bash
npm run preview
# 默认 http://localhost:4173
```

---

## 部署方式

### 方式一：Nginx 托管静态文件（推荐）

**1. 构建**

```bash
npm install && npm run build
```

**2. 上传 `dist/` 目录到服务器**

```bash
# 使用 scp 上传（替换为你的服务器信息）
scp -r dist/ root@your-server-ip:/var/www/cost-agent
```

或使用 FTP / SFTP 工具手动上传。

**3. 配置 Nginx**

新建配置文件 `/etc/nginx/conf.d/cost-agent.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;   # 替换为你的域名或 IP

    root /var/www/cost-agent;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # 前端路由（SPA）
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # 静态资源长期缓存
    location ~* \.(js|css|png|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**4. 重载 Nginx**

```bash
sudo nginx -t          # 检查配置
sudo nginx -s reload   # 重载
```

访问 `http://your-server-ip` 即可。

---

### 方式二：Node.js 简单托管

```bash
# 安装 serve
npm install -g serve

# 前台运行
serve -s dist -l 3000

# 使用 pm2 后台运行
npm install -g pm2
pm2 start "serve -s dist -l 3000" --name cost-agent
pm2 save
pm2 startup
```

---

### 方式三：Docker 容器化部署（推荐生产环境）

项目已包含 `Dockerfile` 和 `docker-compose.yml`。

**直接构建并运行**

```bash
# 构建镜像
docker build -t cost-agent:latest .

# 运行容器（映射到宿主机 3000 端口）
docker run -d -p 3000:80 --name cost-agent cost-agent:latest
```

**使用 docker-compose（推荐）**

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

默认映射端口为 `3000`，修改 `docker-compose.yml` 中的 `"3000:80"` 即可更换。

**注意：** 如需将端口改为 80，修改为 `"80:80"` 并确保宿主机 80 端口未被占用。

---

### 方式四：Vercel / Netlify 一键部署

将项目推送到 GitHub，在 Vercel / Netlify 新建项目：

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18+

---

## 项目结构

```
cost-agent/
├── src/
│   ├── components/
│   │   ├── CostManager.tsx      # 成本项管理面板
│   │   ├── CVPCalculator.tsx    # 本量利计算面板
│   │   ├── BreakEvenPanel.tsx   # 盈亏平衡分析
│   │   ├── TargetProfitPanel.tsx # 目标利润推算
│   │   ├── ChartsPanel.tsx      # 数据可视化图表
│   │   └── MetricCards.tsx      # 顶部核心指标卡片
│   ├── hooks/
│   │   └── useCostAgent.ts      # 核心状态管理 + CVP 计算
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   ├── utils/
│   │   └── index.ts             # 工具函数 + 成本模板
│   ├── App.tsx                  # 主应用布局
│   ├── main.tsx                 # React 入口
│   └── index.css                # 全局样式（Tailwind）
├── Dockerfile                   # Docker 镜像构建
├── docker-compose.yml           # 容器编排
├── nginx.conf                   # Nginx 配置
├── vite.config.ts               # Vite 配置
├── tailwind.config.js           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| React | 18 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Vite | 5 | 构建工具 |
| Tailwind CSS | 3 | 样式框架 |
| Recharts | 2 | 图表库 |
| Lucide React | 0.344 | 图标库 |

---

## License

MIT
