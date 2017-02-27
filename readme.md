##tips

1. device-orientation 规范:http://w3c.github.io/deviceorientation/spec-source-orientation.html
2. devicemotion必须应用在window上。
3. jquery中兼容不支持device-orientation的做法是监听throttledresize事件(window-resize事件的封装)



##简介

该组件的核心是监听devicemotion事件，当一连串的devicemotion事件达到一定的规则，就可以判断是一个摇一摇动作。


##使用

###判断是否浏览器是否支持摇一摇: window.yyshake

    if (window.yyshake) {
        alert("DeviceOrientation supported!")
    } else {
        alert("DeviceOrientation not supported!")
    }


###config()

yyshake.config(options)，对摇一摇的判断做一些设置，目前提供的配置项有：

+ threshold: 判断摇晃力度是否达到摇一摇的阈值，默认是15，值越高摇晃力度就需要越大，建议不超过20，在一些低端android浏览器下，摇晃力度的值用劲摇只能达到20到30；

示例：

    yyshake.config({
        threshold: 20
    })

###start()

启动对devicemotion事件/摇一摇事件的监听。
    
    yyshake.start();

###stop()

关闭对devicemotion事件/摇一摇事件的监听。
    
    yyshake.stop();


###addListener(callback, one)

对摇一摇动作添加监听者，注意添加监听者，仅仅将监听者加入监听者队列。如果要开始监听摇一摇事件，还需要调用`yyshake.start()`

+ callback:
    1. callback是object，可提供三个值：
        + begin: function(){}, 摇一摇动作开始的回调函数.
        + lasting: function(b, data),摇一摇过程中持续回调，大约40~120ms回调一次，根据手机性能，越好，回调越快。

            > + b: boolean， 该次回调的动作，摇晃力度是否超过阈值，若超过，`b=true`，否则 `b=false`
            > + data: 其余可选的参数，有delta, interval, threshold
            >    
            >       1. delta: 该次回调摇晃力度
            >       2. interval: 距离上一次回调的时间间隔，一般在40ms ~ 120ms之间
            >       3. threshold: 阈值

        + end: function(){} , 摇一摇动作结束的回调函数
    2. callback是function, 则该callback作用同end，摇一摇动作结束的回调
+ one: boolean ,设置该回调是否只执行一次，默认false

事例1：

    var callback11 = {
        begin: function() {
            console.log("begin");
            //dosomething
        },
        end: function() {
            console.log("end");
            //dosomething
        }
    }
    window.yyshake.addListener(callback11);


事例2：

    var callback22 = function() {
            console.log("end");
            //dosomething
        }
    window.yyshake.addListener(callback22, true);

###removeListener(callback)

删除特定的监听者，callback可以为object，也可以是function，若callback=undefined，默认删除所有监听者

    window.yyshake.removeListener();
    //or
    window.yyshake.removeListener(callback11);
