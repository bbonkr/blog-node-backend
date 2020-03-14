import { markdownConverter } from '../markdownConverter';
import { EOL } from 'os';

describe('convert markdown', () => {
    it('code block', () => {
        /*
# 샘플코드
```js
let a = 1;
```
```js
let a = 2;
```
```js
let a = 3;
```
         */
        const markdown = `# 샘플코드`;

        const html = markdownConverter().makeHtml(markdown);
        // console.log('html', html);
        expect(html).toBe(
            '<h1>샘플코드</h1>',
            // EOL +
            // '<pre><code>let a = 1;' +
            // EOL +
            // '</code></pre>' +
            // EOL +
            // '<pre><code>let a = 2;' +
            // EOL +
            // '</code></pre>' +
            // EOL +
            // '<pre><code>let a = 3;' +
            // EOL +
            // '</code></pre>',
        );
    });
});
