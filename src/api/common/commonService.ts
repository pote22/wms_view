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

// 차량별 톤급 리스트 조회
export interface TonCd {
    sys_cd          : string;
    sys_cdnm        : string;
}

// 차량별 톤급 리스트 조회결과
export interface TonList {
    resultCode      : string;
      resultMessage : string;
      accessToken   : string;
      expireDate    : string;
      data          : TonCd[] | null;
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

// 차랑관리 : 차량별 톤급 리스트 조회
export const getTonList = (
    onSuccess   : (res : TonList) => void,
    onError     : (res : any) => void
) => {
    return request<any, TonList>({
        config : {
            url     : `${API_COMMON_ROOT}/getTonList`,
            method  : 'POST',
        },
        onSuccess,
        onError
    });
};