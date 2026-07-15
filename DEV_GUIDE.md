# WMS 화면 개발 가이드

---

## 1. 역할 분리 원칙

공통 영역(Sidebar, Header, MainLayout)은 `Container.tsx`가 조립하며, 개별 화면 컴포넌트는 **본문 레이아웃만** 작성한다.

```
Container.tsx
 ├── Sidebar          ← 공통 (건드리지 않음)
 ├── Header           ← 공통 (건드리지 않음)
 └── PAGE_MAP[key]    ← 여기에 개별 화면 컴포넌트가 렌더링됨
```

개별 화면 컴포넌트는 Tailwind 기반 화면 래퍼(`<div className="flex min-h-0 flex-1 bg-surface">`)부터 시작한다.

---

## 2. 파일 구조 및 위치

화면 작업은 아래 5종 산출물을 기준으로 관리한다. 디자인 HTML, 화면 TSX, 스타일 파일은 화면 단위로 함께 움직이고, API 서비스와 API 루트 상수는 기존 규칙을 유지한다.

### 2.1 디자인 HTML

디자인 시안은 `src/design/` 아래 기능별 폴더를 만들어 관리한다.

| 디자인 폴더   | 기능          |
| ------------- | ------------ |
| `home`        | 홈           |
| `login`       | 로그인       |
| `main`        | 메인         |
| `master`      | 마스터       |
| `orders`      | 출고         |
| `receipt`     | 입고         |
| `stock`       | 재고         |
| `syscomm`     | 시스템공통   |

디자인 파일명은 `cj_wms_<디자인폴더>_NNNN_design.html` 형식을 따른다.

```text
src/design/stock/cj_wms_stock_0010_design.html
src/design/orders/cj_wms_orders_0010_design.html
```

> **`NNNN`(화면번호)는 10단위로 부여**한다. (`0010`, `0020`)
> `login.html`, `main_1.html` 은 개별화면이며, `sysusermanagement.html` 은 공통관리 화면이므로, 공통관리 화면은 'sys'로 시작한다.

### 2.2 화면 TSX

화면 컴포넌트는 `src/pages/<페이지폴더>/` 아래에 생성한다.

| 파일 종류     | 위치                        | 네이밍 규칙                 | 예시                              |
| ------------- | --------------------------- | --------------------------- | --------------------------------- |
| 화면 TSX      | `src/pages/<페이지폴더>/`   | `cj_wms_<cat>_NNNN.tsx`     | `cj_wms_stock_0010.tsx`           |
| 스타일 파일   | 원칙적으로 생성하지 않음    | Tailwind `className` 우선   | 예외 시에만 `*.module.css` 사용   |

### 2.3 API 파일

API 서비스와 API 루트 상수는 기존 규칙을 유지한다.

| 파일 종류       | 위치                        | 네이밍 규칙              | 예시                     |
| --------------- | --------------------------- | ------------------------ | ------------------------ |
| API 서비스      | `src/api/<api폴더>/`        | `<cat>_NNNNService.ts`   | `stock_0010Service.ts`   |
| API 루트 상수   | `src/api/common/index.ts`   | `API_<CAT>_ROOT`         | `API_STOCK_ROOT`         |

### 2.4 카테고리 분류 (★폴더명 불일치 주의)

디자인 폴더, 페이지 폴더, API 폴더의 이름이 일부 다르다. 새 파일을 만들 때 아래 표의 정확한 폴더명을 사용한다.

| 메뉴          | 디자인 폴더 `src/design/`   | 페이지 폴더 `src/pages/`   | API 폴더 `src/api/`   | API 루트 상수        | `<cat>`     |
| ------------- | --------------------------- | -------------------------- | --------------------- | -------------------- | ----------- |
| 홈            | `home`                      | `Home`                     | `home`                | `API_HOME_ROOT`      | `home`      |
| 로그인        | `login`                     | `Login`                    | `user`                | `API_USER_ROOT`      | `login`     |
| 메인          | `main`                      | `Main`                     | —                     | —                    | `main`      |
| 마스터 관리   | `master`                    | `Master`                   | `master`              | `API_MASTER_ROOT`    | `master`    |
| 입고관리      | `receipt`                   | `Receipt`                  | `receipt`             | `API_RECEIPT_ROOT`   | `receipt`   |
| 출고관리      | `orders`                    | `Orders`                   | `order`(예정)         | `API_ORDER_ROOT`     | `orders`    |
| 재고관리      | `stock`                     | `Stock`                    | `stock`               | `API_STOCK_ROOT`     | `stock`     |
| 공통관리      | —                           | `Common`                   | `common`              | `API_COMMON_ROOT`    | `comm`      |
| 시스템공통    | `syscomm`                   | (미정)                     | —                     | —                    | `sys`       |

> 신규 화면 `<cat>` 코드는 위 마지막 열을 기준으로 한다. 예: 재고관리 → `cj_wms_stock_0010.tsx`, 출고관리 → `cj_wms_orders_0010.tsx`.
> 출고관리 API 폴더는 아직 없으며, 백엔드/API 구현 시 `API_ORDER_ROOT` 기준으로 추가한다.

### Container.tsx 등록 방법
새 화면을 만든 후 `src/pages/Container.tsx` 에 두 곳을 추가한다.

```tsx
// 1) import 추가
import CJ_WMS_STOCK_0010 from "./Stock/cj_wms_stock_0010";

// 2) PAGE_MAP 등록
const PAGE_MAP: Record<string, React.ReactNode> = {
  "stock-list": <CJ_WMS_STOCK_0010 />,
};
```

---

## 3. 공통 임포트

```tsx
import React, { useState, useEffect, useRef } from 'react';
// 고객사·센터 공통 리스트
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 공통 팝업
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
// 존 검색 팝업
import ZoneSearchPopup from "../../components/common/ZoneSearchPopup";
// 공통코드
import { type CommCode, getCommCodeList } from '../../api/common/commonService';
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";  // 엑셀 업로드 필요 시
```

### 공통 컴포넌트 목록 (★새로 만들지 말고 재사용)

검색 팝업/오버레이는 이미 `src/components/common/` 에 구현돼 있다. **동일 기능을 화면 안에서 다시 만들지 말고 아래를 import 해서 쓴다.**

| 컴포넌트               | 용도                   | 비고                                 |
| ---------------------- | ---------------------- | ------------------------------------ |
| `Popup` + `usePopup`   | 알림/확인 다이얼로그   | 모든 화면 필수, return 최상단 배치   |
| `LoadingOverlay`       | 로딩 스피너 오버레이   | 조회/저장 등 비동기 동안 노출        |
| `ZoneSearchPopup`      | 존 검색                | 고객사·센터 코드 필요                |
| `LocSearchPopup`       | 로케이션 검색          |                                      |
| `ClientSearchPopup`    | 거래처 검색            |                                      |
| `ProdSearchPopup`      | 품목(품번) 검색        |                                      |
| `VehicleSearchPopup`   | 차량 검색              |                                      |

> 새로운 종류의 검색 팝업이 필요하면 화면 내부가 아니라 `src/components/common/` 에 별도 컴포넌트로 추가하고 위 표에 등록한다.

### 스타일링 표준 (Tailwind CSS 메인)

이 프로젝트의 신규 화면 스타일은 **Tailwind CSS v4를 메인 스타일 체계**로 작성한다. CSS Module은 기존 화면 유지 또는 Tailwind로 표현하기 어려운 예외 스타일에만 사용한다.

| 구분              | 설명                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| 기본              | TSX의 `className`에 Tailwind 유틸리티를 직접 작성                                                              |
| 반복 패턴         | 같은 화면 안에서 반복되면 `const` 클래스 문자열로 분리, 여러 화면에서 반복되면 `src/css/tailwind.css`로 승격   |
| 활성화 위치       | [src/css/tailwind.css](src/css/tailwind.css) 에서 theme, preflight, utilities, base layer를 관리               |
| Preflight         | **켜져 있음.** 전역 reset은 Tailwind 기준을 따른다                                                             |
| 디자인 토큰       | `@theme` 정의 → `bg-primary`, `bg-surface`, `bg-surface-card`, `text-on-surface`, `text-muted` 사용            |
| 기존 CSS Module   | 새 화면에서는 생성하지 않는다. 기존 화면은 화면 단위 리팩토링 때 Tailwind로 이동한다                           |

> **금지:** 신규 화면에서 `*.module.css`를 기본으로 생성하는 것, 인라인 `style={{...}}` 남발, 화면별 전역 CSS 추가.
> **허용:** 동적 width가 필요한 `colgroup`, 외부 라이브러리 스타일 보정, 복잡한 keyframes 등 Tailwind만으로 표현하기 부적절한 예외.

#### 클래스 작성 원칙

```tsx
const buttonBase = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const buttonPrimary = `${buttonBase} bg-primary text-white hover:bg-primary-hover`;
const buttonOutline = `${buttonBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;
```

| 상황                   | 작성 방식                                                              |
| ---------------------- | ---------------------------------------------------------------------- |
| 한 번만 쓰는 구조      | JSX에 Tailwind 유틸리티 직접 작성                                      |
| 같은 화면 반복 패턴    | 컴포넌트 내부 `const` 클래스 문자열로 분리                             |
| 여러 화면 공통 패턴    | `src/css/tailwind.css`의 `@layer components`에 공통 클래스 추가 검토   |
| 기존 CSS Module 화면   | 기능 수정과 분리해서 Tailwind 리팩토링 작업으로 전환                   |

---

## 4. 레이아웃 구조

```tsx
const pageShell = "flex min-h-0 flex-1 bg-surface";
const contentShell = "flex min-w-0 flex-1 flex-col";
const sectionCard = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader = "shrink-0 border-b border-slate-100 p-6";
const tableWrapper = "min-h-0 flex-1 overflow-auto";
const panelGrid = "grid min-h-0 flex-1 grid-cols-[6fr_4fr] gap-4 p-4";
const panel = "flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white";

return (
  <>
    {/* 공통 팝업 */}
    <Popup
      isOpen={popup.isOpen}
      message={popup.message}
      type={popup.type}
      onConfirm={popup.onConfirm}
      onCancel={closePopup}
    />

    {/* 존 검색 팝업 (존 필터 있을 때만) */}
    <ZoneSearchPopup
      isOpen={zonePopupOpen}
      srvcCd={searchSrvcCd}
      whCd={searchWhCd}
      initialZoneCd={searchZoneCd}
      onSelect={(zoneCd, zoneNm) => { setSearchZoneCd(zoneCd); setSearchZoneNm(zoneNm); }}
      onClose={() => setZonePopupOpen(false)}
    />

    <div className={pageShell}>
      <div className={contentShell}>
        <div className={sectionCard}>

          {/* 섹션 헤더 (제목 + 버튼 + 필터 + 툴바) */}
          <div className={sectionHeader}>
            ...
          </div>

          {/* 테이블 (단일 패널) */}
          <div className={tableWrapper}>
            <table className="min-w-full table-fixed border-collapse text-xs">...</table>
          </div>

          {/* 패널 분할 레이아웃 (마스터-디테일 구조일 때) */}
          <div className={panelGrid}>
            <section className={panel}>...</section>
            <section className={panel}>...</section>
          </div>

        </div>
      </div>
    </div>
  </>
);
```

---

## 5. 섹션 헤더 패턴

```tsx
const buttonBase = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const buttonPrimary = `${buttonBase} bg-primary text-white hover:bg-primary-hover`;
const buttonOutline = `${buttonBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;

<div className="shrink-0 border-b border-slate-100 p-6">

  {/* 제목 + 액션 버튼 */}
  <div className="flex items-start justify-between gap-4">
    <div>
      <h3 className="font-display text-xl font-bold text-slate-950">화면 제목</h3>
      <p className="mt-1 text-sm text-muted">화면 설명 문구</p>
    </div>
    <div className="flex items-center gap-2">
      <button className={buttonPrimary} onClick={handleSearch}>
        <span className="material-symbols-outlined">search</span>
        조회
      </button>
      <button className={buttonOutline} onClick={handleSave}>
        <span className="material-symbols-outlined">save</span>
        저장
      </button>
      <button className={buttonOutline} onClick={handleExcel}>
        <span className="material-symbols-outlined">download</span>
        엑셀
      </button>
    </div>
  </div>

  {/* 필터 영역 */}
  <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
    <div className="grid grid-cols-4 gap-4">
      ...필터 항목...
    </div>
  </div>

  {/* 테이블 툴바 (Total 카운트 + 옵션 체크박스) */}
  <div className="mt-4 flex items-center justify-between gap-3">
    <span className="text-sm font-semibold text-primary">Total: {filteredList.length} Items</span>
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
        checked={excludeZeroStock}
        onChange={e => setExcludeZeroStock(e.target.checked)} />
      총 재고량 0 제외
    </label>
  </div>

</div>
```

---

## 6. 필터 항목 패턴

### select (고객사·센터·공통코드)
```tsx
<div className="flex min-w-0 flex-col gap-1.5">
  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">고객사</label>
  <select className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
    value={searchSrvcCd}
    onChange={e => setSearchSrvcCd(e.target.value)}>
    {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
  </select>
</div>
```

### text input
```tsx
<div className="flex min-w-0 flex-col gap-1.5">
  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">바코드</label>
  <input type="text" className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
    value={searchBarCd}
    onChange={e => setSearchBarCd(e.target.value)} placeholder="입력" />
</div>
```

### date input
```tsx
<div className="flex min-w-0 flex-col gap-1.5">
  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">입고일자</label>
  <input type="date" className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
    value={searchRcptDt}
    onChange={e => setSearchRcptDt(e.target.value)} />
</div>
```

### text + 검색 버튼 (팝업 없음)
```tsx
<div className="flex min-w-0 flex-col gap-1.5">
  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">로케이션</label>
  <div className="flex min-w-0">
    <input type="text" className="h-9 min-w-0 flex-1 rounded-l-md border border-r-0 border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      value={searchLocCd}
      onChange={e => setSearchLocCd(e.target.value)} />
    <button className="inline-flex h-9 w-10 items-center justify-center rounded-r-md bg-primary text-white hover:bg-primary-hover">
      <span className="material-symbols-outlined text-[18px]">search</span>
    </button>
  </div>
</div>
```

### 존 — text + 검색버튼(ZoneSearchPopup) + 존명 readonly
```tsx
<div className="flex min-w-0 flex-col gap-1.5">
  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">존</label>
  <div className="flex min-w-0">
    <input type="text" className="h-9 min-w-0 flex-1 rounded-l-md border border-r-0 border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      value={searchZoneCd}
      onChange={e => setSearchZoneCd(e.target.value)} />
    <button className="inline-flex h-9 w-10 items-center justify-center bg-primary text-white hover:bg-primary-hover" onClick={() => setZonePopupOpen(true)}>
      <span className="material-symbols-outlined text-[18px]">search</span>
    </button>
    <input type="text" className="h-9 min-w-0 flex-1 rounded-r-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600" value={searchZoneNm} readOnly />
  </div>
</div>
```

---

## 7. 테이블 패턴

```tsx
<div className="min-h-0 flex-1 overflow-auto">
  <table className="min-w-[1200px] table-fixed border-collapse text-xs">
    <colgroup>
      <col style={{ width: '44px' }} />   {/* 체크박스 */}
      <col style={{ width: '120px' }} />
      {/* ... */}
    </colgroup>
    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500">
      <tr>
        <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">
          <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
            checked={filteredList.length > 0 && checkedItems.size === filteredList.length}
            onChange={handleSelectAll} />
        </th>
        <th className="border-b border-slate-100 px-2 py-2 text-left font-semibold uppercase tracking-wide">컬럼명</th>
        <th className="border-b border-slate-100 px-2 py-2 text-right font-semibold uppercase tracking-wide">숫자컬럼</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50 text-slate-700">
      {searched && filteredList.length === 0 ? (
        <tr>
          <td colSpan={N} className="px-4 py-12 text-center text-slate-400">
            <span className="material-symbols-outlined block text-4xl">inbox</span>
            <p className="mt-2 text-sm">조회된 데이터가 없습니다.</p>
          </td>
        </tr>
      ) : filteredList.map((item, idx) => (
        <tr key={idx} className="hover:bg-slate-50">
          <td className="px-2 py-2 text-center">
            <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
              checked={checkedItems.has(idx)}
              onChange={() => handleCheckRow(idx)} />
          </td>
          <td className="truncate px-2 py-2">{item.field}</td>
          <td className="px-2 py-2 text-right tabular-nums">{item.qty.toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 8. 팝업 패턴

### usePopup 훅 반환값
```tsx
const { popup, showAlert, showConfirm, closePopup } = usePopup();
```

### 사용법
```tsx
// 알림
showAlert("저장되었습니다.");

// 확인 다이얼로그
showConfirm("저장하시겠습니까?", () => {
  // 확인 클릭 시 실행
});
```

### Popup 컴포넌트 (항상 return 최상단에 포함)
```tsx
<Popup
  isOpen={popup.isOpen}
  message={popup.message}
  type={popup.type}
  onConfirm={popup.onConfirm}
  onCancel={closePopup}
/>
```

### ZoneSearchPopup props
```tsx
<ZoneSearchPopup
  isOpen={zonePopupOpen}           // boolean
  srvcCd={searchSrvcCd}           // 고객사 코드
  whCd={searchWhCd}               // 센터 코드
  initialZoneCd={searchZoneCd}    // 초기 존코드
  onSelect={(zoneCd, zoneNm) => { // 선택 콜백
    setSearchZoneCd(zoneCd);
    setSearchZoneNm(zoneNm);
  }}
  onClose={() => setZonePopupOpen(false)}
/>
```

---

## 9. 상태 관리 패턴

```tsx
const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
const payload = getTokenPayload();

// 조회조건
const [searchSrvcCd,  setSearchSrvcCd]  = useState(selectSrvcCd);
const [searchWhCd,    setSearchWhCd]    = useState(selectWhCd);
const [searchZoneCd,  setSearchZoneCd]  = useState('');
const [searchZoneNm,  setSearchZoneNm]  = useState('');
const [searchLocCd,   setSearchLocCd]   = useState('');

// 조회결과
const [dataList,  setDataList]  = useState<DataRow[]>([]);
const [searched,  setSearched]  = useState(false);        // emptyRow 표시 제어

// 체크박스
const [checkedItems,     setCheckedItems]     = useState<Set<number>>(new Set());
const [excludeZeroStock, setExcludeZeroStock] = useState(false);

// 팝업
const [zonePopupOpen, setZonePopupOpen] = useState(false);
const { popup, showAlert, showConfirm, closePopup } = usePopup();

// 파생 데이터 (필터 적용 리스트)
const filteredList = excludeZeroStock
  ? dataList.filter(v => v.availQty > 0)
  : dataList;

// 헤더 selectSrvcCd·selectWhCd 변경 시 조회조건 동기화
useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
useEffect(() => { setSearchWhCd(selectWhCd); },     [selectWhCd]);
```

---

## 10. 핸들러 뼈대

### handleSearch
```tsx
const handleSearch = () => {
  getSomeList(
    { srvcCd: searchSrvcCd, whCd: searchWhCd, /* ...조건... */ },
    (res) => {
      if (res.resultCode === '0000') {
        const rows = (res.data ?? []).map((v: any) => ({
          field1: v.field1 ?? '',
          // ...
        }));
        setDataList(rows);
        setSearched(true);
        setCheckedItems(new Set());
      }
    },
    (err) => showAlert('조회 실패: ' + err?.message)
  );
};
```

### handleSave
```tsx
const handleSave = () => {
  const dirtyRows = dataList.filter(v => v.isNew || v.isDirty);
  if (dirtyRows.length === 0) { showAlert("저장할 변경 내용이 없습니다."); return; }

  showConfirm("저장하시겠습니까?", () => {
    saveInfo(
      { list: dirtyRows.map(v => ({ ...v, userId: payload?.userId ?? '' })) },
      (res) => { if (res.resultCode === '0000') { showAlert("저장되었습니다."); handleSearch(); } },
      (err) => showAlert('저장 실패: ' + err?.message)
    );
  });
};
```

### handleExcel
```tsx
const handleExcel = async () => {
  if (filteredList.length === 0) { showAlert("다운로드할 데이터가 없습니다."); return; }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("시트명");

  ws.columns = [
    { header: "컬럼명", key: "fieldKey", width: 15 },
    // ...
  ];

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "0080B2Fd" } };
    cell.font      = { bold: true, color: { argb: "00000000" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border    = { top: {style:"thin"}, left: {style:"thin"}, bottom: {style:"thin"}, right: {style:"thin"} };
  });
  headerRow.height = 22;

  filteredList.forEach(v => {
    const row = ws.addRow(v);
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border    = { top: {style:"thin"}, left: {style:"thin"}, bottom: {style:"thin"}, right: {style:"thin"} };
    });
    row.height = 18;
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = window.URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `파일명_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

### 체크박스 핸들러
```tsx
const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  setCheckedItems(e.target.checked ? new Set(filteredList.map((_, i) => i)) : new Set());
};

const handleCheckRow = (idx: number) => {
  setCheckedItems(prev => {
    const next = new Set(prev);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    return next;
  });
};
```

---

## 11. Tailwind 표준 패턴

신규 화면은 아래 Tailwind 패턴을 기준으로 작성한다. 긴 조합은 화면 상단의 `const` 문자열로 분리해 재사용한다.

### 레이아웃
| 용도          | Tailwind 패턴                                                                               |
| ------------- | ------------------------------------------------------------------------------------------- |
| 화면 래퍼     | `flex min-h-0 flex-1 bg-surface`                                                            |
| 내용 래퍼     | `flex min-w-0 flex-1 flex-col`                                                              |
| 섹션 카드     | `flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-white shadow-sm`   |
| 섹션 헤더     | `shrink-0 border-b border-slate-100 p-6`                                                    |
| 패널 그리드   | `grid min-h-0 flex-1 grid-cols-[6fr_4fr] gap-4 p-4`                                         |
| 패널          | `flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white`                         |
| 스크롤 영역   | `min-h-0 flex-1 overflow-auto`                                                              |

### 버튼
| 용도           | Tailwind 패턴                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| 기본 버튼      | `inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition`                              |
| Primary 버튼   | `bg-primary text-white hover:bg-primary-hover`                                                                     |
| Outline 버튼   | `border border-border-soft bg-white text-slate-700 hover:bg-slate-50`                                              |
| Danger 버튼    | `border border-red-200 bg-white text-danger hover:bg-red-50`                                                       |
| 아이콘 버튼    | `inline-flex size-9 items-center justify-center rounded-md border border-border-soft bg-white hover:bg-slate-50`   |
| 검색 버튼      | `inline-flex h-9 w-10 items-center justify-center bg-primary text-white hover:bg-primary-hover`                    |

### 필터
| 용도            | Tailwind 패턴                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 필터 박스       | `rounded-lg border border-slate-100 bg-slate-50 p-4`                                                                                  |
| 필터 그리드     | `grid grid-cols-4 gap-4`                                                                                                              |
| 필터 항목       | `flex min-w-0 flex-col gap-1.5`                                                                                                       |
| 필터 레이블     | `text-xs font-semibold uppercase tracking-wide text-slate-500`                                                                        |
| 입력            | `h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15`   |
| 읽기전용 입력   | `h-9 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600`                                                     |
| 입력 그룹       | `flex min-w-0`                                                                                                                        |

### 테이블
| 용도          | Tailwind 패턴                                                                 |
| ------------- | ----------------------------------------------------------------------------- |
| 테이블 래퍼   | `min-h-0 flex-1 overflow-auto`                                                |
| 테이블        | `min-w-[1200px] table-fixed border-collapse text-xs`                          |
| 헤더          | `sticky top-0 z-10 bg-slate-50 text-slate-500`                                |
| 헤더 셀       | `border-b border-slate-100 px-2 py-2 font-semibold uppercase tracking-wide`   |
| 바디          | `divide-y divide-slate-50 text-slate-700`                                     |
| 행 hover      | `hover:bg-slate-50`                                                           |
| 가운데 셀     | `px-2 py-2 text-center`                                                       |
| 숫자 셀       | `px-2 py-2 text-right tabular-nums`                                           |
| 말줄임 셀     | `truncate px-2 py-2`                                                          |
| 빈 행         | `px-4 py-12 text-center text-slate-400`                                       |

### 상태 표시
| 용도          | Tailwind 패턴                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| 성공 뱃지     | `inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-success`      |
| 비활성 뱃지   | `inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500`   |
| 오류 칩       | `inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-danger`   |
| 경고 텍스트   | `text-warning`                                                                                        |
| 보조 텍스트   | `text-muted`                                                                                          |

### 기존 CSS Module 매핑
| 기존 클래스         | Tailwind 전환 방향                    |
| ------------------- | ------------------------------------- |
| `pageContainer`     | 화면 래퍼 패턴으로 교체               |
| `contentWrapper`    | 내용 래퍼 패턴으로 교체               |
| `sectionCard`       | 섹션 카드 패턴으로 교체               |
| `btn*`              | 버튼 패턴 조합으로 교체               |
| `filter*`           | 필터 패턴 조합으로 교체               |
| `table*`, `thead`   | 테이블 패턴 조합으로 교체             |
| `cell*`             | 셀 정렬/숫자/말줄임 유틸리티로 교체   |
| `badge*`, `chip*`   | 상태 표시 패턴으로 교체               |

---

## 12. 기존 화면 리팩토링 규칙

이미 만들어진 화면을 가이드 표준에 맞추거나 손볼 때의 규칙. **신규 화면 생성(1~11번)과 별개로, 기존 코드 수정 시 아래를 우선 적용한다.**

### 12.1 기본 원칙
- **한 번에 한 가지**: 리팩토링(구조/스타일 정리)과 기능 변경(버그/요건)을 같은 커밋에 섞지 않는다.
- **동작 보존**: 리팩토링은 화면 동작·API 응답 처리 결과가 바뀌면 안 된다. 바뀌어야 하면 기능 변경으로 분류한다.
- **가이드가 정답**: 기존 화면이 1~11번 패턴과 다르면 화면이 아니라 패턴에 맞춘다. 단, 가이드가 현실과 다르면 가이드를 먼저 고친다(이 문서가 단일 기준).
- **영향범위 우선 확인**: 공통 컴포넌트(`src/components/common`)·공통 API(`src/api/common`)·`Container.tsx` 를 건드릴 땐 이를 쓰는 모든 화면을 먼저 확인한다.

### 12.2 우선 정리 대상 (현재 코드 기준 알려진 부채)

| 항목                                    | 현재 상태                                                                  | 목표                                            |
| --------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `resultCode === '0000'` 매직 스트링     | 전 화면에 문자열 하드코딩                                                  | 공통 상수(예: `RESULT_OK = '0000'`)로 치환      |
| `Response.data: any` / 핸들러 `: any`   | API 응답·매핑이 `any`                                                      | 화면별 row 타입/Response 제네릭으로 타입화      |
| 검색 팝업 중복 구현                     | 화면 안에서 재구현 사례                                                    | `src/components/common/` 공통 컴포넌트 재사용   |
| CSS Module 기반 화면                    | 기존 화면 대부분이 `*.module.css` + `styles.xxx` 구조                      | 수정 대상 화면부터 Tailwind 패턴으로 전환       |
| 전역 CSS 잔재                           | 일부 Vite 템플릿/화면별 전역 CSS가 남아 있음                               | Tailwind base 또는 화면 TSX 유틸리티로 흡수     |
| 디자인 파일 네이밍                      | `sysusermanagement.html` 등 예외                                           | 신규는 `cj_wms_<cat>_NNNN_design.html`          |
| 카테고리 폴더명 혼란                    | 디자인 `orders`, 페이지 `Orders`, API `order`(예정)처럼 일부 명칭이 다름   | 신규 폴더 추가 금지, 2번 표 기준 사용           |
| API 루트 하드코딩                       | `index.ts`가 항상 `localhost:8080` 반환                                    | 환경변수(`import.meta.env`) 기반 분기           |
| 스텁 화면                               | Order(4)·Common(2)가 `stub-page`                                           | 구현 시 1~11번 Tailwind 패턴으로 작성           |

> 위 표의 항목은 **발견 시점에 즉시 전면 교체하지 않는다.** 해당 화면을 다른 사유로 수정할 때 함께 정리하거나, 별도 리팩토링 작업으로 분리해 진행한다.

### 12.3 화면 1개 Tailwind 전환 체크리스트
1. 대상 화면의 디자인 HTML·TSX·API 서비스 위치를 2번 표로 확인
2. `import styles from './*.module.css'` 제거 가능 여부 확인
3. 레이아웃을 4번 구조의 Tailwind 패턴으로 전환
4. 섹션 헤더/필터/테이블/팝업을 5~8번 Tailwind 예제와 맞춤
5. 반복되는 긴 클래스는 화면 상단 `const` 문자열로 분리
6. 외부 라이브러리 보정, keyframes, 복잡한 pseudo selector만 CSS 예외로 남김
7. 상태·핸들러가 9~10번 뼈대(`searched`, `checkedItems`, `usePopup`)를 따르는지 확인
8. API 호출이 `(data, onSuccess, onError)` 콜백 + `resultCode` 분기 형태인지 확인
9. 검색 팝업을 공통 컴포넌트로 쓰는지 확인
10. 수정 후 `npm run build`(타입체크)와 화면 동작 육안 확인
