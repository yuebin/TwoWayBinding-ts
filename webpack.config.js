const path = require('path');

module.exports = {
    entry:{
      app: './src/index.ts',
      lib:''
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
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9000
        }
  };
