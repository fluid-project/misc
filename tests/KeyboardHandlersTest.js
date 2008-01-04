function exposeTestFunctionNames () {
    return [
        "testMakeTabFocussable",
        "testMakeSelectable_TabIndexes",
        "testSelectsFirstItemOnFocusImplicit",
        "testSelectsFirstItemOnFocusExplict",
        "testDoesntSelectFirstItemOnFocus",
        "testDoesntSelectFirstItemOnFocus_Function",
        "testSelectNext",
        "testSelectPrevious",
        "testSelectNext_Wrapping",
        "testSelectPrevious_Wrapping",
        "testPersistFocus",
        "testCleanupOnBlur"
    ];
}

var KeyboardHandlersTest = {
	// Constants.
	TABINDEX: "tabIndex",
	PAGE_CONTENTS_SEL: "#pageContents",
	MENU_SEL: "#menuNoTabIndex",
	MENU_ITEM_SEL: "#menuItem0,#menuItem1,#menuItem2",
	FIRST_MENU_ITEM_SEL: "#menuItem0",
	SECOND_MENU_ITEM_SEL: "#menuItem1",
	LAST_MENU_ITEM_SEL: "#menuItem2",
	NON_ITEM_SEL: "#notAMenuItem",

	// Helper functions.
	getHandlers: function () {
		var focusHandler = function (element) {
			jQuery (element).addClass ("selected");
		};

		var blurHandler = function (element) {
			jQuery (element).removeClass ("selected");
		};

		return {
			willSelect: focusHandler,
			willUnselect: blurHandler
		};
	},

	makeMenuSelectable: function (options) {
        var selectionOptions = {
            direction: fluid.access.HORIZONTAL
        };
        // Mix in any additional options.
        jQuery.extend (selectionOptions, options);

		var menuContainer = jQuery (KeyboardHandlersTest.MENU_SEL);
		var menuItems = menuContainer.children (KeyboardHandlersTest.MENU_ITEM_SEL);

		// Make the container tab focussable and the children selectable.
		fluid.access.makeTabFocussable(menuContainer);
		var handlers = KeyboardHandlersTest.getHandlers ()
		var selectionContext = fluid.access.makeSelectable(menuContainer,
														menuItems,
														handlers,
														options);

		return {
			container: menuContainer,
			items: menuItems,
			context: selectionContext,
			handlers: handlers
		}
	}
};

var setUpPageStatus;
function setUpPage () {
	// Make a deep copy of the whole document body and set it aside because jsUnit sucks.
	KeyboardHandlersTest.pageContents = jQuery (KeyboardHandlersTest.PAGE_CONTENTS_SEL).clone (true);
	setUpPageStatus = "complete";
};

function tearDown () {
	// After a test has run, swap out the current, dirty document body with the clean one.
	var pageClone = jQuery (KeyboardHandlersTest.pageContents).clone (true);
	jQuery (KeyboardHandlersTest.PAGE_CONTENTS_SEL).replaceWith (pageClone);
};

function testMakeTabFocussable () {
	// Test an element that has no tabindex set.
	var element = jQuery (KeyboardHandlersTest.MENU_SEL);
	fluid.access.makeTabFocussable(element);
	assertEquals ("A tabindex of 0 should have been added.", 0, element.tabIndex ());

	// Test an element that already has a tabindex of 0. It should still be there.
	element = jQuery ("#containerWithExisting0TabIndex");
	assertEquals ("Tabindex should still be 0.", 0, element.tabIndex ());

	// Test an element that has a positive tabindex. It should remain as-is.
	element = jQuery ("#containerWithExistingPositiveTabIndex");
	fluid.access.makeTabFocussable(element);
	assertEquals ("Tabindex should remain 1.", 1, element.tabIndex ());

	// Test an element that has a negative tabindex. It should be reset to 0.
	element = jQuery ("#containerWithExistingNegativeTabIndex");
	fluid.access.makeTabFocussable(element);
	assertEquals ("Tabindex should be reset to 0.", 0, element.tabIndex ());
};

function testMakeSelectable_TabIndexes () {
	var menuContainer = jQuery (KeyboardHandlersTest.MENU_SEL);
	var menuItems = menuContainer.children (KeyboardHandlersTest.MENU_ITEM_SEL);

	// Sanity check.
	assertEquals ("There should be three selectable menu items", 3, menuItems.length);

	// Make them selectable; don't worry about direction or custom handlers for now.
	fluid.access.makeSelectable(menuContainer, menuItems, null, null);

	// Ensure their tabindexes are set to -1, regardless of previous values
	menuItems.each (function (idx, item) {
		assertEquals ("Each menu item should have a tabindex of -1", -1, jQuery(item).tabIndex());
	});

	// Just in case, check that the non-selectable child does not have its tabindex set.
	var nonSelectableItem = jQuery (KeyboardHandlersTest.NON_ITEM_SEL);
	assertFalse (nonSelectableItem.hasTabIndex ());
};

function testSelectsFirstItemOnFocusImplicit () {
	// Don't specify any options, just use the default behaviour.
	var menu = KeyboardHandlersTest.makeMenuSelectable();

	assertFirstMenuItemIsSelectedOnFocus (menu);
;}

function testSelectsFirstItemOnFocusExplict () {
	// Explicitly set the selectFirstItemOnFocus option.
	var options = {
		shouldSelectOnFocus: true
	};
	var menu = KeyboardHandlersTest.makeMenuSelectable(options);
	assertFirstMenuItemIsSelectedOnFocus (menu);
};

function assertFirstMenuItemIsSelectedOnFocus (menu) {
	// First, check that nothing is selected before we focus the menu.
	assertNothingSelected ();

	// Then focus the menu container and check that the first item is actually selected.
	menu.container.focus ();
	assertSelected (getFirstMenuItem ());
};

function assertNothingSelected () {
	assertNotSelected (getFirstMenuItem ());
	assertNotSelected (getSecondMenuItem ());
	assertNotSelected (getThirdMenuItem ());
};

function testDoesntSelectFirstItemOnFocus () {
	var options = {
		shouldSelectOnFocus: false
	};

	var menu = KeyboardHandlersTest.makeMenuSelectable(options);
	// First check that nothing is selected before we focus the menu.
	assertNothingSelected ();

	// Then focus the container. Nothing should still be selected.
	menu.container.focus ();
	assertNothingSelected ();
};

function testDoesntSelectFirstItemOnFocus_Function () {
	// Pass in a function that will be called to determine if the first item should be focussed.
	var shouldSelectOnFocus = function () {
		return false;
	};

	var options = {
		shouldSelectOnFocus: shouldSelectOnFocus
	};

	var menu = KeyboardHandlersTest.makeMenuSelectable(options);

	// First check that nothing is selected before we focus the menu.
	assertNothingSelected ();

	// Then focus the container.
	// Nothing should still be selected because our predicate function always returns false.
	menu.container.focus ();
	assertNothingSelected ();
};

function testSelectNext () {
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	menu.container.focus ();

	// Sanity check.
	assertSelected (getFirstMenuItem ());
	assertNotSelected (getSecondMenuItem ());
	assertNotSelected (getThirdMenuItem ());

	// Select the next item.
	fluid.access.selectNext(menu.context, menu.handlers);

	// Check that the previous item is no longer selected and that the next one is.
	assertNotSelected (getFirstMenuItem ());
	assertSelected (getSecondMenuItem ());
	assertNotSelected (getThirdMenuItem ());
};

function testSelectPrevious () {
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	menu.container.focus ();

	// Sanity check.
	assertSelected (getFirstMenuItem ());
	assertNotSelected (getSecondMenuItem ());
	assertNotSelected (getThirdMenuItem ());

	// Select the next item.
	fluid.access.selectNext(menu.context, menu.handlers);
	assertSelected (getSecondMenuItem ());

	// Now select the previous item.
	fluid.access.selectPrevious(menu.context, menu.handlers);

	// Check that the second item is no longer selected and that the first one is.
	assertNotSelected (getSecondMenuItem ());
	assertSelected (getFirstMenuItem ());
};

function testSelectNext_Wrapping () {
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	menu.container.focus ();

	// Invoke selectNext twice. We should be on the last item.
	for (var x = 0; x < 2; x++) {
		fluid.access.selectNext (menu.context, menu.handlers);
	}
	assertSelected (getLastMenuItem ());

	// Now invoke it again. We should be back at the top.
	fluid.access.selectNext (menu.context, menu.handlers);
	assertSelected (getFirstMenuItem ());
};

function testSelectPrevious_Wrapping () {
	var menu = KeyboardHandlersTest.makeMenuSelectable ();
	menu.container.focus ();

	// Sanity check.
	assertSelected (getFirstMenuItem ());
	assertNotSelected (getLastMenuItem ());

	// Select the previous element.
	fluid.access.selectPrevious (menu.context, menu.handlers);

	// Since we're at the beginning, we should wrap to the last.
	assertNotSelected (getFirstMenuItem ());
	assertSelected (getLastMenuItem ());
};

function testPersistFocus () {
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	menu.container.focus ();

	// Sanity check.
	assertSelected (getFirstMenuItem ());

	// Select the middle child.
	fluid.access.selectNext(menu.context, menu.handlers);
	assertSelected (getSecondMenuItem ());

	// Move focus to another element altogether.
	var link = jQuery ("#link");
	link.focus ();

	// Move focus back to the menu.
	menu.container.focus ();

	// Ensure that the middle child still has focus.
	assertSelected (getSecondMenuItem ());
}

function testCleanupOnBlur () {
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	// Sanity check.
	menu.container.focus ();
	assertSelected (getFirstMenuItem ());

	// Move focus to another element altogether.
	// Need to simulate browser behaviour by calling blur on the selected item, which is scary.
	var link = jQuery ("#link");
	jQuery(menu.context.activeItem).blur ();
	link.focus ();

	// Now check to see that the item isn't still selected once we've moved focus off the widget.
	assertNotSelected (getFirstMenuItem ());
}

function getFirstMenuItem () {
	return jQuery (KeyboardHandlersTest.FIRST_MENU_ITEM_SEL);
}

function getSecondMenuItem () {
	return jQuery (KeyboardHandlersTest.SECOND_MENU_ITEM_SEL);
}

function getLastMenuItem () {
	return jQuery (KeyboardHandlersTest.LAST_MENU_ITEM_SEL);
}

function getThirdMenuItem () {
	return getLastMenuItem ();
}

function assertSelected (element) {
	assertTrue ("A selected element should have the selected class.", jQuery(element).hasClass ("selected"));
}

function assertNotSelected (element) {
	assertFalse ("An unselected element should not have the selected class.", jQuery(element).hasClass ("selected"));
}
