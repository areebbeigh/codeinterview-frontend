/* eslint-disable prefer-object-spread */
/* eslint-disable prefer-destructuring */
const themes = require('../monaco-themes');

module.exports = {
  'vs-dark': {
    'primary-color': '#000000',
    'secondary-color': '#000000',
  },
};

Object.keys(themes).forEach(themeName => {
  const type = themes[themeName].type;
  const secondaryColor = type === 'light' ? '#403f53' : '#159497';
  const themeDefinition = {
    'primary-color':
      themes[themeName].colors['editorGroup.background'],
    'secondary-color':
      themes[themeName].colors['buttin.background'] || secondaryColor,
  };
  module.exports[themeName] = Object.assign(
    {},
    themeDefinition,
    themeName in exports ? exports[themeName] : {}
  );
});
