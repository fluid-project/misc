var fluid = fluid || {};

fluid.access = function () {
    // Private functions.
    
    var doSelection = function (selectionContext, elementFinder, handlers) {
    	var currentlySelectedElement = selectionContext.activeItem;
    	
	    // If something is already selected, unselect it first.
	    if (currentlySelectedElement) {
	        fluid.access.unselectElement (currentlySelectedElement, handlers.blur);
	    }
	    
	    // Find the element and select it.
	    var elementToSelect = elementFinder (currentlySelectedElement, selectionContext.selectables);
	    fluid.access.selectElement (elementToSelect, handlers.focus);
	    selectionContext.activeItem = elementToSelect;    
	};
	
	var selectNextElement = function (selectionContext, handlers) {		
		var elements = selectionContext.selectables;
	    var findNext = function () {
	        var nextIndex = elements.index (selectionContext.activeItem) + 1;
	        if (nextIndex >= elements.length) {
	            // Wrap around to the beginning.
	            nextIndex = 0;
	        }
	        
	        return elements[nextIndex];
	    };
	
	    return doSelection (selectionContext, findNext, handlers);
	};
	
	var selectPreviousElement = function (selectionContext, handlers) {
		var elements = selectionContext.selectables;
	    var findPrevious = function () {
	        var previousIndex = elements.index (selectionContext.activeItem) - 1;
	        if (previousIndex < 0) {
	            // Wrap around to the end.
	            previousIndex = elements.length - 1;
	        }
	
	        return elements[previousIndex];
	    };
	    
	    return doSelection (selectionContext, findPrevious, handlers); 
	};
	
    var activationHandler = function (onActivateHandler) {
	    return function (evt) {	    	
	        if (evt.which === fluid.access.keys.ENTER || evt.which === fluid.access.keys.SPACE) {
	            onActivateHandler (evt.target);
	            return false;
	        }
	    };
	};

	var arrowKeyHandler = function (selectionContext, keyMap, handlers) {
	    return function (evt) { 
	        if (evt.which === keyMap.next) {
	            selectNextElement (selectionContext, handlers);
	            return false;
	        } else if (evt.which === keyMap.previous) {
	            selectPreviousElement (selectionContext, handlers);
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
	
	var addContainerFocusHandler = function (selectionContext, container, userFocusHandler) {
        // Select the first item when the container first gets focus.
        var containerFocusHandler = function (evt) {
            if (evt.target === container.get(0)) {
            	var itemToSelect = selectionContext.activeItem;
              	fluid.access.selectElement (itemToSelect, userFocusHandler);
              	
              	return false;
            }         
        };
        container.focus (containerFocusHandler);
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
            jQuery (elements).attr ("tabIndex", "0");
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
         * Supply your own handlers object with focus: and blur: properties for custom behaviour.
         * Currently supported directions are fluid.access.HORIZONTAL and VERTICAL.
         */
        makeSelectable: function (container, selectableElements, direction, handlers) {
		    var keyMap = getKeyMapForDirection (direction);		    
		    var jContainer = jQuery (container);
		    var jSelectables = jQuery (selectableElements);
		    
		    // Store the currently selected element, which by default will be the first element.
		    var selectionContext = {
	    		activeItem: jSelectables[0],
	    		selectables: jSelectables
		    };
		    
		    // Add the a handler for the arrow keys.
		    jContainer.keydown (arrowKeyHandler(selectionContext, keyMap, handlers));
		    
		    // Add a handler to select the first element when the container gets focus.
		    addContainerFocusHandler (selectionContext, jContainer, handlers.focus);

		    // Add a tabindex of -1 to each selectable element so the browser can actually focus them.
		    jSelectables.attr ("tabIndex", "-1");
        },
        
        /**
         * Actually does the work of selecting an element. Can be overridden for custom behaviour.
         */
        selectElement: function (elementToSelect, handler) {
        	elementToSelect.focus ();
        	
		    if (handler) {
		        handler (elementToSelect);
		    } 		    
        },

        /**
         * Does does the work of unselecting an element. Can be overridden for custom behaviour.
         */
        unselectElement: function (selectedElement, handler) {
		    if (handler) {
		        handler (selectedElement);
		    }
		    
		    selectedElement.blur ();
        }
    }; // End of public return.
}(); // End of fluid.access namespace.

