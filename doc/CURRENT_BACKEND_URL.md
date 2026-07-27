# 현재 백엔드 URL 확인

## 확인 방법

### 방법 1: gcloud 명령어

```powershell
# PATH 설정
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

# 백엔드 URL 확인
gcloud run services describe dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --format "value(status.url)"

# 모든 서비스 확인
gcloud run services list --region asia-northeast3 --project friendly-aura-477305-g3 --format="table(metadata.name,status.url)"
```

### 방법 2: 자동 확인 스크립트

```powershell
.\scripts\check-backend-url.ps1
```

### 방법 3: Google Cloud Console

1. https://console.cloud.google.com/ 접속
2. Cloud Run 메뉴 선택
3. `dwfw-backend` 서비스 클릭
4. "URL" 항목에서 확인

## 현재 설정

### config.js 파일
- 위치: `frontend/public/config.js`
- 현재 설정: `https://dwfw-backend-5aqyjtasna-du.a.run.app/api`

### 실제 백엔드 URL 확인 필요

위 명령어로 실제 배포된 URL을 확인한 후, config.js 파일을 업데이트하세요.



