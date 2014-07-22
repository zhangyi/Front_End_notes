/**
 * @author ZhangYi
 */

/**
 * 
 * @param {HTMLElement|String} el HTMLElement|DOM对象
 * @param {Object|null} attributes 执行动画时需要更新的属性值
 * @param {Number} duration	动画执行时间
 * @param {String|Null} transition 动画算子函数
 */
function Fx(el, attributes, duration, func) {
	this._obj = Fx.DOM.get(el);
	this._attributes = attributes || {};
	this._duration = duration || 10;
	
	if(!!func && typeof(Fx.transitions[func]) === "function") {
		this._animateType = func;
	} else {
		this._animateType = "simple";
	}
	
	this._func = Fx.transitions[this._animateType];
	
	this.isPlayed = false;
	this.isLoop = false;
	
	this._intervalTimer = null;
	this._startTime = 0;
	this._moveTime = 0;
	
	//动画执行频率
	this._freq = 24;
	
	this.units = {};
	this.frame = {};
	this.endAttr = {};
	this.startAttr = {};
	
	//开始执行动画
	this.onMotionStart = function() {};
	
	//动画正在执行
	this.onMotionChange = function() {};
	
	//动画执行结束
	this.onMotionStop = function() {};
	
	return this;
}

Fx.prototype = {
	//启动定时器执行动画
	_runTime : function() {
		clearInterval(this._intervalTimer);
		
		if (this.isPlayed) {
			this._moveTime = new Date().getTime() - this._startTime;
			
			this._playTime( (this._moveTime) / 1000 );
			
			var $pointer = this;
			var delay = Math.floor(1000 / this._freq);
			
			this._intervalTimer = setInterval(function() {$pointer._runTime.apply($pointer);}, delay);
		}
	},
	/**
	 * 定时器启动时执行的动画
	 * @param {Number} time
	 */
	_playTime : function(time) {
		var _isEnd = false;
		if (time > this._duration) {
			time = this._duration;
			_isEnd = true;
			this.frame = Fx.objectClone(this.endAttr);
		} else {
			for(attr in this.startAttr){ 
				if( '[object Array]' === Object.prototype.toString.apply(this.startAttr[attr]) ){
					this.frame[attr] = [];
					for(var i=0; i < this.startAttr[attr].length; i++){
						this.frame[attr][i] = this._ease(this.startAttr[attr][i], this.endAttr[attr][i], time);
					}
				} else {
					this.frame[attr] = this._ease(this.startAttr[attr], this.endAttr[attr], time);
				}
			}
		}
		
		this.setAttributes();
		this.onMotionChange.apply(this, arguments);
		
		// 判断是否播放结束
		if (_isEnd) {
			this.isPlayed = false;
			
			this.onMotionStop.apply(this);
			
			// 循环播放
			if (this.isLoop) {
				this.isPlayed = true;
				this.frame = Fx.objectClone(this.startAttr);
				this._reloadTimer();
			}
			
			if (window.CollectGarbage) {
				CollectGarbage();
			}
		}
	},
	//重新计算动画开始时间
	_reloadTimer : function() {
		this._startTime = +new Date();
	},
	/**
	 * 调用动画算子函数，返回执行结果
	 * 
	 * @param {Number} start
	 * @param {Number} end
	 * @param {Number} time
	 */
	_ease : function(start, end, time) {
		return this._func(time, start, end - start, this._duration);
	},
	/**
	 * 设置动画执行的频率 1秒执行多少次
	 */
	setFrequency : function(freq) {
		this._freq = freq;
	},
	/**
	 * 开始播放动画
	 * @param {Boolean} loop
	 */
	start : function(loop) {
		this.getAttributes();
		this._reloadTimer();
		
		this._start.apply(this, arguments);
	},
	/**
	 * 共用的开始执行动画函数
	 * @param {Boolean} loop
	 */
	_start : function(loop) {
		this.isPlayed = true;
		this.isLoop = loop ? true : false;
		this._runTime();
		this.onMotionStart.apply(this);
	},
	/**
	 * 继续播放
	 * @param {Boolean} loop
	 */
	play : function(loop) {
		this._startTime = +new Date() - this._moveTime;
		
		this._start.apply(this, arguments);
	},
	/**
	 * 重新播放
	 * @param {Boolean} loop 是否循环播放动画
	 */
	rePlay : function(loop) {
		this._reloadTimer();
		
		this._start.apply(this, arguments);
	},
	/**
	 * 暂停播放动画
	 */
	pause : function() {
		this.isPlayed = false;
		this.isLoop = false;
	},
	/**
	 * 停止播放动画
	 */
	stop : function() {
		this.pause();
		
		this._playTime(this._duration + 0.1);
	},
	getAttributes : function() {
		for(var attr in this._attributes) {
			
			if(!this._attributes.hasOwnProperty(attr)) {
				continue;
			}
			
			switch(attr){
				case 'color':
				case 'borderColor':
				case 'border-color':
				case 'backgroundColor':
				case 'background-color':
					this.startAttr[attr] = Fx.parseColor(this._attributes[attr].from || Fx.DOM.getStyle(this._obj, attr));
					this.endAttr[attr] = Fx.parseColor(this._attributes[attr].to);
					break;
				case 'scrollTop':
				case 'scrollLeft':
					var el = (this._obj === document.body) ? (/AppleWebKit/i.test(navigator.userAgent) ? document.body : document.documentElement) : this._obj;
					
					var start = this._attributes[attr].from || el[attr];
					var end = this._attributes[attr].to;
					if(end && /^([+-])(\d+)$/.test(this._attributes[attr].to)) {
						if("+" === RegExp['$1']) {
							end = start + RegExp['$2']*1;
						} else {
							end = start - RegExp['$2']*1;
						}
					}
					
					this.startAttr[attr] = start;
					this.endAttr[attr] = end;
					
					break;
				default:
					var start = parseFloat(this._attributes[attr].from);
					var end = parseFloat(this._attributes[attr].to);
					var units = this._attributes[attr].units || "";
					
					if(attr !== "opacity" && !units) {
						units = "px";
					}
					
					if(!start) {
						start = parseFloat(Fx.DOM.getStyle(this._obj, attr)) || 0;//会转换成px
						
						if(units != "px" && document.defaultView){
							Fx.DOM.setStyle(this._obj, attr, start + units);
						}
					}
					
					if(end && /^([+-])(\d+)$/.test(this._attributes[attr].to)) {
						if("+" === RegExp['$1']) {
							end = start + RegExp['$2']*1;
						} else {
							end = start - RegExp['$2']*1;
						}
					}
					
					this.units[attr] = units;
					this.endAttr[attr] = end;
					this.startAttr[attr] = start;
					
					break;
			}
		}
	},
	setAttributes : function() {
		for(var attr in this.frame){
			switch(attr) {
				case 'opacity':
					Fx.DOM.setStyle(this._obj, attr, this.frame[attr]);
					break;
				case 'scrollLeft':
				case 'scrollTop':
					var el = (this._obj === document.body) ? (/AppleWebKit/i.test(navigator.userAgent) ? document.body : document.documentElement) : this._obj;
					el[attr] = this.frame[attr];
					break;
				case 'color':
				case 'borderColor':
				case 'border-color':
				case 'backgroundColor':
				case 'background-color':
					var rgb = 'rgb('+Math.floor(this.frame[attr][0])+','+Math.floor(this.frame[attr][1])+','+Math.floor(this.frame[attr][2])+')';
					Fx.DOM.setStyle(this._obj, attr, rgb);
					break;
				default:
					Fx.DOM.setStyle(this._obj, attr, this.frame[attr] + this.units[attr]);
					break;
			}
		}
	},
	//获取当前动画已经执行的百分比
	getPercent : function() {
		var percent = this._moveTime/(this._duration*1000);
			percent = Math.min(percent, 1);
			
		return Math.floor(percent*100) + "%";
	}
}

Fx.DOM = {
	/**
	 * 获取DOM节点
	 * @param {String} 需要查找的元素的ID
	 * @return {Element} 返回DOM对象
	 */
	get: function(id){
		return (typeof id === "string") ? document.getElementById(id) : id;
	},
	/**
	 * 获取元素的指定样式的属性
	 * @param {Element} el 目标元素
	 * @param {String} prop 属性名
	 * @return {Number} 该元素的指定属性的属性值
	 */
	getStyle: function(el, prop){
		prop = this.toCamelCase(prop);
		var view = document.defaultView;
		if(view && view.getComputedStyle){
			return view.getComputedStyle(el, "")[prop] || null;
		}else{
			if(prop == 'opacity'){
				var opacity = el.filters['alpha'] ? el.filters['alpha']['opacity'] : NaN;
				return isNaN(opacity) ? 1 : (opacity ? opacity / 100 : 0);
			}
			return el.currentStyle[prop] || null;
		}
	},
	/**
	 * 设置元素的样式属性
	 * @param {Element} el 目标元素
	 * @param {String} prop  属性名
	 * @param {String} value 属性值
	 */
	setStyle: function(el, prop, value){
		if(prop == 'opacity'){
			el.style.filter = "alpha(opacity=" + value * 100 + ")";
			el.style.opacity = value;
		} else {
			prop = this.toCamelCase(prop);
			if(prop === "height" || prop === "width") {//避免出现负值
				value = Math.max(0, parseInt(value, 10));
			}
			el.style[prop] = value;
		}
	},
	/**
	 * 将一个CSS属性转换为驼峰形式，例如(font-size --> fontSize)
	 * @param {String} 需要转换的CSS属性
	 * @return {String} 转换为驼峰式后的字符串
	 */
	toCamelCase : (function(){
		var cache = {};
		
		return function(str){
			if(!cache[str]){
				var parts = str.split('-'), camel = parts[0];
				if(parts.length > 1){
					for(var i=1, len=parts.length; i < len; i++){
						camel += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
					}
				}
				return cache[str] = camel;
			} else {
				return cache[str];
			}
		}
	})()
}
/**
 * 解析颜色值, 支持16进制与RGB颜色值(#FFFFFF, #FFF, rgb(255, 0, 0))
 * @param {String} 颜色值字符串
 * @return {Array} RGB的颜色数组，默认返白色
 */
Fx.parseColor = (function(){
	var hex6 = (/^#?(\w{2})(\w{2})(\w{2})$/);		
	var hex3 = (/^#?(\w{1})(\w{1})(\w{1})$/);	
	var rgb = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/); 
						   
	return function(str){      
		var color = str.match(hex6);
		if(color && color.length == 4){
			return [parseInt(color[1], 16), parseInt(color[2], 16), parseInt(color[3], 16)];
		}
		
		color = str.match(rgb);
		if(color && color.length == 4){
			return [parseInt(color[1], 10), parseInt(color[2], 10), parseInt(color[3], 10)];
		}
	
		color = str.match(hex3);
		if(color && color.length == 4){
			return [parseInt(color[1] + color[1], 16), parseInt(color[2] + color[2], 16), parseInt(color[3] + color[3], 16)];
		}
		
		return [255, 255, 255];
	}
})();

/**
 * 动画的算子函数
 */
Fx.transitions = {
	//linear
	linearEase : function(t, b, c, d) {
		return c*t/d + b;
	},
	simple : function(time, startValue, changeValue, duration) {
		return changeValue * time / duration + startValue;
	},
	//circ
	circEaseIn : function(t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	circEaseOut : function(t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	circEaseInOut : function(t, b, c, d) {
		if ((t/=d/2) < 1) {
			return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		}

		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	//cubic
	cubicEaseIn : function(t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	cubicEaseOut : function(t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	cubicEaseInOut : function(t, b, c, d) {
		if ((t/=d/2) < 1) {
			return c/2*t*t*t + b;
		}
		return c/2*((t-=2)*t*t + 2) + b;
	},
	//expo
	expoEaseIn : function(t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	expoEaseOut : function(t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	expoEaseInOut : function(t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},	
	//quad
	quadEaseIn : function(t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	quadEaseOut : function(t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	quadEaseInOut : function(t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	//quart
	quartEaseIn : function(t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	quartEaseOut : function(t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	quartEaseInOut : function(t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	//quint
	quintEaseIn : function(t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	quintEaseOut : function(t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	quintEaseInOut : function(t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	//sine
	sineEaseIn : function(t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	sineEaseOut : function(t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	sineEaseInOut : function(t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	//regular
	regularEaseIn : function(t, b, c, d) {
		return c * (t /= d) * t + b;
	},
	regularEaseOut : function(t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},
	regularEaseInOut : function(t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	//back
	backEaseIn : function(t, b, c, d) {
		var s = 1.70158;
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},

	backEaseOut : function(t, b, c, d, a, p) {
		var s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},

	backEaseInOut : function(t, b, c, d, a, p) {
		var s = 1.70158;
		if ((t /= d / 2) < 1) {
			return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		}
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	//bounce
	bounceEaseOut : function(t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
		}
	},

	bounceEaseIn : function(t, b, c, d) {
		return c - Fx.transitions.bounceEaseOut(d - t, 0, c, d) + b;
	},

	bounceEaseInOut : function(t, b, c, d) {
		if (t < d / 2) {
			return Fx.transitions.bounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
		} else
			return Fx.transitions.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	},
	//strong
	strongEaseIn : function(t, b, c, d) {
		return c * (t /= d) * t * t * t * t + b;
	},

	strongEaseOut : function(t, b, c, d) {
		return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	},
	strongEaseInOut : function(t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t * t * t * t + b;
		}
		return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	},
	//elastic
	elasticEaseIn : function(t, b, c, d, a, p) {
		if (t == 0)
			return b;
		if ((t /= d) == 1)
			return b + c;
		if (!p)
			p = d * 0.3;
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	elasticEaseOut : function(t, b, c, d, a, p) {
		if (t == 0)
			return b;
		if ((t /= d) == 1)
			return b + c;
		if (!p)
			p = d * 0.3;
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
	},
	elasticEaseInOut : function(t, b, c, d, a, p) {
		if (t == 0) {
			return b;
		}

		if ((t /= d / 2) == 2) {
			return b + c;
		}

		if (!p) {
			var p = d * (0.3 * 1.5);
		}

		if (!a || a < Math.abs(c)) {
			var a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	}
}
/**
 * 深度复制对象
 * 
 * @param {Object} obj	复制对象
 * @param {Property} preventName 不需要进行复制的对象属性
 */
Fx.objectClone = function(obj, preventName) {
	if ((typeof obj) == 'object') {
        var res = '[object Array]' === Object.prototype.toString.apply(obj) ? [] : {};
        for (var i in obj) {
            if (i != preventName) res[i] = arguments.callee(obj[i], preventName);
        }
        return res;
    } else if ((typeof obj) == 'function') {
        return (new obj()).constructor;
    }
    return obj;
}
