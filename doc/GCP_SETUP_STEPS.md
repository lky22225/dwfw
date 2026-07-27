# Google Cloud Platform 초기 설정 가이드

## 1단계: Google Cloud 계정 로그인

```powershell
gcloud auth login
```

이 명령어를 실행하면 브라우저가 열리고 Google 계정으로 로그인하라는 메시지가 표시됩니다.

## 2단계: Google Cloud 프로젝트 생성

1. **웹 콘솔에서 프로젝트 생성** (권장)
   - https://console.cloud.google.com/ 접속
   - 프로젝트 선택 → 새 프로젝트
   - 프로젝트 이름: `dwfw-project` (또는 원하는 이름)
   - 프로젝트 ID 확인 및 저장

2. **또는 CLI로 프로젝트 생성**
   ```powershell
   gcloud projects create dwfw-project --name="DwFw Project"
   ```

## 3단계: 프로젝트 설정

```powershell
# 프로젝트 ID 설정 (실제 프로젝트 ID로 변경)
gcloud config set project dwfw-project-123456

# 현재 설정 확인
gcloud config list
```

## 4단계: 기본 리전/존 설정 (서울)

```powershell
# 서울 리전 설정
gcloud config set compute/region asia-northeast3
gcloud config set compute/zone asia-northeast3-a

# 설정 확인
gcloud config get-value compute/region
gcloud config get-value compute/zone
```

## 5단계: 필수 API 활성화

```powershell
# Cloud Run API 활성화
gcloud services enable run.googleapis.com

# Cloud Storage API 활성화
gcloud services enable storage-component.googleapis.com

# Container Registry API 활성화
gcloud services enable containerregistry.googleapis.com

# Cloud Build API 활성화 (Docker 이미지 빌드용)
gcloud services enable cloudbuild.googleapis.com
```

## 6단계: 결제 계정 연결

1. https://console.cloud.google.com/billing 접속
2. 결제 계정 생성 또는 연결
3. 프로젝트에 결제 계정 연결

## 7단계: Docker 설치 확인 (Cloud Run 배포용)

```powershell
docker --version
```

Docker가 설치되어 있지 않다면:
- Docker Desktop for Windows 설치: https://www.docker.com/products/docker-desktop

## 완료 확인

```powershell
# 현재 설정 확인
gcloud config list

# 프로젝트 정보 확인
gcloud projects describe $(gcloud config get-value project)

# 활성화된 API 확인
gcloud services list --enabled
```

## 다음 단계

설정이 완료되면 다음 문서를 참고하여 배포를 진행하세요:

- [GCP 배포 가이드](GCP_DEPLOYMENT_GUIDE.md)

