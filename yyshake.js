/**
 * @file map yunying shake unit
 * @author zhanglei<hi:zhanglei55>
 */
;
(function (window) {

    if(!('ondevicemotion' in window) ){
        window.yyshake = false;
        return;
    }

    function abs(n){
        if (n) {
            return Math.abs(n);
        } else {
            return 0;
        }
    }

    var yyshake = (function(){
        var threshold = 15,
            listening = false, shaking = false,
            lastX = null, lastY = null, lastZ = null,
            lastMotionTime, count = 0 , timer = null,
            callbacks = [];

        /*
        * pop a callback for the callbacks queue
        */
        function popCallback(obj) {
            callbacks.some(function(e, i) {
                if(e.callback === obj){
                    callbacks.splice(i, 1);
                    return true;
                }
            });
        }

        /*
        * push a callback into the callbacks queue
        */
        function pushCallback(obj, one) {
            var result = callbacks.some(function(e, i) {
                if(e.callback === obj){
                    return true;
                }
            });

            (!result) && callbacks.push({
                callback: obj,
                one: one
            });
        }

        /*
        * trigger callbacks by different types, 
        * begin / lasting / end
        */
        function trigger(type) {
            var args = Array.prototype.slice.call(arguments,1);
            switch (type) {
                case "end":
                    callbacks = callbacks.filter(function(e) {
                        if (typeof e.callback === 'object') {
                            e.callback['end'] && e.callback['end'].apply(window, args);
                        } else {
                            e.callback.apply(window, args);
                        }

                        if (e.one) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                    
                    break;
                default:
                    callbacks.forEach(function(e, i) {
                        if (typeof e.callback === 'object') {
                            e.callback[type] && e.callback[type].apply(window, args);
                        }
                    });
                    break;
            }
        }

        /*
        * config the shake , for now , only threshold needed
        * options: {
        *       threshold : 20 
        *    }
        */
        function config(options){
            if (typeof options === 'object') {
                if(options.threshold){
                    threshold = options.threshold;
                }
            }
        }

        /**
        * add callback to the callbacks queue ,
        * @param callback 
        *       it can be a function => means a shake end callback
        *       it can be a object => begin/lasting/end 
        * @param one  
        *       if one is set to be true, means the callback only can be fired for once time.        
        */
        function addListener(callback, one) {
            one = one ? true : false;
            pushCallback(callback, one);  
        }

        /**
        *  @param callback 
        *           if it's set to be null/undefined, it will clears out the callbacks queue for all.
        */
        function removeListener(callback) {
            if (callback) {
                popCallback(callback);
            } else {
                callbacks = [];
            }
        }

        /*
        *   start listening the devicemotion
        */
        function start() {
            checkListening(true);   
        }

        /*
        *   stop listening the devicemotion
        */
        function stop() {
            checkListening(false);
        }

        function checkListening(toListen) {
            if (toListen) {
                if(!listening) {
                    window.addEventListener("devicemotion", handler, false);
                    listening = true;
                }  
            } else {
                if(listening) {
                    window.removeEventListener("devicemotion", handler, false);
                    listening = false;
                }
            }
        }

        /*
        * devicemotion handler && see if the motion can be a shake
        */
        function handler(e) {
            var current = e.accelerationIncludingGravity;
            if ((lastX === null) && (lastY === null) && (lastZ === null)) {
                lastX = current.x;
                lastY = current.y;
                lastZ = current.z;
                lastMotionTime = new Date().getTime();
                count = 0;
                timer = null;
                return;
            }
            
            var currentMotionTime = new Date().getTime(),
                deltaMT = currentMotionTime - lastMotionTime,
                deltaX = abs(lastX - current.x),
                deltaY = abs(lastY - current.y),
                deltaZ = abs(lastZ - current.z),
                deltaMax = Math.floor(Math.max(deltaX, deltaY));
            lastMotionTime = currentMotionTime;
            lastX = current.x;
            lastY = current.y;
            lastZ = current.z;

            if (deltaMax >= threshold) {
                if(count === 0) {
                    trigger("begin");
                    shaking = true;
                } else {
                    trigger("lasting", true, {
                        deleta: deltaMax, 
                        interval: deltaMT,
                        threshold: threshold
                    });
                }
                count++;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    trigger("end");
                    lastX = null;
                    lastY = null;
                    lastZ = null;
                    shaking = false;
                }, 200);
            } else {
                shaking && trigger("lasting", false, {
                    delta: deltaMax, 
                    interval: deltaMT,
                    threshold: threshold
                });
            }
        }

        return {
            config: config,
            addListener: addListener,
            removeListener: removeListener,
            start: start,
            stop: stop
        };
    })();

    window.yyshake = yyshake;
})(window);