define(["dojo/_base/declare", "dijit/Menu", "dijit/MenuItem", "esri/geometry/Point"], function(declare, Menu, MenuItem, Point) {
	return declare("", null, {
		currentPoint : {},
		constructor : function(map) {

			var contextMenu = new Menu({
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

					currentPoint = map.toMap(new Point(x - map.position.x, y - map.position.y));
				}
			});

			contextMenu.addChild(new MenuItem({
				label : "Parti da qui",
				onClick : function() {
					// TODO emit event
				}
			}));
			contextMenu.addChild(new MenuItem({
				label : "Arriva qui",
				onClick : function() {
					// TODO emit event
				}
			}));

			contextMenu.startup();
			contextMenu.bindDomNode(map.container);
		}
	});
});
