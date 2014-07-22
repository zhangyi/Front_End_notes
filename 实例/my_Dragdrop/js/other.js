/**
 * @author zhangyi
 */
/**
 *  返回屏幕宽和高
 */
GD.getScreen = function(){
	return {
		width  : Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
		height : Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
	}
}
/**
 * 获取鼠标的位置
 */
GD.getMsCoord = function (ev){
	ev = ev || window.event;
	if(ev.pageX || ev.pageY){
		return {x:ev.pageX, y:ev.pageY};
	}
	return {
		x:(ev.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
		y:(ev.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
	}
}
GD.dom = {
    isAncestor: function(node1, node2) {
        if (!node1 || !node2) {
            return false;
        }
        if (node1.contains && node2.nodeType && !GD.Browser.isSafari && !GD.Browser.isChrome) {
            return node1.contains(node2) && node1 != node2;
        }
        if (node1.compareDocumentPosition && node2.nodeType) {
            return !!(node1.compareDocumentPosition(node2) & 16);
        } else if (node2.nodeType) {
            return !!this.getAncestorBy(node2,function(el) {
                return el == node1;
            });
        }
        return false;
    },
    getAncestorBy: function(node, method) {
        while (node = node.parentNode) {
            if (node && node.nodeType == 1 && (!method || method(node))) {
                return node;
            }
        }
        return null;
    },
    getStyle: function(el, property) {
		el = GD$(el);
        if (!el || el.nodeType == 9) {
            return false;
        }
        var w3cMode = document.defaultView && document.defaultView.getComputedStyle;
        var computed = !w3cMode ? null: document.defaultView.getComputedStyle(el, '');
        var value = "";
        switch (property) {
        case "float":
            property = w3cMode ? "cssFloat": "styleFloat";
            break;
        case "opacity":
            if (!w3cMode) {
                var val = 100;
                try {
                    val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                } catch(e) {
                    try {
                        val = el.filters('alpha').opacity;
                    } catch(e) {}
                }
                return val / 100;
            }
            break;
        case "backgroundPositionX":
            if (w3cMode) {
                property = "backgroundPosition";
                return ((computed || el.style)[property]).split(" ")[0];
            }
            break;
        case "backgroundPositionY":
            if (w3cMode) {
                property = "backgroundPosition";
                return ((computed || el.style)[property]).split(" ")[1];
            }
            break;
        }
        if (w3cMode) {
            return (computed || el.style)[property];
        } else {
            return (el.currentStyle[property] || el.style[property]);
        }
    },
    setStyle: function(el, property, value) {
		el = GD$(el);
        if (!el || el.nodeType == 9) {
            return false;
        }
        var w3cMode = document.defaultView && document.defaultView.getComputedStyle;
        switch (property) {
        case "float":
            property = w3cMode ? "cssFloat": "styleFloat";
        case "opacity":
            if (!w3cMode) {
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
        case "backgroundPositionX":
            if (w3cMode) {
                var _y = GD.dom.getStyle(el, "backgroundPositionY");
                el.style["backgroundPosition"] = value + " " + (_y || "top");
            } else {
                el.style[property] = value;
            }
            break;
        case "backgroundPositionY":
            if (w3cMode) {
                var _x = GD.dom.getStyle(el, "backgroundPositionX");
                el.style["backgroundPosition"] = (_x || "left") + " " + value;
            } else {
                el.style[property] = value;
            }
            break;
        default:
            if (typeof el.style[property] == "undefined") {
                return false
            }
            el.style[property] = value;
            return true;
        }
    },
    getPosition: function(el) {
        var xy = GD.dom.getXY(el),
        size = GD.dom.getSize(el);
        return {
			"left": xy[0],
            "top": xy[1],
            "width": size[0],
            "height": size[1],
			"x" : xy[0],
			"y" : xy[1],
			"w" : size[0],
			"h" : size[1]
        };
    },
    setPosition: function(el, pos) {
        GD.dom.setXY(el, pos['left'], pos['top']);
        GD.dom.setSize(el, pos['width'], pos['height']);
    },
    getXY: function(el, doc) {
        var _t = 0,_l = 0;
        doc = doc || document;
        if (el) {
            if (doc.documentElement.getBoundingClientRect && el.getBoundingClientRect) {
                var box = el.getBoundingClientRect(),
                oDoc = el.ownerDocument,
                _fix = isIE ? 2 : 0;
                _t = box.top - _fix + GD.dom.getScrollTop(oDoc);
                _l = box.left - _fix + GD.dom.getScrollLeft(oDoc);
            } else {
                while (el.offsetParent) {
                    _t += el.offsetTop;
                    _l += el.offsetLeft;
                    el = el.offsetParent;
                }
            }
        }
        return [_l, _t];
    },
	setXY: function(el, x, y) {
        var _ml = parseInt(this.getStyle(el, "marginLeft")) || 0;
        var _mt = parseInt(this.getStyle(el, "marginTop")) || 0;
        this.setStyle(el, "left", parseInt(x) - _ml + "px");
        this.setStyle(el, "top", parseInt(y) - _mt + "px");
    },
    getSize: function(el) {
        var _fix = [0, 0];
		var LRTB = ["Left", "Right", "Top", "Bottom"];
		for(var i in LRTB) {
			var v = LRTB[i];
			_fix[v == "Left" || v == "Right" ? 0 : 1] += (parseInt(GD.dom.getStyle(el, "border" + v + "Width"), 10) || 0) + (parseInt(GD.dom.getStyle(el, "padding" + v), 10) || 0);
		}
        var _w = el.offsetWidth - _fix[0];
        var _h = el.offsetHeight - _fix[1];
        return [_w, _h];
    },
	setSize: function(el, width, height) {
        var _wFix = /\d+([a-z%]+)/i.exec(width);
        _wFix = _wFix ? _wFix[1] : "";
        var _hFix = /\d+([a-z%]+)/i.exec(height);
        _hFix = _hFix ? _hFix[1] : "";
        this.setStyle(el, "width", (typeof width != "number" || width < 0 || /auto/i.test(width)) ? "auto": (parseInt(width) + (_wFix || "px")));
        this.setStyle(el, "height", (typeof height != "number" || height < 0 || /auto/i.test(height)) ? "auto": (parseInt(height) + (_hFix || "px")));
    },
    getScrollLeft: function(doc) {
        doc = doc || document;
        return Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
    },
    getScrollTop: function(doc) {
        doc = doc || document;
        return Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
    },
    getScrollHeight: function(doc) {
        doc = doc || document;
        return Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
    },
    getScrollWidth: function(doc) {
        doc = doc || document;
        return Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    },
    setScrollLeft: function(value, doc) {
        doc = doc || document;
        doc[doc.compatMode == "CSS1Compat" && !GD.Browser.isSafari && !GD.Browser.isChrome ? "documentElement": "body"].scrollLeft = value;
    },
    setScrollTop: function(value, doc) {
        doc = doc || document;
        doc[doc.compatMode == "CSS1Compat" && !GD.Browser.isSafari && !GD.Browser.isChrome ? "documentElement": "body"].scrollTop = value;
    },
    getClientHeight: function(doc) {
        doc = doc || document;
        return doc.compatMode == "CSS1Compat" ? doc.documentElement.clientHeight: doc.body.clientHeight;
    },
    getClientWidth: function(doc) {
        doc = doc || document;
        return doc.compatMode == "CSS1Compat" ? doc.documentElement.clientWidth: doc.body.clientWidth;
    },
    getDocumentWindow: function(doc) {
        _doc = doc || document;
        return _doc.parentWindow || _doc.defaultView;
    }
};
GD.getDomCoord = GD.dom.getPosition;
/**
 * 移动dom节点 上移、下移、获取子节点
 * @param {Object} _id
 */
GD.domSort = {
	getFirstChild: function(node) {
        if (!node) {
            return null;
        }
        var child = !!node.firstChild && node.firstChild.nodeType == 1 ? node.firstChild: null;
        return child || this.getNextSibling(node.firstChild);
    },
    getNextSibling: function(node) {
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
    },
    getPreviousSibling: function(node) {
        if (!node) {
            return null;
        }
        while (node) {
            node = node.previousSibling;
            if (!!node && node.nodeType == 1) {
                return node;
            }
        }
        return null;
    },
    swapNode: function(node1, node2) {//节点1与节点2交换位置
        if (node1.swapNode) {
            node1.swapNode(node2);
        } else {
            var parent = node2.parentNode;
            var next = node2.nextSibling;
            if (next == node1) {
                parent.insertBefore(node1, node2);
            } else if (node2 == node1.nextSibling) {
                parent.insertBefore(node2, node1);
            } else {
                node1.parentNode.replaceChild(node2, node1);
                parent.insertBefore(node1, next);
            }
        }
    },
	get : function(_id) {
		return typeof _id == "string" ? document.getElementById(_id) : (_id.jquery?_id.get(0):_id);
	},
	getAllChilds:function(){
		var dom = child.parentNode;
		var childs = [];
		for(var i=0;i<dom.childNodes.length;i+=1){
			if(dom.childNodes[i].nodeType==1){//１为元素element、２为属性attr、３为文本text、８为注释comments、９为文档document
				childs.push(dom.childNodes[i]);
			}
		}
		return childs;
	},
	$first : function() {
		alert("已经是第一个了,不能再进行上移了");
	},
	$last : function() {
		alert("已经是最后一个了,不能再进行下移了");
	},
	up:function(_id,_cs) {
		var _obj = this.get(_id);
		var prev = this.getPreviousSibling(_obj);
		if(!prev) {
			this.$first();
		} else {
			this.swapNode(prev,_obj);
			//保留样式
			if(_cs || _cs == "") {
				_obj.className = _cs;
			}
		}
		return _obj;
	},
	down:function(_id,_cs) {
		//支持jquery对象、DOM对象、ID
		var _obj = this.get(_id);
		
		var next = this.getNextSibling(_obj);
		if(!next) {
			this.$last();
		} else {
			this.swapNode(_obj,next);
			//保留样式
			if (_cs || _cs == "") {
				_obj.className = _cs;
			}
		}
		return _obj;
	},
	del:function(_id) {
		var _obj = this.get(_id);
		var _parent = _obj.parentNode;
		_parent.removeChild(_obj);
	}
}
/**
 * 将XML的字符串转换成XML
 * @param {String} xmlString
 */
GD.toXML = function(xmlString){
    var XMLDoc;
    if (window.ActiveXObject) {
        XMLDoc = new ActiveXObject("Microsoft.XMLDOM");
    }
    else {
        try {
            XMLDoc = document.implementation.createDocument("text/xml", "", null);
        } 
        catch (e) {
            return null;
        }
    }
    if (window.ActiveXObject) {
        var flag = XMLDoc.loadXML(xmlString);
        if (flag) {
            return XMLDoc;
        }
        else {
            return null;
        }
    }
    else {
        try {
            var childNodes = XMLDoc.childNodes;
            for (var i = childNodes.length - 1; i >= 0; i--) 
                XMLDoc.removeChild(childNodes[i]);
            
            var dp = new DOMParser();
            var newDOM = dp.parseFromString(xmlString, "text/xml");
            var newElt = XMLDoc.importNode(newDOM.documentElement, true);
            XMLDoc.appendChild(newElt);
            return XMLDoc;
        } 
        catch (ex) {
            return null;
        }
    }
}
/**
 * 非IE浏览器兼容selectNodes
 */
if(!window.ActiveXObject) {
    try {
        var ex;
        XMLDocument.prototype.__proto__.__defineGetter__("xml", function(){
            try {
                return new XMLSerializer().serializeToString(this);
            } 
            catch (ex) {
                var d = document.createElement("div");
                d.appendChild(this.cloneNode(true));
                return d.innerHTML;
            }
        });
        Element.prototype.__proto__.__defineGetter__("xml", function(){
            try {
                return new XMLSerializer().serializeToString(this);
            } 
            catch (ex) {
                var d = document.createElement("div");
                d.appendChild(this.cloneNode(true));
                return d.innerHTML;
            }
        });
        XMLDocument.prototype.__proto__.__defineGetter__("text", function(){
            return this.firstChild.textContent;
        });
        Element.prototype.__proto__.__defineGetter__("text", function(){
            return this.textContent;
        });
        
        if (document.implementation && document.implementation.createDocument) {
            XMLDocument.prototype.loadXML = function(xmlString){
                try {
                    var childNodes = this.childNodes;
                    for (var i = childNodes.length - 1; i >= 0; i--) 
                        this.removeChild(childNodes[i]);
                    
                    var dp = new DOMParser();
                    var newDOM = dp.parseFromString(xmlString, "text/xml");
                    var newElt = this.importNode(newDOM.documentElement, true);
                    this.appendChild(newElt);
                    return true;
                } 
                catch (ex) {
                    return false;
                }
            };
            // check for XPath implementation
            if (document.implementation.hasFeature("XPath", "3.0")) {
                // prototying the XMLDocument
                XMLDocument.prototype.selectNodes = function(cXPathString, xNode){
                    if (!xNode) {
                        xNode = this;
                    }
                    var oNSResolver = this.createNSResolver(this.documentElement)
                    var aItems = this.evaluate(cXPathString, xNode, oNSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
                    var aResult = [];
                    for (var i = 0; i < aItems.snapshotLength; i++) {
                        aResult[i] = aItems.snapshotItem(i);
                    }
                    return aResult;
                }
                // prototying the Element
                Element.prototype.selectNodes = function(cXPathString){
                    if (this.ownerDocument.selectNodes) {
                        return this.ownerDocument.selectNodes(cXPathString, this);
                    }
                    else {
                        throw "For XML Elements Only";
                    }
                }
            }
            
            // check for XPath implementation
            if (document.implementation.hasFeature("XPath", "3.0")) {
                // prototying the XMLDocument
                XMLDocument.prototype.selectSingleNode = function(cXPathString, xNode){
                    if (!xNode) {
                        xNode = this;
                    }
                    var xItems = this.selectNodes(cXPathString, xNode);
                    if (xItems.length > 0) {
                        return xItems[0];
                    }
                    else {
                        return null;
                    }
                }
                // prototying the Element
                Element.prototype.selectSingleNode = function(cXPathString){
                    if (this.ownerDocument.selectSingleNode) {
                        return this.ownerDocument.selectSingleNode(cXPathString, this);
                    }
                    else {
                        throw "For XML Elements Only";
                    }
                }
            }
        }
    } 
    catch (ex) {
    }
}
/**
 * 将XML转换成object
 * @param {Object} _xml
 */
GD.xml2EnumObj = function(_xml, flag) {
	if (!_xml) {
		return {};
	}
	
	var attrs = (flag ? _xml.selectNodes(".//@*") : _xml.attributes)||[];
	var nodes = (flag ? _xml.selectNodes(".//*") : _xml.childNodes)||[];
	
	var para = {}
	
	for (var i=0;i<attrs.length; i++) {
		var attr = attrs[i];
		para[attr.nodeName] = attr.nodeValue;
	}
	
	for (var i=0;i<nodes.length; i++) {
		var node = nodes[i];
		para[node.nodeName] = node.text;
	}
	
	return para;
}
/**
 * 将XML转换成JSON
 * @param {Object} _xml
 */
GD.xml2JSON = function(_xml) {
	if(!_xml) {
		return {};
	}
	if(_xml && _xml.length){
		var rV = {};
		for(var i=0;i<_xml.length;i+=1){
			if(GD.isArray(rV[_xml[i].nodeName])){
				rV[_xml[i].nodeName].push(arguments.callee(_xml[i]));
			}
			else if(rV[_xml[i].nodeName]){
				rV[_xml[i].nodeName] = [rV[_xml[i].nodeName],arguments.callee(_xml[i])];
			}
			else{
				rV[_xml[i].nodeName] = arguments.callee(_xml[i]);
			}
		}
		return rV;
	} else{
		_xml = _xml.documentElement || _xml;
		var items = _xml.selectNodes("*");
		var atts = _xml.selectNodes("@*");
		var rV = {};
		for(j=0;j<atts.length;j+=1){
			rV["$" + atts[j].nodeName] = atts[j].nodeValue;
		}
		if(items.length==0){
			if(_xml.text!=""){
				rV.$_ = _xml.text;
			}
		}
		else{
			GD.$extend(rV,arguments.callee(items));
		}
		return rV;
	}
}
/**
 * 检查返回的XML
 */
GD.checkXML = function(_xml) {
	if(_xml&&_xml.firstChild){
		var xml = _xml.documentElement || _xml;
		if(!xml.getAttribute("code") || xml.getAttribute("code")=="0"){
			return true;
		} else {
			var mess = xml.selectSingleNode("./*");	
			if(mess){
				return {code:xml.getAttribute("code"),msg : (mess.text || xml.selectNodes("//msg")[0].text) || "未知错误，请稍后再试..."};
			}
			else{
				return {code:"",msg:""}
			}	
		}		
	} else{
		return {code:-1,msg:"连接服务器失败"}
	}
}

/**
 * 创建DOM
 */
GD.createElement = function(tagName, attrs, childDomsAttr, bindDom, ref) {
	var dom = null;
	if (!ref) {
		ref = GD.createElement.bindRefCache;
	}
	GD.createElement.level++;

	if (tagName=="input" && isIE) {
		var iptStr = "<"+tagName;
		if (attrs["name"]) {
			iptStr += " name=" + attrs["name"];
		}
		if (attrs["type"]) {
			iptStr += " type=" + attrs["type"];
		}
		if (attrs["hideFocus"]) {
			iptStr += " hideFocus=" + attrs["type"];
		}
		
		iptStr += ">";
		dom = document.createElement(iptStr);
	} else {
		dom = document.createElement(tagName);
	}
	
	for (var aName in attrs) {
		var attr = attrs[aName];
		
		if (typeof(attr) == "object") {
			if (aName == "style") {
				for (var styleName in attr) {
					dom.style[styleName] = attr[styleName].replace(/;$/,"");
				}
			} else {
				dom[aName] = attr;
			}
		} else {
			var matchReg = new RegExp("\\b"+aName+"\\b", "i");
			if (typeof(attr) == "string" && (!GD.createElement.filter.match(matchReg))) {
				dom.setAttribute(aName, attr);
			} else {
				dom[aName] = attr;	
			}
			
			if (attr && (GD.createElement.extra.match(matchReg))) {
				switch(aName) {
					case "text":
						dom.appendChild(document.createTextNode(attr));
						break;
					case "ref":
						break;
					default:
						break;
				}
			}
		}
	}
	
	if (childDomsAttr) {
		if (childDomsAttr instanceof Array) {
			for (var j=0; j<childDomsAttr.length; j++) {
				if (childDomsAttr[j] && (childDomsAttr[j].nodeType == 1 || childDomsAttr[j].nodeType == 3)) {		//如果当前是节点
					dom.appendChild(childDomsAttr[j]);
				} else {	//正常情况参数数组
					var tmpDom = GD.createElement(childDomsAttr[j][0], childDomsAttr[j][1], childDomsAttr[j][2], dom, ref);
					if (childDomsAttr[j][1] && childDomsAttr[j][1]["ref"] && ref) {
						ref[childDomsAttr[j][1]["ref"]] = tmpDom;
					}
					delete tmpDom;
				}
			}
		} else {	//如果第四个参数是dom
			childDomsAttr.appendChild(dom);
		}		
	}
	
	if (bindDom) {
		bindDom.appendChild(dom);
	}
	GD.createElement.level--;
	if (GD.createElement.level<1) {
		dom.refs = {};
		for (var i in GD.createElement.bindRefCache) {
			dom.refs[i] = GD.createElement.bindRefCache[i];
		}
		GD.createElement.bindRefCache = {};
	}
	return dom;
}
GD.createElement.filter = "className, innerHTML, textContent";
GD.createElement.extra = "text, ref";
GD.createElement.bindRefCache = {};
GD.createElement.level = 0;

/**
 * 清除dom所有子节点
 */
GD.clearChildNodes = function(dom) {
	while (dom.lastChild) {
		var tmpDom = dom.removeChild(dom.lastChild);
		if (tmpDom.refs) {		//used in IE
			for (var i in tmpDom.refs) {
				if (tmpDom.refs[i].parentNode) {
					var tmpChildDom = tmpDom.refs[i].parentNode.removeChild(tmpDom.refs[i]);
					//同时清除jquery事件
					if(typeof jQuery != "undefined") {
						jQuery(tmpChildDom).empty();
					}
					delete tmpChildDom;
					delete tmpDom.refs[i];
				}
			}
		}
		delete tmpDom;
	}
}
/**
 * 滑动方法
 */
GD.runBox = function(elem_1,elem_2,start,end,time,effect,modify) {
	modify = modify || {left:0,top:0};
	if(!elem_1 || !elem_2) {
		return false;
	}
	if(GD.isFunction(start)) {
		start();
	}
	var Tmp = GD.$CE('div');
		Tmp.style.border = "3px solid #999";//使用marin--50%导致计算出错
		Tmp.style.left = GD.getDomCoord(elem_1.parent().get(0)).left + parseInt(elem_1.get(0).style.left,10) + (modify.left || 0) + "px";
		Tmp.style.top = parseInt(elem_1.get(0).style.top,10) + (modify.top || 0) + "px";
		Tmp.style.width = elem_1.width() + "px";
		Tmp.style.height = elem_1.height() + "px";
		Tmp.style.position = "absolute";
	document.body.appendChild(Tmp);
	Tmp = $(Tmp);
	var r = elem_2.offset();
	if(!jQuery.easing.backEaseIn) {
		Tmp.animate({
			"left" : r.left,
			"top" : r.top,
			"width" : elem_2.width(),
			"height" : elem_2.height()
		},{ queue:true, duration:(time || 500), easing:(effect || "backEaseIn"),complete : function() {
			Tmp.remove();
			if(GD.isFunction(end)) {
				end();
			}
		}});
	} else {
		Tmp.animate({
			"left" : r.left,
			"top" : r.top,
			"width" : elem_2.width(),
			"height" : elem_2.height()
		},time || 500,function() {
			Tmp.remove();
			if(GD.isFunction(end)) {
				end();
			}
		});
	}
	elem_2.get(0).source = elem_1;
}
