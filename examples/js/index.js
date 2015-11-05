function pageLoad() {
	resize();
	var hash = window.location.hash.substring(1);
	if(hash != "") {
		var iframe = document.getElementById("iframe").src = hash + ".html";
		changeExample(hash);
	} else {
		var selected = document.getElementsByClassName("selected");
		var iframe = document.getElementById("iframe").src = selected[0].id + ".html";
	}
}

function resize() {
    var content = document.getElementById("content");
    content.style.width = window.innerWidth - 300 + "px";

    // Adjust footer position if the content overflows
    var menu = document.getElementById("menu");
    if(menu.scrollHeight > menu.offsetHeight) {
		var footer = document.getElementById("footer");
		footer.style.position = "relative";
		footer.style.bottom = "none";
		var contentList = document.getElementById("content-list");
		contentList.style.marginBottom = "20px";
    } else {
		var footer = document.getElementById("footer");
		footer.style.position = "absolute";
		footer.style.bottom = "0";
		var contentList = document.getElementById("content-list");
		contentList.style.marginBottom = "60px";
    }
}

function changeExample(name) {
    var iframe = document.getElementById("iframe").src = name + ".html";
    var examples = document.getElementById("content-list").getElementsByTagName("a");
    for(var i = 0; i < examples.length; i++) {
        examples[i].className = "";
    }
    var ele = document.getElementById(name).className = "selected";
}

window.onresize = function(event) {
	resize();
};