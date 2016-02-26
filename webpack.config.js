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
		chunkFilename: 'scripts/[id].chunk.js'
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
				loader: "html"
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
		new webpack.HotModuleReplacementPlugin() //热加载
	],
	devServer: {
		publicPath:'http://localhost:8080/static/',
		proxy: {
			"*": "http://localhost:54999"
		},
		inline: true,
		hot: true
	}
};


var pages = Object.keys(getEntry('src/views/**/*.html', 'src/views/'));
pages.forEach(function(pathname) {
	var conf = {
		filename: '../views/' + pathname + '.html', //生成的html存放路径，相对于path
		template: 'src/views/' + pathname + '.html', //html模板路径
		inject: false,	//js插入的位置，true/'head'/'body'/false
		minify: { //压缩HTML文件
			removeComments: true, //移除HTML中的注释
			collapseWhitespace: false //删除空白符与换行符
		}
	};
	if (pathname in config.entry) {
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
		entries[pathname] = './' + entry;
	}
	return entries;
}