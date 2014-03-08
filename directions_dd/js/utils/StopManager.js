define(["dojo/_base/declare", "esri/toolbars/edit", "esri/graphic", "application/defaultPlacemarks"], function(declare, Edit, Graphic, Placemarks) {
	return declare("StopManager", null, {
		map : {},
		parameters : {},
		locatorArray : {},
		editArray : {},
		constructor : function(routeMap, routeParameters, locatorArray, editArray) {
			this.map = routeMap;
			this.parameters = routeParameters;
			this.locatorArray = locatorArray;
			this.editArray = editArray;
		},
		addStop : function(index, point, reverse)  {
			if(reverse)
				this.locatorArray[index].locationToAddress(point);
			
			var stopGraphics = this.map.getLayer("graphicsLayer0");
			var routeStops = this.parameters.stops.features;
			if (stopGraphics.graphics.length == 0) {
				stopGraphics.add(new Graphic(null, Placemarks.start));
				stopGraphics.add(new Graphic(null, Placemarks.end));
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