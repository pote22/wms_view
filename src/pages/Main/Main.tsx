import { useState } from "react";

/* ── Mock 데이터 ── */
const NOTICES = [
  { no: 10, important: true,  title: "추석 연휴 기간 물류 센터 운영 일정 안내", author: "김철수", date: "2023-10-12" },
  { no: 9,  important: false, title: "WMS 시스템 정기 점검 안내 (10/15)",      author: "이영희", date: "2023-10-10" },
  { no: 8,  important: false, title: "인천 제2물류센터 구역명 변경 공지",       author: "박민준", date: "2023-10-08" },
];

const INBOUND_STATS  = { todayCount: 1248, unit: "SKU", rate: "+12%",  progress: 65, waiting: 24, waitingUnit: "건", label: "확정 대기" };
const OUTBOUND_STATS = { todayCount: 2105, unit: "SKU", rate: "+8.5%", progress: 78, waiting: 42, waitingUnit: "건", label: "출고 대기" };

const TRANSACTIONS = {
  inbound: [
    { id: "IB-20231012-005", status: "완료",  statusType: "done",    type: "Pallet 입고", location: "Warehouse A-04", qty: 120,  time: "14:20 PM" },
    { id: "IB-20231012-004", status: "진행중", statusType: "active",  type: "Bulk 입고",   location: "Warehouse B-12", qty: 450,  time: "13:45 PM" },
    { id: "IB-20231012-003", status: "대기",  statusType: "pending", type: "Pallet 입고", location: "Warehouse C-01", qty: 85,   time: "11:10 AM" },
    { id: "IB-20231012-002", status: "완료",  statusType: "done",    type: "Box 입고",    location: "Warehouse A-02", qty: 300,  time: "10:30 AM" },
    { id: "IB-20231012-001", status: "완료",  statusType: "done",    type: "Bulk 입고",   location: "Warehouse D-05", qty: 210,  time: "09:15 AM" },
    { id: "IB-20231012-000", status: "완료",  statusType: "done",    type: "Pallet 입고", location: "Warehouse B-08", qty: 95,   time: "08:45 AM" },
  ],
  outbound: [
    { id: "OB-20231012-088", status: "완료",  statusType: "done",    type: "택배 출고",   location: "Dock 04",        qty: 45,   time: "15:10 PM" },
    { id: "OB-20231012-087", status: "피킹중", statusType: "active",  type: "Box 출고",    location: "Dock 02",        qty: 1200, time: "14:55 PM" },
    { id: "OB-20231012-086", status: "대기",  statusType: "pending", type: "팔레트 출고", location: "Dock 01",        qty: 12,   time: "14:30 PM" },
  ],
};

const INBOUND_DIST = {
  title: "입고 유형별 분포도 (4월 기준)",
  total: 980,
  items: [
    { label: "Pallet 입고", pct: 50, color: "#003f87", offset: 0   },
    { label: "Bulk 입고",   pct: 30, color: "#cbe7f5", offset: -50 },
    { label: "긴급 입고",   pct: 12, color: "#983c00", offset: -80 },
    { label: "기타",        pct: 8,  color: "#cbd5e1", offset: -92 },
  ],
};

const OUTBOUND_DIST = {
  title: "수불유형 분포도 (4월 기준)",
  total: 1200,
  items: [
    { label: "B2C 이커머스", pct: 45, color: "#003f87", offset: 0   },
    { label: "B2B 대리점",   pct: 30, color: "#cbe7f5", offset: -45 },
    { label: "긴급 보충",    pct: 15, color: "#983c00", offset: -75 },
    { label: "기타 반품",    pct: 10, color: "#cbd5e1", offset: -90 },
  ],
};

const BADGE_CLASSES: Record<string, string> = {
  done:    "bg-emerald-100 text-emerald-900 border border-emerald-200",
  active:  "bg-blue-100 text-blue-700 border border-blue-200",
  pending: "bg-slate-50 text-slate-500 border border-slate-200",
};

const TX_ICON_CLASSES: Record<string, string> = {
  done:    "bg-emerald-100 text-emerald-600",
  active:  "bg-blue-100 text-blue-700",
  pending: "bg-slate-100 text-slate-500",
};

/* ── 컴포넌트 ── */
const Main: React.FC = () => {
  const [activeOpsTab, setActiveOpsTab] = useState<"inbound" | "outbound">("inbound");

  const opsStats = activeOpsTab === "inbound" ? INBOUND_STATS  : OUTBOUND_STATS;
  const txList   = activeOpsTab === "inbound" ? TRANSACTIONS.inbound : TRANSACTIONS.outbound;
  const txTitle  = activeOpsTab === "inbound" ? "최근 입고 트랜젝션 (Recent Transactions)" : "최근 출고 트랜젝션 (Recent Transactions)";
  const distData = activeOpsTab === "inbound" ? INBOUND_DIST : OUTBOUND_DIST;

  return (
    <>
      {/* 공지사항 */}
      <section className="bg-white rounded-xl border border-slate-200/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold text-[#001a40] m-0">공지사항 (Notice)</h3>
          <a className="text-[11px] font-bold text-primary no-underline flex items-center gap-0.5 hover:underline" href="#">모두 보기</a>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.8px] text-slate-400 text-left border-b border-slate-100 w-[60px]">No.</th>
              <th className="px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.8px] text-slate-400 text-left border-b border-slate-100">Title</th>
              <th className="px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.8px] text-slate-400 text-left border-b border-slate-100 w-[90px]">작성자</th>
              <th className="px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.8px] text-slate-400 text-left border-b border-slate-100 w-[120px]">등록일자</th>
            </tr>
          </thead>
          <tbody>
            {NOTICES.map((n) => (
              <tr className="cursor-pointer transition-colors hover:bg-[#f2f4f5]" key={n.no}>
                <td className="px-2 py-3 text-xs border-b border-slate-50 text-slate-400">{String(n.no).padStart(2, "0")}</td>
                <td className="px-2 py-3 text-xs border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    {n.important && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap bg-[#ffdad6] text-[#93000a]">중요</span>
                    )}
                    <span className={n.important ? "font-semibold text-slate-800" : "font-medium text-slate-600"}>{n.title}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-xs border-b border-slate-50 text-slate-600 font-medium">{n.author}</td>
                <td className="px-2 py-3 text-xs border-b border-slate-50 text-slate-500">{n.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 운영 현황 + 분포도 그리드 */}
      <div className="grid grid-cols-2 gap-6">

        {/* 운영 현황 탭 */}
        <div className="bg-white rounded-xl border border-slate-200/30 shadow-sm flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-200">
            {(["inbound", "outbound"] as const).map((tab) => (
              <button
                key={tab}
                className={`flex items-center gap-1.5 px-6 py-4 border-0 border-b-2 border-solid bg-transparent text-[13px] cursor-pointer transition-colors -mb-px ${
                  activeOpsTab === tab
                    ? "text-primary font-bold border-b-[#003f87]"
                    : "text-slate-500 font-medium border-b-transparent hover:text-slate-700"
                }`}
                onClick={() => setActiveOpsTab(tab)}
              >
                <span className="material-symbols-outlined text-base">
                  {tab === "inbound" ? "download" : "upload"}
                </span>
                {tab === "inbound" ? "입고 현황 (Inbound)" : "출고 현황 (Outbound)"}
              </button>
            ))}
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {/* 금일 입/출고 — 블루 카드 */}
              <div className="p-4 rounded-lg flex flex-col gap-1.5 bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-blue-700 m-0">
                  {activeOpsTab === "inbound" ? "금일 입고" : "금일 출고"}
                </p>
                <div className="text-xl font-black text-slate-900 leading-none">
                  {opsStats.todayCount.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-400"> {opsStats.unit}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">{opsStats.rate} ↑</span>
              </div>
              {/* 주간 진행률 */}
              <div className="p-4 rounded-lg flex flex-col gap-1.5 bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 m-0">주간 진행률</p>
                <div className="py-2 pb-1">
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-[width] duration-300" style={{ width: `${opsStats.progress}%` }} />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-500">{opsStats.progress}% 완료</span>
              </div>
              {/* 확정/출고 대기 */}
              <div className="p-4 rounded-lg flex flex-col gap-1.5 bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-slate-500 m-0">{opsStats.label}</p>
                <div className="text-xl font-black text-slate-900 leading-none">
                  {opsStats.waiting}
                  <span className="text-[10px] font-normal text-slate-400"> {opsStats.waitingUnit}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium m-0">실시간 운영 요약 데이터</p>
          </div>
        </div>

        {/* 분포도 */}
        <div className="bg-white rounded-xl border border-slate-200/30 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold text-[#001a40] m-0">{distData.title}</h3>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">bar_chart</span>
          </div>
          <div className="flex-1 flex items-center justify-around gap-6 pt-2">
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                {distData.items.map((seg) => (
                  <circle
                    key={seg.label}
                    cx="18" cy="18" r="16"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="4"
                    strokeDasharray={`${seg.pct} 100`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-black text-slate-900 leading-none">{distData.total.toLocaleString()}</span>
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-slate-400 mt-0.5">TOTAL ORDERS</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1 min-w-[140px]">
              {distData.items.map((seg) => (
                <div className="flex items-center justify-between gap-2" key={seg.label}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-xs font-medium text-slate-600 flex-1">{seg.label}</span>
                  <span className="text-xs font-bold text-slate-900">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 트랜젝션 */}
      <section className="bg-white rounded-xl border border-slate-200/30 shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="font-display text-sm font-bold text-[#001a40] m-0">{txTitle}</h3>
          <a className="text-[11px] font-bold text-primary no-underline flex items-center gap-0.5 hover:underline" href="#">
            전체 내역 보기
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </a>
        </div>
        <div className="flex-1 max-h-[479px] overflow-y-auto">
          {txList.map((tx) => (
            <div
              className="flex items-center justify-between p-4 rounded-xl border border-transparent transition-colors cursor-pointer hover:bg-slate-50 hover:border-slate-100"
              key={tx.id}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${TX_ICON_CLASSES[tx.statusType]}`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {tx.statusType === "done" ? "check_circle" : tx.statusType === "active" ? "sync" : "schedule"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{tx.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${BADGE_CLASSES[tx.statusType]}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    {tx.type}
                    <span className="inline-block w-px h-2 bg-slate-200" />
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {tx.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 m-0">{tx.qty.toLocaleString()} EA</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.5px] m-0">QUANTITY</p>
                </div>
                <div className="text-right min-w-[72px]">
                  <p className="text-xs font-bold text-slate-700 m-0">{tx.time}</p>
                  <p className="text-[10px] text-slate-400 m-0">Today</p>
                </div>
                <button className="w-9 h-9 border-0 bg-transparent text-slate-400 rounded-lg cursor-pointer text-[22px] flex items-center justify-center transition-colors hover:bg-white hover:text-primary material-symbols-outlined">
                  more_vert
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Main;
