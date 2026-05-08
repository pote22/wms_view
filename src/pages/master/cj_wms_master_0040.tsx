import React, { useState, useEffect } from 'react';
// 고객사, 센터 공통 리스트
import { useCommonWhList } from '../../api/common/commonWhList';
// JWT 토큰 정보
import { getTokenPayload } from '../../utils/auth';
// 서비스 정보
import { getZoneList, getLocList, saveInfo, type Zone, type Loc } from '../../api/master/master_0040Service'
// 레이어 팝업
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
// 모듈 CSS
import styles from './cj_wms_master_0040.module.css';

// 존객체 정보
interface ZoneRow extends Zone {    
    isNew   : boolean;
    isDirty : boolean;
}

// 로케이션 객체정보
interface LocRow extends Loc {
    isNew   : boolean;
    isDirty : boolean;
}

const CJ_WMS_MASTER_0040: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd }    = useCommonWhList();    
    const payload                                           = getTokenPayload();  


    const [searchSrvcCd,   setSearchSrvcCd]   = useState(selectSrvcCd);
    const [searchWhCd,     setSearchWhCd]      = useState(selectWhCd);
    const [searchZoneCd,   setSearchZoneCd]    = useState('');
    const [searchZoneNm,   setSearchZoneNm]    = useState('');
    const [searchLocCd,    setSearchLocCd]     = useState('');
    const [searchUseYn,    setSearchUseYn]     = useState('');
    const [zoneItems,      setZoneItems]       = useState<ZoneRow[]>([]);
    const [locItems,       setLocItems]        = useState<LocRow[]>([]);
    const [selectedZoneCd, setSelectedZoneCd]  = useState('');
    const [zoneSearched,   setZoneSearched]    = useState(false);
    const [locSearched,    setLocSearched]     = useState(false);

    // 공통 팝업
    const { popup, showAlert, showConfirm, closePopup } = usePopup();

    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); },    [selectWhCd]);

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
                                {/* 고객사 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>고객사</label>
                                    <select className={styles.filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{s.srvcNm}</option>)}
                                    </select>
                                </div>
                                {/* 센터 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>센터</label>
                                    <select className={styles.filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => <option key={w.whCd} value={w.whCd}>{w.whNm}</option>)}
                                    </select>
                                </div>
                                {/* 존 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>존</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchZoneCd} onChange={e => setSearchZoneCd(e.target.value)} />
                                        <button className={styles.filterSearchBtn}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchZoneNm} readOnly />
                                    </div>
                                </div>
                                {/* 로케이션 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>로케이션</label>
                                    <input type="text" className={styles.filterInput} value={searchLocCd} onChange={e => setSearchLocCd(e.target.value)} />
                                </div>
                                {/* 사용여부 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>사용여부</label>
                                    <select className={styles.filterSelect} value={searchUseYn} onChange={e => setSearchUseYn(e.target.value)}>
                                        <option value="">전체</option>
                                        <option value="Y">사용</option>
                                        <option value="N">미사용</option>
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
                                    <button className={styles.btnToolbar}>
                                        <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '14px' }}>add</span>
                                        행추가
                                    </button>
                                    <button className={styles.btnToolbar}>
                                        <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '14px' }}>delete</span>
                                        행삭제
                                    </button>
                                    <button className={styles.btnToolbar}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span>
                                        양식다운로드
                                    </button>
                                    <button className={styles.btnToolbar}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload_file</span>
                                        엑셀업로드
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <colgroup>
                                        <col style={{ width: '110px' }} />
                                        <col style={{ width: '90px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '80px' }} />
                                        <col style={{ width: '80px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '80px' }} />
                                        <col style={{ width: '100px' }} />
                                    </colgroup>
                                    <thead className={styles.thead}>
                                        <tr>
                                            <th>센터</th>
                                            <th>존코드</th>
                                            <th>존명</th>
                                            <th className={styles.cellCenter}>사용여부</th>
                                            <th>등록자</th>
                                            <th>등록일자</th>
                                            <th>수정자</th>
                                            <th>수정일자</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                        {zoneSearched && zoneItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className={styles.emptyRow}>
                                                    <span className="material-symbols-outlined">inbox</span>
                                                    <p>조회된 데이터가 없습니다.</p>
                                                </td>
                                            </tr>
                                        ) : zoneItems.map((item, index) => (
                                            <tr key={index}
                                                className={selectedZoneCd === item.zoneCd ? styles.selectedRow : ''}>
                                                <td>{item.whCd}</td>
                                                <td className={styles.cellBold}>{item.zoneCd}</td>
                                                <td>
                                                    <input type="text" className={styles.cellInput} value={item.zoneNm} onChange={() => {}} />
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    <span className={item.useYn === 'Y' ? styles.badgeSuccess : styles.badgeInactive}>{item.useYn}</span>
                                                </td>
                                                <td className={styles.cellDim}>{item.regId}</td>
                                                <td className={styles.cellDim}>{item.regDate}</td>
                                                <td className={styles.cellDim}>{item.updId}</td>
                                                <td className={styles.cellDim}>{item.updDate}</td>
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
                                    <button className={styles.btnToolbar}>
                                        <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '14px' }}>add_box</span>
                                        행추가
                                    </button>
                                    <button className={styles.btnToolbar}>
                                        <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '14px' }}>delete_sweep</span>
                                        행삭제
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <colgroup>
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
                                    </colgroup>
                                    <thead className={styles.thead}>
                                        <tr>
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
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                        {!selectedZoneCd && locItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className={styles.emptyRow}>
                                                    <span className="material-symbols-outlined">touch_app</span>
                                                    <p>좌측에서 존을 선택하면 로케이션이 표시됩니다.</p>
                                                </td>
                                            </tr>
                                        ) : locSearched && locItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className={styles.emptyRow}>
                                                    <span className="material-symbols-outlined">inbox</span>
                                                    <p>조회된 데이터가 없습니다.</p>
                                                </td>
                                            </tr>
                                        ) : locItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className={styles.cellBold}>{item.locCd}</td>
                                                <td>{item.locClsCd ? <span className={styles.locTypeBadge}>{item.locClsCd}</span> : null}</td>
                                                <td>
                                                    <input type="text" className={styles.cellInput} value={item.rmk} onChange={() => {}} />
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    <span className={item.useYn === 'Y' ? styles.textSuccess : styles.textMuted}>{item.useYn}</span>
                                                </td>
                                                <td className={styles.cellCenter}>
                                                    <span className={item.replYn === 'Y' ? styles.textTertiary : styles.textMuted}>{item.replYn}</span>
                                                </td>
                                                <td>
                                                    <input type="text" className={styles.cellInput} value={item.replProdCd} onChange={() => {}} />
                                                </td>
                                                <td>
                                                    <input type="text" className={styles.cellInput} value={item.locGroup} onChange={() => {}} />
                                                </td>
                                                <td className={styles.cellDim}>{item.regId}</td>
                                                <td className={styles.cellDim}>{item.regDate}</td>
                                                <td className={styles.cellDim}>{item.updId}</td>
                                                <td className={styles.cellDim}>{item.updDate}</td>
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
        </>
    );
};

export default CJ_WMS_MASTER_0040;
