import { request } from "../common/trasaction";
import transaction from "../common/trasaction";
import { API_MASTER_ROOT } from "../common/index";

export interface Vehicle {
    srvcCd: string;
    whCd: string;
    vehicleNo: string;
    drvNm: string;
    hpNo: string;
    tonClsCd: string;
    useYn: string;
    regId: string;
    regDate: string;
    updId: string;
    updDate: string;
}

export interface Response {
    resultCode: string;
    resultMessage: string;
    accessToken: string;
    expireDate: string;
    data: Vehicle[] | null;
}

// 차량조회
// 차량저장
// 차량삭제