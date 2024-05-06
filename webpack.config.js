const path = require("path");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        dashboard: "/pages/scripts/dashboard.tsx",
        signin: "/pages/scripts/signin.tsx"
    },
    mode: "development",
    output:{
        filename: "[name].js",
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