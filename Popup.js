"use strict";

async function runOnPage(daFunc, args) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: { tabId: tab.id },
		func: daFunc,
		args: args,
	});
	return result;
}
class ManualFuncTypes {
	static NORMAL   = "NORMAL";
	static STATE    = "STATE";
	static RADIO    = "RADIO";
	static CHECKBOX = "CHECKBOX";
	static COMBO    = "COMBO";
	static INPUT    = "INPUT";
}
function addDaListener(elem, daObj, type = "click") {
	const newObj = structuredClone(daObj);
	// newObj.type = elem.type;
	elem.addEventListener(type, async function (e) {
		if (e.target.value !== undefined) newObj.obj.state = e.target.value;
		main(await runOnPage(daObj => frycAPI.handleManualFunction(daObj), [newObj])); // eslint-disable-line no-shadow, no-use-before-define
	});
}
function handleColsAndRows(funcObj, elCont) {
	if (funcObj.numCols !== undefined) {
		elCont.setAttribute("numCols", funcObj.numCols);
		elCont.style.setProperty("--numCols", funcObj.numCols);
		elCont.style.setProperty("--last-child-column-start", funcObj.numStates % funcObj.numCols);
	} else if (funcObj.numRows !== undefined) {
		elCont.setAttribute("numRows", funcObj.numRows);
		// elCont.style.setProperty("--numRows", funcObj.numRows === 1 ? `var(--el-real-height)` : `var(--el-real-height) repeat(${funcObj.numRows - 1}, calc(var(--el-real-height) - 1px))`); // (ponieważ calc(1 - 1) != 0 for some reason) Nie. Ponieważ repeat nie pozwala na 0
		elCont.style.setProperty("--numRows", funcObj.numRows);
		elCont.style.setProperty("--last-child-row-start", funcObj.numStates % funcObj.numRows);
	}
}
function getNumColsAndRows(funcObj, elCont) {
	const numRows = Math.ceil(funcObj.numStates / funcObj.numCols) - 1;
	const numCols = Math.ceil(funcObj.numStates / funcObj.numRows) - 1;
	return [numCols, numRows];
}
function setColsRowsAttrs(funcObj, funcEl, i, numCols, numRows) {
	if (funcObj.numCols !== undefined) {
		if (i % funcObj.numCols === 0) funcEl.classList.add("firstCol");
		if (i % funcObj.numCols === funcObj.numCols - 1) funcEl.classList.add("lastCol");
		const row = Math.floor(i / funcObj.numCols);
		if (row === 0) funcEl.classList.add("firstRow");
		if (row === numRows) funcEl.classList.add("lastRow");
	}
	if (funcObj.numRows !== undefined) {
		if (i % funcObj.numRows === 0) funcEl.classList.add("firstRow");
		if (i % funcObj.numRows === funcObj.numRows - 1) funcEl.classList.add("lastRow");
		const col = Math.floor(i / funcObj.numRows);
		if (col === 0) funcEl.classList.add("firstCol");
		if (col === numCols) funcEl.classList.add("lastCol");
	}
}
async function main(frycAPI0) {
	// #region //* Wstęp
	// const t0 = performance.now();
	frycAPI0 ??= await runOnPage(() => frycAPI, []);
	const mainCont = document.getElementById("mainCont");
	mainCont.textContent = "";
	if (frycAPI0 === undefined) {
		mainCont.innerText = "Something went wrong. frycAPI is undefined";
		return;
	}
	const funcGroupArr = frycAPI0.funcGroupArr;
	// console.log(frycAPI0);
	if (funcGroupArr.length === 0) {
		mainCont.innerText = "Your functions will be here when you define them"; // Tutaj będą twoje funkcje gdy je zdefiniujesz
		return;
	}
	// #endregion

	const daObj = {};
	funcGroupArr.forEach(function (funcGroup, groupNum) {
		const subCont = document.createElement("div");
		subCont.classList.add("subCont");
		// funcGroup.style
		const groupName = document.createElement("span");
		groupName.classList.add("groupName");
		groupName.innerHTML = funcGroup.name;
		subCont.appendChild(groupName);
		const funcCont = document.createElement("div");
		funcCont.classList.add("funcCont");
		subCont.appendChild(funcCont);
		mainCont.appendChild(subCont);

		funcGroup.funcArr.forEach(function (funcObj, funcNum) {
			const funcDiv = document.createElement("div");
			funcDiv.classList.add("funcDiv", funcObj.type);
			if (funcObj.Off) funcDiv.classList.add("Off");
			// funcObj.style
			funcCont.appendChild(funcDiv);
			daObj.groupNumber = groupNum;
			daObj.funcNumber = funcNum;
			daObj.obj = {};

			const funcName = document.createElement("div");
			funcName.classList.add("funcName");
			funcName.innerHTML = funcObj.name;
			daObj.obj.type = "name";
			if (funcObj.displayName === false) funcName.classList.add("dspNone");
			if (funcObj.nameClickable) {
				funcName.classList.add("nameClickable");
				addDaListener(funcName, daObj);
			}
			funcDiv.appendChild(funcName);

			daObj.obj.type = "elem";
			switch (funcObj.type) {
				default:
				case ManualFuncTypes.NORMAL: {
					const funcEl = document.createElement("div");
					funcEl.classList.add("funcEl");
					funcEl.innerHTML = funcObj.name;
					if (!funcObj.Off) addDaListener(funcEl, daObj);
					funcDiv.appendChild(funcEl);
					break;
				}
				case ManualFuncTypes.STATE: {
					const funcEl = document.createElement("div");
					funcEl.classList.add("funcEl");
					funcEl.innerHTML = funcObj.stateDesc[funcObj.state];
					if (!funcObj.Off) addDaListener(funcEl, daObj);
					funcDiv.appendChild(funcEl);
					break;
				}
				case ManualFuncTypes.RADIO: {
					const elCont = document.createElement("div");
					elCont.classList.add("elCont");
					handleColsAndRows(funcObj, elCont);
					funcDiv.appendChild(elCont);
					const [numCols, numRows] = getNumColsAndRows(funcObj);
					funcObj.stateDesc.forEach((desc, i) => {
						const funcEl = document.createElement("div");
						funcEl.classList.add("funcEl");
						funcEl.innerHTML = desc;
						daObj.obj.state = i;
						if (funcObj.state === i) funcEl.classList.add("choice");
						if (!funcObj.Off) addDaListener(funcEl, daObj);
						setColsRowsAttrs(funcObj, funcEl, i, numCols, numRows);
						elCont.appendChild(funcEl);
					});
					break;
				}
				case ManualFuncTypes.COMBO: {
					const elCont = document.createElement("select");
					elCont.classList.add("funcEl");
					funcDiv.appendChild(elCont);
					if (!funcObj.Off) {
						addDaListener(elCont, daObj, "change");
						elCont.addEventListener("wheel", e => {
							e.preventDefault();
							if (e.deltaY > 0 && funcObj.state < funcObj.numStates - 1) {
								elCont.selectedIndex++;
								elCont.dispatchEvent(new Event("change"));
							} else if (e.deltaY < 0 && funcObj.state > 0) {
								elCont.selectedIndex--;
								elCont.dispatchEvent(new Event("change"));
							}
						});
					}
					funcObj.stateDesc.forEach((desc, i) => {
						const funcEl = document.createElement("option");
						// funcEl.classList.add("funcEl");
						funcEl.innerHTML = desc;
						funcEl.setAttribute("value", i);
						if (funcObj.state === i) funcEl.setAttribute("selected", true);
						elCont.appendChild(funcEl);
					});
					break;
				}
				case ManualFuncTypes.CHECKBOX: {
					const elCont = document.createElement("div");
					elCont.classList.add("elCont");
					handleColsAndRows(funcObj, elCont);
					funcDiv.appendChild(elCont);
					const [numCols, numRows] = getNumColsAndRows(funcObj);
					funcObj.stateDesc.forEach((desc, i) => {
						const funcEl = document.createElement("div");
						funcEl.classList.add("funcEl");
						funcEl.innerHTML = desc;
						daObj.obj.index = i;
						if (funcObj.state[i]) funcEl.classList.add("choice");
						if (!funcObj.Off) addDaListener(funcEl, daObj);
						setColsRowsAttrs(funcObj, funcEl, i, numCols, numRows);
						elCont.appendChild(funcEl);
					});
					break;
				}
				case ManualFuncTypes.INPUT: {
					const funcEl = document.createElement("input");
					funcEl.classList.add("funcEl");
					funcEl.setAttribute("value", funcObj.state);
					if (!funcObj.Off) addDaListener(funcEl, daObj, "change");
					funcDiv.appendChild(funcEl);
					if (funcObj.attributes !== undefined) {
						Object.entries(funcObj.attributes).forEach(([key, value]) => {
							funcEl.setAttribute(key, value);
						});
					}
					if (!funcEl.hasAttribute("type")) funcEl.setAttribute("type", "text");
					if (!funcEl.hasAttribute("size")) funcEl.setAttribute("size", "1");
					break;
				}
			}
		});
	});
	// const t1 = performance.now(); console.log(`${(t1 - t0).toFixed(1)} ms`);
}

main();
