declare module 'showdown-xss-filter' {
    import Showdown from 'showdown';

    function xssFilter(
        converter?: Showdown.Converter,
    ): Showdown.ShowdownExtension[];

    export default xssFilter;
}
