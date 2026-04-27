import ExcelJS from "exceljs";
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { useCommonWhList } from "../../api/common/commonWhList";
import { getTokenPayload } from "../../utils/auth";
import { getList, saveVehicle, deleteVehicle, type Vehicle } from "../../api/master/master_0010Service";
import styles from "./cj_wms_master_0010.module.css";

// 화면에서 사용하는 차량타입
interface VehicleRow extends Vehicle {
    _id: number;               // 화면용 임시 ID
    isNew: boolean;            // 신규여부
    isDirty: boolean;          // 수정여부
    uploadStatus: string;      // 엑셀업로드 상태
}

const CJ_WMS_MASTER_0010: React.FC = () => {
    // 권한센터 목록 조회(공통)
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
    const [searchSrvcCd, setSearchSrvcCd] = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd] = useState(selectWhCd);
    // 검색조건
    const [searchVehicleNo, setSearchVehicleNo] = useState("");
    const [searchUseYn, setSearchUseYn] = useState("");
    // 차량 목록
    const [vehicleIds, setVehicleIds] = useState<VehicleRow[]>([]);
    const [selectCheckIds, setSelectCheckIds] = useState<number[]>([]);

    // 엑셀문서 입력
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 사용자ID 정보 가져오기
    const payload = getTokenPayload();
    // 로딩바표시
    const [isUploading, setIsUploading] = useState(false);

    // 헤더 고객사/센터 변경시 동기화
    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); }, [selectWhCd]);

    // 조회
    const handleSearch = () => {
        getList(
            { srvcCd: searchSrvcCd, whCd: searchWhCd, vehicleNo: searchVehicleNo, useYn: searchUseYn },
            (res) => {
                const rows: VehicleRow[] = (res.data ?? []).map((v: any, i) => ({
                    _id: i + 1,
                    srvcCd: v.srvc_cd ?? "",
                    whCd: v.wh_cd ?? "",
                    vehicleNo: v.vehicle_no ?? "",
                    drvNm: v.drv_nm ?? "",
                    hpNo: v.hp_no ?? "",
                    tonClsCd: v.ton_cls_cd ?? "",
                    useYn: v.use_yn ?? "",
                    regId: v.reg_id ?? "",
                    regDate: v.reg_date ?? "",
                    updId: v.upd_id ?? "",
                    updDate: v.upd_date ?? "",
                    isNew: false,
                    isDirty: false,
                    uploadStatus: "",
                }));
                setVehicleIds(rows);
                setSelectCheckIds([]);
            },
            (err) => alert("조회 실패: " + err?.message)
        );
    };

    // 저장 (신규 또는 수정된 행)
    const handleSave = () => {
        const saveRows = vehicleIds.filter(v => v.isNew || v.isDirty);
        if (saveRows.length === 0) {
            alert("저장할 데이터가 없습니다.");
            return;
        }

        const invalid = saveRows.find(v => !v.vehicleNo.trim());
        if (invalid) {
            alert("차량번호는 필수 입력값입니다.");
            return;
        }

        const userId = payload?.userId ?? "";
        const vehicleList = saveRows.map(v => ({
            srvcCd: v.srvcCd ? v.srvcCd : searchSrvcCd,
            whCd: v.whCd ? v.whCd : searchWhCd,
            vehicleNo: v.vehicleNo.trim(),
            drvNm: v.drvNm,
            hpNo: v.hpNo,
            tonClsCd: v.tonClsCd,
            useYn: v.useYn,
            userId,
        }));

        saveVehicle(
            { vehicles: vehicleList },
            () => { alert("저장되었습니다."); handleSearch(); },
            (err) => alert("저장 실패: " + err?.message)
        );
    };

    // 삭제 (DB 행)
    const handleDelete = () => {
        const dbRows = vehicleIds.filter(v => selectCheckIds.includes(v._id) && !v.isNew);
        if (dbRows.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }
        if (!window.confirm(`선택한 ${dbRows.length}건을 삭제하시겠습니까?`)) return;

        deleteVehicle(
            { vehicleNos: dbRows.map(v => v.vehicleNo), srvcCd: searchSrvcCd, whCd: searchWhCd },
            () => { alert("삭제되었습니다."); handleSearch(); },
            (err) => alert("삭제 실패: " + err?.message)
        );
    };

    // 엑셀다운로드
    const handleExcel = () => {
        console.log("---> vehicleIds : " + JSON.stringify(vehicleIds));
    };

    // 체크박스 : 전체선택
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectCheckIds(e.target.checked ? vehicleIds.map(v => v._id) : []);
    };

    // 체크박스 : 행선택
    const handleSelectRow = (id: number) => {
        setSelectCheckIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // 행추가
    const handleAddRow = () => {
        const newId = Date.now();
        setVehicleIds(prev => [...prev, {
            _id: newId,
            vehicleNo: "",
            drvNm: "",
            hpNo: "",
            tonClsCd: "",
            useYn: "Y",
            srvcCd: "",
            whCd: "",
            isNew: true,
            isDirty: false,
            uploadStatus: "",
        }]);
    };

    // 행삭제
    const handleDeleteRow = () => {
        // 마지막 추가행(신규)
        const lastRow = [...vehicleIds].reverse().find(v => v.isNew);

        if (!lastRow) {
            return;
        }

        setVehicleIds(prev => {
            const idx = [...prev].map(v => v._id).lastIndexOf(lastRow._id);
            return prev.filter((_, i) => i !== idx);
        });
        setSelectCheckIds([]);
    };

    // 양식다운로드
    const handleTemplateExcelDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("차량관리_양식");

        ws.columns = [
            { header: "고객사", key: "srvcCd", width: 20 },
            { header: "센터", key: "whCd", width: 20 },
            { header: "차량번호", key: "vehicleNo", width: 20 },
            { header: "기사명", key: "drvNm", width: 15 },
            { header: "톤급", key: "tonClsCd", width: 10 },
            { header: "HP번호", key: "hpNo", width: 18 },
        ];

        const exampleRows = [
            { srvcCd: "1201", whCd: "C102", vehicleNo: "서울12가 1234", drvNm: "홍길동", tonClsCd: "5", hpNo: "010-1234-5678" },
            { srvcCd: "1201", whCd: "C102", vehicleNo: "경기34나 5678", drvNm: "김철수", tonClsCd: "1", hpNo: "010-9876-5432" },
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

        // 로딩바 표시
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const wb = XLSX.read(data, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const newVehicles: VehicleRow[] = rows.slice(1)
                .filter(row => row.length > 0 && row[0])
                .map((row, i) => ({
                    _id: Date.now() + i,
                    vehicleNo: row[2] ?? "",
                    drvNm: row[3] ?? "",
                    tonClsCd: row[4] ?? "",
                    hpNo: row[5] ?? "",
                    srvcCd: row[0] ?? "",
                    whCd: row[1] ?? "",
                    useYn: "Y",
                    isNew: true,
                    isDirty: false,
                    uploadStatus: "UPLOAD",
                }));

            setVehicleIds(prev => [...prev.filter(v => !v.isNew), ...newVehicles]);
            // 로딩바 해제
            setIsUploading(false);
        };
        reader.onerror = () => {
            alert("엑셀 파일 업로드 실패");
            // 로딩바 해제
            setIsUploading(false);
        }
        reader.readAsBinaryString(file);
        e.target.value = "";
    };

    // 인라인 컬럼 편집
    const handleCellChange = (id: number, field: keyof VehicleRow, value: string) => {
        setVehicleIds(prev => prev.map(v => v._id === id ? { ...v, [field]: value, isDirty: true } : v));
    };

    return (
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
                                <col style={{ width: '50px' }} />   {/* 체크박스 */}
                                <col style={{ width: '110px' }} />  {/* 차량번호 */}
                                <col style={{ width: '100px' }} />  {/* 기사명 */}
                                <col style={{ width: '60px' }} />   {/* 톤급 */}
                                <col style={{ width: '120px' }} />  {/* H.P 번호 */}
                                <col style={{ width: '60px' }} />   {/* 사용 */}
                                <col style={{ width: '80px' }} />  {/* 등록자 */}
                                <col style={{ width: '100px' }} />  {/* 등록일자 */}
                                <col style={{ width: '80px' }} />  {/* 수정자 */}
                                <col style={{ width: '100px' }} />  {/* 수정일자 */}
                                <col style={{ width: '150px' }} />  {/* 업로드결과 */}
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.cellCenter}>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleSelectAll}
                                            checked={selectCheckIds.length === vehicleIds.length && vehicleIds.length > 0} />
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
                                {vehicleIds.map((v) => (
                                    <tr key={v._id} onClick={() => handleSelectRow(v._id)}
                                        style={v.isNew ? { backgroundColor: "rgba(0, 63, 135, 0.04)" } : {}}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox}
                                                checked={selectCheckIds.includes(v._id)}
                                                onChange={() => { }} />
                                        </td>
                                        <td className={styles.cellBold}>
                                            {v.isNew
                                                ? <input type="text" className={styles.cellInput} value={v.vehicleNo}
                                                    onChange={e => handleCellChange(v._id, "vehicleNo", e.target.value)}
                                                    onClick={e => e.stopPropagation()} placeholder="차량번호" />
                                                : v.vehicleNo}
                                        </td>
                                        <td className={styles.cellMedium}>
                                            <input type="text" className={styles.cellInput} value={v.drvNm}
                                                onChange={e => handleCellChange(v._id, "drvNm", e.target.value)}
                                                onClick={e => e.stopPropagation()} placeholder="기사명" />
                                        </td>
                                        <td className={styles.cellDim}>
                                            <input type="text" className={styles.cellInput} value={v.tonClsCd}
                                                onChange={e => handleCellChange(v._id, "tonClsCd", e.target.value)}
                                                onClick={e => e.stopPropagation()} placeholder="톤급" />
                                        </td>
                                        <td className={styles.cellMono}>
                                            <input type="text" className={styles.cellInput} value={v.hpNo}
                                                onChange={e => handleCellChange(v._id, "hpNo", e.target.value)}
                                                onClick={e => e.stopPropagation()} placeholder="휴대전화번호" />
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
                                                <span className={`${styles.badge} ${v.uploadStatus === 'UPLOAD' ? styles.badgeInfo : styles.badgeError}`}>
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
    );
};

export default CJ_WMS_MASTER_0010;
