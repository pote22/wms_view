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

/* ── 컴포넌트 ── */
const CjWmsHome0010: React.FC = () => {
  const [activeOpsTab, setActiveOpsTab] = useState<"inbound" | "outbound">("inbound");

  const opsStats = activeOpsTab === "inbound" ? INBOUND_STATS  : OUTBOUND_STATS;
  const txList   = activeOpsTab === "inbound" ? TRANSACTIONS.inbound : TRANSACTIONS.outbound;
  const txTitle  = activeOpsTab === "inbound" ? "최근 입고 트랜젝션 (Recent Transactions)" : "최근 출고 트랜젝션 (Recent Transactions)";
  const distData = activeOpsTab === "inbound" ? INBOUND_DIST : OUTBOUND_DIST;

  return (
    <>
      {/* 공지사항 */}
      <section className="card notice-card">
        <div className="card-header">
          <h3 className="card-title">공지사항 (Notice)</h3>
          <a className="card-link" href="#">모두 보기</a>
        </div>
        <table className="notice-table">
          <thead>
            <tr>
              <th className="notice-th">No.</th>
              <th className="notice-th">Title</th>
              <th className="notice-th notice-th--author">작성자</th>
              <th className="notice-th">등록일자</th>
            </tr>
          </thead>
          <tbody>
            {NOTICES.map((n) => (
              <tr className="notice-row" key={n.no}>
                <td className="notice-td notice-td--no">{String(n.no).padStart(2, "0")}</td>
                <td className="notice-td">
                  <div className="notice-title-cell">
                    {n.important && <span className="badge badge--important">중요</span>}
                    <span className={n.important ? "notice-title--bold" : "notice-title"}>{n.title}</span>
                  </div>
                </td>
                <td className="notice-td notice-td--author">{n.author}</td>
                <td className="notice-td notice-td--date">{n.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 운영 현황 + 분포도 그리드 */}
      <div className="ops-grid">

        {/* 운영 현황 탭 */}
        <div className="card ops-card">
          <div className="ops-tab-nav">
            <button
              className={`ops-tab ${activeOpsTab === "inbound" ? "ops-tab--active" : ""}`}
              onClick={() => setActiveOpsTab("inbound")}
            >
              <span className="material-symbols-outlined">download</span>
              입고 현황 (Inbound)
            </button>
            <button
              className={`ops-tab ${activeOpsTab === "outbound" ? "ops-tab--active" : ""}`}
              onClick={() => setActiveOpsTab("outbound")}
            >
              <span className="material-symbols-outlined">upload</span>
              출고 현황 (Outbound)
            </button>
          </div>
          <div className="ops-content">
            <div className="ops-summary-grid">
              <div className="summary-card summary-card--blue">
                <p className="summary-label">{activeOpsTab === "inbound" ? "금일 입고" : "금일 출고"}</p>
                <div className="summary-value">
                  {opsStats.todayCount.toLocaleString()}
                  <span className="summary-unit"> {opsStats.unit}</span>
                </div>
                <span className="summary-rate">{opsStats.rate} ↑</span>
              </div>
              <div className="summary-card summary-card--gray">
                <p className="summary-label">주간 진행률</p>
                <div className="progress-bar-wrap">
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${opsStats.progress}%` }} />
                  </div>
                </div>
                <span className="summary-progress-text">{opsStats.progress}% 완료</span>
              </div>
              <div className="summary-card summary-card--gray">
                <p className="summary-label">{opsStats.label}</p>
                <div className="summary-value">
                  {opsStats.waiting}
                  <span className="summary-unit"> {opsStats.waitingUnit}</span>
                </div>
              </div>
            </div>
            <p className="ops-footnote">실시간 운영 요약 데이터</p>
          </div>
        </div>

        {/* 분포도 */}
        <div className="card dist-card">
          <div className="card-header">
            <h3 className="card-title">{distData.title}</h3>
            <span className="material-symbols-outlined card-icon">bar_chart</span>
          </div>
          <div className="dist-content">
            <div className="donut-wrap">
              <svg className="donut-svg" viewBox="0 0 36 36">
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
              <div className="donut-center">
                <span className="donut-total">{distData.total.toLocaleString()}</span>
                <span className="donut-label">TOTAL ORDERS</span>
              </div>
            </div>
            <div className="dist-legend">
              {distData.items.map((seg) => (
                <div className="legend-row" key={seg.label}>
                  <div className="legend-dot" style={{ backgroundColor: seg.color }} />
                  <span className="legend-text">{seg.label}</span>
                  <span className="legend-pct">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 트랜젝션 */}
      <section className="card tx-card">
        <div className="card-header">
          <h3 className="card-title">{txTitle}</h3>
          <a className="card-link" href="#">
            전체 내역 보기
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </a>
        </div>
        <div className="tx-list">
          {txList.map((tx) => (
            <div className="tx-row" key={tx.id}>
              <div className="tx-left">
                <div className={`tx-icon tx-icon--${tx.statusType}`}>
                  <span className="material-symbols-outlined">
                    {tx.statusType === "done" ? "check_circle" : tx.statusType === "active" ? "sync" : "schedule"}
                  </span>
                </div>
                <div className="tx-info">
                  <div className="tx-title-row">
                    <span className="tx-id">{tx.id}</span>
                    <span className={`badge badge--${tx.statusType}`}>{tx.status}</span>
                  </div>
                  <div className="tx-meta">
                    <span className="material-symbols-outlined tx-meta-icon">inventory_2</span>
                    {tx.type}
                    <span className="tx-divider" />
                    <span className="material-symbols-outlined tx-meta-icon">location_on</span>
                    {tx.location}
                  </div>
                </div>
              </div>
              <div className="tx-right">
                <div className="tx-qty">
                  <p className="tx-qty-value">{tx.qty.toLocaleString()} EA</p>
                  <p className="tx-qty-label">QUANTITY</p>
                </div>
                <div className="tx-time">
                  <p className="tx-time-value">{tx.time}</p>
                  <p className="tx-time-label">Today</p>
                </div>
                <button className="tx-more material-symbols-outlined">more_vert</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default CjWmsHome0010;
