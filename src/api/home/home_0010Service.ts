import { request } from "../common/transaction";
import transaction from "../common/transaction";
import { API_HOME_ROOT } from "../common/index";

// 공지사항
export interface Notice {
    boardId        : number;
    title          : string;
    content        : string;
    vwCnt          : number;
    boardType      : string;
    userId         : string;
    regId          : string;
    regDate        : string;
    updId          : string;
    updDate        : string;
}

// 공지사항 조회 응답
export interface Response {
    resultCode     : string;
    resultMessage  : string;
    accessToken    : string;
    expireDate     : string;
    data           : any | [];
}

export interface AttachedFile {
    id              : string;
    fileId?         : number;      // DB file_id (없으면 미업로드 대기 파일)
    name            : string;
    size            : string;
    type            : string;
    pendingFile?    : File;       // 미업로드 파일 원본 (저장 시 업로드에 사용)
}

export interface FileResponse {
    resultCode      : string;
    resultMessage   : string;
    accessToken     : string;
    expireDate      : string;
    data            : any | [];
}

// 리스트 조회
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

// 공지사항 정보 저장/수정
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

// 공지사항 정보 삭제
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

// 파일 목록 조회
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

// 파일 업로드
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

// 파일 다운로드
export const downloadFile = async (fileId: number, fileName: string): Promise<void> => {
    const blob = await transaction.get(`${API_HOME_ROOT}/downloadFile/${fileId}`, {
        responseType: 'blob',
    }) as unknown as Blob;

    const url   = window.URL.createObjectURL(blob);
    const a     = document.createElement('a');
    
    a.href      = url;
    a.download  = fileName;
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
    return request<Response>({
        config: { url: `${API_HOME_ROOT}/deleteFile`, method: 'POST', data },
        onSuccess,
        onError,
    });
};

