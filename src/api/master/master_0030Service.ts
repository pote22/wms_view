import { request } from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

// ?덈ぉ愿由??붿껌媛앹껜
export interface Item {
    srvcCd          : string;
    whCd            : string;
    prodCd          : string;
    prodNm          : string;
    steitemNo       : string;
    prodCategory    : string;
    prodShape       : string;
    prodType        : string;
    createTime      : string;
    useYn           : string;
    fifoYn          : string;
    price           : string;
    innerpack       : string;
    prodUnit        : string;
    weight          : string;
    realWeight      : string;
    weightUnit      : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
}

// ?덈ぉ愿由?議고쉶寃곌낵
export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : Item[] | null;
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

// ?덈ぉ議고쉶
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/part/getList`, method : 'POST', data},
        onSuccess,
        onError
    });
};

// ?덈ぉ?뺣낫 ???
export const saveProdInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/part/saveProdInfo`, method : 'POST', data},
        onSuccess,
        onError
    });
}

// ?덈ぉ?뺣낫 ??젣
export const deleteProdInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/part/removeProdInfo`, method : 'POST', data},
        onSuccess,
        onError
    });
}

// ?묒??낅줈???좏슚??泥댄겕
export const getCheckList = (
    data        : Record<string, any>,
    onSuccess   : (res: CheckResponse) => void,
    onError     : (err: any) => void
) => {
    return request<CheckResponse>({
        config : { url : `${API_MASTER_ROOT}/part/getCheckList`, method : 'POST', data},
        onSuccess,
        onError
    });
}
