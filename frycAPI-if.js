 else if (frycAPI.host("${0:template}")) {
	frycAPI.injectStyleOnLoad(/*css*/`

	`);

	(frycAPI.beforeLoad = function () {
		// frycAPI.colorSchemeDark = 1;
	})();

	frycAPI.onLoadSetter(function () {
	});

	frycAPI.createManualFunctions("aaa", {
		funcArr: [
			(name = "aaa", type = frycAPI_Normal) => {
				const f = new type({ name });
				f.callBack = function (obj) {

				};
				return f;
			},
			(name = "aaa", type = frycAPI_State) => {
				const f = new type({
					name: name,
					stateDesc: ["aaa", "aaa"],
				});
				f.callBack = function (obj) {

				};
				return f;
			},
		],
	});
}