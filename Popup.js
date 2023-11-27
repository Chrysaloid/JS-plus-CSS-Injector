async function runOnPage(duFunc, arguments) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: { tabId: tab.id },
		func: duFunc,
		args: arguments
	});
	return result
}

(async () => {
	let frycAPI0 = await runOnPage(() => frycAPI, []);
	let funcArr = frycAPI0.funcArr;
	// console.log(frycAPI0);
	let buttCont = document.getElementById("buttCont");
	if (funcArr.length == 0) {
		buttCont.innerText = "Your functions will be here when you define them";
		// Tutaj będą twoje funkcje gdy je zdefiniujesz.
		return
	}
	funcArr.forEach(function (daElem, daI, daArr) {
		let containerChild = document.createElement("div");
		containerChild.appendChild(document.createElement("span")).innerHTML = daElem[0];
		daElem[1].forEach(function (daElem1, daI1, daArr1) {
			let funcButt = document.createElement("button");
			funcButt.innerHTML = daElem1.name;
			if (daElem1.hasOwnProperty("Off") && daElem1.Off) {
				funcButt.classList.add("Off");
			}
			containerChild.appendChild(funcButt).addEventListener("click", async (event) => {
				// console.log(new Date().getTime());
				let currTag = event.currentTarget;
				let funkRet = await runOnPage((daI, daI1) => frycAPI.manualFunctionsHandler(daI, daI1), [daI, daI1]);
				// debugger
				if (funkRet == "toggleOnOff") {
					currTag.classList.toggle("Off");
				}
			});

		});
		buttCont.append(containerChild);
	});
})();




