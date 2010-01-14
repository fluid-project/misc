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

(function ($, fluid) {
    
    var createTagTreeNode = function (tag) {
        var node = {
            ID: "tag:",
            children: [{
                ID: "tagName",
                value: tag
            }]
        };
                    
        return node;
    };
        
    var generateTree = function (that) {
        var tags = that.options.tags;        
        var tree = {children: fluid.transform(tags, createTagTreeNode)};
        var title = fluid.stringTemplate(that.options.strings.title, {num: tags.length});
        tree.children.push({ID: "title", value: title});
        return tree;
    };
        
    var generateSelectorMap = function (selectors) {
        return  [{selector: selectors.title, id: "title"},
                    {selector: selectors.tag, id: "tag:"},
                    {selector: selectors.tagName, id: "tagName"}];
    };
    
    var renderTags = function (that) {
        var tree = generateTree(that);
        var selectorMap = generateSelectorMap(that.options.selectors);
        var templates;

        if (that.options.templateURL) {
            // Data structure needed by fetchResources
            var resources = {
                tags: {
                    href: that.options.templateURL,
                    cutpoints: selectorMap
                }
            };
            
            fluid.fetchResources(resources, function () {
                templates = fluid.parseTemplates(resources, ["tags"], {});
                fluid.reRender(templates, that.container, tree);
                that.events.afterInit.fire();
            });
        } else {
            var opts = {
                debug: true,
                cutpoints: selectorMap
            };

            fluid.selfRender(that.container, tree, opts);
            that.events.afterInit.fire();
        }
    };
    
    fluid.tags = function (container, options) {
        var that = fluid.initView("tags", container, options);
        that.model = that.options.tags;
        
        var totalTagsStr = fluid.stringTemplate(that.options.strings.title, {num: that.model ? that.model.length : 0});        
        that.locate("title").text(totalTagsStr);
        
        renderTags(that);        
        
        return that;        
    };

    fluid.defaults("tags", {
        selectors: {
            title: ".flc-tags-title",
            tag: ".flc-tags-tag",
            tagName: ".flc-tags-tagName"
        },
        strings: {
            title: "Show Tags (%num)"
        },
        events: {
            afterInit: null
        },
        tags: [],
        templateURL: null  // if not passed in expect the template in the current page
    });
    
})(jQuery, fluid);
