declare module 'showdown-highlight' {
    import Showdown from 'showdown';

    function xssFilter(
        converter?: Showdown.Converter,
    ): Showdown.ShowdownExtension[];

    export default xssFilter;
}
