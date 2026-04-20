import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_ROOT } from "./index";

// 공통 응답 구조 (서버 규격에 맞춤)
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// Axios 인스턴스 생성
const transaction: AxiosInstance = axios.create({
    baseURL: API_BASE_ROOT,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 토큰 자동 첨부
transaction.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러 처리 및 데이터 가공
transaction.interceptors.response.use(
    (response: AxiosResponse) => response.data, // 필요한 데이터만 반환하도록 가공
    (error) => {
        if (error.response?.status === 401) {
            // 1. 로그인 요청 자체가 401인 경우 (비밀번호 틀림 등)
            // 백엔드에서 보낸 resultCode가 '0002'(로그인 실패)라면 그냥 에러만 반환
            if (error.response.data.resultCode === '0002') {
                return Promise.reject(error);
            }

            // 2. 로그인 이외의 요청이 401인 경우 (토큰 만료 등)
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            sessionStorage.clear();
            window.location.href = '/login';
        }
    }
);

// 공통 API 요청 함수
interface RequestParam<T, R> {
    // Axios 요청 설정
    config: AxiosRequestConfig;
    // 성공 콜백        
    onSuccess?: (data: R) => void;
    // 에러 콜백    
    onError?: (error: any) => void;
}

// API 요청 함수
export const request = async <T, R>({ config, onSuccess, onError }: RequestParam<T, R>) => {
    try {
        const response: any = await transaction(config);

        if (onSuccess) onSuccess(response);

        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

export default transaction;