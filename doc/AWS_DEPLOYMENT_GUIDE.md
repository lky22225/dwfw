# AWS 배포 가이드

이 문서는 DwFw 프로젝트를 AWS에 배포하는 방법을 설명합니다.

## 배포 아키텍처

### 추천 방식 (비용 효율적)
- **프론트엔드**: S3 + CloudFront (정적 웹사이트 호스팅)
- **백엔드**: EC2 (t3.micro 또는 t3.small) 또는 Elastic Beanstalk

### 대안 방식
- **프론트엔드**: EC2에 Nginx로 서빙
- **백엔드**: Elastic Beanstalk (자동 스케일링)

---

## 사전 준비사항

1. **AWS 계정 생성** 및 IAM 사용자 설정
2. **AWS CLI 설치 및 설정**
   ```bash
   aws configure
   ```
3. **도메인 준비** (선택사항, CloudFront의 경우 Route 53 권장)

---

## 1단계: 프론트엔드 배포 (S3 + CloudFront)

### 1.1 React 앱 빌드

```bash
cd frontend
npm install
npm run build
```

빌드된 파일은 `frontend/build/` 디렉토리에 생성됩니다.

### 1.2 S3 버킷 생성

AWS 콘솔에서 또는 CLI로:

```bash
# S3 버킷 생성 (버킷 이름은 전 세계적으로 고유해야 함)
aws s3 mb s3://dwfw-frontend-<your-unique-id>

# 버킷 정책 설정 (정적 웹사이트 호스팅)
aws s3 website s3://dwfw-frontend-<your-unique-id> \
  --index-document index.html \
  --error-document index.html

# 빌드 파일 업로드
aws s3 sync frontend/build/ s3://dwfw-frontend-<your-unique-id> --delete
```

### 1.3 CloudFront 배포 생성

1. AWS 콘솔 → CloudFront → 배포 생성
2. 원본 도메인: S3 버킷 선택
3. 뷰어 프로토콜 정책: HTTPS로 리디렉션
4. 기본 루트 객체: `index.html`
5. 에러 페이지: 403/404 → `/index.html` (200) - SPA 라우팅을 위해 필요

### 1.4 환경 변수 설정

프론트엔드의 API URL을 환경 변수로 설정합니다.

**frontend/.env.production** 파일 생성:
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

또는 빌드 시:
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api npm run build
```

---

## 2단계: 백엔드 배포 (EC2)

### 2.1 EC2 인스턴스 생성

1. **AMI 선택**: Amazon Linux 2023 또는 Ubuntu 22.04 LTS
2. **인스턴스 타입**: t3.micro (프리티어) 또는 t3.small
3. **보안 그룹 설정**:
   - SSH (22): 본인 IP만 허용
   - HTTP (80): 모든 IP 허용
   - HTTPS (443): 모든 IP 허용
   - 커스텀 TCP (8080): 모든 IP 허용 (또는 CloudFront만)

4. **키 페어 생성 및 다운로드**

### 2.2 EC2 인스턴스 접속 및 환경 설정

```bash
# SSH 접속
ssh -i your-key.pem ec2-user@your-ec2-ip

# Java 17 설치 (Amazon Linux)
sudo yum update -y
sudo yum install java-17-amazon-corretto -y

# Maven 설치
sudo wget https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
sudo tar -xzf apache-maven-3.9.6-bin.tar.gz -C /opt
sudo ln -s /opt/apache-maven-3.9.6 /opt/maven
echo 'export PATH=/opt/maven/bin:$PATH' | sudo tee -a /etc/profile
source /etc/profile

# Ubuntu의 경우
# sudo apt update
# sudo apt install openjdk-17-jdk maven -y
```

### 2.3 애플리케이션 배포

#### 방법 1: Git을 통한 배포

```bash
# Git 설치
sudo yum install git -y  # Ubuntu: sudo apt install git -y

# 프로젝트 클론
cd /home/ec2-user
git clone <your-repository-url> DwFw
cd DwFw/backend

# Maven 빌드
mvn clean package -DskipTests

# JAR 파일 실행
nohup java -jar target/dwfw-backend-1.0.0.jar > app.log 2>&1 &
```

#### 방법 2: SCP를 통한 배포

로컬에서:
```bash
# 백엔드 빌드
cd backend
mvn clean package -DskipTests

# JAR 파일 업로드
scp -i your-key.pem target/dwfw-backend-1.0.0.jar ec2-user@your-ec2-ip:/home/ec2-user/

# 데이터 디렉토리 업로드 (기존 데이터가 있다면)
scp -i your-key.pem -r data/ ec2-user@your-ec2-ip:/home/ec2-user/dwfw-data/
```

EC2에서:
```bash
# 데이터 디렉토리 생성
mkdir -p /home/ec2-user/dwfw-data

# 애플리케이션 실행
nohup java -jar dwfw-backend-1.0.0.jar \
  --spring.json.data-path=/home/ec2-user/dwfw-data/ \
  > app.log 2>&1 &
```

### 2.4 Systemd 서비스로 자동 시작 설정

```bash
sudo nano /etc/systemd/system/dwfw-backend.service
```

다음 내용 추가:

```ini
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

[Install]
WantedBy=multi-user.target
```

서비스 활성화:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dwfw-backend
sudo systemctl start dwfw-backend
sudo systemctl status dwfw-backend
```

### 2.5 Nginx 리버스 프록시 설정 (선택사항)

```bash
# Nginx 설치
sudo yum install nginx -y  # Ubuntu: sudo apt install nginx -y

# 설정 파일 생성
sudo nano /etc/nginx/conf.d/dwfw-backend.conf
```

다음 내용 추가:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Nginx 시작:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 3단계: 보안 설정

### 3.1 SSL/TLS 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo yum install certbot python3-certbot-nginx -y

# 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo systemctl enable certbot.timer
```

### 3.2 보안 그룹 최적화

- SSH 포트는 본인 IP만 허용
- 백엔드 API는 CloudFront 또는 Nginx를 통해서만 접근 가능하도록 설정

### 3.3 환경 변수 관리

민감한 정보는 환경 변수로 관리:

```bash
# application.yml 수정 또는 환경 변수로 설정
export JWT_SECRET=your-secure-secret-key
export SPRING_JSON_DATA_PATH=/home/ec2-user/dwfw-data/
```

---

## 4단계: CORS 설정 업데이트

백엔드 `application.yml`에서 CloudFront 도메인을 허용:

```yaml
spring:
  web:
    cors:
      allowed-origins: "https://your-cloudfront-domain.cloudfront.net"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
```

---

## 5단계: 모니터링 및 로깅

### CloudWatch 로그 설정

```bash
# CloudWatch Agent 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# 설정 파일 생성
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ec2-user/app.log",
            "log_group_name": "/aws/ec2/dwfw-backend",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

Agent 시작:

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
```

---

## 6단계: 자동 배포 스크립트

### 배포 스크립트 예시 (deploy.sh)

```bash
#!/bin/bash

# 백엔드 빌드
cd backend
mvn clean package -DskipTests

# EC2에 배포
scp -i ~/.ssh/dwfw-key.pem target/dwfw-backend-1.0.0.jar ec2-user@your-ec2-ip:/home/ec2-user/

# EC2에서 재시작
ssh -i ~/.ssh/dwfw-key.pem ec2-user@your-ec2-ip "sudo systemctl restart dwfw-backend"

# 프론트엔드 빌드
cd ../frontend
npm run build

# S3에 업로드
aws s3 sync build/ s3://dwfw-frontend-<your-unique-id> --delete

# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 비용 예상

### 프리티어 사용 시
- EC2 t3.micro: 무료 (12개월)
- S3: 무료 (5GB)
- CloudFront: 무료 (50GB 데이터 전송)
- **월 약 $0-5**

### 프리티어 만료 후
- EC2 t3.micro: 약 $7-10/월
- S3: 약 $0.023/GB
- CloudFront: 약 $0.085/GB
- **월 약 $10-20**

---

## 문제 해결

### 백엔드가 시작되지 않을 때

```bash
# 로그 확인
sudo journalctl -u dwfw-backend -f

# 또는 직접 실행하여 에러 확인
java -jar dwfw-backend-1.0.0.jar
```

### 프론트엔드에서 API 호출 실패

1. CORS 설정 확인
2. 백엔드 보안 그룹에서 포트 8080 열려있는지 확인
3. CloudFront의 원본 설정 확인

### 데이터 파일 접근 권한 문제

```bash
sudo chown -R ec2-user:ec2-user /home/ec2-user/dwfw-data
chmod -R 755 /home/ec2-user/dwfw-data
```

---

## 추가 최적화

1. **Elastic IP 할당**: EC2 인스턴스 재시작 시에도 동일한 IP 유지
2. **Auto Scaling Group**: 트래픽에 따른 자동 스케일링
3. **RDS 또는 DynamoDB**: 데이터베이스 사용 시 (현재는 JSON 파일 기반)
4. **CodePipeline + CodeDeploy**: CI/CD 파이프라인 구축

---

## 참고 자료

- [AWS S3 정적 웹사이트 호스팅](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront 배포](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html)
- [AWS EC2 사용 설명서](https://docs.aws.amazon.com/ec2/)
- [Spring Boot 프로덕션 배포](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)

