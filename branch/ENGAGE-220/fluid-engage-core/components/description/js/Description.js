/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($) {
	
    /**
     * Removes "." from the selector name
     * This is used by addToggler to add in a selector from the defaults into the injected  markup
     * 
     * @param {Object} selector, a selector from the component's defaults
     */
    var cleanseSelector = function (selector) {
        return selector.replace(/\./gi, "");
    };
    
    /**
     * Injects a hidden toggler into the markup
     * 
     * @param {Object} that, the component
     */
	var addToggler = function (that) {
        var styles = that.options.styles;
        var markup = "<div class='" + cleanseSelector(that.options.selectors.toggler) + " " + styles.descriptionToggle + " " + styles.descriptionToggleExpand + "' alt='Expand Description' title='Expand Description'>Expand</div>";
        var markupNode = $(markup);
		markupNode.hide();
        that.container.append(markupNode);
        return markupNode;
    };	
    
    /**
     * Programmatically adds the styles used by the component and specified in the styles section of the defaults
     * 
     * @param {Object} that, the component
     */
    var addStyleClasses = function (that) {
        that.locate("content").addClass(that.options.styles.content);
        that.container.addClass(that.options.styles.container);
    };
	
    /**
     * Generates the component tree used by the renderer
     * 
     * @param {Object} that, the component
     */
	var generateTree = function (that) {
		return {
			children: [{
				ID: "content",
				value: that.options.model
			}]
		};
	};	
	
    /**
     * Creates the options object used by the renderer
     * 
     * @param {Object} that, the component
     */
	var createRenderOptions = function (that) {
		var selectorMap = [
			{
				selector: that.options.selectors.content, 
				id: "content"
			}
		];
		return {cutpoints: selectorMap, debug: true};
	};

    /**
     * Binds a click handler to the toggler to call that.toggleDescription on click
     * 
     * @param {Object} that, the component 
     */
	var addClickEvent = function (that) {
		that.locate("toggler").click(that.toggleDescription);
	};
	
    /**
     * Determines if the toggler needs to be added to the page, 
     * by testing the height of the content against the collpasedHeight specified in the defaults
     * 
     * @param {Object} that, the component
     */
	var needToggle = function (that) {
		return that.locate("content").height() > that.options.collapsedHeight;
	};
	
    /**
     * Displayes the toggler and adds a click event to it.
     * 
     * @param {Object} that, the component
     */
	var setUpToggler = function (that) {
		that.locate("toggler").show();
		addClickEvent(that);
	};
    
    /**
     * Executes the necessary functions to setup the description
     * 
     * @param {Object} that, the component
     */
	var setUpDescription = function (that) {
        addStyleClasses(that);
		that.options.model = that.options.model.replace(/(<([^>]+)>)/gi, "");
		fluid.selfRender(that.container, generateTree(that), createRenderOptions(that));
        
		if (needToggle(that)) {
			that.locate("content").addClass(that.options.styles.descriptionCollapsed);
			addToggler(that);
			setUpToggler(that);
		}
	};
	
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
	fluid.description = function (container, options) {
		
		var that = fluid.initView("fluid.description", container, options);
		
        /**
         * Toggles the expansion/collapse of the description. 
         * Also changes the appearance of the toggler to indicate if
         * clicking will result in an expansion or a collapse.
         */
		that.toggleDescription = function () {
			var selector = that.locate("content");
            var toggle = that.locate("toggler");
            var styles = that.options.styles;
            
			if (toggle.hasClass(styles.descriptionToggleCollapse)) {
				selector.addClass(styles.descriptionCollapsed);
				selector.removeClass(styles.descriptionExpanded);
			}
			else {
				selector.removeClass(styles.descriptionCollapsed);
				selector.addClass(styles.descriptionExpanded);
			}
            
            toggle.toggleClass(styles.descriptionToggleCollapse);
            toggle.toggleClass(styles.descriptionToggleExpand);
		};		
		
		setUpDescription(that);
		
		return that;
	};
	
	fluid.defaults("fluid.description", {
		styles: {
			descriptionCollapsed: "fl-description-hide",
			descriptionExpanded: "fl-description-show",
            descriptionToggle: "fl-icon",
            descriptionToggleCollapse: "fl-description-togglerCollapse",
            descriptionToggleExpand: "fl-description-togglerExpand",
            content: "fl-description-content",
            container: "fl-description"
		},
		selectors: {
			content: ".flc-description-content",
			toggler: ".flc-description-toggler"
		},
		collapsedHeight: 60, //this also has to be specified in the css file in the .fl-description-hide class
		model: "Description Information"
	});
})(jQuery);