const path = require('path');
const webpack = require('webpack');

let [entry_path, output_path, output_filename] = process.argv.slice(2);

webpack({
  target: 'web',
    node: {
        fs: "empty",
    },
    externals: [
        {
            archiver: 'archiver'
        },
        {
            child_process: 'child_process'
        },
        {
            nodemailer: 'nodemailer'
        },
        {
            sqlite: 'sqlite'
        },
        {
            unzipper: 'unzipper'
        },
        {
            webpack: 'webpack'
        },
        /\.txt/,
        /\.png$/,
        /\.jpg$/,
        /\.html$/,
        /\.css$/,
        /\.sql$/,
        /\.md$/,
        /\.pdf$/,
        /\.sh$/,
        /\.zip$/,
        /\/web\//,
        /\/www\//
    ],
  entry: ["babel-polyfill", entry_path],
  output: {
      path: output_path,
      filename: output_filename
  },
  // rules that we're governed by
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        },
    ]
  },
  resolve: {
    alias: {
      ModTemplate$: path.resolve(__dirname, 'lib/templates/modtemplate.js'),
    }
  },
  mode: 'development',
  devtool: "cheap-module-eval-source-map",
  }, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err);
    if (stats) {
      let info = stats.toJson();
      console.log(info.errors);
    }
  }
  //
  // Done processing
  //
  console.log("Bundle Success!");
});