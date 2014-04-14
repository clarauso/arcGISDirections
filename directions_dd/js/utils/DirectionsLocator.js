define(["dojo/_base/declare", "esri/tasks/locator"], function(declare, Locator) {
	return declare("DirectionsLocator", Locator, {
		index : {},
		main : {},
		constructor : function() {
			var thisLocator = this;
			this.on("address-to-locations-complete", function(evt) {
				thisLocator._addressToLocations(evt);
			});
			this.on("location-to-address-complete", function(evt) {
				if (evt.address.address) {
					thisLocator._locationToAddress(evt);
				}
			});
		},
		setIndex : function(index) {
			this.index = index;
		},
		setMain : function(main) {
			this.main = main;
		},
		_addressToLocations : function(evt) {
			stopManager.addStop(this.index, evt.addresses[0].location, false);
			this.main.stops[this.index].setAttributes({
				name : evt.addresses[0].address
			});
		},
		_locationToAddress : function(evt) {
			var graphic = this.main.stops.graphics[this.index];
			graphic.setGeometry(evt.address.location);
			graphic.setAttributes({
				name : evt.address.address.Address + ", " + evt.address.address.City
			});
			this.main.setStopField(this.index, evt.address.address.Address + ", " + evt.address.address.City);
			this.main.routeParameters.stops.features.splice(this.index, 1, graphic);
			if (this.main.stops.graphics[0] != null && this.main.stops.graphics[1] != null) {
				this.main.routeParameters.returnDirections = true;
				this.main.routeParameters.returnStops = true;
				this.main.routeTask.solve(this.main.routeParameters);
			}
		}
	});
});
