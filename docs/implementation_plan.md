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
| Phase 12 | 공지사항 API 연동 및 데이터 바인딩 | 🔲 미완료 |
| Phase 13 | 공통 레이어 팝업 컴포넌트 도입 (alert/confirm 통합) | ✅ 완료 |
| Phase 14 | 차량관리 화면 UI 구현 (디자인 파일 이식) | ✅ 완료 |
| Phase 15 | 차량관리 API 연동 및 데이터 바인딩 | 🔲 미완료 |

---

## Phase 1 — 화면 구조 개편 ✅

### 변경 내용
- `Container.tsx` (pages 최상위): Header + Sidebar + 콘텐츠 영역 조립 담당
- `Main.tsx` (pages/Main): 공지사항 + 대시보드 통합 메인 화면
- 로고 클릭 시 `activeSideMenu = ""` 으로 리셋 → 메인 대시보드 노출
- PAGE_MAP으로 사이드메뉴 키와 컴포넌트를 선언적으로 관리

---

## Phase 2 — 로그인 UI 개선 ✅

**파일**: `src/pages/Login/Login.tsx`

### 변경 내용
- 아이디/비밀번호 미입력 시 레이어 팝업 메시지 출력
- 팝업 닫힌 후 해당 입력 필드로 포커스 자동 이동 (`focusAfterPopup` ref)
- 비밀번호 표시/숨기기 토글 버튼 추가

---

## Phase 3 — 로그인 API 연동 및 인터페이스 동기화 ✅

**파일**: `src/api/user/loginService.ts`

### 변경 내용
- `LoginResponse.data` 인터페이스를 TB_USER 컬럼명과 동기화
  - `userId`, `userNm`, `adminYn`, `userSts`, `useYn`, `role`, `profileImgUrl`
- Axios 공통 인터셉터에서 401 처리 (로그인 실패 vs 토큰 만료 분기)

---

## Phase 4 — localStorage → sessionStorage 전환 ✅

### 변경 파일 및 내용

| 파일 | 변경 내용 |
|------|-----------|
| `src/pages/Login/Login.tsx` | `localStorage.setItem` → `sessionStorage.setItem` |
| `src/api/common/trasaction.ts` | `localStorage.getItem` → `sessionStorage.getItem` |
| `src/api/common/trasaction.ts` | `localStorage.clear()` → `sessionStorage.clear()` |
| `src/utils/auth.ts` | `localStorage.getItem` → `sessionStorage.getItem` |

### 개선 효과
- 브라우저/탭 종료 시 토큰 자동 만료 → 보안 강화
- `userInfo` 별도 저장 제거 — 토큰 디코딩으로 대체하여 중복 제거

---

## Phase 5 — JWT 디코딩 유틸 추가 ✅

**파일**: `src/utils/auth.ts`

### 구현 내용
```typescript
export const getTokenPayload = () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return null;

    // base64url → base64 변환 (JWT는 base64url 인코딩 사용)
    const base64 = token.split(".")[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // UTF-8 한글 깨짐 방지: atob → 바이트 배열 → decodeURIComponent
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );

    // sub → userId 별칭 추가 (프론트에서 payload.userId로 일관되게 접근)
    const raw = JSON.parse(jsonPayload);
    return { ...raw, userId: raw.sub };
    // 반환 예시: { sub: "admin01", userId: "admin01", userNm: "홍길동", adminYn: "Y", role: "ADMIN", exp: ... }
}
```

### 활용 방법
- `getTokenPayload()?.userId` — 사용자 ID (sub 별칭)
- `getTokenPayload()?.userNm` — 사용자 이름 표시
- `getTokenPayload()?.adminYn === 'Y'` — 관리자 메뉴 노출 분기
- `getTokenPayload()?.exp` — 만료 시간 체크

### 주의사항
- `atob()`는 Latin-1 기준 디코딩 → 한글 멀티바이트 깨짐 발생
- `decodeURIComponent` + 퍼센트 인코딩 변환으로 UTF-8 복원 처리

---

## Phase 6 — 헤더 사용자 정보 연동 ✅

> JWT payload에서 사용자 정보를 읽어 헤더 UI에 표시하고 로그아웃 기능을 연결합니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/components/Header/Header.tsx` | JWT payload 기반 사용자 정보 표시, 로그아웃 기능 연결 |

### 구현 내용

```typescript
const Header: React.FC<HeaderProps> = ({ ... }) => {
    // 토큰에서 사용자 정보 가져오기 (컴포넌트 내부에서 실행 — 재로그인 시 갱신됨)
    const payload  = getTokenPayload();
    const userId   = payload?.userId ?? "";
    const userNm   = payload?.userNm ?? "사용자";
    const role     = payload?.role   ?? "";
    const initial  = userNm.charAt(0);  // 아바타 이니셜
    const navigate = useNavigate();

    // 로그아웃: sessionStorage 초기화 후 로그인 화면으로 이동
    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login", { replace: true });
    }

    // role 값 → 표시 레이블 변환
    const getAuthLabel = (role: string): string => {
        if (role === "ADMIN")           return "관리자";
        if (role.includes("WMS"))       return "담당자";
        if (role.includes("CUSTOMER"))  return "사용자";
        return "";
    }
    ...
    <div className={styles.userAvatar}>{initial}</div>
    <span className={styles.userName}>{userNm}</span>
    <span className={styles.userRole}>{getAuthLabel(role)}</span>
    <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
}
```

### role → 레이블 매핑 규칙
| role 값 | 표시 레이블 |
|---------|------------|
| `ADMIN` | 관리자 |
| `WMS` 포함 | 담당자 |
| `CUSTOMER` 포함 | 사용자 |
| 그 외 | 빈 값 |

### 미적용 항목 (메인 화면 작업 시 함께 진행)
- `Container.tsx` `isAdmin` 플래그 기반 공통관리 탭 노출 제어

---

## Phase 7 — 인증 보호 라우팅 (PrivateRoute) ✅

> 로그인하지 않은 사용자가 `/main`으로 직접 접근하면 `/login`으로 리다이렉트합니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/utils/auth.ts` | `isAuthenticated()` 함수 추가 |
| `src/components/PrivateRoute.tsx` | 신규 생성 |
| `src/App.tsx` | `/main` 경로에 PrivateRoute 적용 |

### 구현 내용

**`src/utils/auth.ts` — isAuthenticated 추가**
```typescript
export const isAuthenticated = (): boolean => {
    const payload = getTokenPayload();
    if (!payload) return false;
    // exp는 초 단위, Date.now()는 밀리초 단위
    return payload.exp * 1000 > Date.now();
}
```

**`src/components/PrivateRoute.tsx`**
```typescript
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

interface Props {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

export default PrivateRoute;
```

**`src/App.tsx` — PrivateRoute 적용**
```typescript
<Route path="/main" element={
  <PrivateRoute>
    <Container />
  </PrivateRoute>
} />
```

---

## Phase 8 — 메뉴 화면 구조 개편 ✅

> 기존 메뉴 구성을 WMS 업무 흐름에 맞게 전면 재편하고 stub 페이지로 구성합니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/pages/Container.tsx` | 메뉴 구조 전면 재편, payload/isAdmin 컴포넌트 내부로 이동 |
| `src/pages/Home/cj_wms_home_0010.tsx` | 신규 — 공지사항 (stub) |
| `src/pages/master/cj_wms_master_0010.tsx` | 신규 — 차량관리 (stub) |
| `src/pages/master/cj_wms_master_0020.tsx` | 신규 — 거래처관리 (stub) |
| `src/pages/master/cj_wms_master_0030.tsx` | 신규 — 품목관리 (stub) |
| `src/pages/master/cj_wms_master_0040.tsx` | 신규 — 존&로케이션관리 (stub) |
| `src/pages/Order/cj_wms_order_0030.tsx` | 신규 — 피킹관리 (stub) |
| `src/pages/Order/cj_wms_order_0040.tsx` | 신규 — 출고관리 (stub) |
| `src/pages/Stock/cj_wms_stock_0010.tsx` | 신규 — 재고현황 (stub) |
| `src/pages/Stock/cj_wms_stock_0090.tsx` | 신규 — 트랜잭션관리 (stub) |

### 메뉴 구성

| 탭 | 그룹 | 메뉴 | PAGE_MAP 키 |
|----|------|------|------------|
| 홈 | 홈 | 공지사항 | `notice` |
| 보관관리 | 마스터 관리 | 차량관리 | `car` |
| 보관관리 | 마스터 관리 | 거래처관리 | `customer` |
| 보관관리 | 마스터 관리 | 품번관리 | `items` |
| 보관관리 | 마스터 관리 | 존&로케이션관리 | `zone` |
| 보관관리 | 입고관리 | 입고등록 | `receipt-register` |
| 보관관리 | 입고관리 | 입고예정&확정 | `receipt-confirm` |
| 보관관리 | 출고관리 | 출고등록 | `order-register` |
| 보관관리 | 출고관리 | 출고/할당 관리 | `order-allocate` |
| 보관관리 | 출고관리 | 피킹관리 | `order-pick` |
| 보관관리 | 출고관리 | 출고관리 | `order-pack` |
| 보관관리 | 재고관리 | 재고현황 | `stock-list` |
| 보관관리 | 재고관리 | 트랜잭션관리 | `transaction` |
| 공통관리 | 사용자관리 | 센터고객관리 | `warehouse` |
| 공통관리 | 사용자관리 | 회원관리 | `user-manage` |

---

## Phase 9 — 공통관리 탭 관리자 전용 제어 ✅

> 관리자(`adminYn === 'Y'`)만 공통관리 탭을 볼 수 있도록 제어합니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/components/Header/Header.tsx` | `isAdmin` 변수 추가, 공통관리 탭 조건부 렌더링 |
| `src/pages/Container.tsx` | 미사용 `payload` / `isAdmin` 제거 |

### 구현 내용

**`Header.tsx` — isAdmin 추가 및 탭 제어**
```typescript
const isAdmin = payload?.adminYn === 'Y';

{isAdmin && (
    <button
        className={`${styles.mainTab} ${activeMainTab === "common" ? styles.mainTabActive : ""}`}
        onClick={() => onTabChange("common")}
    >
        공통관리
    </button>
)}
```

### 접근 제어 범위
- 탭 자체가 숨겨지므로 비관리자는 공통관리 진입 불가
- 현재 메뉴가 상태값(`activeSideMenu`)으로 관리되어 URL 직접 접근 불가
- 추후 독립 URL 라우팅 구조로 변경 시 PrivateRoute 수준의 추가 보호 필요

---

## Phase 10 — 메인화면 고객사&센터 selectbox API 연동 및 localStorage 저장 ✅

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/api/common/commonService.ts` | 신규 — 고객사/센터 조회 API 서비스, 인터페이스 정의 |
| `src/pages/Container.tsx` | API 호출, 상태 관리, localStorage 저장/복원 로직 추가 |
| `src/components/Header/Header.tsx` | HeaderProps 인터페이스 변경, 드롭다운 JSX 수정 |

### 구현 내용

**`commonService.ts` — 인터페이스 및 API 함수**
```typescript
export interface UserAuthSrvcWh {
    srvc_cd: string;  // resultType="map" 사용 시 mapUnderscoreToCamelCase 미적용
    srvc_nm: string;  // PostgreSQL이 소문자 snake_case로 반환
    wh_cd: string;
    wh_nm: string;
    base_yn: string;
}

export const getUserAuthSrvcWhList = (
    data: UserSrvcWhRequest,
    onSuccess: (res: UserSrvcWhResponse) => void,
    onError: (err: any) => void
) => request<UserSrvcWhRequest, UserSrvcWhResponse>({ config: { url: `${API_USER_ROOT}/getUserAuthWhList`, method: 'POST', data }, onSuccess, onError });
```

**`Container.tsx` — 마운트 시 API 호출 및 기본값 세팅**
```typescript
const STORAGE_KEY_SRVC = `wms_srvc_cd_${payload?.userId}`;
const STORAGE_KEY_WH   = `wms_wh_cd_${payload?.userId}`;

useEffect(() => {
    getUserAuthSrvcWhList({ userId: payload.userId }, (res) => {
        const list = res?.data ?? [];
        setAuthList(list);
        const savedSrvc = localStorage.getItem(STORAGE_KEY_SRVC);
        const savedWh   = localStorage.getItem(STORAGE_KEY_WH);
        const base      = list.find(item => item.base_yn === 'Y') ?? list[0];
        setSelectSrvcCd(savedSrvc ?? base?.srvc_cd ?? "");
        setSelectWhCd(savedWh   ?? base?.wh_cd   ?? "");
    }, (err) => console.error('고객사/센터 목록 조회 실패', err));
}, []);
```

**localStorage 저장 — 고객사/센터 변경 핸들러**
```typescript
const handleSrvcCdChange = (srvcCd: string) => {
    setSelectSrvcCd(srvcCd);
    localStorage.setItem(STORAGE_KEY_SRVC, srvcCd);
    const firstWh = authList.find(v => v.srvc_cd === srvcCd);
    const whCd = firstWh?.wh_cd ?? "";
    setSelectWhCd(whCd);
    localStorage.setItem(STORAGE_KEY_WH, whCd);
};

const handleWhCdChange = (whCd: string) => {
    setSelectWhCd(whCd);
    localStorage.setItem(STORAGE_KEY_WH, whCd);
};
```

### 주요 설계 결정

| 항목 | 결정 | 이유 |
|------|------|------|
| 인터페이스 필드명 | snake_case (`srvc_cd`) | MyBatis `resultType="map"` + PostgreSQL이 소문자 반환 |
| 선택값 저장 위치 | localStorage | DB 저장 방식 대비 구현 간단, 브라우저 재시작 후에도 유지 |
| localStorage 키 | `wms_srvc_cd_{userId}` | 같은 브라우저에서 다른 계정 사용 시 독립 저장 보장 |
| 기본값 우선순위 | localStorage 저장값 → base_yn='Y' 항목 → 첫 번째 항목 | 재방문 시 이전 선택 복원 우선 |
| 고객사 변경 시 센터 | 해당 고객사의 첫 번째 센터로 자동 리셋 | 고객사 변경 후 이전 센터 코드 유지 시 불일치 방지 |

---

## Phase 11 — 공지사항 화면 UI 리팩토링 (좌우 분할 구조) ✅

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/pages/Home/cj_wms_home_0010.tsx` | 전면 리팩토링 — 좌우 분할 구조 적용 |
| `src/pages/Home/cj_wms_home_0010.module.css` | 레이아웃 CSS 전면 재작성 |

> 기존의 상하 분할 구조를 좌우 분할(Split-Screen) 구조로 전면 리팩토링하여 공간 효율성과 사용성을 극대화합니다.

### 주요 변경 사항

#### 1. 레이아웃 구조 변경
- **가로 분할 적용**: 좌측(목록) 35%, 우측(상세) 65% 비율의 Flex 레이아웃 구성.
- **독립 스크롤 구현**: 전체 화면 높이를 고정하고 목록 영역과 상세 영역이 각각 독립적으로 스크롤되도록 CSS 최적화.

#### 2. 컴포넌트 세부 디자인
- **좌측 목록 (Master)**: 테이블 형태에서 카드 또는 슬림 리스트 아이템 디자인으로 변경하여 좁은 너비에서도 가시성 확보.
- **우측 상세 (Detail)**: 넓어진 가로 공간을 활용하여 제목 입력란, 에디터 영역, 첨부파일 섹션을 재배치.

#### 3. 사용자 경험(UX) 개선
- **시선 이동 최적화**: 목록 선택 시 우측 상세 내용이 즉각 반영되어 탐색 속도 향상.
- **대화면 대응**: 와이드 모니터의 남는 공간을 효율적으로 사용.

### UI 구성 요소 (기존 사양 유지 및 발전)
- **상용 액션 버튼**: 조회, 신규, 저장, 삭제 버튼을 리스트 또는 상세 영역 상단에 적절히 배치.
- **파일 관리**: 우측 상세 영역 하단 또는 사이드에 첨부파일 리스트 배치.

---

## Phase 11.2 — UI/UX 기능 고도화 ✅

> 공지사항 관리의 편의성과 데이터 무결성을 위해 목록 제어 기능 및 편집 모드 전환 로직을 강화합니다.

### 주요 변경 사항

#### 1. 리스트 상태 제어 (Empty State)
- **개념**: 데이터가 없을 때의 화면 처리.
- **구현**: 목록 영역 중앙에 "등록된 공지사항이 없습니다" 메시지 및 아이콘 표시.

#### 2. 다건 삭제 기능 (Bulk Action)
- **UI**: 리스트 각 항목 및 전체 선택 체크박스 추가.
- **로직**: `checkedIds` 상태를 통해 선택된 항목들을 관리하고, '삭제' 버튼 클릭 시 일괄 처리 인터랙션 제공.

#### 3. 읽기 전용/편집 모드 전환 (Read-Only Toggle)
- **구현**: `isEditing` 상태에 따른 입력 필드(`input`, `textarea`)의 `readOnly` 속성 제어.
- **인터랙션**:
    - **신규 클릭**: `isEditing = true`, 폼 초기화.
    - **목록 클릭**: `isEditing = false`, 상세 데이터 조회 전용.
    - **수정 클릭**: `isEditing = true`, 기존 데이터 수정 가능 상태로 전환.
- **저장 로직 연동**: 저장 시 ID 유무에 따라 [생성] 또는 [수정]으로 백엔드 통신(Phase 12) 준비.

---

## Phase 11.3 — 리치 텍스트 에디터 (Tiptap) 도입 ✅

> React-Quill 대신 Tiptap을 채택하여 공지사항 본문 편집기를 구현합니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/pages/Home/cj_wms_home_0010.tsx` | Tiptap 에디터 통합 |

### 채택 라이브러리

| 항목 | 내용 |
|------|------|
| 라이브러리 | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-bold`, `@tiptap/extension-italic` |
| 선택 이유 | React-Quill 대비 React 19 호환성 우수, 헤드리스 구조로 커스텀 툴바 자유도 높음 |

### 구현 내용

```typescript
const editor = useEditor({
    extensions: [StarterKit, Bold, Italic],
    content: "...",
    editable: false,  // 초기 읽기 전용
});

// isEditing 변경 시 editable 상태 동기화
useEffect(() => {
    if (editor) editor.setEditable(isEditing);
}, [isEditing, editor]);
```

### 툴바 기능

| 버튼 | 기능 | Tiptap 명령 |
|------|------|-------------|
| format_bold | 굵게 | `toggleBold()` |
| format_italic | 기울임 | `toggleItalic()` |
| format_list_numbered | 번호 목록 | `toggleOrderedList()` |
| format_list_bulleted | 글머리 목록 | `toggleBulletList()` |

### 파일 첨부 기능

- 최대 20MB 제한 (초과 시 alert)
- 다중 파일 첨부 가능
- 편집 모드에서만 첨부/삭제 가능
- 파일 타입별 아이콘 분기 (pdf / image / 기타)

---

## Phase 13 — 공통 레이어 팝업 컴포넌트 도입 ✅

> `window.alert()` / `window.confirm()` 을 제거하고 공통 레이어 팝업으로 일원화합니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/components/common/Popup.tsx` | 신규 — alert/confirm 공통 팝업 컴포넌트 |
| `src/components/common/Popup.module.css` | 신규 — 팝업 스타일 |
| `src/pages/Home/cj_wms_home_0010.tsx` | window.alert/confirm → Popup 컴포넌트로 교체 |

### 컴포넌트 인터페이스

```typescript
interface PopupProps {
  isOpen: boolean;
  message: string;
  type?: 'alert' | 'confirm';  // 기본값: 'alert'
  onConfirm: () => void;
  onCancel?: () => void;
}
```

### 사용 방식 (팝업 상태 통합 관리)

```typescript
const [popup, setPopup] = useState({
  isOpen: false, type: 'alert' as 'alert' | 'confirm',
  message: '', onConfirm: () => {}
});
const closePopup = () => setPopup(p => ({ ...p, isOpen: false }));
```

### 교체 대상

| 위치 | 기존 | 변경 |
|------|------|------|
| `handleDelete` — 미선택 시 | `window.alert(...)` | Popup `type='alert'` |
| `handleDelete` — 삭제 확인 | `window.confirm(...)` | Popup `type='confirm'` |
| `handleFileChange` — 용량 초과 | `window.alert(...)` | Popup `type='alert'` |

---

## Phase 12 — 공지사항 API 연동 및 데이터 바인딩 🔲

> 현재 Mock 데이터로 동작 중인 공지사항 화면을 백엔드 API와 연동합니다.

### 작업 목록

- [ ] 공지사항 목록 조회 API 연동 (`TB_BOARD` 조회)
- [ ] 공지사항 상세 조회 API 연동
- [ ] 공지사항 저장 API 연동 (신규: INSERT / 수정: UPDATE)
- [ ] 공지사항 삭제 API 연동 (단건 / 다건)
- [ ] 첨부파일 업로드/다운로드 API 연동 (`TB_COMM_BOARD_FILE`)
- [ ] Mock 데이터 → 실제 API 응답으로 교체

### 연관 DB 테이블

| 테이블 | 설명 |
|--------|------|
| `TB_BOARD` | 게시판 (BOARD_ID, CONTENT, VW_CNT, BOARD_TYPE, USER_ID, USE_YN) |
| `TB_COMM_BOARD_FILE` | 게시판 첨부파일 (FILE_ID, BOARD_ID, FILE_NM, FILE_SIZE, FILE_PATH) |

---

## Phase 14 — 차량관리 화면 UI 구현 ✅

> `cj_wms_master_0010_design.html` 파일을 분석하여 마스터 관리용 차량관리 화면을 구현하였습니다.

### 변경 파일

| 파일 | 작업 |
|------|------|
| `src/pages/Master/cj_wms_master_0010.tsx` | UI 컴포넌트 구현 및 Mock 데이터 연동 |
| `src/pages/Master/cj_wms_master_0010.module.css` | Tailwind 스타일의 모듈 CSS화 |

### 주요 구현 내용

#### 1. 마스터-그리드 레이아웃
- **조회 영역**: 센터(Select), 차량번호(Input), 사용여부(Select) 필터 구성.
- **액션 툴바**: 조회/저장/삭제/엑셀 버튼 및 행추가/행삭제/업로드 기능 버튼 배치.
- **데이터 그리드**: 11개 주요 정보를 포함한 테이블 레이아웃 및 Mock 데이터(5건) 바인딩.

#### 2. 디자인 고도화
- **Glassmorphism**: 하단 "Live System Status" 영역에 `backdrop-filter: blur`를 적용한 반투명 플로팅 도크(Dock) 구현.
- **애니메이션**: 실시간 상태를 나타내는 Ping 애니메이션 효과 적용.
- **시각적 배지**: 사용여부(Y/N) 및 업로드 상태에 따른 가독성 높은 배지 스타일 적용.

## Phase 15 — 차량관리 API 연동 및 데이터 바인딩 🔲

> 차량마스터 정보를 실제 DB와 연동하여 CRUD 기능을 완성합니다.

### 작업 목록
- [ ] 차량 목록 조회 API 연동
- [ ] 차량 정보 저장/수정 API 연동
- [ ] 선택 차량 일괄 삭제 API 연동
- [ ] 엑셀 업로드/다운로드 로직 연동
