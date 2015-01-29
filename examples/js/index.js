function pageLoad() {
	resize();
	var hash = window.location.hash.substring(1);
	console.log(hash);
	if(hash != "") {
		var iframe = document.getElementById("iframe").src = hash + "/index.html";
		changeExample(hash + "/index.html", hash);
	} else {
		var iframe = document.getElementById("iframe").src = "random-polygons/index.html";
	}
}

function resize() {
    var content = document.getElementById("content");
    content.style.width = window.innerWidth - 250 + "px";
}

function changeExample(url, element) {
    var iframe = document.getElementById("iframe").src = url;
    var examples = document.getElementsByClassName("content-cell");
    for(var i = 0; i < examples.length; i++) {
        examples[i].className = "content-cell";
    }
    document.getElementById(element + "").className = "content-cell selected";
}