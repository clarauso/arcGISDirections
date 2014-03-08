define(["dojo/_base/declare", "dijit/MenuItem", "application/utils/StopManager"], function(declare, MenuItem, StopManager) {
	return declare("DirectionsMenuItem", MenuItem, {
		index : 0,
		menu : {},
		stopManager : {},
		constructor : function() {
		},
		setIndex : function(index) {
			this.index = index;
		},
		setMenu : function(menu) {
			this.menu = menu;
		},
		setStopManager : function(manager) {
			this.stopManager = manager;
		},
		onClick : function() {
			this.stopManager.addStop(this.index, this.menu.getCurrentPoint(), true);
		}
	});

});
