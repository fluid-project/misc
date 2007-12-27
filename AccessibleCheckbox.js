var fluid = fluid || {};

fluid.accessiblecheckbox =  function () {
    // Private functions.
    var focusCheckbox = function (boxToFocus) {
    	jQuery (boxToFocus).addClass ("focussed");
    };
    
    var blurCheckbox = function (boxToBlur) {
    	jQuery (boxToBlur).removeClass ("focussed");
    };
    
    var toggleBox = function (box) {
        var text = box.text();
        if (text == "Yes") {
            box.text("No");
        } else if (text == "No") {
            box.text("Yes");    
        }
    };
    
    var selectCheckboxHandler = function (boxToCheck) {
        var checkbox = jQuery (boxToCheck);
        var childBoxIdSelector = "#" + checkbox.attr ("id") + "_box";
        var box = jQuery (childBoxIdSelector, checkbox);
        toggleBox (box);
    };
    
    // Public members.
	return {
	    initializeCheckboxes: function (checkboxContainerId) {
	    	// Make the overall container tab-focussable.
	    	var checkboxContainer = jQuery ("#" + checkboxContainerId);
	    	fluid.access.makeTabFocussable(checkboxContainer);
	    	
	    	// Individual checkboxes should be selectable.
	    	var boxes = checkboxContainer.children ("p");    	
	    	var selectionHandlers = {
	    		focus: focusCheckbox,
	    		blur: blurCheckbox
	    	};
	    	fluid.access.makeSelectable (checkboxContainer, boxes, fluid.access.VERTICAL, selectionHandlers);
	    	fluid.access.makeActivatable (boxes, selectCheckboxHandler);
	    }
	}; // End public return.
}(); // End fluid.accessiblecheckbox namespace.