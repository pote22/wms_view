import ExcelJS from "exceljs";
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { useCommonWhList } from "../../api/common/commonWhList";
import { getTokenPayload } from "../../utils/auth";
import { getList, saveVehicle, deleteVehicle, getCheckList, type Vehicle, type CheckResult } from "../../api/master/master_0010Service";
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
import styles from "./cj_wms_master_0010.module.css";
import { getTonList, type TonCd } from "../../api/common/commonService"

// 화면에서 사용하는 차량타입
interface VehicleRow extends Vehicle {
    chk             : string;      // 체크박스 ('0'=미선택, '1'=선택)
    isNew           : boolean;     // 신규여부
    isDirty         : boolean;     // 수정여부
    uploadStatus    : string;      // 엑셀업로드 상태
}

const CJ_WMS_MASTER_0010: React.FC = () => {
    // 권한센터 목록 조회(공통)
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
    const [searchSrvcCd, setSearchSrvcCd] = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd] = useState(selectWhCd);
    // 차량톤급 조회(공통)
    const [tonList, setTonList] = useState<TonCd[]>([]);
    // 검색조건
    const [searchVehicleNo, setSearchVehicleNo] = useState("");
    const [searchUseYn, setSearchUseYn] = useState("");
    // 공통팝업
    const { popup, showAlert, showConfirm, closePopup } = usePopup();
    // 차량 목록
    const [vehicleIds, setVehicleIds] = useState<VehicleRow[]>([]);
    // 엑셀문서 입력
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 사용자ID 정보 가져오기
    const payload = getTokenPayload();
    // 로딩바표시
    const [isUploading, setIsUploading] = useState(false);
    // confirm 다이얼로그
    const [isSaving, setIsSaving] = useState(false);
    // HP 번호 정규식
    const HP_NO_REGEX = /^0\d{1,2}-\d{3,4}-\d{4}$/;
    const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    // 헤더 고객사/센터 변경시 동기화
    useEffect(() => { 
        setSearchSrvcCd(selectSrvcCd); 
    }, [selectSrvcCd]);
    
    useEffect(() => { 
        setSearchWhCd(selectWhCd); 
    }, [selectWhCd]);

    useEffect(() => {
        getTonList(
            (res) => setTonList(res.data ?? []),
            (err) => console.error("톤급 목록 조회 실패 : ", err)
        );
    }, []);

    // 조회
    const handleSearch = () => {
        getList(
            { srvcCd: searchSrvcCd, whCd: searchWhCd, vehicleNo: searchVehicleNo, useYn: searchUseYn },
            (res) => {
                const rows: VehicleRow[] = (res.data ?? []).map((v: any) => ({
                    chk         : v.chk ?? '0',
                    srvcCd      : v.srvc_cd ?? "",
                    whCd        : v.wh_cd ?? "",
                    vehicleNo   : v.vehicle_no ?? "",
                    drvNm       : v.drv_nm ?? "",
                    hpNo        : v.hp_no ?? "",
                    tonClsCd    : v.ton_cls_cd ?? "",
                    useYn       : v.use_yn ?? "",
                    regId       : v.reg_id ?? "",
                    regDate     : v.reg_date ?? "",
                    updId       : v.upd_id ?? "",
                    updDate     : v.upd_date ?? "",
                    isNew       : false,
                    isDirty     : false,
                    uploadStatus: "",
                }));
                setVehicleIds(rows);
            },
            (err) => showAlert("조회 실패: " + err?.message)
        );
    };

    // 저장 (체크된 행)
    const handleSave = () => {
        const saveRows = vehicleIds.filter(v => v.chk === '1');

        if (saveRows.length === 0) {
            showAlert("저장할 항목을 선택해주세요.");
            return;
        }

        const inValidVNoIdx = vehicleIds.findIndex(v => v.chk === '1' && !v.vehicleNo.trim());

        if (inValidVNoIdx !== -1) {
            
            const el = cellRefs.current.get(`${inValidVNoIdx}_vehicleNo`);
            showAlert("차량번호를 입력하세요.", () => el?.focus());
            return;
        }

        const vehicleTonCdList = tonList.map(t => t.sys_cd)
        const inValidIdx = vehicleIds.findIndex(v => v.chk === '1' && v.tonClsCd && !vehicleTonCdList.includes(v.tonClsCd));
        
        if (inValidIdx !== -1) {
            const el = cellRefs.current.get(`${inValidIdx}_tonClsCd`);
            showAlert(`차량번호 : ${vehicleIds[inValidIdx].vehicleNo}의 톤급이 올바르지 않습니다.`, () => el?.focus());
            return;
        }

        const inValidHpNoIdx = vehicleIds.findIndex(v => v.chk === '1' && v.hpNo && !HP_NO_REGEX.test(v.hpNo));

        if (inValidHpNoIdx !== -1) {
            const el = cellRefs.current.get(`${inValidHpNoIdx}_hpNo`);
            showAlert(`H.P번호 형식이 올바르지 않습니다.(예 : 010-1234-5678)`, () => el?.focus());
            return;
        }

        showConfirm(`저장하시겠습니까?`, () => {
            closePopup();
            setIsSaving(true);

            const userId        = payload?.userId ?? "";
            const vehicleList   = saveRows.map(v => ({
                srvcCd      : v.srvcCd ? v.srvcCd : searchSrvcCd,
                whCd        : v.whCd ? v.whCd : searchWhCd,
                vehicleNo   : v.vehicleNo.trim(),
                drvNm       : v.drvNm,
                hpNo        : v.hpNo,
                tonClsCd    : v.tonClsCd,
                useYn       : v.useYn,
                userId,
            }));
            
            saveVehicle(
                { vehicles: vehicleList },
                () => { 
                    setIsSaving(false); 
                    showAlert("저장 되었습니다.");
                    handleSearch();  
                },
                (err) => {
                    setIsSaving(false);
                    showAlert("저장 실패: " + err?.message)
                }
            );
        });
    };

    // 삭제 (체크된 DB 행)
    const handleDelete = () => {
        const dbRows = vehicleIds.filter(v => v.chk === '1' && !v.isNew);

        if (dbRows.length === 0) {
            showAlert("삭제할 항목을 선택해주세요.");
            return;
        }

        showConfirm(`선택한 ${dbRows.length}건을 삭제하시겠습니까?`, () => {
            closePopup();
            deleteVehicle(
                { vehicleNos: dbRows.map(v => v.vehicleNo), srvcCd: searchSrvcCd, whCd: searchWhCd },
                () => { handleSearch(); showAlert("삭제 되었습니다."); },
                (err) => showAlert("삭제 실패: " + err?.message)
            );
        });
    };

    // 엑셀다운로드
    const handleExcel = async () => {
        if (vehicleIds.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("차량관리");

        // 컬럼 정의
        ws.columns = [
            { header: "차량번호",   key: "vehicleNo",   width: 20 },
            { header: "기사명",     key: "drvNm",       width: 15 },
            { header: "톤급",       key: "tonClsCd",    width: 10 },
            { header: "HP번호",     key: "hpNo",        width: 18 },
            { header: "사용여부",   key: "useYn",       width: 10 },
            { header: "등록자",     key: "regId",       width: 15 },
            { header: "등록일자",   key: "regDate",     width: 14 },
            { header: "수정자",     key: "updId",       width: 15 },
            { header: "수정일자",   key: "updDate",     width: 14 },
        ];

        // 헤더 스타일
        const headerRow = ws.getRow(1);

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF003F87" },
            };

            cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" },
            };
        });

        headerRow.height = 22;

        // 데이터 행 추가
        vehicleIds.forEach(v => {
            const row = ws.addRow({
                vehicleNo   : v.vehicleNo,
                drvNm       : v.drvNm,
                tonClsCd    : v.tonClsCd,
                hpNo        : v.hpNo,
                useYn       : v.useYn,
                regId       : v.regId ?? "",
                regDate     : v.regDate ?? "",
                updId       : v.updId ?? "",
                updDate     : v.updDate ?? "",
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
        a.download = `차량관리_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        document.body.appendChild(a);
        
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    };

    // 체크박스 : 전체선택
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setVehicleIds(prev => prev.map(v => ({ ...v, chk: val })));
    };

    // 체크박스 : 행선택
    const handleSelectRow = (idx: number) => {
        setVehicleIds(prev => prev.map((v, i) => i === idx ? { ...v, chk: v.chk === '1' ? '0' : '1' } : v));
    };

    // 행추가
    const handleAddRow = () => {
        setVehicleIds(prev => [...prev, {
            chk             : '1',
            vehicleNo       : "",
            drvNm           : "",
            hpNo            : "",
            tonClsCd        : "",
            useYn           : "Y",
            srvcCd          : "",
            whCd            : "",
            isNew           : true,
            isDirty         : false,
            uploadStatus    : "",
        }]);
    };

    // 행삭제 (마지막 신규행 제거)
    const handleDeleteRow = () => {
        const lastNewIdx = vehicleIds.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();

        if (lastNewIdx === undefined) return;
        
        setVehicleIds(prev => prev.filter((_, i) => i !== lastNewIdx));
    };

    // 양식다운로드
    const handleTemplateExcelDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("차량관리_양식");

        ws.columns = [
            { header: "고객사",     key: "srvcCd",      width: 20 },
            { header: "센터",       key: "whCd",        width: 20 },
            { header: "차량번호",   key: "vehicleNo",   width: 20 },
            { header: "기사명",     key: "drvNm",       width: 15 },
            { header: "톤급",       key: "tonClsCd",    width: 10 },
            { header: "HP번호",     key: "hpNo",        width: 18 },
        ];

        const exampleRows = [
            { srvcCd: "1201", whCd: "C102", vehicleNo: "서울12가 1234", drvNm: "홍길동", tonClsCd: "5", hpNo: "010-1234-5678" },
            { srvcCd: "1201", whCd: "C102", vehicleNo: "경기34나 5678", drvNm: "김철수", tonClsCd: "1.5", hpNo: "010-1234-5678" },
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
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "차량관리_양식.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // 엑셀업로드
    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const wb = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const newVehicles: VehicleRow[] = rows.slice(1)
                .filter(row => row.length > 0 && row[0])
                .map((row) => ({
                    chk         : '1',
                    vehicleNo   : String(row[2] ?? "").trim(),
                    drvNm       : String(row[3] ?? "").trim(),
                    tonClsCd    : String(row[4] ?? "").trim(),
                    hpNo        : String(row[5] ?? "").trim(),
                    srvcCd      : String(row[0] ?? "").trim(),
                    whCd        : String(row[1] ?? "").trim(),
                    useYn       : "Y",
                    isNew       : true,
                    isDirty     : false,
                    uploadStatus: '검증중...',
                }));

            setVehicleIds(newVehicles);

            getCheckList(
                { vehicles: newVehicles.map(v => ({ vehicleNo: v.vehicleNo, tonClsCd: v.tonClsCd, hpNo: v.hpNo })) },
                (res) => {
                    const results: CheckResult[] = res.data ?? [];
                    setVehicleIds(prev => {
                        const existing = prev.filter(v => !v.isNew);
                        const updated = newVehicles.map((v, i) => {
                            const r = results.find(r => r.rowIndex === i);
                            return { ...v, uploadStatus: r ? (r.isValid ? "OK" : r.errors.join(" / ")) : v.uploadStatus };
                        });
                        return [...existing, ...updated];
                    });
                    setIsUploading(false);
                },
                (err) => {
                    setVehicleIds(prev => prev.filter(v => !v.isNew));
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
    };

    // 인라인 컬럼 편집
    const handleCellChange = (idx: number, field: keyof VehicleRow, value: string) => {
        setVehicleIds(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    return (
        <>
        <Popup
            isOpen={popup.isOpen}
            message={popup.message}
            type={popup.type}
            onConfirm={popup.onConfirm}
            onCancel={closePopup}
        />
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>

                        {/* Title & Actions */}
                        <div className={styles.titleRow}>
                            <div className={styles.titleArea}>
                                <h3>차량관리</h3>
                                <p>운영 차량 및 기사 정보를 관리합니다.</p>
                            </div>
                            <div className={styles.mainActions}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>
                                    <span className="material-symbols-outlined">search</span> 조회
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleSave}>
                                    <span className="material-symbols-outlined">save</span> 저장
                                </button>
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                                    <span className="material-symbols-outlined">delete_outline</span> 삭제
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">description</span> 엑셀
                                </button>
                            </div>
                        </div>

                        {/* Search Filter Box */}
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>고객사</label>
                                    <select className={styles.filterSelect} value={searchSrvcCd} onChange={(e) => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => (
                                            <option key={s.srvcCd} value={s.srvcCd}>{s.srvcNm}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect} value={searchWhCd} onChange={(e) => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => (
                                            <option key={w.whCd} value={w.whCd}>{w.whNm}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>차량번호</label>
                                    <input className={styles.filterInput} type="text" placeholder="차량번호 입력"
                                        value={searchVehicleNo} onChange={(e) => setSearchVehicleNo(e.target.value)} />
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>사용여부</label>
                                    <select className={styles.filterSelect} value={searchUseYn} onChange={(e) => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar} onClick={handleAddRow}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#003f87' }}>add</span> 행추가
                                </button>
                                <button className={styles.btnToolbar} onClick={handleDeleteRow}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a' }}>remove</span> 행삭제
                                </button>
                            </div>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar} onClick={handleTemplateExcelDownload}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span> 양식다운로드
                                </button>
                                <button className={styles.btnToolbar} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    {
                                        isUploading
                                            ? <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>upload_file</span>
                                            : <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                                    }
                                    {isUploading ? "업로드 중..." : "업로드"}
                                </button>
                                <input type="file" ref={fileInputRef} accept=".xlsx,.xls"
                                    style={{ display: "none" }} onChange={handleExcelUpload} />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                <col style={{ width: '50px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '70px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '60px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '150px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.cellCenter}>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleSelectAll}
                                            checked={vehicleIds.length > 0 && vehicleIds.every(v => v.chk === '1')} />
                                    </th>
                                    <th>차량번호</th>
                                    <th>기사명</th>
                                    <th>톤급</th>
                                    <th>H.P 번호</th>
                                    <th className={styles.cellCenter}>사용</th>
                                    <th>등록자</th>
                                    <th>등록일자</th>
                                    <th>수정자</th>
                                    <th>수정일자</th>
                                    <th>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {vehicleIds.map((v, idx) => (
                                    <tr key={idx} onClick={() => handleSelectRow(idx)}
                                        style={v.isNew ? { backgroundColor: "rgba(0, 63, 135, 0.04)" } : {}}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox}
                                                checked={v.chk === '1'}
                                                onChange={() => { }} />
                                        </td>
                                        <td className={styles.cellBold}>
                                            {v.isNew
                                                ? <input type="text" className={styles.cellInput} value={v.vehicleNo}
                                                    onChange={e => handleCellChange(idx, "vehicleNo", e.target.value)}
                                                    onClick={e => e.stopPropagation()} placeholder="차량번호" 
                                                    ref={setCellRef(idx, "vehicleNo") as any}/>
                                                : v.vehicleNo}
                                        </td>
                                        <td className={styles.cellMedium}>
                                            <input type="text" className={styles.cellInput} value={v.drvNm}
                                                onChange={e => handleCellChange(idx, "drvNm", e.target.value)}
                                                onClick={e => e.stopPropagation()} placeholder="기사명" />
                                        </td>
                                        <td className={styles.cellDim}>
                                            <select className={styles.cellInput} value={v.tonClsCd} 
                                                onChange={e => handleCellChange(idx, "tonClsCd", e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                ref={setCellRef(idx, "tonClsCd") as any}>
                                                <option value="">선택</option>
                                                { tonList.map(t => (
                                                    <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cdnm}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={styles.cellMono}>
                                            <input type="text" className={styles.cellInput} value={v.hpNo}
                                                onChange={e => handleCellChange(idx, "hpNo", e.target.value)}
                                                onClick={e => e.stopPropagation()} placeholder="휴대전화번호" 
                                                ref={setCellRef(idx, "hpNo") as any}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <span className={`${styles.badge} ${v.useYn === 'Y' ? styles.badgeSuccess : styles.badgeError}`}>
                                                {v.useYn}
                                            </span>
                                        </td>
                                        <td className={styles.cellDim}>{v.regId}</td>
                                        <td className={styles.cellDim}>{v.regDate}</td>
                                        <td className={styles.cellDim}>{v.updId}</td>
                                        <td className={styles.cellDim}>{v.updDate}</td>
                                        <td>
                                            {v.uploadStatus && (
                                                <span className={`${styles.badge} ${
                                                    v.uploadStatus === '검증중...' ? styles.badgeInfo :
                                                    v.uploadStatus === 'OK'        ? styles.badgeSuccess :
                                                    styles.badgeError
                                                }`}>
                                                    {v.uploadStatus}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {/*
                    <div className={styles.pagination}>
                        <p className={styles.pageInfo}>Showing 1 to 5 of 24 entries</p>
                        <div className={styles.pageList}>
                            <button className={`${styles.btnPage} ${styles.btnPageNav}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <button className={`${styles.btnPage} ${styles.btnPageActive}`}>1</button>
                            <button className={styles.btnPage}>2</button>
                            <button className={styles.btnPage}>3</button>
                            <button className={`${styles.btnPage} ${styles.btnPageNav}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                    */}
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_MASTER_0010;
