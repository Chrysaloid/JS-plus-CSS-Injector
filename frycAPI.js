// #region //* Beggining
/* 0 eslint no-implicit-globals: ["warn", {"lexicalBindings": true}] */
/// <reference path="frycAPI-expandPrototype.js"/>
"use strict";
const frycAPI_t1 = performance.now();

class frycAPI_Manual_func {
	callback;
	func_group;
	num;
	prev_func;
	next_func;
	style;
	func_el_style;
	name;
	is_off;
	display_name;
	name_clickable;
	additional_action;
	__name_base; // we cannot use #name_base (real private property) because Popup.js will not be able to read it
	constructor(obj) {
		this.name = obj.name;
		this.__name_base = obj.name;
		this.style = obj.style;
		this.func_el_style = obj.func_el_style;
		this.display_name = obj.display_name ?? false;
		this.name_clickable = obj.name_clickable ?? false;
		this.is_off = obj.is_off ?? false;
		this.additional_action = obj.additional_action ?? {};
		this.reset_name_on_first_start = obj.reset_name_on_first_start ?? true;
		this.title = obj.title;
	}
	get name_base() {
		return this.__name_base;
	}
	set_display_name(new_name) {
		if (frycAPI.is_string(new_name)) { // eslint-disable-line no-use-before-define
			this.name = new_name;
			this.display_name = true;
		} else if (frycAPI.is_bool(new_name)) { // eslint-disable-line no-use-before-define
			this.display_name = new_name;
		}
	}
	on() {
		this.is_off = false;
	}
	off() {
		this.is_off = true;
	}
	toggle() {
		this.is_off = !this.is_off;
	}
	// fixGeneralStateBase(obj) {
	// 	this.name = this.name_base;
	// }
	static types = {
		NORMAL  : "NORMAL",
		STATE   : "STATE",
		RADIO   : "RADIO",
		CHECKBOX: "CHECKBOX",
		COMBO   : "COMBO",
		INPUT   : "INPUT",
	};
}
class frycAPI_Normal extends frycAPI_Manual_func {
	type = frycAPI_Manual_func.types.NORMAL;
	constructor(obj) {
		super(obj);
	}
}
class frycAPI_State extends frycAPI_Manual_func {
	state_desc; num_states; state;
	prev_state; // Previous in time
	constructor(obj) {
		super(obj);
		this.__set_state_desc_base(obj.state_desc);
		this.set_state(obj.state ?? 1);
		this.prev_state = this.state;
	}
	set_state(new_state) {
		new_state = Number(new_state);
		return (this.state = (new_state < 0 ? new_state + this.num_states : new_state) % this.num_states);
	}
	next_state(jump = 1) {
		return this.set_state(this.state + jump);
	}
	set_prev_state(jump = 1) { // Previous on the list
		return this.set_state(this.state - jump);
	}
	/* There was an attempt
	#state = 0;
	set state(newState) {
		this.#state = newState % this.num_states;
	}
	get state() {
		return this.#state;
	}
	next_state(jump = 1) {
		this.state += jump;
		return this.state;
	}
	*/
	__set_state_desc_base(desc) { // Underscores necessary to indicate that this is a protected method, not intended to be used outside class definition
		this.state_desc = desc?.length.frycAPI_ge(2) ? desc : [this.name + ": off", this.name + ": on"];
		this.num_states = this.state_desc.length;
	}
}
class frycAPI_Pure_state extends frycAPI_State {
	type = frycAPI_Manual_func.types.STATE;
	set_state_desc = frycAPI.functions_for_classes.set_state_desc; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
	}
	fix_general_state(obj) {
		this.prev_state = this.state;
		if (obj.type === "name") {
			this.set_prev_state();
		} else if (obj.type === "elem") {
			this.next_state();
		}
	}
}
class frycAPI_Radio extends frycAPI_State {
	type = frycAPI_Manual_func.types.RADIO;
	num_cols; num_rows;
	state_changed = false;
	set_num_cols = frycAPI.functions_for_classes.set_num_cols; // eslint-disable-line no-use-before-define
	set_num_rows = frycAPI.functions_for_classes.set_num_rows; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
		obj.state ?? this.reset_state();
		this.set_num_cols(obj.num_cols);
		this.set_num_rows(obj.num_rows ?? 1);
	}
	reset_state() {
		this.state = null;
		this.prev_state = null;
	}
	fix_general_state(obj) {
		this.prev_state = this.state;
		if (obj.type === "name") {
			this.state = null;
		} else if (obj.type === "elem") {
			this.set_state(obj.state);
		}
		this.state_changed = this.prev_state !== this.state;
	}
	set_state_desc(desc) {
		this.__set_state_desc_base(desc);
		if (this.state >= this.num_states) {
			this.reset_state();
		}
	}
}
class frycAPI_Combo extends frycAPI_State {
	type = frycAPI_Manual_func.types.COMBO;
	state_changed = false;
	set_state_desc = frycAPI.functions_for_classes.set_state_desc; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
	}
	// fixGeneralState = frycAPI.functions_for_classes.fixGeneralStateRadioCombo; // eslint-disable-line no-use-before-define
	fix_general_state(obj) {
		this.prev_state = this.state;
		if (obj.type === "name") {
			this.state = 0;
		} else if (obj.type === "elem") {
			this.set_state(obj.state);
		}
		this.state_changed = this.prev_state !== this.state;
	}
}
class frycAPI_Checkbox extends frycAPI_Manual_func {
	type = frycAPI_Manual_func.types.CHECKBOX;
	state_desc; num_states; state; prev_state; num_cols; num_rows;
	prev_index = 0;
	curr_index = 0;
	set_num_cols = frycAPI.functions_for_classes.set_num_cols; // eslint-disable-line no-use-before-define
	set_num_rows = frycAPI.functions_for_classes.set_num_rows; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
		this.#set_state_desc_base(obj.state_desc);
		const default_state = obj.default_state ?? false;
		this.state = obj.state !== undefined ? structuredClone(obj.state) : this.state_desc.map(e => default_state);
		this.prev_state = structuredClone(this.state);
		if (obj.state !== undefined) this.replace_state(obj.state);
		this.set_num_cols(obj.num_cols);
		this.set_num_rows(obj.num_rows);
	}
	set_state(pos, new_state) {
		return (this.state[pos] = Boolean(new_state));
	}
	replace_state(new_state) {
		const min = Math.min(this.num_states, new_state.length);
		for (let i = 0; i < min; i++) {
			this.state[i] = Boolean(new_state[i]);
		}
		return this.state;
	}
	#set_state_desc_base(desc) {
		this.state_desc = desc?.length ? desc : [this.name + " 1", this.name + " 2"];
		this.num_states = this.state_desc.length;
	}
	set_state_desc(desc) {
		this.#set_state_desc_base(desc);
		this.prev_state = structuredClone(this.state);
		this.state.length = this.num_states;
		this.replace_state(this.state);
	}
	fix_general_state(obj) {
		// this.set_state(obj.index, !this.state[obj.index]);
		this.prev_index = this.curr_index;
		this.prev_state = structuredClone(this.state);
		if (obj.type === "name") {
			this.replace_state(this.state.map(e => false));
		} else if (obj.type === "elem" && obj.index !== undefined) {
			this.state[obj.index] = !this.state[obj.index];
			this.curr_index = obj.index;
		}
	}
}
class frycAPI_Input extends frycAPI_Manual_func {
	type = frycAPI_Manual_func.types.INPUT;
	state = "";
	prev_state = "";
	state_changed = false;
	attributes;
	select_on_focus;
	constructor(obj) {
		super(obj);
		// this.inputType = obj.inputType ?? frycAPI_Input.inputTypes.DIV;
		this.attributes = obj.attributes;
		this.select_on_focus = obj.select_on_focus;
	}
	fix_general_state(obj) {
		this.prev_state = this.state;
		if (obj.type === "elem") {
			this.state = obj.state;
		}
		this.state_changed = this.prev_state !== this.state;
	}
	// static inputTypes = {
	// 	DIV: "div",
	// 	INPUT: "input",
	// };
}
class frycAPI_Func_group {
	name; func_arr; num; style;
	constructor(name, obj) {
		this.name = name;
		this.style = obj.style;
		this.func_arr = obj.func_arr;
		this.func_arr = this.func_arr.map(func_func => func_func());
		this.func_arr.forEach((func_obj, func_num) => {
			func_obj.func_group = this;
			func_obj.num = func_num;
			func_obj.prev_func = this.func_arr[func_num - 1];
			func_obj.next_func = this.func_arr[func_num + 1];
		});
	}
}
class frycAPI_Style_state {
	id; state; style_elem; on; off; toggle; event_obj;
	constructor(obj) {
		const me = this;
		me.state = Boolean(obj.state ?? true);
		me.id = obj.id;

		if (obj.elevated) {
			me.event_obj = { style: obj.style, allFrames: obj.allFrames };
			me.set_state = async function (new_state) {
				new_state = Boolean(new_state);
				if (me.state !== new_state) {
					if (new_state) {
						await frycAPI.send_event_to_background("injectStyle", me.event_obj); // eslint-disable-line no-use-before-define
						me.state = true; // eslint-disable-line require-atomic-updates
					} else {
						await frycAPI.send_event_to_background("removeStyle", me.event_obj); // eslint-disable-line no-use-before-define
						me.state = false; // eslint-disable-line require-atomic-updates
					}
				}
				return me.state;
			};
			me.on = async function () {
				if (me.state !== true) {
					await frycAPI.send_event_to_background("injectStyle", me.event_obj); // eslint-disable-line no-use-before-define
					me.state = true; // eslint-disable-line require-atomic-updates
				}
				return me.state;
			};
			me.off = async function () {
				if (me.state !== false) {
					await frycAPI.send_event_to_background("removeStyle", me.event_obj); // eslint-disable-line no-use-before-define
					me.state = false; // eslint-disable-line require-atomic-updates
				}
				return me.state;
			};
			me.toggle = async function () {
				if (me.state !== true) {
					await frycAPI.send_event_to_background("injectStyle", me.event_obj); // eslint-disable-line no-use-before-define
					me.state = true; // eslint-disable-line require-atomic-updates
				} else {
					await frycAPI.send_event_to_background("removeStyle", me.event_obj); // eslint-disable-line no-use-before-define
					me.state = false; // eslint-disable-line require-atomic-updates
				}
				return me.state;
			};
		} else {
			me.style_elem = obj.style_elem;
			me.set_state = function (new_state) {
				new_state = Boolean(new_state);
				if (me.state !== new_state) {
					me.style_elem.disabled = !new_state;
					me.handle_darkreader();
					me.state = new_state;
				}
				return me.state;
			};
			me.on = function () {
				if (me.state !== true) {
					me.style_elem.disabled = false;
					me.handle_darkreader();
					me.state = true;
				}
				return me.state;
			};
			me.off = function () {
				if (me.state !== false) {
					me.style_elem.disabled = true;
					me.handle_darkreader();
					me.state = false;
				}
				return me.state;
			};
			me.toggle = function () {
				if (me.state !== true) {
					me.style_elem.disabled = false;
					me.handle_darkreader();
					me.state = true;
				} else {
					me.style_elem.disabled = true;
					me.handle_darkreader();
					me.state = false;
				}
				return me.state;
			};
		}
	}
	handle_darkreader() {
		if (document.documentElement.hasAttribute("data-darkreader-mode")) {
			let elem = this.style_elem.nextElementSibling;
			if (elem !== null && elem.tagName === "STYLE" && elem.frycAPI_has_class("darkreader")) {
				elem.disabled = this.style_elem.disabled;
			} else {
				elem = this.style_elem.parentElement.querySelector(`#${this.id} ~ style.darkreader`);
				if (elem !== null) elem.disabled = this.style_elem.disabled;
			}
		}
	}
}
class frycAPI_Elem {
	elem;
	constructor(elem_type) {
		this.elem = document.createElement(elem_type);
	}
	get _() {
		return this.elem;
	}
	text(str) {
		this.elem.innerText = str;
		return this;
	}
	html(str) {
		this.elem.innerHTML = frycAPI.create_html(str); // eslint-disable-line no-use-before-define
		return this;
	}
	class(...cls) {
		this.elem.classList.add(...cls);
		return this;
	}
	attr(attr, val) {
		this.elem.setAttribute(attr, val);
		return this;
	}
	event(name, fun) {
		this.elem.addEventListener(name, fun);
		return this;
	}
}
class frycAPI_Mutation_observer extends MutationObserver {
	#callback; #target; #options; #connected; #async_callback;
	constructor(callback, async_callback, target, options, call_the_callback = true) {
		super(callback);
		this.#callback = callback;
		this.#async_callback = async_callback ?? callback.constructor.name === "AsyncFunction";
		this.#connected = false;
		if (target && options) {
			this.#target = target;
			this.#options = options;
			this.reconnect(call_the_callback);
		} else if (target || options) {
			throw new Error("target and options should be specified if you want to observe the target immediately");
		} else {
			this.#target = null;
			this.#options = null;
		}
	}
	get callback() {
		return this.#callback;
	}
	get target() {
		return this.#target;
	}
	get options() {
		return this.#options;
	}
	get connected() {
		return this.#connected;
	}
	get async_callback() {
		return this.#async_callback;
	}
	observe(target, options) { // TODO: Make it so that multiple targets can be observed
		super.disconnect();
		super.observe(target, options);
		this.#target = target;
		this.#options = options;
		this.#connected = true;
		return this;
	}
	disconnect() {
		super.disconnect();
		this.#connected = false;
		return this;
	}
	reconnect(call_the_callback = false) {
		if (this.#connected) return this;
		if (call_the_callback) {
			if (this.#async_callback) {
				this.#connected = this.#callback([], this).then(result => {
					if (result === true) {
						return (this.#connected = false);
					} else {
						super.observe(this.#target, this.#options);
						return (this.#connected = true);
					}
				});
				return this;
			} else if (this.#callback([], this) === true) {
				return this;
			}
		}
		super.observe(this.#target, this.#options);
		this.#connected = true;
		return this;
	}
	toggle(call_on_reconnect) {
		if (this.#connected) {
			this.disconnect();
		} else {
			this.reconnect(call_on_reconnect);
		}
		return this;
	}
}
class frycAPI_Cache {
	path;
	constructor(cache_id) {
		this.path = frycAPI.atob_utf8(cache_id); // eslint-disable-line no-use-before-define
	}
	get_folder() {
		return this.path.replace(/chrome-extension:\/\/.+?\//, "G:/");
	}
	get_file_url(name) {
		return this.path + name;
	}
	async file_exists(name) {
		try {
			const response = await fetch(this.get_file_url(name), { method: "HEAD" });
			return response.ok;
		} catch {
			return false;
		}
	}
	file_exists_promise(name) {
		return fetch(this.get_file_url(name), { method: "HEAD" });
	}
}
function loguj(...tekst) {
	console.log(...tekst);
}
function temₚ(strings, ...values) { // Extract contents of string template literal
	return [strings, values];
}

// Grupy bloków co 19 pozycji (18.04.2024)
// 184 ifów 21.10.2024 // Regex do liczenia ifów: /(^if.+|^\}? ?else if)/gm

// Popularny error wyrzucany przez różne rzeczy do konsoli. Poniższy regex wklejony do filtra konsoli go wyłącza
// -/Unchecked runtime.lastError: The message port closed before a response was received/

// #endregion

// #region //* frycAPI
var frycAPI = { // eslint-disable-line no-var
	// #region //* Variables 1
	// #region //* Deklaracje
	second: null,
	minute: null,
	hour: null,
	day: null,
	month: null,
	year: null,
	week: null,
	date_formatter: null,
	date_formatter_for_file_name: null,
	date_opts_no_time: null,
	my_style_state: null,
	my_style_manual_func: null,
	style_str: "",
	style_opts: {
		wait_for_elem: () => document.body,
		inject_end_condition: () => true,
	},
	// #endregion
	id: document.currentScript.getAttribute("script-id"),
	func_group_arr: [],
	color_scheme_dark: false,
	czas_numer: 1,
	inject_style_normal_num: 0,
	simple_font_change: `* { font-family: "IBM Plex Sans Condensed", sans-serif; }`, // ${frycAPI.simple_font_change}
	functions_for_classes: {
		set_num_cols(num_cols) {
			if (num_cols && num_cols >= 1) {
				this.num_cols = num_cols;
				this.num_rows = undefined;
			}
		},
		set_num_rows(num_rows) {
			if (num_rows && num_rows >= 1) {
				this.num_rows = num_rows;
				this.num_cols = undefined;
			}
		},
		set_state_desc(desc) {
			this.__set_state_desc_base(desc);
			if (this.state >= this.num_states) {
				this.set_state(0);
			}
		},
		// fixGeneralStateRadioCombo(obj) { // There was an attempt but the methods though similar unfortunately are different
		// },
	},
	script: document.currentScript,
	create_mut_obs_licznik: 0,
	get path() { return location.pathname },
	UUID: null,
	mime_types: null,
	line: null,
	special_string_ahk: "QW1vbmcgdXMgaXMgdmVyeSBTVVM=",
	time_names_dict: {
		pol: [
			" temu",
			[
				["sekund", "minut", "godzin", "dni", "miesięcy", "lat"],
				["sek"   , "min"  , "godz"  , "dni", "mies"    , "lat"], // eslint-disable-line comma-spacing
				["s"     , "m"    , "g"     , "d"  , "M"       , "l"  ], // eslint-disable-line comma-spacing
			],
		],
		ang: [
			" ago",
			[
				["seconds", "minutes", "hours", "days", "months", "years"],
				["sec"    , "min"    , "hour" , "days", "mon"   , "year" ], // eslint-disable-line comma-spacing
				["s"      , "m"      , "h"    , "d"   , "M"     , "y"    ], // eslint-disable-line comma-spacing
			],
		],
	},
	list_marker_collapsed: "⮞",
	list_marker_open: "⮟",
	website_url: new URL(location.href),
	matlab_colors: [
		"#0089e3", // Blue
		"#ff631e", // Orange
		"#ffd426", // Yellow
		"#9738aa", // Purple
		"#8fce3a", // Green
		"#5ce4ff", // Cyan
		"#c21838", // Magenta
	],
	// #region //* Zmienne 2
	// #endregion
	// #endregion

	// #region //* Functions 1
	sleep(ms) {
		return new Promise(resolve => { setTimeout(resolve, ms) });
	}, // await frycAPI.sleep(1);
	inject_style_on_load(style, opts = frycAPI.style_opts) { // Injects style to the page at the moment when body element is created
		frycAPI.style_str += style.trim() + "\n";
		frycAPI.style_opts = opts;
	},
	inject_style(style, opts = {}) { // Injects style to the page
		if ((style = style.trim()).length) {
			opts.id        ??= "frycAPI_styleNormal" + (++frycAPI.inject_style_normal_num);

			const already_injected_style = frycAPI.by_id(opts.id);
			if (already_injected_style) {
				return already_injected_style.frycAPI_style_state;
			}

			opts.elevated  ??= false;
			opts.state     ??= true;
			opts.allFrames ??= false;
			const css = frycAPI.minify_css(style);
			let style_elem;

			if (opts.elevated) {
				// This option is able to workaround this error: Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self'"
				if (opts.state) frycAPI.send_event_to_background("injectStyle", { style: css, allFrames: opts.allFrames });
			} else {
				style_elem = frycAPI.elem("style").attr("id", opts.id)._;
				style_elem.textContent = css;
				const elem = opts.elem instanceof Node ? opts.elem : document.documentElement;
				elem.appendChild(style_elem);
				if (!opts.state) style_elem.disabled = true; // For some reason setting disabled to true disables the style only when it is in the DOM, so we have to set it AFTER we instert it
			}

			const style_state = new frycAPI_Style_state({
				id: opts.id,
				style_elem: style_elem,
				state: opts.state,
				elevated: opts.elevated,
				style: css,
				allFrames: opts.allFrames,
			});
			if (style_elem) style_elem.frycAPI_style_state = style_state;
			return style_state;
		}
	}, // frycAPI.inject_style(/*css*/``, { id: "frycAPI_styleNormal", elem: document.documentElement, elevated: false, state: true, allFrames: false });
	minify_css(style) {
		return frycAPI.remove_comments_simple(frycAPI.minify_code_simple(style));
	},
	minify_code_simple(code) {
		return code.replaceAll(/^\s+|[\t\f ]+$/gmu, ""); // /(^\s+|$\s+)/gm
	}, // frycAPI.minify_code_simple(code);
	remove_comments_simple(code) {
		return code.replaceAll(/\n?\/\*.*?\*\//gs, "");
	}, // frycAPI.remove_comments_simple(code);
	create_manual_functions(name, obj) {
		const f_group = new frycAPI_Func_group(name, obj);
		f_group.num = frycAPI.func_group_arr.push(f_group) - 1;
	},
	async handle_manual_function(da_obj) {
		const func = frycAPI.func_group_arr[da_obj.group_number].func_arr[da_obj.func_number];
		// func.fixGeneralStateBase(da_obj.obj);
		func.fix_general_state?.(da_obj.obj);
		await func?.callback(da_obj.obj);
		return frycAPI;
	},
	ctrl_c(text) {
		const text_area = document.createElement("textarea");
		text_area.value = text;

		text_area.style.top = "0";
		text_area.style.left = "0";
		text_area.style.position = "fixed";

		document.body.appendChild(text_area);
		text_area.focus();
		text_area.select();

		try {
			const successful = document.execCommand("copy");
			const msg = successful ? "✅" : "❌";
			console.log("Copy was " + msg);
		} catch (err) {
			console.error("Oops, unable to copy", err);
		}
		document.body.removeChild(text_area);
	}, // frycAPI.ctrl_c("Hello");
	copy_txt(txt) {
		return navigator.clipboard.writeText(txt);
	}, // frycAPI.copy_txt("Hello");
	zaokrl(val, decimals) {
		return Number(Math.round(Number(val.toFixed(decimals) + "e+" + decimals)) + "e-" + decimals);
	},
	clean(node = document.body) { // To delete comment nodes
		const child_nodes = node.childNodes;
		for (let n = child_nodes.length - 1; n >= 0; n--) {
			const child = child_nodes[n];
			if (child.nodeType === 8) {
				node.removeChild(child);
			} else if (child.nodeType === 1) {
				frycAPI.clean(child);
			}
		}
	}, // frycAPI.clean();
	make_table_sortable(tab_elem, tr_sel = "tr:not(:first-child)", td_sel = "td", th_sel = "th", tbody_sel = "tbody") { // Pass reference to the table element
		if (typeof tab_elem === "string") {
			tab_elem = frycAPI.q_sel(tab_elem);
		}
		if (!tab_elem) return;
		const sort_help0 = (a1, b1, kierunek) => ((a1 < b1) ? -1 : ((a1 > b1) ? 1 : 0)) * kierunek;
		const sort_obj = {
			default      : (a, obj) =>        a.querySelector(`:is(${td_sel}):nth-child(${obj.my_index})`).innerText,
			ignoreCase   : (a, obj) =>        a.querySelector(`:is(${td_sel}):nth-child(${obj.my_index})`).innerText.toUpperCase(),
			numeric      : (a, obj) => Number(a.querySelector(`:is(${td_sel}):nth-child(${obj.my_index})`).innerText),
			attrib       : (a, obj) =>        a.querySelector(`:is(${td_sel}):nth-child(${obj.my_index})`).getAttribute(obj.attrib),
			attribNumeric: (a, obj) => Number(a.querySelector(`:is(${td_sel}):nth-child(${obj.my_index})`).getAttribute(obj.attrib)),
		};
		const sort_help = function (obj_fun, obj) {
			return (a, b) => sort_help0(obj_fun(a, obj), obj_fun(b, obj), obj.kierunek);
		};
		function sort_fun(rosnąco) {
			const th = this;
			const kier = typeof rosnąco === "boolean" ? !rosnąco : th.classList.contains("posortowana");
			const tbody = typeof tbody_sel === "string" ? (tab_elem.querySelector(tbody_sel) ?? tab_elem) : tbody_sel;
			Array.prototype.slice.call(tab_elem.querySelectorAll(tr_sel), 0).sort(sort_help(sort_obj[th.getAttribute("krytSort") || "default"], {
				attrib: th.getAttribute("attribSort"),
				my_index: th.getAttribute("index"), // :scope>tr
				kierunek: kier ? -1 : 1,
			})).forEach(function (da_elem, da_i, da_arr) {
				tbody.appendChild(da_elem);
			});
			tab_elem.querySelector(".posortowana")?.classList.remove("posortowana");
			tab_elem.querySelector(".anawotrosop")?.classList.remove("anawotrosop");
			if (kier) {
				th.classList.add("anawotrosop");
			} else {
				th.classList.add("posortowana");
			}
		}
		tab_elem.classList.add("sortowalnaTabela");
		frycAPI.inject_style(/*css*/`
			.sortowalnaTabela {
				& ${th_sel} {
					cursor: pointer;
					&:hover {
						background-color: hsla(0, 0%, 40%, 50%) !important;
					}
					/* &:hover {
						position: relative;
					}
					&:hover::before {
						content: "";
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						background-color: hsla(0, 0%, 100%, 0.1);
					} */
					&.posortowana::after {
						content: " ⮟";
					}
					&.anawotrosop::after {
						content: " ⮝";
					}
				}
			}
		`, { id: "frycAPI_makeTableSortable" });
		tab_elem.querySelectorAll(th_sel).forEach((da_elem, da_i) => {
			da_elem.setAttribute("index", da_i + 1);
			da_elem.addEventListener("click", sort_fun);
			// da_elem.sortFun = sort_fun;
		});
		tab_elem.querySelectorAll(`${td_sel}[rowspan]`).forEach(da_elem => {
			let rowspan = Number(da_elem.getAttribute("rowspan"));
			if (Number.isNaN(rowspan) || rowspan <= 1) return;
			rowspan--;
			da_elem.removeAttribute("rowspan");
			const idx = da_elem.frycAPI_child_index;
			let parent = da_elem.parentElement;
			for (let i = 1; i <= rowspan; i++) {
				parent.next_el.children[idx]?.insertAdjacentElement("beforeBegin", da_elem.cloneNode(1)) ?? parent.next_el.insertAdjacentElement("beforeEnd", da_elem.cloneNode(1));
				parent = parent.next_el;
			}
		});
	}, // frycAPI.make_table_sortable(document.querySelector(`table`));
	zmierz_czas(callback) {
		const t0 = performance.now();
		callback();
		const t1 = performance.now();
		loguj(`Czas ${frycAPI.czas_numer}: ${frycAPI.zaokrl(t1 - t0, 2)} ms`);
		frycAPI.czas_numer++;
	},
	on_load_setter(callback, when = 1) { // 0 = document DOMContentLoaded, 1 = window DOMContentLoaded, 2 = window load
		switch (when) {
			case 0: return document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", callback) : callback();
			case 1: return document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", callback) : callback();
			case 2: return window.addEventListener("load", callback);
		}
	},
	for_each(selector, callback) {
		const list = document.querySelectorAll(selector);
		list.forEach(callback);
		return list;
	},
	sort_elements(parent, elems, sort_callback) {
		const elem_arr = Array.from(elems);
		elem_arr.sort((a, b) => {
			const a1 = sort_callback(a);
			const b1 = sort_callback(b);
			return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
		});
		elem_arr.forEach(function (da_elem) {
			parent.appendChild(da_elem);
		});
	},
	rand_double(min, max) {
		return Math.random() * (max - min) + min;
	},
	rand_int(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	factorial(num) {
		let fact = 1;
		for (let i = 2; i <= num; i++) {
			fact *= i;
		}
		return fact;
	},
	// #endregion
	// #region //* Functions 2
	get_worker_url(my_worker_fun = () => {}) {
		const str = my_worker_fun.toString();
		return frycAPI.obj_url(new Blob([str.substring(
			str.indexOf("{") + 1,
			str.lastIndexOf("}")
		)]));
	}, // let myWorker = new Worker(frycAPI.get_worker_url(myWorkerFun));
	remove_last(str, N) {
		return str.slice(0, -N);
	}, // str = frycAPI.remove_last(str, N);
	print_rel_time(epoch_ms, obj = {}) {
		if (isNaN(epoch_ms)) return obj.fallback ?? "";

		const czy_diff   = obj.czy_diff   ?? true;
		const lang      = obj.lang      ?? "ang";
		const compact   = obj.compact   ?? 0;
		const space     = (obj.space    ?? true) ? " " : "";
		const ago       = obj.ago       ?? true;
		const left_align = obj.left_align ?? false;
		const prec      = obj.prec      ?? undefined;
		let   ago_str    = obj.ago_str    || undefined;
		let   znak      = obj.znak      || undefined;

		let czas = (czy_diff ? (Date.now() - epoch_ms) : epoch_ms);
		znak ??= czas < 0 ? "-" : "";
		czas = Math.abs(czas);
		let czyt_czas, time_names;

		try {
			const [ago_str_base, time_names_arr] = frycAPI.time_names_dict[lang];
			time_names = time_names_arr[compact];
			ago_str ??= ago_str_base;
		} catch {
			throw new Error("Language not supported");
		}

		if (left_align) {
			const max_len = time_names.reduce((max, elem) => (max < elem.length ? elem.length : max), 0);
			time_names = time_names.map(elem => elem.padEnd(max_len));
		}

		/* eslint-disable */
		if (czas < frycAPI.minute) { czyt_czas =                                                                               (czas / frycAPI.second).toFixed(prec ?? 0 ) + space + time_names[0] } else
		if (czas < frycAPI.hour  ) { czyt_czas = (czas <= frycAPI.minute * 9.95 ? (czas / frycAPI.minute).toFixed(prec ?? 1) : (czas / frycAPI.minute).toFixed(prec ?? 0)) + space + time_names[1] } else
		if (czas < frycAPI.day   ) { czyt_czas = (czas <= frycAPI.hour   * 9.95 ? (czas / frycAPI.hour  ).toFixed(prec ?? 1) : (czas / frycAPI.hour  ).toFixed(prec ?? 0)) + space + time_names[2] } else
		if (czas < frycAPI.month ) { czyt_czas = (czas <= frycAPI.day    * 9.95 ? (czas / frycAPI.day   ).toFixed(prec ?? 1) : (czas / frycAPI.day   ).toFixed(prec ?? 0)) + space + time_names[3] } else
		if (czas < frycAPI.year  ) { czyt_czas = (czas <= frycAPI.month  * 9.95 ? (czas / frycAPI.month ).toFixed(prec ?? 1) : (czas / frycAPI.month ).toFixed(prec ?? 0)) + space + time_names[4] } else
											{ czyt_czas = (czas <= frycAPI.year   * 9.95 ? (czas / frycAPI.year  ).toFixed(prec ?? 1) : (czas / frycAPI.year  ).toFixed(prec ?? 0)) + space + time_names[5] }
		/* eslint-enable */

		return znak + czyt_czas + (ago ? ago_str : "");
	}, // frycAPI.print_rel_time(new Date);
	print_date_intl(time, date_formatter) {
		return date_formatter.format(time);
	}, // const str = frycAPI.print_date_intl(new Date, dtFrmter);
	date_locales: "af",
	get_date_formatter(options = {}, locales) {
		const default_undef = options.hasOwnProperty("default_undef");
		return Intl.DateTimeFormat(locales ?? frycAPI.date_locales, {
			/* eslint-disable */
			year  : options.hasOwnProperty("year"  ) ? options.year   : ( default_undef ? undefined : "numeric"),
			month : options.hasOwnProperty("month" ) ? options.month  : ( default_undef ? undefined : "2-digit"),
			day   : options.hasOwnProperty("day"   ) ? options.day    : ( default_undef ? undefined : "2-digit"),
			hour  : options.hasOwnProperty("hour"  ) ? options.hour   : ( default_undef ? undefined : "2-digit"),
			minute: options.hasOwnProperty("minute") ? options.minute : ( default_undef ? undefined : "2-digit"),
			second: options.hasOwnProperty("second") ? options.second : ( default_undef ? undefined : "2-digit"),
			timeZoneName: options.timeZoneName,
			/* eslint-enable */
		});
	}, // const dtFrmter = frycAPI.get_date_formatter({ year: "2-digit" });
	print_date(date = new Date(), date_formatter) {
		return frycAPI.print_date_intl(date, date_formatter ?? frycAPI.date_formatter).replace(" ", ", ");
	}, // const str = frycAPI.print_date(new Date());
	print_date_for_file_name(date = new Date(), date_formatter) {
		return frycAPI.print_date_intl(date, date_formatter ?? frycAPI.date_formatter_for_file_name).replaceAll(":", "꞉");
	}, // const filename = frycAPI.print_date_for_file_name(new Date());
	rough_size_of_object(object) {
		// https://stackoverflow.com/a/11900218/12035658
		const object_list = [];
		const stack = [object];
		let bytes = 0;

		while (stack.length) {
			const value = stack.pop();

			switch (typeof value) {
				case "boolean":
					bytes += 4;
					break;
				case "string":
					bytes += value.length * 2;
					break;
				case "number":
					bytes += 8;
					break;
				case "object":
					if (!object_list.includes(value)) {
						object_list.push(value);
						for (const prop in value) {
							if (value.hasOwnProperty(prop)) {
								stack.push(value[prop]);
								bytes += prop.length * 2;
							}
						}
					}
					break;
			}
		}

		return bytes;
	},
	download_helper(href, filename) {
		const a = document.createElement("a");
		a.href = href;
		if (filename !== false) {
			a.download = filename;
		}
		a.click();
	},
	download_url(url, filename, conflict_action = "overwrite") {
		return frycAPI.send_event_to_background("downloadURL", { url, filename, conflictAction: conflict_action });
	}, // frycAPI.download_url(url, "Test.txt");
	download_notify(url, filename, conflict_action = "overwrite") {
		return frycAPI.send_event_to_background("downloadNotify", { url, filename, conflictAction: conflict_action });
	}, // frycAPI.download_notify(url, "Test.txt");
	create_text_url(text, type = "application/octet-stream") { // application/octet-stream prevents Chrome from changing the file's extension if the URL were to be downloaded
		return frycAPI.obj_url(new Blob([text], { type }));
	}, // const url = frycAPI.create_text_url("Test");
	download_txt(text, filename) {
		const url = frycAPI.create_text_url(text);
		frycAPI.download_helper(url, filename);
		URL.revokeObjectURL(url);
	}, // frycAPI.download_txt("Test", "Test.txt");
	async get_mime_type(filename) {
		const pos = filename.lastIndexOf(".");
		if (pos === -1) return "text/plain"; // Dot not found
		const file_ext = filename.slice(pos + 1).toLowerCase(); // Extract after dot
		if (frycAPI.mime_types === null) {
			frycAPI.mime_types = {};
			const mime = await frycAPI.get_res_data("mime_types.txt");
			for (const line of mime.split("\n")) {
				const [ext, mime_type] = line.split(" ");
				frycAPI.mime_types[ext] = mime_type;
			}
		}
		return frycAPI.mime_types[file_ext] ?? "text/plain";
	}, // const mimeType = frycAPI.get_mime_type("Test.txt");
	async download_txt_background(text, filename, conflict_action) {
		const url = frycAPI.create_text_url(text);
		await frycAPI.download_url(url, filename, conflict_action);
		URL.revokeObjectURL(url);
	}, // frycAPI.download_txt_background("Test", "Test.txt");
	redownload_img(img, filename) {
		frycAPI.download_helper(img.src, filename);
	},
	determine_file_name(fr_result, img, alt) {
		const nazwa = (() => {
			if (img.hasAttribute("alt") && (t = img.alt.trim()).length) return t;

			try {
				const url = new URL(img.src);
				if (url.protocol !== "data:") {
					const n = url.pathname.slice(url.pathname.lastIndexOf("/") + 1);
					return n.slice(0, (l => (l === -1 ? n.length : l))(n.lastIndexOf(".")));
				}
			} catch (error) {
				console.warn("URL Parse Error: " + error);
			}

			return "Unknown " + frycAPI.print_date_for_file_name(new Date());
		})();
		const ext = (() => {
			const img_form = fr_result.slice(5, fr_result.indexOf(";")).replace("image/", "");
			if (alt) {
				if (img_form === "jpeg") return ".png";
				if (img_form === "png") return ".jpg";
				if (img_form === "gif") return ".png";
				if (img_form === "svg+xml") return ".png";
				return ".jpg";
			} else {
				if (img_form === "jpeg") return ".jpg";
				if (img_form === "png") return ".png";
				if (img_form === "gif") return ".gif";
				if (img_form === "svg+xml") return ".svg";
				return ".png";
			}
		})();

		return nazwa + ext;
	},
	download_img_old(img, filename, alt) {
		const http_request = new XMLHttpRequest();
		http_request.onload = function () {
			const file_reader = new FileReader();
			file_reader.onloadend = function () {
				frycAPI.download_helper(file_reader.result, filename === undefined ? frycAPI.determine_file_name(file_reader.result, img, alt) : filename);
			};
			file_reader.readAsDataURL(http_request.response);
		};
		http_request.open("GET", img.src);
		http_request.responseType = "blob";
		http_request.setRequestHeader("Access-Control-Allow-Origin", "*");
		http_request.send();
	},
	download_img(img, filename, alt, url_param_bool) {
		/*
		fetch(img.src, { // "https://cors-anywhere.herokuapp.com/"
			cache: "only-if-cached",
			headers: new Headers({
				"Access-Control-Allow-Origin": "*",
			}),
			method: "OPTIONS",
			mode: "no-cors",
			priority: "high",
			referrer: "about:client",
			referrerPolicy: "origin-when-cross-origin",
		})
		*/
		const img_src = img.src;
		if (url_param_bool) img.src = "";
		return fetch(img_src)
		.then(resp => resp.blob())
		.then(frycAPI.blob_to_base64)
		.then(data_url => frycAPI.download_helper(data_url, filename === undefined ? frycAPI.determine_file_name(data_url, img, alt) : filename))
		.catch(err => { // eslint-disable-line handle-callback-err
			// console.warn(err);
			const url = new URL(img_src);
			url.searchParams.append("frycAPI_URL_Parameter", JSON.stringify({ alt }));
			frycAPI.download_helper(url.href, "");
		});
	},
	download_img_raw(img, filename) {
		const canvas = document.createElement("canvas");
		canvas.height = img.naturalHeight;
		canvas.width = img.naturalWidth;
		// img.setAttribute('crossorigin', 'anonymous');
		// img.crossOrigin = "anonymous";
		// img.setAttribute("origin", "anonymous");
		canvas.getContext("2d").drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

		frycAPI.download_helper(canvas.toDataURL(), filename);
	},
	get_img_as_data_url(img_url) {
		return frycAPI.send_event_to_background("getImgAsDataUrl", img_url);
	},
	// #endregion
	// #region //* Functions 3
	g_drive_link_to_img_src(link) { // Converts Google drive open link to download link which is possible to be src of an img etc.
		return frycAPI.g_drive_id_to_img_src(new URL(link).pathname.replace("/file/d/", "").replace("/view", ""));
	},
	g_drive_id_to_img_src(id, width = 1000) { // Converts Google drive image id to download link which is possible to be src of an img etc.
		return `drive.google.com/thumbnail?sz=w${width}&id=${id}`;
	},
	is_valid_date(d) {
		return d instanceof Date && !isNaN(d);
	}, // frycAPI.is_valid_date()
	is_not_valid_date(d) {
		return !frycAPI.is_valid_date(d);
	}, // frycAPI.is_not_valid_date()
	change_favicon(href) {
		document.head.querySelectorAll(`link[rel~="icon"]`).forEach(da_elem => da_elem.remove());
		return document.head.frycAPI_append_html(`<link rel="icon" href="${href}">`);
	}, // frycAPI.change_favicon("href");
	change_favicon_res(filename) {
		return frycAPI.change_favicon(frycAPI.get_res_url(filename));
	}, // frycAPI.change_favicon_res("filename");
	get_res_url(filename) {
		return `chrome-extension://${frycAPI.id}/resources/${filename}`;
	}, // frycAPI.get_res_url("")
	read_file(filename, file_type, redirect = false) {
		return fetch(redirect ? `/redirect?url=${encodeURIComponent(filename)}` : filename).then(resp => {
			if (resp.ok) {
				switch (
					file_type ?? (() => {
						try { return new URL(filename).pathname } // eslint-disable-line brace-style
						catch (err) { return filename }
					})().split(".").pop().toLowerCase()
				) {
					case "json":
						return resp.json();
					case "xml":
						return resp.text().then(frycAPI.parse_xml);
					case "jpg":
					case "jpeg":
					case "png":
					case "gif":
					case "img":
					case "blob":
						return resp.blob();
					default:
						return resp.text();
				}
			} else {
				resp.text().then(txt => { throw new Error(txt) });
			}
		}); // .catch(err => console.error(err));
	}, // await frycAPI.read_file("url_or_filename");
	get_res_data(filename, file_type) {
		return frycAPI.read_file(frycAPI.get_res_url(filename), file_type);
	}, // await frycAPI.get_res_data("")
	parse_xml(str) {
		const dom = new DOMParser().parseFromString(str, "text/xml");
		const parsererror = dom.querySelector(`html:scope > body > parsererror`);
		if (parsererror !== null) {
			throw new Error(parsererror.querySelector(`h3`).innerText.trim() + " " + parsererror.querySelector(`div`).innerText.trim());
		} else {
			return dom;
		}
	}, // await frycAPI.parse_xml(someXMLStr)
	create_mut_obs(callback, obj_opts = {}) { // Mutation Observer
		const opts = obj_opts.options ?? {};
		const options = {
			childList            : opts.childList             ?? true,
			subtree              : opts.subtree               ?? true,
			attributes           : opts.attributes            ?? false,
			attributeFilter      : opts.attributeFilter       ?? undefined,
			attributeOldValue    : opts.attributeOldValue     ?? false,
			characterData        : opts.characterData         ?? false,
			characterDataOldValue: opts.characterDataOldValue ?? false,
		};
		const elem          = obj_opts.elem        ?? document.body;
		const run_callback   = obj_opts.run_callback ?? true;
		const async_callback = obj_opts.async       ?? callback.constructor.name === "AsyncFunction";

		const mut = async_callback ? new frycAPI_Mutation_observer(async (mut_rec_arr, mut_obs) => {
			mut_obs.disconnect();
			if (await callback(mut_rec_arr, mut_obs) !== true) mut_obs.observe(elem, options);
		}, async_callback) : new frycAPI_Mutation_observer((mut_rec_arr, mut_obs) => {
			mut_obs.disconnect();
			if (callback(mut_rec_arr, mut_obs) !== true) mut_obs.observe(elem, options);
		}, async_callback);

		if (run_callback) {
			if (async_callback) {
				callback([], mut).then(result => {
					if (result !== true) mut.observe(elem, options);
				});
			} else if (callback([], mut) !== true) {
				mut.observe(elem, options);
			}
		} else {
			mut.observe(elem, options);
		}

		return mut;
	}, // frycAPI.create_mut_obs((mutRecArr, mutObs) => {}, { run_callback: true, elem: document.body, options: { childList: true, subtree: true } });
	set_default_date(selector = "time", options = {}) { // { get_date: 111, set_date: 111, dateTitle: 111 }
		// Flag usage on www.autohotkey.com
		const root_elem = options.root_elem ?? document.body;
		const sel = root_elem.querySelectorAll(`:is(${selector.trim()}):not(.lepszyCzasParent)`);
		if (sel.length) {
			const get_date = (() => {
				switch (options.get_date) {
					case "txt": return elem => elem.innerText;
					case "html": return elem => elem.innerHTML;
					case "content": return elem => elem.textContent;
					case "attr":
					case undefined: return elem => elem.getAttribute("datetime");
					default: return options.get_date;
				}
			})();
			const set_date       = options.set_date ?? frycAPI.set_default_date_text;
			const date_enum_mode  = options.date_enum_mode;
			const date_enum_style = options.date_enum_style;
			const custom_style   = options.custom_style ?? "";
			const date_opts      = options.date_opts;
			sel.forEach(da_elem => {
				const data = new Date(get_date(da_elem));
				if (frycAPI.is_valid_date(data)) {
					const lepszy_czas = set_date(da_elem, data, date_opts);
					da_elem.classList.add("lepszyCzasParent");
					da_elem.removeAttribute("title");
					date_enum_mode?.(lepszy_czas);
					date_enum_style?.(lepszy_czas);
					if (custom_style) {
						if (lepszy_czas.classList.contains("lepszyCzas")) {
							lepszy_czas.setAttribute("style", custom_style);
						} else {
							lepszy_czas.querySelector(`.lepszyCzas`)?.setAttribute("style", custom_style);
						}
					}
				}
			});
			frycAPI.set_default_date_style(root_elem);
		}
		return frycAPI.set_default_date_enum;
	},
	set_default_date_text(elem, data, date_opts) {
		if (frycAPI.escape_html_policy) {
			elem.frycAPI_set_inner_html(frycAPI.get_default_date_text(data, date_opts));
			return elem.firstElementChild;
		} else {
			// https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing?utm_source=devtools#avoid-forced-synchronous-layouts
			elem.textContent = "";
			const lep_czs = document.createElement("span");
			lep_czs.classList.add("lepszyCzas");
			lep_czs.appendChild(document.createElement("span").frycAPI_add_class("abs-czas")).innerText = frycAPI.print_date(data, date_opts?.print_date);
			lep_czs.appendChild(document.createElement("span").frycAPI_add_class("myślnik-czas")).innerText = " - ";
			lep_czs.appendChild(document.createElement("span").frycAPI_add_class("rel-czas")).innerText = frycAPI.print_rel_time(data, date_opts?.print_date);
			elem.appendChild(lep_czs);
			return lep_czs;
		}
	}, // frycAPI.set_default_date_text(elem, data, dateOpts);
	append_default_date_text(elem, data, date_opts) {
		return elem.frycAPI_append_html(frycAPI.get_default_date_text(data, date_opts));
	},
	insert_default_date_text(elem, position, data, date_opts) {
		return elem.frycAPI_insert_html(position, frycAPI.get_default_date_text(data, date_opts));
	},
	get_default_date_text(data, date_opts = {}) {
		return frycAPI.get_default_date_html(frycAPI.print_date(data, date_opts.print_date), frycAPI.print_rel_time(data, date_opts.print_rel_time));
	},
	get_default_date_html(abs_czas, rel_czas) {
		return /*html*/`<span class="lepszyCzas"><span class="abs-czas">${abs_czas}</span><span class="myślnik-czas"> - </span><span class="rel-czas">${rel_czas}</span></span>`;
	},
	set_default_date_style(root_elem = document.body) {
		if (root_elem.frycAPI_default_date_style_injected) return frycAPI.set_default_date_enum;
		root_elem.frycAPI_default_date_style_injected = true;

		if (frycAPI.set_default_date_enum.date_style_state) { // root_elem here could be a shadowRoot or body inside an iframe
			const new_style_elem = frycAPI.set_default_date_enum.date_style_state.style_elem.cloneNode(1);
			root_elem.appendChild(new_style_elem);
			const host_node = root_elem instanceof ShadowRoot ? root_elem.host : root_elem;
			frycAPI.set_default_date_enum.mode.oba(host_node).float_center(host_node);
			return frycAPI.set_default_date_enum;
		}

		// #region //* Stringi
		const rel = `[lepszyCzas="relatywnyCzas"]`;
		const abs = `[lepszyCzas="absolutnyCzas"]`;
		const styl_span_not_oba = `
			/* cursor: none; */
			cursor: inherit;
			position: relative;
			> :where(.myślnik-czas) { display: none; }
		`;
		const tooltip_reset = `
			background-color: inherit;
			color: inherit;
			border: 0;
			padding: 0;
		`;
		const chosen_not_hover = `
			display: inline;
		`;
		const chosen_hover = `
			visibility: hidden;
			position: unset;
			${tooltip_reset}
		`;
		const not_chosen_not_hover = `
			display: none;
		`;
		const not_chosen_hover = `
			display: inline;
			visibility: visible;
			position: absolute;
			z-index: 999999;
			text-decoration: inherit;
			white-space: nowrap;
		`;
		const styl_abs = `
			&:where(:not(:hover)) > :where(.abs-czas) { ${chosen_not_hover} }
			&:where(:hover      ) > :where(.abs-czas) { ${chosen_hover} }
			&:where(:not(:hover)) > :where(.rel-czas) { ${not_chosen_not_hover} }
			&:where(:hover      ) > :where(.rel-czas) { ${not_chosen_hover} }
		`;
		const styl_rel = `
			&:where(:not(:hover)) > :where(.abs-czas) { ${not_chosen_not_hover} }
			&:where(:hover      ) > :where(.abs-czas) { ${not_chosen_hover} }
			&:where(:not(:hover)) > :where(.rel-czas) { ${chosen_not_hover} }
			&:where(:hover      ) > :where(.rel-czas) { ${chosen_hover} }
		`;
		const styl_oba = `
			display: inline;
			visibility: visible;
			position: unset;
			${tooltip_reset}
		`;

		const r = `:where(.lepszyCzas:hover) > :where(.rel-czas)`;
		const a = `:where(.lepszyCzas:hover) > :where(.abs-czas)`;

		const reset = `
			top:    unset;
			right:  unset;
			bottom: unset;
			left:   unset;
			transform: none;
		`;
		const tooltip = `${reset}
			background-color: hsl(0, 0%, 15%);
			color: hsl(0, 0%, 100%);
			border: 1px solid hsl(0, 0%, 60%);
			padding: 1px 3px;
			line-height: normal;
		`;
		const float = `${reset}${tooltip_reset}`;

		const top = `
			bottom: var(--tool-tip-calc);
			left: 50%;
			transform: translate(calc(-50% + var(--tt-x)), var(--tt-y));
		`;
		const right = `
			left: var(--tool-tip-calc);
			top: 50%;
			transform: translate(var(--tt-x), calc(-50% + var(--tt-y)));
		`;
		const bottom = `
			top: var(--tool-tip-calc);
			left: 50%;
			transform: translate(calc(-50% + var(--tt-x)), var(--tt-y));
		`;
		const left = `
			right: var(--tool-tip-calc);
			top: 50%;
			transform: translate(var(--tt-x), calc(-50% + var(--tt-y)));
		`;
		const center = `
			top: 50%;
			left: 50%;
			transform: translate(calc(-50% + var(--tt-x)), calc(-50% + var(--tt-y)));
		`;
		/* eslint-disable template-curly-spacing,comma-spacing */
		const arr = [
			[`[lepszyCzasStyl="toolTip-top"]`   , `${tooltip}${top   }`],
			[`[lepszyCzasStyl="toolTip-right"]` , `${tooltip}${right }`],
			[`[lepszyCzasStyl="toolTip-bottom"]`, `${tooltip}${bottom}`],
			[`[lepszyCzasStyl="toolTip-left"]`  , `${tooltip}${left  }`],
			[`[lepszyCzasStyl="toolTip-center"]`, `${tooltip}${center}`],
			[`[lepszyCzasStyl="float-left"]`    , `${float} left: 0; transform: translate(var(--tt-x), var(--tt-y));`],
			[`[lepszyCzasStyl="float-center"]`  , `${float} left: 50%; transform: translate(calc(-50% + var(--tt-x)), var(--tt-y));`],
			[`[lepszyCzasStyl="float-right"]`   , `${float} right: 0; transform: translate(var(--tt-x), var(--tt-y));`],
			// [`&[lepszyCzasStyl="float-top"]`     , `${float  }${top   }`],
			// [`&[lepszyCzasStyl="float-bottom"]`  , `${float  }${bottom}`],
		];
		/* eslint-enable template-curly-spacing,comma-spacing */
		const tooltip_mod_sel = `:where([lepszyCzasStyl^="toolTip"]:not([lepszyCzasStyl="toolTip-center"]))`;
		const tooltip_mod_style = `visibility: visible;`;
		const float_mod_sel = `:where([lepszyCzasStyl^="float"], [lepszyCzasStyl="toolTip-center"])`;
		const float_mod_style = `visibility: hidden;`;
		const big_spec = `[lepszyCzas]`.repeat(5);
		// let big_spec = `[lepszyCzas]`.repeat(5);
		// big_spec = `${big_spec}, :host(${big_spec})`;
		/* //* Próba konceptualnego ogarnięcia dlaczego ten styl działa
			g(a,r)
			g(t,f)
			go
			g(t,f) l(a,r)
			g(a,r) l(t,f)

			l(a,r)
			l(a,r)l(t,f)
			lo
		*/
		// #endregion

		frycAPI.set_default_date_enum.date_style_state = frycAPI.inject_style(
			/*
				:is([lepszyCzas="absolutnyCzas"], [lepszyCzas="relatywnyCzas"]) span.lepszyCzas {
					cursor: none;
					> .myślnik-czas { display: none; }
				}
				[lepszyCzas="absolutnyCzas"] span.lepszyCzas {
					&:not(:hover) > .abs-czas { display: inline; }
					&:hover       > .abs-czas { display: none; }
					&:not(:hover) > .rel-czas { display: none; }
					&:hover       > .rel-czas { display: inline; }
				}
				[lepszyCzas="relatywnyCzas"] span.lepszyCzas {
					&:not(:hover) > .abs-czas { display: none; }
					&:hover       > .abs-czas { display: inline; }
					&:not(:hover) > .rel-czas { display: inline; }
					&:hover       > .rel-czas { display: none; }
				}
				[lepszyCzas="oba"] span.lepszyCzas > :is(.abs-czas, .rel-czas, .myślnik-czas) {
					display: inline;
				}

				span.lepszyCzas:is([lepszyCzas="absolutnyCzas"], [lepszyCzas="relatywnyCzas"]) {
					cursor: none;
					> .myślnik-czas { display: none; }
				}
				span.lepszyCzas[lepszyCzas="absolutnyCzas"] {
					&:not(:hover) > .abs-czas { display: inline; }
					&:hover       > .abs-czas { display: none; }
					&:not(:hover) > .rel-czas { display: none; }
					&:hover       > .rel-czas { display: inline; }
				}
				span.lepszyCzas[lepszyCzas="relatywnyCzas"] {
					&:not(:hover) > .abs-czas { display: none; }
					&:hover       > .abs-czas { display: inline; }
					&:not(:hover) > .rel-czas { display: inline; }
					&:hover       > .rel-czas { display: none; }
				}
				span.lepszyCzas[lepszyCzas="oba"] > :is(.abs-czas, .rel-czas, .myślnik-czas) {
					display: inline;
				}
			*/
			/*css*/`
				@${big_spec}@ :where(span.lepszyCzas) {
					overflow: visible;
					text-decoration: inherit;
					white-space: nowrap;
					--tool-tip-padd: 3px;
					--tt-x: 0px;
					--tt-y: 0px;
					--tool-tip-calc: calc(100% + var(--tool-tip-padd));
				}
				@${big_spec}:where(${abs}, ${rel})@ :where(.lepszyCzas) { ${styl_span_not_oba} }
				@${big_spec}:where(${abs})@ :where(.lepszyCzas)         { ${styl_abs} }
				@${big_spec}:where(${rel})@ :where(.lepszyCzas)         { ${styl_rel} }

				${frycAPI.array_to_template(arr, temₚ` @${big_spec}:where(${abs}${0})@ ${r} {${1}}`)}
				${frycAPI.array_to_template(arr, temₚ` @${big_spec}:where(${rel}${0})@ ${a} {${1}}`)}
				@${big_spec}:where(${abs})${tooltip_mod_sel}@ ${a} {${tooltip_mod_style}}
				@${big_spec}:where(${rel})${tooltip_mod_sel}@ ${r} {${tooltip_mod_style}}

				@${big_spec}:where([lepszyCzas="oba"])@ :where(.lepszyCzas) > :where(.abs-czas, .rel-czas, .myślnik-czas) { ${styl_oba} }

				${frycAPI.array_to_template(arr, temₚ` @${big_spec}:where(${0})@ :where(${abs})${r} {${1}}`)}
				${frycAPI.array_to_template(arr, temₚ` @${big_spec}:where(${0})@ :where(${rel})${a} {${1}}`)}

				@${big_spec}:where(${abs})@ {${frycAPI.array_to_template(arr, temₚ` :where(${0})${r} {${1}}`)} }
				@${big_spec}:where(${rel})@ {${frycAPI.array_to_template(arr, temₚ` :where(${0})${a} {${1}}`)} }
				@${big_spec}:where(${abs})@ ${float_mod_sel}${a} {${float_mod_style}}
				@${big_spec}:where(${rel})@ ${float_mod_sel}${r} {${float_mod_style}}

				@${big_spec}@ :where(:is(${abs}, ${rel}).lepszyCzas) { ${styl_span_not_oba} }
				@${big_spec}@ :where(${abs}.lepszyCzas)              { ${styl_abs} }
				@${big_spec}@ :where(${rel}.lepszyCzas)              { ${styl_rel} }

				@${big_spec}${tooltip_mod_sel}@ :where(${abs})${a} {${tooltip_mod_style}}
				@${big_spec}${tooltip_mod_sel}@ :where(${rel})${r} {${tooltip_mod_style}}
				@${big_spec}@ :where(${abs})${float_mod_sel}${a}   {${float_mod_style}}
				@${big_spec}@ :where(${rel})${float_mod_sel}${r}   {${float_mod_style}}
				@${big_spec}:where(${abs})@ ${tooltip_mod_sel}${a} {${tooltip_mod_style}}
				@${big_spec}:where(${rel})@ ${tooltip_mod_sel}${r} {${tooltip_mod_style}}

				@${big_spec}@ :where(${abs}) {${frycAPI.array_to_template(arr, temₚ` &:where(${0})${r} {${1}}`)} }
				@${big_spec}@ :where(${rel}) {${frycAPI.array_to_template(arr, temₚ` &:where(${0})${a} {${1}}`)} }
				@${big_spec}@ :where(${abs})${tooltip_mod_sel}${a} {${tooltip_mod_style}}
				@${big_spec}@ :where(${rel})${tooltip_mod_sel}${r} {${tooltip_mod_style}}

				@${big_spec}@ :where(.lepszyCzas[lepszyCzas="oba"]) > :where(.abs-czas, .rel-czas, .myślnik-czas) { ${styl_oba} }
			`
			.replaceAll(/  +/g, " ")
			.replaceAll(/(@)(.*?)(@)/g, ":is($2, :host($2))"),
			{ id: "frycAPI_setDefaultDate", elem: root_elem }
		);

		frycAPI.set_default_date_enum.mode.oba().float_center();
		return frycAPI.set_default_date_enum;
	}, // frycAPI.set_default_date_style();
	set_default_date_enum: {
		/* eslint-disable */
		mode: {
			relatywny_czas(elem, set_storage) { return frycAPI.set_default_date_enum_func1(elem, "relatywnyCzas", 0, set_storage) },
			absolutny_czas(elem, set_storage) { return frycAPI.set_default_date_enum_func1(elem, "absolutnyCzas", 1, set_storage) },
			oba          (elem, set_storage) { return frycAPI.set_default_date_enum_func1(elem, "oba"          , 2, set_storage) },
		},
		mode_enum: {
			relatywnyCzas: 0,
			absolutnyCzas: 1,
			oba          : 2,
		},
		style: {
			tool_tip_top    (elem) { return frycAPI.set_default_date_enum_func2(elem, "toolTip-top"   ) },
			tool_tip_right  (elem) { return frycAPI.set_default_date_enum_func2(elem, "toolTip-right" ) },
			tool_tip_bottom (elem) { return frycAPI.set_default_date_enum_func2(elem, "toolTip-bottom") },
			tool_tip_left   (elem) { return frycAPI.set_default_date_enum_func2(elem, "toolTip-left"  ) },
			tool_tip_center (elem) { return frycAPI.set_default_date_enum_func2(elem, "toolTip-center") },
			float_left     (elem) { return frycAPI.set_default_date_enum_func2(elem, "float-left"    ) },
			float_center   (elem) { return frycAPI.set_default_date_enum_func2(elem, "float-center"  ) },
			float_right    (elem) { return frycAPI.set_default_date_enum_func2(elem, "float-right"   ) },
			// floatTop      (elem) { return frycAPI.set_default_date_enum_func2(elem, "float-top"     ) },
			// floatBottom   (elem) { return frycAPI.set_default_date_enum_func2(elem, "float-bottom"  ) },
		},
		/* eslint-enable */
		manual_func_ref: null,
		default_date_mode: null,
		mode_iter: 0,
		date_style_state: null,
	}, // frycAPI.set_default_date_enum.relatywny_czas();
	set_default_date_enum_func1(elem, val, state, set_storage = false) {
		if (elem === undefined) {
			const iter = ++frycAPI.set_default_date_enum.mode_iter;
			(async () => {
				if (iter < frycAPI.set_default_date_enum.mode_iter) return; // A newer mode setting was applied so don't apply the old setting
				if (set_storage) {
					frycAPI.set_storage("defaultDateMode", val);
				} else {
					frycAPI.set_default_date_enum.default_date_mode = state;
					const mode = await frycAPI.get_storage("defaultDateMode");
					if (mode !== undefined) {
						val = mode;
						state = frycAPI.set_default_date_enum.mode_enum[mode]; // eslint-disable-line require-atomic-updates
					}
				}
				document.body.setAttribute("lepszyCzas", val);
				frycAPI.set_default_date_enum.manual_func_ref?.set_state(state);
			})();
		} else {
			elem.setAttribute("lepszyCzas", val);
		}
		return frycAPI.set_default_date_enum.style;
	},
	set_default_date_enum_func2(elem, val) {
		if (elem === undefined) {
			document.body.setAttribute("lepszyCzasStyl", val);
		} else {
			elem.setAttribute("lepszyCzasStyl", val);
		}
		return frycAPI.set_default_date_enum.mode;
	},
	query_sel_null(selector, elem = document) {
		return elem.querySelector(selector) === null;
	},
	array_to_template(arr, [strs, vals]) {
		// debugger;
		// const cols = vals.length;
		const is_int = new Array(vals.length);
		vals.forEach((el, i) => {
			is_int[i] = frycAPI.is_int(el);
		});
		const last = strs[strs.length - 1];
		let out_str = "";
		arr.forEach((row, i) => {
			// if (row.length !== cols) throw new Error("Liczba kolumn i liczba pól w stringu muszą się zgadzać");
			const row_fun = frycAPI.is_array(row) ? (r, el) => r[el] : r => r;
			vals.forEach((el, j) => {
				out_str += strs[j];
				out_str += is_int[j] ? row_fun(row, el) : el;
			});
			out_str += last;
		});
		return out_str;
	},
	// #endregion
	// #region //* Functions 4
	query_sel_ok(selector, elem = document) {
		return elem.querySelector(selector) !== null;
	},
	obj_url(blob) {
		return URL.createObjectURL(blob);
	}, // .then(frycAPI.obj_url)
	blob_to_base64(blob) {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		return new Promise(resolve => {
			reader.onloadend = () => {
				resolve(reader.result);
			};
		});
	}, // .then(frycAPI.blob_to_base64)
	time_12_to_24(str) { // str = "3:32 PM";
		const data = new Date("May 3 2001 " + str);
		return `${data.getHours().toString().padStart(2, "0")}:${data.getMinutes().toString().padStart(2, "0")}`;
	},
	array_one_to_n(N) {
		return [...Array(N + 1).keys()].slice(1);
	},
	array_zero_to_n(N) {
		return [...Array(N).keys()];
	},
	is_string(value) {
		return typeof value === "string" || value instanceof String;
	},
	is_bool(value) {
		return typeof value === "boolean" || value instanceof Boolean;
	},
	is_int(value) {
		if (isNaN(value)) return false;
		const x = parseFloat(value);
		return (x | 0) === x;
	},
	is_array(value) {
		return Array.isArray(value);
	},
	is_object(value) {
		if (value === null) return false;
		const type = typeof value;
		return type === "object" || type === "function";
	},
	is_func(value) {
		return typeof value === "function";
	},
	perf(t1, t2, prefix = "") {
		console.log(`${prefix}${(t2 - t1).toFixed(1)} ms`);
	},
	elem_from_html(html_string) { // Only when root contains only one element
		const t = document.createElement("template");
		t.innerHTML = frycAPI.create_html(html_string);
		return t.content.firstElementChild;
	},
	clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	},
	debounce(func, wait) {
		let timeout;
		return function (...args) {
			const context = this;
			clearTimeout(timeout);
			return (timeout = setTimeout(() => func.apply(context, args), wait));
		};
	}, // document.addEventListener("mousemove", frycAPI.debounce(handleMouseMove, 100));
	throttle(func, amount) {
		// amount = ilukrotnie zmniejszyć częstotliwość eventów. Powinien być > 1
		let counter = 1;
		return function (...args) {
			if (counter < amount) {
				counter++;
			} else {
				counter = 1;
				const context = this;
				func.apply(context, args);
			}
		};
	}, // document.addEventListener("mousemove", frycAPI.throttle(handleMouseMove, 4));
	throttle_debounce(func, amount, wait) {
		// amount = ilukrotnie zmniejszyć częstotliwość eventów. Powinien być > 1
		let counter = 1;
		return function (...args) {
			const context = this;
			clearTimeout(timeout);
			if (counter < amount) {
				counter++;
				timeout = setTimeout(() => func.apply(context, args), wait);
			} else {
				counter = 1;
				func.apply(context, args);
			}
		};
	}, // document.addEventListener("mousemove", frycAPI.throttle_debounce(handleMouseMove, 4));
	send_event_to_background(name, data) {
		return frycAPI_chrome_runtime_send_message(frycAPI.id, { name, data }).then(response => {
			if (response.error) {
				console.error(response.err_obj.stack);
				throw new Error(response.err_obj.message);
			} else {
				return response.data;
			}
		}); // returns a Promise
	}, // const result = await frycAPI.send_event_to_background("name", "data");
	async is_webp_animated(resp) {
		const buffer = new Uint8Array(await resp.arrayBuffer());
		if (new TextDecoder().decode(buffer.subarray(12, 16)) === "VP8X") {
			return Boolean((buffer[20] >> 1) & 1);
		}
		return false;
	}, // await frycAPI.is_webp_animated(); // await fetch(frycAPI.get_res_url("test.webp")).then(frycAPI.is_webp_animated)
	xml_obj_to_js_obj(xml_obj) {
		const root = xml_obj.documentElement ?? xml_obj;
		const obj = {
			name: root.nodeName,
		};
		if (root.attributes?.length) {
			obj.attributes = {};
			root.attributes.forEach(attrib => {
				obj.attributes[attrib.name] = attrib.value;
			});
		}
		if (root.childElementCount) {
			obj.children = [];
			root.children.forEach(node => {
				obj.children.push(frycAPI.xml_obj_to_js_obj(node));
			});
		} else {
			obj.text = root.innerText ?? root.textContent;
		}
		return obj;
	}, // frycAPI.xml_obj_to_js_obj(xmlObj);
	xml_str_to_js_obj(xml_str) {
		return frycAPI.xml_obj_to_js_obj(frycAPI.parse_xml(xml_str));
	}, // frycAPI.xml_str_to_js_obj(xmlStr);
	xml_str_to_js_str(xml_str) {
		return JSON.stringify(frycAPI.xml_obj_to_js_obj(frycAPI.parse_xml(xml_str)));
	}, // frycAPI.xml_str_to_js_str(xmlStr);
	xml_obj_to_js_str(xml_obj) {
		return JSON.stringify(frycAPI.xml_obj_to_js_obj(xml_obj));
	}, // frycAPI.xml_obj_to_js_str(xmlObj);
	xml_obj_to_js_obj_node(xml_obj) {
		const root = xml_obj.documentElement ?? xml_obj;
		if (root instanceof Element) {
			const obj = {
				name: root.nodeName,
				attributes: {},
				children: [],
			};
			root.attributes.forEach(attrib => {
				obj.attributes[attrib.name] = attrib.value;
			});
			root.childNodes.forEach(node => {
				obj.children.push(frycAPI.xml_obj_to_js_obj_node(node));
			});
			return obj;
		} else if (root.nodeType === Node.TEXT_NODE) {
			return root.textContent;
		} else {
			return {
				name: root.nodeName,
				text: root.textContent,
			};
		}
	}, // frycAPI.xml_obj_to_js_obj_node(xmlObj);
	xml_str_to_js_obj_node(xml_str) {
		return frycAPI.xml_obj_to_js_obj_node(frycAPI.parse_xml(xml_str));
	}, // frycAPI.xml_str_to_js_obj_node(xmlStr);
	xml_str_to_js_str_node(xml_str) {
		return JSON.stringify(frycAPI.xml_obj_to_js_obj_node(frycAPI.parse_xml(xml_str)));
	}, // frycAPI.xml_str_to_js_str_node(xmlStr);
	xml_obj_to_js_str_node(xml_obj) {
		return JSON.stringify(frycAPI.xml_obj_to_js_obj_node(xml_obj));
	}, // frycAPI.xml_obj_to_js_str_node(xmlObj);
	insert_image(elem, filename, where = "beforeend") {
		return elem.frycAPI_insert_html(where, `<img src="${frycAPI.get_res_url(filename)}">`);
	}, // const img = frycAPI.insert_image(elem, "img.png");
	insert_loading_gif(elem, where = "beforeend", filename = "loading.gif") {
		return elem.frycAPI_insert_html(where, `<img class="loading-gif" src="${frycAPI.get_res_url(filename)}">`);
	}, // const img = frycAPI.insert_loading_gif(elem); // .loading-gif
	elem(elem_type = "div", elem_factory = true) {
		if (!frycAPI.is_string(elem_type)) {
			elem_factory = elem_type;
			elem_type = "div";
		}
		if (elem_factory) {
			return new frycAPI_Elem(elem_type);
		} else {
			return document.createElement(elem_type);
		}
	}, // const elem = frycAPI.elem()._; const elem = frycAPI.elem(0); const elem = frycAPI.elem("span")._;
	set_storage(key, val) {
		if (frycAPI.UUID === null) return;
		return frycAPI.send_event_to_background("setStorage", { UUID: frycAPI.UUID, obj: { [key]: val } }); // throws error if setting failed
	}, // frycAPI.set_storage("key", "val");
	set_storages(obj) {
		if (frycAPI.UUID === null) return;
		return frycAPI.send_event_to_background("setStorage", { UUID: frycAPI.UUID, obj: obj }); // Throws error if setting failed
	}, // frycAPI.set_storages({ "key": "val" });
	get_storage(key) {
		if (frycAPI.UUID === null) return;
		return frycAPI.send_event_to_background("getStorage", { UUID: frycAPI.UUID, keys: [key] }).then(result => result[key]);
	}, // const val = await frycAPI.get_storage("key");
	get_storages(keys) {
		if (frycAPI.UUID === null) return;
		return frycAPI.send_event_to_background("getStorage", { UUID: frycAPI.UUID, keys: keys });
	}, // const vals = await frycAPI.get_storages(["key"]);
	search_params_to_obj(url = location.href) {
		return Object.fromEntries(new URL(url).searchParams);
	}, // const objPars = frycAPI.search_params_to_obj();
	search_params_to_obj_mult(url = location.href) {
		const search_params = new URL(url).searchParams;
		const base_obj = Object.fromEntries(search_params);
		for (const key of Object.keys(base_obj)) {
			base_obj[key] = search_params.getAll(key);
		}
		return base_obj;
	}, // const objPars = frycAPI.search_params_to_obj_mult();
	q_sel_list: Element.prototype.frycAPI_q_sel_list,
	// const elem = frycAPI.q_sel_list([``]);
	check_chrome_version() {
		loguj(navigator.appVersion.match(/.*Chrome\/([0-9.]+)/)[1]);
	}, // frycAPI.check_chrome_version();
	vsc_go_to_line(host = frycAPI_host()) {
		const code = `
			#Requires AutoHotkey <2.0
			#Include C:\\Users\\Fryderyk\\Desktop\\AutoHotKey\\VSC_Go_To_Line_Base.ahk
			openVSCode("${host}")
		`;
		frycAPI.download_txt(frycAPI.minify_code_simple(code), "VSC_Go_To_Line.ahk_frycAPI");
	}, // frycAPI.vsc_go_to_line();
	async retry_if(condition, interval, action = () => {}) { // function, time [ms], function | Should be read as "Retry if condition fails"
		while (true) {
			if (condition()) return action();
			await frycAPI.sleep(interval);
		}
	}, // frycAPI.retry_if(() => a > b, 50, () => {});
	mock_markup(in_str) {
		let out_str = "";
		for (let i = 0; i < in_str.length; i++) {
			if (i % 2) {
				out_str += in_str[i].toUpperCase();
			} else {
				out_str += in_str[i].toLowerCase();
			}
		}
		loguj(out_str);
	}, // frycAPI.mock_markup("Test");
	traverse_iframe_windows(win = window, callback = console.log) {
		try {
			callback(win); // Process the current window
		} catch (e) {
			console.log("Access denied to window:", e);
		}

		const iframes = win.document.body?.getElementsByTagName("iframe");
		if (iframes) {
			for (const iframe of iframes) {
				try {
					const iframe_win = iframe.contentWindow;
					if (iframe_win) {
						frycAPI.traverse_iframe_windows(iframe_win, callback);
					}
				} catch (e) {
					console.log("Cannot access iframe content due to cross-origin restrictions:", e);
				}
			}
		}
	}, // frycAPI.traverse_iframe_windows(window, win => { console.log("Found window:", win.location.href); });
	traverse_iframes(win = window, callback = console.log) {
		const iframes = win.document.body?.getElementsByTagName("iframe");
		if (iframes) {
			for (const iframe of iframes) {
				try {
					callback(iframe); // Process the current iframe
				} catch (e) {
					console.log("Access denied to window:", e);
				}

				try {
					const iframe_win = iframe.contentWindow;
					if (iframe_win) {
						frycAPI.traverse_iframes(iframe_win, callback);
					}
				} catch (e) {
					console.log("Cannot access iframe content due to cross-origin restrictions:", e);
				}
			}
		}
	}, // frycAPI.traverse_iframes(window, iframe => { console.log("Found iframe:", iframe); });
	down_load_video_frame(video_el, filename = frycAPI_host() + " - Video " + video_el.currentTime.toFixed(3) + " s.png") { // Downloads current video frame as png
		const canvas = document.createElement("canvas");
		canvas.width = video_el.videoWidth;
		canvas.height = video_el.videoHeight;
		canvas.getContext("2d").drawImage(video_el, 0, 0);
		canvas.toBlob(blob => {
			if (!blob) return console.error("Failed to create blob");
			const url = frycAPI.obj_url(blob);
			frycAPI.download_helper(url, filename);
			URL.revokeObjectURL(url);
		});
	}, // rycAPI.down_load_video_frame(videoEl, "Video");
	is_elem_on_screen(elem) { // isElemVisible
		const rect = elem.getBoundingClientRect();
		const view_height = Math.max(document.documentElement.clientHeight, window.innerHeight);
		return !(rect.bottom < 0 || rect.top - view_height >= 0);
	}, // frycAPI.is_elem_on_screen(elem);
	traverse_until(direction, start_el, callback) { // Get first element for which callback returns true
		const visited = "frycAPI_traverseUntil";
		let get_next_el;
		switch (direction) {
			case "forward": {
				get_next_el = base_el => {
					if (base_el.hasAttribute(visited)) {
						const next_el = base_el.next_el ?? base_el.parentElement;
						return next_el ? get_next_el(next_el) : null;
					} else {
						base_el.setAttribute(visited, "");
					}
					return base_el.first_el ?? base_el.next_el ?? base_el.parentElement;
				};
				break;
			}
			case "backward": {
				get_next_el = base_el => {
					if (base_el.hasAttribute(visited)) {
						const next_el = base_el.prev_el ?? base_el.parentElement;
						return next_el ? get_next_el(next_el) : null;
					} else {
						base_el.setAttribute(visited, "");
					}
					return base_el.last_el ?? base_el.prev_el ?? base_el.parentElement;
				};
				break;
			}
			case "down": {
				get_next_el = base_el => {
					return base_el.getElementsByTagName("*").find(callback);
				};
				break;
			}
			case "up": {
				get_next_el = base_el => {
					return base_el.parentElement;
				};
				break;
			}
			default: throw new Error("Wrong direction: " + direction);
		}

		let curr_el = start_el;
		while (!callback(curr_el) && (curr_el = get_next_el(curr_el))) {}

		frycAPI.for_each(`[${visited}]`, el => el.removeAttribute(visited));
		return curr_el;
	}, // frycAPI.traverse_until("forward", elem, e => e.hasAttribute("attr"));
	consonants_as_first_letters(str = "alphabet", consonants = "bcdfghjklmnpqrstvwxz") { // "bcćdfghjklmnńpqrsśtvwxzżź"
		const vowels = "aąeęioóuy-";
		str = str.split(" ").map(word => word.trim()).filter(word => word.length).map(word => {
			const word_lower = word.toLowerCase();
			const pos_of_first_vowel = Math.min(...vowels.map(l => {
				const idx = word_lower.indexOf(l);
				return idx !== -1 ? idx : Infinity;
			}));
			return {
				word: word_lower.slice(pos_of_first_vowel !== Infinity ? pos_of_first_vowel : 1),
				case: word[0] === word[0].toUpperCase(),
			};
		});
		let out = "";
		consonants.forEach(c => {
			out += str.map(obj => (obj.case ? c.toUpperCase() : c) + obj.word).join(" ") + "\n";
		});
		loguj(out);
	}, // frycAPI.consonants_as_first_letters("Fryc API")
	by_id(id, doc_or_fragment = document) {
		return doc_or_fragment.getElementById(id);
	}, // const elem = frycAPI.by_id(id);
	q_sel(query, elem = document) {
		return elem.querySelector(query);
	}, // const elem = frycAPI.q_sel(query);
	q_sel_all(query, elem = document) {
		return elem.querySelectorAll(query);
	}, // const elems = frycAPI.q_sel_all(query);
	traverse_shadow_roots(callback = loguj, root_elem = document.body) {
		const stack = [root_elem];
		let i = 0;

		while (i < stack.length) {
			const elem = stack[i++];
			if (elem.shadowRoot) { // shadowRoot will be null if it was created like this: const shadow = elem.attachShadow({ mode: "closed" });
				callback(elem);
				stack.push(...elem.shadowRoot.children);
			}
			stack.push(...elem.children);
		}
	}, // frycAPI.traverse_shadow_roots(elem => {});
	by_class(cls, root_elem = document) {
		return root_elem.getElementsByClassName(cls)[0]; // when class was not found it will return undefined
	}, // const elem = frycAPI.by_class("test");
	by_class_all(cls, root_elem = document) {
		return root_elem.getElementsByClassName(cls);
	}, // const elems = frycAPI.by_class_all("test");
	by_tag(cls, root_elem = document) {
		return root_elem.getElementsByTagName(cls)[0]; // when tag was not found it will return undefined
	}, // const elem = frycAPI.by_tag("p");
	by_tag_all(cls, root_elem = document) {
		return root_elem.getElementsByTagName(cls);
	}, // const elems = frycAPI.by_tag_all("p");
	atomic_await(promise_func, obj, prop_name) {
		if (obj.hasOwnProperty(prop_name)) {
			return obj[prop_name];
		} else {
			if (typeof promise_func !== "function") {
				throw new TypeError("atomic_await expects a function that returns a promise");
			}
			return (obj[prop_name] = promise_func().then(value => {
				obj[prop_name] = value; // overwrite with resolved value
				return value;
			}));
		}
	}, // const value = await frycAPI.atomic_await(() => promiseFunc("with", "params"), someObject, "propName");
	async send_message_to_vscode(name, data) {
		const uri_func_objs = await frycAPI.atomic_await(() => frycAPI.get_res_data("frycAPI_VSCode_uriFuncObjs.json", "json"), frycAPI.send_message_to_vscode, "uri_func_objs");
		const func_obj = uri_func_objs[name];
		if (!func_obj) throw new Error(`Incorrect message name: "${name}"`);
		for (const [key, value] of Object.entries(func_obj)) {
			if (!data.hasOwnProperty(key)) {
				if (value === null) { // if it does not have key but it must have had it
					throw new Error(`Missing mandatory "${key}" property on the data parameter`);
				} else { // if it does not have key but it mustn't have had it
					data[key] = value;
				}
			}
		}
		const url = new URL("vscode://fryderyk-kukowski.fryc-api/");
		url.pathname = name;
		for (const [key, value] of Object.entries(data)) {
			url.searchParams.append(key, value);
		}
		frycAPI.download_helper(url.href, false);
	}, // frycAPI.send_message_to_vscode("notify", { text: "Test" });
	send_message_to_ahk(name, value = "") {
		return new Promise(resolve => {
			const original_title = document.title;
			frycAPI.enforce_title.mut_obs?.disconnect();
			document.title = `${frycAPI.special_string_ahk}${name}|${value}|`;
			function wait_for_special_keys(e) {
				if (e.code === "F2" && e.altKey && e.ctrlKey && e.shiftKey) {
					document.title = original_title;
					frycAPI.enforce_title.mut_obs?.reconnect();
					document.removeEventListener("keydown", wait_for_special_keys);
					// loguj("Test");
					resolve();
				}
			}
			document.addEventListener("keydown", wait_for_special_keys);
		});
	}, // frycAPI.send_message_to_ahk("test", "text");
	enforce_title(title = "Page") {
		return (frycAPI.enforce_title.mut_obs = frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
			if (document.title !== "Messenger") {
				document.title = "Messenger";
			}
		}, { elem: document.querySelector("title"), options: { characterData: true } }));
	}, // frycAPI.enforce_title("Page");
	all_english_word_like_strings_in_one_sentence(word = "zoink") {
		word = word.toLowerCase();
		return `${word.frycAPI_to_title_case()}ity of the ${word}en ${word}s the ${word}est ${word}er with a ${word}able ${word}ment`;
	}, // frycAPI.all_english_word_like_strings_in_one_sentence("zoink");
	get_line_number() {
		try {
			throw new Error("");
		} catch (err) {
			/* err.stack:
			Error
				at Object.get_line_number (frycAPI.js:1908:10)
				at frycAPI.js:2137:25
			*/ // We match   ^^^^ this
			return err.stack.match(/(\d+):\d+$/)?.[1]; // return first capturing group
		}
	}, // frycAPI.get_line_number();
	run_res_script(filename, asynchronous = false) {
		frycAPI.for_each(`script[src$="${filename}"]`, elem => elem.remove());
		const script = document.createElement("script");
		script.src = frycAPI.get_res_url(filename);
		script.async = asynchronous;
		document.documentElement.appendChild(script);
	}, // frycAPI.run_res_script("Test-script.js");
	go_to_id(id) {
		if (!frycAPI.by_id(id)) throw new Error(`There is no element with id="${id}"`);
		location.hash = id;
	}, // frycAPI.go_to_id("someId");
	scroll_to_id(id, options) {
		const elem = frycAPI.by_id(id);
		if (!elem) throw new Error(`There is no element with id="${id}"`);
		elem.scrollIntoView(options);
	}, // frycAPI.go_to_id("someId");
	btoa_utf8(value) {
		return btoa(
			String.fromCharCode(
				...new TextEncoder()
				.encode(value)
			)
		);
	}, // const encoded = frycAPI.btoa_utf8("msg");
	atob_utf8(value) {
		const value_latin1 = atob(value);
		return new TextDecoder().decode(
			Uint8Array.from(
				{ length: value_latin1.length },
				(element, index) => value_latin1.charCodeAt(index)
			)
		);
	}, // const decoded = frycAPI.atob_utf8("dfgbbklhdfg");
	async res_exists(filename) {
		const url = frycAPI.get_res_url(filename);

		try {
			const response = await fetch(url, { method: "HEAD" });
			return response.ok ? url : null;
		} catch {
			return null;
		}
	}, // const fileURL = await frycAPI.res_exists("someName");
	get_distinct_colors(num_colors = 36, return_format = "hsl", saturation = 100, lightness = 26) {
		const color_arr = [];
		if (return_format === "hsl") {
			saturation = saturation.toFixed(1);
			lightness = lightness.toFixed(1);
			for (let i = 0; i < num_colors; i++) {
				color_arr.push(`hsl(${(i / num_colors * 360).toFixed(1)} ${saturation} ${lightness})`);
			}
		} else if (return_format === "rgb") {
			saturation /= 100;
			lightness /= 100;
			for (let i = 0; i < num_colors; i++) {
				const [r, g, b] = frycAPI.hsl_to_rgb(i / num_colors, saturation, lightness);
				color_arr.push(`rgb(${r} ${g} ${b})`);
			}
		} else if (return_format === "rgbInt") {
			saturation /= 100;
			lightness /= 100;
			for (let i = 0; i < num_colors; i++) {
				color_arr.push(frycAPI.hsl_to_rgb(i / num_colors, saturation, lightness));
			}
		} else if (return_format === "hex") {
			saturation /= 100;
			lightness /= 100;
			for (let i = 0; i < num_colors; i++) {
				const [r, g, b] = frycAPI.hsl_to_rgb(i / num_colors, saturation, lightness);
				color_arr.push(`#${r.hex}${g.hex}${b.hex}`);
			}
		} else {
			throw new Error(`Invalid return_format: ${return_format}`);
		}
		return color_arr;
	}, // const colorArr = frycAPI.get_distinct_colors();
	hue_to_rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	},
	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   {number}  h       The hue
	 * @param   {number}  s       The saturation
	 * @param   {number}  l       The lightness
	 * @return  {Array}           The RGB representation
	*/
	hsl_to_rgb(h, s, l) {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = frycAPI.hue_to_rgb(p, q, h + 1 / 3);
			g = frycAPI.hue_to_rgb(p, q, h);
			b = frycAPI.hue_to_rgb(p, q, h - 1 / 3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}, // const [r, g, b] = frycAPI.hsl_to_rgb(h, s, l);
	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   {number}  r       The red color value
	 * @param   {number}  g       The green color value
	 * @param   {number}  b       The blue color value
	 * @return  {Array}           The HSL representation
	*/
	rgb_to_hsl(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		const vmax = Math.max(r, g, b), vmin = Math.min(r, g, b);
		let h, s, l = (vmax + vmin) / 2; // eslint-disable-line prefer-const

		if (vmax === vmin) {
			return [0, 0, l]; // achromatic
		}

		const d = vmax - vmin;
		s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin); // eslint-disable-line prefer-const
		if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0);
		if (vmax === g) h = (b - r) / d + 2;
		if (vmax === b) h = (r - g) / d + 4;
		h /= 6;

		return [h, s, l];
	}, // const [h, s, l] = frycAPI.hsl_to_rgb(r, g, b);
	hex_to_rgb(hex) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return [r, g, b];
	}, // const [r, g, b] = frycAPI.hex_to_rgb("#123456");
	rgb_to_hex(r, g, b) {
		return `#${r.hex}${g.hex}${b.hex}`;
	}, // const hex = frycAPI.rgb_to_hex(1, 2, 3);
	get_good_text_color(background_color, color_format = "hex") { // see https://math.hws.edu/graphicsbook/demos/c2/rgb-hsv.html for good example usage
		let r, g, b;
		if (color_format === "hex") {
			[r, g, b] = frycAPI.hex_to_rgb(background_color);
		} else if (color_format === "rgbInt") {
			[r, g, b] = background_color;
		} else {
			throw new Error(`Invalid color_format: ${color_format}`);
		}
		r /= 255;
		g /= 255;
		b /= 255;
		const war = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b) > 0.5;
		return war ? "#000000" : "#ffffff";
	}, // const goodTextColor = frycAPI.get_good_text_color("#123456");
	unblock_images_on_this_tab() {
		return frycAPI.send_event_to_background("unblockImagesOnThisTab");
	}, // await frycAPI.unblock_images_on_this_tab();
	connect_claude_bridge() { // Connects the extension to chrome_bridge.py, so Claude can inspect pages. Rejects when the server is not running
		return frycAPI.send_event_to_background("connectCdpBridge");
	}, // await frycAPI.connect_claude_bridge();
	get_avatar_replacement_css_on_github(user_id, image_url) {
		return /*css*/`
			img:is([alt="Avatar for ${user_id}"],[alt="@${user_id}"],[alt="${user_id}"],[alt="View ${user_id}'s full-sized avatar"]),
			body:has(nav[aria-label="Breadcrumbs"] [href="/${user_id}"]) [alt="Owner avatar"],
			a[href="/${user_id}"] > img[data-component="Avatar"],
			img[alt="author"]:has(+ [data-inline="true"][title="${user_id}"]) {
				content: url("${image_url}");
			}
		`;
	}, // frycAPI.get_avatar_replacement_css_on_github("userID", "imageURL");
	print_table(arr2d = [["Hello", "world!"], ["world!", "Hello"]], joiner = ",", pad = true, print = true) {
		const row_count = arr2d.length;
		if (!row_count) {
			if (print) loguj("");
			return "";
		}
		const col_count = arr2d[0].length;
		if (!col_count) {
			if (print) loguj("");
			return "";
		}
		const col_len = new Array(col_count).fill(0);
		const temp_arr = new Array(row_count);
		for (let i = 0; i < row_count; i++) {
			temp_arr[i] = new Array(col_count);
			for (let j = 0; j < col_count; j++) {
				const new_val = arr2d[i][j].toString();
				temp_arr[i][j] = new_val;
				if (col_len[j] < new_val.length) {
					col_len[j] = new_val.length;
				}
			}
		}
		const out_str = temp_arr.map(row => row.map((el, j) => (pad ? el.padEnd(col_len[j]) : el)).join(joiner)).join("\n");
		if (print) loguj(out_str);
		return out_str;
	}, // frycAPI.print_table();
	create_times_that_create_men(hard = "hard", strong = "strong", good = "good", weak = "weak", times = "times", men = "men", create = "create") {
		hard   = hard.toLocaleLowerCase();
		strong = strong.toLocaleLowerCase();
		good   = good.toLocaleLowerCase();
		weak   = weak.toLocaleLowerCase();
		times  = times.toLocaleLowerCase();
		men    = men.toLocaleLowerCase();
		create = create.toLocaleLowerCase();
		loguj(`${hard.frycAPI_to_title_case()} ${times} ${create} ${strong} ${men}.\n${strong.frycAPI_to_title_case()} ${men} ${create} ${good} ${times}.\n${good.frycAPI_to_title_case()} ${times} ${create} ${weak} ${men}.\n${weak.frycAPI_to_title_case()} ${men} ${create} ${hard} ${times}.`);
	}, // frycAPI.create_times_that_create_men("sus", "impostor", "kill", "vent");
	filled_array(value, length) {
		return Array(length).fill(value);
	}, // frycAPI.filled_array(1, 5);
	read_file_xml_http_request(url, callback) {
		const xhr = new XMLHttpRequest();

		xhr.open("GET", url, true);

		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				callback(null, xhr.responseText);
			} else {
				callback(new Error("HTTP " + xhr.status), null);
			}
		};

		xhr.onerror = function () {
			callback(new Error("Network error"), null);
		};

		xhr.send();
	}, // frycAPI.read_file_xml_http_request("https://example.com/file.txt", function (error, text) { if (error) { console.error(error); return } console.log(text) });
	iframe_looks_loaded(iframe) {
		const doc = iframe?.contentDocument;
		if (!doc) return null; // cross-origin: unknown
		const src = iframe.getAttribute("src");
		const is_initial_blank = doc.URL === "about:blank" && src && src !== "about:blank";
		return !is_initial_blank && doc.readyState === "complete";
	}, // frycAPI.iframe_looks_loaded(iframe);
	iframe_has_real_document(iframe) {
		const doc = iframe?.contentDocument;
		if (!doc) return null; // cross-origin: unknown
		const src = iframe.getAttribute("src");
		const is_initial_blank = doc.URL === "about:blank" && src && src !== "about:blank";
		return !is_initial_blank && Boolean(doc.documentElement);
	}, // frycAPI.iframe_has_real_document(iframe);
	template() {
	}, // frycAPI.template();
	// #region //* Funkcje 5
	// #endregion
	// #endregion
};
// #region //* Rest
frycAPI.second =                  1000;
frycAPI.minute = frycAPI.second *   60;
frycAPI.hour   = frycAPI.minute *   60;
frycAPI.day    = frycAPI.hour   *   24;
frycAPI.month  = frycAPI.day    *   30;
frycAPI.year   = frycAPI.day    *  365;
frycAPI.week   = frycAPI.day    *    7;
frycAPI.week_days = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];
frycAPI.week_days_reverse = {
	sunday   : 0,
	monday   : 1,
	tuesday  : 2,
	wednesday: 3,
	thursday : 4,
	friday   : 5,
	saturday : 6,
};
frycAPI.date_formatter = frycAPI.get_date_formatter({ second: undefined });
frycAPI.date_formatter_for_file_name = frycAPI.get_date_formatter();
frycAPI.date_opts_no_time = { print_date: frycAPI.get_date_formatter({ year: "numeric", month: "2-digit", day: "2-digit", default_undef: 1 }) };
// #region //* frycAPI.create_html
try {
	if (!frycAPI_host("teams.microsoft.com", "vscode.dev") && window.trustedTypes?.createPolicy) {
		frycAPI.escape_html_policy = trustedTypes.createPolicy("safeInnerHtml", {
			create_html: str => str,
		});
		frycAPI.create_html = str => frycAPI.escape_html_policy.create_html(str);
	} else {
		throw new Error("Wystąpił błąd");
	}
} catch (e) {
	frycAPI.create_html = str => str;
}
// #endregion
// #endregion
// #endregion

// #region //* IFs  1
if (1) { //* Global functions
	// frycAPI.inject_style_on_load(/*css*/`
	// 	* {
	// 		tab-size: 3 !important;
	// 	}
	// `, { elevated: true, allFrames: true });

	/* Manual Functions Update Showcase
	frycAPI.create_manual_functions("Testowe funkcje", {
		func_arr: [
			(name = "Radio", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				// f.name = `<img src="${frycAPI.get_res_url("ORACLE.png")}">Normal`;
				// f.name = `<img src="${frycAPI.get_res_url("sussy.gif")}">Normal<img src="${frycAPI.get_res_url("sussy.gif")}">`;
				f.callback = function (obj) {
					// loguj(obj);
					// f.next_func.toggle();
					const radio = f.next_func;
					if (obj.type === "name") {
						if (radio.num_states > 2) {
							radio.set_state_desc(radio.state_desc.slice(0, -1));
						}
					} else if (obj.type === "elem") {
						radio.set_state_desc([...radio.state_desc, radio.num_states + 1]);
					}
				};
				return f;
			},
			(name = "Radio", type = frycAPI_Radio) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.set_num_cols(3);
				f.set_state_desc(frycAPI.array_one_to_n(12));
				f.callback = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "Checkbox", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.callback = function (obj) {
					const radio = f.next_func;
					if (obj.type === "name") {
						if (radio.num_states > 2) {
							radio.set_state_desc(radio.state_desc.slice(0, -1));
						}
					} else if (obj.type === "elem") {
						radio.set_state_desc([...radio.state_desc, radio.num_states + 1]);
					}
				};
				return f;
			},
			(name = "Checkbox", type = frycAPI_Checkbox) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.set_num_rows(3);
				f.set_state_desc(frycAPI.array_one_to_n(12));
				f.callback = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "State", type = frycAPI_Pure_state) => {
				const f = new type({ name });
				// f.fix_general_state = () => {};
				f.display_name = 1;
				f.name_clickable = 1;
				f.set_state_desc(["1", "2", "3"]);
				f.callback = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "Combo", type = frycAPI_Combo) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.set_state_desc(frycAPI.array_one_to_n(5));
				f.callback = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "Input", type = frycAPI_Input) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.callback = function (obj) {
					loguj(obj);
				};
				return f;
			},
		],
	});
	*/

	// Run script passed as URL param
	const filenames = frycAPI.website_url.searchParams.get("frycAPI-run-script");
	if (filenames) {
		for (const filename of filenames.split(";")) {
			frycAPI.run_res_script(filename);
		}
	}

	frycAPI.create_manual_functions("Global functions", {
		func_arr: [
			(name = "Edit Script", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.additional_action = { name: "close" };
				f.callback = function (obj) {
					frycAPI.send_message_to_ahk("Open frycAPI.js", (frycAPI.line ?? "999999999") + " " + frycAPI_host());
				};
				return f;
			},
			(name = "Style", type = frycAPI_Pure_state) => {
				const f = new type({ name });
				frycAPI.my_style_manual_func = f;
				f.callback = function (obj) {
					if (frycAPI.my_style_state) {
						frycAPI.my_style_state.toggle();
						frycAPI.set_storage("style", frycAPI.my_style_state.state);
					}
				};
				return f;
			},
			(name = "Time format", type = frycAPI_Radio) => {
				const f = new type({ name });
				f.set_display_name("Time:");
				f.set_num_cols(2);
				f.set_state_desc(["Relative", "Absolute", "Both"]);
				f.set_state(0);
				f.name_clickable = 1;
				frycAPI.set_default_date_enum.manual_func_ref = f;
				f.callback = function (obj) {
					if (!f.state_changed) return;
					switch (obj.state ?? frycAPI.set_default_date_enum.default_date_mode) {
						case 0: return frycAPI.set_default_date_enum.mode.relatywny_czas(undefined, true);
						case 1: return frycAPI.set_default_date_enum.mode.absolutny_czas(undefined, true);
						case 2: return frycAPI.set_default_date_enum.mode.oba(undefined, true);
					}
				};
				return f;
			},
			(name = "Connect claude bridge", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = async function (obj) {
					f.name = await frycAPI.connect_claude_bridge();
				};
				return f;
			},
		],
	});
	const grid_normal = {
		"copy host": (obj, f) => {
			frycAPI.ctrl_c(frycAPI_host());
		},
		"copy decoded url": (obj, f) => {
			frycAPI.ctrl_c(decodeURI(location.href));
		},
		"copy base url": (obj, f) => {
			frycAPI.ctrl_c(location.origin);
		},
		"ඞ": (obj, f) => {
			frycAPI.for_each(`*`, da_elem => {
				if (da_elem.nodeName !== "STYLE" && da_elem.nodeName !== "SCRIPT" && da_elem.nodeName !== "NOSCRIPT") {
					da_elem.childNodes.forEach(child => {
						if (child.nodeType === Node.TEXT_NODE) {
							child.nodeValue = "ඞ";
						}
					});
				}
			});
		},
		"make headings clickable": (obj, f) => {
			frycAPI.for_each(`:is(h1,h2,h3,h4,h5,h6)[id]`, heading => {
				const txt = heading.innerText;
				heading.innerText = "";
				heading.appendChild(frycAPI.elem("a").attr("href", location.origin + location.pathname + "#" + heading.id).text(txt)._);
			});
		},
	};
	frycAPI.create_manual_functions("Global grid normal", {
		func_arr: [
			(name = "Grid normal", type = frycAPI_Checkbox) => {
				const f = new type({
					name: name,
					num_cols: 3,
					default_state: true,
					state_desc: Object.keys(grid_normal),
				});
				f.callback = function (obj) {
					f.set_state(obj.index, true);
					grid_normal[f.state_desc[obj.index]](obj, f);
				};
				return f;
			},
		],
	});
}
if (1 && frycAPI_host("192.168.0.1", "192.168.1.1")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#menu a.sel span.text {
			color: #000000;
		}
	`);
	function get_table_of_devices() {
		const table = [];
		frycAPI.for_each(`tr[id^="connected-clients-grid"]`, (da_elem, da_i, da_arr) => {
			table.push([
				da_elem.frycAPI_elem_by_class("name").innerText.trim(),
				da_elem.frycAPI_elem_by_class("ip").innerText.trim(),
				da_elem.frycAPI_elem_by_class("mac").innerText.trim(),
			]);
		});
		return table;
	}
	frycAPI.create_manual_functions("Router utils", {
		func_arr: [
			(name = "Print device list as table: sort by name", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					console.table(get_table_of_devices().sort((a, b) => (a[0] > b[0] ? 1 : -1)));
				};
				return f;
			},
			(name = "Print device list as table: sort by IP", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					console.table(get_table_of_devices().sort((a, b) => (a[1] > b[1] ? 1 : -1)));
				};
				return f;
			},
		],
	});
} else if (location.origin === "file://") {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);
	frycAPI.color_scheme_dark = true;
} else if (1 && frycAPI_host_includes("fandom.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.top-ads-container,
		.top_leaderboard-odyssey-wrapper:has(> .top-ads-container) {
			display: none;
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`h2 > span.mw-headline`, span => {
			span.innerHTML = `<a href="${location.origin + location.pathname + "#" + span.id}">${span.innerText}</a>`;
		});
	});

	if (frycAPI_host("alienswarm.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			button.mojButt {
				position: fixed;
				top: 65px;
				left: 78px;
				width: 200px;
				height: 100px;
				cursor: pointer;
			}
		`);
	} else if (frycAPI_host("ark.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		// https://ark.fandom.com/wiki/ARK_Survival_Evolved_Wiki
		const funkcje = "ARK Wiki Powiększ obrazki";
		frycAPI.inject_style_on_load(/*css*/`
			.info-framework {
				background-color: hsl(208 100% 94% / 1);
			}
			tr[style*="background"]>td {
				filter: brightness(0);
			}

			img[src].bylem {
				border: 1px solid red;
			}
			img[src].zmienione {
				border: 1px solid green;
			}

			.theme-fandomdesktop-light .cell-green {
				background-color: hsl(120 73% 39% / 1) !important;
			}

			.theme-fandomdesktop-light .cell-pink {
				background-color: hsl(0 53% 43% / 1) !important;
			}

			.global-navigation span,
			.global-navigation .global-navigation__label{
				color: hsl(0 0% 58% / 1);
			}

			.global-navigation svg.wds-icon {
				fill: hsl(0 0% 58% / 1);
			}

			img[alt="Aberrant Achatina"],
			img[alt="Aberrant Anglerfish"],
			img[alt="Aberrant Ankylosaurus"],
			img[alt="Aberrant Araneo"],
			img[alt="Aberrant Arthropluera"],
			img[alt="Aberrant Baryonyx"],
			img[alt="Aberrant Beelzebufo"],
			img[alt="Aberrant Carbonemys"],
			img[alt="Aberrant Carnotaurus"],
			img[alt="Aberrant Cnidaria"],
			img[alt="Aberrant Coelacanth"],
			img[alt="Aberrant Dimetrodon"],
			img[alt="Aberrant Dimorphodon"],
			img[alt="Aberrant Diplocaulus"],
			img[alt="Aberrant Diplodocus"],
			img[alt="Aberrant Dire Bear"],
			img[alt="Aberrant Dodo"],
			img[alt="Aberrant Doedicurus"],
			img[alt="Aberrant Dung Beetle"],
			img[alt="Aberrant Electrophorus"],
			img[alt="Aberrant Equus"],
			img[alt="Aberrant Gigantopithecus"],
			img[alt="Aberrant Iguanodon"],
			img[alt="Aberrant Lystrosaurus"],
			img[alt="Aberrant Manta"],
			img[alt="Aberrant Megalania"],
			img[alt="Aberrant Megalosaurus"],
			img[alt="Aberrant Meganeura"],
			img[alt="Aberrant Moschops"],
			img[alt="Aberrant Otter"],
			img[alt="Aberrant Ovis"],
			img[alt="Aberrant Paraceratherium"],
			img[alt="Aberrant Parasaur"],
			img[alt="Aberrant Piranha"],
			img[alt="Aberrant Pulmonoscorpius"],
			img[alt="Aberrant Purlovia"],
			img[alt="Aberrant Raptor"],
			img[alt="Aberrant Salmon"],
			img[alt="Aberrant Sarco"],
			img[alt="Aberrant Spino"],
			img[alt="Aberrant Stegosaurus"],
			img[alt="Aberrant Titanoboa"],
			img[alt="Aberrant Triceratops"],
			img[alt="Aberrant Trilobite"],
			img[alt="Achatina"],
			img[alt="Archa"],
			img[alt="Carno"],
			img[alt="Stego"],
			img[alt="Trike"],
			img[alt="Turkey"],
			img[alt="Acrocanthosaurus"],
			img[alt="Allosaurus"],
			img[alt="Alpha Basilisk"],
			img[alt="Alpha Blood Crystal Wyvern"],
			img[alt="Alpha Carnotaurus"],
			img[alt="Alpha Corrupted Master Controller"],
			img[alt="Alpha Creatures"],
			img[alt="Alpha Deathworm"],
			img[alt="Alpha Fire Wyvern"],
			img[alt="Alpha Karkinos"],
			img[alt="Alpha King Titan"],
			img[alt="Alpha Leedsichthys"],
			img[alt="Alpha Megalodon"],
			img[alt="Alpha Moeder, Master of the Ocean"],
			img[alt="Alpha Mosasaur"],
			img[alt="Alpha Raptor"],
			img[alt="Alpha Surface Reaper King"],
			img[alt="Alpha T-Rex"],
			img[alt="Alpha Tusoteuthis"],
			img[alt="Alpha X-Triceratops"],
			img[alt="Amargasaurus"],
			img[alt="Ammonite"],
			img[alt="Andrewsarchus"],
			img[alt="Anglerfish"],
			img[alt="Ankylosaurus"],
			img[alt="Araneo"],
			img[alt="Archaeopteryx"],
			img[alt="Argentavis"],
			img[alt="Argentustus"],
			img[alt="Mod:ARK Additions/Deinotherium"],
			img[alt="Arthropluera"],
			img[alt="Astrocetus"],
			img[alt="Astrodelphis"],
			img[alt="Attack Drone"],
			img[alt="Aurochs"],
			img[alt="Baryonyx"],
			img[alt="Basilisk"],
			img[alt="Basilisk Ghost"],
			img[alt="Basilosaurus"],
			img[alt="Beelzebufo"],
			img[alt="Beelzemorbus"],
			img[alt="Beta Corrupted Master Controller"],
			img[alt="Beta King Titan"],
			img[alt="Beta Moeder, Master of the Ocean"],
			img[alt="Blood Crystal Wyvern"],
			img[alt="Bloodstalker"],
			img[alt="Bone Fire Wyvern"],
			img[alt="Brontosaurus"],
			img[alt="Broodgenetrix"],
			img[alt="Broodmother Lysrix"],
			img[alt="Broodmother Lysrix (Alpha)"],
			img[alt="Broodmother Lysrix (Beta)"],
			img[alt="Broodmother Lysrix (Gamma)"],
			img[alt="Brute Araneo"],
			img[alt="Brute Astrocetus"],
			img[alt="Brute Basilosaurus"],
			img[alt="Brute Bloodstalker"],
			img[alt="Brute Ferox"],
			img[alt="Brute Fire Wyvern"],
			img[alt="Brute Leedsichthys"],
			img[alt="Brute Magmasaur"],
			img[alt="Brute Malfunctioned Tek Giganotosaurus"],
			img[alt="Brute Malfunctioned Tek Rex"],
			img[alt="Brute Mammoth"],
			img[alt="Brute Megaloceros"],
			img[alt="Brute Plesiosaur"],
			img[alt="Brute Reaper King"],
			img[alt="Brute Sarco"],
			img[alt="Brute Seeker"],
			img[alt="Brute Tusoteuthis"],
			img[alt="Brute X-Allosaurus"],
			img[alt="Brute X-Megalodon"],
			img[alt="Brute X-Mosasaurus"],
			img[alt="Brute X-Raptor"],
			img[alt="Brute X-Rex"],
			img[alt="Brute X-Rock Elemental"],
			img[alt="Brute X-Spino"],
			img[alt="Brute X-Yutyrannus"],
			img[alt="Bulbdog"],
			img[alt="Bulbdog Ghost"],
			img[alt="Bunny Dodo"],
			img[alt="Bunny Oviraptor"],
			img[alt="Carbonemys"],
			img[alt="Carcharodontosaurus"],
			img[alt="Carnotaurus"],
			img[alt="Castoroides"],
			img[alt="Chalicotherium"],
			img[alt="Chalk Golem"],
			img[alt="Cnidaria"],
			img[alt="Coelacanth"],
			img[alt="Compy"],
			img[alt="Corrupted Arthropluera"],
			img[alt="Corrupted Avatar"],
			img[alt="Corrupted Carnotaurus"],
			img[alt="Corrupted Chalicotherium"],
			img[alt="Corrupted Dilophosaur"],
			img[alt="Corrupted Dimorphodon"],
			img[alt="Corrupted Giganotosaurus"],
			img[alt="Corrupted Master Controller"],
			img[alt="Corrupted Paraceratherium"],
			img[alt="Corrupted Pteranodon"],
			img[alt="Corrupted Raptor"],
			img[alt="Corrupted Reaper King"],
			img[alt="Corrupted Rex"],
			img[alt="Corrupted Rock Drake"],
			img[alt="Corrupted Spino"],
			img[alt="Corrupted Stegosaurus"],
			img[alt="Corrupted Survivor"],
			img[alt="Corrupted Triceratops"],
			img[alt="Corrupted Wyvern"],
			img[alt="Crystal Wyvern"],
			img[alt="Crystal Wyvern Queen"],
			img[alt="Crystal Wyvern Queen (Alpha)"],
			img[alt="Crystal Wyvern Queen (Beta)"],
			img[alt="Crystal Wyvern Queen (Gamma)"],
			img[alt="Cubozoa Multis"],
			img[alt="Daeodon"],
			img[alt="Deathworm"],
			img[alt="Defense Unit"],
			img[alt="Deinonychus"],
			img[alt="Desert Titan"],
			img[alt="Desert Titan Flock"],
			img[alt="Desmodus"],
			img[alt="Dilophosaur"],
			img[alt="Dilophosaurus"],
			img[alt="Dimetrodon"],
			img[alt="Dimorphodon"],
			img[alt="Dinopithecus King (Alpha)"],
			img[alt="Dinopithecus King (Beta)"],
			img[alt="Dinopithecus King (Gamma)"],
			img[alt="Diplocaulus"],
			img[alt="Diplodocus"],
			img[alt="Dire Bear"],
			img[alt="Dire Polar Bear"],
			img[alt="Direwolf"],
			img[alt="Direwolf Ghost"],
			img[alt="Diseased Leech"],
			img[alt="Dodo"],
			img[alt="Dodo Wyvern"],
			img[alt="Dodobitus"],
			img[alt="DodoRex"],
			img[alt="Doedicurus"],
			img[alt="Doedicurus Vastus"],
			img[alt="Dragon"],
			img[alt="Dragon (Alpha)"],
			img[alt="Dragon (Beta)"],
			img[alt="Dragon (Gamma)"],
			img[alt="Dung Beetle"],
			img[alt="Dunkleosteus"],
			img[alt="Eel Minion"],
			img[alt="Eerie Achatina"],
			img[alt="Eerie Allosaurus"],
			img[alt="Eerie Alpha Carno"],
			img[alt="Eerie Alpha Mosasaur"],
			img[alt="Eerie Alpha Raptor"],
			img[alt="Eerie Alpha T-Rex"],
			img[alt="Eerie Ammonite"],
			img[alt="Eerie Angler"],
			img[alt="Eerie Ankylo"],
			img[alt="Eerie Araneo"],
			img[alt="Eerie Archaeopteryx"],
			img[alt="Eerie Argentavis"],
			img[alt="Eerie Arthropluera"],
			img[alt="Eerie Baryonyx"],
			img[alt="Eerie Basilosaurus"],
			img[alt="Eerie Beelzebufo"],
			img[alt="Eerie Bronto"],
			img[alt="Eerie Carbonemys"],
			img[alt="Eerie Carno"],
			img[alt="Eerie Castoroides"],
			img[alt="Eerie Chalicotherium"],
			img[alt="Eerie Coelacanth"],
			img[alt="Eerie Compy"],
			img[alt="Eerie Daeodon"],
			img[alt="Eerie Dilophosaurus"],
			img[alt="Eerie Dimetrodon"],
			img[alt="Eerie Dimorphodon"],
			img[alt="Eerie Diplocaulus"],
			img[alt="Eerie Diplodocus"],
			img[alt="Eerie Dire Bear"],
			img[alt="Eerie Dire Wolf"],
			img[alt="Eerie Diseased Leech"],
			img[alt="Eerie Dodo"],
			img[alt="Eerie Doedicurus"],
			img[alt="Eerie Dung Beetle"],
			img[alt="Eerie Dunkleosteus"],
			img[alt="Eerie Equus"],
			img[alt="Eerie Eurypterid"],
			img[alt="Eerie Gallimimus"],
			img[alt="Eerie Giganotosaurus"],
			img[alt="Eerie Gigantopithecus"],
			img[alt="Eerie Griffin"],
			img[alt="Eerie Ichthyosaurus"],
			img[alt="Eerie Iguanodon"],
			img[alt="Eerie Jerboa"],
			img[alt="Eerie Kairuku"],
			img[alt="Eerie Kaprosuchus"],
			img[alt="Eerie Leech"],
			img[alt="Eerie Leedsichthys"],
			img[alt="Eerie Liopleurodon"],
			img[alt="Eerie Lystrosaurus"],
			img[alt="Eerie Mammoth"],
			img[alt="Eerie Manta"],
			img[alt="Eerie Megaloceros"],
			img[alt="Eerie Megalodon"],
			img[alt="Eerie Megalosaurus"],
			img[alt="Eerie Meganeura"],
			img[alt="Eerie Megapiranha"],
			img[alt="Eerie Megatherium"],
			img[alt="Eerie Mesopithecus"],
			img[alt="Eerie Mosasaur"],
			img[alt="Eerie Moschops"],
			img[alt="Eerie Onyc"],
			img[alt="Eerie Otter"],
			img[alt="Eerie Oviraptor"],
			img[alt="Eerie Pachy"],
			img[alt="Eerie Pachyrhinosaurus"],
			img[alt="Eerie Parasaur"],
			img[alt="Eerie Pegomastax"],
			img[alt="Eerie Pelagornis"],
			img[alt="Eerie Phiomia"],
			img[alt="Eerie Plesiosaur"],
			img[alt="Eerie Procoptodon"],
			img[alt="Eerie Pteranodon"],
			img[alt="Eerie Pulmonoscorpius"],
			img[alt="Eerie Purlovia"],
			img[alt="Eerie Quetzal"],
			img[alt="Eerie Raptor"],
			img[alt="Eerie Rex"],
			img[alt="Eerie Sabertooth"],
			img[alt="Eerie Sabertooth Salmon"],
			img[alt="Eerie Sarco"],
			img[alt="Eerie Spino"],
			img[alt="Eerie Stego"],
			img[alt="Eerie Tapejara"],
			img[alt="Eerie Terror Bird"],
			img[alt="Eerie Therizinosaur"],
			img[alt="Eerie Titanoboa"],
			img[alt="Eerie Titanomyrma Drone"],
			img[alt="Eerie Titanomyrma Soldier"],
			img[alt="Eerie Titanosaur"],
			img[alt="Eerie Triceratops"],
			img[alt="Eerie Trilobite"],
			img[alt="Eerie Troodon"],
			img[alt="Eerie Tusoteuthis"],
			img[alt="Eerie Woolly Rhinoceros"],
			img[alt="Eerie Yeti"],
			img[alt="Electrophorus"],
			img[alt="Elemental Reaper King"],
			img[alt="Ember Crystal Wyvern"],
			img[alt="Enforcer"],
			img[alt="Enraged Corrupted Rex"],
			img[alt="Enraged Triceratops"],
			img[alt="Equus"],
			img[alt="Eurypterid"],
			img[alt="Exo-Mek"],
			img[alt="Experimental Giganotosaurus"],
			img[alt="Featherlight"],
			img[alt="Fenrir"],
			img[alt="Ferox"],
			img[alt="Ferox (Large)"],
			img[alt="Fire Wyvern"],
			img[alt="Fjordhawk"],
			img[alt="Forest Titan"],
			img[alt="Forest Wyvern"],
			img[alt="Gacha"],
			img[alt="GachaClaus"],
			img[alt="Gallimimus"],
			img[alt="Gamma Corrupted Master Controller"],
			img[alt="Gamma King Titan"],
			img[alt="Gamma Moeder, Master of the Ocean"],
			img[alt="Gasbags"],
			img[alt="Giant Bee"],
			img[alt="Giant Monarch Butterfly"],
			img[alt="Giant Queen Bee"],
			img[alt="Giant Worker Bee"],
			img[alt="Giganotosaurus"],
			img[alt="Gigantopithecus"],
			img[alt="Glowbug"],
			img[alt="Glowtail"],
			img[alt="Golden Striped Brute Megalodon"],
			img[alt="Golden Striped Megalodon"],
			img[alt="Griffin"],
			img[alt="Gula Beetle"],
			img[alt="Hesperornis"],
			img[alt="Human"],
			img[alt="Hyaenodon"],
			img[alt="Ice Golem"],
			img[alt="Ice Titan"],
			img[alt="Ice Wyvern"],
			img[alt="Iceworm Male"],
			img[alt="Iceworm Queen"],
			img[alt="Ichthyornis"],
			img[alt="Ichthyosaurus"],
			img[alt="Iguanodon"],
			img[alt="Injured Brute Reaper King"],
			img[alt="Insect Swarm"],
			img[alt="Jerboa"],
			img[alt="Jug Bug"],
			img[alt="Kairuku"],
			img[alt="Kaprosuchus"],
			img[alt="Karkinos"],
			img[alt="Kentrosaurus"],
			img[alt="King Titan"],
			img[alt="Lamprey"],
			img[alt="Lava Elemental"],
			img[alt="Leech"],
			img[alt="Leedsichthys"],
			img[alt="Lightning Wyvern"],
			img[alt="Liopleurodon"],
			img[alt="Lymantria"],
			img[alt="Lystrosaurus"],
			img[alt="Macro-Summoner"],
			img[alt="Macrophage"],
			img[alt="Maewing"],
			img[alt="Magmasaur"],
			img[alt="Malfunctioned Attack Drone"],
			img[alt="Malfunctioned Defense Unit"],
			img[alt="Malfunctioned Enforcer"],
			img[alt="Malfunctioned Mek Knight"],
			img[alt="Malfunctioned Tek Giganotosaurus"],
			img[alt="Malfunctioned Tek Parasaur"],
			img[alt="Malfunctioned Tek Quetzal"],
			img[alt="Malfunctioned Tek Raptor"],
			img[alt="Malfunctioned Tek Rex"],
			img[alt="Malfunctioned Tek Stegosaurus"],
			img[alt="Malfunctioned Tek Stryder"],
			img[alt="Malfunctioned Tek Triceratops"],
			img[alt="Mammoth"],
			img[alt="Managarmr"],
			img[alt="Manta"],
			img[alt="Manticore"],
			img[alt="Manticore (Alpha)"],
			img[alt="Manticore (Beta)"],
			img[alt="Manticore (Gamma)"],
			img[alt="Mantis"],
			img[alt="Mantis Ghost"],
			img[alt="Mega Mek"],
			img[alt="Megacerops"],
			img[alt="Megachelon"],
			img[alt="Megalania"],
			img[alt="Megaloceros"],
			img[alt="Megalodon"],
			img[alt="Megalosaurus"],
			img[alt="Meganeura"],
			img[alt="Megapithecus"],
			img[alt="Megapithecus (Alpha)"],
			img[alt="Megapithecus (Beta)"],
			img[alt="Megapithecus (Gamma)"],
			img[alt="Megapithecus Pestis"],
			img[alt="Megatherium"],
			img[alt="Mek"],
			img[alt="Mesopithecus"],
			img[alt="Microraptor"],
			img[alt="Moeder, Master of the Ocean"],
			img[alt="Morellatops"],
			img[alt="Mosasaurus"],
			img[alt="Moschops"],
			img[alt="Nameless"],
			img[alt="Noctis"],
			img[alt="Noglin"],
			img[alt="Obsidioequus"],
			img[alt="Oil Jug Bug"],
			img[alt="Onyc"],
			img[alt="Otter"],
			img[alt="Overseer"],
			img[alt="Overseer (Alpha)"],
			img[alt="Overseer (Beta)"],
			img[alt="Overseer (Gamma)"],
			img[alt="Oviraptor"],
			img[alt="Ovis"],
			img[alt="Pachy"],
			img[alt="Pachyrhinosaurus"],
			img[alt="Paraceratherium"],
			img[alt="Parakeet Fish School"],
			img[alt="Parasaur"],
			img[alt="Party Dodo"],
			img[alt="Pegomastax"],
			img[alt="Pelagornis"],
			img[alt="Phiomia"],
			img[alt="Phoenix"],
			img[alt="Piranha"],
			img[alt="Plesiosaur"],
			img[alt="Poison Wyvern"],
			img[alt="Polar Bear"],
			img[alt="Polar Purlovia"],
			img[alt="Procoptodon"],
			img[alt="Pteranodon"],
			img[alt="Pulmonoscorpius"],
			img[alt="Purlovia"],
			img[alt="Quetzal"],
			img[alt="R-Allosaurus"],
			img[alt="R-Brontosaurus"],
			img[alt="R-Carbonemys"],
			img[alt="R-Carnotaurus"],
			img[alt="R-Daeodon"],
			img[alt="R-Dilophosaur"],
			img[alt="R-Direwolf"],
			img[alt="R-Equus"],
			img[alt="R-Gasbags"],
			img[alt="R-Giganotosaurus"],
			img[alt="R-Megatherium"],
			img[alt="R-Parasaur"],
			img[alt="R-Procoptodon"],
			img[alt="R-Quetzal"],
			img[alt="R-Reaper King"],
			img[alt="R-Reaper Queen"],
			img[alt="R-Snow Owl"],
			img[alt="R-Thylacoleo"],
			img[alt="R-Velonasaur"],
			img[alt="Raptor"],
			img[alt="Rare X-Sabertooth Salmon"],
			img[alt="Ravager"],
			img[alt="Reaper"],
			img[alt="Reaper King"],
			img[alt="Reaper Prince"],
			img[alt="Reaper Queen"],
			img[alt="Rex"],
			img[alt="Rex Ghost"],
			img[alt="Rock Drake"],
			img[alt="Rock Elemental"],
			img[alt="Rockwell"],
			img[alt="Rockwell (Alpha)"],
			img[alt="Rockwell (Beta)"],
			img[alt="Rockwell (Gamma)"],
			img[alt="Rockwell Node"],
			img[alt="Rockwell Node (Alpha)"],
			img[alt="Rockwell Node (Beta)"],
			img[alt="Rockwell Node (Gamma)"],
			img[alt="Rockwell Prime"],
			img[alt="Rockwell Prime (Alpha)"],
			img[alt="Rockwell Prime (Beta)"],
			img[alt="Rockwell Prime (Gamma)"],
			img[alt="Roll Rat"],
			img[alt="Royal Griffin"],
			img[alt="Rubble Golem"],
			img[alt="Sabertooth"],
			img[alt="Sabertooth Salmon"],
			img[alt="Sarco"],
			img[alt="Scout"],
			img[alt="Seeker"],
			img[alt="Shadowmane"],
			img[alt="Shinehorn"],
			img[alt="Skeletal Bronto"],
			img[alt="Skeletal Carnotaurus"],
			img[alt="Skeletal Giganotosaurus"],
			img[alt="Skeletal Jerboa"],
			img[alt="Skeletal Quetzal"],
			img[alt="Skeletal Raptor"],
			img[alt="Skeletal Rex"],
			img[alt="Skeletal Stego"],
			img[alt="Skeletal Trike"],
			img[alt="Snow Owl"],
			img[alt="Snow Owl Ghost"],
			img[alt="Spino"],
			img[alt="Spirit Dire Bear"],
			img[alt="Spirit Direwolf"],
			img[alt="Stegosaurus"],
			img[alt="Subterranean Reaper King"],
			img[alt="Summoner"],
			img[alt="Super Turkey"],
			img[alt="Surface Reaper King"],
			img[alt="Surface Reaper King Ghost"],
			img[alt="Tapejara"],
			img[alt="Tek Parasaur"],
			img[alt="Tek Quetzal"],
			img[alt="Tek Raptor"],
			img[alt="Tek Rex"],
			img[alt="Tek Stegosaurus"],
			img[alt="Tek Stryder"],
			img[alt="Tek Triceratops"],
			img[alt="TekRaptor"],
			img[alt="Terror Bird"],
			img[alt="Therizinosaur"],
			img[alt="Thorny Dragon"],
			img[alt="Thylacoleo"],
			img[alt="Titanoboa"],
			img[alt="Titanomyrma"],
			img[alt="Titanomyrma Drone"],
			img[alt="Titanomyrma Soldier"],
			img[alt="Titanosaur"],
			img[alt="Triceratops"],
			img[alt="Trilobite"],
			img[alt="Troodon"],
			img[alt="Tropeognathus"],
			img[alt="Tropical Crystal Wyvern"],
			img[alt="Tusoteuthis"],
			img[alt="Unicorn"],
			img[alt="Velonasaur"],
			img[alt="Voidwyrm"],
			img[alt="VR Allosaurus"],
			img[alt="VR Araneo"],
			img[alt="VR Argentavis"],
			img[alt="VR Astrodelphis"],
			img[alt="VR Bloodstalker"],
			img[alt="VR Carnotaurus"],
			img[alt="VR Chalicotherium"],
			img[alt="VR Dilophosaur"],
			img[alt="VR Dimorphodon"],
			img[alt="VR Enforcer"],
			img[alt="VR Ferox"],
			img[alt="VR Kaprosuchus"],
			img[alt="VR Karkinos"],
			img[alt="VR Lymantria"],
			img[alt="VR Mantis"],
			img[alt="VR Megalania"],
			img[alt="VR Megatherium"],
			img[alt="VR Onyc"],
			img[alt="VR Pachy"],
			img[alt="VR Parasaur"],
			img[alt="VR Pulmonoscorpius"],
			img[alt="VR Raptor"],
			img[alt="VR Ravager"],
			img[alt="VR Rex"],
			img[alt="VR Shadowmane"],
			img[alt="VR Stegosaurus"],
			img[alt="VR Tapejara"],
			img[alt="VR Terror Bird"],
			img[alt="VR Titanoboa"],
			img[alt="VR Triceratops"],
			img[alt="VR Velonasaur"],
			img[alt="Vulture"],
			img[alt="Water Jug Bug"],
			img[alt="Woolly Rhino"],
			img[alt="Wyvern"],
			img[alt="X-Allosaurus"],
			img[alt="X-Ankylosaurus"],
			img[alt="X-Argentavis"],
			img[alt="X-Basilosaurus"],
			img[alt="X-Dunkleosteus"],
			img[alt="X-Ichthyosaurus"],
			img[alt="X-Megalodon"],
			img[alt="X-Mosasaurus"],
			img[alt="X-Otter"],
			img[alt="X-Paraceratherium"],
			img[alt="X-Parasaur"],
			img[alt="X-Raptor"],
			img[alt="X-Rex"],
			img[alt="X-Rock Elemental"],
			img[alt="X-Sabertooth"],
			img[alt="X-Sabertooth Salmon"],
			img[alt="X-Spino"],
			img[alt="X-Tapejara"],
			img[alt="X-Triceratops"],
			img[alt="X-Woolly Rhino"],
			img[alt="X-Yutyrannus"],
			img[alt="Yeti"],
			img[alt="Yutyrannus"],
			img[alt="Zombie Fire Wyvern"],
			img[alt="Zombie Lightning Wyvern"],
			img[alt="Zombie Poison Wyvern"],
			img[alt="Zombie Wyvern"],
			img[alt="Zomdodo"] {
				filter: invert(1) hue-rotate(180deg);
			}

			.info-X1-100 img{
				filter: none;
			}
		`);

		(frycAPI.before_load = function () {
			// document.addEventListener("DOMContentLoaded", function (event) {
			// 	// frycAPI.obrazekData = [];
			// 	frycAPI.obrazek_obserwer = function (myImg) {
			// 		let myImgSrc = myImg.src;
			// 		let myIndx = myImgSrc.indexOf(scale_str);
			// 		let myWidth = myImg.getAttribute("width");
			// 		// frycAPI.obrazekData.push({myIndx: myIndx, myWidth: myWidth})
			// 		if (myIndx !== -1 && myWidth !== null) {
			// 			let newSrc = myImgSrc.substr(0, myIndx + scale_str.length + 1)
			// 				+ (myWidth * 2)
			// 				+ myImgSrc.substr(myImgSrc.indexOf("?"));
			// 			if (myImgSrc !== newSrc) {
			// 				myImg.src = newSrc;
			// 				myImg.classList.add("zmienione");
			// 				// loguj("Zmieniam")
			// 			}
			// 		}
			// 	}

			// 	let scale_str = "scale-to-width-down";
			// 	let opcje = { attributes: true };
			// 	let obrazekImg = new MutationObserver((mutRec) => {
			// 		frycAPI.obrazek_obserwer(mutRec[0].target);
			// 	});
			// 	frycAPI.for_each("img[src]",function (daElem, daI, daArr) {
			// 		frycAPI.obrazek_obserwer(daElem);
			// 		obrazekImg.observe(daElem, opcje);
			// 		// loguj(daI)
			// 	});
			// 	loguj("ARK done!")
			// });

			// frycAPI.obrazekData = [];

			const scale_str = "scale-to-width-down";
			frycAPI.obrazek_obserwer = function (my_img) {
				const my_img_src = my_img.src;
				const my_indx = my_img_src.indexOf(scale_str);
				const my_width = my_img.getAttribute("width");
				// frycAPI.obrazekData.push({my_indx: my_indx, my_width: my_width})
				if (my_indx !== -1 && my_width !== null) {
					const new_src = my_img_src.substr(0, my_indx + scale_str.length + 1) +
						(my_width * 2) +
						my_img_src.substr(my_img_src.indexOf("?"));
					if (my_img_src !== new_src) {
						my_img.src = new_src;
						// my_img.classList.add("zmienione");
						// loguj("Zmieniam")
					}
				}
			};

			const opcje = { attributes: true };
			// let obrazekImg = new MutationObserver((mutRec) => {
			// 	frycAPI.obrazek_obserwer(mutRec[0].target);
			// });
			// frycAPI.obrazCount = {};
			function add_observer(da_elem) {
				frycAPI.obrazek_obserwer(da_elem);
				new MutationObserver(mut_rec => {
					frycAPI.obrazek_obserwer(mut_rec[0].target);
				}).observe(da_elem, opcje);
				// da_elem.classList.add("bylem");
				// loguj(daI)
			}
			frycAPI.body_obs = new MutationObserver(mut_rec => {
				if (!frycAPI.body_obs.hasOwnProperty("pierwszy")) {
					frycAPI.body_obs.pierwszy = 1;
					frycAPI.for_each("img[src]", function (da_elem, da_i, da_arr) {
						add_observer(da_elem);
					});
				}
				mut_rec.forEach(function (da_elem, da_i, da_arr) {
					da_elem.addedNodes.forEach(function (da_elem1, da_i1, da_arr1) {
						// loguj(da_elem1);
						if (da_elem1.nodeName === "IMG" && da_elem1.matches("img[src]")) {
							add_observer(da_elem1);
							// loguj("Nowy obraz!");
						}
					});
				});
				// loguj("Nowa rzecz!")
				// loguj("body img[src] = " + document.querySelectorAll("img[src]").length);
				// if (!frycAPI.obrazCount.hasOwnProperty("b_bodyMut")) {
				// 	frycAPI.obrazCount.b_bodyMut = document.querySelectorAll("img[src]").length;
				// }
			});

			new MutationObserver((mut_rec, doc_obs) => {
				if (document.body) {
					// loguj("documentElement img[src] = " + document.querySelectorAll("img[src]").length);
					// frycAPI.obrazCount.a_docElem = document.querySelectorAll("img[src]").length;
					frycAPI.body_obs.observe(document.body, { childList: true, subtree: true });
					doc_obs.disconnect();
				}
			}).observe(document.documentElement, { childList: true });

			loguj("ARK done!");
		})();

		frycAPI.on_load_setter(() => {
			// loguj("load img[src] = " + document.querySelectorAll("img[src]").length);
			frycAPI.body_obs.disconnect();
			// frycAPI.obrazCount.c_load = document.querySelectorAll("img[src]").length;
			// loguj(frycAPI.obrazCount);
		});
	} else if (frycAPI_host("bloons.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			img.mwe-math-fallback-image-display.mwe-math-element {
				filter: none !important;
			}
		`);
	} else if (frycAPI_host("minecraft.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			#cont {
				position: absolute;
				z-index: 9999;
				background-color: black;
				padding: 10px;
				font-family: IBM Plex Sans;
				display: flex;
			}
			#cont div {
				padding: 5px 10px;
				border: 1px solid white;
				border-left: 0px;
			}
			#licz {
				border: 1px solid white !important;
			}
		`);
	} else if (frycAPI_host("mlp.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			#ucss-code-wrapper .CodeMirror-wrap .CodeMirror-scroll {
				filter: invert(0) hue-rotate(0deg);
				background-color: white;
				color: black;
			}

			.pojemnik {
			position: absolute;
				z-index: 99999;
				height: 100vh;
				overflow-y: scroll;
				overflow-x: auto;
				background-color: white;
				width: 74vw;
				display: flex;
				flex-wrap: wrap;
			}

			.pojemnikSmall {
				display: flex;
				flex-direction: column;
			}
		`);
	} else if (frycAPI_host("satisfactory.fandom.com", "sanctum.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			img.mwe-math-fallback-image-inline {
				filter: invert(1) !important;
			}

			.resizable-container {
				max-width: 100%;
				width: calc(100% - 34px * 2);
				margin: 0 34px;
			}
		`);
	} else if (frycAPI_host("repo-2025horror.fandom.com")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			.resizable-container {
				max-width: 1600px;
			}
		`);
	}
} else if (1 && frycAPI_host_includes("wiki.gg")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#wikigg-showcase-sidebar,
		#wikigg-sl-header,
		#wikigg-showcase-header,
		#wikigg-sl-rail,
		#wikigg-sl-footer {
			display: none;
		}

	`);

	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`h2 > span.mw-headline`, span => {
			span.innerHTML = `<a href="${location.origin + location.pathname + "#" + span.id}">${span.innerText}</a>`;
		});
	});

	if (frycAPI_host("satisfactory.wiki.gg")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			/* Tymczasowe */
			tr:has([title="Equipment Workshop"]),
			tr:has([title="Build Gun"]),
			tr:has(.recipe-alternate){
				display: none;
			}
		`);
	} else if (frycAPI_host("helldivers.wiki.gg")) {
		frycAPI.line = frycAPI.get_line_number();
		frycAPI.inject_style_on_load(/*css*/`
			.myButtonWrapper {
				display: flex;
				gap: 5px;
				/* width: 110px; */
				font-size: smaller;
				.copyButton {
					cursor: pointer;
				}
				.copyButton:hover {
					color: var(--wiki-accent-color);
				}
			}
		`);

		frycAPI.on_load_setter(function () {
			if (frycAPI.path === "/wiki/Stratagems") { // https://helldivers.wiki.gg/wiki/Stratagems
				const my_butt_wrap_temp = frycAPI.elem_from_html(/*html*/`<td><div class="myButtonWrapper"></div></td>`);
				const butt_temp = frycAPI.elem_from_html(/*html*/`<div class="copyButton"></div>`);
				const arrow_to_wasd = {
					"stratagem arrow up.svg": "w",
					"stratagem arrow left.svg": "a",
					"stratagem arrow down.svg": "s",
					"stratagem arrow right.svg": "d",
				};
				frycAPI.retry_if(() => frycAPI.query_sel_ok(`.wikitable thead > tr`), 50, () => {
					frycAPI.for_each(`.wikitable`, table => {
						table.querySelector(`thead > tr`).appendChild(table.querySelector(`th:last-child`).cloneNode(1))
						.frycAPI_set_attribute("width", "30%")
						.frycAPI_set_inner_text("Copy");

						table.frycAPI_elem_by_tag("tbody").rows.forEach(row => {
							let first_child = row.firstElementChild;
							if (first_child.tagName === "TH") first_child = first_child.nextElementSibling;
							const second_child = first_child.nextElementSibling;
							const third_child = second_child.nextElementSibling;
							const my_butt_wrap = row.appendChild(my_butt_wrap_temp.cloneNode(1)).firstElementChild;
							my_butt_wrap.appendChild(butt_temp.cloneNode(1).frycAPI_set_inner_text("Image URL")).addEventListener("click", () => {
								frycAPI.copy_txt(first_child.firstElementChild.firstElementChild.src.match(/.+?\.png/)[0].replace("/thumb", ""));
							});
							my_butt_wrap.appendChild(butt_temp.cloneNode(1).frycAPI_set_inner_text("AHK code")).addEventListener("click", () => {
								frycAPI.copy_txt(`helld2("${third_child.querySelectorAll("img").map(e => arrow_to_wasd[e.alt]).join("")}",1) ; ${second_child.innerText}`);
							});
							my_butt_wrap.appendChild(butt_temp.cloneNode(1).frycAPI_set_inner_text("Delete row")).addEventListener("click", () => {
								row.remove();
							});
						});
					});
				});
			} else if (frycAPI.path === "/wiki/Demolition") { // https://helldivers.wiki.gg/wiki/Demolition
				frycAPI.for_each(".wikitable", el => {
					frycAPI.make_table_sortable(el, "tr:not(:first-child)", "td,th", "tr:first-child > :is(td,th)");
				});
			}
		}, 2);
	}
} else if (1 && frycAPI_host("apps.microsoft.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		.full-star {
			fill: #ffbf00;
			stroke: #ffbf00;
		}
	`);
} else if (1 && frycAPI_host("astronomia.zagan.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			background-image: none;
			background-color: #656565;
			color: white;
		}
	`);
} else if (1 && frycAPI_host("bcgplatinion.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.cli-barmodal-open {
			overflow: scroll;
		}
	`);
} else if (1 && frycAPI_host("blog.discord.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			filter: invert(1);
		}
		img {
			filter: invert(1) !important;
		}
	`);
} else if (0 && frycAPI_host("blog.etrapez.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("boards.4chan.org", "boards.4channel.org")) {
	frycAPI.line = frycAPI.get_line_number();
	let body_back, redi_span;
	const TRANS_TIME = 0.25; // 0.25
	if (frycAPI_host("boards.4chan.org")) {
		// body_back = "#ffe"; redi_span = "#00e";
		body_back = "#0F131E"; redi_span = "#A3A3C6";
	} else {
		// body_back = "#eef2ff"; redi_span = "#34345c";
		body_back = "#21252E"; redi_span = "#D9D5FF";
	}
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		*, #quickReply textarea {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		/* :root {
			--borderColor: hsl(215deg 56.37% 77.16%);
		}
		body {
			background: ${body_back};
		}
		blockquote span.quote {
			color: hsl(77 64% 52% / 1);
		}
		div.reply:target,
		div.reply.highlight {
			background-color: hsl(215 31% 30% / 1) !important;
		}
		s, s a:not(:hover) {
			color: #0000 !important;
		}
		div.post div.postInfo span.postNum * {
			color: #34345C !important;
		}
		table.postForm>tbody>tr>td:first-child {
			color: hsl(0 100% 65% / 1);
		}
		span.name:hover, .ukryjBar:hover ~ .postInfo span.name {
			color: hsl(149 76% 18% / 1) !important;
		}
		.ukryty span.name  {
			color: hsl(149 79% 46% / 1) !important;
		}
		.ukryty span.name:hover, .ukryty .ukryjBar:hover ~ .postInfo span.name {
			color: hsl(149 79% 36% / 1) !important;
		}
		.redditify span:hover:not(.koniec) {
			color: #d00 !important;
		}
		.redditify span.koniec {
			color: maroon;
		}
		div.post.reply:not(.ukryty):has( > div > span > span.name:hover, > .ukryjBar:hover) {
			border-color: hsl(149 76% 18% / 1) !important;
			box-shadow: 0 0 5px 0 hsl(149 76% 18% / 1);
		}
		div.post.reply:not(.ukryty):has( > div > span > span.name:hover, > .ukryjBar:hover) > .postInfo.desktop {
			border-color: hsl(149 76% 18% / 1) !important;
		} */
		:root {
			--borderColor: #687992;
			--backLink: ${redi_span};
			scroll-behavior: smooth;
		}
		body {
			background: ${body_back};
			color: white;
			transition:	scroll ${TRANS_TIME}s 0s ease-in-out;
		}
		hr {
			border-color: var(--borderColor);
		}
		blockquote span.quote {
			color: hsl(77 64% 52% / 1);
		}
		div.reply, .post.op.preview {
			background-color: #323647;
		}
		div.reply:target,
		div.reply.highlight {
			background-color: hsl(215 31% 30% / 1) !important;
		}
		s, s a:not(:hover) {
			color: #0000 !important;
		}
		a,
		.burichan_new .backlink a,
		.yotsuba_b_new .backlink a,
		.quoteLink, .quotelink {
			color: var(--backLink) !important;
		}
		div.post div.postInfo {
			& span.postNum *,
			& .postMenuBtn {
				color: var(--backLink) !important;
			}
		}
		table.postForm>tbody>tr>td:first-child {
			color: hsl(0 100% 65% / 1);
		}
		div.boardBanner {
			color: #FF7D5D;
		}
		body.yotsuba_b_new div.post.reply {

		}
		.postMessage > .myDiv > :is(.quoteLink, .quotelink),
		.deadlink,
		body[class][class][class][class] a:hover,
		.yotsuba_b_new .backlink a:hover {
			color: #FF4D25 !important;
		}
		div.post div.postInfo span.subject {
			color: #FFEFFF;
		}
		div.post div.postInfo span.nameBlock span.name {
			color: #58B37A;
		}
		span.name:hover, .ukryjBar:hover ~ .postInfo span.name {
			color: #94D6A9 !important; /* #083b21 */
		}
		.ukryty span.name  {
			color: #006711 !important;
		}
		.ukryty span.name:hover, .ukryty .ukryjBar:hover ~ .postInfo span.name {
			color: #008D44 !important;
		}
		.redditify span:hover:not(.koniec) {
			color: #FF4D25 !important;
		}
		.redditify span.koniec {
			color: #FF7D5D;
		}
		div.post.reply:has( > div > span > span.name:hover, > .ukryjBar:hover) {
			border-color: #94D6A9 !important;
			box-shadow: 0 0 5px 0 #94D6A9;
		}
		div.post.reply.ukryty:has( > div > span > span.name:hover, > .ukryjBar:hover) {
			border-color: #008D44 !important;
			box-shadow: 0 0 5px 0 #008D44;
		}
		div.post.reply:has( > div > span > span.name:hover, > .ukryjBar:hover) > .postInfo.desktop {
			border-color: #94D6A9 !important;
		}
		div.post.reply.ukryty:has( > div > span > span.name:hover, > .ukryjBar:hover) > .postInfo.desktop {
			border-color: #008D44 !important;
		}
		/* .flag {
			filter: invert(1) hue-rotate(180deg);
		} */
		.postInfo.desktop input[type="checkbox"] {
			display: none;
		}
		.postInfo.desktop {
			border-bottom: 1px solid var(--borderColor) !important;
		}
		div.reply,
		div.reply:target,
		div.reply.highlight,
		.preview {
			border: 1px solid var(--borderColor) !important;
		}
		div.post blockquote.postMessage {
			margin: 0;
			padding: 5px;
		}
		div.post blockquote.postMessage.pusty:has(>.myDiv:last-child) {
			padding: 5px 0px 0px 0;
		}
		div.post div.file {
			padding: 4px 5px 0;
		}
		div.reply {
			padding: 0 !important;
		}
		div.post div.file a.fileThumb {
			margin: 5px 5px 5px 0;
		}
		div.post div.file.image-expanded a.fileThumb {
			margin: 5px 0px 0 0;
		}
		/* CERTIFIED BRUH MOMENT
			div.post blockquote.postMessage {
				overflow: auto;
			}
			div.post div.file.image-expanded a.fileThumb {
				margin-right: 0px;
			}
			.myDiv {
				overflow: auto;
			}
		*/
		blockquote.postMessage.pusty>.post.preview.inlined {
			margin: 0px;
		}
		blockquote.postMessage>.post.preview.inlined {
			margin: 5px 0px 0px 0px;
		}
		/* blockquote.postMessage>.post.reply.preview.inlined:last-child {
			margin-bottom: 0px;
		} */
		div.sideArrows {
			margin-top: 2px;
		}
		div.postContainer,
		div.post div.file a.fileThumb,
		div.post div.file,
		div.post div.file.image-expanded a.fileThumb,
		div.post div.file .fileThumb img {
			max-width: 100% !important;
		}
		div.opContainer {
			display: flex;
		}
		div.op:not(.preview.inlined) {
			margin-top: 0;
		}
		.backlink span {
			padding-left: 3px;
		}
		.compact .thread {
			max-width: 75vw;
		}
		.postContainer.replyContainer {
			white-space: nowrap;
		}
		div.post.reply {
			max-width: 100%;
			/* max-height: 1000px; */
			white-space: normal;
			box-shadow: 0 0 5px 0 black;
			/* position: relative; */
			transform: scale(1);
			transform-origin: top left;
		}
		div.post.reply,
		.postInfo.desktop {
			transition:
				/* max-width  ${TRANS_TIME}s 0s ease-in-out,
				max-height ${TRANS_TIME}s 0s ease-in-out; */
				transform ${TRANS_TIME}s 0s ease-in-out,
				border-color ${TRANS_TIME}s 0s ease-in-out,
				box-shadow ${TRANS_TIME}s 0s ease-in-out;
		}
		div.post.preview.inlined.powiekszPocz {
			transform: scale(0);
			/* max-width: 0;
			max-height: 0; */
		}
		div.post.preview.inlined.powiekszKon {
			/* transform: scale(1); */
			/* max-width: initial;
			max-height: initial; */
		}
		div.post.reply div.postInfo {
			padding: 2px 5px;
			display: flex;
			flex-wrap: nowrap;
			width: -webkit-fill-available;
			align-items: baseline;
		}
		div.backlink {
			display: inline-flex;
			padding-left: 0;
			flex-wrap: wrap;
		}
		div.post div.postInfo span.postNum {
			margin-left: 3px;
			white-space: nowrap;
		}
		span.dateTime {
			margin-left: 3px;
			/* font-family: Source Code Fryc; */
			/* font-size: 13px; */
			white-space: nowrap;
		}
		span.dateTime > span {
			display: none;
		}
		body.show-weekday span.dateTime > span {
			display: inline;
		}
		div.post div.postInfo span.subject {
			margin-right: 3px;
		}
		.ukryjBar {
			position: absolute;
			left: 0px;
			top: 0px;
			width: 5px;
			height: 100%;
			/* background: aliceblue; */
			cursor: pointer;
		}
		.ukryty .file,
		.ukryty blockquote.postMessage {
			display: none !important;
		}
		.ukryty .postInfo {
			border: 0 !important;
		}
		span.name {
			cursor: pointer;
			transition:	color ${TRANS_TIME}s 0s ease-in-out;
		}
		/* div.post.reply:not(.ukryty):has( > div > span > span.name:hover, > .ukryjBar:hover) {
			border-style: dashed !important;
		}
		div.post.reply:not(.ukryty):has( > div > span > span.name:hover, > .ukryjBar:hover) > .postInfo.desktop {
			border-bottom-style: dashed !important;
		} */
		.redditify {
			display: inline-flex;
			align-items: center;
		}
		.redditify span {
			color: var(--backLink);
			cursor: pointer;
		}
		.redditify span.koniec {
			cursor: default;
		}
		.redditify svg {
			height: 17px;
			width: 17px;
			margin-left: 3px;
			/* filter: invert(1); */
		}
		span.posteruid {
			display: inline-flex;
			align-items: center;
		}
		.flag {
			filter: none;
		}
		.navLinks.desktop label input {
			position: relative;
			margin: 0px 3px 0px 3px;
			top: 2px;
		}
		.post.preview.inlined + br {
			display: none;
		}
		a.fileThumb img {
			/* display: block !important; */
			/* max-width: min(100%, 100% * attr(a_aspect)) !important;
			max-height: min(95vh, 100% * attr(a_aspect)) !important; */
			max-width:  100% !important;
			max-height: 94vh !important;
			object-fit: contain;
			object-position: top left;
		}
		a.fileThumb img[data-md5] {
			transition:
				width .4s 0s ease-in-out,
				height .4s 0s ease-in-out; /* ${TRANS_TIME} */
			/* height: auto !important;
			width: auto !important; */
			/* display: block !important; */
		}
		a.fileThumb img.expanded-thumb {
			/* position: absolute; */
			/* height: 100% !important;
			width: 100 !important; */
			/* display: none !important; */
		}
		a.fileThumb img.expanded-thumb.dispNone {
			display: none !important;
		}
		/* a.fileThumb.growing img.expanded-thumb {
			display: none !important;
		} */
		/* Tymczas */
		/* .middlead.center {
			display: none;
			} */
		/* Tymczas */
		div:has(>#qrFile) {
			width: 100%;
			display: flex;
			input[type="submit"] {
				width: fit-content;
			}
		}
		#qrFile {
			width: 100%;
		}
		span#qrSpoiler {
			white-space: nowrap;
		}
		div#qrForm {
			width: 303px;
		}
		.yotsuba_new #qrFile {
			color: white;
			flex: 1 0;
			width: auto;
		}
		div#t-msg {
			color: black;
		}
		#quickReply {
			filter: invert(1) hue-rotate(180deg);
		}
		div#absbot {
			color: #34345c;
		}
	`);

	if (frycAPI.path.includes("thread")) {
		const opcje = { childList: true };
		/*
		async function tumblerize() {
			function sleep(ms) {
			}
			async function clickAll() {
				let linki = document.querySelectorAll(".myDiv>.quotelink:not(.linkfade)");
				console.log(linki.length);
				for (let i = 0; i < linki.length; i++) {
					linki[i].click();
					await sleep(1);
				}
				return linki.length
			}
			while (await clickAll()) { }
		}
		*/
		(frycAPI.before_load = function () {
			// frycAPI.color_scheme_dark = 1;
		})();

		frycAPI.on_load_setter(() => {
			let obserwator_blok, obserwator_link, obserwator_file_thumb, obserwator_img;
			obserwator_blok = new MutationObserver(function mutator_blockquote(my_rec) { // eslint-disable-line prefer-const
				// debugger
				// loguj(my_rec);
				if (my_rec[0].addedNodes.length) {
					const nowy_node = my_rec[0].addedNodes[0].frycAPI_add_class("powiekszPocz");
					const target_children = my_rec[0].target.childNodes;
					if (target_children.length > 2) {
						const trg_child_n = target_children.length;
						if ((() => {
							for (let i = 0; i <= trg_child_n - 1; i++) {
								if (target_children[i].id && target_children[i].id.split("p")[1] > nowy_node.id.split("p")[1]) {
									target_children[i].insertAdjacentElement("beforebegin", nowy_node);
									return 0;
								}
							}
							return 1;
						})()) {
							target_children[trg_child_n - 1].insertAdjacentElement("afterend", nowy_node);
						}
					} else {
						target_children[1].insertAdjacentElement("afterend", nowy_node);
					}
					obserwator_blok.observe(nowy_node.querySelector("blockquote.postMessage"), opcje);
					obserwator_link.observe(nowy_node.querySelector("blockquote.postMessage .myDiv"), opcje);
					const file_thumb = nowy_node.querySelector("a.fileThumb");
					if (file_thumb !== null) {
						obserwator_file_thumb.observe(file_thumb, opcje);
					}
				} else if (my_rec.length > 1 && my_rec[0].removedNodes.length) {
					requestAnimationFrame(function () {
						my_rec[0].removedNodes[0].frycAPI_remove_class("powiekszPocz");
					});
				} else {
					// my_rec[0].removedNodes[0]
					// .frycAPI_remove_class("powiekszPocz", "powiekszKon")
				}
			});
			obserwator_link = new MutationObserver(function mutator_quotelink(my_rec) {
				// debugger
				if (my_rec[0].addedNodes.length) {
					const nowy_node = my_rec[0].addedNodes[0].frycAPI_add_class("powiekszPocz");
					// loguj(nowy_node.classList);
					const linki = my_rec[0].target.querySelectorAll("a.linkfade");
					for (let i = 0; i < linki.length; i++) {
						if (linki[i].getAttribute("data-pfx") === nowy_node.getAttribute("data-pfx")) {
							linki[i].insertAdjacentElement("afterend", nowy_node);
							obserwator_blok.observe(nowy_node.querySelector("blockquote.postMessage"), opcje);
							obserwator_link.observe(nowy_node.querySelector("blockquote.postMessage .myDiv"), opcje);
							const file_thumb = nowy_node.querySelector("a.fileThumb");
							if (file_thumb !== null) {
								obserwator_file_thumb.observe(file_thumb, opcje);
							}
							break;
						}
					}
				} else if (my_rec.length > 1 && my_rec[0].removedNodes.length) {
					requestAnimationFrame(function () {
						my_rec[0].removedNodes[0].frycAPI_remove_class("powiekszPocz");
					});
				}
			});
			obserwator_file_thumb = new MutationObserver(function mutator_file_thumb(my_rec) {
				{
					// console.table(my_rec);
					// my_rec.forEach(function (daElem, daI, daArr) {
					// 	if (daElem.type === "attributes" && daElem.target.classList.contains("expanded-thumb")) {
					// 		loguj(daElem.oldValue);
					// 		loguj(daElem.target.getAttribute("style"));
					// 		loguj(daElem.target.style.maxWidth);
					// 	}
					// });
					// my_rec[0].addedNodes[0]
				}
				const a_file = my_rec[0].target;
				const thumb = a_file.firstChild;
				a_file.parentNode.parentNode.parentNode.scrollIntoView();
				if (my_rec[0].addedNodes.length) {
					const added_img = my_rec[0].addedNodes[0];
					// my_rec[0].addedNodes[0].setAttribute("style", my_rec[0].target.firstChild.getAttribute("default_style"));

					// loguj(added_img.getAttribute("style"));
					// added_img.style.maxWidth = thumb.style.width;
					// added_img.style.maxHeight = thumb.style.height;
					obserwator_img.observe(added_img, { attributeFilter: ["style", "class"] });

					// let a_height = Number(my_rec[0].target.getAttribute("a_height"));
					// let a_width = Number(my_rec[0].target.getAttribute("a_width"));
					// let aspect = Number(my_rec[0].target.getAttribute("a_aspect"));
					// let height = Math.min(a_height, window.innerHeight * 0.99);
					// let width = Math.min(a_width, aspect * height);
					// thumb.setAttribute("style", `width: ${width}px; height: ${height}px;`);
					// a_file.parentNode.classList.add("image-expanded");

					// my_rec[0].target.classList.add("growing");
					// my_rec[0].target.firstChild.addEventListener("transitionend", (event) => {
					// 	event.target.parentNode.classList.remove("growing");
					// });
				} else {
					thumb.setAttribute("style", thumb.getAttribute("default_style"));
					thumb.classList.remove("transEnd");
					a_file.parentNode.classList.remove("image-expanded");
				}
			});
			const mini = function (thumb, added_img) {
				requestAnimationFrame(() => {
					// debugger
					thumb.style.width = added_img.style.maxWidth;
					thumb.style.height = added_img.style.maxHeight;
				});
				thumb.addEventListener("transitionend", async function thumb_trans(event) {
					// debugger
					/*
					if (!thumb.classList.contains("transEnd") && thumb.parentNode.parentNode.classList.contains("image-expanded")) {
						loguj("transitionend");
						await frycAPI.sleep(1);
						added_img.classList.remove("dispNone");
						// added_img.style.display = "block";
						thumb.classList.add("transEnd");
						thumb.style.display = "none";
					}
					*/
					loguj("transitionend");
					// await frycAPI.sleep(1);
					added_img.classList.remove("dispNone");
					let alt = thumb.parentElement.previousElementSibling.firstElementChild.getAttribute("title");
					alt ??= thumb.parentElement.previousElementSibling.firstElementChild.innerText;
					const alt_dot_idx = alt.lastIndexOf(".");
					added_img.setAttribute("alt", alt.slice(0, alt_dot_idx !== -1 ? alt_dot_idx : undefined));
					thumb.style.display = "none";
					thumb.removeEventListener("transitionend", thumb_trans, false);
				});
			};
			obserwator_img = new MutationObserver(function mutator_img(my_rec, mut_obs) {
				const added_img = my_rec[0].target;
				// loguj("classList: " + added_img.classList.value);
				// if (added_img.classList.contains("byłem")) {
				// 	return
				// } else {
				// 	added_img.classList.add("byłem");
				// }
				loguj("obserwatorImg");
				// debugger
				const thumb = added_img.previousSibling;
				// loguj(added_img.getAttribute("style"));
				// loguj(added_img.complete);
				thumb.style.display = "block";
				// added_img.style.display = "none";
				added_img.classList.add("dispNone");
				if (added_img.complete === false) {
					// let maxWidth  = added_img.style.maxWidth ;
					// let maxHeight = added_img.style.maxHeight;
					// added_img.style.maxWidth = thumb.style.width;
					// added_img.style.maxHeight = thumb.style.height;
					added_img.addEventListener("load", () => {
						// added_img.style.display = "block";
						// added_img.style.maxWidth =  maxWidth ;
						// added_img.style.maxHeight = maxHeight;
						// requestAnimationFrame(() => {
						// 	// debugger
						// });
						// thumb.style.display = "none";
						mini(thumb, added_img);
					});
				} else {
					mini(thumb, added_img);
				}
				// my_rec[0].target.firstChild.addEventListener("transitionend", (event) => {
				// 	event.target.parentNode.classList.remove("growing");
				// });
				// added_img.setAttribute("style", my_rec[0].target.previousSibling.getAttribute("style"));
				mut_obs.disconnect();
			});

			frycAPI.for_each("div.post blockquote.postMessage", function (da_elem, da_i, da_arr) {
				const my_div = document.createElement("div");
				my_div.classList.add("myDiv");
				while (da_elem.childNodes.length > 0) {
					my_div.appendChild(da_elem.childNodes[0]);
				}
				if (my_div.childNodes.length === 0) {
					da_elem.classList.add("pusty");
				}
				da_elem.appendChild(my_div);
				obserwator_link.observe(my_div, opcje);
				obserwator_blok.observe(da_elem, opcje);
			});

			document.querySelector("div.post.op .file").insertAdjacentElement("beforebegin", document.querySelector("div.post.op .postInfo.desktop"));
			// document.getElementById("bl_39814357").appendChild(document.getElementById("bl_39814357").firstChild.cloneNode(1))

			const dt_frmt = Intl.DateTimeFormat(frycAPI.date_locales, {
				year  : "numeric",
				month : "2-digit",
				day   : "2-digit",
				hour  : "2-digit",
				minute: "2-digit",
				// second: "2-digit",
				timeZone: "America/New_York",
			});
			const day_frmt = Intl.DateTimeFormat("en-GB", {
				weekday: "short",
				timeZone: "America/New_York",
			});
			frycAPI.for_each(".desktop span.dateTime", function (da_elem, da_i, da_arr) {
				const d = new Date(Number(da_elem.getAttribute("data-utc")) * 1000);
				da_elem.innerHTML = dt_frmt.format(d).replace(" ", "<span>, " + day_frmt.format(d) + "</span>, ");
			});

			{ // Hiding posts
				frycAPI.hide_post = function (da_elem) {
					da_elem.parentNode.parentNode.parentNode.classList.toggle("ukryty");
				};
				frycAPI.for_each(".desktop span.name", function (da_elem, da_i, da_arr) {
					da_elem.setAttribute("onclick", "frycAPI.hide_post(this);");
					// da_elem.addEventListener("click", hidePost);
				});

				frycAPI.hide_post_bar = function (da_elem) {
					da_elem.parentNode.classList.toggle("ukryty");
				};
				frycAPI.for_each("div.post.reply", function (da_elem, da_i, da_arr) {
					// let myDiv = document.createElement("div");
					// myDiv.classList.add("ukryjBar");
					// myDiv.setAttribute("onclick", "frycAPI.hide_post_bar(this);");
					// da_elem.insertAdjacentElement("afterbegin",myDiv);

					da_elem.insertAdjacentElement("afterbegin",
						document.createElement("div")
						.frycAPI_add_class("ukryjBar")
						.frycAPI_set_attribute("onclick", "frycAPI.hide_post_bar(this);")
					);
				});
			}

			frycAPI.for_each(".postInfoM.mobile", da_elem => da_elem.remove());

			frycAPI.for_each("a.fileThumb", function (da_elem, da_i, da_arr) {
				const wymiary = da_elem.previousSibling.childNodes[2].data.match(/(?<=[ x])\d+/gu);
				// da_elem.firstChild.setAttribute("a_width", wymiary[0]);
				// da_elem.firstChild.setAttribute("a_height", wymiary[1]);
				da_elem.firstChild.setAttribute("a_aspect", wymiary[0] / wymiary[1]);
				da_elem.firstChild.setAttribute("default_style", da_elem.firstChild.getAttribute("style"));
				obserwator_file_thumb.observe(da_elem, opcje);
			});

			if (document.querySelector(".redditify") === null) {
				const red_span = document.createElement("span");
				const red_div = document.createElement("div");
				red_div.classList.add("redditify");
				// red_span.setAttribute("onclick", "redditify();");
				red_span.addEventListener("click", async function redditify() {
					const reddit = document.querySelector(".redditify span");
					if (!reddit.classList.contains("koniec")) {
						reddit.classList.add("koniec");
						reddit.innerHTML = "Redditifying";
						reddit.insertAdjacentHTML("afterend",
							`<svg id="mySvg" width="200px" height="200px" viewBox="-50 -50 100 100">
								<style type="text/css">
									rect {
										x: -4px;
										y: -45px;
										height: 28px;
										width: 8px;
										fill: #000;
										rx: 4px;
										ry: 4px;
									}
								</style>
								<rect transform="rotate(0)">
									<animate attributeName="fill" begin="0s" dur="1.44s" from="#fff" to="#000" repeatCount="indefinite" />
								</rect>
							</svg>`
						);
						const my_svg = reddit.parentNode.querySelector("svg");
						const czas = 1.44;
						const liczba = 12;
						for (let i = 1; i < liczba; i++) {
							const my_rect = my_svg.querySelector("rect").cloneNode(1);
							my_rect.setAttribute("transform", `rotate(-${i / liczba * 360})`);
							my_rect.children[0].setAttribute("begin", `-${i / liczba * czas}s`);
							// console.log(my_rect);
							my_svg.append(my_rect);
						}
						while (await (async function () {
							const linki = document.querySelectorAll(".backlink>span>.quotelink:not(.linkfade)");
							// console.log(linki.length);
							for (let i = 0; i < linki.length; i++) {
								linki[i].click();
								await frycAPI.sleep(1);
							}
							return linki.length;
						})()) { }
						// while (frycAPI.for_each(`.backlink>span>.quotelink:not(.linkfade)`, async daElem => {
						// 	daElem.click();
						// 	await frycAPI.sleep(1);
						// }).length) { }

						reddit.innerHTML = "Redditified";
						my_svg.remove();
					}
				});
				red_span.innerHTML = "Redditify";
				const nav_div = document.querySelector(".navLinks.desktop");
				nav_div.append(" [");
				nav_div.appendChild(red_div).appendChild(red_span);
				nav_div.append("]");
			}
		});

		frycAPI.create_manual_functions("4chan", {
			func_arr: [
				(name = "Weekdays", type = frycAPI_Pure_state) => {
					const f = new type({ name });
					f.callback = function (obj) {
						document.body.classList.toggle("show-weekday");
					};
					return f;
				},
			],
		});

		loguj("4chan done!");
	}
} else if (0 && frycAPI_host("bugs.chromium.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		#shadow-root > .comment-body {
			padding: 4px;
			border: 1px solid gainsboro;
			border-top: 0px;
			margin: 0px;
		}
		#shadow-root > .issue-diff {
			border-left: 1px solid gainsboro;
			border-right: 1px solid gainsboro;
		}
		#shadow-root .comment-header {
			border: 1px solid gainsboro;
			border-bottom: 0px;
		}
		mr-comment {
			border: 1px solid hsl(0deg 0% 60%);
		}

		/*
		::part(mr-comment) {

		}
		mr-app > #shadow-root {

		}
		mr-header {

		}
		:host {

		}

		[headinglevel="2"] {

		}
		:host(mr-header) {

		}
		*/
	`);
} else if (1 && frycAPI_host("chat.openai.com", "chatgpt.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		/* .mój-tooltip {
			position: absolute;
			left: calc(100% + 20px);
			display: none;
			white-space: nowrap;
		}
		a.flex.items-center.gap-2.p-2 {
			position: relative;
			&::after {
				content: "abc";
				position: absolute;
				left: 0px;
			}
		}
		li:hover .mój-tooltip {
			display: block;
		}
		.flex-shrink-0.overflow-x-hidden.bg-token-sidebar-surface-primary {
			overflow: visible;
		} */
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		code, code *, #codemirror *, pre, pre * {
			font-family: "Source Code Fryc", monospace !important;
		}
		/* body {
			--my-width: 360px;
			.flex-shrink-0.overflow-x-hidden.bg-token-sidebar-surface-primary:first-child {
				width: var(--my-width) !important;
				& > div {
					width: var(--my-width) !important;
				}
			}
			.fixed.left-0.z-40 {
				transform: translateX(var(--my-width)) translateY(-50%) rotate(0deg) translateZ(0px) !important;
			}
		} */

		.table-of-prompts-container {
			--border: 1px solid #5f5f5f;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			flex: 1;
			overflow-x: hidden;
			overflow-y: auto;
			border-left: var(--border);

			.collapse, input, .clear {
				border-radius: 5px;
			}

			.title {
				/* padding: 2px; */
				/* gap: 5px; */
				/* border: 1px solid white; */
				--background: #444444;
				background-color: var(--background);
				display: flex;
				flex-direction: column;
				position: sticky;
				top: 0;
				z-index: 5;
				border-bottom: var(--border);

				.collapse, .clear {
					width: auto;
					height: 24px;
				}
				.text-outer {
					flex-grow: 1;
					font-weight: bold;
					border-bottom: var(--border);
					padding: 2px;
					position: relative;
					cursor: pointer;
				}
				.text {
					text-align: center;
				}
				.collapse {
					visibility: visible;
					position: absolute;
					top: 2px;
					right: 2px;
					content: url(${frycAPI.get_res_url("visibility_on.png")});
					background-color: var(--background);
				}
				.text-outer:hover {
					.text {
						text-decoration: underline;
					}
					.collapse {
						filter: brightness(1.3);
					}
				}
				.search {
					background-color: #373737;
					padding: 5px;
					gap: 5px;
					display: flex;
					align-items: center;

					input {
						padding: 0px 5px;
						width: -webkit-fill-available;
						background-color: var(--background);
						color: white;
						box-shadow: none;
					}
					input:focus {
						border-color: #44B28D;
					}
					.clear {
						content: url(${frycAPI.get_res_url("close.png")});
					}
					.clear:hover {
						filter: brightness(1.3);
						background-color: #373737;
						cursor: pointer;
					}
				}
			}
			.prompt:hover {
				filter: brightness(1);
				background-color: color-mix(in srgb, #373737, 10% white);
			}

			.prompt {
				padding: 2px 5px;
				display: -webkit-box;
				background-color: #373737; /* rgb(47, 47, 47) */
				overflow: clip;
				-webkit-line-clamp: 3;
				-webkit-box-orient: vertical;
				cursor: pointer;
			}
			.prompt:not(.hide) ~ .prompt {
				border-top: var(--border);
			}
			.hide {
				display: none;
			}
		}
		/* body.table-of-prompts {
			main article > div {
				& > div {
					margin: 0;
				}
			}
		} */
		body:not(.table-of-prompts) {
			.table-of-prompts-container {
				.title {
					padding: 2px;
				}
				.text-outer {
					padding: 0;
					border: 0;
					position: unset;
				}
				flex-basis: fit-content;
				flex-grow: 0;
				.text, .prompt, .refresh, .search {
					display: none;
				}
				.collapse {
					content: url(${frycAPI.get_res_url("visibility_off.png")});
					position: unset;
				}
				&:hover {
					cursor: pointer;
					.collapse {
						filter: brightness(1.3);
					}
				}
			}
		}

		/* Disable "The GPT-5 model limit has been reached on the Free plan." */
		/* :has(> * > * > * > * > * > * > button[data-testid="close-button"]) {
			display: none;
		} */

		#page-header :has(> [aria-label="Dismiss upgrade reminder"]) {
			display: none;
		}

		.myMsgTime {
			text-align: right;
			margin-right: 22px;
		}

		[data-testid="thread-header-right-actions"] > div:has(use[href*="2e54eb"]),
		div:has(> button[aria-label="Claim offer"]),
		#thread-bottom-container > div > div > button[aria-hidden="true"][tabindex="-1"] {
			display: none;
		}

	`);

	const prompt_elem_base = frycAPI.elem("div").class("prompt")._;
	let msg_obs = null, last_conversation = null, last_prompts = [], container, prompt_elems = [], table_text_outer, table_input, table_clear;
	function get_all_prompts() {
		return Object.values(last_conversation.mapping)
		.filter(obj => obj?.message?.author?.role === "user")
		.frycAPI_sort_values_simple(obj => obj.message.create_time)
		.map(obj => ({ prompt: obj.message.content.parts.join("\n").trim(), id: obj.id }));
	}
	function search_prompts() {
		if (!prompt_elems.length) return;
		const val = table_input?.value.toLowerCase().trim();
		if (!val) {
			prompt_elems.forEach(p_elem => p_elem.classList.remove("hide"));
			return;
		}
		for (const p_elem of prompt_elems) {
			const prompt = p_elem.prompt;
			if (prompt.includes(val)) {
				p_elem.classList.remove("hide");
			} else {
				p_elem.classList.add("hide");
			}
		}
	}
	function update_table_of_prompts() {
		if (!container?.is_descendant_of(document.body)) return; // case of container removal
		if (!document.body.classList.contains("table-of-prompts")) return;
		const new_prompts = get_all_prompts();
		if (last_prompts.length === new_prompts.length && last_prompts.last.prompt === new_prompts.last.prompt) return;
		last_prompts = new_prompts;

		prompt_elems.forEach(el => el.remove());
		const fragment = document.createDocumentFragment();
		for (const { prompt, id } of last_prompts) {
			const prompt_elem = prompt_elem_base.cloneNode().frycAPI_set_inner_text(prompt).frycAPI_set_attribute("title", prompt);
			fragment.appendChild(prompt_elem).addEventListener("click", () => {
				frycAPI.q_sel(`section[data-turn-id="${id}"]`)?.scrollIntoView();
			});
			prompt_elem.prompt = prompt.toLowerCase();
		}
		prompt_elems = Array.from(fragment.children);
		search_prompts();
		container.appendChild(fragment);
	}

	const original_fetch = window.fetch;
	window.fetch = async (...args) => {
		const response = await original_fetch(...args);

		if (response.url.startsWith("https://chatgpt.com/backend-api/conversation/")) {
			response.clone().json().then(conversation => {
				if (conversation?.conversation_id) {
					last_conversation = conversation;
					msg_obs?.disconnect();
					msg_obs = frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
						frycAPI.for_each(`[data-message-author-role="user"][data-message-id]:not([date-added])`, da_elem => {
							const msg = conversation.mapping[da_elem.getAttribute("data-message-id")]?.message;
							if (msg?.author?.role === "user") {
								const my_message_parent = da_elem.parentElement.parentElement;
								if (!my_message_parent) return;
								const lep_czs = frycAPI.elem("div").class("lepszyCzasParent", "myMsgTime")._;
								frycAPI.set_default_date_text(lep_czs, new Date(msg.create_time * 1000));
								my_message_parent.insertAdjacentElement("afterBegin", lep_czs);
								da_elem.setAttribute("date-added", "");
							}
						});
					});

					update_table_of_prompts();
				}
			}).catch(console.error);
		}

		return response;
	};

	const PROMPT_SELECTOR = `[data-message-author-role="user"] .whitespace-pre-wrap`;
	frycAPI.create_manual_functions("ChatGPT", {
		func_arr: [
			(name = "Log all prompts", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function () {
					console.clear();
					get_all_prompts().map(obj => obj.prompt).forEach(p => loguj(p));
				};
				return f;
			},
			(name = "Save all prompts to file", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function () {
					let txt = "";
					const separator = `\n\n${"#".repeat(30)}\n\n`;
					get_all_prompts().map(obj => obj.prompt).forEach(prompt => {
						txt += prompt.trim() + separator;
					});
					frycAPI.download_txt(txt.slice(0, -separator.length), `ChatGPT prompts - ${document.title} - ${frycAPI.print_date_for_file_name()}.txt`);
				};
				return f;
			},
			(name = "Table of prompts", type = frycAPI_Normal) => {
				const f = new type({ name });

				function body_toggle_table_class(event) {
					event?.stopPropagation();
					if (document.body.classList.toggle("table-of-prompts")) {
						container.removeEventListener("click", body_toggle_table_class);
					} else {
						container.addEventListener("click", body_toggle_table_class);
					}
				}
				f.callback = function () {
					if (container?.is_descendant_of(document.body)) {
						body_toggle_table_class();
						return;
					} // first call or page wipe

					container = frycAPI.by_id("stage-slideover-sidebar").parentElement.appendChild(frycAPI.elem_from_html(/*html*/`
						<div class="table-of-prompts-container">
							<div class="title">
								<div class="text-outer">
									<div class="text">Table of prompts</div>
									<img class="collapse"/>
								</div>
								<div class="search"><input type="text" placeholder="Search prompts"/><img class="clear"/></div>
							</div>
						</div>
					`));
					table_text_outer = container.frycAPI_elem_by_class("text-outer");
					table_input = container.frycAPI_elem_by_tag("input");
					table_clear = container.frycAPI_elem_by_class("clear");

					document.body.classList.remove("table-of-prompts");
					body_toggle_table_class();

					let last_title;
					frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
						if (last_title !== document.title) {
							last_title = document.title;
							if (document.title === "ChatGPT") { // when in new chat
								prompt_elems.forEach(el => el.remove());
							}
							update_table_of_prompts();
						}
					}, { elem: document.querySelector("title"), options: { characterData: true } });

					table_text_outer.addEventListener("click", body_toggle_table_class);
					table_input.addEventListener("input", search_prompts);
					table_clear.addEventListener("click", () => {
						table_input.value = "";
						table_input.select();
						prompt_elems.forEach(p_elem => p_elem.classList.remove("hide"));
					});
				};
				return f;
			},
		],
	});
} else if (0 && frycAPI_host("cke.gov.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		h2, .h2 {
			color: #F8A238;
		}
	`);
} else if (1 && frycAPI_host("comforteo.eu")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.tooltip-static .content-area {
			color: hsl(0deg 0% 0%);
		}
	`);
} else if (1 && frycAPI_host("comparetwolists.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			margin: auto;
			display: flex;
			flex-direction: column;
			align-items: center;
			&,&>* {
				width: fit-content;
			}
		}
		*:not(textarea, img) {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		img {
			width: 14px;
			height: 14px;
			filter: invert(1);
			&[src="download.png"] {
				content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='download'><path d='M21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Zm-9.71,1.71a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l4-4a1,1,0,0,0-1.42-1.42L13,12.59V3a1,1,0,0,0-2,0v9.59l-2.29-2.3a1,1,0,1,0-1.42,1.42Z'></path></svg>");
			}
			&[src="copy.png"] {
				content: url("data:image/svg+xml;utf8,<?xml version='1.0' encoding='utf-8'?><svg height='48' viewBox='0 0 48 48' width='48' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h48v48h-48z' fill='none'/><path d='M32 2h-24c-2.21 0-4 1.79-4 4v28h4v-28h24v-4zm6 8h-22c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h22c2.21 0 4-1.79 4-4v-28c0-2.21-1.79-4-4-4zm0 32h-22v-28h22v28z'/></svg>");
			}
		}
		.myDiv {
			display: flex;
			justify-content: center;
			gap: 5px;
			:nth-child(2) {
				border-right: 1px solid white;
				font-weight: bold;
				padding-right: 5px;
				color: #6ee76e;
			}
			:nth-child(4) {
				font-weight: bold;
				color: #6ee76e;
			}
		}
		body>table:nth-of-type(2) {
			display: none !important;
		}
		.toggle-copy-buttons .copy-buttons {
			display: none !important;
		}
		.copy-buttons {
			cursor: pointer;
		}
		[data-fuse] {
			display: none;
		}

		td:has(#fuse-slot-incontent_1-1) {
			display: none;
		}
	`);

	frycAPI.on_load_setter(() => {
		let my_tr;
		const my_td_arr = new Array(3);
		frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
			frycAPI.for_each(`img[src="copy.png"], img[src="download.png"]`, (da_elem, da_i, da_arr) => {
				da_elem.frycAPI_add_class("copy-buttons");
			});
			const tab = document.querySelector(`body>table:first-of-type>tbody:has(tr>td:nth-child(1)>b)`);
			if (tab !== null) {
				tab.querySelector(`tr>td:nth-child(1)>b`).innerHTML = document.querySelector(`input[name="desca"]`).value;
				tab.querySelector(`tr>td:nth-child(2)>b`).innerHTML = document.querySelector(`input[name="descb"]`).value;
				my_tr ??= tab.appendChild(document.createElement("tr"));
				[3, 4, 5].forEach((tr, idx) => {
					const da_elem = document.querySelector(`body>table:nth-of-type(2)>tbody>tr:nth-child(${tr})`);
					if (my_td_arr[idx] === undefined) {
						my_td_arr[idx] = my_tr.appendChild(document.createElement("td")).appendChild(document.createElement("div").frycAPI_add_class("myDiv"));
					} else {
						my_td_arr[idx].frycAPI_remove_children();
					}
					[1, 2, 5, 6].forEach(n => {
						my_td_arr[idx].appendChild(document.createElement("div")).innerHTML = da_elem.querySelector(`td:nth-child(${n})`).innerText;
					});
				});
			}

			document.querySelector(`form table:first-of-type > tbody > tr:nth-child(2) > td:nth-child(3)`)?.remove();
		});
	});

	frycAPI.create_manual_functions("Toggle copy buttons", {
		func_arr: [
			(name = "Copy buttons", type = frycAPI_Pure_state) => {
				const f = new type({ name });
				f.callback = function (obj) {
					document.body.classList.toggle("toggle-copy-buttons");
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("cotone.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.floatcenterwrap .paginator li.selected {
			color: #d69754;
		}
		.products.viewphot .product .prodimage span {
			min-height: auto;
		}
		.products.viewphot .product {
			height: auto;
		}
		.box .product .price {
			margin-bottom: initial;
		}
		.products.viewphot .product .price {
			padding-top: initial;
		}
		.products.viewphot .product .buttons {
			padding-top: 13px;
		}
		.products.viewphot .product .productname {
			margin-bottom: 13px;
		}
		.s-row .s-grid-9 {
			width: 1180px;
		}
		.container {
			max-width: 1480px;
		}
		.radio-wrap input[type=radio]:checked+label::after {
			background-color: #838383;
		}
		div.top.row {
			display: none;
		}
		.products.viewphot.s-row {
			display: flex;
			flex-wrap: wrap;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  2
else if (1 && frycAPI_host("css-tricks.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/* .on-light, .on-light .article-content {
			color: hsl(236 15% 90% / 1);
		}
		.article-and-sidebar>.article-content {
			background: #000;
		}
		code {
			color: #1e1e17;
		}
		pre code, em code, [rel="CSS"] code, [class*="language-css"], .language-html{
			color: inherit;
		}
		.header-breadcrumbs .on-light .breadcrumb_last, .header-breadcrumbs .on-light .breadcrumb_last a, .on-light .header-breadcrumbs .breadcrumb_last, .on-light .header-breadcrumbs .breadcrumb_last a, .on-light h1, .on-light h1 a, .on-light h2, .on-light h2 a, .on-light h3, .on-light h3 a, .on-light h4, .on-light h4 a, .on-light h5, .on-light h5 a, .on-light h6, .on-light h6 a {
			color: hsl(236 15% 90% / 1);
		}
		figure.wp-block-image.is-resized>img[src*=".svg"] {
			filter: invert(1) hue-rotate(180deg) brightness(48);
			fill: #3e5b74;
		} */
		/* !important */
		* {
			tab-size: 3 !important;
		}
		:root {
			--light-orange: #170A00;
		}
		.article-content {
			background: #000;
			color: #fff;
		}
		.article-series {
			background: #0F0700;
		}
		.article-series ol li:before {
			color: #fff;
		}
		.ticss-eb9f93bc {
			background: #060300;
		}
		body :is(.CommentForm, .commentlist, .commentlist) .comment-content {
			background: #434343;
			color: #eaeaea;
			border-top-left-radius: 0;
			overflow: visible;

			&::before {
				/* content: "a";
				position: absolute;
				top: 0px;
				right: 100%;
				line-height: normal; */
			}
		}
		body :is(.CommentForm, .commentlist, .commentlist) .comment-wrap {
			grid-template-columns: 15% 1fr 100px;

			&::before {
				background: #434343;
				height: 3px;
			}
		}
		ul.children {
			margin-bottom: 0px !important;
		}
		.commentlist .comment-wrap:has( + ul.children) {
			margin-bottom: 1rem;
		}
		.comment-content p {
			max-width: none;
		}
		.comment-content p:last-child {
			margin-bottom: 0;
		}
		.comment-author {
			line-height: normal;
			margin-top: 10px;
		}
		.comment-time {
			line-height: normal;
			margin: 0;
		}
		.myDiv {
			--len: 8px;
			height: var(--len);
			width: var(--len);
			overflow: hidden;
			position: absolute;
			top: 3px;
			right: 100%;
		}
		.myDiv::before {
			--lenm: calc(var(--len) / (-2));
			content: ' ';
			position: absolute;
			top: 50%;
			left: 50%;
			height: var(--len);
			width: var(--len);
			/* margin: -35px 0 0 -35px; */
			margin-left: var(--lenm);
			margin-top: var(--lenm);
			border-radius: 0 100% 0 0;
			box-shadow: #434343 0 0 0 100px;
		}
		.flex-column-children > .wp-block-group, .flex-column-children > .wp-block-group {
			background: linear-gradient(rgba(255, 138, 0, 0.2), #000);
		}
		.flex-column-parent > .wp-block-group, .flex-column-parent > .wp-block-group {
			background: linear-gradient(rgba(156, 39, 176, 0.2), #000);
		}

		.grid-properties-area h4 {
			background: black;
		}
		.grid-property-group,
		.grid-property-children-group,
		.grid-special-group {
			box-shadow: 0 0 20px 16px #ffffff1f;
		}
		.grid-property-group {
			background: #140800;
			& img,
			& video {
				background-color: hsl(24 100% 87% / 1);
			}
		}
		.grid-property-children-group {
			background: #04101D;
			& img,
			& video {
				background-color: hsl(211 76% 87% / 1);
			}
		}
		.article-content div.explanation, .article-content p.is-style-explanation, .article-content p:not(:first-of-type).explanation {
			box-shadow: 0 0 1px white;
		}

		.grid-special-group {
			background: #000E00;
		}
		.CommentForm li.comment.bypostauthor .comment-content, .commentlist li.comment.bypostauthor .comment-content, .comment ul li.comment.bypostauthor .comment-content {
			background-image: linear-gradient(-15deg,rgba(255,122,24,.25),#434343);
		}
		.wp-block-columns.is-layout-flex.wp-container-core-columns-layout-3.wp-block-columns-is-layout-flex {
			align-items: flex-start;
		}
	`);
	frycAPI.on_load_setter(() => {
		frycAPI.for_each(".comment-content", function (da_elem, da_i, da_arr) {
			da_elem.insertAdjacentElement("afterbegin", document.createElement("div").frycAPI_add_class("myDiv"));
		});
	});
} else if (1 && frycAPI_host("derpibooru.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		form.header__search.flex.flex--no-wrap.flex--centered[action="/search"] {
			flex-grow: 1;
		}
		input#q {
			flex-grow: 1;
			max-width: unset;
			width: unset;
		}

		/*
		object, iframe, embed {
			border: 0;
			margin: 0;
		}

		div.image-container object,
		div.image-container iframe,
		div.image-container embed{
			max-height: 100%;
			max-width: 100%;
			vertical-align: middle;
		}
		*/

		div#comments {
			display: flex;
			flex-direction: column-reverse;
		}
		div#comments>.block:not(.communication) {
			order: 1;
		}
	`, { elevated: true }); // , state: false
} else if (1 && frycAPI_host("developer.mozilla.org")) {
	frycAPI.line = frycAPI.get_line_number();
	// frycAPI.UUID = "2025-01-12 14:26";
	frycAPI.inject_style_on_load(/*css*/`
		body, *:not(code, code *) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		/* iframe.sample-code-frame {
			filter: invert(1) hue-rotate(180deg);
		} */
		iframe.interactive body {
			background-color: #2b2b2b;
		}
		/*
		.logo .logo-_, .logo .logo-m {
			fill: #1bb31c;
		}
		*/
		article {
			*:not(.notecard) > p {
				margin: 1rem 0 1rem;
			}
			.notecard {
				margin: 1rem 0 1rem !important;
			}
			.code-example {
				margin: 1rem 0 1rem;
			}
			.code-example .example-header~pre {
				margin: 0;
			}
			.main-page-content ol, .main-page-content ul {
				margin: 1rem 0 1rem;
			}
		}

		.top-banner, .page-layout__banner { /* .top-banner.visible */
			display: none;
		}

		/* #mdn-docs-logo .logo-text {
			fill: red;
		} */

		mdn-placement-sidebar { /* Hide ads */
			display: none;
		}
	`);
} else if (0 && frycAPI_host("diep.io")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body #app-mount .container-1r6BKw {
			justify-content: space-between;
		}body {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("dinopoloclub.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.site-header, .site-header .site-title a {
			filter: invert(1) hue-rotate(180deg);
		}
		/* body, button, input, optgroup, select, textarea {
			color: #7a7a7a !important;
		} */
		.main-navigation a, .entry-content span {
			color: hsl(0 0% 58% / 1) !important;
		}
		#main div.entry-content>p>span {
			color: #404040 !important;
		}
	`);
} else if (1 && frycAPI_host("docs.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/*
		body #docs-editor-container .grid-table-container+canvas, .docos-icon-img:before {
			filter: invert(1) !important;
		}
		.eAQI0e {
			white-space: nowrap;
		}
		svg path[fill="#222222"] {
			fill: hsl(0 0% 58% / 1);
		}
		.goog-palette-cell .docs-preview-palette-item {
			filter: brightness(0.5) contrast(14.2) brightness(2);
		}
		*/

		.docos-docoview-active > .docos-anchoreddocoview-internal {
			/* border: 1px solid white !important; */
			/* Setting border on this element resizes it so it is bad so we have to use heleper before element */
			position: relative;
			&::before {
				content: "";
				position: absolute;
				width: 100%;
				height: 100%;
				box-sizing: border-box;
				border: 1px solid white;
				border-radius: 12px;
				z-index: 10;
				pointer-events: none;
			}
		}
	`);
	if (frycAPI.path.startsWith("/spreadsheets")) {
		frycAPI.inject_style_on_load(/*css*/`
			#docs-editor [id*="grid-table-container"] > canvas {
				filter: invert(0) hue-rotate(0) !important;
			}
			/* #docs-editor [id="0-grid-table-container"] {
				filter: invert(0) hue-rotate(0) !important;
			} */
		`);
	}

	// (frycAPI.before_load = function () {
	// 	// frycAPI.color_scheme_dark = 1;
	// })();

	frycAPI.on_load_setter(function () {
		new MutationObserver((mut_rec, mut_obs) => {
			// loguj(mut_rec);
			const elem = document.getElementById("docs-maestro-prompt-dialog-message");
			if (elem !== null && mut_rec[0].addedNodes[0].hasAttribute("jsshadow") && elem.innerText.startsWith("!@#$%^&*()")) {
				// loguj(elem.innerText);
				frycAPI.ctrl_c(elem.innerText.replace("!@#$%^&*()", ""));
				mut_rec[0].addedNodes[0].querySelector(`span.javascriptMaterialdesignGm3WizButtonText-button__touch`).click();
			}
		}).observe(document.body, { childList: true });
	});
} else if (0 && frycAPI_host("docs.screeps.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#sidebar {
			background-color: white;
		}
		body {
			filter: invert(1) hue-rotate(180deg);
			background-color: black;
			height: initial;
		}
		#header {
			background-color: white;
		}

		img {
			filter: invert(1) hue-rotate(180deg);
		}
		#ucss-code-wrapper .CodeMirror-wrap .CodeMirror-scroll {
			filter: invert(0) hue-rotate(0deg);
			background-color: white;
			color: black;
		}

		.CodeMirror-activeline {
			filter: invert(1);
			background-color: black;
			color: white;
		}

		.content {
			background-color: white;
		}
		.content pre {
			filter: invert(1) hue-rotate(0deg);
		}
		.tocify-wrapper {
			overflow-y: scroll;
			position: sticky;
			height: 100vh;
		}

		.page-wrapper {
			margin-top: -1007px;
		}
	`);
} else if (1 && frycAPI_host("drive.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/*
		div[role="dialog"] div[role="document"] {
		filter: none !important;
		}
		*/
		.a-b-Xa-yj.a-b-tb-Ce.a-b-Xa-La-jh {
			filter: invert(1) hue-rotate(180deg);
		}
		.a-X-k {
			background: #212324;
		}

		a[aria-label="Dysk"] > img {
			content: url("chrome-extension://jmpmjlfehojjhkfmjhnhlfgobpiekeci/resources/Google Drive.ico");
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.change_favicon_res("Google Drive.ico");
	});
} else if (1 && frycAPI_host("dydmat.mimuw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("eager.io")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.blog-post-content a:not(.button):not(.without-underline) {
			text-shadow: none;
			text-decoration: underline;
		}
	`);
} else if (1 && frycAPI_host("epodreczniki.open.agh.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("fizyka.dk")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(1) !important;
		}
	`);
} else if (1 && frycAPI_host("forms.office.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.office-form-question-title.with-image {
			padding: 10px;
		}
		.office-form-question-title.with-image:last-child {
			padding-bottom: 10px;
		}
		.office-form-question-title div.immersive-reader-button-wrapper {
			display: none;
		}
		.office-form-question-element {
			margin-top: 0px;
			margin-left: 0px;
		}
		.office-form-question-choice+.office-form-question-choice {
			margin-top: 0px;
		}
		.office-form-question-element {
			padding: 10px;
		}
		.office-form-question-ordinal {
			position: absolute;
			top: 11px;
			left: 11px;
			width: 20px;
			height: 20px;
		}
		.office-form-question-ordinal span {
			line-height: 20px;
		}
		.office-form-question-title>span:not([class]) {
			margin-left: 5px;
		}
		.office-form-question-title>div:not(.immersive-reader-button-wrapper) {
			display: inline-block;
			margin-left: 10px;
		}
		.office-form-question-content {
			padding: 0px;
			border: 1px solid #6d6d6d;
			border-top-width: 0px;
		}
		.office-form-question:first-child .office-form-question-content {
			border-top-width: 1px;
		}
		.office-form-question {
			padding: 0px;
			margin: 0px;
		}
		.office-form-question-content>div:first-child:not(.question-title-container):not(.question-title-box) {
			display: none;
		}
		.office-form-question-title>.ordinal-number {
			position: static;
		}
		.office-form-question-title {
			margin-left: 0px;
		}
		.question-title-box {
			padding: 10px 10px 0 12px
		}
		.office-form-notice-container>div:not(:last-child) {
			margin-bottom: 0px;
		}
		.office-form-notice-container>div:last-child {
			margin-bottom: 20px;
		}
		.office-form-content {
			padding-top: 0px;
		}
		.office-form-theme-footer {
			display: none;
		}
		.office-form-result-container {
			min-height: 100px;
		}
		div>span.text-format-content {
			padding-left: 26px;
		}
		.office-form-question-title {
			margin-left: 15px;
		}
	`);

	let question_elems;
	function get_questions_as_arr() {
		const out = [];
		question_elems = frycAPI.for_each(`[data-automation-id="questionItem"]`, question => {
			out.push({
				title: question.querySelector(`.text-format-content`).innerText.trim().replaceAll(/\s\s+/g, " "),
				options: question.querySelectorAll(`[data-automation-id="choiceItem"]`).map(choice => ({
					text: choice.querySelector(`[id^="QuestionChoiceOption"]`).innerText.trim().replaceAll(/\s\s+/g, " "),
					selected: choice.getAttribute("class").includes("choice-selected") ? 1 : 0,
				})),
			});
		});
		return out;
	}
	function get_form_title() {
		return document.querySelector(`[data-automation-id="formTitle"]`).innerText.trim();
	}

	frycAPI.create_manual_functions("MS Forms", {
		func_arr: [
			(name = "Download questions as JSON", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function () {
					frycAPI.download_txt(
						get_questions_as_arr().jsón,
						get_form_title() + ".json"
					);
				};
				return f;
			},
			(name = "Download questions as HTML", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = async function () {
					// const scroller = document.querySelector(`[id*="form-main-content"]`);
					const scroller = frycAPI.by_id("branding-footer");
					scroller.scrollIntoView({ behavior: "smooth", block: "start" });
					const interval = 500;
					await frycAPI.sleep(interval);
					await frycAPI.retry_if(() => frycAPI.is_elem_on_screen(scroller) || scroller.scrollIntoView({ behavior: "smooth", block: "start" }), interval);
					const title = get_form_title();
					const div = frycAPI.elem("div", 0);
					div.appendChild(frycAPI.elem("button").text("Przełącz kolory").attr("onclick", "document.body.classList.toggle('kolory');")._);
					div.appendChild(frycAPI.elem("h1").text(title)._);
					const ol = div.appendChild(frycAPI.elem("ol").attr("type", "1")._);
					for (const [i, question] of Object.entries(get_questions_as_arr())) {
						const li = ol.appendChild(frycAPI.elem("li", 0));
						li.innerText = question.title;
						const img = question_elems[i].frycAPI_elem_by_tag("img");
						if (img) {
							li.appendChild(
								frycAPI.elem("img")
								.attr("src", await frycAPI.get_img_as_data_url(img.src))
								._
							);
						}
						const ol1 = li.appendChild(frycAPI.elem("ol").attr("type", "a")._);
						question.options.sort((a, b) => b.selected - a.selected).forEach(option => {
							ol1.appendChild(frycAPI.elem("li").text(option.text).class(option.selected ? "dobra" : "zła")._);
						});
					}
					frycAPI.download_txt(
						frycAPI.minify_code_simple(`<html>
							<head>
								<style>
									body{
										font-family: sans-serif;
										width: 1000px;
										max-width: 100%;
										margin: auto;
										padding: 10px;
										box-sizing: border-box;
									}
									img{
										display: block;
										max-width: 100%;
										max-height: 100vh;
									}
									.kolory .dobra{color: #38761d}
									.kolory .zła{color: #cc0000}
									li::marker{font-weight: bold;}
								</style>
								<script>
									const imgExt = ["jpg","webp","gif","bmp","tiff","avif"];
								</script>
							</head>
							<body class="kolory">${div.innerHTML}</body>
						</html>`),
						title + ".html"
					);
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("forum.videohelp.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			background-color: aliceblue;
		}
	`);
} else if (1 && frycAPI_host("gamertools.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.gameItem {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("industrial.omron.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (0 && frycAPI_host("jp.pum.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
} else if (1 && frycAPI_host("json2table.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		table * {
			font-family: "Source Code Fryc";
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  3
else if (1 && frycAPI_host("jsongrid.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		td.obj.order.index {
			display: none;
		}
	`);
} else if (1 && frycAPI_host("karl.gg")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.statsContainer {
			border-top: 1px solid;
		}
		.statsText[data-v-a848cd50] {
			line-height: inherit;
		}
	`);
} else if (1 && frycAPI_host("kertisjones.weebly.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#main-wrap .inner-container {
			background: none;
		}
	`);
} else if (0 && frycAPI_host("labfiz1p.if.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}

		body{
			filter: invert(1) hue-rotate(180deg);
			background: none;
			background-color: black;
		}

		#ucss-code-wrapper {
			filter: invert(1) hue-rotate(180deg) !important;
		}
	`);
} else if (1 && frycAPI_host("latarnikwyborczy.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.content-questionnaire .answer-candidates .answer {
			background-image: url(${frycAPI.get_res_url("arrow-down.png")});
		}
	`);
} else if (1 && frycAPI_host("linuxconfig.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.asciinema-player.asciinema-theme-asciinema {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("llamalab.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.background-image.cover.hero-background {
			display: none;
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`:is(h1,h2,h3,h4,h5,h6)[id]`, heading => {
			heading.innerHTML = `<a href="${location.origin + location.pathname + "#" + heading.id}">${heading.innerText}</a>`;
		});
		frycAPI.for_each(`li[id]:has(> em)`, li => {
			const em = li.frycAPI_elem_by_tag("em");
			em.innerHTML = `<a href="${location.origin + location.pathname + "#" + li.id}">${em.innerText}</a>`;
		});
	});
} else if (1 && frycAPI_host("mail.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/* .aD::before, .btn::before, .btl.acK, .bs3::before, .T-axO .J-JN-M-I-JG, .J-Z .aaA.aaB, .J-J5-Ji.J-Z-M-I-JG {
			filter: invert(1);
		} */

		/*
		body::-webkit-scrollbar {
		width:15px !important;
		}

		body::-webkit-scrollbar-track {
		background:rgb(47, 54, 60) !important;
		}

		body::-webkit-scrollbar-thumb {
		background:rgb(102, 254, 123) !important;
		border-width:2px !important;
		border-style:solid !important;
		border-color:rgba(0, 0, 0, 0.5) !important;
		border-radius:7.5px !important;
		}

		body::-webkit-scrollbar-thumb:hover {
		background:rgba(0, 230, 42, 1) !important;
		border-width:2px !important;
		border-style:solid !important;
		}

		body::-webkit-scrollbar-thumb:active {
		border-width:2px !important;
		border-style:dotted !important;
		}
		*/

		/* .aYi.cQ {
			color: #fff;
		} */

		.pG>.a9q {
			background-position: center;
		}

		/* .agJ:hover, .agJ.bjE {
			background: rgb(71 70 70 / 31%);
		} */

		/*
		[dir="ltr"] {
			filter: invert(1) hue-rotate(180deg);
		}
		*/

		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.set_default_date_style().mode.absolutny_czas();
		const opts = {
			get_date: elem => elem.innerText.replace("CEST", "+0200").replace("CET", "+0100"),
			date_opts: {
				print_date: frycAPI.get_date_formatter({
					second: "2-digit",
				}),
			},
		};
		frycAPI.create_mut_obs(() => {
			// loguj("MutObs");
			frycAPI.set_default_date(`div:has(span[email="noreply-apps-scripts-notifications@google.com"]:not([translate])) :is(table ~ table, table:only-of-type) tr > td:is(:first-child, :last-child)`, opts);
		});
	});
} else if (1 && frycAPI_host("mat-fiz-samouczek.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img.teximage {
			background-color: #ffffff;
			border: 5px solid white;
			border-radius: 3px;
		}
	`);
} else if (1 && frycAPI_host("matematykaszkolna.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("matlab.mathworks.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.textElement.eoOutputContent {
			user-select: text !important;
		}
	`);
} else if (1 && frycAPI_host("matma4u.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("matrixcalc.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		a[title="Бе́ло-кра́сно-бе́лый флаг"] {
			display: none !important;
		}
		mtr:not(:last-child) {
			height: 25px;
		}
	`);
} else if (1 && frycAPI_host("oeis.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(1) hue-rotate(180deg);
		}
		body {
			background-color: black;
		}
	`);
} else if (1 && frycAPI_host("ostatnidzwonek.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			background: none;
			background-color: white;
		}
	`);
} else if (1 && frycAPI_host("palobby.com")) {
	frycAPI.line = frycAPI.get_line_number();
	const FUNKCJE = "PAT_DB_Unit_Korekta";
	frycAPI.inject_style_on_load(/*css*/`
		.clearfix~div.columns div {
			margin-right: 0;
		}
		.clearfix~div.columns {
			align-items: unset;
		}
		.clearfix~div.columns ul.list-unstyled>li:has(a.default) {
			display: flex;
		}
		span[title="Build Time"] {
			margin-left: auto;
			padding-left: 5px;
			padding-right: 3px;
		}
		span[title="Build Time"]:last-child {
			padding-right: 0px;
		}
		span[title="Cooldown Time"] {
			padding-left: 3px;
			padding-right: 3px;
		}
		span[title="Rolloff Time"],
		span[title="Cooldown Time"]:last-child{
			padding-left: 3px;
			padding-right: 0px;
		}
		span[title="Build Time"],
		span[title="Cooldown Time"],
		span[title="Rolloff Time"] {
			align-self: center;
		}
		.clearfix~div.columns ul.list-unstyled>li:has(a.default) {
			font-family: monospace;
		}
		/*
		.content:has(.clearfix) > .columns ~ .columns > div {
			border-top: 1px solid #eee;
		}
		*/
		hr.clearfix {
			/*display: none;*/
		}
		.content:has(.clearfix) > div.columns > div {
			border: 0px solid #eee;
			padding: 0px 15px;
		}
		.content:has(.clearfix) > div.columns > div ~ div {
			border-left: 0px;
		}
		.content:has(.clearfix) > div.columns ~ div.columns > div {
			border-top: 0px;
		}
		.content:has(.clearfix) > div.columns {
			margin-top: 20px;
		}
		.content:has(.clearfix) > div.columns ~ div.columns {
			margin-top: 0px;
		}

		body {
			height: fit-content;
			box-sizing: border-box;

			> svg {
				display: none;
			}
		}
		body, * {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		div.columns {
			display: inline-flex;
			max-height: ${frycAPI.path.startsWith("/units/unit") ? "88vh" : "104vh"};
			gap: 7px;
			flex-direction: column;
			align-content: flex-start;
			align-items: stretch;

			div {
				margin: 0;
				padding: 0;

				h2, ul {
					margin: 0;
				}
			}
			& ~ .columns {
				padding-left: 10px;
			}
		}
		.clearfix ~ div.columns ul.list-unstyled > li:has(a.default) {
			display: flex;

			a {
				flex-grow: 1;
			}
		}
		span.unit-value {
			color: #7ee774 !important;
		}
		div.unit-header {
			> :first-child, h1 {
				white-space: nowrap;
			}
			> :last-child {
				display: flex;
				gap: 10px;
			}
		}
		#content table {
			th {
				font-weight: bold;
			}
			td.name {
				padding: 0;
				box-sizing: border-box;
				height: 77px;

				a {
					display: flex;
					align-items: center;
					width: 100%;
					height: 100%;
					padding: 8px;
					gap: 8px;
					box-sizing: border-box;
				}
			}
		}
		table th {
			background-color: rgba(33, 37, 41, 1) !important;
		}

		.list-unstyled a {
			width: 100%;
			display: block;
		}
		img.strategic-icon-small, img.buildbar-small, img.thumbnail-small {
			height: 30px;
		}
	`);

	frycAPI.on_load_setter(() => {
		frycAPI.change_favicon_res("titans_icon.png");

		if (frycAPI.q_sel("span[title='Rolloff Time']") && frycAPI.q_sel("div.columns>div:nth-child(2) h4")?.innerText === "Physics") {
			const zbud_przez = document.querySelectorAll("h4 + ul.list-unstyled").find(el => el.prev_el.innerText === "Built By");
			const span_rolloff_time = frycAPI.elem("span").attr("title", "Rolloff Time").class("dodane", "unit-value").text("0:00")._;
			for (const zbud_child of zbud_przez.children) {
				if (zbud_child.querySelector("span[title='Rolloff Time']") === null) {
					zbud_child.appendChild(document.createTextNode(" + "));
					zbud_child.appendChild(span_rolloff_time.cloneNode(1));
				}
			}
			loguj("Done!");
		}

		if (frycAPI.path === "/units/") {
			frycAPI.for_each(`#content .columns > div > ul:not(:only-of-type):not(:first-of-type)`, da_elem => {
				const cont = frycAPI.elem("div", 0);
				cont.appendChild(da_elem.prev_el);
				da_elem.parentElement.insertAdjacentElement("afterEnd", cont);
				cont.appendChild(da_elem);
			});
		}

		if (frycAPI.path.startsWith("/units/compare") || frycAPI.path.startsWith("/units/unit")) {
			const columns_cost = {};
			frycAPI.for_each(`#content h4`, da_elem => {
				if (da_elem.innerText === "Overview") {
					const ul = da_elem.next_el.next_el;
					const keys = ul.getElementsByClassName("unit-key");
					const cost = parseInt(keys.find(el => el.innerText === "Build cost")?.next_el.innerText);
					if (Number.isNaN(cost)) return;
					columns_cost[da_elem.parentElement.parentElement.frycAPI_child_index] = cost;
					const dps = parseFloat(keys.find(el => el.innerText === "Total DPS")?.next_el.innerText);
					if (Number.isNaN(dps)) return;
					const new_value = ul.last_el.cloneNode(1);
					new_value.frycAPI_elem_by_class("unit-key").innerText = "DPS per cost";
					new_value.frycAPI_elem_by_class("unit-value").innerText = (dps / cost).toFixed(3);
					ul.appendChild(new_value);
				} else if (da_elem.innerText === "Economy") {
					const ul = da_elem.next_el;
					const keys = ul.getElementsByClassName("unit-key");
					for (const prod_elem of [keys.find(el => el.innerText === "Energy production"), keys.find(el => el.innerText === "Metal production")]) {
						if (!prod_elem) continue;
						const production = parseInt(prod_elem.next_el.innerText);
						if (Number.isNaN(production)) continue;
						const cost = columns_cost[da_elem.parentElement.parentElement.parentElement.frycAPI_child_index];
						if (!cost) continue;
						let new_value = ul.last_el.cloneNode(1);
						new_value.frycAPI_elem_by_class("unit-key").innerText = `${prod_elem.innerText} per cost`;
						new_value.frycAPI_elem_by_class("unit-value").innerText = (production / cost).toFixed(3);
						prod_elem.parentElement.insertAdjacentElement("afterEnd", new_value);
						if (prod_elem.innerText !== "Metal production") continue;
						new_value = ul.last_el.cloneNode(1);
						new_value.frycAPI_elem_by_class("unit-key").innerText = `Investment return after`;
						new_value.frycAPI_elem_by_class("unit-value").innerText = (cost / production).toFixed(1) + " s";
						prod_elem.parentElement.insertAdjacentElement("afterEnd", new_value);
					}
				}
			});
		} else if (frycAPI.path.startsWith("/units/table")) {
			const table = frycAPI.q_sel(`#content table`);
			if (table) {
				const rows = table.tBodies[0].children;
				const headers = table.tHead.children[0].children;

				const cost_cls = headers.find(h => h.innerText === "Cost")?.className;
				const dps_header = headers.find(h => h.innerText === "DPS");
				const dps_cls = dps_header?.className;
				if (cost_cls && dps_cls) {
					dps_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("DPS per cost")._);
					for (const row of rows) {
						const dps_td = row.frycAPI_elem_by_class(dps_cls);
						dps_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text(
							((parseFloat(dps_td.innerText) / parseFloat(row.frycAPI_elem_by_class(cost_cls).innerText)) || 0).toFixed(3)
						)._);
					}
				}

				const range_header = headers.find(h => h.innerText === "Range");
				const range_cls = range_header?.className;
				if (cost_cls && dps_cls && range_cls) {
					range_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("DPS/C*R²")._);
					range_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("DPS*R²")._);
					for (const row of rows) {
						const dps_td = row.frycAPI_elem_by_class(dps_cls);
						const range_td = row.frycAPI_elem_by_class(range_cls);
						range_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text(
							((parseFloat(dps_td.innerText) / parseFloat(row.frycAPI_elem_by_class(cost_cls).innerText) * parseFloat(range_td.innerText) ** 2) || 0).toFixed(1)
						)._);
						range_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text(
							((parseFloat(dps_td.innerText) * parseFloat(range_td.innerText) ** 2) || 0).toFixed(1)
						)._);
					}
				}

				const metal_header = headers.find(h => h.innerText === "M Rate");
				const metal_cls = metal_header?.className;
				if (metal_cls) {
					metal_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("Investment return time [s]")._);
					metal_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("Metal per cost")._);
					for (const row of rows) {
						const metal_rate_td = row.frycAPI_elem_by_class(metal_cls);
						const metal_rate = parseFloat(metal_rate_td.innerText) || 0;
						const cost = parseFloat(row.frycAPI_elem_by_class(cost_cls).innerText) || 0;
						metal_rate_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text( // Investment
							metal_rate ? (cost / metal_rate).toFixed(1) : "-1"
						)._);
						metal_rate_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text( // MPC
							(metal_rate / cost).toFixed(3)
						)._);
					}
				}

				const energy_header = headers.find(h => h.innerText === "E Rate");
				const energy_cls = energy_header?.className;
				if (energy_cls) {
					energy_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("Energy per cost")._);
					for (const row of rows) {
						const energy_rate_td = row.frycAPI_elem_by_class(energy_cls);
						energy_rate_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text( // EPC
							((parseFloat(energy_rate_td.innerText) / parseFloat(row.frycAPI_elem_by_class(cost_cls).innerText)) || 0).toFixed(3)
						)._);
					}
				}

				const build_rate_header = headers.find(h => h.innerText === "Build Rate");
				const build_rate_cls = build_rate_header?.className;
				if (build_rate_cls) {
					build_rate_header.insertAdjacentElement("afterEnd", frycAPI.elem("th").text("Build rate per cost")._);
					for (const row of rows) {
						const build_rate_td = row.frycAPI_elem_by_class(build_rate_cls);
						build_rate_td.insertAdjacentElement("afterEnd", frycAPI.elem("td").text( // EPC
							((parseFloat(build_rate_td.innerText) / parseFloat(row.frycAPI_elem_by_class(cost_cls).innerText)) || 0).toFixed(3)
						)._);
					}
				}

				const fixed_floating_point = frycAPI.filled_array(0, headers.length);
				const floating_part_regex = /\.(.*)/;
				const trailing_zeros_regex = /0+$/g;
				const first_numeric_col_idx = 2;
				const dps_value_threshold = 0.1;
				for (const row of rows) {
					for (let i = first_numeric_col_idx; i < row.children.length; i++) {
						const td = row.children[i];
						const value_text = td.innerText;
						let floating_point_part = value_text.match(floating_part_regex);
						if (!floating_point_part) continue;
						floating_point_part = floating_point_part[1].replaceAll(trailing_zeros_regex, "");
						if (!floating_point_part) continue;
						const floating_point_len = (floating_point_part.length === 1 || floating_point_part.every(char => char === floating_point_part[0])) ? 1 : (
							(td.className === dps_cls && parseFloat(value_text) < dps_value_threshold) ? 0 : floating_point_part.length
						);
						if (fixed_floating_point[i] < floating_point_len) { // find max
							fixed_floating_point[i] = floating_point_len;
						}
					}
				}
				for (const row of rows) {
					for (let i = first_numeric_col_idx; i < row.children.length; i++) {
						row.children[i].innerText = (parseFloat(row.children[i].innerText) || 0).toFixed(fixed_floating_point[i]);
					}
				}

				for (const header of headers) {
					header.setAttribute("krytSort", header.frycAPI_has_class("name") ? "default" : "numeric");
				}
				frycAPI.make_table_sortable(table, `tbody > tr`);
			}
		}

		let hovered_link = null;
		document.addEventListener("mouseover", e => {
			const link = e.target.closest("a[href]");
			hovered_link = link ? link.href : null;
		});
		document.addEventListener("mouseout", e => {
			if (e.target.closest("a[href]")) hovered_link = null;
		});
		document.addEventListener("keydown", e => {
			if (e.key !== "c") return;
			if (!hovered_link) return; // no link under mouse, do nothing

			navigator.clipboard.writeText(hovered_link)
			.then(() => loguj("Copied:", hovered_link))
			.catch(err => console.error("Copy failed:", err));
		});
	}, 0);
} else if (1 && frycAPI_host("pl.wikibooks.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  4
else if (1 && frycAPI_host_includes("wikipedia.org") && !frycAPI.path.startsWith("/api/")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img.thumbimage[src*=".png"],
		img.thumbimage[src*=".gif"]
		{
			filter: invert(1) hue-rotate(180deg);
			background-color: #c9c9c9;
		}

		.relative-date-loading::after {
			content: "";
			height: 12px;
			width:  12px;
			display: inline-block;
			background: url("${frycAPI.get_res_url("loading small.gif")}");
			background-size: contain;
			background-repeat: no-repeat;
		}

		html, body, * {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		.mw-body h1, .mw-body h1 *, .mw-body .mw-heading1, .mw-body-content h1, .mw-body-content .mw-heading1, .mw-body-content h2, .mw-body-content .mw-heading2 {
			font-family: Cambria, serif !important;
		}
		body.skin--responsive, #menus-cover-background {
			background-image: none !important;
		}
		:is(pre, code, tt, kbd, samp, .mw-code) * {
			font-family: monospace, monospace;
		}

		[id]:is(h1,h2,h3,h4,h5,h6) {
			cursor: pointer;
		}
	`);

	frycAPI.on_load_setter(function () {
		// #region //* Get relative date on hover
		const footer = document.getElementById("footer-info-lastmod");
		if (footer) {
			footer.innerText = footer.innerText.trim().replace(".", "");
			footer.appendChild(frycAPI.elem("span").text(" - Hover to get relative date.")._).addEventListener("mouseenter", async e => {
				const me = e.target;
				try {
					const data_obj_elem = document.querySelector(`script[type="application/ld+json"]`);
					if (!data_obj_elem) throw new Error("Could not find data_obj_elem.");
					const page_name = data_obj_elem.innerText.jsón.name;
					if (!page_name) throw new Error("Could not get page_name.");

					me.frycAPI_add_class("relative-date-loading");
					me.innerHTML = " -&nbsp;";
					const response = await fetch(`https://${location.hostname}/api/rest_v1/page/summary/${page_name}`);
					if (!response.ok) {
						throw new Error(`Response was not OK.\nStatus: ${response.status}.\nStatus text: ${response.statusText}.\nPage name: ${page_name}`);
					}

					const obj = await response.json();
					const timestamp = obj.timestamp;
					if (!timestamp) {
						loguj(obj);
						throw new Error(`Timestamp was not present on the response object. The object was logged to console.`);
					}

					me.innerText = ` - ${frycAPI.print_rel_time(new Date(timestamp).getTime())}.`;
				} catch (err) {
					console.error(err);
					me.innerText = " - Something went wrong. Check console for errors.";
				}

				me.frycAPI_remove_class("relative-date-loading");
			}, { once: true });
		}
		// #endregion
		// #region //* Make headings clickable
		frycAPI.for_each(`[id]:is(h1,h2,h3,h4,h5,h6)`, da_elem => {
			da_elem.addEventListener("click", function (e) {
				location.hash = "#" + da_elem.id;
			});
		});
		// #endregion
	});
} else if (1 && frycAPI_host("pl.wikisource.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.mwe-math-fallback-image-inline {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("planetcalc.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(0) hue-rotate(180deg) !important;
		}
		/*
		.x_.j0[style="display: block; opacity: 1;"] {
			border-top: 1px solid black;
		}
		*/
		.x_.j0>.o8 {
			font-size: 1.25rem;
			margin-bottom: 5px;
			color: #fa7014;
		}

		.fuse-slot:has([id*="google_ads_iframe"]) {
			display: none;
		}
	`);

	frycAPI.create_manual_functions("Planet Calc", {
		func_arr: [
			(name = "Łatwiejsze kopiowanie", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					const x = document.querySelectorAll(".mrow>.texatom>.mrow>span.msubsup>span>span>span.mn");
					for (let i = 0; i < x.length; i++) {
						x[i].innerHTML = "(" + x[i].innerHTML + ")";
					}
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("quicklatex.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(1);
			background: transparent !important;
		}
	`);
} else if (1 && frycAPI_host("robotyka.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img[src*=".gif"],
		img[src*=".png"]{
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("scripty.abhisheksatre.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.ant-drawer-content-wrapper {
			width: 1295px !important;
		}
		.CodeMirror.cm-s-default {
			height: 520px;
		}
		.ant-switch:not(.ant-switch-checked) {
			background-color: rgb(147 147 147);
		}
	`);
} else if (1 && frycAPI_host("second.wiki")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("soundcloud.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.playableTile__image>.sc-artwork>span {
		}

		#cont {
			position: absolute;
			z-index: 9999;
			background-color: white;
			padding: 10px;
			font-family: IBM Plex Sans;
			display: flex;
		}
		#cont div {
			padding: 5px 10px;
			border: 1px solid black;
			border-left: 0px;
		}
		#licz {
			border: 1px solid black !important;
		}
	`);

	frycAPI.create_manual_functions("SoundCloud", {
		func_arr: [
			(name = "Get Covers From SoundCloud", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					const artwork = document.querySelectorAll(".playableTile__image>.sc-artwork>span");
					new_div = document.createElement("div");
					new_div.setAttribute("id", "mojelem");
					for (let i = 0; i < 184; i++) {
						new_div.innerHTML += getComputedStyle(artwork[i]).getPropertyValue("background-image");
						new_div.innerHTML += "<br>";
					}
					document.body.insertBefore(new_div, document.getElementById("app"));
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host_includes("stackoverflow.com", "stackexchange.com", "superuser.com", "serverfault.com", "askubuntu.com", "stackapps.com", "mathoverflow.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		:root {
			color-scheme: dark;
		}
		:is(#user-profile-button, .user-info) .-flair {
			display: flex !important;
		}
		.user-info > .d-flex {
			flex-direction: column;
		}
		.reputation-score {
			color: var(--black-400);
			display: flex;
			align-items: center;
		}
		span[title*="bronze"], span[title*="silver"], span[title*="gold"] {
			padding: 0px 2px !important;
			margin: 0 !important;
		}
		li.-badges.-flair {
			height: 19px;
		}

		/* Zaznacz każdy */
		.-flair > span[title] {
			/* display: flex !important; */
			border: 1px solid #797979;
			margin: 0px;
			border-radius: 4px 0px 0px 4px;
			padding: 0px 2px;
			/* align-items: center; */
			text-wrap: nowrap;
		}

		/* Zaznacz nie pierwszy */
		.-flair > span[title] ~ span[title] {
			border-left: 0px !important;
			border-radius: 0px 0px 0px 0px;
		}

		/* Zaznacz ostatni */
		.-flair > span[title]:not(:has( ~ span[title])) {
			border-radius: 0px 4px 4px 0px;
		}
		.-flair > span[title]:not(:has( ~ span[title])):first-of-type {
			border-radius: 4px;
		}

		.myDiv {
			display: flex;
			width: fit-content;
		}
		.post-signature {
			width: fit-content;
		}
		.user-info .user-gravatar32,
		.gravatar-wrapper-32,
		.gravatar-wrapper-32 img {
			width: auto;
			height: auto;
		}
		.user-info .user-gravatar32,
		.gravatar-wrapper-32,
		.gravatar-wrapper-32 img{
			width: 40px;
			height: 40px;
		}
		body${"[class]".repeat(8)} {
			&, & * {
				--my-font: "IBM Plex Sans Condensed";
				--ff-sans: var(--my-font);
				--theme-body-font-family: var(--my-font);
				--theme-post-title-font-family: var(--my-font);
				--theme-post-body-font-family: var(--my-font);
			}
		}
		${!frycAPI_host("stackoverflow.com") ? /*css*/`
			body${"[class]".repeat(8)} {
				&, * {
					--my-bg: var(--darkreader-neutral-background);
					--darkreader-bg--my-bg: var(--darkreader-neutral-background);
					/* --my-bg-accent: #0E151C; */
					--my-bg-accent: #234567;
					/* --my-bg-accent: var(--theme-button-primary-background-color); */
					--darkreader-border--my-bg-accent: var(--my-bg-accent);
					--darkreader-bg--black-150: var(--my-bg-accent);
					--darkreader-border--black-200: var(--my-bg-accent);
					--darkreader-border--theme-content-border-color: var(--my-bg-accent);
					--darkreader-bg--theme-header-background-color: var(--my-bg-accent);
					--darkreader-bg--_bu-filled-bg: var(--my-bg-accent);
					--darkreader-border--_no-bc: var(--my-bg-accent);
					--darkreader-border--blue-400: var(--my-bg-accent);
					--darkreader-border--_bu-outlined-bc: var(--my-bg-accent);
					--darkreader-bg--_bu-outlined-bg: var(--my-bg-accent);

					--my-bg-accent-bright: color-mix(in srgb, var(--my-bg-accent), white 10%);
					--darkreader-bg--_bu-filled-bg-hover: var(--my-bg-accent-bright);
					--darkreader-text--theme-link-color-visited: var(--my-bg-accent-bright);

					--my-bg-accent-dark-1: color-mix(in srgb, var(--my-bg-accent), black 10%);
					--darkreader-bg--theme-post-owner-new-background-color: var(--my-bg-accent-dark-1);

					--my-bg-accent-dark-2: color-mix(in srgb, var(--my-bg-accent), black 30%);
					--darkreader-bg--theme-post-owner-background-color: var(--my-bg-accent-dark-2);

					--my-fg-accent: color-mix(in srgb, var(--my-bg-accent), white 40%);
					--darkreader-text--theme-link-color: var(--my-fg-accent);
					--my-fg-accent-bright: color-mix(in srgb, var(--my-fg-accent), white 30%);
					--darkreader-text--theme-link-color-hover: var(--my-fg-accent-bright);
				}
				.s-tag.post-tag,
				.show-votes .sidebar-linked .spacer > a:first-child .answer-votes,
				.show-votes .sidebar-related .spacer > a:first-child .answer-votes,
				.s-prose .spoiler {
					--darkreader-bg--black-150: #272a2b;
					--darkreader-bg--black-600: #cccac6;
				}
			}
			button[class^="js-vote"] {
				filter: none !important;
				border-color: var(--my-bg-accent) !important;
				background-color: var(--my-bg) !important;
				path {
					color: var(--my-bg-accent) !important;
				}
				&:hover {
					border-color: var(--my-bg-accent-bright) !important;
					path {
						color: var(--my-bg-accent-bright) !important;
					}
				}
				&[aria-pressed="true"] {
					background-color: var(--my-bg-accent) !important;
					path {
						color: var(--my-bg) !important;
					}
				}
				&[aria-pressed="true"]:hover {
					background-color: var(--my-bg-accent-bright) !important;
				}
			}
			.wmd-button {
				& > span {
					background-position-y: 0px !important;
				}
				&:hover > span {
					filter: brightness(1.6);
				}
			}
			.s-input:focus, .s-textarea:focus, .s-input:focus-within, .s-textarea:focus-within {
				box-shadow: none;
				outline: none !important;
			}
			.wmd-help-button.active-help {
				background-color: transparent;
			}
			.question-hyperlink, .answer-hyperlink {
				color: var(--theme-link-color);
				&:hover {
					color: var(--my-fg-accent-bright);
				}
				&:visited {
					color: var(--my-bg-accent-bright);
				}
				&:hover:visited {
					color: var(--my-fg-accent);
				}
			}
			.nav-links .youarehere .nav-links--link .svg-icon {
				background-color: transparent !important;
				border-radius: 0px !important;
			}
			.s-sidebarwidget:not(.s-sidebarwidget__yellow) {
				&::after, &::before {
					content: none;
				}
				& {
					border: 1px solid var(--my-bg-accent) !important;
				}
				.s-sidebarwidget--header{
					border: 0;
				}
			}
			.s-notice .s-btn.s-btn__outlined {
				border-width: 0px;
				color: var(--_bu-filled-fc);
			}
			.site-header {
				background-image: unset;
			}
			.site-header .site-header--link {
				color: #d3d1cf;
			}
			#content {
				border-width: 0px 0px 0px 1px;
				border-radius: 0px;
			}
			#content, ul.comments-list .comment > * {
				border-color: var(--my-bg-accent) !important;
			}
			.s-btn.s-btn__filled {
				background-color: var(--my-bg-accent);
			}
			body, .s-topbar, .site-footer, #content {
				background-color: var(--my-bg);
			}
			.s-topbar {
				border-bottom: 1px solid var(--my-bg-accent);
			}
			.site-footer {
				border-top: 1px solid var(--my-bg-accent);
			}
			#qlist-wrapper {
				& {
					border: 1px solid var(--my-bg-accent);
					border-left: 0px;
				}
			}
			.s-btn-group {
				& {
					border: 1px solid var(--my-bg-accent);
				}
			}
			.s-tag.post-tag {
				& {
					border: 0px;
					background-color: hsl(195, 4%, 17%);
					color: rgb(165, 160, 151);
				}
				&:hover {
					filter: brightness(1.3);
				}
			}
		` : ""}
		#qlist-wrapper {
			margin-bottom: 24px;
		}
		#question-mini-list {
			margin-bottom: 0px;
		}
		.s-post-summary .s-post-summary--meta-tags {
			flex-basis: 100%;
		}
		.owner {
			/* background-color: color-mix(in srgb, var(--theme-post-owner-background-color), black 70%); */
			/* background-color: color-mix(in srgb, var(--theme-post-owner-background-color), white 8%); */
		}
		span[title*="badge"] {
			display: flex;
			align-items: center;
		}
		.user-details {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
		#answers {
			padding-top: 0;
			border-top: 1px solid var(--theme-content-border-color);
			margin-top: 10px;
		}

		:root:has(meta[property="og:site_name"][content="Signal Processing Stack Exchange"]) {
			.badge1 {
				background-position-x: -100px;
			}
			.badge2 {
				background-position-x: -80px;
			}
			.badge3 {
				background-position-x: -60px;
			}
		}

		ul.comments-list {
			.comment-actions {
				display: flex;
			}
			.comment-voting {
				position: relative;
				> a {
					position: absolute;
					top: 2px;
				}
			}
			.comment-score {
				text-align: right;
			}
		}

		body.theme-dark .s-topbar .s-topbar--logo .-img,
		.theme-dark__forced .s-topbar .s-topbar--logo .-img,
		body.theme-system .theme-dark__forced .s-topbar .s-topbar--logo .-img {
			filter: invert(1) hue-rotate(180deg) brightness(1.3);
		}

		.comment-body {
			/* display: flex; */
			> .ai-center {
				color: var(--theme-link-color, var(--theme-secondary-400));
			}
			> :is(.ai-center, .comment-copy)::after {
				content: "–";
				/* content: "|"; */
				padding-left: 3px;
				color: #cccac6;
			}
		}

		.s-topbar .s-topbar--item:not(.s-topbar--item__unset) {
			--darkreader-bg--_tb-item-bg: transparent;
		}

		.comment-text code {
			padding: 1px 2px;
		}

		.s-notice.s-notice__info {
			margin-top: var(--su16) !important;
		}

		.s-user-card .s-user-card--time {
			overflow: visible;
		}

		${frycAPI_host("puzzling.stackexchange.com") ? /*css*/`
			.site-header .site-header--link > img {
				filter: contrast(1.7) brightness(0.9);
			}
		` : ""}
		${frycAPI_host("stats.stackexchange.com") ? /*css*/`
			.site-header .site-header--link > img {
				filter: brightness(1.7);
			}
		` : ""}
		${frycAPI_host("gaming.stackexchange.com") ? /*css*/`
			.site-header .site-header--container {
				background-image: url("https://cdn.sstatic.net/Sites/gaming/img/header-foreground-image03.gif?v=330ce6fa0066"), url("https://cdn.sstatic.net/Sites/gaming/img/header-foreground-image01.png?v=069bf27565ea");
			}
		` : ""}

		.hide {
			display: none;
		}

		/* gaming.stackexchange.com */
		/* .site-header .site-header--container {
			background-image: url(img/header-foreground-image03.gif?v=330ce6fa0066), url(img/header-foreground-image01.png?v=069bf27565ea);
		} */

		/* puzzling.stackexchange.com */
		/* div.my-bg {
			background-color: var(--theme-background-color);
			background-image: url(https://cdn.sstatic.net/Sites/puzzling/img/site-background-image.svg?v=c0585d868bdd), linear-gradient(to bottom, #fffed6 0, #bbba9e 270px, #2dbab4 900px);
			background-position: var(--theme-background-position);
			background-repeat: var(--theme-background-repeat);
			background-size: var(--theme-background-size);
			background-attachment: var(--theme-background-attachment);
			position: absolute;
			width: 100%;
			height: 100%;
			z-index: -300;
			filter: invert(1) hue-rotate(180deg);
		} */

		.js-zone-container:has([id^="google_ads_iframe"]) {
			display: none;
		}

		.my-button {
			position: absolute;
			top: 8px;
			left: 152px;
			background-color: hsl(0deg 0% 25%);
			color: white;
			border-radius: 4px;
			width: max-content;
			padding: 3px 5px;
			cursor: pointer;
			font-size: 15px;
		}
		:has(> .my-button) {
			position: relative;
		}
	`);

	frycAPI.on_load_setter(() => {
		if (frycAPI_host_includes("stackoverflow.com")) {
			frycAPI.change_favicon_res("Stack Overflow.ico");
		}

		frycAPI.for_each(".user-info:has(.user-gravatar32)", da_elem => { // Better avatar design
			const my_div = document.createElement("div");
			my_div.classList.add("myDiv");
			da_elem.querySelector(".user-action-time").insertAdjacentElement("afterend", my_div);
			let el;
			el = da_elem.querySelector(".user-gravatar32"); if (el !== null) my_div.appendChild(el);
			el = da_elem.querySelector(".user-details");    if (el !== null) my_div.appendChild(el);
		});
		frycAPI.for_each("span.s-badge__staff, span.mod-flair, span.s-badge__moderator, .s-badge.s-badge__xs", da_elem => { // Moved staff/moderator/bot indicator to user name
			da_elem.previousElementSibling?.appendChild(da_elem);
		});

		document.querySelectorAll(`:is(.-badges, .-flair) > span.v-visible-sr`).forEach(el => el.remove());
		const badges = document.querySelector(`.-badges`);
		if (badges) {
			const rep = badges.previousElementSibling;
			badges.frycAPI_insert_html("afterbegin", `<span class="reputation-score" title="${rep.getAttribute("title")}"><div>${rep.frycAPI_get_first_text_node_content()}</div></span>`);
			badges.frycAPI_add_class("-flair");
			rep.remove();
		}

		// Better date
		frycAPI.set_default_date_style().mode.relatywny_czas().float_left();
		const get_date = elem => {
			const title = elem.title;
			elem.title = "";
			return title.replace(/,.*/, "");
		};
		frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
			// #region //* Lepsza data
			// const t1 = performance.now();
			frycAPI.set_default_date(`.user-action-time > .relativetime`, {
				get_date: get_date,
				date_enum_style: frycAPI.set_default_date_enum.style.tool_tip_top,
				custom_style: `cursor: none;`,
			});
			frycAPI.set_default_date(`a.js-gps-track > .relativetime`, {
				get_date: get_date,
				date_enum_style: frycAPI.set_default_date_enum.style.tool_tip_top,
				// custom_style: `--tt-y: 1px;`,
			});
			frycAPI.set_default_date(`.comment-body:has(span[title] > svg.iconPencilSm, button.js-comment-edit, button.js-comment-delete) .relativetime-clean`, {
				get_date: get_date,
				date_enum_style: frycAPI.set_default_date_enum.style.tool_tip_center,
			});
			frycAPI.set_default_date(`.ai-center:has(.owner) + span.comment-date .relativetime-clean`, { get_date, custom_style: `--tt-y: 1px;` });
			frycAPI.set_default_date(`:is(.relativetime-clean, .relativetime)`, { get_date });
			frycAPI.set_default_date(`.s-user-card .s-user-card--time`, { get_date, custom_style: `cursor: none;` });
			// #endregion
			// #region //* Move user name to the beginning of the comment
			frycAPI.for_each(`.comment-body:not(.zmieniona-kolejność)`, da_elem => {
				da_elem.classList.add("zmieniona-kolejność");
				const author = da_elem.querySelector(`:scope > .ai-center`);
				author.frycAPI_get_first_text_node().remove();
				// author.frycAPI_append_html(`<span class="">&nbsp;–</span>`);
				da_elem.insertAdjacentElement("afterbegin", author);
			});
			// #endregion
			// #region //* Remove unnecessary "-" before names in comments
			frycAPI.for_each(`a.comment-user`, da_elem => {
				const hyphen_text_elem = da_elem.previousSibling;
				if (hyphen_text_elem?.textContent.trim() === "–") { // "–" !== "-"
					hyphen_text_elem.remove();
				}
			});
			// #endregion
			// #region //* Hide ads
			frycAPI.for_each(`div:not(.hide)`, da_elem => {
				if (da_elem.innerText.trim().toUpperCase() === "AD") {
					da_elem.classList.add("hide");
				}
			});
			// #endregion
			// const t2 = performance.now(); frycAPI.perf(t1, t2);
		});

		if (frycAPI.path.startsWith("/users/")) {
			const img = frycAPI.q_sel(`img.bar-sm.bar-md.d-block`);
			const parent = frycAPI.q_sel(`.d-flex.ai-center.fw-wrap.gs16`);
			if (img) {
				parent.appendChild(frycAPI.elem("div").text("Download avatar image").class("my-button")._).addEventListener("click", ev => {
					frycAPI.download_url(img.src.lóg, `${frycAPI_host()}${frycAPI.path.replaceAll("/", ";")};${img.alt}.png`);
				});
			}
		}
	});
} else if (1 && frycAPI_host("steamcommunity.com")) {
	frycAPI.line = frycAPI.get_line_number();
	// Dawid Sadowski: 232603985
	// Michał Roman: 96866084
	// Michał Łasica: 71831352
	const FRIENDS_PROFILE_ID = "96866084";

	frycAPI.inject_style_on_load(/*css*/`
		.qrcode_Bit_2Yuvr.qrcode_Active_274P1 {
			filter: invert(1) contrast(1);
		}

		/* specific-friend */
		.specific-friend {
			.blotter_daily_rollup_line {
				display: none;
				&:has(.blotter_rollup_avatar [data-miniprofile="${FRIENDS_PROFILE_ID}"]) {
					display: block;
				}
			}
			.blotter_block:not(:has(.blotter_daily_rollup)) {
				display: none;
				&:has(.blotter_author_block [data-miniprofile="${FRIENDS_PROFILE_ID}"]) {
					display: block;
				}
			}
		}

		#personalAchieve > br {
			display: none;
		}
		.achieveRow:has(.achieveUnlockTime) + .achieveRow:not(:has(.achieveUnlockTime)) {
			margin-top: 60px;
		}
		.achieveRow:last-child {
			margin-bottom: 0;
		}
		#BG_bottom {
			padding: 12px !important;

			br {
				display: none;
			}
		}
	`);

	frycAPI.on_load_setter(async () => {
		if (frycAPI.path === "/stats/563560/achievements/") {
			// Steam Alien Swarm Reactive Drop Achievments Alphabetical Sort
			frycAPI.inject_style(/*css*/`
				/*
				.achieveFill {
				display: none;
				}

				.achieveTxt {
					padding: 9px 6px;
				}
				.achieveTxtHolder {
					top: 1px;
				}
				*/
				.achieveFill {
					display: none;
				}
				.mojButt {
					color: white;
					position: fixed;
					top: 5px;
					left: 5px;
					width: 161px;
					height: 94px;
					cursor: pointer;
					border: none;
					border-radius: 5px;
					background: radial-gradient(hsl(193 71% 53% / 1), hsl(200 42% 13% / 1));
					box-shadow: 0 0 8px 1px black;
					text-shadow: 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000;
					-webkit-font-smoothing: antialiased;
					z-index: 999;
				}
				.mojButt[aktywny] ~ .achieveRow.unlocked {
					display: none;
				}
				.mojButt[aktywny] {
					filter: saturate(0);
				}
				.mojButt:hover {
					filter: brightness(1.2);
				}
				.mojButt[aktywny]:hover {
					filter: saturate(0) brightness(1.2);
				}
				.achieveTxt {
					padding: 9px 6px;
				}
				.achieveTxtHolder {
					top: 1px;
				}
				.achievePercent {
					float: none;
					position: absolute;
					margin-top: 0;
					margin-right: 0;
					right: 20px;
					top: 50%;
					transform: translateY(-50%);
				}
				.achieveRow {
					margin-bottom: 3px;
				}
				.compareImg {
					padding-left: 9px;
				}
			`);

			const achiev = document.querySelectorAll("#mainContents .achieveRow");

			// #region //* Część specjalna
			const achiev_obj = await frycAPI.get_res_data("Alien Swarm RD Achievments.json");
			achiev.forEach(function (da_elem, da_i, da_arr) {
				const h3 = da_elem.querySelector("h3");
				let h3_str = h3.innerHTML;
				const h5str = da_elem.querySelector("h5").innerHTML;
				if (h3_str.includes("Speedrun")) {
					const mission_str = h3_str.replace(/ ?Speedrun ?/gu, "");
					if (achiev_obj.hasOwnProperty(mission_str)) {
						h3.innerHTML = `A1 Speedrun | ${achiev_obj[mission_str].camp} | ${achiev_obj[mission_str].num.toString().padStart(2, "0")} | <b>${mission_str}</b>`;
					} else {
						h3.innerHTML = `A1 Speedrun | ~ | <b>${mission_str}</b>`;
					}
					// da_elem.classList.add("Speedrun");
				} else if (h3_str.includes("Campaign")) {
					h3_str = "Campaign " + h3_str.replace(/ ?Campaign ?/gu, "");
					if (h3_str.includes("Easy")) {
						h3.innerHTML = `A01 <b>${h3_str}</b>`;
					} else if (h3_str.includes("Normal")) {
						h3.innerHTML = `A02 <b>${h3_str}</b>`;
					} else if (h3_str.includes("Hard")) {
						h3.innerHTML = `A03 <b>${h3_str}</b>`;
					} else if (h3_str.includes("Insane")) {
						h3.innerHTML = `A04 <b>${h3_str}</b>`;
					} else {
						h3.innerHTML = `A05 <b>${h3_str}</b>`;
					}
				} else if (h3_str.includes("Outstanding Execution")) {
					h3.innerHTML = `A1 <b>${h3_str}</b>`;
				} else if (h5str.includes("Kill")) {
					if (h5str.includes(" with ")) {
						h3.innerHTML = `A21 Kill with | <b>${h3_str}</b>`;
					} else if (h5str.includes("Swarm.")) {
						h3.innerHTML = `A22 Kill Swarm | <b>${h3_str}</b>`;
					} else {
						h3.innerHTML = `A23 Kill | <b>${h3_str}</b>`;
					}
				}
			});
			// #endregion

			frycAPI.sort_elements(document.querySelector("#mainContents"), achiev, a => a.querySelector("h3").innerHTML);

			const butt = document.createElement("button");
			butt.setAttribute("onclick", "this.toggleAttribute('aktywny')");
			butt.classList.add("mojButt");
			butt.innerText = "Przełącz widoczność ukończonych osiągnięć";
			butt.setAttribute("aktywny", "");
			document.getElementById("mainContents").insertAdjacentElement("afterbegin", butt);
		} else if (frycAPI.path.startsWith("/profiles") && frycAPI.website_url.searchParams.get("tab") === "achievements") {
			frycAPI.set_default_date(`.achieveUnlockTime`, {
				get_date(elem) {
					let date_txt = elem.innerText.trim().replace("Unlocked ", "");
					if (date_txt.includes(", 20")) {
						date_txt = date_txt.replace(",", "").replace("@ ", "");
					} else {
						date_txt = date_txt.replace("@", new Date().getFullYear());
					}
					return new Date(date_txt.replace("pm", " pm").replace("am", " am"));
				},
				set_date(elem, data, date_opts) {
					elem.frycAPI_set_inner_html(/*html*/`<span>Unlocked </span>` + frycAPI.get_default_date_text(data, date_opts));
					return elem.firstElementChild;
				},
			});
			frycAPI.for_each("#personalAchieve > br", e => e.remove());
			frycAPI.by_id("personalAchieve").frycAPI_sort_children_reversible([
				[elem => elem.querySelector(".abs-czas")?.innerText ?? "", true],
				[elem => Boolean(elem.frycAPI_elem_by_tag("h3")?.innerText.endsWith("hidden achievements remaining")), false],
				[elem => elem.frycAPI_elem_by_tag("h3")?.innerText ?? "\uFFFF", false],
			]);
		}
	});

	frycAPI.create_manual_functions("Friend Activity", {
		func_arr: [
			(name = "Show only specific friend's activity", type = frycAPI_Pure_state) => {
				const f = new type({
					name: name,
					state_desc: ["Only specific friend: NO", "Only specific friend: YES"],
					state: 0,
				});
				f.callback = function (obj) {
					document.body.classList.toggle("specific-friend");
				};
				return f;
			},
		],
	});
} else if (0 && frycAPI_host("support.discord.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			filter: invert(1) hue-rotate(180deg);
		}
		img {
			filter: invert(1) hue-rotate(180deg);
		}
		p>span[style="color: #2e3338;"],
		a.sidenav-item,
		.post-body{
			filter: brightness(5);
		}
	`);
} else if (1 && frycAPI_host("support.microsoft.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(1) hue-rotate(180deg) !important;
		}

		img[itemprop="logo"] {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("teams.microsoft.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.fui-Flex.___1jvzdal.f22iagw.f1vx9l62.f10pi13n.f1g2edtw {
			display: none;
		}
	`);

	frycAPI.on_load_setter(() => {
		frycAPI.create_mut_obs(() => {
			frycAPI.set_default_date(`:is([data-tid="chat-pane-item"], [data-tid="reply-message-header"], [data-tid="post-message-subheader"]) time`, {
				get_date: elem => parseInt(elem.id.replace("timestamp-", "")),
			});
		});
	});
} else if (1 && frycAPI_host("tech.wp.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		iframe {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("terraria.gamepedia.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			image-rendering: pixelated;
		}
	`);
} else if (1 && frycAPI_host("tiger.chem.uw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("tplinkmodem.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		tr.head>th.table-head:nth-child(2) {
			width: 11% !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  5
else if (1 && frycAPI_host("translate.google.com", "translate.google.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.myButn {
			position: absolute;
			top: 20px;
			z-index: 9999;
			left: 300px;
		}
		.RvYhPd::before {
			content: none;
		}
		img.ECE1Qb, img.bJ6JAe {
			filter: invert(1) hue-rotate(180deg) contrast(73%) brightness(101%);
		}
		/*
		body::-webkit-scrollbar {
			all: initial;
		}
		body::-webkit-scrollbar-corner {
			all: initial;
		}

		body::-webkit-scrollbar-track {
			all: initial;
		}
		body::-webkit-scrollbar-thumb {
			all: initial;
		}
		body::-webkit-scrollbar-thumb:hover {
			all: initial;
		}

		body::-webkit-scrollbar-thumb:active {
			all: initial;
		}
		*/
	`);
	frycAPI.on_load_setter(() => {
		document.querySelector("[jsname='dnDxad']").addEventListener("click", function () {
			document.querySelector(`[jsname="T118cc"]`).click();
		});
	});
	window.onbeforeunload = e => "Are you sure?"; // as Translate Google is always open this acts like a close confirmation for the whole browser // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#:~:text=Returning%20any%20truthy%20value%20from%20the%20event%20handler%20function
} else if (1 && frycAPI_host("trello.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/* *::-webkit-scrollbar-thumb {
			background:rgb(102, 254, 123) !important;
		} */
		.js-list-actions.mod-card-back {
			display: flex;
			flex-direction: column-reverse;
		}
	`);
} else if (1 && frycAPI_host("u4.satisfactorytools.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.mojaklasa {
			display: none;
		}

		#SUS {
			position: absolute;
			right: 69px;
			top: 335px;
		}

		#IN {
		}

		#button {
		}
	`);
} else if (1 && frycAPI_host("moodle.usos.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		nav.list-group.mt-1 {
			margin-bottom: 27px;
		}
		.fixed-top2.navbar2 {
			display: none;
		}
		#page {
			margin-top: 46px;
		}
		.img-epwbt {
			margin: 10px;
		}
		#nav-drawer {
			top: 46px;
		}
		.img-ue {
			display: none;
		}
		[data-region="drawer"] {
			height: calc(100% - 50px);
		}
		div#region-main-box {
			background-color: #000;
		}
		.message-app .message.received .tail {
			border-bottom-color: hsl(0deg 0% 24%);
			filter: brightness(0.42);
		}
		.message-app .message.send .tail {
			border-bottom-color: hsl(210deg 14% 25%);
		}
	`);
} else if (1 && frycAPI_host("usosweb.usos.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.UUID = "2025-01-11 22:33";
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed
		}
		/*
		#layout-c22a > div{
			background-position-x: -958px !important;
		}
		*/
		body {
			background-color: rgb(240 240 240);
			background-image: none;
			min-height: 100vh;
			margin: 0;
			padding: 0;
			font-size: 14px;
			/*
			transition: all ease-in-out;
			transition-duration: 2s;
			*/
		}
		/*
		#layout-c21 {
			color: black !important;
			background-color: rgba(220, 220, 220, 0.6);
			background-blend-mode: overlay;
		}
		#layout-c21 a, #layout-c21 a:visited,   #layout-c21 a:active, #layout-c21 a:hover {
			color: black !important;
		}
		#layout-c12-t .m a {
			text-shadow: 0px 0px 2px #000;
			background-position-y: 20% !important;
		}
		#layout-c12-t .m a {
			transition: all 0.4s;
		}
		#layout-c12-t .m a:hover, #layout-c12-t .m a:focus {
			transition: all 0.4s;
			background-color: #DDAC00;
		}
		*/
		/*
		td[style*="height: 17px"] {
			height: 0px !important;
		}
		*/
		td[style*="img/decor_info3.gif"] {
			background-image: url(${frycAPI.get_res_url("Fine_info_icon.png")}) !important;
			background-origin: content-box !important;
			background-size: 72% !important;
			background-color: hsl(200deg 6% 12%) !important;
			background-position-y: center !important;
			background-position-x: center !important;
			/*position: relative;*/
			border-left: solid 1px !important;
			border-top: solid 1px !important;
			border-left-color: hsl(197deg 50% 73%) !important;
			border-top-color: hsl(197deg 50% 73%) !important;
			/*top: 17px;*/
			height: 59px !important;
		}
		td[style*="img/decor_positive.gif"] {
			background-image: url(${frycAPI.get_res_url("Fine_correct_icon_small.png")}) !important;
			background-origin: content-box !important;
			background-size: 72% !important;
			background-color: hsl(95deg 70% 18.4%) !important;
			background-position-y: center !important;
			background-position-x: center !important;
			/*position: relative;*/
			border-left: solid 1px !important;
			border-top: solid 1px !important;
			border-left-color: hsl(198deg 50% 76%) !important;
			border-top-color: hsl(198deg 50% 76%) !important;
			/*top: 17px;*/
			height: 59px !important;
		}
		td[style*="img/decor_notice.gif"] {
			 background-image: url(${frycAPI.get_res_url("Fine_exclamation_mark_icon.png")}) !important;
			background-origin: content-box !important;
			background-color: transparent !important;
			background-size: 72% !important;
			background-position-y: center !important;
			background-position-x: center !important;
			/*position: relative;*/
			border-left: solid 1px !important;
			border-top: solid 1px !important;
			border-left-color: hsl(197deg 50% 73%) !important;
			border-top-color: hsl(197deg 50% 73%) !important;
			/*top: 17px;*/
			height: 59px !important;
		}

		td[style*="background: rgb(227, 225, 255)"] {
			background: hsl(200deg 6% 12%) !important;
		}
		/*
		.wrtext h1 {
			margin: 5px 0 10px 0;
		}
		*/
		table.nopaddingunder.decori {
			margin-top: 2px !important;
			margin-bottom: 14px !important;
		}
		table.nopaddingunder.decorv {
			margin: 0px 0px 0px !important;
		}
		/*
		#layout-c22a {
			padding-top: 22px !important;
		}
		#layout-footer {
			height: 36px;
			background-color: background-color: transparent;;
		}
		*/
		/*
		.user_escaped {
			padding-left: 6px !important;
			padding-top: 4px !important;
		}
		*/
		td[style*="max-width: 400px"] {
			max-width: 600px !important;
			width: 181px !important;
		}

		td[colspan="2"][style="vertical-align:middle; max-width: 400px"] {
			max-width: 600px !important;
			width: 543px !important;
		}

		img[src="img/tip_info.gif"], img[src="https://usosweb.usos.pw.edu.pl//img/tip_info.gif"] {
			content: url(${frycAPI.get_res_url("Fine_info_icon.png")});
			width: 16px;
			height: 16px;
		}

		img[src="https://usosweb.usos.pw.edu.pl//img/tip_redinfo.gif"] {
			content: url(${frycAPI.get_res_url("transparent_square_PNG.png")});
			background-image: url(${frycAPI.get_res_url("Fine_info_icon.png")});
			background-size: contain;
			background-color: red;
			background-blend-mode: luminosity;
			border-radius: 69%;
			width: 16px;
			height: 16px;
			max-width: 16px;
			max-height: 16px;
		}

		img[src="https://usosweb.usos.pw.edu.pl//img/greencheck.gif"],
		img[src="https://usosweb.usos.pw.edu.pl/img/tip_rej2_zarejestrowany.gif"], img[src*="img/tip_positive.gif"] {
			content: url(${frycAPI.get_res_url("Fine_correct_icon_small.png")});
			width: 19px;
			height: 19px;
		}

		img[src*="https://usosweb.usos.pw.edu.pl//img/tip_greyinfo.gif"], img[src*="https://usosweb.usos.pw.edu.pl//img/tip_small_greyinfo.gif"], img[src*="https://usosweb.usos.pw.edu.pl//img/greyinfolink.gif"] {
			content: url(${frycAPI.get_res_url("transparent_square_PNG.png")});
			background-image: url(${frycAPI.get_res_url("Fine_info_icon.png")});
			background-size: contain;
			filter: invert(1) grayscale(1) contrast(0.5) brightness(2.1);
			width: 16px;
			height: 16px;
			max-width: 16px;
			max-height: 16px;
		}

		table.nopaddingunder.decori>tbody>tr:last-child>td, table.nopaddingunder.decorn>tbody>tr:last-child>td {
			background-color: transparent !important;
			border-color: hsl(197deg 50% 73%) !important;
		}
		/*
		.uwb-panels-layout .uwb-white-content {
			box-sizing: border-box;
			width: unset;
			padding: 40px;
			border-width: 0px;
			background: #fff;
		}
		*/

		img[src="https://usosweb.usos.pw.edu.pl//img/rejB_brakMiejsc.gif"] {
			content: url(${frycAPI.get_res_url("red_square.png")});
		}
		img[src="https://usosweb.usos.pw.edu.pl//img/rejB_limitWyborow.gif"] {
			content: url(${frycAPI.get_res_url("yellow_square.png")});
		}
		img[src="https://usosweb.usos.pw.edu.pl//img/koszyk_outB.gif"] {
			content: url(${frycAPI.get_res_url("blue_square.png")});
		}
		img[src="https://usosweb.usos.pw.edu.pl//img/koszyk_inB.gif"] {
			content: url(${frycAPI.get_res_url("green_square.png")});
		}
		.ec-header {
			background-color: transparent !important;
			border-bottom-color: #3a3f41 !important;
		}
		/* Komunikaty o językach */
		div[style="background: var(--background-secondary); border: 1px solid var(--border); padding: 5px 8px; max-width: 700px;"] {
			background-color: #3c0000 !important;
			display: none;
		}
		usos-footer {
			background-color: white;
		}
		usos-module-link-tile:hover {
			background-color: #1d428758;
		}
		usos-layout {
			max-width: 1416px !important;
		}
		usos-frame>div.flex img { /* Uwaga */
			filter: none !important; /* invert(1) hue-rotate(180deg) */
		}
		body usos-frame>div.flex+div:not(:has(>form:first-child)) {
			filter: invert(1) hue-rotate(180deg);
			color: black !important;
		}

		a[href="https://usosweb.usos.pw.edu.pl/kontroler.php?_action=logowaniecas/index"] {
			color: hsl(244deg 18% 50%);
			text-decoration: underline;
		}
		a[href="https://usosweb.usos.pw.edu.pl/kontroler.php?_action=logowaniecas/index"]:hover {
			color: hsl(244deg 18% 63%);
		}
		body.vsc-initialized[onload="GCHART_loaded()"] text {
			fill: #959595;
		}
		div#chart iframe {
			filter: invert(1) hue-rotate(180deg);
		}
		svg text {
			fill: #959595;
		}
		.grey_theme .ui-widget-header {
			color: hsl(0 0% 58% / 1);
		}
		div#uwb-side-column {
			background-color: #121212;
		}
		div#uwb-panels-layout-manager {
			background-color: #0e0e0e;
		}
		.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.grey_theme.ui-dialog-buttons, .ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix, div.ui-dialog-content.ui-widget-content.wrtext {
			filter: invert(1) hue-rotate(180deg);
		}

		label.to-left:has(input[type=radio]:checked) {
			color: green;
		}
		input[type=radio]:checked::after {
			background-color: green;
		}

		.usos-ui h2:not([slot="title"]) {
			border-top: 4px solid hsl(0 0% 58% / 1);
			margin-top: 1rem;
			padding-top: 1rem;
		}

		span.mySpan {
			display: flex;
			align-items: center;
		}
		span.mySpan:has(input[type=checkbox]) {
			align-items: normal;
		}
		span.mySpan usos-tooltip {
			margin: 0 5px;
		}
		td.strong a {
			width: auto;
			height: auto;
			display: inline-flex;
			padding-right: 5px;
		}

		.ua-tip.tooltipstered {
			padding-left: 5px;
		}
		.wrtext h1 {
			display: flex;
			align-items: flex-start;
		}
		.flex > .stretch {
			/* filter: brightness(0); */
		}
		usos-frame:has(img[src="img/migracja.jpg"]) {
			/* background-color: black; */
		}
		.var1 {
			--var1: rgb(0, 163, 124);
		}
		usos-frame ul:not(.no-bullets) {
			padding: 0 0 0 2rem;
		}
		info-box > ul {
			padding: 0 0 0 22px;
		}
		info-box, success-box, notice-box {
			padding: 0;
		}
		usos-link a::after, usos-link a::before {
			background: hsl(0 0% 80% / 1);
		}
		input[type=checkbox]::after {
			content: " " !important;
			background: hsl(0 0% 80% / 1) !important;
		}

		.flex.gap1 p {
			color: hsl(0 0% 58% / 1);
			/* color: #0000; */
			/* text-shadow: 0px 0px 0px black; */
		}

		.usos-ui h2.USOS-OK {
			cursor: pointer;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow-x: clip;
			/* overflow-y: visible; */
		}
		.usos-ui h2.USOS-OK::before {
			display: inline-block;
			content: "${frycAPI.list_marker_open}";
			width: 20px;
			color: hsl(0 0% 58% / 1);
		}
		.usos-ui h2.USOS-OK.collapse::before {
			content: "${frycAPI.list_marker_collapsed}"
		}
		h2.USOS-OK.collapse + .myDiv {
				display: none;
		}

		[src='https://usosweb.usos.pw.edu.pl//img/spinacz_tip.png'] {
			filter: invert(1);
		}

		.usos-ui table.grey > * > tr > td, .usos-ui .layout-table.grey > .layout-row > .layout-cell {
			padding: 5px 5px;
		}

		input[type=radio]::after {
			top: 0;
		}

		/*
		.usos-ui table:is(.wrnav, .grey) tr:is(.even_row, .odd_row) td:is(:nth-child(3), :nth-child(4))  {
			white-space: nowrap;
		}
		*/
		td:has(span.smarty-tip-wrapper) {
			white-space: nowrap;
		}
		.mySpan span.note {
			margin: 0 3px;
		}
		.usos-ui :is(input[type="radio"]) {
			margin-right: 4px !important;
		}
		td[style*="background-color:#d0caac;"] {
			background-color: antiquewhite !important;
		}
		/*
		td:nth-child(3) span.mySpan b {
			margin-right: 2px;
		}
		*/
		/*
		table.grey>tbody>tr:nth-child(3n) td {
			background-color: green !important;
		}
		table.grey>tbody>tr:nth-child(3n+1) td{
			background-color: red !important;
		}
		table.grey>tbody>tr:nth-child(3n+2) td {
			background-color: blue !important;
		}
		*/
		/*
		tr td>a img:not([src*="img/more.gif"]), [style="white-space:nowrap"] img:not([src*="img/more.gif"]), .redforms table tbody tr td img {
			content: url(https://cdn.discordapp.com/attachments/697158463247220806/759560648890777620/Fine_info_icon.png) !important;
			width: 16px;
			height: 16px;
		}
		table.grey>tbody>tr>td>span+img {
			content: url(https://cdn.discordapp.com/attachments/594793235365232662/810662242944155678/transparent_square_PNG.png);
			background-image: url(https://cdn.discordapp.com/attachments/697158463247220806/759560648890777620/Fine_info_icon.png);
			background-size: contain;
			background-color: red;
			background-blend-mode: luminosity;
			border-radius: 69%;
			width: 16px;
			height: 16px;
			max-width: 16px;
			max-height: 16px;
		}
		table.grey.cycle>tbody>tr>td>img:first-of-type, tr[element="wiersz_tury"]>td>img:only-of-type {
			content: url(https://cdn.discordapp.com/attachments/697158463247220806/759561370395082782/Fine_correct_icon_small.png) !important;
			width: 19px;
			height: 19px;
		}
		*/

		/*
		tr {
			display: none;
		}

		tr:nth-last-child(3), tr:nth-last-child(4), table.grey.cycle>tbody>tr:nth-child(1) {
			display: table-row;
		}
		*/
		/*
		.wrtext ul {
			color: #d2d2d2;
		}

		td {
			background-color: #3c3c3c !important;
		}

		p {
			color: #d2d2d2;
		}

		.wrtext h1 {
			color: #d2d2d2;
		}
		*/
		.frycPlan {
			& usos-timetable {
				border: 1px solid var(--timetable-border-color);
				--timetable-row-height: 15px !important;
			}
			& .timetable-wrapper {
				width: unset;
				max-width: 100%;
			}
			& span[slot="time"]>span {
				display: flex;
				justify-content: space-between;
				>span.notice {
					order: 1;
				}
			}
			& timetable-entry [slot=time] usos-icon.notice, help-dialog.timetable-help-dialog usos-icon.notice {
				margin-right: 0;
			}
			& timetable-day {
				border-bottom: 0;
			}
		}

		.usos-ui .autoscroll:has(table.wrnav) {
			overflow: visible;
		}

		.zapeł-div {
			display: inline-block;
		}

		td.strong:has(.rejestracja-ikona) > * {
			display: inline;
		}
	`);

	frycAPI.on_load_setter(() => {
		const t1 = performance.now();

		if (location.search.includes("statystyki")) {
			const chart = document.getElementById("chart");
			if (chart !== null) {
				new MutationObserver(async function usos_fix(mut_rec, doc_obs) {
					const id1 = document.querySelector("div#chart iframe").getAttribute("id");
					while (!frames[id1]) {
						await frycAPI.sleep(50);
					}
					await frycAPI.sleep(50);
					const head1 = frames[id1].document.querySelector("head");
					const css1 = document.createElement("style");
					css1.innerHTML = "svg text { fill: hsl(0deg 0% 58%); }";
					head1.append(css1);
					console.log("Zaobserwowałem!");
					doc_obs.disconnect();
				}).observe(chart, { attributes: true, childList: true, subtree: true });
			}
		}


		const shadow_style = document.createElement("style").frycAPI_set_inner_html(frycAPI.minify_css(/*css*/`
			:host #tooltip {
				width: min-content !important;
			}
			:host #tooltip-icon {
				background-color: hsl(0 0% 80% / 1);
			}
			:host > div.moj-box {
				top: 13px !important;
			}
			#close::before {
				content: " " !important;
				background: hsl(0 0% 80% / 1) !important;
			}
			#close:active::before,
			#close:focus::before,
			#close:hover::before {
				background-color: rgb(255 0 0) !important;
			}

			:host-context(.frycPlan) {
				--timetable-row-height: 15px;
			}
			:host-context(.frycPlan) #page-body { /* :has(usos-timetable) */
				width: 100% !important;
			}
			:host-context(.frycPlan) > div:first-child, #timetable > ::slotted(*) {
				border-right-width: 2px !important;
			}
			:host-context(.frycPlan) #hours > div > div:first-child {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			:host-context(.frycPlan) div[aria-describedby="dod-info"] {
				>#time, >#przedmiot {
				}
				>#przedmiot {
					-webkit-line-clamp: none;
				}
				>#time {
					border-bottom: 1px solid var(--border-color-local);
					order: -1;
					text-align: left;
					/* color: var(--border-color-local); */
				}
				>#info {
					margin-top: 1px;
					border-top: 1px solid var(--border-color-local);
				}
			}
			:host-context(.frycPlan) #hours > div > div:nth-child(2)::after {
				border-bottom-width: 1px !important;
			}
			/* focus-trap, usos-dialog>div>div:has(>[aria-label="Informacje"]), */
			:host-context(.frycPlan) #titlebar {
				filter: invert(1) hue-rotate(180deg);
			}
			:host-context(.frycPlan) dialog {
				color: white;
				background: #000000;
				box-shadow: 0 0 20px 2px #ffffff52;
			}
			:host-context(.frycPlan) #przedmiot {
				line-height: 1.14;
			}
		`));

		// tbody.autostrong td.strong:has(a)
		// table:not(:has(span.note)) td
		frycAPI.for_each(`
			td:has(
				usos-tooltip
			):not(:has(
				> [action="kontroler.php"],
				> label:only-child
			)),
			usos-frame>ul>li,
			td > label:only-child,
			td.strong:has(a[href="file/regulamin_przedmiotu_info.pdf"]),
			td > div > form > label
		`, function (da_elem, da_i, da_arr) {
			da_elem.innerHTML = `<span class="mySpan">${da_elem.innerHTML}</span>`;
		});

		frycAPI.for_each("td > div > form > label:first-of-type + br", da_elem => da_elem.remove());
		["info-box", "success-box", "notice-box"].forEach(box => {
			document.querySelectorAll(box, da_elem => {
				da_elem.shadowRoot.querySelector("div").classList.add(box, "moj-box");
			});
		});

		if (document.title.startsWith("Plan zajęć - ")) {
			document.documentElement.classList.add("frycPlan");
		}
		(function requrs_shadow(elem0) {
			elem0.querySelectorAll("*").forEach(elem => {
				if (elem.shadowRoot !== null) {
					elem.shadowRoot.appendChild(shadow_style.cloneNode(1));
					requrs_shadow(elem.shadowRoot);
				}
			});
		})(document);

		// #region //* Naprawy kalendarza rejestracji
		if (!document.title.includes("USOSweb tymczasowo niedostępny") &&
			// document.querySelector("[aria-label='Panel boczny'] a[href='https://usosweb.usos.pw.edu.pl/kontroler.php?_action=dla_stud/rejestracja/kalendarz'].selected") !== null
			(
				location.href === "https://usosweb.usos.pw.edu.pl/kontroler.php?_action=dla_stud/rejestracja/kalendarz" ||
				location.href.startsWith("https://usosweb.usos.pw.edu.pl/kontroler.php?_action=news/rejestracje/rejJednostki")
			)
		) {
			const my_div_base = frycAPI.elem_from_html(`<div class="myDiv"></div>`);
			const my_div_outer_base = frycAPI.elem_from_html(`<div class="myDivOuter"></div>`);
			const elem_arr = [];
			frycAPI.for_each(".usos-ui h2", function (da_elem, da_i, da_arr) {
				const my_div = my_div_base.cloneNode(1);
				const my_div_outer = my_div_outer_base.cloneNode(1);
				let h2next = da_elem.nextElementSibling;
				while (h2next !== null && h2next.tagName !== "H2") {
					const h2next1 = h2next.nextElementSibling;
					my_div.appendChild(h2next);
					h2next = h2next1;
				}
				da_elem.insertAdjacentElement("afterend", my_div);
				da_elem.addEventListener("click", function (e) { this.classList.toggle("collapse") });
				if (da_elem.nextElementSibling.querySelector(".rejestracja-ikona .rejestracja-ikona") === null) {
					/* Powyższy warunek może się zepsuć w przyszłości */
					da_elem.classList.add("collapse");
				}
				da_elem.classList.add("USOS-OK");
				da_elem.insertAdjacentElement("afterend", my_div_outer);
				my_div_outer.append(da_elem, my_div);
				elem_arr.push(my_div_outer);
			});
			const usos_ui = elem_arr[0].parentElement;
			elem_arr.frycAPI_sort_values(e => e.firstElementChild.innerText.toLowerCase());
			// elem_arr.frycAPI_sort_values(e => e.firstElementChild.innerText);
			elem_arr.forEach(function (da_elem) {
				usos_ui.appendChild(da_elem);
			});
		}
		// #endregion
		// #region //* Naprawy tabel rejestracji
		frycAPI.for_each("td:has(img.rejestracja-ikona[src='https://usosweb.usos.pw.edu.pl//img/spinacz_tip.png']) > br", da_elem => da_elem.remove());
		// #endregion
		// #region //* Sortowanie tabel rejestracji
		if (true) {
			if (frycAPI.website_url.pathname === "/kontroler.php" && frycAPI.website_url.searchParams.get("_action").frycAPI_equal_any("katalog2/przedmioty/szukajPrzedmiotu", "dla_stud/rejestracja/brdg2/wyborPrzedmiotu")) {
				const tab = document.querySelector(`.usos-ui > div > table.wrnav, table.grey > tbody.autostrong`);
				if (tab !== null) {
					const rows = Array.from(tab.querySelectorAll(`.odd_row, .even_row, :scope > tr`));
					const moż_rej = row => { // możliwość rejestracji
						return (row.moż_rej ??= [ // assigning value to custom property so the next call will be faster
							"img[src*='zarejestrowany.svg']",
							"img[src*='wyrejestruj.svg']",
							"img[src*='zarejestruj.svg']",
							"img[src*='brak_miejsc.svg']",
							"img[src*='brak_uprawnien.svg']",
							"*", // if this (any elem selector) was not present findIndex would return -1 if the registration button had some other image not present in the list
						].findIndex(el => row.frycAPI_q_sel_ok(el)));
					};
					const nazw_jedn = row => { // nazwa jednostki
						return (row.nazw_jedn ??= row.querySelector(`td:nth-child(2)`)?.firstElementChild?.innerText ?? "");
					};
					const nazw_przed = row => { // nazwa przedmiotu
						return (row.nazw_przed ??= row.querySelector(`td:nth-child(2)`)?.lastElementChild?.innerText ?? row.firstElementChild?.firstElementChild?.innerText ?? "");
					};
					const zapełnienie = row => { // zapełnienie grup
						// const smartyTip = row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona`);
						// if (smartyTip === null) return 1;
						// const div = smartyTip.querySelector(`div > div`);

						// const div = row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona > div > div`);
						// if (div === null) return 1;
						// return -Number(div.style.width.replace("px", ""));

						return (row.zapełnienie ??= (row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona + .screen-reader-only`)?.firstElementChild.nextElementSibling ?? row.querySelector(`.zapeł-div`))?.innerText.frycAPI_eval().frycAPI_minus() ?? 0);
					};
					rows.frycAPI_sort_values(
						moż_rej,
						zapełnienie,
						nazw_jedn,
						nazw_przed,
					);
					const parent = rows[0].parentElement;
					rows.forEach(row => {
						parent.appendChild(row);
					});
					rows.forEach(row => {
						const smarty_tip = row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona`);
						if (smarty_tip === null) return;
						smarty_tip.insertAdjacentElement("afterend", frycAPI.elem().text(smarty_tip.nextElementSibling.firstElementChild.nextElementSibling.innerText).class("zapeł-div")._);
					});
				}
			}
		}
		// #endregion

		const t2 = performance.now(); frycAPI.perf(t1, t2, "USOS: ");
	}, 2);
} else if (1 && frycAPI_host("viewer.shapez.io")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		canvas#result {
			filter: hue-rotate(180deg) invert(1) saturate(6.5) ;
		}
	`);
} else if (1 && frycAPI_host("wazniak.mimuw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("web.whatsapp.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/*
		.message-in span._1kh65 svg {
			filter: hue-rotate(-3deg) brightness(0.18) saturate(4.4);
		}
		.message-out span._1kh65 svg {
			filter: invert(1) hue-rotate(191deg) saturate(2) brightness(0.88);
		}
		*/
		/* [data-icon="tail-in"] svg {
			filter: brightness(0) invert(13%) sepia(4%) saturate(3640%) hue-rotate(158deg) brightness(100%) contrast(91%);
		}
		[data-icon="tail-out"] svg {
			filter: brightness(0) invert(22%) sepia(97%) saturate(617%) hue-rotate(127deg) brightness(99%) contrast(101%);
		} */
		:root[dir] [data-icon*="tail-"]+div {
			box-shadow: none;
		}
		*:not(code, code *) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		/* canvas[aria-label="Scan me!"] {
			filter: invert(1);
		} */
	`);
} else if (1 && frycAPI_host("worldedit.enginehub.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			filter: brightness(1);
		}
	`);
} else if (1 && frycAPI_host("wutwaw-my.sharepoint.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/* svg image {
			-webkit-filter: none !important;
			filter: none !important;
		} */
	`);
	frycAPI.on_load_setter(function () {
		if (frycAPI.query_sel_ok(`#topLevelRegion #O365_AppName[aria-label="Przejdź do aplikacji OneDrive"]`)) {
			frycAPI.create_mut_obs(() => {
				const folder_name = frycAPI.q_sel_list([
					`[class^="breadcrumbNonNavigableItem"][data-automationid="breadcrumb-crumb"]`,
					`li.ms-Breadcrumb-listItem:last-child .ms-TooltipHost [id^="tooltip"]`,
					`li[class^="navLink"][class*="navLinkSelected"]`,
				]);
				if (folder_name !== null) {
					if (document.title !== folder_name.textContent) {
						document.title = folder_name.textContent;
					}
				} else if (document.title !== "OneDrive") {
					document.title = "OneDrive";
				}
			});
		}
	}, 2);
} else if (0 && frycAPI_host("wutwaw.sharepoint.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(1);
		}
	`);
} else if (1 && frycAPI_host("www.1001fonts.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.txt-preview {
			filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
} else if (0 && frycAPI_host("www.4g-lte.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
} else if (1 && frycAPI_host("www.autohotkey.com")) {
	frycAPI.line = frycAPI.get_line_number();
	if (frycAPI.website_url.searchParams.has("style")) {
		frycAPI.website_url.searchParams.delete("style");
		location.href = frycAPI.website_url.href;
	} else {
		frycAPI.inject_style_on_load(/*css*/`
			* {
				tab-size: 3 !important;
			}
			*:not(:where(
				.inline_code, .inline_code *,
				code, code *,
				i.fa.fa-clock-o, i.fa.fa-clock-o *,
				#head .h-area .h-tools, #head .h-area .h-tools *,
				.fa-thumb-tack, .fa-thumb-tack *,
				.glyphicon, .glyphicon *,
				.mega-octicon, .mega-octicon *,
				.my-special-class,
				.lyt_tools, .lyt_tools *,
				.lyt_sidebar_toggle, .lyt_sidebar_toggle *
			)) {
				font-family: "IBM Plex Sans Condensed", "Lucida Grande", Arial, sans-serif !important;
			}
			.my-special-class {
				/* font-family: FontAwesome; */
				font-family: "Glyphicons Regular", "Glyphicons";
				a[title="Board index"] & {
					margin-right: var(--padding);
				}
			}
			.page-width:not(.inner) {
				max-width: calc(100% - 24px);
				width: 1125px;
				margin: auto;
			}
			.navbar .inner.static > .static-inner {
				margin: 0;
			}
			.postbody > div > h3 {
				display: inline-block !important;
			}
			.content h2, .panel h2 {
				font-weight: unset;
			}
			.logo img {
				content: url("${frycAPI.get_res_url("ahk_logo.svg")}");
			}
			.dspNone {
				display: none !important;
			}
			#format-buttons:has(select[name="addbbcode_codeboxplus"]) {
				display: flex;
				align-items: center;
				justify-content: space-between;
				.smiley-control{
					margin: 0;
					cursor: pointer;
					color: rgb(119, 163, 196);
					&:hover {
						color: rgb(194, 117, 79);
						text-decoration: underline;
					}
				}
			}
			cite > .responsive-hide {
				display: inline;
				margin-left: 4px;
				color: hsl(30, 5%, 55%);
			}
			#topicreview {
				padding-right: 0;
				display: flex;
				flex-direction: column-reverse;
			}
			:root {
				--padding: 5px;
				--padding-small: 3px;
				--padding-big: 7px;
			}
			.postbody .content {
				padding: var(--padding) 0 0 0;
			}
			.post > .inner {
				/* padding: var(--padding) var(--padding-big); */
				padding: var(--padding);
			}
			.content {
				min-height: 0;
			}
			ul.post-buttons {
				display: flex;
				gap: var(--padding-small);
				float: none;
				> li {
					margin-right: 0;
				}
			}
			a.top {
				display: none;
			}
			.signature {
				margin-top: var(--padding);
			}
			blockquote, .codebox {
				margin: var(--padding);
				margin-left: 0;
			}
			.content:not(.pierwszy-node-to-text) :is(blockquote, .codebox):first-child {
				margin-top: 0;
			}
			span.online-ribbon {
				display: none;
			}
			.post:has(>.online-ribbon) .postprofile > dt > a {
				position: relative;
				--color: #219D55;
				&::after {
					content: " ";
					display: inline-block;
					background-color: var(--color);
					width: 10px;
					height: 10px;
					border-radius: 50%;
					margin-left: var(--padding);
				}
				&:hover::before {
					content: "Online";
					color: var(--color);
					position: absolute;
					right: calc(100% + 2 * var(--padding));
					border-radius: 3px;
					background-color: rgb(38, 40, 41);
					padding: var(--padding-small) var(--padding);
				}
			}
			.post:has(span.icon_solved_post) {
				border: 2px solid #008040;
			}
			.row dd.lastpost > span > br + br {
				display: none;
			}
			span.crumb:has(a[title="Board index"]) {
				padding-left: 0;
				&::before {
					content: "";
				}
			}
			a[title="Board index"] {
				display: inline-flex !important;
				align-items: center;
			}
			.icon-home.breadcrumbs::after {
				content: "";
			}

			.post > .inner {
				display: flex;
				width: 100%;
				box-sizing: border-box;
				.postprofile {
					min-height: 0 !important;
					width: auto;
					/* padding: calc(var(--padding) - var(--padding-small)) 0 0 0; */
					padding: 0;
					padding-right: var(--padding);
					/* flex-basis: 150px; */
					> * {
						margin-right: 0;
					}
					.has-avatar .avatar-container {
						margin-bottom: var(--padding);
					}
					> dt {
						margin-bottom: var(--padding);
						padding-bottom: var(--padding);
						/* padding-bottom: calc(var(--padding) - 1px); */
						border: 0px solid rgb(60, 63, 66);
						border-bottom-width: 1px;
						> :is(a, strong) {
							font-size: 15px;
							line-height: 20px;
							white-space: nowrap;
							/* text-transform: uppercase; */
							/* &, * {
								font-family: "Roboto Condensed" !important;
								font-weight: 300;
							} */
						}
					}
					.avatar {
						max-width: none;
					}
				}
				.postbody {
					float: none;
					margin-left: 0;
					padding-left: var(--padding);
					width: 100% !important;
					> div {
						margin-left: 0;
						display: grid;
						/* grid-template-columns: auto min-content min-content; */
						grid-template-columns: 1fr auto auto;
						grid-template-rows: auto auto;
						column-gap: var(--padding);
						background-color: transparent !important;
						border-width: 0 !important;
						padding: 0 !important;
						> * {
							padding: 0 !important;
							margin: 0 !important;
						}
						> h3 {
							grid-area: 1 / 1 / 2 / 2;
							> a {
								display: flex;
								align-items: center;
								gap: var(--padding);
							}
						}
						> ul.post-buttons {
							float: none;
							max-width: none;
							grid-area: 1 / 3 / 2 / 4;
						}
						> p.author {
							float: none;
							grid-area: 1 / 2 / 2 / 3;
							white-space: nowrap;
						}
						> .content {
							grid-area: 2 / 1 / 3 / 4;
							margin-top: var(--padding) !important;
							padding-top: var(--padding) !important;
						}
						> .signature {
							grid-column: 1 / 4;
							margin-top: var(--padding) !important;
							padding-top: var(--padding) !important;
						}
					}
				}
			}

			.imageset.icon_solved_post, .imageset.icon_solved_head {
				background-image: url('${frycAPI.get_res_url("Correct icon.png")}');
				background-size: contain;
			}
			h2.topic-title {
				margin: 0;
				display: flex;
				align-items: center;
				gap: var(--padding);
				> a[title="Topic is solved"] {
					display: flex;
					align-items: center;
				}
			}

			${frycAPI.path.startsWith("/docs") ? /*css*/`
				body {
					> :is(h1, h2, h3, h4) {
						border-bottom: 0px  !important;
						border-top: 1px solid #766e63 !important;
						--pad-top: 13px;
						padding-top: var(--pad-top);
					}
					> h2 {
						margin-top: abs(1.1em - var(--pad-top)) !important;
						/* margin-bottom: .5em; */
					}
					> h3 {
						margin-top: abs(1.5em - var(--pad-top)) !important;
						/* margin-bottom: .5em; */
					}
					> h4 {
						margin-top: abs(1.33em - var(--pad-top)) !important;
						/* margin-bottom: .5em; */
					}
				}
			` : ""}

			pre, pre *,
			code, code *,
			kbd, kbd * {
				font-family: "Source Code Fryc", monospace !important;
			}
		`, { elevated: true, allFrames: true, inject_end_condition: frycAPI.path.startsWith("/docs") ? () => {
			// return frycAPI.iframe_has_real_document(frycAPI.q_sel(".lyt_frame")); // with this style breaks on first link click so we have to keep it disabled to constantly apply the style
			// loguj("Test");
		} : null });

		frycAPI.on_load_setter(() => {
			// const t1 = performance.now();
			// #region //* Favicon
			if (frycAPI.path.startsWith("/boards")) {
				frycAPI.change_favicon_res("AHK_Blue.png");
			} else {
				frycAPI.change_favicon_res("AHK_Better.png");
			}
			// #endregion
			if (frycAPI.path.startsWith("/boards")) {
				// #region //* Naprawa dat
				/* Test wydajności
				const posts = document.querySelectorAll(`.post`);
				const pierwszy = posts[0].cloneNode(1);
				posts.forEach(el => el.remove());
				const pageBody = document.getElementById("page-body");
				for (let i = 0; i < 250; i++) {
					pageBody.appendChild(pierwszy.cloneNode(1));
				}
				*/
				// const t1 = performance.now();
				const opts = frycAPI.date_opts_no_time;
				frycAPI.set_default_date(`
					.postbody p.author > a,
					cite > .responsive-hide,
					p.notification-time,
					.column2 dl.details > dd:nth-of-type(1), .column2 dl.details > dd:nth-of-type(2)
				`, { get_date: "txt" });
				frycAPI.set_default_date("_" + frycAPI.array_to_template([2, 3, 4, 5, 6, 7], temₚ`,table:has(thead th:nth-child(${0}).joined) td:nth-child(${0})`), {
					get_date: "txt",
					date_opts: { print_rel_time: { compact: 2, ago: false } },
				});
				frycAPI.set_default_date(`.postprofile > .profile-joined`, {
					get_date: elem => elem.innerText.replace("Joined: ", ""),
					set_date: (elem, data) => elem.frycAPI_set_inner_html(
						"<strong>Joined: </strong>" + frycAPI.get_default_date_text(data, opts)
					),
					date_enum_mode: frycAPI.set_default_date_enum.mode.relatywny_czas,
					date_enum_style: frycAPI.set_default_date_enum.style.float_left,
					custom_style: `cursor: none;`,
				}); // .mode.absolutny_czas().float_left();
				frycAPI.set_default_date(`.postbody-inner > p.author > strong`, {
					get_date: elem => elem.nextSibling.textContent.replace("»", "").trim(),
					set_date: (elem, data) => {
					// const txtNode = elem.nextSibling;
						elem.nextSibling.textContent = " » ";
						return elem.parentElement.frycAPI_append_html(frycAPI.get_default_date_text(data));
					},
				});
				frycAPI.set_default_date(`.list-inner > .responsive-hide > a:first-of-type`, {
					get_date: elem => elem.nextSibling.textContent.replaceAll("»", "").replace("in", "").trim(),
					set_date: (elem, data) => {
						const txt_node = elem.nextSibling;
						const contains_in = txt_node.textContent.lastIndexOf("in") !== -1;
						txt_node.textContent = " » ";
						const lep_czas = txt_node.frycAPI_insert_after(frycAPI.elem_from_html(frycAPI.get_default_date_text(data, opts)));
						contains_in && lep_czas.frycAPI_insert_after(document.createTextNode(" » in "));
						return lep_czas;
					},
				});
				frycAPI.set_default_date(`.row dd.lastpost > span > br`, {
					get_date: elem => elem.nextSibling.textContent.trim(),
					set_date: (elem, data) => {
					// const txtNode = elem.nextSibling;
						elem.nextSibling.remove();
						return elem.parentElement.frycAPI_append_html(frycAPI.get_default_date_text(data, opts));
					},
				});
				const zegar = document.querySelector(`a.dropdown-trigger.time.dropdown-toggle`);
				zegar?.setAttribute("title", "It is currently " + frycAPI.print_date(new Date(zegar.getAttribute("title").replace("It is currently ", ""))));
				// const t2 = performance.now(); frycAPI.perf(t1, t2);
				// #endregion
				// #region //* Ukrycie nic nie wnoszących tytułów postów
				const title_elem = document.querySelector(`h2.topic-title > a, h2.posting-title > a`);
				if (title_elem !== null) {
					const base_title = "Re: " + (title_elem.innerText = title_elem.innerText.trim());
					frycAPI.for_each(`.postbody h3 > a`, (da_elem, da_i, da_arr) => {
						const t_node = da_elem.frycAPI_get_first_text_node();
						if ((t_node.textContent = t_node.textContent.trim()) === base_title) {
							da_elem.frycAPI_add_class("dspNone");
						}
					});
				}
				// #endregion
				// #region //* Ukrycie panelu emoji
				const smiley_box = document.getElementById("smiley-box");
				if (smiley_box !== null) {
					document.querySelector(`#format-buttons:has(select[name="addbbcode_codeboxplus"])`)?.appendChild(
						document.createElement("div")
						.frycAPI_add_class("smiley-control")
						.frycAPI_set_inner_html("Show smiles")
						.frycAPI_add_event_listener("click", function () {
							if (smiley_box.classList.toggle("dspNone")) {
								this.frycAPI_set_inner_html("Show smiles");
							} else {
								this.frycAPI_set_inner_html("Hide smiles");
							}
						})
					);
					smiley_box.classList.toggle("dspNone");
				}
				// #endregion
				// #region //* Przeniesienie postów ponad pole tekstowe
				const topic_review = document.getElementById("topicreview");
				if (topic_review !== null) {
					const review = document.getElementById("review");
					review.querySelector(`span.right-box > a`).click();
					review.classList.add("dspNone");
					document.getElementById("postform").insertAdjacentElement("afterbegin", topic_review);
					const preview = document.getElementById("preview");
					if (preview !== null) {
						preview.scrollIntoView();
					} else {
						topic_review.querySelector(`.post:not(.post ~ .post)`).scrollIntoView();
					}
				}
				// #endregion
				// #region //* Dodanie przycisku Top do Nav-Baru
				document.querySelector(`ul.leftside > li.tab.home`)?.insertAdjacentHTML("afterend",
					`<li class="tab top responsive-cloned-item" data-responsive-class="small-icon" title="top"><a class="nav-link" href="#top" data-navbar-reference="Top">Top</a></li>`
				);
				// #endregion
				// #region //* Sprawdzenie które posty mają Text jako pierwszy Node
				frycAPI.for_each(`.postbody .content`, (da_elem, da_i, da_arr) => {
					if (da_elem.firstChild.frycAPI_is_text) {
						da_elem.frycAPI_add_class("pierwszy-node-to-text");
					}
				});
				// #endregion
				// #region //* Przypisanie konkrentych wymiarów obrazom profilowym
				frycAPI.for_each(`img.avatar`, (da_elem, da_i, da_arr) => {
					da_elem.style.width = da_elem.getAttribute("width") + "px !important";
					da_elem.style.height = da_elem.getAttribute("height") + "px !important";
				});
				// #endregion
				// #region //* Sortowanie tabeli
				// frycAPI.for_each(`table:has(tr > th):has(tr > td)`, (daElem, daI, daArr) => {
				// 	daElem.querySelector(`th.posts`).setAttribute("krytSort", "numeric");
				// 	frycAPI.make_table_sortable(daElem);
				// });
				// #endregion
				// #region //* Poprawienie linka Board index
				const b_idx = document.querySelector(`a[title="Board index"]`);
				b_idx && (b_idx.innerHTML = `<span class="my-special-class">&#xE021;</span><span>Board index</span>`); // + b_idx.innerHTML
			// #endregion
				// #region //*
				// #endregion
			}
			// const t2 = performance.now(); frycAPI.perf(t1, t2);
		});
	}
} else if (1 && frycAPI_host("www.calculator.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.rightresult svg g[style="paint-order: stroke;stroke: #fff;stroke-width: 2px;"] {
			stroke: hsl(0 0% 58% / 1) !important;
		}
		.rightresult svg text[style="font-size: 30px;font-weight:bold;color:#000;"] {
			/* stroke: hsl(0 0% 58% / 1) !important; */
			/* color: hsl(0 0% 0% / 0) !important; */
			/* text-shadow: 0px 0px 0px black !important; */
			/* filter: drop-shadow(0px 0px 1px black); */
			fill: hsl(0 0% 58% / 1);
		}

		.rightresult svg line[marker-end="url(#arrowhead)"] {
			filter: brightness(0);
		}

		.rightresult svg circle {
			filter: brightness(0);
		}
	`);
} else if (0 && frycAPI_host("www.chessvariants.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(0) hue-rotate(0deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.deltami.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img.math-display, figure, img.math-inline {
			filter: invert(1) hue-rotate(180deg);
		}
		img.highslide-image {
			filter: invert(1) hue-rotate(180deg);
			background-color: rgb(255 255 255 / 0%) !important;
		}
	`);
} else if (0 && frycAPI_host("www.derivative-calculator.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
		filter: invert(1) hue-rotate(180deg);
			color: hsl(0deg 0% 58%);
		}

		.support-me.highlighted {
			background-color: hsl(83deg 71% 9%);
			background-image: none;
			box-shadow: none;
			color: hsl(0deg 0% 100%);
			filter: invert(1) hue-rotate(180deg) !important;
		}
		div#tabs * {
			text-shadow: none;
		}
		div#tabs {
			filter: invert(1);
		}
		#news span img {
			filter: invert(1) hue-rotate(180deg);
		}
		h1 {
			color: hsl(198deg 93% 56%);
		}
		h2 {
			color: hsl(221deg 24% 62%);
		}
		input#expression {
			filter: invert(1);
		}
		#diff-var-order-mathjax {
			background-color: transparent;
			box-shadow: none;
		}
		.formula {
			color: hsl(198deg 90% 56%);
		}
		a:link, a:visited {
			color: hsl(198deg 90% 56%);
		}
		.calc-header>div {
			filter: invert(1) hue-rotate(180deg);
			color: hsl(0deg 0% 81%);
		}
		div#ucss-code-wrapper {
			filter: inherit;
		}
		.calc-content div:not(.export-button):not(.check-answer-button)>a {
			filter: invert(1) hue-rotate(180deg);
			color: hsl(0deg 0% 81%) !important;
		}
		#calc div.calc-look-up-definition {
			filter: invert(1) hue-rotate(180deg);
			background-color: hsl(239deg 100% 28%);
		}
		div#plot-toolboxes {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("www.desmos.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/* ::-webkit-scrollbar-thumb {
			background: #70ffde ;
		}
		::-webkit-scrollbar-thumb:hover {
			background: #52ffd7 ;
		}
		::-webkit-scrollbar-thumb:active {
			background: #24ffcc ;
		}
		::-webkit-scrollbar-track {
			background: #e3e3e3 ;
		}
		canvas.dcg-graph-inner {
			filter: invert(1) hue-rotate(180deg);
		} */

		[dcg-menu-button="graph-actions"] h1.dcg-variable-title.dcg-tooltip {
			max-width: 640px !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  6
else if (1 && frycAPI_host("www.enpassant.dk")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(0) hue-rotate(0deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.facebook.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/*
		body._z4_._8l3w.fbx._8m53._8bb_._-kb._605a.b_16xvukae6j.chrome.webkit.win.x2.Locale_pl_PL.cores-gte4.__6g._mvg._19_u.vsc-initialized {
			font-family: IBM Plex Sans Condensed !important;
		}
		div#mount_0_0 {
			font-family: IBM Plex Sans Condensed !important;
		}
		._8l3w._8bb_ {
			font-family: IBM Plex Sans Condensed !important;
		}
		*/

		*:not(code) {
			font-family: IBM Plex Sans Condensed !important;
		}
	`);
} else if (0 && frycAPI_host("www.g")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body::-webkit-scrollbar {  width: 15px;  background: grey;}body::-webkit-scrollbar-thumb {width: 13px;  background: black;border: 1px solid white;}
	`);
} else if (1 && frycAPI_host("www.geeksforgeeks.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		iframe[id*="google_ads_iframe"] {
			display: none;
		}
		aside[id*="text-"] {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.geneseo.edu")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		mjx-container[jax="CHTML"][display="true"] {
			overflow: hidden;
		}
	`);
} else if (1 && frycAPI_host("www.geogebra.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.checkBoxPanel > * {
			margin-right: 5px !important;
		}
		.checkBoxPanel {
			display: block;
		}
	`);
	frycAPI.create_manual_functions("GeoGebra", {
		func_arr: [
			(name = "Copy variable", type = frycAPI_Input) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.callback = function (obj) {
					if (obj.type === "name") {
						frycAPI.ctrl_c(ggbApplet.getLaTeXString(f.state));
					}
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("www.google.pl", "www.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.hm60ue {
			margin-top: 50px;
		}
		span.U3A9Ac.qV8iec {
			font-weight: 100;
			color: white !important;
			text-shadow:
			-1px -1px 0 red,
			+1px -1px 0 red,
			-1px +1px 0 red,
			+1px +1px 0 red,
			-1px +0px 0 red,
			+1px +0px 0 red,
			+0px +1px 0 red,
			+0px -1px 0 red;
		}
		.abuKkc>.jpu5Q>span {
			color: #aaadb2;
		}
		[role="text"],
		[role="text"] * {
			color: #92ffaa;
		}
		/* canvas.MyME0d.widget-scene-canvas, img.k48Abe, span.ita-kd-img.ita-kd-icon.ita-kd-icon-span.ita-icon-0,span.ita-kd-img.ita-kd-arrow.ita-kd-icon-span,img.bDDiq, .RGzwUc.pFz1xc,.pKQ3pb,.oGZkwf,.fd5il,.Eq03vc,.fd5il {
			filter: invert(1) hue-rotate(180deg);
		} */
		/* .app-imagery-mode canvas.MyME0d.widget-scene-canvas {
			filter: none;
		} */
		:root {
			--szer: 800px;
		}
		.RNNXgb, .A8SBwf, .IormK, .tsf, .sbfc {
			min-width: fit-content;
		}
		.gLFyf, .YacQv {
			/* min-width: 449px; */
			max-width: 1190px;
		}
		.hide01 {
			position: fixed;
			height: 0;
			overflow: hidden;
			white-space: pre;
			top: 0px;
		}
		a.fl.iUh30 {
			display: none;
		}
		a.ZZ7G7b.A6Smgb {
			padding-right: 12px;
		}
		.H9lube, .UnOTSe img {
			border-radius: 25%;
		}
		.minidiv .logo {
			padding: 0 32px;
		}
		/* .minidiv [jsname="RNNXgb"] {
			margin-top: 13px !important;
		} */
		/* .s6JM6d, .g, .KIy09e, div[jscontroller="SC7lYd"] {
			width: var(--szer) !important;
		} */

		body.google-3-column {
			& div#rcnt {
				width: 100%;
				max-width: calc(100vw - 40px);
			}
			& div#center_col {
				width: 100%;
				margin: 0px;
			}
			& div#rso, .WtZO4e>div>div[decode-data-ved] {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				/* gap: 30px; */
				padding-left: 10px;
			}
			& div:not(.hlcw0c):not(.ULSxyf):not(div#bres)>.MjjYud, .hlcw0c, .ULSxyf {
				width: calc((100vw - 50px)/3) !important;
				box-sizing: border-box;
				padding: 10px;

				/* border: 1px solid #3c4043;
				margin-left: -1px;
				margin-bottom: -1px; */

				--shad-col: #3c4043ab;
				box-shadow: inset 0px 0px 5px 0px var(--shad-col), 0px 0px 5px 0px var(--shad-col);
			}
			& div#bres>.ULSxyf {
				border: 0px;
			}
			& div#bres {
				width: 100%;
				margin-left: 10px;
			}
			.e2BEnf.U7izfe.hWIMdd.EQdXxd.ckLDrd {
				max-width: 600px;
			}
			.hlcw0c, .ULSxyf {
				margin-bottom: 0px;
			}
			.tF2Cxc.asEBEc, .g.PmEWq, .MjjYud>.g {
				margin-bottom: 0px;
				width: 100% !important;
			}
			.WtZO4e .card-section.KDCVqf {
				display: none;
			}
			.vt6azd {
				margin: 0px;
			}
			.ClPXac.Pqkn2e {
				width: 100%;
			}
			.eA0Zlc.WghbWd.FnEtTd.mkpRId.RLdvSe.ivg-i.PZPZlf.GMCzAd {
				width: calc((100% - 20px) / 3) !important;
				box-sizing: border-box;
				margin: 0;
				padding: 10px;
			}
			& div#appbar {
				padding-left: 20px;
			}
			.gqLncc {
				margin: 0px 10px 10px 20px;
			}
		}
		.google-translate-buttons .nlNnsd {
			display: none;
		}
	`);

	// (frycAPI.before_load = function () {
	// 	if (document.querySelector("#APjFqb") && document.getElementById("searchform")) {
	// 		document.body.frycAPI_add_class("google-3-column");
	// 	}
	// })();

	frycAPI.on_load_setter(() => {
		if (frycAPI.path.startsWith("/search")) {
			if (document.querySelector("#APjFqb") && document.getElementById("searchform")) {
				const hide01 = document.createElement("span");
				hide01.setAttribute("class", "hide01");
				document.body.appendChild(hide01);
				const input01 = document.querySelector("#APjFqb");
				function resize() {
					hide01.textContent = input01.value;
					hide01.style.font = getComputedStyle(input01).font;
					input01.style.width = hide01.offsetWidth + 20 + "px";
				}
				resize();
				input01.addEventListener("input", () => {
					resize();
					// console.log("Input Listener");
				});
				new MutationObserver((mut_rec2, doc_obs2) => {
					resize();
					// console.log("Observer");
				}).observe(document.getElementById("searchform"), { attributeFilter: ["class"] });
			}
			frycAPI.for_each(".nlNnsd.ApHyTb .TaA4cd:nth-child(2) .i2L09e.WHcndc", (da_elem, da_i, da_arr) => {
				da_elem.click();
			});
			scrollTo(0, 0);
			document.body.classList.toggle("google-translate-buttons");
		}
		if (!frycAPI.path.startsWith("/maps")) {
			frycAPI.change_favicon_res("Google_Logo_dark.png");
		}
	});

	if (frycAPI.path.startsWith("/maps")) {
		const my_style = frycAPI.inject_style(`canvas${"[id]".repeat(15)} { filter: none !important; }`);
		const is_satellite_view = () => document.body.querySelector(`[role="contentinfo"] > span`)?.innerText.startsWith("Zdjęcia");
		frycAPI.create_mut_obs(() => {
			if (document.body) {
				frycAPI.create_mut_obs(() => {
					my_style.set_state(is_satellite_view());
				}, { elem: document.body, options: { childList: true, subtree: true, characterData: false, attributes: false } });
				return true;
			}
		}, { elem: document.documentElement });
	}

	if (frycAPI.path.startsWith("/search")) {
		frycAPI.create_manual_functions("Google", {
			func_arr: [
				(name = "3 column view", type = frycAPI_Pure_state) => {
					const f = new type({
						name: name,
						state: 0,
					});
					f.callback = function (obj) {
						document.body.classList.toggle("google-3-column");
					};
					return f;
				},
				(name = "Translate buttons", type = frycAPI_Pure_state) => {
					const f = new type({
						name: name,
						state: 0,
					});
					f.callback = function (obj) {
						document.body.classList.toggle("google-translate-buttons");
					};
					return f;
				},
			],
		});
	}
} else if (1 && frycAPI_host("www.headspin.io")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.exit-popup.telco-outer-wp {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.ipko.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/* .W9geT {
			filter: invert(1);
		} */
		._2aoi5 ._2MA2D ._2Q5WK+._1ro01 ._1YJx2 ._1t72D,._2aoi5 ._2MA2D ._2Q5WK:enabled:focus+._1ro01 ._1YJx2 ._1t72D {
			background: none !important;
		}

		._2aoi5 ._2MA2D ._2Q5WK:enabled:checked+._1ro01 ._1YJx2 ._1t72D {
			background: url(data:image/svg+xml;base64,PHN2ZwogIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICB3aWR0aD0iMjAiCiAgaGVpZ2h0PSIyMCIKICB2aWV3Qm94PSIwIDAgMjAgMjAiCj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmEgewogICAgICAgIGZpbGw6ICMwMDM1NzQ7CiAgICAgICAgc3Ryb2tlOiAjMDAzNTc0OwogICAgICB9CiAgICAgIC5iIHsKICAgICAgICBmaWxsOiAjZmZmOwogICAgICB9CiAgICAgIC5jIHsKICAgICAgICBzdHJva2U6IG5vbmU7CiAgICAgIH0KICAgICAgLmQgewogICAgICAgIGZpbGw6IG5vbmU7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zODQgLTM2MCkiPgogICAgPGcgY2xhc3M9ImEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM4NCAzNjApIj4KICAgICAgPHJlY3QgY2xhc3M9ImMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcng9IjIiIC8+CiAgICAgIDxyZWN0IGNsYXNzPSJkIiB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjE5IiBoZWlnaHQ9IjE5IiByeD0iMS41IiAvPgogICAgPC9nPgogICAgPHBhdGgKICAgICAgY2xhc3M9ImIiCiAgICAgIGQ9Ik01LjM4NiwxMC4zNTlsOS4zLTguNjkyQTIuMjA3LDIuMjA3LDAsMCwwLDEzLjQ2NiwxLjNjLS40MjgsMC0xLjA0MS4xMjItMi4wMiwxLjE2M2gwTDYuMDYsNy40ODJsLS40OS40OS0uNDktLjQ5LTEuODM2LTEuOUMyLjI2NSw0LjU0NCwxLjcxNCw0LjM2LDEuMjI0LDQuMzZBMi4xOTQsMi4xOTQsMCwwLDAsMCw0Ljc4OVoiCiAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM4Ny4xNDUgMzY1LjEzNikiCiAgICAvPgogIDwvZz4KPC9zdmc+Cg==) no-repeat !important;
			filter: invert(1) hue-rotate(180deg) brightness(3.5) !important;
		}
	`);
} else if (1 && frycAPI_host("www.itl.nist.gov")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.kalasoft.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.cli-barmodal-open {
			overflow: scroll;
		}
	`);
} else if (1 && frycAPI_host("www.komputronik.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#ri-widget {
			display: none !important;
		}

		/*
		img {
			filter: none !important;
		}
		.faq-no-answer-consultant.hidden-sm-down {
			filter: invert(1) hue-rotate(180deg)!important;
		}
		*/
		div#snrs-set {
			display: none;
		}
		div#related-products {
			display: none;
		}
		section#p-content-promotions {
			display: none;
		}
	`);
} else if (1 && frycAPI_host("www.kowalskimateusz.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed
		}
		img {
			mix-blend-mode: difference;
		}
		/*
		a[href*="kowalskimateusz"][href*="uploads"]::before {
			content: "";
			display: block;
			position: relative;
			background: green !important;
			width: 640px !important;
			height: 480px !important;
			left: 40px;
		}
		*/
	`);
} else if (0 && frycAPI_host("www.lipsum.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body::-webkit-scrollbar {
			width: 15px;
			background: grey;
		}
		body::-webkit-scrollbar-thumb {
			width: 13px;
			background: black;
			border: 1px solid white;
		}
	`);
} else if (0 && frycAPI_host("www.math.us.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.mathworks.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		code.literal, code.property {
			color: #228B22;
		}
		p.listimage>img,
		.paragraphNode>span>img{
			filter: none !important;
		}
		span.MathEquation>img {
			filter: invert(1);
		}
		div#poll_result_body {
			color: hsl(0deg 0% 100%);
		}
		div#dijit_layout_ContentPane_1 {
			overflow-x: scroll !important;
		}
		/* .panel-body div.mediaobject>p>img {
			filter: invert(1) hue-rotate(180deg) !important;
		} */

		button#support_submitsearch {
			border-top-width: 1.5px;
			border-right-width: 0px;
			border-bottom-width: 1.5px;
		}

		.contributor_info > .small, .contribution {
			display: inline-flex;
			align-items: center;
			gap: 4px;
		}
		a.author_inline {
			white-space: nowrap;
		}
	`);

	(frycAPI.before_load = function () {
		if (frycAPI.path.startsWith("/matlabcentral/answers/")) { // Changing dates in replies
			frycAPI.create_mut_obs((mut_rec_arr0, mut_obs0) => {
				if (document.body !== null) {
					frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
						frycAPI.set_default_date(`.question-ask-date, .answered-date, .comment-date, .commented-edit-date, .answered-edit-date`, {
							get_date: elem => elem.innerText.replace("on ", "").replace("at ", ""),
							set_date: (elem, data) => {
								elem.innerText = "- ";
								return frycAPI.append_default_date_text(elem, data, frycAPI.date_opts_no_time);
							},
						});
						frycAPI.set_default_date(`.question_container .contribution.latest-activity`, {
							get_date: elem => {
								const nod = elem.lastChild;
								nod.remove();
								elem.span = elem.appendChild(frycAPI.elem("span", 0));
								elem.span.innerText = "- ";
								return nod.textContent.trim().replace("on ", "").replace("at ", "");
							},
							set_date: (elem, data) => {
								return frycAPI.append_default_date_text(elem.span, data, frycAPI.date_opts_no_time);
							},
						});
					});
					return true;
				}
			}, { elem: document.documentElement });
		}
	})();

	frycAPI.on_load_setter(() => {
		if (frycAPI.path === "/support/search.html") { // Deleting highlighting of the search result terms
			frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
				frycAPI.for_each(`p.search_result_title a`, (da_elem, da_i, da_arr) => {
					da_elem.href = da_elem.href.replace(/\?(.*)/u, "");
				});
			});
		} else if (frycAPI.path === "/support/bugreports/") { // Bug report's date change
			// frycAPI.create_mut_obs((mutRecArr, mutObs) => {
			// });
			frycAPI.set_default_date(`.bug_description > p > em`, {
				get_date: elem => elem.innerText.replace("Modified: ", ""),
				set_date: (elem, data) => {
					elem.innerText = "Modified: ";
					return frycAPI.append_default_date_text(elem, data, frycAPI.date_opts_no_time);
				},
			});
		}
	}, 1);
	frycAPI.on_load_setter(async () => { // Fixed weird scrolling to bottom behavior
		if (frycAPI.path.startsWith("/matlabcentral/answers/")) {
			await frycAPI.sleep(100);
			scrollTo(0, 0);
		}
	}, 2);
} else if (1 && frycAPI_host("www.maxongroup.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#cont {
			position: absolute;
			z-index: 9999;
			background-color: white;
			padding: 10px;
			font-family: IBM Plex Sans;
			display: flex;
		}
		#cont div {
			padding: 5px 10px;
			border: 1px solid black;
			border-left: 0px;
		}
		#licz {
			border: 1px solid black !important;
		}
	`);
} else if (1 && frycAPI_host("www.medianauka.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.megamatma.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  7
else if (1 && frycAPI_host("www.messenger.com")) {
	frycAPI.line = frycAPI.get_line_number();
	const MESSAGE_CONTAINER = `[aria-label^="Wiadomości"] > div > div[role="none"] > div`;
	const MESSAGE_BODY = ".html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a.x18lvrbx";
	const MY_MESSAGE_BODY = ".html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a.xyk4ms5";
	const MY_MESSAGE_CONTAINER = `[role="none"] > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x6ikm8r.x10wlt62 > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x14ctfv`;
	const MESSAGE_LIST = ".x78zum5.xdt5ytf.x1iyjqo2.x2lah0s.xl56j7k.x121v3j4";
	const BUTTON_CONTAINER = `[data-release-focus-from="CLICK"] > div > .html-div:nth-child(3) [role="toolbar"] [role="presentation"] [role="presentation"]`;
	const REACT_CSS = `:is([aria-label="Zareaguj przy użyciu ikony emoji"],[aria-label="React using emoji"])`;
	const REPLY_CSS = `:is([aria-label="Odpowiedz na tę wiadomość"],[aria-label="Reply to this message"],[aria-label="Odpowiedz"])`;
	const MORE_CSS = `:is([aria-label="Więcej opcji"],[aria-label="More actions"],[aria-label="Więcej działań"])`;
	const SHARE_CSS = `:is([aria-label="Prześlij"],[aria-label="Share"])`;
	const share_item_css = `${SHARE_CSS}[role="menuitem"]`;
	const reply_item_css = `${REPLY_CSS}[role="menuitem"]`;
	const DEL_CSS = `[aria-label="Cofnij wysłanie wiadomości"][role="menuitem"]`;
	const EDIT_CSS = `[aria-label="Edytuj"][role="menuitem"]`;
	const moja_wiadomość = `${MESSAGE_CONTAINER} > div:has([data-release-focus-from="CLICK"] > div > div > div > div[role="none"])`;
	const ICON_WIDTH = `.x1mqs8db`;
	// const toolTipSpan = `span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1xmvt09.x1nxh6w3.x1fcty0u.xw2npq5.x4zkp8e.x676frb.xq9mrsl`;
	// const TIME_TOOLTIP = `.xu96u03.xm80bdy.x10l6tqk.x13vifvy:has(${toolTipSpan} > div > div:nth-child(3))`;
	const TIME_TOOLTIP = `[style*="--positionAnchor"] > [role="tooltip"]`;
	// const conversationTime = `span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs`;
	const PERSON_TYPING = `.x9f619.x1n2onr6.x1ja2u2z.__fb-dark-mode`;
	const NAME_ELEM = `.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x6s0dn4.xozqiw3.x1q0g3np.xexx8yu.xykv574.xbmpl8g.x4cne27.xifccgj`;
	const SPECIAL_LINK_BUTTON = `[role="button"][tabindex="-1"].x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1s688f`;
	const poll_update_message = `${MESSAGE_LIST} > :has(${SPECIAL_LINK_BUTTON}):not(:has([aria-label="Głosuj"],[aria-label="Zmień głos"]))`;
	const TOP_BAR = `.xfpmyvw.x1u998qt.x1vjfegm`;
	// const private_conv = `[aria-label^="Konwersacja z:"]:not([aria-label*=" i "])`; // First version
	const private_conv = `${TOP_BAR} a[href^="https://www.facebook.com"], [aria-label="Wybrane wartości"]:not(:has(>:nth-child(2)))`; // Private is opposite to group
	const USER_NAME = `span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.xt0psk2.x1xmvt09.x6prxxf.xk50ysn.xzsf02u.xq9mrsl`;
	const THREAD_LIST = `[aria-label="Lista wątków"]`;
	const SIDE_PANEL_TOP_LEVEL = `.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x1qjc9v5.xozqiw3.x1q0g3np.xexx8yu.x85a59c > .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x8mqhxd.x6ikm8r.x10wlt62.xcrg951.xm0m39n.xzhurro.x6gs93r.xpyiiip.x88v6c3.x1qpj6lr.xdhzj85.x1bc3s5a.xczebs5.x4pn7vq.xe95u6g`;
	const UNREAD_MESSAGE = `[aria-hidden="true"][role="button"][tabindex="-1"] > span[data-visualcompletion="ignore"]`;
	const MESSAGE_SCROLLER = `.x78zum5.xdt5ytf.x1iyjqo2.x5yr21d`;
	const KONTYNUUJ_ROZMOWĘ = `span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x3x7a5m.x1nxh6w3.x1sibtaa.xo1l8bm.x1fey0fg`;
	const KROPKA_ROZDZIELAJĄCA = `span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x3x7a5m.x1nxh6w3.x1sibtaa.xo1l8bm.xi81zsa`;
	frycAPI.inject_style_on_load(/*css*/`
		/*hsl(200deg 100% 20%)
		rgba(0, 161, 246, 0.7)*/
		*:not(code) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		/* ._7kpk {
			background-color: rgba(0, 0, 0, 0.05);
			border: 1px solid rgba(195, 195, 195, 0.6);
		}
		._1li- {
			border-top: 1px solid rgba(195, 195, 195, 0.6);
		}
		._4_j5 {
			border-left-color: rgba(195, 195, 195, 0.6);
		}
		._673w {
			border-bottom: 1px solid rgba(195, 195, 195, 0.6);
		}
		._7sli {
			border-left-color: rgba(195, 195, 195, 0.6);
		}
		._5iwm._6-_b ._58al {
			border: 1px solid rgba(195, 195, 195, 0.6);
		}
		.uiScrollableAreaGripper {
			border-color: rgba(195, 195, 195, 1);
		}
		._1t_q ._1t_r, ._1t_q ._4ldz, ._1t_q ._4ld-, ._1t_q ._4ld- img {
			max-height: 33px;
			max-width: 31px;
		}
		._41ud {
			margin-left: 39px;
		}
		.gvxzyvdx.om3e55n1.b0ur3jhr > .q46jt4gp.aesu6q9g.r5g9zsuq.e4ay1f3w.om3e55n1.lq84ybu9.hf30pyar.rt34pxt2.jao8r537.pdqhzjwd.l4uc2m3f.t7p7dqev.qsbzbi57.subw1o1z.b0ur3jhr.gffp4m6x {
			border: 1px solid #b1b1b1;
		}
		.i85zmo3j.homhzfsx.alzwoclg.jl2a5g8c {
			background: black;
			padding-right: 5px;
			border-radius: 5px;
		}
		.gvxzyvdx.om3e55n1.b0ur3jhr > .q46jt4gp.aesu6q9g.r5g9zsuq.e4ay1f3w.om3e55n1.lq84ybu9.hf30pyar.rt34pxt2.jao8r537.dtqh1a21.l4uc2m3f.t7p7dqev.qsbzbi57.subw1o1z.b0ur3jhr.j8nb7h05 {
			border: 1px solid #b1b1b1;
		} */

		/* Zmiana koloru tła
		:root {
			--my-custom-color: #6d1e1e;
		}
		.__fb-dark-mode {
			--messenger-card-background: var(--my-custom-color);
		}
		.xfpmyvw.x1u998qt.x1vjfegm {
			background-color: var(--my-custom-color);
		}
		.x1eb86dx {
			background-color: var(--my-custom-color);
		}
		.xcrg951 {
			background-color: var(--my-custom-color);
		}
		*/

		:root {
			--s1: 28px;
			--s2: 20px;
		}
		#facebook * {
			--chat-outgoing-message-bubble-background-color: #4C4C4C !important;
			--chat-message-text-color: white !important;
		}
		${MESSAGE_SCROLLER} {
			background-color: #000000;
		}
		.przerobiony {
			width: fit-content;

			& > .myButt {
				width: var(--s1);
				height: var(--s1);
				border-radius: 50%;
				cursor: pointer;
				&:hover {
					background-color: rgba(255, 255, 255, 10%);
				}
				div {
					opacity: 45%;
					width: 100%;
					height: 100%;
					background-repeat: no-repeat;
					background-position: center;
					background-size: var(--s2);
				}
			}
			& > .przerobiony {
				display: none;
			}
			& > .react {
				order: 1;
				div { background-image: url("${frycAPI.get_res_url("add_reaction.png")}"); }
			}
			& > .reply {
				order: 2;
				div { background-image: url("${frycAPI.get_res_url("reply.png")}"); }
			}
			& > .edit {
				display: none;
				order: 3;
				div { background-image: url("${frycAPI.get_res_url("edit.png")}"); }
			}
			& > .delete {
				display: none;
				order: 4;
				div { background-image: url("${frycAPI.get_res_url("delete.png")}"); }
			}
			& > .share {
				order: 5;
				div { background-image: url("${frycAPI.get_res_url("share.png")}"); }
			}
			& > .message {
				/* display: none; */
				order: 6;
				div { background-image: url("${frycAPI.get_res_url("message.png")}"); }
			}
			& > .profile {
				/* display: none; */
				order: 7;
				div { background-image: url("${frycAPI.get_res_url("profile.png")}"); }
			}
			& > :is(:has(${REACT_CSS}), :has(${REPLY_CSS}), :has(${MORE_CSS}), :has(${SHARE_CSS})) {
				width: 0;
				overflow: hidden;
			}
		}
		/* body:not([devicepixelratio="1"]) .przerobiony > .delete div {
			background-image: url("${frycAPI.get_res_url("delete.png")}");
		} */
		${MESSAGE_LIST} > div:not(:hover) .przerobiony > .myButt {
			display: none !important;
		}
		${moja_wiadomość} .przerobiony > .delete {
			display: block;
		}
		body[editOK="true"] ${moja_wiadomość}:not(.noEdit, :has(~ .noEdit)) .przerobiony > .edit {
			display: block;
		}
		/* ${MESSAGE_LIST}.noEdit > div:not(.noEdit, :has(~ .noEdit)) .przerobiony > .edit {
			display: block;
		} */
		${ICON_WIDTH} {
			width: calc(5 * var(--s1));
		}
		${moja_wiadomość} ${ICON_WIDTH} {
			width: calc(4 * var(--s1));
		}
		body:has(${private_conv}) ${ICON_WIDTH} {
			width: calc(3 * var(--s1));
		}
		body[editOK="true"] ${moja_wiadomość}:not(.noEdit, :has(~ .noEdit)) ${ICON_WIDTH} {
			width: calc(5 * var(--s1));
		}

		${TIME_TOOLTIP} {
			margin-top: -45px;
			pointer-events: none;
		}

		body:has(${MESSAGE_LIST} > ${PERSON_TYPING}) ${NAME_ELEM}::after {
			content: "Is typing...";
		}
		${MESSAGE_LIST} > ${PERSON_TYPING} {
			display: none;
		}

		html#facebook { /* [class][class][class][class][class] */
			overflow-y: hidden !important;
		}

		${poll_update_message} {
			display: none;
		}

		${MESSAGE_BODY}::first-letter { /* ${MY_MESSAGE_BODY} */
			text-transform: uppercase;
		}

		${MY_MESSAGE_CONTAINER} {
			/* background-color: hsl(0, 0%, 5%); */
			background-color: #616161 !important;
			background-image: none !important;
			* {
				color: white !important;
			}
		}

		${USER_NAME} {
			user-select: all;
		}

		/* Mirrored Messenger */
		${SIDE_PANEL_TOP_LEVEL} {
			order: -1;
		}
		${THREAD_LIST} {
			order: 2;
		}

		/* Delete text "Kontynuuj rozmowę?" */
		${KROPKA_ROZDZIELAJĄCA}:has(+ * > ${KONTYNUUJ_ROZMOWĘ}),
		:has(> ${KONTYNUUJ_ROZMOWĘ}) {
			display: none;
		}
	`);

	frycAPI.on_load_setter(function () {
		const icon_elem = frycAPI.change_favicon_res("Messenger icon new 256.png");
		// #region //* Change of title
		frycAPI.enforce_title("Messenger");
		// #endregion
		// #region //* Edit of options next to the messages
		const edit = frycAPI.elem_from_html(`<div class="myButt edit"><div></div></div>`);
		const del = frycAPI.elem_from_html(`<div class="myButt delete"><div></div></div>`);
		const share = frycAPI.elem_from_html(`<div class="myButt share"><div></div></div>`);
		const react = frycAPI.elem_from_html(`<div class="myButt react"><div></div></div>`);
		const reply = frycAPI.elem_from_html(`<div class="myButt reply"><div></div></div>`);

		// window.frycAPI_add_event_listener_fun("resize", () => {
		// 	document.body.setAttribute("devicePixelRatio", window.devicePixelRatio);
		// })();

		// let oldHref;
		function message_container_fun() {
			frycAPI.for_each(`${BUTTON_CONTAINER}:not(.przerobiony)`, container => {
				// loguj("buttonContainer");
				container.frycAPI_add_class("przerobiony");
				container.append(edit.cloneNode(1).frycAPI_add_event_listener("click", () => {
					const more_butt = container.querySelector(MORE_CSS);
					more_butt.click();
					frycAPI.sleep(10).then(() => {
						const edit_butt = document.querySelector(EDIT_CSS);
						if (edit_butt) {
							edit_butt.click();
						} else {
							more_butt.click();
							let elem = container.parentElement;
							while (!elem.parentElement.matches(MESSAGE_LIST)) {
								elem = elem.parentElement;
							}
							elem.frycAPI_add_class("noEdit");
						}
					});
				}));
				container.append(del.cloneNode(1).frycAPI_add_event_listener("click", () => {
					container.querySelector(MORE_CSS)?.click();
					frycAPI.sleep(10).then(() => document.querySelector(DEL_CSS)?.click());
				}));
				container.append(share.cloneNode(1).frycAPI_add_event_listener("click", () => {
					const share_butt = container.querySelector(SHARE_CSS);
					if (share_butt) {
						share_butt.click();
					} else {
						container.querySelector(MORE_CSS)?.click();
						frycAPI.sleep(10).then(() => document.querySelector(share_item_css)?.click());
					}
				}));
				container.append(react.cloneNode(1).frycAPI_add_event_listener("click", () => {
					container.querySelector(REACT_CSS)?.click();
				}));
				container.append(reply.cloneNode(1).frycAPI_add_event_listener("click", () => {
					const reply_butt = container.querySelector(REPLY_CSS);
					if (reply_butt) {
						reply_butt.click();
					} else {
						container.querySelector(MORE_CSS)?.click();
						frycAPI.sleep(10).then(() => document.querySelector(reply_item_css)?.click());
					}
				}));
			});
			const text = document.querySelector(`[aria-current="page"] abbr[aria-label] > span`)?.innerText;
			if (text !== undefined) document.body.setAttribute("editOK", text.endsWith("min") && parseInt(text.replace(" min", "")) < 15);

			// if (oldHref !== location.href) {
			// 	oldHref = location.href;
			// 	loguj("Navigation");
			// }
		}
		let message_container_elem;
		const message_container_opts = () => ({ elem: message_container_elem, options: { childList: true, subtree: true } });
		let message_container_observer;
		let first_time = true;
		frycAPI.create_mut_obs(() => {
			// loguj("Body observer");
			message_container_elem ??= document.querySelector(MESSAGE_CONTAINER);
			if (message_container_elem) {
				if (message_container_elem.isConnected) {
					if (first_time) {
						first_time = false;
						frycAPI.sleep(1000).then(() => {
							message_container_observer = frycAPI.create_mut_obs(message_container_fun, message_container_opts());
						});
					}
				} else {
					message_container_elem = document.querySelector(MESSAGE_CONTAINER);
					message_container_observer.disconnect();
					message_container_observer = frycAPI.create_mut_obs(message_container_fun, message_container_opts());
				}
			}
		});
		// #endregion
		// #region //* Changing favicon when there are unread messages
		frycAPI.create_mut_obs(() => {
			if (frycAPI.query_sel_ok(UNREAD_MESSAGE)) {
				icon_elem.href = frycAPI.get_res_url("Messenger icon new 256 yellow.png");
			} else {
				icon_elem.href = frycAPI.get_res_url("Messenger icon new 256.png");
			}
		});
		// #endregion
	});
} else if (1 && frycAPI_host("www.meteo.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		#wtg_meteogramy_bill_top {
			display: none;
		}
	`);
	if (frycAPI.path.startsWith("/um/")) {
		frycAPI.inject_style_on_load(/*css*/`
			/* body>div>div>img {
				filter: invert(1) hue-rotate(180deg);
			} */
			body {
				background-color: #181818 !important;
			}
			img {
				image-rendering: pixelated;
			}
			body>div:has(#meteorogram) {
				top: 107px !important;
				left: 14px !important;
			}
			body>div:has(#meteorogram) img {
				/* filter: invert(1) hue-rotate(180deg); */
				filter: brightness(0.8);
			}
			:has(>#wtg_meteorogram_top),
			:has(>#wtg_meteorogram_bottom){
				display: none;
			}

			.myButt {
				position: absolute;
				right: calc(100% + 15px);
				top: 0px;
				padding: 5px;
				height: 74px;
				width: 160px;
				cursor: pointer;
				/* background: radial-gradient(#00000000, #EDC379); */
				background: #EDC379;
				border: none;
				font-family: IBM Plex sans;
				font-size: 22px;
				font-weight: 500;
				color: #0000;
				text-shadow: 0px 0px 0px black;
				transition: all .3s ease-in-out;
			}
			.myButt:hover {
				background-color: #eec986;
				box-shadow: 0px 0px 0px 2px #000000;
				/*background: radial-gradient(#0000004a, #EDC379);*/
				/* border: 2px solid #e3e3e3; */
				/* border-radius: 5px; */
			}
		`);

		frycAPI.on_load_setter(() => {
			// https://www.meteo.pl/um/php/meteorogramlet
			document.head.insertAdjacentHTML("afterbegin", `<meta charset="UTF-8 BOM">`);
			frycAPI.change_favicon_res("meteo_pl.png");

			const font_elem = document.querySelector("#model_napis font");
			if (font_elem !== null) {
				document.title = font_elem
				.innerText
				.match(/^([^,])+/gu)[0]
				.trim() + " - meteo.pl";
			} else {
				document.title = document
				.querySelector("#napis_xy_ne")
				?.innerText
				.replaceAll(/[\s\u00A0]+/gmu, " ")
				.trim()
				.concat(" - meteo.pl") ?? document.title;
			}
			const butt = document.createElement("button");
			butt.classList.add("myButt");
			butt.innerText = "Odśwież stronę";
			butt.setAttribute("onclick", "location.reload();");
			document.querySelector('[href="javascript:print_this()"]')?.insertAdjacentElement("afterend", butt);
		});
	} else if (frycAPI.path.startsWith("/meteogramy")) {
		frycAPI.inject_style_on_load(/*css*/`
			.col-12:has(> .archives__advertisement) {
				display: none;
			}
			.forecast-box .date::after {
				content: attr(relTime);
				font-size: 12px;
				line-height: 1;
			}
		`);

		frycAPI.on_load_setter(() => {
			frycAPI.create_mut_obs(() => {
				const boxes = document.querySelectorAll(`.forecast-box`);
				if (boxes.length > 0) {
					boxes.forEach(forecast_box => {
						frycAPI.create_mut_obs(() => {
							if (forecast_box.frycAPI_has_class("forecast-box--visible")) {
								const hour_elem = forecast_box.frycAPI_elem_by_class("date__bigger");
								const day_elem = forecast_box.getElementsByClassName("date__classic")[1];
								if (!(hour_elem && day_elem)) return;
								const now = new Date();
								const [hour, minute] = hour_elem.textContent.split(":").map(Number);
								const [day, month] = day_elem.textContent.split(".").map(Number);
								const then = new Date(now.getFullYear(), month - 1, day, hour, minute);
								let diff = then.getTime() - now.getTime();
								const diff_sign = Math.sign(then.getTime() - now.getTime());
								diff = Math.abs(diff);
								const diff_hours = Math.floor(diff / 1000 / 60 / 60);
								const diff_minutes = Math.floor(diff / 1000 / 60 - diff_hours * 60);
								const diff_str = `${diff_hours} h ${diff_minutes} m`;
								// loguj(diff_str);
								forecast_box.firstElementChild.firstElementChild.firstElementChild.setAttribute("relTime", diff_sign > 0 ? `- za ${diff_str}` : `- ${diff_str} temu`);
							}
						}, { run_callback: true, elem: forecast_box, options: { characterData: true, subtree: true } });
					});
					return true;
				}
			});
		});
	}
} else if (0 && frycAPI_host("www.minecraftskins.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			background-color: #9c9c9c
		}
	`);
} else if (0 && frycAPI_host("www.mrexcel.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		[id*="google_ads_iframe"] {
			display:none
		}
	`);
} else if (1 && frycAPI_host("www.obliczeniowo.com.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.pcgamer.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		div.bordeaux-slot.bordeaux-filled-slot {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.pyszne.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/*
		img {
			filter: invert(1) hue-rotate(180deg) !important;
		}
		tspan.css-1kt4f9t {
			filter: invert(1);
		}
		*/
		._3ZXPf._1lbE7._1nR7l._2AnxL {
			background-image: url(${frycAPI.get_res_url("White_64.png")});
		}
	`);
} else if (1 && frycAPI_host("www.quora.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.q-flex.qu-borderColor--raised.qu-borderBottomLeftRadius--small.qu-borderBottomRightRadius--small.qu-borderBottom.qu-borderLeft.qu-borderRight.qu-bg--raised {
			display: none !important;
		}

		.q-box.Card___StyledBackroundTemporaryHighlightBoxChild-qc006b-0.spacing_log_question_page_ad.qu-borderAll.qu-borderRadius--small.qu-borderColor--raised.qu-boxShadow--small.qu-mb--small.qu-bg--raised {
			display: none !important;
		}

		#mainContent>div>.q-box:has(.q-box.qu-mb--tiny) {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.real-statistics.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.reddit.com", "chat.reddit.com")) {
	frycAPI.line = frycAPI.get_line_number();
	const chat = frycAPI_host("chat.reddit.com");
	const style = /*css*/`
		* {
			tab-size: 3 !important;
		}
		*:not(code, code *) {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		shreddit-ad-post {
			&, + hr {
				display: none !important;
			}
		}
		shreddit-comments-page-ad {
			display: none !important;
		}
		shreddit-comment>[slot="commentMeta"] .flex.flex-col.overflow-hidden {
			flex-direction: row;
			gap: 8px;
		}
		[slot="comment"] {
			padding-top: 0;
			margin-top: -5px;
		}
		#next-comment {
			display: none;
		}
		faceplate-tracker[noun="comment_author"]>a {
			color: hsl(16 70% 50% / 1);
		}
		a.a {
			color: hsl(219deg 80% 50%);
		}
		shreddit-post a[slot="title"] {
			shreddit-post-flair>faceplate-tracker>a.no-decoration {
				font-size: 10px;
				>span {
					margin: 0;
					top: unset;
					bottom: unset;
				}
			}
		}
		shreddit-comment-tree-ad {
			display: none;
		}

		.room-message.compact:hover faceplate-date {
			display: block;
		}
		faceplate-date.compact-timestamp {
			overflow: visible;
		}
		${chat ? /*css*/`
		body {
			width: 1300px;
			max-width: 100%;
			box-sizing: border-box;
			border: 1px solid var(--color-tone-5);
			border-top: 0;
			border-bottom: 0;
		}
		` : ""}

		/* subreddit blacklist hide */
		/* article:has(> shreddit-post[permalink^="/r/greentext"]) {
			display: none !important;
			& + hr {
				display: none !important;
			}
		} */

		/* subreddit whitelist show */
		/* article:has(> shreddit-post[permalink]:not([permalink^="/r/discordapp"])) {
			height: 0px !important;
			overflow: hidden !important;
			& + hr {
				display: none !important;
			}
			& shreddit-post {
				margin: 0 !important;
				padding: 0 !important;
			}
		} */

		/* [slot="comment"]::first-letter {
			text-transform: uppercase;
		} */

		faceplate-tracker[noun="games_drawer"], hr:has(+ faceplate-tracker[noun="games_drawer"]),
		faceplate-expandable-section-helper:has(summary[aria-controls="multireddits_section"]), faceplate-expandable-section-helper:has(summary[aria-controls="multireddits_section"]) + hr {
			display: none;
		}
	`;
	frycAPI.inject_style_on_load(style);

	const compact_timestamp_opts = {
		print_date: frycAPI.get_date_formatter({
			hour  : "2-digit",
			minute: "2-digit",
			default_undef: 1,
		}),
	};
	function set_date_in_shadows(root_elem) {
		frycAPI.traverse_shadow_roots(node => {
			if (node.hasAttribute("lepszyCzas")) return;

			frycAPI.set_default_date_style(node.shadowRoot).mode.relatywny_czas(node).tool_tip_center(node);
			frycAPI.create_mut_obs(mut_rec_arr => {
				const added_nodes = mut_rec_arr.some(mut_rec => mut_rec.addedNodes.length);
				if (added_nodes || mut_rec_arr.length === 0) {
					frycAPI.set_default_date(`faceplate-date.compact-timestamp > time`, {
						date_enum_mode: frycAPI.set_default_date_enum.mode.absolutny_czas,
						date_enum_style: frycAPI.set_default_date_enum.style.tool_tip_top,
						custom_style: `--tt-x: 18px; cursor: none;`,
						date_opts: compact_timestamp_opts,
						root_elem: node.shadowRoot,
					});
					frycAPI.set_default_date(`faceplate-date > time`, {
						date_enum_mode: frycAPI.set_default_date_enum.mode.oba,
						root_elem: node.shadowRoot,
					});
				}

				if (mut_rec_arr.length) {
					set_date_in_shadows(node);
				}
			}, { elem: node.shadowRoot });

			frycAPI.inject_style(style, { id: "frycAPI_styleNormal", elem: node.shadowRoot });
		}, root_elem);
	}

	frycAPI.on_load_setter(function () {
		frycAPI.set_default_date_style().mode.relatywny_czas().tool_tip_center();
		frycAPI.create_mut_obs(mut_rec_arr => {
			const tree = document.querySelector(`shreddit-comment-tree`);
			if (tree && tree.shadowRoot && tree.shadowRoot.getElementById("shreddit-comment-tree-style") === null) {
				frycAPI.inject_style(/*css*/`
					section[aria-label="Comments"] {
						gap: 6px;
					}
				`, { elem: tree.shadowRoot, id: "shreddit-comment-tree-style" });
			}

			frycAPI.for_each(`shreddit-comment:not(.poprawnyKomentarz)`, (da_elem, da_i, da_arr) => {
				if (da_elem.shadowRoot) { // && da_elem.shadowRoot.getElementById("shreddit-comment-style") === null
					frycAPI.inject_style(/*css*/`
						summary > .flex.relative {
							align-items: center;
							cursor: pointer;
							&:hover::after {
								--a: #3b3b3b;
								content: " ";
								background: var(--a);
								flex: 1;
								border-radius: 5px;
								box-shadow: 0 0 5px var(--a);
								height: 87%;
							}
						}
					`, { elem: da_elem.shadowRoot, id: "shreddit-comment-style" });
					da_elem.classList.add("poprawnyKomentarz");
				}
			});

			frycAPI.for_each(`shreddit-post:not(.poprawnyPost):has(shreddit-post-flair)`, (da_elem, da_i, da_arr) => {
				da_elem.querySelector(`a[slot="title"]`)?.appendChild(da_elem.querySelector(`shreddit-post-flair`));
				da_elem.classList.add("poprawnyPost");
			});

			frycAPI.set_default_date(`time`, { custom_style: `--tt-x: -18px; cursor: none;` });

			if (chat && mut_rec_arr.length) {
				set_date_in_shadows(document.body);
			}
		});
		if (chat) set_date_in_shadows(document.body);
	}, chat ? 2 : 1);
} else if (1 && frycAPI_host("www.roblox.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.voting-panel .users-vote .vote-details .vote-container .vote-percentage {
			background-color: #02b757 !important;
		}
		.voting-panel .users-vote .vote-details .vote-container .vote-background.has-votes {
			background-color: #E27676 !important;
		}
	`);
} else if (1 && frycAPI_host("www.satisfactorytools.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.mojaklasa {
			display: none;
		}

		#SUS {
			position: absolute;
			top: 416px;
			right: 69px;
		}

		#SUS2 {
			position: absolute;
			top: 416px;
			right: 267px;
		}
	`);
} else if (1 && frycAPI_host("www.slownikslaski.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed !important;
		}
	`);
} else if (1 && frycAPI_host("www.tenforums.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			background-color: #2a2a2a;
		}
	`);
} else if (1 && frycAPI_host("www.tme.eu")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.czerwony {
			color: red;
		}

		div#select_list_42 {
			height: 500px;
		}
	`);
} else if (1 && frycAPI_host("www.tutorialspoint.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		._adr_abp_container {
			display: none !important;
		}

		div#google-right-ads {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.ups.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		div#ups-alerts {
			color: black;
		}
	`);
} else if (1 && frycAPI_host("www.w3schools.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		#colormixer table tbody tr:nth-child(11) {
			color: red
		}
	`);

	frycAPI.on_load_setter(() => {
		const lead = document.getElementById("mainLeaderboard");
		if (lead !== null && lead.nextElementSibling.nodeName === "H1" && lead.nextElementSibling.innerHTML === "How TO - Sort a Table") {
			// loguj("Hello");
			frycAPI.make_table_sortable(document.getElementById("myTable"));
		}
	});
} else if (1 && frycAPI_host("www.when2meet.com")) {
	frycAPI.line = frycAPI.get_line_number();
	const FUNKCJE = "Konwertuj 12h na 24h";
	frycAPI.inject_style_on_load(/*css*/`
		:is(#YouGrid, #GroupGrid) [style="text-align:right;width:44px;height:9;font-size:10px;margin:4px 4px 0px 0px;"] {
			text-align: left !important;
			width: fit-content !important;
			margin: 4px 0px 4px 13px !important;
		}
		:is(#YouGrid, #GroupGrid) [style="display:inline-block;*display:inline;zoom:1; vertical-align:bottom;text-align:right;"] > div > div {
			border-left: none !important;
		}
	`);

	frycAPI.on_load_setter(() => {
		frycAPI.for_each(`[style="text-align:right;width:44px;height:9;font-size:10px;margin:4px 4px 0px 0px;"]`, godz_elem => {
			godz_elem.innerText = (new Date("11 30 2022 " + godz_elem.innerText.replace(/\s+/gu, " ").trim())).toLocaleTimeString().slice(0, -3);
		});
	});
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  8
else if (1 && frycAPI_host("www.worldometers.info")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		rect.highcharts-background {
			filter: invert(1);
		}

		g.highcharts-label.highcharts-tooltip {
			filter: invert(1);
		}

		g.highcharts-label.highcharts-tooltip tspan {
			fill: hsl(0 0% 58%);
		}
	`);
} else if (1 && frycAPI_host("www.youtube.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		/*
		#content-text.ytd-comment-renderer {
			font-family: IBM Plex Sans Conde;
			font-size: 17px;
			font-weight: lighter;
		}
		*/
		#owner.ytd-watch-metadata {
			min-width: calc(48% - 6px);
		}
		*:not(code) {
			font-family: IBM Plex Sans Condensed !important;
		}
		ytd-comment-thread-renderer {
			margin-bottom: 4px;
		}
		#toolbar.ytd-comment-action-buttons-renderer {
			height: 26px;
		}
		div#secondary.style-scope.ytd-watch-flexy {
			width: 586px !important;
		}
		/* .ytp-volume-panel {
			filter: invert(1);
		}
		.ytp-menuitem-toggle-checkbox {
			filter: invert(1) hue-rotate(180deg);
		} */
		/* ytd-playlist-video-renderer:not(:hover):not([style-type=playlist-video-renderer-style-recommended-video]) ytd-menu-renderer.ytd-playlist-video-renderer:not([menu-active]).ytd-playlist-video-renderer:not(:focus-within) {
			opacity: 1;
		} */

		ytd-menu-renderer.style-scope.ytd-playlist-video-renderer {
			display: flex;
		}

		.mySVG {
			pointer-events: none;
			display: block;
			height: 40px;
		}

		.myDIV {
			cursor: pointer;
			fill: white;
		}

		ytd-watch-metadata.ytd-watch-flexy #actions {
			--myLen: 20px;
			.yt-spec-button-shape-next--size-m .yt-spec-button-shape-next__icon {
				&, *:not(ytd-lottie-player.yt-animated-icon, ytd-lottie-player.yt-animated-icon *) { /* :not(.lottie-component, .lottie-component *) */
					width: var(--myLen) !important;
					height: var(--myLen) !important;
				}
				& ytd-lottie-player.yt-animated-icon {
					height: calc(62 * var(--myLen) / 24);
					width: calc(62 * var(--myLen) / 24);
				}
			}
			& yt-animated-icon[animated-icon-type=LIKE] ytd-lottie-player.yt-animated-icon {
				top: calc(-18 * var(--myLen) / 24);
			}
			.yt-spec-button-shape-next--size-m {
				padding: 0 calc(16 * var(--myLen) / 24);
				height: calc(36 * var(--myLen) / 24);
				line-height: calc(36 * var(--myLen) / 24);
				border-radius: calc(18 * var(--myLen) / 24);
				&, * {
					font-size: calc(14 * var(--myLen) / 24) !important;
				}
				&.yt-spec-button-shape-next--segmented-start::after {
					height: var(--myLen) !important;
					top: calc(6 * var(--myLen) / 24);
				}
				&.yt-spec-button-shape-next--segmented-start {
					border-radius: calc(18 * var(--myLen) / 24) 0 0 calc(18 * var(--myLen) / 24);
				}
				&.yt-spec-button-shape-next--segmented-end {
					border-radius: 0 calc(18 * var(--myLen) / 24) calc(18 * var(--myLen) / 24) 0;
				}
				&.yt-spec-button-shape-next--icon-button {
					width: calc(36 * var(--myLen) / 24);
				}
				&.yt-spec-button-shape-next--icon-leading .yt-spec-button-shape-next__icon {
					margin-right: calc(6 * var(--myLen) / 24);
					margin-left: calc(-6 * var(--myLen) / 24);
				}
			}
			& ytd-menu-renderer[has-flexible-items][safe-area] .top-level-buttons.ytd-menu-renderer {
				margin-bottom: 0;
			}
			& yt-button-shape.ytd-menu-renderer {
				align-items: center;
			}
			& div#flexible-item-buttons {
				&, & > ytd-download-button-renderer {
					display: flex;
					align-items: center;
				}
			}
			& #segmented-buttons-wrapper.ytd-segmented-like-dislike-button-renderer>div {
				display: flex;
				align-items: center;
			}
			& ytd-menu-renderer:not([condensed]) .ytd-menu-renderer[button-renderer]+.ytd-menu-renderer[button-renderer],
			& #flexible-item-buttons.ytd-menu-renderer:not(:empty)>.ytd-menu-renderer[button-renderer],
			& ytd-menu-renderer[has-items] yt-button-shape.ytd-menu-renderer {
				margin-left: calc(8 * var(--myLen) / 24);
			}

			ytd-watch-metadata[title-headline-xs] h1.ytd-watch-metadata {
				display: -webkit-box !important;
			}
		}

		/* --- */
		/*
		div#content:has([title="Subskrypcje"]>tp-yt-paper-item[aria-selected="true"]) ytd-rich-grid-row {
			 display: inline-block;
			 width: min-content;
		}
		div#content:has([title="Subskrypcje"]>tp-yt-paper-item[aria-selected="true"]) div#contents.ytd-rich-grid-row {
			 margin: 0;
		}
		div#content:has([title="Subskrypcje"]>tp-yt-paper-item[aria-selected="true"]) ytd-rich-item-renderer {
			 width: 190px;
			 margin: 1px;
		}
		div#content:has([title="Subskrypcje"]>tp-yt-paper-item[aria-selected="true"]) #video-title.ytd-rich-grid-media {
			 font-size: 14px;
			 line-height: initial;
		}
		div#content:has([title="Subskrypcje"]>tp-yt-paper-item[aria-selected="true"]) #text.complex-string.ytd-channel-name,
		div#content:has([title="Subskrypcje"]>tp-yt-paper-item[aria-selected="true"]) ytd-video-meta-block[rich-meta]#metadata-line.ytd-video-meta-block {
			 font-size: 12px;
			 line-height: initial;
		}
		*/

		/*
		body:has(ytd-guide-entry-renderer[active]>a[href="/feed/subscriptions"]) {
			& ytd-rich-grid-row {
			display: inline-block;
			width: min-content;
			}
			& div#contents.ytd-rich-grid-row {
			margin: 0;
			}
			& ytd-rich-item-renderer {
			width: 200px;
			margin: 1px;
			}
			& #video-title.ytd-rich-grid-media {
			font-size: 14px;
			line-height: initial;
			}
			& #text.complex-string.ytd-channel-name,
			& ytd-video-meta-block[rich-meta] #metadata-line.ytd-video-meta-block {
			font-size: 12px;
			line-height: initial;
			}
		}
		*/
		button.ytp-miniplayer-button.ytp-button {
			display: none;
		}
	`);

	let disable_end_screen, hide_translate_buttons;

	(frycAPI.before_load = function () {
		// Delete comments
		document.addEventListener("DOMContentLoaded", function (event) {
			frycAPI.clean(document.body);
		});
	})();

	frycAPI.on_load_setter(() => {
		// YT Playlist Element Delete Button
		(async () => {
			await frycAPI.sleep(2000);
			if (frycAPI.path.startsWith("/playlist")) {
				const esval = frycAPI.create_html('<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="mySVG"><path d="M11,17H9V8h2V17z M15,8h-2v9h2V8z M19,4v1h-1v16H6V5H5V4h4V3h6v1H19z M17,5H7v15h10V5z" class="style-scope yt-icon"></path></svg>');
				frycAPI.for_each(`ytd-menu-renderer.style-scope.ytd-playlist-video-renderer`, function (da_elem) {
					const tr_div = document.createElement("div");
					tr_div.appendChild(esval.cloneNode(1));
					tr_div.classList.add("myDIV");
					// tr_div.onclick = ytRemove;
					da_elem.insertAdjacentElement("afterbegin", tr_div).addEventListener("click", async function yt_remove() {
						this.parentNode.querySelector("yt-icon-button#button>button#button").click();
						await frycAPI.sleep(20);
						document.querySelectorAll("ytd-menu-service-item-renderer.style-scope.ytd-menu-popup-renderer")[2].click();
					});
				});
				loguj("YT Playlist Done!");
			}
		})();

		if (0 && frycAPI.path.startsWith("/watch")) {
			loguj("YT Watch Starting!");
			/*
			let pop = document.querySelector("ytd-popup-container");
			if (pop) {
				loguj("Pop! Od razu!");
				let butt = pop.querySelector("ytd-popup-container .yt-spec-button-view-model");
				if (butt) {
					loguj("Butt! Od razu!");
					butt.click();
					document.querySelector("button.ytp-play-button.ytp-button").click();
				} else {
					loguj("Obserwuję Pop!");
					new MutationObserver(async (mutRec1, mutObs1) => {
						let butt = pop.querySelector("ytd-popup-container .yt-spec-button-view-model");
						if (butt) {
							loguj("Butt! Od razu! Mutator!");
							await frycAPI.sleep(1);
							butt.click();
							document.querySelector("button.ytp-play-button.ytp-button").click();
							mutObs1.disconnect();
						}
					}).observe(pop, { childList: true, subtree: true, attributes: true });
				}
			} else {
				loguj("Obserwuję body!");
				new MutationObserver((mutRec, mutObs) => {
					let pop = document.querySelector("ytd-popup-container");
					if (pop) {
						loguj("Pop! Mutator!");
						let butt = pop.querySelector("ytd-popup-container .yt-spec-button-view-model");
						if (butt) {
							loguj("Butt! Mutator!");
							butt.click();
							document.querySelector("button.ytp-play-button.ytp-button").click();
						} else {
							loguj("Mutator! Obserwuję Pop!");
							new MutationObserver(async (mutRec1, mutObs1) => {
								let butt = pop.querySelector("ytd-popup-container .yt-spec-button-view-model");
								if (butt) {
									loguj("Butt! Mutator! Mutator!");
									await frycAPI.sleep(1);
									butt.click();
									document.querySelector("button.ytp-play-button.ytp-button").click();
									mutObs1.disconnect();
								}
							}).observe(pop, { childList: true, subtree: true, attributes: true });
						}
						mutObs.disconnect();
					}
				}).observe(document.body, { childList: true, subtree: true });
			}
			*/
			(async () => {
				const t0 = performance.now();
				let t1;
				while (1) {
					const butt = document.querySelector("ytd-popup-container .yt-spec-button-view-model");
					if (butt) {
						loguj(document.querySelector("ytd-popup-container").cloneNode(1));
					}
					await frycAPI.sleep(500);
					t1 = performance.now();
					if (t1 - t0 > 10000) {
						break;
					}
				}
			})();
			loguj("YT Watch Done!");
		}

		(async () => {
			await frycAPI.sleep(3000);
			frycAPI.clean(document.body);
		})();

		disable_end_screen = frycAPI.inject_style(/*css*/`
			.ytp-ce-element {
				display: none;
			}
		`);

		hide_translate_buttons = frycAPI.inject_style(/*css*/`
			tp-yt-paper-button[noink].ytd-tri-state-button-view-model {
				display: none;
			}
		`);
	});

	frycAPI.create_manual_functions("YouTube", {
		func_arr: [
			(name = "End Screen", type = frycAPI_Pure_state) => {
				const f = new type({
					name: name,
					state: 0,
				});
				f.callback = function (obj) {
					disable_end_screen.toggle();
				};
				return f;
			},
			(name = "Hide translate buttons", type = frycAPI_Pure_state) => {
				const f = new type({
					name: name,
					state: 1,
				});
				f.callback = function (obj) {
					hide_translate_buttons.toggle();
				};
				return f;
			},
			(name = "YT-DLP", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.additional_action = { name: "close" };
				f.callback = function (obj) {
					frycAPI.send_message_to_ahk("YT-DLP", location.href);
				};
				return f;
			},
			(name = "YT-DLP extract audio", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.additional_action = { name: "close" };
				f.callback = function (obj) {
					frycAPI.send_message_to_ahk("YT-DLP extract audio", location.href);
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("wyniki.diag.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.line-chart::after {
			background-color: #F55E32;
		}

		[data-text*="Badanie wykonano metodą spektrofotometryczną na aparacie Cobas 8000"], [data-text*="Badanie wykonano metodą spektrofotometryczną na aparacie Cobas 8000"]+span {
			display: none !important;
		}

		.table__container .table--results .table__row {
			padding-top: 10px !important;
			padding-bottom: 10px !important;
		}

		.table--results .table__cell {
			justify-content: center;
		}
	`);
} else if (1 && frycAPI_host("wyznacznik.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img {
			filter: invert(1);
		}
	`);
} else if (frycAPI_host("www.rp.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.nazwa_bloku_if = "";
	frycAPI.inject_style_on_load(/*css*/`
		.section--ad--breaker ,
		.content--excerpt,
		ins.adsbygoogle,
		.marketing--comp *,
		.indulona-abs {
			display: none !important;
		}
		body, img {
			/* position: relative;
			background: none !important; */
			filter: invert(1) hue-rotate(180deg);
		}
		body::after {
			content: "";
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			background-image: url('https://statics.rp.pl/img/content-background.jpg?aver=af796e49') !important;
			/* filter: invert(1); */
			/* -webkit-filter: invert(100%); */
			z-index: -1;
		}
	`);
} else if (frycAPI_host("polandsvoice.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.nazwa_bloku_if = "";
	frycAPI.inject_style_on_load(/*css*/`
		.App-Content>div>svg>text:first-of-type {
			font-family: IBM Plex Mono;
		}
	`);
} else if (frycAPI_host("www.mchtr.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		*:not(.naglowek-middle.logo *,[title="Szukaj"] *) {
			font-family: IBM Plex Sans Condensed;
		}
	`);
} else if (frycAPI_host("www.java.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.nazwa_bloku_if = "";
	frycAPI.inject_style_on_load(/*css*/`
	`);

	(frycAPI.before_load = function () {
		frycAPI.color_scheme_dark = 1;
	})();
} else if (frycAPI_host("www.overleaf.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.nazwa_bloku_if = "";
	frycAPI.inject_style_on_load(/*css*/`
		/*
		.pdf {
			background-color: #272727;
		}
		.pdf-viewer {
			filter: invert(1) hue-rotate(180deg);
		}
		*/
	`);
} else if (frycAPI_host("www.nongnu.org", "www.tug.org", "sunsite.icm.edu.pl", "latexref.xyz")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			margin: auto;
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (frycAPI_host("www.ctan.org", "ctan.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.head a[href="/"] {
			/* -webkit-text-stroke: 1.5px white; */
			/* text-shadow:
				-1px -1px 0px #000,
				+1px -1px 0px #000,
				-1px +1px 0px #000,
				+1px +1px 0px #000; */
		}
		/* span.lion,
		#activity-summary,
		#upload-summary,
		table.entry td:has([class*="icon"]),
		table.entry td:has([class*="icon"]) a {
			filter: invert(1) hue-rotate(180deg);
		} */
		.lion {
			background: url("https://www.ctan.org/assets/skin/gray/images/ctan-lion-2d2b3fd0135e5480d79454de807d7904.png") no-repeat;
			background: url("https://www.ctan.org/assets/skin/gray/images/ctan-lion-d371c25e7eefcd9e0ada8e810fc88127.svg") no-repeat;
			background-size: 100% 100%;
		}

		table.voted tr .stars {
			display: none;
		}
		table.voted tr::before {
			font-family: "fontawesome";
			color: gold;
		}
		table.voted tr:nth-child(1)::before { content: "\\f005\\f005\\f005\\f005\\f005"; }
		table.voted tr:nth-child(2)::before { content: "\\f005\\f005\\f005\\f005"; }
		table.voted tr:nth-child(3)::before { content: "\\f005\\f005\\f005"; }
		table.voted tr:nth-child(4)::before { content: "\\f005\\f005"; }
		table.voted tr:nth-child(5)::before { content: "\\f005"; }

		.cinfo .rate-panel span {
			top: -2.5px;
		}

		main.content {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;
			padding: 32px;
		}
		main.content>h1 {
			margin-top: 0;
		}
		.right>h2 {
			margin-top: 10px;
		}
		main.content>:is(h1,h2) {
			flex-basis: 100%;
		}
		.content :is(.left,.right) {
			margin: 0;
		}
		@media (min-width: 60em) {
			.content .right {
				padding: 0;
				flex-basis: calc(40% - 20px);
			}
			.content .left {
				/* width: 60%; */
			}
		}
		h1, h2, table.entry {
			border-radius: 5px;
		}
		input.phrase {
			margin: 2px 0 0 0;
		}
		ul.menu.search-menu>li {
			padding-left: 16px;
		}
	`);
} else if (1 && frycAPI_host("help.eclipse.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.on_load_setter(() => {
		const frame_doc = window.frames["HelpFrame"].frames["ContentFrame"].frames["ContentViewFrame"].document; // eslint-disable-line dot-notation
		// window.frames["ContentViewFrame"].document
		// document.querySelector("frame[name='ContentViewFrame']").contentDocument
		// if ((frame_doc !== null) && ((myh1 = frame_doc.querySelector("div.header>h1.title")) !== null) && (myh1.innerHTML === "Class DefaultCodeFormatterConstants")) {
		if (frame_doc !== null && frame_doc.querySelector("div.header>h1.title")?.innerHTML === "Class DefaultCodeFormatterConstants") {
			// Specifically for this website: https://help.eclipse.org/latest/index.jsp?topic=%2Forg.eclipse.jdt.doc.isv%2Freference%2Fapi%2Forg%2Feclipse%2Fjdt%2Fcore%2Fformatter%2FDefaultCodeFormatterConstants.html
			frycAPI.inject_style(/*css*/`
				#field-summary > .summary-table {
					/* display: block;
					& > .myTable {
						width: 100%;
						& > tr {
							& > *:nth-child(1) {
								width: fit-content;
								&, & > div {

								}
								& > div {
									white-space: nowrap;
								}
							}
							& > *:nth-child(2) {
								max-width: 50%;
							}
							& > *:nth-child(3) {
								width: minmax(15%, auto);
							}
							& > th, & > td {
								height: auto;
							}
							& > th {
								height: auto;
							}
							& > td {
								height: auto;
							}
						}
					} */
					& > div:not(.table-header) {
						background-color: rgb(41, 44, 44);
					}
					& > div:is(:nth-child(6n), :nth-child(6n-1), :nth-child(6n-2)) {
						background-color: rgb(33, 35, 36);
					}
					& .table-header {
						cursor: pointer;
						&:hover {
							position: relative;
						}
						&:hover::before {
							content: "";
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 100%;
							background-color: hsla(0, 0%, 100%, 0.1);
						}
						&.posortowana::after {
							content: " ⮟";
						}
					}
				}
			`, { elem: frame_doc.documentElement });
			const my_table = frame_doc.querySelector("#field-summary>.summary-table");
			const sort_fun = function () {
				const t0 = performance.now();

				const doc_frag = document.createDocumentFragment();
				Array.prototype.slice.call(my_table.querySelectorAll(`.${this.classList[1]}:not(.table-header)`), 0).sort(function my_sort(a, b) {
					const a1 = a.innerText;
					const b1 = b.innerText;
					return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
				}).forEach(function for_each_after_sort(da_elem, da_i, da_arr) {
					da_elem.row.forEach(function for_each_elem_in_row(da_elem1, da_i1, da_arr1) {
						doc_frag.appendChild(da_elem1);
					});
				});
				my_table.appendChild(doc_frag);
				my_table.querySelector(".posortowana")?.classList.remove("posortowana");
				this.classList.add("posortowana");

				const t1 = performance.now();
				loguj(`${(t1 - t0).toFixed(1)} ms`);
			};
			/*
			let newTable = my_table.appendChild(document.createElement("table").frycAPI_add_class("myTable"));
			let myDiv = document.createElement("tr");
			my_table.querySelectorAll(":scope>div").forEach(function (daElem, daI, daArr) {
				myDiv.appendChild(document.createElement(daI >= 3 ? "td" : "th")).appendChild(daElem);
				if (myDiv.childElementCount === 3) {
					newTable.appendChild(myDiv);
					myDiv = document.createElement("tr");
				}
			});
			*/
			my_table.querySelectorAll(".table-header:is(.col-first, .col-second, .col-last)").forEach(function (da_elem, da_i, da_arr) {
				da_elem.addEventListener("click", sort_fun);
			});
			my_table.querySelectorAll(":scope>div:not(.table-header)").forEach(function (da_elem, da_i, da_arr) {
				if (da_elem.classList.contains("col-first")) {
					da_elem.row = [da_elem, da_elem.nextElementSibling, da_elem.nextElementSibling.nextElementSibling];
				} else if (da_elem.classList.contains("col-second")) {
					da_elem.row = [da_elem.previousElementSibling, da_elem, da_elem.nextElementSibling];
				} else if (da_elem.classList.contains("col-last")) {
					da_elem.row = [da_elem.previousElementSibling.previousElementSibling, da_elem.previousElementSibling, da_elem];
				}
			});
		}
	});
} else if (frycAPI_host("docs.oracle.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#LeftBar {
			width: 170px;
			&, & > div {
				float: none;
			}
		}
		#MainFlow {
			margin: 0;
			margin-left: 15px;
			width: calc(100% - 170px - 15px);
			max-width: 800px;
		}
		.myDiv {
			display: flex;
			width: fit-content;
			max-width: calc(100% - 13px);
			margin: auto;
		}
		.description, .contentContainer, .header {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		.description {
			padding: 10px 20px 0 20px ;
			margin: auto;
			width: 800px;
			max-width: calc(100% - 15px);
		}
		.header {
			padding-bottom: 0;
		}
		.description {
		}
		.contentContainer {
			margin: 0 15px;
		}

		li.blockList:has(>h4) {
			border: 1px solid #ededed !important;
		}
		li.blockList>h4 {
			border-width: 0px !important;
			border-bottom-width: 1px !important;
		}
	`);

	frycAPI.on_load_setter(() => {
		const main_flow = document.getElementById("MainFlow");
		try {
			main_flow.insertAdjacentElement("afterend",
				document.createElement("div").frycAPI_add_class("myDiv"))
			.append(document.getElementById("LeftBar"), main_flow
			);
		} catch (error) { }

		try {
			document.querySelector(".description")
			.frycAPI_insert_adjacent_element("afterbegin", document.querySelector("ul.inheritance"))
			.insertAdjacentElement("afterbegin", document.querySelector(".header"));
		} catch (error) { }

		if (frycAPI.path.frycAPI_includes_any("%2Fdocs%2F", "/docs/")) {
			frycAPI.change_favicon_res("ORACLE.png");
		}
	});
} else if (frycAPI_host("npskills.github.io")) { // NINE PARCHMENTS SKILL CALCULATOR
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			font: 15pt/17pt IBM Plex Sans Condensed;
			background: #333;
		}
		.points, .totalPoints:not(span) > *, .descriptionContainer * {
			text-shadow:
				+1px +1px 1px black,
				+1px -1px 1px black,
				-1px +1px 1px black,
				-1px -1px 1px black;
		}
		.points {
			right: unset;
			left: 0px;
			width: 100%;
			text-align: center;
		}
		.totalPoints:not(span) {
			position: absolute;
			display: flex;
			justify-content: center;
			top: calc(100% + 9px);
			left: 0;
			width: 100%;
		}
		.treewrapper {
			position: relative;
		}
		span.totalPoints, .totalPoints>legend {
			position: relative;
			width: fit-content;
		}
		span.totalPoints {
			margin-left: 4px;
		}
		.totalPoints>legend::after {
			content: " ="
		}
	`);

	document.addEventListener("DOMContentLoaded", () => {
		document.body.insertAdjacentHTML("afterbegin",
			`<img src='background.png' style="opacity: 0;transition: opacity 3s 0s ease-in-out;position: fixed;width: 100%;z-index: -10;" onload="this.style.opacity='1'">`
		);
		frycAPI.for_each("legend", (da_elem, da_i, da_arr) => {
			da_elem.previousElementSibling.insertAdjacentElement("afterbegin", da_elem);
		});
	});
} else if (1 && frycAPI_host("www.konesso.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style(/*css*/`
		div#preloader {
			display: none;
		}
		svg#loader {
			display: none;
		}
	`, { elem: document.documentElement });

	(frycAPI.before_load = function () {
		// frycAPI.color_scheme_dark = 1;
	})();

	frycAPI.on_load_setter(() => {
	});
} else if (frycAPI_host("barotraumagame.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		div[style="text-align:center;inline-size:min-content;white-space: nowrap;"] {
			display: flex;
			gap: 5px;
			& div:not([style="display:flex;align-items:center;text-align:left;white-space:nowrap"]) {
				display: flex;
				align-items: center;
			}
			& div[style="display:flex;align-items:center;text-align:left;white-space:nowrap"]
			/* ,div[style="float:left;line-height:100%"] */
			{
				display: flex;
				align-items: flex-start !important;
				flex-direction: column;
			}
		}

	`);
} else if (frycAPI_host("www.tribologia.eu")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		:root {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (frycAPI_host("steamspy.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img[alt="logo"] {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs  9
else if (frycAPI_host("www.fakrosno.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.spring-middle>img {
			filter: invert(1) hue-rotate(180deg) !important;
		}
	`);
} else if (frycAPI_host("www.arrowheadgamestudios.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.comment-author cite.fn {
			font-size: 22px;
			padding: 0;
			color: rgb(79, 197, 147);
		}
		span.says {
			display: none;
		}
		ol.commentlist {
			margin-block-start: 40px;
			list-style-type: decimal;
		}
		.comment-body {
			display: flex;
			flex-wrap: wrap;
			.comment-meta, .comment-author {
				width: fit-content;
			}
			.comment-meta {
				/* margin-right: auto; */
				& a {
					color: rgb(149, 142, 131);
				}
				&::before {
					content: ", ";
				}
			}
			>p {
				flex-basis: 100%;
				color: hsl(0deg 0% 90%);
			}
			.reply {
				font-size: 14px;
				/* border: 1px solid rgb(149, 142, 131); */
				border-radius: 5px;
				& a {
					color: rgb(149, 142, 131);
					padding: 1px 3px;
					&::after {
						content: " ↳"; /* ↳⤷↴ */
						font-size: 19px;
					}
				}
			}
		}
		ul.children {
			margin-left: 20px;
		}
		li.comment {
			border-left: 1px solid;
			padding-left: 5px;
			margin: 6px 0px;
			border-radius: 5px;
		}
	`);
} else if (frycAPI_host("e621.net", "e926.net")) {
	frycAPI.line = frycAPI.get_line_number();

	const SEARCH_BUTTON = `button[type="submit"][title="Search"]`;
	const POOL_TILE_DESC = `section.posts-container article`;

	const path_name = frycAPI.path;
	const caches = [
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoL0JpYmxpb3Rla2kgV2luZG93cy9PYnJhenkvRGlzY29yZCBBUlRzLw=="),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoL0JpYmxpb3Rla2kgV2luZG93cy9PYnJhenkvRGlzY29yZCBBUlRzL01pbmVGb2xkZXIv"),

		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUv"),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvSnVzdCBJbnRlcmVzdGluZy8="),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvUGlua2llJ3MgRGluZ2Rvbmcv"),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvRnVubnkv"),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvVW5leHBlY3RlZCB0cmVhc3VyZXMv"),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvRW1iZXIv"),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvUlAgTmlld29sbmljYS8="),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvZTYyMURvd25sb2FkZXIvR2VuZXJhbCBTZWFyY2hlcy9vcmRlcl9zY29yZSAtYW5pbWF0ZWQgcmF0aW5nX3MgcHJpbmNlc3NfY2VsZXN0aWFfKG1scCkgc2NvcmVfXz02My8="),
		new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoLyFQb2RyxJljem55L05ldmVyIG1pbmQvY29uZmlnIGZpbGVzLyFkb2MxL01pbmUvZTYyMURvd25sb2FkZXIvR2VuZXJhbCBTZWFyY2hlcy9wcmluY2Vzc19sdW5hXyhtbHApIG9yZGVyX3Njb3JlIC10eXBlX3dlYm0gcmF0aW5nX3NhZmUgLWNvdmVyIHNjb3JlX189NzAv"),
	];

	frycAPI.inject_style_on_load(/*css*/`
		*:not(i) {
			font-family: "IBM Plex Sans Condensed" !important;
		}
		#search-box {
			margin-bottom: 1em;
		}
		#search-box h1 {
			font-size: 1.16667em;
		}
		#search-box form input {
			border-radius: 3px 0 0 3px;
			border-right: 0;
			box-sizing: border-box;
			padding: 0.125rem;
			position: relative;
			width: calc(100% - 30px);
			z-index: 1;
		}
		#search-box form button {
			background: #eee;
			border-left: 1px solid #ccc;
			border-radius: 0 3px 3px 0;
			padding: 2px 6px;
			width: 2em;
		}
		.search-help {
			float: none;
		}
		ul#ui-id-1 {
			width: fit-content !important;
		}
		#image {
			max-width: 100%;
			max-height: 94vh;
			/* width: 95vw;
			height: 95vh; */
		}
		#mojButon1 {
			display: none;
		}
		.mojSpan {
			position: absolute;
			left: 0;
			background: black;
		}
		.fa-chevron-right:before {
			content: "❯";
		}
		.fa-chevron-left:before {
			content: "❮";
		}
		.fa-ellipsis-h:before, .fa-ellipsis:before {
			content: "…";
		}
		.fa-magnifying-glass:before, .fa-search:before {
			content: "🔍";
		}
		.fa-check-circle:before, .fa-circle-check:before {
			content: "✅";
		}
		div.post-score {
			word-wrap: break-word;
			display: flex;
			justify-content: center;
			gap: 5px;
			& span {
				margin: 0 !important;
			}
			& span.post-score-faves {
				color: red;
			}
			& span.post-score-comments {
				color: orange;
			}
			& span.post-score-rating {
				display: block;
			}
		}
		#mojScroll {
			position: fixed;
			bottom: 5px;
			right: 5px;
		}
		#mojScroll, .pokaż-wykres {
			color: #b4c7d9;
			border: 1px solid;
			background-color: #1F3C67;
			padding: 10px;
			border-radius: 5px;
			cursor: pointer;
			&:hover {
				filter: brightness(1.3);
			}
		}

		.styled-dtext .inline-code {
			padding: 1px 2px;
			border-radius: 5px;
			font-size: 0.7rem;
		}

		#ad-leaderboard {
			display: none;
		}

		img[src="/images/deleted-preview.png"] {
			filter: invert(1) hue-rotate(180deg);
		}

		#c-posts div.nav-notice {
			margin-bottom: 0;
		}
		#image-and-nav {
			gap: 5px;
		}
		#post-notices-top:has(#flash-shortcut-notice:only-child) {
			display: none;
		}
		.nav-primary, .nav-secondary {
			padding-left: 0 !important;
		}
		header#top menu {
			margin-top: 0;
		}
		/* #nav {
			grid-template-areas: unset;
			grid-template-rows: auto auto;
			.logo, menu.secondary , menu.main {
				grid-area: unset;
			}
			.logo {
				grid-column: 1 / 2;
				grid-row: 1 / 3;
			}
			menu.main {
				grid-column: 2 / 3;
				grid-row: 1 / 2;
			}
			menu.secondary {
				grid-column: 2 / 3;
				grid-row: 2 / 3;
			}
		} */
		#nav:has(#nav-account.current) menu.secondary {
			border-top-left-radius: 0;
		}
		/* :not(:has(#nav-account.current)) */
		:is(.nav-primary, .nav-help) li.current > a {
			border-radius: 6px 6px 0 0 !important;
			position: relative;
			&::before, &::after {
				content: "";
				display: block;
				position: absolute;
				bottom: 0;
				background-color: var(--color-foreground);
				width: 6px;
				height: 6px;
				mask-repeat: no-repeat;
				--base: 6px;
				--span: 0.5px;
				--mask-image: radial-gradient(
					circle at var(--x) 0%,
					transparent calc(var(--base) - (var(--span) / 2)),
					var(--color-foreground) calc(var(--base) + (var(--span) / 2))
				);
			}
			:not(#nav-artists) > &::before {
				right: 100%;
				--x: 0%;
				mask-image: var(--mask-image);
			}
			&::after {
				left: 100%;
				--x: 100%;
				mask-image: var(--mask-image);
			}
		}
		.nav-primary:has(#nav-artists.current) ~ .nav-secondary {
			&, & #quick_search_name {
				border-top-left-radius: 0;
			}
		}
		header#top menu.main:has(#nav-account.current) li.current > a::before {
			display: none;
		}
		.comment-post .post-information .row {
			display: flex;
			gap: 5px;
			span.post-info {
				margin: 0 !important;
			}
			.post-info:not(:first-child, :last-child) {
				border: solid white;
				border-width: 0 1px 0 1px;
				padding: 0 5px;
			}
		}
		div#c-comments div#a-index .comment-post {
			padding: 5px;
		}
		article.post-preview {
			flex-shrink: 0;
		}

		.pool-diff-graph {
			--f-size: 12px;
			font-size: var(--f-size);
			line-height: var(--f-size);

			&, & * {
				font-family: "Source Code Fryc" !important;
			}
			b {
				color: red;
				font-weight: normal;
			}
			.txt-col-s { color: var(--palette-text-green); }
			.txt-col-q { color: var(--palette-text-yellow); }
			.txt-col-e { color: var(--palette-text-red); }
			.txt-col-ś {
				color: color-mix(in srgb, var(--palette-text-green), white 50%);
				/* text-align: left; */
			}
			.diff-number, #reset-graph {
				cursor: pointer;
				display: inline;
				font-weight: bold;
			}
			:is(.diff-number, #reset-graph):hover, .diff-sel {
				background-color: hsla(0, 0%, 100%, 20%);
			}
			.left {
				background-color: color-mix(in srgb, var(--palette-text-green) 20%, transparent);
			}
			.right {
				background-color: color-mix(in srgb, var(--palette-text-red) 20%, transparent);
			}
			#reset-graph {
			}
		}
		${POOL_TILE_DESC} .pool-diff-graph {
			padding: 1px;
			padding-top: 0;
		}
		.loading-gif {
			filter: invert(1);
		}
		nav.paginator + .loading-gif {
			width: 100px;
		}
		${POOL_TILE_DESC} .loading-gif {
			height: 30px;
			width: auto;
			border: none !important;
			display: block;
			margin: auto;
		}
		.pokaż-wykres {
			width: fit-content;
		}
		.pokaż-info {
			cursor: pointer;
			border-radius: .25rem;
			padding: .25rem;
			margin-top: .25rem;
			background: var(--color-section-lighten-5);
			text-align: center;

			&:hover {
				background-color: hsla(0, 0%, 100%, 10%);
			}
		}
		article.thumbnail {
			align-items: stretch;
		}

		form.post-search-form {
			display: flex;
			gap: 5px;
		}
		#tags {
			flex-grow: 1;
		}

		${path_name.startsWith("/db_export") ? /*css*/`
			*:not(i) {
				font-family: "Source Code Fryc" !important;
			}
			html {
				filter: invert(1) hue-rotate(180deg);
				background-color: white;
			}
		` : ""}

		textarea, input, select:not(#image-resize-selector) {
			background-color: #222222 !important;
			color: white !important;
		}

		.styled-dtext details summary {
			display: block;
			&::before {
				content: "${frycAPI.list_marker_collapsed}";
				display: inline-block;
				font-weight: bold;
				width: 17px;
			}
		}
		details[open] > summary::before {
			content: "${frycAPI.list_marker_open}";
		}

		/* Collapsing comments */
		.my-comments-header {
			color: var(--color-link);

			&::before, &::after {
				display: inline-block;
				font-weight: bold;
			}
			&:hover {
				cursor: pointer;
				color: var(--color-link-hover);
			}
			&::before {
				content: "${frycAPI.list_marker_open}";
				width: 17px;
			}
			#comments.collapsed &::before {
				content: "${frycAPI.list_marker_collapsed}";
			}
			&::after {
				content: var(--comment-count, "Comments");
			}
		}
		#comments.collapsed .comments-for-post {
			display: none;
		}

		#nav-links-top#nav-links-top {
			display: flex;
			flex-flow: row;
			justify-content: space-between;
			background-color: hsl(216, 54%, 15%);

			.nav-block {
				flex-grow: 1;
			}
		}

		body:not(.posts-separated) .hide-duplicate-posts {
			display: none;
		}
		body[hide-user-profile-pictures="1"] .avatar img[title^="Rating: e"],
		body[hide-user-profile-pictures="2"] .avatar img:is([title^="Rating: e"],[title^="Rating: q"]),
		body[hide-user-profile-pictures="3"] .avatar img {
			display: none;
		}
	`);

	frycAPI.on_load_setter(() => {
		if (path_name.startsWith("/posts/")) {
			const image = frycAPI.by_id("image");

			const sidebar_info = {};
			frycAPI.for_each(`#post-information .post-sidebar-label`, da_elem => {
				const txt = da_elem.textContent.trim();
				if (!txt) return;
				const val_elem = da_elem.nextElementSibling;
				if (!val_elem) return;
				sidebar_info[txt] = val_elem.textContent.trim();
			});

			const default_scroll = () => {
				scrollTo(0, document.documentElement.scrollTop + (document.getElementById("nav-links-top") ?? document.getElementById("image")).getBoundingClientRect().y - 1);
			};
			(document.body.appendChild(document.createElement("div"))
			.frycAPI_set_attribute("id", "mojScroll")
			.frycAPI_set_inner_html("Default scroll")
			.onclick = default_scroll)();

			image.addEventListener("load", default_scroll);

			// const download = document.querySelector(`#image-download-link > a.button`);
			// download.setAttribute("onclick", `location.href = '${download.getAttribute("href")}'`);
			// download.setAttribute("href", "");

			// #region //* Uncollapse comments button
			const comments = frycAPI.by_id("comments");
			comments.frycAPI_add_class("collapsed");
			const my_comments_header = frycAPI.elem("span").class("my-comments-header")._;
			my_comments_header.addEventListener("click", e => {
				comments.classList.toggle("collapsed");
			});
			comments.insertAdjacentElement("afterBegin", my_comments_header);
			const new_comment = frycAPI.q_sel(`.new-comment`);
			if (new_comment) new_comment.parentElement.insertAdjacentElement("afterBegin", new_comment);
			my_comments_header.style.setProperty("--comment-count", `"Comments (${frycAPI.q_sel_all(`article.comment`).length})"`);
			// #endregion

			// #region //* Add download button
			const file_url = frycAPI.q_sel(`#post-options a[href^="https://static"`).href;
			const filename = file_url.split("/").pop();
			const edit_button = frycAPI.q_sel(".ptbr-edit");
			const fullscreen_button = frycAPI.q_sel(".ptbr-fullscreen");
			const download_butt = edit_button.cloneNode(1);
			const real_button = download_butt.children[0];
			real_button.removeAttribute("id");
			real_button.removeAttribute("data-hotkey");
			real_button.removeAttribute("title");
			real_button.classList.remove("ptbr-edit-button");
			real_button.innerText = "Download";
			real_button.addEventListener("click", e => {
				(async () => {
					for (const cache of caches) {
						if (await cache.file_exists(filename)) {
							real_button.setAttribute("title", `To folder: ${cache.get_folder()}`);
							return;
						}
					}
					await frycAPI.download_notify(file_url);
					real_button.setAttribute("title", `To folder: ${caches[0].get_folder()}`);
				})()
				.then(() => {
					real_button.innerText = "Downloaded ✅";
				});
			});
			fullscreen_button.insertAdjacentElement("afterEnd", download_butt);
			// #endregion
		} else if (path_name === "/posts" || path_name.startsWith("/posts?")) {
			document.getElementById("c-posts")?.insertAdjacentElement("beforebegin", document.querySelector("form.post-search-form"));
			scrollTo(0, 0);
			const search = document.querySelector(SEARCH_BUTTON);
			document.getElementById("tags").addEventListener("keydown", e => {
				if (e.key === "Enter") {
					search.click();
				}
			});
		} else if (path_name.startsWith("/pools/") && !path_name.startsWith("/pools/new")) {
			const rat_arr = [
				`<div$class="txt-col-s">Safe        `, // $ is intentional, it's later replaced
				`<div$class="txt-col-q">Questionable`,
				`<div$class="txt-col-e">Explicit    `,
			];
			const get_rat_str = function (psts) {
				const rat_count = [0, 0, 0];
				let r_str = "";
				let score = 0;
				psts.forEach(post => {
					switch (post.rating) {
						case "s": rat_count[0]++; break;
						case "q": rat_count[1]++; break;
						case "e": rat_count[2]++; break;
					}
					score += post.score.total;
				});
				const rat_padd = psts.length.toString().length;
				rat_count.forEach((rat, i) => {
					r_str += `${rat_arr[i]} : ${rat_count[i].toString().padStart(rat_padd)} | ${(rat_count[i] / psts.length * 100).toFixed(1).padStart(5)} %</div>`;
				});
				r_str += `<div$class="txt-col-ś">Średni wynik ↑: ${(score / psts.length).toFixed(1).padEnd(15 + rat_padd + 3 + 5 + 2 - 16)}</div>`;
				return r_str;
			};
			let posts_promise, posts, dat_arr, rat_str = "", pool_graph, e621_get_pool_dates, left, right;

			if (path_name.startsWith("/pools/gallery")) {
				const info = frycAPI.elem_from_html(`<div class="pokaż-info">Get info</div>`);
				frycAPI.for_each(POOL_TILE_DESC, article => {
					article.appendChild(info.cloneNode(1)).addEventListener("click", function (e) {
						this.innerHTML = "";
						const img = frycAPI.insert_loading_gif(this);
						const pool_id = article.firstElementChild.getAttribute("href").replace("/pools/", "");
						frycAPI.read_file(`${location.origin}/posts.json?tags=pool:${pool_id}&limit=320`).then(resp => {
							this.frycAPI_append_html(`<div class="pool-diff-graph">${
								`<div>Liczba postów: ${resp.posts.length >= 320 ? `<b>${resp.posts.length}</b>` : resp.posts.length} | 100.0 %</div>${get_rat_str(resp.posts)}`
								.replaceAll(" ", "&nbsp").replaceAll("$", " ")
							}</div>`);
							img.remove();
						});
					});
				});
			} else {
				const czytelny_czas = function (czas) {
					return frycAPI.print_rel_time(czas, { czy_diff: false, lang: "pol", space: true, ago: false, left_align: true }).padStart(12);
				};
				const opcje = {
					weekday: "short",
					year: "2-digit",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				};
				const c_pools = document.getElementById("c-pools");
				const pool_id = path_name.split("/").pop();
				const handle_click = function (e) {
					e.preventDefault();
					if (e.type === "click") {
						left = Number(this.getAttribute("num"));
						pool_graph.querySelector(`.left`)?.frycAPI_remove_class("left");
						this.frycAPI_add_class("left");
					} else {
						right = Number(this.getAttribute("num"));
						pool_graph.querySelector(`.right`)?.frycAPI_remove_class("right");
						this.frycAPI_add_class("right");
					}
					if (left !== undefined && right !== undefined) {
						e621_get_pool_dates(left, right);
					}
					return false;
				};
				e621_get_pool_dates = async function (pocz, kon) {
					// I.E. https://e621.net/pools/35222
					if (arguments.length === 0) {
						pocz = 0;
					} else if (arguments.length === 2 && pocz > kon) {
						console.log("Błąd! Początek nie może być większy niż koniec!");
						return;
					} else if (arguments.length === 2 && pocz < 1) {
						console.log("Błąd! Początek nie może być mniejszy niż 1!");
						return;
					}

					// The following has to be here because if it were in the else branch it would stop
					// second fast call from seeing a promise in posts_promise - it would still be undefined
					const e621 = await frycAPI.atomic_await(() => frycAPI.get_res_data("e621.json"), e621_get_pool_dates, "e621");
					if (posts_promise) {
						await posts_promise;
					} else {
						const img = frycAPI.insert_loading_gif(c_pools, "beforeend");
						const url = new URL(location.origin);
						url.pathname = "posts.json";
						url.searchParams.set("tags", `pool:${pool_id}`);
						url.searchParams.set("limit", "320");
						url.searchParams.set("login", e621.login);
						url.searchParams.set("api_key", e621.api_key);
						url.searchParams.set("_client", `frycAPI (by ${e621.login})`);
						posts_promise = frycAPI.read_file(url.href);
						posts = (await posts_promise).posts;
						dat_arr ??= (
							posts.map(elem => [new Date(elem.created_at).getTime(), elem.id]).sort((a, b) => a[0] - b[0])
							.map((da_elem, da_i) => {
								// Post numbers chronologically
								// document.getElementById("post_" + da_elem[1])?.querySelector(".post-score").insertAdjacentElement("afterbegin",document.createElement("span")).frycAPI_set_inner_html("#" + (da_i + 1));
								return da_elem[0];
							})
						);
						rat_str = get_rat_str(posts);
						img.remove();
					}
					const ostatnia_data = dat_arr.at(-1);

					/* Post numbers by order in the page + dates from information on the page
					// var dat_arr = [];
					document.querySelectorAll("#posts-container>article").forEach(function (daElem, daI, daArr) {
						daElem.querySelector(".post-score").insertAdjacentElement("afterbegin",document.createElement("span")).innerHTML = "#" + (daI + 1);
						// dat_arr.push(new Date(daElem.querySelector("img").title.match(/(?<=Date: ).*(?=$)/gm)).getTime());
					});
					*/

					const diff_arr = [];
					for (let i = 1; i < dat_arr.length; i++) {
						diff_arr.push(Math.max(dat_arr[i] - dat_arr[i - 1], 0));
					}

					if (kon === undefined || kon > diff_arr.length) {
						kon = diff_arr.length;
					}
					if (arguments.length === 2) {
						pocz--;
					}
					const diff_arr_max = Math.max(...diff_arr.slice(pocz, kon));

					const diff_arr_mean = (dat_arr[kon] - dat_arr[pocz]) / (kon - pocz);

					let wykres = ""; const padding = kon.toString().length;
					for (let i = pocz; i < kon; i++) {
						const ile = Math.round(diff_arr[i] / diff_arr_max * 100);
						wykres += `<div$class="diff-number"$num="${i + 1}">${String(i + 1).padStart(padding, " ")}.</div> ${czytelny_czas(diff_arr[i])} [${"".padEnd(ile, "|") + "".padEnd(100 - ile, " ")}]\n`;
					}
					const obecny_czas = Date.now();
					const nowa_strona = new Date(ostatnia_data + diff_arr_mean);
					const nowa_strona_diff = nowa_strona.getTime() - obecny_czas;
					let nowa_strona_str;
					if (nowa_strona_diff >= 0) {
						nowa_strona_str = `za <b>${czytelny_czas(nowa_strona_diff).trim()}</b>`;
					} else {
						nowa_strona_str = `powinna być <b>${czytelny_czas(-nowa_strona_diff).trim()}</b> temu`;
					}

					// if (frycAPI.pool === undefined) {
					// 	frycAPI.pool = await frycAPI.read_file(`${location.origin}/pools/${pool_id}.json`); // eslint-disable-line require-atomic-updates
					// 	frycAPI.pool.post_ids.forEach((daElem, daI, daArr) => {
					// 		document.getElementById("post_" + daElem)?.querySelector(".post-score").insertAdjacentElement("afterbegin", document.createElement("span")).frycAPI_set_inner_html("#" + (daI + 1));
					// 	});
					// }

					let over_limit_info = "<b>";
					// if (frycAPI.pool.post_count > 320) over_limit_info += "\nUwaga! Przekroczono limit postów (320). Dane mogą być niedokładne.";

					/*
					const pageCount = document.querySelector(`div.paginator > menu`).childElementCount - 2;
					const currPage = document.querySelector(`li.current-page`).frycAPI_child_index;
					const postsOnPage = document.getElementById("posts-container").childElementCount;
					if (pageCount === 3) {
						if (currPage === 3 && postsOnPage > 20) {
							over_limit_info += "\nUwaga! Przekroczono limit postów (320). Dane mogą być niedokładne.";
						} else {
							over_limit_info += "\nJest szansa, że przekroczono limit postów (320). Dane mają szansę być niedokładne.";
						}
					} else if (pageCount > 3) {
						over_limit_info += "\nUwaga! Przekroczono limit postów (320). Dane mogą być niedokładne.";
					} */

					if (dat_arr.length >= 320) over_limit_info += "<br>Uwaga! Osiągnięto limit postów (320). Dane mogą być niedokładne.";
					over_limit_info += "</b>";

					let inner_str = "";
					inner_str += `Średni czas pomiędzy wydaniami kolejnych stron wyniósł: <b>${czytelny_czas(diff_arr_mean).trim()}</b>
						Ostatnia strona ukazała się: <b>${new Date(ostatnia_data).toLocaleString("pl-PL", opcje)}</b> - <b>${czytelny_czas(obecny_czas - ostatnia_data).trim()}</b> temu
						Następna strona ukaże się:   <b>${nowa_strona.toLocaleString("pl-PL", opcje)}</b> - ${nowa_strona_str}${over_limit_info}<br>
						Liczba postów: ${posts.length} | 100.0 %<br>${rat_str}`.replaceAll(/\t/gm, "");
					inner_str += `<br><div$id="reset-graph">Wykres</div> odległości czasowych pomiędzy kolejnymi stronami komiksu:<br>`;
					inner_str += `${wykres}`.replaceAll(/\t/gm, "");
					pool_graph?.remove();
					pool_graph = c_pools.frycAPI_insert_html("beforeend", `<div class="pool-diff-graph">${inner_str.replaceAll(/\n/gm, "<br>").replaceAll(" ", "&nbsp").replaceAll("$", " ")}</div>`);
					left = undefined;
					right = undefined;

					document.getElementById(`reset-graph`).addEventListener("click", function (e) {
						e621_get_pool_dates();
					});
					pool_graph.querySelectorAll(`.diff-number`).forEach(num => {
						num.addEventListener("click", handle_click);
						num.addEventListener("contextmenu", handle_click);
					});
				};
				const obserwowane_poole = [20262, 35222, 33649, 37755, 38959];
				if (obserwowane_poole.indexOf(Number(pool_id)) >= 0) {
					e621_get_pool_dates();
				} else {
					c_pools.frycAPI_insert_html("beforeend", `<div class="pokaż-wykres">Pokaż wykres</div>`).addEventListener("click", function (e) {
						this.remove();
						e621_get_pool_dates();
					});
				}
			}
		} else if (path_name.startsWith("/forum_posts") && !path_name.startsWith("/forum_posts/")) {
			// const tab = frycAPI.q_sel(`table.striped`);
			// const container = frycAPI.elem().class("my-topic-container")._;
			let last_topic_id;
			frycAPI.for_each(`table.striped tbody tr`, da_elem => {
				// const topic = frycAPI.elem().class("my-topic")._;
				// topic.appendChild(frycAPI.elem("a").attr("href", da_elem)._)
				// container.appendChild(topic)
				const topic_id = da_elem.querySelector(`.forum-post-topic-title a`).href;
				if (last_topic_id === topic_id) {
					da_elem.classList.add("hide-duplicate-posts");
				} else {
					last_topic_id = topic_id;
				}
			});
			// tab.insertAdjacentElement("afterEnd", container);
			frycAPI.create_manual_functions("e621 Forums", {
				func_arr: [
					(name = "Merge posts in topics", type = frycAPI_Pure_state) => {
						const f = new type({
							name: name,
							state_desc: ["Posts merged", "Posts separated"],
							state: 0,
						});
						f.callback = function () {
							document.body.classList.toggle("posts-separated");
						};
						return f;
					},
				],
			});
		}

		// #region //* Fixing dates
		frycAPI.set_default_date(`:is(#post-information, .post-time) time`, {
			date_enum_mode: frycAPI.set_default_date_enum.mode.relatywny_czas,
			date_enum_style: frycAPI.set_default_date_enum.style.float_left,
		});
		frycAPI.set_default_date(`time`);
		// #endregion
		// #region //* Add tab User home
		frycAPI.q_sel(`menu.nav-help.desktop`)?.appendChild(frycAPI.elem("li").html(/*html*/`<a href="/users/home">User home</a>`)._).frycAPI_if(frycAPI.path === "/users/home")?.classList.add("current");
		// #endregion

		frycAPI.create_manual_functions("e621 avatars", {
			func_arr: [
				(name = "Hide user profile pictures", type = frycAPI_Pure_state) => {
					const f = new type({
						name: name,
						state_desc: ["Profile pictures shown", "Explicit profile pictures hidden", "Questionable profile pictures hidden", "All profile pictures hidden"],
						state: 1,
					});
					(f.callback = function () {
						document.body.setAttribute("hide-user-profile-pictures", f.state);
					})();
					return f;
				},
			],
		});
	});

	if (path_name.startsWith("/posts/")) { //* Try to load image from cache
		// frycAPI.create_mut_obs(() => {
		// 	if (document.body) { // `head meta[property="og:image"]`
		// 		frycAPI.create_mut_obs((mutRecArr, mutObs) => {
		// 			const image = document.getElementById("image");
		// 			if (!image?.currentSrc) return;
		// 			const [MD5, ext] = new URL(image.currentSrc.lóg).pathname.split("/").pop().split(".");
		// 			const possibleExts = image.nodeName === "VIDEO" ? ["webm", "mp4"] : ["png", "jpg", "jpeg", "gif", "webp"];
		// 			const checks = [];
		// 			for (const cache of caches) {
		// 				for (const posExt of possibleExts) {
		// 					const filename = `${MD5}.${posExt}`;
		// 					checks.push(cache.file_exists_promise(filename));
		// 				}
		// 			}
		// 			Promise.any(checks).then(response => {
		// 				if (response.ok) {
		// 					image.removeAttribute("poster");
		// 					image.src = response.url.lóg;
		// 					document.title = "Cached - " + document.title;
		// 					frycAPI.unblock_images_on_this_tab();
		// 				}
		// 			}).catch(() => {});
		// 			return true;
		// 			// for (const mutRec of mutRecArr) {
		// 			// 	for (const image of mutRec.addedNodes) {
		// 			// 		if (image instanceof Element && image.getAttribute("id") === "image") { // (image.tagName === "IMG" || image.tagName === "VIDEO")
		// 			// 		}
		// 			// 	}
		// 			// }
		// 		}, { elem: document.body, options: { childList: true, subtree: true } });
		// 		return true;
		// 	}
		// }, { elem: document.documentElement });

		// let image, postOptions, postInformation, og_image;
		// frycAPI.create_mut_obs(() => {
		// 	image ??= document.getElementById("image")?.lóg;
		// 	postOptions ??= document.getElementById("post-options")?.lóg;
		// 	postInformation ??= document.getElementById("post-information")?.lóg;
		// 	og_image ??= document.querySelector(`head meta[property="og:image"]`)?.lóg;
		// }, { elem: document.documentElement });

		const POSSIBLE_EXTS = ["png", "jpg", "webm", "mp4", "jpeg", "gif", "webp"];
		const POSSIBLE_ENDINGS = ["", " Just Interesting", " Alternate", " doc1"];
		frycAPI.create_mut_obs(() => {
			const og_image = document.querySelector(`head meta[property="og:image"]`);
			if (!og_image) return;
			const orig_src = og_image.getAttribute("content");
			const [MD5, ext] = new URL(orig_src).pathname.split("/").pop().split(".");
			const checks = [];
			const t1 = performance.now();
			for (const ending of POSSIBLE_ENDINGS) {
				for (const cache of caches) {
					for (const pos_ext of POSSIBLE_EXTS) {
						const filename = `${MD5}${ending}.${pos_ext}`;
						checks.push(cache.file_exists_promise(filename));
					}
				}
			}
			Promise.any(checks).then(response => {
				if (!response.ok) return;
				const t2 = performance.now(); frycAPI.perf(t1, t2);
				frycAPI.create_mut_obs(() => {
					const image = document.getElementById("image");
					if (!image?.currentSrc) return;
					image.removeAttribute("poster");
					image.src = response.url;
					frycAPI.create_mut_obs(() => {
						image.src = response.url;
					}, { elem: image, options: { childList: false, subtree: false, attributes: true, attributeFilter: ["src"] } });
					document.title = "Cached - " + document.title;
					return true;
				}, { elem: document.documentElement });
			}).catch(() => {}).finally(() => {
				// frycAPI.unblock_images_on_this_tab();
			});
			return true;
		}, { elem: document.documentElement });
	} else if (path_name.startsWith("/posts")) {
		function get_post_ids() {
			let str = "";
			frycAPI.for_each(`article.thumbnail`, da_elem => {
				str += `~id:${da_elem.getAttribute("data-id")} `;
			});
			return str.trim();
		}
		frycAPI.create_manual_functions("e621", {
			func_arr: [
				(name = "Visible posts to link, click", type = frycAPI_Normal) => {
					const f = new type({ name });
					f.callback = function (obj) {
						document.getElementById("tags").value = get_post_ids();
						document.querySelector(`button[type="submit"][title="Search"]`).click();
					};
					return f;
				},
				(name = "Visible posts to link, copy", type = frycAPI_Normal) => {
					const f = new type({ name });
					f.callback = function (obj) {
						frycAPI.ctrl_c(`${location.origin}/posts?tags=${encodeURIComponent(get_post_ids().replaceAll(/\s+/g, "+"))}`);
						f.name = "Copied!";
					};
					return f;
				},
			],
		});
	}
} else if (frycAPI_host("static1.e926.net", "static1.e621.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.on_load_setter(function () {
		frycAPI.change_favicon_res("e621_Logo.png");
	});
} else if (frycAPI_host("e-hentai.org")) {
	frycAPI.line = frycAPI.get_line_number();
	if (frycAPI.path.startsWith("/s/")) {
		frycAPI.inject_style(/*css*/`
			img[src="https://ehgt.org/g/f.png"],
			img[src="https://ehgt.org/g/p.png"],
			img[src="https://ehgt.org/g/n.png"],
			img[src="https://ehgt.org/g/b.png"],
			img[src="https://ehgt.org/g/l.png"] {
				filter: invert(0) sepia(1) !important;
			}
			div#i2 {
				display: none;
			}
			div#i1 {
				position: static;
				width: fit-content!important;
			}
			div.sni {
				padding: 5px;
			}
			#i1.sni > h1 {
				position: absolute;
				left: 0;
				z-index: 10;
				top: 0;
				margin: 0;
				padding: 10px;
				background-color: #EDEBDF;
				border: 1px solid #5C0D12;
				margin: 4px 9px;
				filter: opacity(0.6);
				cursor: pointer;
				font-size: 0;
				&.duży {
					font-size: 16px;
				}
			}
			img#img {
				width: auto !important;
				height: 98vh !important;
				max-width: 98vw;
				object-fit: contain;
			}
		`);

		frycAPI.on_load_setter(() => {
			document.querySelector("#i1.sni>h1").addEventListener("click", event => {
				event.target.classList.toggle("duży");
			});
		});
	}
} else if (frycAPI_host("www.sqlite.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			max-width: 1000px;
			margin: auto;
			padding: 10px 10px 0px 10px;
		}
		* {
			font-family: IBM Plex Sans Condensed, sans-serif;
		}
		blockquote {
			font-family: IBM Plex Mono,monospace;
			color: hsl(120deg 100% 87%);
		}
		p {
			font-size: 18px;
		}
		img.logo[alt="SQLite"] {
			content: url(${frycAPI.get_res_url("SQLite.png")});
			width: 220px;
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (frycAPI_host("s.surveylegend.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.is-textbox-in-app {
			user-select: auto !important;
		}
	`);
} else if (frycAPI_host("issuetracker.google.com", "issues.chromium.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		*:not(textarea, textarea *, code, code *) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		.bv2-event-note {
			margin-top: 0px;
		}
		.bv2-event-content-cell {
			margin-left: 35px;
		}
		h4.ng-star-inserted {
			font-weight: 300;
		}
		.hideId {
			display: none;
		}

		.only-monorail-migration {
			padding: 3px 0;
			.bv2-event-user-image-cell,
			.bv2-event-content-cell > *:not(h4),
			.bv2-event-content-cell > h4 > :is(b-user-display, .bv2-event-user-id, .bv2-event-info) {
				display: none;
			}
			.bv2-event-content-cell {
				margin: 0;
				margin-left: 50px;
				padding: 0;
				> h4 {
					margin: 0;
					padding: 0;
					font-weight: normal;
					display: flex;
					align-items: center;
					gap: 3px;
					a {
						filter: brightness(0.6) saturate(0.7);
					}
					&::before {
						content: "Monorail migration";
						color: var(--text-disabled);
					}
				}
			}
		}
		.bv2-event-content-cell .child {

		}
		.bv2-event-note-container:has(~ .bv2-issue-event-attachments) {
			margin-bottom: 6px;
		}

		.user-image-edited {
			b-user-image {
				justify-content: center;
				height: 32px;
				width: 32px;
				box-sizing: border-box;
				border: 1px solid var(--c400, #bdc1c6);
				border-radius: 50%;
				background-color: var(--bg-color);

				span {
					background-image: none !important;
					background-color: transparent !important;
					width: fit-content !important;
					height: fit-content !important;
					border: 0px !important;
					color: var(--text-color) !important;
					opacity: 1 !important;
				}
				span::after {
					content: var(--counter);
					/* -webkit-text-stroke: 1px black; */
				}
				/* span::before {
					content: var(--counter);
					position: absolute;
				} */
			}
			[role="img"] .user-avatar {
				display: none;
			}
		}
	`);

	const da_sel = el => (el.nodeType === Node.TEXT_NODE && el.textContent.trim() === "") || el.nodeName === "BR";
	(frycAPI.before_load = function () {
		frycAPI.create_mut_obs((mut_rec_arr0, mut_obs0) => {
			if (document.body !== null) {
				frycAPI.set_default_date_style().mode.relatywny_czas().tool_tip_left();
				frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
					// #region //* Fix dates
					frycAPI.set_default_date(`:is(b-issues-grid, b-issues-table) b-formatted-date-time > time`, {
						custom_style: `cursor: none;`,
						date_enum_style: frycAPI.set_default_date_enum.style.float_left,
					});
					frycAPI.set_default_date(`b-formatted-date-time > time`, {
						custom_style: `cursor: none;`, // --tt-y: 10px; --tt-x: 10px;
					});
					// #endregion
					// #region //* Delete useless (duplicated) parts of the user name
					frycAPI.for_each(`h4.bv2-event-user:not(:has(.hideId))`, (da_elem, da_i, da_arr) => {
						const user_name = da_elem.querySelector(`b-user-display-name,b-user-display`);
						const user_id = da_elem.querySelector(`span.bv2-event-user-id`);
						if (user_name === null || user_id === null) return;
						const name = user_name.innerText.trim();
						const id = user_id.innerText.trim().slice(1, -1);
						if (name === id || name === "Fryderyk Kukowski") {
							user_id.frycAPI_add_class("hideId");
						}
					});
					// #endregion
					// #region //* Collapse useless [Empty comment from Monorail migration] comments
					frycAPI.for_each(`.bv2-edit-issue-history-stream > div`, da_elem => {
						// const msgText = da_elem.querySelector(`:scope .bv2-event-note-container`);
						if (da_elem.querySelector(`:scope .bv2-event-note-container`).innerText.includes("[Empty comment from Monorail migration]")) {
							da_elem.frycAPI_add_class("only-monorail-migration");
						}
					});
					// #endregion
					// #region //* Advanced comment trim()
					frycAPI.for_each(`.bv2-event-content-cell .child`, da_elem => {
						const arr = [...da_elem.childNodes];
						for (let i = 0; i < arr.length; i++) {
							const el = arr[i];
							if (da_sel(el)) {
								el.remove();
							} else {
								break;
							}
						}
						for (let i = arr.length - 1; i >= 0; i--) {
							const el = arr[i];
							if (da_sel(el)) {
								el.remove();
							} else {
								break;
							}
						}
					});
					// #endregion
					// #region //* Add user numbering and coloring
					const user_has_photo = {};
					const email_elems = frycAPI.for_each(`b-user-display`, email_elem => {
						email_elem.email = email_elem.innerText.trim();
						user_has_photo[email_elem.email] = false;
					});
					if (email_elems.length) {
						const history_events = frycAPI.for_each(`b-history-event`, history_event => {
							const email_elem = history_event.querySelector(`b-user-display`);
							if (!email_elem) return;
							history_event.email_elem = email_elem;
							const user_img = history_event.querySelector(`b-user-image img`);
							if (user_img) {
								const src = user_img.getAttribute("src");
								if (!(src.includes("googleusercontent.com") && src.includes("default-user"))) { // i.e. https://lh3.googleusercontent.com/a/default-user=s32-p-k
									user_has_photo[email_elem.email] = true;
								}
							}
						});
						if (history_events.length) {
							const user_id = {};
							let counter = 0;
							email_elems.forEach(email_elem => {
								if (!user_id.hasOwnProperty(email_elem.email) && (!user_has_photo[email_elem.email] || counter === 0)) {
									user_id[email_elem.email] = counter++;
								}
							});
							const color_arr = frycAPI.get_distinct_colors(counter, "rgbInt").map(rgb => [`rgb(${rgb.join(" ")})`, frycAPI.get_good_text_color(rgb, "rgbInt")]);
							// loguj("userHasPhoto", user_has_photo);
							// loguj("userID", user_id);
							history_events.forEach(history_event => {
								if (!history_event.email_elem || user_has_photo[history_event.email_elem.email]) {
									history_event.frycAPI_remove_class("user-image-edited");
									history_event.removeAttribute("style");
									return;
								}
								const id = user_id[history_event.email_elem.email];
								const [bg_color, text_color] = color_arr[id];
								history_event.frycAPI_add_class("user-image-edited");
								history_event.setAttribute("style", `--counter: "${id === 0 ? "OP" : id}"; --bg-color: ${bg_color}; --text-color: ${text_color}`);
							});
						}
					}
					// #endregion
				});
				return true;
			}
		}, { elem: document.documentElement });
	})();

	// frycAPI.on_load_setter(correctTimeValues);
} else if (frycAPI_host("www.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img[alt="Strona główna"] {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (frycAPI_host("forums.factorio.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed;
		}
	`);

	frycAPI.on_load_setter(() => {
		frycAPI.for_each(`p.author time`, (da_elem, da_i, da_arr) => {
			const data = new Date(da_elem.getAttribute("datetime"));
			da_elem.innerHTML = frycAPI.print_date(data);
			da_elem.setAttribute("title", frycAPI.print_rel_time(data));
		});
		frycAPI.for_each(`dd.profile-joined`, (da_elem, da_i, da_arr) => {
			const node = da_elem.frycAPI_get_first_text_node();
			const data = new Date(node.textContent.trim());
			node.nodeValue = " " + frycAPI.print_date(data);
			da_elem.setAttribute("title", frycAPI.print_rel_time(data));
		});
	});
} else if (frycAPI_host("factorio.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		*:not(.header-links > div > a.button.flex.flex-space-between *):not(.user-controls.links.flex.flex-items-baseline.flex-end *) {
			font-family: IBM Plex Sans Condensed !important;
		}
	`);
} else if (frycAPI_host("github.com", "gist.github.com")) {
	frycAPI.line = frycAPI.get_line_number();
	const arts = new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoL0JpYmxpb3Rla2kgV2luZG93cy9PYnJhenkvRGlzY29yZCBBUlRzLw==");
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		.dspNONE {
			display: none;
		}
		:root {
			--wysokość: 13px;
			--padd: 5px;
			/* --fontStack-monospace: "Source Code Fryc"; */
			--fontStack-sansSerif: "IBM Plex Sans Condensed";
		}
		tt, code, samp {
			font-family: "Source Code Fryc", var(--fontStack-monospace);
		}
		div:has(>pre:first-child) {
			padding-top: calc(var(--wysokość) + 2*var(--padd));
			background-color: var(--bgColor-muted, var(--color-canvas-subtle)) !important;
			position: relative;
			&::before {
				content: attr(my-before-text);
				/* background-color: #004900 !important; */
				border-bottom: 1px solid;
				border-color: var(--borderColor-default, var(--color-border-default, #30363d));
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: var(--wysokość);
				padding: var(--padd);
				font-size: var(--wysokość);
				font-style: italic;
				color: var(--color-prettylights-syntax-comment);
				line-height: var(--wysokość);
				/* box-sizing: border-box; */
				font-family:  "Source Code Fryc", var(--fontStack-monospace, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace);
			}
			>.zeroclipboard-container {
				top: calc(var(--wysokość) + 2*var(--padd)) !important;
			}
		}
		.file-header .file-info::after {
			--off-set: 25%;
			--col: hsl(0, 0%, 75%);
			color: var(--col);
			content: attr(my-before-text);
			margin-left: var(--padd);
			padding-left: var(--padd);
			border-left: 1px solid;
			/* border-left-color: aliceblue; */
			border-image-slice: 1;
			border-image-source: linear-gradient(
				to bottom,
				transparent var(--off-set),
				var(--col) var(--off-set) calc(100% - var(--off-set)),
				transparent calc(100% - var(--off-set))
			);
		}
		${frycAPI.get_avatar_replacement_css_on_github("Michal-Roman0", arts.get_file_url("Nick dragon profile.png"))}
		/* Indentation lines attempt
		.react-file-line.html-div {
			--initial-color: hsl(0, 0%, 30%);
			--color: var(--borderColor-default, var(--color-border-default, #30363d));
			--period: 20px;
			overflow: hidden;
			> span:first-child::before {
				content: " ";
				color: transparent;
				position: absolute;
				background: repeating-linear-gradient(to left, transparent 0px, transparent calc(var(--period) - 1px), var(--color) calc(var(--period) - 1px), var(--color) var(--period));
				width: 300px;
				transform: translateX(-100%);
			}
		}
		*/
	`);

	frycAPI.on_load_setter(() => {
		if (frycAPI_host("gist.github.com")) {
			frycAPI.change_favicon_res("GithubBlue.png");
		}
		frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
			// const startTime = performance.now();

			// let relTimeCount = 0;
			frycAPI.for_each(`relative-time`, (da_elem, da_i, da_arr) => { // :not(.poprawnyCzas)
				if (da_elem.shadowRoot?.querySelector(`span.dspNONE`) === null) {
					const data = new Date(da_elem.getAttribute("datetime"));
					if (frycAPI.is_valid_date(data)) {
						da_elem.shadowRoot.innerHTML = frycAPI.print_rel_time(data) + `<span class="dspNONE"></span>`;
						da_elem.setAttribute("title", frycAPI.print_date(data));
						// da_elem.frycAPI_add_class("poprawnyCzas");
						// relTimeCount++;
					}
				}
			});

			const my_before_text_count = frycAPI.for_each(`div:not([my-before-text])>pre:first-child`, (da_elem, da_i, da_arr) => { // Code block names
				const par = da_elem.parentElement;
				par.setAttribute("my-before-text",
					par.classList.not_contains("highlight") ? "Plain text" :
					[...par.classList]
					.find(c => c.startsWith("highlight-source-") || c.startsWith("highlight-text-"))
					.replace("highlight-source-", "")
					.replace("highlight-text-", "")
					.toUpperCase()
					.replace("-BASIC", "")
				);
			}).length;

			frycAPI.for_each(`body:has(span.author) .file:not(:has(.file-header .file-info[my-before-text])) [itemprop="text"].Box-body`, (da_elem, da_i, da_arr) => { // File languages
				da_elem.parentElement.querySelector(`.file-header .file-info`).setAttribute("my-before-text",
					[...da_elem.classList]
					.find(c => c.startsWith("type-"))
					.replace("type-", "")
					// .frycAPI_to_title_case()
					.toUpperCase()
				);
			});

			// const endTime = performance.now();
			// loguj(`relative-time: ${relTimeCount}, my-before-text: ${my_before_text_count}, ${(endTime - startTime).toFixed(1)} ms`);
		}, { options: { attributes: true } });
	});
} else if (frycAPI_host("support.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);

	frycAPI.on_load_setter(() => {
		frycAPI.set_default_date(`sc-tailwind-thread-post_header-post-date`, {
			get_date: elem => {
				const txt = elem.querySelector(`.post-date-tooltip`).innerText;
				const [date, time] = txt.replace(",", "").split(" ");
				const [day, month, year] = date.split(".");
				return `${year}-${month}-${day} ${time}`;
			},
			date_opts: {
				print_date: frycAPI.get_date_formatter({
					year  : "numeric",
					month : "2-digit",
					day   : "2-digit",
					default_undef: 1,
				}),
			},
		});
	});
} else if (frycAPI_host("okazja-hurtownia.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.col2-set.addresses .woocommerce-column--billing-address.col-1,
		.col2-set.addresses .woocommerce-column--shipping-address.col-2 {
			max-width: unset;
		}
	`);
} else if (frycAPI_host_includes("aliexpress.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.multi--shopCart--darm7xs.multi--shopLtr--1kiOXiJ.multi--shopCartImage--2DX88PV {
			right: 0px;
			bottom: 16px;
		}
		span.image--icon--HQGC-D_ {
			opacity: 50%;
			transition: opacity 0.3s 0s ease-in-out;
			&:hover {
				opacity: 100%;
			}
		}

		[class^="es--deliveryWrap"] {
			display: flex;
			flex-direction: column;
			> span {
				margin: 0 !important;
			}
		}

		body, html {
			height: fit-content !important;
		}
	`);
} else if (frycAPI_host("www.crazytime.pl")) { // If the page frequently changes its title (to draw your attention) use this code
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`

	`);

	frycAPI.on_load_setter(function () {
		frycAPI.enforce_title(document.title);
	});
} else if (1 && frycAPI_host_includes("autodesk.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		span.DateTime {
			font-weight: bold;
		}
		*:not(
			code, textarea, [alt="Solved!"], .lia-fa, .mce-container.mce-toolbar,
			code *, textarea *, [alt="Solved!"] *, .lia-fa *, .mce-container.mce-toolbar *,
			i.mce-ico.mce-i-resize, i.mce-ico.mce-i-resize *,
			.kudos-link, .kudos-link *,
			.icon-cta-go-arrow-circle, .icon-windows, .icon-arrow-button, .icon-show, .icon, .icon-arrow-down,
			.expand-collapse
		) {
			font-family: IBM Plex Sans Condensed !important;
		}
		img[alt="Community Manager"],
		img[alt="Autodesk"],
		img[alt="Autodesk Support"],
		img[alt="EESignature"],
		img[alt="Syndicated - Outbound"],
		img[src="https://damassets.autodesk.net/content/dam/autodesk/logos/autodesk-logo-primary-rgb-black-small_forum.png"],
		img[src="https://i.ibb.co/gdwQP7C/autodesk-expert-elite-member-logo-1line-rgb-black.png"],
		img[src="https://forums.autodesk.com/t5/image/serverpage/image-id/962943iDF6D27C26CA3B56D/image-size/medium?v=v2&px=400"],
		a[data-testid="uh-autodesk-logo-link"],
		.lia-js-menu-opener.default-menu-option.lia-js-click-menu.lia-link-navigation:not([aria-label="Topic Options"], [aria-label="Options"]),
		.mega-footer-socials.mega-footer-socials-desktop {
			filter: invert(1) hue-rotate(180deg);
		}
		.uh-logo-container svg.uh-autodesk-logo>path {
			fill: #fff;
		}
		.custom-category-board-header .component-autodesk-product-nonproduct-page-title {
			padding: 0;
		}
		.custom-component-submenu-products-tabs {
			margin-bottom: 10px !important;
		}
		.lia-tabs-standard-wrapper.custom-component-submenu-products-tabs {
			margin-top: 25px;
		}
		.lia-tabs-standard-wrapper.custom-component-submenu-products-tabs .lia-tabs-standard {
			margin-bottom: 10px;
		}
		.lia-top-quilt>.lia-quilt-row-main>.lia-quilt-column:first-child .lia-component-common-widget-search-form {
			margin-bottom: 15px;
			margin-top: 15px;
		}
		.lia-panel .lia-panel-content-wrapper .lia-panel-content {
			padding: 0;
		}
		.lia-mentions-hints .lia-panel .lia-panel-content-wrapper .lia-panel-content {
			padding-left: 7px;
		}
		.lia-panel.lia-panel-standard.CustomContent.Chrome.lia-component-common-widget-custom-content {
			margin: 0;
		}
		.lia-form-auto-subscribe-to-thread-input {
			top: -2px;
		}
		div#threadnavigator > ul.lia-paging-full {
			padding: 0;
		}
		.custom-report {
			display: none;
		}
		.lia-quilt-row.lia-quilt-row-footer {
			display: none;
		}
		.lia-forum-linear-view-gte-v5 .lia-quilt-row.lia-quilt-row-footer {
			display: block;
		}
		p.tylko-nbsp {
			display: none;
		}
		p:not(.tylko-nbsp) ~ p.tylko-nbsp:has( ~ p:not(.tylko-nbsp)) {
			display: block;
		}
		.Attachments.lia-attachments-message.preview-attachments {
			margin: 0;
		}
		.bad-br-node {
			display: none;
		}
		.MessageTagsTaplet.lia-component-message-view-widget-tags {
			margin: 0;
		}
		.IdeaPage .lia-component-comment-list .lia-panel-message .lia-message-view-display .lia-quilt-idea-reply-message :is(.lia-quilt-row-header, .lia-quilt-row-main) {
			padding: 0 5px;
		}
		.NotificationFeedPage .lia-quilt-row-main {
			margin-top: 20px;
		}
		.lia-page-banner {
			margin-top: 15px !important;
		}
	`);
	if (frycAPI_host("forums.autodesk.com", "profile.autodesk.com")) {
		frycAPI.inject_style_on_load(/*css*/`
			.uh-logo-container svg.uh-autodesk-logo {
				filter: invert(1) hue-rotate(180deg);
			}
		`);
	}

	document.addEventListener("DOMContentLoaded", () => {
		frycAPI.for_each(`span.DateTime`, (da_elem, da_i, da_arr) => {
			const date_comps = da_elem.innerText.trim().replaceAll(/\s+/gm, " ").split(" ");
			if (date_comps.length === 1) {
				date_comps[1] = "0:0";
				date_comps[2] = "AM";
			}
			const time_comps = date_comps[1].split(":").map(a => Number(a));
			const korekta = (() => {
				if (date_comps[2] === "PM") {
					return (time_comps[0] === 12 ? 0 : 3600 * 12);
				} else {
					return (time_comps[0] === 12 ? -3600 * 12 : 0);
				}
			})();
			const data = new Date(new Date(date_comps[0].replaceAll(/[^\d-]/gm, "")).getTime() + 1000 * (time_comps[0] * 3600 + time_comps[1] * 60 + korekta + 9 * 3600));
			da_elem.innerHTML = frycAPI.print_rel_time(data, { compact: 1 });
			da_elem.setAttribute("title", frycAPI.print_date(data));
		});
		frycAPI.for_each(`p`, (da_elem, da_i, da_arr) => {
			if (da_elem.innerHTML === "&nbsp;") {
				da_elem.frycAPI_add_class("tylko-nbsp");
				return;
			}
			const chld = da_elem.childNodes;
			for (let i = 0; i < chld.length; i++) {
				if (chld[i].nodeName === "BR") {
					chld[i].frycAPI_add_class("bad-br-node");
				} else {
					break;
				}
			}
			for (let i = chld.length - 1; i >= 0; i--) {
				if (chld[i].nodeName === "BR") {
					chld[i].frycAPI_add_class("bad-br-node");
				} else {
					break;
				}
			}
		});
	});
	frycAPI.on_load_setter(function () {
		frycAPI.change_favicon_res((() => {
			switch (frycAPI_host()) {
				case "forums.autodesk.com": return "AutodeskOrange.png";
				case "help.autodesk.com": return "AutodeskBlue.png";
				default: return "Autodesk.png";
			}
		})());
		if (frycAPI_host("help.autodesk.com")) {
			frycAPI.inject_style(/*css*/`
				tr.header>td {
					white-space: nowrap;
				}
			`);
			frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
				// loguj("tableFun");
				frycAPI.for_each(`table:not(.sortowalnaTabela)`, da_elem => {
					da_elem.querySelectorAll(`tr.header>td`).forEach(da_elem1 => {
						if (da_elem1.innerText.trim() === "Value") da_elem1.setAttribute("krytSort", "numeric");
					});
					frycAPI.make_table_sortable(da_elem, "tr", "td", "tr.header>td");
				});
			});
		}
	});
} else if (frycAPI_host("allegro.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	// frycAPI.UUID = "2025-04-21 11:48";
	frycAPI.inject_style_on_load(/*css*/`
		/* *, .mp0t_0a, .l8c4v, .mp0t_ji, .b1vwg, .oyynn, .t1szo { */
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}

		.ukryj-opinie-bez-zdjęć {
			& [itemprop="review"]:not(:has(> :is([data-analytics-view-label="reviewsGallery"], [data-analytics-view-label="reviewGallery"]))) {
				display: none;
			}
			& [itemprop="review"]:not(:has(> :is([data-analytics-view-label="reviewsGallery"], [data-analytics-view-label="reviewGallery"]))) + hr {
				display: none;
			}
		}

		[data-box-name="baby-search"]:has(.suma-od-jednego-sprzedawcy) {
			justify-content: space-between;
		}
		.suma-od-jednego-sprzedawcy {
			display: flex;
			align-items: center;
		}

		#transaction-buttons-section {
			> :has(#buy-and-pay-button_SHOW_ITEM_STATIC_DESKTOP) { /* Kup teraz */
				display: none;
			}
			> :has(#add-to-cart-button) {
				margin: 0;
			}
		}
		[data-testid="allegro-pay-button"] { /* Zapłać później */
			display: none;
		}
	`);

	frycAPI.on_load_setter(function () {
		// if (frycAPI.path.startsWith("/koszyk")) {
		// 	frycAPI.create_mut_obs((mutRecArr, mutObs) => {
		// 		frycAPI.for_each(`cart div > section`, sekcja => {
		// 			let suma = 0;
		// 			sekcja.querySelectorAll(`.pr127m.pro3hx`).forEach(cena => {
		// 				suma += Number(cena.innerText.replace(/.zł/, "").replace(",", "."));
		// 			});
		// 			const dostawa = sekcja.querySelector(`.mpof_uk.munh_4.pr127m`);
		// 			if (dostawa !== null) suma += Number(dostawa.innerText.replace(/.zł/, "").replace(",", "."));
		// 			const sumaParent = sekcja.querySelector(`[data-box-name="baby-search"]`);
		// 			if (sumaParent !== null) {
		// 				suma = `Suma: ${suma.toFixed(2).replace(".", ",")} zł`;
		// 				const sumaElem = sumaParent.querySelector(`.suma-od-jednego-sprzedawcy`);
		// 				if (sumaElem !== null) {
		// 					sumaElem.innerText = suma;
		// 				} else {
		// 					sumaParent.frycAPI_append_html(`<div class="suma-od-jednego-sprzedawcy">${suma}</div>`);
		// 				}
		// 			}
		// 		});
		// 	}, { elem: document.querySelector(`cart cart-header + div`) });
		// }
	}, 2);

	frycAPI.create_manual_functions("Opinie o produkcie", {
		func_arr: [
			(name = "Ukryj opinie bez zdjęć", type = frycAPI_Pure_state) => {
				const f = new type({
					name: name,
					state_desc: ["Opinie bez zdjęć: WIDOCZNE", "Opinie bez zdjęć: UKRYTE"],
					state: 0,
				});
				f.callback = function (obj) {
					document.body.classList.toggle("ukryj-opinie-bez-zdjęć");
				};
				return f;
			},
		],
	});
} // eslint-disable-line brace-style
// #endregion
// #region //* IFs 10
else if (1 && frycAPI_host("knucklecracker.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	(frycAPI.before_load = function () {
		if (frycAPI.path.startsWith("/blog/")) {
			frycAPI.color_scheme_dark = 1;
			frycAPI.inject_style_on_load(/*css*/`
				body.custom-background {
					background-image: none;
				}
			`);
		}
	})();

	frycAPI.on_load_setter(() => {
		if (frycAPI.path.startsWith("/forums/")) {
			const t = document.querySelector(".user time");
			const their_date = new Date(t.innerHTML).getTime();
			const my_date = new Date(t.getAttribute("datetime")).getTime();
			// let diff = new Date().getTimezoneOffset() * (-1) * 60 * 1000 - (my_date - their_date);
			const diff = my_date - their_date;
			t.innerHTML = "Current time: " + frycAPI.print_date(new Date(my_date));

			frycAPI.for_each(`div.postinfo > a.smalltext, .lastpost > p > a:first-child`, (da_elem, da_i, da_arr) => {
				let data = new Date(da_elem.innerText);
				if (frycAPI.is_valid_date(data) === false) {
					data = new Date(new Date().toDateString() + da_elem.innerText.replace("Today at", ""));
					if (frycAPI.is_valid_date(data) === false) return;
				}
				data = new Date(data.getTime() + diff);
				da_elem.innerHTML = frycAPI.print_rel_time(data, { compact: 1 });
				da_elem.setAttribute("title", frycAPI.print_date(data));
			});
		}
	});
} else if (frycAPI_host("nodejs.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		[class*="layouts_contentLayout"]>:first-child main {
			word-break: normal;
		}
	`);
} else if (frycAPI_host("eslint.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		.c-toc ol li:before {
			content: "-";
			left: 0;
		}
	`);
} else if (1 && frycAPI_host_includes("metafilter.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		:root {
			--kolor-krawędzi: hsl(0deg, 0%, 100%, 65%);
			--kolor-cienia: black;
			--after-shadow-width: 7px;
		}
		*, body.thread #posts h1 .smallcopy, body.thread #posts .copy .smallcopy, body.thread #posts .comments .smallcopy {
			font-family: IBM Plex Sans Condensed, sans-serif !important;
		}
		:is(#scontent, #posts, #posts > div:not(#related, .copy, .post, .comments), #boxyleft) > br,
		.copy:has(> ins.adsbygoogle),
		.comments:has(> ins.adsbygoogle),
		.tags:has(> ins.adsbygoogle),
		div:has(> ins.adsbygoogle),
		.copy > .miseperator > br:first-of-type,
		#menu > a[name="sidebar"] {
			display: none;
		}
		.comments,
		.comments > span.whitesmallcopy,
		body.thread #posts #related {
			margin: 0 !important;
		}
		p.comments {
			padding: 0px !important;
		}
		div#closedmsg {
			margin-top: 12px !important;
		}
		body.thread {
			#posts .copy:not(#related),
			#posts .comments.bestleft {
				--kolor-krawędzi: hsl(82.43deg, 50.66%, 55.49%, 90%);
				--kolor-cienia: var(--kolor-krawędzi);
				> .smallcopy > a[href*="/user/"] {
					text-decoration: underline;
				}
			}
			span.smallcopy:is(.postbyline, .byline) a[href*="/favorited/"] {
				&::before {
					content: "[";
				}
				&::after {
					content: "]";
				}
			}
		}
		body:not(.thread, :has(nav.tertiary li.current > a[href="https://metatalk.metafilter.com/home/popularfavorites"])) :is(#scontent, #posts, #boxyleft, #page) > :is(h1, h2):not(.posttitle, :has(.smallcopy)) {
			/* position: absolute; */
			height: 0;
			overflow: visible;
			margin: 0;
			text-align: right;
			right: calc(100% + 10px);
		}
		body:not(.thread) :is(#scontent, #posts, #boxyleft, #page) > :is(h1, h2):not(.posttitle, :has(.smallcopy)) {
			padding: 0px !important;
		}
		body.thread #posts .comments:has(>.smallcopy),
		body.thread #posts .copy:not(#related),
		.my-posttitle-post-wrapper {
			box-shadow: 0px 0px var(--after-shadow-width) var(--kolor-cienia);
		}
		body:not(.thread) :is(#scontent, #posts, #posts > div, #boxyleft, #page) :is(h1, h2).posttitle {
			margin: 0px !important;
			padding: 5px !important;
			border: 1px solid var(--kolor-krawędzi) !important;
			border-bottom-width: 0px !important;
		}
		:is(#scontent, #posts, #posts > div, #boxyleft) div:is(.copy:not(#related), .copy.post) {
			border: 1px solid var(--kolor-krawędzi) !important;
			padding: 5px;
		}
		#posts .comments:has(>.smallcopy) {
			border: 1px solid var(--kolor-krawędzi) !important;
			padding: 5px;
		}
		.comments:has(>.smallcopy),
		.copy:not(#related, #userlist):has(>.smallcopy) {
			margin: 0 0 10px 0 !important;
			position: relative;
			padding-top: 27px !important;
			left: 0;
			> .smallcopy {
				background-color: var(--główny-color-tła);
				margin: 0px !important;
				position: absolute;
				top: 0px;
				left: 0px;
				right: 0px;
				padding: 2px 4px !important;
				border-bottom: 1px solid var(--kolor-krawędzi);
				/* display: flex !important;
				gap: 5px;
				> a::after {
					content: ",";
				} */
				/* > span:not([class]):not(:last-of-type) {
					margin-right: 5px;
				} */
				> span.lepszyCzas {
					float: right;
				}
			}
		}
		#posts .copy > .miseperator {
			margin-top: 10px !important;
			padding-top: 10px !important;
		}
		/* :is(#scontent, #posts, #posts > div, #boxyleft, #page), */
		:is(#scontent, #posts, #page) {
			padding: 0 10px 0 0 !important;
		}
		#posts.frontposts {
			padding: 0 !important;
		}
		:root#myID body div .tags.sidebar{
			&, > h2 {
				margin-top: 10px !important;
				margin-bottom: 10px !important;
			}
		}
		body #threadsub {
			margin-top: 78px !important;
		}
		.row {
			margin-left: 0;
			margin-right: 0;
		}
		#threadside {
			padding-right: 0 !important;
		}
		.container {
			padding-left: 10px;
			padding-right: 0px;
		}
		@media (min-width: 1200px) {
			.site-header nav.primary .search {
				width: 470px;
			}
		}
		.row :is(#menu.sidebar, #threadsub) {
			padding: 0;
			margin: 0;
			/* > *:not(:first-child, #sidebar-funding) { */
			> * {
				margin: 0 0 10px 0 !important;
			}
			h2 {
				margin-top: 5px !important;
			}
		}
		#sidebar-funding > .funding.sidebar {
			margin: 0;
		}
		[role="main"] > .container {
			padding: 0;
		}
		.copy.post {
			margin-bottom: 10px;
		}
		body.thread #posts h1 .smallcopy {
			margin-top: 10px !important;
		}
		body.thread #posts h1 {
			margin-bottom: 12px !important;
		}
		body.subsite-music #boxyleft {
			padding-right: 0;
		}
	`);

	frycAPI.on_load_setter(async function () {
		document.documentElement.setAttribute("id", "myID");
		frycAPI.set_default_date_style();
		document.documentElement.style.setProperty("--główny-color-tła",
			document.querySelector(`.comments > span.whitesmallcopy, .comments.whitesmallcopy`)
			?.computedStyleMap()
			.get("background-color")
			.toString()
		);

		frycAPI.set_default_date(`#userlist.copy > span.smallcopy`, { get_date: "txt" });

		if (document.body.classList.contains("thread")) {
			const xml = await frycAPI.read_file(location.origin + frycAPI.path + "/rss", "xml");
			// xml.querySelector(`parsererror`) === null
			// frycAPI.query_sel_null(`parsererror`, xml)
			let rss;
			if (frycAPI.query_sel_null(`parsererror`, xml)) {
				rss = [...xml.querySelectorAll(`item pubDate`)].map(pub => new Date(new Date(pub.innerHTML).getTime() - frycAPI.hour));
			}

			let smallcopy = document.querySelector(`#posts > .posttitle + .smallcopy`);
			if (smallcopy) {
				smallcopy.previousElementSibling.appendChild(document.createElement("br"));
				smallcopy.previousElementSibling.appendChild(smallcopy);
			}

			smallcopy = document.querySelector(`h1.posttitle > .smallcopy`);
			let data0;
			if (smallcopy) {
				const txt_node = smallcopy.frycAPI_get_first_text_node();
				const span = smallcopy.querySelector(`:scope > span`);
				data0 = rss ? rss[0] : new Date(txt_node.textContent + span.innerText);
				const date_text = smallcopy.frycAPI_insert_html("afterbegin", frycAPI.get_default_date_text(data0));
				txt_node.remove();
				span?.remove();
				if (date_text.nextSibling && date_text.nextSibling.nodeType !== Node.TEXT_NODE) {
					date_text.frycAPI_insert_html("afterend", "<span> &nbsp; </span>");
				}
			}

			const post0 = document.querySelector(`#posts .copy > span.smallcopy`);
			post0?.frycAPI_set_inner_html(post0.innerHTML
			.replace(/users? marked this as a favorite/, `<span style="font-family: sans-serif !important;">&#x2764;&#xFE0F;</span>`)
			.replace(/(answers|comments) total/, `<span style="font-family: sans-serif !important;">&#x21A9;&#xFE0F;</span>`)
			);

			const op_href = document.querySelector(`.copy > span.smallcopy:is(.postbyline, .byline) > a[href*="/user/"]`)?.href;

			frycAPI.for_each(`.comments > .smallcopy`, (da_elem, da_i, da_arr) => {
				const user = da_elem.querySelector(`a[href*="/user/"]`);
				const link = da_elem.querySelector(`a[href*="${da_elem.parentElement.previousElementSibling.name}"]:not([href*="/user/"],[href*="/favorited/"])`);
				const favs = da_elem.querySelector(`a[href*="/favorited/"]`);
				const staf = da_elem.querySelector(`a.staff`);
				const text = da_elem.innerText;
				user.remove();
				link.remove();
				favs?.remove();
				staf?.remove();
				da_elem.innerHTML = "";
				da_elem.append(link.frycAPI_set_inner_html(`#${da_i + 1}`));
				da_elem.frycAPI_append_html("<span> | </span>");
				da_elem.append(user);
				if (staf) {
					da_elem.frycAPI_append_html("<span> </span>");
					da_elem.append(staf);
				}
				// da_elem.frycAPI_append_html("<span> | </span>");

				let data;
				if (rss) {
					data = rss[da_i + 1];
				} else {
					const arr = text.replace(/ \[.+/, "").slice(text.indexOf(" at ") + 4).split(" on ");
					data = new Date(arr[1] + " " + arr[0]);
					if (data0 && data.getTime() < data0.getTime()) {
						data.setFullYear(new Date().getFullYear());
					}
				}

				da_elem.frycAPI_append_html(frycAPI.get_default_date_text(data));
				if (favs) {
					da_elem.frycAPI_append_html("<span> | </span>");
					da_elem.append(favs.frycAPI_set_inner_html(favs.innerHTML.replace(/favorites?/, "&#10084;"))); // ❤
				}

				if (user.href === op_href) {
					da_elem.parentElement.classList.add("bestleft");
				}
			});
		} else {
			frycAPI.for_each(`.copy.post > span.smallcopy:is(.postbyline, .byline)`, (da_elem, da_i, da_arr) => {
				const reg_match = da_elem.innerHTML.match(/(\s+at\s+)(.*?)(\s+-\s+)/);
				const data = new Date(reg_match[2]);
				if (frycAPI.is_valid_date(data)) {
					da_elem.innerHTML = da_elem.innerHTML.replace(reg_match[0], ` at ${frycAPI.get_default_date_text(data)} - `);
				} else {
					da_elem.innerHTML = da_elem.innerHTML.replace(reg_match[0], ` at ${frycAPI.time_12_to_24(reg_match[2])} - `);
				}
			});
			frycAPI.for_each(`:is(#scontent, #posts, #posts > div, #boxyleft) div:is(.copy:not(#related), .copy.post)`, (da_elem, da_i, da_arr) => {
				da_elem.insertAdjacentElement("afterend", document.createElement("div").frycAPI_add_class("my-posttitle-post-wrapper")).append(da_elem.previousElementSibling.classList.contains("posttitle") ? da_elem.previousElementSibling : "", da_elem);
			});
		}
	});
} else if (frycAPI_host("sjp.pwn.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		${frycAPI.simple_font_change}
		.banner:has(*) {
			display: none;
		}
	`);
} else if (frycAPI_host("www.baillifard.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		${frycAPI.simple_font_change}
	`);
} else if (frycAPI_host("web.dev", "developers.google.com", "developer.chrome.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.UUID = "2025-01-05 23:13";
	frycAPI.inject_style_on_load(/*css*/`
		* {
			tab-size: 3 !important;
		}
		*:not(
			devsite-code, devsite-code *,
			code, code *, .material-icons,
			.material-symbols-outlined, .material-symbols,
			input,
			a.devsite-nav-toggle
		), input[type="text"] {
			font-family: "IBM Plex Sans Condensed", "Google Sans", sans-serif;
		}
		devsite-content-footer.nocontent > p:last-of-type {
			display: none;
		}
		article.devsite-article {
			overflow: hidden;
		}
		button.devsite-devprofile-button > svg {
			filter: invert(1) hue-rotate(180deg);
		}
		devsite-content .devsite-breadcrumb-list {
			background-color: transparent;
		}
		[template=page] .devsite-article-body>h2:first-of-type {
			margin-top: 0;
		}

		h2, devsite-toc > ul > li > a {
			font-weight: bold;
			text-transform: uppercase;
		}
		h2:has(+ div > :first-child .dcc-tag-pill) {
			margin-bottom: 0;
		}
		h2:has(+ .dcc-reference .dcc-tag-pill), h2 + .dcc-reference:has(.dcc-tag-pill) {
			width: fit-content;
			display: inline-block;
		}
		h3 {
			overflow: visible;
			margin: 16px 0 8px;
		}
		h3::before {
			content: "●";
			margin-right: 10px;
			display: inline-block;
			transform: scale(0.8);
			transform-origin: center;
			overflow: visible;
			color: var(--devsite-upper-tab-marker-color);
		}
		:has(+ div .dcc-tag-pill--red) > h3::before {
			color: var(--color-red-darkest);
		}
		h4, h5, h6 {
			margin-top: 16px;

			button.devsite-heading-link {
				display: none;
			}
		}

		li.stack {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			border: 1px solid var(--color-hairline) !important;
			padding: 8px 12px !important;
			border-radius: 12px;

			p {
				margin: 0;
				flex-basis: 100%;
			}
			& > p:first-of-type {
				margin-top: 5px;
				padding-top: 5px;
				border-top: 1px solid var(--color-hairline);
			}
			p + p {
				margin-top: 12px !important;
			}
			& > :first-child {
				display: flex;
				align-items: center;
				/* gap: 12px; */
				padding: 0;

				.dcc-type--xsmall:not(:first-child) {
					margin-left: 10px;
					padding-left: 10px;
					border-left: 1px solid var(--color-hairline);
				}
			}
			& > :has(.dcc-tag-pill) {
				flex-grow: 0;

				& > div {
					margin-left: 10px;
					padding-left: 10px;
					border-left: 1px solid var(--color-hairline);
					display: flex;
					align-items: center;

					span {
						margin: 0;
					}
				}
			}
			devsite-code {
				margin: 0;
			}
			.dcc-code-sections {
				width: 100%;
			}
		}
		.dcc-code-sections .dcc-code-sections {
			border: 0;
			padding: 0;
		}
		.dcc-code-sections li>:first-child {
			min-width: 0;
		}
		.dcc-tag-pill--blue {
			background-color: rgb(199 207 221 / 40%);
		}
		.dcc-code-sections__icon::before {
			filter: contrast(0.8);
		}
		:has(> .notranslate):not(:has(devsite-code)) { /* :has(.dcc-tag-pill) */
			display: flex;
			align-items: baseline;
			flex-wrap: wrap;

			& > p {
				width: 100%;
			}
		}
		:has(> .notranslate):has(.dcc-tag-pill):has(devsite-code) {
			& > .notranslate, & > :has(.dcc-tag-pill) {
				width: fit-content;
				display: inline-block;
			}
		}
		:has(+ .dcc-code-sections > h4[data-text="Enum"]) {
			h3 {
				width: fit-content;

				&::after {
					content: "ENUM";
					font-family: "IBM Plex Mono";
					font-size: 0.8em;
					font-weight: bold;
					margin-right: 10px;
				}
			}
		}
		:has(+ .dcc-code-sections > h4[data-text="Enum"]):has(p + p) {
			p {
				border: 1px solid var(--color-hairline);
				border-radius: 12px;
				padding: 8px 12px;
			}
			p:nth-of-type(odd) {
				font-family: "IBM Plex Mono";
				border-bottom-width: 0;
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				margin-bottom: 0;
				padding-bottom: 4px;
			}
			p:nth-of-type(even) {
				border-top-width: 0;
				border-top-left-radius: 0;
				border-top-right-radius: 0;
				margin-top: 0;
				padding-top: 4px;
			}
		}
		:has(p + p) + .dcc-code-sections:has(> h4[data-text="Enum"]) {
			display: none
		}
		.dcc-code-sections__overline {
			border-top: 0;
		}
		.dcc-code-sections > h4[data-text="Enum"] {
			display: none
		}
		.dcc-code-sections:has(> h4[data-text="Enum"]) {
			.dcc-code-sections__icon {
				border: 1px solid var(--color-hairline);
				border-radius: 12px;
				padding: 8px 12px;

				.dcc-type--xsmall {
					font-size: 1rem;
				}
			}
		}
		[theme="chrome-theme"] .dcc-reference .note:not([class*="attempt"]), [theme="chrome-theme"] .dcc-reference devsite-code, [theme="chrome-theme"] .devsite-article-body > .note:not([class*="attempt"]), [theme="chrome-theme"] .devsite-article-body > devsite-code {
			--devsite-code-margin: 24px var(--devside-code-inline-margin);
			--devsite-notice-margin: 24px var(--devside-code-inline-margin);
		}
		devsite-code pre {
			padding: 16px;
		}
		.dcc-code-sections .dcc-code-sections devsite-code {
			margin-left: unset;
			margin-right: unset;
		}
		devsite-code {
			margin-left: 0;
			margin-right: 0;
			border-radius: 12px;
		}
		.empty-p {
			display: none
		}
		:is(.dcc-code-sections, :has(+ .dcc-code-sections)) > p:last-child {
			margin-bottom: 0;
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.set_default_date_style();
		frycAPI.create_mut_obs((mut_rec, doc_obs) => {
			if (frycAPI.query_sel_null(`p > .lepszyCzas`)) {
				let autors = document.querySelector(`.wd-authors`);
				let pos = "afterend";
				if (autors === null) {
					autors = document.querySelector(`.devsite-article-body.clearfix`);
					pos = "afterbegin";
				}
				const data_cont = document.querySelector(`devsite-content-footer.nocontent > p:last-child`);
				if (autors !== null && data_cont !== null) {
					const [y, m, d] = data_cont.innerText.match(/\d+/g).map(e => Number(e));
					const html_str = `<p style="margin: 0 0 16px 0; color: var(--devsite-breadcrumb-link-color, var(--devsite-secondary-text-color)); font-size: 0.8em;">Last updated ${frycAPI.get_default_date_text(new Date(Date.UTC(y, m - 1, d)), frycAPI.date_opts_no_time)}</p>`;
					autors.insertAdjacentHTML(pos, html_str);
				}
			}
			frycAPI.for_each(`p:not(.empty-p)`, da_elem => {
				if (da_elem.innerText === "") {
					da_elem.classList.add("empty-p");
				}
			});

			frycAPI.for_each(`.dcc-code-sections__label[id]:not(:has(> a))`, heading => {
				const txt = heading.innerText;
				heading.innerText = "";
				heading.appendChild(frycAPI.elem("a").attr("href", location.origin + location.pathname + "#" + heading.id).text(txt)._);
			});
		});
	}, 2);
} else if (frycAPI_host("miro.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.c-cFaYiI {
			background-color: #e9e9e9;
		}
	`);
} else if (frycAPI_host("marciniwuc.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		*:not(.fa, .far, .fas), .main-navigation .primary-menu-container > ul li.menu-item > a {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (frycAPI_host("bolero-napoje.pl", "bolero.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		:is(.minus, .plus) button,
		.header-logo .logo, img[alt="logo"] {
			filter: invert(1);
		}
	`);

	frycAPI.on_load_setter(function () {
		const tab = document.querySelector(`#shopping-cart-table`);
		frycAPI.make_table_sortable(tab, "tbody.cart.item", "td", "th", tab);
	});
} else if (frycAPI_host("cesium.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.nameContainer	{
			*:where(:not(.optional)) {
				margin: 5px 0px;
			}
			> * {
				margin: 5px 0px 5px 20px;
			}
			h4.name {
				margin-left: 0;
				cursor: pointer;
			}
			&.collapse-me *:not(h4.name, h4.name *) {
				display: none;
			}
		}
		footer {
			padding: 6px 6px;
			margin: 12px 0;
		}
		body, input {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		#ClassList > ul > li, .nameContainer .name, div.nav h5, .page-title, code {
			font-family: "Source Code Fryc", monospace !important;
		}
		.params td, .params th, .props td, .props th {
			vertical-align: middle;
		}
		code {
			color: #2aac2a;
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`.nameContainer`, da_elem => {
			let next;
			while ((next = da_elem.nextElementSibling)?.frycAPI_has_not_class("nameContainer") && next.frycAPI_has_not_class("subsection-title")) {
				da_elem.appendChild(next);
			}
			da_elem.frycAPI_elem_by_class("name").addEventListener("click", function (e) {
				da_elem.frycAPI_toggle_class("collapse-me");
			});
			da_elem.frycAPI_add_class("collapse-me");
		});
		document.querySelector(`.container-overview > .nameContainer`)?.frycAPI_remove_class("collapse-me");
	});
} else if (frycAPI_host("archived.moe")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.show-me {
			display: block !important;
		}
	`);

	frycAPI.on_load_setter(function () {
		const search = document.querySelector(`.search_box`);
		if (search === null) return;
		const input1 = document.querySelector(`input.search-query`);
		const container = document.querySelector(`.navbar-inner .container`);
		const input2 = document.getElementById("search_form_comment");
		// const main = document.getElementById("main");
		function show(e) {
			search.frycAPI_add_class("show-me");
		}
		function hide(e) {
			search.frycAPI_remove_class("show-me");
		}
		input1?.addEventListener("focus", show);
		input2?.addEventListener("focus", show);
		container?.addEventListener("click", hide);
	});
} else if (frycAPI_host("www.oddschecker.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`td.bc`, da_elem => {
			da_elem.firstElementChild.innerText = eval(da_elem.firstElementChild.innerText).toFixed(2).replace(".00", "");
		});
	});
} else if (frycAPI_host("math.hws.edu") && frycAPI.path === "/graphicsbook/demos/c2/rgb-hsv.html") { // https://math.hws.edu/graphicsbook/demos/c2/rgb-hsv.html
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		#canvas-holder {
			position: relative;
		}
		#myDiv {
			position: absolute;
			top: 5px;
			left: 5px;
		}
		html {
			background-color: #595959;
		}
	`);
	const rgb2hex = rgb => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, "0")).join("").toUpperCase()}`; // eslint-disable-line radix
	frycAPI.on_load_setter(function () {
		const canv = document.getElementById("maincanvas");
		const my_div = canv.parentElement.appendChild(document.createElement("div").frycAPI_set_attribute("id", "myDiv").frycAPI_set_inner_html("Hello, I'm text"));
		frycAPI.create_mut_obs((mut_rec_arr0, mut_obs0) => {
			if (canv.style.backgroundColor.length > 0) my_div.style.color = frycAPI.get_good_text_color(rgb2hex(canv.style.backgroundColor));
		}, { run_on_load: false, elem: canv, options: { attributes: true, childList: false, subtree: false } });
	});
} else if (frycAPI_host("ponepaste.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		.tag:not(body) {
			background-color: #3298dc;
			color: #fff;
		}
		span.tag.is-normal:has(i.fa.fa-hdd.fa-lg) {
			gap: 5px;
		}
		.column.is-4:not(.has-text-centered, .has-text-right) {
			display: flex;
			flex-wrap: wrap;
			align-content: flex-start;
			gap: 2px 4px;
			hr {
				flex-basis: 100%;
				height: 0;
				margin: 0;
				border: 0;
			}
			/* span.tag.is-normal:has(i.fa.fa-star.fa-lg) {
				margin-right: auto;
			} */
		}
	`);

	frycAPI.on_load_setter(function () {
		// #region //* Naprawa wyświetlania info w lewym górnym
		const br = document.querySelector(`.column.is-4:not(.has-text-centered, .has-text-right) > br`);
		if (br !== null) {
			br.frycAPI_insert_html("afterend", "<hr>");
			br.remove();
		}
		// #endregion
		// #region //* Naprawa dat
		const site_dates = document.querySelector(`.column.is-4.has-text-centered small.title`);
		if (site_dates !== null) {
			frycAPI.set_default_date_style();
			function date_helper(da_elem, front_str) {
				const mod_date_str = da_elem.textContent.trim();
				if (mod_date_str.startsWith(front_str)) {
					return { front_str, date_str: mod_date_str.replace(front_str, "") };
				} else {
					return undefined;
				}
			}
			Array.from(site_dates.childNodes).forEach((da_elem, da_i, da_arr) => {
				if (da_elem.nodeType === Node.TEXT_NODE) {
					const obj = date_helper(da_elem, "Created: ") ?? date_helper(da_elem, "Updated: ") ?? date_helper(da_elem, "Expiry: ");
					if (obj?.date_str) {
						const data = new Date(obj.date_str);
						if (frycAPI.is_valid_date(data)) {
							da_elem.textContent = obj.front_str;
							frycAPI.set_default_date_enum.mode.oba(da_elem.frycAPI_insert_after(frycAPI.get_default_date_text(data)));
							// da_elem.remove();
						}
					}
				}
			});
		}
		frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
			frycAPI.set_default_date(`table#archive tbody td:nth-child(3)`, { get_date: "txt", custom_style: `cursor: none;` }).mode.relatywny_czas();
		});
		// #endregion
	});
} else if (frycAPI_host("thepiratebay.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (location.href === "https://www.elka.pw.edu.pl/Aktualnosci/Kalendarz-akademicki") {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		iframe#external {
			height: 1200px !important;
		}
	`);
} else if (0 && frycAPI_host("store.steampowered.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.create_mut_obs(mut_rec_arr => {
		for (const mut of mut_rec_arr) {
			for (const node of mut.addedNodes) {
				if (node.tagName === "SCRIPT" && node.src.includes("jquery-ui-1.9.2.js")) {
					node.src = frycAPI.get_res_url("jquery-ui-1.13.3.min.js");
					return true;
				}
			}
		}
	}, { elem: document.documentElement });

	// frycAPI.on_load_setter(function () {
	// });
} else if (frycAPI_host("png2pdf.netlify.app", "pdf2png.netlify.app")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		body {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10px;
			margin: 0 auto;
			max-width: 960px;
		}
		input[type="file"] {
			height: 50px;
		}
		input[type="file"]::-webkit-file-upload-button {
			height: 50px;
		}
		button {
			height: 50px;
		}
	`);

	if (frycAPI_host("png2pdf.netlify.app")) {
		frycAPI.change_favicon_res("IMG to PDF cropped.png");
		document.title = "IMG to PDF";
	} else {
		frycAPI.change_favicon_res("PDF to IMG cropped.png");
		document.title = "PDF to IMG";
	}
} else if (frycAPI_host("imagemagick.org", "www.imagemagick.org") && frycAPI.path.startsWith("/discourse-server")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.color_scheme_dark = true;
} else if (frycAPI_host("www.icoconverter.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
	frycAPI.change_favicon_res("IMG to ICO rounded corners.png");
} else if (frycAPI_host("www.sumatrapdfreader.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		*:not(code, code *) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
} else if (frycAPI_host("www.crocs.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.single-desktop-image {
			background-color: #cdcdcd !important;
		}
		.banner-show-container {
			display: none;
		}
	`);

	(frycAPI.before_load = function () {
		frycAPI.color_scheme_dark = 1;
	})();
} else if (frycAPI_host("www.patreon.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.on_load_setter(function () {
		document.addEventListener("keydown", e => {
			if (e.key !== "p") return; // Activation key
			if (document.activeElement.tagName.frycAPI_equal_any("TEXTAREA", "INPUT")) return; // Don't trigger when typing
			const video_el = document.getElementsByTagName("video").find(frycAPI.is_elem_on_screen);
			if (!video_el) return; // Don't trigger when no video is on screen
			const filename = frycAPI.traverse_until("forward", video_el, el => el.tagName === "SPAN" && el.getAttribute("data-tag") === "post-title")?.first_el.innerText;
			frycAPI.down_load_video_frame(video_el, (filename || "Patreon Video - " + frycAPI.print_date_for_file_name()) + " - " + video_el.currentTime.toFixed(3) + " s.png");
		});
	});
} else if (frycAPI_host("pypi.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		.docutils.literal, code, kbd, pre, samp, tt {
			&, & > span {
				font-family: "Source Code Fryc", "Source Code Pro", monospace;
			}
		}
	`, { elevated: true });
} else if (frycAPI_host("x.com", "twitter.com")) {
	frycAPI.line = frycAPI.get_line_number();
	const QUOTE_SEL = `div:has(> [role="link"] [data-testid="Tweet-User-Avatar"]):has(time)`;
	const TWEET_TEXT_SEL = `div:not([role="link"]) > div > div:not([role="link"]) > div > div:has(> [data-testid="tweetText"])`;
	const QUOTE_AND_TEXT = "quoteAndText";
	const QUOTE_PARENT = "quoteParent";

	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		article ${QUOTE_SEL} {
			order: -2;
		}
		article[${QUOTE_AND_TEXT}] ${TWEET_TEXT_SEL} {
			order: -1;
			margin: 0;
		}
		[${QUOTE_PARENT}] {
			margin-top: 6px;
			gap: 10px;
		}

		/* [data-testid="tweetText"]::first-letter {
			text-transform: uppercase;
		} */
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.set_default_date_style().mode.relatywny_czas().tool_tip_right();
		frycAPI.create_mut_obs(() => {
			// loguj("MutObs");
			frycAPI.set_default_date("time");

			frycAPI.for_each(`article:not(.${QUOTE_AND_TEXT})`, article => {
				const quote = article.querySelector(QUOTE_SEL);
				if (!quote) return;
				quote.parentElement.setAttribute(QUOTE_PARENT, "");
				const tweet_text = article.querySelector(TWEET_TEXT_SEL);
				if (!tweet_text) return;
				quote.insertAdjacentElement("beforebegin", tweet_text);
				article.setAttribute(QUOTE_AND_TEXT, "");
			});
		});
	});
} else if (frycAPI_host("cas.usos.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.on_load_setter(function () {
		const username = frycAPI.by_id("username");
		const password = frycAPI.by_id("password");
		if (username && password) {
			frycAPI.retry_if(() => username.value && password.value, 100, () => {
				frycAPI.q_sel(`.login button.form-button`)?.click();
			});
		}
	}, 2);
} else if (frycAPI_host("leon.pw.edu.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.on_load_setter(function () {
		frycAPI.q_sel(`.loginbtn-btn`)?.click();
	}, 2);
} else if (frycAPI_host("keep.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		a[aria-label="Keep"] > img {
			content: url("chrome-extension://jmpmjlfehojjhkfmjhnhlfgobpiekeci/resources/Google Keep.ico");
		}
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.change_favicon_res("Google Keep.ico");
	});

	frycAPI.create_manual_functions("Google Keep", {
		func_arr: [
			(name = "Download expanded note", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					// frycAPI.traverse_until("forward", frycAPI.q_sel(`[role="tooltip"]`).next_el, el => getComputedStyle(el).display !== "none")
					const outer_parent = frycAPI.q_sel(`[role="tooltip"] + * + * [role="button"][data-tooltip-text*="Zaznacz"] + *`);
					if (outer_parent) {
						const title = outer_parent.querySelector(`[contenteditable="true"]`);
						const title_text = title.innerText.trim();
						const note_obj = {
							title: title_text,
							// lastEdited: "",
							type: "",
							content: [],
						};
						const list_notes_container = title.next_el.first_el;
						if (list_notes_container) {
							note_obj.type = "list";
							const temp_arr = [];
							list_notes_container.children.forEach(child => {
								if (child.frycAPI_q_sel_ok(`[dir="ltr"]`) && child.children.length === 1) {
									const elem_obj = {};
									elem_obj.level = getComputedStyle(child.first_el).marginLeft === "0px" ? 0 : 1;
									elem_obj.text = child.innerText.trim();
									elem_obj.checked = child.frycAPI_q_sel_ok(`[aria-checked="true"]`);
									// elem_obj.id = child.querySelector(`[id]`).id;
									temp_arr.push(elem_obj);
								}
							});
							let curr0_level_children;
							temp_arr.forEach(elem_obj => {
								if (elem_obj.checked === false) {
									if (elem_obj.level === 0) {
										curr0_level_children = elem_obj.children = [];
										note_obj.content.push(elem_obj);
									} else {
										curr0_level_children.push(elem_obj);
									}
								} else {
									if (elem_obj.level === 0) { // eslint-disable-line no-lonely-if
										curr0_level_children = note_obj.content.find(el => el.text === elem_obj.text)?.children;
										if (!curr0_level_children) {
											note_obj.content.push(elem_obj);
											curr0_level_children = elem_obj.children = [];
										}
									} else {
										curr0_level_children.push(elem_obj);
									}
								}
								delete elem_obj.level;
							});
						} else {
							note_obj.type = "text";
							note_obj.content = title.parentElement.next_el?.first_el.innerText;
						}
						frycAPI.download_txt(note_obj.jsón, title_text + ".json");
					} else {
						alert("No note is expanded");
					}
				};
				return f;
			},
		],
	});
} else if (frycAPI_host("r.3v.fi")) {
	frycAPI.line = frycAPI.get_line_number();
	window.alert = function (message) {
		console.log(message);
	};
} else if (frycAPI_host("iformatki.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#visualization_1 {
			position: sticky;
			top: 78px;
		}
	`);
} else if (frycAPI_host("steam.tools")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#container {
			background: black;
			color: white;
		}
		span.add-on {
			color: black;
		}
		body {
			background: #000000;
		}
	`);
} else if (frycAPI_host().startsWith("obsidian.nick-lab")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		::selection {
			background: #1640A0;
		}
	`);
} else if (frycAPI_host("tvn24.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		ad-placeholder {
			display: none !important;
		}
	`);
} else if (frycAPI_host("onedrive.live.com")) {
	frycAPI.line = frycAPI.get_line_number();

	frycAPI.on_load_setter(function () {
		frycAPI.create_mut_obs(() => {
			frycAPI.set_default_date(`[data-automationid="field-Modified"]`, {
				// Match up to the first ( and append correct time zone
				get_date: elem => elem.getAttribute("title").match(/^.+?(?=\()/)?.[0].concat("-0700"),
			});
		});
	});

	frycAPI.create_manual_functions("OneDrive", {
		func_arr: [
			(name = "Copy selected item's path", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = async function (obj) {
					let elem_path = "";
					frycAPI.traverse_iframe_windows(window, win => {
						if (!elem_path) {
							win.document.querySelectorAll(`[class*="informationPathSegment"]`)?.forEach(da_elem => {
								elem_path += "/" + da_elem.innerText.trim();
							});
						}
					});
					if (elem_path) {
						frycAPI.ctrl_c(elem_path);
						loguj(f.name = "Copied!");
					} else {
						loguj(f.name = "No path found");
					}
					await frycAPI.sleep(1000);
					f.name = name;
				};
				return f;
			},
		],
	});
} else if (frycAPI_host(
	"www.openssh.org", "www.openbsd.org", "www.openntpd.org", "man.openbsd.org", "www.openbgpd.org",
	"www.rpki-client.org", "www.opensmtpd.org", "www.openiked.org", "mandoc.bsd.lv", "www.libressl.org"
)) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		html {
			max-width: unset !important;
			max-height: unset !important;
			margin: 0;
			padding: 0;
		}
		body {
			max-width: 1000px !important;
			margin: auto !important;
			padding: 10px;
		}
		pre {
			width: fit-content;
			margin: auto;
		}
	`);
} else if (frycAPI_host("man.freebsd.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#content, #footer {
			width: fit-content;
			margin: auto;
		}
	`);
} else if (frycAPI_host("catbox.moe")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body > div.image {
			display: none;
		}
	`);

	frycAPI.create_manual_functions("Catbox", {
		func_arr: [
			(name = "Export catbox name to original name map", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					let str = "";
					frycAPI.for_each(`.col-1-8`, da_elem => {
						str += da_elem.frycAPI_elem_by_tag("a").innerText.trim() + "|" + da_elem.frycAPI_elem_by_tag("small").innerText.trim().slice(1, -1) + "\n";
					});
					loguj(str);
					frycAPI.ctrl_c(str);
				};
				return f;
			},
		],
	});
} else if (frycAPI_host("www.autocentrum.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.wrapper:has(> div > script + img + div) {
			display: none;
		}
	`);
} else if (frycAPI_host("betterdiscord.app")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body > :has(iframe):has(span[data-google-query-id]),
		body > :has(iframe[id^="google_ads_iframe"]),
		.ad, .adsbygoogle, #google-anno-sa, .hide {
			display: none !important;
		}
		.os-content {
			padding: 0 !important;
		}
	`);

	frycAPI.create_mut_obs(() => {
		if (document.body) {
			frycAPI.create_mut_obs(() => {
				// frycAPI.traverse_shadow_roots(elem => {
				// 	if (elem.shadowRoot.getElementById("ft-floating-toolbar")) {
				// 		elem.setAttribute("style", "display: none !important;");
				// 	}
				// });
				frycAPI.for_each(`body > *`, elem => {
					if (elem?.shadowRoot?.getElementById("ft-floating-toolbar")) {
						elem.setAttribute("style", "display: none !important;");
					}
				});
				frycAPI.for_each(`body > :has(iframe):has(span[data-google-query-id]), body > :has(iframe[id^="google_ads_iframe"]), .ad, .adsbygoogle, #google-anno-sa`, el => el.remove());
			});
			return true;
		}
	}, { elem: document.documentElement });
} else if (frycAPI_host("old.reddit.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		body:not(.custom-css) {
			.morelink, .morelink:hover, .mlh {
				background-image: none;
			}
			button {
				border-width: 0;
			}
			h1.redditname {
				width: fit-content;
				display: inline-block;
				margin-right: 7px;
			}
			.side {
				display: flex;
				flex-direction: column;
				gap: 5px;
				margin-top: 5px;

				& > * {
					margin: 0 !important;
				}
			}
			.content {
				margin: 5px 5px 0px 5px;
			}
			.titlebox {
				border: 1px solid gray;
				padding: 5px;
			}
		}
		.link .rank,
		.link.promotedlink,
		.domain,
		.premium-banner,
		.morelink .nub,
		.col:has(a.buygold.choice),
		.sidecontentbox .title {
			display: none;
		}
		.md, textarea, input, button:not(.redesign-beta-optin), .morelink, ul.content, .linkinfo, .fancy-toggle-button .add, .titlebox {
			border-radius: 5px !important;
		}
		.footer-parent {
			padding: 0;
			background-image: none;
			margin-top: 20px;
		}
		button,
		*:not(.author) {
			&::first-letter {
				text-transform: uppercase;
			}
		}
		body.comments-page {
			#siteTable {
				display: flex;
				gap: 5px;
				align-items: flex-start;

				.link {
					margin: 0;
					flex-grow: 1;
				}
			}
		}
		.link .usertext-body .md {
			width: fit-content;
		}
		.linkinfo .score .number {
			color: orangered;
		}
		li.message-button.centered {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 5px;
			padding-top: 0;

			&::before {
				content: "MODERATORS";
				font-size: large;
				font-weight: bold;
			}
		}
		.titlebox .bottom {
			display: flex;
			align-items: center;
			justify-content: space-between;

			& > * {
				white-space: nowrap;
				margin: 0;
				padding: 0;
				border: 0;
			}
		}
		.footer {
			width: fit-content;
			white-space: nowrap;

			.col {
				flex-grow: 1;
			}
		}
		.comment .child, .comment .showreplies {
			border-left: 1px solid orangered;
		}
		.likes .score.likes {
			color: orangered;
		}
		.edited-timestamp::before {
			content: "| "
		}
	`);

	frycAPI.on_load_setter(function () {
		const COMMENTS_PAGE = frycAPI.query_sel_ok(`body.comments-page`);
		const CUSTOM_CSS = frycAPI.query_sel_ok(`link[ref="applied_subreddit_stylesheet"]`);

		if (CUSTOM_CSS) {
			document.body.classList.add("custom-css");
		}

		if (COMMENTS_PAGE) {
			const post_body = frycAPI.by_id("siteTable");
			if (post_body) {
				post_body.querySelectorAll(".clearleft").forEach(el => el.remove());
				post_body.appendChild(frycAPI.by_class("linkinfo"));
			}
		}

		frycAPI.by_id("shortlink-text")?.addEventListener("click", ev => {
			const me = ev.target;
			navigator.clipboard.writeText(me.value);
		});

		frycAPI.q_sel(`.titlebox .bottom`)?.childNodes.forEach(node => {
			if (node.nodeType === Node.TEXT_NODE) {
				const span = frycAPI.elem("span").text(node.textContent)._;
				node.frycAPI_insert_after(span);
				node.remove();
			}
		});

		frycAPI.for_each(`.userattrs a.submitter`, el => (el.innerText = "OP"));

		frycAPI.create_mut_obs(() => {
			frycAPI.set_default_date(`*:not(.age) > time`);
		}, { options: { characterData: true } });
	});

	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`.side .spacer:is(:not(:has(*)), :has(.premium-banner-outer))`, el => el.remove());
	}, 2);
} else if (frycAPI_host("matplotlib.org", "numpy.org", "pandas.pydata.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		#pst-back-to-top {
			display: none !important;
		}
	`);
} else if (frycAPI_host("developer.spotify.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);
} else if (frycAPI_host("groups.google.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.create_mut_obs(() => {
			frycAPI.set_default_date(`section[role="listitem"][data-doc-id][data-subject] [jsname] span + div > span:first-child`, { get_date: elem => {
				const txt = elem.innerText; // date and time
				if (!txt) return;
				const next_txt_arr = elem.nextElementSibling.innerText.split("."); // date, non-american
				if (next_txt_arr.length < 3) return;
				return [next_txt_arr[1], next_txt_arr[0], next_txt_arr[2]].join(".") + txt.split(",")[1]; // convert to american date and add time that already contains a leading space
			} });
		});
	});
} else if (frycAPI_host("code.visualstudio.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.on_load_setter(function () {
		frycAPI.for_each(`.docs a.type-ref`, da_elem => {
			da_elem.addEventListener("click", e => {
				e.stopPropagation();
				location.hash = da_elem.getAttribute("href");
			});
		});
	});
} else if (frycAPI_host("www.libtorrent.org", "www.rasterbar.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (frycAPI_host("go.dev")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		*:not(.material-icons) {
			tab-size: 3 !important;
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
		code, #code, .Playground-output, span.system, span.stdout {
			font-family: "Source Code Fryc", monospace !important;
		}
	`);
} else if (frycAPI_host("discord.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.create_manual_functions("Discord", {
		func_arr: [
			(name = "Download emojis from the current server", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					const current_server_name = frycAPI.q_sel(`[class*="title"] > [class*="defaultColor"][class*="lineClamp"]`)?.innerText;
					if (!current_server_name) return;
					const current_server_icon = frycAPI.q_sel(`[class*="title"] > [class*="iconActive"]`);
					if (current_server_icon) {
						const img_url = new URL(current_server_icon.bg_img_url);
						img_url.searchParams.set("size", "512");
						frycAPI.download_url(img_url.href, `${current_server_name}/${current_server_name} server icon.webm`);
					}
					frycAPI.for_each(`img[aria-label$="z: ${current_server_name}"]`, da_elem => {
						const img_url = new URL(da_elem.src);
						img_url.searchParams.set("size", "512");
						frycAPI.download_url(img_url.href, `${current_server_name}/${da_elem.getAttribute("alt").replaceAll(":", "")}.webm`);
					});
				};
				return f;
			},
		],
	});
} else if (frycAPI_host("wiki.mbxmas.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		img[alt="DPS"] {
			filter: saturate(0.3);
		}
	`);

	const mechabellum = new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoL0JpYmxpb3Rla2kgV2luZG93cy9PYnJhenkvSWNvbnMvTWVjaGFiZWxsdW0v");

	frycAPI.on_load_setter(function () {
		const panel = frycAPI.q_sel(`.bevel-panel-content.stats-panel`);
		if (!panel) return;
		const dps_row = panel.appendChild(panel.last_el.cloneNode(1));
		dps_row.querySelector(`img`).frycAPI_set_attribute_bulk("src", mechabellum.get_file_url("badge_red.webp"), "alt", "DPS");
		dps_row.querySelector(`.stat-label`).innerText = "DPS";
		dps_row.querySelector(`.stat-value`).innerText = (parseFloat(panel.querySelector(`[alt="ATK"] ~ .stat-value`).innerText) / parseFloat(panel.querySelector(`[alt="Attack Interval"] ~ .stat-value`).innerText)).toFixed(1);
	});
} else if (frycAPI_host("my.zerotier.com") && frycAPI.path.startsWith("/network")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	function get_table_json() {
		const table = frycAPI.q_sel(`section > section > table`); // potentially unsafe selector
		if (!table) return null;
		const jsn = [];
		table.querySelectorAll(`tbody > tr`).forEach(tr => {
			jsn.push({
				Auth        : tr.children[2].innerText.trim() === "✅",
				Node_ID     : tr.children[3].querySelector(`.code`).innerText.trim(),
				Virtual_MAC : tr.children[3].querySelector(`.code + div`).innerText.trim(),
				Name        : tr.children[4].querySelector(`span`).innerText.trim(),
				Description : tr.children[4].querySelector(`span + div`).innerText.trim(),
				Managed_IPv4: tr.children[5].querySelector(`[title="managedV4"]`)?.innerText.trim() ?? "",
				Managed_IPv6: tr.children[5].querySelector(`[title="6plane"]`)?.innerText.trim() ?? "",
				Last_Seen   : tr.children[6].innerText.trim(),
				Version     : tr.children[7].innerText.trim(),
				Physical_IP : tr.children[8].innerText.trim(),
				OS          : tr.children[9].innerText.trim(),
				Architecture: tr.children[10].innerText.trim(),
			});
		});
		return jsn;
	}
	function get_download_name() {
		return `ZeroTier ${frycAPI.q_sel(`h1[title="Network Name"]`).innerText.trim()} [${frycAPI.by_id("networkIdField").value}]`;
	}
	frycAPI.create_manual_functions("Zero Tier", {
		func_arr: [
			(name = "Download members table as CSV", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					const jsn = get_table_json();
					if (!jsn) {
						f.name = "I can't find the table";
						return;
					}
					const col_names = Object.keys(jsn[0]);
					const str = `${col_names.join(",")}\n${jsn.map(row => Object.values(row).join(",")).join("\n")}`;
					frycAPI.download_txt(str, get_download_name() + ".csv");
				};
				return f;
			},
			(name = "Download members table as JSON", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = function (obj) {
					const jsn = get_table_json();
					if (!jsn) {
						f.name = "I can't find the table";
						return;
					}
					frycAPI.download_txt(jsn.jsón, get_download_name() + ".json");
				};
				return f;
			},
		],
	});
} else if (frycAPI_host("www.netfala.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			background: var(--darkreader-background-ffffff, #212324) !important;
		}
	`);
} else if (frycAPI.path.startsWith("/C:/Users/Fryderyk/AppData/Roaming/npm") && frycAPI.path.endsWith(".html")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		html, img, #logobar {
			filter: invert(1) hue-rotate(180deg); /* !important */
		}
	`);
} else if (frycAPI_host("docs.ntpsec.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		html, body {
			background-color: hsl(34 0% 17% / 1);
		}
		body {
			width: 50%;
			margin: auto;
			padding: 10px;
			text-align: left;
			font-family: "IBM Plex Sans Condensed", "verdana", sans-serif;
		}
	`);
} else if (0 && frycAPI_host("phrogz.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	// None of this worked to fix the Mixed Content error

	// document.appendChild(frycAPI.elem_from_html('<script type="text/javascript" src="https://ajax.microsoft.com/ajax/jquery/jquery-1.4.4.min.js"></script>'));

	// frycAPI.create_mut_obs(() => {
	// 	frycAPI.for_each(`script[src^="http://"]`, script => {
	// 		// script.src = "https" + script.src.slice(4);
	// 		// script.setAttribute("src", "https" + script.getAttribute("src").slice(4));
	// 		const clone = script.cloneNode(1);
	// 		clone.src = "https" + script.src.slice(4);
	// 		script.insertAdjacentElement("afterEnd", clone);
	// 		script.remove();
	// 	});
	// });
} else if (frycAPI_host("claude.ai")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		html {
			--my-font: "IBM Plex Sans Condensed", sans-serif !important;
			--font-claude-response: var(--my-font) !important;
			--font-user-message: var(--my-font) !important;
			--font-ui: var(--my-font) !important;
			--default-mono-font-family: "Source Code Fryc", monospace !important;
			--font-mono: var(--default-mono-font-family) !important;
		}
	`);

	const CLAUDE_ORG = "97083ba7-1fd6-4fdd-aaa5-dc1bc12a98e2";
	const ADD_RELATIVE_TIME = false;
	frycAPI.create_manual_functions("Claude", {
		func_arr: [
			(name = "Get usage", type = frycAPI_Normal) => {
				const f = new type({
					name,
					style: `--el-height: fit-content; --font-family: "Source Code Fryc"; --text-align: left; --display: block;`,
					reset_name_on_first_start: false,
					title: "Click to refresh",
				});
				f.callback = async function (obj) {
					const usage = await (await fetch(`https://claude.ai/api/organizations/${CLAUDE_ORG}/usage`)).json();
					const opts = { ago: false, znak: "in " };
					const curr_date = new Date();
					const five_hour = usage.five_hour.utilization;
					const seven_day = usage.seven_day.utilization;
					const five_hour_resets_at = new Date(usage.five_hour.resets_at || undefined);
					const seven_day_resets_at = new Date(usage.seven_day.resets_at || undefined);
					const five_hour_remaining_time = (five_hour_resets_at - curr_date) / frycAPI.hour;
					const seven_day_remaining_time = (seven_day_resets_at - curr_date) / frycAPI.day;
					const five_hour_util_time = curr_date - (five_hour_resets_at - 5 * frycAPI.hour);
					const seven_day_util_time = curr_date - (seven_day_resets_at - 7 * frycAPI.day);
					const five_hour_util_time_scaled = five_hour_util_time / frycAPI.hour;  // h
					const seven_day_util_time_scaled = seven_day_util_time / frycAPI.day;  // day
					const five_hour_rate = five_hour ? five_hour / five_hour_util_time_scaled : 0; // %/h
					const seven_day_rate = seven_day ? seven_day / seven_day_util_time_scaled : 0; // %/day
					const five_hour_run_out = five_hour ? (100 - five_hour) / five_hour_rate : 0;  // h
					const seven_day_run_out = seven_day ? (100 - seven_day) / seven_day_rate : 0;  // day
					const pad_e = (str, max_len = 2, char = "@", real_char = "&nbsp;") => str.padEnd(max_len, char).replaceAll(char, real_char);
					const fix_pad = (str, to_fixed = 0, max_len = 2, char = "@", real_char = "&nbsp;") => str.toFixed(to_fixed).padStart(max_len, char).replaceAll(char, real_char);
					f.name = `Session (5 h)${"".repeat(100)}: ${fix_pad(five_hour)} % | Resets ${pad_e(frycAPI.print_rel_time(five_hour_resets_at, opts) || "in 5.0 hours", 13)}| <span style="color: ${!five_hour || five_hour_run_out > five_hour_remaining_time ? "#00d600" : "red"}">Will run out in ${five_hour_run_out.toFixed(1)   } h with rate ${five_hour_rate.toFixed(1)} %/h</span>${ // eslint-disable-line template-curly-spacing
						"<br>"}This week${"&nbsp;".repeat(4)}: ${fix_pad(seven_day)} % | Resets ${pad_e(frycAPI.print_rel_time(seven_day_resets_at, opts) || "in 7.0 days" , 13)}| <span style="color: ${!seven_day || seven_day_run_out > seven_day_remaining_time ? "#00d600" : "red"}">Will run out in ${seven_day_run_out.toFixed(1)} days with rate ${seven_day_rate.toFixed(1)} %/day</span>`; // eslint-disable-line comma-spacing
				};
				return f;
			},
			(name = "Download conversation as markdown", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callback = async function (obj) { // Same format as /export of "search Claude's output.py"
					const conv_uuid = location.pathname.match(/^\/chat\/([\da-f-]{36})/)?.[1];
					if (!conv_uuid) return (f.name = "Open a conversation first");
					const resp = await fetch(`/api/organizations/${CLAUDE_ORG}/chat_conversations/${conv_uuid}?tree=True&rendering_mode=messages&render_all_tools=true`);
					if (!resp.ok) return (f.name = `Fetching the conversation failed: HTTP ${resp.status}`);
					const conv = await resp.json();

					// The tree holds every edit and retry - walk up from the current leaf to get only the branch on screen
					const by_uuid = new Map(conv.chat_messages.map(msg => [msg.uuid, msg]));
					const branch = [];
					for (let msg = by_uuid.get(conv.current_leaf_message_uuid); msg; msg = by_uuid.get(msg.parent_message_uuid)) branch.unshift(msg);

					const get_text = msg => {
						const blocks = msg.content ?? [];
						// Only the closing answer, not the notes written between tool calls - text blocks split by citations join with ""
						const after_tools = blocks.slice(blocks.findLastIndex(block => block.type.includes("tool")) + 1);
						const closing = after_tools.filter(block => block.type === "text").map(block => block.text).join("").trim();
						return closing || blocks.filter(block => block.type === "text").map(block => block.text.trim()).join("\n\n").trim() || msg.text?.trim();
					};

					const sections = [];
					const date_formatter = frycAPI.get_date_formatter();
					for (const msg of branch) {
						const text = get_text(msg);
						if (text) {
							const da_date = new Date(msg.created_at);
							sections.push(`# ${msg.sender === "human" ? "🙋‍♂️ Prompt" : "🤖 Output"} | ${frycAPI.print_date(da_date, date_formatter)}${ADD_RELATIVE_TIME ? ` - ${frycAPI.print_rel_time(da_date)}` : ""}\n${text}`);
						}
					}
					if (!sections.length) return (f.name = "Nothing to export - the conversation has no messages with text");

					const header = [
						"---",
						`title: ${JSON.stringify(conv.name)}`,
						`source: ${JSON.stringify(`${location.origin}/chat/${conv_uuid}`)}`,
						`exported: ${frycAPI.print_date(Date.now(), frycAPI.get_date_formatter({ timeZoneName: "longOffset" })).replace("GMT", "")}`,
						"---",
					].join("\n");
					const title_for_filename = conv.name ? conv.name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/[. ]+$/, "") : "";
					const filename = (title_for_filename ? title_for_filename + " - " + conv_uuid : conv_uuid) + ".md";
					const content = `${header}\n\n${sections.join("\n\n")}\n`;
					frycAPI.download_txt_background(content, filename, "uniquify"); // Never overwrite - a different conversation can have the same title
				};
				return f;
			},
		],
	});
} else if (frycAPI_host("triq.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.pulseplot-messages strong {
			font-family: "Source Code Fryc", sans-serif;
		}
	`);
} else if (frycAPI_host("aa.quae.nl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			width: 1000px;
			max-width: 100%;
			margin: auto;
		}
		* {
			font-family: "IBM Plex Sans Condensed", Calibri, sans-serif !important;
		}
	`);
} else if (frycAPI_host("127.0.0.1")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.color_scheme_dark = true;
} else if (frycAPI_host("www.instrukcjaobslugipdf.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		html, img {
			filter: invert(1) hue-rotate(180deg); /* !important */
		}
		:is(.ad-placeholder, .manual__navigation) + :has(.adsbygoogle) {
			display: none;
		}
	`);

	frycAPI.on_load_setter(function () {
	});

	frycAPI.create_mut_obs((mut_rec_arr, mut_obs) => {
		frycAPI.q_sel(`.comments__hero button.close`)?.click();
	}, { options: { attributes: true } });
} else if (frycAPI_host("www.urbandictionary.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.py-3.print\\:hidden {
			display: none;
		}
	`);
} else if (frycAPI_host("archidekt.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	frycAPI.on_load_setter(function () {
	});

	const precons = new frycAPI_Cache("Y2hyb21lLWV4dGVuc2lvbjovL29wa2Rib21kZnBmam5mZmxrYmthamRsYWxha2VrYWFoL01hZ2ljIHRoZSBHYXRoZXJpbmcvRm9yZ2UvcmVzL3F1ZXN0L3ByZWNvbnMv");

	frycAPI.create_manual_functions("Archidekt", {
		func_arr: [
			(name = "Validate deck", type = frycAPI_Input) => {
				const f = new type({ name });
				f.display_name = 1;
				f.name_clickable = 1;
				f.select_on_focus = 1;
				const num_and_space = /^[\d\s]+/g;
				f.callback = async function (obj) {
					const deck_name = f.state.trim().replaceAll(num_and_space, "");
					f.state = deck_name;
					const result = f.func_group.func_arr[f.num + 1];
					if (await precons.file_exists(deck_name + ".dck")) {
						const deck_content = (await frycAPI.read_file(precons.get_file_url(deck_name + ".dck"), "txt")).toLowerCase();
						let local_cards = deck_content.extract_after("[commander]");
						local_cards ||= deck_content.extract_after("[main]");
						local_cards = local_cards
						.split("\n")
						.map(s => s.trim())
						.filter(s => s && !s.startsWith("["))
						.map(s => s.replaceAll(num_and_space, "").split("|", 1)[0].replace(/\+$/, ""));
						local_cards = new Set(local_cards);

						let site_cards = frycAPI.q_sel_all(`#deck-container [id="basicCardImage"]`)
						.map(s => s.alt.match(/(.+) \(.+\).+$/)[1].toLowerCase());
						site_cards = new Set(site_cards);

						const local_minus_site = Array.from(local_cards.difference(site_cards));
						const site_minuslocal = Array.from(site_cards.difference(local_cards));

						if (local_minus_site.length || site_minuslocal.length) {
							result.name =
							(local_minus_site.length ? `Local cards not on site (${local_minus_site.length}): ${local_minus_site.join(", ")}` : "") +
							(local_minus_site.length && site_minuslocal.length ? "<br>" : "") +
							(site_minuslocal.length ? `Site cards not in local: (${site_minuslocal.length}): ${site_minuslocal.join(", ")}` : "");
						} else {
							result.name = "Decks are identical";
						}
					} else {
						result.name = "Deck not found";
					}
				};
				return f;
			},
			(name = "Result", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.func_el_style = "height: fit-content; white-space: normal;";
				f.reset_name_on_first_start = 0;
				// f.callback = function (obj) { };
				return f;
			},
		],
	});
} else if (frycAPI_host("www.furaffinity.net")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		site-banner {
			display: none;
		}
		#site-content {
			padding-top: 73px;
		}
	`);
	frycAPI.on_load_setter(function () {
		frycAPI.set_default_date(`span.popup_date`, {
			get_date: elem => Number(elem.getAttribute("data-time")) * 1000,
		});
	});
} else if (frycAPI_host("www.gnu.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			--darkreader-inline-bgimage: none !important;
			background-image: none !important;
		}
	`);
} else if (frycAPI_host("pacjent.gov.pl")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
	`);

	let recepty = null;

	const original_open = XMLHttpRequest.prototype.open;
	const original_send = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
		this._url = url;
		return original_open.call(this, method, url, ...rest);
	};
	XMLHttpRequest.prototype.send = function (...args) {
		this.addEventListener("load", () => {
			if (this._url === "ikp/recepty/wyszukaj") {
				const resp_json = this.responseText.jsón;
				if (resp_json.lista?.length) {
					// loguj(resp_json.lista);
					recepty = resp_json.lista;
				}
			}
		});
		return original_send.apply(this, args);
	};

	// frycAPI.on_load_setter(function () {
	// });

	if (frycAPI.path.startsWith("/ikp/recepty/moje-recepty")) {
		function get_tabela_recept_manual() {
			const rec_arr = [];
			frycAPI.for_each(`cez-list-tile`, da_elem => {
				const recepta = rec_arr.frycAPI_push_elem({});
				recepta.data_wystawienia = da_elem.querySelector(`h4`).textContent.trim();
				recepta.lekarz = da_elem.querySelector(`ikp-recepta-kafelek > div > div > div:nth-child(3)`).textContent.trim();
				recepta.placówka = da_elem.querySelector(`ikp-recepta-kafelek > div > div > div:nth-child(4)`).textContent.trim();
				recepta.kod = da_elem.querySelector(`.cez-h1--medium`).textContent.trim();
				recepta.leki = da_elem.querySelectorAll(`.recepta-kafelek__lista-lekow > ol > li`).map(el => ({ nazwa: el.querySelector(`:scope > div > span`).textContent.trim(), status: el.querySelector(`:scope > div > div`).textContent.trim() }));
			});
			return rec_arr;
		}
		function get_tabela_recept(man_func) {
			if (!recepty) {
				man_func.set_display_name("Recepty są niedostąpne");
				throw new Error("Recepty są niedostąpne");
			}
			return recepty.map(recepta => ({
				data_wystawienia: recepta.dataWystawienia.slice(0, 10),
				lekarz          : recepta.pracownikMedycznyWystawcy,
				placówka        : recepta.podmiotWystawcy,
				kod             : recepta.kodPakietu,
				leki            : recepta.recepty.map(el => ({ nazwa: el.nazwaLeku, status: el.status })),
			}));
		}
		frycAPI.create_manual_functions("Pobieranie recept", {
			func_arr: [
				(name = "Pobierz tabelę recept jako JSON", type = frycAPI_Normal) => {
					const f = new type({ name });
					f.callback = function (obj) {
						frycAPI.download_txt(get_tabela_recept(f).jsón, "Tabela recept.json");
						f.name = "Recepty pobrane";
					};
					return f;
				},
				(name = "Pobierz tabelę recept jako CSV", type = frycAPI_Normal) => {
					const f = new type({ name });
					f.callback = function (obj) {
						const rec_arr = [["data_wystawienia", "leki", "lekarz", "placówka", "kod"]];
						for (const { data_wystawienia, leki, lekarz, placówka, kod } of get_tabela_recept(f)) {
							rec_arr.push([data_wystawienia, leki.map(lek => `${lek.nazwa} - ${lek.status}`).join("; "), lekarz, placówka, kod]);
						}
						frycAPI.download_txt(frycAPI.print_table(rec_arr, "\t", false), "Tabela recept.csv");
						f.name = "Recepty pobrane";
					};
					return f;
				},
			],
		});
	}
} else if (frycAPI_host("nano-editor.org")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		body {
			margin: auto;
			box-sizing: border-box;
			max-width: 1000px;
			padding: 0 10px;
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (frycAPI_host("publishmarkdown.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		.max-w-7xl {
			max-width: 90rem;
		}
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		.markdown-content {
			filter: brightness(1);

			*:not(pre) > code {
				font-family: "Source Code Fryc", monospace;
				font-size: 13;
				background-color: hsl(200 4% 16% / 1);
				border: 1px solid hsl(0 0% 29% / 1);
				--darkreader-border-4a4a4a: hsl(33 0% 29% / 1) !important;
			}

			hr {
				height: 3px;
				background-color: rgb(165 165 165);
			}
		}
	`);
} else if (frycAPI_host("mtg.wiki")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		html, body, * {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		body {
			width: 1000px !important;
			max-width: 100% !important;
			margin: auto !important;
		}
		.mw-body, #mw-head-base, #left-navigation, #mw-data-after-content, .mw-footer {
			margin-left: 0;
		}
	`);
} else if (frycAPI_host("www.hplovecraft.com")) {
	frycAPI.line = frycAPI.get_line_number();
	frycAPI.inject_style_on_load(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
			font-size: 16px;
		}
		body {
		}
		[size="-2"] { &, & *{ font-size: 14px !important; }}
		[size="-1"] { &, & *{ font-size: 15px !important; }}
		[size="0"]  { &, & *{ font-size: 16px !important; }}
		[size="+1"] { &, & *{ font-size: 17px !important; }}
		[size="+2"] { &, & *{ font-size: 18px !important; }}
	`);
}
// Code-Lens-Action insert-snippet IF template

// #region //* IFs 11
// #endregion
// #endregion
// #region //* Global functions end
// #region //* color scheme only light
if (frycAPI.color_scheme_dark) {
	document.getElementById("frycAPI-color-scheme-only-light")?.remove();
} else {
	frycAPI.create_mut_obs(() => {
		if (document.head) {
			if (document.head.querySelector('meta[name="color-scheme"]:is([content="dark"],[content="dark light"],[content="light dark"])') === null) {
				document.head.insertAdjacentElement("afterBegin", frycAPI.elem("meta", 0).frycAPI_set_attribute_bulk(
					"name", "color-scheme",
					"content", "only light",
					"id", "frycAPI-color-scheme-only-light"
				));
			}
			return true;
		}
	}, { elem: document.documentElement, options: { childList: true, subtree: false } });
}
// #endregion
// #region //* Esc to scroll to top
document.addEventListener("keydown", e => { if (e.key === "Escape") scrollTo(0, 0); });
// #endregion
// #region //*
// #endregion
// #endregion

// #region //* End
if ((frycAPI.style_str = frycAPI.style_str.trim()).length) { // Adding style from the active IF block
	frycAPI.create_mut_obs(() => {
		if (frycAPI.style_opts.wait_for_elem ? frycAPI.style_opts.wait_for_elem() : document.body) { // because frycAPI.style_opts.wait_for_elem?.() ?? document.body is not exactly what we want
			const state = frycAPI.style_opts.state;
			frycAPI.my_style_state = frycAPI.inject_style(frycAPI.style_str, {
				id: "frycAPI_myStyle",
				elevated: frycAPI.style_opts.elevated,
				allFrames: frycAPI.style_opts.allFrames,
				elem: frycAPI.style_opts.elem,
				state: state,
			});
			if (state === false) frycAPI.my_style_manual_func.set_state(0);
			frycAPI.get_storage("style")?.then(saved_state => {
				if (saved_state === undefined) return;
				frycAPI.my_style_manual_func.set_state(saved_state);
				if (saved_state !== frycAPI.my_style_state.state) frycAPI.my_style_state.toggle();
			});

			return frycAPI.style_opts.inject_end_condition ? frycAPI.style_opts.inject_end_condition() : true;
		}
	}, { elem: document.documentElement });
} else {
	frycAPI.my_style_manual_func.off();
}

let frycAPI_load_source;
if (frycAPI.script.getAttribute("src").includes("chrome-extension")) {
	frycAPI_load_source = "chrome-extension";
} else {
	frycAPI_load_source = "cdn.jsdelivr.net";
}

// frycAPI.send_event_to_background("test");

const frycAPI_t2 = performance.now(); loguj(`frycAPI loaded in ${(frycAPI_t2 - frycAPI_t1).toFixed(1)} ms! (from ${frycAPI_load_source})`);
document.currentScript.remove();
// #endregion
