// #region //* Początek
/* 0 eslint no-implicit-globals: ["warn", {"lexicalBindings": true}] */
/// <reference path="frycAPI-expandPrototype.js"/>
"use strict";
const frycAPI_t1 = performance.now();

class frycAPI_ManualFunc extends Object {
	callBack; funcGroup; num; prevFunc; nextFunc; style; name; Off; displayName; nameClickable;
	constructor(obj) {
		super();
		this.name = obj.name;
		this.style = obj.style;
		this.displayName = obj.displayName ?? false;
		this.nameClickable = obj.nameClickable ?? false;
		this.Off = obj.Off ?? false;
	}
	setDisplayName(newName) {
		if (frycAPI.isString(newName)) { // eslint-disable-line no-use-before-define
			this.name = newName;
			this.displayName = true;
		} else if (frycAPI.isBool(newName)) { // eslint-disable-line no-use-before-define
			this.displayName = newName;
		}
	}
	on() {
		this.Off = false;
	}
	off() {
		this.Off = true;
	}
	toggle() {
		this.Off = !this.Off;
	}
	static types = {
		NORMAL  : "NORMAL",
		STATE   : "STATE",
		RADIO   : "RADIO",
		CHECKBOX: "CHECKBOX",
		COMBO   : "COMBO",
		INPUT   : "INPUT",
	};
}
class frycAPI_Normal extends frycAPI_ManualFunc {
	type = frycAPI_ManualFunc.types.NORMAL;
	constructor(obj) {
		super(obj);
	}
}
class frycAPI_State extends frycAPI_ManualFunc {
	stateDesc; numStates; state;
	prevState; // Previous in time
	constructor(obj) {
		super(obj);
		this.__setStateDescBase(obj.stateDesc);
		this.setState(obj.state ?? 1);
		this.prevState = this.state;
	}
	setState(newState) {
		newState = Number(newState);
		return (this.state = (newState < 0 ? newState + this.numStates : newState) % this.numStates);
	}
	nextState(jump = 1) {
		return this.setState(this.state + jump);
	}
	setPrevState(jump = 1) { // Previous on the list
		return this.setState(this.state - jump);
	}
	/* There was an attempt
	#state = 0;
	set state(newState) {
		this.#state = newState % this.numStates;
	}
	get state() {
		return this.#state;
	}
	nextState(jump = 1) {
		this.state += jump;
		return this.state;
	}
	*/
	__setStateDescBase(desc) { // Underscores necessary to indicate that this is a protected method, not intended to be used outside class definition
		this.stateDesc = desc?.length?.frycAPI_ge(2) ? desc : [this.name + ": off", this.name + ": on"];
		this.numStates = this.stateDesc.length;
	}
}
class frycAPI_PureState extends frycAPI_State {
	type = frycAPI_ManualFunc.types.STATE;
	setStateDesc = frycAPI.functionsForClasses.setStateDesc; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
	}
	fixGeneralState(obj) {
		this.prevState = this.state;
		if (obj.type === "name") {
			this.setPrevState();
		} else if (obj.type === "elem") {
			this.nextState();
		}
	}
}
class frycAPI_Radio extends frycAPI_State {
	type = frycAPI_ManualFunc.types.RADIO;
	numCols; numRows;
	stateChanged = false;
	setNumCols = frycAPI.functionsForClasses.setNumCols; // eslint-disable-line no-use-before-define
	setNumRows = frycAPI.functionsForClasses.setNumRows; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
		obj.state ?? this.resetState();
		this.setNumCols(obj.numCols);
		this.setNumRows(obj.numRows ?? 1);
	}
	resetState() {
		this.state = null;
		this.prevState = null;
	}
	fixGeneralState(obj) {
		this.prevState = this.state;
		if (obj.type === "name") {
			this.state = null;
		} else if (obj.type === "elem") {
			this.setState(obj.state);
		}
		this.stateChanged = this.prevState !== this.state;
	}
	setStateDesc(desc) {
		this.__setStateDescBase(desc);
		if (this.state >= this.numStates) {
			this.resetState();
		}
	}
}
class frycAPI_Combo extends frycAPI_State {
	type = frycAPI_ManualFunc.types.COMBO;
	stateChanged = false;
	setStateDesc = frycAPI.functionsForClasses.setStateDesc; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
	}
	// fixGeneralState = frycAPI.functionsForClasses.fixGeneralStateRadioCombo; // eslint-disable-line no-use-before-define
	fixGeneralState(obj) {
		this.prevState = this.state;
		if (obj.type === "name") {
			this.state = 0;
		} else if (obj.type === "elem") {
			this.setState(obj.state);
		}
		this.stateChanged = this.prevState !== this.state;
	}
}
class frycAPI_Checkbox extends frycAPI_ManualFunc {
	type = frycAPI_ManualFunc.types.CHECKBOX;
	stateDesc; numStates; state; prevState; numCols; numRows;
	prevIndex = 0;
	currIndex = 0;
	setNumCols = frycAPI.functionsForClasses.setNumCols; // eslint-disable-line no-use-before-define
	setNumRows = frycAPI.functionsForClasses.setNumRows; // eslint-disable-line no-use-before-define
	constructor(obj) {
		super(obj);
		this.#setStateDescBase(obj.stateDesc);
		this.state = obj.state !== undefined ? structuredClone(obj.state) : this.stateDesc.map(e => false);
		this.prevState = structuredClone(this.state);
		if (obj.state !== undefined) this.replaceState(obj.state);
		this.setNumCols(obj.numCols);
		this.setNumRows(obj.numRows ?? 1);
	}
	setState(pos, newState) {
		return (this.state[pos] = Boolean(newState));
	}
	replaceState(newState) {
		const min = Math.min(this.numStates, newState.length);
		for (let i = 0; i < min; i++) {
			this.state[i] = Boolean(newState[i]);
		}
		return this.state;
	}
	#setStateDescBase(desc) {
		this.stateDesc = desc?.length ? desc : [this.name + " 1", this.name + " 2"];
		this.numStates = this.stateDesc.length;
	}
	setStateDesc(desc) {
		this.#setStateDescBase(desc);
		this.prevState = structuredClone(this.state);
		this.state.length = this.numStates;
		this.replaceState(this.state);
	}
	fixGeneralState(obj) {
		// this.setState(obj.index, !this.state[obj.index]);
		this.prevIndex = this.currIndex;
		this.prevState = structuredClone(this.state);
		if (obj.type === "name") {
			this.replaceState(this.state.map(e => false));
		} else if (obj.type === "elem" && obj.index !== undefined) {
			this.state[obj.index] = !this.state[obj.index];
			this.currIndex = obj.index;
		}
	}
}
class frycAPI_Input extends frycAPI_ManualFunc {
	type = frycAPI_ManualFunc.types.INPUT;
	state = "";
	prevState = "";
	stateChanged = false;
	constructor(obj) {
		super(obj);
		// this.inputType = obj.inputType ?? frycAPI_Input.inputTypes.DIV;
		this.attributes = obj.attributes;
	}
	fixGeneralState(obj) {
		this.prevState = this.state;
		if (obj.type === "name") {
			this.state = "";
		} else if (obj.type === "elem") {
			this.state = obj.state;
		}
		this.stateChanged = this.prevState !== this.state;
	}
	// static inputTypes = {
	// 	DIV: "div",
	// 	INPUT: "input",
	// };
}
class frycAPI_FuncGroup extends Object {
	name; funcArr; num; style;
	constructor(name, obj) {
		super();
		this.name = name;
		this.style = obj.style;
		this.funcArr = obj.funcArr;
		this.funcArr = this.funcArr.map(funcFunc => funcFunc());
		this.funcArr.forEach((funcObj, funcNum) => {
			funcObj.funcGroup = this;
			funcObj.num = funcNum;
			funcObj.prevFunc = this.funcArr[funcNum - 1];
			funcObj.nextFunc = this.funcArr[funcNum + 1];
		});
	}
}
class frycAPI_StyleState extends Object {
	id; state; styleElem; on; off; toggle; eventObj;
	constructor(obj) {
		super();
		const me = this;
		me.state = Boolean(obj.state ?? true);
		me.id = obj.id;

		if (obj.elevated === true) {
			me.eventObj = { style: obj.style, allFrames: obj.allFrames };
			me.on = async function () {
				if (me.state !== true) {
					await frycAPI.sendEventToBackground("injectStyle", me.eventObj); // eslint-disable-line no-use-before-define
					me.state = true; // eslint-disable-line require-atomic-updates
				}
			};
			me.off = async function () {
				if (me.state !== false) {
					await frycAPI.sendEventToBackground("removeStyle", me.eventObj); // eslint-disable-line no-use-before-define
					me.state = false; // eslint-disable-line require-atomic-updates
				}
			};
			me.toggle = async function () {
				if (me.state !== true) {
					await frycAPI.sendEventToBackground("injectStyle", me.eventObj); // eslint-disable-line no-use-before-define
					me.state = true; // eslint-disable-line require-atomic-updates
				} else {
					await frycAPI.sendEventToBackground("removeStyle", me.eventObj); // eslint-disable-line no-use-before-define
					me.state = false; // eslint-disable-line require-atomic-updates
				}
			};
		} else {
			me.styleElem = obj.styleElem;
			me.on = function () {
				if (me.state !== true) {
					me.styleElem.disabled = false;
					me.handleDarkreader();
					me.state = true;
				}
			};
			me.off = function () {
				if (me.state !== false) {
					me.styleElem.disabled = true;
					me.handleDarkreader();
					me.state = false;
				}
			};
			me.toggle = function () {
				if (me.state !== true) {
					me.styleElem.disabled = false;
					me.handleDarkreader();
					me.state = true;
				} else {
					me.styleElem.disabled = true;
					me.handleDarkreader();
					me.state = false;
				}
			};
		}
	}
	handleDarkreader() {
		if (document.documentElement.hasAttribute("data-darkreader-mode")) {
			let elem = this.styleElem.nextElementSibling;
			if (elem !== null && elem.tagName === "STYLE" && elem.frycAPI_hasClass("darkreader")) {
				elem.disabled = this.styleElem.disabled;
			} else {
				elem = this.styleElem.parentElement.querySelector(`#${this.id} ~ style.darkreader`);
				if (elem !== null) elem.disabled = this.styleElem.disabled;
			}
		}
	}
}
class frycAPI_Elem extends Object {
	elem;
	constructor(elemType) {
		super();
		this.elem = document.createElement(elemType);
	}
	get _() {
		return this.elem;
	}
	text(str) {
		this.elem.innerText = str;
		return this;
	}
	HTML(str) {
		this.elem.innerHTML = frycAPI.createHTML(str); // eslint-disable-line no-use-before-define
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
var frycAPI = { // eslint-disable-line object-shorthand, no-var
	// #region //* Zmienne 1
	// #region //* Deklaracje
	second: null,
	minute: null,
	hour: null,
	day: null,
	month: null,
	year: null,
	week: null,
	dateFormatter: null,
	dateFormatterForFileName: null,
	dateOptsNoTime: null,
	myStyleState: null,
	myStyleManualFunc: null,
	styleStr: "",
	styleOpts: {},
	// #endregion
	id: document.currentScript.getAttribute("script-id"),
	funcGroupArr: [],
	colorSchemeDark: false,
	czasNumer: 1,
	// frycAPI.urlParam: new URL(window.location.href).searchParams.getAll("frycAPI_URL_Parameter").pop(),
	injectStyleNormalNum: 0,
	simpleFontChange: `* { font-family: "IBM Plex Sans Condensed", sans-serif; }`, // ${frycAPI.simpleFontChange}
	functionsForClasses: {
		setNumCols(numCols) {
			if (numCols !== undefined && numCols >= 1) {
				this.numCols = numCols;
				this.numRows = undefined;
			}
		},
		setNumRows(numRows) {
			if (numRows !== undefined && numRows >= 1) {
				this.numRows = numRows;
				this.numCols = undefined;
			}
		},
		setStateDesc(desc) {
			this.__setStateDescBase(desc);
			if (this.state >= this.numStates) {
				this.setState(0);
			}
		},
		// fixGeneralStateRadioCombo(obj) { // There was an attempt but the methods though similar unfortunately are different
		// },
	},
	script: document.currentScript,
	createMutObsLicznik: 0,
	path: window.location.pathname,
	onLoadArr: [[], [], []],
	UUID: null,
	mimeTypes: null,
	// #region //* Zmienne 2
	// #endregion
	// #endregion

	// #region //* Funkcje 1
	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms)); // eslint-disable-line no-promise-executor-return
	}, // await frycAPI.sleep(1);
	injectStyleOnLoad(style, opts = {}) { // Injects style to the page at the moment when body element is created
		frycAPI.styleStr += style.trim() + "\n";
		frycAPI.styleOpts = opts;
	},
	injectStyle(style, opts = {}) { // Injects style to the page
		if ((style = style.trim()).length) {
			opts.id ??= "frycAPI_styleNormal" + (++frycAPI.injectStyleNormalNum);
			opts.elevated ??= false;
			opts.state ??= true;
			opts.allFrames ??= false;
			const css = frycAPI.minifyCSS(style); // .frycAPI_log
			let styleElem;

			if (opts.elevated && opts.state) {
				// This option is able to workaround this error: Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self'"
				frycAPI.sendEventToBackground("injectStyle", { style: css, allFrames: opts.allFrames });
			} else {
				styleElem = frycAPI.elem("style").attr("id", opts.id)._;
				styleElem.textContent = css;
				if (opts.elem instanceof Node) {
					opts.elem.appendChild(styleElem);
				} else {
					document.documentElement.appendChild(styleElem);
				}
				if (!opts.state) styleElem.disabled = true; // For some reason setting disabled to true disables the style only when it is in the DOM, so we have to set it AFTER we instert it
			}

			return new frycAPI_StyleState({
				id: opts.id,
				styleElem: styleElem,
				state: opts.state,
				elevated: opts.elevated,
				style: css,
				allFrames: opts.allFrames,
			});
		}
	}, // frycAPI.injectStyle(/*css*/``, { id: "frycAPI_styleNormal", elem: document.documentElement, elevated: false, state: true, allFrames: false });
	minifyCSS(style) {
		return frycAPI.removeCommentsSimple(frycAPI.minifyCodeSimple(style));
	},
	minifyCodeSimple(code) {
		return code.replaceAll(/^\s+|[\t\f ]+$/gmu, ""); // /(^\s+|$\s+)/gm
	}, // frycAPI.minifyCodeSimple(code);
	removeCommentsSimple(code) {
		return code.replaceAll(/\n?\/\*.*?\*\//gs, "");
	}, // frycAPI.removeCommentsSimple(code);
	createManualFunctions(name, obj) {
		const fGroup = new frycAPI_FuncGroup(name, obj);
		fGroup.num = frycAPI.funcGroupArr.push(fGroup) - 1;
		// if (typeof nameOrObj === "string") {
		// 	if (funcArr.length) {
		// 		frycAPI.funcGroupArr.push(new frycAPI_FuncGroup(nameOrObj, funcArr));
		// 	}
		// } else {
		// 	if (nameOrObj.funcArr !== undefined && nameOrObj.funcArr.length) { // eslint-disable-line no-lonely-if
		// 		frycAPI.funcGroupArr.push(new frycAPI_FuncGroup(nameOrObj));
		// 	}
		// }
	},
	handleManualFunction(daObj) {
		const func = frycAPI.funcGroupArr[daObj.groupNumber].funcArr[daObj.funcNumber];
		func.fixGeneralState?.(daObj.obj);
		func.callBack(daObj.obj);
		return frycAPI;
	},
	ctrlC(text) {
		const textArea = document.createElement("textarea");
		textArea.value = text;

		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			const successful = document.execCommand("copy");
			const msg = successful ? "✅" : "❌";
			console.log("Copy was " + msg);
		} catch (err) {
			console.error("Oops, unable to copy", err);
		}
		document.body.removeChild(textArea);
	},
	copyTxt(txt) {
		navigator.clipboard.writeText(txt);
	},
	zaokrl(val, decimals) {
		return Number(Math.round(Number(val.toFixed(decimals) + "e+" + decimals)) + "e-" + decimals);
	},
	clean(node = document.body) { // To delete comment nodes
		const childNodes = node.childNodes;
		for (let n = childNodes.length - 1; n >= 0; n--) {
			const child = childNodes[n];
			if (child.nodeType === 8) {
				node.removeChild(child);
			} else if (child.nodeType === 1) {
				frycAPI.clean(child);
			}
		}
	}, // frycAPI.clean();
	makeTableSortable(tabElem, trSel = "tr:not(:first-child)", tdSel = "td", thSel = "th") { // Pass reference to the table element
		if (tabElem === null) return;
		const sortHelp0 = (a1, b1, kierunek) => ((a1 < b1) ? -1 : ((a1 > b1) ? 1 : 0)) * kierunek;
		const sortObj = {
			deafult      : (a, obj) =>        a.querySelector(`${tdSel}:nth-child(${obj.myIndex})`).innerText,
			ignoreCase   : (a, obj) =>        a.querySelector(`${tdSel}:nth-child(${obj.myIndex})`).innerText.toUpperCase(),
			numeric      : (a, obj) => Number(a.querySelector(`${tdSel}:nth-child(${obj.myIndex})`).innerText),
			attrib       : (a, obj) =>        a.querySelector(`${tdSel}:nth-child(${obj.myIndex})`).getAttribute(obj.attrib),
			attribNumeric: (a, obj) => Number(a.querySelector(`${tdSel}:nth-child(${obj.myIndex})`).getAttribute(obj.attrib)),
		};
		const sortHelp = function (objFun, obj) {
			return (a, b) => sortHelp0(objFun(a, obj), objFun(b, obj), obj.kierunek);
		};
		const sortFun = function (rosnąco) {
			const th = this;
			const kier = typeof rosnąco === "boolean" ? !rosnąco : th.classList.contains("posortowana");
			const tbody = tabElem.querySelector("tbody") ?? tabElem;
			Array.prototype.slice.call(tabElem.querySelectorAll(`${trSel}`), 0).sort(sortHelp(sortObj[th.getAttribute("krytSort") || "deafult"], {
				attrib: th.getAttribute("attribSort"),
				myIndex: th.getAttribute("index"), // :scope>tr
				kierunek: kier ? -1 : 1,
			})).forEach(function (daElem, daI, daArr) {
				tbody.appendChild(daElem);
			});
			tabElem.querySelector(".posortowana")?.classList.remove("posortowana");
			tabElem.querySelector(".anawotrosop")?.classList.remove("anawotrosop");
			if (kier) {
				th.classList.add("anawotrosop");
			} else {
				th.classList.add("posortowana");
			}
		};
		tabElem.classList.add("sortowalnaTabela");
		frycAPI.injectStyle(/*css*/`
			.sortowalnaTabela {
				& ${thSel} {
					cursor: pointer;
					&:hover {
						background-color: hsla(0, 0%, 20%, 50%);
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
		`);
		tabElem.querySelectorAll(thSel).forEach(function (daElem, daI, daArr) {
			daElem.setAttribute("index", daI + 1);
			daElem.addEventListener("click", sortFun);
			daElem.sortFun = sortFun;
		});
	}, // frycAPI.makeTableSortable(document.querySelector(`table`));
	zmierzCzas(callBack) {
		const t0 = performance.now();
		callBack();
		const t1 = performance.now();
		loguj(`Czas ${frycAPI.czasNumer}: ${frycAPI.zaokrl(t1 - t0, 2)} ms`);
		frycAPI.czasNumer++;
	},
	onLoadSetter(callBack, when = 1) { // 0 = document DOMContentLoaded, 1 = window DOMContentLoaded, 2 = window load
		if (frycAPI.onLoadArr[when].push(callBack) === 1) { // new length === 1 | This means that the first element was just added
			/* eslint-disable */
			switch (when) {
				case 0: return document.addEventListener("DOMContentLoaded", () => frycAPI.onLoadArr[when].frycAPI_run());
				case 1: return window  .addEventListener("DOMContentLoaded", () => frycAPI.onLoadArr[when].frycAPI_run());
				case 2: return window  .addEventListener("load",             () => frycAPI.onLoadArr[when].frycAPI_run());
			}
			/* eslint-enable */
		}
	},
	forEach(selector, callback) {
		const list = document.querySelectorAll(selector);
		list.forEach(callback);
		return list;
	},
	sortElements(parent, elems, sortCallback) {
		const elemArr = Array.from(elems);
		elemArr.sort((a, b) => {
			const a1 = sortCallback(a);
			const b1 = sortCallback(b);
			return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
		});
		elemArr.forEach(function (daElem) {
			parent.appendChild(daElem);
		});
	},
	randDouble(min, max) {
		return Math.random() * (max - min) + min;
	},
	randInt(min, max) {
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
	// #region //* Funkcje 2
	getWorkerURL(myWorkerFun = () => {}) {
		const str = myWorkerFun.toString();
		return URL.createObjectURL(new Blob([str.substring(
			str.indexOf("{") + 1,
			str.lastIndexOf("}")
		)]));
	}, // let myWorker = new Worker(frycAPI.getWorkerURL(myWorkerFun));
	removeLast(str, N) {
		return str.slice(0, -N);
	}, // str = frycAPI.removeLast(str, N);
	printRelTime(epoch_ms, obj = {}) {
		const czyDiff   = obj.czyDiff   ?? true;
		const lang      = obj.lang      ?? "ang";
		const compact   = obj.compact   ?? 0;
		const space     = (obj.space    ?? true) ? " " : "";
		const ago       = obj.ago       ?? true;
		const leftAlign = obj.leftAlign ?? false;
		const prec      = obj.prec      ?? undefined;

		let czas = (czyDiff ? (Date.now() - epoch_ms) : epoch_ms);
		const znak = Math.sign(czas) === -1 ? "-" : "";
		czas = Math.abs(czas);
		let czytCzas, timeNames, agoStr;
		/* eslint-disable */
		if (lang === "pol") {
			agoStr = " temu";
			if (compact === 2) { timeNames = ["s"     , "m"    , "g"     , "d"  , "M"       , "l"  ]; } else
			if (compact === 1) { timeNames = ["sek"   , "min"  , "godz"  , "dni", "mies"    , "lat"]; } else
			if (compact === 0) { timeNames = ["sekund", "minut", "godzin", "dni", "miesięcy", "lat"]; }
		} else if (lang === "ang") {
			agoStr = " ago";
			if (compact === 2) { timeNames = ["s"      , "m"      , "h"    , "d"   , "M"     , "y"    ]; } else
			if (compact === 1) { timeNames = ["sec"    , "min"    , "hour" , "days", "mon"   , "year" ]; } else
			if (compact === 0) { timeNames = ["seconds", "minutes", "hours", "days", "months", "years"]; }
		} else {
			throw new Error("Language not supported");
		}
		if (leftAlign) {
			const maxLen = timeNames.reduce((max, elem) => (max < elem.length ? elem.length : max), 0);
			timeNames = timeNames.map(elem => elem.padEnd(maxLen));
		}
		if (czas < frycAPI.minute) { czytCzas =                                                                               (czas / frycAPI.second).toFixed(prec ?? 0 ) + space + timeNames[0] } else
		if (czas < frycAPI.hour  ) { czytCzas = (czas <= frycAPI.minute * 9.95 ? (czas / frycAPI.minute).toFixed(prec ?? 1) : (czas / frycAPI.minute).toFixed(prec ?? 0)) + space + timeNames[1] } else
		if (czas < frycAPI.day   ) { czytCzas = (czas <= frycAPI.hour   * 9.95 ? (czas / frycAPI.hour  ).toFixed(prec ?? 1) : (czas / frycAPI.hour  ).toFixed(prec ?? 0)) + space + timeNames[2] } else
		if (czas < frycAPI.month ) { czytCzas = (czas <= frycAPI.day    * 9.95 ? (czas / frycAPI.day   ).toFixed(prec ?? 1) : (czas / frycAPI.day   ).toFixed(prec ?? 0)) + space + timeNames[3] } else
		if (czas < frycAPI.year  ) { czytCzas = (czas <= frycAPI.month  * 9.95 ? (czas / frycAPI.month ).toFixed(prec ?? 1) : (czas / frycAPI.month ).toFixed(prec ?? 0)) + space + timeNames[4] } else
											{ czytCzas = (czas <= frycAPI.year   * 9.95 ? (czas / frycAPI.year  ).toFixed(prec ?? 1) : (czas / frycAPI.year  ).toFixed(prec ?? 0)) + space + timeNames[5] }
		/* eslint-enable */
		return znak + czytCzas + (ago ? agoStr : "");
	}, // frycAPI.printRelTime(new Date);
	printDateIntl(time, dateFormatter) {
		return dateFormatter.format(time);
	}, // const str = frycAPI.printDateIntl(new Date, dtFrmter);
	dateLocales: "af",
	getDateFormatter(options = {}, locales) {
		const defaultUndef = options.hasOwnProperty("defaultUndef");
		return Intl.DateTimeFormat(locales ?? frycAPI.dateLocales, {
			/* eslint-disable */
			year  : options.hasOwnProperty("year"  ) ? options.year   : ( defaultUndef ? undefined : "numeric"),
			month : options.hasOwnProperty("month" ) ? options.month  : ( defaultUndef ? undefined : "2-digit"),
			day   : options.hasOwnProperty("day"   ) ? options.day    : ( defaultUndef ? undefined : "2-digit"),
			hour  : options.hasOwnProperty("hour"  ) ? options.hour   : ( defaultUndef ? undefined : "2-digit"),
			minute: options.hasOwnProperty("minute") ? options.minute : ( defaultUndef ? undefined : "2-digit"),
			second: options.hasOwnProperty("second") ? options.second : ( defaultUndef ? undefined : "2-digit"),
			/* eslint-enable */
		});
	}, // const dtFrmter = frycAPI.getDateFormatter({ year: "2-digit" });
	printDate(date = new Date(), dateFormatter) {
		return frycAPI.printDateIntl(date, dateFormatter ?? frycAPI.dateFormatter).replace(" ", ", ");
	}, // const str = frycAPI.printDate(new Date());
	printDateForFileName(date = new Date(), dateFormatter) {
		return frycAPI.printDateIntl(date, dateFormatter ?? frycAPI.dateFormatterForFileName).replaceAll(":", "꞉");
	}, // const filename = frycAPI.printDateForFileName(new Date());
	roughSizeOfObject(object) {
		// https://stackoverflow.com/a/11900218/12035658
		const objectList = [];
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
					if (!objectList.includes(value)) {
						objectList.push(value);
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
	downloadHelper(href, filename) {
		/* Old
		const a = document.createElement("a");
		a.href = href;
		a.target = "_blank";
		a.download = filename;
		a.style.display = "none";
		document.body.append(a);
		a.click();
		a.remove();
		*/
		const a = document.createElement("a");
		a.href = href;
		a.download = filename;
		a.click();
	},
	downloadTxt(text, filename) {
		// a.href = 'data:attachment/text;charset=utf-8,' + encodeURI(text);
		frycAPI.downloadHelper(URL.createObjectURL(new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" })), filename);
	}, // frycAPI.downloadTxt("Test", "Test.txt");
	async getMimeType(filename) {
		const pos = filename.lastIndexOf(".");
		if (pos === -1) return "text/plain"; // Dot not found
		const fileExt = filename.slice(pos + 1).toLowerCase(); // Extract after dot
		if (frycAPI.mimeTypes === null) {
			frycAPI.mimeTypes = {};
			const mime = await frycAPI.getResData("mime_types.txt");
			for (const line of mime.split("\n")) {
				const [ext, mimeType] = line.split(" ");
				frycAPI.mimeTypes[ext] = mimeType;
			}
		}
		return frycAPI.mimeTypes[fileExt] ?? "text/plain";
	}, // const mimeType = frycAPI.getMimeType("Test.txt");
	async downloadTxtBackground(text, filename) {
		return frycAPI.sendEventToBackground("downloadURL", { url: URL.createObjectURL(new Blob(["\ufeff" + text], { type: `${await frycAPI.getMimeType(filename)};charset=utf-8` })), filename: filename });
	}, // frycAPI.downloadTxtBackground("Test", "Test.txt");
	redownloadImg(img, filename) {
		frycAPI.downloadHelper(img.src, filename);
	},
	determineFileName(FR_Result, img, alt) {
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

			return "Unknown " + frycAPI.printDateForFileName(new Date());
		})();
		const ext = (() => {
			const imgForm = FR_Result.slice(5, FR_Result.indexOf(";")).replace("image/", "");
			if (alt) {
				if (imgForm === "jpeg") return ".png";
				if (imgForm === "png") return ".jpg";
				if (imgForm === "gif") return ".png";
				if (imgForm === "svg+xml") return ".png";
				return ".jpg";
			} else {
				if (imgForm === "jpeg") return ".jpg";
				if (imgForm === "png") return ".png";
				if (imgForm === "gif") return ".gif";
				if (imgForm === "svg+xml") return ".svg";
				return ".png";
			}
		})();

		return nazwa + ext;
	},
	downloadImgOld(img, filename, alt) {
		const httpRequest = new XMLHttpRequest();
		httpRequest.onload = function () {
			const fileReader = new FileReader();
			fileReader.onloadend = function () {
				frycAPI.downloadHelper(fileReader.result, filename === undefined ? frycAPI.determineFileName(fileReader.result, img, alt) : filename);
			};
			fileReader.readAsDataURL(httpRequest.response);
		};
		httpRequest.open("GET", img.src);
		httpRequest.responseType = "blob";
		httpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
		httpRequest.send();
	},
	downloadImg(img, filename, alt, urlParamBool) {
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
		const imgSrc = img.src;
		if (urlParamBool) img.src = "";
		return fetch(imgSrc)
		.then(resp => resp.blob())
		.then(frycAPI.blobToBase64)
		.then(dataUrl => frycAPI.downloadHelper(dataUrl, filename === undefined ? frycAPI.determineFileName(dataUrl, img, alt) : filename))
		.catch(err => { // eslint-disable-line handle-callback-err
			// console.warn(err);
			const url = new URL(imgSrc);
			url.searchParams.append("frycAPI_URL_Parameter", JSON.stringify({ alt }));
			frycAPI.downloadHelper(url.href, "");
		});
	},
	downloadImgRaw(img, filename) {
		const canvas = document.createElement("canvas");
		canvas.height = img.naturalHeight;
		canvas.width = img.naturalWidth;
		// img.setAttribute('crossorigin', 'anonymous');
		// img.crossOrigin = "anonymous";
		// img.setAttribute("origin", "anonymous");
		canvas.getContext("2d").drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

		frycAPI.downloadHelper(canvas.toDataURL(), filename);
	},
	// #endregion
	// #region //* Funkcje 3
	gDriveLinkToImgSrc(link) { // Converts Google drive open link to download link which is possible to be src of an img etc.
		// return `https://drive.usercontent.google.com/u/0/uc?id=${new URL(link).searchParams.get("id")}&export=download`; // Old
		// return `drive.google.com/thumbnail?sz=w1000&id=${new URL(link).searchParams.get("id")}`; // Old poprawione
		return frycAPI.gDriveIdToImgSrc(new URL(link).pathname.replace("/file/d/", "").replace("/view", ""));
	},
	gDriveIdToImgSrc(id, width = 1000) { // Converts Google drive image id to download link which is possible to be src of an img etc.
		return `drive.google.com/thumbnail?sz=w${width}&id=${id}`;
	},
	isValidDate(d) {
		return d instanceof Date && !isNaN(d);
	},
	isNotValidDate(d) {
		return !frycAPI.isValidDate(d);
	},
	changeFavicon(href) {
		document.head.querySelectorAll(`link[rel~="icon"]`).forEach(daElem => daElem.remove());
		return document.head.frycAPI_appendHTML(`<link rel="icon" href="${href}">`);
	}, // frycAPI.changeFavicon("href");
	changeFaviconRes(filename) {
		return frycAPI.changeFavicon(frycAPI.getResURL(filename));
	}, // frycAPI.changeFaviconRes("filename");
	getResURL(filename) {
		return `chrome-extension://${frycAPI.id}/resources/` + filename;
	}, // frycAPI.getResURL("")
	readFile(filename, fileType, redirect = false) {
		return fetch(redirect ? `/redirect?url=${encodeURIComponent(filename)}` : filename).then(resp => {
			if (resp.ok) {
				switch (
					fileType ?? (() => {
						try { return new URL(filename).pathname } // eslint-disable-line brace-style
						catch (err) { return filename }
					})().split(".").pop().toLowerCase()
				) {
					case "json":
						return resp.json();
					case "xml":
						return resp.text().then(frycAPI.parseXML);
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
	}, // await frycAPI.readFile("url_or_filename");
	getResData(filename, fileType) {
		return frycAPI.readFile(frycAPI.getResURL(filename), fileType);
	}, // await frycAPI.getResData("")
	parseXML(str) {
		const dom = new DOMParser().parseFromString(str, "text/xml");
		const parsererror = dom.querySelector(`html:scope > body > parsererror`);
		if (parsererror !== null) {
			throw new Error(parsererror.querySelector(`h3`).innerText.trim() + " " + parsererror.querySelector(`div`).innerText.trim());
		} else {
			return dom;
		}
	}, // await frycAPI.parseXML(someXMLStr)
	createMutObs(callBack, objOpts = {}) { // Mutation Observer
		const opts = objOpts.options ?? {};
		const options = {
			childList            : opts.childList             ?? true,
			subtree              : opts.subtree               ?? true,
			attributes           : opts.attributes            ?? false,
			attributeFilter      : opts.attributeFilter       ?? undefined,
			attributeOldValue    : opts.attributeOldValue     ?? false,
			characterData        : opts.characterData         ?? false,
			characterDataOldValue: opts.characterDataOldValue ?? false,
		};
		const elem          = objOpts.elem        ?? document.body;
		const runCallBack   = objOpts.runCallBack ?? true;
		const asyncCallBack = objOpts.async       ?? false;

		let mut;
		if (asyncCallBack) {
			mut = new MutationObserver(async (mutRecArr, mutObs) => {
				mutObs.disconnect();
				if (await callBack(mutRecArr, mutObs) !== true) mutObs.observe(elem, options);
			});
		} else {
			mut = new MutationObserver((mutRecArr, mutObs) => {
				mutObs.disconnect();
				if (callBack(mutRecArr, mutObs) !== true) mutObs.observe(elem, options);
			});
		}

		if (runCallBack) {
			if (asyncCallBack) {
				callBack([], mut).then(result => {
					if (result !== true) mut.observe(elem, options);
				});
			} else if (callBack([], mut) !== true) {
				mut.observe(elem, options);
			}
		} else {
			mut.observe(elem, options);
		}

		return mut;
	}, // frycAPI.createMutObs((mutRecArr, mutObs) => {}, { runCallBack: true, elem: document.body, options: { childList: true, subtree: true } });
	setDefaultDate(selector, options = {}) { // { getDate: 111, setDate: 111, dateTitle: 111 }
		// Flag usage on www.autohotkey.com
		const sel = document.querySelectorAll(`:is(${selector.trim()}):not(.lepszyCzasParent)`);
		if (sel.length) {
			const getDate = (() => {
				switch (options.getDate) {
					case "txt": return elem => elem.innerText;
					case "html": return elem => elem.innerHTML;
					case "content": return elem => elem.textContent;
					case "attr":
					case undefined: return elem => elem.getAttribute("datetime");
					default: return options.getDate;
				}
			})();
			const setDate = options.setDate ?? frycAPI.setDefaultDateText;
			const dateEnumMode = options.dateEnumMode;
			const dateEnumStyle = options.dateEnumStyle;
			const customStyle = options.customStyle ?? "";
			const dateOpts = options.dateOpts;
			sel.forEach(daElem => {
				const data = new Date(getDate(daElem));
				if (frycAPI.isValidDate(data)) {
					const lepszyCzas = setDate(daElem, data, dateOpts);
					daElem.classList.add("lepszyCzasParent");
					daElem.removeAttribute("title");
					dateEnumMode?.(lepszyCzas);
					dateEnumStyle?.(lepszyCzas);
					if (lepszyCzas.classList.contains("lepszyCzas")) {
						lepszyCzas.setAttribute("style", customStyle);
					} else {
						lepszyCzas.querySelector(`.lepszyCzas`)?.setAttribute("style", customStyle);
					}
				}
			});
			frycAPI.setDefaultDateStyle();
		}
		return frycAPI.setDefaultDateEnum;
	},
	setDefaultDateText(elem, data, dateOpts) {
		elem.frycAPI_setInnerHTML(frycAPI.getDefaultDateText(data, dateOpts));
		return elem.firstElementChild;
		/* Upgrade attempt
		// https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing?utm_source=devtools#avoid-forced-synchronous-layouts
		elem.textContent = "";
		const lepCzs = document.createElement("span");
		lepCzs.classList.add("lepszyCzas");
		lepCzs.appendChild(document.createElement("span").frycAPI_addClass("abs-czas")).innerText = frycAPI.printDate(data, dateOpts?.printDate);
		lepCzs.appendChild(document.createElement("span").frycAPI_addClass("myślnik-czas")).innerText = " - ";
		lepCzs.appendChild(document.createElement("span").frycAPI_addClass("rel-czas")).innerText = frycAPI.printRelTime(data, dateOpts?.printDate);
		elem.appendChild(lepCzs);
		return lepCzs;
		*/
	},
	appendDefaultDateText(elem, data, dateOpts) {
		return elem.frycAPI_appendHTML(frycAPI.getDefaultDateText(data, dateOpts));
	},
	insertDefaultDateText(elem, position, data, dateOpts) {
		return elem.frycAPI_insertHTML(position, frycAPI.getDefaultDateText(data, dateOpts));
	},
	getDefaultDateText(data, dateOpts = {}) {
		return frycAPI.getDefaultDateHTML(frycAPI.printDate(data, dateOpts.printDate), frycAPI.printRelTime(data, dateOpts.printRelTime));
	},
	getDefaultDateHTML(absCzas, relCzas) {
		return /*html*/`<span class="lepszyCzas"><span class="abs-czas">${absCzas}</span><span class="myślnik-czas"> - </span><span class="rel-czas">${relCzas}</span></span>`;
	},
	setDefaultDateStyle() {
		if (frycAPI.querySelOk(`#frycAPI_setDefaultDate`)) return frycAPI.setDefaultDateEnum;

		// #region //* Stringi
		const rel = `[lepszyCzas="relatywnyCzas"]`;
		const abs = `[lepszyCzas="absolutnyCzas"]`;
		const stylSpanNotOba = `
			/* cursor: none; */
			cursor: inherit;
			position: relative;
			> :where(.myślnik-czas) { display: none; }
		`;
		const tooltipReset = `
			background-color: inherit;
			color: inherit;
			border: 0;
			padding: 0;
		`;
		const chosenNotHover = `
			display: inline;
		`;
		const chosenHover = `
			visibility: hidden;
			position: unset;
			${tooltipReset}
		`;
		const notChosenNotHover = `
			display: none;
		`;
		const notChosenHover = `
			display: inline;
			visibility: visible;
			position: absolute;
			z-index: 999999;
			text-decoration: inherit;
			white-space: nowrap;
		`;
		const stylAbs = `
			&:where(:not(:hover)) > :where(.abs-czas) { ${chosenNotHover} }
			&:where(:hover      ) > :where(.abs-czas) { ${chosenHover} }
			&:where(:not(:hover)) > :where(.rel-czas) { ${notChosenNotHover} }
			&:where(:hover      ) > :where(.rel-czas) { ${notChosenHover} }
		`;
		const stylRel = `
			&:where(:not(:hover)) > :where(.abs-czas) { ${notChosenNotHover} }
			&:where(:hover      ) > :where(.abs-czas) { ${notChosenHover} }
			&:where(:not(:hover)) > :where(.rel-czas) { ${chosenNotHover} }
			&:where(:hover      ) > :where(.rel-czas) { ${chosenHover} }
		`;
		const stylOba = `
			display: inline;
			visibility: visible;
			position: unset;
			${tooltipReset}
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
		const float = `${reset}${tooltipReset}`;

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
		const tooltipModSel = `:where([lepszyCzasStyl^="toolTip"]:not([lepszyCzasStyl="toolTip-center"]))`;
		const tooltipModStyle = `visibility: visible;`;
		const floatModSel = `:where([lepszyCzasStyl^="float"], [lepszyCzasStyl="toolTip-center"])`;
		const floatModStyle = `visibility: hidden;`;
		const bigSpec = `[lepszyCzas]`.repeat(5);
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

		frycAPI.injectStyle(
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
			${bigSpec} {
				& :where(span.lepszyCzas) {
					overflow: visible;
					text-decoration: inherit;
					white-space: nowrap;
					--tool-tip-padd: 3px;
					--tt-x: 0px;
					--tt-y: 0px;
					--tool-tip-calc: calc(100% + var(--tool-tip-padd));
				}
				&:where(${abs}, ${rel}) :where(.lepszyCzas) { ${stylSpanNotOba} }
				&:where(${abs}) :where(.lepszyCzas)         { ${stylAbs} }
				&:where(${rel}) :where(.lepszyCzas)         { ${stylRel} }

				&:where(${abs}) {${frycAPI.arrayToTemplate(arr, temₚ` &:where(${0}) ${r} {${1}}`)} }
				&:where(${rel}) {${frycAPI.arrayToTemplate(arr, temₚ` &:where(${0}) ${a} {${1}}`)} }
				&:where(${abs}) { &${tooltipModSel} ${a} {${tooltipModStyle}} }
				&:where(${rel}) { &${tooltipModSel} ${r} {${tooltipModStyle}} }

				&:where([lepszyCzas="oba"]) :where(.lepszyCzas) > :where(.abs-czas, .rel-czas, .myślnik-czas) { ${stylOba} }

				& {${frycAPI.arrayToTemplate(arr, temₚ` &:where(${0}) :where(${abs})${r} {${1}}`)} }
				& {${frycAPI.arrayToTemplate(arr, temₚ` &:where(${0}) :where(${rel})${a} {${1}}`)} }

				&:where(${abs}) {${frycAPI.arrayToTemplate(arr, temₚ` :where(${0})${r} {${1}}`)} }
				&:where(${rel}) {${frycAPI.arrayToTemplate(arr, temₚ` :where(${0})${a} {${1}}`)} }
				&:where(${abs}) { ${floatModSel}${a} {${floatModStyle}} }
				&:where(${rel}) { ${floatModSel}${r} {${floatModStyle}} }

				& :where(:is(${abs}, ${rel}).lepszyCzas) { ${stylSpanNotOba} }
				& :where(${abs}.lepszyCzas)              { ${stylAbs} }
				& :where(${rel}.lepszyCzas)              { ${stylRel} }

				& { &${tooltipModSel} :where(${abs})${a} {${tooltipModStyle}} }
				& { &${tooltipModSel} :where(${rel})${r} {${tooltipModStyle}} }
				& :where(${abs}) { &${floatModSel}${a} {${floatModStyle}} }
				& :where(${rel}) { &${floatModSel}${r} {${floatModStyle}} }
				&:where(${abs}) { ${tooltipModSel}${a} {${tooltipModStyle}} }
				&:where(${rel}) { ${tooltipModSel}${r} {${tooltipModStyle}} }

				& :where(${abs}) {${frycAPI.arrayToTemplate(arr, temₚ` &:where(${0})${r} {${1}}`)} }
				& :where(${rel}) {${frycAPI.arrayToTemplate(arr, temₚ` &:where(${0})${a} {${1}}`)} }
				& :where(${abs}) { &${tooltipModSel}${a} {${tooltipModStyle}} }
				& :where(${rel}) { &${tooltipModSel}${r} {${tooltipModStyle}} }

				& :where(.lepszyCzas[lepszyCzas="oba"]) > :where(.abs-czas, .rel-czas, .myślnik-czas) { ${stylOba} }
			}
		`.replaceAll(/  +/g, " "), { id: "frycAPI_setDefaultDate" });

		frycAPI.setDefaultDateEnum.mode.oba().floatCenter();
		return frycAPI.setDefaultDateEnum;
	}, // frycAPI.setDefaultDateStyle();
	setDefaultDateEnum: {
		/* eslint-disable */
		mode: {
			relatywnyCzas(elem, setStorage) { return frycAPI.setDefaultDateEnumFunc1(elem, "relatywnyCzas", 0, setStorage) },
			absolutnyCzas(elem, setStorage) { return frycAPI.setDefaultDateEnumFunc1(elem, "absolutnyCzas", 1, setStorage) },
			oba          (elem, setStorage) { return frycAPI.setDefaultDateEnumFunc1(elem, "oba"          , 2, setStorage) },
		},
		modeEnum: {
			relatywnyCzas: 0,
			absolutnyCzas: 1,
			oba          : 2,
		},
		style: {
			toolTipTop    (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "toolTip-top"   ) },
			toolTipRight  (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "toolTip-right" ) },
			toolTipBottom (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "toolTip-bottom") },
			toolTipLeft   (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "toolTip-left"  ) },
			toolTipCenter (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "toolTip-center") },
			floatLeft     (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "float-left"    ) },
			floatCenter   (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "float-center"  ) },
			floatRight    (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "float-right"   ) },
			// floatTop      (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "float-top"     ) },
			// floatBottom   (elem) { return frycAPI.setDefaultDateEnumFunc2(elem, "float-bottom"  ) },
		},
		/* eslint-enable */
		manualFuncRef: null,
		defaultDateMode: null,
		modeIter: 0,
	}, // frycAPI.setDefaultDateEnum.relatywnyCzas();
	setDefaultDateEnumFunc1(elem, val, state, setStorage = false) {
		if (elem === undefined) {
			const iter = ++frycAPI.setDefaultDateEnum.modeIter;
			(async () => {
				if (iter < frycAPI.setDefaultDateEnum.modeIter) return; // A newer mode setting was applied so don't apply the old setting
				if (setStorage) {
					frycAPI.setStorage("defaultDateMode", val);
				} else {
					frycAPI.setDefaultDateEnum.defaultDateMode = state;
					const mode = await frycAPI.getStorage("defaultDateMode");
					if (mode !== undefined) {
						val = mode;
						state = frycAPI.setDefaultDateEnum.modeEnum[mode]; // eslint-disable-line require-atomic-updates
					}
				}
				document.body.setAttribute("lepszyCzas", val);
				frycAPI.setDefaultDateEnum.manualFuncRef?.setState(state);
			})();
		} else if (elem.classList.contains("lepszyCzas")) {
			elem.setAttribute("lepszyCzas", val);
		} else {
			elem.querySelector(`.lepszyCzas`)?.setAttribute("lepszyCzas", val);
		}
		return frycAPI.setDefaultDateEnum.style;
	},
	setDefaultDateEnumFunc2(elem, val) {
		if (elem === undefined) {
			document.body.setAttribute("lepszyCzasStyl", val);
		} else if (elem.classList.contains("lepszyCzas")) {
			elem.setAttribute("lepszyCzasStyl", val);
		} else {
			elem.querySelector(`.lepszyCzas`)?.setAttribute("lepszyCzasStyl", val);
		}
		return frycAPI.setDefaultDateEnum.mode;
	},
	querySelNull(selector, elem = document) {
		return elem.querySelector(selector) === null;
	},
	arrayToTemplate(arr, [strs, vals]) {
		// debugger;
		// const cols = vals.length;
		const isInt = new Array(vals.length);
		vals.forEach((el, i) => {
			isInt[i] = frycAPI.isInt(el);
		});
		const last = strs[strs.length - 1];
		let outStr = "";
		arr.forEach((row, i) => {
			// if (row.length !== cols) throw new Error("Liczba kolumn i liczba pól w stringu muszą się zgadzać");
			const rowFun = frycAPI.isArray(row) ? (r, el) => r[el] : r => r;
			vals.forEach((el, j) => {
				outStr += strs[j];
				outStr += isInt[j] ? rowFun(row, el) : el;
			});
			outStr += last;
		});
		return outStr;
	},
	// #endregion
	// #region //* Funkcje 4
	querySelOk(selector, elem = document) {
		return elem.querySelector(selector) !== null;
	},
	objUrl(blob) {
		return URL.createObjectURL(blob);
	}, // .then(frycAPI.objUrl)
	blobToBase64(blob) {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		return new Promise(resolve => {
			reader.onloadend = () => {
				resolve(reader.result);
			};
		});
	}, // .then(frycAPI.blobToBase64)
	time12To24(str) { // str = "3:32 PM";
		const data = new Date("May 3 2001 " + str);
		return `${data.getHours().toString().padStart(2, "0")}:${data.getMinutes().toString().padStart(2, "0")}`;
	},
	arrayOneToN(N) {
		return [...Array(N + 1).keys()].slice(1);
	},
	arrayZeroToN(N) {
		return [...Array(N).keys()];
	},
	isString(value) {
		return typeof value === "string" || value instanceof String;
	},
	isBool(value) {
		return typeof value === "boolean" || value instanceof Boolean;
	},
	isInt(value) {
		if (isNaN(value)) return false;
		const x = parseFloat(value);
		return (x | 0) === x;
	},
	isArray(value) {
		return Array.isArray(value);
	},
	isObject(value) {
		if (value === null) return false;
		const type = typeof value;
		return type === "object" || type === "function";
	},
	isFunc(value) {
		return typeof value === "function";
	},
	perf(t1, t2, prefix = "") {
		console.log(`${prefix}${(t2 - t1).toFixed(1)} ms`);
	},
	elemFromHTML(htmlString) { // Only when root contains only one element
		const t = document.createElement("template");
		t.innerHTML = frycAPI.createHTML(htmlString);
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
	throttleDebounce(func, amount, wait) {
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
	}, // document.addEventListener("mousemove", frycAPI.throttleDebounce(handleMouseMove, 4));
	sendEventToBackground(name, data) {
		return chrome.runtime.sendMessage(frycAPI.id, { name, data }).then(response => {
			if (response.error) {
				console.error(response.errObj.stack);
				throw new Error(response.errObj.message);
			} else {
				return response.data;
			}
		}); // returns a Promise
	}, // const result = await frycAPI.sendEventToBackground("name", "data");
	async isWebpAnimated(resp) {
		const buffer = new Uint8Array(await resp.arrayBuffer());
		if (new TextDecoder().decode(buffer.subarray(12, 16)) === "VP8X") {
			return Boolean((buffer[20] >> 1) & 1);
		}
		return false;
	}, // await frycAPI.isWebpAnimated(); // await fetch(frycAPI.getResURL("test.webp")).then(frycAPI.isWebpAnimated)
	xmlObjToJsObj(xmlObj) {
		const root = xmlObj.documentElement ?? xmlObj;
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
				obj.children.push(frycAPI.xmlObjToJsObj(node));
			});
		} else {
			obj.text = root.innerText ?? root.textContent;
		}
		return obj;
	}, // frycAPI.xmlObjToJsObj(xmlObj);
	xmlStrToJsObj(xmlStr) {
		return frycAPI.xmlObjToJsObj(frycAPI.parseXML(xmlStr));
	}, // frycAPI.xmlStrToJsObj(xmlStr);
	xmlStrToJsStr(xmlStr) {
		return JSON.stringify(frycAPI.xmlObjToJsObj(frycAPI.parseXML(xmlStr)));
	}, // frycAPI.xmlStrToJsStr(xmlStr);
	xmlObjToJsStr(xmlObj) {
		return JSON.stringify(frycAPI.xmlObjToJsObj(xmlObj));
	}, // frycAPI.xmlObjToJsStr(xmlObj);
	xmlObjToJsObjNode(xmlObj) {
		const root = xmlObj.documentElement ?? xmlObj;
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
				obj.children.push(frycAPI.xmlObjToJsObjNode(node));
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
	}, // frycAPI.xmlObjToJsObjNode(xmlObj);
	xmlStrToJsObjNode(xmlStr) {
		return frycAPI.xmlObjToJsObjNode(frycAPI.parseXML(xmlStr));
	}, // frycAPI.xmlStrToJsObjNode(xmlStr);
	xmlStrToJsStrNode(xmlStr) {
		return JSON.stringify(frycAPI.xmlObjToJsObjNode(frycAPI.parseXML(xmlStr)));
	}, // frycAPI.xmlStrToJsStrNode(xmlStr);
	xmlObjToJsStrNode(xmlObj) {
		return JSON.stringify(frycAPI.xmlObjToJsObjNode(xmlObj));
	}, // frycAPI.xmlObjToJsStrNode(xmlObj);
	insertImage(elem, filename, where = "beforeend") {
		return elem.frycAPI_insertHTML(where, `<img src="${frycAPI.getResURL(filename)}">`);
	}, // const img = frycAPI.insertImage(elem, "img.png");
	insertLoadingGif(elem, where = "beforeend", filename = "loading.gif") {
		return elem.frycAPI_insertHTML(where, `<img class="loading-gif" src="${frycAPI.getResURL(filename)}">`);
	}, // const img = frycAPI.insertLoadingGif(elem); // .loading-gif
	elem(elemType = "div", elemFactory = true) {
		if (!frycAPI.isString(elemType)) {
			elemFactory = elemType;
			elemType = "div";
		}
		if (elemFactory) {
			return new frycAPI_Elem(elemType);
		} else {
			return document.createElement(elemType);
		}
	}, // const elem = frycAPI.elem()._; const elem = frycAPI.elem(0); const elem = frycAPI.elem("span")._;
	setStorage(key, val) {
		if (frycAPI.UUID === null) return;
		return frycAPI.sendEventToBackground("setStorage", { UUID: frycAPI.UUID, obj: { [key]: val } }); // throws error if setting failed
	}, // frycAPI.setStorage("key", "val");
	setStorages(obj) {
		if (frycAPI.UUID === null) return;
		return frycAPI.sendEventToBackground("setStorage", { UUID: frycAPI.UUID, obj: obj }); // Throws error if setting failed
	}, // frycAPI.setStorages({ "key": "val" });
	getStorage(key) {
		if (frycAPI.UUID === null) return;
		return frycAPI.sendEventToBackground("getStorage", { UUID: frycAPI.UUID, keys: [key] }).then(result => result[key]);
	}, // const val = await frycAPI.getStorage("key");
	getStorages(keys) {
		if (frycAPI.UUID === null) return;
		return frycAPI.sendEventToBackground("getStorage", { UUID: frycAPI.UUID, keys: keys });
	}, // const vals = await frycAPI.getStorages(["key"]);
	searchParamsToObj(url = window.location.href) {
		if (url instanceof URL === false) {
			url = new URL(url);
		}
		const obj = {};
		for (const [key, value] of url.searchParams) {
			obj[key] = value;
		}
		return obj;
	}, // const objPars = frycAPI.searchParamsToObj();
	querySelList: Element.prototype.frycAPI_querySelList,
	// const elem = frycAPI.querySelList([``]);
	checkChromeVersion() {
		loguj(navigator.appVersion.match(/.*Chrome\/([0-9.]+)/)[1]);
	}, // frycAPI.checkChromeVersion();
	VSC_Go_To_Line(host = frycAPI_host()) {
		const code = `
			#Requires AutoHotkey <2.0
			#Include C:\\Users\\Fryderyk\\Desktop\\AutoHotKey\\VSC_Go_To_Line_Base.ahk
			openVSCode("${host}")
		`;
		frycAPI.downloadTxt(frycAPI.minifyCodeSimple(code), "VSC_Go_To_Line.ahk_frycAPI");
	}, // frycAPI.VSC_Go_To_Line();
	retryIf(condition, interval, action) { // function, time [ms], function | Should be read as "Retry if condition fails"
		if (condition()) {
			action();
		} else { // Retry after a delay
			frycAPI.sleep(interval).then(frycAPI.retryIf.bind(null, condition, interval, action));
		}
	}, // frycAPI.retryIf(() => a > b, 50, () => {});
	mockMarkup(inStr) {
		let outStr = "";
		for (let i = 0; i < inStr.length; i++) {
			if (i % 2) {
				outStr += inStr[i].toUpperCase();
			} else {
				outStr += inStr[i].toLowerCase();
			}
		}
		loguj(outStr);
	}, // frycAPI.mockMarkup("Test");
	traverseIframeWindows(win = window, callback = console.log) {
		try {
			callback(win); // Process the current window
		} catch (e) {
			console.log("Access denied to window:", e);
		}

		const iframes = win.document.body?.getElementsByTagName?.("iframe");
		if (iframes) {
			for (const iframe of iframes) {
				try {
					const iframeWin = iframe.contentWindow;
					if (iframeWin) {
						frycAPI.traverseIframeWindows(iframeWin, callback);
					}
				} catch (e) {
					console.log("Cannot access iframe content due to cross-origin restrictions:", e);
				}
			}
		}
	}, // frycAPI.traverseIframeWindows(window, win => { console.log("Found window:", win.location.href); });
	traverseIframes(win = window, callback = console.log) {
		const iframes = win.document.body?.getElementsByTagName?.("iframe");
		if (iframes) {
			for (const iframe of iframes) {
				try {
					callback(iframe); // Process the current iframe
				} catch (e) {
					console.log("Access denied to window:", e);
				}

				try {
					const iframeWin = iframe.contentWindow;
					if (iframeWin) {
						frycAPI.traverseIframes(iframeWin, callback);
					}
				} catch (e) {
					console.log("Cannot access iframe content due to cross-origin restrictions:", e);
				}
			}
		}
	}, // frycAPI.traverseIframes(window, iframe => { console.log("Found iframe:", iframe); });
	downLoadVideoFrame(videoEl, filename = frycAPI_host() + " - Video " + videoEl.currentTime.toFixed(3) + " s.png") { // Downloads current video frame as png
		const canvas = document.createElement("canvas");
		canvas.width = videoEl.videoWidth;
		canvas.height = videoEl.videoHeight;
		canvas.getContext("2d").drawImage(videoEl, 0, 0);
		canvas.toBlob(blob => {
			if (!blob) return console.error("Failed to create blob");
			const url = URL.createObjectURL(blob);
			frycAPI.downloadHelper(url, filename);
			URL.revokeObjectURL(url);
		});
	}, // rycAPI.downLoadVideoFrame(videoEl, "Video");
	isElemOnScreen(elem) {
		const rect = elem.getBoundingClientRect();
		const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
		return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
	}, // frycAPI.isElemOnScreen(elem);
	traverseUntil(direction, startEl, callback) { // Get first element for which callback returns true
		const visited = "frycAPI_traverseUntil";
		let getNextEl;
		switch (direction) {
			case "forward": {
				getNextEl = baseEl => {
					if (baseEl.hasAttribute(visited)) {
						const nextEl = baseEl.nextEl ?? baseEl.parentElement;
						return nextEl ? getNextEl(nextEl) : null;
					} else {
						baseEl.setAttribute(visited, "");
					}
					return baseEl.firstEl ?? baseEl.nextEl ?? baseEl.parentElement;
				};
				break;
			}
			case "backward": {
				getNextEl = baseEl => {
					if (baseEl.hasAttribute(visited)) {
						const nextEl = baseEl.prevEl ?? baseEl.parentElement;
						return nextEl ? getNextEl(nextEl) : null;
					} else {
						baseEl.setAttribute(visited, "");
					}
					return baseEl.lastEl ?? baseEl.prevEl ?? baseEl.parentElement;
				};
				break;
			}
			case "down": {
				getNextEl = baseEl => {
					return baseEl.getElementsByTagName("*").find(callback);
				};
				break;
			}
			case "up": {
				getNextEl = baseEl => {
					return baseEl.parentElement;
				};
				break;
			}
			default: throw new Error("Wrong direction: " + direction);
		}

		let currEl = startEl;
		while (!callback(currEl) && (currEl = getNextEl(currEl))) {}

		frycAPI.forEach(`[${visited}]`, el => el.removeAttribute(visited));
		return currEl;
	}, // frycAPI.traverseUntil("forward", elem, e => e.hasAttribute("attr"));
	consonantsAsFirstLetters(str = "alphabet", consonants = "bcdfghjklmnpqrstvwxz") {
		const vowels = "aeiouy";
		str = str.split(" ").map(word => word.trim()).filter(word => word.length).map(word => {
			const wordLower = word.toLowerCase();
			return {
				word: wordLower.slice(Math.min(...vowels.map(l => {
					const idx = wordLower.indexOf(l);
					return idx !== -1 ? idx : Infinity;
				}))),
				case: word[0] === word[0].toUpperCase(),
			};
		});
		let out = "";
		consonants.forEach(c => {
			out += str.map(obj => (obj.case ? c.toUpperCase() : c) + obj.word).join(" ") + "\n";
		});
		return out;
	}, // loguj(frycAPI.consonantsAsFirstLetters("Fryc API"));
	template() {
	}, // frycAPI.template();
	// #region //* Funkcje 5
	// #endregion
	// #endregion
};
// #region //* Reszta
frycAPI.second =                  1000;
frycAPI.minute = frycAPI.second *   60;
frycAPI.hour   = frycAPI.minute *   60;
frycAPI.day    = frycAPI.hour   *   24;
frycAPI.month  = frycAPI.day    *   30;
frycAPI.year   = frycAPI.day    *  365;
frycAPI.week   = frycAPI.day    *    7;
frycAPI.dateFormatter = frycAPI.getDateFormatter({ second: undefined });
frycAPI.dateFormatterForFileName = frycAPI.getDateFormatter();
frycAPI.dateOptsNoTime = { printDate: frycAPI.getDateFormatter({ year: "numeric", month: "2-digit", day: "2-digit", defaultUndef: 1 }) };
// #region //* frycAPI.createHTML
try {
	if (!frycAPI_host("teams.microsoft.com", "vscode.dev") && window?.trustedTypes?.createPolicy) {
		frycAPI.escapeHTMLPolicy = trustedTypes.createPolicy("safeInnerHtml", {
			createHTML: str => str,
		});
		frycAPI.createHTML = str => frycAPI.escapeHTMLPolicy.createHTML(str);
	} else {
		throw new Error("Wystąpił błąd");
	}
} catch (e) {
	frycAPI.createHTML = str => str;
}
// #endregion
// #endregion
// #endregion

// #region //* IFy  1
if (1) { //* Globalne funkcje
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			tab-size: 3 !important;
		}
	`, { elevated: true, allFrames: true });

	(frycAPI.beforeLoad = function () {
		// #region //* color scheme only light
		if (frycAPI.colorSchemeDark) {
			document.getElementById("frycAPI-color-scheme-only-light")?.remove?.();
		} else {
			const meta = frycAPI.elem("meta", 0).frycAPI_setAttributeBulk(
				"name", "color-scheme",
				"content", "only light",
				"id", "frycAPI-color-scheme-only-light"
			);
			frycAPI.createMutObs(() => {
				if (document.head) {
					if (document.head.querySelector("meta[name=color-scheme][content=dark]") === null) {
						document.head.insertAdjacentElement("afterbegin", meta);
					}
					return true;
				}
			}, { elem: document.documentElement, options: { childList: true, subtree: false } });
		}
		// #endregion
		// #region //* Esc to scroll to top
		document.addEventListener("keydown", e => { if (e.key === "Escape") window.scrollTo(0, 0); });
		// #endregion
		// #region //*

		// #endregion
	})();

	/*  frycAPI.urlParam
	if (frycAPI.urlParam) {
		frycAPI.urlParam = JSON.parse(frycAPI.urlParam);
		new MutationObserver(async (mutRecArr, mutObs) => {
			if (document.body === null) return;
			if (document.body.firstElementChild === null) return;
			await frycAPI.downloadImg(document.body.firstElementChild, undefined, frycAPI.urlParam.alt, !!frycAPI.urlParam);
			// alert("Finish");
			window.close();
			mutObs.disconnect();
			// if (document.querySelector(`body>img:only-child`)) {
			// }
		}).observe(document.documentElement, { childList: true, subtree: true, });
	}
	*/
	/* Przycisk do pobierania obrazów
	frycAPI.onLoadSetter(() => { //* Przycisk do pobierania obrazów
		// return;
		let currImg;
		const singleImageSite = (history.length === 1 && document.querySelector(`body>img:only-child`) !== null);
		// const przycisk = document.body.appendChild(document.createElement("div").frycAPI_addClass("przycisk-do-pobierania-obrazów").frycAPI_setAttribute("title", "Pobierz image").frycAPI_setAttribute("style", "display: none;"));
		const przycisk = document.body.frycAPI_appendHTML(`<div class="przycisk-do-pobierania-obrazów" title="Pobierz image"></div>`);
		przycisk.addEventListener("mouseleave", e => { if (e.toElement !== currImg) { przycisk.frycAPI_removeClass("kursor-nad-obrazem", "zły-rozmiar"); } });
		przycisk.addEventListener("click", async e => { await frycAPI.downloadImg(currImg, undefined, e.altKey); if (singleImageSite) window.close(); });
		// przycisk.addEventListener("click", e => frycAPI.downloadHelper(currImg.src, undefined));

		function setPrzyciskPosiotion() {
			let imgRect = currImg.getBoundingClientRect();
			przycisk.style.left = Math.min(document.documentElement.clientWidth - przycSize, Math.max(0, imgRect.left)) + "px";
			przycisk.style.top = Math.min(document.documentElement.clientHeight - przycSize, Math.max(0, imgRect.top)) + "px";
			return imgRect;
		}
		function imgEnter(e) {
			if (e.fromElement === przycisk && this === currImg) return;
			currImg = this;
			let imgRect = setPrzyciskPosiotion();
			if (imgRect.width < allowedSize && imgRect.height < allowedSize) przycisk.frycAPI_addClass("zły-rozmiar");
			przycisk.frycAPI_addClass("kursor-nad-obrazem");
			document.addEventListener("scroll", setPrzyciskPosiotion);
			// loguj("imgEnter");
		}
		function imgLeave(e) {
			if (e.toElement === przycisk) return;
			przycisk.frycAPI_removeClass("kursor-nad-obrazem", "zły-rozmiar");
			document.removeEventListener("scroll", setPrzyciskPosiotion);
			// loguj("imgLeave");
		}
		function przygotujObraz(img) {
			img.addEventListener("mouseenter", imgEnter);
			img.addEventListener("mouseleave", imgLeave);
		}

		frycAPI.forEach(`img`, przygotujObraz);

		new MutationObserver((mutRecArr, mutObs) => {
			mutRecArr.forEach(mutRec => {
				mutRec.addedNodes.forEach(node => {
					if (node.tagName === "IMG") { przygotujObraz(node); return; }
					if (node.querySelectorAll) node.querySelectorAll(`img`).forEach(przygotujObraz);
				});
			});
		}).observe(document.body, { childList: true, subtree: true });

		const klawCtrl = "klawisz-kontrol", ctrl = "Control";
		document.addEventListener("keydown", e => { if (e.key === ctrl) przycisk.classList.add(klawCtrl); });
		document.addEventListener("keyup", e => { if (e.key === ctrl) przycisk.classList.remove(klawCtrl); });
	});
	*/

	/* Manual Functions Update Showcase
	frycAPI.createManualFunctions("Testowe funkcje", {
		funcArr: [
			(name = "Radio", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.displayName = 1;
				f.nameClickable = 1;
				// f.name = `<img src="${frycAPI.getResURL("ORACLE.png")}">Normal`;
				// f.name = `<img src="${frycAPI.getResURL("sussy.gif")}">Normal<img src="${frycAPI.getResURL("sussy.gif")}">`;
				f.callBack = function (obj) {
					// loguj(obj);
					// f.nextFunc.toggle();
					const radio = f.nextFunc;
					if (obj.type === "name") {
						if (radio.numStates > 2) {
							radio.setStateDesc(radio.stateDesc.slice(0, -1));
						}
					} else if (obj.type === "elem") {
						radio.setStateDesc([...radio.stateDesc, radio.numStates + 1]);
					}
				};
				return f;
			},
			(name = "Radio", type = frycAPI_Radio) => {
				const f = new type({ name });
				f.displayName = 1;
				f.nameClickable = 1;
				f.setNumCols(3);
				f.setStateDesc(frycAPI.arrayOneToN(12));
				f.callBack = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "Checkbox", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.displayName = 1;
				f.nameClickable = 1;
				f.callBack = function (obj) {
					const radio = f.nextFunc;
					if (obj.type === "name") {
						if (radio.numStates > 2) {
							radio.setStateDesc(radio.stateDesc.slice(0, -1));
						}
					} else if (obj.type === "elem") {
						radio.setStateDesc([...radio.stateDesc, radio.numStates + 1]);
					}
				};
				return f;
			},
			(name = "Checkbox", type = frycAPI_Checkbox) => {
				const f = new type({ name });
				f.displayName = 1;
				f.nameClickable = 1;
				f.setNumRows(3);
				f.setStateDesc(frycAPI.arrayOneToN(12));
				f.callBack = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "State", type = frycAPI_PureState) => {
				const f = new type({ name });
				// f.fixGeneralState = () => {};
				f.displayName = 1;
				f.nameClickable = 1;
				f.setStateDesc(["1", "2", "3"]);
				f.callBack = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "Combo", type = frycAPI_Combo) => {
				const f = new type({ name });
				f.displayName = 1;
				f.nameClickable = 1;
				f.setStateDesc(frycAPI.arrayOneToN(5));
				f.callBack = function (obj) {
					loguj(obj);
				};
				return f;
			},
			(name = "Input", type = frycAPI_Input) => {
				const f = new type({ name });
				f.displayName = 1;
				f.nameClickable = 1;
				f.callBack = function (obj) {
					loguj(obj);
				};
				return f;
			},
		],
	});
	*/

	frycAPI.createManualFunctions("Globalne funkcje", {
		funcArr: [
			(name = "Edit Script", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callBack = function (obj) {
					frycAPI.VSC_Go_To_Line();
				};
				return f;
			},
			(name = "Style", type = frycAPI_PureState) => {
				const f = new type({ name });
				frycAPI.myStyleManualFunc = f;
				f.callBack = function (obj) {
					if (frycAPI.myStyleState !== null) {
						frycAPI.myStyleState.toggle();
						frycAPI.setStorage("style", frycAPI.myStyleState.state);
					}
				};
				return f;
			},
			(name = "Time format", type = frycAPI_Radio) => {
				const f = new type({ name });
				f.setDisplayName("Time:");
				f.setNumCols(2);
				f.setStateDesc(["Relative", "Absolute", "Both"]);
				f.setState(0);
				f.nameClickable = 1;
				frycAPI.setDefaultDateEnum.manualFuncRef = f;
				f.callBack = function (obj) {
					if (!f.stateChanged) return;
					switch (obj.state ?? frycAPI.setDefaultDateEnum.defaultDateMode) {
						case 0: return frycAPI.setDefaultDateEnum.mode.relatywnyCzas(undefined, true);
						case 1: return frycAPI.setDefaultDateEnum.mode.absolutnyCzas(undefined, true);
						case 2: return frycAPI.setDefaultDateEnum.mode.oba(undefined, true);
					}
				};
				return f;
			},
			(name = "ඞ", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callBack = function (obj) {
					frycAPI.forEach(`*`, daElem => {
						if (daElem.nodeName !== "STYLE" && daElem.nodeName !== "SCRIPT" && daElem.nodeName !== "NOSCRIPT") {
							daElem.childNodes.forEach(child => {
								if (child.nodeType === Node.TEXT_NODE) {
									child.nodeValue = "ඞ";
								}
							});
						}
					});
				};
				return f;
			},
			(name = "Copy decoded URL", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callBack = function (obj) {
					frycAPI.copyTxt(decodeURI(window.location.href));
				};
				return f;
			},
		],
	});
}
if (1 && frycAPI_host("192.168.1.1")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		#menu a.sel span.text {
			color: #000000;
		}
	`);
} else if (1 && frycAPI_host("alienswarm.fandom.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		button.mojButt {
			position: fixed;
			top: 65px;
			left: 78px;
			width: 200px;
			height: 100px;
			cursor: pointer;
		}
	`);
} else if (1 && frycAPI_host("apps.microsoft.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.full-star {
			fill: #ffbf00;
			stroke: #ffbf00;
		}
	`);
} else if (1 && frycAPI_host("ark.fandom.com")) {
	// https://ark.fandom.com/wiki/ARK_Survival_Evolved_Wiki
	const funkcje = "ARK Wiki Powiększ obrazki";
	frycAPI.injectStyleOnLoad(/*css*/`
		.top-ads-container {
			display: none;
		}
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

	(frycAPI.beforeLoad = function () {
		// document.addEventListener("DOMContentLoaded", function (event) {
		// 	// frycAPI.obrazekData = [];
		// 	frycAPI.obrazekObserwer = function (myImg) {
		// 		let myImgSrc = myImg.src;
		// 		let myIndx = myImgSrc.indexOf(scaleStr);
		// 		let myWidth = myImg.getAttribute("width");
		// 		// frycAPI.obrazekData.push({myIndx: myIndx, myWidth: myWidth})
		// 		if (myIndx !== -1 && myWidth !== null) {
		// 			let newSrc = myImgSrc.substr(0, myIndx + scaleStr.length + 1)
		// 				+ (myWidth * 2)
		// 				+ myImgSrc.substr(myImgSrc.indexOf("?"));
		// 			if (myImgSrc !== newSrc) {
		// 				myImg.src = newSrc;
		// 				myImg.classList.add("zmienione");
		// 				// loguj("Zmieniam")
		// 			}
		// 		}
		// 	}

		// 	let scaleStr = "scale-to-width-down";
		// 	let opcje = { attributes: true };
		// 	let obrazekImg = new MutationObserver((mutRec) => {
		// 		frycAPI.obrazekObserwer(mutRec[0].target);
		// 	});
		// 	frycAPI.forEach("img[src]",function (daElem, daI, daArr) {
		// 		frycAPI.obrazekObserwer(daElem);
		// 		obrazekImg.observe(daElem, opcje);
		// 		// loguj(daI)
		// 	});
		// 	loguj("ARK done!")
		// });

		// frycAPI.obrazekData = [];

		const scaleStr = "scale-to-width-down";
		frycAPI.obrazekObserwer = function (myImg) {
			const myImgSrc = myImg.src;
			const myIndx = myImgSrc.indexOf(scaleStr);
			const myWidth = myImg.getAttribute("width");
			// frycAPI.obrazekData.push({myIndx: myIndx, myWidth: myWidth})
			if (myIndx !== -1 && myWidth !== null) {
				const newSrc = myImgSrc.substr(0, myIndx + scaleStr.length + 1) +
					(myWidth * 2) +
					myImgSrc.substr(myImgSrc.indexOf("?"));
				if (myImgSrc !== newSrc) {
					myImg.src = newSrc;
					// myImg.classList.add("zmienione");
					// loguj("Zmieniam")
				}
			}
		};

		const opcje = { attributes: true };
		// let obrazekImg = new MutationObserver((mutRec) => {
		// 	frycAPI.obrazekObserwer(mutRec[0].target);
		// });
		// frycAPI.obrazCount = {};
		function addObserver(daElem) {
			frycAPI.obrazekObserwer(daElem);
			new MutationObserver(mutRec => {
				frycAPI.obrazekObserwer(mutRec[0].target);
			}).observe(daElem, opcje);
			// daElem.classList.add("bylem");
			// loguj(daI)
		}
		frycAPI.bodyObs = new MutationObserver(mutRec => {
			if (!frycAPI.bodyObs.hasOwnProperty("pierwszy")) {
				frycAPI.bodyObs.pierwszy = 1;
				frycAPI.forEach("img[src]", function (daElem, daI, daArr) {
					addObserver(daElem);
				});
			}
			mutRec.forEach(function (daElem, daI, daArr) {
				daElem.addedNodes.forEach(function (daElem1, daI1, daArr1) {
					// loguj(daElem1);
					if (daElem1.nodeName === "IMG" && daElem1.matches("img[src]")) {
						addObserver(daElem1);
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

		new MutationObserver((mutRec, docObs) => {
			if (document.body) {
				// loguj("documentElement img[src] = " + document.querySelectorAll("img[src]").length);
				// frycAPI.obrazCount.a_docElem = document.querySelectorAll("img[src]").length;
				frycAPI.bodyObs.observe(document.body, { childList: true, subtree: true });
				docObs.disconnect();
			}
		}).observe(document.documentElement, { childList: true });

		loguj("ARK done!");
	})();

	frycAPI.onLoadSetter(() => {
		// loguj("load img[src] = " + document.querySelectorAll("img[src]").length);
		frycAPI.bodyObs.disconnect();
		// frycAPI.obrazCount.c_load = document.querySelectorAll("img[src]").length;
		// loguj(frycAPI.obrazCount);
	});
} else if (1 && frycAPI_host("astronomia.zagan.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			background-image: none;
			background-color: #656565;
			color: white;
		}
	`);
} else if (1 && frycAPI_host("bcgplatinion.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.cli-barmodal-open {
			overflow: scroll;
		}
	`);
} else if (1 && frycAPI_host("blog.discord.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			filter: invert(1);
		}
		img {
			filter: invert(1) !important;
		}
	`);
} else if (0 && frycAPI_host("blog.etrapez.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("bloons.fandom.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img.mwe-math-fallback-image-display.mwe-math-element {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("boards.4chan.org", "boards.4channel.org")) {
	let bodyBack, rediSpan;
	const transTime = 0.25; // 0.25
	if (frycAPI_host("boards.4chan.org")) {
		// bodyBack = "#ffe"; rediSpan = "#00e";
		bodyBack = "#0F131E"; rediSpan = "#A3A3C6";
	} else {
		// bodyBack = "#eef2ff"; rediSpan = "#34345c";
		bodyBack = "#21252E"; rediSpan = "#D9D5FF";
	}
	frycAPI.injectStyleOnLoad(/*css*/`
		*, #quickReply textarea {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
		/* :root {
			--borderColor: hsl(215deg 56.37% 77.16%);
		}
		body {
			background: ${bodyBack};
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
			--backLink: ${rediSpan};
			scroll-behavior: smooth;
		}
		body {
			background: ${bodyBack};
			color: white;
			transition:	scroll ${transTime}s 0s ease-in-out;
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
				/* max-width  ${transTime}s 0s ease-in-out,
				max-height ${transTime}s 0s ease-in-out; */
				transform ${transTime}s 0s ease-in-out,
				border-color ${transTime}s 0s ease-in-out,
				box-shadow ${transTime}s 0s ease-in-out;
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
			transition:	color ${transTime}s 0s ease-in-out;
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
				height .4s 0s ease-in-out; /* ${transTime} */
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
		(frycAPI.beforeLoad = function () {
			// frycAPI.colorSchemeDark = 1;
		})();

		frycAPI.onLoadSetter(() => {
			let obserwatorBlok, obserwatorLink, obserwatorFileThumb, obserwatorImg;
			obserwatorBlok = new MutationObserver(function mutatorBlockquote(myRec) { // eslint-disable-line prefer-const
				// debugger
				// loguj(myRec);
				if (myRec[0].addedNodes.length) {
					const nowyNode = myRec[0].addedNodes[0].frycAPI_addClass("powiekszPocz");
					const targetChildren = myRec[0].target.childNodes;
					if (targetChildren.length > 2) {
						const trgChildN = targetChildren.length;
						if ((() => {
							for (let i = 0; i <= trgChildN - 1; i++) {
								if (targetChildren[i].id && targetChildren[i].id.split("p")[1] > nowyNode.id.split("p")[1]) {
									targetChildren[i].insertAdjacentElement("beforebegin", nowyNode);
									return 0;
								}
							}
							return 1;
						})()) {
							targetChildren[trgChildN - 1].insertAdjacentElement("afterend", nowyNode);
						}
					} else {
						targetChildren[1].insertAdjacentElement("afterend", nowyNode);
					}
					obserwatorBlok.observe(nowyNode.querySelector("blockquote.postMessage"), opcje);
					obserwatorLink.observe(nowyNode.querySelector("blockquote.postMessage .myDiv"), opcje);
					const fileThumb = nowyNode.querySelector("a.fileThumb");
					if (fileThumb !== null) {
						obserwatorFileThumb.observe(fileThumb, opcje);
					}
				} else if (myRec.length > 1 && myRec[0].removedNodes.length) {
					requestAnimationFrame(function () {
						myRec[0].removedNodes[0].frycAPI_removeClass("powiekszPocz");
					});
				} else {
					// myRec[0].removedNodes[0]
					// .frycAPI_removeClass("powiekszPocz", "powiekszKon")
				}
			});
			obserwatorLink = new MutationObserver(function mutatorQuotelink(myRec) {
				// debugger
				if (myRec[0].addedNodes.length) {
					const nowyNode = myRec[0].addedNodes[0].frycAPI_addClass("powiekszPocz");
					// loguj(nowyNode.classList);
					const linki = myRec[0].target.querySelectorAll("a.linkfade");
					for (let i = 0; i < linki.length; i++) {
						if (linki[i].getAttribute("data-pfx") === nowyNode.getAttribute("data-pfx")) {
							linki[i].insertAdjacentElement("afterend", nowyNode);
							obserwatorBlok.observe(nowyNode.querySelector("blockquote.postMessage"), opcje);
							obserwatorLink.observe(nowyNode.querySelector("blockquote.postMessage .myDiv"), opcje);
							const fileThumb = nowyNode.querySelector("a.fileThumb");
							if (fileThumb !== null) {
								obserwatorFileThumb.observe(fileThumb, opcje);
							}
							break;
						}
					}
				} else if (myRec.length > 1 && myRec[0].removedNodes.length) {
					window.requestAnimationFrame(function () {
						myRec[0].removedNodes[0].frycAPI_removeClass("powiekszPocz");
					});
				}
			});
			obserwatorFileThumb = new MutationObserver(function mutatorFileThumb(myRec) {
				{
					// console.table(myRec);
					// myRec.forEach(function (daElem, daI, daArr) {
					// 	if (daElem.type === "attributes" && daElem.target.classList.contains("expanded-thumb")) {
					// 		loguj(daElem.oldValue);
					// 		loguj(daElem.target.getAttribute("style"));
					// 		loguj(daElem.target.style.maxWidth);
					// 	}
					// });
					// myRec[0].addedNodes[0]
				}
				const aFile = myRec[0].target;
				const thumb = aFile.firstChild;
				aFile.parentNode.parentNode.parentNode.scrollIntoView();
				if (myRec[0].addedNodes.length) {
					const addedImg = myRec[0].addedNodes[0];
					// myRec[0].addedNodes[0].setAttribute("style", myRec[0].target.firstChild.getAttribute("deafult_style"));

					// loguj(addedImg.getAttribute("style"));
					// addedImg.style.maxWidth = thumb.style.width;
					// addedImg.style.maxHeight = thumb.style.height;
					obserwatorImg.observe(addedImg, { attributeFilter: ["style", "class"] });

					// let a_height = Number(myRec[0].target.getAttribute("a_height"));
					// let a_width = Number(myRec[0].target.getAttribute("a_width"));
					// let aspect = Number(myRec[0].target.getAttribute("a_aspect"));
					// let height = Math.min(a_height, window.innerHeight * 0.99);
					// let width = Math.min(a_width, aspect * height);
					// thumb.setAttribute("style", `width: ${width}px; height: ${height}px;`);
					// aFile.parentNode.classList.add("image-expanded");

					// myRec[0].target.classList.add("growing");
					// myRec[0].target.firstChild.addEventListener("transitionend", (event) => {
					// 	event.target.parentNode.classList.remove("growing");
					// });
				} else {
					thumb.setAttribute("style", thumb.getAttribute("deafult_style"));
					thumb.classList.remove("transEnd");
					aFile.parentNode.classList.remove("image-expanded");
				}
			});
			const mini = function (thumb, addedImg) {
				window.requestAnimationFrame(() => {
					// debugger
					thumb.style.width = addedImg.style.maxWidth;
					thumb.style.height = addedImg.style.maxHeight;
				});
				thumb.addEventListener("transitionend", async function thumbTrans(event) {
					// debugger
					/*
					if (!thumb.classList.contains("transEnd") && thumb.parentNode.parentNode.classList.contains("image-expanded")) {
						loguj("transitionend");
						await frycAPI.sleep(1);
						addedImg.classList.remove("dispNone");
						// addedImg.style.display = "block";
						thumb.classList.add("transEnd");
						thumb.style.display = "none";
					}
					*/
					loguj("transitionend");
					// await frycAPI.sleep(1);
					addedImg.classList.remove("dispNone");
					let alt = thumb.parentElement.previousElementSibling.firstElementChild.getAttribute("title");
					alt ??= thumb.parentElement.previousElementSibling.firstElementChild.innerText;
					const altDotIdx = alt.lastIndexOf(".");
					addedImg.setAttribute("alt", alt.slice(0, altDotIdx !== -1 ? altDotIdx : undefined));
					thumb.style.display = "none";
					thumb.removeEventListener("transitionend", thumbTrans, false);
				});
			};
			obserwatorImg = new MutationObserver(function mutatorImg(myRec, mutObs) {
				const addedImg = myRec[0].target;
				// loguj("classList: " + addedImg.classList.value);
				// if (addedImg.classList.contains("byłem")) {
				// 	return
				// } else {
				// 	addedImg.classList.add("byłem");
				// }
				loguj("obserwatorImg");
				// debugger
				const thumb = addedImg.previousSibling;
				// loguj(addedImg.getAttribute("style"));
				// loguj(addedImg.complete);
				thumb.style.display = "block";
				// addedImg.style.display = "none";
				addedImg.classList.add("dispNone");
				if (addedImg.complete === false) {
					// let maxWidth  = addedImg.style.maxWidth ;
					// let maxHeight = addedImg.style.maxHeight;
					// addedImg.style.maxWidth = thumb.style.width;
					// addedImg.style.maxHeight = thumb.style.height;
					addedImg.addEventListener("load", () => {
						// addedImg.style.display = "block";
						// addedImg.style.maxWidth =  maxWidth ;
						// addedImg.style.maxHeight = maxHeight;
						// window.requestAnimationFrame(() => {
						// 	// debugger
						// });
						// thumb.style.display = "none";
						mini(thumb, addedImg);
					});
				} else {
					mini(thumb, addedImg);
				}
				// myRec[0].target.firstChild.addEventListener("transitionend", (event) => {
				// 	event.target.parentNode.classList.remove("growing");
				// });
				// addedImg.setAttribute("style", myRec[0].target.previousSibling.getAttribute("style"));
				mutObs.disconnect();
			});

			frycAPI.forEach("div.post blockquote.postMessage", function (daElem, daI, daArr) {
				const myDiv = document.createElement("div");
				myDiv.classList.add("myDiv");
				while (daElem.childNodes.length > 0) {
					myDiv.appendChild(daElem.childNodes[0]);
				}
				if (myDiv.childNodes.length === 0) {
					daElem.classList.add("pusty");
				}
				daElem.appendChild(myDiv);
				obserwatorLink.observe(myDiv, opcje);
				obserwatorBlok.observe(daElem, opcje);
			});

			document.querySelector("div.post.op .file").insertAdjacentElement("beforebegin", document.querySelector("div.post.op .postInfo.desktop"));
			// document.getElementById("bl_39814357").appendChild(document.getElementById("bl_39814357").firstChild.cloneNode(1))

			const dtFrmt = Intl.DateTimeFormat(frycAPI.dateLocales, {
				year  : "numeric",
				month : "2-digit",
				day   : "2-digit",
				hour  : "2-digit",
				minute: "2-digit",
				// second: "2-digit",
				timeZone: "America/New_York",
			});
			const dayFrmt = Intl.DateTimeFormat("en-GB", {
				weekday: "short",
				timeZone: "America/New_York",
			});
			frycAPI.forEach(".desktop span.dateTime", function (daElem, daI, daArr) {
				const d = new Date(Number(daElem.getAttribute("data-utc")) * 1000);
				daElem.innerHTML = dtFrmt.format(d).replace(" ", "<span>, " + dayFrmt.format(d) + "</span>, ");
			});

			{ // Hiding posts
				frycAPI.hidePost = function (daElem) {
					daElem.parentNode.parentNode.parentNode.classList.toggle("ukryty");
				};
				frycAPI.forEach(".desktop span.name", function (daElem, daI, daArr) {
					daElem.setAttribute("onclick", "frycAPI.hidePost(this);");
					// daElem.addEventListener("click", hidePost);
				});

				frycAPI.hidePostBar = function (daElem) {
					daElem.parentNode.classList.toggle("ukryty");
				};
				frycAPI.forEach("div.post.reply", function (daElem, daI, daArr) {
					// let myDiv = document.createElement("div");
					// myDiv.classList.add("ukryjBar");
					// myDiv.setAttribute("onclick", "frycAPI.hidePostBar(this);");
					// daElem.insertAdjacentElement("afterbegin",myDiv);

					daElem.insertAdjacentElement("afterbegin",
						document.createElement("div")
						.frycAPI_addClass("ukryjBar")
						.frycAPI_setAttribute("onclick", "frycAPI.hidePostBar(this);")
					);
				});
			}

			frycAPI.forEach(".postInfoM.mobile", daElem => daElem.remove());

			frycAPI.forEach("a.fileThumb", function (daElem, daI, daArr) {
				const wymiary = daElem.previousSibling.childNodes[2].data.match(/(?<=[ x])\d+/gu);
				// daElem.firstChild.setAttribute("a_width", wymiary[0]);
				// daElem.firstChild.setAttribute("a_height", wymiary[1]);
				daElem.firstChild.setAttribute("a_aspect", wymiary[0] / wymiary[1]);
				daElem.firstChild.setAttribute("deafult_style", daElem.firstChild.getAttribute("style"));
				obserwatorFileThumb.observe(daElem, opcje);
			});

			if (document.querySelector(".redditify") === null) {
				const redSpan = document.createElement("span");
				const redDiv = document.createElement("div");
				redDiv.classList.add("redditify");
				// redSpan.setAttribute("onclick", "redditify();");
				redSpan.addEventListener("click", async function redditify() {
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
						const mySvg = reddit.parentNode.querySelector("svg");
						const czas = 1.44;
						const liczba = 12;
						for (let i = 1; i < liczba; i++) {
							const myRect = mySvg.querySelector("rect").cloneNode(1);
							myRect.setAttribute("transform", `rotate(-${i / liczba * 360})`);
							myRect.children[0].setAttribute("begin", `-${i / liczba * czas}s`);
							// console.log(myRect);
							mySvg.append(myRect);
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
						// while (frycAPI.forEach(`.backlink>span>.quotelink:not(.linkfade)`, async daElem => {
						// 	daElem.click();
						// 	await frycAPI.sleep(1);
						// }).length) { }

						reddit.innerHTML = "Redditified";
						mySvg.remove();
					}
				});
				redSpan.innerHTML = "Redditify";
				const navDiv = document.querySelector(".navLinks.desktop");
				navDiv.append(" [");
				navDiv.appendChild(redDiv).appendChild(redSpan);
				navDiv.append("]");
			}
		});

		frycAPI.createManualFunctions("4chan", {
			funcArr: [
				(name = "Weekdays", type = frycAPI_PureState) => {
					const f = new type({ name });
					f.callBack = function (obj) {
						document.body.classList.toggle("show-weekday");
					};
					return f;
				},
			],
		});

		loguj("4chan done!");
	}
} else if (0 && frycAPI_host("bugs.chromium.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
		*:not(code, code *, #codemirror *) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
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
	`);

	/* frycAPI.onLoadSetter(function () {
		frycAPI.forEach(`a.flex.items-center.gap-2.p-2`, (daElem, daI, daArr) => {
			daElem.append(`<div class="mój-tooltip">${daElem.firstChild.innerText}</div>`);
		});
		new MutationObserver((mutRecArr, mutObs) => {
			if ((() => {
				for (let i = 0; i < mutRecArr.length; i++) {
					if (mutRecArr[i].addedNodes.length) return true;
				}
				return false;
			})()) {
				frycAPI.forEach(`a.flex.items-center.gap-2.p-2:not(:has(.mój-tooltip))`, (daElem, daI, daArr) => {
					daElem.insertAdjacentHTML("beforeend",`<div class="mój-tooltip">${daElem.firstChild.innerText}</div>`);
				});
			}
		}).observe(document.querySelector(`nav[aria-label="Chat history"]`), { childList: true, subtree: true });
	}); */
} else if (0 && frycAPI_host("cke.gov.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		h2, .h2 {
			color: #F8A238;
		}
	`);
} else if (1 && frycAPI_host("comforteo.eu")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.tooltip-static .content-area {
			color: hsl(0deg 0% 0%);
		}
	`);
} else if (1 && frycAPI_host("comparetwolists.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	`);

	frycAPI.onLoadSetter(() => {
		let myTr;
		const myTdArr = new Array(3);
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			frycAPI.forEach(`img[src="copy.png"], img[src="download.png"]`, (daElem, daI, daArr) => {
				daElem.frycAPI_addClass("copy-buttons");
			});
			const tab = document.querySelector(`body>table:first-of-type>tbody:has(tr>td:nth-child(1)>b)`);
			if (tab !== null) {
				tab.querySelector(`tr>td:nth-child(1)>b`).innerHTML = document.querySelector(`input[name="desca"]`).value;
				tab.querySelector(`tr>td:nth-child(2)>b`).innerHTML = document.querySelector(`input[name="descb"]`).value;
				myTr ??= tab.appendChild(document.createElement("tr"));
				[3, 4, 5].forEach((tr, idx) => {
					const daElem = document.querySelector(`body>table:nth-of-type(2)>tbody>tr:nth-child(${tr})`);
					if (myTdArr[idx] === undefined) {
						myTdArr[idx] = myTr.appendChild(document.createElement("td")).appendChild(document.createElement("div").frycAPI_addClass("myDiv"));
					} else {
						myTdArr[idx].frycAPI_removeChildren();
					}
					[1, 2, 5, 6].forEach(n => {
						myTdArr[idx].appendChild(document.createElement("div")).innerHTML = daElem.querySelector(`td:nth-child(${n})`).innerText;
					});
				});
			}
		});
	});

	frycAPI.createManualFunctions("Toggle copy buttons", {
		funcArr: [
			(name = "Copy buttons", type = frycAPI_PureState) => {
				const f = new type({ name });
				f.callBack = function (obj) {
					document.body.classList.toggle("toggle-copy-buttons");
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("cotone.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
// #region //* IFy  2
else if (1 && frycAPI_host("css-tricks.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(".comment-content", function (daElem, daI, daArr) {
			daElem.insertAdjacentElement("afterbegin", document.createElement("div").frycAPI_addClass("myDiv"));
		});
	});
} else if (1 && frycAPI_host("derpibooru.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	// frycAPI.UUID = "2025-01-12 14:26";
	frycAPI.injectStyleOnLoad(/*css*/`
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

		.top-banner { /* .top-banner.visible */
			display: none;
		}

		/* #mdn-docs-logo .logo-text {
			fill: red;
		} */
	`);
} else if (0 && frycAPI_host("diep.io")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body #app-mount .container-1r6BKw {
			justify-content: space-between;
		}body {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("dinopoloclub.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
		frycAPI.injectStyleOnLoad(/*css*/`
			#docs-editor [id*="grid-table-container"] > canvas {
				filter: invert(0) hue-rotate(0) !important;
			}
			/* #docs-editor [id="0-grid-table-container"] {
				filter: invert(0) hue-rotate(0) !important;
			} */
		`);
	}

	// (frycAPI.beforeLoad = function () {
	// 	// frycAPI.colorSchemeDark = 1;
	// })();

	frycAPI.onLoadSetter(function () {
		new MutationObserver((mutRec, mutObs) => {
			// loguj(mutRec);
			const elem = document.getElementById("docs-maestro-prompt-dialog-message");
			if (elem !== null && mutRec[0].addedNodes[0].hasAttribute("jsshadow") && elem.innerText.startsWith("!@#$%^&*()")) {
				// loguj(elem.innerText);
				frycAPI.ctrlC(elem.innerText.replace("!@#$%^&*()", ""));
				mutRec[0].addedNodes[0].querySelector(`span.javascriptMaterialdesignGm3WizButtonText-button__touch`).click();
			}
		}).observe(document.body, { childList: true });
	});
} else if (0 && frycAPI_host("docs.screeps.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
	`);
} else if (1 && frycAPI_host("dydmat.mimuw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("eager.io")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.blog-post-content a:not(.button):not(.without-underline) {
			text-shadow: none;
			text-decoration: underline;
		}
	`);
} else if (1 && frycAPI_host("en.wikipedia.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img.thumbimage[src*=".png"],
		img.thumbimage[src*=".gif"]
		/* a.image:has(img[src*=".png"]) */
		{
			filter: invert(1) hue-rotate(180deg);
			background-color: #c9c9c9;
		}
	`);
} else if (1 && frycAPI_host("epodreczniki.open.agh.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("fizyka.dk")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(1) !important;
		}
	`);
} else if (1 && frycAPI_host("forms.office.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
} else if (1 && frycAPI_host("forum.videohelp.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			background-color: aliceblue;
		}
	`);
} else if (1 && frycAPI_host("gamertools.net")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.gameItem {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("industrial.omron.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (0 && frycAPI_host("jp.pum.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
} else if (1 && frycAPI_host("json2table.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		table * {
			font-family: "Source Code Fryc";
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy  3
else if (1 && frycAPI_host("jsongrid.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		td.obj.order.index {
			display: none;
		}
	`);
} else if (1 && frycAPI_host("karl.gg")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.statsContainer {
			border-top: 1px solid;
		}
		.statsText[data-v-a848cd50] {
			line-height: inherit;
		}
	`);
} else if (1 && frycAPI_host("kertisjones.weebly.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		#main-wrap .inner-container {
			background: none;
		}
	`);
} else if (0 && frycAPI_host("labfiz1p.if.pw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		.content-questionnaire .answer-candidates .answer {
			background-image: url(${frycAPI.getResURL("arrow-down.png")});
		}
	`);
} else if (1 && frycAPI_host("linuxconfig.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.asciinema-player.asciinema-theme-asciinema {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("llamalab.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.background-image.cover.hero-background {
			display: none;
		}
	`);
} else if (1 && frycAPI_host("mail.google.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
} else if (1 && frycAPI_host("mat-fiz-samouczek.pw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img.teximage {
			background-color: #ffffff;
			border: 5px solid white;
			border-radius: 3px;
		}
	`);
} else if (1 && frycAPI_host("matematykaszkolna.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("matlab.mathworks.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.textElement.eoOutputContent {
			user-select: text !important;
		}
	`);
} else if (1 && frycAPI_host("matma4u.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("matrixcalc.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		a[title="Бе́ло-кра́сно-бе́лый флаг"] {
			display: none !important;
		}
		mtr:not(:last-child) {
			height: 25px;
		}
	`);
} else if (1 && frycAPI_host("minecraft.fandom.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

		.top-ads-container {
			display: none;
		}
	`);
} else if (1 && frycAPI_host("mlp.fandom.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
} else if (1 && frycAPI_host("oeis.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(1) hue-rotate(180deg);
		}
		body {
			background-color: black;
		}
	`);
} else if (1 && frycAPI_host("ostatnidzwonek.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			background: none;
			background-color: white;
		}
	`);
} else if (1 && frycAPI_host("palobby.com")) {
	const funkcje = "PAT_DB_Unit_Korekta";
	frycAPI.injectStyleOnLoad(/*css*/`
		.clearfix~div.columns div {
			margin-right: 0;
		}
		.clearfix~div.columns {
			align-items: unset;
		}
		.clearfix~div.columns>div {
			border-right: 1px solid #eee;
			padding: 0 10px;
		}
		.clearfix~div.columns>div:last-child {
			border-right: 0px;
			padding-right: 0px;
		}
		.clearfix~div.columns>div:first-child {
			padding-left: 0px;
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
		a.default {
			font-family: "Helvetica Neue","Segoe UI",Helvetica,Arial,sans-serif;
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
	`);

	frycAPI.onLoadSetter(() => {
		// <span title="Cooldown Time">0:00</span>
		if (document.querySelector("span[title='Rolloff Time']") !== null && document.querySelector("div.columns>div:nth-child(2) h4").innerText === "Physics") {
			const listy = document.querySelectorAll("h4+ul.list-unstyled");
			let zbudPrzez;
			for (let i = 0; i < listy.length; i++) {
				if (listy[i].previousElementSibling.innerText === "Built By") {
					zbudPrzez = listy[i];
					break;
				}
			}
			const spanRolloffTime = document.createElement("span");
			spanRolloffTime.title = "Rolloff Time";
			spanRolloffTime.classList.add("dodane");
			spanRolloffTime.innerHTML = "0:00";
			const zbudChild = zbudPrzez.children;
			for (let i = 0; i < zbudChild.length; i++) {
				if (zbudChild[i].querySelector("span[title='Rolloff Time']") === null) {
					zbudChild[i].appendChild(document.createTextNode(" + "));
					zbudChild[i].appendChild(spanRolloffTime.cloneNode(1));
				}
			}
			console.log("Done!");
		}
	});
} else if (1 && frycAPI_host("pl.wikibooks.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy  4
else if (1 && frycAPI_host("pl.wikipedia.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img.thumbimage[src*=".png"]
		/* a.image:has(img[src*=".png"]) */
		{
			filter: invert(1) hue-rotate(180deg);
			background-color: #c9c9c9;
		}
	`);
} else if (1 && frycAPI_host("pl.wikisource.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.mwe-math-fallback-image-inline {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("planetcalc.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	frycAPI.createManualFunctions("Planet Calc", {
		funcArr: [
			(name = "Łatwiejsze kopiowanie", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callBack = function (obj) {
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(1);
			background: transparent !important;
		}
	`);
} else if (1 && frycAPI_host("robotyka.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img[src*=".gif"],
		img[src*=".png"]{
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (1 && frycAPI_host("satisfactory.fandom.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img.mwe-math-fallback-image-inline {
			filter: invert(1) !important;
		}

		.resizable-container {
			max-width: 100%;
			width: calc(100% - 34px * 2);
			margin: 0 34px;
		}
	`);
} else if (1 && frycAPI_host("satisfactory.wiki.gg")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		/* Tymczasowe */
		tr:has([title="Equipment Workshop"]),
		tr:has([title="Build Gun"]),
		tr:has(.recipe-alternate){
			display: none;
		}
	`);
} else if (1 && frycAPI_host("scripty.abhisheksatre.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("soundcloud.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	frycAPI.createManualFunctions("SoundCloud", {
		funcArr: [
			(name = "Get Covers From SoundCloud", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callBack = function (obj) {
					const artwork = document.querySelectorAll(".playableTile__image>.sc-artwork>span");
					newDiv = document.createElement("div");
					newDiv.setAttribute("id", "mojelem");
					for (let i = 0; i < 184; i++) {
						newDiv.innerHTML += window.getComputedStyle(artwork[i]).getPropertyValue("background-image");
						newDiv.innerHTML += "<br>";
					}
					document.body.insertBefore(newDiv, document.getElementById("app"));
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_hostIncludes("stackoverflow.com", "stackexchange.com", "superuser.com", "serverfault.com", "askubuntu.com", "stackapps.com", "mathoverflow.net")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
			/* .s-btn.s-btn__filled {
				background-color: var(--my-bg-accent);
			} */
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

		.comment-body > .ai-center {
			color: var(--theme-link-color, var(--theme-secondary-400));
		}
		.comment-body > :is(.ai-center, .comment-copy)::after {
			content: "–";
			/* content: "|"; */
			padding-left: 3px;
			color: #cccac6;
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
	`);

	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(".user-info:has(.user-gravatar32)", function (daElem) { // Better avatar design
			const myDiv = document.createElement("div");
			myDiv.classList.add("myDiv");
			daElem.querySelector(".user-action-time").insertAdjacentElement("afterend", myDiv);
			let el;
			el = daElem.querySelector(".user-gravatar32"); if (el !== null) myDiv.appendChild(el);
			el = daElem.querySelector(".user-details");    if (el !== null) myDiv.appendChild(el);
		});
		frycAPI.forEach("span.s-badge__staff, span.mod-flair, span.s-badge__moderator, .s-badge.s-badge__xs", function (daElem) { // Moved staff/moderator/bot indicator to user name
			daElem.previousElementSibling?.appendChild(daElem);
		});

		document.querySelectorAll(`:is(.-badges, .-flair) > span.v-visible-sr`).forEach(el => el.remove());
		const badges = document.querySelector(`.-badges`);
		if (badges !== null) {
			const rep = badges.previousElementSibling;
			badges.frycAPI_insertHTML("afterbegin", `<span class="reputation-score" title="${rep.getAttribute("title")}"><div>${rep.frycAPI_getFirstTextNodeContent()}</div></span>`);
			badges.frycAPI_addClass("-flair");
			rep.remove();
		}

		// Better date
		frycAPI.setDefaultDateStyle().mode.relatywnyCzas().floatLeft();
		const getDate = elem => {
			const title = elem.title;
			elem.title = "";
			return title.replace(/,.*/u, "");
		};
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			// #region //* Lepsza data
			// const t1 = performance.now();
			frycAPI.setDefaultDate(`.user-action-time > .relativetime`, {
				getDate: getDate,
				dateEnumStyle: frycAPI.setDefaultDateEnum.style.toolTipTop,
				customStyle: `cursor: none;`,
			});
			frycAPI.setDefaultDate(`a.js-gps-track > .relativetime`, {
				getDate: getDate,
				dateEnumStyle: frycAPI.setDefaultDateEnum.style.toolTipTop,
				// customStyle: `--tt-y: 1px;`,
			});
			frycAPI.setDefaultDate(`.comment-body:has(span[title] > svg.iconPencilSm, button.js-comment-edit, button.js-comment-delete) .relativetime-clean`, {
				getDate: getDate,
				dateEnumStyle: frycAPI.setDefaultDateEnum.style.toolTipCenter,
			});
			frycAPI.setDefaultDate(`.ai-center:has(.owner) + span.comment-date .relativetime-clean`, { getDate, customStyle: `--tt-y: 1px;` }); // eslint-disable-line object-shorthand
			frycAPI.setDefaultDate(`:is(.relativetime-clean, .relativetime)`, { getDate });
			// #endregion
			// #region //* Moved user name to the beginning of the comment
			frycAPI.forEach(`.comment-body:not(.zmieniona-kolejność)`, (daElem, daI, daArr) => {
				daElem.classList.add("zmieniona-kolejność");
				const author = daElem.querySelector(`:scope > .ai-center`);
				author.frycAPI_getFirstTextNode().remove();
				// author.frycAPI_appendHTML(`<span class="">&nbsp;–</span>`);
				daElem.insertAdjacentElement("afterbegin", author);
			});
			// #endregion
			// const t2 = performance.now(); frycAPI.perf(t1, t2);
		});
	});
} else if (1 && frycAPI_host("steamcommunity.com")) {
	// Dawid Sadowski: 232603985
	// Michał Roman: 96866084
	// Michał Łasica: 71831352
	const friendsProfileID = "96866084";

	frycAPI.injectStyleOnLoad(/*css*/`
		.qrcode_Bit_2Yuvr.qrcode_Active_274P1 {
			filter: invert(1) contrast(1);
		}

		/* specific-friend */
		.specific-friend {
			.blotter_daily_rollup_line {
				display: none;
				&:has(.blotter_rollup_avatar [data-miniprofile="${friendsProfileID}"]) {
					display: block;
				}
			}
			.blotter_block:not(:has(.blotter_daily_rollup)) {
				display: none;
				&:has(.blotter_author_block [data-miniprofile="${friendsProfileID}"]) {
					display: block;
				}
			}
		}

	`);

	frycAPI.onLoadSetter(async () => {
		if (frycAPI.path === "/stats/563560/achievements/") {
			// Steam Alien Swarm Reactive Drop Achievments Alphabetical Sort
			frycAPI.injectStyle(/*css*/`
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
			const achievObj = await frycAPI.getResData("Alien Swarm RD Achievments.json");
			achiev.forEach(function (daElem, daI, daArr) {
				const h3 = daElem.querySelector("h3");
				let h3Str = h3.innerHTML;
				const h5str = daElem.querySelector("h5").innerHTML;
				if (h3Str.includes("Speedrun")) {
					const missionStr = h3Str.replace(/ ?Speedrun ?/gu, "");
					if (achievObj.hasOwnProperty(missionStr)) {
						h3.innerHTML = `A1 Speedrun | ${achievObj[missionStr].camp} | ${achievObj[missionStr].num.toString().padStart(2, "0")} | <b>${missionStr}</b>`;
					} else {
						h3.innerHTML = `A1 Speedrun | ~ | <b>${missionStr}</b>`;
					}
					// daElem.classList.add("Speedrun");
				} else if (h3Str.includes("Campaign")) {
					h3Str = "Campaign " + h3Str.replace(/ ?Campaign ?/gu, "");
					if (h3Str.includes("Easy")) {
						h3.innerHTML = `A01 <b>${h3Str}</b>`;
					} else if (h3Str.includes("Normal")) {
						h3.innerHTML = `A02 <b>${h3Str}</b>`;
					} else if (h3Str.includes("Hard")) {
						h3.innerHTML = `A03 <b>${h3Str}</b>`;
					} else if (h3Str.includes("Insane")) {
						h3.innerHTML = `A04 <b>${h3Str}</b>`;
					} else {
						h3.innerHTML = `A05 <b>${h3Str}</b>`;
					}
				} else if (h3Str.includes("Outstanding Execution")) {
					h3.innerHTML = `A1 <b>${h3Str}</b>`;
				} else if (h5str.includes("Kill")) {
					if (h5str.includes(" with ")) {
						h3.innerHTML = `A21 Kill with | <b>${h3Str}</b>`;
					} else if (h5str.includes("Swarm.")) {
						h3.innerHTML = `A22 Kill Swarm | <b>${h3Str}</b>`;
					} else {
						h3.innerHTML = `A23 Kill | <b>${h3Str}</b>`;
					}
				}
			});
			// #endregion

			frycAPI.sortElements(document.querySelector("#mainContents"), achiev, a => a.querySelector("h3").innerHTML);

			const butt = document.createElement("button");
			butt.setAttribute("onclick", "this.toggleAttribute('aktywny')");
			butt.classList.add("mojButt");
			butt.innerText = "Przełącz widoczność ukończonych osiągnięć";
			butt.setAttribute("aktywny", "");
			document.getElementById("mainContents").insertAdjacentElement("afterbegin", butt);
		}
		// document.body.classList.toggle("specific-friend");
	});

	frycAPI.createManualFunctions("Friend Activity", {
		funcArr: [
			(name = "Show only specific friend's activity", type = frycAPI_PureState) => {
				const f = new type({
					name: name,
					stateDesc: ["Only specific friend: NO", "Only specific friend: YES"],
					state: 0,
				});
				f.callBack = function (obj) {
					document.body.classList.toggle("specific-friend");
				};
				return f;
			},
		],
	});
} else if (0 && frycAPI_host("support.discord.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(1) hue-rotate(180deg) !important;
		}

		img[itemprop="logo"] {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("teams.microsoft.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.fui-Flex.___1jvzdal.f22iagw.f1vx9l62.f10pi13n.f1g2edtw {
			display: none;
		}
	`);
} else if (1 && frycAPI_host("tech.wp.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		iframe {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("terraria.gamepedia.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			image-rendering: pixelated;
		}
	`);
} else if (1 && frycAPI_host("tiger.chem.uw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("tplinkmodem.net")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		tr.head>th.table-head:nth-child(2) {
			width: 11% !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy  5
else if (1 && frycAPI_host("translate.google.com", "translate.google.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.onLoadSetter(() => {
		document.querySelector("[jsname='dnDxad']").addEventListener("click", function () {
			document.querySelector(".D5aOJc.vJwDU").click();
		});
	});
} else if (1 && frycAPI_host("trello.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		/* *::-webkit-scrollbar-thumb {
			background:rgb(102, 254, 123) !important;
		} */
		.js-list-actions.mod-card-back {
			display: flex;
			flex-direction: column-reverse;
		}
	`);
} else if (1 && frycAPI_host("u4.satisfactorytools.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.UUID = "2025-01-11 22:33";
	frycAPI.injectStyleOnLoad(/*css*/`
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
			background-image: url(${frycAPI.getResURL("Fine_info_icon.png")}) !important;
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
			background-image: url(${frycAPI.getResURL("Fine_correct_icon_small.png")}) !important;
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
			 background-image: url(${frycAPI.getResURL("Fine_exclamation_mark_icon.png")}) !important;
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
			content: url(${frycAPI.getResURL("Fine_info_icon.png")});
			width: 16px;
			height: 16px;
		}

		img[src="https://usosweb.usos.pw.edu.pl//img/tip_redinfo.gif"] {
			content: url(${frycAPI.getResURL("transparent_square_PNG.png")});
			background-image: url(${frycAPI.getResURL("Fine_info_icon.png")});
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
			content: url(${frycAPI.getResURL("Fine_correct_icon_small.png")});
			width: 19px;
			height: 19px;
		}

		img[src*="https://usosweb.usos.pw.edu.pl//img/tip_greyinfo.gif"], img[src*="https://usosweb.usos.pw.edu.pl//img/tip_small_greyinfo.gif"], img[src*="https://usosweb.usos.pw.edu.pl//img/greyinfolink.gif"] {
			content: url(${frycAPI.getResURL("transparent_square_PNG.png")});
			background-image: url(${frycAPI.getResURL("Fine_info_icon.png")});
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
			content: url(${frycAPI.getResURL("red_square.png")});
		}
		img[src="https://usosweb.usos.pw.edu.pl//img/rejB_limitWyborow.gif"] {
			content: url(${frycAPI.getResURL("yellow_square.png")});
		}
		img[src="https://usosweb.usos.pw.edu.pl//img/koszyk_outB.gif"] {
			content: url(${frycAPI.getResURL("blue_square.png")});
		}
		img[src="https://usosweb.usos.pw.edu.pl//img/koszyk_inB.gif"] {
			content: url(${frycAPI.getResURL("green_square.png")});
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
			content: "⮟";
			width: 20px;
			color: hsl(0 0% 58% / 1);
		}
		.usos-ui h2.USOS-OK.collapse::before {
			content: "⮞"
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
	`);

	frycAPI.onLoadSetter(() => {
		const t1 = performance.now();

		if (window.location.search.includes("statystyki")) {
			const chart = document.getElementById("chart");
			if (chart !== null) {
				new MutationObserver(async function USOS_Fix(mutRec, docObs) {
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
					docObs.disconnect();
				}).observe(chart, { attributes: true, childList: true, subtree: true });
			}
		}


		const shadowStyle = document.createElement("style").frycAPI_setInnerHTML(frycAPI.minifyCSS(/*css*/`
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
		frycAPI.forEach(`
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
		`, function (daElem, daI, daArr) {
			daElem.innerHTML = `<span class="mySpan">${daElem.innerHTML}</span>`;
		});

		frycAPI.forEach("td > div > form > label:first-of-type + br", daElem => daElem.remove());
		["info-box", "success-box", "notice-box"].forEach(box => {
			document.querySelectorAll(box, daElem => {
				daElem.shadowRoot.querySelector("div").classList.add(box, "moj-box");
			});
		});

		if (document.title.startsWith("Plan zajęć - ")) {
			document.documentElement.classList.add("frycPlan");
		}
		(function reqursShadow(elem0) {
			elem0.querySelectorAll("*").forEach(elem => {
				if (elem.shadowRoot !== null) {
					elem.shadowRoot.appendChild(shadowStyle.cloneNode(1));
					reqursShadow(elem.shadowRoot);
				}
			});
		})(document);

		// #region //* Naprawy kalendarza rejestracji
		if (!document.title.includes("USOSweb tymczasowo niedostępny") &&
			// document.querySelector("[aria-label='Panel boczny'] a[href='https://usosweb.usos.pw.edu.pl/kontroler.php?_action=dla_stud/rejestracja/kalendarz'].selected") !== null
			(
				window.location.href === "https://usosweb.usos.pw.edu.pl/kontroler.php?_action=dla_stud/rejestracja/kalendarz" ||
				window.location.href.startsWith("https://usosweb.usos.pw.edu.pl/kontroler.php?_action=news/rejestracje/rejJednostki")
			)
		) {
			const myDivBase = frycAPI.elemFromHTML(`<div class="myDiv"></div>`);
			const myDivOuterBase = frycAPI.elemFromHTML(`<div class="myDivOuter"></div>`);
			const elemArr = [];
			frycAPI.forEach(".usos-ui h2", function (daElem, daI, daArr) {
				const myDiv = myDivBase.cloneNode(1);
				const myDivOuter = myDivOuterBase.cloneNode(1);
				let h2next = daElem.nextElementSibling;
				while (h2next !== null && h2next.tagName !== "H2") {
					const h2next1 = h2next.nextElementSibling;
					myDiv.appendChild(h2next);
					h2next = h2next1;
				}
				daElem.insertAdjacentElement("afterend", myDiv);
				daElem.addEventListener("click", function (e) { this.classList.toggle("collapse") });
				if (daElem.nextElementSibling.querySelector(".rejestracja-ikona .rejestracja-ikona") === null) {
					/* Powyższy warunek może się zepsuć w przyszłości */
					daElem.classList.add("collapse");
				}
				daElem.classList.add("USOS-OK");
				daElem.insertAdjacentElement("afterend", myDivOuter);
				myDivOuter.append(daElem, myDiv);
				elemArr.push(myDivOuter);
			});
			const usosUi = elemArr[0].parentElement;
			elemArr.frycAPI_sortValues(e => e.firstElementChild.innerText.toLowerCase());
			// elemArr.frycAPI_sortValues(e => e.firstElementChild.innerText);
			elemArr.forEach(function (daElem) {
				usosUi.appendChild(daElem);
			});
		}
		// #endregion
		// #region //* Naprawy tabel rejestracji
		frycAPI.forEach("td:has(img.rejestracja-ikona[src='https://usosweb.usos.pw.edu.pl//img/spinacz_tip.png']) > br", daElem => daElem.remove());
		// #endregion
		// #region //* Sortowanie tabel rejestracji
		if (true) {
			const daUrl = new URL(window.location.href);
			if (daUrl.pathname === "/kontroler.php" && daUrl.searchParams.get("_action").frycAPI_equalAny("katalog2/przedmioty/szukajPrzedmiotu", "dla_stud/rejestracja/brdg2/wyborPrzedmiotu")) {
				const tab = document.querySelector(`.usos-ui > div > table.wrnav, table.grey > tbody.autostrong`);
				if (tab !== null) {
					const rows = Array.from(tab.querySelectorAll(`.odd_row, .even_row, :scope > tr`));
					const możRej = row => { // możliwość rejestracji
						return (row.możRej ??= [ // assigning value to custom property so the next call will be faster
							"img[src*='zarejestrowany.svg']",
							"img[src*='wyrejestruj.svg']",
							"img[src*='zarejestruj.svg']",
							"img[src*='brak_miejsc.svg']",
							"img[src*='brak_uprawnien.svg']",
							"*", // if this (any elem selector) was not present findIndex would return -1 if the registration button had some other image not present in the list
						].findIndex(el => row.frycAPI_querySelOk(el)));
					};
					const nazwJedn = row => { // nazwa jednostki
						return (row.nazwJedn ??= row.querySelector(`td:nth-child(2)`)?.firstElementChild?.innerText ?? "");
					};
					const nazwPrzed = row => { // nazwa przedmiotu
						return (row.nazwPrzed ??= row.querySelector(`td:nth-child(2)`)?.lastElementChild?.innerText ?? row.firstElementChild?.firstElementChild?.innerText ?? "");
					};
					const zapełnienie = row => { // zapełnienie grup
						// const smartyTip = row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona`);
						// if (smartyTip === null) return 1;
						// const div = smartyTip.querySelector(`div > div`);

						// const div = row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona > div > div`);
						// if (div === null) return 1;
						// return -Number(div.style.width.replace("px", ""));

						return (row.zapełnienie ??= (row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona + .screen-reader-only`)?.firstElementChild?.nextElementSibling ?? row.querySelector(`.zapeł-div`))?.innerText?.frycAPI_eval?.()?.frycAPI_minus?.() ?? 0);
					};
					rows.frycAPI_sortValues(
						możRej,
						zapełnienie,
						nazwJedn,
						nazwPrzed,
					);
					const parent = rows[0].parentElement;
					rows.forEach(row => {
						parent.appendChild(row);
					});
					rows.forEach(row => {
						const smartyTip = row.querySelector(`span.smarty-tip-wrapper.rejestracja-ikona`);
						if (smartyTip === null) return;
						smartyTip.insertAdjacentElement("afterend", frycAPI.elem().text(smartyTip.nextElementSibling.firstElementChild.nextElementSibling.innerText).class("zapeł-div")._);
					});
				}
			}
		}
		// #endregion

		const t2 = performance.now(); frycAPI.perf(t1, t2, "USOS: ");
	}, 2);
} else if (1 && frycAPI_host("viewer.shapez.io")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		canvas#result {
			filter: hue-rotate(180deg) invert(1) saturate(6.5) ;
		}
	`);
} else if (1 && frycAPI_host("wazniak.mimuw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("web.whatsapp.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
		/* canvas[aria-label="Scan me!"] {
			filter: invert(1);
		} */
	`);
} else if (1 && frycAPI_host("worldedit.enginehub.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			filter: brightness(1);
		}
	`);
} else if (1 && frycAPI_host("wutwaw-my.sharepoint.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		/* svg image {
			-webkit-filter: none !important;
			filter: none !important;
		} */
	`);
	frycAPI.onLoadSetter(function () {
		if (frycAPI.querySelOk(`#topLevelRegion #O365_AppName[aria-label="Przejdź do aplikacji OneDrive"]`)) {
			frycAPI.createMutObs(() => {
				const folderName = frycAPI.querySelList([
					`[class^="breadcrumbNonNavigableItem"][data-automationid="breadcrumb-crumb"]`,
					`li.ms-Breadcrumb-listItem:last-child .ms-TooltipHost [id^="tooltip"]`,
					`li[class^="navLink"][class*="navLinkSelected"]`,
				]);
				if (folderName !== null) {
					if (document.title !== folderName.textContent) {
						document.title = folderName.textContent;
					}
				} else if (document.title !== "OneDrive") {
					document.title = "OneDrive";
				}
			});
		}
	}, 2);
} else if (0 && frycAPI_host("wutwaw.sharepoint.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(1);
		}
	`);
} else if (1 && frycAPI_host("www.1001fonts.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.txt-preview {
			filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
} else if (0 && frycAPI_host("www.4g-lte.net")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
} else if (1 && frycAPI_host("www.autohotkey.com")) {
	const daUrl = new URL(window.location.href);
	if (daUrl.searchParams.has("style")) {
		daUrl.searchParams.delete("style");
		window.location.href = daUrl.href;
	} else {
		frycAPI.injectStyleOnLoad(/*css*/`
			*:not(:where(
				.inline_code, .inline_code *,
				code, code *,
				i.fa.fa-clock-o, i.fa.fa-clock-o *,
				#head .h-area .h-tools, #head .h-area .h-tools *,
				.fa-thumb-tack, .fa-thumb-tack *,
				.glyphicon, .glyphicon *,
				.mega-octicon, .mega-octicon *,
				.my-special-class
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
				content: url("${frycAPI.getResURL("ahk_logo.svg")}");
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
				background-image: url('${frycAPI.getResURL("Correct icon.png")}');
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
		`);

		frycAPI.onLoadSetter(() => {
			// const t1 = performance.now();
			// #region //* Favicon
			if (frycAPI.path.startsWith("/boards")) {
				frycAPI.changeFaviconRes("AHK_Blue.png");
			} else {
				frycAPI.changeFaviconRes("AHK_Better.png");
			}
			// #endregion
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
			const opts = frycAPI.dateOptsNoTime;
			frycAPI.setDefaultDate(`
				.postbody p.author > a,
				cite > .responsive-hide,
				p.notification-time,
				.column2 dl.details > dd:nth-of-type(1), .column2 dl.details > dd:nth-of-type(2)
			`, { getDate: "txt" });
			frycAPI.setDefaultDate("_" + frycAPI.arrayToTemplate([2, 3, 4, 5, 6, 7], temₚ`,table:has(thead th:nth-child(${0}).joined) td:nth-child(${0})`), {
				getDate: "txt",
				dateOpts: { printRelTime: { compact: 2, ago: false } },
			});
			frycAPI.setDefaultDate(`.postprofile > .profile-joined`, {
				getDate: elem => elem.innerText.replace("Joined: ", ""),
				setDate: (elem, data) => elem.frycAPI_setInnerHTML(
					"<strong>Joined: </strong>" + frycAPI.getDefaultDateText(data, opts)
				),
				dateEnumMode: frycAPI.setDefaultDateEnum.mode.relatywnyCzas,
				dateEnumStyle: frycAPI.setDefaultDateEnum.style.floatLeft,
				customStyle: `cursor: none;`,
			}); // .mode.absolutnyCzas().floatLeft();
			frycAPI.setDefaultDate(`.postbody-inner > p.author > strong`, {
				getDate: elem => elem.nextSibling.textContent.replace("»", "").trim(),
				setDate: (elem, data) => {
					// const txtNode = elem.nextSibling;
					elem.nextSibling.textContent = " » ";
					return elem.parentElement.frycAPI_appendHTML(frycAPI.getDefaultDateText(data));
				},
			});
			frycAPI.setDefaultDate(`.list-inner > .responsive-hide > a:first-of-type`, {
				getDate: elem => elem.nextSibling.textContent.replaceAll("»", "").replace("in", "").trim(),
				setDate: (elem, data) => {
					const txtNode = elem.nextSibling;
					const containsIn = txtNode.textContent.lastIndexOf("in") !== -1;
					txtNode.textContent = " » ";
					const lepCzas = txtNode.frycAPI_insertAfter(frycAPI.elemFromHTML(frycAPI.getDefaultDateText(data, opts)));
					containsIn && lepCzas.frycAPI_insertAfter(document.createTextNode(" » in "));
					return lepCzas;
				},
			});
			frycAPI.setDefaultDate(`.row dd.lastpost > span > br`, {
				getDate: elem => elem.nextSibling.textContent.trim(),
				setDate: (elem, data) => {
					// const txtNode = elem.nextSibling;
					elem.nextSibling.remove();
					return elem.parentElement.frycAPI_appendHTML(frycAPI.getDefaultDateText(data, opts));
				},
			});
			const zegar = document.querySelector(`a.dropdown-trigger.time.dropdown-toggle`);
			zegar?.setAttribute("title", "It is currently " + frycAPI.printDate(new Date(zegar.getAttribute("title").replace("It is currently ", ""))));
			// const t2 = performance.now(); frycAPI.perf(t1, t2);
			// #endregion
			// #region //* Ukrycie nic nie wnoszących tytułów postów
			const titleElem = document.querySelector(`h2.topic-title > a, h2.posting-title > a`);
			if (titleElem !== null) {
				const baseTitle = "Re: " + (titleElem.innerText = titleElem.innerText.trim());
				frycAPI.forEach(`.postbody h3 > a`, (daElem, daI, daArr) => {
					const tNode = daElem.frycAPI_getFirstTextNode();
					if ((tNode.textContent = tNode.textContent.trim()) === baseTitle) {
						daElem.frycAPI_addClass("dspNone");
					}
				});
			}
			// #endregion
			// #region //* Ukrycie panelu emoji
			const smileyBox = document.getElementById("smiley-box");
			if (smileyBox !== null) {
				document.querySelector(`#format-buttons:has(select[name="addbbcode_codeboxplus"])`)?.appendChild(
					document.createElement("div")
					.frycAPI_addClass("smiley-control")
					.frycAPI_setInnerHTML("Show smiles")
					.frycAPI_addEventListener("click", function () {
						if (smileyBox.classList.toggle("dspNone")) {
							this.frycAPI_setInnerHTML("Show smiles");
						} else {
							this.frycAPI_setInnerHTML("Hide smiles");
						}
					})
				);
				smileyBox.classList.toggle("dspNone");
			}
			// #endregion
			// #region //* Przeniesienie postów ponad pole tekstowe
			const topicReview = document.getElementById("topicreview");
			if (topicReview !== null) {
				const review = document.getElementById("review");
				review.querySelector(`span.right-box > a`).click();
				review.classList.add("dspNone");
				document.getElementById("postform").insertAdjacentElement("afterbegin", topicReview);
				const preview = document.getElementById("preview");
				if (preview !== null) {
					preview.scrollIntoView();
				} else {
					topicReview.querySelector(`.post:not(.post ~ .post)`).scrollIntoView();
				}
			}
			// #endregion
			// #region //* Dodanie przycisku Top do Nav-Baru
			document.querySelector(`ul.leftside > li.tab.home`)?.insertAdjacentHTML("afterend",
				`<li class="tab top responsive-cloned-item" data-responsive-class="small-icon" title="top"><a class="nav-link" href="#top" data-navbar-reference="Top">Top</a></li>`
			);
			// #endregion
			// #region //* Sprawdzenie które posty mają Text jako pierwszy Node
			frycAPI.forEach(`.postbody .content`, (daElem, daI, daArr) => {
				if (daElem.firstChild.frycAPI_isText) {
					daElem.frycAPI_addClass("pierwszy-node-to-text");
				}
			});
			// #endregion
			// #region //* Przypisanie konkrentych wymiarów obrazom profilowym
			frycAPI.forEach(`img.avatar`, (daElem, daI, daArr) => {
				daElem.style.width = daElem.getAttribute("width") + "px !important";
				daElem.style.height = daElem.getAttribute("height") + "px !important";
			});
			// #endregion
			// #region //* Sortowanie tabeli
			// frycAPI.forEach(`table:has(tr > th):has(tr > td)`, (daElem, daI, daArr) => {
			// 	daElem.querySelector(`th.posts`).setAttribute("krytSort", "numeric");
			// 	frycAPI.makeTableSortable(daElem);
			// });
			// #endregion
			// #region //* Poprawienie linka Board index
			const bIdx = document.querySelector(`a[title="Board index"]`);
			bIdx && (bIdx.innerHTML = `<span class="my-special-class">&#xE021;</span><span>Board index</span>`); // + bIdx.innerHTML
			// #endregion
			// #region //*
			// #endregion
			// const t2 = performance.now(); frycAPI.perf(t1, t2);
		});
	}
} else if (1 && frycAPI_host("www.calculator.net")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(0) hue-rotate(0deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.deltami.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img.math-display, figure, img.math-inline {
			filter: invert(1) hue-rotate(180deg);
		}
		img.highslide-image {
			filter: invert(1) hue-rotate(180deg);
			background-color: rgb(255 255 255 / 0%) !important;
		}
	`);
} else if (0 && frycAPI_host("www.derivative-calculator.net")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
// #region //* IFy  6
else if (1 && frycAPI_host("www.enpassant.dk")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(0) hue-rotate(0deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.facebook.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		body::-webkit-scrollbar {  width: 15px;  background: grey;}body::-webkit-scrollbar-thumb {width: 13px;  background: black;border: 1px solid white;}
	`);
} else if (1 && frycAPI_host("www.geeksforgeeks.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		iframe[id*="google_ads_iframe"] {
			display: none;
		}
		aside[id*="text-"] {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.geneseo.edu")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		mjx-container[jax="CHTML"][display="true"] {
			overflow: hidden;
		}
	`);
} else if (1 && frycAPI_host("www.geogebra.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.checkBoxPanel > * {
			margin-right: 5px !important;
		}
		.checkBoxPanel {
			display: block;
		}
	`);
} else if (1 && frycAPI_host("www.google.pl", "www.google.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
		.app-imagery-mode canvas.MyME0d.widget-scene-canvas {
			filter: none;
		}
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

	// (frycAPI.beforeLoad = function () {
	// 	if (document.querySelector("#APjFqb") && document.getElementById("searchform")) {
	// 		document.body.frycAPI_addClass("google-3-column");
	// 	}
	// })();

	frycAPI.onLoadSetter(() => {
		if (document.querySelector("#APjFqb") && document.getElementById("searchform")) {
			const hide01 = document.createElement("span");
			hide01.setAttribute("class", "hide01");
			document.body.appendChild(hide01);
			const input01 = document.querySelector("#APjFqb");
			function resize() {
				hide01.textContent = input01.value;
				hide01.style.font = window.getComputedStyle(input01).font;
				input01.style.width = hide01.offsetWidth + 20 + "px";
			}
			resize();
			input01.addEventListener("input", () => {
				resize();
				// console.log("Input Listener");
			});
			new MutationObserver((mutRec2, docObs2) => {
				resize();
				// console.log("Observer");
			}).observe(document.getElementById("searchform"), { attributeFilter: ["class"] });
		}
		frycAPI.forEach(".nlNnsd.ApHyTb .TaA4cd:nth-child(2) .i2L09e.WHcndc", (daElem, daI, daArr) => {
			daElem.click();
		});
		window.scrollTo(0, 0);
		document.body.classList.toggle("google-translate-buttons");

		frycAPI.changeFaviconRes("Google_Logo_dark.png");
	});

	frycAPI.createManualFunctions("Google", {
		funcArr: [
			(name = "3 column view", type = frycAPI_PureState) => {
				const f = new type({
					name: name,
					state: 0,
				});
				f.callBack = function (obj) {
					document.body.classList.toggle("google-3-column");
				};
				return f;
			},
			(name = "Translate buttons", type = frycAPI_PureState) => {
				const f = new type({
					name: name,
					state: 0,
				});
				f.callBack = function (obj) {
					document.body.classList.toggle("google-translate-buttons");
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("www.headspin.io")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.exit-popup.telco-outer-wp {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.ipko.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.kalasoft.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.cli-barmodal-open {
			overflow: scroll;
		}
	`);
} else if (1 && frycAPI_host("www.komputronik.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.mathworks.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	(frycAPI.beforeLoad = function () {
		if (frycAPI.path.startsWith("/matlabcentral/answers/")) { // Changing dates in replies
			frycAPI.createMutObs((mutRecArr0, mutObs0) => {
				if (document.body !== null) {
					frycAPI.createMutObs((mutRecArr, mutObs) => {
						frycAPI.setDefaultDate(`.question-ask-date, .answered-date, .comment-date, .commented-edit-date, .answered-edit-date`, {
							getDate: elem => elem.innerText.replace("on ", "").replace("at ", ""),
							setDate: (elem, data) => {
								elem.innerText = "- ";
								return frycAPI.appendDefaultDateText(elem, data, frycAPI.dateOptsNoTime);
							},
						});
						frycAPI.setDefaultDate(`.question_container .contribution.latest-activity`, {
							getDate: elem => {
								const nod = elem.lastChild;
								nod.remove();
								elem.span = elem.appendChild(frycAPI.elem("span", 0));
								elem.span.innerText = "- ";
								return nod.textContent.trim().replace("on ", "").replace("at ", "");
							},
							setDate: (elem, data) => {
								return frycAPI.appendDefaultDateText(elem.span, data, frycAPI.dateOptsNoTime);
							},
						});
					});
					return true;
				}
			}, { elem: document.documentElement });
		}
	})();

	frycAPI.onLoadSetter(() => {
		if (frycAPI.path === "/support/search.html") { // Deleting highlighting of the search result terms
			frycAPI.createMutObs((mutRecArr, mutObs) => {
				frycAPI.forEach(`p.search_result_title a`, (daElem, daI, daArr) => {
					daElem.href = daElem.href.replace(/\?(.*)/u, "");
				});
			});
		} else if (frycAPI.path === "/support/bugreports/") { // Bug report's date change
			// frycAPI.createMutObs((mutRecArr, mutObs) => {
			// });
			frycAPI.setDefaultDate(`.bug_description > p > em`, {
				getDate: elem => elem.innerText.replace("Modified: ", ""),
				setDate: (elem, data) => {
					elem.innerText = "Modified: ";
					return frycAPI.appendDefaultDateText(elem, data, frycAPI.dateOptsNoTime);
				},
			});
		}
	}, 1);
	frycAPI.onLoadSetter(async () => { // Fixed weird scrolling to bottom behavior
		if (frycAPI.path.startsWith("/matlabcentral/answers/")) {
			await frycAPI.sleep(100);
			window.scrollTo(0, 0);
		}
	}, 2);
} else if (1 && frycAPI_host("www.maxongroup.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.megamatma.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			-webkit-filter: none !important;
			filter: none !important;
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy  7
else if (1 && frycAPI_host("www.messenger.com")) {
	const messageContainer = ".x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.xs83m0k.xjhlixk.xgyuaek";
	const messageBody = ".html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a.x18lvrbx";
	const myMessageBody = ".html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a.xyk4ms5";
	const myMessageContainer = `[role="none"] > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x6ikm8r.x10wlt62 > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x14ctfv`;
	const messageList = ".x78zum5.xdt5ytf.x1iyjqo2.x2lah0s.xl56j7k.x121v3j4";
	const buttonContainer = ".html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x6s0dn4.xl5lk40.x78zum5.x1mqs8db";
	const reactCSS = `[aria-label="Zareaguj"]`;
	const replyCSS = `[aria-label="Odpowiedz"]`;
	const moreCSS = `[aria-label="Więcej"]`;
	const shareCSS = `[aria-label="Prześlij"]`;
	const shareItemCSS = `${shareCSS}[role="menuitem"]`;
	const replyItemCSS = `${replyCSS}[role="menuitem"]`;
	const delCSS = `[aria-label="Usuń wiadomość"][role="menuitem"]`;
	const editCSS = `[aria-label="Edytuj"][role="menuitem"]`;
	const mojaWiadomość = `.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x78zum5.x15zctf7`;
	const iconWidth = `.x1mqs8db`;
	const toolTipSpan = `span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1xmvt09.x1nxh6w3.x1fcty0u.xw2npq5.x4zkp8e.x676frb.xq9mrsl`;
	const timeTooltip = `.xu96u03.xm80bdy.x10l6tqk.x13vifvy:has(${toolTipSpan} > div > div:nth-child(3))`;
	// const conversationTime = `span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs`;
	const personTyping = `.x9f619.x1n2onr6.x1ja2u2z.__fb-dark-mode`;
	const nameElem = `.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x6s0dn4.xozqiw3.x1q0g3np.xexx8yu.xykv574.xbmpl8g.x4cne27.xifccgj`;
	const specialLinkButton = `.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1s688f`;
	const pollUpdateMessage = `${messageList} > :has(${specialLinkButton}):not(:has([aria-label="Głosuj"],[aria-label="Zmień głos"]))`;
	const topBar = `.xfpmyvw.x1u998qt.x1vjfegm`;
	// const privateConv = `[aria-label^="Konwersacja z:"]:not([aria-label*=" i "])`; // First version
	const privateConv = `${topBar} a[href^="https://www.facebook.com"], [aria-label="Wybrane wartości"]:not(:has(>:nth-child(2)))`; // Private is opposite to group
	const personPhoto = `[aria-hidden="true"] > span > img`;
	const convInfo = `[aria-label="Informacje o konwersacji"]`;
	const chatParticipants = `[aria-label="Uczestnicy czatu"]`;
	const chatParticipantsElems = `div:has(> div > div > ${chatParticipants}) > div > [aria-labelledby] > [class]`;
	const personSettings = `[aria-label^="Ustawienia członka dla"]`;
	const messageItem = `[role="menu"] [aria-hidden="false"] div[role="menuitem"][aria-labelledby]`;
	const profileItem = `[role="menu"] [aria-hidden="false"] a[role="menuitem"][aria-labelledby]`;
	const userName = `span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.xt0psk2.x1xmvt09.x6prxxf.xk50ysn.xzsf02u.xq9mrsl`;
	const threadList = `[aria-label="Lista wątków"]`;
	const sidePanelTopLevel = `.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x1qjc9v5.xozqiw3.x1q0g3np.xexx8yu.x85a59c > .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x8mqhxd.x6ikm8r.x10wlt62.xcrg951.xm0m39n.xzhurro.x6gs93r.xpyiiip.x88v6c3.x1qpj6lr.xdhzj85.x1bc3s5a.xczebs5.x4pn7vq.xe95u6g`;
	const unreadMessage = `[aria-hidden="true"][role="button"][tabindex="-1"] > span[data-visualcompletion="ignore"]`;
	frycAPI.injectStyleOnLoad(/*css*/`
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
			& > .react {
				order: 1;
				div { background-image: url("${frycAPI.getResURL("add_reaction.png")}"); }
			}
			& > .reply {
				order: 2;
				div { background-image: url("${frycAPI.getResURL("reply.png")}"); }
			}
			& > .edit {
				display: none;
				order: 3;
				div { background-image: url("${frycAPI.getResURL("edit.png")}"); }
			}
			& > .delete {
				display: none;
				order: 4;
				div { background-image: url("${frycAPI.getResURL("delete.png")}"); }
			}
			& > .share {
				order: 5;
				div { background-image: url("${frycAPI.getResURL("share.png")}"); }
			}
			& > .message {
				/* display: none; */
				order: 6;
				div { background-image: url("${frycAPI.getResURL("message.png")}"); }
			}
			& > .profile {
				/* display: none; */
				order: 7;
				div { background-image: url("${frycAPI.getResURL("profile.png")}"); }
			}
			& > :is(:has(${reactCSS}), :has(${replyCSS}), :has(${moreCSS}), :has(${shareCSS})) {
				width: 0;
				overflow: hidden;
			}
		}
		/* body:not([devicepixelratio="1"]) .przerobiony > .delete div {
			background-image: url("${frycAPI.getResURL("delete.png")}");
		} */
		${messageList} > div:not(:hover) .przerobiony > .myButt {
			display: none !important;
		}
		${mojaWiadomość} .przerobiony > .delete {
			display: block;
		}
		body[editOK="true"] ${messageList} > div:not(.noEdit, :has(~ .noEdit)) ${mojaWiadomość} .przerobiony > .edit {
			display: block;
		}
		/* ${messageList}.noEdit > div:not(.noEdit, :has(~ .noEdit)) .przerobiony > .edit {
			display: block;
		} */
		${iconWidth} {
			width: calc(5 * var(--s1));
		}
		${mojaWiadomość} ${iconWidth} {
			width: calc(4 * var(--s1));
		}
		body:has(${privateConv}) ${iconWidth} {
			width: calc(3 * var(--s1));
		}
		body[editOK="true"] ${messageList} > div:not(.noEdit, :has(~ .noEdit)) ${mojaWiadomość} ${iconWidth} {
			width: calc(5 * var(--s1));
		}

		${timeTooltip} {
			margin-top: -33px;
			pointer-events: none;
		}

		body:has(${messageList} > ${personTyping}) ${nameElem}::after {
			content: "Is typing...";
		}
		${messageList} > ${personTyping} {
			display: none;
		}

		html#facebook { /* [class][class][class][class][class] */
			overflow-y: hidden !important;
		}

		${pollUpdateMessage} {
			display: none;
		}

		${messageBody}::first-letter { /* ${myMessageBody} */
			text-transform: uppercase;
		}

		${myMessageContainer} {
			/* background-color: hsl(0, 0%, 5%); */
			background-color: #616161;
		}

		${userName} {
			user-select: all;
		}

		/* Mirrored Messenger */
		${sidePanelTopLevel} {
			order: -1;
		}
		${threadList} {
			order: 2;
		}
	`);

	frycAPI.onLoadSetter(function () {
		const iconElem = frycAPI.changeFaviconRes("Messenger icon new 256.png");
		// #region //* Change of title
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			if (document.title !== "Messenger") {
				document.title = "Messenger";
			}
		}, { elem: document.querySelector("title"), options: { characterData: true } });
		// #endregion
		// #region //* Edit of options next to the messages
		const edit = frycAPI.elemFromHTML(`<div class="myButt edit"><div></div></div>`);
		const del = frycAPI.elemFromHTML(`<div class="myButt delete"><div></div></div>`);
		const share = frycAPI.elemFromHTML(`<div class="myButt share"><div></div></div>`);
		const react = frycAPI.elemFromHTML(`<div class="myButt react"><div></div></div>`);
		const reply = frycAPI.elemFromHTML(`<div class="myButt reply"><div></div></div>`);
		const message = frycAPI.elemFromHTML(`<div class="myButt message"><div></div></div>`);
		const profile = frycAPI.elemFromHTML(`<div class="myButt profile"><div></div></div>`);

		function clickThroughSidebar(container, action, messageButt, profileButt) {
			let fullName = container.nthParent(5).querySelector(personPhoto)?.alt;
			if (!fullName) {
				// debugger;
				let messageEl = container.parentElement;
				while (messageEl.parentElement.notMatches(messageList)) { // Go up until messageEl is a topmost message container
					messageEl = messageEl.parentElement;
				}
				while (!(fullName = messageEl.querySelector(personPhoto)?.alt)) { // Go to the next message untile photo with alt attribute is found
					messageEl = messageEl.nextEl;
				}
			}
			let convInfoButton;
			frycAPI.createMutObs(() => {
				const participants = document.querySelector(chatParticipants);
				if (!participants) { // Side panel with conversation info is closed so open it
					(convInfoButton = document.querySelector(convInfo)).click();
				} else if (participants.getAttribute("aria-expanded") === "false") { // Conversation participants list is collapsed so expand it
					participants.click();
				} else {
					const thePerson = document.querySelectorAll(chatParticipantsElems)
					.find(el => el.querySelector(`svg[aria-label]`).getAttribute("aria-label") === fullName);
					if (thePerson) {
						thePerson.querySelector(personSettings).click();
						frycAPI.createMutObs(() => {
							const item = document.querySelector(action === "message" ? messageItem : profileItem);
							if (item) {
								item.click();
								convInfoButton?.click?.(); // If the side panel was open before convInfoButton will be undefined. If the panel was closed convInfoButton won't be undefined and will be clicked to close the panel
								return true; // Disconnect mutObs
							}
						});
					} else { // thePerson was not found (they've probably left the group) so delete both personal buttons
						messageButt.remove();
						profileButt.remove();
						frycAPI.copyTxt(fullName);
						frycAPI.sleep(50).then(() => { // Display alert asynchronously to let the mutation obesrver get disconected first
							alert("The person you tried to message or view profile of, left the group. Their full name was copied to clipboard.");
						});
						convInfoButton?.click?.();
					}
					return true; // Disconnect mutObs
				}
			});
		}

		// window.frycAPI_addEventListenerFun("resize", () => {
		// 	document.body.setAttribute("devicePixelRatio", window.devicePixelRatio);
		// })();

		// let oldHref;
		frycAPI.createMutObs(() => {
			if (frycAPI.querySelOk(messageContainer)) {
				frycAPI.sleep(1000).then(() => {
					frycAPI.createMutObs(() => {
						frycAPI.forEach(`${buttonContainer} > ${buttonContainer}:not(.przerobiony)`, container => {
							// loguj("buttonContainer");
							container.frycAPI_addClass("przerobiony");
							container.append(edit.cloneNode(1).frycAPI_addEventListener("click", () => {
								const moreButt = container.querySelector(moreCSS);
								moreButt.click();
								frycAPI.sleep(10).then(() => {
									const editButt = document.querySelector(editCSS);
									if (editButt !== null) {
										editButt.click();
									} else {
										moreButt.click();
										let elem = container.parentElement;
										while (!elem.parentElement.matches(messageList)) {
											elem = elem.parentElement;
										}
										elem.frycAPI_addClass("noEdit");
									}
								});
							}));
							container.append(del.cloneNode(1).frycAPI_addEventListener("click", () => {
								container.querySelector(moreCSS)?.click();
								frycAPI.sleep(10).then(() => document.querySelector(delCSS)?.click());
							}));
							container.append(share.cloneNode(1).frycAPI_addEventListener("click", () => {
								const shareButt = container.querySelector(shareCSS);
								if (shareButt !== null) {
									shareButt.click();
								} else {
									container.querySelector(moreCSS)?.click();
									frycAPI.sleep(10).then(() => document.querySelector(shareItemCSS)?.click());
								}
							}));
							container.append(react.cloneNode(1).frycAPI_addEventListener("click", () => {
								container.querySelector(reactCSS)?.click();
							}));
							container.append(reply.cloneNode(1).frycAPI_addEventListener("click", () => {
								const replyButt = container.querySelector(replyCSS);
								if (replyButt !== null) {
									replyButt.click();
								} else {
									container.querySelector(moreCSS)?.click();
									frycAPI.sleep(10).then(() => document.querySelector(replyItemCSS)?.click());
								}
							}));
							if (frycAPI.querySelNull(privateConv) && container.notMatches(mojaWiadomość)) { // Current conversation is a group and we are in other person's message
								let messageButt, profileButt;
								container.append(messageButt = message.cloneNode(1).frycAPI_addEventListener("click", function () {
									clickThroughSidebar(container, "message", messageButt, profileButt);
								}));
								container.append(profileButt = profile.cloneNode(1).frycAPI_addEventListener("click", function () {
									clickThroughSidebar(container, "profile", messageButt, profileButt);
								}));
							}
						});
						const text = document.querySelector(`[aria-current="page"] abbr[aria-label] > span`)?.innerText;
						if (text !== undefined) document.body.setAttribute("editOK", text.endsWith("min") && parseInt(text.replace(" min", "")) < 15);

						// if (oldHref !== window.location.href) {
						// 	oldHref = window.location.href;
						// 	loguj("Navigation");
						// }
					}, { elem: document.querySelector(messageContainer), options: { childList: true, subtree: true } });
				});
				return true;
			}
		});
		// #endregion
		// #region //* Changing favicon when there are unread messages
		frycAPI.createMutObs(() => {
			if (frycAPI.querySelOk(unreadMessage)) {
				iconElem.href = frycAPI.getResURL("Messenger icon new 256 yellow.png");
			} else {
				iconElem.href = frycAPI.getResURL("Messenger icon new 256.png");
			}
		});
		// #endregion
	});
} else if (1 && frycAPI_host("www.meteo.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
	if (frycAPI.path.startsWith("/um/")) {
		frycAPI.injectStyleOnLoad(/*css*/`
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

		frycAPI.onLoadSetter(() => {
			// https://www.meteo.pl/um/php/meteorogramlet
			document.head.insertAdjacentHTML("afterbegin", `<meta charset="UTF-8 BOM">`);
			frycAPI.changeFaviconRes("meteo_pl.png");

			const fontElem = document.querySelector("#model_napis font");
			if (fontElem !== null) {
				document.title = fontElem
				.innerText
				.match(/^([^,])+/gu)[0]
				.trim() + " - meteo.pl";
			} else {
				document.title = document
				.querySelector("#napis_xy_ne")
				?.innerText
				?.replaceAll(/[\s\u00A0]+/gmu, " ")
				?.trim()
				?.concat(" - meteo.pl") ?? document.title;
			}
			const butt = document.createElement("button");
			butt.classList.add("myButt");
			butt.innerText = "Odśwież stronę";
			butt.setAttribute("onclick", "location.reload();");
			document.querySelector('[href="javascript:print_this()"]')?.insertAdjacentElement("afterend", butt);
		});
	} else if (frycAPI.path.startsWith("/meteogramy")) {
		frycAPI.injectStyleOnLoad(/*css*/`
			.col-12:has(> .archives__advertisement) {
				display: none;
			}
			.forecast-box .date::after {
				content: attr(relTime);
				font-size: 12px;
				line-height: 1;
			}
		`);

		frycAPI.onLoadSetter(() => {
			frycAPI.createMutObs(() => {
				const boxes = document.querySelectorAll(`.forecast-box`);
				if (boxes.length > 0) {
					boxes.forEach(forecastBox => {
						frycAPI.createMutObs(() => {
							if (forecastBox.frycAPI_hasClass("forecast-box--visible")) {
								const hourElem = forecastBox.frycAPI_elemByClass("date__bigger");
								const dayElem = forecastBox.getElementsByClassName("date__classic")[1];
								if (!(hourElem && dayElem)) return;
								const now = new Date();
								const [hour, minute] = hourElem.textContent.split(":").map(Number);
								const [day, month] = dayElem.textContent.split(".").map(Number);
								const then = new Date(now.getFullYear(), month - 1, day, hour, minute);
								let diff = then.getTime() - now.getTime();
								const diffSign = Math.sign(then.getTime() - now.getTime());
								diff = Math.abs(diff);
								const diffHours = Math.floor(diff / 1000 / 60 / 60);
								const diffMinutes = Math.floor(diff / 1000 / 60 - diffHours * 60);
								const diffStr = `${diffHours} h ${diffMinutes} m`;
								// loguj(diffStr);
								forecastBox.firstElementChild.firstElementChild.firstElementChild.setAttribute("relTime", diffSign > 0 ? `- za ${diffStr}` : `- ${diffStr} temu`);
							}
						}, { runCallBack: true, elem: forecastBox, options: { characterData: true, subtree: true } });
					});
					return true;
				}
			});
		});
	}
} else if (0 && frycAPI_host("www.minecraftskins.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			background-color: #9c9c9c
		}
	`);
} else if (0 && frycAPI_host("www.mrexcel.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		[id*="google_ads_iframe"] {
			display:none
		}
	`);
} else if (1 && frycAPI_host("www.obliczeniowo.com.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.pcgamer.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		div.bordeaux-slot.bordeaux-filled-slot {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.pyszne.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		/*
		img {
			filter: invert(1) hue-rotate(180deg) !important;
		}
		tspan.css-1kt4f9t {
			filter: invert(1);
		}
		*/
		._3ZXPf._1lbE7._1nR7l._2AnxL {
			background-image: url(${frycAPI.getResURL("White_64.png")});
		}
	`);
} else if (1 && frycAPI_host("www.quora.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
} else if (1 && frycAPI_host("www.reddit.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	`);
	// var timeSum = 0;
	frycAPI.onLoadSetter(function () {
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			// let startTime = performance.now();
			frycAPI.setDefaultDate(`time`, {
				customStyle: `--tt-x: -18px; cursor: none;`,
			}).mode.relatywnyCzas().toolTipCenter();

			const tree = document.querySelector(`shreddit-comment-tree`);
			if (tree && tree.shadowRoot && tree.shadowRoot.getElementById("shreddit-comment-tree-style") === null) {
				frycAPI.injectStyle(/*css*/`
					section[aria-label="Comments"] {
						gap: 6px;
					}
				`, { elem: tree.shadowRoot, id: "shreddit-comment-tree-style" });
			}

			frycAPI.forEach(`shreddit-comment:not(.poprawnyKomentarz)`, (daElem, daI, daArr) => {
				if (daElem.shadowRoot) { // && daElem.shadowRoot.getElementById("shreddit-comment-style") === null
					frycAPI.injectStyle(/*css*/`
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
					`, { elem: daElem.shadowRoot, id: "shreddit-comment-style" });
					daElem.classList.add("poprawnyKomentarz");
				}
			});

			frycAPI.forEach(`shreddit-post:not(.poprawnyPost)`, (daElem, daI, daArr) => {
				daElem.querySelector(`a[slot="title"]`)?.appendChild(daElem.querySelector(`shreddit-post-flair`));
				daElem.classList.add("poprawnyPost");
			});
			// let endTime = performance.now();
			// timeSum += endTime - startTime;
			// console.log(`Time: ${timeSum.toFixed(1)} ms`);
		});
	});
} else if (1 && frycAPI_host("www.roblox.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.voting-panel .users-vote .vote-details .vote-container .vote-percentage {
			background-color: #02b757 !important;
		}
		.voting-panel .users-vote .vote-details .vote-container .vote-background.has-votes {
			background-color: #E27676 !important;
		}
	`);
} else if (1 && frycAPI_host("www.satisfactorytools.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed !important;
		}
	`);
} else if (1 && frycAPI_host("www.tenforums.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			background-color: #2a2a2a;
		}
	`);
} else if (1 && frycAPI_host("www.tme.eu")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.czerwony {
			color: red;
		}

		div#select_list_42 {
			height: 500px;
		}
	`);
} else if (1 && frycAPI_host("www.tutorialspoint.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		._adr_abp_container {
			display: none !important;
		}

		div#google-right-ads {
			display: none !important;
		}
	`);
} else if (1 && frycAPI_host("www.ups.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		div#ups-alerts {
			color: black;
		}
	`);
} else if (1 && frycAPI_host("www.w3schools.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		#colormixer table tbody tr:nth-child(11) {
			color: red
		}
	`);

	frycAPI.onLoadSetter(() => {
		const lead = document.getElementById("mainLeaderboard");
		if (lead !== null && lead.nextElementSibling.nodeName === "H1" && lead.nextElementSibling.innerHTML === "How TO - Sort a Table") {
			// loguj("Hello");
			frycAPI.makeTableSortable(document.getElementById("myTable"));
		}
	});
} else if (1 && frycAPI_host("www.when2meet.com")) {
	const funkcje = "Konwertuj 12h na 24h";
	frycAPI.injectStyleOnLoad(/*css*/`
		:is(#YouGrid, #GroupGrid) [style="text-align:right;width:44px;height:9;font-size:10px;margin:4px 4px 0px 0px;"] {
			text-align: left !important;
			width: fit-content !important;
			margin: 4px 0px 4px 13px !important;
		}
		:is(#YouGrid, #GroupGrid) [style="display:inline-block;*display:inline;zoom:1; vertical-align:bottom;text-align:right;"] > div > div {
			border-left: none !important;
		}
	`);

	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(`[style="text-align:right;width:44px;height:9;font-size:10px;margin:4px 4px 0px 0px;"]`, godzElem => {
			godzElem.innerText = (new Date("11 30 2022 " + godzElem.innerText.replace(/\s+/gu, " ").trim())).toLocaleTimeString().slice(0, -3);
		});
	});
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy  8
else if (1 && frycAPI_host("www.worldometers.info")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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

	let disableEndScreen;

	(frycAPI.beforeLoad = function () {
		// Delete comments
		document.addEventListener("DOMContentLoaded", function (event) {
			frycAPI.clean(document.body);
		});
	})();

	frycAPI.onLoadSetter(() => {
		// YT Playlist Element Delete Button
		(async () => {
			await frycAPI.sleep(2000);
			if (frycAPI.path.startsWith("/playlist")) {
				const esval = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="mySVG"><path d="M11,17H9V8h2V17z M15,8h-2v9h2V8z M19,4v1h-1v16H6V5H5V4h4V3h6v1H19z M17,5H7v15h10V5z" class="style-scope yt-icon"></path></svg>';
				frycAPI.forEach(`ytd-menu-renderer.style-scope.ytd-playlist-video-renderer`, function (daElem) {
					const trDiv = document.createElement("div");
					trDiv.innerHTML = esval;
					trDiv.classList.add("myDIV");
					// trDiv.onclick = ytRemove;
					daElem.insertAdjacentElement("afterbegin", trDiv).addEventListener("click", async function ytRemove() {
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

		disableEndScreen = frycAPI.injectStyle(/*css*/`
			.ytp-ce-element {
				display: none;
			}
		`);
	});

	frycAPI.createManualFunctions("YouTube", {
		funcArr: [
			(name = "End Screen", type = frycAPI_PureState) => {
				const f = new type({
					name: name,
					state: 0,
				});
				f.callBack = function (obj) {
					disableEndScreen.toggle();
				};
				return f;
			},
		],
	});
} else if (1 && frycAPI_host("wyniki.diag.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		img {
			filter: invert(1);
		}
	`);
} else if (frycAPI_host("www.rp.pl")) {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyleOnLoad(/*css*/`
		.App-Content>div>svg>text:first-of-type {
			font-family: IBM Plex Mono;
		}
	`);
} else if (frycAPI_host("www.mchtr.pw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		*:not(.naglowek-middle.logo *,[title="Szukaj"] *) {
			font-family: IBM Plex Sans Condensed;
		}
	`);
} else if (frycAPI_host("www.java.com")) {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyleOnLoad(/*css*/`
	`);

	(frycAPI.beforeLoad = function () {
		frycAPI.colorSchemeDark = 1;
	})();
} else if (frycAPI_host("www.overleaf.com")) {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		body {
			margin: auto;
			font-family: IBM Plex Sans Condensed;
		}
	`);
} else if (frycAPI_host("www.ctan.org", "ctan.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.onLoadSetter(() => {
		const frameDoc = window.frames["HelpFrame"].frames["ContentFrame"].frames["ContentViewFrame"].document; // eslint-disable-line dot-notation
		// window.frames["ContentViewFrame"].document
		// document.querySelector("frame[name='ContentViewFrame']").contentDocument
		// if ((frameDoc !== null) && ((myh1 = frameDoc.querySelector("div.header>h1.title")) !== null) && (myh1.innerHTML === "Class DefaultCodeFormatterConstants")) {
		if (frameDoc !== null && frameDoc.querySelector("div.header>h1.title")?.innerHTML === "Class DefaultCodeFormatterConstants") {
			// Specifically for this website: https://help.eclipse.org/latest/index.jsp?topic=%2Forg.eclipse.jdt.doc.isv%2Freference%2Fapi%2Forg%2Feclipse%2Fjdt%2Fcore%2Fformatter%2FDefaultCodeFormatterConstants.html
			frycAPI.injectStyle(/*css*/`
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
			`, { elem: frameDoc.documentElement });
			const myTable = frameDoc.querySelector("#field-summary>.summary-table");
			const sortFun = function () {
				const t0 = performance.now();

				const docFrag = document.createDocumentFragment();
				Array.prototype.slice.call(myTable.querySelectorAll(`.${this.classList[1]}:not(.table-header)`), 0).sort(function mySort(a, b) {
					const a1 = a.innerText;
					const b1 = b.innerText;
					return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
				}).forEach(function forEachAfterSort(daElem, daI, daArr) {
					daElem.row.forEach(function forEachElemInRow(daElem1, daI1, daArr1) {
						docFrag.appendChild(daElem1);
					});
				});
				myTable.appendChild(docFrag);
				myTable.querySelector(".posortowana")?.classList.remove("posortowana");
				this.classList.add("posortowana");

				const t1 = performance.now();
				loguj(`${(t1 - t0).toFixed(1)} ms`);
			};
			/*
			let newTable = myTable.appendChild(document.createElement("table").frycAPI_addClass("myTable"));
			let myDiv = document.createElement("tr");
			myTable.querySelectorAll(":scope>div").forEach(function (daElem, daI, daArr) {
				myDiv.appendChild(document.createElement(daI >= 3 ? "td" : "th")).appendChild(daElem);
				if (myDiv.childElementCount === 3) {
					newTable.appendChild(myDiv);
					myDiv = document.createElement("tr");
				}
			});
			*/
			myTable.querySelectorAll(".table-header:is(.col-first, .col-second, .col-last)").forEach(function (daElem, daI, daArr) {
				daElem.addEventListener("click", sortFun);
			});
			myTable.querySelectorAll(":scope>div:not(.table-header)").forEach(function (daElem, daI, daArr) {
				if (daElem.classList.contains("col-first")) {
					daElem.row = [daElem, daElem.nextElementSibling, daElem.nextElementSibling.nextElementSibling];
				} else if (daElem.classList.contains("col-second")) {
					daElem.row = [daElem.previousElementSibling, daElem, daElem.nextElementSibling];
				} else if (daElem.classList.contains("col-last")) {
					daElem.row = [daElem.previousElementSibling.previousElementSibling, daElem.previousElementSibling, daElem];
				}
			});
		}
	});
} else if (frycAPI_host("docs.oracle.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	frycAPI.onLoadSetter(() => {
		const mainFlow = document.getElementById("MainFlow");
		try {
			mainFlow.insertAdjacentElement("afterend",
				document.createElement("div").frycAPI_addClass("myDiv"))
			.append(document.getElementById("LeftBar"), mainFlow
			);
		} catch (error) { }

		try {
			document.querySelector(".description")
			.frycAPI_insertAdjacentElement("afterbegin", document.querySelector("ul.inheritance"))
			.insertAdjacentElement("afterbegin", document.querySelector(".header"));
		} catch (error) { }

		if (frycAPI.path.frycAPI_includesAny("%2Fdocs%2F", "/docs/")) {
			frycAPI.changeFaviconRes("ORACLE.png");
		}
	});
} else if (frycAPI_host("npskills.github.io")) { // NINE PARCHMENTS SKILL CALCULATOR
	frycAPI.injectStyleOnLoad(/*css*/`
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
		frycAPI.forEach("legend", (daElem, daI, daArr) => {
			daElem.previousElementSibling.insertAdjacentElement("afterbegin", daElem);
		});
	});
} else if (1 && frycAPI_host("www.konesso.pl")) {
	frycAPI.injectStyle(/*css*/`
		div#preloader {
			display: none;
		}
		svg#loader {
			display: none;
		}
	`, { elem: document.documentElement });

	(frycAPI.beforeLoad = function () {
		// frycAPI.colorSchemeDark = 1;
	})();

	frycAPI.onLoadSetter(() => {
	});
} else if (frycAPI_host("barotraumagame.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
		:root {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (frycAPI_host("steamspy.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img[alt="logo"] {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy  9
else if (frycAPI_host("www.fakrosno.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.spring-middle>img {
			filter: invert(1) hue-rotate(180deg) !important;
		}
	`);
} else if (frycAPI_host("www.arrowheadgamestudios.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`
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
		img#image {
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
		header#top menu.main {
			padding-left: 0;
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
		header#top menu.main li.current > a {
			border-radius: 6px 6px 0 0;
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
			&::before {
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
		.desc .pool-diff-graph {
			padding: 1px;
			padding-top: 0;
		}
		.loading-gif {
			filter: invert(1);
		}
		div.paginator + .loading-gif {
			width: 100px;
		}
		.desc .loading-gif {
			height: 30px;
			border: none !important;
			display: block;
		}
		.pokaż-wykres {
			width: fit-content;
		}
		.pokaż-info {
			cursor: pointer;
			&:hover {
				background-color: hsla(0, 0%, 100%, 10%);
			}
		}

		form.post-search-form {
			display: flex;
			gap: 5px;
		}
		#tags {
			flex-grow: 1;
		}
	`);

	const pathName = frycAPI.path;

	frycAPI.onLoadSetter(() => {
		if (pathName.startsWith("/posts/")) {
			const defaultScroll = () => {
				window.scrollTo(0, document.documentElement.scrollTop + (document.getElementById("nav-links-top") ?? document.getElementById("image")).getBoundingClientRect().y - 1);
			};
			document.querySelector(`a.next[rel="next"]`)?.setAttribute("accesskey", "a");
			document.querySelector(`a.prev[rel="prev"]`)?.setAttribute("accesskey", "b");
			(document.body.appendChild(document.createElement("div"))
			.frycAPI_setAttribute("id", "mojScroll")
			.frycAPI_setInnerHTML("Deafult scroll")
			.onclick = defaultScroll)();

			document.getElementById("image").addEventListener("load", defaultScroll);

			// const download = document.querySelector(`#image-download-link > a.button`);
			// download.setAttribute("onclick", `location.href = '${download.getAttribute("href")}'`);
			// download.setAttribute("href", "");
		} else if (pathName === "/posts" || pathName.startsWith("/posts?")) {
			document.getElementById("c-posts")?.insertAdjacentElement?.("beforebegin", document.querySelector("form.post-search-form"));
			window.scrollTo(0, 0);
			const search = document.querySelector(`button[type="submit"][title="Search"]`);
			document.getElementById("tags").addEventListener("keydown", e => {
				if (e.key === "Enter") {
					search.click();
				}
			});
		} else if (pathName.startsWith("/pools/") && !pathName.startsWith("/pools/new")) {
			const ratArr = [
				`<div$class="txt-col-s">Safe        `,
				`<div$class="txt-col-q">Questionable`,
				`<div$class="txt-col-e">Explicit    `,
			];
			const getRatStr = function (psts) {
				const ratCount = [0, 0, 0];
				let rStr = "";
				let score = 0;
				psts.forEach(post => {
					switch (post.rating) {
						case "s": ratCount[0]++; break;
						case "q": ratCount[1]++; break;
						case "e": ratCount[2]++; break;
					}
					score += post.score.total;
				});
				const ratPadd = psts.length.toString().length;
				ratCount.forEach((rat, i) => {
					rStr += `${ratArr[i]} : ${ratCount[i].toString().padStart(ratPadd)} | ${(ratCount[i] / psts.length * 100).toFixed(1).padStart(5)} %</div>`;
				});
				rStr += `<div$class="txt-col-ś">Średni wynik ↑: ${(score / psts.length).toFixed(1)}</div>`;
				return rStr;
			};
			let posts, datArr, ratStr = "", poolGraph, e621_get_pool_dates, left, right;

			if (pathName.startsWith("/pools/gallery")) {
				const info = frycAPI.elemFromHTML(`<div class="pokaż-info">Info</div>`);
				frycAPI.forEach(`article.post-preview .desc`, desc => {
					desc.appendChild(info.cloneNode(1)).addEventListener("click", function (e) {
						this.remove();
						const img = frycAPI.insertLoadingGif(desc);
						const poolID = desc.firstElementChild.getAttribute("href").replace("/pools/", "");
						frycAPI.readFile(`https://e621.net/posts.json?tags=pool:${poolID}&limit=1000`).then(resp => {
							desc.frycAPI_appendHTML(`<div class="pool-diff-graph">${
								`Liczba postów: ${resp.posts.length >= 320 ? `<b>${resp.posts.length}</b>` : resp.posts.length} | 100.0 %<br>${getRatStr(resp.posts)}`
								.replaceAll(" ", "&nbsp").replaceAll("$", " ")
							}</div>`);
							img.remove();
						});
					});
				});
			} else {
				const czytelnyCzas = function (czas) {
					return frycAPI.printRelTime(czas, { czyDiff: false, lang: "pol", space: true, ago: false, leftAlign: true }).padStart(12);
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
				const paginator = document.querySelector(`div.paginator`);
				const poolID = pathName.split("/").slice(-1);
				const handleClick = function (e) {
					e.preventDefault();
					if (e.type === "click") {
						left = Number(this.getAttribute("num"));
						poolGraph.querySelector(`.left`)?.frycAPI_removeClass("left");
						this.frycAPI_addClass("left");
					} else {
						right = Number(this.getAttribute("num"));
						poolGraph.querySelector(`.right`)?.frycAPI_removeClass("right");
						this.frycAPI_addClass("right");
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

					if (posts === undefined) {
						const img = frycAPI.insertLoadingGif(paginator, "afterend");
						posts = (await frycAPI.readFile(`https://e621.net/posts.json?tags=pool:${poolID}&limit=1000`)).posts; // eslint-disable-line require-atomic-updates
						datArr ??= (
							posts.map(elem => [new Date(elem.created_at).getTime(), elem.id]).sort((a, b) => a[0] - b[0])
							.map((daElem, daI) => {
								// Post numbers chronologically
								// document.getElementById("post_" + daElem[1])?.querySelector(".post-score").insertAdjacentElement("afterbegin",document.createElement("span")).frycAPI_setInnerHTML("#" + (daI + 1));
								return daElem[0];
							})
						);
						ratStr = getRatStr(posts);
						img.remove();
					}
					const ostatniaData = datArr.at(-1);

					/* Post numbers by order in the page + dates from information on the page
					// var datArr = [];
					document.querySelectorAll("#posts-container>article").forEach(function (daElem, daI, daArr) {
						daElem.querySelector(".post-score").insertAdjacentElement("afterbegin",document.createElement("span")).innerHTML = "#" + (daI + 1);
						// datArr.push(new Date(daElem.querySelector("img").title.match(/(?<=Date: ).*(?=$)/gm)).getTime());
					});
					*/

					const diffArr = [];
					for (let i = 1; i < datArr.length; i++) {
						diffArr.push(Math.max(datArr[i] - datArr[i - 1], 0));
					}

					if (kon === undefined || kon > diffArr.length) {
						kon = diffArr.length;
					}
					if (arguments.length === 2) {
						pocz--;
					}
					const diffArrMax = Math.max(...diffArr.slice(pocz, kon));

					const diffArrMean = (datArr[kon] - datArr[pocz]) / (kon - pocz);

					let wykres = ""; const padding = kon.toString().length;
					for (let i = pocz; i < kon; i++) {
						const ile = Math.round(diffArr[i] / diffArrMax * 100);
						wykres += `<div$class="diff-number"$num="${i + 1}">${String(i + 1).padStart(padding, " ")}.</div> ${czytelnyCzas(diffArr[i])} [${"".padEnd(ile, "|") + "".padEnd(100 - ile, " ")}]\n`;
					}
					const obecnyCzas = Date.now();
					const nowaStrona = new Date(ostatniaData + diffArrMean);
					const nowaStronaDiff = nowaStrona.getTime() - obecnyCzas;
					let nowaStronaStr;
					if (nowaStronaDiff >= 0) {
						nowaStronaStr = `za <b>${czytelnyCzas(nowaStronaDiff).trim()}</b>`;
					} else {
						nowaStronaStr = `powinna być <b>${czytelnyCzas(-nowaStronaDiff).trim()}</b> temu`;
					}

					// if (frycAPI.pool === undefined) {
					// 	frycAPI.pool = await frycAPI.readFile(`https://e621.net/pools/${poolID}.json`); // eslint-disable-line require-atomic-updates
					// 	frycAPI.pool.post_ids.forEach((daElem, daI, daArr) => {
					// 		document.getElementById("post_" + daElem)?.querySelector(".post-score").insertAdjacentElement("afterbegin", document.createElement("span")).frycAPI_setInnerHTML("#" + (daI + 1));
					// 	});
					// }

					let overLimitInfo = "<b>";
					// if (frycAPI.pool.post_count > 320) overLimitInfo += "\nUwaga! Przekroczono limit postów (320). Dane mogą być niedokładne.";

					/*
					const pageCount = document.querySelector(`div.paginator > menu`).childElementCount - 2;
					const currPage = document.querySelector(`li.current-page`).frycAPI_childIndex;
					const postsOnPage = document.getElementById("posts-container").childElementCount;
					if (pageCount === 3) {
						if (currPage === 3 && postsOnPage > 20) {
							overLimitInfo += "\nUwaga! Przekroczono limit postów (320). Dane mogą być niedokładne.";
						} else {
							overLimitInfo += "\nJest szansa, że przekroczono limit postów (320). Dane mają szansę być niedokładne.";
						}
					} else if (pageCount > 3) {
						overLimitInfo += "\nUwaga! Przekroczono limit postów (320). Dane mogą być niedokładne.";
					} */

					if (datArr.length >= 320) overLimitInfo += "<br>Uwaga! Osiągnięto limit postów (320). Dane mogą być niedokładne.";
					overLimitInfo += "</b>";

					let innerStr = "";
					innerStr += `Średni czas pomiędzy wydaniami kolejnych stron wyniósł: <b>${czytelnyCzas(diffArrMean).trim()}</b>
						Ostatnia strona ukazała się: <b>${new Date(ostatniaData).toLocaleString("pl-PL", opcje)}</b> - <b>${czytelnyCzas(obecnyCzas - ostatniaData).trim()}</b> temu
						Następna strona ukaże się:   <b>${nowaStrona.toLocaleString("pl-PL", opcje)}</b> - ${nowaStronaStr}${overLimitInfo}<br>
						Liczba postów: ${posts.length} | 100.0 %<br>${ratStr}`.replaceAll(/\t/gm, "");
					innerStr += `<br><div$id="reset-graph">Wykres</div> odległości czasowych pomiędzy kolejnymi stronami komiksu:<br>`;
					innerStr += `${wykres}`.replaceAll(/\t/gm, "");
					poolGraph?.remove();
					poolGraph = paginator.frycAPI_insertHTML("afterend", `<div class="pool-diff-graph">${innerStr.replaceAll(/\n/gm, "<br>").replaceAll(" ", "&nbsp").replaceAll("$", " ")}</div>`);
					left = undefined;
					right = undefined;

					document.getElementById(`reset-graph`).addEventListener("click", function (e) {
						e621_get_pool_dates();
					});
					poolGraph.querySelectorAll(`.diff-number`).forEach(num => {
						num.addEventListener("click", handleClick);
						num.addEventListener("contextmenu", handleClick);
					});
					// loguj("OK");
				};
				const obserwowanePoole = [20262, 35222, 33649, 37755, 38959];
				if (obserwowanePoole.indexOf(Number(poolID)) >= 0) {
					e621_get_pool_dates();
				} else {
					paginator.frycAPI_insertHTML("afterend", `<div class="pokaż-wykres">Pokaż wykres</div>`).addEventListener("click", function (e) {
						this.remove();
						e621_get_pool_dates();
					});
				}
			}
		}

		// #region //* Naprawa dat
		frycAPI.setDefaultDate(`:is(#post-information, .post-time) time`, {
			dateEnumMode: frycAPI.setDefaultDateEnum.mode.relatywnyCzas,
			dateEnumStyle: frycAPI.setDefaultDateEnum.style.floatLeft,
		});
		frycAPI.setDefaultDate(`time`);
		// #endregion
	});

	if (pathName.startsWith("/posts")) {
		function getPostIDs() {
			let str = "";
			frycAPI.forEach(`article.post-preview`, (daElem, daI, daArr) => {
				str += `~id:${daElem.getAttribute("data-id")} `;
			});
			return str.trim();
		}
		frycAPI.createManualFunctions("e621", {
			funcArr: [
				(name = "Visible posts to link, click", type = frycAPI_Normal) => {
					const f = new type({ name });
					f.callBack = function (obj) {
						document.getElementById("tags").value = getPostIDs();
						document.querySelector(`#search-box form button`).click();
					};
					return f;
				},
				(name = "Visible posts to link, copy", type = frycAPI_Normal) => {
					const f = new type({ name });
					f.callBack = function (obj) {
						frycAPI.ctrlC("https://e621.net/posts?tags=" + encodeURIComponent(getPostIDs().replaceAll(/\s+/g, "+")));
						f.name = "Copied!";
					};
					return f;
				},
			],
		});
	}
} else if (frycAPI_host("static1.e926.net", "static1.e621.net")) {
	frycAPI.onLoadSetter(function () {
		frycAPI.changeFaviconRes("e621_Logo.png");
	});
} else if (frycAPI_host("e-hentai.org")) {
	if (frycAPI.path.startsWith("/s/")) {
		frycAPI.injectStyle(/*css*/`
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

		frycAPI.onLoadSetter(() => {
			document.querySelector("#i1.sni>h1").addEventListener("click", event => {
				event.target.classList.toggle("duży");
			});
		});
	}
} else if (frycAPI_host("www.sqlite.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
			content: url(${frycAPI.getResURL("SQLite.png")});
			width: 220px;
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (frycAPI_host("s.surveylegend.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.is-textbox-in-app {
			user-select: auto !important;
		}
	`);
} else if (frycAPI_host("issuetracker.google.com", "issues.chromium.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		*:not(textarea, textarea *, code, code *) {
			font-family: IBM Plex Sans Condensed !important;
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
	`);

	const daSel = el => (el.nodeType === Node.TEXT_NODE && el.textContent.trim() === "") || el.nodeName === "BR";
	(frycAPI.beforeLoad = function () {
		frycAPI.createMutObs((mutRecArr0, mutObs0) => {
			if (document.body !== null) {
				frycAPI.setDefaultDateStyle().mode.relatywnyCzas().toolTipLeft();
				frycAPI.createMutObs((mutRecArr, mutObs) => {
					// #region //* Zmiana daty
					frycAPI.setDefaultDate(`:is(b-issues-grid, b-issues-table) b-formatted-date-time > time`, {
						customStyle: `cursor: none;`,
						dateEnumStyle: frycAPI.setDefaultDateEnum.style.floatLeft,
					});
					frycAPI.setDefaultDate(`b-formatted-date-time > time`, {
						customStyle: `cursor: none;`, // --tt-y: 10px; --tt-x: 10px;
					});
					// #endregion
					// #region //* Usunięcie nic niewnoszących ("zduplikowanych") części nazwy użytkowników
					frycAPI.forEach(`h4.bv2-event-user:not(:has(.hideId))`, (daElem, daI, daArr) => {
						const userName = daElem.querySelector(`b-user-display-name`);
						const userId = daElem.querySelector(`span.bv2-event-user-id`);
						if (userName === null || userId === null) return;
						if (userName.innerText.trim() === userId.innerText.trim().slice(1, -1)) {
							userId.frycAPI_addClass("hideId");
						}
					});
					// #endregion
					// #region //* Zmniejszenie nic niewnoszących komentarzy [Empty comment from Monorail migration]
					frycAPI.forEach(`.bv2-edit-issue-history-stream > div`, daElem => {
						// const msgText = daElem.querySelector(`:scope .bv2-event-note-container`);
						if (daElem.querySelector(`:scope .bv2-event-note-container`).innerText === "[Empty comment from Monorail migration]") {
							daElem.frycAPI_addClass("only-monorail-migration");
						}
					});
					// #endregion
					// #region //* Zaawansowany trim() na komentarzach
					frycAPI.forEach(`.bv2-event-content-cell .child`, daElem => {
						const arr = [...daElem.childNodes];
						for (let i = 0; i < arr.length; i++) {
							const el = arr[i];
							if (daSel(el)) {
								el.remove();
							} else {
								break;
							}
						}
						for (let i = arr.length - 1; i >= 0; i--) {
							const el = arr[i];
							if (daSel(el)) {
								el.remove();
							} else {
								break;
							}
						}
					});
					// #endregion
				});
				return true;
			}
		}, { elem: document.documentElement });
	})();

	// frycAPI.onLoadSetter(correctTimeValues);
} else if (frycAPI_host("www.pw.edu.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		img[alt="Strona główna"] {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
} else if (frycAPI_host("forums.factorio.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed;
		}
	`);

	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(`p.author time`, (daElem, daI, daArr) => {
			const data = new Date(daElem.getAttribute("datetime"));
			daElem.innerHTML = frycAPI.printDate(data);
			daElem.setAttribute("title", frycAPI.printRelTime(data));
		});
		frycAPI.forEach(`dd.profile-joined`, (daElem, daI, daArr) => {
			const node = daElem.frycAPI_getFirstTextNode();
			const data = new Date(node.textContent.trim());
			node.nodeValue = " " + frycAPI.printDate(data);
			daElem.setAttribute("title", frycAPI.printRelTime(data));
		});
	});
} else if (frycAPI_host("factorio.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		*:not(.header-links > div > a.button.flex.flex-space-between *):not(.user-controls.links.flex.flex-items-baseline.flex-end *) {
			font-family: IBM Plex Sans Condensed !important;
		}
	`);
} else if (frycAPI_host("github.com", "gist.github.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.dspNONE {
			display: none;
		}
		:root {
			--wysokość: 13px;
			--padd: 5px;
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
				font-family: var(--fontStack-monospace, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace);
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

	frycAPI.onLoadSetter(() => {
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			// const startTime = performance.now();

			// let relTimeCount = 0;
			frycAPI.forEach(`relative-time`, (daElem, daI, daArr) => { // :not(.poprawnyCzas)
				if (daElem.shadowRoot.querySelector(`span.dspNONE`) === null) {
					const data = new Date(daElem.getAttribute("datetime"));
					daElem.shadowRoot.innerHTML = frycAPI.printRelTime(data) + `<span class="dspNONE"></span>`;
					daElem.setAttribute("title", frycAPI.printDate(data));
					// daElem.frycAPI_addClass("poprawnyCzas");
					// relTimeCount++;
				}
			});

			const myBeforeTextCount = frycAPI.forEach(`div:not([my-before-text])>pre:first-child`, (daElem, daI, daArr) => { // Code block names
				const par = daElem.parentElement;
				par.setAttribute("my-before-text",
					par.classList.notContains("highlight") ? "Plain text" :
					[...par.classList]
					.find(c => c.startsWith("highlight-source-") || c.startsWith("highlight-text-"))
					.replace("highlight-source-", "")
					.replace("highlight-text-", "")
					.toUpperCase()
					.replace("-BASIC", "")
				);
			}).length;

			frycAPI.forEach(`body:has(span.author) .file:not(:has(.file-header .file-info[my-before-text])) [itemprop="text"].Box-body`, (daElem, daI, daArr) => { // File languages
				daElem.parentElement.querySelector(`.file-header .file-info`).setAttribute("my-before-text",
					[...daElem.classList]
					.find(c => c.startsWith("type-"))
					.replace("type-", "")
					// .frycAPI_toTitleCase()
					.toUpperCase()
				);
			});

			// const endTime = performance.now();
			// loguj(`relative-time: ${relTimeCount}, my-before-text: ${myBeforeTextCount}, ${(endTime - startTime).toFixed(1)} ms`);
		}, { options: { attributes: true } });
	});
} else if (frycAPI_host("support.google.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
	`);

	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(`sc-tailwind-thread-post_header-post-date`, (daElem, daI, daArr) => {
			const htmlBlob = daElem.querySelector(`html-blob`);
			const data = new Date(htmlBlob.innerText);
			daElem.querySelector(`.scTailwindThreadPost_headerPostdateroot`).innerHTML = frycAPI.printRelTime(data);
			htmlBlob.innerText = frycAPI.printDate(data);
		});
	});
} else if (frycAPI_host("okazja-hurtownia.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.col2-set.addresses .woocommerce-column--billing-address.col-1,
		.col2-set.addresses .woocommerce-column--shipping-address.col-2 {
			max-width: unset;
		}
	`);
} else if (frycAPI_hostIncludes("aliexpress.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	frycAPI.injectStyleOnLoad(/*css*/`

	`);

	frycAPI.onLoadSetter(function () {
		const title = document.title;
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			if (document.title !== title) {
				document.title = title;
			}
		}, { elem: document.querySelector("title"), options: { characterData: true } });
	});
} else if (1 && frycAPI_hostIncludes("autodesk.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
		frycAPI.injectStyleOnLoad(/*css*/`
			.uh-logo-container svg.uh-autodesk-logo {
				filter: invert(1) hue-rotate(180deg);
			}
		`);
	}

	document.addEventListener("DOMContentLoaded", () => {
		frycAPI.forEach(`span.DateTime`, (daElem, daI, daArr) => {
			const dateComps = daElem.innerText.trim().replaceAll(/\s+/gm, " ").split(" ");
			if (dateComps.length === 1) {
				dateComps[1] = "0:0";
				dateComps[2] = "AM";
			}
			const timeComps = dateComps[1].split(":").map(a => Number(a));
			const korekta = (() => {
				if (dateComps[2] === "PM") {
					return (timeComps[0] === 12 ? 0 : 3600 * 12);
				} else {
					return (timeComps[0] === 12 ? -3600 * 12 : 0);
				}
			})();
			const data = new Date(new Date(dateComps[0].replaceAll(/[^\d-]/gm, "")).getTime() + 1000 * (timeComps[0] * 3600 + timeComps[1] * 60 + korekta + 9 * 3600));
			daElem.innerHTML = frycAPI.printRelTime(data, { compact: 1 });
			daElem.setAttribute("title", frycAPI.printDate(data));
		});
		frycAPI.forEach(`p`, (daElem, daI, daArr) => {
			if (daElem.innerHTML === "&nbsp;") {
				daElem.frycAPI_addClass("tylko-nbsp");
				return;
			}
			const chld = daElem.childNodes;
			for (let i = 0; i < chld.length; i++) {
				if (chld[i].nodeName === "BR") {
					chld[i].frycAPI_addClass("bad-br-node");
				} else {
					break;
				}
			}
			for (let i = chld.length - 1; i >= 0; i--) {
				if (chld[i].nodeName === "BR") {
					chld[i].frycAPI_addClass("bad-br-node");
				} else {
					break;
				}
			}
		});
	});
	frycAPI.onLoadSetter(function () {
		frycAPI.changeFaviconRes((() => {
			switch (frycAPI_host()) {
				case "forums.autodesk.com": return "AutodeskOrange.png";
				case "help.autodesk.com": return "AutodeskBlue.png";
				default: return "Autodesk.png";
			}
		})());
		if (frycAPI_host("help.autodesk.com")) {
			frycAPI.injectStyle(/*css*/`
				tr.header>td {
					white-space: nowrap;
				}
			`);
			frycAPI.createMutObs((mutRecArr, mutObs) => {
				// loguj("tableFun");
				frycAPI.forEach(`table:not(.sortowalnaTabela)`, daElem => {
					daElem.querySelectorAll(`tr.header>td`).forEach(daElem1 => {
						if (daElem1.innerText.trim() === "Value") daElem1.setAttribute("krytSort", "numeric");
					});
					frycAPI.makeTableSortable(daElem, "tr", "td", "tr.header>td");
				});
			});
		}
	});
} else if (frycAPI_host("allegro.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	`);

	frycAPI.onLoadSetter(function () {
		const path = window.location.pathname;
		if (path.startsWith("/koszyk")) {
			frycAPI.createMutObs((mutRecArr, mutObs) => {
				frycAPI.forEach(`cart div > section`, sekcja => {
					let suma = 0;
					sekcja.querySelectorAll(`.pr127m.pro3hx`).forEach(cena => {
						suma += Number(cena.innerText.replace(/.zł/, "").replace(",", "."));
					});
					const dostawa = sekcja.querySelector(`.mpof_uk.munh_4.pr127m`);
					if (dostawa !== null) suma += Number(dostawa.innerText.replace(/.zł/, "").replace(",", "."));
					const sumaParent = sekcja.querySelector(`[data-box-name="baby-search"]`);
					if (sumaParent !== null) {
						suma = `Suma: ${suma.toFixed(2).replace(".", ",")} zł`;
						const sumaElem = sumaParent.querySelector(`.suma-od-jednego-sprzedawcy`);
						if (sumaElem !== null) {
							sumaElem.innerText = suma;
						} else {
							sumaParent.frycAPI_appendHTML(`<div class="suma-od-jednego-sprzedawcy">${suma}</div>`);
						}
					}
				});
			}, { elem: document.querySelector(`cart cart-header + div`) });
		}
	}, 2);

	frycAPI.createManualFunctions("Opinie o produkcie", {
		funcArr: [
			(name = "Ukryj opinie bez zdjęć", type = frycAPI_PureState) => {
				const f = new type({
					name: name,
					stateDesc: ["Opinie bez zdjęć: WIDOCZNE", "Opinie bez zdjęć: UKRYTE"],
					state: 0,
				});
				f.callBack = function (obj) {
					document.body.classList.toggle("ukryj-opinie-bez-zdjęć");
				};
				return f;
			},
		],
	});
} // eslint-disable-line brace-style
// #endregion
// #region //* IFy 10
else if (1 && frycAPI_host("knucklecracker.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
	`);

	(frycAPI.beforeLoad = function () {
		if (frycAPI.path.startsWith("/blog/")) {
			frycAPI.colorSchemeDark = 1;
			frycAPI.injectStyleOnLoad(/*css*/`
				body.custom-background {
					background-image: none;
				}
			`);
		}
	})();

	frycAPI.onLoadSetter(() => {
		if (frycAPI.path.startsWith("/forums/")) {
			const t = document.querySelector(".user time");
			const theirDate = new Date(t.innerHTML).getTime();
			const myDate = new Date(t.getAttribute("datetime")).getTime();
			// let diff = new Date().getTimezoneOffset() * (-1) * 60 * 1000 - (myDate - theirDate);
			const diff = myDate - theirDate;
			t.innerHTML = "Current time: " + frycAPI.printDate(new Date(myDate));

			frycAPI.forEach(`div.postinfo > a.smalltext, .lastpost > p > a:first-child`, (daElem, daI, daArr) => {
				let data = new Date(daElem.innerText);
				if (frycAPI.isValidDate(data) === false) {
					data = new Date(new Date().toDateString() + daElem.innerText.replace("Today at", ""));
					if (frycAPI.isValidDate(data) === false) return;
				}
				data = new Date(data.getTime() + diff);
				daElem.innerHTML = frycAPI.printRelTime(data, { compact: 1 });
				daElem.setAttribute("title", frycAPI.printDate(data));
			});
		}
	});
} else if (frycAPI_host("gist.github.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`

	`);

	frycAPI.onLoadSetter(() => {
		frycAPI.changeFaviconRes("GithubBlue.png");

		const tab = document.querySelector("table[data-tagsearch-lang]");
	});
} else if (frycAPI_host("nodejs.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		[class*="layouts_contentLayout"]>:first-child main {
			word-break: normal;
		}
	`);
} else if (frycAPI_host("eslint.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.c-toc ol li:before {
			content: "-";
			left: 0;
		}
	`);
} else if (1 && frycAPI_hostIncludes("metafilter.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	frycAPI.onLoadSetter(async function () {
		document.documentElement.setAttribute("id", "myID");
		frycAPI.setDefaultDateStyle();
		document.documentElement.style.setProperty("--główny-color-tła",
			document.querySelector(`.comments > span.whitesmallcopy, .comments.whitesmallcopy`)
			?.computedStyleMap()
			.get("background-color")
			.toString()
		);

		frycAPI.setDefaultDate(`#userlist.copy > span.smallcopy`, { getDate: "txt" });

		if (document.body.classList.contains("thread")) {
			const xml = await frycAPI.readFile(window.location.origin + frycAPI.path + "/rss", "xml");
			// xml.querySelector(`parsererror`) === null
			// frycAPI.querySelNull(`parsererror`, xml)
			let rss;
			if (frycAPI.querySelNull(`parsererror`, xml)) {
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
				const txtNode = smallcopy.frycAPI_getFirstTextNode();
				const span = smallcopy.querySelector(`:scope > span`);
				data0 = rss ? rss[0] : new Date(txtNode.textContent + span.innerText);
				const dateText = smallcopy.frycAPI_insertHTML("afterbegin", frycAPI.getDefaultDateText(data0));
				txtNode.remove();
				span?.remove();
				if (dateText.nextSibling && dateText.nextSibling.nodeType !== Node.TEXT_NODE) {
					dateText.frycAPI_insertHTML("afterend", "<span> &nbsp; </span>");
				}
			}

			const post0 = document.querySelector(`#posts .copy > span.smallcopy`);
			post0?.frycAPI_setInnerHTML?.(post0.innerHTML
			.replace(/users? marked this as a favorite/, `<span style="font-family: sans-serif !important;">&#x2764;&#xFE0F;</span>`)
			.replace(/(answers|comments) total/, `<span style="font-family: sans-serif !important;">&#x21A9;&#xFE0F;</span>`)
			);

			const OP_href = document.querySelector(`.copy > span.smallcopy:is(.postbyline, .byline) > a[href*="/user/"]`)?.href;

			frycAPI.forEach(`.comments > .smallcopy`, (daElem, daI, daArr) => {
				const user = daElem.querySelector(`a[href*="/user/"]`);
				const link = daElem.querySelector(`a[href*="${daElem.parentElement.previousElementSibling.name}"]:not([href*="/user/"],[href*="/favorited/"])`);
				const favs = daElem.querySelector(`a[href*="/favorited/"]`);
				const staf = daElem.querySelector(`a.staff`);
				const text = daElem.innerText;
				user.remove();
				link.remove();
				favs?.remove();
				staf?.remove();
				daElem.innerHTML = "";
				daElem.append(link.frycAPI_setInnerHTML(`#${daI + 1}`));
				daElem.frycAPI_appendHTML("<span> | </span>");
				daElem.append(user);
				if (staf) {
					daElem.frycAPI_appendHTML("<span> </span>");
					daElem.append(staf);
				}
				// daElem.frycAPI_appendHTML("<span> | </span>");

				let data;
				if (rss) {
					data = rss[daI + 1];
				} else {
					const arr = text.replace(/ \[.+/, "").slice(text.indexOf(" at ") + 4).split(" on ");
					data = new Date(arr[1] + " " + arr[0]);
					if (data0 && data.getTime() < data0.getTime()) {
						data.setFullYear(new Date().getFullYear());
					}
				}

				daElem.frycAPI_appendHTML(frycAPI.getDefaultDateText(data));
				if (favs) {
					daElem.frycAPI_appendHTML("<span> | </span>");
					daElem.append(favs.frycAPI_setInnerHTML(favs.innerHTML.replace(/favorites?/, "&#10084;"))); // ❤
				}

				if (user.href === OP_href) {
					daElem.parentElement.classList.add("bestleft");
				}
			});
		} else {
			frycAPI.forEach(`.copy.post > span.smallcopy:is(.postbyline, .byline)`, (daElem, daI, daArr) => {
				const regMatch = daElem.innerHTML.match(/(\s+at\s+)(.*?)(\s+-\s+)/);
				const data = new Date(regMatch[2]);
				if (frycAPI.isValidDate(data)) {
					daElem.innerHTML = daElem.innerHTML.replace(regMatch[0], ` at ${frycAPI.getDefaultDateText(data)} - `);
				} else {
					daElem.innerHTML = daElem.innerHTML.replace(regMatch[0], ` at ${frycAPI.time12To24(regMatch[2])} - `);
				}
			});
			frycAPI.forEach(`:is(#scontent, #posts, #posts > div, #boxyleft) div:is(.copy:not(#related), .copy.post)`, (daElem, daI, daArr) => {
				daElem.insertAdjacentElement("afterend", document.createElement("div").frycAPI_addClass("my-posttitle-post-wrapper")).append(daElem.previousElementSibling.classList.contains("posttitle") ? daElem.previousElementSibling : "", daElem);
			});
		}
	});
} else if (frycAPI_host("sjp.pwn.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		${frycAPI.simpleFontChange}
		.banner:has(*) {
			display: none;
		}
	`);
} else if (frycAPI_host("www.baillifard.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		${frycAPI.simpleFontChange}
	`);
} else if (frycAPI_host("web.dev", "developers.google.com", "developer.chrome.com")) {
	frycAPI.UUID = "2025-01-05 23:13";
	frycAPI.injectStyleOnLoad(/*css*/`
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
	`);

	frycAPI.onLoadSetter(function () {
		frycAPI.setDefaultDateStyle();
		frycAPI.createMutObs((mutRec, docObs) => {
			if (frycAPI.querySelNull(`p > .lepszyCzas`)) {
				let autors = document.querySelector(`.wd-authors`);
				let pos = "afterend";
				if (autors === null) {
					autors = document.querySelector(`.devsite-article-body.clearfix`);
					pos = "afterbegin";
				}
				const dataCont = document.querySelector(`devsite-content-footer.nocontent > p:last-child`);
				if (autors !== null && dataCont !== null) {
					const [y, m, d] = dataCont.innerText.match(/\d+/g).map(e => Number(e));
					const htmlStr = `<p style="margin: 0 0 16px 0; color: var(--devsite-breadcrumb-link-color, var(--devsite-secondary-text-color)); font-size: 0.8em;">Last updated ${frycAPI.getDefaultDateText(new Date(Date.UTC(y, m - 1, d)), frycAPI.dateOptsNoTime)}</p>`;
					autors.insertAdjacentHTML(pos, htmlStr);
				}
			}
		});
	}, 2);
} else if (frycAPI_host("miro.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.c-cFaYiI {
			background-color: #e9e9e9;
		}
	`);
} else if (frycAPI_host("marciniwuc.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		*:not(.fa, .far, .fas), .main-navigation .primary-menu-container > ul li.menu-item > a {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (frycAPI_host("bolero-napoje.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`

	`);

	frycAPI.onLoadSetter(function () {
		const tab = document.querySelector(`.woocommerce table.shop_table`);
		frycAPI.makeTableSortable(tab, `tbody tr.cart_item`);
	});
} else if (frycAPI_host("cesium.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	frycAPI.onLoadSetter(function () {
		frycAPI.forEach(`.nameContainer`, daElem => {
			let next;
			while ((next = daElem.nextElementSibling)?.frycAPI_hasNotClass("nameContainer") && next.frycAPI_hasNotClass("subsection-title")) {
				daElem.appendChild(next);
			}
			daElem.frycAPI_elemByClass("name").addEventListener("click", function (e) {
				daElem.frycAPI_toggleClass("collapse-me");
			});
			daElem.frycAPI_addClass("collapse-me");
		});
		document.querySelector(`.container-overview > .nameContainer`)?.frycAPI_removeClass("collapse-me");
	});
} else if (frycAPI_host("archived.moe")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.show-me {
			display: block !important;
		}
	`);

	frycAPI.onLoadSetter(function () {
		const search = document.querySelector(`.search_box`);
		if (search === null) return;
		const input1 = document.querySelector(`input.search-query`);
		const container = document.querySelector(`.navbar-inner .container`);
		const input2 = document.getElementById("search_form_comment");
		// const main = document.getElementById("main");
		function show(e) {
			search.frycAPI_addClass("show-me");
		}
		function hide(e) {
			search.frycAPI_removeClass("show-me");
		}
		input1?.addEventListener("focus", show);
		input2?.addEventListener("focus", show);
		container?.addEventListener("click", hide);
	});
} else if (frycAPI_host("www.oddschecker.com")) {
	frycAPI.onLoadSetter(function () {
		frycAPI.forEach(`td.bc`, daElem => {
			daElem.firstElementChild.innerText = eval(daElem.firstElementChild.innerText).toFixed(2).replace(".00", "");
		});
	});
} else if (frycAPI_host("math.hws.edu") && frycAPI.path === "/graphicsbook/demos/c2/rgb-hsv.html") {
	frycAPI.injectStyleOnLoad(/*css*/`
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
	`);
	// #region colConv
	const colConv = { "00":0, "01":1, "02":2, "03":3, "04":4, "05":5, "06":6, "07":7, "08":8, "09":9, "0A":10, "0B":11, "0C":12, "0D":13, "0E":14, "0F":15, "10":16, "11":17, "12":18, "13":19, "14":20, "15":21, "16":22, "17":23, "18":24, "19":25, "1A":26, "1B":27, "1C":28, "1D":29, "1E":30, "1F":31, "20":32, "21":33, "22":34, "23":35, "24":36, "25":37, "26":38, "27":39, "28":40, "29":41, "2A":42, "2B":43, "2C":44, "2D":45, "2E":46, "2F":47, "30":48, "31":49, "32":50, "33":51, "34":52, "35":53, "36":54, "37":55, "38":56, "39":57, "3A":58, "3B":59, "3C":60, "3D":61, "3E":62, "3F":63, "40":64, "41":65, "42":66, "43":67, "44":68, "45":69, "46":70, "47":71, "48":72, "49":73, "4A":74, "4B":75, "4C":76, "4D":77, "4E":78, "4F":79, "50":80, "51":81, "52":82, "53":83, "54":84, "55":85, "56":86, "57":87, "58":88, "59":89, "5A":90, "5B":91, "5C":92, "5D":93, "5E":94, "5F":95, "60":96, "61":97, "62":98, "63":99, "64":100, "65":101, "66":102, "67":103, "68":104, "69":105, "6A":106, "6B":107, "6C":108, "6D":109, "6E":110, "6F":111, "70":112, "71":113, "72":114, "73":115, "74":116, "75":117, "76":118, "77":119, "78":120, "79":121, "7A":122, "7B":123, "7C":124, "7D":125, "7E":126, "7F":127, "80":128, "81":129, "82":130, "83":131, "84":132, "85":133, "86":134, "87":135, "88":136, "89":137, "8A":138, "8B":139, "8C":140, "8D":141, "8E":142, "8F":143, "90":144, "91":145, "92":146, "93":147, "94":148, "95":149, "96":150, "97":151, "98":152, "99":153, "9A":154, "9B":155, "9C":156, "9D":157, "9E":158, "9F":159, "A0":160, "A1":161, "A2":162, "A3":163, "A4":164, "A5":165, "A6":166, "A7":167, "A8":168, "A9":169, "AA":170, "AB":171, "AC":172, "AD":173, "AE":174, "AF":175, "B0":176, "B1":177, "B2":178, "B3":179, "B4":180, "B5":181, "B6":182, "B7":183, "B8":184, "B9":185, "BA":186, "BB":187, "BC":188, "BD":189, "BE":190, "BF":191, "C0":192, "C1":193, "C2":194, "C3":195, "C4":196, "C5":197, "C6":198, "C7":199, "C8":200, "C9":201, "CA":202, "CB":203, "CC":204, "CD":205, "CE":206, "CF":207, "D0":208, "D1":209, "D2":210, "D3":211, "D4":212, "D5":213, "D6":214, "D7":215, "D8":216, "D9":217, "DA":218, "DB":219, "DC":220, "DD":221, "DE":222, "DF":223, "E0":224, "E1":225, "E2":226, "E3":227, "E4":228, "E5":229, "E6":230, "E7":231, "E8":232, "E9":233, "EA":234, "EB":235, "EC":236, "ED":237, "EE":238, "EF":239, "F0":240, "F1":241, "F2":242, "F3":243, "F4":244, "F5":245, "F6":246, "F7":247, "F8":248, "F9":249, "FA":250, "FB":251, "FC":252, "FD":253, "FE":254, "FF":255 };
	// #endregion
	function getTextColor(hex) {
		const r = colConv[hex.slice(1, 3)] / 255;
		const g = colConv[hex.slice(3, 5)] / 255;
		const b = colConv[hex.slice(5, 7)] / 255;
		// const war = (Math.max(r, g, b) / 255) >= 0.5;
		// const war = ((r + g + b) / 765) >= 0.5;
		// const war = (0.299 * r + 0.587 * g + 0.114 * b) > 128;
		const war = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b) > 0.5;
		return war ? "#000000" : "#FFFFFF";
	}
	const rgb2hex = rgb => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, "0")).join("").toUpperCase()}`; // eslint-disable-line radix
	frycAPI.onLoadSetter(function () {
		const canv = document.getElementById("maincanvas");
		const myDiv = canv.parentElement.appendChild(document.createElement("div").frycAPI_setAttribute("id", "myDiv").frycAPI_setInnerHTML("Hello, I'm text"));
		frycAPI.createMutObs((mutRecArr0, mutObs0) => {
			if (canv.style.backgroundColor.length > 0) myDiv.style.color = getTextColor(rgb2hex(canv.style.backgroundColor));
		}, { runOnLoad: false, elem: canv, options: { attributes: true, childList: false, subtree: false } });
	});
} else if (frycAPI_host("ponepaste.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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

	frycAPI.onLoadSetter(function () {
		// #region //* Naprawa wyświetlania info w lewym górnym
		const br = document.querySelector(`.column.is-4:not(.has-text-centered, .has-text-right) > br`);
		if (br !== null) {
			br.frycAPI_insertHTML("afterend", "<hr>");
			br.remove();
		}
		// #endregion
		// #region //* Naprawa dat
		const siteDates = document.querySelector(`.column.is-4.has-text-centered small.title`);
		if (siteDates !== null) {
			frycAPI.setDefaultDateStyle();
			function dateHelper(daElem, frontStr) {
				const modDateStr = daElem.textContent.trim();
				if (modDateStr.startsWith(frontStr)) {
					return { frontStr, dateStr: modDateStr.replace(frontStr, "") }; // eslint-disable-line object-shorthand
				} else {
					return undefined;
				}
			}
			Array.from(siteDates.childNodes).forEach((daElem, daI, daArr) => {
				if (daElem.nodeType === Node.TEXT_NODE) {
					const obj = dateHelper(daElem, "Created: ") ?? dateHelper(daElem, "Updated: ") ?? dateHelper(daElem, "Expiry: ");
					if (obj?.dateStr !== undefined) {
						const data = new Date(obj.dateStr);
						if (frycAPI.isValidDate(data)) {
							daElem.textContent = obj.frontStr;
							frycAPI.setDefaultDateEnum.mode.oba(daElem.frycAPI_insertAfter(frycAPI.getDefaultDateText(data)));
							// daElem.remove();
						}
					}
				}
			});
		}
		frycAPI.createMutObs((mutRecArr, mutObs) => {
			frycAPI.setDefaultDate(`table#archive tbody td:nth-child(3)`, { getDate: "txt", customStyle: `cursor: none;` }).mode.relatywnyCzas();
		});
		// #endregion
	});
} else if (frycAPI_host("thepiratebay.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`);
} else if (window.location.href === "https://www.elka.pw.edu.pl/Aktualnosci/Kalendarz-akademicki") {
	frycAPI.injectStyleOnLoad(/*css*/`
		iframe#external {
			height: 1200px !important;
		}
	`);
} else if (0 && frycAPI_host("store.steampowered.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
	`);

	frycAPI.createMutObs(mutRecArr => {
		for (const mut of mutRecArr) {
			for (const node of mut.addedNodes) {
				if (node.tagName === "SCRIPT" && node.src.includes("jquery-ui-1.9.2.js")) {
					node.src = frycAPI.getResURL("jquery-ui-1.13.3.min.js");
					return true;
				}
			}
		}
	}, { elem: document.documentElement });

	// frycAPI.onLoadSetter(function () {
	// });
} else if (frycAPI_host("png2pdf.netlify.app", "pdf2png.netlify.app")) {
	frycAPI.injectStyleOnLoad(/*css*/`
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
		frycAPI.changeFaviconRes("IMG to PDF cropped.png");
		document.title = "IMG to PDF";
	} else {
		frycAPI.changeFaviconRes("PDF to IMG cropped.png");
		document.title = "PDF to IMG";
	}
} else if (frycAPI_host("imagemagick.org", "www.imagemagick.org") && frycAPI.path.startsWith("/discourse-server")) {
	frycAPI.colorSchemeDark = true;
} else if (frycAPI_hostIncludes("wiki.gg")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		#wikigg-showcase-header {
			display: none;
		}
		#wikigg-showcase-sidebar {
			display: none;
		}
	`);
	frycAPI.onLoadSetter(function () {
		frycAPI.forEach(`h2 > span.mw-headline`, span => {
			span.innerHTML = `<a href="${window.location.origin + window.location.pathname + "#" + span.id}">${span.innerText}</a>`;
		});
	});
	if (frycAPI_host("helldivers.wiki.gg")) {
		frycAPI.injectStyleOnLoad(/*css*/`
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
		frycAPI.onLoadSetter(function () {
			if (frycAPI.path === "/wiki/Stratagems") { // https://helldivers.wiki.gg/wiki/Stratagems
				const myButtWrapTemp = frycAPI.elemFromHTML(`<td><div class="myButtonWrapper"></div></td>`);
				const buttTemp = frycAPI.elemFromHTML(`<div class="copyButton"></div>`);
				const arrowToWASD = {
					"Up Arrow.png": "w",
					"Left Arrow.png": "a",
					"Down Arrow.png": "s",
					"Right Arrow.png": "d",
				};
				frycAPI.retryIf(() => frycAPI.querySelOk(`.wikitable thead > tr`), 50, () => {
					frycAPI.forEach(`.wikitable`, table => {
						table.querySelector(`thead > tr`).appendChild(table.querySelector(`th:last-child`).cloneNode(1))
						.frycAPI_setAttribute("width", "30%")
						.frycAPI_setInnerText("Copy");

						table.frycAPI_elemByTag("tbody").rows.forEach(row => {
							let firstChild = row.firstElementChild;
							if (firstChild.tagName === "TH") firstChild = firstChild.nextElementSibling;
							const secondChild = firstChild.nextElementSibling;
							const thirdChild = secondChild.nextElementSibling;
							const myButtWrap = row.appendChild(myButtWrapTemp.cloneNode(1)).firstElementChild;
							myButtWrap.appendChild(buttTemp.cloneNode(1).frycAPI_setInnerText("Image URL")).addEventListener("click", () => {
								frycAPI.copyTxt(firstChild.firstElementChild.firstElementChild.src.match(/.+?\.png/)[0].replace("/thumb", ""));
							});
							myButtWrap.appendChild(buttTemp.cloneNode(1).frycAPI_setInnerText("AHK code")).addEventListener("click", () => {
								frycAPI.copyTxt(`helld2("${thirdChild.querySelectorAll("img").map(e => arrowToWASD[e.alt]).join("")}",0) ; ${secondChild.innerText}`);
							});
							myButtWrap.appendChild(buttTemp.cloneNode(1).frycAPI_setInnerText("Delete row")).addEventListener("click", () => {
								row.remove();
							});
						});
					});
				});
			}
		}, 2);
	}
} else if (frycAPI_host("www.icoconverter.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
	frycAPI.changeFaviconRes("IMG to ICO rounded corners.png");
} else if (frycAPI_host("www.sumatrapdfreader.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		*:not(code, code *) {
			font-family: "IBM Plex Sans Condensed", sans-serif !important;
		}
	`);
} else if (frycAPI_host("www.crocs.pl")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		.single-desktop-image {
			background-color: #cdcdcd !important;
		}
		.banner-show-container {
			display: none;
		}
	`);

	(frycAPI.beforeLoad = function () {
		frycAPI.colorSchemeDark = 1;
	})();
} else if (frycAPI_host("www.patreon.com")) {
	frycAPI.injectStyleOnLoad(/*css*/`
	`);

	frycAPI.onLoadSetter(function () {
		document.addEventListener("keydown", e => {
			if (e.key !== "p") return; // Activation key
			if (document.activeElement.tagName.frycAPI_equalAny("TEXTAREA", "INPUT")) return; // Don't trigger when typing
			const videoEl = document.getElementsByTagName("video").find(frycAPI.isElemOnScreen);
			if (!videoEl) return; // Don't trigger when no video is on screen
			const filename = frycAPI.traverseUntil("forward", videoEl, el => el.tagName === "SPAN" && el.getAttribute("data-tag") === "post-title")?.firstEl?.innerText;
			frycAPI.downLoadVideoFrame(videoEl, (filename || "Patreon Video - " + frycAPI.printDateForFileName()) + " - " + videoEl.currentTime.toFixed(3) + " s.png");
		});
	});
} else if (frycAPI_host("pypi.org")) {
	frycAPI.injectStyleOnLoad(/*css*/`
		* {
			font-family: "IBM Plex Sans Condensed", sans-serif;
		}
	`, { elevated: true });
}
// Code-Lens-Action insert-snippet IF template

// #region //* IFy 11
// #endregion
// #endregion

// #region //* Koniec
if ((frycAPI.styleStr = frycAPI.styleStr.trim()).length) { // Adding style from the active IF block
	frycAPI.createMutObs(() => {
		if (document.body) {
			const state = frycAPI.styleOpts.state;
			frycAPI.myStyleState = frycAPI.injectStyle(frycAPI.styleStr, {
				id: "frycAPI_myStyle",
				elevated: frycAPI.styleOpts.elevated,
				elem: frycAPI.styleOpts.elem,
				state: state,
			});
			if (state === false) frycAPI.myStyleManualFunc.setState(0);
			frycAPI.getStorage("style")?.then(savedState => {
				if (savedState === undefined) return;
				frycAPI.myStyleManualFunc.setState(savedState);
				if (savedState !== frycAPI.myStyleState.state) frycAPI.myStyleState.toggle();
			});
			return true;
		}
	}, { elem: document.documentElement });
} else {
	frycAPI.myStyleManualFunc.off();
}

let frycAPI_loadSource;
if (frycAPI.script.getAttribute("src").includes("chrome-extension")) {
	frycAPI_loadSource = "chrome-extension";
} else {
	frycAPI_loadSource = "cdn.jsdelivr.net";
}

// frycAPI.sendEventToBackground("test");

const frycAPI_t2 = performance.now(); loguj(`frycAPI loaded in ${(frycAPI_t2 - frycAPI_t1).toFixed(1)} ms! (from ${frycAPI_loadSource})`);
document.currentScript.remove();
// #endregion
