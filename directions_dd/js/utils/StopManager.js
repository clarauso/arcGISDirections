define(["dojo/_base/declare", "esri/toolbars/edit", "esri/graphic", "application/defaultPlacemarks"], function(declare, Edit, Graphic, Placemarks) {
	return declare("StopManager", null, {
		map : {},
		parameters : {},
		constructor : function(routeMap, routeParameters) {
			this.map = routeMap;
			this.parameters = routeParameters;
		},
		getMap : function() {
			return this.map;
		},
		getParameters : function() {
			return this.parameters;
		},
		addStop : function(index, point, edit, locator, reverse)  {
			if(reverse)
				locator.locationToAddress(point);
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

			if(edit != undefined)
				edit.activate(Edit.MOVE, routeStops[index]);
		}
	});
});