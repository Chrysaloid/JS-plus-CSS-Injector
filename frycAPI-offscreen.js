"use strict";

const log = console.log;

const injectedStyles = {};

chrome.runtime.onMessage.addListener(async function ({ name, data }, sender, sendResp) {
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
});
