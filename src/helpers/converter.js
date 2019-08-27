import showdown from 'showdown';
import xssFilter from 'showdown-xss-filter';

export const markdownConverter = () => {
    const convert = showdown.Converter({ extensions: [xssFilter] });
    return convert;
};
