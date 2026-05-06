import React, { useState, useEffect, useRef } from 'react';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
import { getList, saveProdInfo, deleteProdInfo, type Item } from '../../api/master/master_0030Service'
// 레이어 팝업
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
import styles from './cj_wms_master_0030.module.css';
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";

// 화면에서 사용하는 품목정보
interface ItemRow extends Item {
    chk             : string;   // 체크박스 ('0'=미선택, '1'=선택)      
    isNew           : boolean;  // 신규여부
    isDirty         : boolean;  // 수정여부
    uploadStatus    : string;   // 엑셀업로드 상태
}

const CJ_WMS_MASTER_0030: React.FC = () => {
    // 고객사&센터 리스트 조회
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
    // 공통 팝업
    const { popup, showAlert, showConfirm, closePopup } = usePopup();
    // 토큰 정보
    const payload = getTokenPayload();
    // 조회조건
    const [searchSrvcCd, setSearchSrvcCd]               = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd]                   = useState(selectWhCd);
    const [searchProdCd, setSearchProdCd]               = useState('');
    const [searchProdNm, setSearchProdNm]               = useState('');
    const [searchUseYn, setSearchUseYn]                 = useState('Y');
    const [searchProdCategory, setSearchProdCategory]   = useState('');
    const [searchProdShape, setSearchProdShape]         = useState('');
    const [searchSteItemNo, setSearchSteItemNo]         = useState('');
    // 리스트 객체
    const [items, setItems] = useState<ItemRow[]>([]);
    // 조회 실행 여부
    const [searched, setSearched] = useState(false);
    // confirm 다이얼로그
    const [isSaved, setIsSaved] = useState(false);
    // 포커싱
    const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };



    // 체크박스(전체선택)
    const handleSelectAll = (e : React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setItems(prev => prev.map(v => ({ ...v, chk: val })));
    };
    // 체크박스(선택)
    const handleSelectRow = (idx : number) => {
        setItems(prev => prev.map((v, i) => i === idx ? { ...v, chk: v.chk === '1' ? '0' : '1' } : v));
    }
    
     // 헤더 고객사/센터 변경시 동기화
    useEffect(() => { 
        setSearchSrvcCd(selectSrvcCd); 
    }, [selectSrvcCd]);
    
    useEffect(() => { 
        setSearchWhCd(selectWhCd); 
    }, [selectWhCd]);

    // 조회
    const handleSearch = () => {
        getList(
            {   srvcCd          : searchSrvcCd,
                whCd            : searchWhCd,
                prodCd          : searchProdCd,
                prodNm          : searchProdNm,
                useYn           : searchUseYn,
                prodCategory    : searchProdCategory,
                prodShape       : searchProdShape,
                steItemNo       : searchSteItemNo 
            },
            (res) => {
                const rows : ItemRow[] = (res.data ?? []).map((v: any) => ({
                    chk         : v.chk             ?? '0',
                    srvcCd      : v.srvc_cd         ?? '',
                    whCd        : v.wh_cd           ?? '',
                    prodCd      : v.prod_cd         ?? '',
                    prodNm      : v.prod_nm         ?? '',
                    steitemNo   : v.steitem_no      ?? '',
                    prodCategory: v.prod_category   ?? '',
                    prodShape   : v.prod_shape      ?? '',
                    prodType    : v.prod_type       ?? '',
                    createTime  : v.create_time     ?? '',
                    useYn       : v.use_yn          ?? '',
                    fifoYn      : v.fifo_yn         ?? '',
                    price       : v.price           ?? 0,
                    innerpack   : v.innerpack       ?? '',
                    prodUnit    : v.prod_unit       ?? '',
                    weight      : v.weight          ?? 0.00,
                    realWeight  : v.real_weight     ?? 0.00,
                    weightUnit  : v.weight_unit     ?? '',
                    regId       : v.reg_id          ?? '',
                    regDate     : v.reg_date        ?? '',
                    updId       : v.upd_id          ?? '',
                    updDate     : v.upd_date        ?? '',
                    isNew       : false,
                    isDirty     : false,
                    uploadStatus: '',
                }));
                setItems(rows);
                setSearched(true);
            },
            (err) => showAlert("조회 실패: " + err?.message)
        );
    };

    // 저장
    const handleSave = () => {
        var chkRow = items.filter(v => v.chk === '1');

        if (chkRow.length <= 0) {
            showAlert("저장할 항목을 선택해주세요.");
            return;
        }

       
    };

    // 삭제
    const handleDelete = () => {
        showAlert("삭제");
    };

    // 엑셀다운로드
    const handleExcel = async () => {
        if (items.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("품목관리");

        // 컬럼 정의
        ws.columns = [
            { header: "고객사",             key: "srvcCd",          width: 20 },
            { header: "센터",               key: "whCd",            width: 15 },
            { header: "품목번호",           key: "prodCd",          width: 10 },
            { header: "품목명",             key: "prodNm",          width: 18 },
            { header: "설계품번(고객품번)",  key: "steitemNo",       width: 10 },
            { header: "품목구분",           key: "prodCategory",    width: 15 },
            { header: "품목형태",           key: "prodShape",       width: 14 },
            { header: "품목타입",           key: "prodType",        width: 15 },
            { header: "생성일자",           key: "createTime",      width: 14 },
            { header: "사용여부",           key: "useYn",           width: 14 },
            { header: "선입선출여부",       key: "fifoYn",          width: 14 },
            { header: "단가",               key: "price",          width: 14 },
            { header: "용기수량",           key: "innerpack",      width: 14 },
            { header: "용기단위",           key: "prodUnit",       width: 14 },
            { header: "무게중량",           key: "weight",         width: 14 },
            { header: "무게실중량",         key: "realWeight",     width: 14 },
            { header: "무게단위",           key: "weightUnit",     width: 14 },
            { header: "등록자",             key: "regId",          width: 14 },
            { header: "등록일자",           key: "regDate",         width: 14 },
            { header: "수정자",             key: "updId",           width: 14 },
            { header: "수정일자",           key: "updDate",         width: 14 },
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
        items.forEach(v => {
            const row = ws.addRow({
                srvcCd      : v.srvcCd,
                whCd        : v.whCd,
                prodCd      : v.prodCd,
                prodNm      : v.prodNm          ?? '',
                steitemNo   : v.steitemNo       ?? '',
                prodCategory: v.prodCategory    ?? '',
                prodShape   : v.prodShape       ?? '',
                prodType    : v.prodType        ?? '',
                createTime  : v.createTime      ?? '',
                useYn       : v.useYn           ?? '',
                fifoYn      : v.fifoYn          ?? '',
                price       : v.price           ?? 0,
                innerpack   : v.innerpack       ?? '',
                prodUnit    : v.prodUnit        ?? '',
                weight      : v.weight          ?? 0,
                realWeight  : v.realWeight      ?? 0,
                weightUnit  : v.weightUnit      ?? '',
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
        a.download = `폼목관리_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        document.body.appendChild(a);
        
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    };

    // 행추가
    const handleAddRow = () => {
        setItems(prev => [...prev, {
            chk         : '1',
            srvcCd      : selectSrvcCd,
            whCd        : selectWhCd,
            prodCd      : '',
            prodNm      : '',
            steitemNo   : '',
            prodCategory: '',
            prodShape   : '',
            prodType    : '',
            createTime  : '',
            useYn       : '',
            fifoYn      : '',
            price       : '',
            innerpack   : '',
            prodUnit    : '',
            weight      : '',
            realWeight  : '',
            weightUnit  : '',
            regId       : '',
            regDate     : '',
            updId       : '',
            updDate     : '',
            isNew       : true,
            isDirty     : false,
            uploadStatus: '',
        }]);
    };

    // 행삭제
    const handleDeleteRow = () => {
        const lastNewIdx = items.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();
        
        if (lastNewIdx === undefined) return;
        
        setItems(prev => prev.filter((_, i) => i !== lastNewIdx));
    };

    // 양식다운로드
    const handleTempletDownload = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("품목관리_양식");

        ws.columns = [
            { header: "고객사",                    key: "srvcCd",       width: 20 },
            { header: "센터",                      key: "whCd",         width: 20 },
            { header: "품목번호",                  key: "prodCd",       width: 20 },
            { header: "품목명",                    key: "prodNm",       width: 15 },
            { header: "설계품목번호(고객품목번호)", key: "steitemNo",    width: 25 },
            { header: "품목카테고리",              key: "prodCategory", width: 18 },
            { header: "품목형태",                  key: "prodShape",    width: 18 },
            { header: "품목타입",                  key: "prodType",     width: 18 },
            { header: "금액",                      key: "price",        width: 18 },
            { header: "용기수량",                  key: "innerpack",    width: 18 },
            { header: "용기단위",                  key: "prodUnit",     width: 18 },
            { header: "중량",                      key: "weight",       width: 18 },
            { header: "실중량",                    key: "realWeight",   width: 18 },
            { header: "무게단위",                  key: "weightUnit",   width: 18 },
        ];

        const exampleRows = [
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '0K2KB-41697', prodNm: 'RS APS1', steitemNo : '999997', prodCategory : '', prodShape : '', prodType : '', price : '', innerpack : '', prodUnit : '', weight : '', realWeight : '', weightUnit : '' },
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '0K2KB-41698', prodNm: 'RS APS2', steitemNo : '999998', prodCategory : '', prodShape : '', prodType : '', price : '', innerpack : '', prodUnit : '', weight : '', realWeight : '', weightUnit : '' },
            { srvcCd: selectSrvcCd, whCd: selectWhCd, prodCd: '0K2KB-41699', prodNm: 'RS APS3', steitemNo : '999999', prodCategory : '', prodShape : '', prodType : '', price : '', innerpack : '', prodUnit : '', weight : '', realWeight : '', weightUnit : '' },
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
        a.download      = "품목관리_양식.xlsx";
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // 엑셀양식업로드
    const handleExcelUpload = () => {
        showAlert("엑셀업로드");
    };

     // 인라인 컬럼 편집
    const handleCellChange = (idx: number, field: keyof ItemRow, value: string) => {
        setItems(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
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
                        {/* Title and Main Actions */}
                        <div className={styles.headerTop}>
                            <div className={styles.titleArea}>
                                <h3>품목관리</h3>
                                <p>등록된 품목의 상세 정보를 관리합니다.</p>
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
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                                    <span className="material-symbols-outlined">delete_outline</span> 삭제
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* Search Filter Box */}
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                {/* 고객사 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>고객사</label>
                                    <select className={styles.filterSelect} value={searchSrvcCd} onChange={(e) => setSearchSrvcCd(e.target.value)}>
                                        { srvcList.map( s => <option key={s.srvcCd} value={s.srvcCd}>{s.srvcNm}</option>)}
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect} value={searchWhCd} onChange={(e) => setSearchWhCd(e.target.value)}>
                                        { whList.map( w => <option key={w.whCd} value={w.whCd}>{w.whNm}</option>)}
                                    </select>
                                </div>
                                {/* 품목코드 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>품목번호</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchProdCd} onChange={(e) => setSearchProdCd(e.target.value)}/>
                                        <button className={styles.filterSearchBtn}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchProdNm} onChange={(e) => setSearchProdNm(e.target.value)} readOnly />
                                    </div>
                                </div>
                                {/* 사용여부 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>사용여부</label>
                                    <select className={styles.filterSelect} value={searchUseYn} onChange={(e) => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                                {/* 품목카테고리 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>품목카테고리</label>
                                    <input type="text" className={styles.filterInput} value={searchProdCategory} onChange={(e) => setSearchProdCategory(e.target.value)}/>
                                </div>
                                {/* 품목형태 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>품목형태</label>
                                    <input type="text" className={styles.filterInput} value={searchProdShape} onChange={(e) => setSearchProdShape(e.target.value)}/>
                                </div>
                                {/* 설계품목코드 */}
                                <div className={`${styles.filterItem} ${styles.filterItemSm}`}>
                                    <label className={styles.filterLabel}>설계품목코드</label>
                                    <input type="text" className={styles.filterInput} value={searchSteItemNo} onChange={(e) => setSearchSteItemNo(e.target.value)}/>
                                </div>
                            </div>
                        </div>

                        {/* Functional Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar} onClick={handleAddRow}>
                                    <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '16px' }}>add</span>
                                    행추가
                                </button>
                                <button className={styles.btnToolbar} onClick={handleDeleteRow}>
                                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '16px' }}>delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar} onClick={handleTempletDownload}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
                                    양식다운로드
                                </button>
                                <button className={styles.btnToolbar} onClick={handleExcelUpload}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                                    엑셀업로드
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                {/* 체크박스 */}
                                <col style={{ width: '40px' }} />
                                {/* 고객사 */}
                                <col style={{ width: '120px' }} />
                                {/* 센터 */}
                                <col style={{ width: '140px' }} />
                                {/* 품번 */}
                                <col style={{ width: '180px' }} />
                                {/* 품명 */}
                                <col style={{ width: '250px' }} />
                                {/* 설계품번 */}
                                <col style={{ width: '180px' }} />
                                {/* 품목구분 */}
                                <col style={{ width: '100px' }} />
                                {/* 품목형태 */}
                                <col style={{ width: '100px' }} />
                                {/* 품목타입 */}
                                <col style={{ width: '100px' }} />
                                {/* 생성일자 */}
                                <col style={{ width: '90px' }} />
                                {/* 사용여부 */}
                                <col style={{ width: '90px' }} />
                                {/* 선입선출 여부 */}
                                <col style={{ width: '90px' }} />
                                {/* 단가 */}
                                <col style={{ width: '120px' }} />
                                {/* 용기수량 */}
                                <col style={{ width: '80px' }} />
                                {/* 용기단위 */}
                                <col style={{ width: '80px' }} />
                                {/* 무게중량 */}
                                <col style={{ width: '90px' }} />
                                {/* 무게실중량 */}
                                <col style={{ width: '90px' }} />
                                {/* 무게단위 */}
                                <col style={{ width: '90px' }} />
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
                            <thead className={styles.thead}>
                                <tr>
                                    <th rowSpan={2}>
                                        <input type="checkbox" className={styles.checkbox} onChange={handleSelectAll} checked={items.length > 0 && 
                                            items.every(v => v.chk === '1')}/>
                                    </th>
                                    <th rowSpan={2}>고객사</th>
                                    <th rowSpan={2}>센터</th>
                                    <th rowSpan={2}>품목번호</th>
                                    <th rowSpan={2}>품목명</th>
                                    <th rowSpan={2}>설계품번<br />(고객품번)</th>
                                    <th rowSpan={2}>품목카테고리</th>
                                    <th rowSpan={2}>품목형태</th>
                                    <th rowSpan={2}>품목타입</th>
                                    <th rowSpan={2}>생성일자</th>
                                    <th rowSpan={2}>사용여부</th>
                                    <th rowSpan={2}>선입선출<br/>여부</th>
                                    <th rowSpan={2}>단가</th>
                                    <th colSpan={2} className={styles.thGroup}>용기</th>
                                    <th colSpan={3} className={styles.thGroupAlt}>무게</th>
                                    <th rowSpan={2}>등록자</th>
                                    <th rowSpan={2}>등록일자</th>
                                    <th rowSpan={2}>수정자</th>
                                    <th rowSpan={2}>수정일자</th>
                                    <th rowSpan={2}>업로드결과</th>
                                </tr>
                                <tr>
                                    <th className={styles.thGroupSub}>수량</th>
                                    <th className={styles.thGroupSub}>단위</th>
                                    <th className={styles.thGroupSubAlt}>중량</th>
                                    <th className={styles.thGroupSubAlt}>실중량</th>
                                    <th className={styles.thGroupSubAlt}>단위</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {searched && items.length === 0 ? (
                                    <tr>
                                        <td colSpan={23} className={styles.emptyRow}>
                                            <span className="material-symbols-outlined">inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : items.map((item, index) => (
                                    <tr key={index} onClick={() => handleSelectRow(index)}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox} onChange={() => {}} checked={item.chk === '1'}/>
                                        </td>
                                        <td className={styles.cellCenter}>{item.srvcCd}</td>
                                        <td className={styles.cellCenter}>{item.whCd}</td>
                                        <td className={styles.cellBold}>
                                            {item.isNew 
                                                ? <input type="text" className={styles.cellInput} value={item.prodCd}
                                                   onChange={e => handleCellChange(index, "prodCd", e.target.value)}
                                                   onClick={e => e.stopPropagation()} placeholder="품목번호"
                                                   ref={setCellRef(index, "vehicleNo") as any}/>
                                                : item.prodCd}
                                        </td>
                                        <td className={styles.cellMedium}>
                                            <input type="text" className={styles.cellInput} value={item.prodNm}
                                             onChange={e => handleCellChange(index, "prodNm", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type="text" className={styles.cellInput} value={item.steitemNo}
                                             onChange={e => handleCellChange(index, "steitemNo", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type="text" className={styles.cellInput} value={item.prodCategory}
                                             onChange={e => handleCellChange(index, "prodCategory", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type="text" className={styles.cellInput} value={item.prodShape}
                                             onChange={e => handleCellChange(index, "prodShape", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type="text" className={styles.cellInput} value={item.prodType}
                                             onChange={e => handleCellChange(index, "prodType", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={styles.cellCenter}>{item.createTime}</td>
                                        <td className={styles.cellCenter}>
                                            <select className={styles.cellInput} value={item.useYn}
                                                onChange={e => handleCellChange(index, "useYn", e.target.value)}
                                                onClick={e => e.stopPropagation()}>
                                                <option value="Y">사용</option>
                                                <option value="N">미사용</option>
                                            </select>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <select className={styles.cellInput} value={item.fifoYn}
                                                onChange={e => handleCellChange(index, "fifoYn", e.target.value)}
                                                onClick={e => e.stopPropagation()}>
                                                <option value="Y">적용</option>
                                                <option value="N">미적용</option>
                                            </select>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type="text" className={styles.cellInput} value={item.price}
                                             onChange={e => handleCellChange(index, "price", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={`${styles.cellCenter} ${styles.cellGroup}`}>
                                            <input type="text" className={styles.cellInput} value={item.innerpack}
                                             onChange={e => handleCellChange(index, "innerpack", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={`${styles.cellCenter} ${styles.cellGroup}`}>
                                            <input type="text" className={styles.cellInput} value={item.prodUnit}
                                             onChange={e => handleCellChange(index, "prodUnit", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={`${styles.cellCenter} ${styles.cellGroupAlt}`}>
                                            <input type="text" className={styles.cellInput} value={item.weight}
                                             onChange={e => handleCellChange(index, "weight", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={`${styles.cellCenter} ${styles.cellGroupAlt}`}>
                                            <input type="text" className={styles.cellInput} value={item.realWeight}
                                             onChange={e => handleCellChange(index, "realWeight", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={`${styles.cellCenter} ${styles.cellGroupAlt}`}>
                                            <input type="text" className={styles.cellInput} value={item.weightUnit}
                                             onChange={e => handleCellChange(index, "weightUnit", e.target.value)}
                                             onClick={e => e.stopPropagation()}/>
                                        </td>
                                        <td className={styles.cellCenter}>{item.regId}</td>
                                        <td className={styles.cellCenter}>{item.regDate}</td>
                                        <td className={styles.cellCenter}>{item.updId}</td>
                                        <td className={styles.cellCenter}>{item.updDate}</td>
                                        <td className={styles.cellCenter}>{item.uploadStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_MASTER_0030;
