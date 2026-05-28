import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { useCommonWhList } from '../../api/common/commonWhList';
import styles            from './cj_wms_receipt_0020.module.css';
import ClientSearchPopup  from '../../components/common/ClientSearchPopup';
import ProdSearchPopup    from '../../components/common/ProdSearchPopup';
import VehicleSearchPopup from '../../components/common/VehicleSearchPopup';
import { formatDate } from '../../utils/dateUtils';

interface InbRow {
    chk         : string;
    srvcCd      : string;
    whCd        : string;
    inbPlanDate : string;
    inbNo       : string;
    inbSeq      : string;
    inbStatus   : string;
    inbType     : string;
    tranType    : string;
    inbCmpDate  : string;
    supplierCd  : string;
    supplierNm  : string;
    prodCd      : string;
    prodNm      : string;
    zoneCd      : string;
    zoneNm      : string;
    locCd       : string;
    ordQty      : string;
    planQty     : string;
    confQty     : string;
    scanQty     : string;
    scanCnt     : string;
    totalWeight : string;
    noInbReason : string;
    addr        : string;
    zipCd       : string;
    manager     : string;
    tel         : string;
    vehicleNo   : string;
    drvNm       : string;
    pdaYn       : string;
    remark      : string;
    regId       : string;
    regDate     : string;
    updId       : string;
    updDate     : string;
}

const CJ_WMS_RECEIPT_0020: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
    const [searchSrvcCd,         setSearchSrvcCd]         = useState(selectSrvcCd);
    const [searchWhCd,           setSearchWhCd]           = useState(selectWhCd);
    const [searchInbType,        setSearchInbType]        = useState('');
    const [searchStatus,         setSearchStatus]         = useState('');
    const [searchInbNo,          setSearchInbNo]          = useState('');
    const [searchTranType,       setSearchTranType]       = useState('');
    const [searchDateType,       setSearchDateType]       = useState('PLAN');
    const [searchInExptDateFrom, setSearchInExptDateFrom] = useState('');
    const [searchInExptDateTo,   setSearchInExptDateTo]   = useState('');
    const [searchSupplierCd,     setSearchSupplierCd]     = useState('');
    const [searchProdCd,         setSearchProdCd]         = useState('');
    const [searchProdNm,         setSearchProdNm]         = useState('');
    const [searchVehicleNo,      setSearchVehicleNo]      = useState('');
    const [searchDrvNm,          setSearchDrvNm]          = useState('');
    const [searchSupplierNm,     setSearchSupplierNm]     = useState('');
    const [isClientPopupOpen,    setIsClientPopupOpen]    = useState(false);
    const [isProdPopupOpen,      setIsProdPopupOpen]      = useState(false);
    const [isVehiclePopupOpen,   setIsVehiclePopupOpen]   = useState(false);
    const [noInbReasonSel,       setNoInbReasonSel]       = useState('');
    const [rows,        setRows]        = useState<InbRow[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); }, [selectWhCd]);

    const handleSearch = () => {
        // TODO: API 연동
        setRows([]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.checked ? '1' : '0';
        setRows(prev => prev.map(r => ({ ...r, chk: val })));
    };

    const handleSelectRow = (idx: number) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, chk: r.chk === '1' ? '0' : '1' } : r));
    };

    const handleClientSelect = (clientCd: string, clientNm: string) => {
        setSearchSupplierCd(clientCd);
        setSearchSupplierNm(clientNm);
    };

    const handleProdSelect = (prodCd: string, prodNm: string) => {
        setSearchProdCd(prodCd);
        setSearchProdNm(prodNm);
    };

    const handleVehicleSelect = (vehicleNo: string, drvNm: string) => {
        setSearchVehicleNo(vehicleNo);
        setSearchDrvNm(drvNm);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PLAN': return <span className={styles.badgePlan}>입고예정</span>;
            case 'PART': return <span className={styles.badgePartial}>부분입고</span>;
            case 'CONF': return <span className={styles.badgeConf}>입고확정</span>;
            default:     return <span>{status}</span>;
        }
    };

    const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    const pagedRows  = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                                    엑셀
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                                    입고예정리스트발행
                                </button>
                                <button className={`${styles.btn} ${styles.btnBlue}`}>
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
                                    <select className={styles.filterSelect} value={searchInbType} onChange={e => setSearchInbType(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="N">일반입고</option>
                                        <option value="R">반품입고</option>
                                    </select>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고상태</label>
                                    <select className={styles.filterSelect} value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="PLAN">입고예정</option>
                                        <option value="PART">부분입고</option>
                                        <option value="CONF">입고확정</option>
                                    </select>
                                </div>
                                {/* 2행 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고번호</label>
                                    <input type="text" className={styles.filterInput} placeholder="입고번호" value={searchInbNo} onChange={e => setSearchInbNo(e.target.value)} />
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
                                <div className={styles.filterItemDate}>
                                    <label className={styles.filterLabel}>기간</label>
                                    <div className={styles.filterDateGroup}>
                                        <select className={styles.filterSelectNarrow} value={searchDateType} onChange={e => setSearchDateType(e.target.value)}>
                                            <option value="PLAN">입고예정일</option>
                                            <option value="COMP">입고완료일</option>
                                        </select>
                                        <div className={styles.filterDateRange}>
                                            <div className={styles.filterDateWrapper}>
                                                <span className={`material-symbols-outlined ${styles.filterDateIcon}`}>calendar_today</span>
                                                <DatePicker
                                                    selected={searchInExptDateFrom ? new Date(`${searchInExptDateFrom.slice(0,4)}-${searchInExptDateFrom.slice(4,6)}-${searchInExptDateFrom.slice(6,8)}`) : null}
                                                    onChange={(date: Date | null) => setSearchInExptDateFrom(date ? formatDate(date) : '')}
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
                                                    selected={searchInExptDateTo ? new Date(`${searchInExptDateTo.slice(0,4)}-${searchInExptDateTo.slice(4,6)}-${searchInExptDateTo.slice(6,8)}`) : null}
                                                    onChange={(date: Date | null) => setSearchInExptDateTo(date ? formatDate(date) : '')}
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
                                        <input type="text" className={styles.filterInput} value={searchSupplierCd} placeholder="매입처코드" />
                                        <button className={styles.filterSearchBtn} onClick={() => setIsClientPopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchSupplierNm} readOnly placeholder="" />
                                    </div>
                                </div>
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>품번</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchProdCd} placeholder="품번" />
                                        <button className={styles.filterSearchBtn} onClick={() => setIsProdPopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchProdNm} readOnly placeholder="" />
                                    </div>
                                </div>
                                {/* 4행 */}
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>차량번호</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchVehicleNo} placeholder="차량번호" />
                                        <button className={styles.filterSearchBtn} onClick={() => setIsVehiclePopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchDrvNm} readOnly placeholder="" />
                                    </div>
                                </div>
                                <div className={styles.filterItem} />
                                <div className={styles.filterItem} />
                            </div>
                        </div>

                        {/* Toolbar — 우측만 */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>format_list_numbered</span>
                                    예정수량 '0' 일괄적용
                                </button>
                                <select
                                    className={styles.selectToolbar}
                                    value={noInbReasonSel}
                                    onChange={e => setNoInbReasonSel(e.target.value)}
                                >
                                    <option value="">미입고사유 선택</option>
                                    <option value="01">물량부족</option>
                                    <option value="02">품질불량</option>
                                    <option value="03">배송지연</option>
                                    <option value="04">차량미도착</option>
                                    <option value="05">고객요청</option>
                                    <option value="06">기타</option>
                                </select>
                                <button className={styles.btnToolbar}>
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
                                <col style={{ width: '40px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '180px' }} />
                                <col style={{ width: '180px' }} />
                                <col style={{ width: '180px' }} />
                                <col style={{ width: '180px' }} />
                                {/* 수량 그룹 */}
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                {/* 스캔정보 그룹 */}
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                {/* 수량:총중량 */}
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th rowSpan={2}>
                                        <input type="checkbox" className={styles.checkbox}
                                            onChange={handleSelectAll}
                                            checked={rows.length > 0 && rows.every(r => r.chk === '1')} />
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
                                    <th colSpan={3} className={styles.thGroup}>수량</th>
                                    <th colSpan={2} className={styles.thGroup}>스캔정보</th>
                                    <th rowSpan={2}>총중량</th>
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
                                    <th className={styles.thGroupSub}>원주문량</th>
                                    <th className={styles.thGroupSub}>예정수량</th>
                                    <th className={styles.thGroupSub}>확정수량</th>
                                    <th className={styles.thGroupSub}>스캔수량</th>
                                    <th className={styles.thGroupSub}>스캔건수</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {pagedRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={36} className={styles.emptyCell}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block' }}>inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : pagedRows.map((r, idx) => (
                                    <tr key={idx} onClick={() => handleSelectRow(idx)}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox}
                                                checked={r.chk === '1'} onChange={() => {}} />
                                        </td>
                                        <td className={styles.cellCenter}>{r.srvcCd}</td>
                                        <td className={styles.cellCenter}>{r.whCd}</td>
                                        <td className={styles.cellCenter}>{r.inbPlanDate}</td>
                                        <td className={styles.cellBold}>{r.inbNo}</td>
                                        <td className={styles.cellCenter}>{r.inbSeq}</td>
                                        <td className={styles.cellCenter}>{getStatusBadge(r.inbStatus)}</td>
                                        <td className={styles.cellCenter}>{r.inbType}</td>
                                        <td className={styles.cellCenter}>{r.tranType}</td>
                                        <td className={styles.cellCenter}>{r.inbCmpDate}</td>
                                        <td className={styles.cellCenter}>{r.supplierCd}</td>
                                        <td className={styles.cellMedium}>{r.supplierNm}</td>
                                        <td className={styles.cellMedium}>{r.prodCd}</td>
                                        <td className={styles.cellMedium}>{r.prodNm}</td>
                                        <td className={styles.cellCenter}>{r.zoneCd}</td>
                                        <td className={styles.cellCenter}>{r.zoneNm}</td>
                                        <td className={styles.cellCenter}>{r.locCd}</td>
                                        <td className={styles.cellCenter}>{r.ordQty}</td>
                                        <td className={styles.cellCenter}>{r.planQty}</td>
                                        <td className={styles.cellCenter}>{r.confQty}</td>
                                        <td className={styles.cellCenter}>{r.scanQty}</td>
                                        <td className={styles.cellCenter}>{r.scanCnt}</td>
                                        <td className={styles.cellCenter}>{r.totalWeight}</td>
                                        <td className={styles.cellDim}>{r.noInbReason}</td>
                                        <td className={styles.cellDim}>{r.addr}</td>
                                        <td className={styles.cellCenter}>{r.zipCd}</td>
                                        <td className={styles.cellCenter}>{r.manager}</td>
                                        <td className={styles.cellCenter}>{r.tel}</td>
                                        <td className={styles.cellCenter}>{r.vehicleNo}</td>
                                        <td className={styles.cellCenter}>{r.drvNm}</td>
                                        <td className={styles.cellCenter}>{r.pdaYn}</td>
                                        <td className={styles.cellDim}>{r.remark}</td>
                                        <td className={styles.cellCenter}>{r.regId}</td>
                                        <td className={styles.cellCenter}>{r.regDate}</td>
                                        <td className={styles.cellCenter}>{r.updId}</td>
                                        <td className={styles.cellCenter}>{r.updDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <ClientSearchPopup
            isOpen={isClientPopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            initialClientCd={searchSupplierCd}
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
