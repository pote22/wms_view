import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
// 권한별 고객사, 센터 리스트 조회
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 레이어 팝업
import Popup from '../../components/common/Popup';
import { usePopup } from '../../components/common/usePopup';
// 모듈 CSS
import styles from './cj_wms_receipt_0010.module.css';
// 엑셀
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { getCommCodeList, type CommCode } from '../../api/common/commonService';
import { getList, saveReceipt, type ReceiptHdrRow, type ReceiptDtlRow, type RcptKeyInfo, getKeyInfo } from '../../api/receipt/receipt_0010Service'

const CJ_WMS_RECEIPT_0010: React.FC = () => {
    // 고객사&센터 리스트 조회
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();
    // 공통 팝업
    const { popup, showAlert, showConfirm, closePopup }     = usePopup();
    // 토큰 정보
    const payload                                           = getTokenPayload();
    // 조회조건
    const [searchSrvcCd, setSearchSrvcCd]                   = useState(selectSrvcCd);
    const [searchWhCd, setSearchWhCd]                       = useState(selectWhCd);
    const [searchInNo, setSearchInNo]                       = useState('');
    const [searchInCategory, setSearchInCategory]           = useState('');
    const [searchClientCd, setSearchClientCd]               = useState('');
    const [searchClientNm, setSearchClientNm]               = useState('');
    const [searchVehicleNo, setSearchVehicleNo]             = useState('');
    const [searchVehicleNm, setSearchVehicleNm]             = useState('');
    const [searchInExptDate, setSearchInExptDate]           = useState<Date | null>(new Date());
    const [searchInType, setSearchInType]                   = useState('');
    // 공통코드 
    const [receiptCategory, setReceiptCategory]             = useState<CommCode[]>([]);             // 입고구분 
    const [receiptStatus, setReceiptStatus]                 = useState<CommCode[]>([]);             // 입고상태
    const [receiptType, setReceiptType]                     = useState<CommCode[]>([]);             // 수불유형
    const [isNewMode, setIsNewMode]                         = useState(false);
    // 리스트
    const [receiptHdrList, setReceiptHdrList]               = useState<ReceiptHdrRow[]>([]);        // 입고리스트(헤더)
    const [receiptDtlList, setReceiptDtlList]               = useState<ReceiptDtlRow[]>([]);        // 입고리스트(디테일)
    const [isSearched, setIsSearched]                       = useState(false);                      
    // 키값정보
    const [keyInfo, setKeyInfo]                             = useState<RcptKeyInfo>();

    // useEffect
    useEffect(() => {
        setSearchSrvcCd(selectSrvcCd);
    }, [selectSrvcCd]);

    useEffect(() => {
        setSearchWhCd(selectWhCd)
    }, [selectWhCd]);

    useEffect(() => {
        // 입고유형
        getCommCodeList(
            { 
                  sys_grp_cd    : 'WM0020'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : ''
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setReceiptCategory(res.data ?? []),
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );
        // 입고상태
        getCommCodeList(
            {
                  sys_grp_cd    : 'WM0010'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : ''
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setReceiptStatus(res.data ?? []),
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );

        // 수불유형
        getCommCodeList(
            {
                  sys_grp_cd    : 'WM0030'
                , sys_cd        : ''
                , sys_cdnm      : ''
                , srvc_cd       : '1201'
                , sys_etc1      : ''
                , sys_etc2      : ''
                , sys_etc3      : ''
                , sys_etc4      : ''
                , sys_etc5      : ''
            },
            (res) => setReceiptType(res.data ?? []),
            (err) => showAlert('공통코드 조회 실패 : ' + err?.message)
        );
    }, []);

    

    // 입고유형, 수불유형, 입고상태 공통코드 조회

    // 조회
    const handleSearch = () => {
        showAlert("조회");
    }

    // 신규
    const handleNew = () => {
        // 1.리스트 초기화
        setReceiptHdrList([]);
        setReceiptDtlList([]);

        // 2.입고헤더 행추가
        setReceiptHdrList([{
          srvcCd          : searchSrvcCd,
          whCd            : searchWhCd,
          inNo            : '',
          inExpectedDate  : '',
          inAsnNo         : '',
          vendorCd        : '',
          vendorNm        : '',
          receiptClsCd    : '',
          totline         : 0,
          originalQty     : 0,
          expectedQty     : 0,
          openQty         : 0,
          receivedQty     : 0,
          status          : '',
          rmk             : '',
          receiptDate     : '',
          receiptNo       : 0,
          inVNo           : '',
          inVId           : '',
          inVNm           : '',
          vendorAddress   : '',
          receiptType     : '',
          isNew           : true,
          isDirty         : false,
          uploadStatus    : '', 
        }]);

        // 3. 조회조건 필터 활성화
        setIsNewMode(true);
        setSearchInNo('');
        setSearchInCategory('1');
        setSearchInType(receiptType[0]?.sys_cd ?? '');

        // 4. 키값 발급
        getKeyInfo(
            {},
            (res) => {
                setKeyInfo(res.data ?? null);
            },
            (err) => showAlert("조회 실패: " + err?.message)
        )
    }

    // 저장
    const handleSave = () => {
        showAlert("저장");
    }

    // 엑셀다운로드
    const handleExcel = () => {
        showAlert("엑셀");
    }

    // 행추가
    const handleAddRow = () => {
        const inNo          = searchInNo;
        const clientCd      = searchClientCd;
        const vehicleNo     = searchVehicleNo;
        const inExptDate    = searchInExptDate;
    }
    
    // 행삭제
    const handleDeleteRow = () => {
        showAlert("행삭제");
    }

    // 양식다운로드
    const handleTempletDownload = () => {
        showAlert("양식다운로드");
    }

    // 엑셀업로드
    const handleExcelUpload = () => {
        showAlert("엑셀업로드");
    }

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
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleNew}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                                    신규
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleSave}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                                    저장
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExcel}>
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
                                    <input type="text" className={styles.filterInput} value={searchInNo} onChange={e => setSearchInNo(e.target.value)} placeholder=""/>
                                </div>
                            </div>
                        </div>

                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고구분</label>
                                    <select className={styles.filterSelect} disabled={!isNewMode} value={searchInCategory} onChange={e => setSearchInCategory(e.target.value)}>
                                        <option value="">-- 선택 --</option>
                                        {
                                            receiptCategory.map( t => (
                                                <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cdnm}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>매입처</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} disabled={!isNewMode} value={searchClientCd} onChange={e => setSearchClientCd(e.target.value)} placeholder=""/>
                                        <button className={styles.filterSearchBtn} disabled={!isNewMode} onClick={() => {}}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchClientNm} onChange={e => setSearchClientNm(e.target.value)} placeholder="" readOnly/>
                                    </div>
                                </div>
                                <div className={styles.filterItemWide}>
                                    <label className={styles.filterLabel}>차량번호</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} disabled={!isNewMode} value={searchVehicleNo} onChange={e => setSearchVehicleNo(e.target.value)} placeholder=""/>
                                        <button className={styles.filterSearchBtn} disabled={!isNewMode} onClick={() => {}}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} placeholder="" value={searchVehicleNm} onChange={e => setSearchVehicleNm(e.target.value)} readOnly/>
                                    </div>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>입고예정일</label>
                                    <div className={styles.filterDateWrapper}>
                                        <span className={`material-symbols-outlined ${styles.filterDateIcon}`}>calendar_today</span>
                                        <DatePicker
                                            selected={searchInExptDate}
                                            onChange={(date : Date | null) => setSearchInExptDate(date)}
                                            dateFormat="yyyy-MM-dd"
                                            locale={ko}
                                            disabled={!isNewMode}
                                            placeholderText=""
                                            className={styles.filterInput}
                                            isClearable
                                        />
                                    </div>
                                </div>
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>수불유형</label>
                                    <select className={styles.filterSelect} disabled={!isNewMode} value={searchInType} onChange={e => setSearchInType(e.target.value)}>
                                        <option value="">-- 선택 --</option>
                                         {
                                            receiptType.map( t => (
                                                <option key={t.sys_cd} value={t.sys_cd}>{t.sys_cdnm}</option>
                                            ))
                                        }
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
                                <col style={{ width: '300px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th></th>
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
                                    <th>업로드결과</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                { isSearched && receiptDtlList.length === 0 ? (
                                    <tr>
                                        <td colSpan={16} className={styles.emptyCell}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block' }}>inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : receiptDtlList.map((v, idx) => (
                                    <tr style={{ backgroundColor: 'rgba(0, 63, 135, 0.04)' }}>
                                        <td className={styles.cellCenter}></td>
                                        <td className={styles.cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd)(srvcList.find( s => s.srvcCd === v.srvcCd)) }
                                        </td>
                                        <td className={styles.cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : v.whCd)(whList.find( w => w.whCd === v.whCd)) }
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.prodCd}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.prodNm}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.inZoneCd}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.inZoneNm}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.inLocCd}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.originalQty}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.inZoneCd}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.inZoneCd}/>
                                        </td>
                                        <td className={styles.cellCenter}>
                                            <input type='text' className={styles.cellInput} value={v.inZoneCd}/>
                                        </td>
                                        <td className={styles.cellCenter}>{v.regId}</td>
                                        <td className={styles.cellCenter}>{v.regDate}</td>
                                        <td className={styles.cellCenter}>{v.updId}</td>
                                        <td className={styles.cellCenter}>{v.updDate}</td>
                                        <td className={styles.cellCenter}>{v.uploadStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>총 건</span>

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
        </>
    );
};

export default CJ_WMS_RECEIPT_0010;
