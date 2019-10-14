import marked from 'marked';

export const getMarked = () => {
    marked.setOptions({
        // langPrefix: 'language-',
        gfm: true,
        headerIds: true,
        tables: true,
        breaks: true,
        smartLists: true,
    });

    return marked;
};
