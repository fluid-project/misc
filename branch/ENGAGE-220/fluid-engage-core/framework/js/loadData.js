/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

(function ($, fluid) {
	
	fluid.engage = fluid.engage || {};
	
	var getDataFeedUrl = function (currentUrl) {
	    return String(currentUrl).replace(".html", ".json");
	};
	
	var localTestDataURL = "../data/demoData.json";
	
	fluid.engage.initComponentWithDataFeed = function (currentUrl, componentName, container) {
		var initEngageComponent = function (options) {
			fluid.invokeGlobalFunction(componentName, [container || "body", options]);
		};
		
		var isFile = currentUrl.protocol === "file:";		
		
		$.ajax({
			url: isFile ? localTestDataURL : getDataFeedUrl(currentUrl),
			success: initEngageComponent,
			dataType: "json",
			async: true
		});
	};
	
})(jQuery, fluid);