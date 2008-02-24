
function exposeTestFunctionNames () {
    return [
        "testMakeTabFocussable",
        "testMakeSelectable_TabIndexes",
        "testSelectsFirstItemOnFocusImplicit",
        "testSelectsFirstItemOnFocusExplict",
        "testDoesntSelectFirstItemOnFocus",
        "testDoesntSelectFirstItemOnFocus_Function",
        "testSelect",
        "testSelectViaProgrammaticFocus",
        "testSelectingNonSelectables",
        "testSelectNext",
        "testSelectPrevious",
        "testSelectNext_Wrapping",
        "testSelectPrevious_Wrapping",
        "testPersistFocus",
        "testCleanupOnBlur",
        "testActivate",
        "testActivatableEnterKey",
        "testActivatableSpaceBar",
        "testOneCustomActivatable",
        "testMultipleCustomActivatable"
    ];
}

var KeyboardHandlersTest = {
	// Constants.
	PAGE_CONTENTS_SEL: "#pageContents",
	MENU_SEL: "#menuNoTabIndex",
	MENU_ITEM_SEL: "#menuItem0,#menuItem1,#menuItem2",
	FIRST_MENU_ITEM_SEL: "#menuItem0",
	SECOND_MENU_ITEM_SEL: "#menuItem1",
	LAST_MENU_ITEM_SEL: "#menuItem2",
	NON_ITEM_SEL: "#notAMenuItem",
	LINK_BEFORE_SEL: "#linkBefore",
	LINK_AFTER_SEL: "#linkAfter",

	// Helper functions.
	setupHandlers: function () {
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

	makeMenuSelectable: function (additionalOptions) {
        var selectionOptions = {
            direction: jQuery.a11y.directions.HORIZONTAL
        };
        // Mix in any additional options.
        var mergedOptions = jQuery.extend (selectionOptions, additionalOptions);

		var menuContainer = jQuery (KeyboardHandlersTest.MENU_SEL);
		var menuItems = menuContainer.children (KeyboardHandlersTest.MENU_ITEM_SEL);

		// Make the container tab focussable and the children selectable.
		menuContainer.tabbable ();
		var handlers = KeyboardHandlersTest.setupHandlers ();
		menuItems.selectable (menuContainer, handlers, mergedOptions);

		var selectionContext = menuItems.selectable.selectionContext;

		return {
			container: menuContainer,
			items: menuItems,
			context: selectionContext,
			handlers: handlers
		};
	},

	createAndFocusMenu: function (selectionOptions) {
        var menu = KeyboardHandlersTest.makeMenuSelectable (selectionOptions);
        menu.container.focus ();

        // Sanity check.
        if (!selectionOptions || selectionOptions.shouldSelectOnFocus) {
            assertSelected (getFirstMenuItem ());
        } else {
            assertNotSelected (getFirstMenuItem ());
        }
        assertNotSelected (getSecondMenuItem ());
        assertNotSelected (getThirdMenuItem ());

        return menu;
    },

    createActivatableMenu: function () {
        var menu = KeyboardHandlersTest.createAndFocusMenu ();
        menu.items.activatable (function (element) {
            menu.activatedItem = element;
        });

        // Sanity check.
        assertUndefined ("The menu wasActivated flag should be undefined to start.", menu.wasActivated);

        return menu;
    }
};

var setUpPageStatus;
function setUpPage () {
	// Make a deep copy of the whole document body and set it aside because jsUnit sucks.
	KeyboardHandlersTest.pageContents = jQuery (KeyboardHandlersTest.PAGE_CONTENTS_SEL).clone (true);
	setUpPageStatus = "complete";
}

function tearDown () {
	// After a test has run, swap out the current, dirty document body with the clean one.
	var pageClone = jQuery (KeyboardHandlersTest.pageContents).clone (true);
	jQuery (KeyboardHandlersTest.PAGE_CONTENTS_SEL).replaceWith (pageClone);
}

function testMakeTabFocussable () {
	// Test an element that has no tabindex set.
	var element = jQuery (KeyboardHandlersTest.MENU_SEL);
	element.tabbable ();
	assertEquals ("A tabindex of 0 should have been added.", 0, element.tabindex ());

	// Test an element that already has a tabindex of 0. It should still be there.
	element = jQuery ("#containerWithExisting0TabIndex");
	element.tabbable ();
	assertEquals ("Tabindex should still be 0.", 0, element.tabindex ());

	// Test an element that has a positive tabindex. It should remain as-is.
	element = jQuery ("#containerWithExistingPositiveTabIndex");
	element.tabbable ();
	assertEquals ("Tabindex should remain 1.", 1, element.tabindex ());

	// Test an element that has a negative tabindex. It should be reset to 0.
	element = jQuery ("#containerWithExistingNegativeTabIndex");
	element.tabbable ();
	assertEquals ("Tabindex should be reset to 0.", 0, element.tabindex ());
}

function testMakeSelectable_TabIndexes () {
	var menuContainer = jQuery (KeyboardHandlersTest.MENU_SEL);
	var menuItems = menuContainer.children (KeyboardHandlersTest.MENU_ITEM_SEL);

	// Sanity check.
	assertEquals ("There should be three selectable menu items", 3, menuItems.length);

	// Make them selectable; don't worry about direction or custom handlers for now.
	menuItems.selectable (menuContainer, null, null);

	// Ensure their tabindexes are set to -1, regardless of previous values
	menuItems.each (function (index, item) {
		assertEquals ("Each menu item should have a tabindex of -1", -1, jQuery (item).tabindex ());
	});

	// Just in case, check that the non-selectable child does not have its tabindex set.
	var nonSelectableItem = jQuery (KeyboardHandlersTest.NON_ITEM_SEL);
	assertFalse (nonSelectableItem.hasTabindex ());
}

function testSelectsFirstItemOnFocusImplicit () {
	// Don't specify any options, just use the default behaviour.
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	assertFirstMenuItemIsSelectedOnFocus (menu);
}

function testSelectsFirstItemOnFocusExplict () {
	// Explicitly set the selectFirstItemOnFocus option.
	var options = {
		shouldSelectOnFocus: true
	};
	var menu = KeyboardHandlersTest.makeMenuSelectable(options);
	assertFirstMenuItemIsSelectedOnFocus (menu);
}

function assertFirstMenuItemIsSelectedOnFocus (menu) {
	// First, check that nothing is selected before we focus the menu.
	assertNothingSelected ();

	// Then focus the menu container and check that the first item is actually selected.
	menu.container.focus ();
	assertSelected (getFirstMenuItem ());
}

function assertNothingSelected () {
	assertNotSelected (getFirstMenuItem ());
	assertNotSelected (getSecondMenuItem ());
	assertNotSelected (getThirdMenuItem ());
}

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

	// Now call selectNext () and assert that the first item is focussed.
	menu.items.selectNext ();
	assertSelected(getFirstMenuItem ());
}

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
}

function testSelect () {
    var menu = KeyboardHandlersTest.createAndFocusMenu ();

    // Select the third item and ensure it was actually selected.
    menu.items.select (getThirdMenuItem ());
    assertSelected (getThirdMenuItem ());
    assertNotSelected (getFirstMenuItem ());
    assertNotSelected (getSecondMenuItem ());

    // Now select the second.
    menu.items.select (getSecondMenuItem ());
    assertSelected (getSecondMenuItem ());
    assertNotSelected (getThirdMenuItem ());
}

// Checks behaviour when a user attempts to select something that wasn't initially denoted as selectable.
function testSelectingNonSelectables () {
    var menu = KeyboardHandlersTest.createAndFocusMenu ();

    // Try selecting something that isn't selectable. Assume things stay the same.
    var nonSelectable = jQuery (KeyboardHandlersTest.NON_ITEM_SEL);
    menu.items.select (nonSelectable);
    assertNotSelected (nonSelectable);
    assertSelected (getFirstMenuItem ());
}

function testSelectViaProgrammaticFocus () {
    // Setup a menu, then programmatically throw focus onto the selectables. They should be correctly selected.

    var options = {
        shouldSelectOnFocus: false
    };
    var menu = KeyboardHandlersTest.createAndFocusMenu (options);

    // Programmatically throw focus onto the first menu item. It should be selected.
    getThirdMenuItem ().focus ();
    assertSelected (getThirdMenuItem ());
    assertNotSelected (getFirstMenuItem ());
    assertNotSelected (getSecondMenuItem ());

    // Now try another. It should still work.
    getFirstMenuItem ().focus ();
    assertSelected (getFirstMenuItem ());
    assertNotSelected (getSecondMenuItem ());
    assertNotSelected (getThirdMenuItem ());

    // Now switch to selection via the plugin API. It should know the current state.
    menu.items.selectNext ();
    assertSelected (getSecondMenuItem ());
    assertNotSelected (getFirstMenuItem ());
    assertNotSelected (getThirdMenuItem ());

    // And finally, switch back to programmatically calling focus.
    getThirdMenuItem ().focus ();
    assertSelected (getThirdMenuItem ());
    assertNotSelected (getFirstMenuItem ());
    assertNotSelected (getSecondMenuItem ());
}

function testSelectNext () {
	var menu = KeyboardHandlersTest.createAndFocusMenu ();

	// Select the next item.
	menu.items.selectNext ();

	// Check that the previous item is no longer selected and that the next one is.
	assertNotSelected (getFirstMenuItem ());
	assertSelected (getSecondMenuItem ());
	assertNotSelected (getThirdMenuItem ());
}

function testSelectPrevious () {
	var menu = KeyboardHandlersTest.createAndFocusMenu ();

	// Select the next item.
	menu.items.selectNext ();
	assertSelected (getSecondMenuItem ());
	menu.items.selectPrevious ();

	// Check that the second item is no longer selected and that the first one is.
	assertNotSelected (getSecondMenuItem ());
	assertSelected (getFirstMenuItem ());
}

function testSelectNext_Wrapping () {
	var menu = KeyboardHandlersTest.makeMenuSelectable();
	menu.container.focus ();

	// Invoke selectNext twice. We should be on the last item.
	for (var x = 0; x < 2; x++) {
		menu.items.selectNext ();
	}
	assertSelected (getLastMenuItem ());

	// Now invoke it again. We should be back at the top.
	menu.items.selectNext (menu.context, menu.handlers);
	assertSelected (getFirstMenuItem ());
}

function testSelectPrevious_Wrapping () {
    var menu = KeyboardHandlersTest.createAndFocusMenu ();

	// Select the previous element.
	menu.items.selectPrevious ();

	// Since we're at the beginning, we should wrap to the last.
	assertNotSelected (getFirstMenuItem ());
	assertSelected (getLastMenuItem ());
}

function selectMiddleChildThenLeaveAndRefocus (menu) {
    // Select the middle child.
    menu.items.selectNext ();
    assertSelected (getSecondMenuItem ());

    // Move focus to another element altogether.
    getSecondMenuItem ().blur ();
    var link = jQuery (KeyboardHandlersTest.LINK_AFTER_SEL);
    link.focus ();
    assertNothingSelected ();

    // Move focus back to the menu.
    menu.container.focus ();
}

function testPersistFocus () {
	var menu = KeyboardHandlersTest.createAndFocusMenu ();
    selectMiddleChildThenLeaveAndRefocus (menu)

	// Ensure that the middle child still has focus.
	assertSelected (getSecondMenuItem ());
}

function testCleanupOnBlur () {
	var menu = KeyboardHandlersTest.createAndFocusMenu ();

	// Move focus to another element altogether.
	// Need to simulate browser behaviour by calling blur on the selected item, which is scary.
	var link = jQuery (KeyboardHandlersTest.LINK_AFTER_SEL);
	jQuery (menu.context.activeItem).blur ();
	link.focus ();

	// Now check to see that the item isn't still selected once we've moved focus off the widget.
	assertNotSelected (getFirstMenuItem ());

	// And just to be safe, check that nothing is selected.
	assertNothingSelected ();
}

function testActivate () {
    // Tests that we can programmatically activate elements with the default handler.
    var menu = KeyboardHandlersTest.createActivatableMenu ();
    menu.items.activate (getFirstMenuItem ());
    assertEquals ("The menu.activatedItem should be set to the first item.", getFirstMenuItem ()[0], menu.activatedItem);

    menu.items.activate (getThirdMenuItem ());
    assertEquals ("The menu.activatedItem should be set to the third item.", getThirdMenuItem ()[0], menu.activatedItem);
}

function testActivatableEnterKey () {
    // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
    if (!jQuery.browser.mozilla) {
        return;
    }

    var menu = KeyboardHandlersTest.createActivatableMenu ();
    simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.ENTER);
    assertEquals ("The menu.activatedItem should be set to the first item.", getFirstMenuItem ()[0], menu.activatedItem);
}

function testActivatableSpaceBar () {
    // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
    if (!jQuery.browser.mozilla) {
        return;
    }

    var menu = KeyboardHandlersTest.createActivatableMenu ();
    simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.SPACE);
    assertEquals ("The menu.activatedItem should be set to the first item.", getFirstMenuItem ()[0], menu.activatedItem);
}

function testOneCustomActivatable () {
    // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
    if (!jQuery.browser.mozilla) {
        return;
    }

    var defaultActivate = function (element) {
        menu.wasActivated = false;
    };

    var alternateActivate = function (element) {
        menu.wasActivated = true;
    };

    var downKeyBinding = {
        modifier: null,
        key: jQuery.a11y.keys.DOWN,
        activateHandler: alternateActivate
    };

    var options = {
        additionalBindings: downKeyBinding
    };

    var menu = KeyboardHandlersTest.createAndFocusMenu ();
    menu.items.activatable (defaultActivate, options);

    simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.DOWN);
    assertNotUndefined ("The menu should have been activated by the down arrow key.", menu.wasActivated);
    assertTrue ("The menu should have been activated by the down arrow key.", menu.wasActivated);
}

function testMultipleCustomActivatable () {
    // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
    if (!jQuery.browser.mozilla) {
        return;
    }

    // Define additional key bindings.
    var downBinding = {
        key: jQuery.a11y.keys.DOWN,
        activateHandler:  function (element) {
            menu.wasActivated = true;
        }
    };

    var upBinding = {
        modifier: jQuery.a11y.keys.CTRL,
        key: jQuery.a11y.keys.UP,
        activateHandler: function (element) {
            menu.wasActivated = "foo";
        }
    };

    var defaultActivate = function () {
        menu.wasActivated = false;
    }

    var options = {
        additionalBindings: [downBinding, upBinding]
    };

    // Set up the menu.
    var menu = KeyboardHandlersTest.createAndFocusMenu ();
    menu.items.activatable (defaultActivate, options);

    // Test that the down arrow works.
    simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.DOWN);
    assertNotUndefined ("The menu should have been activated by the down arrow key.", menu.wasActivated);
    assertTrue ("The menu should have been activated by the down arrow key.", menu.wasActivated);

    // Reset and try the other key map.
    menu.wasActivated = false;
    simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.UP, jQuery.a11y.keys.CTRL);
    assertNotUndefined ("The menu should have been activated by the ctrl key.", menu.wasActivated);
    assertEquals ("The menu should have been activated by the ctrl key.", "foo", menu.wasActivated);
}

function simulateKeyDown (onElement, withKeycode, modifier) {
    var modifiers = {
        ctrl: (modifier === jQuery.a11y.keys.CTRL) ? true : false,
        shift: (modifier === jQuery.a11y.keys.SHIFT) ? true : false,
        alt: (modifier === jQuery.a11y.keys.ALT) ? true : false
    };

    var keyEvent = document.createEvent ("KeyEvents")
    keyEvent.initKeyEvent ("keydown", true, true, window, modifiers.ctrl, modifiers.alt, modifiers.shift, false, withKeycode, 0);

    if (onElement.jquery) {
        onElement = onElement[0];
    }

    onElement.dispatchEvent (keyEvent);
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
