# 환경 설정 가이드

이 문서는 새 PC로 프로젝트를 옮긴 후 환경을 구성하는 방법을 안내합니다.

## 완료된 작업 ✅

✅ 배치 파일 경로를 현재 작업 디렉토리 기준으로 동적 설정 완료
✅ 백엔드 Maven 의존성 설치 완료
✅ Node.js 설치 확인 (v18.19.0)
✅ 프론트엔드 npm 의존성 설치 완료 (1499 packages)
✅ react-scripts 버전 수정 완료 (5.0.1)
✅ 정상 작동 확인 완료

## 환경 구성 요약

### 설치된 환경
- **Java**: OpenJDK 17.0.2
- **Maven**: Apache Maven 3.9.6
- **Node.js**: v18.19.0
- **npm**: 10.2.3

### 수정된 파일
- `start-backend.bat` - 동적 경로 설정
- `start-frontend.bat` - 동적 경로 설정
- `start-all.bat` - 동적 경로 설정
- `frontend/package.json` - react-scripts 버전 수정 (5.0.1)

### 3. 환경 변수 설정 (선택사항)

시스템 PATH에 Java와 Maven을 추가하려면:

1. Windows 설정 → 시스템 → 고급 시스템 설정
2. 환경 변수 → 시스템 변수 → Path 편집
3. 다음 경로 추가:
   - `D:\DwFw\jdk-17.0.2\bin`
   - `D:\DwFw\apache-maven-3.9.6\bin`

**참고:** 배치 파일(`start-backend.bat`, `start-frontend.bat`, `start-all.bat`)을 사용하면 자동으로 경로가 설정되므로 환경 변수 설정은 선택사항입니다.

## 프로젝트 실행

### 전체 시스템 실행
```cmd
start-all.bat
```

### 개별 실행

**백엔드만 실행:**
```cmd
start-backend.bat
```

**프론트엔드만 실행:**
```cmd
start-frontend.bat
```

## 접속 정보

- **백엔드**: http://localhost:8080
- **프론트엔드**: http://localhost:3000

## 기본 로그인 정보

- **사용자명**: ADMIN
- **비밀번호**: 1

## 문제 해결

### Node.js 설치 후에도 npm 명령이 인식되지 않는 경우

1. PowerShell 또는 명령 프롬프트를 **관리자 권한**으로 다시 실행
2. 시스템 재시작
3. 환경 변수 PATH에 Node.js 설치 경로가 추가되었는지 확인

### 백엔드 실행 오류

- Java 17이 설치되어 있는지 확인
- `backend/data/` 디렉토리가 존재하는지 확인
- 포트 8080이 사용 중이 아닌지 확인

### 프론트엔드 실행 오류

- Node.js 18 이상이 설치되어 있는지 확인
- `frontend/node_modules/` 디렉토리를 삭제하고 `npm install` 재실행
- 포트 3000이 사용 중이 아닌지 확인

## 다음 단계

환경 설정이 완료되면:

1. `start-all.bat` 실행하여 전체 시스템 시작
2. 브라우저에서 http://localhost:3000 접속
3. 관리자 계정으로 로그인 (ADMIN / 1)
