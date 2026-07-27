# 백엔드 URL 불일치 문제 해결

## 문제 상황

- **config.js에 설정된 URL**: `https://dwfw-backend-891415806743.asia-northeast3.run.app/api`
- **실제 백엔드 URL** (gcloud 명령어 결과): `https://dwfw-backend-5aqyjtasna-du.a.run.app`

## 원인

Cloud Run은 서비스를 배포할 때마다 고유한 URL을 생성합니다. 처음 배포했을 때와 재배포했을 때 URL이 달라질 수 있습니다.

## 해결 방법

### 1. config.js 파일 수정

`frontend/public/config.js` 파일을 실제 백엔드 URL로 수정:

```javascript
window.REACT_APP_API_URL = 'https://dwfw-backend-5aqyjtasna-du.a.run.app/api';
```

### 2. 프론트엔드 재빌드 및 재배포

```powershell
# PATH 설정
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

# 프론트엔드 디렉토리로 이동
cd D:\DwFw\frontend

# 빌드
npm run build

# Docker 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --project friendly-aura-477305-g3

# Cloud Run에 배포
gcloud run deploy dwfw-frontend --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 80
```

## 백엔드 URL 확인 방법

```powershell
gcloud run services describe dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --format "value(status.url)"
```

## 주의사항

- 백엔드를 재배포하면 URL이 변경될 수 있습니다
- URL이 변경되면 config.js도 함께 업데이트해야 합니다
- 향후에는 Elastic IP나 고정 도메인을 사용하는 것을 권장합니다



