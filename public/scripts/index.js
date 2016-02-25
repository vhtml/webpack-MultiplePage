webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {//引入css
	__webpack_require__(2);
	__webpack_require__(6);
	__webpack_require__(8);
	__webpack_require__(11);


	var oP = document.createElement('p');
	oP.className = 'text';
	oP.innerHTML = '这是由js生成的一句话。';
	document.querySelector('.g-bd').appendChild(oP);

	//增加事件
	$('.btn').click(function() {
		__webpack_require__.e/* require */(2, function(__webpack_require__) { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [__webpack_require__(12)]; (function(dialog) {
			dialog();
		}.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 11:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

});