import React, { useState, useEffect, useRef } from 'react';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 서비스정보
import { getList, saveClient, deleteClient, getCheckList, type Client, type CheckResult } from '../../api/master/master_0020Service'
// 레이어 팝업
import { usePopupContext } from '../../components/common/PopupProvider';
// 엑셀
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

// ── Tailwind 상수 ──────────────────────────────────────────────
const pageShell     = "flex min-h-0 flex-1 bg-surface";
const contentShell  = "flex min-w-0 flex-1 flex-col";
const sectionCard   = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader = "shrink-0 border-b border-slate-100 p-6";

const btnBase       = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary    = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline    = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;
const btnDanger     = `${btnBase} border border-red-200 bg-white text-danger hover:bg-red-50`;
const btnToolbar    = "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";

const filterBox     = "rounded-lg border border-slate-100 bg-slate-50 p-4";
const filterItem    = "flex min-w-0 flex-col gap-1.5";
const filterLabel   = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect  = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";


const tableWrapper  = "min-h-0 flex-1 overflow-auto";
const cellInput     = "h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const cellCenter    = "px-2 py-2 text-center";

const chipOk    = "inline-flex items-center gap-1 rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white";
const chipError = "inline-flex items-center gap-1 rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap";
// ───────────────────────────────────────────────────────────────

const CJ_WMS_MASTER_0020: React.FC = () => {
    // 정규식
    const hpNoRegx  = /^0\d{1,2}-\d{3,4}-\d{4}$/;
    const emailRegx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    const payload                                           = getTokenPayload();
    
    // 공통 팝업
    const { showAlert, showConfirm, openClientSearch }      = usePopupContext();
    // 조회조건
    const [searchSrvcCd,        setSearchSrvcCd]            = useState(selectSrvcCd);
    const [searchWhCd,          setSearchWhCd]              = useState(selectWhCd);
    const [searchClientCd,      setSearchClientCd]          = useState('');
    const [searchClientNm,      setSearchClientNm]          = useState('');
    const [searchUseYn,         setSearchUseYn]             = useState('');
    // 조회결과
    const [clientList,          setClientList]              = useState<Client[]>([]);
    // 조회실행여부
    const [isSearched,          setIsSearched]              = useState(false);
    // confirm 다이얼로그
    const [isSaved,             setIsSaved]                 = useState(false);
    // 업로드 표시
    const [isUploading,         setIsUploading]             = useState(false); 
    // 거래처 검색 팝업
    // 엑셀문서 입력
    const fileInputRef                                      = useRef<HTMLInputElement>(null);
    
    // 포커싱
    const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd)
    }, [selectWhCd]);

    // 조회
    const handleSearch = () => {
        getList(
            {
                srvcCd      : searchSrvcCd,
                whCd        : searchWhCd,
                clientCd    : searchClientCd,
                clientNm    : searchClientNm,
                useYn       : searchUseYn
            },
            (res) => {
                const rows : Client[] = (res.data ?? []).map((v : any) => ({
                    chk             : v.chk             ?? '',
                    srvcCd          : v.srvc_cd         ?? '',
                    whCd            : v.wh_cd           ?? '',
                    clientCd        : v.client_cd       ?? '',
                    clientNm        : v.client_nm       ?? '',
                    businessNo      : v.business_no     ?? '',
                    bsnTypeNm       : v.bsn_type_nm     ?? '',
                    bsnItemNm       : v.bsn_item_nm     ?? '',
                    presidentNm     : v.president_nm    ?? '',
                    presidentHp     : v.president_hp    ?? '',
                    presidentEmail  : v.president_email ?? '',
                    address         : v.address         ?? '',
                    nationCd        : v.nation_cd       ?? '',
                    zipCd           : v.zip_cd          ?? '',
                    telNo           : v.tel_no          ?? '',
                    tradeType       : v.trade_type      ?? '',
                    useYn           : v.use_yn          ?? '',
                    regId           : v.reg_id          ?? '',
                    regDate         : v.reg_date        ?? '',
                    updId           : v.upd_id          ?? '',
                    updDate         : v.upd_date        ?? '',
                    isNew           : false,
                    isDirty         : false,
                    uploadStatus    : '',
                }));

                setClientList(rows);
                setIsSearched(true);
            },

            (err) => showAlert("조회 실패: " + err?.message)
        );
    }

    // 저장
    const handleSave = () => {
        var list = clientList.filter(v => v.chk === '1');

        // 유효체크 검사
        if (list.length <= 0) {
            showAlert('저장할 항목을 선택해주세요.');
            return;
        }

        var clientCdIdx         = clientList.findIndex(v => v.chk === '1' && !v.clientCd?.trim());
        var businessNoIdx       = clientList.findIndex(v => v.chk === '1' && v.businessNo && v.businessNo.length < 10);
        var presidentHpIdx      = clientList.findIndex(v => v.chk === '1' && v.presidentHp && !hpNoRegx.test(v.presidentHp));
        var presidentEmailIdx   = clientList.findIndex(v => v.chk === '1' && v.presidentEmail && !emailRegx.test(v.presidentEmail));

        if (clientCdIdx !== -1) {
            const el = cellRefs.current.get(`${clientCdIdx}_clientCd`);
            showAlert("거래처코드를 입력하세요.", () => el?.focus());
            return;
        }

        if (businessNoIdx !== -1) {
            const el = cellRefs.current.get(`${businessNoIdx}_businessNo`);
            showAlert('사업자등록번호는 10자리로 입력하세요.', () => el?.focus());
            return;
        }

        if (presidentHpIdx !== -1) {
            const el = cellRefs.current.get(`${presidentHpIdx}_presidentHp`);
            showAlert('연락처를 다시 입력해주세요.', () => el?.focus());
            return;
        }

        if (presidentEmailIdx !== -1) {
            const el = cellRefs.current.get(`${presidentEmailIdx}_presidentEmail`);
            showAlert('이메일 양식을 다시 입력해주세요.', () => el?.focus());
            return;
        }

        showConfirm(`저장하시겠습니까?`, () => {
            setIsSaved(true);

            const clientList = list.map(v => ({
                srvcCd          : v.srvcCd  || selectSrvcCd,
                whCd            : v.whCd    || selectWhCd,
                clientCd        : v.clientCd.trim(),
                clientNm        : v.clientNm.trim(),
                businessNo      : v.businessNo.trim(),
                address         : v.address.trim(),
                nationCd        : v.nationCd.trim(),
                presidentNm     : v.presidentNm.trim(),
                presidentEmail  : v.presidentEmail.trim(),
                presidentHp     : v.presidentHp.trim(),
                bsnTypeNm       : v.bsnTypeNm.trim(),
                bsnItemNm       : v.bsnItemNm.trim(),
                zipCd           : v.zipCd.trim(),
                telNo           : v.telNo.trim().replace(/-/g, ''),
                tradeType       : v.tradeType.trim(),
                useYn           : v.useYn.trim(),
                userId          : payload?.userId ?? ''
            }));

            saveClient(
                { clientList },
                (res) => {
                    setIsSaved(false);
                    showAlert(res.resultMessage ?? '저장되었습니다.', () => handleSearch()); 
                },
                (err) => {
                    setIsSaved(false);
                    showAlert('저장 실패 : ' + err?.message);
                }
            )
        });
    }

    // 삭제
    const handleDelete = () => {
        var list = clientList.filter(v => v.chk === '1')

        // 유효체크 검사
        if (list.length <= 0) {
            showAlert('삭제할 항목을 선택해주세요.');
            return;
        }

        showConfirm(`삭제하시겠습니까?`, () => {
            deleteClient(
                {
                    srvcCd          : list[0].srvcCd,
                    whCd            : list[0].whCd,
                    clientCdList    : list.map(v => ({ clientCd : v.clientCd}))
                },
                () => {
                    showAlert('삭제 되었습니다.', () => handleSearch());
                },
                (err) => showAlert('삭제 실패 : ' + err?.message)
            );
        });
    }

    // 엑셀다운로드
    const handleExcel = async () => {
        if (clientList.length === 0) {
            showAlert('다운로드할 데이터가 없습니다.');
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("거래처관리");

        // 컬럼 정의
        ws.columns = [
            { header: "고객사",         key: "srvcCd",         width: 20 },
            { header: "센터",           key: "whCd",           width: 15 },
            { header: "거래처코드",     key: "clientCd",        width: 18 },
            { header: "거래처명",       key: "clientNm",        width: 18 },
            { header: "사업자번호",     key: "businessNo",      width: 25 },
            { header: "거래처주소",     key: "address",         width: 15 },
            { header: "국가코드",       key: "nationCd",        width: 14 },
            { header: "대표자명",       key: "presidentNm",     width: 15 },
            { header: "이메일주소",     key: "presidentEmail",  width: 14 },
            { header: "연락처",         key: "presidentHp",     width: 14 },
            { header: "사용여부",       key: "useYn",           width: 14 },
            { header: "종목명",         key: "bsnItemNm",       width: 14 },
            { header: "등록자",         key: "regId",           width: 14 },
            { header: "등록일자",       key: "regDate",         width: 14 },
            { header: "수정자",         key: "updId",           width: 14 },
            { header: "수정일자",       key: "updDate",         width: 14 },
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
        clientList.forEach(v => {
            const row = ws.addRow({
                srvcCd          : v.srvcCd,
                whCd            : v.whCd,
                clientCd        : v.clientCd,
                clientNm        : v.clientNm        ?? '',
                businessNo      : v.businessNo      ?? '',
                address         : v.address         ?? '',
                nationCd        : v.nationCd        ?? '',
                presidentNm     : v.presidentNm     ?? '',
                presidentEmail  : v.presidentEmail  ?? '',
                presidentHp     : v.presidentHp     ?? '',
                useYn           : v.useYn           ?? '',
                bsnItemNm       : v.bsnItemNm       ?? '',
                regId           : v.regId           ?? '',
                regDate         : v.regDate         ?? '',
                updId           : v.updId           ?? '',
                updDate         : v.updDate         ?? '',
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
        a.download = `거레처관리_${new Date().toISOString().slice(0, 10)}.xlsx`;

        document.body.appendChild(a);

        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    }

    // 행추가
    const handleAddRow = () => {
        setClientList(prev => [...prev, {
            chk             : '1',
            srvcCd          : selectSrvcCd,
            whCd            : selectWhCd,
            clientCd        : '',
            clientNm        : '',
            businessNo      : '',
            bsnTypeNm       : '',
            address         : '',
            nationCd        : '',
            zipCd           : '',
            telNo           : '',
            presidentNm     : '',
            presidentEmail  : '',
            presidentHp     : '',
            useYn           : 'Y',
            bsnItemNm       : '',
            regId           : '',
            regDate         : '',
            tradeType       : '',
            updId           : '',
            updDate         : '',
            isNew           : true,
            isDirty         : false,
            uploadStatus    : ''
        }]);
    }

    // 행삭제
    const handleDeleteRow = () => {
        // 1. 신규 인덱스를 검색
        const lastNewIdx = clientList.map((v, idx) => v.isNew ? idx : -1).filter(idx => idx >= 0).pop();

        if (lastNewIdx === undefined) {
            return;
        }

        // 2. 행삭제 (_ : 값을 사용하지 않음)
        setClientList(prev => prev.filter((_, idx) => idx !== lastNewIdx));
    }

    // 양식다운로드
    const handleTempletDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("품목관리_양식");

        ws.columns = [
            { header: "고객사",         key: "srvcCd",          width: 20 },
            { header: "센터",           key: "whCd",            width: 20 },
            { header: "거래처코드",     key: "clientCd",        width: 20 },
            { header: "거래처명",       key: "clientNm",        width: 15 },
            { header: "사업자번호",     key: "businessNo",      width: 25 },
            { header: "거래처주소",     key: "address",         width: 18 },
            { header: "국가코드",       key: "nationCd",        width: 18 },
            { header: "대표자명",       key: "presidentNm",     width: 18 },
            { header: "대표자 E-MAIL",  key: "presidentEmail",  width: 18 },
            { header: "연락처",         key: "presidentHp",     width: 18 }
        ];

        const exampleRows = [
            { srvcCd: selectSrvcCd, whCd: selectWhCd, clientCd: '888888', clientNm: '㈜대동상사', businessNo : '3128510164', address : '충남 아산시 인주면 현대로 1077', nationCd : 'KR', presidentNm : '김충훤', presidentEmail : 'wms01@cjlogistics.com', presidentHp : '5267-8892' },
            { srvcCd: selectSrvcCd, whCd: selectWhCd, clientCd: '999999', clientNm: '㈜명강기업', businessNo : '1338500011', address : '경기 광명시 소하동 781-1번지', nationCd : 'KR', presidentNm : '서복동', presidentEmail : 'wms02@cjlogistics.com', presidentHp : '6562-8732' }
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
        a.download      = "거래처관리_양식.xlsx";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // 엑셀업로드
    const handleExcelUpload = (e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const newItems: Client[] = rows.slice(1)
                .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
                .map(row => ({
                    chk             : '1',
                    srvcCd          : String(row[0]  ?? selectSrvcCd).trim(),
                    whCd            : String(row[1]  ?? selectWhCd).trim(),
                    clientCd        : String(row[2]  ?? '').trim(),
                    clientNm        : String(row[3]  ?? '').trim(),
                    businessNo      : String(row[4]  ?? '').trim(),
                    address         : String(row[5]  ?? '').trim(),
                    nationCd        : String(row[6]  ?? '').trim(),
                    presidentNm     : String(row[7]  ?? '').trim(),
                    presidentEmail  : String(row[8]  ?? '').trim(),
                    presidentHp     : formatPhone(String(row[9]  ?? '').trim()),
                    bsnTypeNm       : String(row[10] ?? '').trim(),
                    bsnItemNm       : String(row[11] ?? '').trim(),
                    zipCd           : String(row[12] ?? '').trim(),
                    telNo           : String(row[13] ?? '').trim(),
                    tradeType       : String(row[14] ?? '').trim(),
                    useYn           : 'Y',
                    regId           : '',
                    regDate         : '',
                    updId           : '',
                    updDate         : '',
                    isNew           : true,
                    isDirty         : false,
                    uploadStatus    : '',
                }));

            setClientList(newItems);

            getCheckList(
                { clientList : newItems.map(v => ({
                    clientCd        : v.clientCd,
                    businessNo      : v.businessNo,
                    presidentHp     : v.presidentHp,
                    presidentEmail  : v.presidentEmail,
                }))},
                (res) => {
                    const results: CheckResult[] = res.data ?? [];
                    setClientList(prev => prev.map((v, i) => {
                        const r = results.find(r => r.rowIndex === i);
                        return { ...v, uploadStatus: r ? (r.isValid ? 'OK' : r.errors.join(' / ')) : v.uploadStatus };
                    }));

                    setIsUploading(false);
                },
                (err) => {
                    setClientList([]);
                    showAlert("유효성 검증 실패: " + err?.message);
                    setIsUploading(false);
                }
            );
        };

        reader.onerror = () => {
            showAlert("엑셀 파일 업로드 실패");
            setIsUploading(false);
        };

        reader.readAsArrayBuffer(file);
        e.target.value = "";
    }

    // 체크박스(전체선택)
    const handleSelectAll = (e : React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setClientList(prev => prev.map(v => ({ ...v, chk: val })));
    };

    // 체크박스(선택)
    const handleSelectRow = (idx : number) => {
        setClientList(prev => prev.map((v, i) => i === idx ? { ...v, chk: v.chk === '1' ? '0' : '1' } : v));
    }

    // 인라인 컬럼 편집(존)
    const handleCellChange = (idx: number, field: keyof Client, value: string) => {
        setClientList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true, chk: '1' } : v));
    };

    // 연락처 포멧 변환(XXX-XXXX-XXXX)
    const formatPhone = (value: string): string => {
        const digits = value.replace(/\D/g, '');

        if (digits.startsWith('02')) {
            if (digits.length <= 2) return digits;
            if (digits.length <= 5) return `${digits.slice(0,2)}-${digits.slice(2)}`;
            if (digits.length <= 9) return `${digits.slice(0,2)}-${digits.slice(2,5)}-${digits.slice(5)}`;
            return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6,10)}`;
        } else {
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
            if (digits.length <= 10) return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
            return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
        }
    };

    return (
        <>
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        {/* Title and Main Actions */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">거래처 관리</h3>
                                <p className="mt-1 text-sm text-muted">등록된 거래처의 상세 정보를 관리합니다.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnPrimary} onClick={handleSearch}>
                                    <span className="material-symbols-outlined">search</span>
                                    조회
                                </button>
                                <button className={btnOutline} onClick={handleSave}>
                                    <span className="material-symbols-outlined">save</span>
                                    저장
                                </button>
                                <button className={btnDanger} onClick={handleDelete}>
                                    <span className="material-symbols-outlined">delete_outline</span> 삭제
                                </button>
                                <button className={btnOutline} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* Search Filter Box */}
                        <div className={`${filterBox} mt-4`}>
                            <div className="grid grid-cols-5 gap-4">
                                {/* 고객사 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>고객사</label>
                                    <select className={filterSelect} value={searchSrvcCd} onChange={(e) => setSearchSrvcCd(e.target.value)}>
                                        { srvcList.map( v => <option key={v.srvcCd} value={v.srvcCd}>{`${v.srvcCd} [${v.srvcNm}]`}</option>) }
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>센터</label>
                                    <select className={filterSelect} value={searchWhCd} onChange={(e) => setSearchWhCd(e.target.value)}>
                                        { whList.map( v => <option key={v.whCd} value={v.whCd}>{`${v.whCd} [${v.whNm}]`}</option>)}
                                    </select>
                                </div>
                                {/* 거래처 */}
                                <div className={`${filterItem} col-span-2`}>
                                    <label className={filterLabel}>거래처</label>
                                    <div className="flex min-w-0 gap-1.5">
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchClientCd} onChange={(e) => {setSearchClientCd(e.target.value); setSearchClientNm(''); }}/>
                                        <button className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover" onClick={() => openClientSearch((clientCd, clientNm) => { setSearchClientCd(clientCd); setSearchClientNm(clientNm); }, searchClientCd)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600" value={searchClientNm} onChange={(e) => setSearchClientNm(e.target.value)} readOnly />
                                    </div>
                                </div>
                                {/* 사용여부 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>사용여부</label>
                                    <select className={filterSelect} value={searchUseYn} onChange={(e) => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Functional Toolbar */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button className={btnToolbar} onClick={handleAddRow}>
                                    <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '16px' }}>add</span>
                                    행추가
                                </button>
                                <button className={btnToolbar} onClick={handleDeleteRow}>
                                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '16px' }}>delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnToolbar} onClick={handleTempletDownload}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
                                    양식다운로드
                                </button>
                                <button className={btnToolbar} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                                     {isUploading ? "" : "엑셀업로드"}
                                </button>
                                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none'}} onChange={handleExcelUpload}/>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={tableWrapper}>
                        <table className="min-w-[2960px] table-fixed border-collapse text-xs">
                            <colgroup>
                                {/* 체크박스 */}
                                <col style={{ width: '40px' }}/>
                                {/* 고객사 */}
                                <col style={{ width: '120px' }}/>
                                {/* 센터 */}
                                <col style={{ width: '140px' }}/>
                                {/* 거래처코드 */}
                                <col style={{ width: '180px' }}/>
                                {/* 거래처명 */}
                                <col style={{ width: '250px' }}/>
                                {/* 사업자번호 */}
                                <col style={{ width: '200px' }}/>
                                {/* 거래처주소 */}
                                <col style={{ width: '500px' }}/>
                                {/* 국가코드 */}
                                <col style={{ width: '100px' }}/>
                                {/* 대표자명 */}
                                <col style={{ width: '180px' }}/>
                                {/* 이메일주소 */}
                                <col style={{ width: '200px' }}/>
                                {/* 연락처 */}
                                <col style={{ width: '180px' }}/>
                                {/* 사용여부 */}
                                <col style={{ width: '90px' }}/>
                                {/* 종목명 */}
                                <col style={{ width: '180px' }}/>
                                {/* 등록자 */}
                                <col style={{ width: '120px' }}/>
                                {/* 등록일자 */}
                                <col style={{ width: '220px' }}/>
                                {/* 수정자 */}
                                <col style={{ width: '120px' }}/>
                                {/* 수정일자 */}
                                <col style={{ width: '220px' }}/>
                                {/* 업로드결과 */}
                                <col style={{ width: '300px' }}/>
                            </colgroup>
                            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">
                                        <input type="checkbox" className="customCheckbox" onChange={handleSelectAll} checked={clientList.length > 0 &&
                                            clientList.every(v => v.chk === '1')}/>
                                    </th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">고객사</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">센터</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">거래처코드</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">거래처명</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">사업자번호</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">거래처주소</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">국가코드</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">대표자명</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">이메일주소</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">연락처</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">시용여부</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">종목명</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">등록자</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">등록일자</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">수정자</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">수정일자</th>
                                    <th className="border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide">업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                                { isSearched && clientList.length === 0 ? (
                                 <tr>
                                    <td colSpan={23} className="px-4 py-12 text-center text-slate-400">
                                        <span className="material-symbols-outlined block text-4xl">inbox</span>
                                        <p className="mt-2 text-sm">조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>
                                ) : clientList.map((v, idx) => (
                                <tr key={idx} onClick={() => handleSelectRow(idx)} className="hover:bg-slate-50">
                                    <td className={cellCenter}>
                                        <input type="checkbox" className="customCheckbox" onChange={() => {}} checked={v.chk === '1'}/>
                                    </td>
                                    <td className={cellCenter}>
                                        { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd)(srvcList.find( s => s.srvcCd === v.srvcCd)) }
                                    </td>
                                    <td className={cellCenter}>
                                        { (w => w ? `${w.whCd} [${w.whNm}]` : v.whCd)(whList.find( w => w.whCd === v.whCd)) }
                                    </td>
                                    <td className={cellCenter}>
                                        {
                                            v.isNew
                                            ? <input type='text' className={cellInput} value={v.clientCd}
                                                onChange={ e => handleCellChange(idx, "clientCd", e.target.value) }
                                                ref={ setCellRef(idx, "clientCd") as any }/>
                                            : v.clientCd
                                        }
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.clientNm}
                                            onChange={ e => handleCellChange(idx, "clientNm", e.target.value) }
                                            ref={ setCellRef(idx, "clientNm") as any }/>
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.businessNo}
                                            onChange={ e => handleCellChange(idx, "businessNo", e.target.value) }
                                            ref={ setCellRef(idx, "businessNo") as any }/>
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.address}
                                            onChange={ e => handleCellChange(idx, "address", e.target.value) }
                                            ref={ setCellRef(idx, "address") as any }/>
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.nationCd}
                                            onChange={ e => handleCellChange(idx, "nationCd", e.target.value) }
                                            ref={ setCellRef(idx, "nationCd") as any }/>
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.presidentNm}
                                            onChange={ e => handleCellChange(idx, "presidentNm", e.target.value) }
                                            ref={ setCellRef(idx, "presidentNm") as any }/>
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.presidentEmail}
                                            onChange={ e => handleCellChange(idx, "presidentEmail", e.target.value) }
                                            ref={ setCellRef(idx, "presidentEmail") as any }/>
                                    </td>

                                    <td className={cellCenter}>
                                        <input type='tel' className={cellInput} maxLength={13} value={v.presidentHp}
                                            onChange={ e => handleCellChange(idx, "presidentHp", formatPhone(e.target.value)) }
                                            ref={ setCellRef(idx, "presidentHp") as any }/>
                                    </td>
                                    <td className={cellCenter}>
                                        <select className={cellInput} value={v.useYn}
                                            onChange={e => handleCellChange(idx, "useYn", e.target.value)}
                                            onClick={e => e.stopPropagation()}>
                                            <option value="Y">사용</option>
                                            <option value="N">미사용</option>
                                        </select>
                                    </td>
                                    <td className={cellCenter}>
                                        <input type='text' className={cellInput} value={v.bsnItemNm}
                                            onChange={ e => handleCellChange(idx, "bsnItemNm", e.target.value) }
                                            ref={ setCellRef(idx, "bsnItemNm") as any }/>
                                    </td>
                                    <td className={cellCenter}>{v.regId}</td>
                                    <td className={cellCenter}>{v.regDate}</td>
                                    <td className={cellCenter}>{v.updId}</td>
                                    <td className={cellCenter}>{v.updDate}</td>
                                    <td className={cellCenter}>
                                        {v.uploadStatus === 'OK' ? (
                                            <span className={chipOk}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
                                                OK
                                            </span>
                                        ) : v.uploadStatus && v.uploadStatus !== '검증중...' ? (
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {v.uploadStatus.split(' / ').filter(Boolean).map((err, i) => (
                                                    <span key={i} className={chipError}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>error</span>
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

                    {/* 건수 표시 */}
                    <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                        <span>
                            총 <span className="font-bold text-slate-800">{clientList.length.toLocaleString()}</span> 건
                        </span>
                        <span>
                            선택 <span className="font-bold text-primary">{clientList.filter(v => v.chk === '1').length.toLocaleString()}</span> 건
                        </span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_MASTER_0020;
