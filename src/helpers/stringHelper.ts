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

export const makeSlug = (text: string): string => {
    if (!text) {
        return null;
    }

    return text.replace(/\s+/g, '-').toLowerCase();
};

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

export const normalizeUsername = (username: string = ''): string => {
    if (username && username.length > 1 && username.indexOf('@') >= 0) {
        return username.substring(1);
    }
    return username;
};
