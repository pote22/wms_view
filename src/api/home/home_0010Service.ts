import { request } from "../common/trasaction";
import transaction from "../common/trasaction";
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

export interface AttachedFile {
    file_id: number;
    board_id: number;
    file_nm: string;
    file_size: string;
    file_path: string;
}

export interface FileResponse {
    resultCode: string;
    resultMessage: string;
    data: AttachedFile[] | null;
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

// 파일 목록 조회
export const getFileList = (
    data: Record<string, any>,
    onSuccess: (res: FileResponse) => void,
    onError: (err: any) => void
) => {
    return request<any, FileResponse>({
        config: { url: `${API_HOME_ROOT}/getFileList`, method: 'POST', data },
        onSuccess,
        onError,
    });
};

// 파일 업로드
export const uploadFile = (
    formData: FormData,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: {
            url: `${API_HOME_ROOT}/uploadFile`,
            method: 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        },
        onSuccess,
        onError,
    });
};

// 파일 다운로드
export const downloadFile = async (fileId: number, fileName: string): Promise<void> => {
    const blob = await transaction.get(`${API_HOME_ROOT}/downloadFile/${fileId}`, {
        responseType: 'blob',
    }) as unknown as Blob;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

// 파일 삭제
export const deleteFile = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<any, Response>({
        config: { url: `${API_HOME_ROOT}/deleteFile`, method: 'POST', data },
        onSuccess,
        onError,
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