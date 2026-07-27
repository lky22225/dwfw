# 런타임 API URL 설정 가이드

## 문제
React 앱은 빌드 시점에 환경 변수가 코드에 포함되므로, 백엔드 URL이 변경되면 매번 재빌드해야 합니다.

## 해결 방법: 런타임 설정 파일

`frontend/public/config.js` 파일을 사용하여 빌드 없이도 API URL을 변경할 수 있습니다.

### 설정 방법

1. **config.js 파일 수정**
   ```javascript
   // frontend/public/config.js
   window.REACT_APP_API_URL = 'https://dwfw-backend-891415806743.asia-northeast3.run.app/api';
   ```

2. **프론트엔드 재배포**
   - `config.js` 파일만 수정하고 재배포하면 됩니다
   - `npm run build`를 다시 실행할 필요가 없습니다 (하지만 재배포는 필요)

### Cloud Run에 배포된 경우

1. **로컬에서 config.js 수정**
2. **Cloud Storage 또는 Cloud Run에 업로드**

```powershell
# Cloud Run에 배포된 경우
cd D:\DwFw\frontend
# config.js만 수정 후
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest
gcloud run deploy dwfw-frontend --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --region asia-northeast3
```

### 현재 백엔드 URL 확인

```powershell
gcloud run services describe dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --format "value(status.url)"
```

### config.js 파일 위치

- **로컬**: `frontend/public/config.js`
- **빌드 후**: `frontend/build/config.js`
- **배포 후**: Cloud Run 컨테이너의 `/usr/share/nginx/html/config.js`

### 주의사항

- `config.js`는 `public` 폴더에 있어야 빌드 시 `build` 폴더로 복사됩니다
- `index.html`에서 `config.js`를 먼저 로드해야 합니다 (이미 설정됨)



