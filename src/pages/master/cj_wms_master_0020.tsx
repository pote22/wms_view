import React, { useState, useEffect, useRef } from 'react';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 레이어 팝업
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
// 품목 검색 팝업
import ProdSearchPopup from "../../components/common/ProdSearchPopup";
import styles from './cj_wms_master_0020.module.css';
// 엑셀
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";


const CJ_WMS_MASTER_0020: React.FC = () => {
    

    return (
        <>
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        {/* Title and Main Actions */}
                        <div className={styles.headerTop}>
                            <div className={styles.titleArea}>
                                <h3>거래처 관리</h3>
                                <p>등록된 거래처의 상세 정보를 관리합니다.</p>
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
                                <button className={`${styles.btn} ${styles.btnDanger}`}>
                                    <span className="material-symbols-outlined">delete_outline</span> 삭제
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
                                {/* 고객사 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>고객사</label>
                                    <select className={styles.filterSelect}>
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect}>
                                    </select>
                                </div>
                                {/* 품목코드 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>품목번호</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput}/>
                                        <button className={styles.filterSearchBtn}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} readOnly />
                                    </div>
                                </div>
                                {/* 사용여부 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>사용여부</label>
                                    <select className={styles.filterSelect}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Functional Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.toolbarGroup}>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '16px' }}>add</span>
                                    행추가
                                </button>
                                <button className={styles.btnToolbar}>
                                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '16px' }}>delete</span>
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
                                <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }}/>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                {/* 체크박스 */}
                                <col style={{ width: '40px' }}/>
                                <col style={{ width: '120px' }}/>
                                <col style={{ width: '140px' }}/>
                                <col style={{ width: '180px' }}/>
                                <col style={{ width: '250px' }}/>
                                <col style={{ width: '200px' }}/>
                                <col style={{ width: '500px' }}/>
                                <col style={{ width: '100px' }}/>
                                <col style={{ width: '180px' }}/>
                                <col style={{ width: '200px' }}/>
                                <col style={{ width: '180px' }}/>
                                <col style={{ width: '90px' }}/>
                                <col style={{ width: '180px' }}/>
                                <col style={{ width: '90px' }}/>
                                <col style={{ width: '120px' }}/>
                                <col style={{ width: '90px' }}/>
                                <col style={{ width: '120px' }}/>
                                <col style={{ width: '300px' }}/>
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th>
                                        <input type="checkbox" className={styles.checkbox}/>
                                    </th>
                                    <th>고객사</th>
                                    <th>센터</th>
                                    <th>거래처코드</th>
                                    <th>거래처명</th>
                                    <th>사업자번호</th>
                                    <th>거래처주소</th>
                                    <th>국가코드</th>
                                    <th>대표자명</th>
                                    <th>이메일주소</th>
                                    <th>연락처</th>
                                    <th>시용여부</th>
                                    <th>종목명</th>
                                    <th>등록자</th>
                                    <th>등록일자</th>
                                    <th>수정자</th>
                                    <th>수정일자</th>
                                    <th>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                <tr>
                                    <td className={styles.cellCenter}>
                                        <input type="checkbox" className={styles.checkbox}/>
                                    </td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_MASTER_0020;
