import { request } from "./transaction";
import { API_COMMON_ROOT } from "./index";

export interface UserLog {
    userId    : string;
    progId    : string;  // 화면ID (예: 'LOGIN', 'LOGOUT', 'STOCK-0010')
    logDtl    : string;  // 동작내용 (예: '로그인 성공', '재고조회 화면 접근')
}

interface Response {
    resultCode    : string;
    resultMessage : string;
}

/** 사용자 로그 등록 (페이지 접근 / 로그아웃) */
export const insertUserLog = (
    data: UserLog,
    onSuccess?: (res: Response) => void,
    onError?  : (err: any) => void
) => {
    return request<Response>({
        config: {
            url   : `${API_COMMON_ROOT}/insertUserLog`,
            method: 'POST',
            data,
        },
        onSuccess: onSuccess ?? (() => {}),
        onError  : onError   ?? ((err) => console.warn('로그 등록 실패 (무시):', err)),
    });
};
