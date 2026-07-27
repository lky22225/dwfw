# 프론트엔드 API URL 수정 가이드

## 문제
프론트엔드가 잘못된 백엔드 URL을 호출하고 있습니다.

- 현재 프론트엔드가 호출하는 URL: `https://dwfw-backend-5aqyjtasna-du.a.run.app`
- 실제 백엔드 URL: `https://dwfw-backend-891415806743.asia-northeast3.run.app`

## 해결 방법

### 방법 1: 올바른 URL로 재빌드 및 재배포

```powershell
# PATH 설정
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

# 백엔드 URL 확인
$backendUrl = gcloud run services describe dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --format "value(status.url)"
Write-Host "백엔드 URL: $backendUrl"

# 프론트엔드 디렉토리로 이동
cd D:\DwFw\frontend

# 올바른 API URL로 빌드
$env:REACT_APP_API_URL = "$backendUrl/api"
npm run build

# Docker 이미지 빌드 및 배포
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --project friendly-aura-477305-g3

# Cloud Run에 배포
gcloud run deploy dwfw-frontend --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 80
```

### 방법 2: 자동 배포 스크립트 사용

```powershell
.\scripts\deploy-gcp.ps1 frontend
```

스크립트가 자동으로 백엔드 URL을 가져와서 사용합니다.

## 확인

재배포 후 브라우저 Console에서:

```javascript
// API URL 확인
console.log('API URL:', process.env.REACT_APP_API_URL || '설정되지 않음');

// 실제 호출되는 URL 확인
console.log('백엔드 URL:', window.location.origin);
```

## 주의사항

React 앱은 빌드 시점에 환경 변수가 코드에 포함됩니다. 따라서:
- 환경 변수를 변경한 후에는 반드시 `npm run build`를 다시 실행해야 합니다
- 빌드된 파일을 Cloud Run에 재배포해야 변경사항이 반영됩니다



