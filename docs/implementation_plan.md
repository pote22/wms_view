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

> 완료된 Phase 상세 → [`docs/history/frontend_phases.md`](history/frontend_phases.md)

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
