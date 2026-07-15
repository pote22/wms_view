import { request } from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

// 존 데이터 인터페이스
export interface Zone {
    srvcCd          : string;
    whCd            : string;
    zoneCd          : string;
    zoneNm          : string;
    useYn           : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
    isNew           : boolean;
    isDirty         : boolean;
    uploadStatus    : string;
}

// 로케이션 데이터 인터페이스
export interface Loc {
    srvcCd          : string;
    whCd            : string;
    zoneCd          : string;
    locCd           : string;
    locClsCd        : string;
    rmk             : string;
    useYn           : string;
    regId           : string;
    regDate         : string;
    updId           : string;
    updDate         : string;
    isNew           : boolean;
    isDirty         : boolean;
}

// 공통 API 응답
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

// 존 리스트 조회
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

// 로케이션 리스트 조회
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

// 존 로케이션 저장
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

// 엑셀업로드 유효성 체크
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

