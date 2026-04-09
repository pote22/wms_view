const LOCAL_API_ROOT = "http://localhost:8080"; 

function resolveApiRoot() : string {
    return LOCAL_API_ROOT;
}

export const API_BASE_ROOT = resolveApiRoot();
export const API_USER_ROOT = `${API_BASE_ROOT}/api/user`;