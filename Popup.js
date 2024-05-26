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

(async () => {
	const frycAPI0 = await runOnPage(() => frycAPI, []);
	const mainCont = document.getElementById("buttCont");
	if (frycAPI0 === undefined) {
		mainCont.innerText = "Something went wrong. frycAPI is undefined";
		return;
	}
	const funcArr = frycAPI0.funcArr;
	// console.log(frycAPI0);
	if (funcArr.length === 0) {
		mainCont.innerText = "Your functions will be here when you define them"; // Tutaj będą twoje funkcje gdy je zdefiniujesz
		return;
	}
	const returnValueHandler = { // eslint-disable-line object-shorthand
		toggleOnOff: function (butt) {
			butt.classList.toggle("Off");
		},
	};
	funcArr.forEach(function (funcGroup, groupNum) {
		const subCont = document.createElement("div");
		subCont.appendChild(document.createElement("span")).innerHTML = funcGroup[0];
		funcGroup[1].forEach(function (func, funcNum) {
			const funcButt = document.createElement("button");
			funcButt.innerHTML = func.name;
			if (func.Off) {
				funcButt.classList.add("Off");
			}
			subCont.appendChild(funcButt).addEventListener("click", async function () {
				returnValueHandler[await runOnPage((groupNumber, funcNumber) => frycAPI.handleManualFunction(groupNumber, funcNumber), [groupNum, funcNum])]?.(this);
			});
		});
		mainCont.append(subCont);
	});
})();
