const { merge } = require('webpack-merge')
const base = require('./webpack.base')
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(base, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
})
