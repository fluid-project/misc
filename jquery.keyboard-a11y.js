/*
Copyright 2007 University of Toronto

Licensed under the GNU General Public License or the MIT license.
You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the GPL and MIT License at
https://source.fluidproject.org/svn/sandbox/tabindex/trunk/LICENSE.txt
*/

(function ($) {
    // Public, static constants needed by the rest of the library.
    $.a11y = $.a11y || {};

    $.a11y.keys = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32,
        ENTER: 13,
        TAB: 9,
        CTRL: 17,
        SHIFT: 16,
        ALT: 18
    };

    $.a11y.directions = {
        HORIZONTAL: 0,
        VERTICAL: 1,
        BOTH: 2
    };

    // Private constants.
    var UP_DOWN_KEYMAP = {
        next: $.a11y.keys.DOWN,
        previous: $.a11y.keys.UP
    };

    var LEFT_RIGHT_KEYMAP = {
        next: $.a11y.keys.RIGHT,
        previous: $.a11y.keys.LEFT
    };

    // Private functions.
    var focusLeftContainerHandler = function (userHandlers, selectionContext) {
        return function (evt) {
            if (userHandlers.willLeaveContainer) {
                userHandlers.willLeaveContainer (evt.target);
            } else if (userHandlers.willUnselect) {
                userHandlers.willUnselect (evt.target);
            }

            if (!selectionContext.rememberSelectionState) {
                selectionContext.activeItem = null;
            }

            return false;
        };
    };

    var checkForModifier = function (binding, evt) {
        // If no modifier was specified, just return true.
        if (!binding.modifier) {
            return true;
        }

        var modifierKey = binding.modifier;
        var isCtrlKeyPresent = (modifierKey && evt.ctrlKey);
        var isAltKeyPresent = (modifierKey && evt.altKey);
        var isShiftKeyPresent = (modifierKey && evt.shiftKey);

        return (isCtrlKeyPresent || isAltKeyPresent || isShiftKeyPresent);
    };

    var activationHandler = function (binding) {
        return function (evt) {
            if (evt.which === binding.key && binding.activateHandler && checkForModifier (binding, evt)) {
                binding.activateHandler (evt.target, evt);
                evt.preventDefault ();
            }
        };
    };

    /**
     * Does the work of selecting an element and delegating to the client handler.
     */
    var drawSelection = function (elementToSelect, handler) {
        if (handler) {
            handler (elementToSelect);
        }

        elementToSelect.focus ();
    };

    /**
     * Does does the work of unselecting an element and delegating to the client handler.
     */
    var eraseSelection = function (selectedElement, handler) {
        if (handler) {
            handler (selectedElement);
        }

        selectedElement.blur ();
    };

    var selectElement = function (elementToSelect, selectionContext, userHandlers) {
        // Unwrap the element if it's a jQuery.
        elementToSelect = (elementToSelect.jquery) ? elementToSelect[0] : elementToSelect;

        // Next check if the element is a selectable. If not, do nothing.
        if (selectionContext.selectables.index(elementToSelect) === -1) {
           return;
        }

        // If something else is already selected, unselect it first.
        if (selectionContext.activeItem && (selectionContext.activeItem !== elementToSelect)) {
            eraseSelection (selectionContext.activeItem, userHandlers.willUnselect);
        }

        // Select the new element.
        selectionContext.activeItem = elementToSelect;
        drawSelection (elementToSelect, userHandlers.willSelect);

        // Bind a one-off blur handler to clean up if focus leaves the container altogether.
        $ (elementToSelect).one ("blur", focusLeftContainerHandler(userHandlers, selectionContext));
    };

   var selectNextElement = function (selectionContext, userHandlers) {
        var elements = selectionContext.selectables;
        var indexOfCurrentSelection;
        if (!selectionContext.activeItem) {
            indexOfCurrentSelection = -1;
        } else {
            indexOfCurrentSelection = elements.index (selectionContext.activeItem);
        }

        var nextIndex =  indexOfCurrentSelection + 1;
        if (nextIndex >= elements.length) {
            nextIndex = 0; // Wrap around to the beginning.

        }
        var elementToSelect = elements[nextIndex];
        return selectElement (elementToSelect, selectionContext, userHandlers);
    };

    var selectPreviousElement = function (selectionContext, userHandlers) {
        var elements = selectionContext.selectables;
        var indexOfCurrentSelection;
        if (!selectionContext.activeItem) {
            indexOfCurrentSelection = 0;
        } else {
            indexOfCurrentSelection = elements.index (selectionContext.activeItem);
        }

        var previousIndex = indexOfCurrentSelection - 1;
        if (previousIndex < 0) {
            // Wrap around to the end.
            previousIndex = elements.length - 1;
        }
        var elementToSelect =  elements[previousIndex];

        return selectElement (elementToSelect, selectionContext, userHandlers);
    };

    var selectOnFocus = function (shouldSelect, target, selectionContext, container, userHandlers) {
        if (shouldSelect && (target === container.get(0))) {
            if (!selectionContext.activeItem) {
                // If there isn't already an active item, call selectNextElement to get it.
                selectNextElement (selectionContext, userHandlers);
            } else {
                // Otherwise just re-focus what we've got.
                selectElement (selectionContext.activeItem, selectionContext, userHandlers);
            }

            return false;
        }
    };

    var arrowKeyHandler = function (selectionContext, keyMap, userHandlers) {
        return function (evt) {
            if (evt.which === keyMap.next) {
                selectNextElement (selectionContext, userHandlers);
                evt.preventDefault ();
            } else if (evt.which === keyMap.previous) {
                selectPreviousElement (selectionContext, userHandlers);
                evt.preventDefault ();
            }
        };
    };

    var getKeyMapForDirection = function (direction) {
        // Determine the appropriate mapping for next and previous based on the specified direction.
        var keyMap;
        if (direction === $.a11y.directions.HORIZONTAL) {
            keyMap = LEFT_RIGHT_KEYMAP;
        } else {
            // Assume vertical in any other case.
            keyMap = UP_DOWN_KEYMAP;
        }

        return keyMap;
    };

    var addContainerFocusHandler = function (selectionContext, container, userHandlers, shouldSelectOnFocus) {
        var focusHandler;
        if (shouldSelectOnFocus.constructor === Function) {
            focusHandler = function (evt) {
                selectOnFocus (shouldSelectOnFocus (), evt.target, selectionContext, container, userHandlers);
            };
        } else {
            focusHandler = function (evt) {
                selectOnFocus (shouldSelectOnFocus, evt.target, selectionContext, container, userHandlers);
            };
        }

        container.focus (focusHandler);
    };

    var makeElementsTabFocussable = function (elements) {
        // If each element doesn't have a tabindex, or has one set to a negative value, set it to 0.
        elements.each (function (idx, item) {
            item = $ (item);
            if (!item.hasTabindex () || (item.tabindex () < 0)) {
                item.tabindex (0);
            }
        });
    };

    var makeElementsActivatable = function (elements, onActivateHandler, defaultKeys, options) {
        // Create bindings for each default key.
        var bindings = [];
        jQuery (defaultKeys).each (function (index, key) {
            bindings.push ({
                modifier: null,
                key: key,
                activateHandler: onActivateHandler
            });
        });

        // Merge with any additional key bindings.
        if (options && options.additionalBindings) {
            bindings = bindings.concat (options.additionalBindings);
        }

        // Add listeners for each key binding.
        for (var i = 0; i < bindings.length; i++) {
            var binding = bindings[i];
            elements.keydown (activationHandler (binding));
        }
    };

    var makeElementsSelectable = function (container, selectableElements, handlers, defaults, options) {
        // Create empty an handlers and use default options where not specified.
        handlers = handlers || {};
        var mergedOptions = $.extend ({}, defaults, options);

        var keyMap = getKeyMapForDirection (mergedOptions.direction);

        // Context stores the currently active item (undefined to start) and list of selectables.
        var selectionContext = {
            activeItem: undefined,
            selectables: selectableElements,
            rememberSelectionState: mergedOptions.rememberSelectionState
        };

        // Add various handlers to the container.
        container.keydown (arrowKeyHandler (selectionContext, keyMap, handlers));
        addContainerFocusHandler (selectionContext,
                                  container,
                                  handlers,
                                  mergedOptions.shouldSelectOnFocus);

        // Remove selectables from the tab order.
        selectableElements.tabindex(-1);

        return selectionContext;
    };


    // Public API.
    /**
     * Makes all matched elements available in the tab order by setting their tabindices to "0".
     */
    $.fn.tabbable = function () {
        makeElementsTabFocussable (this);
        return this;
    };

    /**
     * Makes all matched elements selectable with the arrow keys.
     * Supply your own handlers object with willSelect: and willUnselect: properties for custom behaviour.
     * Options provide configurability, including direction: and shouldSelectOnFocus:
     * Currently supported directions are jQuery.a11y.directions.HORIZONTAL and VERTICAL.
     */
    $.fn.selectable = function (container, handlers, options) {
        var ctx = makeElementsSelectable($ (container), this, handlers, this.selectable.defaults, options);

        // TODO: These need to be stored somewhere much more sensible.
        this.selectable.selectionContext = ctx;
        this.selectable.userHandlers = handlers;
        return this;
    };

    /**
     * Makes all matched elements activatable with the Space and Enter keys.
     * Provide your own hanlder function for custom behaviour.
     * Options allow you to provide a list of additionalActivationKeys.
     */
    $.fn.activatable = function (fn, options) {
        makeElementsActivatable (this, fn, this.activatable.defaults.keys, options);
        return this;
    };

    /**
     * Selects the specified element.
     */
    $.fn.select = function (elementToSelect) {
        selectElement (elementToSelect, this.selectable.selectionContext, this.selectable.userHandlers);
    };

    /**
     * Selects the next matched element.
     */
    $.fn.selectNext = function () {
        selectNextElement (this.selectable.selectionContext, this.selectable.userHandlers);
        return this;
    };

    /**
     * Selects the previous matched element.
     */
    $.fn.selectPrevious = function () {
        selectPreviousElement (this.selectable.selectionContext, this.selectable.userHandlers);
        return this;
    };

    // Public Defaults.
    $.fn.activatable.defaults = {
        keys: [$.a11y.keys.ENTER, $.a11y.keys.SPACE]
    };

    $.fn.selectable.defaults = {
        direction: this.VERTICAL,
        shouldSelectOnFocus: true,
        rememberSelectionState: true
    };
}) (jQuery);
