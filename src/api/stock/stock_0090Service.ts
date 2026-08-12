import { request } from "../common/transaction";
import { API_STOCK_ROOT } from "../common/index";

// 트랜잭션현황
export interface Itrn {
    srvcCd          : string;   // 고객사코드
    whCd            : string;   // 센터코드
    itrnKey         : string;   // 트랜잭션KEY
    tranType        : string;   // 구분(입고/출고/이동)
    effectiveDate   : string;   // 작업일자
    prodCd          : string;   // 품번
    prodNm          : string;   // 품명
    lotNo           : string;   // 입고일자(로트번호)
    prodLotNo       : string;   // 생산로트(로트번호)
    fromZoneCd      : string;   // 존(이동전)
    fromLocCd       : string;   // 로케이션(이동전)
    fromId          : string;   // 바코드(이동전)
    toZoneCd        : string;   // 존(이동후)
    toLocCd         : string;   // 로케이션(이동후)
    toId            : string;   // 바코드(이동후)
    vendorCd        : string;   // 거래처코드
    vendorNm        : string;   // 거래처명
    sourceKey       : string;   // 지시번호
    qty             : string;   // 수량(재고)
    realQty         : string;   // 실수량
    tranDivision    : string;   // 증차감구분자
    regId           : string;   // 등록자
    regDate         : string;   // 등록일자
    updId           : string;   // 수정자
    updDate         : string;   // 수정일자
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string | null;
    data            : any;
}

// 트랜잭션현황 조회
export const getList = (
    data        : Record<string, any>,
    onSuccess   : (res: any) => void,
    onError     : (err: any) => void
) => {
    return request<Response>({
        config : { url : `${API_STOCK_ROOT}/0090/getList`, method : 'POST', data },
        onSuccess,
        onError
    });
}
