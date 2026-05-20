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

// ?붾㈃?먯꽌 ?ъ슜?섎뒗 李⑤웾???
export interface VehicleRow extends Vehicle {
    isNew           : boolean;          // ?좉퇋?щ?
    isDirty         : boolean;          // ?섏젙?щ?
    uploadStatus    : string;           // ?묒??낅줈???곹깭
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

// 李⑤웾議고쉶
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

// 李⑤웾???
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

// 李⑤웾??젣
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

// ?묒? ?낅줈??(?좏슚泥댄겕)
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

