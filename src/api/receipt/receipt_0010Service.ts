import { request } from "../common/transaction";
import { API_MASTER_ROOT, API_RECEIPT_ROOT } from "../common/index";

export interface ReceiptHdr {
    srvcCd          : string;
    whCd            : string;
    inNo            : string;
    inExpectedDate  : string;
    inExpectedNo    : string;
    vendorCd        : string;
    vendorNm        : string;
    receiptClsCd    : string;
    totline         : number;
    originalQty     : number;
    status          : string;
    rmk             : string;
    receiptDate     : string;
    receiptNo       : number;
    inVNo           : string;
    inVId           : string;
    inVNm           : string;
    receiptType     : string;
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

export interface ReceiptDtl {
    srvcCd          : string;
    whCd            : string;
    inNo            : string;
    inExpectedSeq   : number;
    inExpectedDate  : string;
    inExpectedNo    : string;
    lotNo           : string;
    vendorCd        : string;
    vendorNm        : string;
    prodCd          : string;
    prodNm          : string;
    originalQty     : number;
    status          : string;
    rmk             : string;
    inZoneCd        : string;
    inZoneNm        : string;
    inLocCd         : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

export interface KeyInfo {
    inNo            : string | null;
    inNoSeq         : string | null;
    today           : string | null;
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string | null;
    data            : any;
}

// 엑셀업로드 유효성 체크 결과
export interface CheckResult {
    rowIndex        : number;
    isValid         : boolean;
    errors          : string[];
}

export interface CheckResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : CheckResult[] | null;
}

// 입고조회
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0010/getList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 키값정보 조회
export const getKeyInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0010/getKeyInfo`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 입고저장
export const saveReceiptList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0010/saveReceiptList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 엑셀업로드 유효성 검증
export const getCheckList = (
    data        : Record<string, any>,
    onSuccess   : (res: CheckResponse) => void,
    onError     : (err: any) => void
) => {
    return request<CheckResponse>({
        config : { url : `${API_RECEIPT_ROOT}/0010/getCheckList`, method : 'POST', data },
        onSuccess,
        onError
    });
};
