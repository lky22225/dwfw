# 기초코드 등록 화면 명세서

작성일: 2025-10-30  작성자: 시스템

## 1. 화면구성도 (@Browser screen capture)

아래 위치에 실제 브라우저 캡처 이미지를 삽입하세요.
- 캡처 경로 예: `doc/assets/basecode_screen.png`

구성 개요
- 상단 헤더: 검색바, 사용자 메뉴
- 좌측 사이드바: 다단 메뉴(기초정보 > 기초코드등록)
- 컨텐츠 영역:
  - 제목/설명 카드
  - 버튼 영역: 조회, 추가, 삭제, 저장
  - 조건 영역: 코드분류 셀렉트박스
  - 그리드: 선택, 코드, 코드명, 정렬순서, 사용여부, 비고

## 2. 기능 설명

### 2.1 버튼
- 조회: 선택된 코드분류의 자료를 그리드에 조회
- 추가: 현재 코드분류에 새 행 추가(기본값: 사용여부=Y, 정렬순서=마지막+1)
- 삭제: 선택 체크박스가 체크된 행을 삭제(확인 팝업)
- 저장: 현재 코드분류의 행들을 서버에 저장(해당 분류만 병합 저장)

### 2.2 셀렉트박스(조건)
- 항목: ROOT 코드(1~8) ‘코드 - 코드명’ 표시
- 변경 이벤트: 선택 즉시 해당 분류 조회 수행

### 2.3 그리드
- 선택: 체크박스(일괄 삭제용 전체 선택 지원)
- 코드: 텍스트, 최대 20자
- 코드명: 텍스트
- 정렬순서: 숫자, 0~999, 3자리 제한
- 사용여부: Y/N 선택
- 비고: 자유 입력, 남은 폭 전체

검증/제약
- 저장 전 분류 미선택 시 에러 메시지 표시
- 정렬순서는 숫자 외 입력 시 0 처리, 상한 999

## 3. 데이터 구조도

클라이언트-서버 간 전송(JSON)
```
BaseCode {
  codeCategory: string,   // 코드분류(예: "1")
  code: string,           // 코드(예: "0")
  codeName: string,       // 코드명(예: "소비자")
  division1?: string,
  division2?: string,
  division3?: string,
  codeDescription?: string,
  sortOrder: number,      // 정렬순서(0~999)
  useYn: "Y" | "N",     // 사용여부
  remark?: string,
  itemDefinition?: string,
  discountRate1?: number,
  discountRate2?: number,
  discountRate3?: number,
  amount1?: number,
  amount2?: number,
  amount3?: number,
  image1?: string,
  image2?: string,
  image3?: string,
  regDate?: string(yyyy-MM-dd'T'HH:mm:ss),
  modDate?: string(yyyy-MM-dd'T'HH:mm:ss),
  regUser?: string,
  modUser?: string
}
```

엔드포인트
- GET `/api/base-codes/categories` : ROOT 분류 목록 조회
- GET `/api/base-codes/category/{codeCategory}` : 분류별 코드 조회
- POST `/api/base-codes` : 분류별 코드 저장(해당 분류만 병합 반영)
- DELETE `/api/base-codes` : 다중 코드 삭제(식별자: `codeCategory_code`)

## 4. UML 다이어그램(개요)

### 4.1 클래스 다이어그램(논리)
```
+------------------+          +--------------------+
|  BaseCodePage    |          |  BaseCodeService   |
|------------------|          |--------------------|
| - state          |          | - getCategories()  |
| - handlers       |  fetch   | - getByCategory()  |
|------------------|<-------->| - save(list)       |
| +render()        |          | - delete(list)     |
+------------------+          +--------------------+
         |                              |
         | uses                         | uses
         v                              v
+------------------+          +--------------------+
|  API (/api/...)  |          |  JSON file store   |
|  Controller      |          |  data/base_codes   |
+------------------+          +--------------------+
```

### 4.2 시퀀스(저장)
```
User -> UI(저장 클릭)
UI -> API: POST /api/base-codes (선택 분류 데이터)
API -> Service: saveBaseCodes(list)
Service: 기존 JSON 로드, 대상 분류 제거, 신규 분류 병합
Service -> JSON: 쓰기
API -> UI: 200 OK
UI: 토스트/메시지 표시 후 재조회
```

---

비고
- 실제 WORD 파일(.docx)로의 변환 시 본 문서 내용을 복사하여 문서 편집기에 붙여넣고, 캡처 이미지를 삽입해 주세요.
- 추가 요구(양식 템플릿/로고/버전관리 표) 반영 가능.

## 5. 프런트엔드 동작 흐름(추가)

- 라우트: `/dashboard/mlm/basic/base-codes`
- 초기 로드: `GET /api/base-codes/categories` → 첫 항목 자동 선택 → `GET /api/base-codes/category/{codeCategory}`
- 조회 버튼: 현재 선택된 분류 기준 재조회
- 추가/삭제: 그리드 로컬 상태 조작 → 저장 전까지 서버 반영 없음
- 저장: 현재 분류 데이터만 `POST /api/base-codes`로 전송(병합 저장)
- 에러 처리: 네트워크/서버 오류 시 메시지 노출

## 6. UI 정책 & 제약(추가)

- 컬러/레이아웃
  - 전체/카드 배경: `bg-sky-50` / `border-sky-200`
  - 헤더: `bg-sky-50`, 보더 `border-sky-200`
  - 사이드바: `from-sky-50 to-sky-100` 그라디언트
- 컬럼 폭 정책(colgroup)
  - 체크: 좁게
  - 코드: 중간(20자)
  - 코드명: 넓게
  - 정렬순서: 매우 좁게(헤더 줄바꿈 금지, 3자리)
  - 사용여부: 중간
  - 비고: 나머지 전체
- 접근성: 편집 중 포커스 유지(index key), 숫자범위 보정

## 7. 테스트 체크리스트(추가)

- [ ] 로그인 후 `기초정보 > 기초코드등록` 진입
- [ ] ROOT(1~8) 분류 목록 노출
- [ ] 분류 선택 → 조회 버튼 → 그리드 데이터 표시
- [ ] 추가/삭제/수정 → 저장 → 재조회 시 반영
- [ ] 코드 20자 제한/정렬순서 0~999 강제/사용여부 Y/N 변경 반영
- [ ] 빈/손상 JSON 자동복원 동작

## 8. 결과물 경로(추가)

- 캡처: `doc/basecode_screen.png`
- Word: `doc/BaseCode_명세서.docx`
- PDF: `doc/BaseCode_명세서.pdf`
- HTML: `doc/BaseCode_명세서.html`



