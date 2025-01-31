"use strict";

function log(txt) {
	chrome.devtools.inspectedWindow.eval(`console.log("${txt}")`);
}
// log("DevTools.js");

chrome.devtools.panels.create("Edit frycAPI", "", "Edit_frycAPI.html", function (panel) {
	panel.onShown.addListener(function () {
		chrome.devtools.inspectedWindow.eval("frycAPI.VSC_Go_To_Line()");
	});
});
