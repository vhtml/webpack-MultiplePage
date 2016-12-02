## 基于webpack的前端工程化开发之多页站点篇（二）

这篇，我们要解决上篇留下的两个问题：

- webpack如何自动发现entry文件及进行相应的模板配置
- 如何直接处理后端模板的样式、脚本自动引入问题

以express项目为例，使用express-generator构建一个初始项目，然后再添加需要的目录，最终的目录架构如下：

```
- website
	- bin					#express项目启动文件
	- lib					#express项目开发所需的库
	+ routes				#express项目路由
    - src					#前端源码开发目录
        - styles			#css目录，按照页面（模块）、通用、第三方三个级别进行组织
            + page
            + common
            + lib
        + imgs				#图片资源
        - scripts			#JS脚本，按照page、components进行组织
            + page
            + components
        + views				#HTML模板
    - public				#webpack编译打包输出目录的静态文件，express工程的静态目录，可由webpack打包自动生成
        + styles                
        + scripts
        + imgs
    + views					#webpack编译输出的模板静态文件，express工程的视图模板，可由webpack打包自动生成
    + node_modules			#所使用的nodejs模块
    package.json			#项目配置
    webpack.config.js		#webpack配置
    README.md				#项目说明
```
> 你同样可以根据个人喜好自由设计目录结构。完整的源码示例前往<https://github.com/vhtml/webpack-MultiplePage>。

package.json里最终的声明依赖如下：

```javascript
"devDependencies": {
    "css-loader": "^0.23.1",
    "extract-text-webpack-plugin": "^1.0.1",
    "file-loader": "^0.8.5",
    "glob": "^7.0.0",
    "html-loader": "^0.4.3",
    "html-webpack-plugin": "^2.9.0",
    "jquery": "^1.12.0",
    "less": "^2.6.0",
    "less-loader": "^2.2.2",
    "style-loader": "^0.13.0",
    "url-loader": "^0.5.7",
    "webpack": "^1.12.13",
    "webpack-dev-server": "^1.14.1"
}
```
可以看出，比上篇多了一个glob依赖，它是一个根据模式匹配获取文件列表的node模块。有关glob的详细用法可以在这里看到——<https://github.com/isaacs/node-glob>。利用glob模块可以很方便的获取src/scripts/page路径下的所有js入口文件。同理，可以实现自动的进行与入口文件相对应的模板配置。

最终的webpack配置如下（一些注释可能会让你少走许多坑）：

```javascript
var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const debug = process.env.NODE_ENV !== 'production';

var entries = getEntry('src/scripts/page/**/*.js', 'src/scripts/page/');
var chunks = Object.keys(entries);
var config = {
	entry: entries,
	output: {
		path: path.join(__dirname, 'public'),
		publicPath: '/static/',
		filename: 'scripts/[name].js',
		chunkFilename: 'scripts/[id].chunk.js?[chunkhash]'
	},
	module: {
		loaders: [ //加载器
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('style', 'css')
			}, {
				test: /\.less$/,
				loader: ExtractTextPlugin.extract('css!less')
			}, {
				test: /\.html$/,
				loader: "html?-minimize"	//避免压缩html,https://github.com/webpack/html-loader/issues/50
			}, {
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file-loader?name=fonts/[name].[ext]'
			}, {
				test: /\.(png|jpe?g|gif)$/,
				loader: 'url-loader?limit=8192&name=imgs/[name]-[hash].[ext]'
			}
		]
	},
	plugins: [
		new webpack.ProvidePlugin({ //加载jq
			$: 'jquery'
		}),
		new CommonsChunkPlugin({
			name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
			chunks: chunks,
			minChunks: chunks.length // 提取所有entry共同依赖的模块
		}),
		new ExtractTextPlugin('styles/[name].css'), //单独使用link标签加载css并设置路径，相对于output配置中的publickPath
		debug ? function() {} : new UglifyJsPlugin({ //压缩代码
			compress: {
				warnings: false
			},
			except: ['$super', '$', 'exports', 'require'] //排除关键字
		}),
	]
};


var pages = Object.keys(getEntry('src/views/**/*.html', 'src/views/'));
pages.forEach(function(pathname) {
	var conf = {
		filename: '../views/' + pathname + '.html', //生成的html存放路径，相对于path
		template: 'src/views/' + pathname + '.html', //html模板路径
		inject: false,	//js插入的位置，true/'head'/'body'/false
		/*
		* 压缩这块，调用了html-minify，会导致压缩时候的很多html语法检查问题，
		* 如在html标签属性上使用{{...}}表达式，所以很多情况下并不需要在此配置压缩项，
		* 另外，UglifyJsPlugin会在压缩代码的时候连同html一起压缩。
		* 为避免压缩html，需要在html-loader上配置'html?-minimize'，见loaders中html-loader的配置。
		 */
		// minify: { //压缩HTML文件
		// 	removeComments: true, //移除HTML中的注释
		// 	collapseWhitespace: false //删除空白符与换行符
		// }
	};
	if (pathname in config.entry) {
		conf.favicon = 'src/imgs/favicon.ico';
		conf.inject = 'body';
		conf.chunks = ['vendors', pathname];
		conf.hash = true;
	}
	config.plugins.push(new HtmlWebpackPlugin(conf));
});


module.exports = config;

function getEntry(globPath, pathDir) {
	var files = glob.sync(globPath);
	var entries = {},
		entry, dirname, basename, pathname, extname;

	for (var i = 0; i < files.length; i++) {
		entry = files[i];
		dirname = path.dirname(entry);
		extname = path.extname(entry);
		basename = path.basename(entry, extname);
		pathname = path.join(dirname, basename);
		pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
		entries[pathname] = ['./' + entry];
	}
	return entries;
}
```

建立一个开发环境服务器启动脚本server.js:

```javascript
var fs = require('fs');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var serverPort = 54999,
	devPort = 8082;

var exec = require('child_process').exec;
var cmdStr = 'PORT=' + serverPort + ' supervisor ./bin/www';
exec(cmdStr);


for (var i in config.entry) {
	config.entry[i].unshift('webpack-dev-server/client?http://localhost:' + devPort, "webpack/hot/dev-server")
}
config.plugins.push(new webpack.HotModuleReplacementPlugin());


var proxy = {
	"*": "http://localhost:" + serverPort
};
//启动服务
var app = new WebpackDevServer(webpack(config), {
	publicPath: '/static/',
	hot: true,
	proxy: proxy
});
app.listen(devPort, function() {
	console.log('dev server on http://0.0.0.0:' + devPort+'\n');
});
```

然后，只需要在项目目录下执行`node server`就可以开始进行开发了。

有些同学会发现一个问题，热加载经常无法生效，这个是由于热加载只能针对有`module.exports`输出的模块才行，否则会导致热加载失败从而刷新浏览器，而对于入口js文件由于没有模块输出，就会发现总是刷新浏览器了。如果要禁止自动刷新浏览器，可以将server.js中的`"webpack/hot/dev-server"`改为`"webpack/hot/only-dev-server"`。

还有一个蛋疼的问题就是，webpack-dev-server监控文件变化生成的内容是放在内存里的，由于没有输出到打包目录下，则`/views`目录下的文件没有变化，supervisor之类的工具检测不到变化，从而不会刷新视图。只好在改动模板文件后，执行`webpack`命令打包一下。于是比较蛋疼的在server.js的最后加上了这段代码：

```javascript
fs.watch('./src/views/', function() {
	exec('webpack --progress --hide-modules', function(err, stdout, stderr) {
		if (err) {
			console.log(stderr);
		} else {
			console.log(stdout);
		}
	});
});
```
在检测到有模板改动的时候会自动重新打包，然后只需手动刷新下浏览器即可。__显然这样做是比较低效的__。可以看下[这里](https://github.com/vhtml/webpack-MultiplePage/issues/7)。

这里还要说说如何直接处理后端模板的问题。一开始本菜也是对这个问题进行了苦苦的探索，觉得可能真的实现不了，一度要放弃，并打算采用先纯静态打包再改写成后端模板的方式（因为貌似还没有这样的loader可以很智能的处理模板include的问题以及在非html模板中自动引入css和js）。但是这样做真的很蛋疼啊有木有！明明是一件事为什么要拆成两件事去做呢？！

如果你也进行过这样一番探索，你可能接触过像jade-loader、ejs-loader、ejs-compiled-loader等这样的webpack loader。无奈它们统统都不是我要找的，它们只是编译了模板而没有保留模板原有的生态，也不能自动地引入css和js。我也曾试过自己写loader将ejs模板先转成html模板（只处理include标签，其余原样保留）再用html-loader去处理，但又破坏了模板的可复用性，失去了灵活性。

好吧，其实只是想原样输出src/views中的模板，然后像上篇中那样自动引入css和js，仅此而已。没想到差一点钻了死胡同，想得过于复杂了。

我们应该先知道一个事实，html-webpack-plugin插件实现自动引入css和js的原理，是在模板中对应的成对head和body标签中进行解析插入。如果没有head和body标签，它会分别在模板头和尾生成这两个标签并插入link和script标签来引入css和js。而至于你的模板里写了什么，它是不会关心的。明白了这个原理，要完成“大业”就为期不远了。我们应该先改一改写模板的方式，模板结构一定要是类html的，不能是jade这种（还好我并不喜欢用jade）。以artTemplate模板为例，如下：

```xml
<!DOCTYPE html>
<html>
<head>
	{{include './common/meta'}}
</head>
<body>
	{{include './common/header'}}
	<div class="g-bd">
		{{include './common/_content'}}
	</div>
	{{include './common/footer'}}
</body>
</html>
```

是的，没错，只要保留完整的head、body结构即可。然后根据上述的webpack配置，将与入口js对应的模板插入link和script标签并输出到./views目录中，其余模板原样输出到./views目录或相应的子目录下即可。

到此，“大业”完成。

假如你有更好的解决方案，欢迎一起分享。

### 快速开始

```bash
git clone https://github.com/vhtml/webpack-MultiplePage.git  #克隆最新项目到本地
cd webpack-MultiplePage  #切换到项目路径下
npm install	#安装依赖
node server #执行开发环境脚本，因为server.js中使用supervisor启动node程序，你可能需要全局安装一下supervisor
```

在浏览器中打开http://localhost:8082/。

如果需要上线，执行`npm run build`完成最终项目打包即可。
