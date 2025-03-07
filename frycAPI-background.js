/* eslint-disable no-extra-semi */
"use strict";

const log = console.log;

async function getActiveTarget() {
	return { tabId: (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id };
} // const tabID = await getActiveTarget();

const injectedStyles = {};

function defineStyle(data, sender) {
	const CSSInjection = {
		css: data.style,
		// target: await getActiveTarget(),
		target: { tabId: sender.tab.id },
	};
	injectedStyles[data.id] = CSSInjection;
	return CSSInjection;
}
/* chrome.runtime.onMessage.addListener(async function ({ name, data }, sender, sendResp) {
	switch (name) {
		case "injectStyle": {
			chrome.scripting.insertCSS({
				css: data,
				target: await getActiveTarget(),
			});
			break;
		}
		case "test": {
			log(data);
			break;
		}
		default: log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data); break;
	}
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą sendResp
}); */
chrome.runtime.onMessageExternal.addListener(async function ({ name, data }, sender, sendResp) {
	// log(name);
	// log(data);
	try {
		const dataOut = await (() => {
			switch (name) {
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
				case "injectStyle": return chrome.scripting.insertCSS(defineStyle(data, sender));
				case "defineStyle": return void defineStyle(data, sender);
				case "injectStyleAgain": return chrome.scripting.insertCSS(injectedStyles[data.id]);
				case "removeStyle": return chrome.scripting.removeCSS(injectedStyles[data.id]);
				case "setStorage": return chrome.storage.sync.get(data.UUID).then(result => {
					const obj = result[data.UUID];
					if (obj !== undefined) {
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
					if (obj !== undefined) {
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
				default: throw new Error(`There is no event of name "${name}". Received data: ${data}`);
			}
		})();
		sendResp({ error: false, data: dataOut });
	} catch (err) {
		sendResp({ error: true, errObj: { message: err.message, stack: err.stack } });
	}
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą sendResp
});


function findHeader(headers, headerStr) {
	return headers.find(header => header.name.toLowerCase() === headerStr);
}
chrome.webRequest.onHeadersReceived.addListener(details => {
	// This method breaks when server marks quickly repeated requests as a bot behavior
	if (details.type !== "main_frame") return; // only intercept PDFs that will be view as an entire page
	if (!findHeader(details.responseHeaders, "content-type")?.value?.toLowerCase?.()?.includes?.("application/pdf")) return; // request is not for PDF
	if (findHeader(details.responseHeaders, "content-disposition")?.value?.toLowerCase?.()?.includes?.("attachment")) return; // requested PDF will be downloaded so don't download it again
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
