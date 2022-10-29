const { join } = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  target: 'web', // node | web
  entry: join(__dirname, 'src/index.ts'),

  output: {
    path: join(__dirname, 'dist'),
    filename: 'bundle.js',
    assetModuleFilename: 'assets/[hash][ext][query]',

    // Bundle absolute resource paths in the source-map,
    // so VSCode can match the source file.
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  module: {
    rules:[{
        test: /\.(ts|tsx)$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: [{
            // inject CSS to page
            //loader: "style-loader"
            loader: MiniCssExtractPlugin.loader,
        }, {
            loader: "css-loader",
            options: {
                sourceMap: true
            }
        }, {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: function () {
                        return [
                            require('autoprefixer')
                        ];
                    }
                }
            }
        }]
    }]
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: "Host",
      filename: "index.html",
      template: "./src/index.html",
      meta: {
        "context" : "host"
      }
    }),
    // new HtmlWebPackPlugin({
    //   title: "SideBar",
    //   filename: "sideBar.html",
    //   template: "./src/sideBar.html",
    //   meta: {
    //     "context" : "sideBar"
    //   }
    // }),
    new MiniCssExtractPlugin()
  ],
  experiments: {
    topLevelAwait: true,
  },
}
