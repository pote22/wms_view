import { request } from "../common/transaction";
import { API_STOCK_ROOT } from "../common/index";

// 트랜잭션현황
export interface Transaction {
    srvcCd      : string;   // 고객사코드
    whCd        : string;   // 센터코드
    txnKey      : string;   // 트랜잭션KEY
    txnTp       : string;   // 구분(입고/출고/이동)
    txnTpNm     : string;   // 구분명
    workDt      : string;   // 작업일자
    prodCd      : string;   // 품번
    prodNm      : string;   // 품명
    rcptLotNo   : string;   // 입고일자(로트번호)
    prodLotNo   : string;   // 생산로트(로트번호)
    befZoneCd   : string;   // 존(이동전)
    befLocCd    : string;   // 로케이션(이동전)
    befBarCd    : string;   // 바코드(이동전)
    aftZoneCd   : string;   // 존(이동후)
    aftLocCd    : string;   // 로케이션(이동후)
    aftBarCd    : string;   // 바코드(이동후)
    ordNo       : string;   // 지시번호
    stockQty    : string;   // 수량(재고)
    applyQty    : string;   // 재고반영(수량)
    ioGb        : string;   // 증차감구분자(I:증가, O:감소)
    regId       : string;   // 등록자
    regDate     : string;   // 등록일자
    updId       : string;   // 수정자
    updDate     : string;   // 수정일자
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
