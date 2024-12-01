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
	sendResp(await (async () => {
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
			case "injectStyle": return await chrome.scripting.insertCSS(defineStyle(data, sender));
			case "defineStyle": return void defineStyle(data, sender);
			case "injectStyleAgain": return await chrome.scripting.insertCSS(injectedStyles[data.id]);
			case "removeStyle": return await chrome.scripting.removeCSS(injectedStyles[data.id]);
			case "test": {
				log(data);
				return data;
			}
			default: return log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data);
		}
	})());
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą sendResp
});
