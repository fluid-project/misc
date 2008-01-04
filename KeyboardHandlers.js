var fluid = fluid || {};

fluid.access = function () {
    // Private functions.
    var focusLeftContainerHandler = function (userHandlers) {
        return function (evt) {
            if (userHandlers.willLeaveContainer) {
                userHandlers.willLeaveContainer (evt.target);
            } else if (userHandlers.willUnselect) {
                userHandlers.willUnselect (evt.target);
            }

            return false;
        };
    };

    var doSelection = function (selectionContext, elementToSelect, userHandlers) {
        // If something else is already selected, unselect it first.
        if (selectionContext.activeItem && (selectionContext.activeItem != elementToSelect)) {
            fluid.access.eraseSelection (selectionContext.activeItem, userHandlers.willUnselect);
        }

        // Select the new element.
        selectionContext.activeItem = elementToSelect;
        fluid.access.drawSelection (elementToSelect, userHandlers.willSelect);

        // Bind a one-off blur handler to clean up if focus leaves the container altogether.
        jQuery (elementToSelect).one ("blur", focusLeftContainerHandler(userHandlers));
    };

    var activationHandler = function (userActivateHandler) {
        return function (evt) {
            if (evt.which === fluid.access.keys.ENTER || evt.which === fluid.access.keys.SPACE) {
                if (userActivateHandler) {
                    userActivateHandler (evt.target);
                }

                return false;
            }
        };
    };

    var arrowKeyHandler = function (selectionContext, keyMap, userHandlers) {
        return function (evt) {
            if (evt.which === keyMap.next) {
                fluid.access.selectNext (selectionContext, userHandlers);
                return false;
            } else if (evt.which === keyMap.previous) {
                fluid.access.selectPrevious (selectionContext, userHandlers);
                return false;
            }
        };
    };

    var getKeyMapForDirection = function (direction) {
        // Determine the appropriate mapping for next and previous based on the specified direction.
        var keyMap;
        if (direction === fluid.access.HORIZONTAL) {
            keyMap = fluid.access.LEFT_RIGHT_KEYMAP;
        } else {
            // Assume vertical in any other case.
            keyMap = fluid.access.UP_DOWN_KEYMAP;
        }

        return keyMap;
    };

    var addContainerFocusHandler = function (selectionContext, container, userHandlers, shouldSelectOnFocus) {
        var focusHandler;
        if (shouldSelectOnFocus.constructor === Function) {
            focusHandler = function (evt) {
                selectOnFocus (shouldSelectOnFocus (), evt.target, selectionContext, container, userHandlers);
            }
        } else {
            focusHandler = function (evt) {
                selectOnFocus (shouldSelectOnFocus, evt.target, selectionContext, container, userHandlers);
            }
        }

        container.focus (focusHandler);
    };

    var selectOnFocus = function (shouldSelect, target, selectionContext, container, userHandlers) {
        if (shouldSelect && (target === container.get(0))) {
            if (!selectionContext.activeItem) {
                // If there isn't already an active item, call selectNextElement to get it.
                fluid.access.selectNext (selectionContext, userHandlers);
            } else {
                // Otherwise just re-focus what we've got.
                doSelection (selectionContext, selectionContext.activeItem, userHandlers);
            }

            return false;
        }
    };

    var keys = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32,
        ENTER: 13,
        TAB: 9
    };

    // Public members.
    return {
        // Useful constants.
        keys: keys,

        HORIZONTAL: "horizontal",

        VERTICAL: "vertical",

        UP_DOWN_KEYMAP: {
                next: keys.DOWN,
                previous: keys.UP
        },

        LEFT_RIGHT_KEYMAP: {
            next: keys.RIGHT,
            previous: keys.LEFT
        },

        /**
         * Makes the specified elements available in the tab order by setting its tabindex to "0".
         */
        makeTabFocussable: function (elements) {
            // If the element doesn't have a tabindex, or has one set to a negative value, set it to 0.
            jQuery (elements).each (function (idx, element) {
                jElement = jQuery (element);
                if (!jElement.hasTabIndex () || (jElement.tabIndex () < 0)) {
                    jElement.tabIndex (0);
                }
            });
        },

        /**
         * Allows the the specified elements to be activated with the Space and Enter keys.
         * Provide your own onActivateHandler for custom behaviour.
         */
        makeActivatable: function (elements, onActivateHandler) {
            jQuery (elements).keydown (activationHandler (onActivateHandler));
        },

        /**
         * Makes the specified elements selectable with the arrow keys.
         * Supply your own handlers object with willSelect: and willUnselect: properties for custom behaviour.
         * Options provide configurability, including direction: and shouldSelectOnFocus:
         * Currently supported directions are fluid.access.HORIZONTAL and VERTICAL.
         */
        makeSelectable: function (container, selectableElements, handlers, options) {
            // Create empty an handlers and use default options where not specified.
            handlers = handlers || {};
            var mergedOptions = jQuery.extend ({}, this.defaults, options);

            var keyMap = getKeyMapForDirection (mergedOptions.direction);
            var jContainer = jQuery (container);
            var jSelectables = jQuery (selectableElements);

            // Context stores the currently active item (undefined to start) and list of selectables.
            var selectionContext = {
                activeItem: undefined,
                selectables: jSelectables
            };

            // Add various handlers to the container.
            jContainer.keydown (arrowKeyHandler (selectionContext, keyMap, handlers));
            addContainerFocusHandler (selectionContext, jContainer, handlers, mergedOptions.shouldSelectOnFocus);

            // Remove selectables from the tab order.
            jSelectables.tabIndex(-1);

            return selectionContext;
        },

        /**
         * Actually does the work of selecting an element. Can be overridden for custom behaviour.
         */
        drawSelection: function (elementToSelect, handler) {
            if (handler) {
                handler (elementToSelect);
            }

            elementToSelect.focus ();
        },

        /**
         * Does does the work of unselecting an element. Can be overridden for custom behaviour.
         */
        eraseSelection: function (selectedElement, handler) {
            if (handler) {
                handler (selectedElement);
            }

            selectedElement.blur ();
        },

        selectNext: function (selectionContext, userHandlers) {
            var elements = selectionContext.selectables;
            var indexOfCurrentSelection;
            if (!selectionContext.activeItem) {
                indexOfCurrentSelection = -1;
            } else {
                indexOfCurrentSelection = elements.index (selectionContext.activeItem);
            }

            var nextIndex =  indexOfCurrentSelection + 1;
            if (nextIndex >= elements.length) {
                // Wrap around to the beginning.
                nextIndex = 0;
            }

            elementToSelect = elements[nextIndex];

            return doSelection (selectionContext, elementToSelect, userHandlers);
        },

        selectPrevious: function (selectionContext, userHandlers) {
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

            elementToSelect =  elements[previousIndex];

            return doSelection (selectionContext, elementToSelect, userHandlers);
        },

        defaults: {
            direction: this.VERTICAL,
            shouldSelectOnFocus: true
        }
    }; // End of public return.
}(); // End of fluid.access namespace.
