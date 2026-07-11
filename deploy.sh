#!/bin/bash
# 静心 — 部署到服务器脚本
# 用法: bash deploy.sh

SERVER="64.90.19.87"
# 如果服务器不是 root 用户，改成你的用户名，比如: SERVER="ubuntu@64.90.19.87"
USER="root"

echo "=== 部署静心到 $SERVER ==="

# 1. 上传文件
echo "上传文件..."
scp -r ./* "$USER@$SERVER:/var/www/jingxin/"

# 2. 在服务器上安装 nginx 并配置
echo "配置服务器..."
ssh "$USER@$SERVER" << 'EOF'
  # 安装 nginx（如果没有）
  which nginx || apt update && apt install -y nginx

  # 创建 nginx 配置
  cat > /etc/nginx/sites-available/jingxin << 'NGINX'
server {
    listen 80;
    server_name _;

    root /var/www/jingxin;
    index anxiety.html index.html;

    # 静态文件缓存
    location ~* \.(css|js|html|png|jpg|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # 默认首页
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

  # 启用配置
  ln -sf /etc/nginx/sites-available/jingxin /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  # 重启 nginx
  nginx -t && systemctl restart nginx

  echo "=== 部署完成 ==="
  echo "访问地址: http://64.90.19.87"
  echo "焦虑日记: http://64.90.19.87/anxiety.html"
EOF
