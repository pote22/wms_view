import { request } from "../common/transaction";
import { API_MASTER_ROOT, API_RECEIPT_ROOT } from "../common/index";

export interface ReceiptRow {
    chk             : string;
    srvcCd          : string;
    whCd            : string;
    inNo            : string;
    inExpectedDate  : string;
    inExpectedNo    : string;
    inExpectedSeq   : string;
    totalStatus     : string;
    status          : string;
    receiptClsCd    : string;
    receiptType     : string;
    receiptDate     : string;
    vendorCd        : string;
    vendorNm        : string;
    prodCd          : string;
    prodNm          : string;
    inZoneCd        : string;
    inZoneNm        : string;
    inLocCd         : string;
    originalQty     : string;
    expectedQty     : string;
    receivedQty     : string;
    totInWeight     : string;
    pdaScanQty      : string;
    pdaScanCnt      : string;
    notRsnCd        : string;
    vendorAddress   : string;
    zipCd           : string;
    managerNm       : string;
    telNo           : string;
    inVNo           : string;
    inVNm           : string;
    pdaYn           : string;
    rmk             : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string | null;
    data            : any;
}

// 리스트 조회
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0020/getList`, method : 'POST', data },
        onSuccess,
        onError
    });
}

// 입고확정
export const saveReceiptConfirm = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0020/saveReceiptConfirm`, method : 'POST', data },
        onSuccess,
        onError
    });
}

// 비고저장
export const saveRemarkInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0020/saveRemarkInfo`, method : 'POST', data },
        onSuccess,
        onError
    });
}