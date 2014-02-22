define(["dojo/_base/declare", "esri/toolbars/edit", "esri/graphic", "application/defaultPlacemarks"], function(declare, Edit, Graphic, Placemarks) {
	return declare("StopsUtils", null, {
		constructor : function() {
		},
		addStop : function(map, parameters, index, point, task, edit)  {
			var stopGraphics = map.getLayer("graphicsLayer0");
			var routeStops = parameters.stops.features;
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

			if (routeStops[0] != null && routeStops[1] != null)
				task.solve(parameters);

			if(edit != undefined)
				edit.activate(Edit.MOVE, routeStops[index]);
		}
	});
});