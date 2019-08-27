/**
 * URL과 쿼리 정보를 사용해서 URL을 작성합니다.
 * @param {string} URL
 * @param {object} 쿼리 정보
 *
 * @returns {string} 완성된 URL
 */
module.exports.normalizeReturnUrl = (pathname = '', query = {}) => {
    let url = pathname;
    if (!!query) {
        url = `${url}?`;
        for (let k in query) {
            url = `${url}${k}=${query[k]}&`;
        }
        url = url.slice(0, -1);
    }

    return url;
};

module.exports.makeSlug = text => {
    if (!text) {
        return null;
    }

    return text.replace(/\s+/g, '-').toLowerCase();
};

module.exports.formatNumber = num => {
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

    if (tempNum === 0) return '0';

    let reg = /(^[+-]?\d+)(\d{3})/;
    let n = tempNum + '';

    while (reg.test(n)) {
        n = n.replace(reg, '$1,$2');
    }

    return n;
};

module.exports.replaceAll = (fromText, toFind, thenReplace) => {
    if (typeof fromText !== 'string') {
        throw new Error('First argument should be a string type.');
    }

    const regEx = new RegExp(toFind, 'g');

    return fromText.replace(regEx, thenReplace);
};

// (function(exports) {
//     /**
//      * URL과 쿼리 정보를 사용해서 URL을 작성합니다.
//      * @param {string} URL
//      * @param {object} 쿼리 정보
//      *
//      * @returns {string} 완성된 URL
//      */
//     exports.normalizeReturnUrl = (pathname = '', query = {}) => {
//         let url = pathname;
//         if (!!query) {
//             url = `${url}?`;
//             for (let k in query) {
//                 url = `${url}${k}=${query[k]}&`;
//             }
//             url = url.slice(0, -1);
//         }

//         return url;
//     };

//     exports.makeSlug = text => {
//         if (!text) {
//             return null;
//         }

//         return text.replace(/\s+/g, '-').toLowerCase();
//     };

//     exports.formatNumber = num => {
//         let tempNum = 0;
//         if (typeof num === 'string') {
//             tempNum = parseFloat(num);
//             if (isNaN(tempNum)) {
//                 return '0';
//             }
//         }

//         if (tempNum === 0) return '0';

//         var reg = /(^[+-]?\d+)(\d{3})/;
//         var n = tempNum + '';

//         while (reg.test(n)) n = n.replace(reg, '$1,$2');

//         return n;
//     };
// })(typeof exports === 'undefined' ? (this['stringHelper'] = {}) : exports);
