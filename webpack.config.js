module.exports = {
    entry: {
        sunsistemo: "./main.js",
        "validation/validation": "./validation/test.js"
    },
    output: {
        path: __dirname,
        filename: "[name].js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
