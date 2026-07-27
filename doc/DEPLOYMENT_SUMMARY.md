# 배포 완료 요약

## 배포된 서비스

### 백엔드 (Cloud Run)
- **서비스명**: `dwfw-backend`
- **URL**: `https://dwfw-backend-5aqyjtasna-du.a.run.app`
- **리전**: asia-northeast3 (서울)
- **포트**: 8080

### 프론트엔드 (Cloud Run)
- **서비스명**: `dwfw-frontend`
- **URL**: Cloud Run 서비스 URL 확인 필요
- **리전**: asia-northeast3 (서울)
- **포트**: 80 (Nginx)

## 접속 방법

1. **프론트엔드 접속**
   - Cloud Run에서 제공하는 URL로 접속
   - 예: `https://dwfw-frontend-xxx.run.app`

2. **백엔드 API 직접 접근**
   - `https://dwfw-backend-5aqyjtasna-du.a.run.app/api`

## 로그인 정보

- **사용자명**: ADMIN
- **비밀번호**: 1

## 배포 아키텍처

```
프론트엔드 (Cloud Run + Nginx)
    ↓
백엔드 API (Cloud Run)
    ↓
데이터 저장 (/tmp/data - 임시 파일 시스템)
```

## 주의사항

### 데이터 저장
- Cloud Run은 **무상태(stateless)** 서비스입니다
- 현재 `/tmp/data`에 저장되는 데이터는 컨테이너가 재시작되면 사라질 수 있습니다
- 프로덕션 환경에서는 다음을 고려하세요:
  - Cloud Storage에 데이터 저장
  - Cloud SQL 또는 Firestore 사용
  - Cloud Filestore 사용

### 향후 개선 사항

1. **영구 데이터 저장**
   - Cloud Storage 버킷에 JSON 파일 저장
   - Cloud SQL 또는 Firestore로 마이그레이션

2. **커스텀 도메인**
   - Cloud Run에 커스텀 도메인 연결
   - SSL 인증서 자동 관리

3. **모니터링**
   - Cloud Logging 설정
   - Cloud Monitoring 대시보드 구성

4. **CI/CD 파이프라인**
   - Cloud Build를 통한 자동 배포
   - GitHub Actions 연동

## 배포 명령어

### 백엔드 재배포
```powershell
cd D:\DwFw\backend
$env:JAVA_HOME = "D:\DwFw\jdk-17.0.2"
D:\DwFw\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-backend:latest --project friendly-aura-477305-g3
gcloud run deploy dwfw-backend --image gcr.io/friendly-aura-477305-g3/dwfw-backend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 8080
```

### 프론트엔드 재배포
```powershell
cd D:\DwFw\frontend
$env:REACT_APP_API_URL = "https://dwfw-backend-5aqyjtasna-du.a.run.app/api"
npm run build
gcloud builds submit --tag gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --project friendly-aura-477305-g3
gcloud run deploy dwfw-frontend --image gcr.io/friendly-aura-477305-g3/dwfw-frontend:latest --platform managed --region asia-northeast3 --allow-unauthenticated --port 80
```

## 자동 배포 스크립트

```powershell
# 전체 배포
.\scripts\deploy-gcp.ps1 all

# 개별 배포
.\scripts\deploy-gcp.ps1 backend
.\scripts\deploy-gcp.ps1 frontend
```

## 문제 해결

### 프론트엔드가 흰 화면만 보이는 경우
1. 브라우저 Console 확인 (F12)
2. Network 탭에서 JavaScript 파일 로드 확인
3. API URL이 올바른지 확인
4. Cloud Run 로그 확인: `gcloud run services logs read dwfw-frontend --region asia-northeast3`

### 백엔드 API가 작동하지 않는 경우
1. Cloud Run 로그 확인: `gcloud run services logs read dwfw-backend --region asia-northeast3`
2. 서비스 상태 확인: `gcloud run services describe dwfw-backend --region asia-northeast3`

## 비용

- **Cloud Run**: 요청 수와 메모리 사용량에 따라 과금
- **Cloud Build**: 빌드 시간에 따라 과금
- **Container Registry**: 저장 공간에 따라 과금

예상 월 비용: $5-20 (사용량에 따라 다름)



