/**
 * 유효성 검사 기능을 제공합니다.
 */
const Validator = {
    /**
     * 입력된 문자열이 전자우편주소 형식의 문자열인지 확인합니다.
     *
     * @param {string} 유효성 검사 대상 문자열
     *
     * @returns {boolean} 유효한 전자우편주소 형식 문자열 여부
     */
    email(text = '') {
        const t = `${text}`.toLowerCase();
        var re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        const result = re.test(t);
        return result;
    },
};

export default Validator;
