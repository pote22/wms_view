# WMS 구현 계획서

---

## 프로젝트 개요

### Frontend (wms_view)

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19 + TypeScript + Vite |
| 라우팅 | react-router-dom v7 |
| HTTP 클라이언트 | axios |
| 스타일 관리 | CSS 모듈별 분리 (`src/css/<페이지명>/`) |

### Backend (wms)

| 항목 | 내용 |
|------|------|
| 언어 | Kotlin |
| 프레임워크 | Spring Boot 3.x |
| ORM | MyBatis |
| DB | PostgreSQL |
| 빌드 도구 | Gradle |

---

## 디렉토리 구조

### Frontend

```
wms_view/src/
├── App.tsx                          # 라우터 진입점
├── main.tsx
├── assets/
├── api/
│   ├── Common/
│   │   └── trasaction.ts            # axios 공통 설정 (baseURL, timeout, headers)
│   └── Login/
│       └── LoginApi.ts              # 로그인 API 함수
├── css/
│   ├── index.css                    # 전역 스타일
│   ├── App.css
│   └── Login/
│       └── Login.css                # 로그인 페이지 전용 스타일
└── pages/
    └── Login/
        └── Login.tsx                # 로그인 페이지 컴포넌트
```

### Backend

```
wms/src/main/kotlin/com/cjlogistics/wms/
├── WmsApplication.kt
├── config/
│   └── WebConfig.kt                 # CORS 설정
└── user/
    ├── controller/
    │   └── UserController.kt        # API 엔드포인트
    ├── service/
    │   └── UserService.kt           # 비즈니스 로직
    ├── mapper/
    │   └── UserMapper.kt            # MyBatis Mapper 인터페이스
    └── dto/
        ├── LoginRequest.kt          # 요청 데이터 구조
        └── LoginResponse.kt         # 응답 데이터 구조

wms/src/main/resources/
├── application.yml
└── mapper/
    └── UserMapper.xml               # SQL 쿼리
```

---

## 라우팅 구조

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | — | `/login` 으로 자동 리다이렉트 |
| `/login` | `Login` | 로그인 페이지 |

> 신규 페이지 추가 시 `App.tsx`의 `<Routes>` 블록에 `<Route>` 항목을 추가합니다.

---

## API 구조

### Frontend API 통신 방식
- **공통 axios 설정**: `src/api/common/trasaction.ts` — baseURL, timeout, Content-Type 관리
- **공통 요청 처리**: `request()` 래퍼 함수가 `resultcode` 기반으로 성공/실패를 분기 — 페이지 컴포넌트에서 `try-catch` / `async-await` 불필요
- **API 파일 분리 기준**: 화면 단위가 아닌 **도메인(기능) 단위**로 파일 분리

| 파일 | 담당 도메인 |
|------|------------|
| `login/loginApi.ts` | 로그인 |
| `inventoryApi.ts` | 재고 CRUD (추후 추가) |
| `orderApi.ts` | 주문 CRUD (추후 추가) |
| `warehouseApi.ts` | 창고 CRUD (추후 추가) |

#### 백엔드 공통 응답 구조

모든 API 응답은 아래 구조를 따릅니다.

```json
// 성공
{ "resultcode": "0000", "resultMsg": "로그인 성공", "data": { "token": "...", "userId": "user01", "usernm": "홍길동" } }

// 실패
{ "resultcode": "9999", "resultMsg": "아이디 또는 비밀번호가 올바르지 않습니다.", "data": null }
```

| 필드 | 설명 |
|------|------|
| `resultcode` | 처리 결과 코드 (`"0000"` = 성공, 그 외 = 실패) |
| `resultMsg` | 사용자에게 표시할 메시지 |
| `data` | 실제 비즈니스 데이터 (실패 시 `null`) |

#### API 사용 패턴

**1. API 파일 작성 (`src/api/xxx/xxxApi.ts`)**
```typescript
import transaction, { request } from "../common/trasaction.ts";
import type { ApiResponse } from "../common/trasaction.ts";

interface XxxRequest  { /* 요청 필드 */ }
interface XxxResponse { /* 응답 필드 */ }

export const someApi = (
    data     : XxxRequest,
    onSuccess: (data: XxxResponse) => void,
    onError  : (message: string) => void
) => {
    request<XxxResponse>(transaction.post<ApiResponse<XxxResponse>>("/api/xxx/yyy", data), onSuccess, onError);
};
```

**2. 페이지 컴포넌트에서 사용**
```typescript
someApi(
    { ...요청데이터 },
    (data) => {
        // resultcode === "0000" 일 때만 호출 (data는 XxxResponse 타입)
    },
    (message) => {
        // resultcode !== "0000" 또는 네트워크 오류 → resultMsg가 message로 전달
        setPopupMessage(message);
    }
);
```

| 역할 | 위치 | 책임 |
|------|------|------|
| resultcode 분기 및 메시지 추출 | `trasaction.ts` | `resultcode === "0000"` 체크, `resultMsg` 파싱 |
| API 엔드포인트 | `xxxApi.ts` | URL, Request/Response 타입 정의 |
| UI 처리 | `Page.tsx` | 성공/실패 후 화면 처리만 |

### Backend API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/user/login` | 로그인 |

---

## 구현 완료 목록

### 1. 로그인 페이지 — Frontend (`/login`)

- **컴포넌트**: `src/pages/Login/Login.tsx`
- **스타일**: `src/css/Login/Login.css`
- **레이아웃**: 좌우 2단 분할 카드 형태
  - 좌측: 브랜드 영역 (파란 배경, 로고, 슬로건, WMS 워터마크)
  - 우측: 폼 영역 (아이디 입력, 비밀번호 입력, 아이디 저장, 로그인 버튼, 푸터 링크)

- **상태 관리 (useState)**

  | 상태 | 타입 | 설명 |
  |------|------|------|
  | `userId` | string | 사용자 아이디 입력값 |
  | `password` | string | 비밀번호 입력값 |
  | `showPassword` | boolean | 비밀번호 표시/숨김 토글 |
  | `rememberMe` | boolean | 아이디 저장 체크박스 |
  | `popupMessage` | string | 유효성 검사 레이어 팝업 메시지 |

- **구현 기능**
  - [x] 로그인 UI 구현
  - [x] 아이디/비밀번호 미입력 시 레이어 팝업 메시지 출력
  - [x] 백엔드 로그인 API 호출 (`LoginApi.ts` 연동)
  - [x] 아이디 저장 (`localStorage` 활용, 백엔드 전달 없이 프론트에서만 처리)
  - [x] Login.css 오류 수정 (`display: display` → `display: flex`, `#1530820` → `#153082`)

- **TODO (미구현)**
  - [ ] 로그인 성공 시 대시보드(`/dashboard`)로 이동
  - [x] 로그인 실패 시 에러 팝업 메시지 표시

### 2. 로그인 API — Backend

- **Controller**: `user/controller/UserController.kt`
  - `POST /api/user/login` — `@RequestBody`로 JSON 수신 → `UserService.login()` 호출

- **Service**: `user/service/UserService.kt`
  - `UserMapper.findByLogin()` 호출
  - 사용자 없을 경우 `RuntimeException` 발생

- **Mapper**: `user/mapper/UserMapper.kt` + `resources/mapper/UserMapper.xml`
  - `tb_user` 테이블에서 `userId`, `password` 조건으로 사용자 조회

- **DTO**

  | 클래스 | 필드 | 설명 |
  |--------|------|------|
  | `LoginRequest` | userId, password | 프론트 → 백엔드 (saveId는 프론트 localStorage에서만 처리) |
  | `LoginResponse` | token, userId, usernm | 백엔드 → 프론트 |

- **TODO (미구현)**
  - [ ] JWT 토큰 발급 (현재 임시 빈 문자열 반환)
  - [ ] 비밀번호 암호화 검증 (현재 평문 비교)
  - [ ] CORS 설정 완성 (`WebConfig.kt`)

---

## 스타일 가이드

| 항목 | 값 |
|------|----|
| 주 색상 (파란색) | `#1a3fa8` |
| 배경색 | `#f0f2f5` |
| 카드 너비 | `900px` |
| 폰트 | Noto Sans KR |
| border-radius | `12px` (카드), `8px` (인풋/버튼) |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-05 | 로그인 페이지 UI 초기 구현 |
| 2026-04-05 | App.tsx 라우터 설정 (react-router-dom v7) |
| 2026-04-05 | API 통신 구조 설계 (axios 공통 인스턴스 + 도메인별 API 파일 분리 방식) |
| 2026-04-06 | 로그인 유효성 검사 레이어 팝업 구현 |
| 2026-04-06 | 백엔드 로그인 API 구현 (Controller / Service / Mapper / DTO) |
| 2026-04-06 | Gradle 빌드 성공 확인 |
| 2026-04-06 | `LoginRequest`에서 `saveId` 제거 (프론트 localStorage에서만 처리) |
| 2026-04-06 | Login.css 오류 수정 (display 값 오타, hex 색상값 자리수 오류) |
| 2026-04-06 | `trasaction.ts`에 `request()` 공통 래퍼 추가 — 성공/실패 콜백 패턴 도입 |
| 2026-04-06 | `loginApi.ts` 콜백 패턴으로 변경 (onSuccess / onError) |
| 2026-04-06 | `Login.tsx` API 호출부 리팩토링 — try-catch/async 제거, 콜백 방식으로 전환 |
| 2026-04-06 | 로그인 실패 시 에러 팝업 메시지 표시 구현 완료 |
| 2026-04-06 | 백엔드 공통 응답 구조 도입 (`resultcode` / `resultMsg` / `data`) |
| 2026-04-06 | `trasaction.ts` `request()`에서 `resultcode` 기반 성공/실패 분기 처리 추가 |
| 2026-04-06 | `loginApi.ts` `ApiResponse<T>` 래핑 구조로 변경 |
