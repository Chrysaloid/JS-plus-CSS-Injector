"use strict";
//* CDP bridge - lets Claude Workbench\chrome_bridge_client.py drive this browser through chrome.debugger.
//* Imported by frycAPI-background.js, so `log` is already defined. Needs the "debugger" permission.
//* Connects only when frycAPI.connect_claude_bridge() or frycAPI.toggle_claude_bridge() asks, never by itself,
//* sending the secret from claude_bridge_secret.txt (gitignored), without which chrome_bridge.py refuses it.
//* The module docstring of chrome_bridge_client.py is the documentation.

const CDP_BRIDGE_URL         = "ws://127.0.0.1:9333/ext?app=chrome"; // chrome_bridge.py keys connections by app; manual_chrome_bridge.js brings the others
const CDP_BRIDGE_SECRET_FILE = "claude_bridge_secret.txt"; // In this extension's folder, read at every connect; chrome_bridge.py reads the same file
const CDP_VERSION            = "1.3";
const CDP_EVENT_MAX_SIZE = 65536; // Characters of a forwarded event's params before it is replaced by a note

let bridge_socket = null;
const attached_tabs = new Set();
let csp_flag_supported = true; // allowUnsafeEvalBlockedByCSP is experimental; cleared for good if this Chrome rejects it

function bridge_send(message) {
	if (bridge_socket?.readyState !== WebSocket.OPEN) return false;
	bridge_socket.send(JSON.stringify(message));
	return true;
}
async function resolve_tab(data) {
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
async function ensure_attached(tab_id) {
	if (attached_tabs.has(tab_id)) return;

	try {
		await chrome.debugger.attach({ tabId: tab_id }, CDP_VERSION);
	} catch (err) {
		// Either this extension is attached already (service worker restarted and lost the Set), or somebody else is - DevTools, most likely.
		try {
			await chrome.debugger.sendCommand({ tabId: tab_id }, "Runtime.evaluate", { expression: "1", returnByValue: true });
		} catch {
			throw new Error(`cannot attach to tab ${tab_id}: ${err.message}. DevTools open on that tab? Close it, or use another tab. chrome:// pages and the Web Store cannot be attached at all.`);
		}
	}
	attached_tabs.add(tab_id);
	// DevTools' "Emulate a focused page". Without it a hidden tab reports visibilityState "hidden" and Chrome throttles its timers to ~1/s
	// (~1/min past five minutes hidden), which reads as the bridge hanging. Measured on a hidden tab: a 10 ms timer took 971 ms without
	// this, 10 ms with it. Reverted automatically on detach, and it does not disturb the tab the user is looking at.
	await chrome.debugger.sendCommand({ tabId: tab_id }, "Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
}
async function activate_tab(tab_id) {
	const tab = await chrome.tabs.get(tab_id);
	await chrome.tabs.update(tab_id, { active: true });
	await chrome.windows.update(tab.windowId, { focused: true });
}
function describe_exception({ exception, text, lineNumber: line_number, columnNumber: column_number }) {
	return {
		text        : exception?.description ?? exception?.value ?? text,
		className   : exception?.className,
		lineNumber  : line_number,
		columnNumber: column_number,
	};
}
async function cdp_eval_by_reference(tab_id, expression, await_promise, note) {
	const result = await chrome.debugger.sendCommand({ tabId: tab_id }, "Runtime.evaluate", {
		expression,
		awaitPromise: await_promise,
		returnByValue         : false,
		generatePreview       : true,
		includeCommandLineAPI : true,
		replMode              : true,
		userGesture           : true,
	});
	if (result.exceptionDetails) return { ok: false, exception: describe_exception(result.exceptionDetails) };

	const { type, subtype, className: class_name, description, preview } = result.result;
	return { ok: true, note, type, subtype, className: class_name, description, preview };
}
async function cdp_eval(tab_id, expression, await_promise = true) {
	await ensure_attached(tab_id);

	const options = {
		expression,
		awaitPromise: await_promise,
		returnByValue         : true,
		includeCommandLineAPI : true, // $, $$, $x and friends
		replMode              : true, // The console's semantics: top-level await, and let/const may be redeclared by a re-run
		userGesture           : true,
	};
	if (csp_flag_supported) options.allowUnsafeEvalBlockedByCSP = true; // Lets the expression run on pages that forbid unsafe-eval

	let result;
	try {
		result = await chrome.debugger.sendCommand({ tabId: tab_id }, "Runtime.evaluate", options);
	} catch (err) {
		if (csp_flag_supported && (/nvalid parameter|allowUnsafeEvalBlockedByCSP/).test(err.message)) { // This Chrome does not know the experimental flag
			csp_flag_supported = false;
			log("CDP bridge: allowUnsafeEvalBlockedByCSP rejected, continuing without it");
			return cdp_eval(tab_id, expression, await_promise);
		}
		// Otherwise the value could not be serialised (circular, a function, ...) - fall back to a description
		return cdp_eval_by_reference(tab_id, expression, await_promise, `not serialisable by value: ${err.message}`);
	}

	if (result.exceptionDetails) return { ok: false, exception: describe_exception(result.exceptionDetails) };

	const { type, subtype, value, description, unserializableValue: unserializable_value } = result.result;
	if (type === "object" && value === undefined) { // A DOM node or similar serialises to nothing useful
		return cdp_eval_by_reference(tab_id, expression, await_promise, `a ${subtype ?? type} does not survive serialisation - return outerHTML or a plain object instead`);
	}

	return { ok: true, type, subtype, value: value ?? unserializable_value ?? description };
}
async function cdp_html(tab_id, selector, all, max_length) {
	const sel = JSON.stringify(selector);
	const expression = all ?
		`[...document.querySelectorAll(${sel})].map(el => el.outerHTML.slice(0, ${max_length}))` :
		`(() => { const el = document.querySelector(${sel}); return el === null ? null : el.outerHTML.slice(0, ${max_length}); })()`;
	return cdp_eval(tab_id, expression, false);
}

chrome.debugger.onEvent.addListener((source, method, params) => {
	let payload = params;
	const as_text = JSON.stringify(params ?? null);
	if (as_text !== null && as_text.length > CDP_EVENT_MAX_SIZE) payload = { truncated: true, size: as_text.length, head: as_text.slice(0, CDP_EVENT_MAX_SIZE) };
	bridge_send({ type: "event", tabId: source.tabId, method, params: payload });
});
chrome.debugger.onDetach.addListener((source, reason) => {
	attached_tabs.delete(source.tabId);
	bridge_send({ type: "event", tabId: source.tabId, method: "Bridge.detached", params: { reason } });
});

async function resolve_tab_and_prepare(data) {
	const tab_id = await resolve_tab(data);
	if (data.activate) await activate_tab(tab_id); // Foreground it, so timers and requestAnimationFrame actually run
	return tab_id;
}
async function handle_bridge_command({ command, ...data }) {
	switch (command) {
		case "keepalive": return { keepalive: true };
		case "tabs": {
			const needle = data.match?.toLowerCase();
			const tabs = (await chrome.tabs.query({}))
			.filter(tab => !needle || (tab.url ?? "").toLowerCase().includes(needle) || (tab.title ?? "").toLowerCase().includes(needle))
			.map(tab => ({ id: tab.id, title: tab.title, url: tab.url, active: tab.active, windowId: tab.windowId, attached: attached_tabs.has(tab.id) }));
			return { tabs };
		}
		case "attach": {
			const tab_id = await resolve_tab_and_prepare(data);
			await ensure_attached(tab_id);
			return { tabId: tab_id, attached: true };
		}
		case "detach": {
			const tab_ids = data.all ? [...attached_tabs] : [await resolve_tab(data)];
			for (const tab_id of tab_ids) {
				await chrome.debugger.detach({ tabId: tab_id }).catch(() => {}); // Already gone is not an error here
				attached_tabs.delete(tab_id);
			}
			return { detached: tab_ids };
		}
		case "eval": {
			const tab_id = await resolve_tab_and_prepare(data);
			return { tabId: tab_id, ...await cdp_eval(tab_id, data.expression, data.awaitPromise !== false) };
		}
		case "html": {
			const tab_id = await resolve_tab_and_prepare(data);
			return { tabId: tab_id, ...await cdp_html(tab_id, data.selector, data.all === true, data.maxLength ?? 20000) };
		}
		case "cdp": {
			const tab_id = await resolve_tab_and_prepare(data);
			await ensure_attached(tab_id);
			return { tabId: tab_id, result: await chrome.debugger.sendCommand({ tabId: tab_id }, data.method, data.params ?? {}) };
		}
		default: throw new Error(`unknown bridge command "${command}"`);
	}
}
let bridge_connecting = null; // The promise of an attempt in flight, so a double trigger shares it

async function read_bridge_secret() {
	const resp = await fetch(chrome.runtime.getURL(CDP_BRIDGE_SECRET_FILE), { cache: "no-store" }).catch(() => null);
	const secret = resp?.ok ? (await resp.text()).trim() : "";
	if (!secret) throw new Error(`${CDP_BRIDGE_SECRET_FILE} is missing or empty in the extension's folder - chrome_bridge.py refuses the connection without it`);
	return secret;
}
async function open_bridge_socket() {
	const socket = new WebSocket(`${CDP_BRIDGE_URL}&secret=${encodeURIComponent(await read_bridge_secret())}`);
	bridge_socket = socket;
	socket.onmessage = async event => {
		let message;
		try {
			message = JSON.parse(event.data);
		} catch {
			return;
		}
		if (message.id === undefined) return void await handle_bridge_command(message).catch(() => {}); // Fire and forget, e.g. the keepalive

		try {
			bridge_send({ id: message.id, ok: true, ...await handle_bridge_command(message) });
		} catch (err) {
			bridge_send({ id: message.id, ok: false, error: err.message, stack: err.stack });
		}
	};
	await new Promise((resolve, reject) => {
		let opened = false;
		socket.onopen = () => {
			opened = true;
			resolve();
		};
		socket.onerror = () => {}; // onclose follows and does the reporting
		socket.onclose = () => {
			if (bridge_socket === socket) bridge_socket = null;
			if (opened) return void log("CDP bridge disconnected");
			// A refused secret is a 403 before the upgrade, which a WebSocket cannot tell apart from no server at all
			reject(new Error(`the bridge server at ${CDP_BRIDGE_URL} did not accept the connection - is chrome_bridge.py running? If it is, its tab says why it refused`));
		};
	});
	bridge_send({ type: "hello", userAgent: navigator.userAgent, via: "JS + CSS Injector extension" });
	log("CDP bridge connected to " + CDP_BRIDGE_URL);
	return "connected to " + CDP_BRIDGE_URL;
}
function connect_bridge() { // Resolves to a status string, rejects when there is no secret or the server does not accept the connection
	if (bridge_socket?.readyState === WebSocket.OPEN) return Promise.resolve("already connected to " + CDP_BRIDGE_URL);
	bridge_connecting ??= open_bridge_socket().finally(() => { bridge_connecting = null; });
	return bridge_connecting;
}
async function disconnect_bridge() { // Resolves to a status string. Detaches every tab too, so Claude is cut off and no debugging infobar is left
	const socket = bridge_socket;
	bridge_socket = null;
	socket?.close();
	for (const tab_id of attached_tabs) await chrome.debugger.detach({ tabId: tab_id }).catch(() => {});
	attached_tabs.clear();
	return "disconnected from " + CDP_BRIDGE_URL;
}
function toggle_bridge() { // The "Connect claude bridge" menu entry: a click while connected disconnects
	return bridge_socket?.readyState === WebSocket.OPEN ? disconnect_bridge() : connect_bridge();
}
