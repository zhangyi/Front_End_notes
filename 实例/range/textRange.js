/**
 * @author ZhangYi
 */

/**
 * 文本选区操作类
 */
var TextRange = function() {
	var inner;
	
	return inner = {
		/**
		 * 获取选区
		 * 
		 * @param {HTMLElement} oElement input或是textarea对象
		 * @return [start, end] 返回input或textarea选区的开始与结束的索引值
		 */
		getRange : function(oElement) {
			var start = 0, end = 0;
			
			if(!document.selection) {//not IE
				start = oElement.selectionStart;
				end = oElement.selectionEnd;
			} else if(document.selection) {
				var range = document.selection.createRange(),
					range_all = document.body.createTextRange(),
					i = 0;
				
				
				range_all.moveToElementText(oElement);
				/**
				 * 两个range：一个是已经选择的text(range)，一个是整个textarea(range_all)
				 * 
				 * compareEndPoints比较两个端点，range_all的起点比range更向左(allIndex - index < 0)，则range_all需要向右移动
				 */
				for(; range_all.compareEndPoints("StartToStart", range) < 0; start++) {
					range_all.moveStart('character', 1);
				}
				
				for(; i<start; i++) {
					if(oElement.value.charAt(i) == "\n") {
						start++;
					}
				}
				
				range_all = document.body.createTextRange();
				range_all.moveToElementText(oElement);
				
				for(; range_all.compareEndPoints('StartToEnd', range) < 0; end++) {
					range_all.moveStart('character', 1);
				}
				
				for(i=0; i <= end; i++) {
					if(oElement.value.charAt(i) == "\n") {
						end++;
					}
				}
			}
			
			return [start, end];
		},	
		/**
		 * 获取选区的起始位置
		 * 
		 * @param {HTMLElement} oElement input或是textarea对象
		 * @return DOM对象选区的起始位置
		 */
		selectionStart : function(oElement) {
			return inner.getRange(oElement)[0];
		},
		/**
		 * 获取选取前的内容
		 * 
		 * @param {HTMLElement} oElement input或是textarea对象
		 * @return 返回DOM对象选区开始前的文本内容
		 */
		selectionBefore : function(oElement) {
			 return oElement.value.slice(0, inner.getRange(oElement)[0]);
		},
		/**
		 * 设置DOM的选区
		 * 
		 * @param {HTMLElement} oElement input或是textarea对象
		 * @param {Number} start 被设置的选区的起始位置 
		 * @param {Number} end	被设置的选区的结束位置
		 */
		selectText : function(oElement, start, end) {
			oElement.focus();
			
	        if (!document.selection) {
	            oElement.setSelectionRange(start, end);
	            return ;
	        }
	        var range = oElement.createTextRange();
	        range.collapse(1);
	        range.moveStart("character", start);
	        range.moveEnd("character", end - start);
	        range.select();
		},
		/**
		 * 插入文本内容
		 * 
		 * @param {HTMLElement} oElement
		 * @param {String} sInsertText
		 * @param {Number} nStart
		 * @param {Number} nLen
		 */
		insertText : function(oElement, sInsertText, nStart, nLen) {
			oElement.focus();
	        nLen = nLen || 0;
			
	        if (!document.selection) {
	            var text = oElement.value,
	                start = nStart - nLen,
	                end = start + sInsertText.length;
				
	            oElement.value = text.slice(0, start) + sInsertText + text.slice(nStart, text.length);
	            it.selectText(oElement, end, end);
	            return ;
	        }
	        var c = document.selection.createRange();
	        c.moveStart("character", -nLen);
	        c.text = sInsertText;
		},
		/**
		 * 获取光标的位置
		 * 
		 * @param {HTMLElement} oElement
		 * @return cursorPos
		 */
		getCursorPos : function(oElement) {
			var cursorPos = 0;
			
	        if (window.ActiveXObject) {
	            oElement.focus();
	            var range = document.selection.createRange(),
					stored_range = range.duplicate();
	           	
	            stored_range.moveToElementText(oElement);
	            stored_range.setEndPoint("EndToEnd", range);
	            oElement.selectionStart = stored_range.text.length - range.text.length;
	            oElement.selectionEnd = oElement.selectionStart + range.text.length;
	            cursorPos = oElement.selectionStart;
	        } else {
	            if (oElement.selectionStart || oElement.selectionStart == "0") {
	                cursorPos = oElement.selectionStart;
	            }
	        }
			
	        return cursorPos;
		},
		/**
		 * 获取选区内的文本内容
		 * 
		 * @param {HTMLElement} oElement
		 * @return selectedText 选区的文本内容
		 */
		getSelectedText : function(oElement) {
			var selectedText = "";
			
	        var getSelection = function (e) {
	            if (e.selectionStart != undefined && e.selectionEnd != undefined) {
	                return e.value.slice(e.selectionStart, e.selectionEnd);
	            } else {
	                return "";
	            }
	        };
			
	        if (window.getSelection) {
	            selectedText = getSelection(oElement)
	        } else {
	            selectedText = document.selection.createRange().text;
	        }
	        return selectedText;
		},
		/**
		 * 设置光标的位置，默认不选区
		 * 
		 * @param {HTMLElement} oElement
		 * @param {Number} pos
		 * @param {Number} coverlen
		 */
		setCursor : function(oElement, pos, coverlen) {
			pos = pos ? pos : oElement.value.length;
			coverlen = coverlen ? coverlen : 0;
	        oElement.focus();
			
	        if (oElement.createTextRange) {
	            var range = oElement.createTextRange();
	            range.move("character", pos);
	            range.moveEnd("character", coverlen);
	            range.select();
	        } else {
	            oElement.setSelectionRange(pos, pos + coverlen);
	        }
		},
		/**
		 * 插入内容后光标的位置保持不变
		 * 
		 * @param {HTMLElement} oElement  
		 * @param {String} str
		 * @param {Object} pars
		 */
		unCoverInsertText : function(oElement, str, pars) {
			pars = pars ? pars : {};
	        pars.start =  pars.start ? pars.start * 1 : 0;
	        pars.end = pars.end ? pars.end * 1 : oElement.value.length;
			
	        var text = oElement.value,
	            fstr = text.slice(0, pars.start),
	            lstr = text.slice(pars.end, text == "" ? 0 : text.length);
			
			oElement.value = fstr + str + lstr;
			
	        inner.setCursor(oElement, pars.start + (str ? str.length : 0));
		}
	}
}();
