define(["dojo/_base/declare", "dijit/Menu", "esri/geometry/Point"], function(declare, Menu, Point) {
	return declare("DirectionsMenu", Menu, {
		currentPoint : {},
		map : {},
		constructor : function() {
		},
		setMap : function(map) {
			this.map = map;
		},
		getCurrentPoint : function() {
			return this.currentPoint;
		},
		getMap : function() {
			return this.map;
		},
		onOpen : function(box) {
			var x = box.x, y = box.y;
			switch( box.corner ) {
				case "TR":
					x += box.w;
					break;
				case "BL":
					y += box.h;
					break;
				case "BR":
					x += box.w;
					y += box.h;
					break;
			}
			this.currentPoint = this.map.toMap(new Point(x - this.map.position.x, y - this.map.position.y));
		}
	});
});
