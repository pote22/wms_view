import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { useCommonWhList } from '../../api/common/commonWhList';
import styles from './cj_wms_receipt_0010.module.css';

interface InbRow {
    chk         : string;
    srvcCd      : string;
    whCd        : string;
    prodCd      : string;
    prodNm      : string;
    zoneCd      : string;
    zoneNm      : string;
    locCd       : string;
    planQty     : string;
    inbDate     : string;
    remark      : string;
    inbStatus   : string;
    regId       : string;
    regDate     : string;
    updId       : string;
    updDate     : string;
    isNew       : boolean;
}

const CJ_WMS_RECEIPT_0010: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
    const [searchSrvcCd,    setSearchSrvcCd]    = useState(selectSrvcCd);
    const [searchWhCd,      setSearchWhCd]      = useState(selectWhCd);
    const [searchInbNo,     setSearchInbNo]     = useState('');
    const [searchInbType,   setSearchInbType]   = useState('');
    const [searchSupplier,   setSearchSupplier]   = useState('');
    const [searchSupplierNm, setSearchSupplierNm] = useState('');
    const [searchVehicleNo,  setSearchVehicleNo]  = useState('');
    const [searchVehicleNm,  setSearchVehicleNm]  = useState('');
    const [inbDate,         setInbDate]         = useState<Date | null>(new Date());
    const [searchTranType,  setSearchTranType]  = useState('');
    const [rows,        setRows]        = useState<InbRow[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); }, [selectWhCd]);

    const handleSearch = () => {
        // TODO: API 연동
        setRows([]);
    };

    const handleAddRow = () => {
        setRows(prev => [...prev, {
            chk: '0', srvcCd: searchSrvcCd, whCd: searchWhCd,
            prodCd: '', prodNm: '', zoneCd: '', zoneNm: '', locCd: '',
            planQty: '', inbDate: '', remark: '', inbStatus: '',
            regId: '', regDate: '', updId: '', updDate: '', isNew: true,
        }]);
    };

    const handleDeleteRow = () => {
        setRows(prev => prev.filter(r => r.chk !== '1'));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setRows(prev => prev.map(r => ({ ...r, chk: val })));
    };

    const handleSelectRow = (idx: number) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, chk: r.chk === '1' ? '0' : '1' } : r));
    };

    const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    const pagedRows  = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        {/* Title Row */}
                        <div className={styles.titleRow}>
                            <div className={styles.titleArea}>
                                <h3>입고 등록</h3>
                                <p>신규 입고 정보를 시스템에 등록합니다.</p>
                            </div>
                            <div className={styles.mainActions}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                    조회
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                                    신규
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                                    저장
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* Filter — 4컬럼 × 1행 */}
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
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
                                    <label className={styles.filterLabel}>입고번호</label>
                                    <input type="text" className={styles.filterInput} placeholder="" value={searchInbNo} onChange={e => setSearchInbNo(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고구분</label>
                                    <select className={styles.filterSelect} value={searchInbType} onChange={e => setSearchInbType(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="N">일반입고</option>
                                        <option value="R">반품입고</option>
                                    </select>
                                </div>
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>매입처</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} placeholder="" value={searchSupplier} onChange={e => setSearchSupplier(e.target.value)} />
                                        <button className={styles.filterSearchBtn} onClick={() => {}}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} placeholder="" value={searchSupplierNm} readOnly />
                                    </div>
                                </div>
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>차량번호</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} placeholder="" value={searchVehicleNo} onChange={e => setSearchVehicleNo(e.target.value)} />
                                        <button className={styles.filterSearchBtn} onClick={() => {}}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} placeholder="" value={searchVehicleNm} readOnly />
                                    </div>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고예정일</label>
                                    <div className={styles.filterDateWrapper}>
                                        <span className={`material-symbols-outlined ${styles.filterDateIcon}`}>calendar_today</span>
                                        <DatePicker
                                            selected={inbDate}
                                            onChange={(date) => setInbDate(date)}
                                            dateFormat="yyyy-MM-dd"
                                            locale={ko}
                                            placeholderText=""
                                            className={styles.filterInput}
                                            isClearable
                                        />
                                    </div>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>수불유형</label>
                                    <select className={styles.filterSelect} value={searchTranType} onChange={e => setSearchTranType(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="T">이관오더</option>
                                        <option value="P">구매오더</option>
                                        <option value="S">판매오더</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar} onClick={handleAddRow}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#003f87' }}>add</span>
                                    행추가
                                </button>
                                <button className={styles.btnToolbar} onClick={handleDeleteRow}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a' }}>delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
                                    양식다운로드
                                </button>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                                    엑셀업로드
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                <col style={{ width: '40px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '200px' }} />
                                <col style={{ width: '220px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '120px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleSelectAll}
                                            checked={rows.length > 0 && rows.every(r => r.chk === '1')} />
                                    </th>
                                    <th>고객사</th>
                                    <th>센터</th>
                                    <th>품목코드</th>
                                    <th>품명</th>
                                    <th>존</th>
                                    <th>존명</th>
                                    <th>로케이션</th>
                                    <th>입고예정량</th>
                                    <th>입고일자</th>
                                    <th>비고</th>
                                    <th>입고상태</th>
                                    <th>등록자</th>
                                    <th>등록일자</th>
                                    <th>수정자</th>
                                    <th>수정일자</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {pagedRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={16} className={styles.emptyCell}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block' }}>inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : pagedRows.map((r, idx) => (
                                    <tr key={idx} onClick={() => handleSelectRow(idx)}
                                        style={r.isNew ? { backgroundColor: 'rgba(0, 63, 135, 0.04)' } : {}}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox}
                                                checked={r.chk === '1'} onChange={() => {}} />
                                        </td>
                                        <td className={styles.cellCenter}>{r.srvcCd}</td>
                                        <td className={styles.cellCenter}>{r.whCd}</td>
                                        <td className={styles.cellCenter}>{r.prodCd}</td>
                                        <td className={styles.cellMedium}>{r.prodNm}</td>
                                        <td className={styles.cellCenter}>{r.zoneCd}</td>
                                        <td className={styles.cellCenter}>{r.zoneNm}</td>
                                        <td className={styles.cellCenter}>{r.locCd}</td>
                                        <td className={styles.cellCenter}>{r.planQty}</td>
                                        <td className={styles.cellCenter}>{r.inbDate}</td>
                                        <td className={styles.cellCenter}>{r.remark}</td>
                                        <td className={styles.cellCenter}>{r.inbStatus}</td>
                                        <td className={styles.cellCenter}>{r.regId}</td>
                                        <td className={styles.cellCenter}>{r.regDate}</td>
                                        <td className={styles.cellCenter}>{r.updId}</td>
                                        <td className={styles.cellCenter}>{r.updDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>총 {rows.length}건</span>

                        {/* 페이징 기능 주석화 
                        <div className={styles.pageList}>
                            <button className={`${styles.btnPage} ${styles.btnPageNav}`}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p}
                                    className={`${styles.btnPage} ${p === currentPage ? styles.btnPageActive : ''}`}
                                    onClick={() => setCurrentPage(p)}>
                                    {p}
                                </button>
                            ))}
                            <button className={`${styles.btnPage} ${styles.btnPageNav}`}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                        */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CJ_WMS_RECEIPT_0010;
