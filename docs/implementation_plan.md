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
