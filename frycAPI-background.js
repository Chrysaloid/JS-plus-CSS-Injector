/* eslint-disable no-extra-semi */
"use strict";

const log = console.log;
Object.defineProperty(Object.prototype, "log", {
	get() {
		log(this);
		return this;
	},
});

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
function blobToBase64(blob) {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return new Promise(resolve => {
		reader.onloadend = () => {
			resolve(reader.result);
		};
	});
}
function onTabClosed(tabId, callback) {
	const listener = closedTabId => {
		if (closedTabId !== tabId) return;
		chrome.tabs.onRemoved.removeListener(listener);
		callback();
	};

	chrome.tabs.onRemoved.addListener(listener);
}
async function runOnPage(tabId, daFunc, args = []) {
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: { tabId },
		func: daFunc,
		args: args,
	});
	return result;
} // const out = await runOnPage(sender.tab.id, () => {});

let spotifyAuthorizationResolve, spotifyAuthorizationReject;
const spotifyAuthorization = new Promise((resolve, reject) => {
	spotifyAuthorizationResolve = resolve;
	spotifyAuthorizationReject = reject;
});
function catchSpotifyRequest(details) {
	if (details.method !== "GET") return;

	const authorization = details.requestHeaders?.find(
		header => header.name.toLowerCase() === "authorization"
	)?.value;

	if (!authorization) return;

	chrome.webRequest.onBeforeSendHeaders.removeListener(catchSpotifyRequest);
	spotifyAuthorizationResolve(authorization);
}

chrome.runtime.onMessageExternal.addListener(function ({ name, data }, sender, sendResp) {
	// log(name);
	// log(data);

	(async () => { switch (name) { // eslint-disable-line brace-style
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
		case "downloadURL": return void chrome.downloads.download(data);
		case "downloadNotify": return new Promise(resolve => {
			let theId;
			function onChanged({ id, state }) {
				if (id === theId && state?.current !== "in_progress") { // state.current === "interrupted" || state.current === "complete"
					chrome.downloads.onChanged.removeListener(onChanged);
					resolve();
				}
			}
			chrome.downloads.onChanged.addListener(onChanged);
			chrome.downloads.download(data).then(id => { theId = id });
		});
		case "getImgAsDataUrl": return fetch(data).then(res => res.blob()).then(async blob => "data:" + blob.type + ";" + (await blobToBase64(blob)));
		case "injectStyle": return sender.tab ? chrome.scripting.insertCSS(CSSInjection(data, sender)) : 0;
		case "removeStyle": return sender.tab ? chrome.scripting.removeCSS(CSSInjection(data, sender)) : 0;
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
		case "catchSpotifyRequest": {
			chrome.webRequest.onBeforeSendHeaders.addListener(catchSpotifyRequest, { urls: ["https://api.spotify.com/*"], tabId: sender.tab.id }, ["requestHeaders"]);
			onTabClosed(sender.tab.id, () => {
				chrome.webRequest.onBeforeSendHeaders.removeListener(catchSpotifyRequest);
				spotifyAuthorizationReject();
			});
			return;
		};
		case "getSpotifyAuthorization": return spotifyAuthorization;
		case "test": {
			log(data);
			return data;
		};
		default: throw new Error(`There is no event with name "${name}". Received data: ${data}`);
	}})().then(dataOut => { // eslint-disable-line brace-style
		sendResp({ error: false, data: dataOut });
	}).catch(err => {
		sendResp({ error: true, errObj: { message: err.message, stack: err.stack } });
	});
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
	chrome.downloads.download({ url: details.url, conflictAction: "overwrite" });
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

/* // For the future if we needed to add repetative declarativeNetRequest rules. It has to be done iside onInstalled
chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeNetRequest.getDynamicRules().then(oldRules => {
		chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: oldRules.map(rule => rule.id),
			addRules: [
				"value",
			].map((value, index) => ({
				id: index + 1,
				priority: 1,
				condition: {},
				action: {},
			})),
		});
	});
});
*/

/* // Force all downloads to overwrite any existing files instead of inserting ' (1)', ' (2)', etc. | Does not work and is dangerous
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
	if	(item.byExtensionId) {
		log(item.byExtensionId);
		suggest(); // does not work, conflictAction from download is ignored
	} else {
		log("Empty");
		suggest({ filename: item.filename, conflictAction: "overwrite" });
	}
});
*/

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
