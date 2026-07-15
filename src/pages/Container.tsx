import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTokenPayload, isAuthenticated } from "../utils/auth";
import { getUserAuthSrvcWhList, type UserAuthCenter } from "../api/common/commonService";
import { useCommonWhList } from "../api/common/commonWhList";

import MainLayout from "../components/Layout/Layout";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { PopupProvider } from "../components/common/PopupProvider";

import MainDashboard from "./Main/Main";
import CJ_WMS_HOME_0010 from "./Home/cj_wms_home_0010";
import CJ_WMS_MASTER_0010 from "./Master/cj_wms_master_0010";
import CJ_WMS_MASTER_0020 from "./Master/cj_wms_master_0020";
import CJ_WMS_MASTER_0030 from "./Master/cj_wms_master_0030";
import CJ_WMS_MASTER_0040 from "./Master/cj_wms_master_0040";
import CJ_WMS_RECEIPT_0010 from "./Receipt/cj_wms_receipt_0010";
import CJ_WMS_RECEIPT_0020 from "./Receipt/cj_wms_receipt_0020";
import CJ_WMS_ORDER_0010 from "./Orders/cj_wms_orders_0010";
import CJ_WMS_ORDER_0020 from "./Orders/cj_wms_orders_0020";
import CJ_WMS_ORDER_0030 from "./Orders/cj_wms_orders_0030";
import CJ_WMS_ORDER_0040 from "./Orders/cj_wms_orders_0040";
import CJ_WMS_STOCK_0010 from "./Stock/cj_wms_stock_0010";
import CJ_WMS_STOCK_0090 from "./Stock/cj_wms_stock_0090";
import CJ_WMS_COMM_0010 from "./Common/cj_wms_comm_0010";
import CJ_WMS_COMM_0020 from "./Common/cj_wms_comm_0020";

const PAGE_MAP: Record<string, React.ReactNode> = {
  notice              : <CJ_WMS_HOME_0010 />    ,
  car                 : <CJ_WMS_MASTER_0010 />  ,
  customer            : <CJ_WMS_MASTER_0020 />  ,
  items               : <CJ_WMS_MASTER_0030 />  ,
  zone                : <CJ_WMS_MASTER_0040 />  ,
  "receipt-register"  : <CJ_WMS_RECEIPT_0010 /> ,
  "receipt-confirm"   : <CJ_WMS_RECEIPT_0020 /> ,
  "order-register"    : <CJ_WMS_ORDER_0010 />   ,
  "order-allocate"    : <CJ_WMS_ORDER_0020 />   ,
  "order-pick"        : <CJ_WMS_ORDER_0030 />   ,
  "order-pack"        : <CJ_WMS_ORDER_0040 />   ,
  "stock-list"        : <CJ_WMS_STOCK_0010 />   ,
  transaction         : <CJ_WMS_STOCK_0090 />   ,
  warehouse           : <CJ_WMS_COMM_0010 />    ,
  "user-manage"       : <CJ_WMS_COMM_0020 />    ,
};

const MENU_TO_TAB: Record<string, "home" | "storage" | "common"> = {
  notice: "home",
  car: "storage",
  customer: "storage",
  items: "storage",
  zone: "storage",
  "receipt-register": "storage",
  "receipt-confirm": "storage",
  "order-register": "storage",
  "order-allocate": "storage",
  "order-pick": "storage",
  "order-pack": "storage",
  "stock-list": "storage",
  transaction: "storage",
  warehouse: "common",
  "user-manage": "common",
};

const HOME_MENUS = [
  { group: "홈", items: [{ icon: "notifications", label: "공지사항", key: "notice" }] },
];

const STORAGE_MENUS = [
  {
    group: "마스터 관리",
    items: [
      { icon: "directions_car", label: "차량관리",          key: "car"      },
      { icon: "recent_patient", label: "거래처관리",        key: "customer" },
      { icon: "brick",          label: "품번관리",          key: "items"    },
      { icon: "location_on",    label: "존&로케이션관리",   key: "zone"     },
    ],
  },
  {
    group: "입고관리",
    items: [
      { icon: "list_alt",       label: "입고등록",          key: "receipt-register"   },
      { icon: "receipt",        label: "입고예정&확정",     key: "receipt-confirm"    },
    ],
  },
  {
    group: "출고관리",
    items: [
      { icon: "list_alt",       label: "출고등록",          key: "order-register" },
      { icon: "select",         label: "출고/할당 관리",    key: "order-allocate" },
      { icon: "table_eye",      label: "피킹관리",          key: "order-pick" },
      { icon: "package",        label: "출고관리",          key: "order-pack" },
    ],
  },
  {
    group: "재고관리",
    items: [
      { icon: "inventory",      label: "재고현황",          key: "stock-list" },
      { icon: "contract",       label: "트랜잭션관리",      key: "transaction" },
    ],
  },
];

const COMMON_MENUS = [
  {
    group: "사용자관리",
    items: [
      { icon: "warehouse",      label: "센터고객관리",      key: "warehouse" },
      { icon: "person",         label: "회원관리",          key: "user-manage" },
    ],
  },
];

const Container: React.FC = () => {
  const navigate                              = useNavigate();
  const savedMenu                             = sessionStorage.getItem("activeSideMenu") ?? "";
  const payload                               = getTokenPayload();

  const redirectIfExpired = () => {
    if (!isAuthenticated()) {
      sessionStorage.clear();
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  };

  const STORAGE_KEY_SRVC_CD = `wms_srvc_cd_${payload?.userId}`;
  const STORAGE_KEY_WH_CD = `wms_wh_cd_${payload?.userId}`;

  const [activeMainTab,   setActiveMainTab]   = useState<"home" | "storage" | "common">((MENU_TO_TAB[savedMenu] ?? "home") as "home" | "storage" | "common");
  const [activeSideMenu,  setActiveSideMenu]  = useState<string>(savedMenu);
  const [authList,        setAuthList]        = useState<UserAuthCenter[]>([]);
  const { selectSrvcCd, selectWhCd, srvcList, whList, setSelectSrvcCd, setSelectWhCd, setSrvcList, setWhList } = useCommonWhList();

  useEffect(() => {
    if (redirectIfExpired()) return;
    if (!payload) return;

    // 사용자 
    getUserAuthSrvcWhList(
      { userId: payload.userId },
      (res) => {
        const resultCode = res?.resultCode ?? "";

        if (resultCode !== "0000") {
          console.error("고객사/센터 목록 조회 실패", res?.resultMessage ?? "Unknown error");
          setAuthList([]);
          setSrvcList([]);
          setWhList([]);
          setSelectSrvcCd('');
          setSelectWhCd('');
          return;
        }

        const list : UserAuthCenter[] = (res.data ?? []).map((v: any) => ({
          srvcCd : v.srvc_cd,
          srvcNm : v.srvc_nm,
          whCd   : v.wh_cd,
          whNm   : v.wh_nm,
          baseYn : v.base_yn
        }));
        
        setAuthList(list);

        const savedSrvcCd = localStorage.getItem(STORAGE_KEY_SRVC_CD);
        const savedWhCd   = localStorage.getItem(STORAGE_KEY_WH_CD);
        const base        = list.find((item) => item.baseYn === "Y") ?? list[0];
        const srvcCd      = savedSrvcCd ?? base?.srvcCd ?? "";
        const whCd        = savedWhCd ?? base?.whCd ?? "";
        const srvcList    = list.filter((v, i, arr) => arr.findIndex((a) => a.srvcCd === v.srvcCd) === i)
                            .map((v) => ({ srvcCd: v.srvcCd, srvcNm: v.srvcNm }));
        const whList      = list.filter((v, i, arr) => arr.findIndex((a) => a.whCd === v.whCd) === i)
                            .map((v) => ({ whCd: v.whCd, whNm: v.whNm }));

        // 리스트 저장
        setSrvcList(srvcList);
        setWhList(whList);
        setSelectSrvcCd(srvcCd);
        setSelectWhCd(whCd);
      },
      (err) => console.error("고객사/센터 목록 조회 실패", err)
    );
  }, []);

  const currentMenus = (activeMainTab === "home") ? HOME_MENUS : (activeMainTab === "storage") ? STORAGE_MENUS : COMMON_MENUS;

  const handleLogoClick = () => {
    setActiveMainTab("home");
    setActiveSideMenu("");
    sessionStorage.removeItem("activeSideMenu");
  };

  const handleMenuClick = (menu: string) => {
    if (redirectIfExpired()) return;
    setActiveSideMenu(menu);
    sessionStorage.setItem("activeSideMenu", menu);
  };

  const handleSrvcCdChange = (srvcCd: string) => {
    setSelectSrvcCd(srvcCd);
    localStorage.setItem(STORAGE_KEY_SRVC_CD, srvcCd);

    const firstWh = authList.find((v) => v.srvcCd === srvcCd);
    const whCd    = firstWh?.whCd ?? "";
    
    setSelectWhCd(whCd);
    localStorage.setItem(STORAGE_KEY_WH_CD, whCd);
    
    const whList = authList.filter((v) => v.srvcCd == srvcCd).map((v) => ({ 
      whCd: v.whCd, 
      whNm: v.whNm 
    }));

    setWhList(whList);
  };

  const handleWhCdChange = (whCd: string) => {
    setSelectWhCd(whCd);
    localStorage.setItem(STORAGE_KEY_WH_CD, whCd);
  };

  const srvcCdList = authList.filter((v, i, arr) => arr.findIndex((a) => a.srvcCd === v.srvcCd) === i).map((v) => ({ 
    srvcCd: v.srvcCd, 
    srvcNm: v.srvcNm 
  }));

  const whCdList = authList.filter((v) => v.srvcCd === selectSrvcCd).map((v) => ({ 
    whCd: v.whCd, 
    whNm: v.whNm 
  }));

  return (
    <PopupProvider srvcCd={selectSrvcCd} whCd={selectWhCd}>
      <MainLayout
        sidebar={
          <Sidebar
            menus={currentMenus}
            activeSideMenu={activeSideMenu}
            onMenuClick={handleMenuClick}
            onLogoClick={handleLogoClick}
          />
        }
        header={
          <Header
            selectSrvcCd={selectSrvcCd}
            selectWhCd={selectWhCd}
            activeMainTab={activeMainTab}
            srvcCdList={srvcCdList}
            whCdList={whCdList}
            onSrvcCdChange={handleSrvcCdChange}
            onWhCdChange={handleWhCdChange}
            onTabChange={(tab) => {
              if (redirectIfExpired()) return;
              setActiveMainTab(tab);
              setActiveSideMenu("");
              sessionStorage.removeItem("activeSideMenu");
            }}
          />
        }
      >
        {activeSideMenu === "" ? <MainDashboard /> : (PAGE_MAP[activeSideMenu] ?? null)}
      </MainLayout>
    </PopupProvider>
  );
};

export default Container;
