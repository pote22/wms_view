import { request } from "../common/transaction";
import { API_ORDER_ROOT } from "../common/index";

// 출고 헤더
export interface OrderHdr {
    srvcCd          : string;
    whCd            : string;
    outNo           : string;   // 출고번호
    outDate         : string;   // 출고일자 (YYYYMMDD)
    outType         : string;   // 출고유형
    receiverNm      : string;   // 도착지/수령인
    totline         : number;   // 총 라인수
    totQty          : number;   // 총 출고수량
    totAmt          : number;   // 총 금액
    status          : string;   // 출고상태
    rmk             : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

// 출고 상세
export interface OrderDtl {
    srvcCd          : string;
    whCd            : string;
    outNo           : string;   // 출고번호
    outSeq          : number;   // 출고순번
    prodCd          : string;   // SKU ID (품목코드)
    prodNm          : string;   // 품명
    unitCd          : string;   // 단위
    outQty          : number;   // 출고수량
    unitPrice       : number;   // 단가
    amount          : number;   // 금액 (outQty * unitPrice)
    status          : string;   // 출고상태
    rmk             : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

// 키값(출고번호) 정보
export interface KeyInfo {
    outNo           : string | null;
    outNoSeq        : string | null;
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

// 출고조회
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_ORDER_ROOT}/0010/getList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 키값정보 조회 (출고번호 채번)
export const getKeyInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_ORDER_ROOT}/0010/getKeyInfo`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 출고저장
export const saveOrderList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_ORDER_ROOT}/0010/saveOrderList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 출고지시
export const orderInstruction = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_ORDER_ROOT}/0010/orderInstruction`, method : 'POST', data },
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
        config : { url : `${API_ORDER_ROOT}/0010/getCheckList`, method : 'POST', data },
        onSuccess,
        onError
    });
};
