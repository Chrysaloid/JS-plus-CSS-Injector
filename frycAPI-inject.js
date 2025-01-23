"use strict";

const frycAPI = document.createElement("script");
frycAPI.src = chrome.runtime.getURL("frycAPI.js");
frycAPI.setAttribute("script-id", chrome.runtime.id);
document.documentElement.appendChild(frycAPI);
// console.log("Inject");

//^ chrome.runtime.getURL is not exposed in MAIN world
// document.documentElement.appendChild(
// 	document.createElement("script")
// 	.frycAPI_setAttribute("src", chrome.runtime.getURL("frycAPI.js"))
// 	.frycAPI_setAttribute("script-id", chrome.runtime.id)
// );

/* frycAPI.addEventListener("frycAPI_to_content_script", function ({ detail: { name, data } }) {
	switch (name) {
		case "injectStyle": {
			chrome.runtime.sendMessage({ name, data });
			break;
		}
		case "test": {
			console.log(data);
			break;
		}
		default: console.log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data); break;
	}
}); */
