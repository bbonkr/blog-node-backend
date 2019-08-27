const db = require('../models');
const showdown = require('showdown');
const xssFilter = require('showdown-xss-filter');

const defaultUserAttributes = [
    'id',
    'email',
    'username',
    'displayName',
    'photo',
    'isEmailConfirmed',
];

module.exports.defaultUserAttributes = defaultUserAttributes;
/**
 * 사용자 정보를 조회합니다.
 */
module.exports.findUserById = async id => {
    const me = await db.User.findOne({
        where: {
            id: id,
        },
        include: [
            {
                model: db.Post,
                attributes: ['id'],
            },
        ],
        attributes: defaultUserAttributes,
    });

    return me;
};

/**
 * 입력된 사용자 이름의 값을 정리합니다.
 *
 * @param {string} username 시작문자가 포함된 사용자 이름 문자열
 * @returns {string} 시작문자가 제거된 사용자이름 문자열
 */
module.exports.normalizeUsername = (username = '') => {
    if (username && username.length > 1 && username.indexOf('@') >= 0) {
        return username.substring(1);
    }
    return username;
};

/**
 * 문자열 형식을 숫자형식으로 변환합니다.
 * @param {string} s 대상 문자열
 * @param {number} radix기수
 * @param {number} defualtValue 기본값; 문자열을 숫자로 변환할 수 없는 경우 사용되는 값
 *
 * @returns {number} 변환된 값
 */
module.exports.tryParseInt = (s, radix = 10, defaultValue = 0) => {
    try {
        return parseInt(s, radix) || defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

module.exports.markdownConverter = new showdown.Converter(
    {
        omitExtraWLInCodeBlocks: false,
        noHeaderId: false,
        ghCompatibleHeaderId: true,
        prefixHeaderId: true,
        headerLevelStart: 1,
        parseImgDimensions: true,
        simplifiedAutoLink: true,
        excludeTrailingPunctuationFromURLs: true,
        literalMidWordUnderscores: true,
        strikethrough: true,
        tables: true,
        tasklists: true,
        ghMentions: false,
        ghMentionsLink: false,
        ghCodeBlocks: true,
        smartIndentationFix: true,
        smoothLivePreview: true,
        disableForced4SpacesIndentedSublists: true,
        simpleLineBreaks: true,
        requireSpaceBeforeHeadingText: true,
        encodeEmails: true,
    },
    {
        extensions: [xssFilter],
    },
);

/**
 * html 문자열 입력에서 HTML TAG를 제거한 문자열을 가져옵니다.
 * @param {string} html 대상 html 문자열
 *
 * @returns {string} text HTML TAG 가 제거된 문자열
 */
module.exports.stripHtml = html => {
    return html.replace(/(<([^>]+)>)/gi, '');
};

/**
 * 발췌글의 길이
 */
module.exports.EXCERPT_LENGTH = 200;

/**
 * 대상 문자열에서 발췌글을 가져옵니다.
 *
 * @param {string} 대상 문자열
 *
 * @returns {string} 지정된 길이의 발췌글
 */
module.exports.getExcerpt = s => {
    return s.slice(0, this.EXCERPT_LENGTH);
};
