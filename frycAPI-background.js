/* eslint-disable no-extra-semi */
"use strict";

const log = console.log;
Object.defineProperty(Object.prototype, "log", {
	get() {
		log(this);
		return this;
	},
});

importScripts("frycAPI-cdp-bridge.js"); //* After `log` is defined, since the bridge uses it

const RULE_ID_BASE = 1000;

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

function css_injection(data = {}, sender) {
	return {
		css: data.style,
		target: { tabId: sender.tab.id, allFrames: data.allFrames },
	};
}
function blob_to_base64(blob) {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return new Promise(resolve => {
		reader.onloadend = () => {
			resolve(reader.result);
		};
	});
}
function on_tab_closed(tab_id, callback) {
	const listener = closed_tab_id => {
		if (closed_tab_id !== tab_id) return;
		chrome.tabs.onRemoved.removeListener(listener);
		callback();
	};

	chrome.tabs.onRemoved.addListener(listener);
}
async function run_on_page(tab_id, da_func, args = []) {
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: { tabId: tab_id },
		func: da_func,
		args: args,
	});
	return result;
} // const out = await run_on_page(sender.tab.id, () => {});

let spotify_authorization_resolve, spotify_authorization_reject;
const spotify_authorization = new Promise((resolve, reject) => {
	spotify_authorization_resolve = resolve;
	spotify_authorization_reject = reject;
});
function catch_spotify_request(details) {
	if (details.method !== "GET") return;

	const authorization = details.requestHeaders?.find(
		header => header.name.toLowerCase() === "authorization"
	)?.value;

	if (!authorization) return;

	chrome.webRequest.onBeforeSendHeaders.removeListener(catch_spotify_request);
	spotify_authorization_resolve(authorization);
}

chrome.runtime.onMessageExternal.addListener(function ({ name, data }, sender, send_resp) { //* Main background logic
	// log(name);
	// log(data);

	(async () => { switch (name) { // eslint-disable-line brace-style
		case "closeTab": return void chrome.tabs.remove(sender.tab.id);
		case "downloadPDF": {
			chrome.downloads.download({ url: data.url }).then(download_id => {
				// log(downloadId);
				if (data.czy_zamknąć) {
					chrome.tabs.remove(sender.tab.id);
				} else {
					chrome.tabs.goBack(sender.tab.id);
				}
			});
			return;
		};
		case "unblockImagesOnThisTab": return chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [RULE_ID_BASE + sender.tab.id] });
		case "downloadURL": return void chrome.downloads.download(data);
		case "downloadNotify": return new Promise(resolve => {
			let the_id;
			function on_changed({ id, state }) {
				if (id === the_id && state?.current !== "in_progress") { // state.current === "interrupted" || state.current === "complete"
					chrome.downloads.onChanged.removeListener(on_changed);
					resolve();
				}
			}
			chrome.downloads.onChanged.addListener(on_changed);
			chrome.downloads.download(data).then(id => { the_id = id });
		});
		case "getImgAsDataUrl": return fetch(data).then(res => res.blob()).then(async blob => "data:" + blob.type + ";" + (await blob_to_base64(blob)));
		case "injectStyle": return sender.tab ? Promise.all([chrome.scripting.removeCSS(css_injection(data, sender)), chrome.scripting.insertCSS(css_injection(data, sender))]) : 0; // deduplicating injections
		case "removeStyle": return sender.tab ? chrome.scripting.removeCSS(css_injection(data, sender)) : 0;
		case "setStorage": return chrome.storage.sync.get(data.UUID).then(result => {
			const obj = result[data.UUID];
			if (obj) {
				let obj_changed = false;
				for (const [key, value] of Object.entries(data.obj)) {
					// hasOwnProperty is necessary to catch possibility of defining a new key with value undefined
					if (obj[key] !== value || !obj.hasOwnProperty(key)) obj_changed = true;
					obj[key] = value;
				}
				if (obj_changed) chrome.storage.sync.set({ [data.UUID]: obj });
			} else {
				chrome.storage.sync.set({ [data.UUID]: data.obj });
			}
		});
		case "getStorage": return chrome.storage.sync.get(data.UUID).then(result => {
			const obj = result[data.UUID];
			if (obj) {
				const new_obj = {};
				for (const key of data.keys) {
					new_obj[key] = obj[key];
				}
				return new_obj;
			} else {
				return {};
			}
		});
		case "removeStorage": return chrome.storage.sync.remove(data);
		case "storageUsed": return chrome.storage.sync.getBytesInUse(null);
		case "storageUsedPerc": return chrome.storage.sync.getBytesInUse(null).then(bytes_in_use => {
			return (bytes_in_use / chrome.storage.sync.QUOTA_BYTES * 100).toFixed(3) + " %";
		});
		case "catchSpotifyRequest": {
			chrome.webRequest.onBeforeSendHeaders.addListener(catch_spotify_request, { urls: ["https://api.spotify.com/*"], tabId: sender.tab.id }, ["requestHeaders"]);
			on_tab_closed(sender.tab.id, () => {
				chrome.webRequest.onBeforeSendHeaders.removeListener(catch_spotify_request);
				spotify_authorization_reject();
			});
			return;
		};
		case "getSpotifyAuthorization": return spotify_authorization;
		case "connectCdpBridge": return connect_bridge();
		case "test": {
			log(data);
			return data;
		};
		default: throw new Error(`There is no event with name "${name}". Received data: ${data}`);
	}})().then(data_out => { // eslint-disable-line brace-style
		send_resp({ error: false, data: data_out });
	}).catch(err => {
		send_resp({ error: true, err_obj: { message: err.message, stack: err.stack } });
	});
	return true; // Necessary if we want to send a response using send_resp
});

// #region //* PDF handling
function find_header(headers, header_str) {
	return headers.find(header => header.name.toLowerCase() === header_str);
}
chrome.webRequest.onHeadersReceived.addListener(details => {
	// This method breaks when server marks quickly repeated requests as a bot behavior
	if (details.type !== "main_frame") return; // only intercept PDFs that will be view as an entire page
	if (!find_header(details.responseHeaders, "content-type")?.value.toLowerCase().includes("application/pdf")) return; // request is not for PDF
	if (find_header(details.responseHeaders, "content-disposition")?.value.toLowerCase().includes("attachment")) return; // requested PDF will be downloaded so don't download it again
	// log(details);
	chrome.downloads.download({ url: details.url, conflictAction: "overwrite" });
	chrome.tabs.onUpdated.addListener(function tabs_on_updated(tab_id, change_info, tab) { // addlistener to close the tab or go back
		// log(changeInfo);
		if (change_info.status === "loading") {
			chrome.tabs.goBack(tab_id).then(null, () => { // if going back is not possible the promise gets rejected and that means that the PDF was opened in new tab so close the tab
				chrome.tabs.remove(tab_id);
			});
			chrome.tabs.onUpdated.removeListener(tabs_on_updated);
		}
	});
}, { urls: ["<all_urls>"] }, ["responseHeaders"]);
// #endregion

// const INTERESTING_REQUEST_DOMAINS = ["static1.e621.net", "static1.e926.net"];
// const INTERESTING_DOMAINS = ["e621.net", "e926.net"];
// chrome.webNavigation.onBeforeNavigate.addListener(async details => {
// 	log("Before navigate:", details);
// 	const ruleId = RULE_ID_BASE + details.tabId;
// 	await chrome.declarativeNetRequest.updateSessionRules({
// 		removeRuleIds: [ruleId],
// 		addRules: [{
// 			id: ruleId,
// 			priority: 1,
// 			condition: {
// 				requestDomains: INTERESTING_REQUEST_DOMAINS,
// 				resourceTypes: ["image", "media"],
// 				tabIds: [details.tabId],
// 			},
// 			action: { type: "block" },
// 		}],
// 	});
// }, {
// 	url: INTERESTING_DOMAINS.map(s => ({ hostEquals: s, pathContains: "/posts/" })),
// });

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
