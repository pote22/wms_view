import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// 달력
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 레이어 팝업
import { usePopupContext } from '../../components/common/PopupProvider';
// 엑셀
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
// 공통서비스
import { getCommCodeList, type CommCode } from '../../api/common/commonService';
import { getList, getKeyInfo, saveReceiptList, getCheckList, type ReceiptHdr, type ReceiptDtl, type KeyInfo, type CheckResult } from '../../api/receipt/receipt_0010Service'
import { formatDate } from '../../utils/dateUtils';

const CalendarPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    createPortal(children ?? null, document.body);

// ── Tailwind 상수 ──────────────────────────────────────────────

// ── 레이아웃
const pageShell    = "flex min-h-0 flex-1 bg-surface";
const contentShell = "flex min-w-0 flex-1 flex-col";
const sectionCard  = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader = "shrink-0 border-b border-slate-100 p-6";

// ── 버튼
const btnBase    = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;

// ── 필터
const filterBox   = "mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4";
const filterGrid  = "grid grid-cols-4 gap-4";
const filterItem  = "flex min-w-0 flex-col gap-1.5";
const filterItemWide = "col-span-2 flex min-w-0 flex-col gap-1.5";
const filterLabel = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed";
const filterInput  = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed";
const filterInputGroup    = "flex min-w-0 gap-1.5";
const filterInputReadonly = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600";
const filterSearchBtn     = "inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed";

// ── 툴바
const toolbar      = "mt-4 flex items-center justify-between gap-3";
const toolbarGroup = "flex items-center gap-1.5";
const btnToolbar   = "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed";

// ── 테이블
const tableWrapper = "min-h-0 flex-1 overflow-auto";
const tableClass   = "min-w-[2000px] table-fixed border-collapse text-xs";
const theadClass   = "sticky top-0 z-[1] bg-slate-50 text-slate-500";
const thCell       = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide";
const tbodyClass   = "divide-y divide-slate-50 text-slate-700";
const cellCenter   = "px-2 py-2 text-center";
const emptyCell    = "px-4 py-12 text-center text-slate-400";

// ── 인라인 편집
const cellInput      = "h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const cellInputRight = "h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-right tabular-nums";
const cellSearchBtn  = "inline-flex h-7 w-6 shrink-0 items-center justify-center rounded bg-primary text-white hover:bg-primary-hover";
const cellInputGroup = "flex items-center gap-0.5";

// ── 업로드 결과 칩
const chipOk    = "inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-success";
const chipError = "inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-danger";
const chipGroup = "flex flex-col gap-1";
// ───────────────────────────────────────────────────────────────

const CJ_WMS_RECEIPT_0010: React.FC = () => {
    // 고객사&센터 리스트 조회
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    // 공통 팝업
    const { showAlert, showConfirm, openClientSearch, openVehicleSearch, openProdSearch, openZoneSearch, openLocSearch } = usePopupContext();
    // 토큰 정보
    const payload                                           = getTokenPayload();
    // 조회조건
    const [searchSrvcCd,        setSearchSrvcCd]            = useState(selectSrvcCd);
    const [searchWhCd,          setSearchWhCd]              = useState(selectWhCd);
    const [searchInNo,          setSearchInNo]              = useState('');
	const [searchInCategory,    setSearchInCategory]        = useState('');
    const [searchClientCd,      setSearchClientCd]          = useState('');
    const [searchClientNm,      setSearchClientNm]          = useState('');
    const [searchVehicleNo,     setSearchVehicleNo]         = useState('');
    const [searchVehicleNm,     setSearchVehicleNm]         = useState('');
    const [searchInExptDate,    setSearchInExptDate]        = useState<string>('');
    const [searchInType,        setSearchInType]            = useState('');
    // 공통코드
    const [receiptCategory,     setReceiptCategory]         = useState<CommCode[]>([]);         // 입고구분
    const [receiptStatus,       setReceiptStatus]           = useState<CommCode[]>([]);         // 입고상태
    const [receiptType,         setReceiptType]             = useState<CommCode[]>([]);         // 수불유형
    const [isNewMode,           setIsNewMode]               = useState(false);                  // 신규생성여부
    // 리스트
    const [receiptHdrList,      setReceiptHdrList]          = useState<ReceiptHdr[]>([]);       // 입고리스트(헤더)
    const [receiptDtlList,      setReceiptDtlList]          = useState<ReceiptDtl[]>([]);       // 입고리스트(디테일)
    const [isSearched,          setIsSearched]              = useState(false);
    // 키값정보
    const [keyInfo,             setKeyInfo]                 = useState<KeyInfo>();
    const [isUploading,         setIsUploading]             = useState(false);

    const fileInputRef                                      = useRef<HTMLInputElement>(null);
    const filterInNoRef                                     = useRef<HTMLInputElement>(null);
    const filterInCategoryRef                               = useRef<HTMLSelectElement>(null);
    const filterClientCdRef                                 = useRef<HTMLInputElement>(null);
    const filterVehicleNoRef                                = useRef<HTMLInputElement>(null);
    const filterInExptDateRef                               = useRef<HTMLDivElement>(null);

    const cellRefs                                          = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    // 고객사, 센터 리스트 호출
    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd)
    }, [selectWhCd]);

    // 공통코드 호출
    useEffect(() => {
        // 입고유형
        getCommCodeList(
            {
                  sysGrpCd    : 'WM0020'
                , sysCd        : ''
                , sysCdNm      : ''
                , srvcCd       : ''
                , sysEtc1      : ''
                , sysEtc2      : ''
                , sysEtc3      : ''
                , sysEtc4      : ''
                , sysEtc5      : ''
            },
            (res) => {
                const rows : CommCode[] = (res.data ?? []).map((v : any) => ({
                    sysCd       : v.sys_cd      ?? '',
                    sysCdNm     : v.sys_cdnm    ?? ''
                }));

                setReceiptCategory(rows)
            },
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );

        // 입고상태
        getCommCodeList(
            {
                  sysGrpCd    : 'WM0010'
                , sysCd        : ''
                , sysCdNm      : ''
                , srvcCd       : ''
                , sysEtc1      : ''
                , sysEtc2      : ''
                , sysEtc3      : ''
                , sysEtc4      : ''
                , sysEtc5      : ''
            },
            (res) => {
                const rows : CommCode[] = (res.data ?? []).map((v : any) => ({
                    sysCd       : v.sys_cd      ?? '',
                    sysCdNm     : v.sys_cdnm    ?? ''
                }));

                setReceiptStatus(rows)
            },
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );

        // 수불유형
        getCommCodeList(
            {
                  sysGrpCd    : 'WM0030'
                , sysCd        : ''
                , sysCdNm      : ''
                , srvcCd       : '1201'
                , sysEtc1      : ''
                , sysEtc2      : ''
                , sysEtc3      : ''
                , sysEtc4      : ''
                , sysEtc5      : ''
            },
            (res) => {
                const rows : CommCode[] = (res.data ?? []).map((v : any) => ({
                    sysCd       : v.sys_cd      ?? '',
                    sysCdNm     : v.sys_cdnm    ?? ''
                }));
                
                setReceiptType(rows);
            },
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );
    }, []);

    // 조회
    const handleSearch = (inNo?: string) => {
        const receiptInNo = (inNo) ? inNo : searchInNo;

        if (!receiptInNo) {
            showAlert("입고번호를 입력하세요.", () => filterInNoRef.current?.focus());
            return;
        }
        
        getList(
            {
                  srvcCd    : searchSrvcCd
                , whCd      : searchWhCd
                , inNo      : inNo ?? searchInNo
            },
            (res) => {
                const hdrList : ReceiptHdr[] = (res.data?.receiptHdrList ?? []).map((hdr : any) => ({
                    srvcCd          : hdr.srvcCd           ?? '',
                    whCd            : hdr.wh_cd             ?? '',
                    inNo            : hdr.in_no             ?? '',
                    inExpectedDate  : hdr.in_expected_date  ?? '',
                    inExpectedNo    : hdr.in_expected_no    ?? '',
                    vendorCd        : hdr.vendor_cd         ?? '',
                    vendorNm        : hdr.vendor_nm         ?? '',
                    receiptClsCd    : hdr.receipt_cls_cd    ?? '',
                    totline         : hdr.totline           ?? 0,
                    originalQty     : hdr.original_qty      ?? 0,
                    status          : hdr.status            ?? '',
                    rmk             : hdr.rmk               ?? '',
                    receiptDate     : hdr.receipt_date      ?? '',
                    receiptNo       : hdr.receipt_no        ?? 0,
                    inVNo           : hdr.in_v_no           ?? '',
                    inVId           : hdr.in_v_id           ?? '',
                    inVNm           : hdr.in_v_nm           ?? '',
                    receiptType     : hdr.receipt_type      ?? '',
                    isNew           : false,
                    isDirty         : false,
                    uploadStatus    : '',
                }));

                const dtlList : ReceiptDtl[] = (res.data?.receiptDtlList ?? []).map((dtl : any) => ({
                    srvcCd          : dtl.srvcCd            ?? '',
                    whCd            : dtl.wh_cd             ?? '',
                    inNo            : dtl.in_no             ?? '',
                    inExpectedSeq   : dtl.in_expected_seq   ?? 0,
                    inExpectedDate  : dtl.in_expected_date  ?? '',
                    inExpectedNo    : dtl.in_expected_no    ?? '',
                    lotNo           : dtl.lot_no            ?? '',
                    vendorCd        : dtl.vendor_cd         ?? '',
                    vendorNm        : dtl.vendor_nm         ?? '',
                    prodCd          : dtl.prod_cd           ?? '',
                    prodNm          : dtl.prod_nm           ?? '',
                    originalQty     : dtl.original_qty      ?? 0,
                    status          : dtl.status            ?? '',
                    rmk             : dtl.rmk               ?? '',
                    inZoneCd        : dtl.in_zone_cd        ?? '',
                    inZoneNm        : dtl.in_zone_nm        ?? '',
                    inLocCd         : dtl.in_loc_cd         ?? '',
                    regId           : dtl.reg_id            ?? '',
                    regDate         : dtl.reg_date          ?? '',
                    updId           : dtl.upd_id            ?? '',
                    updDate         : dtl.upd_date          ?? '',
                    isNew           : false,
                    isDirty         : false,
                    uploadStatus    : '',
                }));

                setReceiptHdrList(hdrList);
                setReceiptDtlList(dtlList);
                setIsSearched(true);
                setIsNewMode(false);

                // 헤더 정보로 필터 동기화
                if (hdrList.length > 0) {
                    const hdr = hdrList[0];

                    setSearchInNo(hdr.inNo);
                    setSearchInCategory(hdr.receiptClsCd);
                    setSearchClientCd(hdr.vendorCd);
                    setSearchClientNm(hdr.vendorNm);
                    setSearchVehicleNo(hdr.inVNo);
                    setSearchVehicleNm(hdr.inVNm);
                    setSearchInExptDate(hdr.inExpectedDate);
                    setSearchInType(hdr.receiptType);
                }
            },
            (err) => showAlert('조회 실패: ' + err?.message)
        );
    };

    // 신규
    const handleNew = () => {
        // 1. 입고 헤더/디테일 리스트 초기화
        setReceiptHdrList([]);
        setReceiptDtlList([]);
        setKeyInfo({
            inNo    : '',
            inNoSeq : '',
            today   : ''
        });

         // 2.입고헤더 행추가
        setReceiptHdrList([{
            srvcCd          : searchSrvcCd,
            whCd            : searchWhCd,
            inNo            : '',
            inExpectedDate  : '',
            inExpectedNo    : '',
            vendorCd        : '',
            vendorNm        : '',
            receiptClsCd    : '',
            totline         : 0,
            originalQty     : 0,
            status          : '',
            rmk             : '',
            receiptDate     : '',
            receiptNo       : 0,
            inVNo           : '',
            inVId           : '',
            inVNm           : '',
            receiptType     : '',
            isNew           : true,
            isDirty         : false,
            uploadStatus    : '',
        }]);

        // 3. 조회조건 필터 활성화
        setIsNewMode(true);
        setSearchInNo('');
        setSearchInCategory('1');
        setSearchClientCd('');
        setSearchClientNm('');
        setSearchVehicleNo('');
        setSearchVehicleNm('');
        setSearchInExptDate(formatDate(new Date()));
        setSearchInType(receiptType[0]?.sysCd ?? '');

        // 4. 키값 발급
        getKeyInfo(
            {},
            (res) => {
                const keyData = res.data[0];
                // 입고번호 생성
                const inNo = searchWhCd + "" + keyData.today + "" + keyData.in_no_seq;
                // keyInfo state에 Set
                setKeyInfo({
                    inNo    : inNo,
                    inNoSeq : keyData.in_no_seq,
                    today   : keyData.today
                });

                setReceiptHdrList(prev => prev.map(hdr => ({
                    ...hdr,
                    inNo            : inNo,
                    inExpectedNo    : keyData?.in_no_seq ?? '',
                    status          : '00'
                })));
            },
            (err) => showAlert("조회 실패: " + err?.message)
        )
    };

    // 저장
    const handleSave = () => {
        // 1. 입고상세 체크
        if (receiptDtlList.length === 0) {
            showAlert('품목을 추가하세요.');
            return;
        }

        // 2. 고객사/센터 유효성 체크
        const validSrvc = srvcList.some(s => s.srvcCd === searchSrvcCd);
        const validWh   = whList.some(w => w.whCd === searchWhCd);

        if (!validSrvc || !validWh) {
            showAlert('해당되지 않는 고객사 또는 센터입니다.');
            return;
        }

        // 3. 입고상태 체크
        const statusIdx = receiptDtlList.findIndex(row => row.status !== '00');

        if (statusIdx !== -1) {
            showAlert('해당 입고오더는 작업한 상태입니다.');
            return;
        }

        // 4. 필수항목 체크 + 포커싱
        const prodCdIdx = receiptDtlList.findIndex(row => !row.prodCd?.trim());

        if (prodCdIdx !== -1) {
            const el = cellRefs.current.get(`${prodCdIdx}_prodCd`);
            showAlert('품목코드를 입력해주세요.', () => el?.focus());
            return;
        }

        // 4-1. 존(ZONE)
        const zoneCdIdx = receiptDtlList.findIndex(row => !row.inZoneCd?.trim());

        if (zoneCdIdx !== -1) {
            const el = cellRefs.current.get(`${zoneCdIdx}_inZoneCd`);
            showAlert('존코드를 입력해주세요.', () => el?.focus());
            return;
        }

        // 4-2. 로케이션(LOCATION)
        const locCdIdx = receiptDtlList.findIndex(row => !row.inLocCd?.trim());
        if (locCdIdx !== -1) {
            const el = cellRefs.current.get(`${locCdIdx}_inLocCd`);
            showAlert('로케이션을 입력해주세요.', () => el?.focus());
            return;
        }

        // 4-3. 입고예정수량(ORIGINAL_QTY)
        const qtyIdx = receiptDtlList.findIndex(row => row.originalQty <= 0);
        if (qtyIdx !== -1) {
            const el = cellRefs.current.get(`${qtyIdx}_originalQty`);
            showAlert('입고예정 수량은 0이상 입력가능합니다.', () => el?.focus());
            return;
        }

        // 4-4. 입고일자(LOT_NO)
        const lotNoIdx = receiptDtlList.findIndex(row => !row.lotNo?.trim());
        if (lotNoIdx !== -1) {
            const el = cellRefs.current.get(`${lotNoIdx}_lotNo`);
            showAlert('입고일자를 입력해주세요.', () => el?.focus());
            return;
        }

        // 5. 중복 품목(prodCd + inZoneCd + inLocCd) 체크
        const seen = new Set<string>();
        let dupIdx = -1;

        for (let idx = 0; idx < receiptDtlList.length; idx++) {
            const key = `${receiptDtlList[idx].prodCd}|${receiptDtlList[idx].inZoneCd}|${receiptDtlList[idx].inLocCd}`;
            if (seen.has(key)) { dupIdx = idx; break; }
            seen.add(key);
        }

        if (dupIdx !== -1) {
            const el = cellRefs.current.get(`${dupIdx}_prodCd`);
            showAlert('중복된 품목정보가 있습니다.', () => el?.focus());
            return;
        }

         // 저장 confirm
        showConfirm('저장하시겠습니까?', () => {
            const totalQty = receiptDtlList.reduce((sum, d) => sum + d.originalQty, 0);
            const hdrList  = receiptHdrList.map(({ isNew, isDirty, uploadStatus, ...h }) => ({
                ...h,
                totline         : receiptDtlList.length,
                originalQty     : totalQty,
                receiptType     : searchInType,
                userId          : payload?.userId ?? '',
            }));

            const dtlList  = receiptDtlList.map(({ isNew, isDirty, uploadStatus, ...d }) => ({
                ...d,
                inExpectedNo    : keyInfo?.inNoSeq ?? '',
                userId          : payload?.userId ?? '',
            }));

            // 입고등록
            saveReceiptList(
                { hdrList, dtlList },
                () => {
                    const inNo = keyInfo?.inNo ?? '';

                    setSearchInNo(inNo);
                    setSearchInCategory('');
                    setSearchClientCd('');
                    setSearchClientNm('');
                    setSearchVehicleNo('');
                    setSearchVehicleNm('');
                    
                    showAlert('저장 되었습니다.', () => handleSearch(inNo));
                },
                (err) => showAlert('저장 실패: ' + err?.message)
            );
        });
    };

    // 엑셀다운로드
    const handleExcel = async () => {
        if (receiptDtlList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("입고등록");

        // 컬럼 정의
        ws.columns = [
            { header: "고객사",             key: "srvcCd",         width: 20 },
            { header: "센터",               key: "whCd",           width: 15 },
            { header: "품목번호",           key: "prodCd",         width: 18 },
            { header: "품목명",             key: "prodNm",         width: 18 },
            { header: "존",                 key: "inZoneCd",       width: 25 },
            { header: "존명",               key: "inZoneNm",       width: 15 },
            { header: "로케이션",           key: "inLocCd",        width: 14 },
            { header: "입고예정량",         key: "originalQty",    width: 15 },
            { header: "입고일자",           key: "lotNo",          width: 14 },
            { header: "비고",               key: "rmk",            width: 14 },
            { header: "입고상태",           key: "status",         width: 14 },
            { header: "등록자",             key: "regId",          width: 14 },
            { header: "등록일자",           key: "regDate",        width: 14 },
            { header: "수정자",             key: "updId",          width: 14 },
            { header: "수정일자",           key: "updDate",        width: 14 },
        ];

        // 헤더 스타일
        const headerRow = ws.getRow(1);

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "0080B2Fd" },
            };

            cell.font = { bold: true, color: { argb: "00000000" }, size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" },
            };
        });

        headerRow.height = 22;

        // 데이터 행 추가
        receiptDtlList.forEach(v => {
            const row = ws.addRow({
                srvcCd      : v.srvcCd,
                whCd        : v.whCd,
                prodCd      : v.prodCd,
                prodNm      : v.prodNm          ?? '',
                inZoneCd    : v.inZoneCd        ?? '',
                inZoneNm    : v.inZoneNm        ?? '',
                inLocCd     : v.inLocCd         ?? '',
                originalQty : v.originalQty     ?? '',
                lotNo       : v.lotNo           ?? '',
                rmk         : v.rmk             ?? '',
                status      : v.status          ?? '',
                regId       : v.regId           ?? "",
                regDate     : v.regDate         ?? "",
                updId       : v.updId           ?? "",
                updDate     : v.updDate         ?? "",
            });

            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" }, left: { style: "thin" },
                    bottom: { style: "thin" }, right: { style: "thin" },
                };
            });

            row.height = 18;
        });

        // 파일 저장
        const buffer    = await wb.xlsx.writeBuffer();
        const blob      = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url       = window.URL.createObjectURL(blob);
        const a         = document.createElement("a");

        a.href = url;
        a.download = `입고등록_${new Date().toISOString().slice(0, 10)}.xlsx`;

        document.body.appendChild(a);

        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    };

    // 행추가
    const handleAddRow = () => {
        const inNo          = searchInNo;
        const inCategory    = searchInCategory;
        const clientCd      = searchClientCd;
        const vehicleNo     = searchVehicleNo;
        const inType        = searchInType;

        if (inNo && isSearched) {
            return;
        }

        if (!searchSrvcCd) {
            showAlert('고객사를 선택하세요.');
            return;
        }

        if (!searchWhCd) {
            showAlert('센터를 선택하세요.');
            return;
        }

        if (!searchInCategory) {
            showAlert('입고구분을 선택하세요.', () => filterInCategoryRef.current?.focus());
            return;
        }

        if (!searchClientCd) {
            showAlert('매입처를 입력하세요.', () => filterClientCdRef.current?.focus());
            return;
        }

        if (!searchVehicleNo) {
            showAlert('차량번호를 입력하세요.', () => filterVehicleNoRef.current?.focus());
            return;
        }

        if (!searchInExptDate) {
            showAlert('입고예정일을 입력하세요.', () => filterInExptDateRef.current?.querySelector('input')?.focus());
            return;
        }

        setIsNewMode(false);

        //입고헤더 set
        setReceiptHdrList(prev => prev.map(row => ({
            ...row,
            receiptClsCd    : searchInCategory,
            vendorCd        : searchClientCd,
            vendorNm        : searchClientNm,
            inVNo           : searchVehicleNo,
            inVNm           : searchVehicleNm,
            inExpectedDate  : searchInExptDate
        })));

        //입고상세 set
        setReceiptDtlList(prev => [...prev, {
            srvcCd          : searchSrvcCd,
            whCd            : searchWhCd,
            inNo            : receiptHdrList[0].inNo,
            inExpectedSeq   : 0,
            inExpectedDate  : searchInExptDate,
            inExpectedNo    : receiptHdrList[0].inExpectedNo,
            lotNo           : searchInExptDate,
            vendorCd        : searchClientCd,
            vendorNm        : searchClientNm,
            prodCd          : '',
            prodNm          : '',
            originalQty     : 0,
            status          : '00',
            rmk             : '',
            inZoneCd        : '',
            inZoneNm        : '',
            inLocCd         : '',
            regId           : '',
            regDate         : '',
            updId           : '',
            updDate         : '',
            isNew           : true,
            isDirty         : false,
            uploadStatus    : ''
        }]);
    };

    // 행삭제
    const handleDeleteRow = () => {
        const lastNewIdx = receiptDtlList.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();

        if (lastNewIdx === undefined) return;

        setReceiptDtlList(prev => prev.filter((_, i) => i !== lastNewIdx));
    };

    // 양식다운로드
    const handleTempletDownload = async() => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("품목관리_양식");

        ws.columns = [
            { header: "고객사",     key: "srvcCd",          width: 20 },
            { header: "센터",       key: "whCd",            width: 20 },
            { header: "품목코드",   key: "prodCd",          width: 20 },
            { header: "존",         key: "inZoneCd",        width: 15 },
            { header: "로케이션",   key: "inLocCd",         width: 25 },
            { header: "수량",       key: "originalQty",     width: 18 },
            { header: "입고일자",   key: "lotNo",           width: 18 },
            { header: "비고",       key: "rmk",             width: 35 },
        ];

        const exampleRows = [
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '02-1602', inZoneCd: 'A', inLocCd : 'A-1-01', originalQty : '100', lotNo : '20260528', rmk : '입고예정정보 엑셀 업로드 입니다' },
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '02-1663', inZoneCd: 'A', inLocCd : 'A-1-02', originalQty : '101', lotNo : '20260528', rmk : '입고예정정보 엑셀 업로드 입니다' }
        ];

        // 헤더 행 스타일
        const headerRow = ws.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "0080B2Fd" },  // 배경색 (#003f87)
            };
            cell.font = {
                bold: true,
                color: { argb: "00000000" },    // 글자색 (검정색)
                size: 11,
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        headerRow.height = 22;

        exampleRows.forEach(data => {
            const row = ws.addRow(data);
            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
            row.height = 18;
        });

        // 파일 저장
        const buffer    = await wb.xlsx.writeBuffer();
        const blob      = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url       = window.URL.createObjectURL(blob);
        const a         = document.createElement("a");

        a.href          = url;
        a.download      = "입고등록_양식.xlsx";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // 엑셀업로드(유효체크)
    const handleExcelUpload = () => {
        if (receiptHdrList.length === 0) {
            showAlert('신규 버튼을 먼저 눌러주세요.');
            return;
        }

        if (!searchSrvcCd) {
            showAlert('고객사를 선택하세요.');
            return;
        }

        if (!searchWhCd) {
            showAlert('센터를 선택하세요.');
            return;
        }

        if (!searchInCategory) {
            showAlert('입고구분을 선택하세요.', () => filterInCategoryRef.current?.focus());
            return;
        }

        if (!searchClientCd) {
            showAlert('매입처를 입력하세요.', () => filterClientCdRef.current?.focus());
            return;
        }

        if (!searchVehicleNo) {
            showAlert('차량번호를 입력하세요.', () => filterVehicleNoRef.current?.focus());
            return;
        }

        if (!searchInExptDate) {
            showAlert('입고예정일을 입력하세요.', () => filterInExptDateRef.current?.querySelector('input')?.focus());
            return;
        }

        fileInputRef.current?.click();
    };

    // 엑셀업로드(파일업로드)
    const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
		
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = evt.target?.result;
            const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const newItems: ReceiptDtl[] = rows.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== '')).map(row => ({
                srvcCd          : String(row[0] ?? searchSrvcCd).trim(),
                whCd            : String(row[1] ?? searchWhCd).trim(),
                inNo            : receiptHdrList[0]?.inNo ?? '',
                inExpectedSeq   : 0,
                inExpectedDate  : searchInExptDate,
                inExpectedNo    : receiptHdrList[0]?.inExpectedNo ?? '',
                lotNo           : String(row[6] ?? searchInExptDate).trim(),
                vendorCd        : searchClientCd,
                vendorNm        : searchClientNm,
                prodCd          : String(row[2] ?? '').trim(),
                prodNm          : '',
                originalQty     : Number(row[5] ?? 0),
                status          : '00',
                rmk             : String(row[7] ?? '').trim(),
                inZoneCd        : String(row[3] ?? '').trim(),
                inZoneNm        : '',
                inLocCd         : String(row[4] ?? '').trim(),
                regId           : '',
                regDate         : '',
                updId           : '',
                updDate         : '',
                isNew           : true,
                isDirty         : false,
                uploadStatus    : '검증중...',
            }));

            setReceiptDtlList(newItems);

            getCheckList(
                {
                    dtlList: newItems.map((v, i) => ({
                        rowIndex    : i,
                        srvcCd      : v.srvcCd,
                        whCd        : v.whCd,
                        prodCd      : v.prodCd,
                        prodNm      : v.prodNm,
                        inZoneCd    : v.inZoneCd,
                        inZoneNm    : v.inZoneNm,
                        inLocCd     : v.inLocCd,
                        originalQty : v.originalQty,
                        lotNo       : v.lotNo,
                    }))
                },
                (res) => {
                    const results: CheckResult[] = res.data ?? [];
                    //입고헤더 set
                    setReceiptHdrList(prev => prev.map(row => ({
                        ...row,
                        receiptClsCd    : searchInCategory,
                        vendorCd        : searchClientCd,
                        vendorNm        : searchClientNm,
                        inVNo           : searchVehicleNo,
                        inVNm           : searchVehicleNm,
                        inExpectedDate  : searchInExptDate
                    })));

                    // 입고상세 set
                    setReceiptDtlList(prev => prev.map((v, i) => {
                        const r = results.find(r => r.rowIndex === i);
                        return {
                            ...v,
                            uploadStatus: r ? (r.isValid ? 'OK' : r.errors.join(' / ')) : v.uploadStatus
                        };
                    }));
                    setIsUploading(false);
                },
                (err) => {
                    setReceiptDtlList([]);
                    showAlert('유효성 검증 실패: ' + err?.message);
                    setIsUploading(false);
                }
            );
        };

        reader.onerror = () => {
            showAlert('엑셀 파일 업로드 실패');
            setIsUploading(false);
        };

        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

     // 디테일 행 필드 변경
    const handleDtlChange = (idx: number, field: keyof ReceiptDtl, value: any) => {
        setReceiptDtlList(prev => prev.map((row, i) =>
            i === idx ? { ...row, [field]: value, isDirty: true } : row
        ));
    };

     // 인라인 컬럼 편집
    const handleCellChange = (idx: number, field: keyof ReceiptDtl, value: string) => {
        setReceiptDtlList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    return (
        <>
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">입고 등록</h3>
                                <p className="mt-1 text-sm text-muted">신규 입고 정보를 시스템에 등록합니다.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnPrimary} onClick={() => handleSearch()}>
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                    조회
                                </button>
                                <button className={btnOutline} onClick={handleNew}>
                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                    신규
                                </button>
                                <button className={btnOutline} onClick={handleSave}>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    저장
                                </button>
                                <button className={btnOutline} onClick={handleExcel}>
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* Filter 1행 — 고객사 / 센터 / 입고번호 */}
                        <div className={filterBox}>
                            <div className={filterGrid}>
                                <div className={filterItem}>
                                    <label className={filterLabel}>고객사</label>
                                    <select className={filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => (
                                            <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>센터</label>
                                    <select className={filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => (
                                            <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>입고번호</label>
                                    <input type="text" className={filterInput} value={searchInNo} onChange={e => setSearchInNo(e.target.value)} placeholder="" ref={ filterInNoRef }/>
                                </div>
                            </div>
                        </div>

                        {/* Filter 2행 — 입고구분 / 매입처 / 차량번호 / 입고예정일 / 수불유형 */}
                        <div className={filterBox}>
                            <div className={filterGrid}>
                                <div className={filterItem}>
                                    <label className={filterLabel}>입고구분</label>
                                    <select className={filterSelect} disabled={!isNewMode} value={searchInCategory} onChange={e => setSearchInCategory(e.target.value)} ref={filterInCategoryRef}>
                                        <option value="">-- 선택 --</option>
                                        {
                                            receiptCategory.map( t => (
                                                <option key={t.sysCd} value={t.sysCd}>{t.sysCdNm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>매입처</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className={`h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!isNewMode} value={searchClientCd} onChange={e => { setSearchClientCd(e.target.value); setSearchClientNm(''); }} placeholder="" ref={filterClientCdRef}/>
                                        <button className={filterSearchBtn} disabled={!isNewMode} onClick={() => openClientSearch((clientCd, clientNm) => { setSearchClientCd(clientCd); setSearchClientNm(clientNm); }, searchClientCd)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} value={searchClientNm} onChange={e => setSearchClientNm(e.target.value)} placeholder="" readOnly/>
                                    </div>
                                </div>
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>차량번호</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className={`h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!isNewMode} value={searchVehicleNo} onChange={e => { setSearchVehicleNo(e.target.value); setSearchVehicleNm(''); }} placeholder="" ref={filterVehicleNoRef}/>
                                        <button className={filterSearchBtn} disabled={!isNewMode} onClick={() => openVehicleSearch((vehicleNo, drvNm) => { setSearchVehicleNo(vehicleNo); setSearchVehicleNm(drvNm); }, searchVehicleNo)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} placeholder="" value={searchVehicleNm} onChange={e => setSearchVehicleNm(e.target.value)} readOnly/>
                                    </div>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>입고예정일</label>
                                    <div className="datepicker-wrapper" ref={filterInExptDateRef}>
                                        <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[16px]">calendar_today</span>
                                        <DatePicker
                                            selected={searchInExptDate ? new Date(searchInExptDate.slice(0,4) + '-' + searchInExptDate.slice(4,6) + '-' + searchInExptDate.slice(6,8)) : null}
                                            onChange={(date: Date | null) => setSearchInExptDate(date ? formatDate(date) : '')}
                                            dateFormat="yyyy-MM-dd"
                                            locale={ko}
                                            disabled={!isNewMode}
                                            placeholderText=""
                                            isClearable
                                            popperContainer={CalendarPortal}
                                        />
                                    </div>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>수불유형</label>
                                    <select className={filterSelect} disabled={!isNewMode} value={searchInType} onChange={e => setSearchInType(e.target.value)}>
                                         {
                                            receiptType.map( t => (
                                                <option key={t.sysCd} value={t.sysCd}>{t.sysCdNm}</option>
                                            ))
                                         }
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className={toolbar}>
                            <div className={toolbarGroup}>
                                <button className={btnToolbar} onClick={handleAddRow}>
                                    <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                                    행추가
                                </button>
                                <button className={btnToolbar} onClick={handleDeleteRow}>
                                    <span className="material-symbols-outlined text-[16px] text-danger">delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className={toolbarGroup}>
                                <button className={btnToolbar} onClick={handleTempletDownload}>
                                    <span className="material-symbols-outlined text-[16px]">description</span>
                                    양식다운로드
                                </button>
                                <button className={btnToolbar} onClick={handleExcelUpload} disabled={isUploading}>
                                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                    {isUploading ? '업로드 중...' : '엑셀업로드'}
                                </button>
                                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleExcelFileChange} />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={tableWrapper}>
                        <table className={tableClass}>
                            <colgroup>
                                <col style={{ width: '20px' }} />
                                {/* 고객사 */}
                                <col style={{ width: '140px' }} />
                                {/* 센터 */}
                                <col style={{ width: '180px' }} />
                                {/* 품목코드 */}
                                <col style={{ width: '200px' }} />
                                {/* 품목명 */}
                                <col style={{ width: '250px' }} />
                                {/* 존코드 */}
                                <col style={{ width: '150px' }} />
                                {/* 존명 */}
                                <col style={{ width: '150px' }} />
                                {/* 로케이션코드 */}
                                <col style={{ width: '180px' }} />
                                {/* 입고예정량 */}
                                <col style={{ width: '150px' }} />
                                {/* 입고일자 */}
                                <col style={{ width: '200px' }} />
                                {/* 비고 */}
                                <col style={{ width: '200px' }} />
                                {/* 입고상태 */}
                                <col style={{ width: '150px' }} />
                                {/* 등록자 */}
                                <col style={{ width: '90px' }} />
                                {/* 등록일자 */}
                                <col style={{ width: '120px' }} />
                                {/* 수정자 */}
                                <col style={{ width: '90px' }} />
                                {/* 수정일자 */}
                                <col style={{ width: '120px' }} />
                                {/* 업로드결과 */}
                                <col style={{ width: '300px' }} />
                            </colgroup>
                            <thead className={theadClass}>
                                <tr>
                                    <th className={thCell}></th>
                                    <th className={thCell}>고객사</th>
                                    <th className={thCell}>센터</th>
                                    <th className={thCell}>품목코드</th>
                                    <th className={thCell}>품명</th>
                                    <th className={thCell}>존</th>
                                    <th className={thCell}>존명</th>
                                    <th className={thCell}>로케이션</th>
                                    <th className={thCell}>입고예정량</th>
                                    <th className={thCell}>입고일자</th>
                                    <th className={thCell}>비고</th>
                                    <th className={thCell}>입고상태</th>
                                    <th className={thCell}>등록자</th>
                                    <th className={thCell}>등록일자</th>
                                    <th className={thCell}>수정자</th>
                                    <th className={thCell}>수정일자</th>
                                    <th className={thCell}>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                { isSearched && receiptDtlList.length === 0 ? (
                                    <tr>
                                        <td colSpan={16} className={emptyCell}>
                                            <span className="material-symbols-outlined text-[2rem] block">inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : receiptDtlList.map((v, idx) => (
                                    <tr key={idx} className="bg-primary/[0.04] hover:bg-slate-50">
                                        <td className={cellCenter}></td>
                                        <td className={cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd)(srvcList.find( s => s.srvcCd === v.srvcCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : v.whCd)(whList.find( w => w.whCd === v.whCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            <div className={cellInputGroup}>
                                                <input type='text' className={cellInput} value={v.prodCd}
                                                       onChange={e => { handleCellChange(idx, "prodCd", e.target.value);handleCellChange(idx, "prodNm", '');}}
                                                       ref={setCellRef(idx, "prodCd") as any}/>
                                                <button className={cellSearchBtn} onClick={() => openProdSearch((prodCd, prodNm) => { handleDtlChange(idx, 'prodCd', prodCd); handleDtlChange(idx, 'prodNm', prodNm); }, v.prodCd)}>
                                                    <span className="material-symbols-outlined text-[12px]">search</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className={cellCenter}>{v.prodNm}</td>
                                        <td className={cellCenter}>
                                            <div className={cellInputGroup}>
                                                <input type='text' className={cellInput} value={v.inZoneCd}
                                                       onChange={e => { handleCellChange(idx, "inZoneCd", e.target.value);handleCellChange(idx, "inZoneNm", ''); }}
                                                       ref={setCellRef(idx, "inZoneCd") as any}/>
                                                <button className={cellSearchBtn} onClick={() => openZoneSearch((zoneCd, zoneNm) => { handleDtlChange(idx, 'inZoneCd', zoneCd); handleDtlChange(idx, 'inZoneNm', zoneNm); }, v.inZoneCd)}>
                                                    <span className="material-symbols-outlined text-[12px]">search</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className={cellCenter}>{v.inZoneNm}</td>
                                        <td className={cellCenter}>
                                            <div className={cellInputGroup}>
                                                <input type='text' className={cellInput} value={v.inLocCd}
                                                       onChange={e => handleCellChange(idx, "inLocCd", e.target.value)}
                                                       ref={setCellRef(idx, "inLocCd") as any}/>
                                                <button className={cellSearchBtn} onClick={() => { if (!v.inZoneCd) { showAlert('존코드를 먼저 검색하세요.'); return; } openLocSearch((locCd) => handleDtlChange(idx, 'inLocCd', locCd), v.inZoneCd, v.inLocCd); }}>
                                                    <span className="material-symbols-outlined text-[12px]">search</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className={cellCenter}>
                                            <input
                                                type='number'
                                                className={cellInputRight}
                                                value={v.originalQty}
                                                onChange={e => handleDtlChange(idx, 'originalQty', Number(e.target.value))}
                                                min={0}
                                                ref={setCellRef(idx, "originalQty") as any}
                                            />
                                        </td>
                                        <td className={cellCenter}>
                                            <div className="relative flex items-center">
                                                <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[14px]">calendar_today</span>
                                                <DatePicker
                                                    selected={v.lotNo ? new Date(v.lotNo.slice(0,4) + '-' + v.lotNo.slice(4,6) + '-' + v.lotNo.slice(6,8)) : null}
                                                    onChange={(date: Date | null) => handleDtlChange(idx, 'lotNo', date ? formatDate(date) : '')}
                                                    dateFormat="yyyy-MM-dd"
                                                    locale={ko}
                                                    placeholderText=""
                                                    isClearable
                                                    popperPlacement="bottom-end"
                                                    popperContainer={CalendarPortal}
                                                    ref={setCellRef(idx, "lotNo") as any}
                                                />
                                            </div>
                                        </td>
                                        <td className={cellCenter}>
                                            <input type='text' className={cellInput} value={v.rmk} onChange={e => handleDtlChange(idx, 'rmk', e.target.value)}/>
                                        </td>
                                        <td className={cellCenter}>
                                            { receiptStatus.find(s => s.sysCd === v.status) ?.sysCdNm ?? v.status }
                                        </td>
                                        <td className={cellCenter}>{v.regId}</td>
                                        <td className={cellCenter}>{v.regDate}</td>
                                        <td className={cellCenter}>{v.updId}</td>
                                        <td className={cellCenter}>{v.updDate}</td>
                                        <td className={cellCenter}>
                                            {v.uploadStatus === 'OK' ? (
                                                <span className={chipOk}>
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                    OK
                                                </span>
                                            ) : v.uploadStatus && v.uploadStatus !== '검증중...' ? (
                                                <div className={chipGroup}>
                                                    {v.uploadStatus.split(' / ').filter(Boolean).map((err, i) => (
                                                        <span key={i} className={chipError}>
                                                            <span className="material-symbols-outlined">error</span>
                                                            {err.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : v.uploadStatus}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="shrink-0 border-t border-slate-100 px-4 py-2">
                        <span className="text-xs text-muted">총 {receiptDtlList.length} 건</span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_RECEIPT_0010;
