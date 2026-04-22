import { request } from "../common/trasaction";
import { API_HOME_ROOT } from "../common/index";

export interface Notice {
    board_id: number;
    title: string;
    content: string;
    vw_cnt: number;
    board_type: string;
    user_id: string;
    reg_id: string;
    reg_date: string;
    upd_id: string;
    upd_date: string;
}

export interface Response {
    resultCode: string;
    resultMessage: string;
    data: Notice[] | null;
}

// 리스트 조회
export const getList = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_HOME_ROOT}/getList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

// 공지사항 정보 저장&수정
export const saveNotice = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_HOME_ROOT}/saveList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

// 공지사항 정보 삭제
export const deleteNotice = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_HOME_ROOT}/deleteList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};