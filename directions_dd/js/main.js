define(["dojo/ready", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", "esri/dijit/Directions", "esri/tasks/locator", "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "application/defaultPlacemarks", "esri/toolbars/edit"], function(ready, declare, lang, Color, arcgisUtils, IdentityManager, on, Directions, Locator, webMercatorUtils, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, RouteTask, RouteParameters, FeatureSet, placemarks, Edit) {
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
			var stopIndex;
			var stopSymbol;
			var edit = new Edit(this.map);
			edit.on("graphic-move-start", function(evt) {
				console.log("move-start");
				stopIndex = stops.graphics.indexOf(evt.graphic);
				console.log(evt.graphic.geometry.x);
				console.log(evt.graphic.geometry.y);
				if (task === undefined) {
					task = setInterval(function() {
						routeTask.solve(routeParameters);
					}, 600);
				}
			});
			edit.on("graphic-move", function(evt) {
				console.log("move");
				//routeParameters.stops.features.splice(stopIndex, 1);
				//routeParameters.stops.features.splice(stopIndex, 0, evt.graphic);
				//console.log(routeParameters.stops.features[stopIndex].geometry.x = evt.graphic.geometry.x + evt.transform.dx);
				//console.log(routeParameters.stops.features[stopIndex].geometry.y = evt.graphic.geometry.y + evt.transform.dy);
				console.log(evt.graphic.geometry.x);
				console.log(evt.transform.dx);
				console.log(evt.graphic.geometry.y);
				console.log(evt.transform.dy);
				//console.log(routeParameters.stops.features[stopIndex]);
				//console.log("moving");
				//console.log(evt.transform);
				/*
				console.log(evt.graphic.geometry.x);
				console.log(evt.graphic.geometry.x + evt.transform.dx);
				evt.graphic.geometry.x = evt.graphic.geometry.x + evt.transform.dx;
				console.log(evt.graphic.geometry.y);
				console.log(evt.graphic.geometry.y + evt.transform.dy);
				evt.graphic.geometry.y = evt.graphic.geometry.y + evt.transform.dy;
				*/
			});
			edit.on("graphic-move-stop", function(evt) {
				console.log("move-stop");
				console.log(evt.graphic.geometry.x);
				console.log(evt.transform.dx);
				console.log(evt.graphic.geometry.y);
				console.log(evt.transform.dy);
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
			var editingEnabled = false;
			var stops = new GraphicsLayer();
			this.map.addLayer(stops);
			/*
			 this.map.on("dbl-click", function(evt) {
			 locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(evt.mapPoint), 100);
			 });
			 */
			this.map.on("dbl-click", function(evt) {
				var graphicStop;
				if (routeParameters.stops.features.length == 0) {
					graphicStop = new Graphic(evt.mapPoint, placemarks.start);
					routeParameters.stops.features.push(this.getLayer("graphicsLayer0").add(graphicStop));
					edit.activate(Edit.MOVE, graphicStop);
				} else if (routeParameters.stops.features.length == 1) {
					graphicStop = new Graphic(evt.mapPoint, placemarks.end);
					routeParameters.stops.features.push(this.getLayer("graphicsLayer0").add(graphicStop));
					edit.activate(Edit.MOVE, graphicStop);
				}

				if (routeParameters.stops.features.length == 2) {
					routeTask.solve(routeParameters);
				}
			});
			this.map.on("click", function(evt) {
				console.log(evt.mapPoint);
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