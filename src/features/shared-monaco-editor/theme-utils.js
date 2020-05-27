import codesandboxTheme from 'themes/monaco-themes/codesandbox-black';

export default monaco => {
  monaco.editor.defineTheme('codesandbox-black', codesandboxTheme);
  monaco.editor.setTheme('codesandbox-black');
};
