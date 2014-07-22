/**
 * @author MS
 * @version v1.0
 */
//字符转换为UTF-8编码
function EncodeUtf8(s1) {
      var s = escape(s1);
      var sa = s.split("%");
      var retV ="";
      if(sa[0] != "")
      {
         retV = sa[0];
      }
      for(var i = 1; i < sa.length; i ++)
      {
           if(sa[i].substring(0,1) == "u")
           {
               retV += Hex2Utf8(Str2Hex(sa[i].substring(1,5)));
              
           }
           else retV += "%" + sa[i];
      }
     
      return retV;
}
function Str2Hex(s){
      var c = "";
      var n;
      var ss = "0123456789ABCDEF";
      var digS = "";
      for(var i = 0; i < s.length; i ++)
      {
         c = s.charAt(i);
         n = ss.indexOf(c);
         digS += Dec2Dig(eval(n));
          
      }
      //return value;
      return digS;
}
function Dec2Dig(n1){
      var s = "";
      var n2 = 0;
      for(var i = 0; i < 4; i++)
      {
         n2 = Math.pow(2,3 - i);
         if(n1 >= n2)
         {
            s += '1';
            n1 = n1 - n2;
          }
         else
          s += '0';
         
      }
      return s;
     
}
function Dig2Dec(s){
      var retV = 0;
      if(s.length == 4)
      {
          for(var i = 0; i < 4; i ++)
          {
              retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
          }
          return retV;
      }
      return -1;
}
function Hex2Utf8(s){
     var retS = "";
     var tempS = "";
     var ss = "";
     if(s.length == 16)
     {
         tempS = "1110" + s.substring(0, 4);
         tempS += "10" + s.substring(4, 10);
         tempS += "10" + s.substring(10,16);
         var sss = "0123456789ABCDEF";
         for(var i = 0; i < 3; i ++)
         {
            retS += "%";
            ss = tempS.substring(i * 8, (eval(i)+1)*8);
           
           
           
            retS += sss.charAt(Dig2Dec(ss.substring(0,4)));
            retS += sss.charAt(Dig2Dec(ss.substring(4,8)));
         }
         return retS;
     }
     return "";
} 

function EncodeUtf8(s1) {
      var s = escape(s1);
      var sa = s.split("%");
      var retV ="";
      if(sa[0] != "")
      {
         retV = sa[0];
      }
      for(var i = 1; i < sa.length; i ++)
      {
           if(sa[i].substring(0,1) == "u")
           {
               retV += Hex2Utf8(Str2Hex(sa[i].substring(1,5)));
              
           }
           else retV += "%" + sa[i];
      }
     
      return retV;
}
function Str2Hex(s){
      var c = "";
      var n;
      var ss = "0123456789ABCDEF";
      var digS = "";
      for(var i = 0; i < s.length; i ++)
      {
         c = s.charAt(i);
         n = ss.indexOf(c);
         digS += Dec2Dig(eval(n));
          
      }
      //return value;
      return digS;
}
function Dec2Dig(n1){
      var s = "";
      var n2 = 0;
      for(var i = 0; i < 4; i++)
      {
         n2 = Math.pow(2,3 - i);
         if(n1 >= n2)
         {
            s += '1';
            n1 = n1 - n2;
          }
         else
          s += '0';
         
      }
      return s;
     
}
function Dig2Dec(s){
      var retV = 0;
      if(s.length == 4)
      {
          for(var i = 0; i < 4; i ++)
          {
              retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
          }
          return retV;
      }
      return -1;
}
function Hex2Utf8(s){
     var retS = "";
     var tempS = "";
     var ss = "";
     if(s.length == 16)
     {
         tempS = "1110" + s.substring(0, 4);
         tempS += "10" + s.substring(4, 10);
         tempS += "10" + s.substring(10,16);
         var sss = "0123456789ABCDEF";
         for(var i = 0; i < 3; i ++)
         {
            retS += "%";
            ss = tempS.substring(i * 8, (eval(i)+1)*8);
           
           
           
            retS += sss.charAt(Dig2Dec(ss.substring(0,4)));
            retS += sss.charAt(Dig2Dec(ss.substring(4,8)));
         }
         return retS;
     }
     return "";
} 

/**
 * 要获取标签的的标签值、长度、目标、对象
 */
function publicSearch(_id,_len,_target,_elem) {
	var _var;
	//加载标签出错
	function loadError(_str) {
		_str = (_str === undefined)?"":_str;
		if(_elem && typeof _elem == 'string') {
			document.getElementById(_elem).innerHTML = _str;		
		} else {
			document.write(_str);
		} 
	}
	
	try {
		_var = eval(_id);
		if(GD.isArray(_var)) {
			var linkArr = {
				_clubTags : "club.frm",
				_bookTags : "book.frm",
				_topicTags : "topic.frm"
			};
			var linkStr = "http://search.9917.com/search/";
			var searchStr = "";
			var _href = "";
			_len = _len || 12;
			_target = _target?"_self":"_blank";
			for(var i=0;i<_len;i++) {
				_href = linkStr + linkArr[_id] + "?kw=" + EncodeUtf8(_var[i]["s"]);
				searchStr += '<a href="'+_href+'" title="'+_var[i]["s"]+'" target="'+_target+'">'+_var[i]["s"]+'</a>';
			}
			
			loadError(searchStr);
		} else {
			loadError();
		}
	} catch(ex) {
		loadError();
	}
}
