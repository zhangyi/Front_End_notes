/**
 * @author ZhangY
 * @version v1.0
 * @fileoverview　拖拽类
 * @requires core
 */
if(typeof GD.ui === 'undefined') {
	GD.ui = {};
}

/**
 * 拖拽管理器，负责对dom对象进行拖拽的绑定。
 * 
 * @namespace GD.ui.DragDrop
 */
GD.ui.DragDrop = {
	/**
	 * 拖拽池，用来记录已经注册拖拽的对象
	 */
	dragdropPool : {},
	
	/**
	 * 拖拽对象临时ID.
	 * 
	 * @ignore
	 */
	dragTempId : 0,
	
	/**
	 * 自动滚屏的感知范围
	 */
	_scrollRange : 0,
	
	/**
	 * 拖拽的默认样式
	 */
	dragGhostStyle : "cursor:move;position:absolute;border:1px solid #06c;background:#6cf;z-index:1000;color:#003;overflow:hidden",
	
	/**
	 * 注册拖拽对象, 注册后，返回 GD.ui.DragDrop.eventController 拖放驱动对象
	 * 
	 * @param {HTMLElement} handle 推拽的对象的handler
	 * @param {HTMLElement} target 需要推拽的对象
	 * @param {Object} options 参数 {range,rangeElement,x,y,ghost,ghostSize,ghostStyle} <br/><br/>
	 *            range [top,left,bottom,right] 指定一个封闭的拖放区域,参数可以不必全设置，留空或设置为非数字如null[top,left,bottom,right]或为number
	 *            rangeElement [element,[top,left,bottom,right],isStatic] 制定拖放区域的对象，限制物体只能在这个区域内拖放。 
	 *            使用条件：[top,left,bottom,right] 是0或1,rangeElement和target必须是同一个坐标系，而且target必须在rangeElement内
	 *            isStatic {boolean} 是指 rangeElement没有使用独立的坐标系--例没有margin等(默认值是flase)。
	 *            
	 *            x,y 刻度偏移量，每次移动的偏移量
	 *            ghost 如果拖放的对象是浮动的，是否拖放出现影子 
	 *            ghostSize 代理层的尺寸，当设置了尺寸，初始位置就以鼠标位置定位了
	 *            注意 ignoreTagName 忽略的tagName 一般用来忽略一些 控件等 例如 object embed autoScroll 是否自动滚屏 cursor 鼠标
	 *            ghostStyle 设置ghost层次的样式
	 * @return 返回 GD.ui.DragDrop.eventController 驱动对象
	 * @type GD.ui.DragDrop.eventController
	 * @example
	 * 			GD.ui.DragDrop.registerDragdropHandler(this.titleElement,this.mainElement,{range:[0,0,'',''],x:50,y:160});
	 */
	registerDragdropHandler : function(handler, target, options) {
		var _hDom = GD$(handler);
				
		if (!_hDom) {//检测是否已设置为可拖拽对象
			return null;
		} else if(this.dragdropPool[_hDom.id]) {
			return this.dragdropPool[_hDom.id];
		}
		
		options = GD.$extend({
			range : [null, null, null, null],
			ghost : 0
		}, options || {});
		
		//不传入默认为自身
		var targetObject = GD$(target) || _hDom;
		!_hDom.id ? (_hDom.id = "DragDrop_" + this.dragTempId++) : "";
		_hDom.style.cursor = options.cursor || "move";
		
		//缓存池内缓存所有拖拽对象
		this.dragdropPool[_hDom.id] = new this.eventController();
		
		//设置绑定事件
		this.dragdropPool[_hDom.id].bindHandler = function(_this) {
			return function() {
				var _args = [_hDom.id, targetObject, options];
				_this.startDrag.apply(_this,[arguments[0]].concat(_args));
			}
		}(this);
		
		//监听对象mousedown事件
		GD.addEvent(_hDom, "mousedown", this.dragdropPool[_hDom.id].bindHandler);
		
		return this.dragdropPool[_hDom.id];
	},

	/**
	 * 取消注册拖拽对象
	 * 
	 * @param {HTMLElement} handle 推拽的对象的handler
	 */
	unRegisterDragdropHandler : function(handler) {
		var _hDom = GD$(handler);
		if (!_hDom || !this.dragdropPool[_hDom.id]) {
			return null
		}
		
		_hDom.style.cursor = "default";
		GD.removeEvent(_hDom, "mousedown", this.dragdropPool[_hDom.id].bindHandler);
		delete this.dragdropPool[_hDom.id].bindHandler;
		delete this.dragdropPool[_hDom.id];
	},
	
	/**
	 * 开始拖放
	 * 
	 * @param {event} e 事件，如果直接截获到的 event element 对象有noDrag=true属性则不进行拖拽
	 * @param {string} handlerId handler 的编号
	 * @param {Object} target 拖放对象
	 * @param {Object} options 参数
	 */
	startDrag : function(e, handlerId, target, options) {
		var _srcElement = GD.getTarget();//获取触发事件源的对象
		if(GD.getButton() !== 0 || _srcElement.noDrag) {//只有鼠标左键才能触发拖拽
			return;
		}
		
		if(options.ignoreTagName == _srcElement.tagName || _srcElement.noDragDrop) {
			return;
		}
		
		var _size = [target.offsetWidth - 0, target.offsetHeight - 0];//不应用getSize取它真宽高
		var _stylePosition = GD.dom.getStyle(target, "position");
		var _isAbsolute = _stylePosition === "absolute" || _stylePosition === "fixed";
		var _ghost = null,
			_hasGhost = false,
			_xy = null;
		
		//限制拖拽的区域
		if(options.rangeElement) {
			var _re = options.rangeElement;
			var _el = GD$(_re[0]);
//			var _elSize = GD.dom.getSize(_el);
			var _elSize = [];
			_elSize[0] = parseInt(_el.clientWidth, 10);
			_elSize[1] = parseInt(_el.clientHeight, 10) + (_isAbsolute == "fixed" ? 0 : GD.dom.getScrollTop());
			var _r = _re[1] || [1, 1, 0, 0];//默认不能超过父层top&&left
			if (!_re[2]){
				options.range = [_r[0] ? 0 : null, _r[1] ? 0 : null, _r[2] ? _elSize[1] : null, _r[3] ? _elSize[0] : null];
			} else {
				var _elXY = GD.dom.getXY(_el);
				options.range = [_r[0] ? _elXY[1] : null, _r[1] ? _elXY[0] : null, _r[2] ? _elXY[1] + _elSize[1] : null, _r[3] ? _elXY[0] + _elSize[0] : null];
			}
		}
		
		var _left = target.style.left,
			_top = target.style.top;
		
		//非绝对定位的对象使用鬼影层
		if(!_isAbsolute || options.ghost) {
			//获取拖拽目标的位置
			if(_isAbsolute && _left && _top) {
				_xy = [parseInt(_left, 10), parseInt(_top, 10)];
			} else {
				_xy = GD.dom.getXY(target);
			}
						
			//如果是 absolute 对象，则在对象的father对象上创建ghost
			_ghost = document.createElement("div");
			_ghost.style.cssText = (options.ghostStyle || this.dragGhostStyle);
			
			(_isAbsolute ? target.parentNode : document.body).appendChild(_ghost);
			_ghost.id = "dragGhost";
			GD.dom.setStyle(_ghost, "opacity", "0.8");
			
			// 延迟设置透明
			setTimeout(function() {
				GD.dom.setStyle(target, "opacity", "0.5");
			}, 0);
			
			if (options.ghostSize) {
				GD.dom.setSize(_ghost, options.ghostSize[0], options.ghostSize[1]);
				_xy = [e.clientX + GD.dom.getScrollLeft() - 30, e.clientY + GD.dom.getScrollTop() - 20];
			} else {
				GD.dom.setSize(_ghost, _size[0] - 2, _size[1] - 2); //2是border宽度即两边1px像素宽度
			}
			
			GD.dom.setXY(_ghost, _xy[0], _xy[1]);
			
			_hasGhost = true;
		} else {
			if(_left && _top) {
				_xy = [parseInt(_left, 10), parseInt(_top, 10)];
			} else {
				_xy = GD.dom.getXY(target);
			}
		}
		_left = _top = null;
		
		var _dragTarget = _ghost || target;
		
		// 缓存当前模块的信息
		var currentDragCache = {
			size : _size,
			xy : _xy,
			mXY : _xy,
			dragTarget : _dragTarget,
			target : target,
			x : e.clientX - parseInt(_xy[0], 10),
			y : e.clientY - parseInt(_xy[1], 10),
			ghost : _ghost,
			hasGhost : _hasGhost,
			isAbsolute : _isAbsolute,
			options : options,
			scrollRangeTop : GD.ui.DragDrop._scrollRange,
			scrollRangeBottom : GD.dom.getClientHeight() - GD.ui.DragDrop._scrollRange,
			maxScrollRange : Math.max(GD.dom.getScrollHeight() - GD.dom.getClientHeight(), 0)
		}
		
		// 监听并绑定拖拽事件
		this.dragdropPool[handlerId].moveHandler = function(_this) {
			return function() {
				var _args = [handlerId, currentDragCache, options];
				_this.doDrag.apply(_this,[arguments[0]].concat(_args));
			}
		}(this);
		
		this.dragdropPool[handlerId].upHandler = function(_this) {
			return function() {
				var _args = [handlerId, currentDragCache, options];
				_this.endDrag.apply(_this,[arguments[0]].concat(_args));
			}
		}(this);
		
		GD.addEvent(document, "mousemove", this.dragdropPool[handlerId].moveHandler);
		GD.addEvent(document, "mouseup", this.dragdropPool[handlerId].upHandler);
		this.dragdropPool[handlerId].onStartDrag.apply(null, [e, handlerId, currentDragCache, options]);
		
		//阻止默认行为
		GD.preventDefault(e);
	},

	/**
	 * 拖放过程
	 * 
	 * @param {event} e 事件
	 * @param {string} handlerId handler 的编号
	 * @param {Object} dragCache 拖放对象cache
	 * @param {Object} options 参数
	 */
	doDrag : function(e, handlerId, dragCache, options) {
		var pos = {};
		
		// 如果没有区域限制，则开启滚屏感知功能
		if (options.autoScroll) {
			if (e.clientY < dragCache.scrollRangeTop) {
				if (!GD.ui.DragDrop._scrollTop) {
					GD.ui.DragDrop._stopScroll();
					
					if(GD.ui.DragDrop._scrollTimer) {
						clearTimeout(GD.ui.DragDrop._scrollTimer);
					}
					
					GD.ui.DragDrop._scrollTimer = setTimeout(function() {
						GD.ui.DragDrop._doScroll(true, dragCache)
					}, 200);
				}
			} else if (e.clientY > dragCache.scrollRangeBottom) {
				if (!GD.ui.DragDrop._scrollBottom) {
					GD.ui.DragDrop._stopScroll();
					
					if(GD.ui.DragDrop._scrollTimer) {
						clearTimeout(GD.ui.DragDrop._scrollTimer);
					}
					
					GD.ui.DragDrop._scrollTimer = setTimeout(function() {
						GD.ui.DragDrop._doScroll(false, dragCache)
					}, 200);
				}
			} else {
				GD.ui.DragDrop._stopScroll();
			}
		}

		var mX = e.clientX - dragCache.x;
		var mY = e.clientY - dragCache.y;
		
		// 如果是拖放参考层
		var xy = this._countXY(mX, mY, dragCache.size, options);
		mX = xy.x;
		mY = xy.y;

		GD.dom.setXY(dragCache.dragTarget, mX, mY);
		dragCache.mXY = [mX, mY];
		
		this.dragdropPool[handlerId].onDoDrag.apply(null, [e, handlerId, dragCache, options]);
		if (GD.Browser.isIE) {
			document.body.setCapture();
		} else if (window.captureEvents) {
			window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		}
		
		//阻止默认行为
		GD.preventDefault(e);
	},

	/**
	 * 结束拖放
	 * 
	 * @param {event} e 事件
	 * @param {string} handlerId handler 的编号
	 * @param {Object} dragCache 拖放对象cache
	 * @param {Object} options 参数
	 */
	endDrag : function(e, handlerId, dragCache, options) {
		if (dragCache.hasGhost) {
			if(dragCache.dragTarget.parentNode) {
				dragCache.dragTarget.parentNode.removeChild(dragCache.dragTarget);
			}
			var _t = dragCache.target;
			setTimeout(function() {
				GD.dom.setStyle(_t, "opacity", "1");
				_t = null;
			}, 0);
			
			// 对象是浮动层
			if (dragCache.isAbsolute) {
				var _x = dragCache.target.style.left;
				var _y = dragCache.target.style.top;
				var x,y;
				if(_x && _y) {
					x = parseInt(_x, 10);
					y = parseInt(_y, 10);
				} else {
					var _getXY = GD.dom.getXY(dragCache.target);
					x = _getXY[0];
					y = _getXY[1];
					_getXY = null;
				}
				x += (dragCache.mXY[0] - dragCache.xy[0]);
				y += (dragCache.mXY[1] - dragCache.xy[1]);
				
				var xy = this._countXY(x, y, dragCache.size, options);
				GD.dom.setXY(dragCache.target, xy.x, xy.y);
				_x = _y = x = y = xy = null;
			}
		}
		
		GD.removeEvent(document, "mousemove", this.dragdropPool[handlerId].moveHandler);
		GD.removeEvent(document, "mouseup", this.dragdropPool[handlerId].upHandler);
		this.dragdropPool[handlerId].onEndDrag.apply(null, [e, handlerId, dragCache, options]);		
		GD.ui.DragDrop._stopScroll();
		
		if (GD.Browser.isIE) {
			document.body.releaseCapture();
		} else if (window.releaseEvents){
			window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		}
		
		delete this.dragdropPool[handlerId].moveHandler;
		delete this.dragdropPool[handlerId].upHandler;
		dragCache = null;
	},

	/**
	 * 开始滚屏
	 */
	_doScroll : function(isUp, dc) {
		step = isUp ? -15 : 15;
		var _st = GD.dom.getScrollTop();
		if (isUp && _st + step < 0) {
			step = 0;
		}

		if (!isUp && _st + step > dc.maxScrollRange) {
			step = 0;
		}

		GD.dom.setScrollTop(_st + step);
		dc.y = dc.y - step;
		GD.ui.DragDrop._scrollTop = isUp;
		GD.ui.DragDrop._scrollBottom = !isUp;
		
		if(GD.ui.DragDrop._scrollTimer) {
			clearTimeout(GD.ui.DragDrop._scrollTimer);
		}
		GD.ui.DragDrop._scrollTimer = setTimeout(function() {
			GD.ui.DragDrop._doScroll(isUp, dc)
		}, 16);
	},
	
	/**
	 * 停止滚动屏幕
	 */
	_stopScroll : function() {
		this._scrollTop = this._scrollBottom = false;
		if(this._scrollTimer) {
			clearTimeout(this._scrollTimer);
		}
	},

	/**
	 * 计算坐标
	 */
	_countXY : function(x, y, size, options) {
		var pos = {
			x : x,
			y : y
		};
		
		// 计算横坐标刻度
		if (options.x) {		
			pos["x"] = parseInt(pos["x"]/options.x,10) * options.x + (pos["x"] % options.x<options.x/2?0:options.x);
		}
		
		// 计算纵坐标刻度
		if (options.y) {
			pos["y"] = parseInt(pos["y"]/options.y,10) * options.y + (pos["y"] % options.y<options.y/2?0:options.y);
		}

		// 计算拖拽范围
		if (options.range) {
			var _r = options.range;
			var i = 0, j = 0;
			while (i < _r.length && j < 2) {
				// 非数字返回
				if (typeof _r[i] != "number") {
					i++;
					continue;
				};
				// 判断对象是否靠边
				var k = i % 2 ? "x" : "y";
				var v = pos[k];
				pos[k] = i < 2 ? Math.max(pos[k], _r[i]) : Math.min(pos[k], _r[i] - size[(i + 1) % 2]);
				if (pos[k] != v) {
					j++;
				};
				i++;
			}
		}
		return pos;
	}
};
/**
 * 拖放事件驱动
 * 
 * @constructor GD.ui.DragDrop.eventController
 */
GD.ui.DragDrop.eventController = function() {
	this.onStartDrag = GD.emptyFn;
	this.onDoDrag = GD.emptyFn;
	this.onEndDrag = GD.emptyFn;
};
