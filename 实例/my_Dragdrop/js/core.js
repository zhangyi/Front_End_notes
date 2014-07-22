/**
 * 女儿国---个人空间
 * @copyright 	(c) 2009, 女儿国! Inc. All rights reserved.
 * @author 	ZhangYi
 * @link 	http://www.9917.com/
 * @version v1.2
 */
!(function() {
	var namespaces = ["GD","Widgets"];
	for(var i = 0, j = namespaces.length; i < j; i ++){
		if(window[namespaces[i]] != 'object') {
			window[namespaces[i]] = {};
		}			
	}
})();
!(function(){
	var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
	
    if (window.ActiveXObject) {
		Sys.ie = parseFloat(ua.match(/msie ([\d.]+)/i)[1]);
	} else {
		if(document.getBoxObjectFor || /firefox/.test(ua)) {
			Sys.firefox = ua.match(/firefox\/([\d.]+)/i)[1];
		} else {
			if (window.MessageEvent && !document.getBoxObjectFor) {
				Sys.chrome = ua.match(/chrome\/([\d.]+)/i)[1];
			} else {
				if(window.opera) {
					Sys.opera = ua.match(/opera.([\d.]+)/i)[1];
				} else {
					if(window.openDatabase) {
						Sys.safari = ua.match(/version\/([\d.]+)/i)[1];
					}
				}
			}
		}
	}
	GD.Browser = {
        isOpera : Sys.opera ? true : false,
        isSafari : Sys.safari,
        isSafari3 : Sys.safari && parseInt(Sys.safari,10) == 3,
        isSafari2 : Sys.safari && parseInt(Sys.safari,10) == 2,
        isFF : Sys.firefox ? true : false,
		isIE : Sys.ie?true:false,
		ie 	  : Sys.ie,
        isIE6 : Sys.ie && Sys.ie == 6,
        isIE7 : Sys.ie && Sys.ie == 7,
        isChrome : Sys.chrome?true:false,
        isLinux : (ua.indexOf("linux") != -1),
        isWindows : (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1),
        isMac : (ua.indexOf("macintosh") != -1 || ua.indexOf("mac os x") != -1),
        isAir : (ua.indexOf("adobeair") != -1),
		isBorderBox : Sys.ie && !(document.compatMode == "CSS1Compat")
    };
	window.isIE 	= 	GD.Browser.isIE;
	window.isIE6 	= 	GD.Browser.isIE6;
	window.isIE7 	= 	GD.Browser.isIE7;
	window.isChrome = 	GD.Browser.isChrome;
	window.isFF 	=  	GD.Browser.isFF;
	Sys = null;
	
	if(isIE6) {
		try { document.execCommand("BackgroundImageCache",false,true);} catch(ex) {}
	}
	window.GD$ = function(id) {
		return typeof id == 'string' ? document.getElementById(id) : id;
	}
	GD.$CE = function(_tag) {
		return document.createElement(_tag);
	}
	GD.$CT = function(_txt) {
		return document.createTextNode(_txt);
	}
	GD.$extend =  function(destination, source) {
	  for (var property in source) {
	    destination[property] = source[property];
	  }
	  return destination;
	}
	/**
	 * 批量执行对象
	 * 
	 * @param {object} object 对象
	 * @param {function} fn 回调函数
	 * @return {Boolean} 是否执行完成
	 * @example
	 *         GD.each([1,2,3],function(){alert(this)})
	 */
	GD.each = function(object, fn) {
		if (typeof object !== "object" || typeof fn !== "function") {
			return object;
		}
		var i = 0, _fn = fn;
		
		//js 1.5已支持此方法
		if (Object.prototype.toString.call(object) === "[object Array]") {
			if (!!object.forEach) {
				object.forEach(fn,object);
			} else {
                for (var i = 0, len = object.length ; i < len; _fn(object[i], i++, object));
			}	
		} else {
			for (i in object) {
				_fn.call(object[i], object[i], i, object);
			}
		}
	}
	GD.create = function() {
		return function() {
	      this.initialize.apply(this, arguments);
	    }
	}
	//扩展方法
	GD.$extend(GD,{
		addEvent: function(el, fn, handler){
			if(el.addEventListener) {
		    	el.addEventListener(fn, handler, false);
			}
			else if(el.attachEvent) {
		  	  	el.attachEvent("on" + fn, handler);
			}
			else{
		    	el["on" + fn] = handler;
			}
		},
		removeEvent : function(el, fn, handler){
			if(el.addEventListener) {
		    	el.removeEventListener(fn, handler, false);
			}
			else if(el.attachEvent) {
		  	  	el.detachEvent("on" + fn, handler);
			}
			else{
		    	el["on" + fn] = null;
				delete el["on" + fn];
			}
		},
		getEvent : function(evt) {
			evt = evt || window.event;
			
			if(!evt && !GD.Browser.isIE) {
				var c = GD.getEvent.caller,
					cnt = 1;;
				while(c){
			        evt = c.arguments[0];
			        if (evt && Event == evt.constructor) {
						break;
					} else if(cnt > 32){
						break;
					}
					c = c.caller;
					cnt++;
			    }
			}
			
			return evt;
		},
		cancelBubble : function(evt) {
			evt = GD.getEvent(evt);
			if(!evt) return;
			if (evt.stopPropagation) {
	            evt.stopPropagation();
	        } else {
	            if (!evt.cancelBubble) {
	                evt.cancelBubble = true;
	            }
	        }
		},
		preventDefault : function(evt) {
			evt = GD.getEvent(evt);
			if(!evt) return;
			if (evt.preventDefault) {
				evt.preventDefault();
			} else {
				evt.returnValue = false;
			}
		},
		/**
		 * @return {number}鼠标按键 -1=无法获取event 0=左键 1= 中键 2= 右键 FF下1为右键2为中键
		 */
		getButton : function(evt) {
			evt = GD.getEvent(evt);
			if (!evt) {
				return -1
			}
			return GD.Browser.isIE ? (evt.button - Math.ceil(evt.button / 2)) : evt.button;
		},
		/**
		 * @return 返回事件触发的对象
		 */
		getTarget : function(evt) {
			evt = GD.getEvent(evt);
			return evt ? (evt.target || evt.srcElement) : null;
		},
		/**
		 * @return 返回获得焦点的对象
		 */
		getCurrentTarget : function(evt) {
			evt = GD.getEvent(evt);//@default document.activeElement
			return evt ? (evt.currentTarget || document.activeElement) : null;
		},
		/**
		 * @return 获取事件RelatedTarget
		 */
		getRelatedTarget : function(evt) {
			evt = GD.getEvent(evt);
			var t = evt.relatedTarget;
			if (!t) {
				if (evt.type == "mouseout") {
					t = ev.toElement;
				} else if (ev.type == "mouseover") {
					t = ev.fromElement;
				}
			}
			return t;
		}
	});
	GD.$extend(GD,{
		getType: function(object) {
	        var _t;
	        return ((_t = typeof(object)) == "object" ? object == null && "null" || Object.prototype.toString.call(object).slice(8, -1) : _t).toLowerCase();
	    },
		isUndefined : function(obj) {
			return typeof obj == 'undefined';
		},
		isString : function(str) {
			return GD.getType(str) == "string";
			//return (typeof str == "string") || (str.constructor == String);
		},
		isElement : function(obj) {
			return obj && obj.nodeType == 1;
		},
		isFunction : function(fn) {
			return typeof fn == 'function';
		},
		isObject : function(_obj) {
			return GD.getType(_obj) == "object";
			//return _obj instanceof Object && !GD.isArray(_obj) && !GD.isElement(_obj);
		},
		isArray : function(arr) {
			return GD.getType(arr) == "array";
		},
		isNumber : function(obj) {
			return GD.getType(obj) == "number";
		},
		isJSON : function(str) {
			if(!GD.isString(str) || str === '') return false;
			str = str.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
			return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
		},
		trim : function(str) {
			str = str || "";
			return str.replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g, "");
		},
		byteLength : function(str) {
			return str.replace(/[^\x00-\xFF]/g, "**").length;
		},
		getNumber : function(str) {
			return GD.isString(str) ? str.replace(/[\D]/g,'') : str;
		},
		toInt : function(str,per) {
			per = per || 10;
			return parseInt(GD.getNumber(str||"0"),10);
		},
		random : function(max,min) {
			var M = Math;
			return M.round(M.random()*(max-min))+min;
		},
		_random : function(max,min,count) {
			var a=[],b=[],M=Math;
	        count=M.min(count,max);
	        while(b.length<count) {
	                var c=GD.random(max,min);
	                if(undefined==a[c]) b.push(a[c]=c);
	        }
	        return b.sort(function(a,b){return a>b?1:-1});
		},
		unique : function(_arr) {
			var o = {};
			for(var i=0,j=0;i<_arr.length;i++) {
				if(typeof o[_arr[i]] == 'undefined') {
					o[_arr[i]] = j++;
				}
			}
			_arr = [];
			for(var key in o) {
				_arr[o[key]] = key;
			}
			return _arr;
		},
		currentStyle : function(element) {
			return element.currentStyle || document.defaultView.getComputedStyle(element, null);
		},
		CK : function(_sName){//获取COOKIE中指定变量的值
			if (!navigator.cookieEnabled) {
				return null;
			} else {
				if(GD.isString(_sName)){
					var sRE = "(?:; )?"+_sName+"=([^;]*);?";
			        var oRE = new RegExp(sRE);
			        if (oRE.test(document.cookie)) {
			            //return decodeURIComponent(RegExp["$1"]);
						return RegExp["$1"];
			        } else {
			            return null;
			        }
				}
				else if(GD.isArray(_sName)){
					var reArr = [];
					for(var i=0,ilen=_sName.lenght;i<ilen;i+=1){
						var sRE = "(?:; )?"+_sName[i]+"=([^;]*);?";
				        var oRE = new RegExp(sRE);
				        if (oRE.test(document.cookie)) {
				            //reArr.push(decodeURIComponent(RegExp["$1"]));
							reArr.push(RegExp["$1"]);
				        } else {
				            reArr.push(null);
				        }
					}
					return reArr;
				}
			}
		},
		getQuery : function(sName){//获取浏览器地址中的参数
			var sRE = "[?& ]+" + sName + "=([^(&)]*)[&]?";
		    var oRE = new RegExp(sRE);
		    if(oRE.test(document.location.search)) {
		        return decodeURIComponent(RegExp["$1"]).replace(/\+/g,' ');
		    } else {
		        return null;
		    }
		},
		getURL : function(url, param,_iden) {//获取相应的URL参数，若已经有参数则直接替换没有则附加
			var sRE = "([?& ]+" + param + "=)([^(&)]*)([&]?)";
			var oRE = new RegExp(sRE);
			url = url || document.location.href;
			if(oRE.test(url)) {			
				return url.replace(oRE,"$1"+_iden+"$3");
			} else {
				var str = (url.indexOf("?") > -1)?"&":"?";
				return url+str+param+"="+_iden+"";		
			}
		},
		MM_preloadImages : function() {//预加载图片...
	        var args = arguments.callee.arguments;
	        for(var i=0,len = args.length, tempArr = []; i < len; i++){
				tempArr[i] = new Image();
				tempArr[i].src = args[i];
	        }
		},
		isAuthor : function(str,ut) {
			if(ut && ut == "1") {
				return true;
			} else {
				var reg = /\·(潇湘|晋江|红袖)$/g,ret = str.match(reg);
				if(ret && ret.length > 0) {
					return true;
				}
			}
			return false;
		},
		objectClone : function(obj, preventName) {
			if ((typeof obj) == 'object') {
	            var res = GD.isArray(obj) ? [] : {};
	            for (var i in obj) {
	                if (i != preventName) res[i] = arguments.callee(obj[i], preventName);
	            }
	            return res;
	        } else if ((typeof obj) == 'function') {
	            return (new obj()).constructor;
	        }
	        return obj;
		}
	});
	/**
	 * cookie对象
	 */
	GD.Cookie = function(name,value,expires,path,domain,secure) {
		this.name = name;
		this.value = value;
		this.path = path||'/';
		this.domain = domain || ".9917.com";
		this.secure = secure || false;
		if (expires) {
			var date = new Date();
			if(expires == "today") {
				date.setHours(23);
				date.setMinutes(59);
				date.setSeconds(59);
				this.expires = date.toGMTString();
			} else if(expires == -1 || expires == "0") {
				this.expires = parseInt(expires,10);
			} else {
				if(typeof expires == "string") {
					expires = parseInt(expires,10);
				}
				date.setTime(date.getTime() + expires);
				this.expires = date.toGMTString();
			}
		}
	}
	GD.$extend(GD.Cookie,{
		set : function(_c, secu, sign){//设置Cookie 设置sign则不进行转码
			if (!navigator.cookieEnabled) {
				//alert("你的浏览器不支持cookie");
			} else {
				if (_c) {
					var sCookie = _c.name + '=' + (sign?_c.value:escape(_c.value));
					if(_c.expires) {
						sCookie += ";expires=" + _c.expires;
					}
					if(_c.path) {
						sCookie += ";path=" + _c.path;
					}
					if(_c.domain) {
						sCookie += ";domain=" + _c.domain;
					}
					if(secu) {
						sCookie += ";secure";
					}
					document.cookie = sCookie;
				}
			}
		},
		get : function(name,sign) {//获取Cookie sign为true则不进行转码
			var reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
			var arr = document.cookie.match(reg);
			return arr == null?null:(sign?arr[2]:unescape(arr[2]));
		},
		del : function(name,main,secure) {// 删除Cookie
		    var _c = new GD.Cookie(name,"",-1,"",main,secure);
		    GD.Cookie.set(_c);
		}
	});
	/**
	 * 根据具体资源的ID,算出最后的路径
	 * @param infoId-----对应资源ID
	 * @param rootPath-----访问资源的地址前缀
	 * @param layer-----几层目录数
	 * @param step-----每层文件数量
	 * @return 返回算出来的对应该资源的地址
	 * GD.PathParse(50)--->http://img.9917.com/club/topic/0/0/0/50
	 */
	GD.GlobalPath={};
	GD.$extend(GD.GlobalPath,{
		imagespace : {
			LevelNum : 4,
			PerNum : 500,
			ResPath : "http://img.9917.com/club/topic/"
		},
		userfile : {
			LevelNum : 4,
			PerNum : 500,
			ResPath : "http://prof.9917.com/user/"
		},
		club : {
			LevelNum : 4,
			PerNum : 500,
			ResPath : "http://prof.9917.com/club/"
		},
		book : {
			LevelNum : 4,
			PerNum : 500,
			ResPath : "http://res.9917.com/bookinfo/"
		},
		gift : {
			LevelNum : 2,
			PerNum : 500,
			ResPath : "http://offres.9917.com/gift/"
		},
		decorate : {
			LevelNum : 2,
			PerNum : 500,
			ResPath : ""
		}
	});
	/**
	 * 资源解析
	 * @param {Object} resId
	 * @param {Object} type [userfile|profile] or {level, per, path}
	 */
	GD.PathParse = function(resId, type){
		var userRootStr = "";
		if (type && typeof type == "string" && GD.GlobalPath[type]) {
			var LevelNum = GD.GlobalPath[type].LevelNum||4;
			var PerNum = GD.GlobalPath[type].PerNum||500;
			var ResPath = GD.GlobalPath[type].ResPath||"";
		} else {
			if (!type) {type={}};
			var LevelNum = type.level||4;
			var PerNum = type.per||500;
			var ResPath = type.path||"";
		}
		
		var gene = 1;
		for (var i = 1; i < LevelNum; i++) {
			gene *= PerNum;
		}
		var tempUserID = parseInt(resId);
		for (var i = 0; i < LevelNum; i++) {
			if (LevelNum != i + 1) {
				var temp = Math.floor(tempUserID / gene);
				tempUserID = tempUserID % gene;
				userRootStr += temp + "/";
				gene /= PerNum;
			} else {
				userRootStr += resId;
			}
		}
		return ResPath + userRootStr;
	}
	/**
	 * 操作iframe
	 */
	GD.$extend(GD,{
		getIframe : function(_id) {
			 var tobj = null;
			 try{
		      tobj = document.frames[_id];
		    } catch(e){};
		    if(tobj == null){
		      try{
		        tobj = GD$(_id).contentWindow;
		      } catch(e){};
		    };
		    return tobj;
		},
		adjustIframe : function(_name,_step,_min) {
			try {
				_step = _step || 30;
				_min = _min || 100;
				if(!_name) {
					var iframeId = window.name;
					var maxH = Math.min(document.body.scrollHeight, document.documentElement.scrollHeight);
					parent.document.getElementById(iframeId).style.height = ( _min?Math.max(_min, maxH) : maxH) + _step + "px";
				} else {
					var iframeObj = parent.document.getElementById(_name);
					var maxH = Math.min(iframeObj.contentWindow.document.body.scrollHeight,iframeObj.contentWindow.document.documentElement.scrollHeight);
					iframeObj.style.height = (_min?Math.max(_min, maxH) : maxH) + _step + "px";
				}
			} catch(ex) {}
		},
		timer : null,
		updateRes : function(_url) {
			_url = _url || "";
			var matchRS = _url.match(/^http\:\/\/(.*)\.9917\.com/);//必须属于.9917.com域下的内容
			if(!matchRS || !matchRS[0]) {
				return;
			}
			
			var __method = arguments.callee;
				__method.iframeId = __method.iframeId || 0;
			if(!__method.panel) {
				__method.panel = GD.$CE("div");
				__method.panel.style.display = "none";
				document.body.appendChild(__method.panel);
			}
			var tempIframe = GD.$CE("iframe");
			tempIframe.src = matchRS[0] + "/prx/static_update.html?url="+_url;//设置请求的URL主域
			__method.panel.appendChild(tempIframe);
			__method.iframeId++;
		},
		sendTrash : function(el) {
			if(!el) {
				return;
			}
			var __method = arguments.callee;
			if(!__method.trashPanel) {//创建一个垃圾箱
				__method.trashPanel = document.createElement("div");
				__method.trashPanel.id = "g_trash_panel";
				__method.trashPanel.style.display = "none";
				var getFirstChild = function(node) {
			        if (!node) {
			            return null;
			        }
			        var child = !!node.firstChild && node.firstChild.nodeType == 1 ? node.firstChild: null;
			        return child || getNextSibling(node.firstChild);
			    };
				var getNextSibling =  function(node) {
			        if (!node) {
			            return null;
			        }
			        while (node) {
			            node = node.nextSibling;
			            if (!!node && node.nodeType == 1) {
			                return node;
			            }
			        }
			        return null;
			    };
				var firstChild = getFirstChild(document.body);
				if(firstChild) {
					document.body.insertBefore(__method.trashPanel,firstChild);
				} else {
					document.body.__method.trashPanel;
				}
			}
			__method.trashPanel.appendChild(el);
		}
	});
	/**
	 * 获取资源
	 */
	GD.$extend(GD,{
		getClubPic : function(type,_clubId) {//圈子的logo
			return GD.PathParse(_clubId,"club")+"/_"+type+".jpg";
		},
		getUserPic : function(type,userId) {//获取用户头像
			return GD.PathParse(userId,"userfile")+"/_"+type+".jpg";
		},
		getBookPic : function(type,bookId) {//获取书的封面
			return GD.PathParse(bookId,"book") + "/_" + type + ".jpg";
		},
		getUserHome : function(userId) {//获取用户的个人空间地址
			return "http://home.9917.com/"+userId;
		},
		getClubHome : function(_cdomain) {//获取圈子的主页地址
			return "http://q.9917.com/g/"+_cdomain;
		},
		getTopicURL : function(topicId) {//获取帖子查看地址
			return "http://q.9917.com/topic/"+topicId+".html";
//			return "http://q.9917.com/topicinfo/"+cId+"/"+GD.PathParse(topicId)+".html";//改版前的访问地址
		},
		getNewTURL : function(_key,_id) {
			return 'http://q.9917.com/'+_key+'/topic/'+_id;
		},
		getNoteURL : function(_userId,_NId) {//获取日志查看地址
			return  GD.getUserHome(_userId) + "/blog/" + _NId;
		},
		getBookURL : function(bookId) {//获取书详细页地址
			return "http://book.9917.com/bookinfo/" + bookId + ".html";
//			return "http://book.9917.com/bookinfo/"+GD.PathParse(bookId)+".html";//改版前的访问地址
		},
		getPhotoCover : function(_picId,_userId,_type) {//获取相册内图片地址
			var imgURL = "http://img.9917.com/user/"+GD.PathParse(_picId)+"_"+_userId;
			if(_type == "s") {
				return imgURL + "_s.jpg";
			} else {
				return imgURL + ".jpg";
			}
		},
		getGiftPic : function(_picId) {//获取礼物的图片地址
			return GD.PathParse(_picId,"gift") + ".gif";
		},
		serializeUserGrade : function(d) {//获取等级的图标
			d = parseInt(d || "0",10);
			d=Math.ceil(d/2);
			var A = [];
			var result = [];
			A.push(Math.floor(d/16));
			A.push(Math.floor(d%16/4));
			A.push(Math.floor((d%16%4)));
			for(var i=0;i<A.length;i++) {
				if(A[i] == 0) {
					continue;
				}
				result.push((new Array(A[i]+1)).join('<img src="http://x.9917.com/themes/img/common/b.gif" class="icons i_10'+(2-i)+'" />'));
			}
		    return result.join("");
		},
		timedChunk : function(items, process, _this, callback, _time) {//延时处理函数
			callback = callback || function() {};
			var todo = items.concat(), delay = _time || 25;
			
		    setTimeout(function() {
		        var start = +new Date();
		        do {
		            process.call(_this, todo.shift());
		        } while(todo.length > 0 && (+new Date() - start < 50));
		
		        if(todo.length > 0) {
		            setTimeout(arguments.callee, delay);
		        } else if(callback) {
		            callback(items);
		        }
		    }, delay);
		}
	});
	/**
	 * 用户输入提示
	 * @param {Integer} 最大输入数--字符或汉字
	 * @param {String}  匹配的正则格式/.*\/，去掉\
	 * @param {String}  显示的提示信息内容，如："你还可以输入$1"
	 * @param {Object}  提示信息显示的DOM
	 * @param {Object}  需要关联的输入框DOM
	 * @param {Boolean} true代表显示0/500从０开始递增，false从最大数开始500/500递减 
	 * @param {Boolean} true代表限制为单字节输入,false表示限制是输入长度与是否为双字节无关
	 */
	GD.remainInputCount = function(charMaxCount, regFormat, tipInfo, tipInfoCot, _iptElem,_style,_isDoubley) {
		var ipt = _iptElem;
		if(!ipt) {
			alert("参数调用出错");
			return false;
		}
		//获取输入的字数
		function getLen() {
			return _isDoubley ? GD.byteLength(ipt.value) : ipt.value.length;
		}
		//检测剩余字数
		function countCharRemain() {
			var strLen = getLen();
			var len = charMaxCount-strLen>0?charMaxCount-strLen:0;
			tipInfoCot.innerHTML = tipInfo.replace("$1", _style?(charMaxCount - len):len);
		}
		
		//判断字符输入
		function judgeCharCount(ev) {
			var me = ipt;
			var flag = true;
			
			var evt = arguments[0] || window.event;
			if (getLen() >= charMaxCount) {			
				var filterList = "16|18|36|35|9|37|38|39|40|8|46";   //过滤的按键	shift|alt|home|end|tab|left|right|backSpace|Delete
				var evtKeyCode = evt.keyCode;
				var reg = "/\\b"+ evtKeyCode +"\\b/";
				
				if (filterList.match(eval(reg))) {
					flag = true;
				} else {				
					flag = false;
					me.value = _isDoubley ? me.value.uniLeft(charMaxCount): me.value.substr(0, charMaxCount);
				}
			} else {
				flag = true;
			}
			setTimeout(countCharRemain, 0);
			return flag;
		}
		GD.removeEvent(ipt,"keyup",judgeCharCount);
		GD.removeEvent(ipt,"change",judgeCharCount);
		GD.removeEvent(ipt,"paste",judgeCharCount);
		
		GD.addEvent(ipt,"keyup",judgeCharCount);
		GD.addEvent(ipt,"change",judgeCharCount);
		GD.addEvent(ipt,"paste",judgeCharCount);
		
		ipt.clear = function() {
			this.value = "";
			judgeCharCount();
			if (this.getAttribute("defaultValue")) {
				this.value = this.getAttribute("defaultValue");
			}
		}
		ipt.reCount = countCharRemain;
		countCharRemain();
	}
	
	GD.$extend(GD,{
		dynamicTime : function(nowTime, currTime, type) {//获取动态时间 服务器当前时间 + 触发事件的时刻  若不传type默认超过七一个星期就显示时期
			var gapTime = parseInt(nowTime,10) - parseInt(currTime,10);
			if(gapTime <= 5000) return "5秒前";
			var arr1 = [1000,60,60,24,7,4,12];
			var arr2 = [60,60,24,7,4,12,Number.MAX_VALUE];
			var arr3 = ["秒","分","小时","天","周","个月","年"];
//			var arr4 = ["1","2","3","4"];
			var j = (type)?7:4;
			for(var i=0;i<j;i++) {
				gapTime /= arr1[i];
				if(gapTime<arr2[i]) {
					var time = Math.floor(gapTime);
//					if(i == 4) time = arr4[time];
//					alert(time);
					return time + arr3[i] + "前";
				}
			}
			
			var date = new Date(parseInt(currTime,10));
			return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
		},
		getBeforTime : function(itemTime,_time) {//传入 2009-04-05 02:37:04 返回格式
			if(!itemTime) {
				return "刚刚";
			}
			var visitTime = itemTime.replace(/-/g,"/");
			var newTime = new Date(visitTime);
			_time = _time || (new Date()).getTime();
			newTime = GD.dynamicTime(_time,newTime.getTime(),true);
			return newTime;
		}
	});
	GD.$extend(GD,{
		clearSpace : function(str,replaceStr) {//标签专用处理--过滤前、后、中间空格（全角、半角），中间多个用一个空格连接
			replaceStr = replaceStr?replaceStr:" ";
			return (str || "").replace(/(\s|\u3000)+/g,replaceStr).replace(/^\s*|\s*$/g,"");
		},
		clearLabel : function(str) {//将含有标签的的内容，全部转义提交后台或在前台显示
			return (str || "").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,"<br/>").replace(/\"/g, '&quot;');
		},
		clearEnter : function(str) {//一个或多个回车替换成一个<br/>
			return (str || "").replace(/(\n|\r)+/gi,"<br/>");
		},
		delLine : function(str) {//将<br/>转换成\n 用于文本框内值的替换
			return (str || "").replace(/\<br\s*\/?\>/ig,"\n");
		},
		delHtmlTag : function(str) {//去掉所有的html标记 
			 return (str || "").replace(/<[^>]+>/g,"");
		},
		clearA : function(str) {//清除超链接
			return (str || "").replace(/<a[\s]+[^>]*?href[\s]?=[\s\"\']+(.*?)[\"\']+.*?>([^<]+|.*?)?<\/a>/ig,"$1");
		},
		getSimpleHTML : function(str){//删除标签
			var html = (str || "").replace(/<(script|style|object|title)[^>]*?>[\s\S]*?<\/\1>/gi, "");
			html = html.replace(/\<[^\>]+\>/g, function($0){
				return /^<(img|strong|b|i|u|font|br|li|p|\/p>|\/li|\/font|\/u|\/i|\/b|\/strong|embed|\/embed|object|\/object|param|\/param>)/i.test($0) ? $0.replace(/\s+(class|style)\s*=\s*['"]{1}[^'"]*['"]{1}/g, "") : ""
			});
			return html;
		}
	});
	GD.userIdentity = function() {//获取用户身份
		var CUID = GD.Cookie.get("CUID",true);
		if(!CUID && !GD.Cookie.get("PIC",true)) {
			return null;
		} else {
			if(!CUID) {
				var pic = GD.Cookie.get("PIC",true);
				var pos = pic.indexOf("_");
				var cuid = pic.substr(pos+1);
				CUID = cuid;
			}	
			var reg = new RegExp("^(.+)$");
			reg.test(CUID);
			var arr = RegExp["$1"].split("-");
			arr[1] = unescape(arr[1]);
			return arr;
		}
	}
	
	GD.T = function(BE, PS){
		return new arguments.callee.aiH(BE, PS);
	}
	GD.T.aiH = function(BE, PS){
		this.anj = BE.join ? BE.join("") : BE.toString();
		this.apM = PS || "$";
	}
	GD.T.aiH.prototype = {
		toString: function(){
			return this.anj;
		},
		replace: function(eC, aKB){
			if (eC) {
				return this.aFe(eC);
			} else {
				return this.toString();
			}
		},
		aFe: function(eC){
			if (!this.Mc) {
				this.Mc = this.anj.split(this.apM);
				this.arh = this.Mc.concat();
			}
			var aaZ = this.Mc, Ym = this.arh;
			for (var i = 1, aP = aaZ.length; i < aP; i += 2) {
				Ym[i] = eC[aaZ[i]];
			}
			return Ym.join("");
		}
	};
	//保存全局的一些信息
	GD.enviroment = (function() {
	    var _p = {},
	    hookPool = {};
	    function envGet(kname) {
	        return _p[kname];
	    }
	    function envDel(kname) {
	        delete _p[kname];
	        return true;
	    }
	    function envSet(kname, value) {
	        if (typeof value == 'undefined') {
	            if (typeof kname == 'undefined') {
	                return false;
	            } else if (! (_p[kname] === undefined)) {
					alert("设置出错，请检查");
	                return false;
	            }
	        } else {
	            _p[kname] = value;
	            return true;
	        }
	    }
	    return {
	        get: envGet,
	        set: envSet,
	        del: envDel,
	        hookPool: hookPool
	    };
	})();
})();

GD.$extend(Function.prototype,{
	bind : function(object){
    	var __method = this, args = Array.apply(null, arguments); args.shift();
		return function() {
		    return __method.apply(object, args);
		}
	},
	extend : function(_Father) {
		var F = new Function();
		F.prototype = _Father.prototype;
		this.prototype = new F();
		this.prototype.constructor = this;
		this.superClass = _Father.prototype;
		_Father.prototype.constructor = _Father;
		return this;
	}
});
String.prototype.uniLeft = function(len) {
	var uniLen = GD.byteLength(this);
	if(uniLen<=len) 
		return this.substr(0);
	for(var i=Math.floor((len=len-2)/2),l=uniLen; i<l; i++)
		if(GD.byteLength(this.substr(0,i)) >= len)
			return this.substr(0,i) +"\u2026";
	return this.substr(0);
}
Date.prototype.format = function(fmt) {
    if (!fmt) fmt = "yyyy-MM-dd hh:mm:ss";
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
/**
 * 滚动条平移
 */
GD.scrollToTop = function(dom,fun,spead,val,_isAntimate) {
	var documentElem = top.document.documentElement || top.document.body,topVal;
	if(_isAntimate) {
		documentElem.scrollTop = 0;
		if(isChrome) {
			top.document.body.scrollTop = 0;
		}
	} else {
		if(val) {
			topVal = val;
		} else {
			topVal = (dom)?$(dom).offset().top:0;
		}
		spead = spead || 500;
	    $(documentElem).animate({
	        scrollTop:  topVal
	    }, spead, function() {
			if(GD.isFunction(fun)) fun();
		});
	}
}
/**
 * 数值处理 圈子、帖子、书、用户
 */
GD.resAccess = function(resType,resId,resName,resExt) {
	if(!resType || !resId) return false;
	var typeArr = ["Q","T","B","H","A"];
	var type;
	var LocalData = GD.Cookie.get("LTAC") || "";
	var typeLen = typeArr.length;
	
	//查找索引值
	for(var i=0;i<typeLen;i++) {
		if(typeArr[i] == resType) {
			type = i;
			break;
		}
	};
	
	var dataArr = contentArr = [];
	if(!LocalData) {
		for(var i=0;i<typeLen;i++) dataArr[i] = "";
	} else {
		dataArr = LocalData.split("|");
	}
	
	for(var i=0;i<typeLen;i++) {
		contentArr[i] = (dataArr[i] || "").split("-");
		if(contentArr[i] == "") {
			contentArr[i] = [];
		}
	};
	
	//到达十个返回
	var splitStr = "|",cookieStr="",toWrite = false;
	
	for(var i=0,j=contentArr[type].length;i<j;i++) {
		if(resId == contentArr[type][i]) {
			contentArr[type].splice(i,1);
			toWrite = true;
			break;
		};
	}
	contentArr[type].unshift(resId);
	
	if(contentArr[type].length > 10) {
		contentArr[type].splice(9,contentArr[type].length-1);
	}	
		
	for(var i=0;i<typeLen;i++) {
		if(i == typeLen-1) splitStr = "";
		cookieStr += contentArr[i].join("-")+splitStr;
	};
	
	GD.Cookie.set(new GD.Cookie("LTAC",cookieStr,null,"/",".9917.com"));
	
	if(!toWrite) {
		var param = {
			resType : resType,
			resId   : resId
		};
		if(resName) {
			param["resName"] = resName;
		}
		if(resExt) {
			param["resExt"] = resExt;
		}
		Ajax("/main/access.frm",param,function(json) {},function() {});		
	}
}
/**
 * 加载脚本 所加载的脚本相对core.js
 */
GD.libPath = "";
GD.libLoaded = [];
GD.getLibPath = function() {
	var ret = "";
	var scripts = document.getElementsByTagName("script");
	for (var i=0; i<scripts.length; i++) {
		var script = scripts[i];
		var matcher = script.src.match(/(.*)\bcore.js\b/);
		if (script.src && matcher) {
			GD.libPath = matcher[1];
			ret = GD.libPath;
			break;
		}
	}
	return ret;
}
GD.include = function(pkgs, path, required) {
	function outWrite(pkg, pkgName) {
		if (!required) {
			document.write("<script type='text/javascript' src='" + pkg + "' " + (pkgName ? ("package='" +pkgName+ "'") : "") + "></script>");
		}	
	}
	
	function doInclude(pkg) {
		if (!pkg.match(/\.js$/i)) {
			if (GD.libLoaded.join(",").search("\\b"+pkg+"\\b")>-1&&!required) {	//required的资源需要抢先加载，忽略重复的情况
				return;		//已经加载过
			} else {
				GD.libLoaded.push(pkg);
			}

			var pkgPath = path + "/" + pkg.replace(/\./g, "/") + ".js";
			pkgPath = pkgPath.replace(/http:\/\//i, "jspath~:");
			pkgPath = pkgPath.replace(/\bGD\b/i, "").replace(/\/+/g, "/").replace(/jspath~:/i, "http://");
			outWrite(pkgPath, pkg);
		} else {
			var pkgPath = pkg;			
			outWrite(pkgPath);
			
		}
	}
	if(!path) {path=GD.libPath?GD.libPath:GD.getLibPath();}
	if (pkgs instanceof Array) {
		for (var pkgIndex in pkgs) {
			var pkg = pkgs[pkgIndex];
			doInclude(pkg);
		}
	} else {
		doInclude(pkgs);
	}

	return true;
}
GD.emptyFn = function() {};
/**
 * 延时加载脚本 onload、onerror事件
 */
GD.JsLoader = function(isDebug) {
    this.loaded = false;
    this.debug  = isDebug;
    this.onload = GD.emptyFn;
    this.onerror = GD.emptyFn;
}
GD.JsLoader.scriptId = 1;
GD.JsLoader.prototype.load = function(src, doc, charset) {
    var sId = GD.JsLoader.scriptId;
    GD.JsLoader.scriptId++;
    var o = this;
    setTimeout(function() {
        o._load2.apply(o, [sId, src, doc, charset]);
        o = null;
    },0);
}
GD.JsLoader.prototype._load2 = function(sId, src, doc, charset) {
    _doc = doc || document;
    charset = charset || "utf-8";
    var _ie = window.ActiveXObject,
    _js = _doc.createElement("script");
	var jsElem = $(_js);
	jsElem.bind(_ie ? "readystatechange": "load",(function(o) {
		return (function() {
            if (_ie) {
                if (_js && !(_js.readyState == "complete" || _js.readyState == "loaded")) {
                    return;
                }
            }
            o.onload();
            if (!o.debug) {
                jsElem.remove();
            }
            _js = null;
        });
	})(this));
    if (!_ie) {
		jsElem.bind("error",(function(o) {
            return (function() {
                o.onerror();
                if (!o.debug) {
                    jsElem.remove();
                }
                _js = null;
            });
        })(this))
    }
    _js.id = "js_" + sId;
    _js.defer = true;
    _js.charset = charset;
    _js.src = src;
    _doc.getElementsByTagName("head")[0].appendChild(_js);
};
/**
 * 样式处理
 */
GD.css = {
    insertCSSLink: function(url, id) {
        var cssLink = document.createElement("link");
        if (id) {
            cssLink.id = id;
        }
        cssLink.rel = "stylesheet";
        cssLink.rev = "stylesheet";
        cssLink.type = "text/css";
        cssLink.media = "screen";
        cssLink.href = url;
        document.getElementsByTagName("head")[0].appendChild(cssLink);
        return cssLink.sheet || cssLink;
    },
	replaceCSSLink : function(url,id,fun) {
		var dom = GD$(id);
		if(GD.isFunction(fun)) {
			if(isIE || GD.Browser.isOpera) {//ie与opera中正常加载
				dom.onload = function() {
					fun();
					dom.onload = null;
					dom = null;
				};
			}
		}
		if(dom) {
			dom.href = url;
		}
	},
    insertStyleSheet: function(sheetId) {
        var ss = document.createElement("style");
        ss.id = sheetId;
        document.getElementsByTagName("head")[0].appendChild(ss);
        return ss.sheet || ss;
    }
}
/**
	检测/替换内容中包含未经允许的域名超链接串 
	str			要检测的字符串
	isReplace	是否替换非法URL
	返回值:	若isReplace为真，则返回替换后的字符串, 否则返回检测到的非法URL集合串
*/
function testIllegalURL(str, isReplace){
	var illegalStr = "";
	var html = str.replace(/((https?|ftp|news):\/\/)?(([a-z0-9\-]+[\.。])+(aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mobi|mil|museum|name|nato|net|org|pro|travel|[a-z]{2,3})|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.\%~]+)*(\/?([a-z0-9_\-\.\%]*)(\?[a-z0-9+_\-\.%=&]*)?)?(#[a-z][a-z0-9_]*)?/gim, function($0){
		if(!/\.(jpg|png|gif|bmp|mp3|wma|mp4|avi|mpeg|divx|rm|ra|asf|mov|cda|midi|wave|vqf|aif|aiff|au|ram|rmvb|swf|flv)$/gi.test($0)) {//非图片后缀时继续判断
			if(/^([a-z0-9\-]+[\.。])+[a-z]{2,}$/gi.test($0)&&!/(aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mobi|mil|museum|name|nato|net|org|pro|travel)$/gi.test($0)){
				//整串匹配类似一个主域名, 但并不是以域名后缀结尾的，认为合法
			}else if(/^((https?|ftp|news):\/\/)?([a-z0-9\-]+\.)*(9917\.com|xxsy\.net|265g\.com|07073\.com|17173\.com|tianya\.cn|hongxiu\.com|qidian\.com|zhulang\.com|jjwxc\.net|17k\.com|4yt\.net|readnovel\.com|163\.com|sohu\.com|sina\.com|qq\.com|126\.com|tom\.com|56\.com|tudou\.com|youku\.com|99972\.com)\/?/gim.test($0)){
				//匹配允许列表中的domain
			}else{
				//将所有不匹配允许列表中的domain的非法URL组合
				illegalStr += "[" + $0 + "]\n";
				if(isReplace)
					return "";
			}
		}
		return $0;
	});

	if(isReplace)
		return html;
	else
		return illegalStr;
}
/**
	检测处理一个容器内的非法URL
	continer	容器对象(可以是input,textarea,div,iframe.document.body)
	valType		取/赋值类型(HTML-通过innerHTML, null-通过.value)
	forceReplace	是否强制替换不提示,若为true则函数总返回true
	返回值：true-检测未包含/处理成功, false-发现非法且内部有弹窗提示
*/
function processIllegalURL(continer,valType,forceReplace){
	var txt = valType == "HTML"? continer.innerHTML : continer.value;	
	if(forceReplace){//若调用时显示指定为强制自动清除非法URL
		if(valType == "HTML")
			continer.innerHTML = testIllegalURL(txt, true);
		else
			continer.value = testIllegalURL(txt, true);
	}else{
		var illegalStr = testIllegalURL(txt); //check
		if(illegalStr!=null && illegalStr!=""){
			if(confirm("内容中包含未经本站允许的网址链接，您仍要继续吗？\n[确定] - 将自动清除以下这些疑似的网址\n[取消] - 让我自己手动修改\n对此您若有意见请至[意见建议圈]发帖说明\n\n" + illegalStr)){
				if(valType == 'HTML')
					continer.innerHTML = testIllegalURL(txt, true);
				else
					continer.value = testIllegalURL(txt, true);
			}
			return false;
		}
	}
	return true;
}

/**
 * 复制链接或文本内容
 */
function copyToClipboard(txt,type,msg) {  
    if(window.clipboardData)  
    {  
        //window.clipboardData.clearData();  
        var info = window.clipboardData.setData("Text", txt);
		if(info) {
			if(type == 5) {
				var param = {
					title:"网址已成功复制至剪切板",
					first:'你可以通过QQ、E-mail或MSN等通讯工具',
					second : '粘贴刚才复制的链接发送给好友',
					width : 380
				};
				GD.msgBox(param,1,"",[{text:"确定",def:true}]);
			} else if(type == 1) {
				GD.showInfo(msg || "网址已成功复制到剪贴板中!");
			} else {
				GD.alert("",msg || "网址已成功复制到剪贴板中！","",5,{width:350});
			}
		} else {
			if(type == 1) {
				GD.showInfo(msg || "内容复制失败!");
			} else {
				GD.alert("",msg || "内容复制失败!","",6,{width:230});
			}
		}
    } else {
		alert("您当前使用的浏览器不支持此功能!");
	}
    return true;  
}
/**
 * 只能输入数字
 */
function onKeyPressBlockNumbers(e){
    e = e || window.event;
    var key = e.keyCode || e.which;
    if (key == 8 || key == 0) {
        return true;
    }
    var keychar = String.fromCharCode(key);
    return /\d/.test(keychar);
}
/**
 * 搜索的关键字的限制
 */
function submitSearch(_id) {
	var keyword = GD.trim(GD$(_id).value);
	if(keyword.length < 2) {
		alert("请输入你要查询的信息，最少两个关键字");
		return false;									
	} else {
		return true;										
	}
}
/**
* 分析提取BLOG摘要，返回摘要内容
* domObj	编辑器iframe的中body对象
* charNum	限制截取的总字数(默认不传为800)
*/
function parseTextSummary(domObj, charNum){
	var strText = domObj.innerHTML;
	var imgs = [];
	var swfs = [];
	strText.replace(/<img[^>]+>|<(object|embed)[^>]+>[\s\S]*<\/\1>/gi, function(mtag){
	
		if(/<(img|embed)[^>]* src[\s]*=[\s]*([\"\']?)([\S]+)\2[^>]*\/?>/gi.test(mtag)){
			var t = RegExp.$3.replace(/[\"\']/gi,"");
			if(RegExp.$1.toUpperCase() == "IMG")
				imgs[t] = t;
			else
				swfs[t] = t;
		}else if(/<param name=([\"\']?)(movie|url)\1\s+value[\s]*=[\s]*([\"\']?)([\S]+)\3[^>]*\/?>/gi.test(mtag)){
			var t = RegExp.$4.replace(/[\"\']/gi,"");
			swfs[t] = t;
		}
	});


	var imgsStr = "", imgsCount = 0, preImgCount = 0;
	for(var i in imgs){
		if(!/http:\/\/x.9917.com/i.test(i)){
			imgsCount++;
			if(preImgCount<3 && /http:\/\/img.9917.com\/user\/(\d+\/){3}(\d+\_\d+)(\_s)?\.jpg/.test(i)){
				imgsStr += (imgsStr==""?"":"`") + RegExp.$2;			
				preImgCount++;
			}
		}
	}

	var swfsStr = "", swfsCount = 0;
	for(var j in swfs){
		if(/\.(swf|flv)/i.test(j)){
			swfsCount ++;
			//swfsStr += (swfsStr==""?"":"`") + j;			
		}
	}
	
	var _innerText = domObj.innerText || domObj.textContent;
	
	var totalcount = _innerText.length;
	var hideTag = '<blogMedias imgs="'+ imgsStr +'" imgc="'+ imgsCount +'" swfs="'+ swfsStr +'" swfc="'+ swfsCount +'" totalc="'+ totalcount +'" summaryc="00000">';
	var summaryStr = _innerText.substring(0, (charNum?charNum:800) - hideTag.length);//.replace(/\s+/g," ");
	hideTag = hideTag.replace('summaryc="00000"','summaryc="'+summaryStr.length+'"');
	return hideTag + summaryStr + ((totalcount - summaryStr.length) > 0? "...":"");
}
/**
 * 解析动态信息  <blogMedias imgs="" imgc="0" swfs="" swfc="0" totalc="38" summaryc="37">
 */
function parseDynamicInfo(o,_userId,_id,_className) {
	var _info = {};
	
	var imgs = o.attr("imgs");
	var imgc = o.attr("imgc");
	var swfc = o.attr("swfc");
	var num = GD.toInt(o.attr("totalc")) - GD.toInt(o.attr("summaryc"));
	var imgArr = [];
	if(imgs) {
		var arr = imgs.split("`");
		for(var i=0,j=arr.length;i<j;i++) {
			var a = arr[i].split("_");
			if(_className) {
				imgArr.push("<div class='"+_className+"'>");
			}
			
			if(_userId == top.spaceInfo.userId) {
				imgArr.push("<a hideFocus='true' href='javascript:;' onclick='top.changeMenu(\"blog\",\"/home/blog/info.frm?id="+_id+"\");return false;' style='margin-right:5px;'><img src='"+GD.getPhotoCover(a[0],a[1],"s")+"' /></a>");	
			} else {
				imgArr.push("<a hideFocus='true' href='"+GD.getNoteURL(_userId,_id)+"' target='_blank' style='margin-right:5px;'><img src='"+GD.getPhotoCover(a[0],a[1],"s")+"' /></a>");
			}
			
			if(_className) {
				imgArr.push("</div>");
			}
		}
	}
	
	var _des = "";
	var _i = GD.toInt(imgc);
	var _s = GD.toInt(swfc);
	if(_i > 0 || _s > 0) {
		_des = "<文章共包含";
		if(_i > 0) {
			_des += _i + "张图片";
			if(_s > 0) {
				_des += "、";
			}
		}
		if(_s > 0) {
			_des += _s + "个flash资源";
		}
		_des += ">";
	} 
	
    return {
		imgs   : imgArr.join(""),
		letter : num > 0 ? "<还有约"+num+"字的内容>" : "",
		mediaDes : _des
	}
};
