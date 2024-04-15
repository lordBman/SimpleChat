const path = require("path");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "/scripts/main.tsx",
    mode: "development",
    output:{
        filename: "bundle.js",
        path: path.resolve(__dirname, "assets")
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    module: {
        rules:[
            { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
        ]
    },
    /*Plugins: [
        new MiniCssExtractPlugin({ filename: "app.css" })
    ]*/
};