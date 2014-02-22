define(["dojo/ready", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", "esri/tasks/locator", "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "esri/toolbars/edit", "esri/geometry/Point", "application/utils/DirectionsMenu", "application/utils/DirectionsMenuItem", "application/utils/DirectionsEdit", "dojo/query", "dojo/keys", "dijit/registry", "application/utils/StopsUtils"], function(ready, declare, lang, Color, arcgisUtils, IdentityManager, on, Locator, webMercatorUtils, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, Graphic, RouteTask, RouteParameters, FeatureSet, Edit, Point, DirectionsMenu, DirectionsMenuItem, DirectionsEdit, query, keys, registry, Stops) {
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
			// parameters
			var routeParameters = new RouteParameters();
			routeParameters.stops = new FeatureSet();
			routeParameters.outSpatialReference = {
				"wkid" : 102100
			};
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
				if (toRemove !== undefined)
					map.graphics.remove(toRemove);
				toRemove = map.graphics.add(evt.result.routeResults[0].route.setSymbol(routeSymbol));
				if (routeParameters.returnDirections === true)
					console.log(evt.result.routeResults[0].directions.features);
			});
			routeTask.on("error", function(evt) {
				console.log("routeTask error");
			});
			// end edit
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
			
			var startEdit = new DirectionsEdit(this.map);
			// context menu
			var dirMenu = new DirectionsMenu();
			dirMenu.setMap(this.map);
			// start
			var startItem = new DirectionsMenuItem({
				label : "Parti da qui"
			});
			startItem.setIndex(0);
			startItem.setMenu(dirMenu);
			startItem.setParameters(routeParameters);
			startItem.setTask(routeTask);
			startItem.setEdit(startEdit);
			dirMenu.addChild(startItem);
			// end
			var endItem = new DirectionsMenuItem({
				label : "Arriva qui"
			});
			endItem.setIndex(1);
			endItem.setMenu(dirMenu);
			endItem.setParameters(routeParameters);
			endItem.setTask(routeTask);
			endItem.setEdit(edit);
			dirMenu.addChild(endItem);
			dirMenu.startup();
			dirMenu.bindDomNode(map.container);
			// geocoding service
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
			var stopManager = new Stops();
			var startLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			startLocator.outSpatialReference = map.spatialReference;
			startLocator.on("address-to-locations-complete", function(evt) {
				stopManager.addStop(map, routeParameters, 0, evt.addresses[0].location, task, undefined);
			});
			var endLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			endLocator.outSpatialReference = map.spatialReference;
			endLocator.on("address-to-locations-complete", function(evt) {
				stopManager.addStop(map, routeParameters, 1, evt.addresses[0].location, task, undefined);
			});
			query("input[type='text']").on("keydown", function(evt) {
				switch(evt.keyCode) {
					case keys.ENTER:
						evt.preventDefault();
						var target = evt.originalTarget.id;
						var s = registry.byId(target).get("value");
						if (s != undefined || s != "") {
							var address = {
								"SingleLine" : s
							};
							if (target == "start") {
								startLocator.addressToLocations({
									address : address,
									outFields : ["Loc_name"]
								});
							} else if (target == "end"){
								endLocator.addressToLocations({
									address : address,
									outFields : ["Loc_name"]
								});
							}
						}
						break;
					default:
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