"use strict";

const log = console.log;

let creating; // A global promise to avoid concurrency issues
async function setup_offscreen_document(path) {
	// Check all windows controlled by the service worker to see if one of them is the offscreen document with the given path
	const offscreen_url = chrome.runtime.getURL(path);
	const existing_contexts = await chrome.runtime.getContexts({
		contextTypes: ["OFFSCREEN_DOCUMENT"],
		documentUrls: [offscreen_url],
	});

	if (existing_contexts.length) return; // OK. Document exist

	// Create offscreen document
	if (creating) {
		await creating;
	} else {
		creating = chrome.offscreen.createDocument({
			url: path,
			reasons: ["WORKERS"],
			justification: "Need to persist state beyond service worker lifetime",
		});
		await creating;
		creating = null; // eslint-disable-line require-atomic-updates
	}
}
setup_offscreen_document("Offscreen.html");
