"use strict";

const frycAPI = document.createElement("script");
frycAPI.src = chrome.runtime.getURL("frycAPI.js");
document.documentElement.appendChild(frycAPI);
// console.log("Inject");
