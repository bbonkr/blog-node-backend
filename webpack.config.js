const path = require('path');
const fs = require('fs');
const node_env = process.env.NODE_ENV || 'development';
const isProd = node_env === 'production';
var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    name: 'blog-backend',
    mode: node_env,
    devtool: isProd ? 'source-map' : 'inline-source-map',
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    entry: {
        index: './src/index',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: ['ts-loader'],
            },
        ],
    },
    plugins: [],
    output: {
        filename: '[name].js',
        path: path.normalize(path.join(__dirname, 'bundle')),
    },
    externals: nodeModules,
};
