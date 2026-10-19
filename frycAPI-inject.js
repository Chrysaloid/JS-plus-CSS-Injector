"use strict";

const frycAPI_script = document.createElement("script");
frycAPI_script.src = chrome.runtime.getURL("frycAPI.js");
frycAPI_script.setAttribute("script-id", chrome.runtime.id);
frycAPI_script.setAttribute("charset", "utf-8"); // Fixes SyntaxError: Invalid or unexpected token "temₚ"
document.documentElement.appendChild(frycAPI_script);
// console.log("Inject");

/* //^ chrome.runtime.getURL is not exposed in MAIN world
document.documentElement.appendChild(
	document.createElement("script")
	.frycAPI_set_attribute("src", chrome.runtime.getURL("frycAPI.js"))
	.frycAPI_set_attribute("script-id", chrome.runtime.id)
); */
