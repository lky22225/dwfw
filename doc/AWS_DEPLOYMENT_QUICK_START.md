# AWS 배포 빠른 시작 가이드

이 문서는 AWS 배포를 빠르게 시작하기 위한 체크리스트입니다. 상세한 내용은 [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)를 참고하세요.

## 🚀 빠른 배포 체크리스트

### 사전 준비 (한 번만)

- [ ] AWS 계정 생성 및 IAM 사용자 설정
- [ ] AWS CLI 설치 및 설정 (`aws configure`)
- [ ] EC2 키 페어 생성 및 다운로드

---

## 1️⃣ 프론트엔드 배포 (S3 + CloudFront)

### S3 버킷 생성 및 설정

```bash
# 1. S3 버킷 생성 (버킷 이름은 고유해야 함)
aws s3 mb s3://dwfw-frontend-$(date +%s)

# 2. 정적 웹사이트 호스팅 활성화
aws s3 website s3://dwfw-frontend-<your-unique-id> \
  --index-document index.html \
  --error-document index.html

# 3. 버킷 정책 설정 (공개 읽기)
aws s3api put-bucket-policy --bucket dwfw-frontend-<your-unique-id> \
  --policy file://scripts/s3-bucket-policy.json
```

### 프론트엔드 빌드 및 업로드

```bash
cd frontend

# 환경 변수 설정 (백엔드 URL)
export REACT_APP_API_URL=https://your-backend-domain.com/api

# 빌드
npm install
npm run build

# S3에 업로드
aws s3 sync build/ s3://dwfw-frontend-<your-unique-id> --delete
```

### CloudFront 배포

1. AWS 콘솔 → CloudFront → 배포 생성
2. 원본 도메인: S3 버킷 선택
3. 뷰어 프로토콜: HTTPS로 리디렉션
4. 기본 루트 객체: `index.html`
5. 에러 페이지 설정:
   - HTTP 403 → `/index.html` (200)
   - HTTP 404 → `/index.html` (200)

---

## 2️⃣ 백엔드 배포 (EC2)

### EC2 인스턴스 생성

1. **AMI**: Amazon Linux 2023 또는 Ubuntu 22.04
2. **인스턴스 타입**: t3.micro (프리티어)
3. **보안 그룹**:
   - SSH (22): 본인 IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - 커스텀 TCP (8080): 0.0.0.0/0 또는 CloudFront만

### EC2 초기 설정

```bash
# SSH 접속
ssh -i your-key.pem ec2-user@your-ec2-ip

# 초기 설정 스크립트 실행
curl -o- https://raw.githubusercontent.com/your-repo/scripts/ec2-setup.sh | bash
# 또는 로컬에서 업로드
scp -i your-key.pem scripts/ec2-setup.sh ec2-user@your-ec2-ip:/home/ec2-user/
ssh -i your-key.pem ec2-user@your-ec2-ip "chmod +x ec2-setup.sh && ./ec2-setup.sh"
```

### 백엔드 배포

```bash
# 로컬에서 빌드
cd backend
mvn clean package -DskipTests

# EC2에 업로드
scp -i your-key.pem target/dwfw-backend-1.0.0.jar \
  ec2-user@your-ec2-ip:/home/ec2-user/

# EC2에서 서비스 시작
ssh -i your-key.pem ec2-user@your-ec2-ip \
  "sudo systemctl start dwfw-backend && sudo systemctl status dwfw-backend"
```

---

## 3️⃣ 설정 업데이트

### 백엔드 CORS 설정

`backend/src/main/resources/application-prod.yml` 파일에서 CloudFront 도메인으로 업데이트:

```yaml
spring:
  web:
    cors:
      allowed-origins: "https://your-cloudfront-domain.cloudfront.net"
```

### 프론트엔드 API URL

배포 시 환경 변수로 설정:

```bash
REACT_APP_API_URL=https://your-backend-domain.com/api npm run build
```

---

## 4️⃣ SSL/TLS 설정 (선택사항)

### Let's Encrypt 인증서 발급

```bash
# EC2에서 실행
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 5️⃣ 자동 배포

### 배포 스크립트 사용

```bash
# 스크립트에 설정 정보 입력 후
chmod +x scripts/deploy-aws.sh

# 전체 배포
./scripts/deploy-aws.sh all

# 또는 개별 배포
./scripts/deploy-aws.sh backend
./scripts/deploy-aws.sh frontend
```

---

## 🔍 확인 사항

### 백엔드 확인

```bash
# 서비스 상태 확인
ssh -i your-key.pem ec2-user@your-ec2-ip "sudo systemctl status dwfw-backend"

# 로그 확인
ssh -i your-key.pem ec2-user@your-ec2-ip "sudo journalctl -u dwfw-backend -f"

# API 테스트
curl http://your-ec2-ip:8080/api/auth/init-admin
```

### 프론트엔드 확인

1. CloudFront 배포 완료 대기 (5-10분)
2. CloudFront URL 접속
3. 브라우저 개발자 도구에서 네트워크 탭 확인

---

## ⚠️ 주의사항

1. **보안 그룹**: SSH 포트는 반드시 본인 IP만 허용
2. **JWT Secret**: 프로덕션에서는 환경 변수로 관리
3. **데이터 백업**: `/home/ec2-user/dwfw-data/` 디렉토리 정기 백업
4. **비용 모니터링**: AWS 비용 대시보드 확인

---

## 📊 예상 비용

- **프리티어 사용 시**: 월 $0-5
- **프리티어 만료 후**: 월 $10-20

---

## 🆘 문제 해결

### 백엔드가 시작되지 않을 때

```bash
# 로그 확인
sudo journalctl -u dwfw-backend -n 50

# 직접 실행하여 에러 확인
java -jar dwfw-backend-1.0.0.jar
```

### CORS 에러

1. `application-prod.yml`의 `allowed-origins` 확인
2. 백엔드 재시작: `sudo systemctl restart dwfw-backend`

### 프론트엔드에서 API 호출 실패

1. 브라우저 콘솔에서 에러 확인
2. 네트워크 탭에서 요청 URL 확인
3. `REACT_APP_API_URL` 환경 변수 확인

---

## 📚 추가 리소스

- [상세 배포 가이드](./AWS_DEPLOYMENT_GUIDE.md)
- [AWS 공식 문서](https://docs.aws.amazon.com/)
- [Spring Boot 프로덕션 가이드](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)

