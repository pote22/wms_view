// Date → 날짜 문자열 (separator 없으면 "YYYYMMDD", 있으면 "YYYY{sep}MM{sep}DD")
export const formatDate = (date: Date, separator?: string): string => {
    const yyyy = date.getFullYear();
    const mm   = String(date.getMonth() + 1).padStart(2, '0');
    const dd   = String(date.getDate()).padStart(2, '0');
    return separator ? `${yyyy}${separator}${mm}${separator}${dd}` : `${yyyy}${mm}${dd}`;
};

// 오늘 날짜를 날짜 문자열로 반환
export const getToday = (separator?: string): string => formatDate(new Date(), separator);
