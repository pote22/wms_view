import { request } from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

// 議??곗씠???명꽣?섏씠??
export interface Zone {
    srvcCd  : string;
    whCd    : string;
    zoneCd  : string;
    zoneNm  : string;
    useYn   : string;
    regId   : string;
    regDate : string;
    updId   : string;
    updDate : string;
}

// 濡쒖??댁뀡 ?곗씠???명꽣?섏씠??
export interface Loc {
    srvcCd      : string;
    whCd        : string;
    zoneCd      : string;
    locCd       : string;
    locClsCd    : string;
    rmk         : string;
    useYn       : string;
    regId       : string;
    regDate     : string;
    updId       : string;
    updDate     : string;
}

// 怨듯넻 API ?묐떟
export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string | null;
    data            : any;
}

// ?묒??낅줈???좏슚??泥댄겕 寃곌낵
export interface CheckResult {
    rowIndex    : number;
    isValid     : boolean;
    errors      : string[];
}

export interface CheckResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : CheckResult[] | null;
}

// 議?由ъ뒪??議고쉶
export const getZoneList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/0040/getZoneList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 濡쒖??댁뀡 由ъ뒪??議고쉶
export const getLocList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/0040/getLocList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// 議?濡쒖??댁뀡 ???
export const saveInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/0040/saveInfo`, method : 'POST', data },
        onSuccess,
        onError
    });
};

// ?묒??낅줈???좏슚??泥댄겕
export const getCheckList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_MASTER_ROOT}/0040/getCheckList`, method : 'POST', data },
        onSuccess,
        onError
    });
};

