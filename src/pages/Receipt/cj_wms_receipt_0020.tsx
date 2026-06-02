import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 모듈 CSS
import styles from './cj_wms_receipt_0020.module.css';
// 공통서비스
import { getCommCodeList, type CommCode } from '../../api/common/commonService';
// 공통 컴포넌트
import ClientSearchPopup  from '../../components/common/ClientSearchPopup';
import Popup from '../../components/common/Popup';
import ProdSearchPopup    from '../../components/common/ProdSearchPopup';
import VehicleSearchPopup from '../../components/common/VehicleSearchPopup';
import { formatDate } from '../../utils/dateUtils';
import { useCommonWhList } from '../../api/common/commonWhList';
import { usePopup } from '../../components/common/usePopup';
// API
import { getList, saveReceiptConfirm, saveRemarkInfo, type ReceiptRow } from '../../api/receipt/receipt_0020Service'
// 엑셀
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

const CJ_WMS_RECEIPT_0020: React.FC = () => {
    // 공통
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    const { popup, showAlert, showConfirm, closePopup }     = usePopup();
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

    // 팝업관리
    const [isClientPopupOpen,    setIsClientPopupOpen]      = useState(false);
    const [isProdPopupOpen,      setIsProdPopupOpen]        = useState(false);
    const [isVehiclePopupOpen,   setIsVehiclePopupOpen]     = useState(false);

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
                  sys_grp_cd    : 'WM0020'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : ''
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setReceiptCategory(res.data ?? []),
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );

        // 입고상태
        getCommCodeList(
            {
                  sys_grp_cd    : 'WM0010'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : ''
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setReceiptStatus(res.data ?? []),
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );

        // 수불유형
        getCommCodeList(
            {
                  sys_grp_cd    : 'WM0030'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : '1201'
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setReceiptType(res.data ?? []),
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );

        // 수불유형
        getCommCodeList(
            {
                  sys_grp_cd    : 'WM1090'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : ''
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setInNotRsnCd(res.data ?? []),
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
                receiptClsCd   : receiptCategory.find(c => c.sys_cd === v.receiptClsCd)?.sys_cdnm ?? v.receiptClsCd,
                receiptType    : receiptType.find(c => c.sys_cd === v.receiptType)?.sys_cdnm ?? v.receiptType,
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
                notRsnCd       : inNotRsnCd.find(c => c.sys_cd === v.notRsnCd)?.sys_cdnm ?? v.notRsnCd,
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
            closePopup();

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
            case '00': return <span className={styles.badgePlan}>입고예정</span>;
            case '01': return <span className={styles.badgePartial}>부분입고</span>;
            case '09': return <span className={styles.badgeConf}>입고확정</span>;
            default:  return <span>{status}</span>;
        }
    };

    // 예정수량 '0' 일괄적용(미압고사유 추가)
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
            closePopup();

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

    // 이벤트 : 매입처검색
    const handleClientSelect = (clientCd: string, clientNm: string) => {
        setSearchClientCd(clientCd);
        setSearchClientNm(clientNm);
    };

    // 이벤트 : 품목검색
    const handleProdSelect = (prodCd: string, prodNm: string) => {
        setSearchProdCd(prodCd);
        setSearchProdNm(prodNm);
    };

    // 이벤트 : 차량검색
    const handleVehicleSelect = (vehicleNo: string, drvNm: string) => {
        setSearchVehicleNo(vehicleNo);
        setSearchDrvNm(drvNm);
    };

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
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        {/* Title Row */}
                        <div className={styles.titleRow}>
                            <div className={styles.titleArea}>
                                <h3>입고예정/입고확정</h3>
                                <p>입고 예정 내역을 확인하고 확정 처리를 관리합니다.</p>
                            </div>
                            <div className={styles.mainActions}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                    조회
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExcel}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                                    엑셀
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handlePrintReceiptList}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                                    입고예정리스트발행
                                </button>
                                <button className={`${styles.btn} ${styles.btnBlue}`} onClick={handleSaveReceiptConfirm}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task_alt</span>
                                    입고확정
                                </button>
                            </div>
                        </div>

                        {/* Filter — 4컬럼 × 4행 */}
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                {/* 1행 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>고객사</label>
                                    <select className={styles.filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => (
                                            <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => (
                                            <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고구분</label>
                                    <select className={styles.filterSelect} value={searchInCategory} onChange={e => setSearchInCategory(e.target.value)}>
                                        <option value="">전체</option>
                                        {
                                            receiptCategory.map(t => (
                                                <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cdnm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고상태</label>
                                    <select className={styles.filterSelect} value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                        <option value="">전체</option>
                                        {
                                            receiptStatus.map(t => (
                                                <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cdnm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                {/* 2행 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고번호</label>
                                    <input type="text" className={styles.filterInput} placeholder="입고번호" value={searchInNo} onChange={e => setSearchInNo(e.target.value)} />
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>수불유형</label>
                                    <select className={styles.filterSelect} value={searchInType} onChange={e => setSearchInType(e.target.value)}>
                                        <option value="">전체</option>
                                        {
                                            receiptType.map(t => (
                                                <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cdnm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className={styles.filterItemDate}>
                                    <label className={styles.filterLabel}>기간</label>
                                    <div className={styles.filterDateGroup}>
                                        <select className={styles.filterSelectNarrow} value={searchDateType} onChange={e => setSearchDateType(e.target.value)}>
                                            <option value="00">입고예정일</option>
                                            <option value="09">입고완료일</option>
                                        </select>
                                        <div className={styles.filterDateRange}>
                                            <div className={styles.filterDateWrapper}>
                                                <span className={`material-symbols-outlined ${styles.filterDateIcon}`}>calendar_today</span>
                                                <DatePicker
                                                    selected={searchStrDate ? new Date(`${searchStrDate.slice(0,4)}-${searchStrDate.slice(4,6)}-${searchStrDate.slice(6,8)}`) : null}
                                                    onChange={(date: Date | null) => setSearchStrDate(date ? formatDate(date) : '')}
                                                    dateFormat="yyyy-MM-dd"
                                                    locale={ko}
                                                    placeholderText="시작일"
                                                    isClearable
                                                />
                                            </div>
                                            <span className={styles.filterDateSep}>~</span>
                                            <div className={styles.filterDateWrapper}>
                                                <span className={`material-symbols-outlined ${styles.filterDateIcon}`}>calendar_today</span>
                                                <DatePicker
                                                    selected={searchEndDate ? new Date(`${searchEndDate.slice(0,4)}-${searchEndDate.slice(4,6)}-${searchEndDate.slice(6,8)}`) : null}
                                                    onChange={(date: Date | null) => setSearchEndDate(date ? formatDate(date) : '')}
                                                    dateFormat="yyyy-MM-dd"
                                                    locale={ko}
                                                    placeholderText="종료일"
                                                    isClearable
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* 3행 */}
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>매입처</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchClientCd} placeholder=""/>
                                        <button className={styles.filterSearchBtn} onClick={() => setIsClientPopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchClientNm} placeholder="" readOnly/>
                                    </div>
                                </div>
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>품번</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchProdCd} placeholder=""/>
                                        <button className={styles.filterSearchBtn} onClick={() => setIsProdPopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchProdNm} placeholder="" readOnly/>
                                    </div>
                                </div>
                                {/* 4행 */}
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>차량번호</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchVehicleNo} placeholder=""/>
                                        <button className={styles.filterSearchBtn} onClick={() => setIsVehiclePopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchDrvNm} placeholder="" readOnly/>
                                    </div>
                                </div>
                                <div className={styles.filterItem}/>
                                <div className={styles.filterItem}/>
                            </div>
                        </div>

                        {/* Toolbar — 우측만 */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar} onClick={handleSetInNotRsnCd}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>format_list_numbered</span>
                                    예정수량 '0' 일괄적용
                                </button>
                                <select className={styles.selectToolbar} value={notRsnCd} onChange={e => setNotRsnCd(e.target.value)}>
                                    <option value="">** 선택 **</option>
                                    {
                                        inNotRsnCd.map(t => (
                                            <option key={t.srvc_cd} value={t.sys_cd}>{t.sys_cd} | {t.sys_cdnm}</option>
                                        ))
                                    } 
                                </select>
                                <button className={styles.btnToolbar} onClick={handleSaveRemark}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                                    비고저장
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
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
                            <thead className={styles.thead}>
                                <tr>
                                    <th rowSpan={2}>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleSelectAll}
                                            checked={receiptList.length > 0 && receiptList.every(r => r.chk === '1')} />
                                    </th>
                                    <th rowSpan={2}>고객사</th>
                                    <th rowSpan={2}>센터</th>
                                    <th rowSpan={2}>입고예정일</th>
                                    <th rowSpan={2}>입고번호</th>
                                    <th rowSpan={2}>입고순번</th>
                                    <th rowSpan={2}>입고상태</th>
                                    <th rowSpan={2}>입고구분</th>
                                    <th rowSpan={2}>수불유형</th>
                                    <th rowSpan={2}>입고완료일</th>
                                    <th rowSpan={2}>매입처코드</th>
                                    <th rowSpan={2}>매입처명</th>
                                    <th rowSpan={2}>품번</th>
                                    <th rowSpan={2}>품명</th>
                                    <th rowSpan={2}>존</th>
                                    <th rowSpan={2}>존명</th>
                                    <th rowSpan={2}>로케이션</th>
                                    <th colSpan={4} className={styles.thGroupQty}>수량</th>
                                    <th colSpan={2} className={styles.thGroupScan}>스캔정보</th>
                                    <th rowSpan={2}>미입고사유</th>
                                    <th rowSpan={2}>업체주소</th>
                                    <th rowSpan={2}>우편번호</th>
                                    <th rowSpan={2}>담당자</th>
                                    <th rowSpan={2}>연락처</th>
                                    <th rowSpan={2}>차량번호</th>
                                    <th rowSpan={2}>기사명</th>
                                    <th rowSpan={2}>PDA작업여부</th>
                                    <th rowSpan={2}>비고</th>
                                    <th rowSpan={2}>등록자</th>
                                    <th rowSpan={2}>등록일자</th>
                                    <th rowSpan={2}>수정자</th>
                                    <th rowSpan={2}>수정일자</th>
                                </tr>
                                <tr>
                                    <th className={styles.thGroupSubQty}>원주문량</th>
                                    <th className={styles.thGroupSubQty}>예정수량</th>
                                    <th className={styles.thGroupSubQty}>확정수량</th>
                                    <th className={styles.thGroupSubQty}>총중량</th>
                                    <th className={styles.thGroupSubScan}>스캔수량</th>
                                    <th className={styles.thGroupSubScan}>스캔건수</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {receiptList.length === 0 ? (
                                    <tr>
                                        <td colSpan={36} className={styles.emptyCell}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block' }}>inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : receiptList.map((v, idx) => (
                                    <tr key={idx} ref={setRowRef(idx)} onClick={() => handleSelectRow(idx)}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox} checked={v.chk === '1'} onChange={() => {}} />
                                        </td>
                                        <td className={styles.cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd)(srvcList.find( s => s.srvcCd === v.srvcCd)) }
                                        </td>
                                        <td className={styles.cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : v.whCd)(whList.find( w => w.whCd === v.whCd)) }
                                        </td>
                                        <td className={styles.cellCenter}>{v.inExpectedDate}</td>
                                        <td className={styles.cellCenter}>{v.inNo}</td>
                                        <td className={styles.cellCenter}>{v.inExpectedSeq}</td>
                                        <td className={styles.cellCenter}>{getStatusBadge(v.status)}</td>
                                        <td className={styles.cellCenter}>
                                            { (c => c ? `${c.sys_cdnm}` : v.receiptClsCd)(receiptCategory.find(c => c.sys_cd === v.receiptClsCd)) }
                                        </td>
                                        <td className={styles.cellCenter}>
                                            { (c => c ? `${c.sys_cdnm}` : v.receiptType)(receiptType.find(c => c.sys_cd === v.receiptType)) }
                                        </td>
                                        <td className={styles.cellCenter}>{v.receiptDate}</td>
                                        <td className={styles.cellCenter}>{v.vendorCd}</td>
                                        <td className={styles.cellMedium}>{v.vendorNm}</td>
                                        <td className={styles.cellCenter}>{v.prodCd}</td>
                                        <td className={styles.cellMedium}>{v.prodNm}</td>
                                        <td className={styles.cellCenter}>{v.inZoneCd}</td>
                                        <td className={styles.cellCenter}>{v.inZoneNm}</td>
                                        <td className={styles.cellCenter}>{v.inLocCd}</td>
                                        <td className={styles.cellRight}>{v.originalQty}</td>
                                        <td className={styles.cellRight}>
                                            <input type='text' className={`${styles.cellInput} ${styles.cellRight}`} value={v.expectedQty} onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) handleCellChange(idx, 'expectedQty', e.target.value); }} ref={setCellRef(idx, "expectedQty") as any} readOnly={v.status === '09'} />
                                        </td>
                                        <td className={styles.cellRight}>{v.receivedQty}</td>
                                        <td className={styles.cellRight}>{v.totInWeight}</td>
                                        <td className={styles.cellRight}>{v.pdaScanQty}</td>
                                        <td className={styles.cellRight}>{v.pdaScanCnt}</td>
                                        <td className={styles.cellCenter}>
                                            <select className={styles.cellInput} value={v.notRsnCd}
                                                onChange={e => handleCellChange(idx, 'notRsnCd', e.target.value)}
                                                ref={setCellRef(idx, "notRsnCd") as any}>
                                                <option value="">-- 선택 --</option>
                                                { inNotRsnCd.map(t => (
                                                    <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cd} | {t.sys_cdnm}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={styles.cellCenter}>{v.vendorAddress}</td>
                                        <td className={styles.cellCenter}>{v.zipCd}</td>
                                        <td className={styles.cellCenter}>{v.managerNm}</td>
                                        <td className={styles.cellCenter}>{v.telNo}</td>
                                        <td className={styles.cellCenter}>{v.inVNo}</td>
                                        <td className={styles.cellCenter}>{v.inVNm}</td>
                                        <td className={styles.cellCenter}>{v.pdaYn}</td>
                                        <td className={styles.cellDim}>
                                            <input type='text' className={styles.cellInput} value={v.rmk} onChange={e => handleCellChange(idx, 'rmk', e.target.value)}/>
                                        </td>
                                        <td className={styles.cellCenter}>{v.regId}</td>
                                        <td className={styles.cellCenter}>{v.regDate}</td>
                                        <td className={styles.cellCenter}>{v.updId}</td>
                                        <td className={styles.cellCenter}>{v.updDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <Popup
            isOpen={popup.isOpen}
            message={popup.message}
            type={popup.type}
            onConfirm={popup.onConfirm}
            onCancel={closePopup}
        />

        <ClientSearchPopup
            isOpen={isClientPopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            initialClientCd={searchClientCd}
            onSelect={handleClientSelect}
            onClose={() => setIsClientPopupOpen(false)}
        />
        <ProdSearchPopup
            isOpen={isProdPopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            initialProdCd={searchProdCd}
            onSelect={handleProdSelect}
            onClose={() => setIsProdPopupOpen(false)}
        />
        <VehicleSearchPopup
            isOpen={isVehiclePopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            initialVehicleNo={searchVehicleNo}
            onSelect={handleVehicleSelect}
            onClose={() => setIsVehiclePopupOpen(false)}
        />
        </>
    );
};

export default CJ_WMS_RECEIPT_0020;
