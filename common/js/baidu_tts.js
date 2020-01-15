/**
 * 浏览器调用语音合成接口
 * @param {Object} param 百度语音合成接口参数
 * 请参考 https://ai.baidu.com/docs#/TTS-API/41ac79a6
 * @param {Object} options 跨域调用api参数
 *           timeout {number} 超时时间 默认不设置为60秒
 *           volume {number} audio控件音量，范围 0-1
 *           hidden {boolean} 是否隐藏audio控件
 *           autoDestory {boolean} 播放音频完毕后是否自动删除控件
 *           onInit {Function} 创建完audio控件后调用
 *           onSuccess {Function} 远程语音合成完成，并且返回音频文件后调用
 *           onError {Function}  远程语音合成完成，并且返回错误字符串后调用
 *           onTimeout {Function} 超时后调用，默认超时时间为60秒
 */
function btts(param, options, radioObj) {
    console.log("Can print log?yes");
    var url = 'https://tsn.baidu.com/text2audio';
    var opt = options || {};
    var p = param || {};

    // 默认超时时间60秒
    var DEFAULT_TIMEOUT = 60000;
    var timeout = opt.timeout || DEFAULT_TIMEOUT;
    
    // 创建XMLHttpRequest对象
    var xhr = new XMLHttpRequest();
    console.log("Go here?yes");
    xhr.open('POST', url);
    
    // 创建form参数
    var data = {};
    for (var p in param) {
        data[p] = param[p]
    }

    // 赋值预定义参数
    data.cuid = data.cuid || data.tok;
    data.ctp = 1;
    data.lan = data.lan || 'zh';
    data.aue = data.aue || 3;

    // 序列化参数列表
    var fd = [];
    for(var k in data) {
        fd.push(k + '=' + encodeURIComponent(data[k]));
    }
    
    
    // 用来处理blob数据
    var frd = new FileReader();
    xhr.responseType = 'blob';
    xhr.send(fd.join('&'));

    // 用timeout可以更兼容的处理兼容超时
    var timer = setTimeout(function(){
        xhr.abort();
        isFunction(opt.onTimeout) && opt.onTimeout();
    }, timeout);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            clearTimeout(timer);
            if (xhr.status == 200) {
                if (xhr.response.type === 'audio/mp3') {
                    console.log(URL.createObjectURL(xhr.response));
                    radioObj.src = URL.createObjectURL(xhr.response);
                }

                // 用来处理错误
                if (xhr.response.type === 'application/json') {
                    frd.onload = function(){
                        var text = frd.result;
                        isFunction(opt.onError) && opt.onError(text);
                    };
                    frd.readAsText(xhr.response);
                }
            }
        }
    }

    // 判断是否是函数
    function isFunction(obj) {
        if (Object.prototype.toString.call(obj) === '[object Function]') {
            return true;
        }
        return false;
    }
}

export default {  
    btts  
}