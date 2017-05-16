var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')

require('shelljs/global')

var serverPort = 54999
var devPort = 8082

var exec = require('child_process').exec
var cmdStr = 'cross-env PORT=' + serverPort + ' supervisor ./bin/www'

exec(cmdStr, function (err, stdout, stderr) {
  if (err) {
    console.error(err)
  } else {
    console.log(stdout)
  }
})

for (var i in config.entry) {
  config.entry[i].unshift('webpack-dev-server/client?http://localhost:' + devPort, 'webpack/hot/dev-server')
}
config.plugins.push(new webpack.HotModuleReplacementPlugin())

var proxy = {
  '*': 'http://localhost:' + serverPort
}

var compiler = webpack(config)
// 启动服务
var app = new WebpackDevServer(compiler, {
  publicPath: '/static/',
  hot: true,
  proxy: proxy
})

var viewPath = path.join(__dirname, 'views')
rm('-rf', viewPath)
// 在源码有更新时，更新模板
compiler.plugin('emit', function (compilation, cb) {
  for (var filename in compilation.assets) {
    if (filename.endsWith('.html')) {
      let filepath = path.resolve(viewPath, filename)
      let dirname = path.dirname(filepath)
      if (!fs.existsSync(dirname)) {
        mkdir('-p', dirname)
      }
      fs.writeFile(filepath, compilation.assets[filename].source())
    }
  }
  cb()
})

// 当页面模板有改变时，强制刷新页面
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    // todo 刷新浏览器
    /**
     * 实际项目中，应该使用webpack-dev-middleware和webpack-hot-middleware中间件，
     * 结合node库express/koa等使用。
     */
    cb()
  })
})

app.listen(devPort, function () {
  console.log('dev server on http://0.0.0.0:' + devPort + '\n')
})
