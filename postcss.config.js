/* eslint-disable prefer-object-spread */
/* eslint-disable prefer-template */
const commonVariables = require('./src/themes/variables/common');
// const themes = require('./src/themes/variables/themes');

// const themeVariables = {};

// Object.keys(themes).forEach(themeName => {
//   const theme = themes[themeName];
//   Object.keys(theme).forEach(varName => {
//     themeVariables[themeName + '-' + varName] = theme[varName];
//   });
// });

module.exports = {
  plugins: {
    'postcss-import': {
      path: './src',
    },
    'postcss-import-url': {},
    'postcss-nested': {},
    'postcss-simple-vars': {
      variables: commonVariables,
    },
  },
};
