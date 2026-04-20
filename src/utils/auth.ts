// JWT 토큰에서 payload 추출
export const getTokenPayload = () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return null;

    // base64url → base64 변환 (JWT는 base64url 인코딩 사용)
    const base64 = token.split(".")[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // UTF-8 한글 깨짐 방지: atob → 바이트 배열 → decodeURIComponent
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );

    // sub → userId 별칭 추가 (프론트에서 payload.userId로 일관되게 접근)
    const raw = JSON.parse(jsonPayload);
    return { ...raw, userId: raw.sub };
}

// 토큰 만료 여부 확인
export const isAuthenticated = (): boolean => {
    // 토큰 페이로드 추출
    const payload = getTokenPayload();
    if (!payload) return false;
    // exp는 초 단위, Date.now()는 밀리초 단위이므로 변환
    return payload.exp * 1000 > Date.now();
}
