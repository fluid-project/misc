/*
Copyright 2009 University of Cambridge
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
fluid.artifactView = fluid.artifactView || {};

(function ($) {

    var artifactViewCutpoints = [
        {
            id: "artifactTitle",
            selector: ".artifact-name"
        },
        {
            id: "artifactImage",
            selector: ".artifact-picture"
        },
        {
            id: "artifactTitle2",
            selector: ".artifact-descr-name"
        },
        {
            id: "artifactAuthor",
            selector: ".artifact-provenance"
        },
        {
            id: "artifactDate",
            selector: ".artifact-date"
        },
        {
            id: "artifactAccessionNumber",
            selector: ".artifact-accession-number"
        }
    ];
    
    var getData = function (modelURL) {
        var model = {};
        
        var successCallback = function (data, status) {
            model = JSON.parse(data);
            if (model.total_rows && model.total_rows > 0) {
                model = model.rows[0].doc;
            }       
        };   
        
        $.ajax({
            url: modelURL, 
            success: successCallback,
            dataType: "json",
            async: false
        });
        
        return model;
    };
    
    var buildDataURL = function (params, config) {
        return fluid.stringTemplate(config.queryURLTemplate, 
            {dbName: params.db || "", view: config.views.all, query: params.q || ""}); 
    };
 
    var buildComponentTree = function (model) {
        var tree = {children: [
            {
                ID: "artifactTitle",
                valuebinding: "artifactTitle"
            },
            {
                ID: "artifactTitle2",
                valuebinding: "artifactTitle",
                decorators: [{
                    type: "addClass",
                    classes: "fl-text-bold"
                }]
            },
            {
                ID: "artifactAuthor",
                valuebinding: "artifactAuthor"
            },
            {
                ID: "artifactDate",
                valuebinding: "artifactDate"
            },
            {
                ID: "artifactAccessionNumber",
                valuebinding: "artifactAccessionNumber"
            }
        ]};
        if (model.artifactImage) {
            tree.children.push({
                ID: "artifactImage",
                target: model.artifactImage
            });
        }
        return tree;
    };

    var fetchAndNormalizeModel = function (params, config) {
        var model = getData(buildDataURL(params, config));
        return fluid.engage.mapModel(model, params.db);
    };
    
    var buildCategoryQuery = function (category) {
        if (typeof category === "string") {
            return category;
        }
        category = $.makeArray(category);
        var catString = category.pop();
        $.each(category, function (index, value) {
            catString += "AND" + value;
        });
        return catString;
    };
    
    fluid.artifactView.initDataFeed = function (config, app) {
        var artifactDataHandler = function (env) {	
            var urlBase = "browse.html?",
                params = env.urlState.params,
                model = fetchAndNormalizeModel(params, config),
                relatedParams = params,
                relatedArtifacts;
            
            relatedParams.q = buildCategoryQuery(model.category);
            relatedArtifacts = urlBase + $.param(relatedParams); 
            
            return [200, {"Content-Type": "text/plain"}, JSON.stringify({
                toRender: {
                    model: model,
                    cutpoints: artifactViewCutpoints,
                    tree: buildComponentTree(model),
                    relatedArtifacts: relatedArtifacts
                }
            })];
        };
        
        var acceptor = fluid.engage.makeAcceptorForResource("view", "json", artifactDataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };
    
    fluid.artifactView.initMarkupFeed = function (config, app) {
        var handler = fluid.engage.mountRenderHandler({
            config: config,
            app: app,
            target: "artifacts/",
            source: "components/artifactView/html/",
            sourceMountRelative: "engage"
        });
        
        handler.registerProducer("view", function (context, env) {
            return {};
        });


    };
    
})(jQuery);
