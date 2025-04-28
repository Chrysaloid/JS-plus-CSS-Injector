"use strict";

/* // Creating code snippets for VSC
const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
	const fnStr = func.toString().replace(STRIP_COMMENTS, "");
	let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
	if (result === null) result = [];
	return result;
}
const jsSnippets = {};
function addJsSnippet(proto, name, func, czyGet) {
	jsSnippets[name.replace("frycAPI_", "")] = {
		prefix: "fff",
		body: [ `${name}${czyGet ? "" : "(" + getParamNames(func).map((arg, i) => `\${${i + 1}:${arg}}`).join(", ") + ")"}` ],
		description: proto.name,
	};
}
*/
function frycAPI_expandPrototype(proto, name, func, czyGet = false, writable = false, active = true) {
	if (active) {
		try {
			Object.defineProperty(proto.prototype, name,
				czyGet ? {
					get: func, // getter cannot be writable so when @czyGet is true then @writable is ignored
				} : {
					value: func,
					writable: writable,
				}
			);
		} catch (error) {
			console.log(error);
			try {
				proto.prototype[name] = func;
			} catch (err) {}
		}
	}
	// addJsSnippet(proto, name, func, czyGet);
}
function frycAPI_host(...str) {
	if (str.length === 0) {
		return window.location.hostname;
	} else {
		return str.includes(window.location.hostname);
	}
}
function frycAPI_hostIncludes(...str) {
	return window.location.hostname.frycAPI_includesAny(...str);
}
// I can't believe I have to do this...
// Some sites (https://rapidsave.com/) overwrite chrome.runtime.sendMessage
// So I have to store it before they do that
const frycAPI_chrome_runtime_sendMessage = chrome.runtime.sendMessage;

//* Prototypy
frycAPI_expandPrototype(String, "frycAPI_equalAny", function (...strList) {
	return strList.includes(this);
});
frycAPI_expandPrototype(String, "frycAPI_includesAny", function (...strList) {
	for (const daElem of strList) {
		if (this.includes(daElem)) {
			return true;
		}
	}
	return false;
});
const frycAPI_Object_condition = !(frycAPI_host("www.youtube.com", "www.desmos.com", "studio.youtube.com") || frycAPI_hostIncludes("googlesource.com"));
frycAPI_expandPrototype(Object, "lóg", function () {
	console.log(this);
	return this;
}, true, true, frycAPI_Object_condition);
frycAPI_expandPrototype(Object, "frycAPI_if", function (condition) {
	return condition ? this : null;
}, false, true, frycAPI_Object_condition);
frycAPI_expandPrototype(Object, "frycAPI_toJSON", function () {
	return JSON.stringify(this);
}, true, true, frycAPI_Object_condition);
frycAPI_expandPrototype(Object, "frycAPI_then", function (callback) {
	return callback(this);
}, false, true, frycAPI_Object_condition);
frycAPI_expandPrototype(String, "JSON", function () {
	return JSON.parse(this);
}, true);
frycAPI_expandPrototype(String, "specialTrim", function () {
	return this.replaceAll(/^[\x00-\x20\x7F-\xA0]+|[\x00-\x20\x7F-\xA0]+$/g, "");
});
frycAPI_expandPrototype(Array, "frycAPI_shuffle", function () {
	// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	let currentIndex = this.length, randomIndex;
	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
	}
	return this;
});
frycAPI_expandPrototype(Array, "frycAPI_pushElem", function (elem) {
	this.push(elem);
	return elem;
});
frycAPI_expandPrototype(Array, "frycAPI_pushArr", function (elem) {
	this.push(elem);
	return this;
});
frycAPI_expandPrototype(Array, "frycAPI_numSort", function () {
	return this.sort((a, b) => a - b);
});
frycAPI_expandPrototype(Array, "frycAPI_sortValues", function (...getValues) {
	// getValues = getValues.filter(frycAPI.isFunc);
	// if (getValues.length === 0) return this;
	return this.sort((a, b) => {
		for (const getValue of getValues) {
			const a1 = getValue(a);
			const b1 = getValue(b);
			if (a1 < b1) return -1;
			if (a1 > b1) return 1;
		}
		return 0;
	});
});
frycAPI_expandPrototype(Array, "frycAPI_run", function (...args) {
	this.forEach(fun => fun(...args));
});
frycAPI_expandPrototype(Array, "frycAPI_runReturn", function (...args) {
	const retArr = [];
	this.forEach(fun => retArr.push(fun(...args)));
	return retArr;
});
frycAPI_expandPrototype(Element, "frycAPI_addClass", function (...classNames) {
	this.classList.add(...classNames);
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_removeClass", function (...classNames) {
	this.classList.remove(...classNames);
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_toggleClass", function (className, force) {
	this.classList.toggle(className, force);
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_setAttribute", function (attName, attValue) {
	this.setAttribute(attName, attValue);
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_setAttributeBulk", function (...args) {
	if (args.length % 2 !== 0) throw new Error("Arguments' length must be even.");
	const max = args.length / 2;
	let attName, attValue;
	for (let i = 0; i < max; i += 2) {
		attName = args[i];
		attValue = args[i + 1];
		this.setAttribute(attName, attValue);
	}
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_setObjKey", function (keyName, keyValue) {
	this[keyName] = keyValue;
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_setInnerHTML", function (newInnerHTML) {
	this.innerHTML = frycAPI.createHTML(newInnerHTML);
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_setInnerText", function (newInnerText) {
	this.innerText = newInnerText;
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_insertAdjacentElement", function (where, elem) {
	this.insertAdjacentElement(where, elem);
	return this;
});
frycAPI_expandPrototype(EventTarget, "frycAPI_addEventListener", function (listenerType, callBack) {
	this.addEventListener(listenerType, callBack);
	return this;
});
frycAPI_expandPrototype(Element, "frycAPI_shuffleChildren", function () {
	const me = this;
	Array.from(me.children).frycAPI_shuffle().forEach(function (daElem) {
		me.appendChild(daElem);
	});
	return me;
});
frycAPI_expandPrototype(Element, "frycAPI_sortChildren", function (getValue) {
	const me = this;
	const elemArr = Array.from(me.children);
	elemArr.frycAPI_sortValues(getValue);
	elemArr.forEach(function (daElem) {
		me.appendChild(daElem);
	});
});
frycAPI_expandPrototype(Element, "frycAPI_getFirstTextNode", function () {
	return [...this.childNodes].find(child => child.nodeType === Node.TEXT_NODE);
});
frycAPI_expandPrototype(Element, "frycAPI_getFirstTextNodeContent", function () {
	const text = this.frycAPI_getFirstTextNode();
	return text && text.textContent.trim();
});
frycAPI_expandPrototype(Element, "frycAPI_removeChildren", function () {
	while (this.firstChild) this.removeChild(this.lastChild);
});
frycAPI_expandPrototype(Element, "frycAPI_appendHTML", function (htmlString) { // tylko jeżeli root zawiera pojedynczy element
	return this.appendChild(frycAPI.elemFromHTML(htmlString));
});
frycAPI_expandPrototype(Element, "frycAPI_insertHTML", function (position, htmlString) { // tylko jeżeli root zawiera pojedynczy element
	return this.insertAdjacentElement(position, frycAPI.elemFromHTML(htmlString));
});
frycAPI_expandPrototype(DOMTokenList, "notContains", function (daClass) {
	return !this.contains(daClass);
});
frycAPI_expandPrototype(Element, "frycAPI_querySelNull", function (selector) {
	return this.querySelector(selector) === null;
});
frycAPI_expandPrototype(Element, "frycAPI_querySelOk", function (selector) {
	return this.querySelector(selector) !== null;
});
frycAPI_expandPrototype(Element, "frycAPI_querySelList", function (list, root = document) {
	if (this instanceof Element) root = this;
	let elem;
	for (const query of list) {
		elem = root.querySelector(query);
		if (elem !== null) return elem;
	}
	return null;
});
frycAPI_expandPrototype(Node, "frycAPI_isText", function () {
	return this.nodeType === Node.TEXT_NODE;
}, true);
frycAPI_expandPrototype(Node, "frycAPI_insertAfter", function (newNode) {
	if (frycAPI.isString(newNode)) {
		newNode = frycAPI.elemFromHTML(newNode);
	}
	if (this.nextSibling !== null) {
		this.parentNode.insertBefore(newNode, this.nextSibling);
	} else {
		this.parentNode.appendChild(newNode);
	}
	return newNode;
});
frycAPI_expandPrototype(String, "frycAPI_toTitleCase", function () {
	return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
});
frycAPI_expandPrototype(Element, "frycAPI_hasClass", function (klasa) {
	return this.classList.contains(klasa);
});
frycAPI_expandPrototype(Element, "frycAPI_hasNotClass", function (klasa) {
	return !this.classList.contains(klasa);
});
frycAPI_expandPrototype(Element, "frycAPI_childIndex", function () {
	let me = this, i = 0;
	while ((me = me.previousElementSibling) !== null) i++;
	return i;
}, true);
frycAPI_expandPrototype(Element, "frycAPI_elemByClass", function (klasa) {
	return this.getElementsByClassName(klasa)[0];
});
frycAPI_expandPrototype(Element, "frycAPI_elemByTag", function (tag) {
	return this.getElementsByTagName(tag)[0];
});
frycAPI_expandPrototype(Element, "frycAPI_hasScroll", function () {
	return this.scrollHeight > this.clientHeight;
}, true);
frycAPI_expandPrototype(Element, "prevEl", function () {
	return this.previousElementSibling;
}, true);
frycAPI_expandPrototype(Element, "nextEl", function () {
	return this.nextElementSibling;
}, true);
frycAPI_expandPrototype(Element, "firstEl", function () {
	return this.firstElementChild;
}, true);
frycAPI_expandPrototype(Element, "lastEl", function () {
	return this.lastElementChild;
}, true);
frycAPI_expandPrototype(Element, "notMatches", function (selectors) {
	return !this.matches(selectors);
});
frycAPI_expandPrototype(Element, "nthParent", function (n = 1) {
	let temp = this.parentElement;
	for (let i = 2; i <= n && temp?.parentElement; i++) {
		temp = temp.parentElement;
	}
	return temp;
});
frycAPI_expandPrototype(EventTarget, "frycAPI_addEventListenerFun", function (listenerType, callBack) {
	this.addEventListener(listenerType, callBack);
	return callBack;
});
frycAPI_expandPrototype(String, "frycAPI_eval", function () {
	return eval(this);
});
frycAPI_expandPrototype(Number, "frycAPI_add", function (num) {
	return this + num;
});
frycAPI_expandPrototype(Number, "frycAPI_sub", function (num) {
	return this - num;
});
frycAPI_expandPrototype(Number, "frycAPI_mult", function (num) {
	return this * num;
});
frycAPI_expandPrototype(Number, "frycAPI_div", function (num) {
	return this / num;
});
frycAPI_expandPrototype(Number, "frycAPI_pow", function (num) {
	return this ** num;
});
frycAPI_expandPrototype(Number, "frycAPI_minus", function () {
	return -this;
});
frycAPI_expandPrototype(Number, "frycAPI_gt", function (num) {
	return this > num;
});
frycAPI_expandPrototype(Number, "frycAPI_ge", function (num) {
	return this >= num;
});
frycAPI_expandPrototype(Number, "frycAPI_lt", function (num) {
	return this < num;
});
frycAPI_expandPrototype(Number, "frycAPI_le", function (num) {
	return this <= num;
});

[
	"at",
	"every",
	"filter",
	"find",
	"findIndex",
	"findLast",
	"findLastIndex",
	// "forEach",
	"map",
	"reduce",
	"reduceRight",
	"slice",
	"some",
	"toReversed",
	"toSorted",
	"toSpliced",
	"with",
].forEach(str => {
	frycAPI_expandPrototype(NodeList, str, Array.prototype[str]);
	frycAPI_expandPrototype(HTMLCollection, str, Array.prototype[str]);
});
frycAPI_expandPrototype(HTMLCollection, "forEach", Array.prototype.forEach);
[
	"every",
	"filter",
	"forEach",
	"map",
	"reduce",
	"reduceRight",
	"some",
	"toReversed",
	"toSorted",
	"toSpliced",
	"with",
].forEach(str => {
	frycAPI_expandPrototype(String, str, Array.prototype[str]);
});

/* This might not be usefull
[
	"pop",
	"push",
	"reverse",
	"shift",
	"sort",
	"splice",
	"unshift",
].forEach(str => {
	const fun = function (...params) {
		return Array.prototype[str].call(Array.from(this), params);
	};
	frycAPI_expandPrototype(NodeList, str, fun);
	frycAPI_expandPrototype(HTMLCollection, str, fun);
});
*/

// frycAPI_expandPrototype(Template, "frycAPI_name", function () {
// });

// window.addEventListener("load", () => frycAPI.downloadTxt(JSON.stringify(jsSnippets), "expandPrototypeSnippets.json"));
