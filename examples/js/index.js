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