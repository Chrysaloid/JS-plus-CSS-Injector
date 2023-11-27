let el = document.createElement("script");
el.src = chrome.runtime.getURL("injected.js");
document.documentElement.appendChild(el);

// let li = document.createElement("link");
// li.setAttribute("type", "text/css");
// li.setAttribute("rel", "stylesheet");
// li.setAttribute("href", chrome.runtime.getURL("start.css"));
// document.documentElement.appendChild(li);
console.log("Inject");