/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/

fluid = fluid || {};
fluid.exhibitionService = fluid.exhibitionService || {};

(function ($) {
	
	var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
	    fluid.log("XMLHttpRequest: " + XMLHttpRequest);
	    fluid.log("Status: " + textStatus);
	    fluid.log("Error: " + errorThrown);
	    return [500, {"Content-Type": "text/plain"}, errorThrown];
	};	
	
	var compileDatabaseURL = function (params, config) {
		return fluid.stringTemplate(config.viewURLTemplateWithKey, {
			dbName: params.db || "", 
			view: config.views.exhibitionByTitle, 
			key: '"' + params.title + '"'
		});
	};
	
	var ajaxCall = function (url, success, error) {
		$.ajax({
            url: url,
            dataType: "json",
            asyn: false,
            success: success,
            error: error
	    });
	};
	
	var getAjax = function (url, error) {
		var data;
	    var success = function (returnedData, status) {
	        data = JSON.parse(returnedData.substring(0, returnedData.length - 1));
	    };	    
	    ajaxCall(url, success, error);
	    return data;
	};
	
	var compileTargetURL = function (URLBase, params) {
		return URLBase + "?" + $.param(params);
	};
	
	var getData = function (errorCallback, params, config) {
		var url = compileDatabaseURL(params, config);
		var rawData = getAjax(url, errorCallback);
		var baseCatalogueURL = "../catalogue/view.html";
		var exhibitionData = fluid.engage.mapModel(rawData.rows[0], params.db + "_view");
		exhibitionData.catalogueLink = compileTargetURL(baseCatalogueURL, {
			db: params.db,
			title: exhibitionData.title
		});
		var model = {
			model: exhibitionData,
			exhibitionCabinet: {
				lists: [
				    {
				    	category: fluid.stringTemplate("Show Guest's book (%num comments)", {num: 5}),
				    	listOptions: {
				    		links: [{
				    			target: "#",
				    			title: "Comment",
				    			description: "Comment Content"
				    		}] 
				    	}
				    }, {
				    	category: fluid.stringTemplate("Show Audio and Video (%num)", {num: 3}),
				    	listOptions: {
				    		links: [{
				    			target: "#",
				    			title: "Audio",
				    			description: "Audio Content"
				    		}] 
				    	}
				    }
				]
			}
		};
		return JSON.stringify(model);
	};
	
	fluid.exhibitionService.initExhibitionViewDataFeed = function (config, app) {
	    var exhibitionViewDataHandler = function (env) {
	        return [200, {"Content-Type": "text/plain"}, getData(errorCallback, env.urlState.params, config)];
	    };
	
	    var acceptor = fluid.engage.makeAcceptorForResource("view", "json", exhibitionViewDataHandler);
	    fluid.engage.mountAcceptor(app, "exhibitions", acceptor);
	};
	
	fluid.exhibitionService.initExhibitionViewService = function (config, app) {
	    var handler = fluid.engage.mountRenderHandler({
	        config: config,
	        app: app,
	        target: "exhibitions/",
	        source: "components/exhibition/html/",
	        sourceMountRelative: "engage"
	    });
	        
        handler.registerProducer("view", function (context, env) {
            return {};
        });
	        
    };    
})(jQuery);