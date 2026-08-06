import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
// 공통 API
import { useCommonWhList } from '../../api/common/commonWhList';
import { formatDate } from '../../utils/dateUtils';
import { usePopupContext } from "../../components/common/PopupProvider";
// 엑셀
import ExcelJS from "exceljs";
// API
import { getList, type Transaction } from '../../api/stock/stock_0090Service';

const CalendarPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    createPortal(children ?? null, document.body);

// ── Tailwind 클래스 상수 ──
const pageShell     = "flex min-h-0 flex-1 bg-surface";
const contentShell  = "flex min-w-0 flex-1 flex-col";
const sectionCard   = "flex min-h-0 flex-1 flex-col rounded-t-xl border border-slate-200/60 bg-surface-card shadow-sm";
const sectionHeader = "shrink-0 border-b border-slate-100 p-6";

const btnBase    = "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition";
const btnPrimary = `${btnBase} bg-primary text-white hover:bg-primary-hover`;
const btnOutline = `${btnBase} border border-border-soft bg-white text-slate-700 hover:bg-slate-50`;

const filterItem   = "flex min-w-0 flex-col gap-1.5";
const filterLabel  = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const filterSelect = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const filterInput  = "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

const thBase = "border-b border-slate-100 px-2 py-2 text-center font-semibold uppercase tracking-wide";

const cellCenter        = "px-2 py-2 text-center";
const cellMedium        = "px-2 py-2 font-medium text-slate-700";
const cellQty           = "px-2 py-2 text-right tabular-nums font-bold text-blue-700";
const cellApplyQtyUp    = "px-2 py-2 text-right tabular-nums font-bold text-success";
const cellApplyQtyDown  = "px-2 py-2 text-right tabular-nums font-bold text-danger";
const cellTxnKey        = "truncate px-2 py-2 font-mono text-xs";
const cellDim           = "px-2 py-2 text-center text-[11px] text-muted";

const badgeBase    = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
const badgeIn      = `${badgeBase} bg-green-50 text-success`;
const badgeOut     = `${badgeBase} bg-red-50 text-danger`;
const badgeMove    = `${badgeBase} bg-blue-50 text-blue-700`;
const badgeDefault = `${badgeBase} bg-slate-100 text-slate-500`;

// 구분 옵션
const TXN_TP_OPTIONS = [
    { value: '',   label: '전체' },
    { value: 'DP', label: '입고' },
    { value: 'WD', label: '출고' },
    { value: 'MV', label: '재고이동' },
    { value: 'AJ', label: '재고조정' },
    { value: 'TR', label: '물류이동' },
];

// 날짜 문자열(YYYYMMDD) → Date 변환
const toDate = (s: string): Date | null =>
    s ? new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`) : null;

const CJ_WMS_STOCK_0090: React.FC = () => {
    const { srvcList, whList, selectSrvcCd, selectWhCd } = useCommonWhList();

    // 조회조건
    const [searchSrvcCd,   setSearchSrvcCd]   = useState(selectSrvcCd);
    const [searchWhCd,     setSearchWhCd]     = useState(selectWhCd);
    const [searchWorkDtFr, setSearchWorkDtFr] = useState(formatDate(new Date()));
    const [searchWorkDtTo, setSearchWorkDtTo] = useState(formatDate(new Date()));
    const [searchRcptDt,   setSearchRcptDt]   = useState('');
    const [searchProdCd,   setSearchProdCd]   = useState('');
    const [searchProdNm,   setSearchProdNm]   = useState('');
    const [searchTxnKey,   setSearchTxnKey]   = useState('');
    const [searchTxnTp,    setSearchTxnTp]    = useState('');
    const [searchOrdNo,    setSearchOrdNo]    = useState('');
    const [searchBarCd,    setSearchBarCd]    = useState('');

    // 조회결과
    const [txnList,  setTxnList]  = useState<Transaction[]>([]);
    const [searched, setSearched] = useState(false);

    // 팝업
    const { showAlert, openProdSearch } = usePopupContext();

    // 조회
    const handleSearch = () => {
        if (!searchSrvcCd) { showAlert('고객사를 선택하세요.'); return; }
        if (!searchWhCd)   { showAlert('센터를 선택하세요.');   return; }

        getList(
            {
                srvcCd   : searchSrvcCd,
                whCd     : searchWhCd,
                workDtFr : searchWorkDtFr,
                workDtTo : searchWorkDtTo,
                rcptDt   : searchRcptDt,
                prodCd   : searchProdCd,
                txnKey   : searchTxnKey,
                txnTp    : searchTxnTp,
                ordNo    : searchOrdNo,
                barcode  : searchBarCd,
            },
            (res) => {
                const list: Transaction[] = (res.data ?? []).map((v: any) => ({
                    srvcCd    : v.srvc_cd     ?? '',
                    whCd      : v.wh_cd       ?? '',
                    txnKey    : v.txn_key     ?? '',
                    txnTp     : v.txn_tp      ?? '',
                    txnTpNm   : v.txn_tp_nm   ?? '',
                    workDt    : v.work_dt     ?? '',
                    prodCd    : v.prod_cd     ?? '',
                    prodNm    : v.prod_nm     ?? '',
                    rcptLotNo : v.rcpt_lot_no ?? '',
                    prodLotNo : v.prod_lot_no ?? '',
                    befZoneCd : v.bef_zone_cd ?? '',
                    befLocCd  : v.bef_loc_cd  ?? '',
                    befBarCd  : v.bef_bar_cd  ?? '',
                    aftZoneCd : v.aft_zone_cd ?? '',
                    aftLocCd  : v.aft_loc_cd  ?? '',
                    aftBarCd  : v.aft_bar_cd  ?? '',
                    ordNo     : v.ord_no      ?? '',
                    stockQty  : v.stock_qty   ?? 0,
                    applyQty  : v.apply_qty   ?? 0,
                    ioGb      : v.io_gb       ?? '',
                    regId     : v.reg_id      ?? '',
                    regDate   : v.reg_date    ?? '',
                    updId     : v.upd_id      ?? '',
                    updDate   : v.upd_date    ?? '',
                }));
                setTxnList(list);
                setSearched(true);
            },
            (err) => { showAlert('조회 실패: ' + err?.message); setSearched(true); }
        );
    };

    // 엑셀
    const handleExcel = async () => {
        if (txnList.length === 0) {
            showAlert("다운로드할 데이터가 없습니다.");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("트랜잭션현황");

        ws.columns = [
            { header: "센터명",           key: "whNm",      width: 16 },
            { header: "고객사",           key: "srvcNm",    width: 16 },
            { header: "트랜잭션KEY",      key: "txnKey",    width: 18 },
            { header: "구분",             key: "txnTpNm",   width: 8 },
            { header: "작업일자",         key: "workDt",    width: 12 },
            { header: "품번",             key: "prodCd",    width: 16 },
            { header: "품명",             key: "prodNm",    width: 24 },
            { header: "입고일자(로트번호)", key: "rcptLotNo", width: 16 },
            { header: "생산로트(로트번호)", key: "prodLotNo", width: 16 },
            { header: "존(이동전)",       key: "befZoneCd", width: 12 },
            { header: "로케이션(이동전)", key: "befLocCd",  width: 14 },
            { header: "바코드(이동전)",   key: "befBarCd",  width: 14 },
            { header: "존(이동후)",       key: "aftZoneCd", width: 12 },
            { header: "로케이션(이동후)", key: "aftLocCd",  width: 14 },
            { header: "바코드(이동후)",   key: "aftBarCd",  width: 14 },
            { header: "지시번호",         key: "ordNo",     width: 14 },
            { header: "수량(재고)",       key: "stockQty",  width: 12 },
            { header: "재고반영(수량)",   key: "applyQty",  width: 12 },
            { header: "증차감구분자",     key: "ioGb",      width: 12 },
            { header: "등록자",           key: "regId",     width: 12 },
            { header: "등록일자",         key: "regDate",   width: 18 },
            { header: "수정자",           key: "updId",     width: 12 },
            { header: "수정일자",         key: "updDate",   width: 18 },
        ];

        const headerRow = ws.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "0080B2Fd" } };
            cell.font      = { bold: true, color: { argb: "00000000" }, size: 11 };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border    = { top: {style:"thin"}, left: {style:"thin"}, bottom: {style:"thin"}, right: {style:"thin"} };
        });
        headerRow.height = 22;

        txnList.forEach(v => {
            const s = srvcList.find(s => s.srvcCd === v.srvcCd);
            const w = whList.find(w => w.whCd === v.whCd);
            const row = ws.addRow({
                ...v,
                srvcNm: s ? `${s.srvcCd} [${s.srvcNm}]` : v.srvcCd,
                whNm:   w ? `${w.whCd} [${w.whNm}]`     : v.whCd,
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
        a.download   = `트랜잭션현황_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => { setSearchSrvcCd(selectSrvcCd); }, [selectSrvcCd]);
    useEffect(() => { setSearchWhCd(selectWhCd); },     [selectWhCd]);

    // 구분 뱃지 클래스
    const badgeClass = (tp: string) =>
        tp === 'I' ? badgeIn
      : tp === 'O' ? badgeOut
      : tp === 'M' ? badgeMove
      : badgeDefault;

    // 구분명 표시 (txnTpNm 우선, 없으면 옵션 라벨)
    const txnTpLabel = (item: Transaction) =>
        item.txnTpNm || TXN_TP_OPTIONS.find(o => o.value === item.txnTp)?.label || item.txnTp;

    // 증가/감소 판정
    const isUp = (item: Transaction) =>
        item.ioGb ? item.ioGb === 'I' : Number(item.applyQty) >= 0;

    return (
        <>
        <div className={pageShell}>
            <div className={contentShell}>
                <div className={sectionCard}>

                    {/* ── 섹션 헤더 ── */}
                    <div className={sectionHeader}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-xl font-bold text-slate-950">트랜잭션현황</h3>
                                <p className="mt-1 text-sm text-muted">재고 이동 및 수량 변화 이력을 상세하게 조회합니다.</p>
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
                            <div className="grid grid-cols-5 gap-4">

                                {/* 고객사 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>고객사</label>
                                    <select className={filterSelect} value={searchSrvcCd} onChange={e => setSearchSrvcCd(e.target.value)}>
                                        {srvcList.map(s => <option key={s.srvcCd} value={s.srvcCd}>{`${s.srvcCd} [${s.srvcNm}]`}</option>)}
                                    </select>
                                </div>

                                {/* 센터 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>센터</label>
                                    <select className={filterSelect} value={searchWhCd} onChange={e => setSearchWhCd(e.target.value)}>
                                        {whList.map(w => <option key={w.whCd} value={w.whCd}>{`${w.whCd} [${w.whNm}]`}</option>)}
                                    </select>
                                </div>

                                {/* 작업일자 (범위) */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>작업일자</label>
                                    <div className="flex items-center gap-1">
                                        <div className="datepicker-wrapper min-w-0 flex-1">
                                            <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[16px]">calendar_today</span>
                                            <DatePicker
                                                selected={toDate(searchWorkDtFr)}
                                                onChange={(date: Date | null) => setSearchWorkDtFr(date ? formatDate(date) : '')}
                                                dateFormat="yyyy-MM-dd"
                                                locale={ko}
                                                isClearable
                                                placeholderText=""
                                                popperContainer={CalendarPortal}
                                            />
                                        </div>
                                        <span className="shrink-0 text-xs text-slate-400">~</span>
                                        <div className="datepicker-wrapper min-w-0 flex-1">
                                            <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[16px]">calendar_today</span>
                                            <DatePicker
                                                selected={toDate(searchWorkDtTo)}
                                                onChange={(date: Date | null) => setSearchWorkDtTo(date ? formatDate(date) : '')}
                                                dateFormat="yyyy-MM-dd"
                                                locale={ko}
                                                isClearable
                                                placeholderText=""
                                                popperContainer={CalendarPortal}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 품번 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>품번</label>
                                    <div className="flex min-w-0 gap-1.5">
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={searchProdCd}
                                            onChange={e => { setSearchProdCd(e.target.value); setSearchProdNm(''); }} placeholder="" />
                                        <button className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover" onClick={() => openProdSearch((prodCd, prodNm) => { setSearchProdCd(prodCd); setSearchProdNm(prodNm); }, searchProdCd)}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </button>
                                        <input type="text" className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-600" value={searchProdNm} readOnly />
                                    </div>
                                </div>

                                {/* 입고일자 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>입고일자</label>
                                    <div className="datepicker-wrapper">
                                        <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 z-1 text-slate-400 text-[16px]">calendar_today</span>
                                        <DatePicker
                                            selected={toDate(searchRcptDt)}
                                            onChange={(date: Date | null) => setSearchRcptDt(date ? formatDate(date) : '')}
                                            dateFormat="yyyy-MM-dd"
                                            locale={ko}
                                            isClearable
                                            placeholderText=""
                                            popperContainer={CalendarPortal}
                                        />
                                    </div>
                                </div>

                                {/* 트랜잭션KEY */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>트랜잭션KEY</label>
                                    <input type="text" className={filterInput} value={searchTxnKey}
                                        onChange={e => setSearchTxnKey(e.target.value)} placeholder="TXN-0000" />
                                </div>

                                {/* 구분 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>구분</label>
                                    <select className={filterSelect} value={searchTxnTp} onChange={e => setSearchTxnTp(e.target.value)}>
                                        {TXN_TP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>

                                {/* 지시번호 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>지시번호</label>
                                    <input type="text" className={filterInput} value={searchOrdNo}
                                        onChange={e => setSearchOrdNo(e.target.value)} placeholder="지시번호 입력" />
                                </div>

                                {/* 바코드 */}
                                <div className={filterItem}>
                                    <label className={filterLabel}>바코드</label>
                                    <input type="text" className={filterInput} value={searchBarCd}
                                        onChange={e => setSearchBarCd(e.target.value)} placeholder="바코드 입력" />
                                </div>

                            </div>
                        </div>

                        {/* ── 테이블 툴바 ── */}
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-primary">Total: {txnList.length} Items</span>
                        </div>
                    </div>

                    {/* ── 메인 테이블 ── */}
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="min-w-[2800px] table-fixed border-collapse text-xs">
                            <colgroup>
                                <col style={{ width: '150px' }} />   {/* 센터명 */}
                                <col style={{ width: '150px' }} />   {/* 고객사 */}
                                <col style={{ width: '150px' }} />   {/* 트랜잭션KEY */}
                                <col style={{ width: '80px' }} />    {/* 구분 */}
                                <col style={{ width: '100px' }} />   {/* 작업일자 */}
                                <col style={{ width: '150px' }} />   {/* 품번 */}
                                <col style={{ width: '220px' }} />   {/* 품명 */}
                                <col style={{ width: '140px' }} />   {/* 입고일자(로트) */}
                                <col style={{ width: '140px' }} />   {/* 생산로트 */}
                                <col style={{ width: '100px' }} />   {/* 존(이동전) */}
                                <col style={{ width: '120px' }} />   {/* 로케이션(이동전) */}
                                <col style={{ width: '120px' }} />   {/* 바코드(이동전) */}
                                <col style={{ width: '100px' }} />   {/* 존(이동후) */}
                                <col style={{ width: '120px' }} />   {/* 로케이션(이동후) */}
                                <col style={{ width: '120px' }} />   {/* 바코드(이동후) */}
                                <col style={{ width: '120px' }} />   {/* 지시번호 */}
                                <col style={{ width: '100px' }} />   {/* 수량(재고) */}
                                <col style={{ width: '110px' }} />   {/* 재고반영(수량) */}
                                <col style={{ width: '90px' }} />    {/* 증차감구분자 */}
                                <col style={{ width: '90px' }} />    {/* 등록자 */}
                                <col style={{ width: '150px' }} />   {/* 등록일자 */}
                                <col style={{ width: '90px' }} />    {/* 수정자 */}
                                <col style={{ width: '150px' }} />   {/* 수정일자 */}
                            </colgroup>
                            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500">
                                <tr>
                                    <th className={thBase}>센터명</th>
                                    <th className={thBase}>고객사</th>
                                    <th className={thBase}>트랜잭션KEY</th>
                                    <th className={thBase}>구분</th>
                                    <th className={thBase}>작업일자</th>
                                    <th className={thBase}>품번</th>
                                    <th className={thBase}>품명</th>
                                    <th className={thBase}>입고일자(로트번호)</th>
                                    <th className={thBase}>생산로트(로트번호)</th>
                                    <th className={thBase}>존(이동전)</th>
                                    <th className={thBase}>로케이션(이동전)</th>
                                    <th className={thBase}>바코드(이동전)</th>
                                    <th className={thBase}>존(이동후)</th>
                                    <th className={thBase}>로케이션(이동후)</th>
                                    <th className={thBase}>바코드(이동후)</th>
                                    <th className={thBase}>지시번호</th>
                                    <th className={thBase}>수량(재고)</th>
                                    <th className={thBase}>재고반영(수량)</th>
                                    <th className={thBase}>증차감구분자</th>
                                    <th className={thBase}>등록자</th>
                                    <th className={thBase}>등록일자</th>
                                    <th className={thBase}>수정자</th>
                                    <th className={thBase}>수정일자</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                                {searched && txnList.length === 0 ? (
                                    <tr>
                                        <td colSpan={23} className="px-4 py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined block text-4xl">inbox</span>
                                            <p className="mt-2 text-sm">조회된 데이터가 없습니다.</p>
                                        </td>
                                    </tr>
                                ) : txnList.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className={cellCenter}>
                                            { (w => w ? `${w.whCd} [${w.whNm}]` : item.whCd)(whList.find(w => w.whCd === item.whCd)) }
                                        </td>
                                        <td className={cellCenter}>
                                            { (s => s ? `${s.srvcCd} [${s.srvcNm}]` : item.srvcCd)(srvcList.find(s => s.srvcCd === item.srvcCd)) }
                                        </td>
                                        <td className={cellTxnKey}>{item.txnKey}</td>
                                        <td className={cellCenter}>
                                            <span className={badgeClass(item.txnTp)}>{txnTpLabel(item)}</span>
                                        </td>
                                        <td className={cellCenter}>{item.workDt}</td>
                                        <td className={cellMedium}>{item.prodCd}</td>
                                        <td className={cellMedium}>{item.prodNm}</td>
                                        <td className={cellCenter}>{item.rcptLotNo}</td>
                                        <td className={cellCenter}>{item.prodLotNo}</td>
                                        <td className={cellCenter}>{item.befZoneCd}</td>
                                        <td className={cellCenter}>{item.befLocCd}</td>
                                        <td className={cellCenter}>{item.befBarCd}</td>
                                        <td className={cellCenter}>{item.aftZoneCd}</td>
                                        <td className={cellCenter}>{item.aftLocCd}</td>
                                        <td className={cellCenter}>{item.aftBarCd}</td>
                                        <td className={cellCenter}>{item.ordNo}</td>
                                        <td className={cellQty}>{Number(item.stockQty).toLocaleString()}</td>
                                        <td className={isUp(item) ? cellApplyQtyUp : cellApplyQtyDown}>
                                            {Number(item.applyQty) > 0 ? '+' : ''}{Number(item.applyQty).toLocaleString()}
                                        </td>
                                        <td className={cellCenter}>
                                            <span className={`material-symbols-outlined ${isUp(item) ? 'text-success' : 'text-danger'}`}>
                                                {isUp(item) ? 'trending_up' : 'trending_down'}
                                            </span>
                                        </td>
                                        <td className={cellCenter}>{item.regId}</td>
                                        <td className={cellDim}>{item.regDate}</td>
                                        <td className={cellCenter}>{item.updId || '-'}</td>
                                        <td className={cellDim}>{item.updDate || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="shrink-0 border-t border-slate-100 px-4 py-2">
                        <span className="text-xs text-muted">총 {txnList.length} 건</span>
                    </div>
                </div>
            </div>
        </div>
</>
    );
};

export default CJ_WMS_STOCK_0090;
