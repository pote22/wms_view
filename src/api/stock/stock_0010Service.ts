import { request } from "../common/transaction";
import { API_STOCK_ROOT } from "../common/index";

export interface Stock { 
    srvcCd      : string;
    whCd        : string;
    prodCd      : string;
    prodNm      : string;
    zoneCd      : string;
    zoneNm      : string;
    locCd       : string;
    stockQty    : string;
    allocQty    : string;
    pickQty     : string;
    avlQty      : string;
    lotNo       : string;
    id          : string;
    aging       : string;
    prodSpec    : string;
    rmk         : string;
    regId       : string;
    regDate     : string;
    updId       : string;
    updDate     : string;
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string | null;
    data            : any;
}


// 재고현황 조회
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: any) => void,
    onError     : (err: any) => void       
) => {
    return request<Response>({
        config : { url : `${API_STOCK_ROOT}/0010/getList`, method : 'POST', data },
        onSuccess,
        onError
    });
}