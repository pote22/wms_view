import { useState } from "react";
import "../css/Main/main.css";

import MainLayout from "../components/Layout/Layout";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

import MainDashboard from "./Main/Main"; // 통합 메인 컨텐츠
import CjWmsHome0020 from "./Home/cj_wms_home_0020";
import CjWmsHome0050 from "./Home/cj_wms_home_0050";
import CjWmsReceipt0010 from "./Receipt/cj_wms_receipt_0010";
import CjWmsReceipt0020 from "./Receipt/cj_wms_receipt_0020";
import CjWmsOrder0010 from "./Order/cj_wms_order_0010";
import CjWmsOrder0020 from "./Order/cj_wms_order_0020";
import CjWmsComm0010 from "./Common/cj_wms_comm_0010";
import CjWmsComm0020 from "./Common/cj_wms_comm_0020";

/* ── 설정 데이터 ── */
const PAGE_MAP: Record<string, React.ReactNode> = {
  "notice": <MainDashboard />, // 공지사항도 이제 메인 대시보드로 연결하거나 추후 전용 페이지로 교체 가능
  "items": <CjWmsHome0020 />,
  "zone": <CjWmsHome0050 />,
  "inbound-register": <CjWmsReceipt0010 />,
  "inbound-schedule": <CjWmsReceipt0020 />,
  "outbound-register": <CjWmsOrder0010 />,
  "outbound-assign": <CjWmsOrder0020 />,
  "center-customer": <CjWmsComm0010 />,
  "user-manage": <CjWmsComm0020 />,
};

const CUSTOMERS = ["GS칼텍스", "CJ대한통운", "삼성전자", "LG화학"];
const CENTERS = ["인천GSC센터", "부산센터", "대전센터", "광주센터"];

const HOME_MENUS = [
  { group: "홈", items: [{ icon: "notifications", label: "공지사항", key: "notice" }] },
];

const STORAGE_MENUS = [
  {
    group: "마스터 관리", items: [
      { icon: "inventory_2", label: "품번관리", key: "items" },
      { icon: "location_on", label: "존&로케이션관리", key: "zone" },
    ]
  },
  {
    group: "입고관리", items: [
      { icon: "download", label: "입고등록", key: "inbound-register" },
      { icon: "pending_actions", label: "입고예정&확정", key: "inbound-schedule" },
    ]
  },
  {
    group: "출고관리", items: [
      { icon: "upload", label: "출고등록", key: "outbound-register" },
      { icon: "assignment", label: "출고/할당 관리", key: "outbound-assign" },
    ]
  },
];

const COMMON_MENUS = [
  {
    group: "사용자관리", items: [
      { icon: "manage_accounts", label: "센터고객관리", key: "center-customer" },
      { icon: "person", label: "회원관리", key: "user-manage" },
    ]
  },
];

const Container: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<"home" | "storage" | "common">("home");
  const [activeSideMenu, setActiveSideMenu] = useState<string>(""); // 초기값은 비움 (메인 대시보드 노출용)
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS[0]);
  const [selectedCenter, setSelectedCenter] = useState(CENTERS[0]);

  // 활성화된 탭에 따른 메뉴 결정
  const currentMenus = activeMainTab === "home" ? HOME_MENUS
    : activeMainTab === "storage" ? STORAGE_MENUS
      : COMMON_MENUS;

  // 로고 클릭 핸들러: 홈 탭으로 복귀 및 메뉴 선택 해제 (대시보드 노출)
  const handleLogoClick = () => {
    setActiveMainTab("home");
    setActiveSideMenu("");
  };

  return (
    <MainLayout
      /* 사이드바 조립 */
      sidebar={
        <Sidebar
          menus={currentMenus}
          activeSideMenu={activeSideMenu}
          onMenuClick={setActiveSideMenu}
          onLogoClick={handleLogoClick}
        />
      }
      /* 헤더 조립 */
      header={
        <Header
          selectedCustomer={selectedCustomer}
          selectedCenter={selectedCenter}
          activeMainTab={activeMainTab}
          customers={CUSTOMERS}
          centers={CENTERS}
          onCustomerChange={setSelectedCustomer}
          onCenterChange={setSelectedCenter}
          onTabChange={(tab) => {
            setActiveMainTab(tab);
          }}
        />
      }
    >
      {/* 본문(Content) 영역: activeSideMenu가 비어있으면 메인 대시보드(MainDashboard) 노출 */}
      {activeSideMenu === "" ? (
        <MainDashboard />
      ) : (
        PAGE_MAP[activeSideMenu] ?? null
      )}
    </MainLayout>
  );
};

export default Container;
