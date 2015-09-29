module.exports = {
    entry: "./sunsistemo.es6.js",
    output: {
        path: __dirname,
        filename: "sunsistemo.js"
    },
    module: {
        loaders: [
            { test: /\.es6\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
