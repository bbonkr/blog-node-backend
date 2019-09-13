import showdown from 'showdown';
import xssFilter from 'showdown-xss-filter';

export const markdownConverter: showdown.Converter = new showdown.Converter({
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
    ghMentionsLink: null,
    ghCodeBlocks: true,
    smartIndentationFix: true,
    smoothLivePreview: true,
    disableForced4SpacesIndentedSublists: true,
    simpleLineBreaks: true,
    requireSpaceBeforeHeadingText: true,
    encodeEmails: true,
    extensions: [xssFilter],
});
