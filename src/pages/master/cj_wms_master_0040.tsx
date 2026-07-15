import React, { useState, useEffect, useRef } from 'react';
// 서비스코드 창고코드 공통 로드
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 구역/로케이션 서비스 임포트
import { getZoneList, getLocList, saveInfo, getCheckList, type Zone, type Loc, type CheckResult } from '../../api/master/master_0040Service'
// 팝업 컨텍스트
import { usePopupContext } from "../../components/common/PopupProvider";
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { type CommCode, getCommCodeList } from '../../api/common/commonService';

// ── Tailwind 상수 ──────────────────────────────────────────────
const pageShell             = "flex min-h-0 flex-1 bg-surface";
const contentShell          = "flex min-w-0 flex-1 flex-col";
const sectionCard           = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-white shadow-sm";
const sectionHeader         = "shrink-0 border-b border-slate-100 p-6 flex flex-col gap-5";
const btnBase               = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary            = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline            = `${btnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const filterItem            = "flex min-w-0 flex-col gap-1.5";
const filterLabel           = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect          = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInput           = "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInputReadonly   = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-2 text-sm text-slate-600";
const filterSearchBtn       = "inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover";
const panel                 = "flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200/50 bg-white shadow-sm";
const panelHeader           = "flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3";
const btnToolbar            = "inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";
const thBase                = "border-b border-slate-100 px-2 py-2.5 text-center text-[10px] font-black uppercase tracking-wide whitespace-nowrap";
const tdBase                = "overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2 text-xs";
const cellCenter            = "px-2 py-2 text-center text-xs";
const cellInput             = "w-full min-w-0 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-primary";
// ───────────────────────────────────────────────────────────────

const CJ_WMS_MASTER_0040: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    const payload                                           = getTokenPayload();
    // 조회조건
    const [searchSrvcCd,   setSearchSrvcCd]                 = useState(selectSrvcCd);
    const [searchWhCd,     setSearchWhCd]                   = useState(selectWhCd);
    const [searchZoneCd,   setSearchZoneCd]                 = useState('');
    const [searchZoneNm,   setSearchZoneNm]                 = useState('');
    const [searchLocCd,    setSearchLocCd]                  = useState('');
    const [searchUseYn,    setSearchUseYn]                  = useState('');
    // 조회결과
    const [zoneList,       setZoneList]                     = useState<Zone[]>([]);
    const [locList,        setLocList]                      = useState<Loc[]>([]);
    const [selectedZoneCd, setSelectedZoneCd]               = useState('');
    const [zoneSearched,   setZoneSearched]                 = useState(false);
    const [locSearched,    setLocSearched]                  = useState(false);

    const [locClsList,     setLocClsList]                   = useState<CommCode[]>([]);

    // 업로드 진행중
    const [isUploading, setIsUploading] = useState(false);
    // 공통 임포트
    const { showAlert, showConfirm, openZoneSearch } = usePopupContext();

    // 포커싱
    const cellRefs                                          = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    // 조회
    const handleSearch = () => {
        getZoneList (
            {
                srvcCd  : searchSrvcCd,
                whCd    : searchWhCd,
                zoneCd  : searchZoneCd,
                zoneNm  : searchZoneNm,
                locCd   : searchLocCd,
                useYn   : searchUseYn
            },
            (res) => {
                const resultCode = res.resultCode;

                if (resultCode === "0000") {
                    const rows : Zone[] = (res.data ?? []).map((v : any) => ({
                        srvcCd      : v.srvc_cd        ?? '',
                        whCd        : v.wh_cd          ?? '',
                        zoneCd      : v.zone_cd        ?? '',
                        zoneNm      : v.zone_nm        ?? '',
                        useYn       : v.use_yn         ?? '',
                        regId       : v.reg_id         ?? '',
                        regDate     : v.reg_date       ?? '',
                        updId       : v.upd_id         ?? '',
                        updDate     : v.upd_date       ?? '',
                        isNew       : false,
                        isDirty     : false,
                        uploadStatus: ''
                    }));

                    setZoneList(rows);
                    setZoneSearched(true);

                    if (searchLocCd.trim() && rows.length > 0) {
                        const firstZone = rows[0];
                        setSelectedZoneCd(firstZone.zoneCd);
                        getLocList(
                            {
                                srvcCd  : firstZone.srvcCd || searchSrvcCd,
                                whCd    : firstZone.whCd   || searchWhCd,
                                zoneCd  : firstZone.zoneCd,
                                locCd   : searchLocCd
                            },
                            (locRes) => {
                                if (locRes.resultCode === "0000") {
                                    const locRows: Loc[] = (locRes.data ?? []).map((lv: any) => ({
                                        srvcCd   : lv.srvc_cd    ?? '',
                                        whCd     : lv.wh_cd      ?? '',
                                        zoneCd   : lv.zone_cd    ?? '',
                                        locCd    : lv.loc_cd     ?? '',
                                        locClsCd : lv.loc_cls_cd ?? '',
                                        rmk      : lv.rmk        ?? '',
                                        useYn    : lv.use_yn     ?? '',
                                        regId    : lv.reg_id     ?? '',
                                        regDate  : lv.reg_date   ?? '',
                                        updId    : lv.upd_id     ?? '',
                                        updDate  : lv.upd_date   ?? '',
                                        isNew    : false,
                                        isDirty  : false
                                    }));
                                    setLocList(locRows);
                                    setLocSearched(true);
                                }
                            },
                            (err) => showAlert("로케이션 조회 실패: " + err?.message)
                        );
                    } else {
                        setLocList([]);
                        setSelectedZoneCd('');
                        setLocSearched(false);
                    }
                }
            },
            (err) => showAlert("조회 실패: " + err?.message)
        )
    }

    const handleZoneSelect = (v : Zone) => {
        setSelectedZoneCd(v.zoneCd);
        getLocList (
            {
                srvcCd  : v.srvcCd || searchSrvcCd,
                whCd    : v.whCd || searchWhCd,
                zoneCd  : v.zoneCd,
                locCd   : searchLocCd
            },
            (res) => {
                if (res.resultCode == "0000") {
                    const rows : Loc[] = (res.data ?? []).map((v : any) => ({
                        srvcCd      : v.srvc_cd     ?? '',
                        whCd        : v.wh_cd       ?? '',
                        zoneCd      : v.zone_cd     ?? '',
                        locCd       : v.loc_cd      ?? '',
                        locClsCd    : v.loc_cls_cd  ?? '',
                        rmk         : v.rmk         ?? '',
                        useYn       : v.use_yn      ?? '',
                        regId       : v.reg_id      ?? '',
                        regDate     : v.reg_date    ?? '',
                        updId       : v.upd_id      ?? '',
                        updDate     : v.upd_date    ?? '',
                        isNew       : false,
                        isDirty     : false
                    }));

                    setLocList(rows);
                    setLocSearched(true);
                }
            },
            (err) => showAlert("해당 로케이션 조회 실패: " + err?.message)
        )
    }

    // 저장
    const handleSave = () => {
        const isDirtyZone   = zoneList.filter(v => v.isNew || v.isDirty);
        const isDirtyLoc    = locList.filter(v => v.isNew || v.isDirty);

        if (isDirtyZone.length === 0 && isDirtyLoc.length === 0) {
            showAlert("저장할 변경사항이 없습니다.");
            return;
        }

        const invalidZoneCdInfo = zoneList.filter(v => v.isNew && !v.zoneCd.trim())[0];
        const invalidZoneNmInfo = zoneList.filter(v => v.isNew && v.zoneCd.trim() && !v.zoneNm.trim())[0];

        if (zoneList.indexOf(invalidZoneCdInfo) !== -1) {
            const el = cellRefs.current.get(`${zoneList.indexOf(invalidZoneCdInfo)}_zoneCd`);
            showAlert("존 코드를 입력하세요.", () => el?.focus());
            return;
        }

        if (zoneList.indexOf(invalidZoneNmInfo) !== -1) {
            const el = cellRefs.current.get(`${zoneList.indexOf(invalidZoneNmInfo)}_zoneNm`);
            showAlert("존명을 입력하세요.", () => el?.focus());
            return;
        }

        const invalidLocCdInfo    = locList.filter(v => v.isNew && v.zoneCd && !v.locCd.trim())[0];
        const invalidLocClsCdInfo = locList.filter(v => v.isNew && v.zoneCd && !v.locClsCd.trim())[0];
        
        if (locList.indexOf(invalidLocCdInfo) !== -1) {
            const el = cellRefs.current.get(`${locList.indexOf(invalidLocCdInfo)}_locCd`);
            showAlert("로케이션 코드를 입력하세요.", () => el?.focus());
            return;
        }

        if (locList.indexOf(invalidLocClsCdInfo) !== -1) {
            const el = cellRefs.current.get(`${locList.indexOf(invalidLocClsCdInfo)}_locClsCd`);
            showAlert("로케이션 구분을 입력하세요.", () => el?.focus());
            return;
        }

        showConfirm("저장하시겠습니까?", () => {
          saveInfo(
              {
                  zoneList : isDirtyZone.map(v => ({
                      srvcCd  : v.srvcCd,
                      whCd    : v.whCd,
                      zoneCd  : v.zoneCd,
                      zoneNm  : v.zoneNm,
                      useYn   : v.useYn,
                      userId  : payload?.userId ?? '',
                  })),

                  locList : isDirtyLoc.map(v => ({
                      srvcCd   : v.srvcCd,
                      whCd     : v.whCd,
                      zoneCd   : v.zoneCd,
                      locCd    : v.locCd,
                      locClsCd : v.locClsCd,
                      rmk      : v.rmk,
                      useYn    : v.useYn,
                      userId   : payload?.userId ?? '',
                  }))
              },
              (res) => {
                  if (res.resultCode === "0000") {
                    showAlert("저장되었습니다.", () => handleSearch()); 
                  }
              },
              (err) => showAlert("저장 실패: " + err?.message)
          );
      });
    }

    // 엑셀 다운로드
    const handleExcel = async () => {
        if (zoneList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("구역목록");

        // 헤더 정의
        ws.columns = [
            { header: "서비스코드"      ,   key: "srvcCd",          width: 20 },
            { header: "창고코드"        ,   key: "whCd",            width: 15 },
            { header: "구역코드"      ,   key: "zoneCd",          width: 15 },
            { header: "구역명"        ,   key: "zoneNm",          width: 15 },
            { header: "사용여부"    ,   key: "useYn",           width: 15 },
            { header: "등록자"      ,   key: "regId",           width: 14 },
            { header: "등록일자"    ,   key: "regDate",         width: 14 },
            { header: "수정자"      ,   key: "updId",           width: 14 },
            { header: "수정일자"    ,   key: "updDate",         width: 14 },
        ];

        // 헤더 행 서식
        const headerRow = ws.getRow(1);

        headerRow.eachCell((cell) => {
            cell.fill = {
                type    : "pattern"
              , pattern : "solid"
              , fgColor : { argb: "0080B2Fd" }
            };

            cell.font = {
                bold    : true
              , color   : { argb: "00000000" }
              , size    : 11
            };

            cell.alignment = {
                vertical    : "middle"
              , horizontal  : "center"
            };

            cell.border = {
                top     : { style: "thin" }
              , left    : { style: "thin" }
              , bottom  : { style: "thin" }
              , right   : { style: "thin" }
            };
        });

        headerRow.height = 22;

        // 데이터 추가
        zoneList.forEach(v => {
            const row = ws.addRow({
                srvcCd      : v.srvcCd          ?? selectSrvcCd,
                whCd        : v.whCd            ?? selectWhCd,
                zoneCd      : v.zoneCd          ?? '',
                zoneNm      : v.zoneNm          ?? '',
                useYn       : v.useYn           ?? 'Y',
                regId       : v.regId           ?? '',
                regDate     : v.regDate         ?? '',
                updId       : v.updId           ?? '',
                updDate     : v.updDate         ?? '',
            });

            row.eachCell((cell) => {
                cell.alignment = {
                    vertical: "middle"
                  , horizontal: "center"
                };
                cell.border = {
                    top     : { style: "thin" }
                  , left    : { style: "thin" }
                  , bottom  : { style: "thin" }
                  , right   : { style: "thin" }
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
        a.download = `구역목록_${new Date().toISOString().slice(0, 10)}.xlsx`;

        document.body.appendChild(a);

        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    }

    // 행추가(구역)
    const handleAddZoneRow = () => {
        setZoneList(prev => [...prev, {
            srvcCd      : selectSrvcCd,
            whCd        : selectWhCd,
            zoneCd      : '',
            zoneNm      : '',
            useYn       : 'Y',
            regId       : '',
            regDate     : '',
            updId       : '',
            updDate     : '',
            isNew       : true,
            isDirty     : false,
            uploadStatus: '',
        }]);
    }

    // 행삭제구역
    const handleDeleteZoneRow = () => {
        const lastNewIdx = zoneList.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();

        if (lastNewIdx === undefined) return;

        setZoneList(prev => prev.filter((_, i) => i !== lastNewIdx));
    }

    // 템플릿다운로드
    const handleTempletDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("존 관리_템플릿");

        ws.columns = [
            { header: "고객사",     key: "srvcCd",       width: 20 },
            { header: "센터",       key: "whCd",         width: 20 },
            { header: "존코드",     key: "zoneCd",       width: 20 },
            { header: "존명",       key: "zoneNm",       width: 20 }
        ];

        const exampleRows = [
            { srvcCd: selectSrvcCd, whCd: selectWhCd, zoneCd : 'A',     zoneNm : '존명 - 일반구역'},
            { srvcCd: selectSrvcCd, whCd: selectWhCd, zoneCd : 'B',     zoneNm : '존명 - 불량구역'},
            { srvcCd: selectSrvcCd, whCd: selectWhCd, zoneCd: 'STAGE',  zoneNm : 'STAGE' }
        ];

        // 헤더 행 서식
        const headerRow = ws.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "0080B2Fd" },
            };
            cell.font = {
                bold: true,
                color: { argb: "00000000" },
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
        a.download      = "존 관리_템플릿.xlsx";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // 엑셀 업로드
    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

         setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const newZone : Zone[] = rows.slice(1)
                .filter(row => row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')).map(row => ({
                    srvcCd       : String(row[0] ?? selectSrvcCd).trim(),
                    whCd         : String(row[1] ?? selectWhCd).trim(),
                    zoneCd       : String(row[2] ?? '').trim(),
                    zoneNm       : String(row[3] ?? '').trim(),
                    useYn        : 'Y',
                    regId        : '',
                    regDate      : '',
                    updId        : '',
                    updDate      : '',
                    isNew        : true,
                    isDirty      : false,
                    uploadStatus : '검증중...',
                }));

            setZoneList(newZone);
            
            getCheckList(
                { zoneList: newZone.map(v => ({
                    zoneCd     : v.zoneCd
                }))},
                (res) => {
                    const results: CheckResult[] = res.data ?? [];
                    setZoneList(prev => prev.map((v, i) => {
                        const r = results.find(r => r.rowIndex === i);
                        return { ...v, uploadStatus: r ? (r.isValid ? 'OK' : r.errors.join(' / ')) : v.uploadStatus };
                    }));
                    setIsUploading(false);
                },
                (err) => {
                    setZoneList([]);
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

    // 행추가(로케이션)
    const handleAddLocRow = () => {
        setLocList(prev => [...prev, {
            srvcCd      : selectSrvcCd,
            whCd        : selectWhCd,
            zoneCd      : selectedZoneCd,
            locCd       : '',
            locClsCd    : '',
            rmk         : '',
            useYn       : 'Y',
            regId       : '',
            regDate     : '',
            updId       : '',
            updDate     : '',
            isNew       : true,
            isDirty     : false
        }]);
    }

     // 셀값 변경(구역)
    const handleZoneCellChange = (idx: number, field: keyof Zone, value: string) => {
        setZoneList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    // 셀값 변경(로케이션)
    const handleLocCellChange = (idx: number, field: keyof Loc, value: string) => {
        setLocList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    // 행삭제(로케이션)
    const handleDeleteLocRow = () => {
        const lastNewIdx = locList.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();

        if (lastNewIdx === undefined) return;

        setLocList(prev => prev.filter((_, i) => i !== lastNewIdx));
    }

    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd);
    }, [selectWhCd]);

    useEffect(() => {
        getCommCodeList(
            {     sysGrpCd    : 'WM1040'
                , sysCd       : ''
                , sysCdNm     : ''
                , srvcCd      : ''
                , sysEtc1     : ''
                , sysEtc2     : ''
                , sysEtc3     : ''
                , sysEtc4     : ''
                , sysEtc5     : ''
            },
            (res) => {
                const rows : CommCode[] = (res.data ?? []).map((v : any) => ({
                    sysCd       : v.sys_cd      ?? '',
                    sysCdNm     : v.sys_cdnm    ?? ''
                }));
                
                setLocClsList(rows);
            },
            (err) => showAlert("공통코드 조회 실패 : " + err?.message)
        );
    }, [])

    return (
        <>
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>

                    {/* 검색 영역 헤더 */}
                    <div className={sectionHeader}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">존&amp;로케이션 관리</h3>
                                <p className="mt-0.5 text-sm text-muted">창고 내 존과 상세 로케이션 정보를 구성하고 관리합니다.</p>
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
                                <button className={btnOutline} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <div className="grid grid-cols-[0.7fr_0.7fr_1.6fr_1fr_0.8fr] gap-4">
                                {/* 고객사*/}
                                <div className={filterItem}>
                                    <label className={filterLabel}>고객사</label>
                                    <select className={filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>센터</label>
                                    <select className={filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>)}
                                    </select>
                                </div>
                                {/* 구역*/}
                                <div className={filterItem}>
                                    <label className={filterLabel}>존</label>
                                    <div className="flex items-center gap-1 min-w-0">
                                        <input type="text" className="h-9 w-[300px] flex-none rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchZoneCd} onChange={e => { setSearchZoneCd(e.target.value); setSearchZoneNm(''); }} />
                                        <button className={filterSearchBtn} onClick={() => openZoneSearch((zoneCd, zoneNm) => { setSearchZoneCd(zoneCd); setSearchZoneNm(zoneNm); }, searchZoneCd)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className={filterInputReadonly} value={searchZoneNm} readOnly />
                                    </div>
                                </div>
                                {/* 로케이션 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>로케이션</label>
                                    <input type="text" className={filterInput} value={searchLocCd} onChange={e => setSearchLocCd(e.target.value)} />
                                </div>
                                {/* 사용여부 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>사용여부</label>
                                    <select className={filterSelect} value={searchUseYn} onChange={e => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 좌우 패널 레이아웃 */}
                    <div className="grid min-h-0 flex-1 grid-cols-[6fr_4fr] gap-4 p-4">

                        {/* 좌 구역 패널 */}
                        <section className={panel}>
                            <div className={panelHeader}>
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-1 shrink-0 rounded-full bg-primary" />
                                    <h4 className="text-sm font-bold text-slate-800">존</h4>
                                </div>
                                <div className="flex gap-1">
                                    <button className={btnToolbar} onClick={handleAddZoneRow}>
                                        <span className="material-symbols-outlined text-primary text-[14px]">add</span>
                                        행추가
                                    </button>
                                    <button className={btnToolbar} onClick={handleDeleteZoneRow}>
                                        <span className="material-symbols-outlined text-danger text-[14px]">delete</span>
                                        행삭제                                    </button>
                                    <button className={btnToolbar} onClick={handleTempletDownload}>
                                        <span className="material-symbols-outlined text-[14px]">description</span>
                                        템플릿다운로드
                                    </button>
                                    <label
                                        className={btnToolbar + (isUploading ? ' opacity-50 cursor-not-allowed pointer-events-none' : '')}
                                    >
                                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                                        <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                        {isUploading ? "업로드중.." : "엑셀업로드"}
                                    </label>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-auto" style={{ flex: 1 }}>
                                <table className="w-full table-fixed border-collapse text-left">
                                    <colgroup>
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '200px' }} />
                                        <col style={{ width: '90px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '300px' }} />
                                    </colgroup>
                                    <thead className="sticky top-0 z-10 bg-slate-50/80 text-slate-400">
                                        <tr>
                                            <th className={thBase}>센터</th>
                                            <th className={thBase}>존코드</th>
                                            <th className={thBase}>존명</th>
                                            <th className={thBase}>사용여부</th>
                                            <th className={thBase}>등록자</th>
                                            <th className={thBase}>등록일자</th>
                                            <th className={thBase}>수정자</th>
                                            <th className={thBase}>수정일자</th>
                                            <th className={thBase}>업로드상태</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-700">
                                        {zoneSearched && zoneList.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                                                    <span className="material-symbols-outlined block text-[2rem]">inbox</span>
                                                    <p className="mt-2 text-sm font-medium">조회된 데이터가 없습니다.</p>
                                                </td>
                                            </tr>
                                        ) : zoneList.map((item, index) => (
                                            <tr key={index}
                                                onClick={() => handleZoneSelect(item)}
                                                className={'cursor-pointer transition-colors hover:bg-slate-50 ' + (selectedZoneCd === item.zoneCd ? 'border-l-2 border-l-primary bg-primary/[0.06]' : '')}>
                                                <td className={cellCenter}>
                                                    {(w => w ? `${w.whCd} [${w.whNm}]` : item.whCd)(whList.find(w => w.whCd === item.whCd))}
                                                </td>
                                                <td className={cellCenter}>
                                                    {
                                                        item.isNew
                                                        ? <input type="text" className={cellInput} value={item.zoneCd}
                                                           onChange={e => handleZoneCellChange(index, "zoneCd", e.target.value)}
                                                           onClick={e => e.stopPropagation()}
                                                           ref={setCellRef(index, "zoneCd") as any}/>
                                                        : item.zoneCd
                                                    }
                                                </td>
                                                <td className={tdBase}>
                                                    <input type="text" className={cellInput} value={item.zoneNm}
                                                     onChange={e => handleZoneCellChange(index, "zoneNm", e.target.value)}
                                                     onClick={e => e.stopPropagation()}
                                                     ref={setCellRef(index, "zoneNm") as any}/>
                                                </td>
                                                <td className={cellCenter}>
                                                    <select className={cellInput} value={item.useYn}
                                                        onChange={e => handleZoneCellChange(index, "useYn", e.target.value)}
                                                        onClick={e => e.stopPropagation()}>
                                                        <option value="Y">사용</option>
                                                        <option value="N">미사용</option>
                                                    </select>
                                                </td>
                                                <td className={cellCenter}>{item.regId}</td>
                                                <td className={cellCenter}>{item.regDate}</td>
                                                <td className={cellCenter}>{item.updId}</td>
                                                <td className={cellCenter}>{item.updDate}</td>
                                                <td className={cellCenter}>
                                                    {item.uploadStatus === 'OK' ? (
                                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            <span className="material-symbols-outlined text-[11px]">check_circle</span>
                                                            OK
                                                        </span>
                                    ) : item.uploadStatus && item.uploadStatus !== '검증중...' ? (
                                                        <div className="flex flex-wrap justify-center gap-1">
                                                            {item.uploadStatus.split(' / ').filter(Boolean).map((err, i) => (
                                                                <span key={i} className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                                                                    <span className="material-symbols-outlined text-[11px]">error</span>
                                                                    {err.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : item.uploadStatus}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* 건수 표시 */}
                            <div className="shrink-0 flex items-center justify-end border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                                <span>총 <span className="font-bold text-slate-800">{zoneList.length.toLocaleString()}</span> 건</span>
                            </div>
                        </section>

                        {/* 우 로케이션 패널 */}
                        <section className={panel}>
                            <div className={panelHeader}>
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-1 shrink-0 rounded-full bg-primary-hover" />
                                    <h4 className="text-sm font-bold text-slate-800">로케이션</h4>
                                </div>
                                <div className="flex gap-1">
                                    <button className={btnToolbar} onClick={handleAddLocRow}>
                                        <span className="material-symbols-outlined text-primary text-[14px]">add</span>
                                        행추가
                                    </button>
                                    <button className={btnToolbar} onClick={handleDeleteLocRow}>
                                        <span className="material-symbols-outlined text-danger text-[14px]">delete</span>
                                        행삭제                                    </button>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-auto">
                                <table className="w-full table-fixed border-collapse text-left">
                                    <colgroup>
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '90px' }} />
                                        <col style={{ width: '200px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                    </colgroup>
                                    <thead className="sticky top-0 z-10 bg-slate-50/80 text-slate-400">
                                        <tr>
                                            <th className={thBase}>로케이션코드</th>
                                            <th className={thBase}>로케이션구분</th>
                                            <th className={thBase}>사용여부</th>
                                            <th className={thBase}>비고</th>
                                            <th className={thBase}>등록자</th>
                                            <th className={thBase}>등록일자</th>
                                            <th className={thBase}>수정자</th>
                                            <th className={thBase}>수정일자</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-700">
                                        { locSearched && locList.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                                    <span className="material-symbols-outlined block text-[2rem]">inbox</span>
                                                    <p className="mt-2 text-sm font-medium">조회된 데이터가 없습니다.</p>
                                                </td>
                                            </tr>
                                        ) : locList.map((item, index) => (
                                            <tr key={index} className="cursor-pointer transition-colors hover:bg-slate-50">
                                                <td className={cellCenter}>
                                                    {
                                                        item.isNew
                                                        ? <input type="text" className={cellInput} value={item.locCd}
                                                           onChange={e => handleLocCellChange(index, "locCd", e.target.value)}
                                                           onClick={e => e.stopPropagation()}
                                                           ref={setCellRef(index, "locCd") as any}/>
                                                        : item.locCd
                                                    }
                                                </td>
                                                <td className={cellCenter}>
                                                    <select className={cellInput} value={item.locClsCd}
                                                     onChange={e => handleLocCellChange(index, "locClsCd", e.target.value)}
                                                     onClick={e => e.stopPropagation()}>
                                                        {
                                                            locClsList.map(v => (
                                                                <option key={v.sysCd} value={v.sysCd}>{v.sysCdNm}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </td>
                                                <td className={cellCenter}>
                                                    <select className={cellInput} value={item.useYn}
                                                        onChange={e => handleLocCellChange(index, "useYn", e.target.value)}
                                                        onClick={e => e.stopPropagation()}>
                                                        <option value="Y">사용</option>
                                                        <option value="N">미사용</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2 text-[11px] text-muted">
                                                    <input type="text" className={cellInput} value={item.rmk}
                                                     onChange={e => handleLocCellChange(index, "rmk", e.target.value)}
                                                     onClick={e => e.stopPropagation()}
                                                     ref={setCellRef(index, "rmk") as any}/>
                                                </td>
                                                <td className={cellCenter}>{item.regId}</td>
                                                <td className={cellCenter}>{item.regDate}</td>
                                                <td className={cellCenter}>{item.updId}</td>
                                                <td className={cellCenter}>{item.updDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* 건수 표시 */}
                            <div className="shrink-0 flex items-center justify-end border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                                <span>총 <span className="font-bold text-slate-800">{locList.length.toLocaleString()}</span> 건</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_MASTER_0040;
