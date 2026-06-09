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

개별 화면 컴포넌트는 `<div className={styles.pageContainer}>` 부터 시작한다.

---

## 2. 파일 구조 및 위치

| 파일 종류 | 위치 | 네이밍 예시 |
|-----------|------|------------|
| 디자인 HTML | `src/design/` | `cj_wms_stock_0010_design.html` |
| 화면 TSX | `src/pages/카테고리/` | `cj_wms_stock_0010.tsx` |
| CSS Module | `src/pages/카테고리/` | `cj_wms_stock_0010.module.css` |
| API 서비스 | `src/api/카테고리/` | `stock_0010Service.ts` |

### 카테고리 분류
| 경로명 | 메뉴 |
|--------|------|
| `Master` | 마스터 관리 |
| `Receipt` | 입고관리 |
| `Order` | 출고관리 |
| `Stock` | 재고관리 |
| `Common` | 공통관리 |

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
// CSS Module
import styles from './cj_wms_[화면ID].module.css';
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";  // 엑셀 업로드 필요 시
```

---

## 4. 레이아웃 구조

```tsx
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

    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.sectionCard}>

          {/* 섹션 헤더 (제목 + 버튼 + 필터 + 툴바) */}
          <div className={styles.sectionHeader}>
            ...
          </div>

          {/* 테이블 (단일 패널) */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>...</table>
          </div>

          {/* 패널 분할 레이아웃 (마스터-디테일 구조일 때) */}
          <div className={styles.panelGrid}>
            <section className={styles.panel}>...</section>
            <section className={styles.panel}>...</section>
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
<div className={styles.sectionHeader}>

  {/* 제목 + 액션 버튼 */}
  <div className={styles.headerTop}>
    <div className={styles.titleArea}>
      <h3>화면 제목</h3>
      <p>화면 설명 문구</p>
    </div>
    <div className={styles.actionGroup}>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>
        <span className="material-symbols-outlined">search</span>
        조회
      </button>
      <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleSave}>
        <span className="material-symbols-outlined">save</span>
        저장
      </button>
      <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExcel}>
        <span className="material-symbols-outlined">download</span>
        엑셀
      </button>
    </div>
  </div>

  {/* 필터 영역 */}
  <div className={styles.filterBox}>
    <div className={styles.filterGrid}>
      ...필터 항목...
    </div>
  </div>

  {/* 테이블 툴바 (Total 카운트 + 옵션 체크박스) */}
  <div className={styles.tableToolbar}>
    <span className={styles.totalCount}>Total: {filteredList.length} Items</span>
    <label className={styles.excludeZeroLabel}>
      <input type="checkbox" className={styles.checkbox}
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
<div className={styles.filterItem}>
  <label className={styles.filterLabel}>고객사</label>
  <select className={styles.filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
    {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
  </select>
</div>
```

### text input
```tsx
<div className={styles.filterItem}>
  <label className={styles.filterLabel}>바코드</label>
  <input type="text" className={styles.filterInput} value={searchBarCd}
    onChange={e => setSearchBarCd(e.target.value)} placeholder="입력" />
</div>
```

### date input
```tsx
<div className={styles.filterItem}>
  <label className={styles.filterLabel}>입고일자</label>
  <input type="date" className={styles.filterInput} value={searchRcptDt}
    onChange={e => setSearchRcptDt(e.target.value)} />
</div>
```

### text + 검색 버튼 (팝업 없음)
```tsx
<div className={styles.filterItem}>
  <label className={styles.filterLabel}>로케이션</label>
  <div className={styles.filterInputGroup}>
    <input type="text" className={styles.filterInput} value={searchLocCd}
      onChange={e => setSearchLocCd(e.target.value)} />
    <button className={styles.filterSearchBtn}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
    </button>
  </div>
</div>
```

### 존 — text + 검색버튼(ZoneSearchPopup) + 존명 readonly
```tsx
<div className={styles.filterItem}>
  <label className={styles.filterLabel}>존</label>
  <div className={styles.filterInputGroup}>
    <input type="text" className={styles.filterInput} value={searchZoneCd}
      onChange={e => setSearchZoneCd(e.target.value)} />
    <button className={styles.filterSearchBtn} onClick={() => setZonePopupOpen(true)}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
    </button>
    <input type="text" className={styles.filterInputReadonly} value={searchZoneNm} readOnly />
  </div>
</div>
```

---

## 7. 테이블 패턴

```tsx
<div className={styles.tableWrapper}>
  <table className={styles.table}>
    <colgroup>
      <col style={{ width: '44px' }} />   {/* 체크박스 */}
      <col style={{ width: '120px' }} />
      {/* ... */}
    </colgroup>
    <thead className={styles.thead}>
      <tr>
        <th>
          <input type="checkbox" className={styles.checkbox}
            checked={filteredList.length > 0 && checkedItems.size === filteredList.length}
            onChange={handleSelectAll} />
        </th>
        <th>컬럼명</th>
        <th className={styles.cellRight}>숫자컬럼</th>
      </tr>
    </thead>
    <tbody className={styles.tbody}>
      {searched && filteredList.length === 0 ? (
        <tr>
          <td colSpan={N} className={styles.emptyRow}>
            <span className="material-symbols-outlined">inbox</span>
            <p>조회된 데이터가 없습니다.</p>
          </td>
        </tr>
      ) : filteredList.map((item, idx) => (
        <tr key={idx}>
          <td className={styles.cellCenter}>
            <input type="checkbox" className={styles.checkbox}
              checked={checkedItems.has(idx)}
              onChange={() => handleCheckRow(idx)} />
          </td>
          <td>{item.field}</td>
          <td className={styles.cellRight}>{item.qty.toLocaleString()}</td>
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

## 11. CSS 클래스 목록

### 레이아웃
| 클래스 | 역할 |
|--------|------|
| `pageContainer` | 화면 최상위 래퍼 (flex row) |
| `contentWrapper` | 내용 래퍼 (flex column, flex:1) |
| `sectionCard` | 흰색 카드 박스 (border, shadow) |
| `sectionHeader` | 헤더 영역 (제목+버튼+필터, flex-shrink:0) |
| `headerTop` | 제목·버튼 가로 배치 |
| `titleArea` | 제목(h3) + 설명(p) |
| `actionGroup` | 우측 버튼 묶음 |
| `panelGrid` | 마스터-디테일 2열 분할 (`6fr 4fr`) |
| `panel` | 개별 패널 (border, flex column) |
| `panelHeader` | 패널 헤더 (제목 + 툴바) |
| `panelTitleGroup` | 패널 제목 그룹 (accent + 제목 + 카운트) |
| `panelAccent` | 파란 세로 바 강조선 |
| `panelTitle` | 패널 제목 텍스트 |
| `panelCount` | `(Total: N)` 카운트 텍스트 |
| `panelToolbar` | 패널 우측 툴바 버튼 그룹 |

### 버튼
| 클래스 | 역할 |
|--------|------|
| `btn` | 버튼 기본 스타일 |
| `btnPrimary` | 파란 채움 버튼 (조회) |
| `btnOutline` | 외곽선 버튼 (저장·엑셀) |
| `btnToolbar` | 패널 내 소형 도구 버튼 |
| `filterSearchBtn` | 필터 내 돋보기 버튼 (파란 배경) |

### 필터
| 클래스 | 역할 |
|--------|------|
| `filterBox` | 필터 전체 박스 (연회색 배경) |
| `filterGrid` | 필터 그리드 (`repeat(4, 1fr)` 기본) |
| `filterItem` | 개별 필터 항목 (label + input) |
| `filterLabel` | 필터 레이블 (회색 대문자) |
| `filterSelect` | 드롭다운 입력 |
| `filterInput` | 텍스트/날짜 입력 |
| `filterInputGroup` | 입력 + 버튼 가로 묶음 |
| `filterInputReadonly` | 읽기전용 입력 (회색 배경) |

### 툴바
| 클래스 | 역할 |
|--------|------|
| `tableToolbar` | Total 카운트 + 옵션 체크박스 행 |
| `totalCount` | `Total: N Items` 텍스트 |
| `excludeZeroLabel` | 제외 체크박스 레이블 |

### 테이블
| 클래스 | 역할 |
|--------|------|
| `tableWrapper` | 스크롤 래퍼 (overflow:auto, flex:1) |
| `table` | 테이블 본체 (table-layout:fixed) |
| `thead` | 헤더 (sticky top:0, 연회색 배경) |
| `tbody` | 바디 (행 hover 처리) |
| `emptyRow` | 데이터 없을 때 빈 행 |
| `selectedRow` | 선택된 행 강조 (파란 좌측 border) |

### 셀
| 클래스 | 역할 |
|--------|------|
| `cellCenter` | 가운데 정렬 |
| `cellRight` | 우측 정렬 (숫자) |
| `cellBold` | 굵게 + 파란색 (#003f87) |
| `cellDim` | 흐리게 (회색, 0.6875rem) |
| `cellInput` | 인라인 편집 입력 |
| `cellAvailQtyOk` | 가용재고 양수 (#0056b3, bold) |
| `cellAvailQtyZero` | 가용재고 0 (#ba1a1a, bold) |

### 기타
| 클래스 | 역할 |
|--------|------|
| `checkbox` | 커스텀 체크박스 |
| `badgeSuccess` | 초록 뱃지 (사용) |
| `badgeInactive` | 회색 뱃지 (미사용) |
| `chipOk` | 초록 칩 (OK) |
| `chipError` | 빨간 칩 (오류) |
| `textSuccess` | 초록 텍스트 (Y) |
| `textTertiary` | 주황 텍스트 (경고) |
| `textMuted` | 회색 텍스트 (-) |
