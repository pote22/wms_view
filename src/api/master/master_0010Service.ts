import { request } from "../common/transaction";
import transaction from "../common/transaction";
import { API_MASTER_ROOT } from "../common/index";

export interface Vehicle {
    srvcCd: string;
    whCd: string;
    vehicleNo: string;
    drvNm: string;
    hpNo: string;
    tonClsCd: string;
    useYn: string;
    regId?: string;
    regDate?: string;
    updId?: string;
    updDate?: string;
}

export interface Response {
    resultCode: string;
    resultMessage: string;
    accessToken: string;
    expireDate: string;
    data: Vehicle[] | null;
}

// 차량조회
export const getList = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_MASTER_ROOT}/vehicle/getList`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });
}

// 차량저장
export const saveVehicle = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_MASTER_ROOT}/vehicle/saveVehicle`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });
}

// 차량삭제
export const deleteVehicle = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_MASTER_ROOT}/vehicle/removeVehicle`,
            method: 'POST',
            data
        },
        onSuccess,
        onError
    });

}