/**
 * @author ZhangYi
 */

/**
 * 创建一个模板
 * 
 * @param {Array|String} html
 * @param {String|Null} separator
 */
function T(html, separator){
	return new arguments.callee.template(html, separator);
}
T.template = function(html, separator){
	this.htmlStr = html.join ? html.join("") : html.toString();
	this.separator = separator || "$";
}
T.template.prototype = {
	toString: function(){
		return this.htmlStr;
	},
	replace: function(data){
		if (data) {
			return this.parse(data);
		} else {
			return this.toString();
		}
	},
	parse: function(data){
		
		if (!this.htmlArr) {
			this.htmlArr = this.htmlStr.split(this.separator);
			this.mirrorArr = this.htmlArr.concat();
		}
		
		var arr = this.htmlArr, rs = this.mirrorArr;
		
		for (var i = 1, len = arr.length; i < len; i += 2) {
			rs[i] = data[arr[i]];
		}
		
		return rs.join("");		
	}
};

/**
 * 判断年份是否为润年
 * 
 * @param {Number} year
 */
function isLeapYear(year) {
	return (
		(year % 400 == 0) || (year % 4 == 0 && year % 100 != 0)
	);
}
/**
 * 获取某一年份的某一月份的天数
 * 
 * @param {Number} year
 * @param {Number} month
 */
function getMonthDays(year, month) {
	return [null, 31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] || (isLeapYear(year) ? 29 : 28);
}
/**
 * 监听事件
 * 
 * @param {HTMLElement} el
 * @param {String} event
 * @param {Function} fn
 */
function addEvent(el, event, fn) {
	if (el.addEventListener) {
		el.addEventListener(event, fn, false);
	} else if (el.attachEvent) {
		el.attachEvent("on" + event, fn);
	}
	
	return el;
}




function AECalendar(opts) {
	this.constructor = arguments.callee;
	
	this.initialization(opts);
	this.render();
}

AECalendar.defaults = {
	specailHandler : function() {
		return "";
	},
	mouseoverHandler : function(year, month, day, elem) {
		var className = elem.className, reg = new RegExp("("+this.defaultCss.EXPIREDDAY+")", "ig");
		
		if (!reg.test(className)) {
			elem.className += " " + this.defaultCss.HOVERDAY;
			
			elem.className = elem.className.replace(/(^\s*)|(\s*$)/ig, "");
		}
		
        this.showTip.apply(null, arguments);
	},
	clickHandler : function() {},
	mouseoutHandler : function(year, month, day, elem) {
		elem.className = elem.getAttribute("orgclass");
        this.hideTip();
	},
	css : {
        CALENDAR: "calendar",
        NORMALDAY: "normalday",
        TODAY: "today",
        CURRENTDAY: "fn_list",
        INVALIDATEDDAY: "invalidateday pointer",
        EXPIREDDAY: "graytext",
        WEEKTTITLE: "week_title graytext",
        HOVERDAY: "hover attbg pointer",
        REMIND: "remind pointer",
        REMIND_EXPIRED: "remind_expired pointer",
        REMIND_EVERYDAY: "remind pointer",
        REMIND_EVERYWEEK: "remind pointer",
        REMIND_EVERYMONTH: "remind pointer",
        REMIND_EVERYYEAH: "remind pointer"
    }	
}

AECalendar.template = {
	week : '日一二三四五六',
	table : T('<table class="$class$" cellpadding=0 cellspacing=0 border=0 width="100%" align=center valign=top>$content$</table>'),
	head : T([
		'<tr>', 
			'<td class="title_year attbg bd">', 
				'$content$', 
			'</td>', 
		'</tr>'
	]),
	selecter : T([
		'<span class="selecter">', 
			'<img src="images/nextfd.gif" id="prev$type$_$id$" title="前一$typename$"/>', 
			'<span style="margin:0 4px;"><span>$value$</span>$typename$</span>', 
			'<img src="images/prefd.gif" id="next$type$_$id$"  title="下一$typename$"/>', 
		'</span>'
	]),
	content : T([
		'<tr>',
			'<td align=center width=100%>', 
				'<table id="table_$id$" class="datelist" cellpadding=0 cellspacing=0 border=0 width=100%>$content$</table>',
			'</td>',
		'</tr>'
	]),
	tr : T('<tr align=center>$content$</tr>'),
	td : T('<td class="day $class$" orgclass="day $class$" day="$day$">$content$</td>'),
	tip : T("<div class='toolbg bd' style='height:auto;width:61px;padding:4px 6px 2px 6px;line-height:18px'>$sShow$<br><b>$term$ $lf$ $sf$</b></div>")
}

AECalendar.prototype.initialization = function(opts) {
	//记录原始的日期
	this.originalDate = opts.date || new Date();
	this.month = this.originalDate.getMonth() + 1;
	this.year = this.originalDate.getFullYear();
	this.day = this.originalDate.getDate();
	
	this.elem = opts.dom;
	this.doc = opts.dom.ownerDocument;
	this.minYear = opts.rankYear && opts.rankYear[0] || 2001;
	this.maxYear = opts.rankYear && opts.rankYear[1] || 2020;
	
    this.id = +new Date();
	
	var defaults = AECalendar.defaults;
	
	this.defaultCss = opts.css || defaults.css;
    this.specailHandler = opts.onspecaildate || defaults.specailHandler;
	this.mouseoverHandler = opts.onmouseover || defaults.mouseoverHandler;
	this.clickHandler = opts.onclick || defaults.clickHandler;
	this.mouseoutHandler = opts.onmouseout || defaults.mouseoutHandler;
}

AECalendar.prototype.render = function() {
	
	var htmlArr = [this.getHead(), this.getContent()];
	
	this.elem.innerHTML = AECalendar.template.table.replace({
		'content' : htmlArr.join(""),
		'class' : this.defaultCss.CALENDAR
	});
	
	var table = this.doc.getElementById("table_" + this.id);
	
	//可以选择移除添加的事件
	this._eventHandler = function($pointer, tableElem) {
		return function(ev) {
			var ev = ev || window.event,
				day,
				elem = ev.srcElement || ev.target;
			
			while (elem && elem != tableElem && !elem.getAttribute("day")) {
				elem = elem.parentNode;
			}
			
			if (elem != tableElem) {
				$pointer.hideTip();
				
				day = parseInt(elem.getAttribute("day"));
				
				if (day > 0) {
					
					({
						click : $pointer.clickHandler,
						mouseover : $pointer.mouseoverHandler,
						mouseout : $pointer.mouseoutHandler
					}[ev.type]).apply($pointer, [$pointer.year, $pointer.month, day, elem]);
					
				} else if (ev.type == "click"){
					$pointer.reRender(day == -1 ? -1 : 1, 0);
				}
				
			}
		}
	}(this, table);
	
	addEvent(table, 'click', this._eventHandler);
	addEvent(table, 'mouseover', this._eventHandler);
	addEvent(table, 'mouseout', this._eventHandler);
	
	var arr = [[0, -1], "prevYear_", [0, 1], "nextYear_", [-1, 0], "prevMonth_", [1, 0], "nextMonth_"];
    for (i = arr.length - 1; i > 0; i -= 2) {
		
		this.doc.getElementById(arr[i] + this.id).onclick = function($pointer, idx, val) {
			return function() {
				$pointer.reRender.apply($pointer, val);
			}		
		}(this, i, arr[i-1]);
    }
	
	htmlArr = null;
	table = null;
	arr = null;
}

AECalendar.prototype.reRender = function(m, y) {
	var month = this.month + m,
		year = this.year + y;
	
	if (month < 1) {
		month = 12;
		--year;
	} else if (month > 12) {
		month = 1;
		++year;
	}
	
	if (year >= this.minYear && year <= this.maxYear) {
		this.year = year;
		this.month = month;
		this.render();	
	}
	
}

AECalendar.prototype.getHead = function() {
	var me = this,
		head = AECalendar.template.head,
		selecter = AECalendar.template.selecter;
	
	return head.replace({
		'content' : [
			selecter.replace({
				type : 'Year',
				typename : "年",
				id : me.id,
				value : me.year
			}),
			selecter.replace({
				type : 'Month',
				typename : '月',
				id : me.id,
				value : me.month
			})
		].join("")
	})
}

AECalendar.prototype.getContent = function() {
	 var month = this.month, year = this.year;
	 
	 if (--month <= 0) {
        month = 12;
        year--;
    }
	
	var days = getMonthDays(year, month),
		week = (new Date(year, month, 1)).getDay(),	//这一月第一天是星期几
		htmlArr = [],
		tempArr = [],
		template = AECalendar.template,
		td = template.td,
		defaultCss = this.defaultCss;
		
	for (var i = 0, len = template.week.length; i < len; i++) {
		tempArr.push(td.replace({
			"class": defaultCss.WEEKTTITLE,
            'content': template.week.charAt(i)
		}));
	}
	
	htmlArr.push(template.tr.replace({
		'content' : tempArr.join("")
	}));
	
	tempArr = [];
	for (i = 0; i< week; i++) {//星期天至今天
		tempArr.push(td.replace({
            "class": defaultCss.INVALIDATEDDAY,
            day: -1,
            content: days + (i + 1) - week
        }));
	}
	
	var m = 0, 
		flag = false,
		nextMonthDays = getMonthDays(year, month + 1),
		normalClass = defaultCss.NORMALDAY,
		tempClassName = normalClass;
		
	i = week;
	
	while (!flag) {
		for (; i <= 6; i++) {
			++m;
			
			tempClassName = normalClass;
			
            if (!flag) {
                tempClassName = this.specailHandler(this.year, this.month, m) || "";
            }
			
			if (m == this.day) {
				tempClassName = tempClassName + defaultCss.TODAY;
			}
			
			tempArr.push(td.replace({
				'class' : tempClassName,
				day : flag ? 0 : m,
				content : m
			}));
			
			if (nextMonthDays == m) {
				m = 0;
				flag = true;
				normalClass = defaultCss.INVALIDATEDDAY;
			}
		}
		
		i = 0;
		htmlArr.push(template.tr.replace({
			content : tempArr.join("")
		}));
		
		tempArr = [];
	}
	
	
	return template.content.replace({
		id : this.id,
		content : htmlArr.join("")
	})
}

AECalendar.prototype.showTip = function(year, month, day, elem) {
	document.title = 'showTip';
}

AECalendar.prototype.hideTip = function(year, month, day, elem) {
	document.title = 'hideTip';
}
