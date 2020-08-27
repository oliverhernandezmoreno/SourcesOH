import {addParameters, configure} from '@storybook/react';

addParameters({
    options: {
        storySort: (a, b) => a[1].id.localeCompare(b[1].id)
    }
});
// automatically import all files ending in *.stories.js
configure(require.context('../src/stories', true, /\.stories\.js$/), module);
