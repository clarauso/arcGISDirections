define(["dojo/_base/declare", "dijit/MenuItem", "application/utils/StopsUtils"], function(declare, MenuItem, Stops) {
	return declare("DirectionsMenuItem", MenuItem, {
		edit : {},
		index : 0,
		locator : {},
		menu : {},
		parameters : {},
		task : {},
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
		setTask : function(task) {
			this.task = task;
		},
		onClick : function() {
			new Stops().addStop(this.menu.getMap(), this.parameters, this.index, this.menu.getCurrentPoint(), this.task, this.edit, this.locator, true);
		}
	});

});
