import { IDictionary } from '../typings/IDictionary';

/**
 * URL과 쿼리 정보를 사용해서 URL을 작성합니다.
 * @param {string} URL
 * @param {object} 쿼리 정보
 *
 * @returns {string} 완성된 URL
 */
export const normalizeReturnUrl = (
    pathname: string = '',
    query: IDictionary<string>,
): string => {
    let url: string = pathname;
    if (!!query) {
        url = `${url}?`;

        for (const k in query) {
            if (query.hasOwnProperty(k)) {
                url = `${url}${k}=${query[k]}&`;
            }
        }

        url = url.slice(0, -1);
    }

    return url;
};

/**
 * 문자열을 슬러그로 사용할 수 있는 문자열로 변경합니다.
 * TODO: 공백 문자만 - 문자로 변경합니다.
 * 다른 경우도 처리할 수 있게 정규식을 작성해야 합니다.
 * @param text
 */
export const makeSlug = (text: string): string => {
    if (!text) {
        return null;
    }

    const slug: string = text
        .toLowerCase()
        // .replace(/[^a-z0-9]+/g, '-')
        .replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    return slug;
};

/**
 *
 * @param num 숫자를 1,000 자리표시자를 추가해서 출력합니다.
 */
export const formatNumber = (num: number): string => {
    let tempNum = 0;
    if (typeof num === 'string') {
        tempNum = parseFloat(num);
        if (isNaN(tempNum)) {
            return '0';
        }
    } else if (typeof num === 'number') {
        tempNum = num;
    } else {
        throw new Error(
            'Reqiure number or string value. such as 1, 2, 3 or "1", "2", "3"',
        );
    }

    if (tempNum === 0) {
        return '0';
    }

    const reg = /(^[+-]?\d+)(\d{3})/;
    let n = tempNum + '';

    while (reg.test(n)) {
        n = n.replace(reg, '$1,$2');
    }

    return n;
};

/**
 * 대상 문자열에서 지정된 문자열을 찾아서 변경합니다.
 * @param fromText
 * @param toFind
 * @param thenReplace
 */
export const replaceAll = (
    fromText: string,
    toFind: string,
    thenReplace: string,
): string => {
    if (typeof fromText !== 'string') {
        throw new Error('First argument should be a string type.');
    }

    const regEx = new RegExp(toFind, 'g');

    return fromText.replace(regEx, thenReplace);
};

/**
 * 사용자 계정이름을 표준화합니다.
 * 클라이언트에서 요청할 때, @username 형식으로 전송합니다.
 * @param username
 */
export const normalizeUsername = (username: string = ''): string => {
    if (username && username.length > 1 && username.indexOf('@') >= 0) {
        return username.substring(1);
    }
    return username;
};

/**
 * 임의의 문자열을 만듭니다.
 * @param len
 */
export const randomString = (len: number = 13): string => {
    const buf: string[] = [];
    const chars: string =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charlen: number = chars.length;

    for (let i: number = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

/**
 * 임의의 숫자를 가져옵니다.
 * @param min
 * @param max
 */
export const getRandomInt = (min: number = 0, max: number = 10): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
