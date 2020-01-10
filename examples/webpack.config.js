const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',

  /**
   * 在 examples 目录下建多个子目录
   * 会把不同章节的 demo 放到不同的子目录中
   * 每个子目录下会创建一个 app.ts 
   * app.ts 作为 webpack 构建的入口文件
   * entries 收集了多目录个入口文件，并且每个入口还引入了一个用于热更新的文件
   * entries 是一个对象，key 为目录名
   */
  entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
    const fullDir = path.join(__dirname, dir)
    const entry = path.join(fullDir, 'app.ts')
    if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) { // fullDir 为目录 && entry 路径存在
      entries[dir] = ['webpack-hot-middleware/client', entry]
    }
    return entries
  }, {}),
  /**
   * entry: { 多入口
   *  examples 目录下的目录 dir1: ['webpack-hot-middleware/client', /examples/dir1/app.ts],
   *  dir2: ['webpack-hot-middleware/client', /examples/dir2/app.ts],
   *  dir3: ['webpack-hot-middleware/client', /examples/dir3/app.ts],
   *  ...
   * }
   */

  /**
   * 根据不同的目录名称，打包生成目标 js，名称和目录名一致
   */
  output: {
    path: path.join(__dirname, '__build__'),
    filename: '[name].js',
    publicPath: '/__build__/' // 打包后的 index.html 中引入资源的前缀
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader'
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true // 只做编译，不会把转义后的结果写入文件中 见 https://webpack.toobug.net/zh-cn/chapter6/ts-and-vue.html 最后
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'] // 能够使用户在引入模块时不带扩展,自动带上 .ts 或 .tsx 或 .js
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin() // 有报错的话，不影响顺利打包
  ]
}