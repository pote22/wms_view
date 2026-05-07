import React, { useState, useEffect, useRef } from 'react';
import { useCommonWhList } from '../../api/common/commonWhList';
import styles from './cj_wms_master_0040.module.css';

interface ZoneRow {
    chk          : string;
    whNm         : string;
    zoneCd       : string;
    zoneNm       : string;
    useYn        : string;
    regId        : string;
    regDate      : string;
    updId        : string;
    updDate      : string;
    uploadStatus : string;
    isNew        : boolean;
    isDirty      : boolean;
}

interface LocRow {
    chk          : string;
    locCd        : string;
    locType      : string;
    remark       : string;
    useYn        : string;
    replYn       : string;
    replProdCd   : string;
    locGroup     : string;
    regId        : string;
    regDate      : string;
    updId        : string;
    updDate      : string;
    uploadStatus : string;
    isNew        : boolean;
    isDirty      : boolean;
}

const CJ_WMS_MASTER_0040: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();

    const [searchSrvcCd, setSearchSrvcCd]         = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd]             = useState(selectWhCd);
    const [zoneItems, setZoneItems]               = useState<ZoneRow[]>([]);
    const [locItems, setLocItems]                 = useState<LocRow[]>([]);
    const [selectedZoneCd, setSelectedZoneCd]     = useState('');
    const [zoneSearched, setZoneSearched]         = useState(false);
    const [locSearched, setLocSearched]           = useState(false);
    const [isUploading, setIsUploading]           = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); },    [selectWhCd]);

    /* ── 존 체크박스 ── */
    const handleZoneSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setZoneItems(prev => prev.map(v => ({ ...v, chk: val })));
    };

    const handleZoneRowClick = (idx: number) => {
        setZoneItems(prev => prev.map((v, i) => i === idx ? { ...v, chk: v.chk === '1' ? '0' : '1' } : v));
    };

    /* ── 존 행 선택 (마스터-디테일) ── */
    const handleZoneSelect = (row: ZoneRow) => {
        if (row.isNew || row.zoneCd === selectedZoneCd) return;
        setSelectedZoneCd(row.zoneCd);
        setLocItems([]);
        setLocSearched(false);
        // API 연동 추후 구현
    };

    /* ── 존 인라인 편집 ── */
    const handleZoneCellChange = (idx: number, field: keyof ZoneRow, value: string) => {
        setZoneItems(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    /* ── 존 행추가 / 행삭제 ── */
    const handleZoneAddRow = () => {
        setZoneItems(prev => [...prev, {
            chk: '1', whNm: '', zoneCd: '', zoneNm: '', useYn: 'Y',
            regId: '', regDate: '', updId: '', updDate: '',
            uploadStatus: '', isNew: true, isDirty: false,
        }]);
    };

    const handleZoneDeleteRow = () => {
        const lastNewIdx = zoneItems.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();
        if (lastNewIdx === undefined) return;
        setZoneItems(prev => prev.filter((_, i) => i !== lastNewIdx));
    };

    /* ── 로케이션 체크박스 ── */
    const handleLocSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setLocItems(prev => prev.map(v => ({ ...v, chk: val })));
    };

    const handleLocRowClick = (idx: number) => {
        setLocItems(prev => prev.map((v, i) => i === idx ? { ...v, chk: v.chk === '1' ? '0' : '1' } : v));
    };

    /* ── 로케이션 인라인 편집 ── */
    const handleLocCellChange = (idx: number, field: keyof LocRow, value: string) => {
        setLocItems(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
    };

    /* ── 로케이션 행추가 / 행삭제 ── */
    const handleLocAddRow = () => {
        if (!selectedZoneCd) return;
        setLocItems(prev => [...prev, {
            chk: '1', locCd: '', locType: '', remark: '', useYn: 'Y',
            replYn: 'N', replProdCd: '', locGroup: '',
            regId: '', regDate: '', updId: '', updDate: '',
            uploadStatus: '', isNew: true, isDirty: false,
        }]);
    };

    const handleLocDeleteRow = () => {
        const lastNewIdx = locItems.map((v, i) => v.isNew ? i : -1).filter(i => i >= 0).pop();
        if (lastNewIdx === undefined) return;
        setLocItems(prev => prev.filter((_, i) => i !== lastNewIdx));
    };

    return (
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
                        <button className={`${styles.btn} ${styles.btnPrimary}`}>
                            <span className="material-symbols-outlined">search</span>
                            조회
                        </button>
                        <button className={`${styles.btn} ${styles.btnOutline}`}>
                            <span className="material-symbols-outlined">save</span>
                            저장
                        </button>
                        <button className={`${styles.btn} ${styles.btnOutline}`}>
                            <span className="material-symbols-outlined">download</span>
                            엑셀
                        </button>
                    </div>
                </div>
                <div className={styles.filterBox}>
                    <div className={styles.filterGrid}>
                        <div className={styles.filterItem}>
                            <label className={styles.filterLabel}>고객사</label>
                            <select className={styles.filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{s.srvcNm}</option>)}
                            </select>
                        </div>
                        <div className={styles.filterItem}>
                            <label className={styles.filterLabel}>센터</label>
                            <select className={styles.filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                {whList.map(w => <option key={w.whCd} value={w.whCd}>{w.whNm}</option>)}
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
                            <span className={styles.panelCount}>(Total: {zoneItems.length})</span>
                        </div>
                        <div className={styles.panelToolbar}>
                            <button className={styles.btnToolbar} onClick={handleZoneAddRow}>
                                <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '14px' }}>add</span>
                                행추가
                            </button>
                            <button className={styles.btnToolbar} onClick={handleZoneDeleteRow}>
                                <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '14px' }}>delete</span>
                                행삭제
                            </button>
                            <button className={styles.btnToolbar}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span>
                                양식다운로드
                            </button>
                            <button className={styles.btnToolbar} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload_file</span>
                                {isUploading ? '업로드 중...' : '엑셀업로드'}
                            </button>
                            <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none' }} />
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                <col style={{ width: '40px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '140px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.cellCenter}>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleZoneSelectAll}
                                            checked={zoneItems.length > 0 && zoneItems.every(v => v.chk === '1')} />
                                    </th>
                                    <th>센터명</th>
                                    <th>존코드</th>
                                    <th>존명</th>
                                    <th className={styles.cellCenter}>사용여부</th>
                                    <th>등록자</th>
                                    <th>등록일자</th>
                                    <th>수정자</th>
                                    <th>수정일자</th>
                                    <th>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {zoneSearched && zoneItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className={styles.emptyRow}>
                                            <span className="material-symbols-outlined">inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : zoneItems.map((item, index) => (
                                    <tr key={index}
                                        className={!item.isNew && selectedZoneCd === item.zoneCd ? styles.selectedRow : ''}
                                        onClick={() => { handleZoneRowClick(index); handleZoneSelect(item); }}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox}
                                                onChange={() => {}} checked={item.chk === '1'} />
                                        </td>
                                        <td>{item.whNm || searchWhCd}</td>
                                        <td className={styles.cellBold}>
                                            {item.isNew
                                                ? <input type="text" className={styles.cellInput} value={item.zoneCd}
                                                    onChange={e => handleZoneCellChange(index, 'zoneCd', e.target.value)}
                                                    onClick={e => e.stopPropagation()} placeholder="존코드" />
                                                : item.zoneCd}
                                        </td>
                                        <td>
                                            <input type="text" className={styles.cellInput} value={item.zoneNm}
                                                onChange={e => handleZoneCellChange(index, 'zoneNm', e.target.value)}
                                                onClick={e => e.stopPropagation()} />
                                        </td>
                                        <td className={styles.cellCenter}>
                                            {item.isNew
                                                ? <select className={styles.cellInput} value={item.useYn}
                                                    onChange={e => handleZoneCellChange(index, 'useYn', e.target.value)}
                                                    onClick={e => e.stopPropagation()}>
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                  </select>
                                                : <span className={item.useYn === 'Y' ? styles.badgeSuccess : styles.badgeInactive}>{item.useYn}</span>}
                                        </td>
                                        <td className={styles.cellDim}>{item.regId}</td>
                                        <td className={styles.cellDim}>{item.regDate}</td>
                                        <td className={styles.cellDim}>{item.updId}</td>
                                        <td className={styles.cellDim}>{item.updDate}</td>
                                        <td>{item.uploadStatus}</td>
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
                                {selectedZoneCd ? `${selectedZoneCd} · ` : ''}(Total: {locItems.length})
                            </span>
                        </div>
                        <div className={styles.panelToolbar}>
                            <button className={styles.btnToolbar} onClick={handleLocAddRow}>
                                <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '14px' }}>add_box</span>
                                행추가
                            </button>
                            <button className={styles.btnToolbar} onClick={handleLocDeleteRow}>
                                <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '14px' }}>delete_sweep</span>
                                행삭제
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                <col style={{ width: '40px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '65px' }} />
                                <col style={{ width: '65px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '70px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '70px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '110px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.cellCenter}>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleLocSelectAll}
                                            checked={locItems.length > 0 && locItems.every(v => v.chk === '1')} />
                                    </th>
                                    <th>로케이션코드</th>
                                    <th>로케이션구분</th>
                                    <th>비고</th>
                                    <th className={styles.cellCenter}>사용여부</th>
                                    <th className={styles.cellCenter}>보충여부</th>
                                    <th>기본보충품번</th>
                                    <th>로케이션그룹</th>
                                    <th>등록자</th>
                                    <th>등록일자</th>
                                    <th>수정자</th>
                                    <th>수정일자</th>
                                    <th>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {!selectedZoneCd && locItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className={styles.emptyRow}>
                                            <span className="material-symbols-outlined">touch_app</span>
                                            <p>좌측에서 존을 선택하면 로케이션이 표시됩니다.</p>
                                        </td>
                                    </tr>
                                ) : locSearched && locItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className={styles.emptyRow}>
                                            <span className="material-symbols-outlined">inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : locItems.map((item, index) => (
                                    <tr key={index} onClick={() => handleLocRowClick(index)}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox}
                                                onChange={() => {}} checked={item.chk === '1'} />
                                        </td>
                                        <td className={styles.cellBold}>
                                            {item.isNew
                                                ? <input type="text" className={styles.cellInput} value={item.locCd}
                                                    onChange={e => handleLocCellChange(index, 'locCd', e.target.value)}
                                                    onClick={e => e.stopPropagation()} placeholder="로케이션코드" />
                                                : item.locCd}
                                        </td>
                                        <td>
                                            {item.isNew
                                                ? <input type="text" className={styles.cellInput} value={item.locType}
                                                    onChange={e => handleLocCellChange(index, 'locType', e.target.value)}
                                                    onClick={e => e.stopPropagation()} />
                                                : item.locType
                                                    ? <span className={styles.locTypeBadge}>{item.locType}</span>
                                                    : null}
                                        </td>
                                        <td>
                                            <input type="text" className={styles.cellInput} value={item.remark}
                                                onChange={e => handleLocCellChange(index, 'remark', e.target.value)}
                                                onClick={e => e.stopPropagation()} />
                                        </td>
                                        <td className={styles.cellCenter}>
                                            {item.isNew
                                                ? <select className={styles.cellInput} value={item.useYn}
                                                    onChange={e => handleLocCellChange(index, 'useYn', e.target.value)}
                                                    onClick={e => e.stopPropagation()}>
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                  </select>
                                                : <span className={item.useYn === 'Y' ? styles.textSuccess : styles.textMuted}>{item.useYn}</span>}
                                        </td>
                                        <td className={styles.cellCenter}>
                                            {item.isNew
                                                ? <select className={styles.cellInput} value={item.replYn}
                                                    onChange={e => handleLocCellChange(index, 'replYn', e.target.value)}
                                                    onClick={e => e.stopPropagation()}>
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                  </select>
                                                : <span className={item.replYn === 'Y' ? styles.textTertiary : styles.textMuted}>{item.replYn}</span>}
                                        </td>
                                        <td>
                                            <input type="text" className={styles.cellInput} value={item.replProdCd}
                                                onChange={e => handleLocCellChange(index, 'replProdCd', e.target.value)}
                                                onClick={e => e.stopPropagation()} />
                                        </td>
                                        <td>
                                            <input type="text" className={styles.cellInput} value={item.locGroup}
                                                onChange={e => handleLocCellChange(index, 'locGroup', e.target.value)}
                                                onClick={e => e.stopPropagation()} />
                                        </td>
                                        <td className={styles.cellDim}>{item.regId}</td>
                                        <td className={styles.cellDim}>{item.regDate}</td>
                                        <td className={styles.cellDim}>{item.updId}</td>
                                        <td className={styles.cellDim}>{item.updDate}</td>
                                        <td>{item.uploadStatus}</td>
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
    );
};

export default CJ_WMS_MASTER_0040;
