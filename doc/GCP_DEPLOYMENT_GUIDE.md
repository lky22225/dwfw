# Google Cloud Platform (GCP) 배포 가이드

이 문서는 DwFw 프로젝트를 Google Cloud Platform에 배포하는 방법을 설명합니다.

## Google Cloud SDK 설치

### Windows 설치 방법

#### 방법 1: 설치 프로그램 사용 (권장)

1. **Google Cloud SDK 설치 프로그램 다운로드**
   - https://cloud.google.com/sdk/docs/install-sdk 에서 Windows용 설치 프로그램 다운로드
   - 또는 다음 명령어로 다운로드:
   ```powershell
   Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "$env:TEMP\GoogleCloudSDKInstaller.exe"
   ```

2. **설치 프로그램 실행**
   ```powershell
   Start-Process "$env:TEMP\GoogleCloudSDKInstaller.exe"
   ```

3. **설치 완료 후 PowerShell에서 확인**
   ```powershell
   gcloud version
   ```

#### 방법 2: PowerShell 스크립트로 설치

`scripts/install-gcloud-sdk.ps1` 스크립트를 실행하세요.

### 초기 설정

1. **Google Cloud 계정으로 로그인**
   ```powershell
   gcloud auth login
   ```

2. **프로젝트 설정**
   ```powershell
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **기본 리전 설정**
   ```powershell
   gcloud config set compute/region asia-northeast3  # 서울 리전
   gcloud config set compute/zone asia-northeast3-a
   ```

---

## 배포 아키텍처

### 추천 방식
- **프론트엔드**: Cloud Storage (정적 웹사이트 호스팅) + Cloud CDN
- **백엔드**: Cloud Run (컨테이너 기반) 또는 Compute Engine (VM)

### 대안 방식
- **프론트엔드**: Cloud Run 또는 App Engine
- **백엔드**: App Engine (표준 환경)

---

## 1단계: 프론트엔드 배포 (Cloud Storage + Cloud CDN)

### 1.1 React 앱 빌드

```powershell
cd frontend
npm install
npm run build
```

### 1.2 Cloud Storage 버킷 생성

```powershell
# 버킷 생성 (전역적으로 고유한 이름 필요)
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l asia-northeast3 gs://dwfw-frontend-$(Get-Random)

# 버킷에 정적 웹사이트 호스팅 활성화
gsutil web set -m index.html -e index.html gs://dwfw-frontend-<your-unique-id>
```

### 1.3 빌드 파일 업로드

```powershell
# 빌드 파일 업로드
gsutil -m rsync -r -d frontend/build/ gs://dwfw-frontend-<your-unique-id>/

# 공개 읽기 권한 설정
gsutil iam ch allUsers:objectViewer gs://dwfw-frontend-<your-unique-id>
```

### 1.4 Cloud CDN 설정 (선택사항)

```powershell
# 로드 밸런서 및 백엔드 버킷 설정
gcloud compute backend-buckets create dwfw-frontend-backend \
  --gcs-bucket-name=dwfw-frontend-<your-unique-id>

# URL 맵 생성
gcloud compute url-maps create dwfw-frontend-map \
  --default-backend-bucket=dwfw-frontend-backend

# HTTP 프록시 생성
gcloud compute target-http-proxies create dwfw-frontend-proxy \
  --url-map=dwfw-frontend-map

# 전역 IP 주소 할당
gcloud compute addresses create dwfw-frontend-ip --global

# 전역 포워딩 규칙 생성
gcloud compute forwarding-rules create dwfw-frontend-http \
  --address=dwfw-frontend-ip \
  --global \
  --target-http-proxy=dwfw-frontend-proxy \
  --ports=80
```

---

## 2단계: 백엔드 배포 (Cloud Run)

### 2.1 Dockerfile 생성

백엔드 디렉토리에 `Dockerfile` 생성:

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Maven 빌드된 JAR 파일 복사
COPY target/dwfw-backend-1.0.0.jar app.jar

# 데이터 디렉토리 생성
RUN mkdir -p /app/data

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2.2 Docker 이미지 빌드 및 배포

```powershell
# Cloud Build를 사용한 빌드 및 배포
cd backend

# Docker 이미지 빌드
docker build -t gcr.io/YOUR_PROJECT_ID/dwfw-backend:latest .

# Google Container Registry에 푸시
docker push gcr.io/YOUR_PROJECT_ID/dwfw-backend:latest

# Cloud Run에 배포
gcloud run deploy dwfw-backend \
  --image gcr.io/YOUR_PROJECT_ID/dwfw-backend:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars SPRING_JSON_DATA_PATH=/tmp/data
```

### 2.3 백엔드 배포 (Compute Engine - 대안)

```powershell
# VM 인스턴스 생성
gcloud compute instances create dwfw-backend-vm \
  --zone=asia-northeast3-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB

# SSH 접속
gcloud compute ssh dwfw-backend-vm --zone=asia-northeast3-a

# VM에서 실행 (EC2와 유사한 설정)
```

---

## 3단계: 환경 설정

### 3.1 CORS 설정 업데이트

백엔드 `application-prod.yml`에서 Cloud Storage 또는 Cloud Run URL을 허용:

```yaml
spring:
  web:
    cors:
      allowed-origins: "https://storage.googleapis.com,https://your-cloudrun-url.run.app"
```

### 3.2 프론트엔드 API URL 설정

배포 시 환경 변수로 설정:

```powershell
$env:REACT_APP_API_URL="https://your-cloudrun-url.run.app/api"
npm run build
```

---

## 4단계: 자동 배포 스크립트

### 배포 스크립트 예시

```powershell
# deploy-gcp.ps1
$PROJECT_ID = "your-project-id"
$BACKEND_IMAGE = "gcr.io/$PROJECT_ID/dwfw-backend:latest"
$FRONTEND_BUCKET = "dwfw-frontend-<your-unique-id>"

# 백엔드 배포
cd backend
mvn clean package -DskipTests
docker build -t $BACKEND_IMAGE .
docker push $BACKEND_IMAGE
gcloud run deploy dwfw-backend --image $BACKEND_IMAGE --region asia-northeast3

# 프론트엔드 배포
cd ../frontend
$env:REACT_APP_API_URL="https://your-cloudrun-url.run.app/api"
npm run build
gsutil -m rsync -r -d build/ gs://$FRONTEND_BUCKET/
```

---

## 비용 예상

### Cloud Run (백엔드)
- 무료 티어: 월 200만 요청, 360,000 GB-초
- 초과 시: 약 $0.40/100만 요청

### Cloud Storage (프론트엔드)
- 무료 티어: 월 5GB 저장, 5GB 다운로드
- 초과 시: 약 $0.020/GB 저장, $0.12/GB 다운로드

### Compute Engine (대안)
- e2-micro: 약 $6-8/월
- e2-small: 약 $12-15/월

---

## 문제 해결

### Cloud Run 배포 실패

```powershell
# 로그 확인
gcloud run services logs read dwfw-backend --region asia-northeast3
```

### CORS 에러

1. `application-prod.yml`의 `allowed-origins` 확인
2. Cloud Run 서비스 재배포

### Cloud Storage 접근 불가

```powershell
# 버킷 권한 확인
gsutil iam get gs://dwfw-frontend-<your-unique-id>
```

---

## 참고 자료

- [Google Cloud SDK 설치](https://cloud.google.com/sdk/docs/install)
- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Cloud Storage 문서](https://cloud.google.com/storage/docs)
- [Spring Boot Cloud Run 배포](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-java-service)

