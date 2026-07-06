import { request } from "../common/transaction";
import { API_USER_ROOT } from "../common/index";

// API 요청에 필요한 인터페이스 정의
export interface Login {
    userId      : string;
    password    : string;
}

// API 응답에 필요한 인터페이스 정의
export interface Response {
    resultCode: string;
    resultMessage: string;
    accessToken: string;
    expireDate: string | null;
    data: any;
}

export const loginService = (
    data: Login,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<Response>({
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