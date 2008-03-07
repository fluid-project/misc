(function () {
    var keyboardA11y = new jqUnit.TestCase ("keyboard-a11y");

    // Constants.
    var PAGE_CONTENTS_SEL = "#pageContents";
    var MENU_SEL = "#menuNoTabIndex";
    var MENU_ITEM_SEL = "#menuItem0,#menuItem1,#menuItem2";
    var FIRST_MENU_ITEM_SEL = "#menuItem0";
    var SECOND_MENU_ITEM_SEL = "#menuItem1";
    var LAST_MENU_ITEM_SEL = "#menuItem2";
    var NON_ITEM_SEL = "#notAMenuItem";
    var LINK_BEFORE_SEL = "#linkBefore";
    var LINK_AFTER_SEL = "#linkAfter";

    // Helper functions.
    var setupHandlers = function () {
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
    };

    var makeMenuSelectable = function (additionalOptions) {
        var selectionOptions = {
            orientation: jQuery.a11y.orientation.HORIZONTAL
        };
        // Mix in any additional options.
        var mergedOptions = jQuery.extend (selectionOptions, additionalOptions);

        var menuContainer = jQuery (MENU_SEL);
        var menuItems = menuContainer.children (MENU_ITEM_SEL);

        // Make the container tab focussable and the children selectable.
        menuContainer.tabbable ();
        var handlers = setupHandlers ();
        menuItems.selectable (menuContainer, handlers, mergedOptions);

        return {
            container: menuContainer,
            items: menuItems,
            handlers: handlers
        };
    };

    var createAndFocusMenu = function (selectionOptions) {
        var menu = makeMenuSelectable (selectionOptions);
        menu.container.focus ();

        // Sanity check.
        if (!selectionOptions || selectionOptions.shouldSelectOnFocus) {
            keyboardA11y.assertSelected (getFirstMenuItem ());
        } else {
            keyboardA11y.assertNotSelected (getFirstMenuItem ());
        }
        keyboardA11y.assertNotSelected (getSecondMenuItem ());
        keyboardA11y.assertNotSelected (getThirdMenuItem ());

        return menu;
    };

    var createActivatableMenu = function () {
        var menu = createAndFocusMenu ();
        menu.items.activatable (function (element) {
            menu.activatedItem = element;
        });

        // Sanity check.
        jqUnit.assertUndefined ("The menu wasActivated flag should be undefined to start.", menu.wasActivated);

        return menu;
    };

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

    function selectMiddleChildThenLeaveAndRefocus (menu) {
        // Select the middle child.
        menu.items.selectNext ();
        keyboardA11y.assertSelected (getSecondMenuItem ());

        // Move focus to another element altogether.
        getSecondMenuItem ().blur ();
        var link = jQuery (LINK_AFTER_SEL);
        link.focus ();
        keyboardA11y.assertNothingSelected ();

        // Move focus back to the menu.
        menu.container.focus ();
    }

    function getFirstMenuItem () {
        return jQuery (FIRST_MENU_ITEM_SEL);
    }

    function getSecondMenuItem () {
        return jQuery (SECOND_MENU_ITEM_SEL);
    }

    function getLastMenuItem () {
        return jQuery (LAST_MENU_ITEM_SEL);
    }

    function getThirdMenuItem () {
        return getLastMenuItem ();
    }

    // Mix in additional test-specific asserts.
    var extraAsserts = {
        assertNothingSelected: function () {
            this.assertNotSelected (getFirstMenuItem ());
            this.assertNotSelected (getSecondMenuItem ());
            this.assertNotSelected (getThirdMenuItem ());
        },

        assertSelected: function (element) {
            jqUnit.assertTrue ("A selected element should have the selected class.", jQuery(element).hasClass ("selected"));
        },

        assertNotSelected: function (element) {
            jqUnit.assertFalse ("An unselected element should not have the selected class.", jQuery(element).hasClass ("selected"));
        },

        assertFirstMenuItemIsSelectedOnFocus: function (menu) {
            // First, check that nothing is selected before we focus the menu.
            this.assertNothingSelected ();

            // Then focus the menu container and check that the first item is actually selected.
            menu.container.focus ();
            this.assertSelected (getFirstMenuItem ());
        }
    };
    jQuery.extend (keyboardA11y, extraAsserts);

    jqUnit.test("tabbable ()", function () {
        jqUnit.expect (4);
        // Test an element that has no tabindex set.
        var element = jQuery (MENU_SEL);
        element.tabbable ();
        jqUnit.assertEquals ("A tabindex of 0 should have been added.", 0, element.tabindex ());

        // Test an element that already has a tabindex of 0. It should still be there.
        element = jQuery ("#containerWithExisting0TabIndex");
        element.tabbable ();
        jqUnit.assertEquals ("Tabindex should still be 0.", 0, element.tabindex ());

        // Test an element that has a positive tabindex. It should remain as-is.
        element = jQuery ("#containerWithExistingPositiveTabIndex");
        element.tabbable ();
        jqUnit.assertEquals ("Tabindex should remain 1.", 1, element.tabindex ());

        // Test an element that has a negative tabindex. It should be reset to 0.
        element = jQuery ("#containerWithExistingNegativeTabIndex");
        element.tabbable ();
        jqUnit.assertEquals ("Tabindex should be reset to 0.", 0, element.tabindex ());
    });

    jqUnit.test ("selectable() sets correct tabindexes", function () {
        var menuContainer = jQuery (MENU_SEL);
        var menuItems = menuContainer.children (MENU_ITEM_SEL);

        // Sanity check.
        jqUnit.assertEquals ("There should be three selectable menu items", 3, menuItems.length);

        // Make them selectable; don't worry about direction or custom handlers for now.
        menuItems.selectable (menuContainer, null, null);

        // Ensure their tabindexes are set to -1, regardless of previous values
        menuItems.each (function (index, item) {
            jqUnit.assertEquals ("Each menu item should have a tabindex of -1", -1, jQuery (item).tabindex ());
        });

        // Just in case, check that the non-selectable child does not have its tabindex set.
        var nonSelectableItem = jQuery (NON_ITEM_SEL);
        jqUnit.assertFalse (nonSelectableItem.hasTabindex ());
    });

    jqUnit.test ("Selects first item when container is focusssed by default", function () {
        // Don't specify any options, just use the default behaviour.
        var menu = makeMenuSelectable();
        keyboardA11y.assertFirstMenuItemIsSelectedOnFocus (menu);
    });

    jqUnit.test ("Selects first item when container is focussed--explicit argument", function () {
        // Explicitly set the selectFirstItemOnFocus option.
        var options = {
            shouldSelectOnFocus: true
        };
        var menu = makeMenuSelectable(options);
        keyboardA11y.assertFirstMenuItemIsSelectedOnFocus (menu);
    });

    jqUnit.test ("Doesn't select first item when container is focussed--boolean arg", function () {
        var options = {
            shouldSelectOnFocus: false
        };

        var menu = makeMenuSelectable(options);
        // First check that nothing is selected before we focus the menu.
        keyboardA11y.assertNothingSelected ();

        // Then focus the container. Nothing should still be selected.
        menu.container.focus ();
        keyboardA11y.assertNothingSelected ();

        // Now call selectNext () and assert that the first item is focussed.
        menu.items.selectNext ();
        keyboardA11y.assertSelected(getFirstMenuItem ());
    });

    jqUnit.test ("Doesn't select first item when container is focussed--function arg", function () {
        // Pass in a function that will be called to determine if the first item should be focussed.
        var shouldSelectOnFocus = function () {
            return false;
        };

        var options = {
            shouldSelectOnFocus: shouldSelectOnFocus
        };

        var menu = makeMenuSelectable(options);

        // First check that nothing is selected before we focus the menu.
        keyboardA11y.assertNothingSelected ();

        // Then focus the container.
        // Nothing should still be selected because our predicate function always returns false.
        menu.container.focus ();
        keyboardA11y.assertNothingSelected ();
    });

    jqUnit.test ("select()", function () {
        var menu = createAndFocusMenu ();

        // Select the third item and ensure it was actually selected.
        menu.items.select (getThirdMenuItem ());
        keyboardA11y.assertSelected (getThirdMenuItem ());
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertNotSelected (getSecondMenuItem ());

        // Now select the second.
        menu.items.select (getSecondMenuItem ());
        keyboardA11y.assertSelected (getSecondMenuItem ());
        keyboardA11y.assertNotSelected (getThirdMenuItem ());
    });

    // Checks behaviour when a user attempts to select something that wasn't initially denoted as selectable.
    jqUnit.test ("Doesn't select non-selectables", function () {
        var menu = createAndFocusMenu ();

        // Try selecting something that isn't selectable. Assume things stay the same.
        var nonSelectable = jQuery (NON_ITEM_SEL);
        menu.items.select (nonSelectable);
        keyboardA11y.assertNotSelected (nonSelectable);
        keyboardA11y.assertSelected (getFirstMenuItem ());
    });

    jqUnit.test ("Allows selection via programmatic focus() calls.", function () {
        // Setup a menu, then programmatically throw focus onto the selectables. They should be correctly selected.
        var options = {
            shouldSelectOnFocus: false
        };
        var menu = createAndFocusMenu (options);

        // Programmatically throw focus onto the first menu item. It should be selected.
        getThirdMenuItem ().focus ();
        keyboardA11y.assertSelected (getThirdMenuItem ());
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertNotSelected (getSecondMenuItem ());

        // Now try another. It should still work.
        getFirstMenuItem ().focus ();
        keyboardA11y.assertSelected (getFirstMenuItem ());
        keyboardA11y.assertNotSelected (getSecondMenuItem ());
        keyboardA11y.assertNotSelected (getThirdMenuItem ());

        // Now switch to selection via the plugin API. It should know the current state.
        menu.items.selectNext ();
        keyboardA11y.assertSelected (getSecondMenuItem ());
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertNotSelected (getThirdMenuItem ());

        // And finally, switch back to programmatically calling focus.
        getThirdMenuItem ().focus ();
        keyboardA11y.assertSelected (getThirdMenuItem ());
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertNotSelected (getSecondMenuItem ());
    });

    jqUnit.test ("selectNext()", function () {
        var menu = createAndFocusMenu ();

        // Select the next item.
        menu.items.selectNext ();

        // Check that the previous item is no longer selected and that the next one is.
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertSelected (getSecondMenuItem ());
        keyboardA11y.assertNotSelected (getThirdMenuItem ());
    });

    jqUnit.test ("selectPrevious()", function () {
        var menu = createAndFocusMenu ();

        // Select the next item.
        menu.items.selectNext ();
        keyboardA11y.assertSelected (getSecondMenuItem ());
        menu.items.selectPrevious ();

        // Check that the second item is no longer selected and that the first one is.
        keyboardA11y.assertNotSelected (getSecondMenuItem ());
        keyboardA11y.assertSelected (getFirstMenuItem ());
    });

    jqUnit.test ("selectNext() with wrapping", function () {
        var menu = makeMenuSelectable();
        menu.container.focus ();

        // Invoke selectNext twice. We should be on the last item.
        for (var x = 0; x < 2; x++) {
            menu.items.selectNext ();
        }
        keyboardA11y.assertSelected (getLastMenuItem ());

        // Now invoke it again. We should be back at the top.
        menu.items.selectNext ();
        keyboardA11y.assertSelected (getFirstMenuItem ());
    });

    jqUnit.test ("selectPrevious() with wrapping", function () {
        var menu = createAndFocusMenu ();

        // Select the previous element.
        menu.items.selectPrevious ();

        // Since we're at the beginning, we should wrap to the last.
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertSelected (getLastMenuItem ());
    });

    jqUnit.test ("Focus persists after leaving container", function () {
        var menu = createAndFocusMenu ();
        selectMiddleChildThenLeaveAndRefocus (menu)

        // Ensure that the middle child still has focus.
        keyboardA11y.assertSelected (getSecondMenuItem ());
        keyboardA11y.assertNotSelected (getFirstMenuItem ());
        keyboardA11y.assertNotSelected (getThirdMenuItem ());
    });

    jqUnit.test ("Selection is cleaned up upon blur", function () {
        var menu = createAndFocusMenu ();

        // Move focus to another element altogether.
        // Need to simulate browser behaviour by calling blur on the selected item, which is scary.
        var link = jQuery (LINK_AFTER_SEL);
        jQuery (menu.items.currentSelection ()).blur ();
        link.focus ();

        // Now check to see that the item isn't still selected once we've moved focus off the widget.
        keyboardA11y.assertNotSelected (getFirstMenuItem ());

        // And just to be safe, check that nothing is selected.
        keyboardA11y.assertNothingSelected ();
    });

    jqUnit.test ("activate()", function () {
        // Tests that we can programmatically activate elements with the default handler.
        var menu = createActivatableMenu ();
        menu.items.activate (getFirstMenuItem ());
        jqUnit.assertEquals ("The menu.activatedItem should be set to the first item.", getFirstMenuItem ()[0], menu.activatedItem);

        menu.items.activate (getThirdMenuItem ());
        jqUnit.assertEquals ("The menu.activatedItem should be set to the third item.", getThirdMenuItem ()[0], menu.activatedItem);
    });

    jqUnit.test ("activate with Enter key", function () {
        // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
        if (!jQuery.browser.mozilla) {
            return;
        }

        var menu = createActivatableMenu ();
        simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.ENTER);
        jqUnit.assertEquals ("The menu.activatedItem should be set to the first item.", getFirstMenuItem ()[0], menu.activatedItem);
    });

    jqUnit.test ("activate with Spacebar", function () {
        // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
        if (!jQuery.browser.mozilla) {
            return;
        }

        var menu = createActivatableMenu ();
        simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.SPACE);
        jqUnit.assertEquals ("The menu.activatedItem should be set to the first item.", getFirstMenuItem ()[0], menu.activatedItem);
    });

    jqUnit.test ("One custom activate binding", function () {
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

        var menu = createAndFocusMenu ();
        menu.items.activatable (defaultActivate, options);

        simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.DOWN);
        jqUnit.assertNotUndefined ("The menu should have been activated by the down arrow key.", menu.wasActivated);
        jqUnit.assertTrue ("The menu should have been activated by the down arrow key.", menu.wasActivated);
    });

    jqUnit.test ("Multiple custom activate bindings", function () {
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
        var menu = createAndFocusMenu ();
        menu.items.activatable (defaultActivate, options);

        // Test that the down arrow works.
        simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.DOWN);
        jqUnit.assertNotUndefined ("The menu should have been activated by the down arrow key.", menu.wasActivated);
        jqUnit.assertTrue ("The menu should have been activated by the down arrow key.", menu.wasActivated);

        // Reset and try the other key map.
        menu.wasActivated = false;
        simulateKeyDown (getFirstMenuItem (), jQuery.a11y.keys.UP, jQuery.a11y.keys.CTRL);
        jqUnit.assertNotUndefined ("The menu should have been activated by the ctrl key.", menu.wasActivated);
        jqUnit.assertEquals ("The menu should have been activated by the ctrl key.", "foo", menu.wasActivated);
    });

    jqUnit.test ("currentSelection", function () {
        var menu = createAndFocusMenu ();
        menu.items.selectNext ();
        var secondMenuItem = getSecondMenuItem ();
        keyboardA11y.assertSelected (secondMenuItem);
        var selectedItem = menu.items.currentSelection ();
        jqUnit.ok ("The current selection should be a jQuery instance.", selectedItem.jQuery);
        jqUnit.assertEquals ("The current selection should be the second menu item.", secondMenuItem[0], selectedItem[0]);
    });
}) ();
