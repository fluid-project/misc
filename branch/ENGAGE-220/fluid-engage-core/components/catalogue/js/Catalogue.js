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
	
	var buildCutpoints = function (selectors) {
		return [
            {id: "exhibitionTitle", selector: selectors.exhibitionTitle}
        ];
	};
	
	var buildComponentTree = function (that) {
		return {
            children: [{
                ID: "exhibitionTitle",
                value: that.model.strings.title
            }]
        };
	};
	
	var renderCatalogue = function (that) {
		fluid.selfRender(that.container, 
			buildComponentTree(that), 
			{cutpoints: buildCutpoints(that.options.selectors), model: that.model, debug: true});
	};
	
	var initSubcomponents = function (that) {
		that.catalogueList = fluid.initSubcomponent(that, "navigationList", [that.locate("catalogueList"),
		    {links: that.model.lists[0].listOptions.links}]);
	};
	
	var setup = function (that) {
		renderCatalogue(that);
		initSubcomponents(that);
	};
	
	fluid.catalogue = function (container, options) {
		var that = fluid.initView("fluid.catalogue", container, options);		
		that.model = that.options.model;
		setup(that);
		return that;
	};
	
	fluid.defaults("fluid.catalogue", {
		selectors: {
			exhibitionTitle: ".flc-exhibition-title",
			viewAll: ".flc-catalogue-viewAll",
			catalogueList: ".flc-catalogueList"
		},
		navigationList: {
            type: "fluid.navigationList"/*,
            options: {
                styles: {
                    titleTextnavigationList: "fl-browse-shortenText"
                },
                useDefaultImage: false
            }*/
        }
	});
}(jQuery));