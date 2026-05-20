import { request } from "../common/transaction";
import { API_MASTER_ROOT, API_RECEIPT_ROOT } from "../common/index";

export interface ReceiptH {
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
}

export interface ReceiptD {
    srvcCd          : string;
    whCd            : string;
    inNo            : string;
    inExpectedSeq   : number;
    inExpectedDate  : string;
    inExpectedNo    : string;
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
}

export interface ReceiptHdrRow extends ReceiptH {
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

export interface ReceiptDtlRow extends ReceiptD {
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

export interface RcptKeyInfo {
    inNoSeq         : string;
    today           : string;
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string | null;
    data            : any;
}

// ?묒??낅줈???좏슚??泥댄겕 寃곌낵
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

// ?낃퀬議고쉶
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

// ?ㅺ컪?뺣낫 議고쉶
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

// ?낃퀬???
export const saveReceipt = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_RECEIPT_ROOT}/0010/saveReceipt`, method : 'POST', data },
        onSuccess,
        onError
    });
};

