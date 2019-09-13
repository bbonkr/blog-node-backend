/**
 * 유효성 검사 기능을 제공합니다.
 */
export class Validator {
    /**
     * 입력된 문자열이 전자우편주소 형식의 문자열인지 확인합니다.
     * @param text
     */
    public static email(text: string = ''): boolean {
        if (!text) {
            return false;
        }
        const t = `${text}`.toLowerCase();

        const re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const result = re.test(t);

        return result;
    }
}
