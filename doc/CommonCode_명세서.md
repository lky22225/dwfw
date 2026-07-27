# 공통코드 등록 화면 명세서

작성일: 2025-01-27  작성자: 시스템

## 1. 화면구성도 (@Browser screen capture)

아래 위치에 실제 브라우저 캡처 이미지를 삽입하세요.
- 캡처 경로 예: `doc/assets/commoncode_screen.png`

구성 개요
- 상단 헤더: 검색바, 사용자 메뉴
- 좌측 사이드바: 다단 메뉴(기초정보 > 공통코드등록)
- 컨텐츠 영역:
  - 제목/설명 카드
  - 버튼 영역: 조회, 추가, 삭제, 저장
  - 조건 영역: 코드구분 셀렉트박스 (빈칸, ROOT, ROOT 코드 목록)
  - 그리드: 선택, 코드구분, 코드, 코드명, 정렬순서, 사용여부, 비고

## 2. 기능 설명

### 2.1 버튼
- 조회: 선택된 코드구분의 자료를 그리드에 조회 (빈칸 선택 시 전체 조회)
- 추가: 현재 선택된 코드구분에 새 행 추가(기본값: 사용여부=Y, 정렬순서=마지막+1)
- 삭제: 선택 체크박스가 체크된 행을 삭제(확인 팝업)
- 저장: 현재 코드구분의 행들을 서버에 저장(해당 코드구분만 병합 저장)

### 2.2 셀렉트박스(조건)
- 항목: 
  - 빈칸: "전체" (전체 공통코드 조회)
  - ROOT: "ROOT" (코드구분이 ROOT인 항목 조회)
  - ROOT 코드들: "A01 - 출근(근태)", "B01 - AS항목", "C01 - AS구분" 등
- 변경 이벤트: 선택 변경 시 자동 조회하지 않음 (조회 버튼 클릭 필요)

### 2.3 그리드
- 선택: 체크박스(일괄 삭제용 전체 선택 지원)
- 코드구분: 읽기 전용 텍스트 (코드구분 값 표시)
- 코드: 텍스트 입력, 최대 20자
- 코드명: 텍스트 입력
- 정렬순서: 숫자 입력, 0~999, 3자리 제한
- 사용여부: 드롭다운 선택 (사용=Y, 미사용=N)
- 비고: 자유 입력 텍스트

검증/제약
- 저장 전 코드구분 미선택 시 에러 메시지 표시 (추가 시)
- 코드, 코드명 필수 입력 검증 (저장 시)
- 정렬순서는 숫자 외 입력 시 0 처리, 상한 999
- 코드구분은 추가된 행의 경우 선택된 코드구분으로 자동 설정됨

## 3. 데이터 구조도

클라이언트-서버 간 전송(JSON)
```
CommonCode {
  codeDivision: string,        // 코드구분 (예: "ROOT", "A01", "B01", "C01")
  code: string,                // 코드 (예: "A01", "A0101")
  codeName: string,            // 코드명 (예: "출근(근태)", "출근")
  codeValueNum?: number,       // 코드값(숫자) - 옵션
  codeValueStr?: string,       // 코드값(문자) - 옵션
  sortOrder: number,           // 정렬순서(0~999)
  useYn: "Y" | "N",           // 사용여부
  remark?: string,             // 비고
  regDate?: string,            // 등록일시 (yyyy-MM-dd'T'HH:mm:ss)
  modDate?: string,            // 수정일시 (yyyy-MM-dd'T'HH:mm:ss)
  regUser?: string,            // 등록자
  modUser?: string             // 수정자
}
```

엔드포인트
- GET `/api/common-codes` : 모든 공통코드 조회
- GET `/api/common-codes/roots` : ROOT 코드 목록 조회 (코드구분 셀렉트 박스용)
- GET `/api/common-codes/division/{codeDivision}` : 코드구분별 공통코드 조회
  - `{codeDivision}`이 "EMPTY"이면 전체 조회
- POST `/api/common-codes` : 코드구분별 공통코드 저장 (해당 코드구분만 병합 반영)
- POST `/api/common-codes/add` : 단일 공통코드 추가
- DELETE `/api/common-codes` : 다중 공통코드 삭제 (식별자: `codeDivision_code`)

데이터 저장
- 저장 위치: `backend/data/common_codes.json`
- 형식: JSON 배열
- 초기 데이터: 프로그램 최초 실행 시 자동 생성

## 4. UML 다이어그램(개요)

### 4.1 클래스 다이어그램(논리)
```
+------------------+          +----------------------+
|  CommonCodePage  |          |  CommonCodeService   |
|------------------|          |----------------------|
| - state          |          | - getRootCodes()     |
| - handlers       |  fetch   | - getByDivision()    |
|------------------|<-------->| - save(list)         |
| +render()        |          | - delete(list)       |
+------------------+          +----------------------+
         |                              |
         | uses                         | uses
         v                              v
+------------------+          +----------------------+
|  API (/api/...)  |          |  JSON file store     |
|  Controller      |          |  data/common_codes   |
+------------------+          +----------------------+
```

### 4.2 시퀀스(저장)
```
User -> UI(저장 클릭)
UI -> API: POST /api/common-codes (선택 코드구분 데이터)
API -> Service: saveCommonCodes(list)
Service: 기존 JSON 로드, 대상 코드구분 제거, 신규 코드구분 병합
Service -> JSON: 쓰기
API -> UI: 200 OK
UI: 토스트/메시지 표시 후 재조회
```

---

## 5. 초기 데이터 구조

### 5.1 ROOT 코드 (코드구분: ROOT)
- A01: 출근(근태)
- B01: AS항목
- C01: AS구분

### 5.2 A01 하위 코드 (코드구분: A01)
- A0101: 출근
- A0102: 오전근무
- A0103: 오후근무
- A0104: 조퇴
- A0105: 지각

### 5.3 B01 하위 코드 (코드구분: B01)
- B0101: 제품
- B0102: 서비스

### 5.4 C01 하위 코드 (코드구분: C01)
- C0101: 고장
- C0102: 교체
- C0103: 수리

## 6. 프런트엔드 동작 흐름(추가)

- 라우트: `/dashboard/mlm/basic/common-codes`
- 초기 로드: 
  1. `GET /api/common-codes/roots` → ROOT 코드 목록 조회
  2. 셀렉트박스에 ROOT 코드 목록 표시
- 조회 버튼: 현재 선택된 코드구분 기준 조회
  - 빈칸 선택: `GET /api/common-codes/division/EMPTY` (전체 조회)
  - ROOT 선택: `GET /api/common-codes/division/ROOT` (ROOT 코드 조회)
  - ROOT 코드 선택 (예: A01): `GET /api/common-codes/division/A01` (해당 코드구분 조회)
- 추가/삭제: 그리드 로컬 상태 조작 → 저장 전까지 서버 반영 없음
- 저장: 현재 선택된 코드구분 데이터만 `POST /api/common-codes`로 전송(병합 저장)
- 에러 처리: 네트워크/서버 오류 시 메시지 노출

## 7. UI 정책 & 제약(추가)

- 컬러/레이아웃
  - 전체/카드 배경: `bg-sky-50` / `border-sky-200`
  - 헤더: `bg-sky-50`, 보더 `border-sky-200`
  - 사이드바: `from-sky-50 to-sky-100` 그라디언트
- 컬럼 폭 정책(colgroup)
  - 선택(체크박스): w-10 (40px)
  - 코드구분: w-32 (128px) - 읽기 전용
  - 코드: w-40 (160px)
  - 코드명: w-64 (256px)
  - 정렬순서: w-24 (96px) - 숫자, 중앙 정렬
  - 사용여부: w-28 (112px) - 드롭다운
  - 비고: flex (남은 폭 전체)
- 접근성: 편집 중 포커스 유지, 숫자범위 보정, URL 인코딩 처리

## 8. 테스트 체크리스트(추가)

- [ ] 로그인 후 `기초정보 > 공통코드등록` 진입
- [ ] ROOT 코드 목록 (A01, B01, C01)이 셀렉트박스에 표시되는지 확인
- [ ] 전체 선택 → 조회 버튼 → 전체 공통코드 표시
- [ ] ROOT 선택 → 조회 버튼 → ROOT 코드만 표시 (A01, B01, C01)
- [ ] A01 선택 → 조회 버튼 → A01 하위 코드만 표시 (A0101~A0105)
- [ ] 추가 버튼 → 새 행 추가 → 코드구분 자동 설정
- [ ] 삭제 버튼 → 선택된 행 삭제 (확인 팝업)
- [ ] 수정 후 저장 → 재조회 시 반영 확인
- [ ] 코드 20자 제한/정렬순서 0~999 강제/사용여부 Y/N 변경 반영
- [ ] 빈/손상 JSON 자동복원 동작
- [ ] 코드, 코드명 필수 입력 검증 (저장 시)

## 9. 결과물 경로(추가)

- 캡처: `doc/assets/commoncode_screen.png`
- Word: `doc/CommonCode_명세서.docx`
- PDF: `doc/CommonCode_명세서.pdf`
- HTML: `doc/CommonCode_명세서.html`
- 데이터 파일: `backend/data/common_codes.json`

## 10. 기초코드와의 차이점

### 10.1 용어 차이
- 기초코드: 코드분류 (codeCategory)
- 공통코드: 코드구분 (codeDivision)

### 10.2 데이터 구조 차이
- 공통코드: 코드값(숫자), 코드값(문자) 필드 추가
- 기초코드: division1~3, codeDescription, itemDefinition, discountRate, amount, image 등 확장 필드

### 10.3 초기 데이터 차이
- 기초코드: ROOT 코드 8개 (1~8번)
- 공통코드: ROOT 코드 3개 (A01, B01, C01)

### 10.4 조회 방식 차이
- 기초코드: 코드분류 선택 시 자동 조회
- 공통코드: 코드구분 선택 후 조회 버튼 클릭 필요

---

비고
- 실제 WORD 파일(.docx)로의 변환 시 본 문서 내용을 복사하여 문서 편집기에 붙여넣고, 캡처 이미지를 삽입해 주세요.
- 추가 요구(양식 템플릿/로고/버전관리 표) 반영 가능.

