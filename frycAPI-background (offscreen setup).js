"use strict";

const log = console.log;

let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
	// Check all windows controlled by the service worker to see if one of them is the offscreen document with the given path
	const offscreenUrl = chrome.runtime.getURL(path);
	const existingContexts = await chrome.runtime.getContexts({
		contextTypes: ["OFFSCREEN_DOCUMENT"],
		documentUrls: [offscreenUrl],
	});

	if (existingContexts.length) return; // OK. Document exist

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
setupOffscreenDocument("Offscreen.html");
