import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 공통서비스
import { getCommCodeList, type CommCode } from '../../api/common/commonService';
// 공통 컴포넌트
import { formatDate } from '../../utils/dateUtils';
import { useCommonWhList } from '../../api/common/commonWhList';
import { usePopupContext } from '../../components/common/PopupProvider';
// API
import { getList, saveReceiptConfirm, saveRemarkInfo, type ReceiptRow } from '../../api/receipt/receipt_0020Service'
// 엑셀
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

const CalendarPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    createPortal(children ?? null, document.body);

// ── 레이아웃
const pageShell             = "flex min-h-0 flex-1 bg-surface";
const contentShell          = "flex min-w-0 flex-1 flex-col";
const sectionCard           = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader         = "shrink-0 border-b border-slate-100 p-6";

// ── 버튼
const btnBase               = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary            = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline            = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;
const btnBlue               = `${btnBase} border border-blue-200/60 bg-blue-50/50 text-primary font-bold hover:bg-blue-100/80`;

// ── 필터
const filterBox             = "mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4";
const filterGrid            = "grid grid-cols-4 gap-4";
const filterItem            = "flex min-w-0 flex-col gap-1.5";
const filterItemWide        = "col-span-2 flex min-w-0 flex-col gap-1.5";
const filterLabel           = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect          = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInput           = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInputGroup      = "flex min-w-0 gap-1.5";
const filterInputReadonly   = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600";
const filterSearchBtn       = "inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover";

// ── 툴바
const toolbar               = "mt-4 flex items-center justify-end gap-3";
const toolbarGroup          = "flex items-center gap-1.5";
const btnToolbar            = "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";
const selectToolbar         = "h-8 rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-primary appearance-none";

// ── 테이블
const tableWrapper          = "min-h-0 flex-1 overflow-auto";
const tableClass            = "min-w-[5200px] table-fixed border-collapse text-xs";
const theadClass            = "sticky top-0 z-1 bg-slate-50 text-slate-500";
const thCell                = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide";
const thGroupQty            = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 border-l border-r border-blue-200";
const thGroupScan           = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide bg-teal-100 text-teal-700 border-l border-r border-teal-200";
const thGroupSubQty         = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 border-l border-blue-200";
const thGroupSubScan        = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide bg-teal-100 text-teal-700 border-l border-teal-200";
const tbodyClass            = "divide-y divide-slate-50 text-slate-700";
const cellCenter            = "px-2 py-2 text-center";
const cellRight             = "px-2 py-2 text-right tabular-nums";
const cellMedium            = "px-2 py-2 font-medium text-slate-700";
const cellDim               = "px-2 py-2 text-slate-500";
const emptyCell             = "px-4 py-12 text-center text-slate-400";

// ── 인라인 편집
const cellInput             = "h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";

// ── 상태 배지
const badgePlan             = "inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-700";
const badgePartial          = "inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800";
const badgeConf             = "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800";

const CJ_WMS_RECEIPT_0020: React.FC = () => {
    // 공통
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    const { showAlert, showConfirm, openClientSearch, openProdSearch, openVehicleSearch } = usePopupContext();
    // 검색조건
    const [searchSrvcCd,        setSearchSrvcCd]            = useState(selectSrvcCd);
    const [searchWhCd,          setSearchWhCd]              = useState(selectWhCd);
    const [searchInCategory,    setSearchInCategory]        = useState('');
    const [searchStatus,        setSearchStatus]            = useState('');
    const [searchInNo,          setSearchInNo]              = useState('');
    const [searchInType,        setSearchInType]            = useState('');
    const [searchDateType,      setSearchDateType]          = useState('00');
    const [searchStrDate,       setSearchStrDate]           = useState(formatDate(new Date()));
    const [searchEndDate,       setSearchEndDate]           = useState(formatDate(new Date()));
    const [searchClientCd,      setSearchClientCd]          = useState('');
    const [searchClientNm,      setSearchClientNm]          = useState('');
    const [searchProdCd,        setSearchProdCd]            = useState('');
    const [searchProdNm,        setSearchProdNm]            = useState('');
    const [searchVehicleNo,     setSearchVehicleNo]         = useState('');
    const [searchDrvNm,         setSearchDrvNm]             = useState('');

    // 공통코드
    const [receiptCategory,     setReceiptCategory]         = useState<CommCode[]>([]);         // 입고구분 리스트
    const [receiptStatus,       setReceiptStatus]           = useState<CommCode[]>([]);         // 입고상태 리스트
    const [receiptType,         setReceiptType]             = useState<CommCode[]>([]);         // 수불유형 리스트
    const [inNotRsnCd,          setInNotRsnCd]              = useState<CommCode[]>([]);         // 미입고사유 리스트

    const [receiptList,         setReceiptList]             = useState<ReceiptRow[]>([]);       // 입고예정리스트
    const [notRsnCd,            setNotRsnCd]                = useState('');                     // 미입고사유

    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd)
    }, [selectWhCd]);

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

                setReceiptCategory(rows);
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

                setReceiptStatus(rows);
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

        // 수불유형
        getCommCodeList(
            {
                  sysGrpCd    : 'WM1090'
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

                setInNotRsnCd(rows);
            },
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );
    }, []);

    // 조회
    const handleSearch = () => {
        getList(
            {
                srvcCd          : searchSrvcCd,
                whCd            : searchWhCd,
                receiptClsCd    : searchInCategory,
                status          : searchStatus,
                inNo            : searchInNo,
                receiptType     : searchInType,
                dateType        : searchDateType,
                strDate         : searchStrDate,
                endDate         : searchEndDate,
                vendorCd        : searchClientCd,
                vendorNm        : searchClientNm,
                prodCd          : searchProdCd,
                prodNm          : searchProdNm,
                vehicleNo       : searchVehicleNo,
                drvNm           : searchDrvNm
            },
            (res) => {
                const row : ReceiptRow[] = (res.data ?? []).map((v : any) => ({
                    chk             : v.chk                 ?? '0',
                    srvcCd          : v.srvc_cd             ?? '',
                    whCd            : v.wh_cd               ?? '',
                    inNo            : v.in_no               ?? '',
                    inExpectedDate  : v.in_expected_date    ?? '',
                    inExpectedNo    : v.in_expected_no      ?? '',
                    inExpectedSeq   : v.in_expected_seq     ?? '',
                    totalStatus     : v.total_status        ?? '',
                    status          : v.status              ?? '',
                    receiptClsCd    : v.receipt_cls_cd      ?? '',
                    receiptType     : v.receipt_type        ?? '',
                    receiptDate     : v.receipt_date        ?? '',
                    vendorCd        : v.vendor_cd           ?? '',
                    vendorNm        : v.vendor_nm           ?? '',
                    prodCd          : v.prod_cd             ?? '',
                    prodNm          : v.prod_nm             ?? '',
                    inZoneCd        : v.in_zone_cd          ?? '',
                    inZoneNm        : v.in_zone_nm          ?? '',
                    inLocCd         : v.in_loc_cd           ?? '',
                    originalQty     : v.original_qty        ?? '',
                    expectedQty     : v.expected_qty        ?? '',
                    receivedQty     : v.received_qty        ?? '',
                    totInWeight     : v.tot_in_weight       ?? '',
                    pdaScanQty      : v.pda_scan_qty        ?? '',
                    pdaScanCnt      : v.pda_scan_cnt        ?? '',
                    notRsnCd        : v.not_rsn_cd          ?? '',
                    vendorAddress   : v.vendor_address      ?? '',
                    zipCd           : v.zip_cd              ?? '',
                    managerNm       : v.manager_nm          ?? '',
                    telNo           : v.tel_no              ?? '',
                    inVNo           : v.in_v_no             ?? '',
                    inVNm           : v.in_v_nm             ?? '',
                    pdaYn           : v.pda_yn              ?? '',
                    rmk             : v.rmk                 ?? '',
                    regId           : v.reg_id              ?? '',
                    regDate         : v.reg_date            ?? '',
                    updId           : v.upd_id              ?? '',
                    updDate         : v.upd_date            ?? ''
                }));

                setReceiptList(row);
            },
            (err) => showAlert('조회 실패: ' + err?.message)
        );
    }

    // 엑셀출력
    const handleExcel = async () => {
        if (receiptList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("입고예정확정");

        ws.columns = [
            { header: "고객사",       key: "srvcCd",          width: 22 },
            { header: "센터",         key: "whCd",            width: 22 },
            { header: "입고예정일",   key: "inExpectedDate",  width: 14 },
            { header: "입고번호",     key: "inNo",            width: 20 },
            { header: "입고순번",     key: "inExpectedSeq",   width: 10 },
            { header: "입고상태",     key: "status",          width: 12 },
            { header: "입고구분",     key: "receiptClsCd",    width: 12 },
            { header: "수불유형",     key: "receiptType",     width: 12 },
            { header: "입고완료일",   key: "receiptDate",     width: 14 },
            { header: "매입처코드",   key: "vendorCd",        width: 15 },
            { header: "매입처명",     key: "vendorNm",        width: 20 },
            { header: "품번",         key: "prodCd",          width: 20 },
            { header: "품명",         key: "prodNm",          width: 25 },
            { header: "존",           key: "inZoneCd",        width: 10 },
            { header: "존명",         key: "inZoneNm",        width: 15 },
            { header: "로케이션",     key: "inLocCd",         width: 15 },
            { header: "원주문량",     key: "originalQty",     width: 12 },
            { header: "예정수량",     key: "expectedQty",     width: 12 },
            { header: "확정수량",     key: "receivedQty",     width: 12 },
            { header: "총중량",       key: "totInWeight",     width: 12 },
            { header: "스캔수량",     key: "pdaScanQty",      width: 12 },
            { header: "스캔건수",     key: "pdaScanCnt",      width: 12 },
            { header: "미입고사유",   key: "notRsnCd",        width: 18 },
            { header: "업체주소",     key: "vendorAddress",   width: 30 },
            { header: "우편번호",     key: "zipCd",           width: 12 },
            { header: "담당자",       key: "managerNm",       width: 15 },
            { header: "연락처",       key: "telNo",           width: 15 },
            { header: "차량번호",     key: "inVNo",           width: 15 },
            { header: "기사명",       key: "inVNm",           width: 15 },
            { header: "PDA작업여부",  key: "pdaYn",           width: 12 },
            { header: "비고",         key: "rmk",             width: 25 },
            { header: "등록자",       key: "regId",           width: 12 },
            { header: "등록일자",     key: "regDate",         width: 14 },
            { header: "수정자",       key: "updId",           width: 12 },
            { header: "수정일자",     key: "updDate",         width: 14 },
        ];

        const headerRow = ws.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF003F87" } };
            cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border    = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" },
            };
        });
        headerRow.height = 22;

        const getStatusNm = (code: string) => {
            switch (code) {
                case '00': return '입고예정';
                case '01': return '부분입고';
                case '09': return '입고완료';
                default:   return code;
            }
        };

        receiptList.forEach(v => {
            const row = ws.addRow({
                srvcCd         : srvcList.find(s => s.srvcCd === v.srvcCd) ? `${v.srvcCd} [${srvcList.find(s => s.srvcCd === v.srvcCd)?.srvcNm}]` : v.srvcCd,
                whCd           : whList.find(w => w.whCd === v.whCd) ? `${v.whCd} [${whList.find(w => w.whCd === v.whCd)?.whNm}]` : v.whCd,
                inExpectedDate : v.inExpectedDate,
                inNo           : v.inNo,
                inExpectedSeq  : v.inExpectedSeq,
                status         : getStatusNm(v.status),
                receiptClsCd   : receiptCategory.find(c => c.sysCd === v.receiptClsCd)?.sysCdNm ?? v.receiptClsCd,
                receiptType    : receiptType.find(c => c.sysCd === v.receiptType)?.sysCdNm ?? v.receiptType,
                receiptDate    : v.receiptDate,
                vendorCd       : v.vendorCd,
                vendorNm       : v.vendorNm,
                prodCd         : v.prodCd,
                prodNm         : v.prodNm,
                inZoneCd       : v.inZoneCd,
                inZoneNm       : v.inZoneNm,
                inLocCd        : v.inLocCd,
                originalQty    : v.originalQty,
                expectedQty    : v.expectedQty,
                receivedQty    : v.receivedQty,
                totInWeight    : v.totInWeight,
                pdaScanQty     : v.pdaScanQty,
                pdaScanCnt     : v.pdaScanCnt,
                notRsnCd       : inNotRsnCd.find(c => c.sysCd === v.notRsnCd)?.sysCdNm ?? v.notRsnCd,
                vendorAddress  : v.vendorAddress,
                zipCd          : v.zipCd,
                managerNm      : v.managerNm,
                telNo          : v.telNo,
                inVNo          : v.inVNo,
                inVNm          : v.inVNm,
                pdaYn          : v.pdaYn,
                rmk            : v.rmk,
                regId          : v.regId,
                regDate        : v.regDate,
                updId          : v.updId,
                updDate        : v.updDate,
            });

            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border    = {
                    top: { style: "thin" }, left: { style: "thin" },
                    bottom: { style: "thin" }, right: { style: "thin" },
                };
            });
            row.height = 18;
        });

        const buffer = await wb.xlsx.writeBuffer();
        const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url    = window.URL.createObjectURL(blob);
        const a      = document.createElement("a");

        a.href     = url;
        a.download = `입고예정확정_${new Date().toISOString().slice(0, 10)}.xlsx`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // 입고예정리스트
    const handlePrintReceiptList = () => {
        showAlert('구현 예정 기능입니다.');
    }

    // 입고확정
    const handleSaveReceiptConfirm = () => {
        const chkList = receiptList.filter(v => v.chk === '1');

        if (chkList.length === 0) {
            showAlert('체크 항목이 없습니다. 최소 1건 이상 체크해주세요.');
            return;
        }

        let errorMsg = '';
        let focusKey = '';
        let rowIdx   = -1;

        receiptList.forEach((data, idx) => {
            if (errorMsg) return;
            if (data.chk !== '1') return;

            const inNo = data.inNo;

            if (data.status === '09') {
                errorMsg = `입고번호 : ${inNo} 이미 입고완료된 항목이 있습니다.`;
                rowIdx   = idx;
            } else if (!data.vendorNm.trim()) {
                errorMsg = `입고번호 : ${inNo} 기준정보에 거래처 정보가 없습니다.`;
                rowIdx   = idx;
            } else if (!data.prodNm.trim()) {
                errorMsg = `입고번호 : ${inNo} 기준정보에 품목 정보가 없습니다.`;
                rowIdx   = idx;
            } else if (!data.inZoneNm.trim()) {
                errorMsg = `입고번호 : ${inNo} 기준정보에 존 정보가 없습니다.`;
                rowIdx   = idx;
            } else if (!data.inLocCd.trim()) {
                errorMsg = `입고번호 : ${inNo} 기준정보에 로케이션 정보가 없습니다.`;
                rowIdx   = idx;
            } else if (Number(data.originalQty) > Number(data.expectedQty) && !data.notRsnCd.trim()) {
                errorMsg = `입고번호 : ${inNo} 해당 항목의 결품 사유코드를 입력하세요.`;
                focusKey = `${idx}_notRsnCd`;
                rowIdx   = idx;
            }
        });

        if (errorMsg) {
            showAlert(errorMsg, () => {
                setTimeout(() => {
                    if (rowIdx >= 0) {
                        rowRefs.current.get(rowIdx)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    if (focusKey) {
                        cellRefs.current.get(focusKey)?.focus();
                    }
                }, 50);
            });
            return;
        }

        showConfirm('입고확정 처리하시겠습니까?', () => {
            const payload = getTokenPayload();
            const userId  = payload?.userId ?? '';

            saveReceiptConfirm(
                {
                    list: chkList.map(v => ({
                        srvcCd        : v.srvcCd,
                        whCd          : v.whCd,
                        inNo          : v.inNo,
                        inExpectedSeq : v.inExpectedSeq,
                        expectedQty   : v.expectedQty,
                        receivedQty   : v.expectedQty,
                        notRsnCd      : v.notRsnCd,
                        userId        : userId
                    }))
                },
                (res) => {
                    showAlert(res.resultMessage);
                    handleSearch();
                },
                (err) => showAlert('입고확정 실패: ' + err?.message)
            );
        });
    }

    // 입고상태별 출력(스타일적용)
    const getStatusBadge = (status: string) => {
        switch (status) {
            case '00': return <span className={badgePlan}>입고예정</span>;
            case '01': return <span className={badgePartial}>부분입고</span>;
            case '09': return <span className={badgeConf}>입고확정</span>;
            default:  return <span>{status}</span>;
        }
    };

    // 예정수량 '0' 일괄적용(미입고사유 추가)
    const handleSetInNotRsnCd = () => {
        const chkList = receiptList.filter(v => v.chk === '1');

        if (chkList.length === 0) {
            showAlert('체크 항목이 없습니다. 최소 1건이상 체크해주세요.');
            return;
        }

        setReceiptList(prev => prev.map(row =>
            row.chk === '1' ?
            {
                ...row,
                notRsnCd    : notRsnCd,
                expectedQty : '0'
            } : row
        ));
    }

    // 비고저장
    const handleSaveRemark = () => {
        const chkList = receiptList.filter(v => v.chk === '1');

        if (chkList.length === 0) {
            showAlert('체크 항목이 없습니다. 최소 1건 이상 체크해주세요.');
            return;
        }

        var srvcCdIdx       = receiptList.findIndex(v => v.chk === '1' && !v.srvcCd);
        var whCdIdx         = receiptList.findIndex(v => v.chk === '1' && !v.whCd);
        var inNoIdx         = receiptList.findIndex(v => v.chk === '1' && !v.inNo);
        var inExptSeqIdx    = receiptList.findIndex(v => v.chk === '1' && !v.inExpectedSeq);

        if (srvcCdIdx !== -1) {
            showAlert("고객사 코드를 확인해주세요.");
            return;
        }

        if (whCdIdx !== -1) {
            showAlert("센터 코드를 확인해주세요.");
            return;
        }

        if (inNoIdx !== -1) {
            showAlert("입고번호를 확인해주세요.");
            return;
        }

        if (inExptSeqIdx !== -1) {
            showAlert("입고순번을 확인해주세요.");
            return;
        }

        showConfirm('비고를 저장하시겠습니까?', () => {
            const payload = getTokenPayload();
            const userId  = payload?.userId ?? '';

            saveRemarkInfo(
                {
                    list: chkList.map(v => ({
                        srvcCd        : v.srvcCd,
                        whCd          : v.whCd,
                        inNo          : v.inNo,
                        inExpectedSeq : v.inExpectedSeq,
                        rmk           : v.rmk,
                        userId        : userId
                    }))
                },
                (res) => {
                    showAlert(res.resultMessage);
                    handleSearch();
                },
                (err) => showAlert('비고 저장 실패: ' + err?.message)
            );
        });
    }

    // 체크박스 : 선택
    const handleSelectRow = (idx: number) => {
        setReceiptList(prev => prev.map((r, i) => i === idx ? { ...r, chk: r.chk === '1' ? '0' : '1' } : r));
    };

    // 체크박스 : 전체선택
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setReceiptList(prev => prev.map(r => ({ ...r, chk: val })));
    };

    // 해당 셀 컴포넌트 값 변경 이벤트
    const handleCellChange = (idx : number, field : keyof ReceiptRow, value : string) => {
        setReceiptList(prev => prev.map((v, i) => i === idx ? {...v, [field] : value } : v));
    }

    const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
    const setRowRef = (idx: number) => (el: HTMLTableRowElement | null) => {
        if (el) rowRefs.current.set(idx, el);
        else rowRefs.current.delete(idx);
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
                                <h3 className="font-display text-xl font-bold text-slate-950">입고예정/입고확정</h3>
                                <p className="mt-1 text-sm text-muted">입고 예정 내역을 확인하고 확정 처리를 관리합니다.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnPrimary} onClick={handleSearch}>
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                    조회
                                </button>
                                <button className={btnOutline} onClick={handleExcel}>
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    엑셀
                                </button>
                                <button className={btnOutline} onClick={handlePrintReceiptList}>
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    입고예정리스트발행
                                </button>
                                <button className={btnBlue} onClick={handleSaveReceiptConfirm}>
                                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                                    입고확정
                                </button>
                            </div>
                        </div>

                        {/* Filter — 4컬럼 × 4행 */}
                        <div className={filterBox}>
                            <div className={filterGrid}>
                                {/* 1행 */}
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
                                    <label className={filterLabel}>입고구분</label>
                                    <select className={filterSelect} value={searchInCategory} onChange={e => setSearchInCategory(e.target.value)}>
                                        <option value="">전체</option>
                                        {
                                            receiptCategory.map(t => (
                                                <option key={t.sysCd} value={t.sysCd}>{t.sysCdNm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>입고상태</label>
                                    <select className={filterSelect} value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                        <option value="">전체</option>
                                        {
                                            receiptStatus.map(t => (
                                                <option key={t.sysCd} value={t.sysCd}>{t.sysCdNm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                {/* 2행 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>입고번호</label>
                                    <input type="text" className={filterInput} placeholder="입고번호" value={searchInNo} onChange={e => setSearchInNo(e.target.value)} />
                                </div>
                                <div className={filterItem}>
                                    <label className={filterLabel}>수불유형</label>
                                    <select className={filterSelect} value={searchInType} onChange={e => setSearchInType(e.target.value)}>
                                        <option value="">전체</option>
                                        {
                                            receiptType.map(t => (
                                                <option key={t.sysCd} value={t.sysCd}>{t.sysCdNm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-span-2 flex min-w-0 flex-col gap-1.5">
                                    <label className={filterLabel}>기간</label>
                                    <div className="flex items-center gap-2">
                                        <select className="h-9 w-32 shrink-0 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none appearance-none focus:border-primary" value={searchDateType} onChange={e => setSearchDateType(e.target.value)}>
                                            <option value="00">입고예정일</option>
                                            <option value="09">입고완료일</option>
                                        </select>
                                        <div className="flex flex-1 items-center gap-2">
                                            <div className="datepicker-wrapper relative flex-1">
                                                <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[16px]">calendar_today</span>
                                                <DatePicker
                                                    selected={searchStrDate ? new Date(`${searchStrDate.slice(0,4)}-${searchStrDate.slice(4,6)}-${searchStrDate.slice(6,8)}`) : null}
                                                    onChange={(date: Date | null) => setSearchStrDate(date ? formatDate(date) : '')}
                                                    dateFormat="yyyy-MM-dd"
                                                    locale={ko}
                                                    placeholderText="시작일"
                                                    isClearable
                                                    popperContainer={CalendarPortal}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400 shrink-0">~</span>
                                            <div className="datepicker-wrapper relative flex-1">
                                                <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[16px]">calendar_today</span>
                                                <DatePicker
                                                    selected={searchEndDate ? new Date(`${searchEndDate.slice(0,4)}-${searchEndDate.slice(4,6)}-${searchEndDate.slice(6,8)}`) : null}
                                                    onChange={(date: Date | null) => setSearchEndDate(date ? formatDate(date) : '')}
                                                    dateFormat="yyyy-MM-dd"
                                                    locale={ko}
                                                    placeholderText="종료일"
                                                    isClearable
                                                    popperContainer={CalendarPortal}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* 3행 */}
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>매입처</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchClientCd} onChange={e => { setSearchClientCd(e.target.value); setSearchClientNm(''); }} placeholder=""/>
                                        <button className={filterSearchBtn} onClick={() => openClientSearch((clientCd, clientNm) => { setSearchClientCd(clientCd); setSearchClientNm(clientNm); }, searchClientCd)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} value={searchClientNm} onChange={e => setSearchClientNm(e.target.value)} placeholder="" readOnly/>
                                    </div>
                                </div>
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>품번</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchProdCd} onChange={e => { setSearchProdCd(e.target.value); setSearchProdNm(''); }} placeholder=""/>
                                        <button className={filterSearchBtn} onClick={() => openProdSearch((prodCd, prodNm) => { setSearchProdCd(prodCd); setSearchProdNm(prodNm); }, searchProdCd)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} value={searchProdNm} onChange={e => setSearchProdNm(e.target.value)} placeholder="" readOnly/>
                                    </div>
                                </div>
                                {/* 4행 */}
                                <div className={filterItemWide}>
                                    <label className={filterLabel}>차량번호</label>
                                    <div className={filterInputGroup}>
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15" onChange={e => { setSearchVehicleNo(e.target.value); setSearchDrvNm(''); }} value={searchVehicleNo} placeholder=""/>
                                        <button className={filterSearchBtn} onClick={() => openVehicleSearch((vehicleNo, drvNm) => { setSearchVehicleNo(vehicleNo); setSearchDrvNm(drvNm); }, searchVehicleNo)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} value={searchDrvNm} onChange={e => setSearchDrvNm(e.target.value)} placeholder="" readOnly/>
                                    </div>
                                </div>
                                <div className={filterItem}/>
                                <div className={filterItem}/>
                            </div>
                        </div>

                        {/* Toolbar — 우측만 */}
                        <div className={toolbar}>
                            <div className={toolbarGroup}>
                                <button className={btnToolbar} onClick={handleSetInNotRsnCd}>
                                    <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                                    예정수량 '0' 일괄적용
                                </button>
                                <select className={selectToolbar} value={notRsnCd} onChange={e => setNotRsnCd(e.target.value)}>
                                    <option value="">** 선택 **</option>
                                    {
                                        inNotRsnCd.map(t => (
                                            <option key={t.srvcCd} value={t.sysCd}>{t.sysCd} | {t.sysCdNm}</option>
                                        ))
                                    }
                                </select>
                                <button className={btnToolbar} onClick={handleSaveRemark}>
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                    비고저장
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={tableWrapper}>
                        <table className={tableClass}>
                            <colgroup>
                                {/* 체크박스 */}
                                <col style={{ width: '40px' }} />
                                {/* 고객사 */}
                                <col style={{ width: '150px' }} />
                                {/* 센터 */}
                                <col style={{ width: '180px' }} />
                                {/* 입고예정일 */}
                                <col style={{ width: '150px' }} />
                                {/* 입고번호 */}
                                <col style={{ width: '200px' }} />
                                {/* 입고순번 */}
                                <col style={{ width: '80px' }} />
                                {/* 입고상태(헤더) */}
                                <col style={{ width: '150px' }} />
                                {/* 입고상태 */}
                                <col style={{ width: '150px' }} />
                                {/* 입고구분 */}
                                <col style={{ width: '120px' }} />
                                {/* 수불유형 */}
                                <col style={{ width: '120px' }} />
                                {/* 입고완료일 */}
                                <col style={{ width: '150px' }} />
                                {/* 매입처코드 */}
                                <col style={{ width: '150px' }} />
                                {/* 매입처명 */}
                                <col style={{ width: '250px' }} />
                                {/* 품번 */}
                                <col style={{ width: '150px' }} />
                                {/* 품명 */}
                                <col style={{ width: '300px' }} />
                                {/* 존 */}
                                <col style={{ width: '100px' }} />
                                {/* 존명 */}
                                <col style={{ width: '150px' }} />
                                {/* 로케이션 */}
                                <col style={{ width: '180px' }} />
                                {/* 수량 그룹 */}
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                {/* 스캔정보 그룹 */}
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                {/* 미입고사유 */}
                                <col style={{ width: '200px' }} />
                                {/* 업체주소 */}
                                <col style={{ width: '300px' }} />
                                {/* 우편번호 */}
                                <col style={{ width: '120px' }} />
                                {/* 담당자 */}
                                <col style={{ width: '120px' }} />
                                {/* 연락처 */}
                                <col style={{ width: '150px' }} />
                                {/* 차량번호 */}
                                <col style={{ width: '180px' }} />
                                {/* 기사명 */}
                                <col style={{ width: '150px' }} />
                                {/* PDA작업여부 */}
                                <col style={{ width: '120px' }} />
                                {/* 비고 */}
                                <col style={{ width: '350px' }} />
                                {/* 등록자 */}
                                <col style={{ width: '90px' }} />
                                {/* 등록일자 */}
                                <col style={{ width: '220px' }} />
                                {/* 수정자 */}
                                <col style={{ width: '90px' }} />
                                {/* 수정일자 */}
                                <col style={{ width: '220px' }} />
                            </colgroup>
                            <thead className={theadClass}>
                                <tr>
                                    <th rowSpan={2} className={thCell}>
                                        <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                            onChange={handleSelectAll}
                                            checked={receiptList.length > 0 && receiptList.every(r => r.chk === '1')} />
                                    </th>
                                    <th rowSpan={2} className={thCell}>고객사</th>
                                    <th rowSpan={2} className={thCell}>센터</th>
                                    <th rowSpan={2} className={thCell}>입고예정일</th>
                                    <th rowSpan={2} className={thCell}>입고번호</th>
                                    <th rowSpan={2} className={thCell}>입고순번</th>
                                    <th rowSpan={2} className={thCell}>입고상태(전체)</th>
                                    <th rowSpan={2} className={thCell}>입고상태</th>
                                    <th rowSpan={2} className={thCell}>입고구분</th>
                                    <th rowSpan={2} className={thCell}>수불유형</th>
                                    <th rowSpan={2} className={thCell}>입고완료일</th>
                                    <th rowSpan={2} className={thCell}>매입처코드</th>
                                    <th rowSpan={2} className={thCell}>매입처명</th>
                                    <th rowSpan={2} className={thCell}>품번</th>
                                    <th rowSpan={2} className={thCell}>품명</th>
                                    <th rowSpan={2} className={thCell}>존</th>
                                    <th rowSpan={2} className={thCell}>존명</th>
                                    <th rowSpan={2} className={thCell}>로케이션</th>
                                    <th colSpan={4} className={thGroupQty}>수량</th>
                                    <th colSpan={2} className={thGroupScan}>스캔정보</th>
                                    <th rowSpan={2} className={thCell}>미입고사유</th>
                                    <th rowSpan={2} className={thCell}>업체주소</th>
                                    <th rowSpan={2} className={thCell}>우편번호</th>
                                    <th rowSpan={2} className={thCell}>담당자</th>
                                    <th rowSpan={2} className={thCell}>연락처</th>
                                    <th rowSpan={2} className={thCell}>차량번호</th>
                                    <th rowSpan={2} className={thCell}>기사명</th>
                                    <th rowSpan={2} className={thCell}>PDA작업여부</th>
                                    <th rowSpan={2} className={thCell}>비고</th>
                                    <th rowSpan={2} className={thCell}>등록자</th>
                                    <th rowSpan={2} className={thCell}>등록일자</th>
                                    <th rowSpan={2} className={thCell}>수정자</th>
                                    <th rowSpan={2} className={thCell}>수정일자</th>
                                </tr>
                                <tr>
                                    <th className={thGroupSubQty}>원주문량</th>
                                    <th className={thGroupSubQty}>예정수량</th>
                                    <th className={thGroupSubQty}>확정수량</th>
                                    <th className={thGroupSubQty}>총중량</th>
                                    <th className={thGroupSubScan}>스캔수량</th>
                                    <th className={thGroupSubScan}>스캔건수</th>
                                </tr>
                            </thead>
                            <tbody className={tbodyClass}>
                                {receiptList.length === 0 ? (
                                    <tr>
                                        <td colSpan={36} className={emptyCell}>
                                            <span className="material-symbols-outlined text-[2rem] block">inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : receiptList.map((v, idx) => (
                                    <tr key={idx} ref={setRowRef(idx)} className="hover:bg-slate-50" onClick={() => handleSelectRow(idx)}>
                                        <td className={cellCenter}>
                                            <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary" checked={v.chk === '1'} onChange={() => {}} />
                                        </td>
                                        <td className={cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd)(srvcList.find( s => s.srvcCd === v.srvcCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : v.whCd)(whList.find( w => w.whCd === v.whCd)) }
                                        </td>
                                        <td className={cellCenter}>{v.inExpectedDate}</td>
                                        <td className={cellCenter}>{v.inNo}</td>
                                        <td className={cellCenter}>{v.inExpectedSeq}</td>
                                        <td className={cellCenter}>{getStatusBadge(v.totalStatus)}</td>
                                        <td className={cellCenter}>{getStatusBadge(v.status)}</td>
                                        <td className={cellCenter}>
                                            { (c => c ? `${c.sysCdNm}` : v.receiptClsCd)(receiptCategory.find(c => c.sysCd === v.receiptClsCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            { (c => c ? `${c.sysCdNm}` : v.receiptType)(receiptType.find(c => c.sysCd === v.receiptType)) }
                                        </td>
                                        <td className={cellCenter}>{v.receiptDate}</td>
                                        <td className={cellCenter}>{v.vendorCd}</td>
                                        <td className={cellMedium}>{v.vendorNm}</td>
                                        <td className={cellCenter}>{v.prodCd}</td>
                                        <td className={cellMedium}>{v.prodNm}</td>
                                        <td className={cellCenter}>{v.inZoneCd}</td>
                                        <td className={cellCenter}>{v.inZoneNm}</td>
                                        <td className={cellCenter}>{v.inLocCd}</td>
                                        <td className={cellRight}>{v.originalQty}</td>
                                        <td className={cellRight}>
                                            <input type='text' className={`${cellInput} text-right tabular-nums`} value={v.expectedQty} onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) handleCellChange(idx, 'expectedQty', e.target.value); }} ref={setCellRef(idx, "expectedQty") as any} readOnly={v.status === '09'} />
                                        </td>
                                        <td className={cellRight}>{v.receivedQty}</td>
                                        <td className={cellRight}>{v.totInWeight}</td>
                                        <td className={cellRight}>{v.pdaScanQty}</td>
                                        <td className={cellRight}>{v.pdaScanCnt}</td>
                                        <td className={cellCenter}>
                                            <select className={cellInput} value={v.notRsnCd}
                                                onChange={e => handleCellChange(idx, 'notRsnCd', e.target.value)}
                                                ref={setCellRef(idx, "notRsnCd") as any}>
                                                <option value="">-- 선택 --</option>
                                                { inNotRsnCd.map(t => (
                                                    <option key={t.sysCd} value={t.sysCd}>{t.sysCd} | {t.sysCdNm}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={cellCenter}>{v.vendorAddress}</td>
                                        <td className={cellCenter}>{v.zipCd}</td>
                                        <td className={cellCenter}>{v.managerNm}</td>
                                        <td className={cellCenter}>{v.telNo}</td>
                                        <td className={cellCenter}>{v.inVNo}</td>
                                        <td className={cellCenter}>{v.inVNm}</td>
                                        <td className={cellCenter}>{v.pdaYn}</td>
                                        <td className={cellDim}>
                                            <input type='text' className={cellInput} value={v.rmk} onChange={e => handleCellChange(idx, 'rmk', e.target.value)}/>
                                        </td>
                                        <td className={cellCenter}>{v.regId}</td>
                                        <td className={cellCenter}>{v.regDate}</td>
                                        <td className={cellCenter}>{v.updId}</td>
                                        <td className={cellCenter}>{v.updDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="shrink-0 border-t border-slate-100 px-4 py-2">
                        <span className="text-xs text-muted">총 {receiptList.length} 건</span>
                    </div>
                </div>
            </div>
        </div>

        </>
    );
};

export default CJ_WMS_RECEIPT_0020;
