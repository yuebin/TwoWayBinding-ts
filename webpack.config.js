const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry:{
      app: './src/index.ts',
      lib:'./src/uad/index.ts'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
    },
    optimization:{
            splitChunks:{
            chunks:'async'
            }
    }, 
    plugins:[
        new CopyWebpackPlugin([
            {
                from:__dirname + '/src/examples/',
                to:__dirname + '/dist/examples/',
                test:/([^/]+)\/(.+)\.(html|htm)$/,
                force: true,
                ignore: ['.tsx', '.ts', '.js']
            }
        ]),

    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    }
  };
