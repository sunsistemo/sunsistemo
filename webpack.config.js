module.exports = {
    entry: "./main.js",
    output: {
        path: __dirname,
        filename: "sunsistemo.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
