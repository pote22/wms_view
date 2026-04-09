import { request } from "../common/trasaction";
import { API_USER_ROOT } from "../common/index";    

// API 요청에 필요한 인터페이스 정의
export interface LoginRequest {
    userId      : string;
    password    : string;
}

// API 응답에 필요한 인터페이스 정의
export interface LoginResponse {
    accessToken : string;
    expireDt    : string;
    userId      : string;
    userName    : string;
    authId      : string;
    status      : string;
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