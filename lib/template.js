var template = require('art-template');

template.config('base', '');
template.config('extname', '.html');
template.config('cache', false);

//关闭编码html字符
template.config('escape', false);

//日期格式化
template.helper('dateFormat', function(date, format) {

    date = new Date(date);

    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
});

template.helper('gender', function(gender) {
    return gender == 1?'男':gender==2?'女':'未知';
});

template.helper('age', function(birth) {
   return parseInt((Date.now() - birth)/(1000*60*60*24*365));
});

template.helper('formatContent', function(content) {
    return formatContent(content);
});

template.helper('truncate', function(content, len) {
    content = formatContent(content);
    if (content.length > len) {
        return content.substring(len) + '...';
    }
    return content;
});


module.exports = template;


function formatContent(content) {
    content = content ? content.replace(/\n/g, '<br>').replace(/&amp;/g, '&') : '';
    content = content.replace(/\[lesson:(.+)?\]/g,'<a href="$1" target="_blank" class="view iconfont icon-link">查看详情</a>');//转换链接
    content = content.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g,'<a href="$&" target="_blank" class="link">$&</a>');
    return content;
}