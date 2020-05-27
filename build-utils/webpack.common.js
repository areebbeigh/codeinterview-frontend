const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const languages = require('../src/constants/languages');

const APP_DIR = path.resolve(__dirname, '..', './src');
const NODE_MODULES = path.resolve(__dirname, '..', './node_modules');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(config\.js|js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: 'url-loader',
        },
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.css$/,
        include: NODE_MODULES,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.css$/,
        include: APP_DIR,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      features: path.resolve(__dirname, '..', 'src', 'features'),
      components: path.resolve(__dirname, '..', 'src', 'components'),
      themes: path.resolve(__dirname, '..', 'src', 'themes'),
      lib: path.resolve(__dirname, '..', 'src', 'lib'),
      pages: path.resolve(__dirname, '..', 'src', 'pages'),
      api: path.resolve(__dirname, '..', 'src', 'api'),
      constants: path.resolve(__dirname, '..', 'src', 'constants'),
      assets: path.resolve(__dirname, '..', 'src', 'assets'),
      '@': path.resolve(__dirname, '..', 'src'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'CodeInterview',
      template: './src/index.html',
    }),
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      // languages: [
      //   'cpp',
      //   'csharp',
      //   'go',
      //   'java',
      //   'typescript',
      //   'javascript',
      //   'objective-c',
      //   'python',
      //   'rust',
      // ],
      languages: ['typescript', ...Object.keys(languages)],
    }),
  ],
  output: {
    path: path.resolve(__dirname, '../', 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
};
