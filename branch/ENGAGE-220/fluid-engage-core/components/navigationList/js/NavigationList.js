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
     * Creates a render component for the component tree. The key can be any key that a componet tree would take and the value is what would be assigned to it.
     * For example if you wanted to have node that just prints out "Hello World" you could set the key to "value" and the value to "Hello World"
     * 
     * @param {Object} id, the ID used by the component tree
     * @param {Object} key, a key representing an entry in a renderer component
     * @param {Object} value, the value assigned to the key
     * @param {Object} classes, (optional) can add classes without having to specify the decorator key. 
     */
    var treeNode = function (id, key, value, classes) {
        var obj = {ID: id};
        obj[key] = value;
        if (classes) {
            obj.decorators = {
                type: "addClass",
                classes: classes
            };
        }
        
        return obj; 
    };
    
    /**
     * Creates a renderer component of type message
     * 
     * @param {Object} id, the ID used by the component tree
     * @param {Object} messageKey, an EL path into the message bundle representing the template to be used
     * @param {Object} messageArgs, the arguements to be merged into the message template
     * @param {Object} classes, (optional) can be used to add classes 
     */
    var compileMessage = function (id, messageKey, messageArgs, classes) {
        var obj = treeNode(id, "messagekey", messageKey, classes);
        obj.args = messageArgs;
        return obj;
    };
    
    /**
     * Will return the result of a function wich is run based on a condition.
     * 
     * @param {Object} condition, the test condition
     * @param {Object} onTrue, the function to run if the condition passes
     * @param {Object} onFalse, the function to run if the condition fails
     */
    var conditionalNode = function (condition, onTrue, onFalse) {
        var func = condition === null || condition === undefined ? onFalse : onTrue;
        
        return func();
    };
    
    /**
     * Renders the copmonent based on values passed into the options
     * 
     * @param {Object} that, the component
     */
    var render = function (that) {
        var selectorMap = [
            {selector: that.options.selectors.listItems, id: "listItems:"},
            {selector: that.options.selectors.link, id: "link"},
            {selector: that.options.selectors.image, id: "image"},
            {selector: that.options.selectors.titleText, id: "titleText"},
            {selector: that.options.selectors.descriptionText, id: "descriptionText"}
        ];

        var generateTree = function () {
            var styles = that.options.styles;
            return fluid.transform(that.options.links, function (object) {
                var title = object.title || "";
                var tree = treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || "", styles.link),
                    conditionalNode(object.category, function () {
                        return compileMessage("titleText", "linkToMoreMessage", [object.category || "", object.size || ""], styles.category);
                    }, function () {
                        return treeNode("titleText", "value", title, styles.titleText);
                    })
                ], styles.listItems);
                
                if (object.description) {
                    tree.children.push(treeNode("descriptionText", "value", object.description || "", styles.descriptionText));
                }
                
                if (object.image || that.options.useDefaultImage) {
                    tree.children.push({
                        ID: "image",
                        target: object.image,
                        decorators: [{
                            type: "addClass",
                            classes: styles.image
                        }]
                    });
                }
                
                return tree;
            });
        };
        
        var options = {
            cutpoints: selectorMap,
            messageSource: {
                type: "data", 
                messages: that.options.messageBundle
            }
        };
        
        fluid.selfRender(that.locate("listGroup"), generateTree(), options);
         
    };
    
    /**
     * The styles to be set on the group containing the list of links
     * 
     * @param {Object} that, the component
     */
    var styleGroup = function (that) {
        that.locate("listGroup").addClass(that.options.styles.listGroup);
    };
    
    /**
     * The general setup function that calls the functions that need to be run on init
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        render(that);
        styleGroup(that);
    };
    
    /**
     * The creator function
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the options passed into the component
     */
    fluid.navigationList = function (container, options) {
        var that = fluid.initView("fluid.navigationList", container, options);
        
        setup(that);
        
        return that;
    };
    
    /**
     * The components defaults
     */
    fluid.defaults("fluid.navigationList", {
        selectors: {
            listGroup: ".flc-nagivationList-listGroup",
            listItems: ".flc-navigationList-items",
            link: ".flc-navigationList-link",
            image: ".flc-navigationList-image",
            titleText: ".flc-navigationList-titleText",
            descriptionText: ".flc-navigationList-descriptionText"
        },
        
        styles: {
            listGroup: "fl-list-menu fl-list-thumbnails fl-thumbnails-expanded",
            listItems: null,
            link: null,
            image: "fl-icon",
            titleText: null,
            descriptionText: "fl-link-summary",
            category: null
        },
        
        strings: {},
        
        events: {},
        
        useDefaultImage: false,
        
        messageBundle: {linkToMoreMessage: "See all in {0} ({1})"},
        
        links: [
                {
                    target: "",
                    image: "",
                    title: "",
                    description: null,
                    category: null,
                    size: null
                }
            ]
        }
    );
    
})(jQuery);