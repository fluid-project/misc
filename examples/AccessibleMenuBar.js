var fluid = fluid || {};

fluid.accessiblemenubar = function () {
	var getSubMenuForMenuItem = function (menuItem) {
		return jQuery ("ol", menuItem);
	};

	var isSubMenuOpen = function(menuItem) {
		var subMenu = getSubMenuForMenuItem (menuItem);
	    if (subMenu.hasClass ("closed")) {
	    	return false;
	    }

	    return true;
	};

	var toggleSubMenu = function (activeMenuItem) {
	    var subMenu = getSubMenuForMenuItem (activeMenuItem);
	    subMenu.toggleClass ("closed");
	};

	var selectElement = function (elementToSelect) {
	    jQuery (elementToSelect).addClass ("focussed");
	};

	var unselectElement = function (selectedElement) {
		jQuery (selectedElement).removeClass ("focussed");

		// Close the submenu before moving on.
		if (isSubMenuOpen (selectedElement)) {
		   toggleSubMenu (selectedElement);
		}
	};

	var activateMenuItemHandler = function (menuItem, event) {
		alert (jQuery (menuItem).text () + " was activated.");
	};

    var selectionHandlers = {
       willSelect: selectElement,
       willUnselect: unselectElement,
       // Dummy handler works around a problem where, when focus moves to a child menu,
       // the menu deactivates itself.
       willLeaveContainer: function (selectedElement) { }
    };

	var initializeMenuBar = function (menuBarId) {
	   var menuBar = jQuery("#" + menuBarId);
       // Make sure the menu bar is in the tab order.
       fluid.access.makeTabFocussable (menuBar);

       // Make the top-level menu items selectable. Upon activation, toggle their sub menu visibility.
       var topLevelOptions = {
           direction: fluid.access.HORIZONTAL
       };

       var activationOptions = {
           additionalActivationKeys: [fluid.access.keys.DOWN]
       };

       var topLevelMenuItems = jQuery("#menubar > li");
       fluid.access.makeSelectable(menuBar, topLevelMenuItems, selectionHandlers, topLevelOptions);
       fluid.access.makeActivatable (topLevelMenuItems, toggleSubMenu, activationOptions);
	};

    var initializeMenus = function (menuBar) {
        // Make the sub menus selectable with up/down arrow keys and activatable with Enter & Space.
        var subMenuOptions = {
            direction: fluid.access.VERTICAL,
            shouldSelectOnFocus: false
        };

        var fileMenu = jQuery("#fileMenu");
        var fileSubMenuItems = jQuery("a", fileMenu);
        fluid.access.makeSelectable(fileMenu, fileSubMenuItems, selectionHandlers, subMenuOptions);
        fluid.access.makeActivatable(fileSubMenuItems, activateMenuItemHandler);

        var editMenu = jQuery("#editMenu");
        var editSubMenuItems = jQuery("a", editMenu);
        fluid.access.makeSelectable(editMenu, editSubMenuItems, selectionHandlers, subMenuOptions);
        fluid.access.makeActivatable(editSubMenuItems, activateMenuItemHandler);
    };

    return {
        initializeMenuBar: function (menuBarId) {
            initializeMenuBar (menuBarId);
            initializeMenus ();
        }
    }; // End public return.
}(); // End fluid.accessiblemenubar namespace.
