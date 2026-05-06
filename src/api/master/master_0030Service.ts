import { request } from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

// 품목관리 요청객체
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

// 품목관리 조회결과
export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : Item[] | null;
}

// 품목조회
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<any, Response>({
        config : { url : `${API_MASTER_ROOT}/part/getList`, method : 'POST', data},
        onSuccess,
        onError
    });
};

// 품목정보 저장
export const saveProdInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<any, Response>({
        config : { url : `${API_MASTER_ROOT}/part/saveProdInfo`, method : 'POST', data},
        onSuccess,
        onError
    });
}

// 품목정보 삭제
export const deleteProdInfo = (
    data        : Record<string, any>,
    onSuccess   : (res: Response) => void,
    onError     : (err: any) => void
) => {
    return request<any, Response>({
        config : { url : `${API_MASTER_ROOT}/part/removeProdInfo`, method : 'POST', data},
        onSuccess,
        onError
    });
}