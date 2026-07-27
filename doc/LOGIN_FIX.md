# 로그인 문제 해결

## 문제 원인
모든 컨트롤러에 `@CrossOrigin(origins = "http://localhost:3000")`이 하드코딩되어 있어서 Cloud Run에서 접속하는 프론트엔드의 요청이 차단되었습니다.

## 해결 방법
모든 컨트롤러의 `@CrossOrigin`을 `origins = "*"`로 변경했습니다.

## 변경된 파일
- `AuthController.java`
- `UserController.java`
- `BaseCodeController.java`
- `CommonCodeController.java`
- `BankCodeController.java`

## 재배포 필요

### 백엔드 재배포
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
gcloud run deploy dwfw-backend --image gcr.io/friendly-aura-477305-g3/dwfw-backend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 8080
```

## 확인 사항

재배포 후:
1. 브라우저에서 프론트엔드 접속
2. F12로 개발자 도구 열기
3. Network 탭에서 로그인 요청 확인
4. Console 탭에서 에러 확인

로그인 정보:
- 사용자명: `ADMIN`
- 비밀번호: `1`

## 추가 확인

### API 직접 테스트
```powershell
# 관리자 계정 초기화
curl -X POST https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/init-admin

# 로그인 테스트
curl -X POST https://dwfw-backend-5aqyjtasna-du.a.run.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"ADMIN\",\"password\":\"1\"}'
```



