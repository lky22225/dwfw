# 로그인 문제 즉시 해결

## 빠른 해결 방법

### 브라우저에서 직접 실행

1. **프론트엔드 페이지에서 F12로 개발자 도구 열기**
2. **Console 탭에서 다음 명령어 실행:**

```javascript
// 관리자 계정 초기화
fetch('https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(data => {
  console.log('✅ 관리자 계정 초기화 성공:', data);
  alert('관리자 계정이 생성되었습니다!\\n사용자명: ADMIN\\n비밀번호: 1');
})
.catch(error => {
  console.error('❌ 에러:', error);
  alert('관리자 계정 생성 실패');
});
```

3. **초기화 후 로그인 페이지에서:**
   - 사용자명: `ADMIN`
   - 비밀번호: `1`

## 문제 원인

Cloud Run은 무상태 서비스이므로 `/tmp/data`에 저장된 데이터가 영구적으로 유지되지 않을 수 있습니다. 애플리케이션이 시작될 때 `ApplicationInitializer`가 관리자 계정을 생성하지만, 데이터 파일 경로 문제로 인해 실패할 수 있습니다.

## 영구적인 해결

백엔드를 재배포하면 `ApplicationInitializer`가 다시 실행되어 관리자 계정이 생성됩니다.



