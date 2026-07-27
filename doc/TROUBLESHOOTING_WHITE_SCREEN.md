# 흰 화면 문제 해결 가이드

## 문제 진단

### 1. 브라우저 개발자 도구 확인

브라우저에서 F12를 눌러 개발자 도구를 열고 다음을 확인하세요:

**Console 탭:**
- JavaScript 에러가 있는지 확인
- 빨간색 에러 메시지 확인

**Network 탭:**
- `main.2f524448.js` 파일이 로드되는지 확인
- `main.865b7120.css` 파일이 로드되는지 확인
- API 호출이 실패하는지 확인

**Sources 탭:**
- JavaScript 파일이 제대로 로드되었는지 확인

### 2. 일반적인 원인

#### 원인 1: JavaScript 파일 로드 실패
**증상:** Network 탭에서 `main.2f524448.js`가 404 에러

**해결:**
- Cloud Storage: 파일 경로 확인
- Cloud Run: Docker 이미지에 build 폴더가 제대로 복사되었는지 확인

#### 원인 2: API URL 설정 오류
**증상:** Console에 CORS 에러 또는 API 호출 실패

**해결:**
- 빌드 시 `REACT_APP_API_URL` 환경 변수가 올바른지 확인
- 백엔드 URL이 정확한지 확인

#### 원인 3: 초기화 에러
**증상:** Console에 React 에러 또는 초기화 관련 에러

**해결:**
- AuthContext 초기화 로직 확인
- localStorage 접근 문제 확인

### 3. 즉시 확인 사항

#### Cloud Storage를 사용하는 경우:
```powershell
# 버킷 내용 확인
gsutil ls gs://dwfw-frontend-bucket0001/

# index.html 확인
gsutil cat gs://dwfw-frontend-bucket0001/index.html
```

#### Cloud Run을 사용하는 경우:
```powershell
# 서비스 상태 확인
gcloud run services describe dwfw-frontend --region asia-northeast3

# 서비스 URL 확인
gcloud run services describe dwfw-frontend --region asia-northeast3 --format "value(status.url)"
```

### 4. 디버깅 단계

#### Step 1: 간단한 테스트 페이지 확인
브라우저에서 직접 접근:
- `https://your-frontend-url/index.html`
- `https://your-frontend-url/static/js/main.2f524448.js`

#### Step 2: API 연결 확인
브라우저 Console에서:
```javascript
fetch('https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin', {
  method: 'POST'
}).then(r => r.json()).then(console.log)
```

#### Step 3: React 앱 수동 실행
빌드된 JavaScript 파일이 있다면:
```javascript
// 브라우저 Console에서
console.log('React 앱 확인:', document.getElementById('root'))
```

### 5. 빠른 해결 방법

#### 방법 1: 프론트엔드 재빌드 및 재배포
```powershell
cd D:\DwFw\frontend

# 올바른 API URL로 빌드
$env:REACT_APP_API_URL = "https://dwfw-backend-5aqyjtasna-du.a.run.app/api"
npm run build

# Cloud Storage에 업로드 (Cloud Storage 사용 시)
gsutil -m rsync -r -d build/ gs://dwfw-frontend-bucket0001/

# 또는 Cloud Run에 배포 (Cloud Run 사용 시)
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest
gcloud run deploy dwfw-frontend --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --region asia-northeast3
```

#### 방법 2: 로컬에서 테스트
```powershell
cd D:\DwFw\frontend
$env:REACT_APP_API_URL = "https://dwfw-backend-5aqyjtasna-du.a.run.app/api"
npm start
```

로컬에서 정상 작동하면 배포 문제입니다.

### 6. 체크리스트

- [ ] 브라우저 Console에 에러가 있는가?
- [ ] Network 탭에서 JavaScript 파일이 로드되는가?
- [ ] API URL이 올바르게 설정되었는가?
- [ ] 백엔드가 정상 작동하는가?
- [ ] CORS 설정이 올바른가?
- [ ] 프론트엔드가 Cloud Run/Cloud Storage에 배포되었는가?

### 7. 추가 디버깅

#### index.html에 디버그 코드 추가
```html
<script>
  console.log('페이지 로드됨');
  console.log('API URL:', process.env.REACT_APP_API_URL);
</script>
```

#### React 앱에 에러 바운더리 추가
이미 App.tsx에 에러 핸들링이 있는지 확인



