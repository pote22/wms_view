import axios from "axios";
import type { AxiosResponse } from "axios";

const transaction = axios.create({
    baseURL : "http://localhost:8080",              // 백엔드 주소
    timeout : 10000,                                // 타임아웃 : 10초 초과시 자동 실패처리
    headers : {
        "Content-Type" : "application/json"
    }
});

// 모든 백엔드 응답의 공통 구조
export interface ApiResponse<T> {
    resultcode : string;
    resultMsg  : string;
    data       : T;
}

// 공통 요청 처리 : resultcode 기반으로 성공/실패 분기
export const request = <T>(
    apiCall  : Promise<AxiosResponse<ApiResponse<T>>>,
    onSuccess: (data: T) => void,
    onError  : (message: string) => void
) => {
    apiCall
        .then(res => {
            const { resultcode, resultMsg, data } = res.data;
            if (resultcode === "00") {
                onSuccess(data);
            } else {
                onError(resultMsg);
            }
        })
        .catch(err => {
            const message: string = err?.response?.data?.resultMsg ?? "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            onError(message);
        });
};

export default transaction;