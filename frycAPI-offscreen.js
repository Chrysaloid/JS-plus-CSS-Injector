"use strict";

const log = console.log;

const injected_styles = {};

chrome.runtime.onMessage.addListener(async function ({ name, data }, sender, send_resp) {
	switch (name) {
		case "injectStyle": {
			chrome.scripting.insertCSS({
				css: data,
				target: await get_active_target(),
			});
			break;
		}
		case "test": {
			log(data);
			break;
		}
		default: log(`Nie ma eventu o nazwie "${name}". Otrzymano dane:`, data); break;
	}
	return true; // konieczne jeśli chcemy wysłać odpowiedź za pomocą send_resp
});
