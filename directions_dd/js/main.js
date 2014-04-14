define(["dojo/ready", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", "esri/tasks/locator", "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "esri/toolbars/edit", "esri/geometry/Point", "application/utils/DirectionsMenu", "application/utils/DirectionsMenuItem", "application/utils/DirectionsEdit", "dojo/query", "dojo/keys", "dijit/registry", "application/utils/StopManager", "dgrid/Grid", "dojo/number", "dojo/dom-construct", "esri/lang", "esri/units", "dijit/form/Button", "dojo/promise/all"], function(ready, arrayUtils, declare, lang, Color, arcgisUtils, IdentityManager, on, Locator, webMercatorUtils, GraphicsLayer, SimpleLineSymbol, Graphic, RouteTask, RouteParameters, FeatureSet, Edit, Point, DirectionsMenu, DirectionsMenuItem, DirectionsEdit, query, keys, registry, StopManager, Grid, number, domConstruct, esriLang, esriUnits, Button, all) {
	return declare("", null, {
		config : {},
		constructor : function(config) {
			this.config = config;
			ready(lang.hitch(this, function() {
				this._createWebMap();
			}));
		},
		_mapLoaded : function() {
			var task;
			var toRemove;
			var map = this.map;
			var mouseMapListener;
			var stopIndex;
			var stopSymbol;
			var currentPoint;
			var grid;
			// route parameters
			var routeParameters = new RouteParameters();
			routeParameters.stops = new FeatureSet();
			routeParameters.outSpatialReference = {
				"wkid" : 102100
			};
			routeParameters.returnDirections = true;
			routeParameters.returnStops = true;
			routeParameters.directionsLanguage = "it_IT";
			routeParameters.directionsLengthUnits = esriUnits.KILOMETERS;
			// route line
			var routeSymbol = new SimpleLineSymbol();
			routeSymbol.setColor(new Color([0, 0, 255, 0.5]));
			routeSymbol.setWidth(5);
			// stops
			var stops = new GraphicsLayer();
			this.map.addLayer(stops);
			// routing task
			var routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
			routeTask.on("solve-complete", function(evt) {
				var res = evt.result.routeResults[0];
				if (toRemove !== undefined)
					map.graphics.remove(toRemove);
				toRemove = map.graphics.add(res.route.setSymbol(routeSymbol));
				if (res.directions != null) {
					map.setExtent(res.directions.extent, true);
					if (grid)
						grid.refresh();
					var data = arrayUtils.map(res.directions.features, function(feature, index) {
						return {
							"detail" : feature.attributes.text,
							"distance" : number.format(feature.attributes.length, {
								places : 2
							}),
							"index" : index
						};
					});
					grid = new Grid({
						renderRow : function renderList(obj, options) {
							var template = "<div class='detail'><div style='max-width:70%;float:left;'>${detail}</div><span style='float:right;' class='distance'>${distance} km</span></div>";
							return domConstruct.create("div", {
								innerHTML : esriLang.substitute(obj, template)
							});
						},
						showHeader : false
					}, "grid");
					grid.renderArray(data);
					if (res.stops != null) {
						map.getLayer("graphicsLayer0").graphics[0].geometry = res.stops[0].geometry;
						map.getLayer("graphicsLayer0").graphics[1].geometry = res.stops[1].geometry;
					}
				}
			});
			routeTask.on("error", function(evt) {
				console.log("routeTask error");
			});
			// move start point
			var startEdit = new Edit(this.map);
			startEdit.on("graphic-move-start", function(evt) {
				stopIndex = stops.graphics.indexOf(evt.graphic);
				stopSymbol = evt.graphic.symbol;
				routeParameters.returnDirections = false;
				routeParameters.returnStops = false;
				mouseMapListener = map.on("mouse-move", function(evt) {
					currentPoint = evt.mapPoint;
				});
				if (task === undefined) {
					task = setInterval(function() {
						routeTask.solve(routeParameters);
					}, 600);
				}
			});
			startEdit.on("graphic-move", function(evt) {
				routeParameters.stops.features.splice(stopIndex, 1);
				routeParameters.stops.features.splice(stopIndex, 0, new Graphic(currentPoint, stopSymbol));
			});
			startEdit.on("graphic-move-stop", function(evt) {
				startLocator.locationToAddress(evt.graphic.geometry);
				mouseMapListener.remove();
				if (task !== undefined) {
					clearInterval(task);
					task = undefined;
				}
			});
			// move end point
			var endEdit = new Edit(this.map);
			endEdit.on("graphic-move-start", function(evt) {
				stopIndex = stops.graphics.indexOf(evt.graphic);
				stopSymbol = evt.graphic.symbol;
				routeParameters.returnDirections = false;
				routeParameters.returnStops = false;
				mouseMapListener = map.on("mouse-move", function(evt) {
					currentPoint = evt.mapPoint;
				});
				if (task === undefined) {
					task = setInterval(function() {
						routeTask.solve(routeParameters);
					}, 600);
				}
			});
			endEdit.on("graphic-move", function(evt) {
				routeParameters.stops.features.splice(stopIndex, 1);
				routeParameters.stops.features.splice(stopIndex, 0, new Graphic(currentPoint, stopSymbol));
			});
			endEdit.on("graphic-move-stop", function(evt) {
				endLocator.locationToAddress(evt.graphic.geometry);
				mouseMapListener.remove();
				if (task !== undefined) {
					clearInterval(task);
					task = undefined;
				}
			});
			var startLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			startLocator.outSpatialReference = map.spatialReference;
			startLocator.on("address-to-locations-complete", function(evt) {
				stopManager.addStop(0, evt.addresses[0].location, false);
				map.getLayer("graphicsLayer0").graphics[0].setAttributes({
					name : evt.addresses[0].address
				});
			});
			startLocator.on("location-to-address-complete", function(evt) {
				if (evt.address.address) {
					// move point according to reverse geocode
					map.getLayer("graphicsLayer0").graphics[0].setGeometry(evt.address.location);
					map.getLayer("graphicsLayer0").graphics[0].setAttributes({
						name : evt.address.address.Address + ", " + evt.address.address.City
					});
					registry.byId("start").set("value", evt.address.address.Address + ", " + evt.address.address.City);
					routeParameters.stops.features.splice(0, 1, map.getLayer("graphicsLayer0").graphics[0]);
					if (map.getLayer("graphicsLayer0").graphics[0] != null && map.getLayer("graphicsLayer0").graphics[1] != null) {
						routeParameters.returnDirections = true;
						routeParameters.returnStops = true;
						routeTask.solve(routeParameters);
					}
				}
			});
			var endLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			endLocator.outSpatialReference = map.spatialReference;
			endLocator.on("address-to-locations-complete", function(evt) {
				stopManager.addStop(1, evt.addresses[0].location, false);
				map.getLayer("graphicsLayer0").graphics[1].setAttributes({
					name : evt.addresses[0].address
				});
			});
			endLocator.on("location-to-address-complete", function(evt) {
				if (evt.address.address) {
					// move point according to reverse geocode
					map.getLayer("graphicsLayer0").graphics[1].setGeometry(evt.address.location);
					map.getLayer("graphicsLayer0").graphics[1].setAttributes({
						name : evt.address.address.Address + ", " + evt.address.address.City
					});
					registry.byId("end").set("value", evt.address.address.Address + ", " + evt.address.address.City);
					routeParameters.stops.features.splice(1, 1, map.getLayer("graphicsLayer0").graphics[1]);
					if (map.getLayer("graphicsLayer0").graphics[0] != null && map.getLayer("graphicsLayer0").graphics[1] != null) {
						routeParameters.returnDirections = true;
						routeParameters.returnStops = true;
						routeTask.solve(routeParameters);
					}
				}
			});
			var stopManager = new StopManager(map, routeParameters, [startLocator, endLocator], new Array(startEdit, endEdit));
			// context menu
			var dirMenu = new DirectionsMenu();
			dirMenu.setMap(this.map);
			// start
			var startItem = new DirectionsMenuItem({
				label : "Parti da qui"
			});
			startItem.setIndex(0);
			startItem.setMenu(dirMenu);
			startItem.setStopManager(stopManager);
			dirMenu.addChild(startItem);
			// end
			var endItem = new DirectionsMenuItem({
				label : "Arriva qui"
			});
			endItem.setIndex(1);
			endItem.setMenu(dirMenu);
			endItem.setStopManager(stopManager);
			dirMenu.addChild(endItem);
			// activate context menu
			dirMenu.startup();
			dirMenu.bindDomNode(map.container);
			var routeButton = new Button({
				onClick : function() {
					all({
						start : startLocator.addressToLocations({
							address : {
								"SingleLine" : registry.byId("start").get("value")
							},
							outFields : ["Loc_name"]
						}),
						end : endLocator.addressToLocations({
							address : {
								"SingleLine" : registry.byId("end").get("value")
							},
							outFields : ["Loc_name"]
						})
					}).then(function(results) {
						console.log("fatto");
						routeTask.solve(routeParameters);
					});
				}
			}, "routeButton");
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
