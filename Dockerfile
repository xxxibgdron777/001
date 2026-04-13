# ===================================================
# 第一阶段：构建
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖声明文件
COPY package*.json ./

# 安装依赖
RUN npm ci --prefer-offline

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# ===================================================
# 第二阶段：运行（使用 Nginx 托管静态文件）
# ===================================================
FROM nginx:1.25-alpine AS runner

# 删除默认 Nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/app.conf

# 从构建阶段复制 dist 产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]
