// document.body.style.display = "block";
// setTimeout(function () { 
// 	document.body.classList.add("opaque");
// }, 10);
// document.body.style.opacity = 1;
// document.body.style.visibility = "visible";

var ele = document.querySelector(".dyv");
ele.style.opacity = 0;
setTimeout(function () {
	document.body.classList.add("var1");
}, 0);
setTimeout(function () {
	ele.style.height = "0";
}, ms + del + 10);

window.onbeforeunload = function (event) {
	// dyv.style.transition = `opacity ${sec}s 0s ease-in-out`;
	ele.style.height = "100vh";
	ele.style.opacity = 1;
	document.body.classList.remove("var1");
	setTimeout(function () { }, ms + del + 10);
}







