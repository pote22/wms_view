import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// datapicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
// 공통 API
import { useCommonWhList } from '../../api/common/commonWhList';
import { formatDate } from '../../utils/dateUtils';
import { usePopupContext } from "../../components/common/PopupProvider";
// 엑셀
import ExcelJS from "exceljs";
// CSS (datepicker 보정 전용)
// API
import { getList, type Stock } from '../../api/stock/stock_0010Service';

const CalendarPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    createPortal(children ?? null, document.body);

// ── Tailwind 클래스 상수 ──
const pageShell    = "flex min-h-0 flex-1 bg-surface";
const contentShell = "flex min-w-0 flex-1 flex-col";
const sectionCard  = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader = "shrink-0 border-b border-slate-100 p-6";

const btnBase    = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;

const filterItem     = "flex min-w-0 flex-col gap-1.5";
const filterLabel    = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect   = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInput    = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterReadonly = "h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600";
const filterSearchBtn = "inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover";

const thBase = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide";
const thQty  = "border-b border-slate-100 px-2 py-2 bg-blue-100 text-blue-700 font-semibold uppercase tracking-wide";

const cellCenter = "px-2 py-2 text-center";
const cellMedium = "px-2 py-2 font-medium text-slate-700";
const cellQty    = "px-2 py-2 text-right tabular-nums font-bold text-blue-700";

const CJ_WMS_STOCK_0010: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();

    // 조회조건
    const [searchSrvcCd, setSearchSrvcCd]   = useState(selectSrvcCd);
    const [searchWhCd,   setSearchWhCd]     = useState(selectWhCd);
    const [searchBarCd,  setSearchBarCd]    = useState('');
    const [searchRcptDt, setSearchRcptDt]   = useState(formatDate(new Date()));
    const [searchZoneCd, setSearchZoneCd]   = useState('');
    const [searchZoneNm, setSearchZoneNm]   = useState('');
    const [searchLocCd,  setSearchLocCd]    = useState('');
    const [searchItemCd, setSearchItemCd]   = useState('');
    const [searchItemNm, setSearchItemNm]   = useState('');
    const [searchRmk,    setSearchRmk]      = useState('');

    // 조회결과
    const [stockList,  setStockList]        = useState<Stock[]>([]);
    const [searched,   setSearched]         = useState(false);

    // 팝업
    const { showAlert, openZoneSearch, openLocSearch, openProdSearch } = usePopupContext();

    // 조회
    const handleSearch = () => {
        if (!searchSrvcCd) { showAlert('고객사를 선택하세요.'); return; }
        if (!searchWhCd)   { showAlert('센터를 선택하세요.');   return; }

        getList(
            {
                srvcCd : searchSrvcCd,
                whCd   : searchWhCd,
                barcode: searchBarCd,
                lotNo  : searchRcptDt,   // YYYYMMDD
                zoneCd : searchZoneCd,
                locCd  : searchLocCd,
                prodCd : searchItemCd,
                rmk    : searchRmk,
            },
            (res) => {
                const list: Stock[] = (res.data ?? []).map((v: any) => ({
                    srvcCd   : v.srvc_cd   ?? '',
                    whCd     : v.wh_cd     ?? '',
                    prodCd   : v.prod_cd   ?? '',
                    prodNm   : v.prod_nm   ?? '',
                    zoneCd   : v.zone_cd   ?? '',
                    zoneNm   : v.zone_nm   ?? '',
                    locCd    : v.loc_cd    ?? '',
                    stockQty : v.stock_qty ?? 0,
                    allocQty : v.alloc_qty ?? 0,
                    pickQty  : v.pick_qty  ?? 0,
                    avlQty   : v.avl_qty   ?? 0,
                    lotNo    : v.lot_no    ?? '',
                    id       : v.id        ?? '',
                    aging    : v.aging     ?? 0,
                    prodSpec : v.prod_spec ?? '',
                    rmk      : v.rmk       ?? '',
                    regId    : v.reg_id    ?? '',
                    regDate  : v.reg_date  ?? '',
                    updId    : v.upd_id    ?? '',
                    updDate  : v.upd_date  ?? '',
                }));
                setStockList(list);
                setSearched(true);
            },
            (err) => { 
                showAlert('조회 실패: ' + err?.message); 
                setSearched(true); 
            }
        );
    };

    // ── 엑셀 ──
    const handleExcel = async () => {
        if (stockList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("재고현황");

        ws.columns = [
            { header: "고객사",   key: "srvcNm",  width: 15 },
            { header: "센터명",   key: "whNm",    width: 15 },
            { header: "품번",     key: "prodCd",  width: 15 },
            { header: "품명",     key: "prodNm",  width: 22 },
            { header: "존",       key: "zoneCd",  width: 10 },
            { header: "존명",     key: "zoneNm",  width: 15 },
            { header: "로케이션", key: "locCd",   width: 12 },
            { header: "총재고",   key: "stockQty", width: 10 },
            { header: "할당수량", key: "allocQty", width: 10 },
            { header: "피킹수량", key: "pickQty",  width: 10 },
            { header: "가용재고", key: "avlQty",   width: 10 },
            { header: "입고일자", key: "lotNo",    width: 12 },
            { header: "바코드",   key: "id",       width: 15 },
            { header: "비고",     key: "rmk",      width: 20 },
            { header: "보관일수", key: "aging",    width: 10 },
            { header: "사양",     key: "prodSpec", width: 15 },
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

        stockList.forEach(v => {
            const s = srvcList.find(s => s.srvcCd === v.srvcCd);
            const w = whList.find(w => w.whCd === v.whCd);
            const row = ws.addRow({
                ...v,
                srvcNm: s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd,
                whNm:   w ? `${w.whCd} [${w.whNm}]`   : v.whCd,
            });
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
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>

                    {/* ── 섹션 헤더 ── */}
                    <div className={sectionHeader}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">재고현황</h3>
                                <p className="mt-1 text-sm text-muted">실시간 재고 현황을 조회하고 관리합니다.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className={btnPrimary} onClick={handleSearch}>
                                    <span className="material-symbols-outlined">search</span>
                                    조회
                                </button>
                                <button className={btnOutline} onClick={handleExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    엑셀
                                </button>
                            </div>
                        </div>

                        {/* ── 필터 영역 ── */}
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <div className="grid grid-cols-[1.5fr_1fr_1.5fr] gap-4">

                                {/* Col 1: 고객사 | 센터 (가로) */}
                                <div className="flex gap-2 [&>*]:flex-1 [&>*]:min-w-0">
                                    <div className={filterItem}>
                                        <label className={filterLabel}>고객사</label>
                                        <select className={filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                            {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
                                        </select>
                                    </div>
                                    <div className={filterItem}>
                                        <label className={filterLabel}>센터</label>
                                        <select className={filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                            {whList.map(w => <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Col 2: 바코드 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>바코드</label>
                                    <input type="text" className={filterInput} value={searchBarCd}
                                        onChange={e => setSearchBarCd(e.target.value)} placeholder="" />
                                </div>

                                {/* Col 3: 입고일자 | 비고 (가로) */}
                                <div className="flex gap-2 [&>*]:flex-1 [&>*]:min-w-0">
                                    <div className={filterItem}>
                                        <label className={filterLabel}>입고일자</label>
                                        <div className="datepicker-wrapper relative w-full min-w-0">
                                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: '16px' }}>calendar_today</span>
                                            <DatePicker
                                                selected={searchRcptDt ? new Date(`${searchRcptDt.slice(0,4)}-${searchRcptDt.slice(4,6)}-${searchRcptDt.slice(6,8)}`) : null}
                                                onChange={(date: Date | null) => setSearchRcptDt(date ? formatDate(date) : '')}
                                                dateFormat="yyyy-MM-dd"
                                                locale={ko}
                                                placeholderText="입고일자"
                                                isClearable
                                                popperContainer={CalendarPortal}
                                            />
                                        </div>
                                    </div>
                                    <div className={filterItem}>
                                        <label className={filterLabel}>비고</label>
                                        <input type="text" className={filterInput} value={searchRmk}
                                            onChange={e => setSearchRmk(e.target.value)} />
                                    </div>
                                </div>

                                {/* Col 1: 존 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>존</label>
                                    <div className="flex min-w-0 gap-1.5">
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchZoneCd}
                                            onChange={e => { setSearchZoneCd(e.target.value); setSearchZoneNm(''); }} />
                                        <button className={filterSearchBtn} onClick={() => openZoneSearch((zoneCd, zoneNm) => { setSearchZoneCd(zoneCd); setSearchZoneNm(zoneNm); })}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={filterReadonly} value={searchZoneNm} onChange={e => setSearchZoneCd(e.target.value)} readOnly />
                                    </div>
                                </div>

                                {/* Col 2: 로케이션 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>로케이션</label>
                                    <div className="flex min-w-0 gap-1.5">
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchLocCd}
                                            onChange={e => setSearchLocCd(e.target.value)} />
                                        <button className={filterSearchBtn} onClick={() => { if (!searchZoneCd) { showAlert('존코드를 먼저 입력하세요.'); return; } openLocSearch((locCd) => setSearchLocCd(locCd), searchZoneCd); }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Col 3: 품번 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>품번</label>
                                    <div className="flex min-w-0 gap-1.5">
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchItemCd}
                                            onChange={e => setSearchItemCd(e.target.value)} />
                                        <button className={filterSearchBtn} onClick={() => openProdSearch((prodCd, prodNm) => { setSearchItemCd(prodCd); setSearchItemNm(prodNm); })}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                                        </button>
                                        <input type="text" className={filterReadonly} value={searchItemNm} readOnly />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── 테이블 툴바 (주석 처리된 상태 유지) ── */}
                        {/*
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-primary">Total: {filteredList.length} Items</span>
                            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                <input type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    checked={excludeZeroStock}
                                    onChange={e => setExcludeZeroStock(e.target.checked)} />
                                총 재고량 0 제외
                            </label>
                        </div>
                        */}
                    </div>

                    {/* ── 메인 테이블 ── */}
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="min-w-[2400px] table-fixed border-collapse text-xs">
                            <colgroup>
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '300px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '200px' }} />
                                <col style={{ width: '120px' }} />
                                <col style={{ width: '150px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '200px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '200px' }} />
                            </colgroup>
                            <thead className="sticky top-0 z-1 bg-slate-50 text-slate-500">
                                <tr>
                                    <th className={thBase}>고객사</th>
                                    <th className={thBase}>센터명</th>
                                    <th className={thBase}>품번</th>
                                    <th className={thBase}>품명</th>
                                    <th className={thBase}>존</th>
                                    <th className={thBase}>존명</th>
                                    <th className={thBase}>로케이션</th>
                                    <th className={thQty}>총재고</th>
                                    <th className={thQty}>할당수량</th>
                                    <th className={thQty}>피킹수량</th>
                                    <th className={thQty}>가용재고</th>
                                    <th className={thBase}>입고일자</th>
                                    <th className={thBase}>바코드</th>
                                    <th className={thBase}>비고</th>
                                    <th className={thBase}>보관일수</th>
                                    <th className={thBase}>사양</th>
                                    <th className={thBase}>등록자</th>
                                    <th className={thBase}>등록일자</th>
                                    <th className={thBase}>수정자</th>
                                    <th className={thBase}>수정일자</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                                {searched && stockList.length === 0 ? (
                                    <tr>
                                        <td colSpan={20} className="px-4 py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined block text-4xl">inbox</span>
                                            <p className="mt-2 text-sm">조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : stockList.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className={cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : item.srvcCd)(srvcList.find(s => s.srvcCd === item.srvcCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : item.whCd)(whList.find(w => w.whCd === item.whCd)) }
                                        </td>
                                        <td className={cellCenter}>{item.prodCd}</td>
                                        <td className={cellMedium}>{item.prodNm}</td>
                                        <td className={cellCenter}>{item.zoneCd}</td>
                                        <td className={cellCenter}>{item.zoneNm}</td>
                                        <td className={cellCenter}>{item.locCd}</td>
                                        <td className={cellQty}>{item.stockQty}</td>
                                        <td className={cellQty}>{item.allocQty}</td>
                                        <td className={cellQty}>{item.pickQty}</td>
                                        <td className={cellQty}>{item.avlQty}</td>
                                        <td className={cellCenter}>{item.lotNo}</td>
                                        <td className={cellCenter}>{item.id}</td>
                                        <td className={cellMedium}>{item.rmk}</td>
                                        <td className={cellCenter}>{item.aging}</td>
                                        <td className={cellCenter}>{item.prodSpec}</td>
                                        <td className={cellCenter}>{item.regId}</td>
                                        <td className={cellCenter}>{item.regDate}</td>
                                        <td className={cellCenter}>{item.updId}</td>
                                        <td className={cellCenter}>{item.updDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="shrink-0 border-t border-slate-100 px-4 py-2">
                        <span className="text-xs text-muted">총 {stockList.length} 건</span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CJ_WMS_STOCK_0010;
