import showdown, { ShowdownExtension } from 'showdown';
import { EOL } from 'os';

export const showdownPrismjs = (
    converter?: showdown.Converter,
): ShowdownExtension[] => {
    let matches: string[] = [];
    const regex = /(```([a-z]+)\n([\s\S]*?)\n```)/g;
    return [
        {
            type: 'lang',
            regex: regex,
            replace: (s: string, match: string) => {
                matches.push(match);
                const placeholder = `<p>%%PRISMJS_PLACEHOLDER${matches.length -
                    1}%%</p>`;

                // console.log('s: ', s);
                // console.log('match: ', match);
                // console.log(
                //     'replace: ',
                //     match.replace(
                //         regex,
                //         '<pre class="language-$2"><code>$3</code></pre>',
                //     ),
                // );
                // console.log(` ${placeholder}: ${match}`);
                return placeholder;
                // return `@@PRISMJS_PLACEHOLDER${matches.length - 1}@@`;
                // return match.replace(
                //     regex,
                //     '<pre class="language-$2"><code>$3</code></pre>',
                // );
            },
            // filter(text, converter, options) {

            //     console.log(text);
            //     const a = text
            //         // .replace(/^```(\s*)/, '<pre class="language-$1"><code>')
            //         // .replace(/^```$/, '</code></pre>');
            //         .replace(
            //             /(```([a-z]*)\n([\s\S]*?)\n```)/g,
            //             '<pre><code class="language-$2">$3</code></pre>',
            //         );
            //     console.log(a);
            //     return a;
            // },
        },
        {
            type: 'output',
            filter: (text) => {
                // console.log('text: ', text);
                let placeholder = '';
                for (let i = 0; i < matches.length; ++i) {
                    // let pat: string = '<p>%PLACEHOLDER' + i + '%</p>';
                    placeholder = `<p>%%PRISMJS_PLACEHOLDER${i}%%</p>`;
                    text = text.replace(
                        new RegExp(placeholder, 'gi'),
                        matches[i].replace(
                            regex,
                            '<pre><code class="language-$2">$3</code></pre>',
                        ),
                    );
                }

                // reset array
                matches = [];
                return text;
            },
        },
    ];
};
