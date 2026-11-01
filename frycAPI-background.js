/* eslint-disable no-extra-semi */
"use strict";

const log = console.log;
Object.defineProperty(Object.prototype, "log", {
	get() {
		log(this);
		return this;
	},
});

importScripts("frycAPI-cdp-bridge.js"); //* After `log` is defined, since the bridge uses it

const RULE_ID_BASE = 1000;

// #region Unused chrome.storage.session wrapper
/* // This someday might be useful...
const varDefaults = { // Global persistent variables. Can't be null or undefined
	injectedStyles: {},
	test: 0,
};

let readWrite = null;
const varCache = {};
async function getVar(name) {
	if (readWrite) await readWrite;
	if (varCache.hasOwnProperty(name)) return varCache[name];
	readWrite = chrome.storage.session.get(name);
	const temp = varCache[name] = (await readWrite)[name] ?? varDefaults[name];
	readWrite = null;
	return temp;
}
async function setVar(name, value) {
	if (readWrite) await readWrite;
	varCache[name] = value;
	readWrite = chrome.storage.session.set({ [name]: value });
	await readWrite;
	readWrite = null;
}
async function getSetVar(name, callback) { // callback will get value and should return new value
	if (readWrite) await readWrite;
	let newVal;
	if (varCache.hasOwnProperty(name)) {
		newVal = varCache[name] = callback(varCache[name]);
	} else {
		readWrite = chrome.storage.session.get(name);
		newVal = varCache[name] = callback((await readWrite)[name] ?? varDefaults[name]);
	}
	readWrite = chrome.storage.session.set({ [name]: newVal });
	await readWrite;
	readWrite = null;
	return newVal;
}
*/

/* // Left as a example usage of getSetVar
function defineStyle(data, sender) {
	const CSSInjection = {
		css: data.style,
		target: { tabId: sender.tab.id },
	};
	getSetVar("injectedStyles", injectedStyles => {
		injectedStyles[data.id] = CSSInjection;
		return injectedStyles;
	});
	return CSSInjection;
}
*/

/* // Left as a example usage of getVar
case "injectStyleAgain": return chrome.scripting.insertCSS((await getVar("injectedStyles"))[data.id]); // happens second
case "removeStyle": return chrome.scripting.removeCSS((await getVar("injectedStyles"))[data.id]);      // happens second
*/
// #endregion

function css_injection(data = {}, sender) {
	return {
		css: data.style,
		target: { tabId: sender.tab.id, allFrames: data.allFrames },
	};
}
function blob_to_base64(blob) {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return new Promise(resolve => {
		reader.onloadend = () => {
			resolve(reader.result);
		};
	});
}
//* Public addresses only, for fetches made on behalf of a web page
// Every website can message this worker (externally_connectable <all_urls>, and frycAPI.id is a
// page global), and a fetch from here ignores CORS and Local Network Access and carries cookies.
// Unchecked, getImgAsDataUrl let any site read http://127.0.0.1/ - mc-http-server, all of G:\ -
// or the router, or the user's logged-in mail. A host NAME that resolves to a private address
// cannot be caught here; mc-http-server refuses foreign Host headers for that reason.
function is_local_ipv4([a, b]) {
	return a === 0 || a === 10 || a === 127 || a >= 224 ||
		a === 25 ||                                // Hamachi
		(a === 100 && b >= 64 && b <= 127) ||      // CGNAT
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && (b === 168 || b === 0)) ||
		(a === 198 && (b === 18 || b === 19));
}
function is_local_host(hostname) {
	const host = hostname.toLowerCase().replace(/\.$/, "");
	if (host.startsWith("[")) { // URL serializes every IPv6 literal fully compressed, IPv4-mapped ones in hex
		const first = parseInt(host.slice(1).split(":")[0] || "0", 16);
		return !(first >= 0x2000 && first <= 0x3fff) || first === 0x2002; // only global unicast, minus 6to4
	}
	const v4 = (/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/).exec(host); // URL has already turned 127.1, 0x7f.1, 2130706433 into this
	if (v4) return is_local_ipv4(v4.slice(1).map(Number));
	return !host.includes(".") || (/(^|\.)(localhost|local|lan|home|internal|intranet|corp|home\.arpa)$/).test(host);
}
function assert_public_url(url) {
	if (!["http:", "https:"].includes(url.protocol) || is_local_host(url.hostname)) {
		throw new Error(`Refused to fetch a non-public address: ${url.href}`);
	}
}
async function fetch_public_for_page(url_str, sender) {
	const url = new URL(url_str);
	assert_public_url(url);
	// Cookies only for the page's own origin, which the page could fetch with them anyway
	const res = await fetch(url, { credentials: url.origin === sender.origin ? "include" : "omit" });
	assert_public_url(new URL(res.url)); // a public address may redirect into the LAN; the request went, the bytes stay here
	return res;
}
//* frycAPI_Cache: folders on G:\, read through mc-http-server, each only from the sites listed for it
// The page names a cache and a file; the folder never comes from the page, so a page script, which shares
// frycAPI's world, reaches nothing frycAPI does not. `folder` is the path under G:\ in base64 - kept out of
// plain sight in the public repo, nothing more. Ctrl+Alt+Shift+F4 in the popup turns copied folder paths into
// entries. This replaced a second extension loaded from G:\ with web_accessible_resources "*" for <all_urls>,
// which let every website read the whole drive and made Chrome start slowly.
const CACHE_SERVER = "http://127.0.0.1/";
// As big as a message allows, so nearly every file is one message and one mc-http-server request: a message holds at
// most 64 MiB of JSON, and base64 makes 45 MiB into 60 MiB
const CACHE_CHUNK_BYTES = 45 * 1024 * 1024;
const CACHES = {
	arts         : { sites: ["github.com", "gist.github.com"], folder: "QmlibGlvdGVraSBXaW5kb3dzL09icmF6eS9EaXNjb3JkIEFSVHMv" },
	mechabellum  : { sites: ["wiki.mbxmas.com"], folder: "QmlibGlvdGVraSBXaW5kb3dzL09icmF6eS9JY29ucy9NZWNoYWJlbGx1bS8=" },
	forge_precons: { sites: ["archidekt.com"], folder: "TWFnaWMgdGhlIEdhdGhlcmluZy9Gb3JnZS9yZXMvcXVlc3QvcHJlY29ucy8=" },
};
for (const cache of Object.values(CACHES)) {
	cache.path = new TextDecoder().decode(Uint8Array.fromBase64(cache.folder)); // "Biblioteki Windows/Obrazy/.../", always ending in "/"
}
function cache_file_url({ cache: name, file }, sender) {
	const cache = Object.hasOwn(CACHES, name) ? CACHES[name] : null;
	if (!cache) throw new Error(`There is no cache named "${name}"`);
	const host = sender.origin ? new URL(sender.origin).hostname : null;
	if (!cache.sites.includes(host)) throw new Error(`Cache "${name}" is not readable from ${host}`);
	if (typeof file !== "string" || !file || file === "." || file === ".." || file.length > 255 || (/[\\/:*?"<>|\x00-\x1f]/).test(file)) {
		throw new Error(`Not a plain file name: ${JSON.stringify(file)}`);
	}
	return CACHE_SERVER + cache.path.split("/").map(encodeURIComponent).join("/") + encodeURIComponent(file);
}
function cache_folder(name) {
	return "G:/" + CACHES[name].path;
}
async function cache_find(queries, sender) { // [{ cache, file }, ...] -> the index of the first that exists (-1 if none) and every queried cache's folder
	const urls = queries.map(query => cache_file_url(query, sender)); // all checked before anything is fetched
	const responses = await Promise.all(urls.map(url => fetch(url, { method: "HEAD", credentials: "omit" }).catch(() => undefined)));
	if (responses.length && responses.every(res => res === undefined)) throw new Error(`mc-http-server is not answering at ${CACHE_SERVER}`);
	const index = responses.findIndex(res => res?.ok);
	return {
		index,
		folders: Object.fromEntries(queries.map(({ cache }) => [cache, cache_folder(cache)])),
		size: index === -1 ? null : Number(responses[index].headers.get("Content-Length")),
		type: index === -1 ? null : responses[index].headers.get("Content-Type"),
	};
}
async function read_chunk(url, start) { // One chunk of a file on mc-http-server from `start` on, base64, plus the whole file's size
	const res = await fetch(url, {
		credentials: "omit",
		// Chrome's cache would add If-Range with mc-http-server's weak ETag to every chunk after the first, and a
		// weak ETag can never satisfy If-Range - so each such chunk came back as the whole file
		cache: "no-store",
		headers: { Range: `bytes=${start}-${start + CACHE_CHUNK_BYTES - 1}` },
	});
	const type = res.headers.get("Content-Type") ?? "";
	if (res.status === 416) { // start is at or past the end: an empty file, or a file that shrank between chunks
		return { data: "", size: Number(res.headers.get("Content-Range")?.split("/")[1] ?? 0), type };
	}
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${decodeURIComponent(url)}`);
	let bytes = new Uint8Array(await res.arrayBuffer());
	let size;
	if (res.status === 206) {
		size = Number(res.headers.get("Content-Range").split("/")[1]);
	} else { // the server sent the whole file regardless
		size = bytes.length;
		bytes = bytes.subarray(start, start + CACHE_CHUNK_BYTES);
	}
	return { data: bytes.toBase64(), size, type };
}
function cache_read({ cache, file, start = 0 }, sender) {
	return read_chunk(cache_file_url({ cache, file }, sender), start);
}

//* e621 and e926: their downloaded posts, found by MD5 anywhere on G:\ through Everything
// Everything's HTTP server (voidtools; localhost:9191, no login, file download off, its own log off) answers
// "where is this post's file" in one query, where frycAPI_Cache took 308 HEAD requests per post page - one per
// suffix x folder x extension - each a line in mc-http-server's logs. The file itself the page loads from a
// one-time mc-http-server URL (e621Grant): measured 2026-11-01, a 27 MB PNG was ready in ~150 ms against ~650 ms
// as base64 chunks through messages, and a 54 MB video showed its first frame in 26 ms against ~1.1 s. The page
// sends only the MD5, so it can name no file of its own choosing; it gets back the path of the post's copy.
//
// What counts as a post's copy, best first - checked against every name on G:\ holding 32 hex digits, 2026-11-01:
//   1. "<md5><suffix>.<ext>", by E621_SUFFIXES, then E621_EXTENSIONS; a copy under a folder named Edit after all
//      others - those hold my edits under the original name.
//   2. Only for showing it, and only when there is no 1: "<number> <md5>.<ext>", the readchan app's
//      "<post time in µs> <original name>", whose original name was often the post's MD5. They are other versions of
//      the picture - both with a post-named twin differed in size - so the download button ignores them.
// A bare MD5 anywhere in a name would also find my edits ("<md5> edit.png", "<md5>-cut.png") and ~49 000 caches.
const EVERYTHING_SERVER = "http://127.0.0.1:9191/";
const E621_SITES = ["e621.net", "e926.net"];
const E621_SUFFIXES = ["", " Just Interesting", " Alternate", " doc1"];              // in order of preference
const E621_EXTENSIONS = ["png", "jpg", "webm", "mp4", "jpeg", "gif", "webp"];         // likewise, after the suffix
function e621_file_regex(md5) { // groups: timestamp prefix, md5, suffix, extension
	return `^([0-9]+ )?(${md5})(${E621_SUFFIXES.join("|")})\\.(${E621_EXTENSIONS.join("|")})$`;
}
function assert_e621_sender(sender) {
	const host = sender.origin ? new URL(sender.origin).hostname : null;
	if (!E621_SITES.includes(host)) throw new Error(`Downloaded e621 posts are not readable from ${host}`);
}
async function e621_find(md5, sender, last_resort = false) { // -> { path: "G:/.../<md5>.png", folder: "G:/.../", size } of the best copy, or null
	assert_e621_sender(sender);
	if (typeof md5 !== "string" || !(/^[0-9a-f]{32}$/).test(md5)) throw new Error(`Not an MD5: ${JSON.stringify(md5)}`);
	const query = new URLSearchParams({
		search: `G:\\ regex:"${e621_file_regex(md5)}"`,
		json: 1,
		path_column: 1,
		size_column: 1,
		count: 100,
	});
	const res = await fetch(EVERYTHING_SERVER + "?" + query, { credentials: "omit" }).catch(() => {
		throw new Error(`Everything's HTTP server is not answering at ${EVERYTHING_SERVER}`);
	});
	const file = new RegExp(e621_file_regex(md5));
	const candidates = (await res.json()).results
	.filter(item => item.type === "file" && item.path.startsWith("G:\\") && file.test(item.name))
	.map(item => {
		const [, timestamp, , suffix, ext] = file.exec(item.name);
		const in_edit = item.path.toLowerCase().split("\\").includes("edit");
		return { item, rank: [timestamp ? 1 : 0, in_edit ? 1 : 0, E621_SUFFIXES.indexOf(suffix), E621_EXTENSIONS.indexOf(ext)] };
	})
	.filter(({ rank }) => last_resort || rank[0] === 0);
	const by_rank = (a, b) => a.rank.reduce((diff, value, i) => diff || value - b.rank[i], 0) || a.item.path.localeCompare(b.item.path);
	const best = candidates.sort(by_rank)[0]?.item;
	if (!best) return null;
	const folder = best.path.replaceAll("\\", "/") + "/";
	return { path: folder + best.name, folder, size: Number(best.size) };
}
async function e621_grant(md5, sender) { // -> e621_find's answer plus `url`, a one-time http://127.0.0.1/api/granted/... URL the page loads directly, so a video streams and seeks; or null
	const hit = await e621_find(md5, sender, true);
	if (!hit) return null;
	const res = await fetch(CACHE_SERVER + "api/grant", {
		method: "POST",
		credentials: "omit",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ path: hit.path }),
	});
	if (!res.ok) throw new Error(`mc-http-server refused a grant for ${hit.path}: ${res.status} ${(await res.text()).trim()}`);
	return { ...hit, url: new URL((await res.json()).url, CACHE_SERVER).href };
}
function on_tab_closed(tab_id, callback) {
	const listener = closed_tab_id => {
		if (closed_tab_id !== tab_id) return;
		chrome.tabs.onRemoved.removeListener(listener);
		callback();
	};

	chrome.tabs.onRemoved.addListener(listener);
}
async function run_on_page(tab_id, da_func, args = []) {
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: { tabId: tab_id },
		func: da_func,
		args: args,
	});
	return result;
} // const out = await run_on_page(sender.tab.id, () => {});

let spotify_authorization_resolve, spotify_authorization_reject;
const spotify_authorization = new Promise((resolve, reject) => {
	spotify_authorization_resolve = resolve;
	spotify_authorization_reject = reject;
});
function catch_spotify_request(details) {
	if (details.method !== "GET") return;

	const authorization = details.requestHeaders?.find(
		header => header.name.toLowerCase() === "authorization"
	)?.value;

	if (!authorization) return;

	chrome.webRequest.onBeforeSendHeaders.removeListener(catch_spotify_request);
	spotify_authorization_resolve(authorization);
}

chrome.runtime.onMessageExternal.addListener(function ({ name, data }, sender, send_resp) { //* Main background logic
	// log(name);
	// log(data);

	(async () => { switch (name) { // eslint-disable-line brace-style
		case "closeTab": return void chrome.tabs.remove(sender.tab.id);
		case "downloadPDF": {
			chrome.downloads.download({ url: data.url }).then(download_id => {
				// log(downloadId);
				if (data.czy_zamknąć) {
					chrome.tabs.remove(sender.tab.id);
				} else {
					chrome.tabs.goBack(sender.tab.id);
				}
			});
			return;
		};
		case "unblockImagesOnThisTab": return chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [RULE_ID_BASE + sender.tab.id] });
		case "downloadURL": return void chrome.downloads.download(data);
		case "downloadNotify": return new Promise(resolve => { // resolves with the full path of the downloaded file
			let the_id;
			function on_changed({ id, state }) {
				if (id === the_id && state && state.current !== "in_progress") { // state.current === "interrupted" || state.current === "complete"
					chrome.downloads.onChanged.removeListener(on_changed);
					chrome.downloads.search({ id }).then(([item]) => resolve(item?.filename));
				}
			}
			chrome.downloads.onChanged.addListener(on_changed);
			chrome.downloads.download(data).then(id => { the_id = id });
		});
		case "getImgAsDataUrl": return fetch_public_for_page(data, sender).then(res => res.blob()).then(blob_to_base64); // blob_to_base64 already returns the whole data: URL
		case "cacheFind": return cache_find(data, sender);
		case "cacheRead": return cache_read(data, sender);
		case "e621Find": return e621_find(data, sender);
		case "e621Grant": return e621_grant(data, sender);
		case "injectStyle": return sender.tab ? Promise.all([chrome.scripting.removeCSS(css_injection(data, sender)), chrome.scripting.insertCSS(css_injection(data, sender))]) : 0; // deduplicating injections
		case "removeStyle": return sender.tab ? chrome.scripting.removeCSS(css_injection(data, sender)) : 0;
		case "setStorage": return chrome.storage.sync.get(data.UUID).then(result => {
			const obj = result[data.UUID];
			if (obj) {
				let obj_changed = false;
				for (const [key, value] of Object.entries(data.obj)) {
					// hasOwnProperty is necessary to catch possibility of defining a new key with value undefined
					if (obj[key] !== value || !obj.hasOwnProperty(key)) obj_changed = true;
					obj[key] = value;
				}
				if (obj_changed) chrome.storage.sync.set({ [data.UUID]: obj });
			} else {
				chrome.storage.sync.set({ [data.UUID]: data.obj });
			}
		});
		case "getStorage": return chrome.storage.sync.get(data.UUID).then(result => {
			const obj = result[data.UUID];
			if (obj) {
				const new_obj = {};
				for (const key of data.keys) {
					new_obj[key] = obj[key];
				}
				return new_obj;
			} else {
				return {};
			}
		});
		case "removeStorage": return chrome.storage.sync.remove(data);
		case "storageUsed": return chrome.storage.sync.getBytesInUse(null);
		case "storageUsedPerc": return chrome.storage.sync.getBytesInUse(null).then(bytes_in_use => {
			return (bytes_in_use / chrome.storage.sync.QUOTA_BYTES * 100).toFixed(3) + " %";
		});
		case "catchSpotifyRequest": {
			chrome.webRequest.onBeforeSendHeaders.addListener(catch_spotify_request, { urls: ["https://api.spotify.com/*"], tabId: sender.tab.id }, ["requestHeaders"]);
			on_tab_closed(sender.tab.id, () => {
				chrome.webRequest.onBeforeSendHeaders.removeListener(catch_spotify_request);
				spotify_authorization_reject();
			});
			return;
		};
		case "getSpotifyAuthorization": return spotify_authorization;
		case "connectCdpBridge": return connect_bridge();
		case "toggleCdpBridge": return toggle_bridge();
		case "test": {
			log(data);
			return data;
		};
		default: throw new Error(`There is no event with name "${name}". Received data: ${data}`);
	}})().then(data_out => { // eslint-disable-line brace-style
		send_resp({ error: false, data: data_out });
	}).catch(err => {
		send_resp({ error: true, err_obj: { message: err.message, stack: err.stack } });
	});
	return true; // Necessary if we want to send a response using send_resp
});

// #region //* PDF handling
function find_header(headers, header_str) {
	return headers.find(header => header.name.toLowerCase() === header_str);
}
chrome.webRequest.onHeadersReceived.addListener(details => {
	// This method breaks when server marks quickly repeated requests as a bot behavior
	if (details.type !== "main_frame") return; // only intercept PDFs that will be view as an entire page
	if (!find_header(details.responseHeaders, "content-type")?.value.toLowerCase().includes("application/pdf")) return; // request is not for PDF
	if (find_header(details.responseHeaders, "content-disposition")?.value.toLowerCase().includes("attachment")) return; // requested PDF will be downloaded so don't download it again
	// log(details);
	chrome.downloads.download({ url: details.url, conflictAction: "overwrite" });
	chrome.tabs.onUpdated.addListener(function tabs_on_updated(tab_id, change_info, tab) { // addlistener to close the tab or go back
		// log(changeInfo);
		if (change_info.status === "loading") {
			chrome.tabs.goBack(tab_id).then(null, () => { // if going back is not possible the promise gets rejected and that means that the PDF was opened in new tab so close the tab
				chrome.tabs.remove(tab_id);
			});
			chrome.tabs.onUpdated.removeListener(tabs_on_updated);
		}
	});
}, { urls: ["<all_urls>"] }, ["responseHeaders"]);
// #endregion

// #region //* e621/e926 post pages: no download from static1 for a post that is already on G:\
// The page's HTML points <img>/<video> at static1 before frycAPI can know there is a local copy, so a tab opening
// a post blocks static1's full-size files from the start - originals and samples (/data/[sample/]xx/yy/<md5>...),
// not the /data/preview/ or /data/crop/ thumbnails of other posts ("p" and "r" are no hex digits) - and frycAPI
// lifts the block (unblockImagesOnThisTab) as soon as Everything says there is no local copy, or anything on the
// way fails. Any other e621 page in the tab lifts it too. No [0-9a-f]{32} for the MD5 and case-sensitive: with
// both, Chrome skipped the rule as over the 2 KB a compiled DNR regex may take.
const E621_POST_PAGE = /^\/posts\/\d+\/?$/;
const E621_FULL_SIZE = "^https://static1\\.e(621|926)\\.net/data/(sample/)?[0-9a-f][0-9a-f]/[0-9a-f][0-9a-f]/";
chrome.webNavigation.onBeforeNavigate.addListener(({ tabId, frameId, url }) => {
	if (frameId !== 0) return;
	const rule_id = RULE_ID_BASE + tabId;
	chrome.declarativeNetRequest.updateSessionRules({
		removeRuleIds: [rule_id],
		addRules: E621_POST_PAGE.test(new URL(url).pathname) ? [{
			id: rule_id,
			priority: 1,
			condition: { regexFilter: E621_FULL_SIZE, isUrlFilterCaseSensitive: true, resourceTypes: ["image", "media"], tabIds: [tabId] },
			action: { type: "block" },
		}] : [],
	}).catch(err => console.error("Blocking static1 for an e621 post page failed:", err)); // Chrome skips an invalid rule silently otherwise
}, { url: E621_SITES.map(site => ({ hostSuffix: site })) });
chrome.tabs.onRemoved.addListener(tab_id => chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [RULE_ID_BASE + tab_id] }));
// #endregion

/* // For the future if we needed to add repetative declarativeNetRequest rules. It has to be done iside onInstalled
chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeNetRequest.getDynamicRules().then(oldRules => {
		chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: oldRules.map(rule => rule.id),
			addRules: [
				"value",
			].map((value, index) => ({
				id: index + 1,
				priority: 1,
				condition: {},
				action: {},
			})),
		});
	});
});
*/

/* // Force all downloads to overwrite any existing files instead of inserting ' (1)', ' (2)', etc. | Does not work and is dangerous
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
	if	(item.byExtensionId) {
		log(item.byExtensionId);
		suggest(); // does not work, conflictAction from download is ignored
	} else {
		log("Empty");
		suggest({ filename: item.filename, conflictAction: "overwrite" });
	}
});
*/

// #region Unused
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

/* getActiveTarget
async function getActiveTarget() {
	return { tabId: (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id };
} // const tabID = await getActiveTarget();
*/
// #endregion
