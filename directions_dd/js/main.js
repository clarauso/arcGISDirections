define(["dojo/ready", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", "esri/tasks/locator", "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "application/defaultPlacemarks", "esri/toolbars/edit", "dijit/MenuItem", "esri/geometry/Point", "application/utils/DirectionsMenu"], function(ready, declare, lang, Color, arcgisUtils, IdentityManager, on, Locator, webMercatorUtils, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, RouteTask, RouteParameters, FeatureSet, placemarks, Edit, MenuItem, Point, DirectionsMenu) {
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
			var currentPoint;
			var routeParameters = new RouteParameters();
			routeParameters.stops = new FeatureSet();
			routeParameters.outSpatialReference = {
				"wkid" : 102100
			};
			var dirMenu = new DirectionsMenu(map);
			dirMenu.setMap(this.map);
			dirMenu.setParams(routeParameters);
			dirMenu.startup();
			dirMenu.bindDomNode(map.container);
			dirMenu.addChild(new MenuItem({
				label : "Parti da qui",
				onClick : function() {
					// TODO reverse geocoding
					//locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(contextPoint), 100);
					var stopGraphics = map.getLayer("graphicsLayer0");
					var routeStops = routeParameters.stops.features;
					if (stopGraphics.graphics.length == 0) {
						stopGraphics.add(new Graphic(null, placemarks.start));
						stopGraphics.add(new Graphic(null, placemarks.end));
					}
					stopGraphics.graphics[0].setGeometry(dirMenu.getCurrentPoint());
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
			dirMenu.addChild(new MenuItem({
				label : "Arriva qui",
				onClick : function() {
					var stopGraphics = map.getLayer("graphicsLayer0");
					var routeStops = routeParameters.stops.features;
					if (stopGraphics.graphics.length == 0) {
						stopGraphics.add(new Graphic(null, placemarks.start));
						stopGraphics.add(new Graphic(null, placemarks.end));
					}
					stopGraphics.graphics[1].setGeometry(dirMenu.getCurrentPoint());
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
			dirMenu.startup();
			dirMenu.bindDomNode(map.container);

			var edit = new Edit(this.map);
			edit.on("graphic-move-start", function(evt) {
				stopIndex = stops.graphics.indexOf(evt.graphic);
				stopSymbol = evt.graphic.symbol;
				routeParameters.returnDirections = false;
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
				routeParameters.returnDirections = true;
				routeTask.solve(routeParameters);
			});

			var routeSymbol = new SimpleLineSymbol();
			routeSymbol.setColor(new Color([0, 0, 255, 0.5]));
			routeSymbol.setWidth(5);
			var routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
			routeTask.on("solve-complete", function(evt) {
				if (!(toRemove === undefined))
					map.graphics.remove(toRemove);
				toRemove = map.graphics.add(evt.result.routeResults[0].route.setSymbol(routeSymbol));
				if (routeParameters.returnDirections === true)
					console.log(evt.result.routeResults[0].directions.features);
			});
			routeTask.on("error", function(evt) {
				console.log("routeTask error");
			});
			var stops = new GraphicsLayer();
			this.map.addLayer(stops);

			// reverse geocoding service
			var locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			locator.on("location-to-address-complete", function(evt) {
				if (evt.address.address) {
					console.log(evt.address);
					// TODO reverse geocode start and end
					/*
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
					 */
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