import showdown from 'showdown';
import xssFilter from 'showdown-xss-filter';
import highlight from 'showdown-highlight';
import Showdown from 'showdown';
import { showdownPrismjs } from './showdown-prismjs';

export const markdownConverter = (): showdown.Converter => {
    // TODO 동작 확인
    // showdown-xss-filter.d.ts 작성

    const options: Showdown.ConverterOptions = {
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
        encodeEmails: false,
        extensions: [
            xssFilter,
            //    showdownPrismjs
        ],
    };

    // const converter: showdown.Converter = new showdown.Converter({
    //     omitExtraWLInCodeBlocks: false,
    //     noHeaderId: false,
    //     ghCompatibleHeaderId: true,
    //     prefixHeaderId: true,
    //     headerLevelStart: 1,
    //     parseImgDimensions: true,
    //     simplifiedAutoLink: true,
    //     excludeTrailingPunctuationFromURLs: true,
    //     literalMidWordUnderscores: true,
    //     strikethrough: true,
    //     tables: true,
    //     tasklists: true,
    //     ghMentions: false,
    //     ghMentionsLink: null,
    //     ghCodeBlocks: true,
    //     smartIndentationFix: true,
    //     smoothLivePreview: true,
    //     disableForced4SpacesIndentedSublists: true,
    //     simpleLineBreaks: true,
    //     requireSpaceBeforeHeadingText: true,
    //     encodeEmails: true,
    //     extensions: [xssFilter],
    // });

    const converter: showdown.Converter = new showdown.Converter(options);
    // converter.setFlavor('github');

    return converter;
};
