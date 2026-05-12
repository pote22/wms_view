import React, { useState, useEffect, useRef } from 'react';
// 고객사, 센터 공통 리스트
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 서비스 정보
import { getZoneList, getLocList, saveInfo, getCheckList, type Zone, type Loc, type CheckResult } from '../../api/master/master_0040Service'
// 레이어 팝업
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
// 존 검색 팝업
import ZoneSearchPopup from "../../components/common/ZoneSearchPopup";
// 모듈 CSS
import styles from './cj_wms_master_0040.module.css';
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { type CommCode, getCommCodeList } from '../../api/common/commonService';

// 존객체 정보
interface ZoneRow extends Zone {    
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

// 로케이션 객체정보
interface LocRow extends Loc {
    isNew   : boolean;
    isDirty : boolean;
}

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
    const [zoneList,       setZoneList]                     = useState<ZoneRow[]>([]);
    const [locList,        setLocList]                      = useState<LocRow[]>([]);
    const [selectedZoneCd, setSelectedZoneCd]               = useState('');
    const [zoneSearched,   setZoneSearched]                 = useState(false);
    const [locSearched,    setLocSearched]                  = useState(false);
    
    const [locClsList,     setLocClsList]                   = useState<CommCode[]>([]);
    const [zonePopupOpen,  setZonePopupOpen]                = useState(false);

    // 포커싱
    const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    // 로딩바표시
    const [isUploading, setIsUploading] = useState(false);
    // 공통 팝업
    const { popup, showAlert, showConfirm, closePopup } = usePopup();

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
                    const rows : ZoneRow[] = (res.data ?? []).map((v : any) => ({
                        srvcCd      : v.srvc_cd         ?? '',
                        whCd        : v.wh_cd           ?? '',
                        zoneCd      : v.zone_cd         ?? '',
                        zoneNm      : v.zone_nm         ?? '',
                        useYn       : v.use_yn          ?? '',
                        regId       : v.reg_id          ?? '',
                        regDate     : v.reg_date        ?? '',
                        updId       : v.upd_id          ?? '',
                        updDate     : v.upd_date        ?? '',
                        isNew       : false,
                        isDirty     : false,
                        uploadStatus: ''
                    }));

                    setZoneList(rows);
                    setZoneSearched(true);
                    setLocList([]);
                    setSelectedZoneCd('');
                    setLocSearched(false);
                }
            },
            (err) => showAlert("조회 실패: " + err?.message)
        )
    }

    const handleZoneSelect = (v : ZoneRow) => {
        setSelectedZoneCd(v.zoneCd);
        getLocList (
            {
                srvcCd  : v.srvcCd,
                whCd    : v.whCd,
                zoneCd  : v.zoneCd,
                locCd   : searchLocCd
            },
            (res) => {
                if (res.resultCode == "0000") {
                    const rows : LocRow[] = (res.data ?? []).map((v : any) => ({
                        srvcCd      : v.srvc_cd     ?? '',
                        whCd        : v.wh_cd       ?? '',
                        zoneCd      : v.zone_cd     ?? '',
                        locCd       : v.loc_cd      ?? '',
                        locClsCd    : v.loc_cls_cd  ?? '',
                        rmk         : v.rmk         ?? '',
                        useYn       : v.use_yn       ?? '',
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
            showAlert("저장할 변경 내용이 없습니다.");
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
                      showAlert("저장되었습니다.");
                      handleSearch();
                  }
              },
              (err) => showAlert("저장 실패: " + err?.message)
          );
      }); 
    }

    // 엑셀다운로드 
    const handleExcel = async () => {
        if (zoneList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("존 마스터");

        // 컬럼 정의
        ws.columns = [
            { header: "고객사"      ,   key: "srvcCd",          width: 20 },
            { header: "센터"        ,   key: "whCd",            width: 15 },
            { header: "존코드"      ,   key: "zoneCd",          width: 15 },
            { header: "존명"        ,   key: "zoneNm",          width: 15 },
            { header: "사용여부"    ,   key: "useYn",           width: 15 },
            { header: "등록자"      ,   key: "regId",           width: 14 },
            { header: "등록일자"    ,   key: "regDate",         width: 14 },
            { header: "수정자"      ,   key: "updId",           width: 14 },
            { header: "수정일자"    ,   key: "updDate",         width: 14 },
        ];

        // 헤더 스타일
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

        // 데이터 행 추가
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
        a.download = `폼목관리_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        document.body.appendChild(a);
        
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    }

    // 행추가(존)
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

    // 행삭제(존)
    const handleDeleteZoneRow = () => {
        const lastNewIdx = zoneList.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();
        
        if (lastNewIdx === undefined) return;
        
        setZoneList(prev => prev.filter((_, i) => i !== lastNewIdx));
    }

    // 양식다운로드
    const handleTempletDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("존마스터_양식");

        ws.columns = [
            { header: "고객사",     key: "srvcCd",       width: 20 },
            { header: "센터",       key: "whCd",         width: 20 },
            { header: "존코드",     key: "zoneCd",       width: 20 },
            { header: "존명",       key: "zoneNm",       width: 20 }
        ];

        const exampleRows = [
            { srvcCd: selectSrvcCd, whCd: selectWhCd, zoneCd : 'A',     zoneNm : '존명 - 첫번째'},
            { srvcCd: selectSrvcCd, whCd: selectWhCd, zoneCd : 'B',     zoneNm : '존명 - 두번째'},
            { srvcCd: selectSrvcCd, whCd: selectWhCd, zoneCd: 'STAGE',  zoneNm : 'STAGE' }
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
        a.download      = "존마스터_양식.xlsx";
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // 엑셀양식업로드
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

            const newZone : ZoneRow[] = rows.slice(1)
                .filter(row => row.length > 0 && row[2])
                .map(row => ({
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

            console.log("----> newZone : " + newZone);

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

     // 인라인 컬럼 편집(존)
    const handleZoneCellChange = (idx: number, field: keyof ZoneRow, value: string) => {
        setZoneList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    // 인라인 컬럼 편집(로케이션)
    const handleLocCellChange = (idx: number, field: keyof LocRow, value: string) => {
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
            { sys_grp_cd : 'WM1040', sys_cd : '', sys_cdnm : ''},
            (res) => setLocClsList(res.data ?? []),
            (err) => showAlert("공통코드 조회 실패 : " + err?.message)
        );
    }, [])

    return (
        <>
        <Popup
            isOpen={popup.isOpen}
            message={popup.message}
            type={popup.type}
            onConfirm={popup.onConfirm}
            onCancel={closePopup}
        />
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

                    {/* ── 섹션 헤더 ── */}
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerTop}>
                            <div className={styles.titleArea}>
                                <h3>존&amp;로케이션 관리</h3>
                                <p>창고 내 존과 상세 로케이션 정보를 구성하고 관리합니다.</p>
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
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                {/* 고객사 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>고객사</label>
                                    <select className={styles.filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{s.srvcNm}</option>)}
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => <option key={w.whCd} value={w.whCd}>{w.whNm}</option>)}
                                    </select>
                                </div>
                                {/* 존 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>존</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchZoneCd} onChange={e => setSearchZoneCd(e.target.value)} />
                                        <button className={styles.filterSearchBtn} onClick={() => setZonePopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchZoneNm} readOnly />
                                    </div>
                                </div>
                                {/* 로케이션 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>로케이션</label>
                                    <input type="text" className={styles.filterInput} value={searchLocCd} onChange={e => setSearchLocCd(e.target.value)} />
                                </div>
                                {/* 사용여부 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>사용여부</label>
                                    <select className={styles.filterSelect} value={searchUseYn} onChange={e => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 패널 그리드 ── */}
                    <div className={styles.panelGrid}>

                        {/* ── 존 패널 ── */}
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div className={styles.panelTitleGroup}>
                                    <span className={styles.panelAccent} />
                                    <h4 className={styles.panelTitle}>존</h4>
                                    <span className={styles.panelCount}>(Total: {zoneList.length})</span>
                                </div>
                                <div className={styles.panelToolbar}>
                                    <button className={styles.btnToolbar} onClick={handleAddZoneRow}>
                                        <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '14px' }}>add</span>
                                        행추가
                                    </button>
                                    <button className={styles.btnToolbar} onClick={handleDeleteZoneRow}>
                                        <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '14px' }}>delete</span>
                                        행삭제
                                    </button>
                                    <button className={styles.btnToolbar} onClick={handleTempletDownload}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span>
                                        양식다운로드
                                    </button>
                                    <label
                                        className={styles.btnToolbar}
                                        style={isUploading ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                                    >
                                        <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleExcelUpload} />
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload_file</span>
                                        {isUploading ? "업로드 중..." : "엑셀업로드"}
                                    </label>
                                </div>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <colgroup>
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '200px' }} />
                                        <col style={{ width: '90px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                    </colgroup>
                                    <thead className={styles.thead}>
                                        <tr>
                                            <th>센터</th>
                                            <th>존코드</th>
                                            <th>존명</th>
                                            <th className={styles.cellCenter}>사용여부</th>
                                            <th>등록자</th>
                                            <th>등록일자</th>
                                            <th>수정자</th>
                                            <th>수정일자</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                        {zoneSearched && zoneList.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className={styles.emptyRow}>
                                                    <span className="material-symbols-outlined">inbox</span>
                                                    <p>조회된 데이터가 없습니다.</p>
                                                </td>
                                            </tr>
                                        ) : zoneList.map((item, index) => (
                                            <tr key={index}
                                                onClick={() => handleZoneSelect(item)}
                                                className={selectedZoneCd === item.zoneCd ? styles.selectedRow : ''}>
                                                <td className={styles.cellCenter}>
                                                    {whList.find(w => w.whCd === item.whCd)?.whNm ?? item.whCd}
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    { 
                                                        item.isNew 
                                                        ? <input type="text" className={styles.cellInput} value={item.zoneCd} 
                                                           onChange={e => handleZoneCellChange(index, "zoneCd", e.target.value)}
                                                           onClick={e => e.stopPropagation()}/>
                                                        : item.zoneCd
                                                    }
                                                </td>
                                                <td>
                                                    <input type="text" className={styles.cellInput} value={item.zoneNm} 
                                                     onChange={e => handleZoneCellChange(index, "zoneNm", e.target.value)}
                                                     onClick={e => e.stopPropagation()}/>
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    <select className={styles.cellInput} value={item.useYn} 
                                                        onChange={e => handleZoneCellChange(index, "useYn", e.target.value)}
                                                        onClick={e => e.stopPropagation()}>
                                                        <option value="Y">사용</option>
                                                        <option value="N">미사용</option>
                                                    </select>
                                                </td>
                                                <td className={styles.cellCenter}>{item.regId}</td>
                                                <td className={styles.cellCenter}>{item.regDate}</td>
                                                <td className={styles.cellCenter}>{item.updId}</td>
                                                <td className={styles.cellCenter}>{item.updDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* ── 로케이션 패널 ── */}
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div className={styles.panelTitleGroup}>
                                    <span className={styles.panelAccentAlt} />
                                    <h4 className={styles.panelTitle}>로케이션</h4>
                                    <span className={styles.panelCount}>
                                        {selectedZoneCd ? `${selectedZoneCd} · ` : ''}(Total: {locList.length})
                                    </span>
                                </div>
                                <div className={styles.panelToolbar}>
                                    <button className={styles.btnToolbar} onClick={handleAddLocRow}>
                                        <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '14px' }}>add</span>
                                        행추가
                                    </button>
                                    <button className={styles.btnToolbar} onClick={handleDeleteLocRow}>
                                        <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '14px' }}>delete</span>
                                        행삭제
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
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
                                    <thead className={styles.thead}>
                                        <tr>
                                            <th>로케이션코드</th>
                                            <th>로케이션구분</th>
                                            <th className={styles.cellCenter}>사용여부</th>
                                            <th>비고</th>
                                            <th>등록자</th>
                                            <th>등록일자</th>
                                            <th>수정자</th>
                                            <th>수정일자</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                        { locSearched && locList.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className={styles.emptyRow}>
                                                    <span className="material-symbols-outlined">inbox</span>
                                                    <p>조회된 데이터가 없습니다.</p>
                                                </td>
                                            </tr>
                                        ) : locList.map((item, index) => (
                                            <tr key={index}>
                                                <td className={styles.cellCenter}>
                                                    {
                                                        item.isNew 
                                                        ? <input type="text" className={styles.cellInput} value={item.locCd} 
                                                           onChange={e => handleLocCellChange(index, "locCd", e.target.value)}
                                                           onClick={e => e.stopPropagation()}/>
                                                        : item.locCd
                                                    }
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    <select className={styles.cellInput} value={item.locClsCd} 
                                                     onChange={e => handleLocCellChange(index, "locClsCd", e.target.value)}
                                                     onClick={e => e.stopPropagation()}>
                                                        { 
                                                            locClsList.map(v => (
                                                                <option key={v.sys_cd} value={v.sys_cd}>{v.sys_cdnm}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    <select className={styles.cellInput} value={item.useYn}
                                                        onChange={e => handleLocCellChange(index, "useYn", e.target.value)}
                                                        onClick={e => e.stopPropagation()}>
                                                        <option value="Y">사용</option>
                                                        <option value="N">미사용</option>
                                                    </select>
                                                </td>
                                                <td className={styles.cellDim}>
                                                    <input type="text" className={styles.cellInput} value={item.rmk} 
                                                     onChange={e => handleLocCellChange(index, "rmk", e.target.value)}
                                                     onClick={e => e.stopPropagation()}/>
                                                </td>
                                                <td className={styles.cellCenter}>{item.regId}</td>
                                                <td className={styles.cellCenter}>{item.regDate}</td>
                                                <td className={styles.cellCenter}>{item.updId}</td>
                                                <td className={styles.cellCenter}>{item.updDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
