import React, { useState } from 'react';
import styles from './cj_wms_master_0030.module.css';

const CJ_WMS_MASTER_0030: React.FC = () => {
    // Mock Data for Items
    const [items] = useState([
        { id: 'SKU-GSC-00124', name: 'Kixx G1 5W-30 (4L)', uom: 'EA', dimensions: '20.5 x 12.0 x 32.5', weight: '3.85', status: 'Active' },
        { id: 'SKU-GSC-00125', name: 'Kixx PAO 1 0W-30 (1L)', uom: 'EA', dimensions: '10.0 x 10.0 x 24.0', weight: '0.95', status: 'Active' },
        { id: 'SKU-GSC-00128', name: 'Oil Filter-C110L', uom: 'EA', dimensions: '8.0 x 8.0 x 10.0', weight: '0.32', status: 'Inactive' },
        { id: 'SKU-GSC-00201', name: 'Industrial Grease HD-2', uom: 'BOX', dimensions: '45.0 x 30.0 x 25.0', weight: '15.00', status: 'Active' },
        { id: 'SKU-GSC-00215', name: 'Kixx Bio Fuel 10W-40', uom: 'DRUM', dimensions: '60.0 x 60.0 x 90.0', weight: '180.00', status: 'Active' },
    ]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Main Section: Filters & Table */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        {/* Title and Main Actions */}
                        <div className={styles.headerTop}>
                            <div className={styles.titleArea}>
                                <h3>품번관리</h3>
                                <p>등록된 품목의 상세 정보를 관리합니다.</p>
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

                        {/* Search Filter Box */}
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>Part Number (SKU)</label>
                                    <input className={styles.filterInput} type="text" placeholder="품번 입력" />
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>Part Name</label>
                                    <input className={styles.filterInput} type="text" placeholder="품명 입력" />
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>Category</label>
                                    <select className={styles.filterSelect}>
                                        <option value="">전체 카테고리</option>
                                        <option value="raw">원자재</option>
                                        <option value="finished">완제품</option>
                                        <option value="packing">포장재</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Functional Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '18px' }}>add</span>
                                    행추가
                                </button>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '18px' }}>delete</span>
                                    행삭제
                                </button>
                            </div>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                                    양식다운로드
                                </button>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                                    엑셀업로드
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th style={{ width: '48px' }}>
                                        <input type="checkbox" className={styles.checkbox} />
                                    </th>
                                    <th>SKU ID</th>
                                    <th>Part Name</th>
                                    <th>UOM</th>
                                    <th>Dimensions (cm)</th>
                                    <th>Weight (kg)</th>
                                    <th>Status</th>
                                    <th style={{ width: '48px' }}></th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className={styles.cellCenter}>
                                            <input type="checkbox" className={styles.checkbox} />
                                        </td>
                                        <td className={styles.cellBold}>{item.id}</td>
                                        <td className={styles.cellMedium}>{item.name}</td>
                                        <td className={styles.cellCenter}>{item.uom}</td>
                                        <td className={styles.cellDim}>{item.dimensions}</td>
                                        <td className={styles.cellCenter}>{item.weight}</td>
                                        <td className={styles.cellCenter}>
                                            <span className={`${styles.badge} ${item.status === 'Active' ? styles.badgeSuccess : styles.badgeInactive}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: '18px' }}>more_vert</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <p className={styles.paginationInfo}>Showing 1 to 5 of 124 entries</p>
                        <div className={styles.paginationControls}>
                            <button className={`${styles.btnPage} ${styles.btnPageNav}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className={`${styles.btnPage} ${styles.btnPageActive}`}>1</button>
                                <button className={`${styles.btnPage} ${styles.btnPageNumber}`}>2</button>
                                <button className={`${styles.btnPage} ${styles.btnPageNumber}`}>3</button>
                            </div>
                            <button className={`${styles.btnPage} ${styles.btnPageNav}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CJ_WMS_MASTER_0030;
