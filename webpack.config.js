const path = require("path");
const webpack = require("webpack");
const webpack_rules = [];
const webpackOption = {
    entry: "./app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: webpack_rules
    },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    watchOptions: {ignored: [
	// path.resolve(__dirname, 'dist'),
        path.resolve(__dirname, 'node_modules')
    ]},
    port: 9000
  }
};
let babelLoader = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
        loader: "babel-loader",
        options: {
            presets: ["@babel/preset-env"]
        }
    }
};
webpack_rules.push(babelLoader);
module.exports = webpackOption;
