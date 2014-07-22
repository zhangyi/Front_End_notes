
function notice(){
	var t=setInterval(myfunc,2000); 
	var d=document.getElementById("notice").getElementsByTagName("ul")[0];
	d.className="rolling";
	function myfunc(){d.appendChild(d.firstChild)}; 
	d.onmouseover=function(){clearInterval(t)};
	d.onmouseout=function(){t=setInterval(myfunc,2000)}; 	
}
var swf = new SWFObject("media/swf/butterfly.swf", "mySwf", "217", "160", "7", "#ffffff");
swf.addParam("wmode", "transparent"); 
window.onload=function(){
	notice();
	swf.write("signUpInfoShow");
}