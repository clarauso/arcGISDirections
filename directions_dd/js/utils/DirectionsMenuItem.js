define(["dojo/_base/declare", "dijit/MenuItem", "application/defaultPlacemarks", "esri/graphic", "esri/toolbars/edit"], function(declare, MenuItem, Placemarks, Graphic, Edit) {
	return declare("DirectionsMenuItem", MenuItem, {
		edit : {},
		index : 0,
		menu : {},
		parameters : {},
		task : {},
		constructor : function() {
		},
		setEdit : function(edit) {
			this.edit = edit;
		},
		setIndex : function(index) {
			this.index = index;
		},
		setMenu : function(menu) {
			this.menu = menu;
		},
		setParameters : function(parameters) {
			this.parameters = parameters;
		},
		setTask : function(task) {
			this.task = task;
		},
		onClick : function() {
			var stopGraphics = this.menu.getMap().getLayer("graphicsLayer0");
			var routeStops = this.parameters.stops.features;
			if (stopGraphics.graphics.length == 0) {
				stopGraphics.add(new Graphic(null, Placemarks.start));
				stopGraphics.add(new Graphic(null, Placemarks.end));
			}
			stopGraphics.graphics[this.index].setGeometry(this.menu.getCurrentPoint());
			if (routeStops.length == 0) {
				routeStops.push(null);
				routeStops.push(null);
			}
			routeStops.splice(this.index, 1, stopGraphics.graphics[this.index]);

			if (routeStops[0] != null && routeStops[1] != null)
				this.task.solve(this.parameters);

			this.edit.activate(Edit.MOVE, routeStops[this.index]);
		}
	});

});
