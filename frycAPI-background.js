/* eslint-disable no-extra-semi */
"use strict";

const log = console.log;

// #region Unused chrome.storage.session wrapper
/* // This someday might be useful...
const varDefaults = { // Global persistent variables. Can't be null or undefined
	injectedStyles: {},
	test: 0,
};

let readWrite = null;
const varCache = {};
async function getVar(name) {
	if (readWrite) await readWrite;
	if (varCache.hasOwnProperty(name)) return varCache[name];
	readWrite = chrome.storage.session.get(name);
	const temp = varCache[name] = (await readWrite)[name] ?? varDefaults[name];
	readWrite = null;
	return temp;
}
async function setVar(name, value) {
	if (readWrite) await readWrite;
	varCache[name] = value;
	readWrite = chrome.storage.session.set({ [name]: value });
	await readWrite;
	readWrite = null;
}
async function getSetVar(name, callback) { // callback will get value and should return new value
	if (readWrite) await readWrite;
	let newVal;
	if (varCache.hasOwnProperty(name)) {
		newVal = varCache[name] = callback(varCache[name]);
	} else {
		readWrite = chrome.storage.session.get(name);
		newVal = varCache[name] = callback((await readWrite)[name] ?? varDefaults[name]);
	}
	readWrite = chrome.storage.session.set({ [name]: newVal });
	await readWrite;
	readWrite = null;
	return newVal;
}
*/

/* // Left as a example usage of getSetVar
function defineStyle(data, sender) {
	const CSSInjection = {
		css: data.style,
		target: { tabId: sender.tab.id },
	};
	getSetVar("injectedStyles", injectedStyles => {
		injectedStyles[data.id] = CSSInjection;
		return injectedStyles;
	});
	return CSSInjection;
}
*/

/* // Left as a example usage of getVar
case "injectStyleAgain": return chrome.scripting.insertCSS((await getVar("injectedStyles"))[data.id]); // happens second
case "removeStyle": return chrome.scripting.removeCSS((await getVar("injectedStyles"))[data.id]);      // happens second
*/
// #endregion

function CSSInjection(data = {}, sender) {
	return {
		css: data.style,
		target: { tabId: sender.tab.id, allFrames: data.allFrames },
	};
}
chrome.runtime.onMessageExternal.addListener(async function ({ name, data }, sender, sendResp) {
	// log(name);
	// log(data);
	try {
		const dataOut = await (async () => { switch (name) { // eslint-disable-line brace-style
			case "closeTab": return void chrome.tabs.remove(sender.tab.id);
			case "downloadPDF": {
				chrome.downloads.download({ url: data.url }).then(downloadId => {
					// log(downloadId);
					if (data.czyZamknąć) {
						chrome.tabs.remove(sender.tab.id);
					} else {
						chrome.tabs.goBack(sender.tab.id);
					}
				});
				return;
			};
			case "downloadURL": return void chrome.downloads.download({ url: data.url, filename: data.filename });
			case "injectStyle": return chrome.scripting.insertCSS(CSSInjection(data, sender));
			case "removeStyle": return chrome.scripting.removeCSS(CSSInjection(data, sender));
			case "setStorage": return chrome.storage.sync.get(data.UUID).then(result => {
				const obj = result[data.UUID];
				if (obj) {
					let objChanged = false;
					for (const [key, value] of Object.entries(data.obj)) {
						// hasOwnProperty is necessary to catch possibility of defining a new key with value undefined
						if (obj[key] !== value || !obj.hasOwnProperty(key)) objChanged = true;
						obj[key] = value;
					}
					if (objChanged) chrome.storage.sync.set({ [data.UUID]: obj });
				} else {
					chrome.storage.sync.set({ [data.UUID]: data.obj });
				}
			});
			case "getStorage": return chrome.storage.sync.get(data.UUID).then(result => {
				const obj = result[data.UUID];
				if (obj) {
					const newObj = {};
					for (const key of data.keys) {
						newObj[key] = obj[key];
					}
					return newObj;
				} else {
					return {};
				}
			});
			case "removeStorage": return chrome.storage.sync.remove(data);
			case "storageUsed": return chrome.storage.sync.getBytesInUse(null);
			case "storageUsedPerc": return chrome.storage.sync.getBytesInUse(null).then(bytesInUse => {
				return (bytesInUse / chrome.storage.sync.QUOTA_BYTES * 100).toFixed(3) + " %";
			});
			case "test": {
				log(data);
				return data;
			};
			default: throw new Error(`There is no event with name "${name}". Received data: ${data}`);
		}})(); // eslint-disable-line brace-style
		sendResp({ error: false, data: dataOut });
	} catch (err) {
		sendResp({ error: true, errObj: { message: err.message, stack: err.stack } });
	}
	return true; // Necessary if we want to send a response using sendResp
});

function findHeader(headers, headerStr) {
	return headers.find(header => header.name.toLowerCase() === headerStr);
}
chrome.webRequest.onHeadersReceived.addListener(details => {
	// This method breaks when server marks quickly repeated requests as a bot behavior
	if (details.type !== "main_frame") return; // only intercept PDFs that will be view as an entire page
	if (!findHeader(details.responseHeaders, "content-type")?.value.toLowerCase().includes("application/pdf")) return; // request is not for PDF
	if (findHeader(details.responseHeaders, "content-disposition")?.value.toLowerCase().includes("attachment")) return; // requested PDF will be downloaded so don't download it again
	// log(details);
	chrome.downloads.download({ url: details.url });
	chrome.tabs.onUpdated.addListener(function tabsOnUpdated(tabId, changeInfo, tab) { // addlistener to close the tab or go back
		// log(changeInfo);
		if (changeInfo.status === "loading") {
			chrome.tabs.goBack(tabId).then(null, () => { // if going back is not possible the promise gets rejected and that means that the PDF was opened in new tab so close the tab
				chrome.tabs.remove(tabId);
			});
			chrome.tabs.onUpdated.removeListener(tabsOnUpdated);
		}
	});
}, { urls: ["<all_urls>"] }, ["responseHeaders"]);

// #region Unused
/* // As of Manifest V3, this is only available to policy installed extensions.
//* This method breaks on this URL http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf
chrome.webRequest.onHeadersReceived.addListener(details => {
	if (details.type !== "main_frame") return;
const contentType = details.responseHeaders.find(header => header.name.toLowerCase() === "content-type");
if (contentType === undefined || !contentType.value.toLowerCase().includes("application/pdf")) return; // request is not for PDF
// log(details);
const contDispIdx = details.responseHeaders.findIndex(header => header.name.toLowerCase() === "content-disposition");
if (contDispIdx !== -1) { // content-disposition header is present on the response
const oldVal = details.responseHeaders[contDispIdx].value.toLowerCase();
if (oldVal.includes("attachment")) {
return;
} else {
details.responseHeaders[contDispIdx].value = "attachment";
}
} else {
details.responseHeaders.push({ name: "content-disposition", value: "attachment" });
}
return { responseHeaders: details.responseHeaders };
}, { urls: ["<all_urls>"] }, ["blocking", "responseHeaders"]);
*/

// chrome.webRequest.onHeadersReceived.addListener(details => {
// 	log(details.type);
// }, { urls: ["<all_urls>"] }, ["responseHeaders"]);

/* getActiveTarget
async function getActiveTarget() {
	return { tabId: (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id };
} // const tabID = await getActiveTarget();
*/
// #endregion
