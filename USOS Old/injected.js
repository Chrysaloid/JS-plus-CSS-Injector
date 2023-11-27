console.log("Injected");
// console.log(document.body);

function myMainFunction() {
	const myShadowStyle = `
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
	`
	var style = document.createElement('style');
	style.innerHTML = myShadowStyle;
	// tbody.autostrong td.strong:has(a)
	// table:not(:has(span.note)) td
	document.querySelectorAll(`
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
	`).forEach(function (daElem, daI, daArr) {
		daElem.innerHTML = `<span class="mySpan">${daElem.innerHTML}</span>`;
	});

	document.querySelectorAll("td > div > form > label:first-of-type + br")
		.forEach(function (daElem, daI, daArr) { daElem.remove(); });

	["info-box", "success-box", "notice-box"].forEach(daEl => {
		document.querySelectorAll(daEl).forEach(function (daElem, daI, daArr) {
			daElem.shadowRoot.querySelector("div").classList.add(daEl, "moj-box");
		});
	});

	document.querySelectorAll('*').forEach(elem => {
		if (!!elem.shadowRoot) {
			elem.shadowRoot.appendChild(style.cloneNode(1));
		}
	});

	{ /* Naprawy kalendarza rejestracji */
		if (!document.title.includes("USOSweb tymczasowo niedostępny") &&
			document.querySelector("[aria-label='Panel boczny'] a[href='https://usosweb.usos.pw.edu.pl/kontroler.php?_action=dla_stud/rejestracja/kalendarz'].selected") !== null) {
			document.querySelectorAll(".usos-ui h2").forEach(function (daElem, daI, daArr) {
				// debugger
				var myDiv = document.createElement("div");
				myDiv.classList.add("myDiv");
				var h2next = daElem.nextElementSibling;
				while (h2next !== null && h2next.tagName != "H2") {
					var h2next1 = h2next.nextElementSibling;
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
		document.querySelectorAll("td:has(img.rejestracja-ikona[src='https://usosweb.usos.pw.edu.pl//img/spinacz_tip.png']) > br")
			.forEach(function (daElem, daI, daArr) { daElem.remove(); });
	}
}

window.addEventListener("load", (event) => {
	myMainFunction();
});

