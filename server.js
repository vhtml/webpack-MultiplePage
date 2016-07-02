var fs = require('fs');
var os = require('os');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var serverPort = 54999,
	devPort = 8082;

var exec = require('child_process').exec;
var cmdStr = 'PORT=' + serverPort + ' supervisor ./bin/www';

//请使用win系统的同学，自行更改执行脚本命令吧，前面指定端口号即可，抱歉抱歉，实在不熟
if(os.platform().toLowerCase().indexOf('win32') > -1){	
	cmdStr = 'supervisor ./bin/www'
}

exec(cmdStr, function(err, stdout, stderr){
	if(err){
		console.error(err);
	}
	else{
		console.log(stdout);
	}
});

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

execWebpack()

app.listen(devPort, function() {
	console.log('dev server on http://0.0.0.0:' + devPort+'\n');
});

fs.watch('./src/views/', function() {
	execWebpack()
});

function execWebpack(){
	exec('webpack --progress --hide-modules', function(err, stdout, stderr) {
		if (err) {
			console.error(stderr);
		} else {
			console.log(stdout);
		}
	});
}