import showdown from 'showdown';
import xssFilter from 'showdown-xss-filter';

export const markdownConverter = () => {
    // TODO 동작 확인
    // showdown-xss-filter.d.ts 작성
    const convert = new showdown.Converter({ extensions: [xssFilter] });
    return convert;
};
