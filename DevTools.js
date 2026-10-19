"use strict";

function log(txt) {
	chrome.devtools.inspectedWindow.eval(`console.log('${txt}')`);
} // log("DevTools.js");
function log_obj(obj) {
	chrome.devtools.inspectedWindow.eval(`console.log(JSON.parse('${JSON.stringify(obj)}'))`);
} // log_obj({ a: [1, 2, 3] });

function focus_page() {
	return chrome.tabs.get(chrome.devtools.inspectedWindow.tabId).then(tab => {
		if (!tab) throw new Error("Tab not found");
		chrome.tabs.update(tab.id, { active: true });
		return chrome.windows.get(tab.windowId);
	}).then(window => {
		return chrome.windows.update(window.id, { focused: true });
	}).catch(error => log("Error: ", error));
}

chrome.devtools.panels.create("Edit frycAPI", "", "Empty.html", panel => {
	panel.onShown.addListener(() => {
		focus_page().then(() => {
			chrome.devtools.inspectedWindow.eval(`frycAPI.send_message_to_ahk("Open frycAPI.js", (frycAPI.line ?? "999999999") + " " + frycAPI_host())`);
		});
	});
});
chrome.devtools.panels.create("Focus page", "", "Empty.html", panel => {
	panel.onShown.addListener(focus_page);
});
