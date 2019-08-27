const db = require('../models');
const bcrypt = require('bcrypt');
const {
    markdownConverter,
    stripHtml,
    getExcerpt,
} = require('../routes/helper');

exports.seed = async () => {
    console.log('start to insert seed data.');

    const hasUser = await db.User.findAll({
        attributes: ['id'],
    });

    if (!hasUser || hasUser.length === 0) {
        const testUser = await db.User.create({
            username: 'bbonkr',
            displayName: '구본철',
            email: 'bbon@bbon.kr',
            password: await bcrypt.hash('1234', 12),
        });

        const testCategory = await db.Category.create({
            name: 'test',
            slug: 'test',
            ordinal: 1,
            UserId: testUser.id,
        });

        const testTag = await db.Tag.create({
            name: 'test',
            slug: 'test',
        });

        const testKrTag = await db.Tag.create({
            name: '테스트',
            slug: '테스트',
        });

        const samplePosts = [];
        for (let i = 0; i < 10; i++) {
            const markdown = `## test ${i + 1}

샘플 문서입니다.

## Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sollicitudin neque ante, vitae pulvinar ante facilisis sit amet. Ut vulputate vulputate placerat. Nunc condimentum enim vitae purus iaculis, et pretium risus sollicitudin. Nam porttitor posuere tortor. Praesent erat felis, lacinia eu augue eu, suscipit condimentum felis. Duis quis ex non nisl efficitur tincidunt. Cras hendrerit velit sed bibendum commodo. Vestibulum eu mauris aliquet, tristique nisi nec, mattis enim. Etiam non enim porttitor, molestie nisi quis, pellentesque nisi. Phasellus eros neque, porttitor nec justo vitae, tincidunt consequat velit. Proin semper, est in suscipit pulvinar, erat ipsum elementum ante, et tempor ipsum nunc eget mi. Integer at purus auctor, lacinia odio at, porttitor leo. Cras lobortis volutpat velit. Nam tellus massa, tempor sit amet mollis semper, convallis vel odio. Curabitur scelerisque sagittis urna eu aliquet. Sed a luctus arcu.

Pellentesque vel rhoncus orci. Nam vel turpis maximus, scelerisque odio non, tincidunt ex. Phasellus at sollicitudin justo, sit amet iaculis lorem. Curabitur vehicula vulputate rhoncus. Phasellus commodo rutrum felis, ullamcorper ultrices nulla sollicitudin a. Sed magna tellus, lobortis a facilisis ut, sollicitudin in diam. Nulla ex justo, vestibulum tempor efficitur eu, ornare ac ante. Mauris at felis venenatis, eleifend ipsum sed, varius enim. Nulla id tellus a dui luctus elementum nec et quam. Mauris eget tempor dui, ac feugiat tortor. Donec fermentum luctus turpis, ac aliquam nunc aliquet vitae. Vestibulum volutpat nisl vel urna malesuada, lacinia iaculis purus elementum. Nulla vel risus felis. In pharetra sagittis libero. Ut semper est non ex semper, in ornare est pulvinar. Cras vel dapibus odio.

Fusce erat ipsum, porta a orci in, laoreet condimentum felis. Cras eleifend sollicitudin ligula, at tristique magna blandit eu. Nulla nec tempor odio, at gravida lectus. Morbi lobortis vulputate tellus, iaculis tristique arcu euismod vitae. Mauris auctor dictum tellus, sed varius erat. Quisque pharetra tellus in metus auctor, eu semper nisi consequat. Aenean congue a quam et maximus. Cras sit amet placerat dui, eu porttitor purus. Sed ac velit a erat venenatis faucibus. Sed malesuada gravida odio, vitae tempus risus vehicula quis. Fusce dictum malesuada magna, at suscipit nulla blandit ac. Proin felis elit, porta sed ultricies eu, vulputate vitae tortor. Nam et dolor magna. Nulla interdum mi metus, et consectetur lacus facilisis et.

Sed faucibus semper orci, ac rutrum augue convallis vel. Quisque at ligula a risus mattis condimentum ac at nunc. Sed in porttitor mi. Nulla ac tristique justo, vitae egestas justo. Duis facilisis urna eget sollicitudin porta. Aenean vehicula risus id arcu blandit, molestie pharetra ligula vulputate. Proin sodales massa maximus nulla tempus volutpat. Aliquam erat volutpat. Integer venenatis elit eget vulputate rutrum. Suspendisse ac pretium diam, et facilisis justo.

Proin sed facilisis mi. Sed faucibus quam felis, eget pulvinar odio imperdiet quis. Maecenas auctor mauris in felis lacinia condimentum. Pellentesque imperdiet, dolor eu interdum consectetur, dui massa pretium lorem, vel accumsan nisi sapien ut risus. Curabitur feugiat aliquam ante eget eleifend. In id nunc ut elit posuere dapibus at in ipsum. Fusce convallis, nisi vel vestibulum laoreet, nulla purus congue risus, ac accumsan erat nisi et diam. Ut fermentum, velit quis congue lobortis, quam odio sollicitudin tortor, ut efficitur ligula turpis sit amet neque. Sed vitae libero sit amet quam mollis sollicitudin.

Mauris ac arcu ullamcorper, pulvinar ipsum eu, dictum eros. Sed lacinia ultricies nisi, eget venenatis mauris mattis sed. Sed risus quam, auctor eu neque sed, interdum semper ligula. Aliquam iaculis, nisl eget condimentum lobortis, sapien sem varius est, id rhoncus mi magna non nisl. Aliquam eget dolor est. Phasellus auctor elementum augue et pretium. Cras vel dapibus nunc, ac bibendum erat. Pellentesque porta, orci sit amet bibendum iaculis, purus nunc sollicitudin lacus, at ultrices purus massa pellentesque ligula. Aenean lobortis sollicitudin imperdiet. Duis viverra, justo id vehicula pellentesque, erat turpis convallis neque, vel elementum orci erat vel enim. Nullam varius vestibulum purus nec vestibulum. Nam interdum volutpat libero, quis pharetra sapien volutpat viverra.

Nullam tincidunt velit erat, et tincidunt risus molestie a. Ut sed imperdiet augue. Curabitur vitae quam in lectus fringilla tincidunt a in lacus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi turpis nibh, laoreet at sagittis vel, placerat at nunc. Nulla in lobortis massa. Cras vitae sem semper, sollicitudin justo luctus, commodo nunc. Proin nec scelerisque arcu, non laoreet mauris. Nunc vel nisl at est posuere molestie ac nec tortor. Etiam auctor velit nec dolor mollis, eu iaculis libero malesuada. Cras non tempor magna, non condimentum felis. Aliquam eros urna, rhoncus at arcu sit amet, maximus malesuada lacus. Vestibulum fermentum vulputate ex, eu faucibus metus eleifend vitae. Integer aliquam est turpis, finibus aliquam dui mattis ac. Pellentesque rutrum scelerisque turpis non pretium. Nunc quis elementum ante.

Quisque bibendum quis sem ut consectetur. Ut nunc turpis, tempus sed pharetra at, eleifend eu nulla. Maecenas in sem a nisi iaculis rutrum sit amet pellentesque ligula. Vestibulum quis metus nunc. Fusce lacus arcu, fringilla quis dictum quis, tincidunt sagittis nisi. Maecenas non mi tristique, convallis nisl ut, tempor sem. Donec tempus efficitur sodales. Nullam sed metus at lorem efficitur commodo. Nullam eu tortor id felis volutpat fringilla dictum at ante. Sed quis mattis est. Quisque facilisis nisi vitae nisi posuere, quis commodo purus congue. Quisque hendrerit interdum est, et efficitur augue cursus ac.

Mauris massa tellus, viverra et imperdiet ut, tincidunt vel nibh. Quisque diam libero, faucibus sed metus et, cursus cursus nunc. Suspendisse vitae quam sed mauris tincidunt convallis. Suspendisse sed dolor maximus quam aliquam bibendum. Sed vitae leo mi. Aliquam sed justo quis augue interdum pellentesque sed mollis sem. Suspendisse varius velit et bibendum porttitor. Nullam sollicitudin consectetur diam a dignissim. Ut turpis augue, varius ac turpis a, consequat imperdiet lacus. Proin sed lacinia mauris. Nullam fermentum tincidunt feugiat. Quisque tempus quam et velit ultricies vestibulum. Aenean massa metus, finibus lobortis venenatis vitae, condimentum ut dolor. Suspendisse euismod placerat arcu vitae pharetra. Donec in faucibus ex.

Pellentesque sed eleifend sem. Aenean mi elit, mollis vel semper sed, placerat et felis. Sed accumsan, risus quis consectetur molestie, sem urna convallis nisi, non semper lorem lacus et diam. Suspendisse facilisis justo quis tortor tempor, quis ultrices turpis feugiat. Ut dignissim odio non est hendrerit rutrum. Morbi maximus ullamcorper est, et eleifend urna mollis nec. Donec pretium euismod urna sed sagittis. Mauris lobortis lorem vitae euismod efficitur. Aliquam porta mi sapien, in porta odio ullamcorper nec. Donec eu volutpat ante. Aenean varius semper efficitur. Morbi massa mauris, tempus nec rhoncus nec, convallis ut eros. Sed faucibus at diam eu placerat. Aenean erat ligula, tempor a lacinia quis, scelerisque at ligula. Nam eu odio sed nisi dictum molestie.

Etiam id pellentesque nunc, volutpat imperdiet felis. Donec tempus molestie facilisis. Donec ullamcorper lorem in sollicitudin fermentum. Vestibulum viverra est sit amet ex aliquet, in faucibus metus condimentum. Nullam tempor aliquet magna convallis eleifend. Nunc auctor est massa, eu vestibulum lorem varius ac. Ut suscipit laoreet nibh id pulvinar. Morbi non eros semper, faucibus urna at, dapibus sem. Aenean eleifend nibh sed ipsum pharetra, in tempus nisl facilisis. Donec finibus risus sit amet nunc congue, aliquet lobortis urna gravida. Pellentesque ut consectetur erat, sit amet lacinia arcu. Interdum et malesuada fames ac ante ipsum primis in faucibus. Morbi quis nulla sit amet tellus ullamcorper feugiat. Quisque molestie nunc in elit mollis feugiat.

Integer imperdiet ac libero et sagittis. Suspendisse elementum sollicitudin purus, ut hendrerit quam imperdiet vitae. Cras ornare molestie nibh, non volutpat ipsum pulvinar non. Cras in justo ultricies risus gravida tempor. Donec ullamcorper nisi ipsum, sit amet laoreet enim faucibus eget. Nullam placerat, mi a feugiat finibus, orci mauris auctor lacus, sollicitudin dignissim eros orci sed ante. Proin consectetur urna vel ornare maximus. Aenean condimentum pretium molestie. Praesent scelerisque nibh eu venenatis euismod. Curabitur condimentum sem id tellus lobortis pharetra.

Aliquam viverra odio sodales scelerisque pulvinar. Etiam varius in ligula at sodales. In in enim sit amet augue placerat luctus. Sed scelerisque felis nec enim faucibus tempor. Vestibulum at dapibus sapien, id consequat risus. Aliquam nec congue felis, nec ultrices erat. Maecenas at dolor id turpis commodo aliquet. Nullam id tellus ante. Pellentesque at suscipit lectus, id laoreet nunc. Aenean libero lacus, aliquam quis convallis sit amet, semper et turpis. Nam bibendum eget ligula eu venenatis. Sed commodo vestibulum mauris quis iaculis. Ut sollicitudin nulla et tellus sollicitudin sodales. Quisque pretium hendrerit dignissim.

Nam risus est, volutpat sit amet mauris et, imperdiet dapibus nisl. In elementum at odio at dignissim. In est ante, tristique et venenatis a, sollicitudin a erat. Sed fermentum quam arcu. Nulla commodo justo vitae nisl vulputate, eu varius massa vehicula. Morbi sit amet lectus porta, molestie ligula at, tempor ex. Fusce sapien lorem, tempus quis eros a, ultricies pharetra lorem. Integer congue tellus at turpis ultrices, at laoreet neque rhoncus. Maecenas pretium mauris tellus, nec lobortis nisl sollicitudin volutpat. Fusce convallis tellus et dictum luctus. Quisque in bibendum augue. Proin eu quam sem. Cras libero dolor, bibendum quis nisi nec, facilisis dictum mi.

Nunc rutrum sapien at eleifend interdum. Duis tortor sapien, imperdiet imperdiet varius a, placerat vel metus. Fusce ac dui diam. Donec vulputate volutpat neque vel mollis. Vivamus pretium mi risus, in mollis tortor semper eu. Vestibulum eget venenatis tellus, quis porta neque. Ut laoreet orci ut dolor ultricies pretium. Morbi efficitur tellus vitae justo porta sollicitudin. Fusce ultrices eros nec convallis faucibus. Vivamus posuere velit non aliquet mollis.
`;
            const html = markdownConverter.makeHtml(markdown);
            const text = stripHtml(html);
            const excerpt = getExcerpt(text);

            samplePosts.push({
                title: `Test ${i + 1}`,
                slug: `test-${i + 1}`,
                markdown: markdown,
                html: html,
                text: text,
                excerpt: excerpt,
                UserId: testUser.id,
                createdAt: new Date().setHours(i),
                isPublished: true,
            });
        }

        // 포스트 추가
        const posts = await db.Post.bulkCreate(samplePosts);

        // 분류 추가
        await testCategory.addPosts(posts);

        // 태그 추가
        await testTag.addPosts(posts);

        await testKrTag.addPosts(posts.filter(v => v.id % 2 === 0));
        console.log('insert seed data completed.');
    } else {
        console.log('User is exists. DO NOT SEED DATA.');
    }
};
