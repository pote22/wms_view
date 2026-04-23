import React, { useState, useMemo, useEffect } from "react";
import { useCommonWhList } from "../../api/common/commonWhList";
import styles from "./cj_wms_master_0010.module.css";

const CJ_WMS_MASTER_0010: React.FC = () => {
    // 1. Mock Data for Vehicles
    const [vehicles, setVehicles] = useState([
        { id: 1, carNo: "서울88바 1234", driverNm: "김철수", ton: "5톤", hp: "010-1234-5678", useYn: "Y", regUser: "관리자", regDate: "2023-10-01", updUser: "이영희", updDate: "2023-11-15", status: "SUCCESS", isNew: false },
        { id: 2, carNo: "경기77사 5678", driverNm: "박지민", ton: "1톤", hp: "010-9876-5432", useYn: "Y", regUser: "관리자", regDate: "2023-10-05", updUser: "-", updDate: "-", status: "", isNew: false },
        { id: 3, carNo: "인천55가 9012", driverNm: "최동욱", ton: "11톤", hp: "010-2222-3333", useYn: "N", regUser: "운영팀장", regDate: "2023-09-20", updUser: "이영희", updDate: "2023-12-01", status: "INVALID FORMAT", isNew: false },
        { id: 4, carNo: "부산33자 4567", driverNm: "강민호", ton: "2.5톤", hp: "010-4444-5555", useYn: "Y", regUser: "관리자", regDate: "2023-11-01", updUser: "-", updDate: "-", status: "SUCCESS", isNew: false },
        { id: 5, carNo: "대구22로 8901", driverNm: "정은지", ton: "5톤", hp: "010-6666-7777", useYn: "Y", regUser: "관리자", regDate: "2023-11-10", updUser: "이영희", updDate: "2023-11-20", status: "SUCCESS", isNew: false },
    ]);

    // 2. State for Selection
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();
    // 조회조건 state
    const [searchSrvcCd, setSearchSrvcCd] = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd] = useState(selectWhCd);
    // 헤더에서 고객사/센터 변경 시 동기화
    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); }, [selectWhCd]);

    // 3. Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(vehicles.map(v => v.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // 데이터 조회
    const handleSearch = () => {

    }

    // 데이터 저장
    const handleSave = () => {

    }

    // 데이터 삭제
    const handleDelete = () => {

    }

    // 엑셀 다운로드
    const handleExcelDownload = () => {

    }

    // 행추가
    const handleAddRow = () => {
    };

    // 행삭제
    const handleDelRow = () => {

    }

    // 양식다운로드
    const handleFormExcelDownload = () => {

    }

    // 양식업로드
    const handleExcelUpload = () => {

    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>

                {/* Main Section: Filters & Table */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        {/* Title & Actions */}
                        <div className={styles.titleRow}>
                            <div className={styles.titleArea}>
                                <h3>차량관리</h3>
                                <p>운영 차량 및 기사 정보를 관리합니다.</p>
                            </div>
                            <div className={styles.mainActions}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`}>
                                    <span className="material-symbols-outlined">search</span> 조회
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
                                    <span className="material-symbols-outlined">save</span> 저장
                                </button>
                                <button className={`${styles.btn} ${styles.btnDanger}`}>
                                    <span className="material-symbols-outlined">delete_outline</span> 삭제
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`}>
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
                                            <option key={s.srvcCd} value={s.srvcCd}>
                                                {s.srvcNm}
                                            </option>
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
                                    <input className={styles.filterInput} type="text" placeholder="차량번호 입력" />
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>사용여부</label>
                                    <select className={styles.filterSelect}>
                                        <option>전체</option>
                                        <option>사용</option>
                                        <option>미사용</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#003f87' }}>add</span> 행추가
                                </button>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a' }}>remove</span> 행삭제
                                </button>
                            </div>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span> 양식다운로드
                                </button>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span> 업로드
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.cellCenter}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            onChange={handleSelectAll}
                                            checked={selectedIds.length === vehicles.length && vehicles.length > 0}
                                        />
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
                                {vehicles.map((v) => (
                                    <tr key={v.id} onClick={() => handleSelectRow(v.id)}>
                                        <td className={styles.cellCenter}>
                                            <input
                                                type="checkbox"
                                                className={styles.checkbox}
                                                checked={selectedIds.includes(v.id)}
                                                onChange={() => { }} // Controlled by row click
                                            />
                                        </td>
                                        <td className={styles.cellBold}>{v.carNo}</td>
                                        <td className={styles.cellMedium}>{v.driverNm}</td>
                                        <td className={styles.cellDim}>{v.ton}</td>
                                        <td className={styles.cellMono}>{v.hp}</td>
                                        <td className={styles.cellCenter}>
                                            <span className={`${styles.badge} ${v.useYn === 'Y' ? styles.badgeSuccess : styles.badgeError}`}>
                                                {v.useYn}
                                            </span>
                                        </td>
                                        <td className={styles.cellDim}>{v.regUser}</td>
                                        <td className={styles.cellDim}>{v.regDate}</td>
                                        <td className={styles.cellDim}>{v.updUser}</td>
                                        <td className={styles.cellDim}>{v.updDate}</td>
                                        <td>
                                            {v.status && (
                                                <span className={`${styles.badge} ${v.status === 'SUCCESS' ? styles.badgeInfo : styles.badgeError}`}>
                                                    {v.status}
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

            {/* Footer Live Dock */}
            {/* 
            <footer className={styles.footerDock}>
                <div className={styles.dockInfo}>
                    <div className={styles.dockItem}>
                        <span className={styles.dockLabel}>Live System Status</span>
                        <div className={styles.statusIndicator}>
                            <div className={styles.statusDot}></div>
                            <span className={styles.dockValue}>All Systems Operational</span>
                        </div>
                    </div>
                    <div className={styles.dockItem}>
                        <span className={styles.dockLabel}>Active Workers</span>
                        <span className={styles.dockValue}>124 / 150</span>
                    </div>
                    <div className={styles.dockItem}>
                        <span className={styles.dockLabel}>Storage Capacity</span>
                        <span className={styles.dockValue}>88.42% Full</span>
                    </div>
                </div>
                <div className={styles.dockMeta}>
                    <span className={styles.refreshText}>Data refreshes every 30 seconds.</span>
                    <div className={styles.ping}></div>
                </div>
            </footer>
            */}
        </div >
    );
};

export default CJ_WMS_MASTER_0010;
