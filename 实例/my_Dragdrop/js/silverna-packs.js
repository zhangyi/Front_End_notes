/*******************************************************
 *                                                     *
 *******************************************************/
//一些异常
function ImplementationException(msg){
	msg = msg || "接口未正确实现！";
	var _e = new Error(msg);
	_e.number = "0x101001";
	return _e;
}
function EnvironmentException(msg){
	msg = msg || "运行环境错误！";
	var _e = new Error(msg);
	_e.number = "0x101002";
	return _e;
}
function TypeNotFoundException(msg){
	msg = msg || "指定类型不存在或无法实例化！";
	var _e = new Error(msg);
	_e.number = "0x101004";
	return _e;
}
//空函数
var $void = function(){
}
//$pack函数当参数个数为1的时侯返回该参数，否则返回一个参数表
var $pack = function(){
	if(arguments.length == 1)
		return arguments[0];
	else
		return Array.apply(null, arguments);
}
//抽象函数，定义接口时使用，如果被调用，则抛出异常
//Silverna中所有未实现的接口也调用此函数
var $abstract = function(){
	throw new ImplementationException();
}
var Silverna = {
	version : "2.0.0.1.20070726",
	author : "akira",
	implementation : $abstract
}
//获得浏览器屏幕窗口的大小
window.clientRect = function() 
{     
	var w = (window.innerWidth) ? window.innerWidth : 
		(document.documentElement && document.documentElement.clientWidth) 
			? document.documentElement.clientWidth : document.body.offsetWidth;     
	var h = (window.innerHeight) ? window.innerHeight : 
		(document.documentElement && document.documentElement.clientHeight) 
			? document.documentElement.clientHeight : document.body.offsetHeight;     
	return {width:w,height:h}; 
} 
//获得页面文档的大小
window.pageRect = function() 
{     
	var w = (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;     
	var h = (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;     
	return {width:w,height:h}; 
}
//判断是否是IE浏览器
function $isIE()
{
	return /msie/i.test(navigator.userAgent);
}
//判断是否是Firefox浏览器
function $isFF()
{
    return /firefox/i.test(navigator.userAgent);
}
//判断是否是IE7.0浏览器
function $isIE7()
{
	return /msie 7/i.test(navigator.userAgent);
}
//获得文档的head，如果有的话
function $head(){
	var heads = document.getElementsByTagName("head"); 
	return heads ? heads[0] : null;
}
//获得文档的body，如果有的话
function $body(){
	var bodys = document.getElementsByTagName("body");
	return bodys ? bodys[0] : null;
}
//获得Silverna核心脚本所在的script DOM对象
var $script = (function(){
	var scripts = document.getElementsByTagName("script");
	return scripts.length ? scripts[scripts.length - 1] : null;
})();
//获得Silverna核心脚本的运行路径
function $root()
{
	return $script.getAttribute("src").replace(/[^\/]+$/g,'');
}
//检测一个包或者对象是否存在，不存在则抛出异常
function $require(packs)
{
	try{
		var obj = eval(packs);
		if(obj == null) throw new Error();
		return obj;
	}
	catch(ex)
	{
		throw new EnvironmentException("包或对象" + packs + "加载失败，是否未包含必要的文件？");
	}
}
//用指定参数依次检测一组closure的执行结果，如果正常执行，则返回该执行结果，否则检测下一个
//最后一个参数可以是一个参数列表
function $try(){
	var _args = arguments[arguments.length - 1];
	var len = arguments.length - 1;
	if(_args instanceof Function){
		_args = [];
		len++;
	}
	
	for(var i = 0; i < len; i++)
	{
		try{
			return arguments[i].apply(this, _args);
		}
		catch(ex){
		}
	}
}

//Iterator 迭代器原型
function Iterator(){}
Iterator.prototype.next = $abstract;
Iterator.prototype.hasNext = $abstract;
Iterator.prototype.toArray = function(){
	var _set = [this.item()];
	while(this.hasNext())
	{
		_set.push(this.item());
		this.next();
	}
	return _set;
}
//Serializer 序列化原型
function Serializer(){}
Serializer.prototype.serialize = function(encoder)
{
	var ret = [];
	encoder = encoder || 
		function(s){
			s = s || '';
			return s.replace(/\'/g,"\\'").replace(/([:{},])/g,function(s){s=s.charCodeAt(0).toString(16); while(s.length<4) s="0"+s; return "\\u"+s});
		}
	
	for(var each in this)
	{
		var o = this[each]
		if(!(o instanceof Function))
		{
			if(o.serialize instanceof Function)
			{
				o = o.serialize(encoder);
				ret.push("'"+encoder(each)+"'" + ":" + o);
			}
			else
				ret.push("'"+encoder(each)+"'" + ":" + "'" + encoder(o) + "'");
		}
	}

	return "{" + ret.join() + "}";
}

//Array 数组扩展
//any是一个集合迭代函数，它接受一个闭包作为参数
//当集合中的任何一个元素调用闭包的结果返回非false时，any()返回计算结果，否则返回false
Array.prototype.any = function(closure, _set){	
	_set = _set || false;

	if(typeof closure == 'undefined')
		closure = function(x){return x};
	if(typeof closure != 'function')
	{
		var c = closure;
		closure = function(x){return x == c}
	}
	
	var args = Array.apply(this, arguments).slice(2);

	for(var i = 0; i < this.length; i++)
	{
		var rval = closure.apply(this, [this[i]].concat(args).concat(i))
		if(rval || rval === 0)
		{
			if(_set && _set.put)
				_set.put(rval);
			else
				return rval;
		}
	}

	return _set;
}
//each是一个集合迭代函数，它接受一个闭包作为参数和一组可选的参数
//这个迭代函数依次将集合的每一个元素和可选参数用闭包进行计算，并将计算得的结果集返回
Array.prototype.each = function(closure){
    closure = closure || undefined;
	var _set = [];
	_set.put = _set.push;
	return this.any.apply(this, [closure, _set].concat(Array.apply(this, arguments).slice(1)));
}
//all是一个集合迭代函数，它接受一个闭包作为参数
//当且仅当集合中的每一个元素调用闭包的返回结果为true时，它才返回true
Array.prototype.all = function(closure){
	return this.each.apply(this, arguments).length == this.length;
}

//除去数组中的null、false元素
Array.prototype.trim = function(){
    return this.each();
}

//判断数组中是否包含某个元素
Array.prototype.contains = function(el){
	return this.any(function(x){return x == el});
}

//获得数组中值等于el的第一个索引，若不存在返回-1
Array.prototype.indexOf = function(el){
	return this.any(function(x, i){return el == x?i:-1});
}
//删除数组中第一个等于o的元素，返回被删除元素的位置
//如果删除的元素不存在，返回-1
Array.prototype.remove = function(o){
	var idx = this.indexOf(o);
	if(idx != -1)
	{
		this.splice(idx,1);
	}
	return idx;
}

//获得从start到end的子数组
Array.prototype.subarr = function(start, end){
	end = end || Math.Infinity;
	return this.each(function(x, i){return i >= start && i < end ? x : null});
}
//这是一个集合迭代函数，它接受一个list和一个闭包
//返回这个闭包对于集合和list元素的一组匹配
Array.prototype.map = function(list, closure){
	if (typeof list == 'function' && typeof closure != 'function')
	{
		var li = closure;
		closure = list;
		list = li;
	}
	closure = closure || Array;

	return this.each(function(x, i){return closure(x, list[i])});
};
Array.prototype.iterator = function(){
	
	var _it = new Iterator();
	var _cursor = 0;
	var _arr = this;

	_it.next = function(){
		_cursor++;
		return _it;
	}

	_it.item = function(){
		return _arr[_cursor];
	}

	_it.hasNext = function(){
		return _cursor < _arr.length - 1;
	}

	return _it;
}
// 除去左边空白
String.prototype.leftTrim = function()
{
	return this.replace(/^\s+/g,""); 
} 
// 除去右边空白
String.prototype.rightTrim = function()
{
	return this.replace(/\s+$/g,""); 
}
// 除去两边空白
String.prototype.trim = function()
{
	return this.replace(/(^\s+)|(\s+$)/g,""); 
}
// 得到字节长度
String.prototype.bytes = function()
{
	return this.replace(/[^\x00-\xff]/g,"--").length;
}
//根据字符串返回javascript日期类型对象,如果不是合法的日期字符串返回null
Date.parseDate = function(date)
{
	if (date == null)
	{
		return new Date();
	}
	if (date instanceof Date)
	{
		return date;
	}
	else
	{
		date = new Date(date.replace(/-/g,"/"));
	}
	if (isNaN(date.getTime()))
	{
		return null;
	}
	else
		return date;
}
//返回当前日期对象所在月份的天数
Date.prototype.getDaysOfMonth = function(date)
{
	return this.getLastDayOfMonth().getDate();
}
//获得当前月的第一天
Date.prototype.getFirstDayOfMonth = function()
{
	var year = this.getFullYear();
	var month = this.getMonth();

	return new Date(year,month,1);
}
//获得当前月的最后一天
Date.prototype.getLastDayOfMonth = function()
{
	var year = this.getFullYear();
	var month = this.getMonth();

	return new Date(year,month+1,0);
}
//获得下个月的第一天
Date.prototype.getFirstDayOfNextMonth = function()
{
	var year = this.getFullYear();
	var month = this.getMonth();

	return new Date(year,month+1,1);
}
//获得上个月的第一天
Date.prototype.getLastDayOfLastMonth = function()
{
	var year = this.getFullYear();
	var month = this.getMonth();

	return new Date(year,month-1,0);
}
//返回距离当前日期若干天之前/之后的日期
Date.prototype.getDateFrom = function(days)
{
	if (isNaN(this.getTime()))
		return new Date();
	else 
		return new Date(this.getTime() + 3600 * 24 * 1000 * days);
}
//格式化日期： var date = new Date(); var dateStr = date.toFormattedDateString("YYYY-MM-DD");
Date.prototype.toFormattedDateString = function(patternString)
{
	if(patternString == null)
	return this.toLocaleString();	 

	var ret = patternString;
	var year = this.getFullYear();
	var month = this.getMonth() + 1;
	var date = this.getDate();
	var hour = this.getHours();
	var minute = this.getMinutes();
	var second = this.getSeconds();

	month = month > 9 ? "" + month : "0" + month;
	date = date > 9 ? "" + date : "0" + date;

	ret = ret.replace(/YYYY/gi,year);
	ret = ret.replace(/MM/g,month);
	ret = ret.replace(/DD/gi,date);

	ret = ret.replace(/HH/gi,hour);
	ret = ret.replace(/mm/g,minute);
	ret = ret.replace(/ss/gi,second);

	return ret;
}
Date.prototype.datePart = function()
{
	return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}
Date.now = function()
{
	return new Date();
}
Function.prototype.bind = function(owner)
{
	var $pointer = this;
	return function()
	{
		return $pointer.apply(owner, arguments);
	}
}
//这个函数有两个版本，一是它能够让一个对象在一定时间之后调用某个方法，例如：a.__defer__(b,100);
//另一个是能够让一个方法延迟一段时间被调用，例如a.defer(100);
//还有一个可选的参数是args，它表示调用的参数
Function.prototype.defer = function(delay, args){
	var $pointer = this;
	if(!(args instanceof Array))
		args = [args];
    window.setTimeout(function(){
		return $pointer.apply(this, args);
	}, delay);
}
Object.prototype.__getByNS__ = function(s)
{
	var n = s.split(".");
	var o = this;
	try{
		for(var i = 0; i < n.length; i++)
		{
			var t = n[i];
			if(parseInt(t).toString() == t)
			{
				o = o[t - 0];
			}
			else
				o = o[t];
		}
		return o;
	}
	catch(e){
		return null;
	}
}
Object.prototype.__setByNS__ = function(s, val, cf)
{
	var n = s.split(".");
	var o = this;
	for(var i = 0; i < n.length - 1; i++)
	{
		var t = n[i];
		var nt = n[i+1];

		if(parseInt(t).toString() == t)
		{
			t-=0;
		}
		if(o[t] == null) 
		{
			if(parseInt(nt).toString() == nt || nt == "[]")
				o[t] = [];
			else
				o[t] = {};
		}
		if(nt == "[]")				//设置数组，例如 a.[].b
		{
			var p = n[i+2];
			n[i+1] = o[t].length;
			if(p)
				for(var j = 0; j < o[t].length; j++)
				{
					if(!o[t][j][p])
					{
						n[i+1] = j;
						break;
					}
				}
		}		
		o = o[t];
	}
	if(cf && o[n[i]])	//cf决定是否允许ns重名，若允许重名将重名的作为数组
	{
		if(o[n[i]] instanceof Array)
			o[n[i]].push(val);
		else
			o[n[i]] = [o[n[i]],val];
	}
	else
		o[n[i]] = val;
	return val;
}
Object.prototype.__defer__ = function(method, delay, args){
	var $pointer = this;
	if(!(args instanceof Array))
		args = [args];
	if(typeof(method) == "string")
		method = $pointer[method];
	args = args || [];
    window.setTimeout(function(){
		return method.apply($pointer, args);
	}, delay);
}
Object.prototype.__extend__ = function(_typecall, evtArgs)
{
	evtArgs = evtArgs || [];
	_typecall.apply(this, evtArgs);
}
//用一个函数侦听某个provider的输出，以一定的时间间隔delay（毫秒）
//当provider返回true的时候，侦听继续下去
//当provider返回false的时候，侦听结束
Function.prototype.listen = function(provider, delay, args)
{
	var $pointer = this;
	if(!(args instanceof Array))
		args = [args];
	setTimeout(function(){
		if(provider.apply($pointer, args))
		{
			$pointer.apply(null, args);
			$pointer.listen(provider, delay, args);
		}
	},delay);
};
(function(){
	Object.prototype.__getter__ = function(propName, closure){
		this["get"+propName.slice(0,1).toUpperCase() + propName.slice(1)] = closure;
	}
	Object.prototype.__setter__ = function(propName, closure){
		this["set"+propName.slice(0,1).toUpperCase() + propName.slice(1)] = closure;
	}	
})();
//$函数，有几个用途：
//直接调用返回一个空的function(){}
//传入字符串,转换以该字符串为ID的DOM对象，传入其它对象直接返回
//传入多个字符串或对象，字符串转换为已该字符串为ID的DOM对象，其他对象不变，返回列表
function $(){
	var _args = Array.apply([], arguments);
		
	if(_args.length == 0)
		return $void;

	if(_args.length == 1)
	{
		var obj = $id(_args[0]) || _args[0];
		return obj;
	}

	return _args.each(function(obj){
		return $id(obj) || obj;
	});
}
//将包含有length属性的对象转换为一个ArrayList
//把实现了Iterator原型的对象转换为一个ArrayList
function $arr(obj)
{
	if(!obj) return [];
	if(obj.toArray) return obj.toArray();
	var _set = [];
	for(var i = 0; i < obj.length; i++)
		_set.push(obj[i]);
	return _set;	
}
function $id(id){
	return document.getElementById(id);
}
window.setByNS = Object.prototype.__setByNS__;
window.getByNS = Object.prototype.__getByNS__;

document.getNSById = function(id){
	return document.getNS(id);
}
document.getNS = function(o){
	var ret = {};
	for(var i = 0; i < arguments.length; i++)
	{
		var o = arguments[i];

		var value;
		if(typeof o == "string"){
			o = $id(o);
		}
		var ns = o.getAttribute("ns");
		if(ns == null) ns = o.id;
		value = $$(o).getValue();
		ret.__setByNS__(ns, value, true);
	}
	return ret;
}
document.getNSByName = function(name){
	var args = document.getElementsByName(name);
	return document.getNS.apply(this, $arr(args));
}
//declare Packs
//这里的声明非常重要，它为对象建立正确的名字空间，才能被with语句所支持
var core = {
	events : {
		EventManager:null
	},
	web : {
		widgets : 
			{
				adorners : {
					Adorner : null,
					ButtonAdorner : null,
					DragDropAdorner : null,
					DatePickerAdorner : null,
					MopCalendarAdorner : null,
					SliderAdorner : null,
					WindowAdorner : null,
					behaviors : {
						Behavior : null,
						ClickBehavior : null,
						DragBehavior : null,
						HoverBehavior : null,
						SelectBehavior : null
					}
				}, 
				Widget : null,
				ButtonWidget : null,
				DragDropWidget : null,
				DatePickerWidget : null,
				MopCalendarWidget : null,
				SliderWidget : null,
				WindowWidget : null
			},
		HTMLElement : null,
		CSSStyleSheet : null
	}
}

with(core.events)
{
	//原型：EventManager是一个重要的原型，它用来赋予对象自定义事件的能力
	//当对象类型的原型继承EventManager时，对象具有定义、分派和捕捉事件的能力
	//EventManager有四个重要的方法dispatchEvent、captureEvent、addEventListener和removeEventListener
	EventManager = function()
	{
		this.dispatchEvent = function(eventType, eventArgs)
		{
			eventArgs = eventArgs || {};
			var events = this["on"+eventType];
			var called = 0;

			if(events && typeof(events) == "function")
				events = [events];

			if(!eventArgs.type) eventArgs.type = eventType;
			//阻止默认动作的执行
			eventArgs.preventDefault = function()
			{
				eventArgs.defaultOp = null;
			}
			//阻止事件起泡
			eventArgs.stopPropagation = function()
			{
				eventArgs.cancelBubble = true;
			}
			var $pointer = this;
			if(events)
			{
				for(var i = 0; i < events.length; i++)
				{

					setTimeout(
						(function(i){
							var evt = events[i];
							var len = events.length;
							var capturer = events.capturer;
							var capturerName = events.capturerName;
							return	function(){
								called++;

								var ret = evt.call($pointer,eventArgs);
								//如果有捕获事件的方法，并且没有阻止事件气泡，在最后一个事件处理程序结束之后调用它
								if(!eventArgs.cancelBubble && called == len && capturer && capturerName && capturer[capturerName])
								{
									setTimeout(function(){
											capturer[capturerName](eventArgs)
										},1)
								}
								//如果定义了默认动作，在最后一个事件处理程序结束之后执行它
								if(called == len && eventArgs.defaultOp) 
								{
									eventArgs.defaultOp.call($pointer, eventArgs);
								}
								return ret;
							}
						})(i), 1
					);
				}
			}
			else if(eventArgs.defaultOp)
			{
				eventArgs.defaultOp.call($pointer, eventArgs);
			}
		}
		this.fireEvent = this.dispatchEvent;
		this.captureEvents = function(target, eventType, capturerName, closure)
		{
			if(capturerName instanceof Function)
			{
				closure = capturerName;
				capturerName = null;
			}
			capturerName = capturerName || "on" + eventType;
			target["on"+eventType] = target["on"+eventType] || [function(){}];
			var events = target["on"+eventType];
			if(typeof(events) == "function")
			{
				target["on"+eventType] = [events];
			}

			target["on"+eventType].capturer = this;
			target["on"+eventType].capturerName = capturerName;

			if(closure)
				this[capturerName] = closure;
		}

		this.addEventListener = function(eventType, closure)
		{
			if(this["on"+eventType] == null)
			{
				this["on"+eventType] = [];
			}
			var events = this["on"+eventType];
			if(events && typeof(events) == "function"){
				this["on"+eventType] = [events];		
				events = this["on"+eventType];
			}
			events.push(closure);
			return closure;
		}

		this.removeEventListener = function(eventType, closure)
		{
			var events = this["on"+eventType];
			if(events && typeof(events) == "function")
				events = [events];		
			
			for(var i = 0; i < events.length; i++)
			{
				if(events[i] == closure)
					events.splice(i, 1);
			}
			return closure;
		}
	}
}

if(typeof(HTMLElement)!="undefined" && !window.opera)
{
  HTMLElement.prototype.__defineGetter__("outerHTML",function()
  {
    var a=this.attributes, str="<"+this.tagName, i=0;for(;i<a.length;i++)
    if(a[i].specified) str+=" "+a[i].name+'="'+a[i].value+'"';
    if(!this.canHaveChildren) return str+" />";
    return str+">"+this.innerHTML+"</"+this.tagName+">";
  });
  HTMLElement.prototype.__defineSetter__("outerHTML",function(s)
  {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var df = r.createContextualFragment(s);
    this.parentNode.replaceChild(df, this);
    return s;
  });
  HTMLElement.prototype.__defineGetter__("innerText",function()
  {
		return this.textContent;
  });
  HTMLElement.prototype.__defineSetter__("innerText",function(s)
  {
    this.textContent = s;
    return s;
  });
  HTMLElement.prototype.__defineGetter__("canHaveChildren",function()
  {
    return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
  });
}

with(core.web)
{
	//扩展DOM，具有兼容性的HTMLElement类型
	HTMLElement = function(domObj)
	{
		this.el = domObj;
	}

	HTMLElement._floatZIndex = 1000;
	
	HTMLElement.prototype.focus = function()
	{
		this.el.style.zIndex = HTMLElement._floatZIndex;
		HTMLElement._floatZIndex += 10;
	}
	HTMLElement.prototype.blur = function()
	{
		this.el.style.zIndex = 0;
	}
	HTMLElement.prototype.setAttribute = function(propName, value)
	{
		//this.el[propName] = value;
		return this.el.setAttribute(propName, value);
	}
	HTMLElement.prototype.getAttribute = function(propName)
	{
		return this.el.getAttribute(propName);
	}

	HTMLElement.prototype.setStyleRule = function(className,rules)
	{
		if(!rules)
			this.el.className = className;
		else
			this.el.style[className] = rules;
	}

	HTMLElement.prototype.setStyleRuleText = function(ruleText)
	{
		this.el.style.cssText = ruleText;
	}	

	HTMLElement.prototype.setText = function(text)
	{
		if(/^(input)|(select)|(textarea)$/i.test(this.el.tagName))
			this.el.value = text;
		else
			this.el.innerText = text;
	}

	HTMLElement.prototype.addEventListener = function(evtType, evtHandler, capturing, owner, userArgs)
	{
		var $pointer = owner || this;
		var $handler;
		capturing = capturing || false;

		if(this.el.attachEvent)
		{
			$handler = function()
			{	
				var evt = window.event;
				if(userArgs)
				{
					for(var each in userArgs)
					{
						evt[each] = userArgs[each];
					}
				}

				evt.target = evt.srcElement;
				evt.relatedTarget = evt.fromElement || evt.toElement;
				evt.leftButton = function(){return evt.button == 1};
				evt.rightButton = function(){return evt.button == 2};
				evt.layerX = evt.offsetX;
				evt.layerY = evt.offsetY;
				evt.pageX = evt.clientX + document.documentElement.scrollLeft + document.body.scrollLeft + document.body.clientLeft;
				evt.pageY = evt.clientY + document.documentElement.scrollTop + document.body.scrollTop + document.body.clientTop;

				evt.attrName = evt.propertyName;

				return evtHandler.call($pointer,evt)
			};
			this.el.attachEvent("on"+evtType, $handler);
		}
		else if(this.el.addEventListener)
		{
			Event.prototype.leftButton = function(){return this.button == 0};
			Event.prototype.rightButton = function(){return this.button == 2};
			$handler = function(event){
				if(userArgs)
				{
					for(var each in userArgs)
					{
						event[each] = userArgs[each];
					}
				}
				return evtHandler.call($pointer, event)		
			};

			this.el.addEventListener(evtType, $handler, capturing);
		}

		return $handler;
	}

	HTMLElement.prototype.removeEventListener = function(evtType, evtHandler, capturing)
	{
		capturing = capturing || false;
		if(this.el.detachEvent)
		{
			this.el.detachEvent("on"+evtType, evtHandler);
		}
		else if(this.el.removeEventListener)
		{
			this.el.removeEventListener(evtType, evtHandler, capturing);
		}

		return evtHandler;
	}

	HTMLElement.prototype.stopPropagation = function()
	{
		if(this.el.stopPropagation)
		{
			this.el.stopPropagation();
		}
		else if(event && event.cancelBubble != null)
		{
			event.cancelBubble = true;
		}
	}

	HTMLElement.prototype.preventDefault = function()
	{
		if(this.el.preventDefault)
		{
			this.el.preventDefault();
		}
		else if(event && event.returnValue != null)
		{
			event.returnValue = true;
		}
	}
	HTMLElement.prototype.setCapture = function()
	{
		if(window.captureEvents) window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		else this.el.setCapture();
	}
	HTMLElement.prototype.releaseCapture = function()
	{
		if(window.releaseEvents) window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		else this.el.releaseCapture();
	}
	HTMLElement.prototype.setCursor = function(type)
	{
		this.el.style.cursor = type;
	}
	HTMLElement.prototype.moveBy = function(x, y)
	{
		x = x || 0;
		y = y || 0;

		return this.setPosition(pos.x + x, pos.y + y);
	}
	HTMLElement.prototype.moveTo = function(x, y)
	{
		return this.setPosition(x, y);
	}
	HTMLElement.prototype.setAbsPosition = function(x, y)
	{
		this.el.style.position = "absolute";
		var pos = this.getPosition();
		var npos = this.getAbsPosition();
		
		this.setPosition(x - npos.x + pos.x, y - npos.y + pos.y);
	}
	HTMLElement.prototype.setPosition = function(x, y)
	{
		x != null || (x = this.getPosition().x);
		y != null || (y = this.getPosition().y);

		//this.el.style.position = "absolute";
		this.el.style.left = x + "px";
		this.el.style.top = y + "px";
		return this.el;
	}
	HTMLElement.prototype.resize = function(w, h)
	{
		if(w != null)
			this.el.style.width = w + "px";
		if(h != null)
			this.el.style.height = h + "px";
	}
	HTMLElement.prototype.getSize = function()
	{
		return {width:parseInt(this.el.clientWidth), height:parseInt(this.el.clientHeight)};
	}
	HTMLElement.prototype.setFontColor = function(color)
	{
		this.el.style.color = color;
	}
	HTMLElement.prototype.getPosition = function()
	{
		var pTarget = this.el;
		var _x = pTarget.offsetLeft;
		var _y = pTarget.offsetTop;
		return {x:_x, y:_y};
	}
	HTMLElement.prototype.getAbsPosition = function()
	{
		var pTarget = this.el;
		var _x = 0;
		var _y = 0;
		while(pTarget.offsetParent){
				_x += pTarget.offsetLeft;
				_y += pTarget.offsetTop;
				pTarget = pTarget.offsetParent;
		}
		_x += pTarget.offsetLeft;
		_y += pTarget.offsetTop;
			
		return {x:_x,y:_y};
	}
	//获得鼠标相对于元素的位置
	HTMLElement.getMousePosition = function(evt){
		var _x,_y;
		evt = evt || window.event;
		if(evt.layerX && evt.layerY){
			_x = evt.layerX;
			_y = evt.layerY;
		}
		else{
			_x = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
			_y = evt.clientY + document.body.scrollTop - document.body.clientTop;
		}
		return {x:_x,y:_y};
	}
	HTMLElement.prototype.toggle = function(_hideHdl, _showHdl){
		this.el.style.display = (this.el.style.display != "none") ? "none" : "block";
		if(_hideHdl && this.el.style.display == "none") _hideHdl(this);
		else if(_showHdl) _showHdl(this);
	}
	HTMLElement.prototype.show = function(){
		this.el.style.display = "block";
	}
	HTMLElement.prototype.hide = function(){
		this.el.style.display = "none";
	}
	HTMLElement.prototype.visible = function(){
		return this.el.style.display != "none" && this.el.style.visibility != "hidden";
	}
	HTMLElement.prototype.clone = function(_b)
	{
		return $html(this.el.cloneNode(_b));
	}
	HTMLElement.prototype.hideChildren = function()
	{
		if(this._hideChildren == true) return false;
		for(var i = 0; i < this.el.childNodes.length; i++)
		{
			var _c = this.el.childNodes[i];
			if(_c.nodeType == 1)
			{
				_c.setAttribute("_saveVisibility", _c.style.visibility);
				_c.style.visibility = "hidden";
			}
		}
		this._hideChildren = true;
		return true;
	}
	HTMLElement.prototype.showChildren = function()
	{
		for(var i = 0; i < this.el.childNodes.length; i++)
		{
			var _c = this.el.childNodes[i];
			if(_c.nodeType == 1)
			{
				_c.style.visibility = _c.getAttribute("_saveVisibility") || "visible";
			}
		}
		this._hideChildren = false;
		return true;
	}
	HTMLElement.prototype.getValue = function()
	{
		var o = this.el;
		while(o.childNodes[0] && o.childNodes[0].nodeType == 1)
			o = o.childNodes[0];
		if(typeof o.form != "undefined")
		{
			if(o.type == "checkbox" || o.type == "radio")
			{
				return o.checked;
			}
			return o.value;
		}
		else
			return o.innerText;
	}
	//为一个DOM的指定attribute绑定数据源，绑定了数据源之后，改变这个DOM的attribute值将会同步更新数据源对应
	//属性值，同样改变数据源对应属性值也将立即改变DOM对应的attribute值
	//对于select、input和textarea，默认的attribute为value
	//对于a、iframe、frame、img，默认的attribute为src
	//其他默认为innerText
	//provider提供数据的JSON对象， propertyName是提供数据的属性名称
	HTMLElement.prototype.setDataProvider = function(provider, propertyName, attrName, propertychange)
	{
		var $pointer = this;
		propertyName = propertyName || "value";
		if(/select|input|textarea/ig.test(this.el.tagName))
			attrName = attrName || "value";
		else if(/a|iframe|frame|img/ig.test(this.el.tagName))
			attrName = attrName || "src";
		else
			attrName = attrName || "data";
		var evtType = "propertychange";
		if(document.implementation.hasFeature('MutationEvents','2.0') || window.MutationEvent){
			evtType = "DOMAttrModified";
			if(/input|textarea/ig.test(this.el.tagName))
				this.addEventListener("input",function(evt){
					this.el.setAttribute("value", this.el.value);
				});
			else if(/select/.test(this.el.tagName))
				this.addEventListener("click",function(evt){
					this.el.setAttribute("value", this.el.value);
				});
		}
		this.addEventListener(evtType, 
			function(evt)
			{
				if(evt.attrName == attrName){
					provider[propertyName] = this.getAttribute(attrName);
				}
			},false);
		this.getDataProvider = function()
		{
			return provider;
		}
		this.setAttribute(attrName,provider[propertyName]);
		provider.__extend__(core.events.EventManager);
		provider.__getter__(propertyName, function(){
			return this[propertyName];
		});
		provider.__setter__(propertyName, function(value){
			var evtArgs = {propertyName:propertyName,propertyValue:value};
			this[propertyName] = value;
			evtArgs.defaultOp = function(){
				$pointer.setAttribute(attrName, value);
			}
			this.dispatchEvent("propertychange",evtArgs);
		});
	}
	HTMLElement.blackSheepWall = {
		show:function(opacity)
		{
			var _sheep = $id("_silverna_black_sheep_wall");
			if(!_sheep)
			{
				opacity = opacity || 0;
				var _div = $html("div");
				_div.el.style.position = "absolute";
				_div.el.id = "_silverna_black_sheep_wall";
				_div.el.style.margin = "0 0 0 0";
				_div.setPosition(0,0);
				_div.el.style.backgroundColor = "#999999";
				_div.el.style.filter="alpha(opacity="+opacity+")";
				_div.el.style.opacity = opacity;
				$body().appendChild(_div.el);
				var rect = pageRect();
				_div.el.style.width = rect.width;
				_div.el.style.height = rect.height;
			}
		},
		hide:function()
		{
			$body().removeChild($("_silverna_black_sheep_wall"));
		}
	}

	CSSStyleSheet = function()
	{
	}
	CSSStyleSheet.load = function(fullPath, media)
	{
		media = media || "all";
		var link = document.createElement("link");
		link.setAttribute("href", fullPath);
		link.setAttribute("type", "text/css");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("rev", "stylesheet");
		link.setAttribute("media", media);
		var head = $head();

		if(head){
			head.appendChild(link);
		}
		return new CSSStyleSheet();
	}
}

function $html(tagName, id, text)
{
	if(tagName.nodeType == 1)
		return new core.web.HTMLElement(tagName);

	var domObj = document.createElement(tagName);
	if(id) domObj.setAttribute("id", id);
	var ret = new core.web.HTMLElement(domObj);
	if(text) ret.setText(text);
	return ret;
}
function $trash(node)
{		
	if($isIE())
	{
		CollectGarbage.defer(100);
	}
	if(node)
	{
		var _id = "_silverna_trash_container";  //用来回收不要的DOM，避免内存泄漏
		var _trash = $id(_id);
		if(!_trash)
		{
			_trash = $html("trash", _id).el;
			_trash.style.display = "none";
			$body().appendChild(_trash);
		}
		_trash.appendChild(node);
	}
}
function $$(id)
{
	var domObj = $(id);
	if(domObj.nodeType == 1)
		return new core.web.HTMLElement(domObj);
	else 
		return null;
}

with(core.web.widgets)
{
	with(adorners.behaviors)
	{
		//Behaviors抽象的是Widget的行为
		//一个Widgets可以注册多个Behaviors
		//Knob “旋钮” Behavior的控制点，可以有多个
		Behavior = function()
		{
			this.panel = null;
			this.knobs = [];
			this.actionList = [];
			this.activeActionList = [];

			core.events.EventManager.apply(this);
		}
		//新增panel，panel是Behavior真正作用的实体对象，而knobs只是对象面板中的几个控制点
		//事实上Behavior对象提供了通过knobs影响panel的能力
		Behavior.prototype.setPanel = function(panel)
		{
			this.panel = panel;
		}
		Behavior.prototype.addPanel = Behavior.prototype.setPanel;
		//新增控制点到Behavior对象,它们是一组core.web.HTMLElement对象
		Behavior.prototype.addKnobs = function()
		{
			this.knobs = this.knobs.concat($arr(arguments));
		}
		//给Behavior增加“活动”, knobIdx表示将该活动作用于的那个knobs的index
		//Action有两种类型，一种是系统的Action，它接管knobs的事件处理
		//另一种是用户自定义的Action（它不太常用）
		Behavior.prototype.addAction = function(evtType, evtHandlerName, knobIdx, userAction)
		{
			//knobIdx = knobIdx || 0;
			userAction = userAction || false;

			if(!this[evtHandlerName]) this[evtHandlerName] = $void;
			if(evtHandlerName instanceof Function)
			{
				this["on" + evtType] = evtHandlerName;
				evtHandlerName = "on" + evtType;
			}
			if(userAction){
				this[evtType] = function(){
					this.dispatchEvent(evtType,{index:knobIdx});
				}
			}
			var evtHandler = function(evt){
				this[evtHandlerName].call(this, evt);
			}
			this.actionList.push({type:evtType, handler:evtHandler, index:knobIdx, userAction:false});
		}
		Behavior.prototype.addBrowserAction = function(evtType, evtHandlerName, knobIdx)
		{
			return this.addAction(evtType, evtHandlerName, knobIdx, false);
		}
		Behavior.prototype.addUserAction = function(evtType, evtHandlerName, knobIdx)
		{
			return this.addAction(evtType, evtHandlerName, knobIdx, true);
		}
		//激活Behavior，增加或者修改活动后需要激活
		Behavior.prototype.active = function(actionIdx)
		{
			var $pointer = this;
			var panel = this.panel;
			if(actionIdx != null)
			{
				var action = this.actionList[actionIdx];
				this.activeActionList[actionIdx] = this.activeActionList[actionIdx] || [];
				//如果该行为是绑定到具体的某个knob的，那么......
				if(action.index != null){
					var knob = this.knobs[action.index];
					if(action.userAction)
					{
						this.activeActionList[actionIdx].push(this.addEventListener(action.type, action.handler));
					}
					else if(knob)
					{
						var active = knob.addEventListener(action.type, action.handler, false, $pointer, {knob:knob, panel:panel});
						active.knob = knob;
						this.activeActionList[actionIdx].push(active);
					}
				}
				//否则将对所有的knobs有效
				else
				{
					if(action.userAction)
					{
						this.activeActionList[actionIdx].push($pointer.addEventListener(action.type, action.handler));
					}
					else{
						this.knobs.each(function(knob, i){
							var active = knob.addEventListener(action.type, action.handler, false, $pointer,{knob:knob, panel:panel});
							active.knob = knob;
							$pointer.activeActionList[actionIdx].push(active);
						});
					}
				}
			}
			else
			{
				this.actionList.each(function(x, i){
					$pointer.active(i);
				});
			}
		}
		//停止Behavior的活动
		Behavior.prototype.stop = function(actionIdx)
		{
			var $pointer = this;
			if(actionIdx != null)
			{
				var action = this.actionList[actionIdx];
				var active = this.activeActionList[actionIdx];

				if(active)
				{
					active.each(function(active){
						if(action.userAction)
						{
							$pointer.removeEventListener(action.type, active);
						}
						else if(active.knob)
							active.knob.removeEventListener(action.type, active, false);
					});
					this.activeActionList[actionIdx].length = 0;
				}
			}
			else
			{
				this.actionList.each(function(x, i){
					$pointer.stop(i);
				});
			}
		}
		ClickBehavior = function()
		{
			Behavior.call(this);

			this.addAction("click", "onclick");
			this.addAction("dblclick", "ondblclick");
			this.addUserAction("disable", "ondisable");
			this.addUserAction("enable", "onenable");
		}
		ClickBehavior.prototype = new Behavior();
		ClickBehavior.prototype.ondisable = function(evt)
		{
			var knob = this.knobs[evt.index];
			this.activeColor = knob.el.style.color;
			knob.setFontColor("#808080");
			this.stop(0);
		}
		ClickBehavior.prototype.onenable = function(evt)
		{
			var knob = this.knobs[evt.index];
			knob.setFontColor(this.activeColor);
			this.active(0);
		}


		HoverBehavior = function()
		{
			Behavior.call(this);

			this.addAction("mouseover", "hoverIn");		
			this.addAction("mouseout", "hoverOut");
			this.addAction("mousedown", "hoverDown");
			this.addAction("mousedown", "hoverUp");
		}
		HoverBehavior.prototype = new Behavior();

		SelectBehavior = function()
		{
			Behavior.call(this);

			this.addAction("select", "onselect");
			this.addAction("change", "onchange");
			this.addUserAction("disable", "ondisable");
			this.addUserAction("enable", "onenable");
		}
		SelectBehavior.prototype = new Behavior();
		SelectBehavior.prototype.ondisable = function(evt)
		{
			var knob = this.knobs[evt.index];
			this.activeColor = knob.el.style.color;
			knob.setFontColor("#808080");
			this.stop(0);
		}
		SelectBehavior.prototype.onenable = function(evt)
		{
			var knob = this.knobs[evt.index];
			knob.setFontColor(this.activeColor);
			this.active(0);
		}

		DragBehavior = function()
		{
			Behavior.call(this);

			this.addAction("mousedown", "dragstart");		
			this.addAction("mouseup", "dragend");
			this.addAction("mousemove", "drag");

			this._shadow = null; //拖动时复制的“影子”knob
			this.shadow = 0;  //拖动时是否有“影子” 0 - 100 影子的深度
			this.droppable = true;  //是否可以放置在当前位置
			
			//拖动模式，分为实模式real和虚模式virtual
			//虚模式下，拖动的物件只显示出外框
			this.dragMode = "real";
		}
		DragBehavior._iframe = null; //用来覆盖select框的iframe
		DragBehavior.prototype = new Behavior();
		DragBehavior.prototype.rangeX = {
			start: 0, end: Infinity
		}
		DragBehavior.prototype.rangeY = {
			start: 0, end: Infinity
		}
		DragBehavior.prototype.precision = 1;

		DragBehavior.prototype.floating = {x : 0, y : 0}; //浮动偏移量

		DragBehavior.prototype.setRangeX = function(startX, endX)
		{
			this.rangeX = {start:startX, end: endX};
		}
		DragBehavior.prototype.setRangeY = function(startY, endY)
		{
			this.rangeY = {start:startY, end: endY};
		}
		DragBehavior.prototype.setRangeXBy = function(startX, endX)
		{
			var panel = this.panel || this.knobs[0];
			var pos = panel.getAbsPosition();
			this.rangeX = {start:pos.x + startX, end: pos.x + endX};
		}
		DragBehavior.prototype.setRangeYBy = function(startY, endY)
		{
			var panel = this.panel || this.knobs[0];
			var pos = panel.getAbsPosition();
			this.rangeY = {start:pos.y + startY, end: pos.y + endY};
		}
		DragBehavior.prototype.setGrid = function(precision)
		{
			this.precision = precision;
		}
		DragBehavior.prototype.getFloatingPos = function()
		{
			return this.floating;
		}

		DragBehavior.prototype.tempIFM = function()
		{
			if(!DragBehavior._iframe)
			{
				DragBehavior._iframe = $html("iframe");
				DragBehavior._iframe.el.id = "temp_iframe" + Math.random();
				DragBehavior._iframe.setAttribute("name",DragBehavior._iframe.el.id);
				DragBehavior._iframe.el.style.filter="alpha(opacity=0)";
				DragBehavior._iframe.el.style.opacity = "0";
				DragBehavior._iframe.el.style.position = "absolute";
				DragBehavior._iframe.el.style.top = "0px";
				DragBehavior._iframe.el.style.left = "0px";
				DragBehavior._iframe.el.style.width = "100%";
				DragBehavior._iframe.el.style.height = "100%";
				DragBehavior._iframe.setAttribute("frameborder",0);
				DragBehavior._iframe.setAttribute("border",0);
			}
			DragBehavior._iframe.focus();
			return DragBehavior._iframe.el;
		}
		//分派ondragend事件，layerX,layerY是drag的时候的鼠标相对于被拖动对象坐标
		//pageX、pageY是drag的时候鼠标相对于页面文档的坐标
		//panel是拖动的dom对象，shadow是“影子”
		DragBehavior.prototype.dragstart = function(evt)
		{	
			if(evt.leftButton())
			{
				var knob = evt.knob; 
				var panel = evt.panel || knob;
				var pos = panel.getAbsPosition();
				if(!$isIE7()) $body().appendChild(this.tempIFM());
				panel.focus();
	
				if(!this._shadow && this.shadow > 0)
				{
					this._shadow = panel.el.cloneNode(true);
					this._shadow.id = "";
					this._shadow.style.filter="alpha(opacity="+this.shadow+")";
					this._shadow.style.opacity = this.shadow;
					if(!this._position) this._position = this._shadow.style.position;
					panel.el.parentNode.insertBefore(this._shadow,panel.el);
				}

				knob.setCapture();				
				panel.setAbsPosition(pos.x, pos.y);	
				//MK-Shadow
				this.offsetX = evt.pageX - pos.x;
				this.offsetY = evt.pageY - pos.y;
				this.posX = pos.x;
				this.posY = pos.y;
				this.offsetLeft = this.offsetX;
				this.offsetTop = this.offsetY;
				this.offsetRight = parseInt(panel.el.clientWidth) - evt.pageX;
				this.offsetBottom = parseInt(panel.el.clientHeight) - evt.pageY;
				this.active(1);		
				this.active(2);

				var mousePos = core.web.HTMLElement.getMousePosition(evt);
				var eventArgs = {knob:knob, layerX:this.offsetX, layerY:this.offsetY, pageX:evt.pageX, pageY:evt.pageY, target:panel.el, shadow:this._shadow}
				this.dispatchEvent("dragstart",eventArgs);
			}
		}
		//分派ondragend事件，layerX,layerY是drag的时候的鼠标相对于被拖动对象坐标
		//pageX、pageY是drag的时候鼠标相对于页面文档的坐标
		//panel是拖动的dom对象，shadow是“影子”
		DragBehavior.prototype.dragend = function(evt)
		{
			if(evt.leftButton())
			{
				var knob = evt.knob;
				var panel = evt.panel || knob;
				if(this._shadow)
				{
					if(!this.droppable)
					{
						var pos = $html(this._shadow).getAbsPosition();
						panel.setAbsPosition(pos.x, pos.y);
						panel.el.style.position = this._position;
						this._shadow.parentNode.insertBefore(panel.el,this._shadow);
					}
					this._shadow.parentNode.removeChild(this._shadow);
					$trash(this._shadow = null);
				}
				if(this.dragMode == "virtual")
				{
					panel.showChildren();
					if(panel.getAttribute("borderStyle")!=null) 
						panel.el.style.border = panel.getAttribute("borderStyle");
					panel.setAttribute("borderStyle",null);
				}
				
				var _tempIFM = $id(this.tempIFM().id);
				if(_tempIFM){
					$body().removeChild(_tempIFM);
					$trash(_tempIFM == null);
				}

				knob.releaseCapture();
				this.stop(2);

				var mousePos = core.web.HTMLElement.getMousePosition(evt);
				var eventArgs = {knob:knob, layerX:this.offsetX, layerY:this.offsetY, pageX:evt.pageX, pageY:evt.pageY, target:panel.el, shadow:this._shadow}
				this.dispatchEvent("dragend",eventArgs);
			}
		}
		//分派ondrag事件，layerX,layerY是drag的时候的鼠标相对于被拖动对象坐标
		//pageX、pageY是drag的时候鼠标相对于页面文档的坐标
		//panel是拖动的dom对象，shadow是“影子”
		DragBehavior.prototype.drag = function(evt)
		{
			var knob = evt.knob;
			var panel = evt.panel || knob;
			var mousePos = core.web.HTMLElement.getMousePosition(evt);
			
			var lx = evt.pageX - this.offsetX;
			var ly = evt.pageY - this.offsetY;
			if(this.dragMode == "virtual" && panel.hideChildren())
			{
				if(!panel.getAttribute("borderStyle"))
					panel.setAttribute("borderStyle", panel.el.style.border || '');
				panel.el.style.border = "dotted 1px #999999";
			}
			lx = lx > this.rangeX.start ? lx : this.rangeX.start;
			lx = lx < this.rangeX.end ? lx : this.rangeX.end;
			ly = ly > this.rangeY.start ? ly : this.rangeY.start;
			ly = ly < this.rangeY.end ? ly : this.rangeY.end;
			lx = lx > 0?lx: 0;
			ly = ly > 0?ly: 0;
			lx = Math.round(lx / this.precision) * this.precision;
			ly = Math.round(ly / this.precision) * this.precision;

			var eventArgs = {knob:knob, layerX:this.offsetX, layerY:this.offsetY, pageX:evt.pageX, pageY:evt.pageY, target:panel.el, shadow:this._shadow}
			eventArgs.defaultOp = function(){
				panel.setAbsPosition(lx, ly);
				window.status=this.offsetX+","+this.offsetY+","+panel.el.scrollHeight;
			}	
			this.dispatchEvent("drag",eventArgs);
		}
		DragBehavior.prototype.activeIdx = DragBehavior.prototype.active;
		DragBehavior.prototype.active = function(idx)
		{
			if(idx) this.activeIdx(idx);
			else{
				this.activeIdx(0);
			}
		}
	}
	with(adorners)
	{
		//Adorner 是一个抽象的“装饰”原型，它抽象的是页面上的“外观”，或者我们叫它“控制区域”、“热点”
		//Adorner构造函数
		Adorner = function()
		{
			this.behaviorList = [];
			core.events.EventManager.apply(this);
		}

		//得到某种外部资源的路径，例如图片等
		Adorner.prototype.resource = function(name){
			if(name) 
				return $root() + "_resource/" + name;
			return null;
		}
		//显示装饰件
		Adorner.prototype.show = $abstract;
		//隐藏装饰件
		Adorner.prototype.hide = $abstract;
		//装载装饰件 · Widget.setupAll的时候将会自动调用此方法
		Adorner.prototype.load = $abstract;
		//装载完成之后将会触发onload事件
		Adorner.prototype.onload = $void; 

		Adorner.prototype.addBehaviors = function()
		{
			return this.behaviorList.push.apply(this.behaviorList, arguments);
		}
		Adorner.prototype.addBehavior = function(behavior, behaviorHdl, evtArgs)
		{
			var $pointer = this;
			this.behaviorList.push(behavior);

			if(behaviorHdl)
			{
				setTimeout(function(){
					behaviorHdl.call($pointer, evtArgs)}, 1);
			}
			return behavior;
		}
		Adorner.prototype.activeAll = function()
		{
			this.behaviorList.each(function(b){
				b.active();
			});
		}
		Adorner.prototype.stopAll = function()
		{
			this.behaviorList.each(function(b){
				b.stop();
			});
		}
	}
	//提供可扩展的Widget接口，一个Widget由一组Adorners组成
	//Widget的基类构造函数，构造一个Widget，扩展Widget类型，调用这个构造函数
	Widget = function()
	{
		this.adornerList = [];						//adornerList，一个Widget由多个adorners组成
		core.events.EventManager.apply(this);		//Event通用原型
	}
	
	//将Adorner添加到Widget列表
	Widget.prototype.addAdorner = function(adorner)
	{
		this.adornerList.push.apply(this.adornerList, arguments);
	}
	//获得第一个Adorner引用
	Widget.prototype.firstAdorner = function()
	{
		return this.adornerList[this.adornerList.length - 1];
	}

	//装载Widget的Adorners外观·不建议重载此方法
	Widget.prototype.load = function(face){
		var faces = face.getElementsByTagName("face");
		if(!faces.length)
			faces = face.getElementsByTagName("silverna:face");

		var $pointer = this;
		if(faces.length > 0)
		{			
			for(var i = this.adornerList.length - 1; i >= 0; i--)
			{
				var _f = faces[i];
				this.adornerList[i].skin = this.adornerList[i].load(_f, face);
				//restore trashes
				$trash(_f);
			}
		}
		else
		{
			if(this.firstAdorner())
			{		
				this.adornerList[0].skin = this.firstAdorner().load(face);
				//restore trashes
				$trash(face);
			}
		}
	}

	//获取并解析页面上所有的Widgets
	Widget.setupAll = function()
	{
		var widgets = $(document.getElementsByTagName("widget"));

		if(!widgets.length)
			widgets = document.getElementsByTagName("silverna:widget");
		
		for(var i = 0; i < widgets.length; i++)
		{
			Widget.setup(widgets[i].id);
		}
	}

	//根据ID获取并解析页面上的Widget
	Widget.setup = function(id)
	{
		var wf = $(id);
		var widgetType = $require(wf.getAttribute("type"));

		var widget = new widgetType();
		widget.load(wf);
		return widget;
	}	
}