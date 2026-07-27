# 흰 화면 빠른 해결 방법

## 즉시 확인 사항

### 1. 브라우저에서 확인
1. F12를 눌러 개발자 도구 열기
2. Console 탭 확인 - 에러 메시지 확인
3. Network 탭 확인 - `main.2f524448.js` 파일이 로드되는지 확인

### 2. 어떤 URL로 접속하고 있나요?

**Cloud Storage URL인 경우:**
```
https://storage.googleapis.com/dwfw-frontend-bucket0001/index.html
```

**Cloud Run URL인 경우:**
```
https://dwfw-frontend-xxx.run.app
```

### 3. 빠른 해결 방법

#### 방법 A: Cloud Run으로 재배포 (권장)

PowerShell에서 실행:

```powershell
# 1. PATH 설정
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

# 2. 프론트엔드 디렉토리로 이동
cd D:\DwFw\frontend

# 3. 올바른 API URL로 빌드
$env:REACT_APP_API_URL = "https://dwfw-backend-5aqyjtasna-du.a.run.app/api"
npm run build

# 4. Cloud Build로 이미지 빌드
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --project friendly-aura-477305-g3

# 5. Cloud Run에 배포
gcloud run deploy dwfw-frontend --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 80
```

#### 방법 B: 로컬에서 먼저 테스트

```powershell
cd D:\DwFw\frontend
$env:REACT_APP_API_URL = "https://dwfw-backend-5aqyjtasna-du.a.run.app/api"
npm start
```

http://localhost:3000에서 정상 작동하는지 확인

### 4. 브라우저 Console에서 확인할 내용

브라우저 Console에 다음 명령어 입력:

```javascript
// 1. React 앱이 로드되었는지 확인
console.log('Root element:', document.getElementById('root'));

// 2. API URL 확인
console.log('API URL:', window.REACT_APP_API_URL || '설정되지 않음');

// 3. JavaScript 파일 로드 확인
console.log('Scripts:', Array.from(document.scripts).map(s => s.src));
```

### 5. 일반적인 문제와 해결

#### 문제: "Uncaught SyntaxError"
→ JavaScript 파일이 손상되었거나 경로가 잘못됨
→ 재빌드 필요

#### 문제: "Failed to fetch" 또는 CORS 에러
→ API URL이 잘못 설정됨
→ 빌드 시 `REACT_APP_API_URL` 확인

#### 문제: 아무 에러도 없음
→ JavaScript 파일이 로드되지 않음
→ Network 탭에서 404 확인

### 6. 현재 상태 확인

현재 접속 중인 URL을 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.



