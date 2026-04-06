import transaction, { request } from "../common/trasaction.ts";
import type { ApiResponse } from "../common/trasaction.ts";

// 백엔드에 보낼 데이터 형태 정의
interface LoginRequest {
    userId   : string;
    password : string;
}

// 백엔드에서 받아올 데이터 형태 정의 (data 필드 안의 구조)
interface LoginResponse {
    token  : string;
    userId : string;
    usernm : string;
}

export const login = (
    data     : LoginRequest,
    onSuccess: (data: LoginResponse) => void,
    onError  : (message: string) => void
) => {
    request<LoginResponse>(transaction.post<ApiResponse<LoginResponse>>("/api/user/login", data), onSuccess, onError);
};
