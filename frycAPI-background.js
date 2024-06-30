"use strict";

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
			console.log(data);
			break;
		}
		default: console.log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data); break;
	}
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą sendResp
}); */
chrome.runtime.onMessageExternal.addListener(async function ({ name, data }, sender, sendResp) {
	// console.log(name);
	// console.log(data);
	sendResp(await (async () => {
		switch (name) {
			case "injectStyle": return await chrome.scripting.insertCSS(defineStyle(data, sender));
			case "defineStyle": return void defineStyle(data, sender);
			case "injectStyleAgain": return await chrome.scripting.insertCSS(injectedStyles[data.id]);
			case "removeStyle": return await chrome.scripting.removeCSS(injectedStyles[data.id]);
			case "test": {
				console.log(data);
				return data;
			}
			default: return console.log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data);
		}
	})());
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą sendResp
});
