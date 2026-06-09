# WMS 프론트엔드 구현 계획 (Frontend Implementation Plan)

## 진행 현황 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| Phase 1 | 화면 구조 개편 (Container / Main 분리) | ✅ 완료 |
| Phase 2 | 로그인 UI 개선 (검증 팝업, 비밀번호 토글) | ✅ 완료 |
| Phase 3 | 로그인 API 연동 및 인터페이스 동기화 | ✅ 완료 |
| Phase 4 | localStorage → sessionStorage 전환 | ✅ 완료 |
| Phase 5 | JWT 디코딩 유틸 추가 (auth.ts) | ✅ 완료 |
| Phase 6 | 헤더/사이드바 사용자 정보 연동 | ✅ 완료 |
| Phase 7 | 인증 보호 라우팅 (PrivateRoute) | ✅ 완료 |
| Phase 8 | 메뉴 화면 구조 개편 (페이지 추가 및 재편) | ✅ 완료 |
| Phase 9 | 공통관리 탭 관리자 전용 제어 | ✅ 완료 |
| Phase 10 | 메인화면 고객사&센터 selectbox API 연동 및 localStorage 저장 | ✅ 완료 |
| Phase 11 | 공지사항 화면 UI 리팩토링 (좌우 분할 구조) | ✅ 완료 |
| Phase 11.2 | UI/UX 기능 고도화 (Empty 제어, 체크박스, 읽기전용) | ✅ 완료 |
| Phase 11.3 | 리치 텍스트 에디터 (Tiptap) 도입 | ✅ 완료 |
| Phase 12 | 공지사항 API 연동 및 데이터 바인딩 | ✅ 완료 |
| Phase 13 | 공통 레이어 팝업 컴포넌트 도입 (alert/confirm 통합) | ✅ 완료 |
| Phase 14 | 차량관리 화면 UI 구현 (디자인 파일 이식) | ✅ 완료 |
| Phase 15 | 차량관리 API 연동 및 데이터 바인딩 | ✅ 완료 |
| Phase 16 | 품목관리 화면 구현 (WMS_MASTER_0030) | ✅ 완료 |
| Phase 17 | 공통코드 드롭다운 매핑 (품목관리) | 🔲 미완료 |
| Phase 18 | 존&로케이션 관리 화면 구현 (WMS_MASTER_0040) | ✅ 완료 |
| Phase 19 | 거래처관리 화면 구현 (WMS_MASTER_0020) | ✅ 완료 |
| Phase 20 | 입고등록 화면 전체 구현 (WMS_RECEIPT_0010) | ✅ 완료 |
| Phase 21 | 입고예정&확정 화면 전체 구현 (WMS_RECEIPT_0020) | ✅ 완료 |
| Phase 22 | 재고현황 화면 구현 (WMS_STOCK_0010) | 🔲 미완료 |
| Phase 23 | 트랜잭션관리 화면 구현 (WMS_STOCK_0090) | 🔲 미완료 |

> 완료된 Phase 상세 → [`docs/history/frontend_phases.md`](history/frontend_phases.md)

---

## Phase 20 — 입고등록 화면 전체 구현 (WMS_RECEIPT_0010) ✅

### 작업 파일
- `src/pages/Receipt/cj_wms_receipt_0010.tsx`
- `src/pages/Receipt/cj_wms_receipt_0010.module.css`
- `src/api/receipt/receipt_0010Service.ts`

### 구현 내용

#### 화면 구조
- 헤더/디테일 2-tier 구조 (`ReceiptHdrRow` + `ReceiptDtlRow`)
- 신규 시 `getKeyInfo` API로 입고번호 자동 채번 (SEQ 기반)
- 검색 필터: 고객사·센터·입고번호(1행) / 입고구분·매입처·차량번호·입고예정일·수불유형(2행)
- 툴바: 행추가 / 행삭제 / 양식다운로드 / 엑셀업로드

#### 인라인 편집 (디테일 테이블)
| 컬럼 | 편집 방식 |
|------|-----------|
| 품목코드 | text input + ProdSearchPopup 연동 |
| 존 | text input + ZoneSearchPopup 연동 |
| 로케이션 | text input + LocSearchPopup 연동 |
| 입고예정량 | number input |
| 입고일자 | DatePicker (yyyyMMdd 형식) |
| 비고 | text input |

#### 검색 팝업 연동
- `ClientSearchPopup` — 매입처 검색
- `VehicleSearchPopup` — 차량번호 검색
- `ProdSearchPopup` — 품목코드 검색 (행별 `activeProdRowIdx` 관리)
- `ZoneSearchPopup` — 존코드 검색 (행별 `activeZoneRowIdx` 관리)
- `LocSearchPopup` — 로케이션 검색 (행별 `activeLocRowIdx` 관리, 존코드 선행 필수)

#### 행추가 유효성 검증 + 포커싱
- 입고구분 필수 → `filterInCategoryRef` 포커스
- 매입처 필수 → `filterClientCdRef` 포커스
- 차량번호 필수 → `filterVehicleNoRef` 포커스
- 입고예정일 필수 → `filterInExptDateRef` (div wrapper) → `querySelector('input')` 포커스

#### 저장 유효성 검증 + 포커싱
- 디테일 0건 차단
- 고객사/센터 유효성 (srvcList/whList 대조)
- 입고상태 ≠ '0' 차단 (이미 작업된 오더)
- 품목코드 필수, 존코드 필수, 로케이션 필수, 수량 > 0, 입고일자 필수 (cellRef 포커스)
- 품목코드 + 존코드 + 로케이션 중복 행 차단

#### 엑셀 업로드
- `fileInputRef` 방식 + XLSX `readAsArrayBuffer` 파싱
- 컬럼 매핑: `row[0]`srvcCd · `row[1]`whCd · `row[2]`prodCd · `row[3]`inZoneCd · `row[4]`inLocCd · `row[5]`originalQty · `row[6]`lotNo · `row[7]`rmk
- `getCheckList` API 호출 → 검증 결과 chipOk(녹색) / chipError(빨간색) 뱃지 표시
- 업로드 중 버튼 `disabled` + "업로드 중..." 텍스트 표시

#### API 서비스 (`receipt_0010Service.ts`)
| 함수 | 엔드포인트 | 설명 |
|------|-----------|------|
| `getList` | POST `/api/receipt/0010/getList` | 헤더+디테일 조회 |
| `getKeyInfo` | POST `/api/receipt/0010/getKeyInfo` | 입고번호 채번 |
| `saveReceiptList` | POST `/api/receipt/0010/saveReceiptList` | 헤더+디테일 저장 |
| `getCheckList` | POST `/api/receipt/0010/getCheckList` | 엑셀업로드 유효성 검증 |

#### CSS 추가 (module.css)
- `.chipOk` — 초록 배경, 검증 성공 표시
- `.chipError` — 빨간 배경, 검증 실패 표시
- `.chipGroup` — 복수 에러 뱃지 flex 배치

#### 버그 수정 이력
| 증상 | 원인 | 해결 |
|------|------|------|
| 저장 후 조회 시 이전 입고번호로 조회됨 | `setSearchInNo` 비동기로 `handleSearch` 실행 시점에 state 미갱신 | `handleSearch(inNo?: string)` 파라미터 추가, 저장 콜백에서 `handleSearch(newInNo)` 직접 전달 |
| 조회 버튼 클릭 시 Circular JSON 오류 | `onClick={handleSearch}` 시 MouseEvent가 `inNo`에 전달됨 | `onClick={() => handleSearch()}` 래핑으로 수정 |

---

## Phase 21 — 입고예정&확정 화면 전체 구현 (WMS_RECEIPT_0020) ✅

### 작업 파일
- `src/pages/Receipt/cj_wms_receipt_0020.tsx`
- `src/pages/Receipt/cj_wms_receipt_0020.module.css`
- `src/api/receipt/receipt_0020Service.ts`

### 구현 내용

#### API 서비스 (`receipt_0020Service.ts`)
| 함수 | 엔드포인트 | 설명 |
|------|-----------|------|
| `getList` | POST `/api/receipt/0020/getList` | 입고예정 목록 조회 |
| `saveRemarkInfo` | POST `/api/receipt/0020/saveRemarkInfo` | 비고 다건 저장 |
| `saveReceiptConfirm` | POST `/api/receipt/0020/saveReceiptConfirm` | 입고확정 처리 |

#### 인라인 편집
- `cellRefs` Map + `setCellRef(idx, field)` 패턴 — 셀 포커스 제어
- `rowRefs` Map + `setRowRef(idx)` 패턴 — 행 스크롤 제어
- `handleCellChange(idx, field, value)` — 제네릭 셀 값 변경 핸들러
- 예정수량: 숫자만 입력 허용 (`onKeyDown` regex 필터)

#### 비고저장 (`handleSaveRemark`)
- 체크 항목 없음 차단
- srvcCd/whCd/inNo/inExpectedSeq 유효성 검사
- `showConfirm` → `saveRemarkInfo` API → `showAlert` + 재조회

#### 입고확정 (`handleSaveReceiptConfirm`)
- 체크 항목 없음 차단
- forEach + flag 패턴으로 6개 항목 순차 유효성 검증:
  1. STATUS='09' 이미 완료된 항목 차단
  2. 거래처 정보 없음
  3. 품목 정보 없음
  4. 존 정보 없음
  5. 로케이션 정보 없음
  6. 원주문량 > 예정수량 시 미입고사유 필수
- 오류 시 `showAlert` + `rowRefs.scrollIntoView` + `cellRefs.focus` (setTimeout 50ms 타이밍 처리)
- 검증 통과 시 `showConfirm` → `saveReceiptConfirm` API → `showAlert` + 재조회

#### 버그 수정 이력
| 증상 | 원인 | 해결 |
|------|------|------|
| 모든 행이 동시에 수정됨 | `prev.map((v, idx) => idx === idx)` — 외부 idx가 map callback idx에 가려짐 | 콜백 변수를 `i`로 변경 |
| forEach return이 바깥 함수를 종료 못 함 | `return`은 callback만 종료 | flag 변수 패턴(`errorMsg`, `rowIdx`, `focusKey`)으로 변경 |
| 수량 비교 오류 (`'9' > '10'` = true) | 문자열 비교 | `Number()` 래핑으로 숫자 비교 |
| scrollIntoView 타이밍 오류 | popup close 전에 DOM 참조 | `setTimeout(fn, 50)` 내부에서 `rowRefs.current.get()` 재조회 |

---

## Phase 22 — 재고현황 화면 구현 (WMS_STOCK_0010) 🔲

### 작업 파일 (예정)
- `src/pages/Stock/cj_wms_stock_0010.tsx`
- `src/pages/Stock/cj_wms_stock_0010.module.css`
- `src/api/stock/stock_0010Service.ts`

### 구현 예정 범위
- 검색 필터: 고객사·센터·존·로케이션·품목
- 테이블: TB_STOCK_H + TB_STOCK_D JOIN 조회 결과 표시
- 엑셀 다운로드

---

## Phase 23 — 트랜잭션관리 화면 구현 (WMS_STOCK_0090) 🔲

### 작업 파일 (예정)
- `src/pages/Stock/cj_wms_stock_0090.tsx`
- `src/pages/Stock/cj_wms_stock_0090.module.css`
- `src/api/stock/stock_0090Service.ts`

### 구현 예정 범위
- 검색 필터: 고객사·센터·TRAN_TYPE·기간·품목
- 테이블: TB_ITRN 조회 결과 표시 (DP/WD/MV/AJ/TR 구분)
- 엑셀 다운로드

---

## Phase 19 — 거래처관리 화면 구현 (WMS_MASTER_0020) ✅

### 구현 내용

#### 프론트엔드
- `cj_wms_master_0020.tsx` — 조회 · 저장 · 삭제 · 인라인 편집 · 엑셀다운로드 · 양식다운로드 · 엑셀업로드
- `master_0020Service.ts` — getList / saveClient / deleteClient / getCheckList API 연동
- 저장 유효체크: 거래처코드 필수, 사업자번호 10자리, 연락처 정규식, 이메일 정규식 + cellRef 포커스 이동
- 엑셀업로드: fileInputRef 방식 + XLSX 파싱 → getCheckList 백엔드 유효성 검증 → chipOk/chipError 뱃지 표시
- isDirty/isNew 패턴으로 변경 행 추적, 행추가/행삭제(isNew 기준 마지막 행 삭제)
- 공통 컴포넌트 `ClientSearchPopup.tsx` + `ClientSearchPopup.module.css` 신규 구현
  - 거래처코드 · 사용여부 필터 · 조회 버튼 · 더블클릭 선택
  - 팝업 열릴 때 `initialClientCd` prop으로 기존 값 자동 채움 및 즉시 조회
  - Enter 검색 · ESC 닫기 · X 버튼으로만 닫기 (배경 클릭 닫기 비활성화)

#### 백엔드
- `WmsMaster0020Controller.kt` — POST `/getList` · `/saveClientInfo` · `/removeClientInfo` · `/getCheckList`
- `WmsMaster0020Service.kt` — getList / saveClientInfo / removeClientInfo / getCheckList(엑셀 업로드 유효성 검증)
- `WmsMaster0020Mapper.kt` / `wmsMaster0020Mapper.xml` — selectClientList / mergeClientInfo(UPSERT) / deleteClientInfo
- 엑셀 업로드 유효성 검증 규칙: 거래처코드 필수, 사업자번호 10자리, 연락처 정규식, 이메일 정규식

---

## Phase 18 — 존&로케이션 관리 화면 구현 (WMS_MASTER_0040) ✅

### 구현 내용

#### 프론트엔드
- `cj_wms_master_0040.tsx` — 조회 · 저장 · 인라인 편집 · 엑셀다운로드 · 양식다운로드 · 엑셀업로드
- **존 패널 (좌)**: 행추가/삭제, 존코드·존명·사용여부 인라인 편집, 행 클릭 시 로케이션 연동 조회
- **로케이션 패널 (우)**: 행추가/삭제, 로케이션코드·구분코드·사용여부·비고 인라인 편집
- `master_0040Service.ts` — `getZoneList` / `getLocList` / `saveInfo` / `getCheckList` API 연동
- isDirty/isNew 패턴으로 변경 행만 저장 (존·로케이션 개별 추적)
- 엑셀업로드: `<label>` 감싸기 방식(ref 없이) + XLSX 파싱 → `getCheckList` 백엔드 유효성 검증 연동
  - `button + ref.current.click()` 방식은 `onChange` 미발화 이슈 존재 → label 방식으로 해결
- 공통 컴포넌트 `ZoneSearchPopup.tsx` + `ZoneSearchPopup.module.css` 신규 구현
  - 존코드 입력 · 사용여부 필터 · 조회 버튼 · 더블클릭 선택
  - 팝업 열릴 때 `initialZoneCd` prop으로 기존 값 자동 채움 및 즉시 조회
  - Enter 검색 · ESC 닫기 · 배경 클릭 닫기

#### 백엔드
- `commonCodeMapper.xml` — `selectCommonCodeList` 파라미터 `#{sysGrpCd}` → `#{sys_grp_cd}` 변경 (프론트 snake_case 요청 대응)
- `WmsMaster0010Service.kt` — `selectCommonCodeCheck` 호출 파라미터 camelCase(`sysGrpCd`, `sysCd`) 유지 (Kotlin Map 방식)
- `commonService.ts` — `CommCode` 인터페이스 camelCase → snake_case 변경, 공통코드 API 연동 (WM1040: 로케이션구분)

---

## Phase 17 — 공통코드 드롭다운 매핑 (품목관리) 🔲

### 작업 목록
- [ ] 품목카테고리(prodCategory) · 품목형태(prodShape) · 품목타입(prodType) 공통코드 API 연동
- [ ] 조회조건 및 인라인 편집 셀을 `<input>` → `<select>` 드롭다운으로 전환

---

## Phase 16 — 품목관리 화면 구현 (WMS_MASTER_0030) ✅

### 구현 내용
- `cj_wms_master_0030.tsx` — 조회 · 저장 · 삭제 · 인라인 편집 · 엑셀다운로드 · 양식다운로드 · 엑셀업로드
- `master_0030Service.ts` — getList / saveProdInfo / deleteProdInfo / getCheckList API
- 엑셀 업로드: `readAsArrayBuffer` + XLSX 파싱 → getCheckList 백엔드 유효성 검증 연동
- 공통 컴포넌트 `ProdSearchPopup.tsx` + `ProdSearchPopup.module.css` 신규 구현
  - 팝업 열릴 때 조회조건 품목번호 값 자동 채움 및 즉시 조회 (`initialProdCd` prop)
  - Enter 검색 · ESC 닫기 · 배경 클릭 닫기 · 더블클릭 선택
- `commonService.ts` — ProdSearch 인터페이스 · getProdSearchList API 추가

---

## 미완료 항목 (Phase 15 — 차량관리)

### 엑셀 업로드 후 저장 미반영

- 증상: API 200 + "저장되었습니다." 정상이나 DB 신규 행 없음
- `handleSave`에서 `srvcCd: v.srvcCd ? v.srvcCd : searchSrvcCd` 로 엑셀값 우선 사용 중
- 재개 시 확인사항:
  1. 브라우저 Network 탭 saveVehicle 요청 페이로드 확인 (srvcCd/whCd 값)
  2. `SELECT * FROM WMS.TB_VEHICLE ORDER BY UPD_DATE DESC LIMIT 10` — UPDATE 여부 확인
