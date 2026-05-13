import React, { useState, useEffect, useRef } from 'react';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 서비스정보
import { getList, saveClient, deleteClient, getCheckList, 
    type Client, type ClientRow, type CheckResult, 
    type ClientList} from '../../api/master/master_0020Service'
// 레이어 팝업
import Popup from '../../components/common/Popup';
import { usePopup } from '../../components/common/usePopup';
// 모듈 CSS
import styles from './cj_wms_master_0020.module.css';
// 엑셀
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';


const CJ_WMS_MASTER_0020: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    const payload                                           = getTokenPayload();
    // 조회조건
    const [searchSrvcCd, setSearchSrvcCd]                   = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd]                       = useState(selectWhCd);
    const [searchClientCd, setSearchClientCd]               = useState('');
    const [searchClientNm, setSearchClientNm]               = useState('');
    const [searchUseYn, setSearchUseYn]                     = useState('');
    // 조회결과
    const [clientList, setClientList]                       = useState<ClientRow[]>([]);
    // 조회실행여부
    const [isSearched, setIsSearched]                       = useState(false);
    // confirm 다이얼로그
    const [isSaved, setIsSaved]                             = useState(false);
    // 포커싱
    const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map());
    const setCellRef = (idx: number, field: string) => (
        el: HTMLInputElement | HTMLSelectElement | null) => {
            if (el) cellRefs.current.set(`${idx}_${field}`, el);
            else cellRefs.current.delete(`${idx}_${field}`);
    };

    // 로딩바표시
    const [isUploading, setIsUploading]                     = useState(false);
    // 공통 팝업
    const { popup, showAlert, showConfirm, closePopup }     = usePopup();
    // 엑셀문서 입력
    const fileInputRef                                      = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd)
    }, [selectWhCd]);

    // 조회
    const handleSearch = () => {
        showAlert('조회');
    }

    // 저장
    const handleSave = () => {
        showAlert('저장');
    }

    // 삭제
    const handleDelete = () => {
        showAlert('삭제');
    }

    // 엑셀다운로드
    const handleExcel = () => {
        showAlert('엑셀다운로드');
    }

    // 행추가
    const handleAddRow = () => {
        showAlert('행추가');
    }

    // 행삭제
    const handleDeleteRow = () => {
        showAlert('행삭제');
    }

    // 양식다운로드
    const handleTempletDownload = () => {
        showAlert('양식다운로드');
    }

    // 엑셀업로드
    const handleExcelUpload = () => {
        showAlert('엑셀업로드');
    }

    // 인라인 컬럼 편집(존)
    const handleCellChange = (idx: number, field: keyof ClientRow, value: string) => {
        setClientList(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value, isDirty: true } : v));
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
                                <h3>거래처 관리</h3>
                                <p>등록된 거래처의 상세 정보를 관리합니다.</p>
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
                                        { srvcList.map( v => <option key={v.srvcCd} value={v.srvcCd}>{v.srvcNm}</option>) }
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect} value={searchWhCd} onChange={(e) => setSearchWhCd(e.target.value)}>
                                        { whList.map( v => <option key={v.whCd} value={v.whCd}>{v.whNm}</option>)}
                                    </select>
                                </div>
                                {/* 거래처 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>거래처</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchClientCd} onChange={(e) => setSearchClientCd(e.target.value)}/>
                                        <button className={styles.filterSearchBtn}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchClientNm} onChange={(e) => setSearchClientNm(e.target.value)} readOnly />
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
                                { isSearched && clientList.length === 0 ? (
                                 <tr>
                                    <td colSpan={23} className={styles.emptyRow}>
                                        <span className="material-symbols-outlined">inbox</span>
                                        <p>조회된 데이터가 없습니다.</p>
                                    </td>
                                </tr>        
                                ) : clientList.map((v, idx) => (
                                <tr>
                                    <td className={styles.cellCenter}>
                                        <input type="checkbox" className={styles.checkbox} onChange={() => {}} checked={v.chk === '1'}/>
                                    </td>
                                    <td className={styles.cellCenter}>
                                        { srvcList.find( s => s.srvcCd === v.srvcCd)?.srvcNm ?? v.srvcCd }
                                    </td>
                                    <td className={styles.cellCenter}>
                                        { whList.find( w => w.whCd === v.whCd)?.whNm ?? v.whCd }
                                    </td>
                                    <td className={styles.cellCenter}>
                                        { 
                                            v.isNew 
                                            ? <input type='text' className={styles.cellInput} value={v.clientCd}
                                                onChange={ e => handleCellChange(idx, "clientCd", e.target.value) }
                                                ref={ setCellRef(idx, "clientCd") as any }/>
                                            : v.clientCd
                                        }
                                    </td>
                                    <td className={styles.cellCenter}>
                                        <input type='text' className={styles.cellInput} value={v.clientNm}
                                            onChange={ e => handleCellChange(idx, "clientNm", e.target.value) }
                                            ref={ setCellRef(idx, "clientNm") as any }/>
                                    </td>
                                    <td className={styles.cellCenter}>
                                        <input type='text' className={styles.cellInput} value={v.businessNo}
                                            onChange={ e => handleCellChange(idx, "businessNo", e.target.value) }
                                            ref={ setCellRef(idx, "businessNo") as any }/>
                                    </td>
                                    <td className={styles.cellCenter}>
                                        <input type='text' className={styles.cellInput} value={v.address}
                                            onChange={ e => handleCellChange(idx, "address", e.target.value) }
                                            ref={ setCellRef(idx, "address") as any }/>
                                    </td>
                                    <td className={styles.cellCenter}>
                                        <input type='text' className={styles.cellInput} value={v.nationCd}
                                            onChange={ e => handleCellChange(idx, "address", e.target.value) }
                                            ref={ setCellRef(idx, "address") as any }/>
                                    </td>
                                    <td className={styles.cellCenter}>
                                        <input type='text' className={styles.cellInput} value={v.presidentNm}
                                            onChange={ e => handleCellChange(idx, "presidentNm", e.target.value) }
                                            ref={ setCellRef(idx, "presidentNm") as any }/>
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

export default CJ_WMS_MASTER_0020;
