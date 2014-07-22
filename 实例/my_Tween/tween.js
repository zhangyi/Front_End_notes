/**
 * @author ZhangYi
 * @fileoverview Tween类，主要负责参数计算以实现动画效果
 */
if(typeof(GD) === 'undefined') {
	var GD = {};
}

GD.getElem = function(id) {
	return 'string' === typeof(id) ? document.getElementById(id) : id;
}

GD.transitions = {
	/**
	 * 简单算子，作为默认算子
	 */
	simple : function(time, startValue, changeValue, duration) {
		return changeValue * time / duration + startValue;
	},

	/**
	 * 有规律地渐进效果
	 */
	regularEaseIn : function(t, b, c, d) {
		return c * (t /= d) * t + b;
	},
	/**
	 * 有规律地渐出效果
	 */
	regularEaseOut : function(t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},
	/**
	 * 有规律地渐进渐出效果
	 */
	regularEaseInOut : function(t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
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
		return c - QZFL.transitions.bounceEaseOut(d - t, 0, c, d) + b;
	},

	bounceEaseInOut : function(t, b, c, d) {
		if (t < d / 2) {
			return QZFL.transitions.bounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
		} else
			return QZFL.transitions.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	},

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
 * 
 * @param {HTMLElement|String} el el html
 * @param {String} propName 对象的属性名
 * @param {String} func 算子函数名称
 * @param {String|Number} startValue 初始值
 * @param {String|Number} finishValue 结束值
 * @param {number} duration  动画的执行时间, 秒单位
 * @constructor
 * @example
 * 
 * var tw = new GD.Tween("bar","width",null,"1px","300px",1);
 * 			tw.start();
 */
GD.Tween = function(el, propName, func, startValue, finishValue, duration) {
	this._func = (!!func && GD.transitions.hasOwnProperty(func)) ? GD.transitions[func] : GD.transitions.simple;
	this._obj = GD.getElem (el);
	this._prop = propName;
	
	//传入变量其后置单位，如px、em等
	var reSuffix = /\d+([a-z%]+)/i.exec(startValue);
	this._suffix = reSuffix ? reSuffix[1] : "";
	
	//freq表示频率，也就是多少时间刷新一桢，默认为24，即1秒刷新24桢
	this._freq = 24;
	
	//判断是否是颜色值
	this.isColor = /^#/.test(startValue);
	
	if(this.isColor) {
		this._startColor = this.parseColor(startValue);
		this._finishColor = this.parseColor(finishValue);
	}
	
	this._startValue = this.isColor ? 0 : parseFloat(startValue);
	this._finishValue = this.isColor ? 100 : parseFloat(finishValue);
	
	this._duration = duration || 10;
	this._timeCount = 0;
	this._startTime = 0;
	
	this._changeValue = this._finishValue - this._startValue;
	this.currentValue = 0;
	
	/**
	 * 是否正在播放
	 */
	this.isPlayed = false;

	/**
	 * 是否循环
	 */
	this.isLoop = false;
	
	this._runTimer = null;
	
	/**
	 * 动画开始
	 * 
	 * @event 动画开始
	 */
	this.onMotionStart = function() {};
	/**
	 * 动画正在执行
	 * 
	 * @param {object} obj 对象
	 * @param {string} prop 对象属性
	 * @param {string|number} value 结算结果
	 * @event 动画执行中
	 */
	this.onMotionChange = function() {};
	
	/**
	 * 动画停止播放
	 * 
	 * @event 动画停止播放
	 */
	this.onMotionStop = function() {};
}

/**
 * 开始执行动画
 * @param {Boolean|String} 是否循环播放动画
 */
GD.Tween.prototype.start = function(loop) {
	this._reloadTimer();
	this.isPlayed = true;
	this._runTime();
	this.isLoop = loop ? true : false;
	this.onMotionStart.apply(this);
}

/**
 * 暂停执行动画
 */
GD.Tween.prototype.pause = function() {
	this.isPlayed = false;
}

/**
 * 停止执行动画
 */
GD.Tween.prototype.stop = function() {
	this.isPlayed = false;
	this._playTime(this._duration + 0.1);
}

/**
 * 初始化动画开始时间
 */
GD.Tween.prototype._reloadTimer = function() {
	this._startTime = +new Date() - this._timeCount * 1000;
}

/**
 * 执行动画
 */
GD.Tween.prototype._runTime = function() {
	clearTimeout(this._runTimer);
		
	if (this.isPlayed) {
		this._playTime( (+new Date() - this._startTime) / 1000 );
		
		var $pointer = this;
		var delay = Math.floor(1000 / this._freq);
		
		this._runTimer = setTimeout(function() {
			$pointer._runTime.apply($pointer);
		}, delay);
	}
}
/**
 * 通过时间计算动画
 * 
 * @param {time} time 时间参数
 */
GD.Tween.prototype._playTime = function(time) {
	var _isEnd = false;
	if (time > this._duration) {
		time = this._duration;
		_isEnd = true;
	}
	
	// 计算属性值
	var pValue = this._func(time, this._startValue, this._changeValue, this._duration);
	
	// 判断是否需要取整
	this.currentValue = /(opacity)/i.test(this._prop) ? pValue : Math.round(pValue);
	
	// 是否需要处理颜色
	if (this.isColor) {
		this.currentValue = this.getColor(this._startColor, this._finishColor, pValue);
	}
	
//	if(this._obj['style'][this._prop]) {
		this._obj['style'][this._prop] = this.currentValue + this._suffix;
//	}
	
	this.onMotionChange.apply(this, [this._obj, this._prop, this.currentValue]);
	
	// 判断是否播放结束
	if (_isEnd) {
		this.isPlayed = false;
		// 循环播放
		if (this.isLoop) {
			this.isPlayed = true;
			this._reloadTimer();
		}
		this.onMotionStop.apply(this);

		// 播放完成强迫IE回收内存
		if (window.CollectGarbage)
			CollectGarbage();
	}
}

/**
 * 设置Animation的频率
 * @param {Number} freq 动画的执行频率
 */
GD.Tween.prototype.setFrequency = function(freq) {
	this._freq = freq;
}
/**
 * 获得动画播放百分比
 * 
 * @return 返回百分比数值
 */
GD.Tween.prototype.getPercent = function() {
	return (this.currentValue - this._startValue) / this._changeValue * 100;
};
GD.Tween.prototype.setStyle = function(el, property, value) {
	el = el || this._obj;
	if (!el || el.nodeType == 9) {
		return false;
	}
	var w3cMode = document.defaultView && document.defaultView.getComputedStyle;

	switch (property) {
		case "float" :
			property = w3cMode ? "cssFloat" : "styleFloat";
		case "opacity" :
			if (!w3cMode) {// for ie only
				if (value >= 1) {
					el.style.filter = "";
					return;
				}
				el.style.filter = 'alpha(opacity=' + (value * 100) + ')';
				return true;
			} else {
				el.style[property] = value;
				return true;
			}
			break;
		default :
			if (typeof el.style[property] == "undefined") {
				return false
			}
			el.style[property] = value;
			return true;
	}
}
/**
 * 根据百分比计算颜色过渡值
 * 
 * @param {array|string} startColor 初始颜色值10进制 RGB 格式
 * @param {array|string} finishColor 目标颜色值10进制 RGB 格式
 * @param {number} percent 百分比
 * @return 返回16进制颜色
 */
GD.Tween.prototype.getColor = function(startColor, finishColor, percent) {
	var _sc = startColor;
	var _fc = finishColor;
	var _color = [];

	if (percent > 100) {
		percent = 100;
	}
	if (percent < 0) {
		percent = 0;
	}

	for (var i = 0; i < 3; i++) {
		_color[i] = Math.floor(_sc[i] * 1 + (percent / 100) * (_fc[i] - _sc[i])).toString(16);
		if (_color[i].length < 2) {
			_color[i] = "0" + _color[i];
		}
	}

	return "#" + _color.join("");
}
/**
 * parse a color to be handled by the animation, supports hex and rgb (#FFFFFF, #FFF, rgb(255, 0, 0))
 * @param {String} str The string value of an elements color
 * @return {Array} The rgb values of the color contained in an array
 */
GD.Tween.prototype.parseColor = (function(){
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
	}
})();
