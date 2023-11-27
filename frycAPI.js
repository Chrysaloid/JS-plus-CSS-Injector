// const t0 = performance.now();
const frycAPI = {};
function loguj(tekst) {
	console.log(tekst);
}
frycAPI.sleep = function (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
} // await frycAPI.sleep(1);
frycAPI.injectStyle = function (style) {
	if ((style = style.trim()).length) {
		new MutationObserver((mutRec, docObs) => {
			// if (document.head) {
			// 	// document.head.insertAdjacentElement("afterbegin", document.createElement("meta").frycAPI_setAttribute("http-equiv","Content-Security-Policy").frycAPI_setAttribute("content","script-src 'self';"));
			// 	// document.head.insertAdjacentElement("afterbegin", document.createElement("meta").frycAPI_setAttribute("http-equiv","Content-Security-Policy").frycAPI_setAttribute("content","require-trusted-types-for 'script';"));
			// }
			if (document.body) {
				// const t0 = performance.now();
				//`<style id="frycAPI_myStyle">${style}</style>` insertAdjacentHTML
				document.body.insertAdjacentElement("afterend",
					document.createElement("style")
						.frycAPI_setAttribute("id", "frycAPI_myStyle")
						.frycAPI_setInnerHTML(frycAPI.minifyCSS(style))
				); // .replaceAll(/\s+/gm," ")
				// const t1 = performance.now();
				// loguj(`Czas: ${t1 - t0} ms`);
				docObs.disconnect();
			}
		}).observe(document.documentElement, { childList: true });
		// window.addEventListener("load", () => {
		// 	document.body.appendChild(document.createElement("style")).innerHTML = style;
		// });
	}
}
frycAPI.injectStyleNormal = function (style, docBody) {
	if ((style = style.trim()).length) {
		if (docBody === undefined) {
			docBody = document.body;
		}
		docBody.appendChild(document.createElement("style")).innerHTML = frycAPI.minifyCSS(style);
	}
}
frycAPI.minifyCSS = function (style) {
	return style.replaceAll(/^\s+|[\t\f ]+$/gm, "").replaceAll(/\/\*.*?\*\//gm, ""); // /(^\s+|$\s+)/gm
	// return style
}
frycAPI.manualFunctionsCreator = function (nazwaFunkcji, funcArr) {
	if (funcArr.length) {
		/*
		let containerChild = document.createElement("div");
		// containerChild.appendChild(document.createElement("span")).innerHTML = nazwaFunkcji;
		containerChild.setAttribute("nazwa", nazwaFunkcji)
		funcArr.forEach(function (daElem, daI, daArr) {
			let funcButt = document.createElement("button");
			funcButt.innerHTML = daElem[0];
			funcButt.addEventListener("click", daElem[1]);
			containerChild.append(funcButt);
		})
		frycAPI.containerParent.append(containerChild);
		*/
		frycAPI.funcArr.push([nazwaFunkcji, funcArr])
	}
}
frycAPI.manualFunctionsHandler = function (ifNum, funcNum) {
	return frycAPI.funcArr[ifNum][1][funcNum].callBack(ifNum, funcNum);
}
frycAPI.ctrlC = function (text) {
	let textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		let successful = document.execCommand("copy");
		let msg = successful ? "successful" : "unsuccessful";
		console.log("Fallback: Copying text command was " + msg);
	} catch (err) {
		console.error("Fallback: Oops, unable to copy", err);
	}

	document.body.removeChild(textArea);
}
frycAPI.download = function (text, fileName) {
	let hid_a = document.createElement('a');
	// hid_a.href = 'data:attachment/text;charset=utf-8,' + encodeURI(text);
	hid_a.href = URL.createObjectURL(new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" }));
	hid_a.target = '_blank';
	hid_a.download = fileName;
	// document.body.append(hid_a);
	hid_a.click();
	hid_a.remove();
}
frycAPI.zaokrl = function (val, decimals) {
	return +(Math.round(+(val.toFixed(decimals) + "e+" + decimals)) + "e-" + decimals);
}
frycAPI.hostList = function (list) {
	for (const daElem of list) {
		if (daElem == frycAPI.host) {
			return true
		}
	}
}
frycAPI.hostListIncludes = function (list) {
	return frycAPI.host.frycAPI_includesAny(list)
}
frycAPI.clean = function (node) { // do usuwania komentarzy
	for (var n = 0; n < node.childNodes.length; n++) {
		var child = node.childNodes[n];
		if (child.nodeType === 8) {
			node.removeChild(child);
			n--;
		} else if (child.nodeType === 1) {
			frycAPI.clean(child);
		}
	}
}
frycAPI.makeTableSortable = function (tabElem, trSel, tdSel, thSel) { // Podal referencję do tablicy
	if (arguments.length == 1) {
		trSel = "tr";
		tdSel = "td";
		thSel = "th";
	}
	let sortFun = function () {
		let myIndex = this.getAttribute("index"); // :scope>tr
		Array.prototype.slice.call(tabElem.querySelectorAll(`${trSel}:not(:first-child)`), 0).sort((a, b) => {
			let a1 = a.querySelector(`${tdSel}:nth-child(${myIndex})`).innerText;
			let b1 = b.querySelector(`${tdSel}:nth-child(${myIndex})`).innerText;
			return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
		}).forEach(function (daElem, daI, daArr) {
			tabElem.appendChild(daElem);
		});
		tabElem.querySelector(".posortowana")?.classList.remove("posortowana");
		this.classList.add("posortowana");
	};
	tabElem.classList.add("sortowalnaTabela");
	frycAPI.injectStyleNormal(/*css*/`
		.sortowalnaTabela {
			& ${thSel} {
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
	`)
	tabElem.querySelectorAll(thSel).forEach(function (daElem, daI, daArr) {
		daElem.setAttribute("index", daI + 1);
		daElem.addEventListener("click", sortFun);
	});
}
frycAPI.zmierzCzas = function (callBack) {
	let t0 = performance.now();
	callBack();
	let t1 = performance.now();
	loguj(`Czas ${frycAPI.czasNumer}: ${frycAPI.zaokrl(t1 - t0, 2)} ms`);
	frycAPI.czasNumer++;
}
frycAPI.onLoadSetter = function (callBack) {
	frycAPI.onLoad = callBack;
	window.addEventListener("load", frycAPI.onLoad);
}
frycAPI.forEach = function (selector, callback) {
	document.querySelectorAll(selector).forEach(callback);
}
frycAPI.template = function () {
}

Element.prototype.frycAPI_addClass = function (newClass) {
	this.classList.add(newClass);
	return this
}
Element.prototype.frycAPI_removeClass = function (remClass) {
	this.classList.remove(remClass);
	return this
}
Element.prototype.frycAPI_setAttribute = function (attName, attValue) {
	this.setAttribute(attName, attValue);
	return this
}
Element.prototype.frycAPI_setInnerHTML = function (newInnerHTML) {
	this.innerHTML = newInnerHTML;
	return this
}
Element.prototype.frycAPI_insertAdjacentElement = function (where, elem) {
	this.insertAdjacentElement(where, elem);
	return this
}
Element.prototype.frycAPI_addEventListener = function (listenerType, callBack) {
	this.addEventListener(listenerType, callBack);
	return this
}
String.prototype.frycAPI_includesAny = function (list) {
	for (const daElem of list) {
		if (this.includes(daElem)) {
			return true
		}
	}
}

frycAPI.funcArr = [];
frycAPI.host = window.location.hostname;
frycAPI.colorSchemeDark = false;
frycAPI.czasNumer = 1;

if (frycAPI.host == "demo") {
	frycAPI.nazwaBlokuIf = "Demo";
	frycAPI.injectStyle(/*css*/`
		.myDemoDiv {
			display: block;
			background-color: black;
		}	
	`);

	(frycAPI.beforeLoad = function () {
		loguj("beforeLoad");
	})();

	frycAPI.onLoadSetter(() => {
		loguj("onLoad");
	});

	frycAPI.manualFunctionsCreator(frycAPI.nazwaBlokuIf, [
		{
			name: "Funkcja 1", callBack: () => {
				loguj("Funkcja 1");
			}
		},
		{
			name: "Funkcja 2", callBack: () => {
				loguj("Funkcja 2");
			}
		},
	]);
}

if (frycAPI.host.length) { // Globalne funkcje
	frycAPI.nazwaBlokuIf = "Globalne funkcje";
	frycAPI.injectStyle(/*css*/`
	`);

	(frycAPI.beforeLoad = function () {
		new MutationObserver((mutRec, docObs) => {
			if (frycAPI.colorSchemeDark) {
				docObs.disconnect();
				return
			}
			if (document.head) {
				// `<meta name="color-scheme" content="only light">` insertAdjacentHTML
				// document.head.insertAdjacentHTML("afterbegin", `<meta name="color-scheme" content="only light">`);
				document.head.insertAdjacentElement("afterbegin", document.createElement("meta").frycAPI_setAttribute("name", "color-scheme").frycAPI_setAttribute("content", "only light"));
				docObs.disconnect();
			}
		}).observe(document.documentElement, { childList: true });
	})();

	frycAPI.onLoadSetter(() => {
	});

	frycAPI.manualFunctionsCreator(frycAPI.nazwaBlokuIf, [
		{
			name: "ඞ", callBack: () => {
				let all = document.getElementsByTagName("*");
				for (let i = 0, max = all.length; i < max; i++) {
					if (all[i].nodeName != 'STYLE' && all[i].nodeName != 'SCRIPT' && all[i].nodeName != 'NOSCRIPT') {
						children = all[i].childNodes;
						for (let j = 0; j < children.length; j++) {
							if (children[j].nodeType == Node.TEXT_NODE) {
								children[j].nodeValue = "ඞ";
							}
						}
					}
				}
			}
		},
		{
			name: "Toggle Style", callBack: (ifNum, funcNum) => {
				let myStyle = document.getElementById("frycAPI_myStyle");
				if (myStyle) {
					frycAPI.style = myStyle.cloneNode(1);
					myStyle.remove();
					frycAPI.funcArr[ifNum][1][funcNum].Off = true;
					return "toggleOnOff"
				} else if (frycAPI.style) {
					document.body.insertAdjacentElement("afterend", frycAPI.style);
					frycAPI.funcArr[ifNum][1][funcNum].Off = false;
					return "toggleOnOff"
				}
			}
		},
		{
			name: "Edit Script", callBack: () => {
				let str =
					`FileRead, Contents, G:\\Biblioteki Windows\\Dokumenty\\1. Mój Folder\\!HTML stuff\\!Mój Stuff\\Chrome Extensions\\JS + CSS Injector\\frycAPI.js
LineNum := 1
MaxLine := 0
host := "${frycAPI.host}"
Loop, Parse, Contents, \`n
{
	If (InStr(A_loopfield, host)) {
		LineNum := A_Index
		break
	}
	MaxLine := A_Index
}
If (LineNum == 1) {
	Run, % """C:\\Users\\Fryderyk\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"" --goto ""G:\\Biblioteki Windows\\Dokumenty\\1. Mój Folder\\!HTML stuff\\!Mój Stuff\\Chrome Extensions\\JS + CSS Injector\\frycAPI.js:" . MaxLine . ":1"""
	Clipboard := host
} else {
	Run, % """C:\\Users\\Fryderyk\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"" --goto ""G:\\Biblioteki Windows\\Dokumenty\\1. Mój Folder\\!HTML stuff\\!Mój Stuff\\Chrome Extensions\\JS + CSS Injector\\frycAPI.js:" . LineNum . ":1"""
}
WinActivate,  - Visual Studio Code
FileDelete, G:\\Biblioteki Windows\\Pobrane\\VSC_Go_To_Line.ahk`;
				frycAPI.download(str, "VSC_Go_To_Line.ahk");
			}
		},
	]);
}

if (1 && frycAPI.host == "192.168.1.1") {
	frycAPI.injectStyle(/*css*/`
		#menu a.sel span.text {
			color: #000000;
		}
	`);
}
if (1 && frycAPI.host == "alienswarm.fandom.com") {
	frycAPI.injectStyle(/*css*/`
		button.mojButt {
			position: fixed;
			top: 65px;
			left: 78px;
			width: 200px;
			height: 100px;
			cursor: pointer;
		}
	`);
}
if (1 && frycAPI.host == "apps.microsoft.com") {
	frycAPI.injectStyle(/*css*/`
		.full-star {
			fill: #ffbf00;
			stroke: #ffbf00;
		}
	`);
}
if (1 && frycAPI.host == "ark.fandom.com") {
	// https://ark.fandom.com/wiki/ARK_Survival_Evolved_Wiki
	let funkcje = "ARK Wiki Powiększ obrazki";
	frycAPI.injectStyle(/*css*/`
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
		// 			if (myImgSrc != newSrc) {
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

		frycAPI.obrazekObserwer = function (myImg) {
			let myImgSrc = myImg.src;
			let myIndx = myImgSrc.indexOf(scaleStr);
			let myWidth = myImg.getAttribute("width");
			// frycAPI.obrazekData.push({myIndx: myIndx, myWidth: myWidth})
			if (myIndx !== -1 && myWidth !== null) {
				let newSrc = myImgSrc.substr(0, myIndx + scaleStr.length + 1)
					+ (myWidth * 2)
					+ myImgSrc.substr(myImgSrc.indexOf("?"));
				if (myImgSrc != newSrc) {
					myImg.src = newSrc;
					// myImg.classList.add("zmienione");
					// loguj("Zmieniam")
				}
			}
		}

		let scaleStr = "scale-to-width-down";
		let opcje = { attributes: true };
		// let obrazekImg = new MutationObserver((mutRec) => {
		// 	frycAPI.obrazekObserwer(mutRec[0].target);
		// });
		// frycAPI.obrazCount = {};
		function addObserver(daElem) {
			frycAPI.obrazekObserwer(daElem);
			new MutationObserver((mutRec) => {
				frycAPI.obrazekObserwer(mutRec[0].target);
			}).observe(daElem, opcje);
			// daElem.classList.add("bylem");
			// loguj(daI)
		}
		frycAPI.bodyObs = new MutationObserver((mutRec) => {
			if (!frycAPI.bodyObs.hasOwnProperty("pierwszy")) {
				frycAPI.bodyObs.pierwszy = 1;
				frycAPI.forEach("img[src]", function (daElem, daI, daArr) {
					addObserver(daElem);
				});
			}
			mutRec.forEach(function (daElem, daI, daArr) {
				daElem.addedNodes.forEach(function (daElem1, daI, daArr) {
					// loguj(daElem1);
					if (daElem1.nodeName == "IMG" && daElem1.matches("img[src]")) {
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

		loguj("ARK done!")
	})();

	frycAPI.onLoadSetter(() => {
		// loguj("load img[src] = " + document.querySelectorAll("img[src]").length);
		frycAPI.bodyObs.disconnect();
		// frycAPI.obrazCount.c_load = document.querySelectorAll("img[src]").length;
		// loguj(frycAPI.obrazCount);
	});
}
if (1 && frycAPI.host == "astronomia.zagan.pl") {
	frycAPI.injectStyle(/*css*/`
		body {
		  background-image: none;
		  background-color: #656565;
		  color: white;
		}
	`);
}
if (1 && frycAPI.host == "bcgplatinion.com") {
	frycAPI.injectStyle(/*css*/`
		.cli-barmodal-open {
			overflow: scroll;
		}
	`);
}
if (1 && frycAPI.host == "blog.discord.com") {
	frycAPI.injectStyle(/*css*/`
		body {
		  filter: invert(1);
		}
		img {
		  filter: invert(1) !important;
		}
	`);
}
if (0 && frycAPI.host == "blog.etrapez.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "bloons.fandom.com") {
	frycAPI.injectStyle(/*css*/`
		img.mwe-math-fallback-image-display.mwe-math-element {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.hostList(["boards.4chan.org", "boards.4channel.org"])) {
	let bodyBack, rediSpan;
	let transTime = 0.25; // 0.25
	if (frycAPI.host == "boards.4chan.org") {
		// bodyBack = "#ffe"; rediSpan = "#00e";
		bodyBack = "#ffe"; rediSpan = "#00e";
	} else {
		// bodyBack = "#eef2ff"; rediSpan = "#34345c";
		bodyBack = "#21252E"; rediSpan = "#D9D5FF";
	}
	frycAPI.injectStyle(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed;
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
		}
		html {
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
		.yotsuba_b_new .backlink a {
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
		.postMessage :is(.quoteLink, .quotelink), 
		.deadlink,
		a:hover,
		.yotsuba_b_new .backlink a:hover {
			color: #FF4D25!important;
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
		}
		span.dateTime {
			margin-left: 3px;
			font-family: Source Code Fryc;
			font-size: 13px;
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
	`);

	if (window.location.pathname.includes("thread")) {
		let opcje = { childList: true };
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
			let obserwatorBlok = new MutationObserver(function mutatorBlockquote(myRec) {
				// debugger
				// loguj(myRec);
				if (myRec[0].addedNodes.length) {
					let nowyNode = myRec[0].addedNodes[0].frycAPI_addClass("powiekszPocz");
					let targetChildren = myRec[0].target.childNodes;
					if (targetChildren.length > 2) {
						let trgChildN = targetChildren.length;
						if ((() => {
							for (let i = 0; i <= trgChildN - 1; i++) {
								if (targetChildren[i].id && targetChildren[i].id.split("p")[1] > nowyNode.id.split("p")[1]) {
									targetChildren[i].insertAdjacentElement("beforebegin", nowyNode);
									return 0
								}
							}
							return 1
						})()) {
							targetChildren[trgChildN - 1].insertAdjacentElement("afterend", nowyNode);
						}
					} else {
						targetChildren[1].insertAdjacentElement("afterend", nowyNode);
					}
					obserwatorBlok.observe(nowyNode.querySelector("blockquote.postMessage"), opcje);
					obserwatorLink.observe(nowyNode.querySelector("blockquote.postMessage .myDiv"), opcje);
					if (fileThumb = nowyNode.querySelector("a.fileThumb")) {
						obserwatorFileThumb.observe(fileThumb, opcje);
					}
				} else if (myRec.length > 1 && myRec[0].removedNodes.length) {
					requestAnimationFrame(function () {
						myRec[0].removedNodes[0].frycAPI_removeClass("powiekszPocz");
					});
				} else {
					// myRec[0].removedNodes[0]
					// .frycAPI_removeClass("powiekszPocz")
					// .frycAPI_removeClass("powiekszKon");
				}
			});
			let obserwatorLink = new MutationObserver(function mutatorQuotelink(myRec) {
				// debugger
				if (myRec[0].addedNodes.length) {
					let nowyNode = myRec[0].addedNodes[0].frycAPI_addClass("powiekszPocz");
					// loguj(nowyNode.classList);
					let linki = myRec[0].target.querySelectorAll("a.linkfade");
					for (let i = 0; i < linki.length; i++) {
						if (linki[i].getAttribute("data-pfx") == nowyNode.getAttribute("data-pfx")) {
							linki[i].insertAdjacentElement("afterend", nowyNode);
							obserwatorBlok.observe(nowyNode.querySelector("blockquote.postMessage"), opcje);
							obserwatorLink.observe(nowyNode.querySelector("blockquote.postMessage .myDiv"), opcje);
							if (fileThumb = nowyNode.querySelector("a.fileThumb")) {
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
			let obserwatorFileThumb = new MutationObserver(function mutatorFileThumb(myRec) {
				{
					// console.table(myRec);
					// myRec.forEach(function (daElem, daI, daArr) {
					// 	if (daElem.type == "attributes" && daElem.target.classList.contains("expanded-thumb")) {
					// 		loguj(daElem.oldValue);
					// 		loguj(daElem.target.getAttribute("style"));
					// 		loguj(daElem.target.style.maxWidth);
					// 	}
					// });
					// myRec[0].addedNodes[0]
				}
				let aFile = myRec[0].target;
				let thumb = aFile.firstChild;
				aFile.parentNode.parentNode.parentNode.scrollIntoView();
				if (myRec[0].addedNodes.length) {
					let addedImg = myRec[0].addedNodes[0];
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
			let mini = function (thumb, addedImg) {
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
					thumb.style.display = "none";
					thumb.removeEventListener("transitionend", thumbTrans, false);
				});
			}
			let obserwatorImg = new MutationObserver(function mutatorImg(myRec, mutObs) {
				let addedImg = myRec[0].target;
				// loguj("classList: " + addedImg.classList.value);
				// if (addedImg.classList.contains("byłem")) {
				// 	return
				// } else {
				// 	addedImg.classList.add("byłem");
				// }
				loguj("obserwatorImg");
				// debugger
				let thumb = addedImg.previousSibling;
				// loguj(addedImg.getAttribute("style"));
				// loguj(addedImg.complete);
				thumb.style.display = "block";
				// addedImg.style.display = "none";
				addedImg.classList.add("dispNone");
				if (addedImg.complete == false) {
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
				let myDiv = document.createElement("div");
				myDiv.classList.add("myDiv");
				while (daElem.childNodes.length > 0) {
					myDiv.appendChild(daElem.childNodes[0]);
				}
				if (myDiv.childNodes.length == 0) {
					daElem.classList.add("pusty");
				}
				daElem.appendChild(myDiv);
				obserwatorLink.observe(myDiv, opcje);
				obserwatorBlok.observe(daElem, opcje);
			});

			document.querySelector("div.post.op .file").insertAdjacentElement('beforebegin', document.querySelector("div.post.op .postInfo.desktop"));
			// document.getElementById("bl_39814357").appendChild(document.getElementById("bl_39814357").firstChild.cloneNode(1))

			frycAPI.forEach(".desktop span.dateTime", function (daElem, daI, daArr) {
				let d = new Date(Number(daElem.getAttribute("data-utc")) * 1000);
				daElem.innerHTML = d.toLocaleString("pl-PL", { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }).replace(", ",
					"|" + d.toLocaleString("en-GB", { weekday: 'short', timeZone: 'America/New_York' }) + "|");
			});

			{ // Ukrywanie postów
				frycAPI.hidePost = function (daElem) {
					daElem.parentNode.parentNode.parentNode.classList.toggle("ukryty");
				}
				frycAPI.forEach(".desktop span.name", function (daElem, daI, daArr) {
					daElem.setAttribute("onclick", "frycAPI.hidePost(this);");
					// daElem.addEventListener("click", hidePost);
				});

				frycAPI.hidePostBar = function (daElem) {
					daElem.parentNode.classList.toggle("ukryty");
				}
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

			frycAPI.forEach(".postInfoM.mobile", function (daElem, daI, daArr) { daElem.remove(); });

			frycAPI.forEach("a.fileThumb", function (daElem, daI, daArr) {
				let wymiary = daElem.previousSibling.childNodes[2].data.match(/(?<=[ x])\d+/g);
				// daElem.firstChild.setAttribute("a_width", wymiary[0]);
				// daElem.firstChild.setAttribute("a_height", wymiary[1]);
				daElem.firstChild.setAttribute("a_aspect", wymiary[0] / wymiary[1]);
				daElem.firstChild.setAttribute("deafult_style", daElem.firstChild.getAttribute("style"));
				obserwatorFileThumb.observe(daElem, opcje)
			});

			if (document.querySelector(".redditify") === null) {
				let redSpan = document.createElement("span");
				let redDiv = document.createElement("div");
				redDiv.classList.add("redditify");
				// redSpan.setAttribute("onclick", "redditify();");
				redSpan.addEventListener("click", async function redditify() {
					let reddit = document.querySelector(".redditify span");
					if (!reddit.classList.contains("koniec")) {
						reddit.classList.add("koniec")
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
						let mySvg = reddit.parentNode.querySelector("svg");
						let czas = 1.44;
						let liczba = 12;
						for (let i = 1; i < liczba; i++) {
							let myRect = mySvg.querySelector("rect").cloneNode(1);
							myRect.setAttribute("transform", `rotate(-${i / liczba * 360})`);
							myRect.children[0].setAttribute("begin", `-${i / liczba * czas}s`);
							// console.log(myRect);
							mySvg.append(myRect);
						}
						while (await (async function () {
							let linki = document.querySelectorAll(".backlink>span>.quotelink:not(.linkfade)");
							//console.log(linki.length);
							for (let i = 0; i < linki.length; i++) {
								linki[i].click();
								await frycAPI.sleep(1);
							}
							return linki.length
						})()) { }

						reddit.innerHTML = "Redditified";
						mySvg.remove();
					}
				});
				redSpan.innerHTML = "Redditify";
				let navDiv = document.querySelector(".navLinks.desktop");
				navDiv.append(" [");
				navDiv.appendChild(redDiv).appendChild(redSpan);
				navDiv.append("]");
			}
		});

		loguj("4chan done!");
	}
}
if (1 && frycAPI.host == "bugs.chromium.org") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "chat.openai.com") {
	frycAPI.injectStyle(/*css*/`
		:root {
			--szer: 345px;
		}
		.w-\\[260px\\] {
			width: var(--szer);
		}
		.dark.flex-shrink-0.overflow-x-hidden.bg-gray-900 {
			width: var(--szer) !important;
		}
	`);
}
if (0 && frycAPI.host == "cke.gov.pl") {
	frycAPI.injectStyle(/*css*/`
		h2, .h2 {
		    color: #F8A238;
		}
	`);
}
if (1 && frycAPI.host == "comforteo.eu") {
	frycAPI.injectStyle(/*css*/`
		.tooltip-static .content-area {
			color: hsl(0deg 0% 0%);
		}
	`);
}
if (1 && frycAPI.host == "comparetwolists.com") {
	frycAPI.injectStyle(/*css*/`
		body {
			font-family: IBM Plex Sans Condensed;
		}
		img[src="download.png"] {
			filter: invert(1) brightness(2);
		}
	`);
}
if (1 && frycAPI.host == "cotone.pl") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "css-tricks.com") {
	frycAPI.injectStyle(/*css*/`
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
	`);
	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(".comment-content", function (daElem, daI, daArr) {
			daElem.insertAdjacentElement("afterbegin", document.createElement("div").frycAPI_addClass("myDiv"));
		});
	});
}
if (1 && frycAPI.host == "derpibooru.org") {
	frycAPI.injectStyle(/*css*/`
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
		
		img[src="/images/tagblocked.svg"] {
			width: 0px;
			height: 0px;
			padding: 50%;
			background-image: url("https://derpicdn.net/img/view/2012/9/22/104317.png");
			background-size: cover;
		}
		
		div#comments {
			display: flex;
			flex-direction: column-reverse;
		}
		div#comments>.block:not(.communication) {
			order: 1;
		}
	`);
}
if (1 && frycAPI.host == "developer.mozilla.org") {
	frycAPI.injectStyle(/*css*/`
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
	`);
}
if (0 && frycAPI.host == "diep.io") {
	frycAPI.injectStyle(/*css*/`
		body #app-mount .container-1r6BKw {
			justify-content: space-between;
		}body {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
}
if (1 && frycAPI.host == "dinopoloclub.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "docs.google.com") {
	frycAPI.injectStyle(/*css*/`
		body #docs-editor-container .grid-table-container+canvas, .docos-icon-img:before { /* .goog-palette-cell .docs-preview-palette-item */
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
	`);
}
if (0 && frycAPI.host == "docs.screeps.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "drive.google.com") {
	frycAPI.injectStyle(/*css*/`
		/*
		div[role="dialog"] div[role="document"] {
		filter: none !important;
		}
		*/
		.a-b-Xa-yj.a-b-tb-Ce.a-b-Xa-La-jh {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
}
if (1 && frycAPI.host == "dydmat.mimuw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "eager.io") {
	frycAPI.injectStyle(/*css*/`
		.blog-post-content a:not(.button):not(.without-underline) {
			text-shadow: none;
			text-decoration: underline;
		}
	`);
}
if (1 && frycAPI.host == "en.wikipedia.org") {
	frycAPI.injectStyle(/*css*/`
		img.thumbimage[src*=".png"],
		img.thumbimage[src*=".gif"] 
		/* a.image:has(img[src*=".png"]) */
		{
			  filter: invert(1) hue-rotate(180deg);
			  background-color: #c9c9c9;
		}
	`);
}
if (1 && frycAPI.host == "epodreczniki.open.agh.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "fizyka.dk") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(1) !important;
		}
	`);
}
if (1 && frycAPI.host == "forms.office.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "forum.videohelp.com") {
	frycAPI.injectStyle(/*css*/`
		body {
			background-color: aliceblue;
		}
	`);
}
if (1 && frycAPI.host == "gamertools.net") {
	frycAPI.injectStyle(/*css*/`
		.gameItem {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
}
if (1 && frycAPI.host == "industrial.omron.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (0 && frycAPI.host == "jp.pum.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		body {
		  font-family: IBM Plex Sans !important;
		}
	`);
}
if (1 && frycAPI.host == "json2table.com") {
	frycAPI.injectStyle(/*css*/`
		table * {
			font-family: Source Code Fryc;
		}
	`);
}
if (1 && frycAPI.host == "jsongrid.com") {
	frycAPI.injectStyle(/*css*/`
		td.obj.order.index {
			display: none;
		}
	`);
}
if (1 && frycAPI.host == "karl.gg") {
	frycAPI.injectStyle(/*css*/`
		.statsContainer {
		  border-top: 1px solid;
		}
		.statsText[data-v-a848cd50] {
		  line-height: inherit;
		}
	`);
}
if (1 && frycAPI.host == "kertisjones.weebly.com") {
	frycAPI.injectStyle(/*css*/`
		#main-wrap .inner-container {
			background: none;
		}
	`);
}
if (0 && frycAPI.host == "labfiz1p.if.pw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		* {
		  font-family: IBM Plex Sans !important;
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
}
if (1 && frycAPI.host == "latarnikwyborczy.pl") {
	frycAPI.injectStyle(/*css*/`
		.content-questionnaire .answer-candidates .answer {
			background-image: url(https://cdn.discordapp.com/attachments/594793235365232662/1157049046121320618/arrow-down.png);
		}
	`);
}
if (1 && frycAPI.host == "linuxconfig.org") {
	frycAPI.injectStyle(/*css*/`
		.asciinema-player.asciinema-theme-asciinema {
			filter: invert(1) hue-rotate(180deg);
		}
	`);
}
if (1 && frycAPI.host == "llamalab.com") {
	frycAPI.injectStyle(/*css*/`
		.background-image.cover.hero-background {
			display: none;
		}
	`);
}
if (1 && frycAPI.host == "mail.google.com") {
	frycAPI.injectStyle(/*css*/`
		.aD::before, .btn::before, .btl.acK, .bs3::before, .T-axO .J-JN-M-I-JG, .J-Z .aaA.aaB, .J-J5-Ji.J-Z-M-I-JG {
			filter: invert(1);
		}
		
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
		
		.aYi.cQ {
			color: #fff;
		}
		
		.pG>.a9q {
			background-position: center;
		}
		
		.agJ:hover, .agJ.bjE {
			background: rgb(71 70 70 / 31%);
		}
		
		/*
		[dir="ltr"] {
		  filter: invert(1) hue-rotate(180deg);
		}
		*/
	`);
}
if (1 && frycAPI.host == "mat-fiz-samouczek.pw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img.teximage {
		    background-color: #ffffff;
		    border: 5px solid white;
		    border-radius: 3px;
		}
	`);
}
if (1 && frycAPI.host == "matematykaszkolna.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "matlab.mathworks.com") {
	frycAPI.injectStyle(/*css*/`
		.textElement.eoOutputContent {
			user-select: text !important;
		}
	`);
}
if (1 && frycAPI.host == "matma4u.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "matrixcalc.org") {
	frycAPI.injectStyle(/*css*/`
		a[title="Бе́ло-кра́сно-бе́лый флаг"] {
		  display: none !important;
		}
		mtr:not(:last-child) {
			height: 25px;
		}
	`);
}
if (1 && frycAPI.host == "minecraft.fandom.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "mlp.fandom.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "oeis.org") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(1) hue-rotate(180deg);
		}
		body {
			background-color: black;
		}
	`);
}
if (1 && frycAPI.host == "ostatnidzwonek.pl") {
	frycAPI.injectStyle(/*css*/`
		body {
		background: none;  
		background-color: white;
		}
	`);
}
if (1 && frycAPI.host == "palobby.com") {
	let funkcje = "PAT_DB_Unit_Korekta";
	frycAPI.injectStyle(/*css*/`
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
		//<span title="Cooldown Time">0:00</span>
		if (document.querySelector("span[title='Rolloff Time']") !== null && document.querySelector("div.columns>div:nth-child(2) h4").innerText == "Physics") {
			let listy = document.querySelectorAll("h4+ul.list-unstyled");
			let zbudPrzez;
			for (let i = 0; i < listy.length; i++) {
				if (listy[i].previousElementSibling.innerText == "Built By") {
					zbudPrzez = listy[i];
					break;
				}
			}
			let spanRolloffTime = document.createElement("span");
			spanRolloffTime.title = "Rolloff Time";
			spanRolloffTime.classList.add("dodane");
			spanRolloffTime.innerHTML = "0:00";
			let zbudChild = zbudPrzez.children;
			for (let i = 0; i < zbudChild.length; i++) {
				if (zbudChild[i].querySelector("span[title='Rolloff Time']") === null) {
					zbudChild[i].appendChild(document.createTextNode(" + "));
					zbudChild[i].appendChild(spanRolloffTime.cloneNode(1));
				}
			}
			console.log("Done!")
		}
	});
}
if (1 && frycAPI.host == "pl.wikibooks.org") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "pl.wikipedia.org") {
	frycAPI.injectStyle(/*css*/`
		img.thumbimage[src*=".png"] 
		/* a.image:has(img[src*=".png"]) */
		{
			  filter: invert(1) hue-rotate(180deg);
			  background-color: #c9c9c9;
		}
	`);
}
if (1 && frycAPI.host == "pl.wikisource.org") {
	frycAPI.injectStyle(/*css*/`
		.mwe-math-fallback-image-inline {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "planetcalc.com") {
	let funkcje = "Łatwiejsze kopiowanie";
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(0) hue-rotate(
		180deg) !important;
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

	frycAPI.manualFunctionsCreator(frycAPI.nazwaBlokuIf, [
		["Łatwiejsze kopiowanie", () => {
			let x = document.querySelectorAll(".mrow>.texatom>.mrow>span.msubsup>span>span>span.mn");
			for (let i = 0; i < x.length; i++) {
				x[i].innerHTML = "(" + x[i].innerHTML + ")";
			}
		}],
	]);
}
if (1 && frycAPI.host == "quicklatex.com") {
	frycAPI.injectStyle(/*css*/`
		img {
			filter: invert(1);
			background: transparent !important;
		}
	`);
}
if (1 && frycAPI.host == "robotyka.pl") {
	frycAPI.injectStyle(/*css*/`
		img[src*=".gif"],
		img[src*=".png"]{
			filter: invert(1) hue-rotate(180deg);
		}
	`);
}
if (1 && frycAPI.host == "satisfactory.fandom.com") {
	frycAPI.injectStyle(/*css*/`
		img.mwe-math-fallback-image-inline {
			filter: invert(1) !important;
		}
		
		.resizable-container {
			max-width: 100%;
			width: calc(100% - 34px * 2);
			margin: 0 34px;
		}
	`);
}
if (1 && frycAPI.host == "satisfactory.wiki.gg") {
	frycAPI.injectStyle(/*css*/`
		/* Tymczasowe */
		tr:has([title="Equipment Workshop"]),
		tr:has([title="Build Gun"]),
		tr:has(.recipe-alternate){
		  display: none;
		}
	`);
}
if (1 && frycAPI.host == "scripty.abhisheksatre.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "second.wiki") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "soundcloud.com") {
	let funkcje = "Get Covers From Sound Cloud";
	frycAPI.injectStyle(/*css*/`
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

	frycAPI.manualFunctionsCreator(frycAPI.nazwaBlokuIf, [
		["Get Covers From Sound Cloud", () => {
			let artwork = document.querySelectorAll(".playableTile__image>.sc-artwork>span");
			newDiv = document.createElement("div");
			newDiv.setAttribute("id", "mojelem");
			let styl = "";
			for (let i = 0; i < 184; i++) {
				styl = window.getComputedStyle(artwork[i]).getPropertyValue("background-image");
				newDiv.innerHTML += styl;
				newDiv.innerHTML += "<br>";
			}
			let the_div = document.getElementById("app");
			document.body.insertBefore(newDiv, the_div);
		}],
	]);
}
if (1 && frycAPI.hostListIncludes(["stackoverflow.com", "stackexchange.com"])) {
	let funkcje = "Stack Overflow fix";
	frycAPI.injectStyle(/*css*/`
		.user-info .-flair {
			display: flex !important;
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
		body {
			--ff-sans: IBM Plex Sans Condensed;
		}
		.owner {
			background-color: ${frycAPI.host == "stackoverflow.com" ? "#d5d5d5" : "#313131"};
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
		footer#footer {
			filter: invert(1) hue-rotate(180deg);
		}
	`);

	frycAPI.onLoadSetter(() => {
		frycAPI.forEach(".user-info:has(.gravatar-wrapper-32)", function (daElem, daI, daArr) {
			let myDiv = document.createElement("div");
			myDiv.classList.add("myDiv");
			daElem.querySelector(".user-action-time").insertAdjacentElement("afterend", myDiv);
			myDiv.appendChild(daElem.querySelector(".user-gravatar32"));
			myDiv.appendChild(daElem.querySelector(".user-details"));
		});

		function zaokrl(val, decimals) {
			return +(Math.round(+(val.toFixed(decimals) + "e+" + decimals)) + "e-" + decimals);
		}
		function czytelnyCzas(czas) {
			czas = czas / 1000; let czytCzas = "";
			/* sekundy  */ if (60 > czas) { czytCzas = zaokrl(czas, 1).toFixed(1) + " sekund"; } else
			  /* minuty   */ if (3600 > czas) { czytCzas = zaokrl(czas / 60, 1).toFixed(1) + " minut"; } else
				 /* godziny  */ if (86400 > czas) { czytCzas = zaokrl(czas / 60 / 60, 1).toFixed(1) + " godzin"; } else
					/* dni      */ if (2592000 > czas) { czytCzas = zaokrl(czas / 60 / 60 / 24, 1).toFixed(1) + " dni"; } else
					  /* miesiące */ if (31536000 > czas) { czytCzas = zaokrl(czas / 60 / 60 / 24 / 30, 1).toFixed(1) + " miesięcy"; } else
						 /* lata     */ { czytCzas = zaokrl(czas / 60 / 60 / 24 / 365, 1).toFixed(1) + " lat"; }
			return czytCzas + " temu";
		}
		function mutObs() {
			// console.log("Zostałem wezwany!");
			let czas = new Date().getTime();
			let opcje = {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit"
			};
			// let nodeI = 0;
			frycAPI.forEach(".relativetime-clean:not(.mySpanTime), .relativetime:not(.mySpanTime)", function (daElem, daI, daArr) {
				let data = new Date(daElem.title.replace(/,.*/, ""));
				daElem.innerHTML = data.toLocaleString("en-ZA", opcje).replaceAll("/", "-");
				daElem.title = czytelnyCzas(czas - data.getTime());
				daElem.classList.add("mySpanTime");
				// nodeI++;
			});
			// console.log(`Przetworzyłem ${nodeI} nodów!`);
		}
		mutObs();

		new MutationObserver(mutObs).observe(document.body, { childList: true, subtree: true });

		let kod = document.createElement("script");
		kod.innerHTML = zaokrl.toString() + czytelnyCzas.toString() + mutObs.toString();
		document.body.appendChild(kod);
	});
}
if (1 && frycAPI.host == "steamcommunity.com") {
	let funkcje = "Steam Achievments Alphabetical Sort";
	frycAPI.injectStyle(/*css*/`
		.qrcode_Bit_2Yuvr.qrcode_Active_274P1 {
			filter: invert(1) contrast(1);
		}
	`);

	frycAPI.onLoadSetter(() => {
		if (window.location.pathname == "/stats/563560/achievements/") {
			frycAPI.injectStyleNormal(/*css*/`
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
			`)
			let achiev = document.querySelectorAll("#mainContents .achieveRow");
			// START: Część specjalna
			{
				let achievObj = JSON.parse(`
				{"Landing Bay":{"num":1,"camp":"Jacob's Rest"},"Cargo Elevator":{"num":2,"camp":"Jacob's Rest"},"Deima Surface Bridge":{"num":3,"camp":"Jacob's Rest"},"Rydberg Reactor":{"num":4,"camp":"Jacob's Rest"},"SynTek Residential":{"num":5,"camp":"Jacob's Rest"},"Sewer Junction":{"num":6,"camp":"Jacob's Rest"},"Timor Station":{"num":7,"camp":"Jacob's Rest"},"Landing Zone":{"num":1,"camp":"Area 9800"},"Cooling Pump":{"num":2,"camp":"Area 9800"},"Power Generator":{"num":3,"camp":"Area 9800"},"Wastelands":{"num":4,"camp":"Area 9800"},"Storage Facility":{"num":1,"camp":"Operation Cleansweep"},"Landing Bay 7":{"num":2,"camp":"Operation Cleansweep"},"U.S.C. Medusa":{"num":3,"camp":"Operation Cleansweep"},"Transport Facility":{"num":1,"camp":"Research 7"},"Research 7":{"num":2,"camp":"Research 7"},"Illyn Forest":{"num":3,"camp":"Research 7"},"Jericho Mines":{"num":4,"camp":"Research 7"},"Insertion Point":{"num":1,"camp":"Tears for Tarnor"},"Abandoned Maintenance Tunnels":{"num":2,"camp":"Tears for Tarnor"},"Oasis Colony Spaceport":{"num":3,"camp":"Tears for Tarnor"},"Midnight Port":{"num":1,"camp":"Tilarus-5"},"Road to Dawn":{"num":2,"camp":"Tilarus-5"},"Arctic Infiltration":{"num":3,"camp":"Tilarus-5"},"Area 9800":{"num":4,"camp":"Tilarus-5"},"Cold Catwalks":{"num":5,"camp":"Tilarus-5"},"Yanaurus Mine":{"num":6,"camp":"Tilarus-5"},"The Factory":{"num":7,"camp":"Tilarus-5"},"Communication Center":{"num":8,"camp":"Tilarus-5"},"SynTek Hospital":{"num":9,"camp":"Tilarus-5"},"Lana's Bridge":{"num":1,"camp":"Lana's Escape"},"Lana's Sewer":{"num":2,"camp":"Lana's Escape"},"Lana's Maintenance":{"num":3,"camp":"Lana's Escape"},"Lana's Vents":{"num":4,"camp":"Lana's Escape"},"Lana's Complex":{"num":5,"camp":"Lana's Escape"},"Unexpected Encounter":{"num":1,"camp":"Paranoia"},"Hostile Places":{"num":2,"camp":"Paranoia"},"Close Contact":{"num":3,"camp":"Paranoia"},"High Tension":{"num":4,"camp":"Paranoia"},"Crucial Point":{"num":5,"camp":"Paranoia"},"Logistics Area":{"num":1,"camp":"Nam Humanum"},"Platform XVII":{"num":2,"camp":"Nam Humanum"},"Groundwork Labs":{"num":3,"camp":"Nam Humanum"},"Operation X5":{"num":1,"camp":"BioGen Corporation"},"Invisible Threat":{"num":2,"camp":"BioGen Corporation"},"BioGen Labs":{"num":3,"camp":"BioGen Corporation"},"Information Department":{"num":1,"camp":"Accident 32"},"Powerhood":{"num":2,"camp":"Accident 32"},"Research Center":{"num":3,"camp":"Accident 32"},"Confined Facility":{"num":4,"camp":"Accident 32"},"J5 Connector":{"num":5,"camp":"Accident 32"},"Lab Ruins":{"num":6,"camp":"Accident 32"}}
				`.trim());
				achiev.forEach(function (daElem, daI, daArr) {
					let h3 = daElem.querySelector("h3");
					let h3Str = h3.innerHTML;
					let h5str = daElem.querySelector("h5").innerHTML;
					if (h3Str.includes("Speedrun")) {
						let missionStr = h3Str.replace(/ ?Speedrun ?/g, "");
						if (achievObj.hasOwnProperty(missionStr)) {
							h3.innerHTML = `A1 Speedrun | ${achievObj[missionStr].camp} | ${achievObj[missionStr].num.toString().padStart(2, "0")} | <b>${missionStr}</b>`;
						} else {
							h3.innerHTML = `A1 Speedrun | ZZ | <b>${missionStr}</b>`;
						}
						// daElem.classList.add("Speedrun");
					} else if (h3Str.includes("Campaign")) {
						h3Str = "Campaign " + h3Str.replace(/ ?Campaign ?/g, "");
						if (h3Str.includes("Easy")) {
							h3.innerHTML = "A01 " + "<b>" + h3Str + "</b>";
						} else if (h3Str.includes("Normal")) {
							h3.innerHTML = "A02 " + "<b>" + h3Str + "</b>";
						} else if (h3Str.includes("Hard")) {
							h3.innerHTML = "A03 " + "<b>" + h3Str + "</b>";
						} else if (h3Str.includes("Insane")) {
							h3.innerHTML = "A04 " + "<b>" + h3Str + "</b>";
						} else {
							h3.innerHTML = "A05 " + "<b>" + h3Str + "</b>";
						}
					} else if (h3Str.includes("Outstanding Execution")) {
						h3.innerHTML = "A1 " + "<b>" + h3Str + "</b>";
					} else if (h5str.includes("Kill")) {
						if (h5str.includes(" with ")) {
							h3.innerHTML = "A21 Kill with | " + "<b>" + h3Str + "</b>";
						} else if (h5str.includes("Swarm.")) {
							h3.innerHTML = "A22 Kill Swarm | " + "<b>" + h3Str + "</b>";
						} else {
							h3.innerHTML = "A23 Kill | " + "<b>" + h3Str + "</b>";
						}
					}
				});
			}
			// END: Część specjalna

			let achievArr = Array.prototype.slice.call(achiev, 0);
			achievArr.sort((a, b) => {
				let a1 = a.querySelector("h3").innerHTML;
				let b1 = b.querySelector("h3").innerHTML;
				return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
			});
			let main = document.querySelector("#mainContents");
			achievArr.forEach(function (daElem, daI, daArr) {
				main.appendChild(daElem);
			});

			let butt = document.createElement("button");
			butt.setAttribute("onclick", "this.toggleAttribute('aktywny')")
			butt.classList.add("mojButt");
			butt.innerText = "Przełącz widoczność ukończonych osiągnięć";
			butt.setAttribute("aktywny", "");
			document.getElementById("mainContents").insertAdjacentElement("afterbegin", butt);
		}
	});
}
if (1 && frycAPI.host == "support.discord.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "support.microsoft.com") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(1) hue-rotate(180deg) !important;
		}
		
		img[itemprop="logo"] {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "teams.microsoft.com") {
	frycAPI.injectStyle(/*css*/`
		.fui-Flex.___1jvzdal.f22iagw.f1vx9l62.f10pi13n.f1g2edtw {
			display: none;
		}
	`);
}
if (1 && frycAPI.host == "tech.wp.pl") {
	frycAPI.injectStyle(/*css*/`
		iframe {
			display: none !important;
		}
	`);
}
if (1 && frycAPI.host == "terraria.gamepedia.com") {
	frycAPI.injectStyle(/*css*/`
		img {
		    image-rendering: pixelated;
		}
	`);
}
if (1 && frycAPI.host == "tiger.chem.uw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "tplinkmodem.net") {
	frycAPI.injectStyle(/*css*/`
		tr.head>th.table-head:nth-child(2) {
		  width: 11% !important;
		}
	`);
}
if (1 && frycAPI.hostList(["translate.google.com", "translate.google.pl"])) {
	frycAPI.injectStyle(/*css*/`
		.myButn {
		  position: absolute;
			top: 20px;
			z-index: 9999;
			left: 300px;
		}
		.RvYhPd::before {
			content: none;
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
		
		
		*:not([class*="hljs"]):not(code)::-webkit-scrollbar {
		  all: initial;
		}
		*:not([class*="hljs"]):not(code)::-webkit-scrollbar-corner {
		  all: initial;
		}
		
		*:not([class*="hljs"]):not(code)::-webkit-scrollbar-track {
		  all: initial;
		}
		*:not([class*="hljs"]):not(code)::-webkit-scrollbar-thumb {
		  all: initial;
		}
		*:not([class*="hljs"]):not(code)::-webkit-scrollbar-thumb:hover {
		  all: initial;
		}
		
		*:not([class*="hljs"]):not(code)::-webkit-scrollbar-thumb:active {
		  all: initial;
		}
		*/
	`);
	frycAPI.onLoadSetter(() => {
		document.querySelector("[jsname='dnDxad']")
			.addEventListener("click", function () {
				document.querySelector(".D5aOJc.vJwDU").click();
			});
	});
}
if (0 && frycAPI.host == "trello.com") {
	frycAPI.injectStyle(/*css*/`
		*::-webkit-scrollbar-thumb {
		  background:rgb(102, 254, 123) !important;
		}
	`);
}
if (1 && frycAPI.host == "u4.satisfactorytools.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "moodle.usos.pw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "usosweb.usos.pw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		*{
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
			background-image: url(https://cdn.discordapp.com/attachments/697158463247220806/759560648890777620/Fine_info_icon.png) !important;
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
			background-image: url(https://cdn.discordapp.com/attachments/697158463247220806/759561370395082782/Fine_correct_icon_small.png) !important;
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
		   background-image: url(https://cdn.discordapp.com/attachments/697158463247220806/759560600270929940/Fine_exclamation_mark_icon.png) !important;
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
			content: url(https://cdn.discordapp.com/attachments/697158463247220806/759560648890777620/Fine_info_icon.png);
			width: 16px;
			height: 16px;
		}
		
		img[src="https://usosweb.usos.pw.edu.pl//img/tip_redinfo.gif"] {
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
		
		img[src="https://usosweb.usos.pw.edu.pl//img/greencheck.gif"],
		img[src="https://usosweb.usos.pw.edu.pl/img/tip_rej2_zarejestrowany.gif"], img[src*="img/tip_positive.gif"] {
			content: url(https://cdn.discordapp.com/attachments/697158463247220806/759561370395082782/Fine_correct_icon_small.png);
			width: 19px;
			height: 19px;
		}
		
		img[src*="https://usosweb.usos.pw.edu.pl//img/tip_greyinfo.gif"], img[src*="https://usosweb.usos.pw.edu.pl//img/tip_small_greyinfo.gif"], img[src*="https://usosweb.usos.pw.edu.pl//img/greyinfolink.gif"] {
			content: url(https://cdn.discordapp.com/attachments/594793235365232662/810662242944155678/transparent_square_PNG.png);
			background-image: url(https://cdn.discordapp.com/attachments/697158463247220806/759560648890777620/Fine_info_icon.png);
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
		  content: url(https://cdn.discordapp.com/attachments/594793235365232662/890949514352001024/redsquare.png);
		}
		
		img[src="https://usosweb.usos.pw.edu.pl//img/rejB_limitWyborow.gif"] {
		  content: url(https://cdn.discordapp.com/attachments/594793235365232662/890949515564183552/yellowsquare.png);
		}
		
		img[src="https://usosweb.usos.pw.edu.pl//img/koszyk_outB.gif"] {
		  content: url(https://cdn.discordapp.com/attachments/594793235365232662/890949519066411038/bluesquare.png);
		}
		
		img[src="https://usosweb.usos.pw.edu.pl//img/koszyk_inB.gif"] {
		  content: url(https://cdn.discordapp.com/attachments/594793235365232662/890949517472575498/greensquare.png);
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
		body usos-frame>div.flex+div {
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
	`);

	(frycAPI.beforeLoad = function () {
		document.documentElement.appendChild(document.createElement("style")).innerHTML = /*css*/`
			@property --var1 {
				syntax: "<color>";
				inherits: true;
				initial-value: #ffff; /* 0000 */
			}
			body {
				display: none;
				transition: --var1 .35s 0.1s ease-in-out;
			}
			body::-webkit-scrollbar-thumb {
				background: var(--var1);
			}
		`;
	})();

	{
		let ms = 350;
		let sec = ms / 1000;
		let del = 100;
		let sdel = del / 1000;

		window.addEventListener("DOMContentLoaded", function () { // end
			// document.body.style.display = "block";
			// document.body.style.opacity = 1;
			// document.body.style.visibility = "visible";

			let dyv = document.createElement("div");
			dyv.style.backgroundColor = "#d9d9d9"; // #262626
			dyv.style.position = "fixed";
			dyv.style.width = "100vw";
			dyv.style.height = "100vh";
			dyv.style.top = "0px";
			dyv.style.zIndex = "1000";
			dyv.style.transition = `opacity ${sec}s ${sdel}s ease-in-out`;
			dyv.classList.add("dyv");
			document.body.appendChild(dyv);

			document.body.style.display = "block";
			// document.body.style.height = "auto";
			document.body.appendChild(document.createElement("style")).innerHTML = /*css*/`
				body {
					/* background-color: rgb(131 0 0) !important; */
					opacity: 1;
				}
			`;
		});

		frycAPI.onLoadSetter(() => {
			{ // idle
				// document.body.style.display = "block";
				// setTimeout(function () { 
				// 	document.body.classList.add("opaque");
				// }, 10);
				// document.body.style.opacity = 1;
				// document.body.style.visibility = "visible";

				let ele = document.querySelector(".dyv");
				ele.style.opacity = 0;
				setTimeout(function () {
					document.body.classList.add("var1");
				}, 0);
				setTimeout(function () {
					ele.style.height = "0";
				}, ms + del + 10);

				window.onbeforeunload = function (event) {
					// dyv.style.transition = `opacity ${sec}s 0s ease-in-out`;
					ele.style.height = "100vh";
					ele.style.opacity = 1;
					document.body.classList.remove("var1");
					setTimeout(function () { }, ms + del + 10);
				}
			}

			if (window.location.search.includes("statystyki")) {
				new MutationObserver(async function USOS_Fix(mutRec, docObs) {
					let id1 = document.querySelector("div#chart iframe").getAttribute("id");
					while (!frames[id1]) {
						await frycAPI.sleep(50);
					}
					await frycAPI.sleep(50);
					let head1 = frames[id1].document.querySelector("head");
					let css1 = document.createElement("style");
					css1.innerHTML = 'svg text { fill: hsl(0deg 0% 58%); }';
					head1.append(css1);
					console.log("Zaobserwowałem!")
					docObs.disconnect();
				}).observe(document.getElementById("chart"), { attributes: true, childList: true, subtree: true });
			}

			{ // Injected
				let shadowStyle = document.createElement('style').frycAPI_setInnerHTML(frycAPI.minifyCSS(/*css*/`
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

				frycAPI.forEach("td > div > form > label:first-of-type + br", function (daElem, daI, daArr) { daElem.remove(); });
				["info-box", "success-box", "notice-box"].forEach(daEl => {
					document.querySelectorAll(daEl, function (daElem, daI, daArr) {
						daElem.shadowRoot.querySelector("div").classList.add(daEl, "moj-box");
					});
				});

				// let plan = false;
				if (document.title.startsWith("Plan zajęć - ")) {
					document.documentElement.classList.add("frycPlan");
					// plan = true;
				}
				function reqursShadow(elem0) {
					elem0.querySelectorAll('*').forEach(elem => {
						if (!!elem.shadowRoot) {
							// if (plan) {
							// 	elem.shadowRoot.firstElementChild.classList.add("frycPlan");
							// }
							elem.shadowRoot.appendChild(shadowStyle.cloneNode(1));
							reqursShadow(elem.shadowRoot);
						}
					});
				}; reqursShadow(document);
				// new MutationObserver((mutRec, docObs) => {
				// 	loguj(mutRec);
				// 	mutRec.forEach(elem => {
				// 		elem.addedNodes.forEach(elem1 => {
				// 			if (!!elem1.shadowRoot) {
				// 				elem1.shadowRoot.appendChild(shadowStyle.cloneNode(1));
				// 			} else if (!!elem1.host) {
				// 				elem1.appendChild(shadowStyle.cloneNode(1));
				// 			}
				// 		});
				// 	});
				// }).observe(document.body, { childList: true, subtree: true });

				{ /* Naprawy kalendarza rejestracji */
					if (!document.title.includes("USOSweb tymczasowo niedostępny") &&
						document.querySelector("[aria-label='Panel boczny'] a[href='https://usosweb.usos.pw.edu.pl/kontroler.php?_action=dla_stud/rejestracja/kalendarz'].selected") !== null) {
						frycAPI.forEach(".usos-ui h2", function (daElem, daI, daArr) {
							// debugger
							let myDiv = document.createElement("div");
							myDiv.classList.add("myDiv");
							let h2next = daElem.nextElementSibling;
							while (h2next !== null && h2next.tagName != "H2") {
								let h2next1 = h2next.nextElementSibling;
								myDiv.appendChild(h2next);
								h2next = h2next1;
							}
							daElem.insertAdjacentElement("afterend", myDiv);
							daElem.setAttribute("onclick", "this.classList.toggle('collapse')")
							if (daElem.nextElementSibling.querySelector(".rejestracja-ikona .rejestracja-ikona") === null) {
								/* Powyższy warunek może się zepsuć w przyszłości */
								daElem.classList.add("collapse");
							}
							daElem.classList.add("USOS-OK");
						});
					}
				}
				{ /* Naprawy tabel rejestracji */
					frycAPI.forEach("td:has(img.rejestracja-ikona[src='https://usosweb.usos.pw.edu.pl//img/spinacz_tip.png']) > br",
						function (daElem, daI, daArr) { daElem.remove(); });
				}
			}
			loguj("USOS Done!")
		});
	}
};
if (1 && frycAPI.host == "viewer.shapez.io") {
	frycAPI.injectStyle(/*css*/`
		canvas#result {
			filter: hue-rotate(180deg) invert(1) saturate(6.5) ;
		}
	`);
}
if (1 && frycAPI.host == "wazniak.mimuw.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "web.whatsapp.com") {
	frycAPI.injectStyle(/*css*/`
		/*
		.message-in span._1kh65 svg {
			filter: hue-rotate(-3deg) brightness(0.18) saturate(4.4);
		}
		.message-out span._1kh65 svg {
			filter: invert(1) hue-rotate(191deg) saturate(2) brightness(0.88);
		}
		*/
		[data-icon="tail-in"] svg {
			filter: brightness(0) invert(13%) sepia(4%) saturate(3640%) hue-rotate(158deg) brightness(100%) contrast(91%);
		}
		[data-icon="tail-out"] svg {
			filter: brightness(0) invert(22%) sepia(97%) saturate(617%) hue-rotate(127deg) brightness(99%) contrast(101%);
		}
		
		html[dir] [data-icon*="tail-"]+div {
			box-shadow: none;
		}
		canvas[aria-label="Scan me!"] {
		  filter: invert(1);
		}
	`);
}
if (1 && frycAPI.host == "worldedit.enginehub.org") {
	frycAPI.injectStyle(/*css*/`
		body {
			filter: brightness(1);
		}
	`);
}
if (1 && frycAPI.host == "wutwaw-my.sharepoint.com") {
	frycAPI.injectStyle(/*css*/`
		svg image {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "wutwaw.sharepoint.com") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(1);
		}
	`);
}
if (1 && frycAPI.host == "www.1001fonts.com") {
	frycAPI.injectStyle(/*css*/`
		.txt-preview {
		  filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
}
if (0 && frycAPI.host == "www.4g-lte.net") {
	frycAPI.injectStyle(/*css*/`
		* {
		  font-family: IBM Plex Sans Condensed !important;
		}
	`);
}
if (1 && frycAPI.host == "www.autohotkey.com") {
	frycAPI.injectStyle(/*css*/`
		.page-width {
			max-width: calc(100% - 24px);
			width: 1125px;
			margin: auto;
		}
	`);
}
if (1 && frycAPI.host == "www.calculator.net") {
	frycAPI.injectStyle(/*css*/`
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
}
if (0 && frycAPI.host == "www.chessvariants.com") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(0) hue-rotate(0deg) !important;
		}
	`);
}
if (1 && frycAPI.host == "www.deltami.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img.math-display, figure, img.math-inline {
			filter: invert(1) hue-rotate(180deg);
		}
		img.highslide-image {
		  filter: invert(1) hue-rotate(180deg);
		  background-color: rgb(255 255 255 / 0%) !important;
		}
	`);
}
if (1 && frycAPI.host == "www.derivative-calculator.net") {
	frycAPI.injectStyle(/*css*/`
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
}
if (0 && frycAPI.host == "www.desmos.com") {
	frycAPI.injectStyle(/*css*/`
		::-webkit-scrollbar-thumb {
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
		}
	`);
}
if (1 && frycAPI.host == "www.enpassant.dk") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(0) hue-rotate(0deg) !important;
		}
	`);
}
if (1 && frycAPI.host == "www.facebook.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (0 && frycAPI.host == "www.g") {
	frycAPI.injectStyle(/*css*/`
		body::-webkit-scrollbar {  width: 15px;  background: grey;}body::-webkit-scrollbar-thumb {width: 13px;  background: black;border: 1px solid white;}
	`);
}
if (1 && frycAPI.host == "www.geeksforgeeks.org") {
	frycAPI.injectStyle(/*css*/`
		iframe[id*="google_ads_iframe"] {
		  display: none;
		}
		aside[id*="text-"] {
			display: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.geneseo.edu") {
	frycAPI.injectStyle(/*css*/`
		mjx-container[jax="CHTML"][display="true"] {
			overflow: hidden;
		}
	`);
}
if (1 && frycAPI.host == "www.geogebra.org") {
	frycAPI.injectStyle(/*css*/`
		.checkBoxPanel>* {
		  margin-right: 5px !important;
		}
		.checkBoxPanel {
		  display: block;
		}
	`);
}
if (1 && frycAPI.hostList(["www.google.pl", "www.google.com"])) {
	frycAPI.injectStyle(/*css*/`
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
		.minidiv [jsname="RNNXgb"] {
			margin-top: 13px !important;
		}
		/* .s6JM6d, .g, .KIy09e, div[jscontroller="SC7lYd"] {
		  width: var(--szer) !important;
		} */
	`);

	frycAPI.onLoadSetter(() => {
		if (document.querySelector('#APjFqb') && document.getElementById("searchform")) {
			let hide01 = document.createElement("span");
			hide01.setAttribute("class", "hide01");
			document.body.appendChild(hide01);
			let input01 = document.querySelector('#APjFqb');
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
	});
}
if (1 && frycAPI.host == "www.headspin.io") {
	frycAPI.injectStyle(/*css*/`
		.exit-popup.telco-outer-wp {
			display: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.ipko.pl") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "www.itl.nist.gov") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
}
if (1 && frycAPI.host == "www.kalasoft.pl") {
	frycAPI.injectStyle(/*css*/`
		.cli-barmodal-open {
			overflow: scroll;
		}
	`);
}
if (1 && frycAPI.host == "www.komputronik.pl") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "www.kowalskimateusz.pl") {
	frycAPI.injectStyle(/*css*/`
		*{
		  font-family: IBM Plex Sans Condensed
		}
		img {
		    mix-blend-mode: difference;
		}
		/*a[href*="kowalskimateusz"][href*="uploads"]::before {
		    content: "";
		    display: block;
		    position: relative;
		    background: green !important;
		    width: 640px !important;
		    height: 480px !important;
		    left: 40px; 
		}*/
	`);
}
if (0 && frycAPI.host == "www.lipsum.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (0 && frycAPI.host == "www.math.us.edu.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.mathworks.com") {
	let funkcje = "Disable highlight on Matlab search";
	frycAPI.injectStyle(/*css*/`
		code.literal {
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
	`);

	frycAPI.onLoadSetter(() => {
		function sleep(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		async function dishi() {
			await sleep(300);
			let titles = document.querySelectorAll("p.search_result_title");
			for (let i = 0; i < titles.length; i++) {
				let atit = titles[i].querySelector("a");
				atit.href = atit.href.replace(/\?(.*)/, "");
			}
		}
		dishi();
	});
}
if (1 && frycAPI.host == "www.maxongroup.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "www.medianauka.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.megamatma.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  -webkit-filter: none !important;
		    filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.messenger.com") {
	frycAPI.injectStyle(/*css*/`
		/*hsl(200deg 100% 20%)
		rgba(0, 161, 246, 0.7)*/
		*:not([class*="hljs"]):not(code) {
		    font-family: IBM Plex Sans Condensed !important;
		}
		._7kpk {
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
		span._3oh-._58nk {
		      /*text-shadow: 0 0 3px black;*/
		}
		._1t_q ._1t_r, ._1t_q ._4ldz, ._1t_q ._4ld-, ._1t_q ._4ld- img {
		    max-height: 33px;
		    max-width: 31px;
		}
		._41ud {
		    margin-left: 39px;
		}
		
		.gvxzyvdx.om3e55n1.b0ur3jhr >.q46jt4gp.aesu6q9g.r5g9zsuq.e4ay1f3w.om3e55n1.lq84ybu9.hf30pyar.rt34pxt2.jao8r537.pdqhzjwd.l4uc2m3f.t7p7dqev.qsbzbi57.subw1o1z.b0ur3jhr.gffp4m6x {
			border: 1px solid #b1b1b1;
		}
		
		.i85zmo3j.homhzfsx.alzwoclg.jl2a5g8c {
			background: black;
			padding-right: 5px;
			border-radius: 5px;
		}
		
		.gvxzyvdx.om3e55n1.b0ur3jhr>.q46jt4gp.aesu6q9g.r5g9zsuq.e4ay1f3w.om3e55n1.lq84ybu9.hf30pyar.rt34pxt2.jao8r537.dtqh1a21.l4uc2m3f.t7p7dqev.qsbzbi57.subw1o1z.b0ur3jhr.j8nb7h05 {
			border: 1px solid #b1b1b1;
		}
	`);
}
if (1 && frycAPI.host == "www.meteo.pl") {
	let funkcje = "Zmień tytuł strony meteogramu";
	frycAPI.injectStyle(/*css*/`
		/* body>div>div>img {
		  filter: invert(1) hue-rotate(
		180deg);
		} */
		body {
			background-color: #181818 !important;
			font-family: IBM Plex Sans Condensed;
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

		fontElem = document.querySelector("#model_napis font");
		if (fontElem !== null) {
			document.title = fontElem
				.innerText
				.match(/^([^,])+/g)[0]
				.trim() + " - meteo.pl";
		} else {
			document.title = document
				.querySelector("#napis_xy_ne")
				.innerText
				.replaceAll(/[\s\u00A0]+/gm, " ")
				.trim() + " - meteo.pl";
		}
		let butt = document.createElement("button");
		butt.classList.add("myButt");
		butt.innerText = "Odśwież stronę";
		butt.setAttribute("onclick", "location.reload();");
		document.querySelector('[href="javascript:print_this()"]').insertAdjacentElement("afterend", butt);
	});
}
if (0 && frycAPI.host == "www.minecraftskins.com") {
	frycAPI.injectStyle(/*css*/`
		body {
		  background-color: #9c9c9c
		}
	`);
}
if (0 && frycAPI.host == "www.mrexcel.com") {
	frycAPI.injectStyle(/*css*/`
		[id*="google_ads_iframe"] {
		  display:none
		}
	`);
}
if (1 && frycAPI.host == "www.obliczeniowo.com.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.pcgamer.com") {
	frycAPI.injectStyle(/*css*/`
		div.bordeaux-slot.bordeaux-filled-slot {
			display: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.pyszne.pl") {
	frycAPI.injectStyle(/*css*/`
		/*
		img {
		  filter: invert(1) hue-rotate(180deg) !important;
		}
		tspan.css-1kt4f9t {
			filter: invert(1);
		}
		*/
		._3ZXPf._1lbE7._1nR7l._2AnxL {
			background-image: url(https://cdn.discordapp.com/attachments/594793235365232662/1104383712533168128/White64x64.png);
		}
	`);
}
if (1 && frycAPI.host == "www.quora.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "www.real-statistics.com") {
	frycAPI.injectStyle(/*css*/`
		img {
		  filter: invert(0) hue-rotate(180deg) !important;
		}
	`);
}
if (1 && frycAPI.host == "www.reddit.com") {
	frycAPI.injectStyle(/*css*/`
		._2ETuFsVzMBxiHia6HfJCTQ {
		    color: #ff4500;
		}
		.f3THgbzMYccGW8vbqZBUH {
		    color: #007ACB;
		}
		._1sbZnfdaxhCOFVUCJ3Z75m {
		  box-shadow: 0 1px 12px rgba(0,0,0,1);
		}
		.f3THgbzMYccGW8vbqZBUH {
		    color: #007ACB;
		}
		/*
		@media (min-width: 960px)
		._1OVBBWLtHoSPfGCRaPzpTf._2udhMC-jldHp_EpAuBeSR1 {
		    max-width: 896px;
		}
		@media (min-width: 960px)
		._1OVBBWLtHoSPfGCRaPzpTf._3nSp9cdBpqL13CqjdMr2L_ {
		    width: 896px;
		}
		@media (min-width: 960px)
		.u35lf2ynn4jHsVUwPmNU.Dx3UxiK86VcfkFQVHNXNi {
		    max-width: 896px;
		}
		*/
		.P8SGAKMtRxNwlmLz1zdJu._1z5rdmX8TDr6mqwNv7A70U {
		    margin-top: 0px;
		}
		.P8SGAKMtRxNwlmLz1zdJu {
		    padding-top: 0;
		}
		._1LXnp2ufrzN6ioaTLTjGQ1 {
		    margin: 0;
		}
		/*
		._3tw__eCCe7j-epNCKGXUKk {
		    border-radius: 0px;
		    border: 1px solid #818384;
		    margin-top: -1px;
		    padding-left: 8px;
		    margin-left: 4px;
		}
		*/
		._2Gt13AX94UlLxkluAMsZqP {
		    background-size: cover;
		}
		._36AIN2ppxy_z-XSDxTvYj5>.threadline {
		    margin-top: -7px;
		}
		.kB7GZ7EzNg1Msq-nEnY0z {
		    margin: -1px -5px -2px 10px;
		    border: 1px solid #818384;
		    min-width: 20px;
		    padding-bottom: 2px;
		    width: 20px !important;
		    border-bottom-left-radius: 4px;
		}
		[style*="padding-left:"][style*="16px"] div .kB7GZ7EzNg1Msq-nEnY0z {
		    margin-right: -9px;
		}
		._3KgrO85L1p9wQbgwG27q4y {
		    margin: -3px 0px 3px -3px;
		}
		._1nGapmdexvR0BuOkfAi6wa {
		    top: 4px;
		}
		._3tw__eCCe7j-epNCKGXUKk.BjX6VVsz_8JJDN1Ap9_IL {
		    margin-left: 10px !important;
		    padding-top: 0px;
		}
		.P8SGAKMtRxNwlmLz1zdJu ._1S45SPAIb30fsXtEcKPSdt._3c9Go6433BnvYx8_7MkPnt {
		    margin-left: 21.5px;
		}
		._3jOxDPIQ0KaOWpzvSQo-1s {
		    margin-left: 2px;
		}
		._23wugcdiaj44hdfugIAlnX {
		    color: #007ACB !important;
		}
		._1r4smTyOEZFO91uFIdWW6T.aUM8DQ_Nz5wL0EJc_wte6 {
		    margin: 0px 40px 0px 48px;
		}
		._2ulKn_zs7Y3LWsOqoFLHPo {
		    margin: 3px 40px 0 48px;
		}
		._1MfL8RlT7Bsr76qYvR-nqM {
		    color: rgb(215, 218, 220);
		}
		#CommentSort--SortPicker._3LwUIE7yX7CZQKmD2L87vf {
		    color: rgb(215, 218, 220);
		}
		/*div div [style*="padding-left:"][style*="16px"]._3sf33-9rVAO_v4y0pIW_CH div ._1E9mcoVn4MYnuBQSVDt1gC{
		  border-top-left-radius: 4px;
		  background-color:green;
		}
		._1YCqQVO-9r-Up6QPB9H6_4 div:first-child div [style*="padding-left:"][style*="16px"]._3sf33-9rVAO_v4y0pIW_CH {
		  border-top-right-radius: 4px;
		}*/
		/*._1YCqQVO-9r-Up6QPB9H6_4 div:last-child div [style*="padding-left:"]._3sf33-9rVAO_v4y0pIW_CH div ._3tw__eCCe7j-epNCKGXUKk {
		  border-bottom-right-radius: 4px;
		  border-bottom-left-radius: 4px;
		}*/
		
		._1YCqQVO-9r-Up6QPB9H6_4 > div:first-child div div div .P8SGAKMtRxNwlmLz1zdJu ._3tw__eCCe7j-epNCKGXUKk {
		  border-top-left-radius: 4px;
		  border-top-right-radius: 4px;
		}
		._1YCqQVO-9r-Up6QPB9H6_4 > div:last-child div div div .P8SGAKMtRxNwlmLz1zdJu ._3tw__eCCe7j-epNCKGXUKk {
		  border-bottom-left-radius: 4px;
		  border-bottom-right-radius: 4px;
		}
		.avKlJzxZU3brq4nAX0_i1 {
		  display: none;
		}
		
		div.rpBJOHq2PR60pnwJlUyP0>div>div>div>div._1oQyIsiPHYt6nx7VOmd1sz {
			background-color: red;
		  	display: none;
		}
		/*
		._1G4yU68P50vRZ4USXfaceV+._2vEf-C2keJaBMY9qk_BxVn {
		  display: none;
		}
		*/
		/*
		._2mHuuvyV9doV3zwbZPtIPG ._3GfQMgsm3HGd3838lwqCST {
		  
		}
		.P8SGAKMtRxNwlmLz1zdJu._1z5rdmX8TDr6mqwNv7A70U ._3tw__eCCe7j-epNCKGXUKk {
		    margin-left: 0px;
		}*/
		
		/*
		._1DooEIX-1Nj5rweIc5cw_E>div:nth-child(1) .threadline {
		  border-right: 2px solid red;
		}
		._1DooEIX-1Nj5rweIc5cw_E>div:nth-child(2) .threadline {
		  border-right: 2px solid green;
		}
		._1DooEIX-1Nj5rweIc5cw_E>div:nth-child(3) .threadline {
		  border-right: 2px solid blue;
		}
		._1DooEIX-1Nj5rweIc5cw_E>div:nth-child(4) .threadline {
		  border-right: 2px solid yellow;
		}
		._1DooEIX-1Nj5rweIc5cw_E>div:nth-child(5) .threadline {
		  border-right: 2px solid orange;
		}
		*/
		/*._1DooEIX-1Nj5rweIc5cw_E > ._3Wv3am0TXfTcugZJ6niui:only-child ._36AIN2ppxy_z-XSDxTvYj5 .threadline{
		  border-right: 2px solid red;
		}*/
		/*
		div div [style*="padding-left:37px"]._3sf33-9rVAO_v4y0pIW_CH div ._1E9mcoVn4MYnuBQSVDt1gC{
		  background-color: green;
		}
		div div [style*="padding-left:58px"]._3sf33-9rVAO_v4y0pIW_CH div ._1E9mcoVn4MYnuBQSVDt1gC{
		  background-color: green;
		}*/
		/*._36AIN2ppxy_z-XSDxTvYj5:last-child>.threadline {
		  margin-bottom: 1px;
		}*/
		/*
		[title=":1:"]._1QwShihKKlyRXyQSlqYaWW {
		  margin-bottom: 0.2px;
		  height: 24.5px !important;
		  width: 24.5px !important;
		  border-radius: 2px 0 0 2px;
		}
		[title=":2:"]._1QwShihKKlyRXyQSlqYaWW {
		  margin-bottom: 0.5px;
		}
		[title=":3:"]._1QwShihKKlyRXyQSlqYaWW {
		  margin-bottom: 0.5px;
		}
		[title=":4:"]._1QwShihKKlyRXyQSlqYaWW {
		  margin-left: -0.5px;
		  margin-bottom: 0.5px;
		}
		[title=":5:"]._1QwShihKKlyRXyQSlqYaWW {
		  margin-left: -0.5px;
		  height: 24.5px !important;
		  width: 24.5px !important;
		  border-radius: 0px 2px 2px 0px;
		}
		*/
		
		/*
		.voteButton {
		    width: 21px;
		}
		._1rZYMD_4xY3gRcSS3p8ODO {
		    margin-left: 3px;
		}
		/*
		._2FCtq-QzlfuN-SwVMUZMM3 ._2VqfzH0dZ9dIl3XWNxs42y ._1QwShihKKlyRXyQSlqYaWW {
		    margin-top: -4px !important;
		    margin-bottom: 2px;
		}
		._2VqfzH0dZ9dIl3XWNxs42y > div+span {
		    position: relative;
		    top: -2px;
		}
		._2xu1HuBz1Yx6SP10AGVx_I {
		    margin-top: 3px;
		}
		._2VqfzH0dZ9dIl3XWNxs42y._2hSecp_zkPm_s5ddV2htoj {
		  padding-top: 6px;
		  margin-top: -2px !important;
		}
		
		.BiNC74axuTz66dlnEgicY {
		    margin: 0 8px 2px;
		}
		.STit0dLageRsa2yR4te_b {
		    margin-top: 10px;
		}
		*/
		
		/*
		._2VqfzH0dZ9dIl3XWNxs42y {
		  margin: 0 6px 0 0;
		  padding-top: 0px;
		  padding-bottom: 0px;
		}
		._2VqfzH0dZ9dIl3XWNxs42y>span {
		  vertical-align: super;
		  position: relative;
		  top: -1px;
		}
		._2X6EB3ZhEeXCh1eIVA64XM>span {
		  vertical-align: super;
		  position: relative;
		  top: 0.5px;
		}
		.y8HYJ-y_lTUHkQIc1mdCq {
		    top: 3px;
		}
		*/
		/*
		div:first-child ._1ump7uMrSA43cqok14tPrG div div #t1_ghn9j4w .P8SGAKMtRxNwlmLz1zdJu .w__eCCe7j-epNCKGXUKk {
		    border-top: 1px solid black;
		}
		
		#t1_ghn9j4w .Comment ._3tw__eCCe7j-epNCKGXUKk {
		    border-top: 1px solid #818384;
		}*/
		/*
		._2hSecp_zkPm_s5ddV2htoj {
		  margin-top: 0px !important;
		  margin-right: 3px;
		  bottom: 0px;
		}
		._1QwShihKKlyRXyQSlqYaWW {
		    height: 24px !important;
		    width: 24px !important;
		}
		[title=":1:"]._1QwShihKKlyRXyQSlqYaWW {
		  border-radius: 2px 0 0 2px;
		}
		[title=":5:"]._1QwShihKKlyRXyQSlqYaWW {
		  border-radius: 0px 2px 2px 0px;
		}
		[style*="margin-top: -16px;"]._2X6EB3ZhEeXCh1eIVA64XM {
		  padding: 1px;
		}
		._1YCqQVO-9r-Up6QPB9H6_4>div:has(._1DooEIX-1Nj5rweIc5cw_E>._3Wv3am0TXfTcugZJ6niui:nth-child(3)):has(._1DooEIX-1Nj5rweIc5cw_E>._3Wv3am0TXfTcugZJ6niui:nth-child(1)) .Comment {
		  
		}
		*/
	`);
}
if (1 && frycAPI.host == "www.roblox.com") {
	frycAPI.injectStyle(/*css*/`
		.voting-panel .users-vote .vote-details .vote-container .vote-percentage {
			background-color: #02b757 !important;
		}
		.voting-panel .users-vote .vote-details .vote-container .vote-background.has-votes {
			background-color: #E27676 !important;
		}
	`);
}
if (1 && frycAPI.host == "www.satisfactorytools.com") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "www.slownikslaski.pl") {
	frycAPI.injectStyle(/*css*/`
		* {
		  font-family: IBM Plex Sans Condensed !important;
		}
	`);
}
if (1 && frycAPI.host == "www.tenforums.com") {
	frycAPI.injectStyle(/*css*/`
		body {
			background-color: #2a2a2a;
		}
	`);
}
if (1 && frycAPI.host == "www.tme.eu") {
	frycAPI.injectStyle(/*css*/`
		.czerwony {
		  color: red;
		}
		
		div#select_list_42 {
			height: 500px;
		}
	`);
}
if (1 && frycAPI.host == "www.tutorialspoint.com") {
	frycAPI.injectStyle(/*css*/`
		._adr_abp_container {
			display: none !important;
		}
		
		div#google-right-ads {
			display: none !important;
		}
	`);
}
if (1 && frycAPI.host == "www.ups.com") {
	frycAPI.injectStyle(/*css*/`
		div#ups-alerts {
			color: black;
		}
	`);
}
if (1 && frycAPI.host == "www.w3schools.com") {
	frycAPI.injectStyle(/*css*/`
		#colormixer table tbody tr:nth-child(11) {
		  color: red
		}
	`);

	frycAPI.onLoadSetter(() => {
		let lead = document.getElementById("mainLeaderboard");
		if (lead !== null && lead.nextElementSibling.nodeName == "H1" && lead.nextElementSibling.innerHTML == "How TO - Sort a Table") {
			// loguj("Hello");
			frycAPI.makeTableSortable(document.getElementById("myTable"));
		}
	});
}
if (1 && frycAPI.host == "www.when2meet.com") {
	let funkcje = "Konwertuj 12h na 24h";
	frycAPI.injectStyle(/*css*/`
		[style="text-align:right;width:44px;height:9;font-size:10px;margin:4px 4px 0px 0px;"] {
			text-align: left !important;
			width: fit-content !important;
			margin: 4px 0px 4px 13px !important;
		}
	`);

	frycAPI.onLoadSetter(() => {
		let godziny = document.querySelectorAll('[style="text-align:right;width:44px;height:9;font-size:10px;margin:4px 4px 0px 0px;"]');
		for (let i = 0; i < godziny.length; i++) {
			let godz = new Date("11 30 2022 " + godziny[i]
				.innerText
				.replace(/\s+/g, ' ')
				.trim());
			godziny[i].innerText = godz.toLocaleTimeString().slice(0, -3);
		}
	});
}
if (1 && frycAPI.host == "www.worldometers.info") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "www.youtube.com") {
	frycAPI.injectStyle(/*css*/`
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
		*:not([class*="hljs"]):not(code) {
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
	`);

	(frycAPI.beforeLoad = function () {
		// Delete comments
		document.addEventListener("DOMContentLoaded", function (event) {
			frycAPI.clean(document.body);
		});
	})();

	frycAPI.onLoadSetter(() => {
		// YT Playlist Element Delete Button
		if (window.location.pathname.startsWith("/playlist")) {
			let esval = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="mySVG"><path d="M11,17H9V8h2V17z M15,8h-2v9h2V8z M19,4v1h-1v16H6V5H5V4h4V3h6v1H19z M17,5H7v15h10V5z" class="style-scope yt-icon"></path></svg>';
			frycAPI.forEach("ytd-menu-renderer.style-scope.ytd-playlist-video-renderer", function (daElem) {
				let trDiv = document.createElement('div');
				trDiv.innerHTML = esval;
				trDiv.classList.add("myDIV");
				// trDiv.onclick = ytRemove;
				daElem.insertAdjacentElement('afterbegin', trDiv).addEventListener("click", async function ytRemove() {
					this.parentNode.querySelector("yt-icon-button#button>button#button").click();
					await frycAPI.sleep(20);
					document.querySelectorAll("ytd-menu-service-item-renderer.style-scope.ytd-menu-popup-renderer")[2].click();
				});
			});
			loguj("YT Playlist Done!");
		}

		if (0 && window.location.pathname.startsWith("/watch")) {
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
					let butt = document.querySelector("ytd-popup-container .yt-spec-button-view-model");
					if (butt) {
						loguj(document.querySelector("ytd-popup-container").cloneNode(1));
					}
					await frycAPI.sleep(500);
					t1 = performance.now();
					if (t1 - t0 > 10000) {
						break
					}
				}
			})();
			loguj("YT Watch Done!");
		}

		(async () => {
			await frycAPI.sleep(3000);
			frycAPI.clean(document.body);
		})();
	});
}
if (1 && frycAPI.host == "wyniki.diag.pl") {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "wyznacznik.pl") {
	frycAPI.injectStyle(/*css*/`
		img {
			filter: invert(1);
		}
	`);
}
if (frycAPI.host == "developer.chrome.com") {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyle(/*css*/`
	`);

	(frycAPI.beforeLoad = function () {
	})();

	frycAPI.onLoadSetter(() => {
	});

	frycAPI.manualFunctionsCreator(frycAPI.nazwaBlokuIf, [
		// {name: "aaa", callBack: () => {
		// }},
	]);
}
if (frycAPI.host == "www.rp.pl") {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyle(/*css*/`
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
}
if (frycAPI.host == "polandsvoice.pl") {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyle(/*css*/`
		.App-Content>div>svg>text:first-of-type {
			font-family: IBM Plex Mono;
		}
	`);
}
if (frycAPI.host == "www.mchtr.pw.edu.pl") {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyle(/*css*/`
		*:not(.naglowek-middle.logo *,[title="Szukaj"] *) {
			font-family: IBM Plex Sans Condensed;
		}
	`);
}
if (frycAPI.host == "www.java.com") {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyle(/*css*/`
	`);

	(frycAPI.beforeLoad = function () {
		frycAPI.colorSchemeDark = 1;
	})();
}
if (frycAPI.host == "www.overleaf.com") {
	frycAPI.nazwaBlokuIf = "";
	frycAPI.injectStyle(/*css*/`
		/*
		.pdf {
			background-color: #272727;
		}
		.pdf-viewer {
			filter: invert(1) hue-rotate(180deg);
		}
		*/
	`);
}
if (frycAPI.hostList(["www.nongnu.org", "www.tug.org", "sunsite.icm.edu.pl", "latexref.xyz"])) {
	frycAPI.injectStyle(/*css*/`
		body {
			margin: auto;
			font-family: IBM Plex Sans Condensed;
		}
	`);
}
if (frycAPI.hostList(["www.ctan.org", "ctan.org"])) {
	frycAPI.injectStyle(/*css*/`
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
}
if (1 && frycAPI.host == "help.eclipse.org") {
	frycAPI.onLoadSetter(() => {
		let frameDoc = window.frames["HelpFrame"].frames["ContentFrame"].frames["ContentViewFrame"].document;
		// window.frames["ContentViewFrame"].document
		// document.querySelector("frame[name='ContentViewFrame']").contentDocument
		if ((frameDoc !== null) && ((myh1 = frameDoc.querySelector("div.header>h1.title")) !== null) && (myh1.innerHTML == "Class DefaultCodeFormatterConstants")) {
			frycAPI.injectStyleNormal(/*css*/`
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
			`, frameDoc.body);
			let myTable = frameDoc.querySelector("#field-summary>.summary-table");
			let sortFun = function () {
				// const t0 = performance.now();

				let docFrag = document.createDocumentFragment();
				Array.prototype.slice.call(myTable.querySelectorAll(`.${this.classList[1]}:not(.table-header)`), 0).sort(function mySort(a, b) {
					let a1 = a.innerText;
					let b1 = b.innerText;
					return (a1 < b1) ? -1 : (a1 > b1) ? 1 : 0;
				}).forEach(function forEachAfterSort(daElem, daI, daArr) {
					daElem["row"].forEach(function forEachElemInRow(daElem1, daI1, daArr1) {
						docFrag.appendChild(daElem1);
					});
				});
				myTable.appendChild(docFrag);
				myTable.querySelector(".posortowana")?.classList.remove("posortowana");
				this.classList.add("posortowana");

				// const t1 = performance.now();
				// loguj(`Czas: ${frycAPI.zaokrl(t1 - t0,2)} ms`);
			};
			/*
			let newTable = myTable.appendChild(document.createElement("table").frycAPI_addClass("myTable"));
			let myDiv = document.createElement("tr");
			myTable.querySelectorAll(":scope>div").forEach(function (daElem, daI, daArr) {
				myDiv.appendChild(document.createElement(daI >= 3 ? "td" : "th")).appendChild(daElem);
				if (myDiv.childElementCount == 3) {
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
					daElem["row"] = [daElem, daElem.nextElementSibling, daElem.nextElementSibling.nextElementSibling];
				} else if (daElem.classList.contains("col-second")) {
					daElem["row"] = [daElem.previousElementSibling, daElem, daElem.nextElementSibling];
				} else if (daElem.classList.contains("col-last")) {
					daElem["row"] = [daElem.previousElementSibling.previousElementSibling, daElem.previousElementSibling, daElem];
				}
			});
		}
	});
}
if (frycAPI.host == "docs.oracle.com") {
	frycAPI.injectStyle(/*css*/`
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
		var mainFlow = document.getElementById("MainFlow");
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

		if (window.location.pathname.frycAPI_includesAny(["%2Fdocs%2F", "/docs/"])) {
			document.head.append(document.createElement("link").frycAPI_setAttribute("rel", "icon").frycAPI_setAttribute("href", "https://drive.google.com/uc?export=view&id=1FcCpL2HGSrww86HCd-j77EZl6BjcjgKo"))
		}
	});
}
if (frycAPI.host == "sjp.pwn.pl") {
	frycAPI.injectStyle(/*css*/`
		* {
			font-family: IBM Plex Sans Condensed;
		}
	`);
}
if (frycAPI.host == "npskills.github.io") {
	frycAPI.injectStyle(/*css*/`
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
}
if (frycAPI.host == "template") {
	frycAPI.injectStyle(/*css*/`
	`);

	(frycAPI.beforeLoad = function () {
		// frycAPI.colorSchemeDark = 1;
	})();

	frycAPI.onLoadSetter(() => {
	});

	frycAPI.nazwaBlokuIf = "";
	frycAPI.manualFunctionsCreator(frycAPI.nazwaBlokuIf, [
		// {name: "aaa", callBack: () => {
		// }},
	]);
}

// mega test
loguj("frycAPI loaded!"); // Test
// const t1 = performance.now();
// loguj(`Czas: ${frycAPI.zaokrl(t1 - t0,2)} ms`);