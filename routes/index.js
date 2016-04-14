var express = require('express');
var router = express.Router();

var webTile = '歪闹日志';
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: '首页 - ' + webTile,
		pageNav: 'index'
	});
});

router.get('/about', function(req, res, next) {
	res.render('about', {
		title: '关于 - ' + webTile,
		pageNav: 'about'
	});
});

module.exports = router;