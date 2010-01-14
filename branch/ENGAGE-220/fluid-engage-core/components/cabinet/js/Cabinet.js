/*
 Copyright 2009 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    /**
     * Finds the descendant of an element, as specified by the test function passed in the argument
     * 
     * @param {Object} element, the root node to test from
     * @param {Object} test, a function that takes an element and returns true when the correct child is found
     */
    var findChild = function (element, test) {
        element = fluid.unwrap(element);
        var childNodes = element.childNodes;
        
        for (var i = 0; i < childNodes.length; i++) {
            if (test(childNodes[i])) {
                return childNodes[i];
            }
        }
    };
    
    /**
     * Adds the various aria properties
     * 
     * @param {Object} that, the component
     */
    var addAria = function (that) {
        that.container.attr({
            role: "tablist",
            "aria-multiselectable": "true"
        });
        
        that.locate("drawer").attr({
            role: "tab",
            "aria-expanded": "false"
        });
    };
    
    /**
     * Adds the various css classes used by the component
     * 
     * @param {Object} that, the component
     */
    var addCSS = function (that) {
        that.locate("drawer").addClass(that.options.styles.drawer);
        that.locate("contents").addClass(that.options.styles.contents);
        that.locate("handle").addClass(that.options.styles.handle);
    };
    
    /**
     * Toggle's the visibility of the contents of the drawer. It finds the contents which
     * are the children of the drawer that was open/closed and sets toggles the visibility
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the drawers that were opened/closed
     */
    var toggleVisibility = function (that, selector) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var contents = findChild(element, function (element) {
                return $(element).is(that.options.selectors.contents);
            });
            
            if (contents) {
                $(contents).toggle();
            }
        });
    };
    
    /**
     * Opens/Closes the specified drawers, and fires the appropriate events.
     * 
     * @param {Object} that, the component
     * @param {Object} openState, a boolean representing the open state of the drawer. True === open.
     * @param {Object} selector, a selector representing the drawers to open/close
     * @param {Object} stopEvent, a boolean used to prevent the event from firing. 
     */
    var moveDrawers = function (that, openState, selector, stopEvent) {
        selector = fluid.wrap(selector);
        selector.addClass(openState ? that.options.styles.drawerOpened : that.options.styles.drawerClosed);
        selector.removeClass(!openState ? that.options.styles.drawerOpened : that.options.styles.drawerClosed);
        selector.attr("aria-expanded", openState ? "true" : "false");
        toggleVisibility(that, selector);

        if (!stopEvent) {
            that.events[openState ? "afterOpen" : "afterClose"].fire(selector);
        }
    };
    
    var findHandleBase = function (that, element) {
        return $(fluid.findAncestor(element, function (el) {
            return $(el).is(that.options.selectors.drawer);
        }));
    };
    
    /**
     * Adds a click event to each handle for opening/closing the drawer
     * 
     * @param {Object} that, the component
     */
    var addClickEvent = function (that) {
        that.locate("handle").click(function () {
            that.toggleDrawers(findHandleBase(that, this));
        });
    };
    
    /**
     * Adds keyboard a11y to the handles
     * 
     * @param {Object} that, the component
     */
    var addKeyNav = function (that) {
        that.container.attr("tabindex", 0);
        that.container.fluid("selectable", {
            selectableSelector: that.options.selectors.handle
        });
        that.locate("handle").fluid("activatable", function (evt) {
            that.toggleDrawers(findHandleBase(that, evt.target));
        });
    };
    
    /**
     * Calls the various setup functions
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        addAria(that);
        addCSS(that);
        moveDrawers(that, that.options.startOpen, that.locate("drawer"), that.options.preventEventFireOnInit);
        addClickEvent(that);
        addKeyNav(that);
    };
    
    /**
     * The creator function for the component
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the integrator specified options.
     */
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        /**
         * Toggles the open state of the drawer. 
         * 
         * @param {Object} drawer, the drawers to open/close
         */
        that.toggleDrawers = function (drawer) {
            drawer = fluid.wrap(drawer);
            drawer.each(function (index, element) {
                var elm = $(element);
                
                if (elm.hasClass(that.options.styles.drawerClosed)) {
                    that.openDrawers(elm);
                } else if (elm.hasClass(that.options.styles.drawerOpened)) {
                    that.closeDrawers(elm);
                }
            });
        };
        
        /**
         * Opens all specified drawers
         * 
         * @param {Object} selector, the set of drawers to open
         */
        that.openDrawers = function (selector) {
            moveDrawers(that, true, selector);
        };
        
        /**
         * Closes all specified drawers
         * 
         * @param {Object} selector, the set of drawers to close
         */
        that.closeDrawers = function (selector) {
            moveDrawers(that, false, selector);
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.cabinet", {
        selectors: {
            drawer: ".flc-cabinet-drawer",
            handle: ".flc-cabinet-handle", 
            header: ".flc-cabinet-header",
            headerDescription: ".flc-cabinet-headerDescription",
            contents: ".flc-cabinet-contents"
        },
        
        styles: {
            drawerClosed: "fl-cabinet-drawerClosed",
            drawerOpened: "fl-cabinet-drawerOpened",
            
            drawer: "fl-container fl-container-autoHeading fl-cabinet-animation fl-container-collapsable",
            contents: "fl-cabinet-contents",
            handle: "fl-cabinet-handle"
        },
        
        events: {
            afterOpen: null,
            afterClose: null
        },
        
        startOpen: false,
        
        preventEventFireOnInit: true
    });
    
})(jQuery);
