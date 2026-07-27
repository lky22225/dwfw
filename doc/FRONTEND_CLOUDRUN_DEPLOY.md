# 프론트엔드 Cloud Run 배포 가이드

Cloud Storage 대신 Cloud Run으로 프론트엔드를 배포하는 방법입니다.

## 문제점
- Cloud Storage 정적 호스팅은 SPA 라우팅과 CORS 설정에 제한이 있습니다
- Cloud Run을 사용하면 Nginx를 통해 완전한 제어가 가능합니다

## 배포 단계

### 1. 프론트엔드 빌드 (올바른 백엔드 URL 사용)

```powershell
cd D:\DwFw\frontend
$env:REACT_APP_API_URL = "https://dwfw-backend-5aqyjtasna-du.a.run.app/api"
npm run build
```

### 2. Docker 이미지 빌드 및 배포

```powershell
# Cloud Build로 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --project friendly-aura-477305-g3
```

### 3. Cloud Run에 배포

```powershell
gcloud run deploy dwfw-frontend `
    --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest `
    --platform managed `
    --region asia-northeast3 `
    --allow-unauthenticated `
    --port 80
```

### 4. 배포된 URL 확인

```powershell
gcloud run services describe dwfw-frontend --region asia-northeast3 --format "value(status.url)"
```

## 자동 배포 스크립트 사용

```powershell
.\scripts\deploy-gcp.ps1 frontend
```

## 파일 구조

필요한 파일들:
- `frontend/Dockerfile` - Nginx 기반 Docker 이미지
- `frontend/nginx.conf` - SPA 라우팅 설정
- `frontend/build/` - React 빌드 결과물

## 장점

1. **완전한 SPA 라우팅 지원**: Nginx의 `try_files`로 모든 경로를 index.html로 리다이렉트
2. **CORS 문제 해결**: Cloud Run에서 직접 서빙하므로 CORS 문제 없음
3. **캐싱 제어**: 정적 파일 캐싱 최적화
4. **Gzip 압축**: 자동으로 활성화

## 주의사항

- 빌드 시 `REACT_APP_API_URL` 환경 변수가 올바른 백엔드 URL로 설정되어야 합니다
- Docker 이미지 빌드 시 `frontend/build/` 디렉토리가 존재해야 합니다



