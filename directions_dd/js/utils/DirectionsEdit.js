define(["dojo/_base/declare", "esri/toolbars/edit"], function(declare, Edit) {
	return declare("DirectionsEdit", Edit, {
		constructor : function() {
			this.on("graphic-move-start", function(evt) {
				console.log("halo");
			});
			this.on("graphic-move", function(evt) {
				console.log("move");
			});
			this.on("graphic-move-stop", function(evt) {
				console.log("stop");
			});
		}
	});
});
