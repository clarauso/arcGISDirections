define(["dojo/_base/declare", "dijit/MenuItem", "application/utils/StopManager"], function(declare, MenuItem, StopManager) {
	return declare("DirectionsMenuItem", MenuItem, {
		edit : {},
		index : 0,
		locator : {},
		menu : {},
		stopManager : {},
		constructor : function() {
		},
		setEdit : function(edit) {
			this.edit = edit;
		},
		setIndex : function(index) {
			this.index = index;
		},
		setLocator : function(locator) {
			this.locator = locator;
		},
		setMenu : function(menu) {
			this.menu = menu;
		},
		setParameters : function(parameters) {
			this.parameters = parameters;
		},
		setStopManager : function(manager) {
			this.stopManager = manager;
		},
		onClick : function() {
			this.stopManager.addStop(this.index, this.menu.getCurrentPoint(), this.edit, this.locator, true);
		}
	});

});
