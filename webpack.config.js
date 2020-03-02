const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'app.js',
        // __dirname 是 webpack.config.js 所在的目录
        path: path.resolve(__dirname, 'build'),
    },
    watch: true,
    devtool: 'source-map',
    mode: 'none',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            // 使用当前目录下的 a.html 作为模板文件
            template: path.resolve(__dirname, 'index.html')
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                // loader 是用来处理其他类型(非 js)文件的程序
                // loader 的调用顺序是逆序的
                // 先用 css-loader 处理, 然后再用 style-loader 处理
                // css-loader 先把 css 文件处理成 js 能够解决的形式
                // style-loader 会把 css 的内容插入到页面的 style 标签中
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
        ]
    }
}