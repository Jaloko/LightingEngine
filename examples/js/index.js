function resize() {
    var content = document.getElementById("content");
    content.style.width = window.innerWidth - 250 + "px";
}

function changeExample(url, element) {
    var iframe = document.getElementById("iframe").src = url;
    for(var i = 1; i <= 5; i++) {
        document.getElementById("example" + i).className = "content-cell";
    }
    document.getElementById(element + "").className = "content-cell selected";
}