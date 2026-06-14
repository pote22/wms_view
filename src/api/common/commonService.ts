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

// 차량 검색 팝업 결과
export interface VehicleSearch {
    vehicle_no  : string;
    drv_nm      : string;
    use_yn      : string;
}

export interface VehicleSearchResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : VehicleSearch[] | null;
}

export interface ZoneSearch {
    zone_cd : string;
    zone_nm : string;
    use_yn  : string;
}

export interface ZoneSearchResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : ZoneSearch[] | null;
}

export interface ClientSearch {
    client_cd   : string;
    client_nm   : string;
    use_yn      : string;
}

export interface ClientSearchResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : ClientSearch[] | null;
}

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
    // TODO: request 타입인자 2개 → 1개로 수정 필요 (transaction.ts의 request는 <R> 1개만 받음 / TS2558, build 시 오류) — 종합 수정 시 처리
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
    // TODO: request 타입인자 2개 → 1개로 수정 필요 (transaction.ts의 request는 <R> 1개만 받음 / TS2558, build 시 오류) — 종합 수정 시 처리
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

// 차량 검색 팝업 조회
export const getVehicleSearchList = (
    data        : Record<string, any>,
    onSuccess   : (res: VehicleSearchResponse) => void,
    onError     : (err: any) => void
) => {
    return request<VehicleSearchResponse>({
        config: { url: `${API_COMMON_ROOT}/getVehicleSearchList`, method: 'POST', data },
        onSuccess,
        onError
    });
};

// 존 검색 팝업 조회
export const getZoneSearchList = (
    data        : Record<string, any>,
    onSuccess   : (res: ZoneSearchResponse) => void,
    onError     : (err: any) => void
) => {
    return request<ZoneSearchResponse>({
        config: { url: `${API_COMMON_ROOT}/getZoneSearchList`, method: 'POST', data },
        onSuccess,
        onError
    });
};

// 거래처 검색 팝업 조회
export const getClientSearchList = (
    data        : Record<string, any>,
    onSuccess   : (res: ClientSearchResponse) => void,
    onError     : (err: any) => void
) => {
    return request<ClientSearchResponse>({
        config: { url: `${API_COMMON_ROOT}/getClientSearchList`, method: 'POST', data },
        onSuccess,
        onError
    });
};

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

export interface LocSearch {
    loc_cd  : string;
    zone_cd : string;
    use_yn  : string;
}

export interface LocSearchResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : LocSearch[] | null;
}

// 로케이션 검색 팝업 조회
export const getLocSearchList = (
    data        : Record<string, any>,
    onSuccess   : (res: LocSearchResponse) => void,
    onError     : (err: any) => void
) => {
    return request<LocSearchResponse>({
        config: { url: `${API_COMMON_ROOT}/getLocSearchList`, method: 'POST', data },
        onSuccess,
        onError
    });
};

