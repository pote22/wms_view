import { request } from "./trasaction";
import { API_USER_ROOT } from "./index";

// 사용자 권한별 고객사 센터 조회 데이터
export interface UserAuthSrvcWh {
    srvc_cd: string;
    srvc_nm: string;
    wh_cd: string;
    wh_nm: string;
    base_yn: string;
}

// 사용자 권한별 고객사 센터 조회
export interface UserSrvcWhRequest {
    userId: string;
}

// 사용자 권한별 고객사 센터 조회 응답
export interface UserSrvcWhResponse {
    resultCode: string;
    resultMessage: string;
    data: UserAuthSrvcWh[];
}

// 사용자 권한별 고객사 센터 조회 API 호출
export const getUserAuthSrvcWhList = (
    data: UserSrvcWhRequest,
    onSuccess: (res: UserSrvcWhResponse) => void,
    onError: (err: any) => void
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