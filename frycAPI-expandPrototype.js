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
const frycAPI_no_setter = v => { throw new Error("This is a read-only property") };
function frycAPI_expand_prototype(proto, name, func, czy_get = false, writable = false, configurable = false, active = true) {
	if (active) {
		try {
			Object.defineProperty(proto.prototype, name,
				czy_get ? {
					get: func, // getter cannot be writable so when @czy_get is true then @writable is ignored
					set: frycAPI_no_setter,
					configurable: configurable,
				} : {
					value: func,
					writable: writable,
					configurable: configurable,
				}
			);
		} catch (error) {
			console.log(error);
			try {
				proto.prototype[name] = func;
			} catch (err) {}
		}
	}
	// addJsSnippet(proto, name, func, czy_get);
}
function frycAPI_host(...str) {
	if (str.length === 0) {
		return window.location.hostname;
	} else {
		return str.includes(window.location.hostname);
	}
}
function frycAPI_host_includes(...str) {
	return window.location.hostname.frycAPI_includes_any(...str);
}
function frycAPI_inner_text_compare(a, b) {
	const a1 = a.innerText;
	const b1 = b.innerText;
	if (a1 < b1) return -1;
	if (a1 > b1) return 1;
	return 0;
}
// I can't believe I have to do this...
// Some sites (https://rapidsave.com/) overwrite chrome.runtime.sendMessage
// So I have to store it before they do that
const frycAPI_chrome_runtime_send_message = chrome.runtime.sendMessage;

//* Prototypy
// #region Example of defining intellisense for expanded prototype
// /** @typedef {Array & { greet: () => void }} MyArray */
// Array.prototype.greet = function () {};
// /** @type {MyArray} */
// const ar = [];
// ar.greet();
// #endregion
frycAPI_expand_prototype(String, "frycAPI_equal_any", function (...str_list) {
	return str_list.includes(this);
});
frycAPI_expand_prototype(String, "frycAPI_includes_any", function (...str_list) {
	for (const da_elem of str_list) {
		if (this.includes(da_elem)) {
			return true;
		}
	}
	return false;
});

const frycAPI_object_condition = !(frycAPI_host("www.youtube.com", "www.desmos.com", "studio.youtube.com") || frycAPI_host_includes("googlesource.com"));
frycAPI_expand_prototype(Object, "lóg", function () {
	console.log(this);
	return this;
}, true, true, true, frycAPI_object_condition);
frycAPI_expand_prototype(Object, "frycAPI_if", function (condition) {
	return condition ? this : null;
}, false, true, true, frycAPI_object_condition);
frycAPI_expand_prototype(Object, "jsón", function () {
	return JSON.stringify(this);
}, true, true, true, frycAPI_object_condition);
frycAPI_expand_prototype(Object, "frycAPI_then", function (callback) {
	return callback(this);
}, false, true, true, frycAPI_object_condition);

frycAPI_expand_prototype(String, "jsón", function () {
	return JSON.parse(this);
}, true);
frycAPI_expand_prototype(String, "special_trim", function () {
	return this.replaceAll(/^[\x00-\x20\x7F-\xA0]+|[\x00-\x20\x7F-\xA0]+$/g, "");
});
frycAPI_expand_prototype(String, "frycAPI_to_title_case", function () {
	return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
});
frycAPI_expand_prototype(String, "frycAPI_eval", function () {
	return eval(this);
});
frycAPI_expand_prototype(String, "extract_after", function (sub_str = "\x00") {
	const idx = this.indexOf(sub_str);
	return idx >= 0 ? this.slice(idx + sub_str.length) : "";
});

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
	frycAPI_expand_prototype(String, str, Array.prototype[str]);
});

frycAPI_expand_prototype(Array, "frycAPI_shuffle", function () {
	// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	let current_index = this.length, random_index;
	while (current_index > 0) {
		random_index = Math.floor(Math.random() * current_index);
		current_index--;
		[this[current_index], this[random_index]] = [this[random_index], this[current_index]];
	}
	return this;
});
frycAPI_expand_prototype(Array, "frycAPI_push_elem", function (elem) {
	this.push(elem);
	return elem;
});
frycAPI_expand_prototype(Array, "frycAPI_push_arr", function (elem) {
	this.push(elem);
	return this;
});
frycAPI_expand_prototype(Array, "frycAPI_num_sort", function () {
	return this.sort((a, b) => a - b);
});
frycAPI_expand_prototype(Array, "frycAPI_num_sort_reverse", function () {
	return this.sort((a, b) => b - a);
});
frycAPI_expand_prototype(Array, "frycAPI_sort_values_simple", function (get_value) {
	return get_value ? this.sort(function (a, b) {
		const a1 = get_value(a);
		const b1 = get_value(b);
		if (a1 < b1) return -1;
		if (a1 > b1) return 1;
		return 0;
	}) : this.sort(function (a, b) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	});
});
frycAPI_expand_prototype(Array, "frycAPI_sort_values_simple_reverse", function (get_value = a => a) {
	return this.sort((a, b) => {
		const a1 = get_value(a);
		const b1 = get_value(b);
		if (a1 < b1) return 1;
		if (a1 > b1) return -1;
		return 0;
	});
});
frycAPI_expand_prototype(Array, "frycAPI_sort_values", function (...get_values) {
	return this.sort((a, b) => {
		for (const get_value of get_values) {
			const a1 = get_value(a);
			const b1 = get_value(b);
			if (a1 < b1) return -1;
			if (a1 > b1) return 1;
		}
		return 0;
	});
});
frycAPI_expand_prototype(Array, "frycAPI_sort_values_reversible", function (get_values_and_orders) {
	return this.sort((a, b) => {
		for (const [get_value, reverse] of get_values_and_orders) {
			const a1 = get_value(a);
			const b1 = get_value(b);
			if (a1 < b1) return reverse ?  1 : -1;
			if (a1 > b1) return reverse ? -1 :  1;
		}
		return 0;
	});
});
frycAPI_expand_prototype(Array, "frycAPI_run", function (...args) {
	this.forEach(fun => fun(...args));
});
frycAPI_expand_prototype(Array, "frycAPI_run_return", function (...args) {
	return this.map(fun => fun(...args));
});
frycAPI_expand_prototype(Array, "min", function (getter = a => a) {
	const len = this.length;
	if (!len) return null;
	let val = getter(this[0]);
	for (let i = 1; i < len; i++) {
		const new_val = getter(this[i]);
		if (val > new_val) {
			val = new_val;
		}
	}
	return val;
});
frycAPI_expand_prototype(Array, "max", function (getter = a => a) {
	const len = this.length;
	if (!len) return null;
	let val = getter(this[0]);
	for (let i = 1; i < len; i++) {
		const new_val = getter(this[i]);
		if (val < new_val) {
			val = new_val;
		}
	}
	return val;
});
frycAPI_expand_prototype(Array, "min_elem", function (getter = a => a) {
	const len = this.length;
	if (!len) return null;
	let el = this[0];
	let val = getter(el);
	for (let i = 1; i < len; i++) {
		const new_el = this[i];
		const new_val = getter(new_el);
		if (val > new_val) {
			val = new_val;
			el = new_el;
		}
	}
	return el;
});
frycAPI_expand_prototype(Array, "max_elem", function (getter = a => a) {
	const len = this.length;
	if (!len) return null;
	let el = this[0];
	let val = getter(el);
	for (let i = 1; i < len; i++) {
		const new_el = this[i];
		const new_val = getter(new_el);
		if (val < new_val) {
			val = new_val;
			el = new_el;
		}
	}
	return el;
});
frycAPI_expand_prototype(Array, "last", function () {
	return this[this.length - 1];
}, true, true, true, !frycAPI_host("steamcommunity.com"));

frycAPI_expand_prototype(EventTarget, "frycAPI_add_event_listener", function (listener_type, callback) {
	this.addEventListener(listener_type, callback);
	return this;
});
frycAPI_expand_prototype(EventTarget, "frycAPI_add_event_listener_fun", function (listener_type, callback) {
	this.addEventListener(listener_type, callback);
	return callback;
});

frycAPI_expand_prototype(DOMTokenList, "not_contains", function (da_class) { // i.e. Element's classList is a DOMTokenList
	return !this.contains(da_class);
});

frycAPI_expand_prototype(Node, "frycAPI_is_text", function () {
	return this.nodeType === Node.TEXT_NODE;
}, true);
frycAPI_expand_prototype(Node, "frycAPI_insert_after", function (new_node) {
	if (frycAPI.is_string(new_node)) {
		new_node = frycAPI.elem_from_html(new_node);
	}
	if (this.nextSibling !== null) {
		this.parentNode.insertBefore(new_node, this.nextSibling);
	} else {
		this.parentNode.appendChild(new_node);
	}
	return new_node;
});

frycAPI_expand_prototype(Element, "frycAPI_add_class", function (...class_names) {
	this.classList.add(...class_names);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_remove_class", function (...class_names) {
	this.classList.remove(...class_names);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_toggle_class", function (class_name, force) {
	this.classList.toggle(class_name, force);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_set_attribute", function (att_name, att_value) {
	this.setAttribute(att_name, att_value);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_remove_attribute", function (att_name) {
	this.removeAttribute(att_name);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_set_attribute_bulk", function (...args) {
	if (args.length % 2 !== 0) throw new Error("Arguments' length must be even.");
	const max = args.length;
	let att_name, att_value;
	for (let i = 1; i < max; i += 2) {
		att_name = args[i - 1];
		att_value = args[i];
		this.setAttribute(att_name, att_value);
	}
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_set_obj_key", function (key_name, key_value) {
	this[key_name] = key_value;
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_set_inner_html", function (new_inner_html) {
	this.innerHTML = frycAPI.create_html(new_inner_html);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_set_inner_text", function (new_inner_text) {
	this.innerText = new_inner_text;
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_insert_adjacent_element", function (where, elem) {
	this.insertAdjacentElement(where, elem);
	return this;
});
frycAPI_expand_prototype(Element, "frycAPI_shuffle_children", function () {
	const me = this;
	Array.from(me.children).frycAPI_shuffle().forEach(function (da_elem) {
		me.appendChild(da_elem);
	});
	return me;
});
frycAPI_expand_prototype(Element, "frycAPI_sort_children_simple", function (get_value = a => a.innerText) {
	const me = this;
	const elem_arr = Array.from(me.children);
	elem_arr.frycAPI_sort_values_simple(get_value);
	elem_arr.forEach(function (da_elem) {
		me.appendChild(da_elem);
	});
});
frycAPI_expand_prototype(Element, "frycAPI_sort_children_simple_reverse", function (get_value = a => a.innerText) {
	const me = this;
	const elem_arr = Array.from(me.children);
	elem_arr.frycAPI_sort_values_simple_reverse(get_value);
	elem_arr.forEach(function (da_elem) {
		me.appendChild(da_elem);
	});
});
frycAPI_expand_prototype(Element, "frycAPI_sort_children", function (...get_values) {
	const me = this;
	const elem_arr = Array.from(me.children);
	if (!get_values.length) {
		get_values = [elem => elem.innerText];
	}
	elem_arr.frycAPI_sort_values(...get_values);
	elem_arr.forEach(function (da_elem) {
		me.appendChild(da_elem);
	});
});
frycAPI_expand_prototype(Element, "frycAPI_sort_children_reversible", function (get_values_and_orders = [[elem => elem.innerText, false]]) {
	const me = this;
	const elem_arr = Array.from(me.children);
	elem_arr.frycAPI_sort_values_reversible(get_values_and_orders);
	elem_arr.forEach(function (da_elem) {
		me.appendChild(da_elem);
	});
});
frycAPI_expand_prototype(Element, "frycAPI_sort_children_control", function (sort_fun = frycAPI_inner_text_compare) {
	const me = this;
	const elem_arr = Array.from(me.children);
	if (!get_values.length) {
		get_values = [elem => elem.innerText];
	}
	elem_arr.sort(sort_fun);
	elem_arr.forEach(function (da_elem) {
		me.appendChild(da_elem);
	});
});
frycAPI_expand_prototype(Element, "frycAPI_get_first_text_node", function () {
	return [...this.childNodes].find(child => child.nodeType === Node.TEXT_NODE);
});
frycAPI_expand_prototype(Element, "frycAPI_get_first_text_node_content", function () {
	const text = this.frycAPI_get_first_text_node();
	return text && text.textContent.trim();
});
frycAPI_expand_prototype(Element, "frycAPI_remove_children", function () {
	while (this.firstChild) this.removeChild(this.lastChild);
});
frycAPI_expand_prototype(Element, "frycAPI_append_html", function (html_string) { // tylko jeżeli root zawiera pojedynczy element
	return this.appendChild(frycAPI.elem_from_html(html_string));
});
frycAPI_expand_prototype(Element, "frycAPI_insert_html", function (position, html_string) { // tylko jeżeli root zawiera pojedynczy element
	return this.insertAdjacentElement(position, frycAPI.elem_from_html(html_string));
});
frycAPI_expand_prototype(Element, "frycAPI_q_sel_null", function (selector) {
	return this.querySelector(selector) === null;
});
frycAPI_expand_prototype(Element, "frycAPI_q_sel_ok", function (selector) {
	return this.querySelector(selector) !== null;
});
frycAPI_expand_prototype(Element, "frycAPI_q_sel_list", function (list, root = document) {
	if (this instanceof Element) root = this;
	let elem;
	for (const query of list) {
		elem = root.querySelector(query);
		if (elem !== null) return elem;
	}
	return null;
});
frycAPI_expand_prototype(Element, "frycAPI_has_class", function (klasa) {
	return this.classList.contains(klasa);
});
frycAPI_expand_prototype(Element, "frycAPI_has_not_class", function (klasa) {
	return !this.classList.contains(klasa);
});
frycAPI_expand_prototype(Element, "frycAPI_child_index", function () {
	let me = this, i = 0;
	while ((me = me.previousElementSibling) !== null) i++;
	return i;
}, true);
frycAPI_expand_prototype(Element, "frycAPI_elem_by_class", function (klasa) {
	return this.getElementsByClassName(klasa)[0];
});
frycAPI_expand_prototype(Element, "frycAPI_elem_by_tag", function (tag) {
	return this.getElementsByTagName(tag)[0];
});
frycAPI_expand_prototype(Element, "frycAPI_has_scroll", function () {
	return this.scrollHeight > this.clientHeight;
}, true);
frycAPI_expand_prototype(Element, "prev_el", function () {
	return this.previousElementSibling;
}, true);
frycAPI_expand_prototype(Element, "next_el", function () {
	return this.nextElementSibling;
}, true);
frycAPI_expand_prototype(Element, "first_el", function () {
	return this.firstElementChild;
}, true);
frycAPI_expand_prototype(Element, "last_el", function () {
	return this.lastElementChild;
}, true);
frycAPI_expand_prototype(Element, "not_matches", function (selectors) {
	return !this.matches(selectors);
});
frycAPI_expand_prototype(Element, "nth_parent", function (n = 1) {
	let temp = this.parentElement;
	for (let i = 2; i <= n && temp?.parentElement; i++) {
		temp = temp.parentElement;
	}
	return temp;
});
// frycAPI_expand_prototype(Element, "isInDocument", function () {
// 	let parElem = this.parentElement;
// 	while (parElem && parElem !== document.documentElement) {
// 		parElem = parElem.parentElement;
// 	}
// 	return parElem === document.documentElement;
// }, true);
frycAPI_expand_prototype(Element, "is_descendant_of", function (elem = document.documentElement) {
	let par_elem = this.parentElement;
	while (par_elem && par_elem !== elem) {
		par_elem = par_elem.parentElement;
	}
	return par_elem === elem;
});
frycAPI_expand_prototype(Element, "bg_img_url", function () {
	return getComputedStyle(this).backgroundImage.match(/url\("?([^)"]+)"?\)/i)?.[1];
}, true);

frycAPI_expand_prototype(Number, "frycAPI_add", function (num) {
	return this + num;
});
frycAPI_expand_prototype(Number, "frycAPI_sub", function (num) {
	return this - num;
});
frycAPI_expand_prototype(Number, "frycAPI_mult", function (num) {
	return this * num;
});
frycAPI_expand_prototype(Number, "frycAPI_div", function (num) {
	return this / num;
});
frycAPI_expand_prototype(Number, "frycAPI_pow", function (num) {
	return this ** num;
});
frycAPI_expand_prototype(Number, "frycAPI_minus", function () {
	return -this;
});
frycAPI_expand_prototype(Number, "frycAPI_gt", function (num) {
	return this > num;
});
frycAPI_expand_prototype(Number, "frycAPI_ge", function (num) {
	return this >= num;
});
frycAPI_expand_prototype(Number, "frycAPI_lt", function (num) {
	return this < num;
});
frycAPI_expand_prototype(Number, "frycAPI_le", function (num) {
	return this <= num;
});
frycAPI_expand_prototype(Number, "hex", function (num) {
	return this.toString(16).padStart(2, "0");
}, true);

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
	frycAPI_expand_prototype(NodeList, str, Array.prototype[str]);
	frycAPI_expand_prototype(HTMLCollection, str, Array.prototype[str]);
});
frycAPI_expand_prototype(HTMLCollection, "forEach", Array.prototype.forEach);

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
	frycAPI_expand_prototype(NodeList, str, fun);
	frycAPI_expand_prototype(HTMLCollection, str, fun);
});
*/

// frycAPI_expand_prototype(Template, "frycAPI_name", function () {
// });

// window.addEventListener("load", () => frycAPI.download_txt(JSON.stringify(jsSnippets), "expandPrototypeSnippets.json"));
