var fluid = fluid || {};

fluid.accessiblecheckbox =  function () {
    // Private functions.
    var selectCheckbox = function (boxToFocus) {
        jQuery ("label", boxToFocus).addClass ("focussed");
    };

    var unselectCheckbox = function (boxToBlur) {
        jQuery ("label", boxToBlur).removeClass ("focussed");
    };

    var leaveCheckboxes = function (selectedBox) {
        unselectCheckbox (selectedBox);
    };

    var toggleBox = function (box) {
        box.toggleClass ("checked");
    };

    var selectCheckboxHandler = function (boxToCheck) {
        var boxLabel = jQuery ("label", boxToCheck);
        toggleBox (boxLabel);
    };

    var replaceInputsWithGraphics = function (boxes) {
        var replaceFn = function (index, box) {
           // Hide the original input box.
           jQuery ("input", box).addClass("hiddenBox");

           // Replace it with a graphic on the label.
           jQuery ("label", box).addClass("graphicBox");
        };

        boxes.each (replaceFn);
    };

    var clickable = function (boxes) {
        boxes.mousedown (function (evt) {
            boxes.activate (this);
        });
    };

    // Public members.
    return {
        initializeCheckboxes: function (checkboxContainerId) {
            // Make the overall container tab-focussable.
            var checkboxContainer = jQuery ("#" + checkboxContainerId);
            checkboxContainer.tabbable(checkboxContainer);

            // Find all checkboxes and make them fancy.
            var boxes = checkboxContainer.children ("#checkboxes_0,#checkboxes_1,#checkboxes_2,#checkboxes_3");
            replaceInputsWithGraphics (boxes);

            // Make them key navigable and activatable.
            var selectionHandlers = {
                willSelect: selectCheckbox,
                willUnselect: unselectCheckbox,
                willLeaveContainer: leaveCheckboxes
            };
            boxes.selectable (checkboxContainer, selectionHandlers);
            boxes.activatable (selectCheckboxHandler);
            clickable (boxes);
        }
    }; // End public return.
}(); // End fluid.accessiblecheckbox namespace.
