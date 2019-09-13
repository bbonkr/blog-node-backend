/**
 * 문자열을 숫자로 변환합니다.
 * @param s
 * @param radix
 * @param defaultValue
 */
export const tryParseInt = (
    s: string,
    radix: number = 10,
    defaultValue: number = 0,
): number => {
    if (!s) {
        return defaultValue;
    }
    try {
        return parseInt(s, radix) || defaultValue;
    } catch (e) {
        return defaultValue;
    }
};
