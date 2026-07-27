# DwFw 관리자 시스템

React + TypeScript 프론트엔드와 Spring Boot + MyBatis 백엔드를 사용한 관리자 시스템입니다.

## 프로젝트 구조

```
DwFw/
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/      # Java 소스 코드
│   ├── src/main/resources/ # 설정 파일
│   └── pom.xml             # Maven 의존성
├── frontend/               # React + TypeScript 프론트엔드
│   ├── src/               # React 소스 코드
│   ├── public/            # 정적 파일
│   └── package.json       # npm 의존성
└── README.md              # 프로젝트 설명서
```

## 기술 스택

### 프론트엔드
- React 18 + TypeScript
- React Router DOM
- Tailwind CSS
- React Hook Form
- Axios
- React Query
- React Hot Toast
- Lucide React

### 백엔드
- Spring Boot 3.2.0
- Spring Security
- JWT (JSON Web Token)
- Jackson (JSON 처리)
- JSON 파일 기반 데이터 저장

## 주요 기능

### 인증 및 보안
- SHA-256 비밀번호 암호화
- JWT 토큰 기반 인증
- 사용자 역할별 권한 관리

### 사용자 관리
- 3가지 사용자 그룹: SYSTEM_ADMIN, SYSTEM_USER, PARTNER_USER
- 사용자별 맞춤 메뉴 제공
- 관리자 계정 초기화 기능

### 메뉴 구성
- **시스템관리자**: 기준정보, 주문관리, 게시판, 시스템관리
- **시스템사용자**: 주문관리, 게시판
- **파트너사용자**: 기준정보, 게시판

### 데이터 저장
- JSON 파일 기반 데이터 저장 (데이터베이스 연결 없음)
- 파일 시스템을 통한 영구 저장

## 설치 및 실행

### 백엔드 실행

1. Java 17 이상 설치 확인
2. Maven 설치 확인
3. 백엔드 디렉토리로 이동
```bash
cd backend
```

4. 의존성 설치 및 실행
```bash
mvn clean install
mvn spring-boot:run
```

백엔드는 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드 실행

1. Node.js 18 이상 설치 확인
2. 프론트엔드 디렉토리로 이동
```bash
cd frontend
```

3. 의존성 설치
```bash
npm install
```

4. 개발 서버 실행
```bash
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 초기 설정

### 관리자 계정 초기화

1. 프론트엔드에서 "관리자 계정 초기화" 버튼 클릭
2. 또는 백엔드 API 직접 호출:
```bash
curl -X POST http://localhost:8080/api/auth/init-admin
```

### 기본 로그인 정보
- **사용자명**: ADMIN
- **비밀번호**: 1

## API 엔드포인트

모든 API는 `/api` prefix를 사용합니다. 프론트엔드에서는 `apiService`를 통해 호출합니다.

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보
- `GET /api/auth/init-admin` - 관리자 계정 초기화 안내 (GET 요청)
- `POST /api/auth/init-admin` - 관리자 계정 초기화 (POST 요청)

### 사용자 관리
- `GET /api/users` - 사용자 목록
- `POST /api/users` - 사용자 생성
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제

### 기초코드 관리
- `GET /api/base-codes/categories` - 코드분류 목록 조회
- `GET /api/base-codes/category/{codeCategory}` - 코드분류별 기초코드 조회
- `POST /api/base-codes` - 기초코드 저장
- `DELETE /api/base-codes` - 기초코드 삭제

### 공통코드 관리
- `GET /api/common-codes/roots` - ROOT 코드 목록 조회
- `GET /api/common-codes/division/{codeDivision}` - 코드구분별 공통코드 조회
- `POST /api/common-codes` - 공통코드 저장
- `DELETE /api/common-codes` - 공통코드 삭제

### 은행코드 관리
- `GET /api/bank-codes` - 은행코드 목록 조회
- `GET /api/bank-codes/search?q={keyword}` - 은행코드 검색
- `POST /api/bank-codes` - 은행코드 저장
- `DELETE /api/bank-codes` - 은행코드 삭제

**API 호출 예시 (프론트엔드):**
```typescript
import apiService from '../services/api';

// 조회
const codes = await apiService.getBaseCodeCategories();

// 저장
await apiService.saveBaseCodes(baseCodes);

// 삭제
await apiService.deleteBaseCodes(codeIds);
```

## 개발 가이드

### 프로젝트 규칙
**모든 프로그램 개발은 반드시 다음 문서를 참고하여 진행합니다:**
- [`doc/PROJECT_RULE.md`](doc/PROJECT_RULE.md) - DwFw 프로젝트 규칙 (기초코드등록 프로그램 기준)

이 규칙에는 다음 내용이 포함되어 있습니다:
- 프론트엔드 개발 패턴 (React + TypeScript)
- 백엔드 개발 패턴 (Spring Boot + Java)
- **API 통신 방식 (apiService 중앙화 패턴)**
- **빌드 및 배포 규칙 (GCP Cloud Run)**
- 데이터 저장 규칙
- UI 레이아웃 및 스타일 가이드
- 개발 체크리스트

### 프론트엔드 개발
- 컴포넌트는 `src/components/`에 위치
- 페이지는 `src/pages/`에 위치
- 타입 정의는 `src/types/`에 위치
- **API 서비스는 `src/services/api.ts`에 위치 (중앙화된 API 관리)**
  - ⚠️ **하드코딩된 URL 금지**: `http://localhost:8080` 등 직접 사용 금지
  - `apiService`를 통한 모든 API 호출
  - 환경별 URL 자동 설정 (config.js 또는 환경 변수)

### 백엔드 개발
- 컨트롤러는 `com.dwfw.controller` 패키지
- 서비스는 `com.dwfw.service` 패키지
- 엔티티는 `com.dwfw.entity` 패키지
- 설정은 `com.dwfw.config` 패키지

## 환경 설정

### API URL 설정

프론트엔드는 런타임에 백엔드 URL을 동적으로 설정할 수 있습니다:

**방법 1: config.js 파일 (권장)**
- 위치: `frontend/public/config.js`
- 내용:
```javascript
window.REACT_APP_API_URL = 'https://backend-url.com/api';
```
- 장점: 빌드 없이 환경별 URL 변경 가능

**방법 2: 환경 변수**
- 파일: `.env.production`, `.env.development`
- 내용: `REACT_APP_API_URL=https://backend-url.com/api`

**로컬 개발:**
- 기본값: `/api` (프록시 사용)
- 또는 `package.json`의 `proxy` 설정 활용

## 데이터 저장 위치

**로컬 개발:**
백엔드에서 생성되는 JSON 데이터는 `backend/data/` 디렉토리에 저장됩니다:
- `users.json` - 사용자 정보
- `user_id_sequence.json` - 사용자 ID 시퀀스
- `base_codes.json` - 기초코드
- `common_codes.json` - 공통코드
- `bank_codes.json` - 은행코드

**프로덕션 (Cloud Run):**
- 저장 위치: `/tmp/data/` (임시 파일 시스템)
- 재시작 시 데이터 초기화됨 (영구 저장소 필요 시 별도 설정)

## 주요 기능 상세

### 기초코드 등록
- 코드분류별 기초코드 관리
- 동적 그리드 생성 (itemDefinition 기반)
- 조건별 필드 저장

### 공통코드 등록
- 코드구분별 공통코드 관리
- ROOT 코드 자동 관리

### 은행코드 등록
- 은행코드/은행명 검색
- 송금수수료 관리
- 변경된 항목만 저장 (최적화)

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 문제 해결

### CORS 오류
- 백엔드 `SecurityConfig.java`에서 CORS 설정 확인
- Cloud Run 도메인 패턴이 허용되어 있는지 확인

### API 연결 실패
- `frontend/public/config.js`의 백엔드 URL 확인
- 브라우저 개발자 도구 콘솔에서 API URL 확인
- 네트워크 탭에서 요청/응답 확인

### 배포 오류
- Maven 경로 확인 (배포 스크립트에 설정됨)
- GCP 프로젝트 권한 확인
- Cloud Run 로그 확인

## 배포

### GCP Cloud Run 배포 (권장)

프로젝트는 Google Cloud Platform의 Cloud Run에 배포됩니다.

**배포 스크립트:**
```powershell
# 전체 배포
.\scripts\deploy-gcp.ps1 all

# 백엔드만 배포
.\scripts\deploy-gcp.ps1 backend

# 프론트엔드만 배포
.\scripts\deploy-gcp.ps1 frontend
```

**배포 전 확인사항:**
- [ ] GCP 프로젝트 ID 설정 확인
- [ ] gcloud CLI 로그인 및 프로젝트 설정
- [ ] Cloud Run API 활성화 확인
- [ ] Java 17 및 Maven 설치 확인 (백엔드 빌드용)

**배포 프로세스:**
1. 백엔드: Maven 빌드 → Docker 이미지 빌드 → Cloud Run 배포
2. 프론트엔드: 백엔드 URL 조회 → config.js 업데이트 → npm 빌드 → Docker 이미지 빌드 → Cloud Run 배포

**배포 후 확인:**
```bash
# 서비스 목록 확인
gcloud run services list --region=asia-northeast3

# 로그 확인
gcloud run services logs read dwfw-backend --region=asia-northeast3
gcloud run services logs read dwfw-frontend --region=asia-northeast3
```

**배포된 서비스 URL:**
- 백엔드: `https://dwfw-backend-891415806743.asia-northeast3.run.app`
- 프론트엔드: `https://dwfw-frontend-891415806743.asia-northeast3.run.app`

### AWS 배포 (선택사항)

프로젝트를 AWS에 배포하는 방법은 다음 문서를 참고하세요:

- [빠른 시작 가이드](doc/AWS_DEPLOYMENT_QUICK_START.md) - 빠른 배포 체크리스트
- [상세 배포 가이드](doc/AWS_DEPLOYMENT_GUIDE.md) - 전체 배포 절차 및 설명

**배포 아키텍처:**
- **프론트엔드**: S3 + CloudFront
- **백엔드**: EC2 (Spring Boot)

**자동 배포 스크립트:**
```bash
# 전체 배포
./scripts/deploy-aws.sh all

# 개별 배포
./scripts/deploy-aws.sh backend
./scripts/deploy-aws.sh frontend
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.


