webpackJsonp([2],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {//加载模块css
	__webpack_require__(13);
	//加载模板
	var html = __webpack_require__(15);

	module.exports = function() {
		var $dialog = $(html).clone();
		$dialog.find('.close').on('click', function() {
			$dialog.fadeOut(function() {
				$(this).remove();
			});
		});
		$('body').append($dialog);
		$dialog.fadeIn();
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(14);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(14, function() {
				var newContent = __webpack_require__(14);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, ".v-dialog{\n\tposition: fixed;\n\tdisplay: none;\n\tleft: 0;top:0;right:0;bottom:0;\n\tbackground-color: rgba(0,0,0,.5);\n}\n.v-dialog .close{\n\tposition: absolute;\n\ttop:20px;\n\tright: 20px;\n\twidth: 40px;\n\theight: 40px;\n\tborder-radius: 50%;\n\ttext-align: center;\n\tline-height: 40px;\n\tfont-size: 40px;\n\tcolor:#666;\n\tbackground-color: rgba(255,255,255,.8);\n\tcursor: pointer;\n}\n.v-dialog .img{\n\tposition: absolute;\n\tmargin:auto;\n\ttop:0;right: 0;bottom:0;left: 0;\n\tmax-width: 90%;\n\tmax-height: 90%;\n}", ""]);

	// exports


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "<div class=\"v-dialog\">\n\t<span class=\"close\">&times;</span>\n\t<img class=\"img\" src=\"" + __webpack_require__(16) + "\" />\n</div>\n";

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "imgs/1-c2a0fbb427ef4b2c33a0965be4d52214.png";

/***/ }
]);