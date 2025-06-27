const path = require("path");
const fs = require("node:fs");

const dist = path.resolve(__dirname, "dist");

fs.cpSync(path.resolve(__dirname, "index.js"), path.resolve(dist, "index.js"));

const common = {
  resolve: {
    extensions: [".js"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  mode: "development",
};

module.exports = [
  {
    entry: "./index.js",
    target: "node",
    output: {
      filename: "index.js",
      path: dist,
      libraryTarget: "commonjs",
    },
    ...common,
  },
];
