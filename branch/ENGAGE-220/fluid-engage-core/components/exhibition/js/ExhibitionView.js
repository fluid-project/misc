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
	
	var buildViewUpcomingCutpoints = function (selectors) {
		return [
            {id: "title", selector: selectors.title},
            {id: "image", selector: selectors.image},
            {id: "fromDate", selector: selectors.fromDate},
            {id: "description", selector: selectors.description}
        ];
	};
	
	var buildUpcomingViewTree = function (that) {
		var model = that.model;
		return {
            children: [{
                ID: "title",
                value: model.title
            }, {
            	ID: "image",
            	decorators: [{
            		attrs: {
            			src: model.image
            		}
            	}]
            }, {
            	ID: "fromDate",
            	value: model.displayDate 
            }, {
            	ID: "description",
            	markup: model.introduction ? model.introduction : model.content
            }]
        };
	};
	
	var buildViewCurrentCutpoints = function (selectors) {
		return [
            {id: "title", selector: selectors.title},
            {id: "image", selector: selectors.image},
            {id: "displayDate", selector: selectors.displayDate},
            {id: "description", selector: selectors.description},
            {id: "catalogueSize", selector: selectors.catalogueSize},
            {id: "catalogueLink", selector: selectors.catalogueLink}
        ];
	};
	
	var buildCurrentViewTree = function (that) {
		var model = that.model;
		return {
            children: [{
                ID: "title",
                value: model.title
            }, {
            	ID: "image",
            	decorators: [{
            		attrs: {
            			src: model.image
            		}
            	}]
            }, {
            	ID: "displayDate",
            	value: model.displayDate 
            }, {
            	ID: "description",
            	markup: model.introduction ? model.introduction : model.content
            }, {
            	ID: "catalogueSize",
            	value: fluid.stringTemplate(that.options.strings.catalogueSize, {size: model.catalogueSize})
            }, {
            	ID: "catalogueLink",
            	decorators: [{
            		attrs: {
            			href: model.catalogueLink
            		}
            	}]
            }]
        };
	};
	
	var setupResources = function (url, buildCutpoints, selectors) {
		return {
            view: {
	            href: url,
	            cutpoints: buildCutpoints(selectors)
	        }
	    };
	};
	
	var renderExhibition = function (that, resources, buildTree) {
		fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["view"], {});
            var node = $("<div></div>", that.container[0].ownerDocument);
            fluid.reRender(templates, node, buildTree(that), {model: that.model});
            that.container.append(node);
            setupSubcomponents(that);
        });
	};
	
	var extractArray = function (array, key) {
        return fluid.transform(array, function (object, index) {
            return object[key] || null;
        });
    };
	
	var initSubComponents = function (that, container, options) {
        fluid.transform(container, function (object, index) {
            var componentOptions = fluid.copy(that.options.navigationList.options);
            fluid.merge("merge", componentOptions, options[index]);
            fluid.initSubcomponent(that, "navigationList", [object, componentOptions]);
        });
    };
    
    var initSubComponentsHeaders = function (container, options) {
    	fluid.transform(container, function (object, index) {
    		$(object).html(options[index]);
    	});
    };
	
	var setupSubcomponents = function (that) {
		initSubComponents(that, that.locate("lists"), extractArray(that.options.exhibitionCabinet.lists, "listOptions"));
		initSubComponentsHeaders(that.locate("currentCabinetHeaders"), extractArray(that.options.exhibitionCabinet.lists, "category"));
		that.exhibitionCabinet = fluid.initSubcomponent(that, "exhibitionCabinet", [that.locate("currentCabinet")]);		
	};
	
	var setupCurrentExhibition = function (that) {
		var resources = setupResources(that.options.viewCurrentURL, buildViewCurrentCutpoints, that.options.selectors);
		renderExhibition(that, resources, buildCurrentViewTree);
	};
	
	var setupUpcomingExhibition = function (that) {
		var resources = setupResources(that.options.viewUpcomingURL, buildViewUpcomingCutpoints, that.options.selectors);
		renderExhibition(that, resources, buildUpcomingViewTree);
	};
	
	var setup = function (that) {
		if (that.model.isCurrent === "yes") {
			setupCurrentExhibition(that);
		}
		else {
			setupUpcomingExhibition(that);
		}
	};
	
	fluid.exhibition = function (container, options) {
		var that = fluid.initView("fluid.exhibition", container, options);		
		that.model = that.options.model;
		setup(that);		
		return that;
	};
	
	fluid.defaults("fluid.exhibition", {
		selectors: {
			title: ".flc-exhibition-title",
			image: ".flc-exhibition-image",
			fromDate: ".flc-exhibition-fromDate",
			description: ".flc-exhibition-description",
			displayDate: ".flc-exhibition-displayDate",
			catalogueSize: ".flc-exhibition-catalogue-size",
			catalogueLink: ".flc-exhibition-catalogueLink",
			currentCabinet: ".flc-exhibition-cabinet",
			currentCabinetHeaders: ".flc-cabinet-header",
			lists: ".flc-cabinet-drawer"
		},
		exhibitionCabinet: {
            type: "fluid.cabinet"
        },
        navigationList: {
            type: "fluid.navigationList",
            options: {
                styles: {
                    titleTextnavigationList: "fl-browse-shortenText"
                },
                useDefaultImage: false
            }
        },
		strings: {
			catalogueSize: "%size objects"
		},
		viewCurrentURL: "../../../../fluid-engage-core/components/exhibition/html/viewCurrent.html",
		viewUpcomingURL: "../../../../fluid-engage-core/components/exhibition/html/viewUpcoming.html"
	});
}(jQuery));