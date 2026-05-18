import { request } from "./transaction";
import { API_USER_ROOT } from "./index";
import { API_COMMON_ROOT } from "./index";

// 사용자 권한별 고객사 센터 조회 데이터
export interface UserAuthSrvcWh {
    srvc_cd         : string;
    srvc_nm         : string;
    wh_cd           : string;
    wh_nm           : string;
    base_yn         : string;
}

// 사용자 권한별 고객사 센터 조회
export interface UserSrvcWhRequest {
    userId          : string;
}

// 사용자 권한별 고객사 센터 조회 응답
export interface UserSrvcWhResponse {
    resultCode      : string;
    resultMessage   : string;
    data            : UserAuthSrvcWh[];
}

// 공통코드
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

// 공통코드 리스트
export interface CommCodeList {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : CommCode[] | null;
}

// 품목 검색 팝업 결과
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

// 사용자 권한별 고객사 센터 조회 API 호출
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

// 공통코드 리스트 조회
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

// 품목 검색 팝업 조회
export const getProdSearchList = (
    data        : Record<string, any>,
    onSuccess   : (res: ProdSearchResponse) => void,
    onError     : (err: any) => void
) => {
    return request<any, ProdSearchResponse>({
        config: { url: `${API_COMMON_ROOT}/getProdSearchList`, method: 'POST', data },
        onSuccess,
        onError
    });
};
