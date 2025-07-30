#!/bin/bash

# 테스트를 위한 계정 정보
echo 'ubuntu:pw123' | chpasswd

echo "🚀 Starting AppTier Deployment..."

# 기본 패키지 설치
echo "✅ 시스템 패키지 업데이트 및 필수 패키지 설치 중..."
apt update -y
apt install -y git curl build-essential mysql-client unzip jq
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" > /dev/null 2>&1
unzip -q awscliv2.zip
./aws/install > /dev/null 2>&1

# 애플리케이션 클론
echo "✅ 애플리케이션 클론 중..."
# cd /home/ubuntu
git clone -b deploy --single-branch https://github.com/WHS3-CloudGuardians/CloudGuardian-App.git /home/ubuntu/CloudGuardian-App
chown -R ubuntu:ubuntu /home/ubuntu/CloudGuardian-App

# 서버 디펜던시
echo "✅ 서버 디펜던시 설치 중..."
cd /home/ubuntu/CloudGuardian-App/server
npm install

# Secrets Manager
echo "✅ ssm에서 값 가져오는 중..."
# DB 비밀번호
DB_PASSWORD=$(aws ssm get-parameter \
  --name "/cloudguardian/DB_PASSWORD" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text)
# JWT_SECRET
JWT_SECRET=$(aws ssm get-parameter \
  --name "/cloudguardian/JWT_SECRET" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text)
# DB 설정
DB_HOST=$(echo "${rds_endpoint}" | cut -d':' -f1)
DB_USER="admin"
DB_NAME="${DB_NAME}"

# DB 존재 확인 및 생성
echo "✅ 데이터베이스 존재 확인 및 필요 시 생성 중..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"

# .env 파일 생성
echo "✅ .env 파일 생성 중..."
cat <<EOF > .env
PORT=8080
DB_HOST=$DB_HOST
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=30m
EOF

# 서버 실행
sudo -i -u ubuntu bash <<'EOF'
cd /home/ubuntu/CloudGuardian-App/server
pm2 start App.js --name cloudguardian
pm2 startup systemd
pm2 save
EOF

echo "🎉 배포 완료! 앱이 정상 실행되었는지 확인하세요:"
pm2 status