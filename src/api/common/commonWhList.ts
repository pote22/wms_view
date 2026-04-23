import { create } from "zustand";

interface Srvc {
    srvcCd: string;
    srvcNm: string;
}

interface Wh {
    whCd: string;
    whNm: string;
}

interface commonWhList {
    srvcList: Srvc[];
    whList: Wh[];
    selectSrvcCd: string;
    selectWhCd: string;
    setSrvcList: (list: Srvc[]) => void;
    setWhList: (list: Wh[]) => void;
    setSelectSrvcCd: (srvcCd: string) => void;
    setSelectWhCd: (whCd: string) => void;
}

// 공통 사용 물류센터 목록
export const useCommonWhList = create<commonWhList>((set) => ({
    srvcList: [],
    whList: [],
    selectSrvcCd: "",
    selectWhCd: "",
    setSrvcList: (list) => set({ srvcList: list }),
    setWhList: (list) => set({ whList: list }),
    setSelectSrvcCd: (srvcCd) => set({ selectSrvcCd: srvcCd }),
    setSelectWhCd: (whCd) => set({ selectWhCd: whCd }),
}));