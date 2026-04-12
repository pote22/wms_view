import { useState, useEffect, useRef } from "react";
import "../../css/Main/main.css";

import CjWmsHome0010    from "../Home/cj_wms_home_0010";
import CjWmsHome0020    from "../Home/cj_wms_home_0020";
import CjWmsHome0050    from "../Home/cj_wms_home_0050";
import CjWmsReceipt0010 from "../Receipt/cj_wms_receipt_0010";
import CjWmsReceipt0020 from "../Receipt/cj_wms_receipt_0020";
import CjWmsOrder0010   from "../Order/cj_wms_order_0010";
import CjWmsOrder0020   from "../Order/cj_wms_order_0020";
import CjWmsComm0010    from "../Common/cj_wms_comm_0010";
import CjWmsComm0020    from "../Common/cj_wms_comm_0020";

/* ── 페이지 맵 ── */
const PAGE_MAP: Record<string, React.ReactNode> = {
  "notice":            <CjWmsHome0010 />,
  "items":             <CjWmsHome0020 />,
  "zone":              <CjWmsHome0050 />,
  "inbound-register":  <CjWmsReceipt0010 />,
  "inbound-schedule":  <CjWmsReceipt0020 />,
  "outbound-register": <CjWmsOrder0010 />,
  "outbound-assign":   <CjWmsOrder0020 />,
  "center-customer":   <CjWmsComm0010 />,
  "user-manage":       <CjWmsComm0020 />,
};

/* ── 셀렉터 데이터 ── */
const CUSTOMERS = ["GS칼텍스", "CJ대한통운", "삼성전자", "LG화학"];
const CENTERS   = ["인천GSC센터", "부산센터", "대전센터", "광주센터"];

/* ── 사이드바 메뉴 정의 ── */
const HOME_MENUS = [
  { group: "홈", items: [
    { icon: "notifications", label: "공지사항", key: "notice" },
  ]},
];
const STORAGE_MENUS = [
  { group: "마스터 관리", items: [
    { icon: "inventory_2",     label: "품번관리",       key: "items"             },
    { icon: "location_on",     label: "존&로케이션관리", key: "zone"              },
  ]},
  { group: "입고관리", items: [
    { icon: "download",        label: "입고등록",       key: "inbound-register"  },
    { icon: "pending_actions", label: "입고예정&확정",  key: "inbound-schedule"  },
  ]},
  { group: "출고관리", items: [
    { icon: "upload",          label: "출고등록",       key: "outbound-register" },
    { icon: "assignment",      label: "출고/할당 관리", key: "outbound-assign"   },
  ]},
];
const COMMON_MENUS = [
  { group: "사용자관리", items: [
    { icon: "manage_accounts", label: "센터고객관리",   key: "center-customer"   },
    { icon: "person",          label: "회원관리",       key: "user-manage"       },
  ]},
];

/* ── 컴포넌트 ── */
const Main: React.FC = () => {
  const [activeMainTab,    setActiveMainTab]    = useState<"home" | "storage" | "common">("home");
  const [activeSideMenu,   setActiveSideMenu]   = useState<string>("notice");
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS[0]);
  const [selectedCenter,   setSelectedCenter]   = useState(CENTERS[0]);
  const [openDropdown,     setOpenDropdown]      = useState<"customer" | "center" | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menus = activeMainTab === "home" ? HOME_MENUS
              : activeMainTab === "storage" ? STORAGE_MENUS
              : COMMON_MENUS;

  return (
    <div className="main-wrapper">

      {/* ── 사이드바 ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">CJ WMS</h2>
          <p className="sidebar-sub">CJ Logistics</p>
        </div>

        <nav className="sidebar-nav">
          {menus.map((section) => (
            <div className="sidebar-section" key={section.group}>
              <span className="sidebar-group-label">{section.group}</span>
              {section.items.map((item) => (
                <a
                  className={`sidebar-menu-item${activeSideMenu === item.key ? " sidebar-menu-item--active" : ""}`}
                  href="#"
                  key={item.key}
                  onClick={(e) => { e.preventDefault(); setActiveSideMenu(item.key); }}
                >
                  <span className="material-symbols-outlined sidebar-menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a className="sidebar-menu-item" href="#">
            <span className="material-symbols-outlined sidebar-menu-icon">help</span>
            <span>Support</span>
          </a>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main className="main-content">

        {/* 상단 헤더 */}
        <header className="top-header">
          <div className="header-top-row">

            {/* 좌측: 셀렉터 */}
            <div className="header-selectors" ref={dropdownRef}>
              <div className="dropdown-wrap">
                <div className="selector-box" onClick={() => setOpenDropdown(openDropdown === "customer" ? null : "customer")}>
                  <span className="selector-label">고객사</span>
                  <span className="selector-value">{selectedCustomer}</span>
                  <span className={`material-symbols-outlined selector-arrow ${openDropdown === "customer" ? "selector-arrow--open" : ""}`}>expand_more</span>
                </div>
                {openDropdown === "customer" && (
                  <ul className="dropdown-list">
                    {CUSTOMERS.map((c) => (
                      <li key={c} className={`dropdown-item ${c === selectedCustomer ? "dropdown-item--active" : ""}`}
                        onClick={() => { setSelectedCustomer(c); setOpenDropdown(null); }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="dropdown-wrap">
                <div className="selector-box" onClick={() => setOpenDropdown(openDropdown === "center" ? null : "center")}>
                  <span className="selector-label">센터</span>
                  <span className="selector-value">{selectedCenter}</span>
                  <span className={`material-symbols-outlined selector-arrow ${openDropdown === "center" ? "selector-arrow--open" : ""}`}>expand_more</span>
                </div>
                {openDropdown === "center" && (
                  <ul className="dropdown-list">
                    {CENTERS.map((c) => (
                      <li key={c} className={`dropdown-item ${c === selectedCenter ? "dropdown-item--active" : ""}`}
                        onClick={() => { setSelectedCenter(c); setOpenDropdown(null); }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 우측: 사용자 정보 */}
            <div className="header-user-area">
              <div className="user-info">
                <div className="user-avatar">JS</div>
                <div className="user-text">
                  <span className="user-name">김철수 관리자</span>
                  <span className="user-role">SUPER USER</span>
                </div>
              </div>
              <button className="logout-btn">
                <span className="material-symbols-outlined">logout</span>
                로그아웃
              </button>
              <div className="header-icons">
                <button className="icon-btn material-symbols-outlined">notifications</button>
                <button className="icon-btn material-symbols-outlined">settings</button>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 — 탭 클릭 시 본문 변경 없음, 사이드바만 교체 */}
          <div className="header-tab-row">
            <button
              className={`main-tab ${activeMainTab === "home" ? "main-tab--active" : ""}`}
              onClick={() => setActiveMainTab("home")}
            >
              홈
            </button>
            <button
              className={`main-tab ${activeMainTab === "storage" ? "main-tab--active" : ""}`}
              onClick={() => setActiveMainTab("storage")}
            >
              보관관리
            </button>
            <button
              className={`main-tab ${activeMainTab === "common" ? "main-tab--active" : ""}`}
              onClick={() => setActiveMainTab("common")}
            >
              공통관리
            </button>
          </div>
        </header>

        {/* 페이지 캔버스 — activeSideMenu 에 따라 컴포넌트 교체 */}
        <div className="page-canvas">
          {PAGE_MAP[activeSideMenu] ?? null}
        </div>

        {/* 하단 상태바 */}
        <div className="status-footer">
          <div className="status-left">
            <div className="status-item">
              <span className="status-item-label">시스템 상태</span>
              <div className="status-item-value">
                <span className="status-dot status-dot--on" />
                정상 작동 중
              </div>
            </div>
            <div className="status-item">
              <span className="status-item-label">활성 작업자</span>
              <span className="status-item-value">124 / 150</span>
            </div>
            <div className="status-item">
              <span className="status-item-label">창고 가동률</span>
              <span className="status-item-value">88.42% 사용 중</span>
            </div>
          </div>
          <div className="status-right">
            <span className="status-refresh-text">30초마다 데이터 갱신됨</span>
            <span className="status-ping" />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Main;
