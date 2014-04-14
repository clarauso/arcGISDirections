define(["dojo/ready", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Color", "esri/arcgis/utils", "esri/IdentityManager", "dojo/on", 
"esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/tasks/RouteTask", 
"esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "esri/geometry/Point", "application/utils/DirectionsMenu", "application/utils/DirectionsMenuItem", 
"application/utils/DirectionsEdit", "application/utils/DirectionsLocator", "dojo/query", "dojo/keys", "dijit/registry", "application/utils/StopManager", "dgrid/Grid", "dojo/number", "dojo/dom-construct", 
"esri/lang", "esri/units", "dijit/form/Button", "dojo/promise/all"], 
function(ready, arrayUtils, declare, lang, Color, arcgisUtils, IdentityManager, on,
	webMercatorUtils, GraphicsLayer, SimpleLineSymbol, Graphic, RouteTask, 
	RouteParameters, FeatureSet, Point, DirectionsMenu, DirectionsMenuItem, 
	DirectionsEdit, DirectionsLocator, query, keys, registry, StopManager, Grid, number, domConstruct,
	esriLang, esriUnits, Button, all) {
	return declare("", null, {
		config : {},
		mouseMapListener : {},
		routeParameters : {},
		routeTask : {},
		stops : {},
		timerTask : {},
		constructor : function(config) {
			this.config = config;
			ready(lang.hitch(this, function() {
				this._createWebMap();
			}));
		},
		_mapLoaded : function() {
			var toRemove;
			var map = this.map;
			var mouseMapListener;
			var stopIndex;
			var stopSymbol;
			var currentPoint;
			var grid;
			this.timerTask = undefined;
			// route parameters
			this.routeParameters = new RouteParameters();
			this.routeParameters.stops = new FeatureSet();
			this.routeParameters.outSpatialReference = {
				"wkid" : 102100
			};
			this.routeParameters.returnDirections = true;
			this.routeParameters.returnStops = true;
			this.routeParameters.directionsLanguage = "it_IT";
			this.routeParameters.directionsLengthUnits = esriUnits.KILOMETERS;
			var routeParameters = this.routeParameters; // TODO remove
			// route line
			var routeSymbol = new SimpleLineSymbol();
			routeSymbol.setColor(new Color([0, 0, 255, 0.5]));
			routeSymbol.setWidth(5);
			// stops
			this.stops = new GraphicsLayer();
			this.map.addLayer(this.stops);
			var stops = this.stops;		// TODO remove
			// routing task
			this.routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
			this.routeTask.on("solve-complete", function(evt) {
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
			this.routeTask.on("error", function(evt) {
				console.log("routeTask error");
			});
			var routeTask = this.routeTask;
			// locators for geocoding
			var startLocator = new DirectionsLocator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			startLocator.outSpatialReference = map.spatialReference;
			startLocator.setIndex(0);
			startLocator.setMain(this);
			var endLocator = new DirectionsLocator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			endLocator.outSpatialReference = map.spatialReference;
			endLocator.setIndex(1);
			endLocator.setMain(this);
			// move start point
			var startEdit = new DirectionsEdit(this.map);
			startEdit.setMain(this);
			startEdit.setLocator(startLocator);
			// move end point
			var endEdit = new DirectionsEdit(this.map);
			endEdit.setMain(this);
			endEdit.setLocator(endLocator);
			var stopManager = new StopManager(this, [startLocator, endLocator], [startEdit, endEdit]);
			// context menu with items
			var dirMenu = new DirectionsMenu();
			dirMenu.setMap(this.map);
			var startItem = new DirectionsMenuItem({
				label : "Parti da qui"
			});
			startItem.setIndex(0);
			startItem.setMenu(dirMenu);
			startItem.setStopManager(stopManager);
			dirMenu.addChild(startItem);
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
			// solve route button
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
						routeTask.solve(routeParameters);
					});
				}
			}, "routeButton");
		},
		setStopField : function(index, string) {
			registry.byId((index == 0 ? "start" : "end")).set("value", string);
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