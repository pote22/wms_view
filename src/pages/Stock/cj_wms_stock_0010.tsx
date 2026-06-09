import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { useCommonWhList } from '../../api/common/commonWhList';
import Popup from "../../components/common/Popup";
import { usePopup } from "../../components/common/usePopup";
import ZoneSearchPopup from "../../components/common/ZoneSearchPopup";
import LocSearchPopup from "../../components/common/LocSearchPopup";
import ProdSearchPopup from "../../components/common/ProdSearchPopup";
import { formatDate } from '../../utils/dateUtils';
import styles from './cj_wms_stock_0010.module.css';
import ExcelJS from "exceljs";
// import { getStockList, type StockItem } from '../../api/stock/stock_0010Service';

interface StockItem {
    srvcCd:  string; whCd:    string; whNm:    string; srvcNm:  string;
    itemCd:  string; itemNm:  string; zoneCd:  string; zoneNm:  string; locCd: string;
    totQty:  number; alctQty: number; pickQty: number; availQty: number;
    rcptDt:  string; barCd:   string; rmk:     string; storDay:  number;
    regId:   string; regDate: string; updId:   string; updDate:  string;
}

const CJ_WMS_STOCK_0010: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();

    // 조회조건
    const [searchSrvcCd, setSearchSrvcCd] = useState(selectSrvcCd);
    const [searchWhCd,   setSearchWhCd]   = useState(selectWhCd);
    const [searchBarCd,  setSearchBarCd]  = useState('');
    const [searchRcptDt, setSearchRcptDt] = useState('');
    const [searchZoneCd, setSearchZoneCd] = useState('');
    const [searchZoneNm, setSearchZoneNm] = useState('');
    const [searchLocCd,  setSearchLocCd]  = useState('');
    const [searchItemCd, setSearchItemCd] = useState('');
    const [searchItemNm, setSearchItemNm] = useState('');
    const [searchRmk,    setSearchRmk]    = useState('');

    // 조회결과
    const [stockList,  setStockList]  = useState<StockItem[]>([]);
    const [searched,   setSearched]   = useState(false);

    // 필터
    const [excludeZeroStock, setExcludeZeroStock] = useState(false);

    // 팝업
    const [zonePopupOpen, setZonePopupOpen] = useState(false);
    const [locPopupOpen,  setLocPopupOpen]  = useState(false);
    const [prodPopupOpen, setProdPopupOpen] = useState(false);
    const { popup, showAlert, closePopup }   = usePopup();

    const filteredList = excludeZeroStock
        ? stockList.filter(v => v.availQty > 0)
        : stockList;

    // ── 조회 ──
    const handleSearch = () => {
        // getStockList({ srvcCd: searchSrvcCd, whCd: searchWhCd, barCd: searchBarCd,
        //   rcptDt: searchRcptDt, zoneCd: searchZoneCd, locCd: searchLocCd, itemCd: searchItemCd },
        //   (res) => { if (res.resultCode === '0000') setStockList(res.data ?? []); },
        //   (err) => showAlert('조회 실패: ' + err?.message)
        // );
        setStockList([]);
        setSearched(true);
    };

    // ── 엑셀 ──
    const handleExcel = async () => {
        if (filteredList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("재고현황");

        ws.columns = [
            { header: "센터명",   key: "whNm",    width: 15 },
            { header: "고객사",   key: "srvcNm",  width: 15 },
            { header: "품번",     key: "itemCd",  width: 15 },
            { header: "품명",     key: "itemNm",  width: 22 },
            { header: "존",       key: "zoneCd",  width: 10 },
            { header: "존명",     key: "zoneNm",  width: 15 },
            { header: "로케이션", key: "locCd",   width: 12 },
            { header: "총재고",   key: "totQty",  width: 10 },
            { header: "할당수량", key: "alctQty", width: 10 },
            { header: "피킹수량", key: "pickQty", width: 10 },
            { header: "가용재고", key: "availQty",width: 10 },
            { header: "입고일자", key: "rcptDt",  width: 12 },
            { header: "바코드",   key: "barCd",   width: 15 },
            { header: "비고",     key: "rmk",     width: 20 },
            { header: "보관일수", key: "storDay", width: 10 },
            { header: "등록자",   key: "regId",   width: 12 },
            { header: "등록일자", key: "regDate", width: 12 },
            { header: "수정자",   key: "updId",   width: 12 },
            { header: "수정일자", key: "updDate", width: 12 },
        ];

        const headerRow = ws.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "0080B2Fd" } };
            cell.font      = { bold: true, color: { argb: "00000000" }, size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border    = { top: {style:"thin"}, left: {style:"thin"}, bottom: {style:"thin"}, right: {style:"thin"} };
        });
        headerRow.height = 22;

        filteredList.forEach(v => {
            const row = ws.addRow(v);
            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border    = { top: {style:"thin"}, left: {style:"thin"}, bottom: {style:"thin"}, right: {style:"thin"} };
            });
            row.height = 18;
        });

        const buffer = await wb.xlsx.writeBuffer();
        const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url    = window.URL.createObjectURL(blob);
        const a      = document.createElement("a");
        a.href       = url;
        a.download   = `재고현황_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); },     [selectWhCd]);

    return (
        <>
        <Popup
            isOpen={popup.isOpen}
            message={popup.message}
            type={popup.type}
            onConfirm={popup.onConfirm}
            onCancel={closePopup}
        />
        <ZoneSearchPopup
            isOpen={zonePopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            initialZoneCd={searchZoneCd}
            onSelect={(zoneCd, zoneNm) => { setSearchZoneCd(zoneCd); setSearchZoneNm(zoneNm); }}
            onClose={() => setZonePopupOpen(false)}
        />
        <LocSearchPopup
            isOpen={locPopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            zoneCd={searchZoneCd}
            initialLocCd={searchLocCd}
            onSelect={(locCd) => setSearchLocCd(locCd)}
            onClose={() => setLocPopupOpen(false)}
        />
        <ProdSearchPopup
            isOpen={prodPopupOpen}
            srvcCd={searchSrvcCd}
            whCd={searchWhCd}
            initialProdCd={searchItemCd}
            onSelect={(prodCd, prodNm) => { setSearchItemCd(prodCd); setSearchItemNm(prodNm); }}
            onClose={() => setProdPopupOpen(false)}
        />
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.sectionCard}>

                    {/* ── 섹션 헤더 ── */}
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerTop}>
                            <div className={styles.titleArea}>
                                <h3>재고현황</h3>
                                <p>실시간 재고 현황을 조회하고 관리합니다.</p>
                            </div>
                            <div className={styles.actionGroup}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSearch}>
                                    <span className="material-symbols-outlined">search</span>
                                    조회
                                </button>
                                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* ── 필터 영역 ── */}
                        <div className={styles.filterBox}>
                            <div className={styles.filterGrid}>

                                {/* Col 1: 고객사 | 센터 (가로) */}
                                <div className={styles.filterItemRow}>
                                    <div className={styles.filterItem}>
                                        <label className={styles.filterLabel}>고객사</label>
                                        <select className={styles.filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                            {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.filterItem}>
                                        <label className={styles.filterLabel}>센터</label>
                                        <select className={styles.filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                            {whList.map(w => <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Col 2: 바코드 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>바코드</label>
                                    <input type="text" className={styles.filterInput} value={searchBarCd}
                                        onChange={e => setSearchBarCd(e.target.value)} placeholder="" />
                                </div>

                                {/* Col 3: 입고일자 | 비고 (가로) */}
                                <div className={styles.filterItemRow}>
                                    <div className={styles.filterItem}>
                                        <label className={styles.filterLabel}>입고일자</label>
                                        <div className={styles.filterDateWrapper}>
                                            <span className={`material-symbols-outlined ${styles.filterDateIcon}`}>calendar_today</span>
                                            <DatePicker
                                                selected={searchRcptDt ? new Date(`${searchRcptDt.slice(0,4)}-${searchRcptDt.slice(4,6)}-${searchRcptDt.slice(6,8)}`) : null}
                                                onChange={(date: Date | null) => setSearchRcptDt(date ? formatDate(date) : '')}
                                                dateFormat="yyyy-MM-dd"
                                                locale={ko}
                                                isClearable
                                                placeholderText=""
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.filterItem}>
                                        <label className={styles.filterLabel}>비고</label>
                                        <input type="text" className={styles.filterInput} value={searchRmk}
                                            onChange={e => setSearchRmk(e.target.value)} />
                                    </div>
                                </div>

                                {/* Col 1: 존 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>존</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterCodeInput} value={searchZoneCd}
                                            onChange={e => setSearchZoneCd(e.target.value)} />
                                        <button className={styles.filterSearchBtn} onClick={() => setZonePopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchZoneNm} readOnly />
                                    </div>
                                </div>

                                {/* Col 2: 로케이션 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>로케이션</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterInput} value={searchLocCd}
                                            onChange={e => setSearchLocCd(e.target.value)} />
                                        <button className={styles.filterSearchBtn} onClick={() => setLocPopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Col 3: 품번 */}
                                <div className={styles.filterItem}>
                                    <label className={styles.filterLabel}>품번</label>
                                    <div className={styles.filterInputGroup}>
                                        <input type="text" className={styles.filterCodeInput} value={searchItemCd}
                                            onChange={e => setSearchItemCd(e.target.value)} />
                                        <button className={styles.filterSearchBtn} onClick={() => setProdPopupOpen(true)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={styles.filterInputReadonly} value={searchItemNm} readOnly />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── 테이블 툴바 ── */}
                        {/*
                        <div className={styles.tableToolbar}>
                            <span className={styles.totalCount}>Total: {filteredList.length} Items</span> 
                            <label className={styles.excludeZeroLabel}>
                                <input type="checkbox" className={styles.checkbox}
                                    checked={excludeZeroStock}
                                    onChange={e => setExcludeZeroStock(e.target.checked)} />
                                총 재고량 0 제외
                            </label>
                        </div>
                        */}
                    </div>

                    {/* ── 메인 테이블 ── */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <colgroup>
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '160px' }} />
                                <col style={{ width: '70px' }} />
                                <col style={{ width: '110px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '80px' }} />
                                <col style={{ width: '100px' }} />
                            </colgroup>
                            <thead className={styles.thead}>
                                <tr>
                                    <th>고객사</th>
                                    <th>센터명</th>
                                    <th>품번</th>
                                    <th>품명</th>
                                    <th>존</th>
                                    <th>존명</th>
                                    <th>로케이션</th>
                                    <th className={styles.cellRight}>총재고</th>
                                    <th className={styles.cellRight}>할당수량</th>
                                    <th className={styles.cellRight}>피킹수량</th>
                                    <th className={styles.cellRight}>가용재고</th>
                                    <th>입고일자</th>
                                    <th>바코드</th>
                                    <th>비고</th>
                                    <th className={styles.cellRight}>보관일수</th>
                                    <th>등록자</th>
                                    <th>등록일자</th>
                                    <th>수정자</th>
                                    <th>수정일자</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {searched && filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan={19} className={styles.emptyRow}>
                                            <span className="material-symbols-outlined">inbox</span>
                                            <p>조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : filteredList.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.srvcNm}</td>
                                        <td>{item.whNm}</td>
                                        <td className={styles.cellBold}>{item.itemCd}</td>
                                        <td>{item.itemNm}</td>
                                        <td className={styles.cellCenter}>{item.zoneCd}</td>
                                        <td>{item.zoneNm}</td>
                                        <td className={`${styles.cellCenter} ${styles.cellBold}`}>{item.locCd}</td>
                                        <td className={styles.cellRight}>{item.totQty.toLocaleString()}</td>
                                        <td className={`${styles.cellRight} ${styles.cellDim}`}>{item.alctQty.toLocaleString()}</td>
                                        <td className={`${styles.cellRight} ${styles.cellDim}`}>{item.pickQty.toLocaleString()}</td>
                                        <td className={`${styles.cellRight} ${item.availQty === 0 ? styles.cellAvailQtyZero : styles.cellAvailQtyOk}`}>
                                            {item.availQty.toLocaleString()}
                                        </td>
                                        <td className={styles.cellCenter}>{item.rcptDt}</td>
                                        <td>{item.barCd}</td>
                                        <td className={styles.cellDim}>{item.rmk || '-'}</td>
                                        <td className={styles.cellRight}>{item.storDay}</td>
                                        <td className={styles.cellCenter}>{item.regId}</td>
                                        <td className={styles.cellCenter}>{item.regDate}</td>
                                        <td className={styles.cellCenter}>{item.updId}</td>
                                        <td className={styles.cellCenter}>{item.updDate}</td>
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

export default CJ_WMS_STOCK_0010;
