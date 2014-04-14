define(["dojo/_base/declare", "esri/graphic", "esri/toolbars/edit"], function(declare, Graphic, Edit) {
	return declare("DirectionsEdit", Edit, {
		currentPoint : {},
		locator : {},
		main : {},
		stopIndex : {},
		stopSymbol : {},
		constructor : function() {
			var thisEdit = this;
			this.on("graphic-move-start", function(evt) {
				thisEdit._moveStart(evt);
			});
			this.on("graphic-move", function(evt) {
				thisEdit._move(evt);
			});
			this.on("graphic-move-stop", function(evt) {
				thisEdit._moveStop(evt);
			});
		},
		setLocator : function(locator) {
			this.locator = locator;
		},
		setMain : function(main) {
			this.main = main;
		},
		_move : function(evt) {
			this.main.routeParameters.stops.features.splice(this.stopIndex, 1, new Graphic(this.currentPoint, this.stopSymbol));
		},
		_moveStart : function(evt) {
			this.stopIndex = this.main.stops.graphics.indexOf(evt.graphic);
			this.stopSymbol = evt.graphic.symbol;
			this.main.routeParameters.returnDirections = false;
			this.main.routeParameters.returnStops = false;
			var thisEdit = this;
			this.main.mouseMapListener = this.main.map.on("mouse-move", function(evt) {
				thisEdit.currentPoint = evt.mapPoint;
			});
			if (this.main.timerTask === undefined) {
				var main = this.main;
				this.main.timerTask = setInterval(function() {
					main.routeTask.solve(main.routeParameters);
				}, 100);
			}
		},
		_moveStop : function(evt) {
			this.locator.locationToAddress(evt.graphic.geometry);
			this.main.mouseMapListener.remove();
			if (this.main.timerTask !== undefined) {
				clearInterval(this.main.timerTask);
				this.main.timerTask = undefined;
			}
		}
	});
});