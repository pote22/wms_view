import { request } from "../common/trasaction";
import { API_USER_ROOT } from "../common/index";

// 고객사&센터 리스트 조회 파라메터 인터페이스 선언
export interface srvcWhRequest {
    userId: string;
}

// 고객사&센터 리스트 조회 응답 인터페이스 선언
export interface srvcWhResponse {
    srvc_cd: string;
    srvc_nm: string;
    wh_cd: string;
    wh_nm: string;
    base_yn: string;
}
