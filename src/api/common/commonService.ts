import { request } from "./transaction";
import { API_USER_ROOT } from "./index";
import { API_COMMON_ROOT } from "./index";

// ?ъ슜??沅뚰븳蹂?怨좉컼???쇳꽣 議고쉶 ?곗씠??
export interface UserAuthSrvcWh {
    srvc_cd         : string;
    srvc_nm         : string;
    wh_cd           : string;
    wh_nm           : string;
    base_yn         : string;
}

// ?ъ슜??沅뚰븳蹂?怨좉컼???쇳꽣 議고쉶
export interface UserSrvcWhRequest {
    userId          : string;
}

// ?ъ슜??沅뚰븳蹂?怨좉컼???쇳꽣 議고쉶 ?묐떟
export interface UserSrvcWhResponse {
    resultCode      : string;
    resultMessage   : string;
    data            : UserAuthSrvcWh[];
}

// 怨듯넻肄붾뱶
export interface CommCode {
    sys_grp_cd  : string;
    sys_cd      : string;
    sys_cdnm    : string;
    srvc_cd     : string;
    sys_etc1    : string;
    sys_etc2    : string;
    sys_etc3    : string;
    sys_etc4    : string;
    sys_etc5    : string;
}

// 怨듯넻肄붾뱶 由ъ뒪??
export interface CommCodeList {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : CommCode[] | null;
}

// ?덈ぉ 寃???앹뾽 寃곌낵
export interface ProdSearch {
    prod_cd         : string;
    prod_nm         : string;
}

export interface ProdSearchResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : ProdSearch[] | null;
}

// ?ъ슜??沅뚰븳蹂?怨좉컼???쇳꽣 議고쉶 API ?몄텧
export const getUserAuthSrvcWhList = (
    data        : UserSrvcWhRequest,
    onSuccess   : (res: UserSrvcWhResponse) => void,
    onError     : (err: any) => void
) => {
    return request<UserSrvcWhRequest, UserSrvcWhResponse>({
        config: {
            url: `${API_USER_ROOT}/getUserAuthWhList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

// 怨듯넻肄붾뱶 由ъ뒪??議고쉶
export const getCommCodeList = (
    data        : CommCode,
    onSuccess   : (res: CommCodeList) => void,
    onError     : (err: any) => void
) => {
    return request<CommCode, CommCodeList>({
        config: {
            url     : `${API_COMMON_ROOT}/getCommonCodeList`,
            method  : 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

// ?덈ぉ 寃???앹뾽 議고쉶
export const getProdSearchList = (
    data        : Record<string, any>,
    onSuccess   : (res: ProdSearchResponse) => void,
    onError     : (err: any) => void
) => {
    return request<ProdSearchResponse>({
        config: { url: `${API_COMMON_ROOT}/getProdSearchList`, method: 'POST', data },
        onSuccess,
        onError
    });
};

