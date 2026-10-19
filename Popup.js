"use strict";
function get_active_tab() { // https://stackoverflow.com/a/17076501/12035658
	return chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(tab_arr => tab_arr[0]);
} // const tab = await get_active_tab();
function get_active_target() {
	return get_active_tab().then(tab => ({ tabId: tab.id }));
} // const tabID = await get_active_target();
async function run_on_page(da_func, args = []) {
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: await get_active_target(),
		func: da_func,
		args: args,
	});
	return result;
} // const out = await run_on_page(() => {});
class Manual_func_types { // class is used here instead of object so the variable has different color than a CONSTANT
	static NORMAL   = "NORMAL";
	static STATE    = "STATE";
	static RADIO    = "RADIO";
	static CHECKBOX = "CHECKBOX";
	static COMBO    = "COMBO";
	static INPUT    = "INPUT";
}
function add_da_listener(elem, da_obj, additional_action = () => true, type = "click") {
	const new_obj = structuredClone(da_obj);
	// new_obj.type = elem.type;
	elem.addEventListener(type, function (e) {
		if (elem.value !== undefined) new_obj.obj.state = elem.value;
		run_on_page(new_da_obj => frycAPI.handle_manual_function(new_da_obj), [new_obj])
		.then(frycAPI0 => {
			if (additional_action()) {
				main(frycAPI0); // eslint-disable-line no-use-before-define
			}
		});
	});
}
function handle_cols_and_rows(func_obj, el_cont) {
	if (func_obj.num_cols !== undefined) {
		el_cont.setAttribute("numCols", func_obj.num_cols);
		el_cont.style.setProperty("--numCols", func_obj.num_cols);
		el_cont.style.setProperty("--last-child-column-start", func_obj.num_states % func_obj.num_cols);
	} else if (func_obj.num_rows !== undefined) {
		el_cont.setAttribute("numRows", func_obj.num_rows);
		// el_cont.style.setProperty("--numRows", func_obj.num_rows === 1 ? `var(--el-real-height)` : `var(--el-real-height) repeat(${func_obj.num_rows - 1}, calc(var(--el-real-height) - 1px))`); // (ponieważ calc(1 - 1) != 0 for some reason) Nie. Ponieważ repeat nie pozwala na 0
		el_cont.style.setProperty("--numRows", func_obj.num_rows);
		el_cont.style.setProperty("--last-child-row-start", func_obj.num_states % func_obj.num_rows);
	}
}
function get_num_cols_and_rows(func_obj, el_cont) {
	const num_rows = Math.ceil(func_obj.num_states / func_obj.num_cols) - 1;
	const num_cols = Math.ceil(func_obj.num_states / func_obj.num_rows) - 1;
	return [num_cols, num_rows];
}
function set_cols_rows_attrs(func_obj, func_el, i, num_cols, num_rows) {
	if (!func_obj.num_cols && !func_obj.num_rows) func_obj.num_cols = 1;
	if (func_obj.num_cols) {
		if (i % func_obj.num_cols === 0) func_el.classList.add("firstCol");
		if (i % func_obj.num_cols === func_obj.num_cols - 1) func_el.classList.add("lastCol");
		const row = Math.floor(i / func_obj.num_cols);
		if (row === 0) func_el.classList.add("firstRow");
		if (row === num_rows) func_el.classList.add("lastRow");
	}
	if (func_obj.num_rows) {
		if (i % func_obj.num_rows === 0) func_el.classList.add("firstRow");
		if (i % func_obj.num_rows === func_obj.num_rows - 1) func_el.classList.add("lastRow");
		const col = Math.floor(i / func_obj.num_rows);
		if (col === 0) func_el.classList.add("firstCol");
		if (col === num_cols) func_el.classList.add("lastCol");
	}
}
function loguj(...tekst) {
	console.log(...tekst);
}
function btoa_utf8(value) {
	return btoa(
		String.fromCharCode(
			...new TextEncoder()
			.encode(value)
		)
	);
}
const additional_actions = { // they should return true if the popup should be rerendered
	close: data => window.close(),
};
async function main(frycAPI0) {
	// #region //* Wstęp
	if (await get_active_tab().then(tab => tab.url.startsWith("chrome://"))) return;
	const first_start = !frycAPI0;
	frycAPI0 ??= await run_on_page(() => frycAPI);
	const main_cont = document.getElementById("mainCont");
	main_cont.textContent = "";
	if (!frycAPI0) {
		main_cont.innerText = `Something went wrong. frycAPI is ${frycAPI0}`;
		return;
	}
	const func_group_arr = frycAPI0.func_group_arr;
	// console.log(frycAPI0);
	if (func_group_arr.length === 0) {
		main_cont.innerText = "Your functions will be here when you define them"; // Tutaj będą twoje funkcje gdy je zdefiniujesz
		return;
	}
	// #endregion

	const da_obj = {};
	func_group_arr.forEach(function (func_group, group_num) {
		const sub_cont = document.createElement("div");
		sub_cont.classList.add("subCont");
		if (func_group.style) sub_cont.setAttribute("style", func_group.style);
		const group_name = document.createElement("span");
		group_name.classList.add("groupName");
		group_name.innerHTML = func_group.name;
		sub_cont.appendChild(group_name);
		const func_cont = document.createElement("div");
		func_cont.classList.add("funcCont");
		sub_cont.appendChild(func_cont);
		main_cont.appendChild(sub_cont);

		func_group.func_arr.forEach(function (func_obj, func_num) {
			const func_div = document.createElement("div");
			func_div.classList.add("funcDiv", func_obj.type);
			if (func_obj.is_off) func_div.classList.add("Off");
			if (func_obj.style) func_div.setAttribute("style", func_obj.style);
			if (func_obj.title) func_div.setAttribute("title", func_obj.title);
			func_cont.appendChild(func_div);
			da_obj.group_number = group_num;
			da_obj.func_number = func_num;
			da_obj.obj = {};
			const additional_action = (additional_actions[func_obj.additional_action.name] ?? (() => true)).bind(null, func_obj.additional_action.data);

			const func_name = document.createElement("div");
			func_name.classList.add("funcName");
			func_name.innerHTML = func_obj.name;
			da_obj.obj.type = "name";
			if (!func_obj.display_name) func_name.classList.add("dspNone");
			if (func_obj.name_clickable) {
				func_name.classList.add("nameClickable");
				add_da_listener(func_name, da_obj, additional_action);
			}
			func_div.appendChild(func_name);

			da_obj.obj.type = "elem";
			switch (func_obj.type) {
				default:
				case Manual_func_types.NORMAL: {
					const func_el = document.createElement("div");
					func_el.classList.add("funcEl");
					if (func_obj.func_el_style) func_el.setAttribute("style", func_obj.func_el_style);
					func_el.innerHTML = first_start && func_obj.reset_name_on_first_start ? func_obj.__name_base : func_obj.name; // eslint-disable-line no-underscore-dangle
					// func_el.innerHTML = func_obj.name;
					if (!func_obj.is_off) add_da_listener(func_el, da_obj, additional_action);
					func_div.appendChild(func_el);
					break;
				}
				case Manual_func_types.STATE: {
					const func_el = document.createElement("div");
					func_el.classList.add("funcEl");
					func_el.innerHTML = func_obj.state_desc[func_obj.state];
					if (!func_obj.is_off) add_da_listener(func_el, da_obj, additional_action);
					func_div.appendChild(func_el);
					break;
				}
				case Manual_func_types.RADIO: {
					const el_cont = document.createElement("div");
					el_cont.classList.add("elCont");
					handle_cols_and_rows(func_obj, el_cont);
					func_div.appendChild(el_cont);
					const [num_cols, num_rows] = get_num_cols_and_rows(func_obj);
					func_obj.state_desc.forEach((desc, i) => {
						const func_el = document.createElement("div");
						func_el.classList.add("funcEl");
						func_el.innerHTML = desc;
						da_obj.obj.state = i;
						if (func_obj.state === i) func_el.classList.add("choice");
						if (!func_obj.is_off) add_da_listener(func_el, da_obj, additional_action);
						set_cols_rows_attrs(func_obj, func_el, i, num_cols, num_rows);
						el_cont.appendChild(func_el);
					});
					break;
				}
				case Manual_func_types.COMBO: {
					const el_cont = document.createElement("select");
					el_cont.classList.add("funcEl");
					func_div.appendChild(el_cont);
					if (!func_obj.is_off) {
						add_da_listener(el_cont, da_obj, additional_action, "change");
						el_cont.addEventListener("wheel", e => {
							e.preventDefault();
							if (e.deltaY > 0 && func_obj.state < func_obj.num_states - 1) {
								el_cont.selectedIndex++;
								el_cont.dispatchEvent(new Event("change"));
							} else if (e.deltaY < 0 && func_obj.state > 0) {
								el_cont.selectedIndex--;
								el_cont.dispatchEvent(new Event("change"));
							}
						});
					}
					func_obj.state_desc.forEach((desc, i) => {
						const func_el = document.createElement("option");
						// func_el.classList.add("funcEl");
						func_el.innerHTML = desc;
						func_el.setAttribute("value", i);
						if (func_obj.state === i) func_el.setAttribute("selected", true);
						el_cont.appendChild(func_el);
					});
					break;
				}
				case Manual_func_types.CHECKBOX: {
					const el_cont = document.createElement("div");
					el_cont.classList.add("elCont");
					handle_cols_and_rows(func_obj, el_cont);
					func_div.appendChild(el_cont);
					const [num_cols, num_rows] = get_num_cols_and_rows(func_obj);
					func_obj.state_desc.forEach((desc, i) => {
						const func_el = document.createElement("div");
						func_el.classList.add("funcEl");
						func_el.innerHTML = desc;
						da_obj.obj.index = i;
						if (func_obj.state[i]) func_el.classList.add("choice");
						if (!func_obj.is_off) add_da_listener(func_el, da_obj, additional_action);
						set_cols_rows_attrs(func_obj, func_el, i, num_cols, num_rows);
						el_cont.appendChild(func_el);
					});
					break;
				}
				case Manual_func_types.INPUT: {
					const func_el = document.createElement("input");
					func_el.classList.add("funcEl");
					if (func_obj.select_on_focus) func_el.addEventListener(`focus`, () => func_el.select());
					func_el.setAttribute("value", func_obj.state);
					if (!func_obj.is_off) add_da_listener(func_el, da_obj, additional_action, "change");
					func_div.appendChild(func_el);
					if (func_obj.attributes) {
						Object.entries(func_obj.attributes).forEach(([key, value]) => {
							func_el.setAttribute(key, value);
						});
					}
					if (!func_el.hasAttribute("type")) func_el.setAttribute("type", "text");
					if (!func_el.hasAttribute("size")) func_el.setAttribute("size", "1");
					break;
				}
			}
		});
	});

	async function wait_for_special_keys(e) {
		if (e.code === "F4" && e.altKey && e.ctrlKey && e.shiftKey) {
			const clip = await navigator.clipboard.readText();
			navigator.clipboard.writeText(clip.split("\n").map(s => s.trim()).filter(s => s).map(s => {
				return `const ${s.split("/").pop().replaceAll(/[^a-zA-Z0-9_]/g, "")} = new frycAPI_Cache("${btoa_utf8(s)}");`;
			}).join("\n"));
			// document.removeEventListener("keydown", wait_for_special_keys);
			// loguj("Test");
		}
	}
	document.addEventListener("keydown", wait_for_special_keys);
}

// const t0 = performance.now();
main();
// const t1 = performance.now(); console.log(`${(t1 - t0).toFixed(1)} ms`);
