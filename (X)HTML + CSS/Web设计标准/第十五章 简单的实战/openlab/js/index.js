// JavaScript Document by aoao
function togglePostList() {
	var postList = document.getElementById("post").getElementsByTagName("table");
	for (var i=0; i<postList.length; i++) {
		postList[i].className+=" showPost";
		postList[i].getElementsByTagName("strong")[0].onclick=function(){
			this.parentNode.parentNode.className=(this.parentNode.parentNode.className=="postList showPost"?"postList hidePost":"postList showPost");
		};
	}
}

window.onload=togglePostList
