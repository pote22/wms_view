const LOCAL_API_ROOT = "http://localhost:8080";

function resolveApiRoot(): string {
    return LOCAL_API_ROOT;
}

export const API_BASE_ROOT = resolveApiRoot();
export const API_USER_ROOT = `${API_BASE_ROOT}/api/user`;
export const API_HOME_ROOT = `${API_BASE_ROOT}/api/home`;
export const API_COMMON_ROOT = `${API_BASE_ROOT}/api/common`;
export const API_MASTER_ROOT = `${API_BASE_ROOT}/api/master`;
export const API_ORDER_ROOT = `${API_BASE_ROOT}/api/order`;
export const API_RECEIPT_ROOT = `${API_BASE_ROOT}/api/receipt`;
export const API_STOCK_ROOT = `${API_BASE_ROOT}/api/stock`;