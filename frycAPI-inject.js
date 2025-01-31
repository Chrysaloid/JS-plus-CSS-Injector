"use strict";

const frycAPIScript = document.createElement("script");
frycAPIScript.src = chrome.runtime.getURL("frycAPI.js");
frycAPIScript.setAttribute("script-id", chrome.runtime.id);
document.documentElement.appendChild(frycAPIScript);
// console.log("Inject");

/* //^ chrome.runtime.getURL is not exposed in MAIN world
document.documentElement.appendChild(
	document.createElement("script")
	.frycAPI_setAttribute("src", chrome.runtime.getURL("frycAPI.js"))
	.frycAPI_setAttribute("script-id", chrome.runtime.id)
); */
