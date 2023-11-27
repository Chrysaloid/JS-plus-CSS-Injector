// document.body.style.display = "block";
// document.body.style.opacity = 1;
// document.body.style.visibility = "visible";

var ms = 350;
var sec = ms/1000;
var del = 100;
var sdel = del/1000;

var dyv = document.createElement("div");
dyv.style.backgroundColor = "#262626";
dyv.style.position = "fixed";
dyv.style.width = "100vw";
dyv.style.height = "100vh";
dyv.style.top = "0px";
dyv.style.zIndex = "1000";
dyv.style.transition = `opacity ${sec}s ${sdel}s ease-in-out`;
dyv.classList.add("dyv");
document.body.appendChild(dyv);

document.body.style.display = "block";
// document.body.style.height = "auto";