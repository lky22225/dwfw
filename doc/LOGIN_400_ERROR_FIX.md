# 로그인 400 에러 해결 가이드

## 문제 원인
Cloud Run은 **무상태(stateless)** 서비스입니다. `/tmp/data`에 저장된 데이터는 컨테이너가 재시작되면 사라질 수 있습니다. 따라서 관리자 계정이 없어서 로그인할 수 없습니다.

## 해결 방법

### 1단계: 관리자 계정 초기화

브라우저에서 직접 API 호출:

```javascript
// 브라우저 Console (F12)에서 실행
fetch('https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('관리자 계정 초기화:', data))
.catch(error => console.error('에러:', error));
```

또는 PowerShell에서:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"
Invoke-WebRequest -Uri "https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin" -Method POST -ContentType "application/json"
```

### 2단계: 로그인 시도

관리자 계정 초기화 후:
- 사용자명: `ADMIN`
- 비밀번호: `1`

### 3단계: 백엔드 로그 확인

```powershell
gcloud run services logs read dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --limit 50
```

## 영구적인 해결 방법

### 옵션 1: Cloud Storage에 데이터 저장

백엔드 코드를 수정하여 Cloud Storage 버킷에 JSON 파일을 저장하도록 변경

### 옵션 2: 애플리케이션 시작 시 자동 초기화

백엔드 시작 시 관리자 계정이 없으면 자동으로 생성하도록 수정

### 옵션 3: Cloud SQL 또는 Firestore 사용

데이터베이스를 사용하여 영구 저장

## 즉시 해결

브라우저 Console에서 다음 명령어 실행:

```javascript
// 1. 관리자 계정 초기화
await fetch('https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log);

// 2. 로그인 테스트
await fetch('https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'ADMIN', password: '1' })
}).then(r => r.json()).then(console.log);
```



