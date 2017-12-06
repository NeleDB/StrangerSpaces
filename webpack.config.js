const path = require(`path`);

const webpack = require(`webpack`);
const {HotModuleReplacementPlugin} = webpack;
const {UglifyJsPlugin} = webpack.optimize;

const CopyWebpackPlugin = require(`copy-webpack-plugin`);
const ExtractTextWebpackPlugin = require(`extract-text-webpack-plugin`);
const configHtmls = require(`webpack-config-htmls`)();

const {getIfUtils, removeEmpty} = require(`webpack-config-utils`);
const {ifProduction, ifDevelopment} = getIfUtils(process.env.NODE_ENV);

const extractCSS = new ExtractTextWebpackPlugin(`css/style.css`);

// change for production build on different server path
const publicPath = `/`;

const port = 3000;

const copy = new CopyWebpackPlugin([{
  from: `./src/assets`,
  to: `assets`
}], {
  ignore: [
    `.DS_Store`
  ]
});

const config = {

  entry: removeEmpty([
    `./src/css/style.css`,
    `./src/js/script.js`,
    ifDevelopment(...configHtmls.entry)
  ]),

  resolve: {
    extensions: [
      `.js`,
      `.jsx`,
      `.css`
    ]
  },

  output: {
    path: path.join(__dirname, `dist`),
    filename: `js/[name].[hash].js`,
    publicPath
  },

  devtool: `source-map`,

  devServer: {

    contentBase: `./src`,
    historyApiFallback: true, // react-router
    hot: true,

    overlay: {
      errors: true,
      warnings: true
    },

    port

  },

  module: {

    rules: removeEmpty([

      ifDevelopment({
        test: /\.css$/,
        use: [
          `style-loader`,
          {
            loader: `css-loader`,
            options: {
              importLoaders: 1
            }
          },
          {
            loader: `postcss-loader`
          }
        ]
      }),

      ifProduction({
        test: /\.css$/,
        loader: extractCSS.extract([
          {
            loader: `css-loader`,
            options: {
              importLoaders: 1
            }
          },
          {
            loader: `postcss-loader`
          }
        ])
      }),

      {
        test: /\.html$/,
        loader: `html-loader`,
        options: {
          attrs: [
            `audio:src`,
            `img:src`,
            `video:src`,
            `source:srcset`
          ] // read src from video, img & audio tag
        }
      },

      {
        test: /\.(jsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: `babel-loader`
          },
          {
            loader: `eslint-loader`,
            options: {
              fix: true
            }
          }
        ]
      },

      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        loader: `url-loader`,
        options: {
          limit: 1000, // inline if < 1 kb
          context: `./src`,
          name: `[path][name].[ext]`
        }
      },

      {
        test: /\.(mp3|mp4|wav)$/,
        loader: `file-loader`,
        options: {
          context: `./src`,
          name: `[path][name].[ext]`
        }
      },

      ifProduction({
        test: /\.(svg|png|jpe?g|gif)$/,
        loader: `image-webpack-loader`,
        enforce: `pre`,
        options: {
          bypassOnDebug: true
        }
      })

    ])

  },

  plugins: removeEmpty([

    ...configHtmls.plugins,

    ifDevelopment(new HotModuleReplacementPlugin()),

    

    ifProduction(copy),
    ifProduction(extractCSS),

    ifProduction(
      new UglifyJsPlugin({
        sourceMap: true,
        comments: false
      })
    )

  ])

};

module.exports = config;
