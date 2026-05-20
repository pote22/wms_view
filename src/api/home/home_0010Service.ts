import { request } from "../common/transaction";
import transaction from "../common/transaction";
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

// 由ъ뒪??議고쉶
export const getList = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<Response>({
        config: {
            url: `${API_HOME_ROOT}/getList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

// 怨듭??ы빆 ?뺣낫 ????섏젙
export const saveNotice = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<Response>({
        config: {
            url: `${API_HOME_ROOT}/saveList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};

// ?뚯씪 紐⑸줉 議고쉶
export const getFileList = (
    data: Record<string, any>,
    onSuccess: (res: FileResponse) => void,
    onError: (err: any) => void
) => {
    return request<FileResponse>({
        config: { url: `${API_HOME_ROOT}/getFileList`, method: 'POST', data },
        onSuccess,
        onError,
    });
};

// ?뚯씪 ?낅줈??
export const uploadFile = (
    formData: FormData,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<Response>({
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

// ?뚯씪 ?ㅼ슫濡쒕뱶
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

// ?뚯씪 ??젣
export const deleteFile = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<Response>({
        config: { url: `${API_HOME_ROOT}/deleteFile`, method: 'POST', data },
        onSuccess,
        onError,
    });
};

// 怨듭??ы빆 ?뺣낫 ??젣
export const deleteNotice = (
    data: Record<string, any>,
    onSuccess: (res: Response) => void,
    onError: (err: any) => void
) => {
    return request<Response>({
        config: {
            url: `${API_HOME_ROOT}/deleteList`,
            method: 'POST',
            data,
        },
        onSuccess,
        onError
    });
};
