define(["dojo/_base/declare", "esri/toolbars/edit", "esri/graphic", "application/utils/Symbols"], function(declare, Edit, Graphic, Symbols) {
	return declare("StopManager", null, {
		editArray : {},
		locatorArray : {},
		main : {},
		constructor : function(main, locatorArray, editArray) {
			this.main = main;
			this.locatorArray = locatorArray;
			this.editArray = editArray;
		},
		addStop : function(index, point, reverse)  {
			if(reverse)
				this.locatorArray[index].locationToAddress(point);
			
			var stopGraphics = this.main.stops;
			var routeStops = this.main.routeParameters.stops.features;
			if (stopGraphics.graphics.length == 0) {
				stopGraphics.add(new Graphic(null, Symbols.start));
				stopGraphics.add(new Graphic(null, Symbols.end));
			}
			stopGraphics.graphics[index].setGeometry(point);
			if (routeStops.length == 0) {
				routeStops.push(null);
				routeStops.push(null);
			}
			routeStops.splice(index, 1, stopGraphics.graphics[index]);

			if(this.editArray[index] != undefined)
				this.editArray[index].activate(Edit.MOVE, routeStops[index]);
		}
	});
});