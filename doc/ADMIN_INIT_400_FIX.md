# 관리자 계정 초기화 400 에러 해결

## 문제 원인
Cloud Run에서 `/tmp/data` 디렉토리에 파일을 쓰는 과정에서 권한 문제나 경로 문제가 발생할 수 있습니다.

## 해결 방법

### 1. 백엔드 재배포 (권장)

코드를 수정했으므로 백엔드를 재빌드하고 재배포해야 합니다:

```powershell
# PATH 설정
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

# 백엔드 디렉토리로 이동
cd D:\DwFw\backend

# Maven 빌드
$env:JAVA_HOME = "D:\DwFw\jdk-17.0.2"
D:\DwFw\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests

# Docker 이미지 빌드 및 배포
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-backend:latest --project friendly-aura-477305-g3

# Cloud Run에 배포
gcloud run deploy dwfw-backend --image gcr.io/friendly-aura-477305-g3/dwfw-backend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 8080 --set-env-vars "SPRING_JSON_DATA_PATH=/tmp/data,SPRING_PROFILES_ACTIVE=cloudrun"
```

### 2. 변경 사항

1. **에러 처리 개선**: 더 자세한 에러 메시지 반환
2. **디버깅 로그 추가**: 각 단계별 로그 출력
3. **저장 확인**: 관리자 계정 저장 후 실제로 저장되었는지 확인

### 3. 재배포 후 확인

재배포 후 브라우저 Console에서:

```javascript
fetch('https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(data => {
  console.log('결과:', data);
  if (data.message) {
    alert('✅ 관리자 계정 생성 성공!\n사용자명: ADMIN\n비밀번호: 1');
  } else {
    alert('❌ 에러: ' + JSON.stringify(data));
  }
});
```

### 4. 백엔드 로그 확인

에러가 계속 발생하면 백엔드 로그를 확인:

```powershell
gcloud run services logs read dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --limit 100
```

로그에서 "❌ 관리자 계정 초기화 중 오류" 메시지를 찾아 정확한 에러 원인을 확인하세요.



