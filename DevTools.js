"use strict";

function log(txt) {
	chrome.devtools.inspectedWindow.eval(`console.log('${txt}')`);
} // log("DevTools.js");
function logObj(obj) {
	chrome.devtools.inspectedWindow.eval(`console.log(JSON.parse('${JSON.stringify(obj)}'))`);
} // logObj({ a: [1, 2, 3] });

chrome.devtools.panels.create("Edit frycAPI", "", "Empty.html", panel => {
	panel.onShown.addListener(() => {
		chrome.devtools.inspectedWindow.eval("frycAPI.VSC_Go_To_Line()");
	});
});
chrome.devtools.panels.create("Focus page", "", "Empty.html", panel => {
	panel.onShown.addListener(() => {
		chrome.tabs.get(chrome.devtools.inspectedWindow.tabId).then(tab => {
			if (!tab) throw new Error("Tab not found");
			chrome.tabs.update(tab.id, { active: true });
			return chrome.windows.get(tab.windowId);
		}).then(window => {
			if (window.state === "minimized") {
				return chrome.windows.update(window.id, { focused: true });
			}
		}).catch(error => log("Error: ", error));
	});
});
