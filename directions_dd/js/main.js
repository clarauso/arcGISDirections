define(["dojo/ready", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", "esri/tasks/locator", "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "application/defaultPlacemarks", "esri/toolbars/edit", "dijit/Menu", "dijit/MenuItem", "esri/geometry/Point"], function(ready, declare, lang, Color, arcgisUtils, IdentityManager, on, Locator, webMercatorUtils, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, RouteTask, RouteParameters, FeatureSet, placemarks, Edit, Menu, MenuItem, Point) {
	return declare("", null, {
		config : {},
		constructor : function(config) {
			this.config = config;
			ready(lang.hitch(this, function() {
				this._createWebMap();
			}));
		},
		_mapLoaded : function() {
			// Map is ready
			console.log("mapLoaded");
			var task;
			var toRemove;
			var map = this.map;
			var mouseMapListener;
			var stopIndex;
			var stopSymbol;
			var contextPoint;
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

					contextPoint = map.toMap(new Point(x - map.position.x, y - map.position.y));
				}
			});
			contextMenu.addChild(new MenuItem({
				label : "Parti da qui",
				onClick : function() {
					graphicStop = new Graphic(contextPoint, placemarks.start);
					var stopGraphics = map.getLayer("graphicsLayer0");
					var routeStops = routeParameters.stops.features;
					if (stopGraphics.graphics.length == 0) {
						stopGraphics.add(new Graphic(null, placemarks.start));
						stopGraphics.add(new Graphic(null, placemarks.end));
					}
					stopGraphics.graphics[0].setGeometry(contextPoint);
					if (routeStops.length == 0) {
						routeStops.push(null);
						routeStops.push(null);
					}
					routeStops.splice(0, 1, stopGraphics.graphics[0]);

					if (routeStops[0] != null && routeStops[1] != null) {
						routeTask.solve(routeParameters);
					}
				}
			}));
			contextMenu.addChild(new MenuItem({
				label : "Arriva qui",
				onClick : function() {
					graphicStop = new Graphic(contextPoint, placemarks.start);
					var stopGraphics = map.getLayer("graphicsLayer0");
					var routeStops = routeParameters.stops.features;
					if (stopGraphics.graphics.length == 0) {
						stopGraphics.add(new Graphic(null, placemarks.start));
						stopGraphics.add(new Graphic(null, placemarks.end));
					}
					stopGraphics.graphics[1].setGeometry(contextPoint);
					if (routeStops.length == 0) {
						routeStops.push(null);
						routeStops.push(null);
					}
					routeStops.splice(1, 1, stopGraphics.graphics[1]);

					if (routeStops[0] != null && routeStops[1] != null) {
						routeTask.solve(routeParameters);
					}

					edit.activate(Edit.MOVE, routeStops[1]);
				}
			}));
			contextMenu.startup();
			contextMenu.bindDomNode(map.container);

			var edit = new Edit(this.map);
			edit.on("graphic-move-start", function(evt) {
				stopIndex = stops.graphics.indexOf(evt.graphic);
				stopSymbol = evt.graphic.symbol;
				mouseMapListener = map.on("mouse-move", function(evt) {
					currentPoint = evt.mapPoint;
				});
				if (task === undefined) {
					task = setInterval(function() {
						routeTask.solve(routeParameters);
					}, 600);
				}
			});
			edit.on("graphic-move", function(evt) {
				routeParameters.stops.features.splice(stopIndex, 1);
				routeParameters.stops.features.splice(stopIndex, 0, new Graphic(currentPoint, stopSymbol));
			});
			edit.on("graphic-move-stop", function(evt) {
				mouseMapListener.remove();
				if (task !== undefined) {
					clearInterval(task);
					task = undefined;
				}
			});
			var routeSymbol = new SimpleLineSymbol();
			routeSymbol.setColor(new Color([0, 0, 255, 0.5]));
			routeSymbol.setWidth(5);
			var routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
			routeTask.on("solve-complete", function(evt) {
				if (!(toRemove === undefined))
					map.graphics.remove(toRemove);
				toRemove = map.graphics.add(evt.result.routeResults[0].route.setSymbol(routeSymbol));
			});
			routeTask.on("error", function(evt) {
				console.log("routeTask error");
			});
			var routeParameters = new RouteParameters();
			routeParameters.stops = new FeatureSet();
			routeParameters.outSpatialReference = {
				"wkid" : 102100
			};
			var stops = new GraphicsLayer();
			this.map.addLayer(stops);
			/*
			 this.map.on("dbl-click", function(evt) {
			 locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(evt.mapPoint), 100);
			 });
			 */
			// reverse geocoding service
			var locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			locator.on("location-to-address-complete", function(evt) {
				if (evt.address.address) {
					if (directions.stops[0].name === "") {
						directions.updateStop(evt.address.address.Address + ", " + evt.address.address.City, 0);
					} else {
						directions.updateStop(evt.address.address.Address + ", " + evt.address.address.City, 1).then(function(value) {
							// directions updated, get directions
							directions.emit("get-directions", null);
						}, function(err) {
							// Do something when the process errors out
						}, function(update) {
							// Do something when the process provides progress information
						});
					}
				}
			});
		},
		//create a map based on the input web map id
		_createWebMap : function() {
			arcgisUtils.createMap(this.config.webmap, "map", {
				mapOptions : {
					center : [12.483162, 41.8964],
					zoom : 13
				},
				bingMapsKey : this.config.bingmapskey
			}).then(lang.hitch(this, function(response) {
				this.map = response.map;
				if (this.map.loaded) {
					this._mapLoaded();
				} else {
					on.once(this.map, "load", lang.hitch(this, function() {
						this._mapLoaded();
					}));
				}
			}), lang.hitch(this, function(error) {
				if (this.config && this.config.i18n) {
					alert(this.config.i18n.map.error + ": " + error.message);
				} else {
					alert("Unable to create map: " + error.message);
				}
			}));
		}
	});
});
