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
| 주 색상 (파란색) | `#003f87` |
| 배경색 | `#eceeef` |
| 카드 너비 | `1100px` |
| 폰트 | Inter (본문), Manrope (제목) |
| border-radius | `12px` (카드), `8px` (인풋/버튼) |

---

## 로그인 화면 UI 개선 계획 (Stitch 디자인 적용)

> **작성일**: 2026-04-12  
> **상태**: 미완료 (승인 대기)

### 배경

- 로그인 성공 후 메인 화면에서 로그인 레이아웃 스타일이 함께 적용되는 문제 발생
- Stitch에서 디자인한 로그인 화면 기준으로 스타일 개선 필요

### 문제 원인

| 원인 | 위치 | 내용 |
|------|------|------|
| `#root` 공통 스타일 | `src/css/index.css` | `width: 1126px`, `border-inline`, `display: flex` 등이 전 페이지에 적용되어 메인 화면 레이아웃을 침범 |
| 스타일 미반영 | `src/css/Login/Login.css` | Stitch 디자인과 차이 (입력 필드, 버튼, 폰트, 카드 크기 등) |

### 수정 범위

#### 1. `src/css/index.css` — `#root` 스타일 정리

- `width: 1126px` 제거
- `border-inline` 제거
- `display: flex` / `flex-direction: column` 제거
- 로그인·메인 레이아웃 분리의 근본 해결

#### 2. `src/css/Login/Login.css` — Stitch 디자인 반영

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| 카드 너비 | `900px` | `1100px` |
| 입력 필드 스타일 | 전체 border (`border: 1.5px solid`) | 하단 border만 (`border-bottom: 2px solid`) + 배경 `#f2f4f5` |
| 입력 포커스 | border 색상 변경 | 하단 border 파란색 + 배경 흰색 |
| 로그인 버튼 | 단색 `#1a3fa8` | 그라디언트 (`#003f87` → `#0056b3`) + 그림자 |
| 주 색상 | `#1a3fa8` | `#003f87` |
| 배경색 | `#f0f2f5` | `#eceeef` |
| 폰트 | Noto Sans KR | Inter (본문) / Manrope (제목) |

#### 3. `src/pages/Login/Login.tsx` — Google Fonts 적용

- `<link>` 태그 대신 CSS `@import`로 Inter / Manrope 폰트 추가
- JSX 구조 및 로직은 변경 없음

### 변경 없는 파일

| 파일 | 이유 |
|------|------|
| `Login.tsx` (로직) | `handleSubmit`, `useState` 등 기능 코드 유지 |
| `App.tsx` | 라우팅 구조 변경 없음 |
| `Main.tsx` | 직접 수정 없음 — `index.css` 정리로 간접 해결 |
| 백엔드 전체 | 프론트 스타일 작업만 해당 |

---

## 메인 화면 구현 계획 (Stitch 디자인 적용)

> **작성일**: 2026-04-12  
> **상태**: 미완료 (구현 예정)

### 레이아웃 구조

```
<div class="main-wrapper">          ← 전체 화면 (flex-row)
  <aside class="sidebar">           ← 좌측 고정 사이드바 (width: 256px)
  <main class="main-content">       ← 우측 메인 영역 (flex-col)
    <header class="top-header">     ← 상단 헤더 (고객사/센터 셀렉터 + 사용자 + 탭)
    <div class="page-canvas">       ← 스크롤 가능한 콘텐츠 영역
      <section> 공지사항 </section>
      <div class="ops-grid">        ← 2컬럼 그리드
        <div> 입고/출고 현황 탭 </div>
        <div> 오더별 분포도 </div>
      </div>
      <section> 최근 트랜젝션 </section>
    </div>
    <div class="status-footer">     ← 하단 고정 상태바
```

### 파일 구성

| 파일 | 역할 |
|------|------|
| `src/pages/Main/Main.tsx` | 메인 페이지 전체 컴포넌트 |
| `src/css/Main/main.css` | 메인 페이지 전용 스타일 |

### 구성 영역별 상세

#### 1. 사이드바 (Sidebar)

| 항목 | 내용 |
|------|------|
| 너비 | 256px 고정 |
| 배경 | `#f1f5f9` (slate-100) |
| 로고 | CJ WMS (Manrope, bold) / CJ Logistics (서브텍스트) |
| 메뉴 그룹 | 마스터 관리, 입고관리, 출고관리 |
| 메뉴 항목 | 품번관리 / 입고등록, 입고예정&확정 / 출고등록, 출고/할당 관리 |
| 하단 | Support 링크 |
| 호버 효과 | 배경색 변경 + `translateX(4px)` 이동 애니메이션 |

#### 2. 상단 헤더 (TopHeader)

**상단 행 (사용자 정보)**

| 항목 | 내용 |
|------|------|
| 좌측 | 고객사 셀렉터, 센터 셀렉터 (드롭다운 형태 UI) |
| 우측 | 아바타(JS) + 이름/권한, 로그아웃 버튼, 알림 아이콘, 설정 아이콘 |

**하단 행 (탭 네비게이션)**

| 탭 | 상태 |
|----|------|
| 보관관리 | 기본 활성 탭 (파란색 하단 border) |
| 공통관리 | 비활성 탭 |

**탭별 사이드바 메뉴 구성**

| 탭 | 그룹 | 메뉴 항목 |
|----|------|----------|
| 보관관리 | 마스터 관리 | 품번관리 |
| 보관관리 | 입고관리 | 입고등록 / 입고예정&확정 |
| 보관관리 | 출고관리 | 출고등록 / 출고/할당 관리 |
| 공통관리 | 사용자관리 | 회원관리 |

> 탭 전환 시 사이드바 메뉴가 해당 탭의 메뉴로 교체됨 (`activeMainTab` state 기반)

#### 3. 공지사항 (Notice)

- 카드 형태 (`background: #fff`, `border-radius: 12px`, 그림자)
- 헤더: "공지사항 (Notice)" + "모두 보기" 링크
- 테이블: No / Title / Date 3컬럼
  - 제목에 `중요` 뱃지 (빨간색) 조건부 표시
  - 행 호버 시 배경색 변경

#### 4. 운영 현황 탭 (OperationsOverview)

내부 탭 2개 — `activeOpsTab` state로 전환

| 탭 | 카드 내용 |
|----|----------|
| **입고 현황 (Inbound)** | 금일 입고 (SKU + 증감률) / 주간 진행률 (progress bar) / 확정 대기 (건) |
| **출고 현황 (Outbound)** | 금일 출고 (SKU + 증감률) / 주간 진행률 (progress bar) / 출고 대기 (건) |

- 하단: "실시간 운영 요약 데이터" 텍스트

#### 5. 오더별 분포도 (OrderDistribution)

- 도넛 차트 (SVG 직접 구현)
- 중앙 텍스트: 1,200 / TOTAL ORDERS
- 범례 4항목

| 항목 | 색상 | 비율 |
|------|------|------|
| B2C 이커머스 | `#003f87` (primary) | 45% |
| B2B 대리점 | `#cbe7f5` (secondary-container) | 30% |
| 긴급 보충 | `#983c00` (tertiary-container) | 15% |
| 기타 반품 | `#cbd5e1` (slate-300) | 10% |

#### 6. 최근 트랜젝션 (RecentTransactions)

- 헤더: "최근 입고/출고 트랜젝션" + "전체 내역 보기 →"
- 트랜젝션 카드 반복 (3건 표시)

| 필드 | 내용 |
|------|------|
| 좌측 아이콘 | 상태별 색상 원형 아이콘 (완료: 초록, 진행중: 파랑, 대기: 회색) |
| 번호 + 상태 뱃지 | IB/OB-XXXXXXXX-XXX + 완료/진행중/대기 |
| 서브 정보 | 입고/출고 유형 + 창고 위치 |
| 우측 | 수량(EA) / 시간 / more_vert 버튼 |

#### 7. 하단 상태바 (StatusFooter)

- `position: fixed`, 좌측 사이드바 너비 이후부터 우측 끝까지
- 반투명 배경 + blur 효과
- 좌측: 시스템 상태 (초록 dot + 정상 작동 중) / 활성 작업자 / 창고 가동률
- 우측: "30초마다 데이터 갱신됨" + 파란 점 깜빡임 애니메이션

### 상태 관리 (useState)

| 상태 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `activeMainTab` | `'storage' \| 'common'` | `'storage'` | 상단 탭 (보관관리/공통관리) |
| `activeOpsTab` | `'inbound' \| 'outbound'` | `'inbound'` | 운영 현황 내부 탭 |

### 데이터 처리 방침

> 현재 단계에서는 **하드코딩 Mock 데이터**로 구현. 추후 API 연동 시 교체.

| 섹션 | Mock 데이터 |
|------|------------|
| 공지사항 | 3건 고정 배열 |
| 입고 현황 | 금일 입고 1,248 SKU / 진행률 65% / 확정 대기 24건 |
| 출고 현황 | 금일 출고 2,105 SKU / 진행률 78% / 출고 대기 42건 |
| 오더 분포도 | 총 1,200건 (B2C 45%, B2B 30%, 긴급 15%, 기타 10%) |
| 최근 트랜젝션 | 3건 고정 배열 (입고탭: IB번호, 출고탭: OB번호) |

### 구현 TODO

- [ ] 사이드바 레이아웃 구현
- [ ] 상단 헤더 (셀렉터 + 사용자 정보 + 탭) 구현
- [ ] 공지사항 섹션 구현
- [ ] 운영 현황 탭 (Inbound/Outbound 전환) 구현
- [ ] 오더별 분포도 SVG 도넛 차트 구현
- [ ] 최근 트랜젝션 리스트 구현
- [ ] 하단 고정 상태바 구현
- [ ] main.css 작성 (Inter/Manrope 폰트, 색상 토큰, 각 영역 스타일)

---

## 사이드 메뉴 라우팅 구현 계획 (인페이지 콘텐츠 전환)

> **작성일**: 2026-04-12  
> **상태**: 구현 예정

### 목표

- **상단 탭 (홈/보관관리/공통관리)** 클릭 → 사이드바 메뉴 목록만 교체, 본문 내용은 변경 없음
- **사이드 메뉴 아이템** 클릭 → 오른쪽 본문(page-canvas)이 해당 메뉴의 페이지로 전환

### 동작 흐름

```
[탭 클릭]
  홈 탭       → 사이드바: 대시보드 메뉴만 표시
  보관관리 탭  → 사이드바: 마스터관리 / 입고관리 / 출고관리 메뉴 표시
  공통관리 탭  → 사이드바: 사용자관리 메뉴 표시
  (* 탭 클릭 시 본문 변경 없음)

[사이드 메뉴 클릭]
  공지사항 클릭        → 본문: 공지사항 페이지
  품번관리 클릭        → 본문: 품번관리 페이지
  창고관리 클릭        → 본문: 창고관리 페이지
  입고등록 클릭        → 본문: 입고등록 페이지
  입고예정&확정 클릭   → 본문: 입고예정&확정 페이지
  출고등록 클릭        → 본문: 출고등록 페이지
  출고/할당 관리 클릭  → 본문: 출고/할당 관리 페이지
  센터고객관리 클릭    → 본문: 센터고객관리 페이지
  회원관리 클릭        → 본문: 회원관리 페이지
```

### 파일 구조

```
src/pages/
├── Main/
│   ├── Main.tsx                        ← 사이드바 + 헤더 + 렌더링 분기
│   └── sections/                       ← (임시 위치, 이동 예정)
├── Home/
│   ├── cj_wms_home_0010.tsx            ← 공지사항 (홈 대시보드)
│   ├── cj_wms_home_0020.tsx            ← 품번관리 (stub)
│   └── cj_wms_home_0050.tsx            ← 존&로케이션관리 (stub)
├── Receipt/
│   ├── cj_wms_receipt_0010.tsx         ← 입고등록 (stub)
│   └── cj_wms_receipt_0020.tsx         ← 입고예정&확정 (stub)
├── Order/
│   ├── cj_wms_order_0010.tsx           ← 출고등록 (stub)
│   └── cj_wms_order_0020.tsx           ← 출고/할당 관리 (stub)
└── Common/
    ├── cj_wms_comm_0010.tsx            ← 센터고객관리 (stub)
    └── cj_wms_comm_0020.tsx            ← 회원관리 (stub)
```

### Main.tsx 렌더링 분기 구조

```tsx
// import 경로 (sections/ 하위 도메인 폴더 기준)
import CjWmsHome0010    from "../Home/cj_wms_home_0010";
import CjWmsHome0020    from "../Home/cj_wms_home_0020";
import CjWmsHome0050    from "../Home/cj_wms_home_0050";
import CjWmsReceipt0010 from "../Receipt/cj_wms_receipt_0010";
import CjWmsReceipt0020 from "../Receipt/cj_wms_receipt_0020";
import CjWmsOrder0010   from "../Order/cj_wms_order_0010";
import CjWmsOrder0020   from "../Order/cj_wms_order_0020";
import CjWmsComm0010    from "../Common/cj_wms_comm_0010";
import CjWmsComm0020    from "../Common/cj_wms_comm_0020";

// page-canvas 안에서 activeSideMenu 에 따라 컴포넌트 교체
const PAGE_MAP: Record<string, React.ReactNode> = {
  "notice":             <CjWmsHome0010 />,    // 공지사항 (홈 대시보드)
  "items":              <CjWmsHome0020 />,    // 품번관리
  "zone":               <CjWmsHome0050 />,    // 존&로케이션관리
  "inbound-register":   <CjWmsReceipt0010 />,// 입고등록
  "inbound-schedule":   <CjWmsReceipt0020 />,// 입고예정&확정
  "outbound-register":  <CjWmsOrder0010 />,  // 출고등록
  "outbound-assign":    <CjWmsOrder0020 />,  // 출고/할당 관리
  "center-customer":    <CjWmsComm0010 />,   // 센터고객관리
  "user-manage":        <CjWmsComm0020 />,   // 회원관리
};

// 렌더링
{PAGE_MAP[activeSideMenu] ?? null}
```

### 상태 변경 규칙

| 이벤트 | 변경 상태 | 변경 없는 상태 |
|--------|-----------|----------------|
| 탭 클릭 | `activeMainTab` (사이드바 목록 교체) | `activeSideMenu` (본문 유지) |
| 사이드 메뉴 클릭 | `activeSideMenu` (본문 교체) | `activeMainTab` |

> 탭 클릭 시 `activeSideMenu`를 바꾸지 않으므로, 보관관리 탭에서 입고등록 보는 중에  
> 다른 탭 눌렀다가 돌아와도 마지막 보던 화면이 유지됨.

### Stub 페이지 공통 구조

아직 콘텐츠가 없는 페이지는 아래 형태로 구현:

```tsx
// 예: cj_wms_home_0020.tsx
const CjWmsHome0020: React.FC = () => (
  <div className="stub-page">
    <span className="material-symbols-outlined stub-icon">inventory_2</span>
    <h2 className="stub-title">품번관리</h2>
    <p className="stub-desc">준비 중인 페이지입니다.</p>
  </div>
);
export default CjWmsHome0020;
```

### CSS 추가 항목 (main.css)

| 클래스 | 용도 |
|--------|------|
| `.sidebar-menu-item--active` | 현재 선택된 사이드 메뉴 강조 (파란 배경 + 흰 텍스트) |
| `.stub-page` | Stub 페이지 중앙 정렬 레이아웃 |
| `.stub-icon` | Stub 아이콘 크기/색상 |
| `.stub-title` | Stub 제목 |
| `.stub-desc` | Stub 설명 텍스트 |

### 사이드바 메뉴 key 정의

| 파일 | key | 레이블 |
|------|-----|--------|
| `cj_wms_home_0010.tsx` | `notice` | 공지사항 |
| `cj_wms_home_0020.tsx` | `items` | 품번관리 |
| `cj_wms_home_0050.tsx` | `zone` | 존&로케이션관리 |
| `cj_wms_receipt_0010.tsx` | `inbound-register` | 입고등록 |
| `cj_wms_receipt_0020.tsx` | `inbound-schedule` | 입고예정&확정 |
| `cj_wms_order_0010.tsx` | `outbound-register` | 출고등록 |
| `cj_wms_order_0020.tsx` | `outbound-assign` | 출고/할당 관리 |
| `cj_wms_comm_0010.tsx` | `center-customer` | 센터고객관리 |
| `cj_wms_comm_0020.tsx` | `user-manage` | 회원관리 |

### TODO

- [ ] `sections/` 폴더 생성 및 파일 9개 생성 (`cj_wms_*.tsx`)
- [ ] `cj_wms_home_0010.tsx`에 현재 대시보드 본문 내용 이동
- [ ] `Main.tsx` 메뉴 key 업데이트 (`dashboard` → `notice`, `warehouse` → `zone`)
- [ ] `Main.tsx` `PAGE_MAP` 분기 로직 적용
- [ ] 탭 클릭에서 `setActiveSideMenu` 제거 (본문 유지)
- [ ] `sidebar-menu-item--active` CSS 추가
- [ ] Stub 페이지 CSS 추가

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
| 2026-04-12 | PostgreSQL 스키마 `public` → `wms` 변경, `DB_URL`에 `?currentSchema=wms` 추가로 연결 정상화 |
| 2026-04-12 | 로그인 화면 UI 개선 계획 수립 (Stitch 디자인 기반) |
| 2026-04-12 | 로그인 화면 Stitch 디자인 적용 완료 (Login.css 전면 개선, index.css #root 스타일 분리) |
| 2026-04-12 | 로그인 유효성 검사 포커스 버그 수정 (팝업 닫힌 후 focusAfterPopup ref로 포커스 복원) |
| 2026-04-12 | 메인 화면 구현 계획 수립 (Stitch 디자인 기반, 7개 영역 상세 분석) |
| 2026-04-12 | 메인 화면 구현 완료 — Main.tsx / main.css / index.html Material Icons 추가 |
