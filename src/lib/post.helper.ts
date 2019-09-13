export const EXCERPT_LENGTH: number = 200;

/**
 * html 문자열 입력에서 HTML TAG를 제거한 문자열을 가져옵니다.
 * @param html
 */
export const stripHtml = (html: string): string => {
    if (!html) {
        return null;
    }

    return html.replace(/(<([^>]+)>)/gi, '');
};

/**
 * 대상 문자열에서 발췌글을 가져옵니다.
 *
 * @param {string} 대상 문자열
 *
 * @returns {string} 지정된 길이의 발췌글
 */
export const getExcerpt = (s: string, length: number): string => {
    return s.slice(0, length);
};
