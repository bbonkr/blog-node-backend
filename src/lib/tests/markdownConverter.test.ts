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
        const markdown = `
           자바스크립트 <small>Javascript</small>로 작성되어 노드<small>node</small>로 동작하는 웹 응용프로그램을 타입스크립트 <small>Typescript</small>로 재작성하고 있습니다.

           npm 패키지 중 모듈 정의가 없는 패키지가 있습니다.

           타입스크립트 코드를 작성할 때, 정상적으로 사용할 수가 없습니다.



           이 때, 패키지 제작자에게 모듈 정의 파일을 요청하거나, 작성중인 프로젝트에 모듈 정의 파일  \`.d.ts\` 파일을 작성해서 문제를 해결할 수 있습니다.



           ## 예제

           예를 들어 [showdown-xss-filter](https://www.npmjs.com/package/showdown-xss-filter) 패키지를 사용중인 코드가 있습니다.

           \`\`\`js
           const xssFilter = require('showdown-xss-filter');
           \`\`\`

           타입스크립트로 작성중인 코드에서 모듈의 정의를 찾을 수 없다고 합니다.

           \`\`\`typescript
           import xssFilter from 'showdown-xss-filter';
           \`\`\`

           > 에러 메시지:
           >
           > Could not find a declaration file for module 'showdown-xss-filter'. 'd:/repos/blog-node-backend/node_modules/showdown-xss-filter/showdown-xss-filter.js' implicitly has an 'any' type.\n Try
           \`npm install @types/showdown-xss-filter\` if it exists or add a new declaration (.d.ts) file containing \`declare module 'showdown-xss-filter';

           타입스크립트 컴파일러의 제안을 참고해서 [@types/showdown-xss-filter 패키지는 검색](https://www.npmjs.com/search?q=%40types%2Fshowdown-xss-filter)해도 결과가 없습니다.

           첫번째 제안으로 해결되지 않으니, 두번째로 제안하는 \`declare module 'showdown-xss-filter'\`  코드를 포함하는 새 정의 파일을 만들어야 합니다.



           함수의 모양을 확인하기 위해 코드를 보니, [showdown-xss-filter](https://www.npmjs.com/package/showdown-xss-filter) 패키지의 내용은 매우 간략한 [코드](https://github.com/VisionistInc/showdown-xss-filter/blob/e26046384e266be5646ef0eb58816ff4029da565/showdown-xss-filter.js#L15)로 작성되어 있습니다.

           필요한 것은 \`xssfilter\` 함수의 정의 \`식별자 Identifier\`, \`인수들 Arguments\`, \`반환형 Return type\` 입니다.



           코드를 확인하고, 아래와 같이 모듈을 정의할 수 있습니다.

           > 다행히 showdonw은 모듈 정의가 존재합니다. ❤

           \`\`\`bash
           $ npm install --save-dev @types/showdown
           \`\`\`




           \`\`\`typescript
           // @types/showdown-xss-filter.d.ts
           declare module 'showdown-xss-filter' {
               import Showdown from 'showdown';


               function xssFilter(
                   converter?: Showdown.Converter,
               ): Showdown.ShowdownExtension[];

               export default xssFilter;
           }
           \`\`\`

           작성한 showdown-xss-filter.d.ts 파일을 typeRoots 로 지정된 디렉터리에 저장합니다.

           > 타입스크립트 프로젝트 tsconfig.json 파일에서 typeRoots 속성을 사용하지 않으면  rootDir 로 지정한 디렉터리에 \`@types\` 디렉터리를 만들고 그 안에 저장하면 됩니다.
           `;

        const html = markdownConverter().makeHtml(markdown);
        console.log('html', html);
        expect(html).toBe(
            '<h1>샘플코드</h1>' +
                EOL +
                '<pre class="language-js"><code>let a = 1;</code></pre>' +
                EOL +
                '<pre class="language-js"><code>let a = 2;</code></pre>' +
                EOL +
                '<pre class="language-js"><code>let a = 3;</code></pre>',
        );
    });
});
