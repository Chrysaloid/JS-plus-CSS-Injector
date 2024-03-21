async function runOnPage(daFunc, arguments) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const [{ result }] = await chrome.scripting.executeScript({
		world: "MAIN",
		target: { tabId: tab.id },
		func: daFunc,
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
	const returnValueHandler = {
		toggleOnOff: function (butt) {
			butt.classList.toggle("Off");
		}
	}
	funcArr.forEach(function (funcGroup, groupNum) {
		let containerChild = document.createElement("div");
		containerChild.appendChild(document.createElement("span")).innerHTML = funcGroup[0];
		funcGroup[1].forEach(function (func, funcNum) {
			let funcButt = document.createElement("button");
			funcButt.innerHTML = func.name;
			if (func.Off) {
				funcButt.classList.add("Off");
			}
			containerChild.appendChild(funcButt).addEventListener("click", async function () {
				returnValueHandler[await runOnPage((groupNum, funcNum) => frycAPI.manualFunctionsHandler(groupNum, funcNum), [groupNum, funcNum])]?.(this);
			});
		});
		buttCont.append(containerChild);
	});
})();




