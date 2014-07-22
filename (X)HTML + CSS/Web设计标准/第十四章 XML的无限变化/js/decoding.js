// JavaScript Document by aoao (http://www.loaoao.com)
var decoding=function(){
	//if(!document.getElementsByName){ return false;}
	var interim;
	var temp = document.getElementsByName("decodeable");
	var tempLen = temp.length;
	for (i = 0; i < tempLen; i++) {
			interim = temp[i].textContent;
			if(interim == undefined || (interim.indexOf("&") == -1 && interim.indexOf("<") == -1)){/*_*/}
			else{temp[i].innerHTML = interim;}
	}
	temp=null;
};
window.onload = decoding;