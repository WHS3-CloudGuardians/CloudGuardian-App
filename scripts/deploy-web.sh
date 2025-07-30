#!/bin/bash

# 테스트를 위한 계정 정보
echo 'ubuntu:pw123' | chpasswd

echo "🚀 Starting WebTier Deployment..."

# Node.js 설치 (npm설치를 위해)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# nginx 설치
echo "🛠️ Nginx 설치 및 설정 파일 수정 중..."
sudo apt update -y
sudo apt install -y nginx
INTERNAL_ALB_DNS=${internal_alb_dns}
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://$INTERNAL_ALB_DNS:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass_request_headers on;
    }
}
EOF
# 테스트 출력
sudo cat /etc/nginx/sites-available/default
sudo nginx -t
echo "🔁 Nginx 재시작 중..."
sudo systemctl restart nginx

# git clone
echo "✅ 애플리케이션 클론 중..."
# cd /home/ubuntu
git clone -b deploy --single-branch https://github.com/WHS3-CloudGuardians/CloudGuardian-App.git

# client 빌드
echo "✅ 클라이언트 디펜던시 설치 및 빌드 중..."
cd CloudGuardian-App/client
npm install
npm run build

# /var/www/html 경로로 dist 이동
echo "📁 빌드 결과물을 /var/www/html에 복사 중..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

echo "✅ 웹티어 배포 완료!"