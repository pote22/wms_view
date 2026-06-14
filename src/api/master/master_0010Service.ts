import { request } from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

export interface Vehicle {
    chk             : string;
    srvcCd          : string;
    whCd            : string;
    vehicleNo       : string;
    drvNm           : string;
    hpNo            : string;
    tonClsCd        : string;
    useYn           : string;
    regId?          : string;
    regDate?        : string;
    updId?          : string;
    updDate?        : string;
}

// 화면에서 사용하는 차량 행
export interface VehicleRow extends Vehicle {
    isNew           : boolean;          // 신규여부
    isDirty         : boolean;          // 수정여부
    uploadStatus    : string;           // 엑셀업로드 상태
}

export interface Response {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : Vehicle[] | null;
}

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

// 차량조회
export const getList = (
    data            : Record<string, any>,
    onSuccess       : (res: Response) => void,
    onError         : (err: any) => void
) => {
    return request<Response>({
        config: {
            url: `${API_MASTER_ROOT}/0010/getList`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });
}

// 차량저장
export const saveVehicle = (
    data           : Record<string, any>,
    onSuccess      : (res: Response) => void,
    onError        : (err: any) => void
) => {
    return request<Response>({
        config: {
            url: `${API_MASTER_ROOT}/0010/saveVehicle`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });
}

// 차량삭제
export const deleteVehicle = (
    data            : Record<string, any>,
    onSuccess       : (res: Response) => void,
    onError         : (err: any) => void
) => {
    return request<Response>({
        config: {
            url: `${API_MASTER_ROOT}/0010/removeVehicle`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });
}

// 엑셀 업로드 (유효체크)
export const getCheckList = (
    data        : Record<string, any>,
    onSuccess   : (res: CheckResponse) => void,
    onError     : (err: any) => void
) => {
    return request<CheckResponse>({
        config: {
            url: `${API_MASTER_ROOT}/0010/getCheckList`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });
}

