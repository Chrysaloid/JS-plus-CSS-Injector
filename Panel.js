"use strict";

function log(txt) {
	chrome.devtools.inspectedWindow.eval(`console.log("${txt}")`);
}

// log("Panel.js");
