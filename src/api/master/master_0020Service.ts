import { request } from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

export interface Client {
    chk             : string;
    srvcCd          : string;
    whCd            : string;
    clientCd        : string;
    clientNm        : string;
    businessNo      : string;
    bsnTypeNm       : string;
    bsnItemNm       : string;
    presidentNm     : string;
    presidentHp     : string;
    presidentEmail  : string;
    address         : string;
    nationCd        : string;
    zipCd           : string;
    telNo           : string;
    tradeType       : string;
    useYn           : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
}

export interface ClientRow extends Client {
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : Client[] | null;
}

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

// 조회
export const getList = (
    data : Record<string, any>,
    onSuccess       : (res: Response) => void,
    onError         : (err: any) => void
) => {
    return request<Response>({
        config      : { url : `${API_MASTER_ROOT}/0020/getList`, method : 'POST', data},
        onSuccess,
        onError
    });
}

// 저장
export const saveClient = (
    data            : Record<string, any>,
    onSuccess       : (res: Response) => void,
    onError         : (err: any) => void
) => {
    return request<Response>({
        config      : { url : `${API_MASTER_ROOT}/0020/saveClientInfo`, method : 'POST', data},
        onSuccess,
        onError
    });
}

// 삭제
export const deleteClient = (
    data            : Record<string, any>,
    onSuccess       : (res: Response) => void,
    onError         : (err: any) => void
) => {
    return request<Response>({
        config      : { url : `${API_MASTER_ROOT}/0020/removeClientInfo`, method : 'POST', data},
        onSuccess,
        onError
    });
}

// 엑셀업로드
export const getCheckList = (
    data            : Record<string, any>,
    onSuccess       : (res: CheckResponse) => void,
    onError         : (err: any) => void
) => {
    return request<CheckResponse>({
        config      : { url : `${API_MASTER_ROOT}/0020/getCheckList`, method : 'POST', data},
        onSuccess,
        onError
    });
}
