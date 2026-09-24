"use strict";
//* CDP bridge - lets Claude Workbench\chrome_bridge_client.py drive this browser through chrome.debugger.
//* Imported by frycAPI-background.js, so `log` is already defined. Needs the "debugger" permission.
//* Connects only when frycAPI.connectClaudeBridge() asks, never by itself.
//* The module docstring of chrome_bridge_client.py is the documentation.

const CDP_BRIDGE_URL     = "ws://127.0.0.1:9333/ext?app=chrome"; // chrome_bridge.py keys connections by app; manual_chrome_bridge.js brings the others
const CDP_VERSION        = "1.3";
const CDP_EVENT_MAX_SIZE = 65536; // Characters of a forwarded event's params before it is replaced by a note

let bridgeSocket = null;
const attachedTabs = new Set();
let cspFlagSupported = true; // allowUnsafeEvalBlockedByCSP is experimental; cleared for good if this Chrome rejects it

function bridgeSend(message) {
	if (bridgeSocket?.readyState !== WebSocket.OPEN) return false;
	bridgeSocket.send(JSON.stringify(message));
	return true;
}
async function resolveTab(data) {
	if (typeof data.tabId === "number") return data.tabId;

	if (data.match) {
		const needle = data.match.toLowerCase();
		const hits = (await chrome.tabs.query({})).filter(tab => (tab.url ?? "").toLowerCase().includes(needle) || (tab.title ?? "").toLowerCase().includes(needle));
		if (hits.length === 1) return hits[0].id;
		if (hits.length === 0) throw new Error(`no tab matches "${data.match}"`);
		throw new Error(`"${data.match}" matches ${hits.length} tabs, be more specific: ` + JSON.stringify(hits.map(tab => ({ id: tab.id, title: tab.title, url: tab.url }))));
	}

	const [active] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
	if (!active) throw new Error("there is no active tab in the last focused window");
	return active.id;
}
async function ensureAttached(tabId) {
	if (attachedTabs.has(tabId)) return;

	try {
		await chrome.debugger.attach({ tabId }, CDP_VERSION);
	} catch (err) {
		// Either this extension is attached already (service worker restarted and lost the Set), or somebody else is - DevTools, most likely.
		try {
			await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", { expression: "1", returnByValue: true });
		} catch {
			throw new Error(`cannot attach to tab ${tabId}: ${err.message}. DevTools open on that tab? Close it, or use another tab. chrome:// pages and the Web Store cannot be attached at all.`);
		}
	}
	attachedTabs.add(tabId);
	// DevTools' "Emulate a focused page". Without it a hidden tab reports visibilityState "hidden" and Chrome throttles its timers to ~1/s
	// (~1/min past five minutes hidden), which reads as the bridge hanging. Measured on a hidden tab: a 10 ms timer took 971 ms without
	// this, 10 ms with it. Reverted automatically on detach, and it does not disturb the tab the user is looking at.
	await chrome.debugger.sendCommand({ tabId }, "Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
}
async function activateTab(tabId) {
	const tab = await chrome.tabs.get(tabId);
	await chrome.tabs.update(tabId, { active: true });
	await chrome.windows.update(tab.windowId, { focused: true });
}
function describeException({ exception, text, lineNumber, columnNumber }) {
	return {
		text        : exception?.description ?? exception?.value ?? text,
		className   : exception?.className,
		lineNumber  : lineNumber,
		columnNumber: columnNumber,
	};
}
async function cdpEvalByReference(tabId, expression, awaitPromise, note) {
	const result = await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
		expression,
		awaitPromise,
		returnByValue         : false,
		generatePreview       : true,
		includeCommandLineAPI : true,
		replMode              : true,
		userGesture           : true,
	});
	if (result.exceptionDetails) return { ok: false, exception: describeException(result.exceptionDetails) };

	const { type, subtype, className, description, preview } = result.result;
	return { ok: true, note, type, subtype, className, description, preview };
}
async function cdpEval(tabId, expression, awaitPromise = true) {
	await ensureAttached(tabId);

	const options = {
		expression,
		awaitPromise,
		returnByValue         : true,
		includeCommandLineAPI : true, // $, $$, $x and friends
		replMode              : true, // The console's semantics: top-level await, and let/const may be redeclared by a re-run
		userGesture           : true,
	};
	if (cspFlagSupported) options.allowUnsafeEvalBlockedByCSP = true; // Lets the expression run on pages that forbid unsafe-eval

	let result;
	try {
		result = await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", options);
	} catch (err) {
		if (cspFlagSupported && (/nvalid parameter|allowUnsafeEvalBlockedByCSP/).test(err.message)) { // This Chrome does not know the experimental flag
			cspFlagSupported = false;
			log("CDP bridge: allowUnsafeEvalBlockedByCSP rejected, continuing without it");
			return cdpEval(tabId, expression, awaitPromise);
		}
		// Otherwise the value could not be serialised (circular, a function, ...) - fall back to a description
		return cdpEvalByReference(tabId, expression, awaitPromise, `not serialisable by value: ${err.message}`);
	}

	if (result.exceptionDetails) return { ok: false, exception: describeException(result.exceptionDetails) };

	const { type, subtype, value, description, unserializableValue } = result.result;
	if (type === "object" && value === undefined) { // A DOM node or similar serialises to nothing useful
		return cdpEvalByReference(tabId, expression, awaitPromise, `a ${subtype ?? type} does not survive serialisation - return outerHTML or a plain object instead`);
	}

	return { ok: true, type, subtype, value: value ?? unserializableValue ?? description };
}
async function cdpHtml(tabId, selector, all, maxLength) {
	const sel = JSON.stringify(selector);
	const expression = all ?
		`[...document.querySelectorAll(${sel})].map(el => el.outerHTML.slice(0, ${maxLength}))` :
		`(() => { const el = document.querySelector(${sel}); return el === null ? null : el.outerHTML.slice(0, ${maxLength}); })()`;
	return cdpEval(tabId, expression, false);
}

chrome.debugger.onEvent.addListener((source, method, params) => {
	let payload = params;
	const asText = JSON.stringify(params ?? null);
	if (asText !== null && asText.length > CDP_EVENT_MAX_SIZE) payload = { truncated: true, size: asText.length, head: asText.slice(0, CDP_EVENT_MAX_SIZE) };
	bridgeSend({ type: "event", tabId: source.tabId, method, params: payload });
});
chrome.debugger.onDetach.addListener((source, reason) => {
	attachedTabs.delete(source.tabId);
	bridgeSend({ type: "event", tabId: source.tabId, method: "Bridge.detached", params: { reason } });
});

async function resolveTabAndPrepare(data) {
	const tabId = await resolveTab(data);
	if (data.activate) await activateTab(tabId); // Foreground it, so timers and requestAnimationFrame actually run
	return tabId;
}
async function handleBridgeCommand({ command, ...data }) {
	switch (command) {
		case "keepalive": return { keepalive: true };
		case "tabs": {
			const needle = data.match?.toLowerCase();
			const tabs = (await chrome.tabs.query({}))
			.filter(tab => !needle || (tab.url ?? "").toLowerCase().includes(needle) || (tab.title ?? "").toLowerCase().includes(needle))
			.map(tab => ({ id: tab.id, title: tab.title, url: tab.url, active: tab.active, windowId: tab.windowId, attached: attachedTabs.has(tab.id) }));
			return { tabs };
		}
		case "attach": {
			const tabId = await resolveTabAndPrepare(data);
			await ensureAttached(tabId);
			return { tabId, attached: true };
		}
		case "detach": {
			const tabIds = data.all ? [...attachedTabs] : [await resolveTab(data)];
			for (const tabId of tabIds) {
				await chrome.debugger.detach({ tabId }).catch(() => {}); // Already gone is not an error here
				attachedTabs.delete(tabId);
			}
			return { detached: tabIds };
		}
		case "eval": {
			const tabId = await resolveTabAndPrepare(data);
			return { tabId, ...await cdpEval(tabId, data.expression, data.awaitPromise !== false) };
		}
		case "html": {
			const tabId = await resolveTabAndPrepare(data);
			return { tabId, ...await cdpHtml(tabId, data.selector, data.all === true, data.maxLength ?? 20000) };
		}
		case "cdp": {
			const tabId = await resolveTabAndPrepare(data);
			await ensureAttached(tabId);
			return { tabId, result: await chrome.debugger.sendCommand({ tabId }, data.method, data.params ?? {}) };
		}
		default: throw new Error(`unknown bridge command "${command}"`);
	}
}
let bridgeConnecting = null; // The promise of an attempt in flight, so a double trigger shares it

function connectBridge() { // Resolves to a status string, rejects when the server cannot be reached
	if (bridgeSocket?.readyState === WebSocket.OPEN) return Promise.resolve("already connected to " + CDP_BRIDGE_URL);
	if (bridgeConnecting) return bridgeConnecting;

	const socket = new WebSocket(CDP_BRIDGE_URL);
	bridgeSocket = socket;
	bridgeConnecting = new Promise((resolve, reject) => {
		socket.onopen = () => {
			bridgeConnecting = null;
			bridgeSend({ type: "hello", userAgent: navigator.userAgent, via: "JS + CSS Injector extension" });
			log("CDP bridge connected to " + CDP_BRIDGE_URL);
			resolve("connected to " + CDP_BRIDGE_URL);
		};
		socket.onerror = () => {}; // onclose follows and does the reporting
		socket.onclose = () => {
			if (bridgeSocket === socket) bridgeSocket = null;
			if (bridgeConnecting) {
				bridgeConnecting = null;
				reject(new Error(`cannot reach the bridge server at ${CDP_BRIDGE_URL} - is chrome_bridge.py running?`));
			} else {
				log("CDP bridge disconnected");
			}
		};
	});
	socket.onmessage = async event => {
		let message;
		try {
			message = JSON.parse(event.data);
		} catch {
			return;
		}
		if (message.id === undefined) return void await handleBridgeCommand(message).catch(() => {}); // Fire and forget, e.g. the keepalive

		try {
			bridgeSend({ id: message.id, ok: true, ...await handleBridgeCommand(message) });
		} catch (err) {
			bridgeSend({ id: message.id, ok: false, error: err.message, stack: err.stack });
		}
	};
	return bridgeConnecting;
}
