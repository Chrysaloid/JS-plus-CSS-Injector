"use strict";

// #region 1
const a = [
	// #region //* Test
	[() => 1, () => {
		console.log("1");
	}],
	// #endregion
	[() => 1, () => {
		console.log("1");
	}],
	[() => 1, () => {
		console.log("1");
	}],
	[() => 1, () => {
		console.log("1");
	}],
].find(el => el[0]())?.[1]?.();
// #endregion

// #region 2
function voidFun() {
	return voidFun;
}

function frycAPI_arr(cond, fun) {
	if (cond()) {
		fun();
		return voidFun;
	} else {
		return frycAPI_arr;
	}
}

frycAPI_arr(() => 0, () => {
	console.log("1");
})
// #region //* Test
(() => 0, () => {
	console.log("1");
})
// #endregion
(() => 0, () => {
	console.log("1");
})
(() => 0, () => {
	console.log("1");
})
(() => 1, () => {
	console.log("1");
})
(() => 0, () => {
	console.log("1");
})
(() => 0, () => {
	console.log("1");
});
// #endregion

