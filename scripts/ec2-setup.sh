#!/bin/bash

# EC2 인스턴스 초기 설정 스크립트
# EC2 인스턴스에 SSH 접속 후 실행

set -e

echo "=== DwFw 백엔드 환경 설정 시작 ==="

# Java 17 설치 확인 및 설치
if ! command -v java &> /dev/null; then
    echo "Java 17 설치 중..."
    if [ -f /etc/redhat-release ]; then
        # Amazon Linux
        sudo yum update -y
        sudo yum install java-17-amazon-corretto -y
    else
        # Ubuntu
        sudo apt update
        sudo apt install openjdk-17-jdk -y
    fi
fi

echo "Java 버전:"
java -version

# Maven 설치 확인 및 설치
if ! command -v mvn &> /dev/null; then
    echo "Maven 설치 중..."
    if [ -f /etc/redhat-release ]; then
        # Amazon Linux
        cd /tmp
        sudo wget https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
        sudo tar -xzf apache-maven-3.9.6-bin.tar.gz -C /opt
        sudo ln -sf /opt/apache-maven-3.9.6 /opt/maven
        echo 'export PATH=/opt/maven/bin:$PATH' | sudo tee -a /etc/profile
        source /etc/profile
    else
        # Ubuntu
        sudo apt install maven -y
    fi
fi

echo "Maven 버전:"
mvn -version

# 데이터 디렉토리 생성
echo "데이터 디렉토리 생성 중..."
mkdir -p /home/ec2-user/dwfw-data
chmod 755 /home/ec2-user/dwfw-data

# Systemd 서비스 파일 생성
echo "Systemd 서비스 설정 중..."
sudo tee /etc/systemd/system/dwfw-backend.service > /dev/null <<EOF
[Unit]
Description=DwFw Backend Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user
ExecStart=/usr/bin/java -jar /home/ec2-user/dwfw-backend-1.0.0.jar --spring.json.data-path=/home/ec2-user/dwfw-data/
Restart=always
RestartSec=10
StandardOutput=append:/var/log/dwfw-backend.log
StandardError=append:/var/log/dwfw-backend-error.log

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화 (JAR 파일이 있을 때만)
if [ -f /home/ec2-user/dwfw-backend-1.0.0.jar ]; then
    sudo systemctl daemon-reload
    sudo systemctl enable dwfw-backend
    echo "서비스가 활성화되었습니다. 'sudo systemctl start dwfw-backend'로 시작하세요."
else
    echo "JAR 파일이 없습니다. 배포 후 서비스를 시작하세요."
fi

echo "=== 환경 설정 완료 ==="
echo "다음 단계:"
echo "1. JAR 파일을 /home/ec2-user/에 업로드"
echo "2. sudo systemctl start dwfw-backend"
echo "3. sudo systemctl status dwfw-backend"

