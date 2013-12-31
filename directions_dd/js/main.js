define(["dojo/ready", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", "esri/dijit/Directions", "esri/tasks/locator", "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet"], function(ready, declare, lang, Color, arcgisUtils, IdentityManager, on, Directions, Locator, webMercatorUtils, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, RouteTask, RouteParameters, FeatureSet) {
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
			var map = this.map;
			var toRemove;
			var routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
			routeTask.on("solve-complete", function(evt) {
				if (!(toRemove === undefined))
					map.graphics.remove(toRemove);
				toRemove = map.graphics.add(evt.result.routeResults[0].route.setSymbol(routeSymbol));
			});
			routeTask.on("error", function(evt) {
				console.log("routeTask error");
			});
			routeParameters = new RouteParameters();
			routeParameters.stops = new FeatureSet();
			routeParameters.outSpatialReference = {
				"wkid" : 102100
			};
			var task;
			stops = new GraphicsLayer();
			stops.on("mouse-down", function(evt) {
				console.log("down");
				task = setInterval(function() {
					var routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
					routeTask.on("solve-complete", function(evt) {
						if (!(toRemove === undefined))
							map.graphics.remove(toRemove);
						toRemove = map.graphics.add(evt.result.routeResults[0].route.setSymbol(routeSymbol));
					});
					routeTask.on("error", function(evt) {
						console.log("routeTask error");
					});
					routeTask.solve(routeParameters);
				}, 600);
			});
			stops.on("mouse-drag", function(evt) {
				routeParameters.stops.features.splice(0, 1);
				routeParameters.stops.features.splice(0, 0, this.add(new Graphic(evt.mapPoint, symbol)));
				this.remove(evt.graphic);
			});
			stops.on("mouse-up", function(evt) {
				clearInterval(task);
			});
			this.map.addLayer(stops);
			symbol = new SimpleMarkerSymbol();
			symbol.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND).setSize(15);
			routeSymbol = new SimpleLineSymbol();
			routeSymbol.setColor(new Color([0, 0, 255, 0.5]));
			routeSymbol.setWidth(5);
			/*
			 this.map.on("dbl-click", function(evt) {
			 locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(evt.mapPoint), 100);
			 });
			 */
			this.map.on("dbl-click", function(evt) {
				//get the associated node info when the graphic is clicked
				var g = new Graphic(evt.mapPoint, symbol);
				if (routeParameters.stops.features.length < 2)
					routeParameters.stops.features.push(this.getLayer("graphicsLayer0").add(g));
				if (routeParameters.stops.features.length == 2) {
					routeTask.solve(routeParameters);
				}
			});
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
