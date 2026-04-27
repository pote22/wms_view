import { request } from "../common/transaction";
import { API_USER_ROOT } from "../common/index";

// API 요청에 필요한 인터페이스 정의
export interface LoginRequest {
    userId: string;
    password: string;
}

// API 응답에 필요한 인터페이스 정의
export interface LoginResponse {
    resultCode: string;
    resultMessage: string;
    accessToken: string;
    expireDate: any;
    data: {
        userId: string;
        userNm: string;
        adminYn: string;
        userSts: string;
        useYn: string;
        role: string;
        profileImgUrl?: string;
    }
}

export const loginService = (
    data: LoginRequest,
    onSuccess: (res: LoginResponse) => void,
    onError: (err: any) => void
) => {
    return request<LoginRequest, LoginResponse>({
        config: {
            url: `${API_USER_ROOT}/login`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

export default loginService;