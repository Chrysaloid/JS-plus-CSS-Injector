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
				}
				case "downloadURL": return void chrome.downloads.download({ url: data });
				case "injectStyle": return chrome.scripting.insertCSS(defineStyle(data, sender));
				case "defineStyle": return void defineStyle(data, sender);
				case "injectStyleAgain": return chrome.scripting.insertCSS(injectedStyles[data.id]);
				case "removeStyle": return chrome.scripting.removeCSS(injectedStyles[data.id]);
				case "setStorage": return chrome.storage.sync.get(data.UUID).then(result => {
					const obj = result[data.UUID];
					if (obj !== undefined) {
						for (const [key, value] of Object.entries(data.obj)) {
							obj[key] = value;
						}
						chrome.storage.sync.set({ [data.UUID]: obj });
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
				}
				default: return log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data);
			}
		})();
		sendResp({ error: false, data: dataOut });
	} catch (err) {
		sendResp({ error: true, errObj: { message: err.message, stack: err.stack } });
	}
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą sendResp
});
