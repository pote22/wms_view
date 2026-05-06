# WMS 프론트엔드 완료 Phase 상세 (아카이브)

> 메인 파일 → [`../implementation_plan.md`](../implementation_plan.md)

---

## Phase 1 — 화면 구조 개편 ✅

- `Container.tsx`: Header + Sidebar + 콘텐츠 영역 조립 담당
- `Main.tsx`: 공지사항 + 대시보드 통합 메인 화면
- 로고 클릭 시 `activeSideMenu = ""` 으로 리셋 → 메인 대시보드 노출
- PAGE_MAP으로 사이드메뉴 키와 컴포넌트를 선언적으로 관리

---

## Phase 2 — 로그인 UI 개선 ✅

**파일**: `src/pages/Login/Login.tsx`

- 아이디/비밀번호 미입력 시 레이어 팝업 메시지 출력
- 팝업 닫힌 후 해당 입력 필드로 포커스 자동 이동 (`focusAfterPopup` ref)
- 비밀번호 표시/숨기기 토글 버튼 추가

---

## Phase 3 — 로그인 API 연동 및 인터페이스 동기화 ✅

**파일**: `src/api/user/loginService.ts`

- `LoginResponse.data` 인터페이스를 TB_USER 컬럼명과 동기화
- Axios 공통 인터셉터에서 401 처리 (로그인 실패 vs 토큰 만료 분기)

---

## Phase 4 — localStorage → sessionStorage 전환 ✅

| 파일 | 변경 내용 |
|------|-----------|
| `src/pages/Login/Login.tsx` | `localStorage.setItem` → `sessionStorage.setItem` |
| `src/api/common/trasaction.ts` | `localStorage.getItem/clear` → `sessionStorage.getItem/clear` |
| `src/utils/auth.ts` | `localStorage.getItem` → `sessionStorage.getItem` |

---

## Phase 5 — JWT 디코딩 유틸 추가 ✅

**파일**: `src/utils/auth.ts`

```typescript
export const getTokenPayload = () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const raw = JSON.parse(jsonPayload);
    return { ...raw, userId: raw.sub };
}
```

- `atob()` Latin-1 디코딩 한글 깨짐 → `decodeURIComponent` + 퍼센트 인코딩으로 UTF-8 복원
- `sub` → `userId` 별칭 추가 (프론트에서 `payload.userId`로 일관 접근)

---

## Phase 6 — 헤더 사용자 정보 연동 ✅

**파일**: `src/components/Header/Header.tsx`

- JWT payload에서 사용자 정보 추출하여 헤더 UI 표시
- 로그아웃: `sessionStorage.clear()` 후 `/login`으로 리다이렉트
- role → 레이블 변환: ADMIN→관리자, WMS 포함→담당자, CUSTOMER 포함→사용자

---

## Phase 7 — 인증 보호 라우팅 (PrivateRoute) ✅

**파일**: `src/components/PrivateRoute.tsx`

```typescript
const PrivateRoute: React.FC<Props> = ({ children }) => {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return <>{children}</>;
};
```

- `isAuthenticated()`: `payload.exp * 1000 > Date.now()` 토큰 만료 체크

---

## Phase 8 — 메뉴 화면 구조 개편 ✅

### 메뉴 구성 (PAGE_MAP 키)

| 탭 | 그룹 | 메뉴 | 키 |
|----|------|------|----|
| 홈 | 홈 | 공지사항 | `notice` |
| 보관관리 | 마스터 관리 | 차량관리 | `car` |
| 보관관리 | 마스터 관리 | 거래처관리 | `customer` |
| 보관관리 | 마스터 관리 | 품번관리 | `items` |
| 보관관리 | 마스터 관리 | 존&로케이션관리 | `zone` |
| 보관관리 | 재고관리 | 재고현황 | `stock-list` |
| 보관관리 | 재고관리 | 트랜잭션관리 | `transaction` |
| 공통관리 | 사용자관리 | 센터고객관리 | `warehouse` |
| 공통관리 | 사용자관리 | 회원관리 | `user-manage` |

---

## Phase 9 — 공통관리 탭 관리자 전용 제어 ✅

```typescript
const isAdmin = payload?.adminYn === 'Y';
{isAdmin && <button onClick={() => onTabChange("common")}>공통관리</button>}
```

---

## Phase 10 — 메인화면 고객사&센터 selectbox API 연동 ✅

**파일**: `src/api/common/commonService.ts`, `src/pages/Container.tsx`

- `UserAuthSrvcWh` 인터페이스 필드명 snake_case (`srvc_cd`, `wh_cd` 등)
- 선택값 `localStorage`에 `wms_srvc_cd_{userId}` 키로 저장 (재방문 시 복원)
- 고객사 변경 시 센터를 해당 고객사 첫 번째 항목으로 자동 리셋

---

## Phase 11 — 공지사항 화면 UI 리팩토링 ✅

- 좌우 분할(Split-Screen): 좌측 목록 35%, 우측 상세 65%
- 독립 스크롤, Empty State, 다건 체크박스 삭제, 읽기전용/편집 모드 전환

---

## Phase 11.2 — UI/UX 기능 고도화 ✅

- Empty State: 데이터 없을 때 중앙에 안내 메시지
- `checkedIds` 상태로 다건 삭제 관리
- `isEditing` 상태에 따른 입력 필드 `readOnly` 제어

---

## Phase 11.3 — 리치 텍스트 에디터 (Tiptap) 도입 ✅

- 라이브러리: `@tiptap/react`, `@tiptap/starter-kit`
- React 19 호환성 우수, 헤드리스 구조로 커스텀 툴바 자유도 높음
- 툴바: 굵게(toggleBold), 기울임(toggleItalic), 번호목록, 글머리목록
- `isEditing` 변경 시 `editor.setEditable(isEditing)` 동기화

---

## Phase 13 — 공통 레이어 팝업 컴포넌트 도입 ✅

**파일**: `src/components/common/Popup.tsx`

```typescript
interface PopupProps {
  isOpen: boolean; message: string;
  type?: 'alert' | 'confirm';
  onConfirm: () => void; onCancel?: () => void;
}
```

- `window.alert()` / `window.confirm()` 전면 교체
- 팝업 상태 통합 관리: `popup` state + `closePopup` 함수

---

## Phase 14 — 차량관리 화면 UI 구현 ✅

**파일**: `src/pages/Master/cj_wms_master_0010.tsx`

- 조회 영역: 센터(Select), 차량번호(Input), 사용여부(Select)
- 액션 툴바: 조회/저장/삭제/엑셀 + 행추가/행삭제/업로드 버튼
- 데이터 그리드: 11개 컬럼 테이블, 체크박스 행 선택
- 사용여부/업로드 상태 배지 스타일

---

## Phase 15 — 차량관리 API 연동 및 데이터 바인딩 ✅

**작업일자**: 2026-04-29 ~ 2026-04-30

### 주요 구현

**체크박스 행 선택**
- `VehicleRow`에 `chk: string` ('0'/'1') 필드 포함
- 전체선택: `prev.map(v => ({ ...v, chk: checked ? '1' : '0' }))`

**엑셀 업로드**
- `readAsArrayBuffer` + `XLSX.read(..., { type: "array" })`
- 업로드 시 기존 목록 전체 초기화 (`setVehicleIds(newVehicles)`)
- `uploadStatus: '검증중...'` → 백엔드 `getCheckList` 호출 → "OK" 또는 오류 메시지

**톤급 selectbox**
- 마운트 시 `getTonList` API로 톤급 코드 목록 로드 후 `<select>` 렌더링

**저장 유효성 검사 3단계**
1. vehicleNo 필수
2. tonClsCd 목록값 여부
3. hpNo 포맷 체크 (`^0\d{1,2}-\d{3,4}-\d{4}$`)
- 오류 시 해당 셀 포커스 복원 (`cellRefs` Map + `showAlert onClose` 콜백)

**showAlert onClose 패턴**
```typescript
// usePopup.ts
const showAlert = (message: string, onClose?: () => void) =>
    setPopup({ ..., onConfirm: () => { closePopup(); if (onClose) setTimeout(onClose, 0); } });

// 사용
showAlert("차량번호를 입력하세요.", () => el?.focus());
```

**hydration 오류 수정**
- `<colgroup>` 내부 JSX 주석 `{/* */}` 전체 제거 (텍스트 노드 생성 → 규칙 위반)

### 미완료 항목
- 엑셀 업로드 저장 미반영: API 200 + "저장되었습니다." 정상이나 DB 신규 행 없음
  - `handleSave`에서 `srvcCd: v.srvcCd ? v.srvcCd : searchSrvcCd` 로 엑셀값 우선 사용 중
  - 재개 시 Network 탭 페이로드 + `SELECT * FROM WMS.TB_VEHICLE ORDER BY UPD_DATE DESC LIMIT 10`
