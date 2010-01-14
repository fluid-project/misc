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
/*global jqUnit expect stop start*/

(function ($) {
    var myTags;
    var tagsArray = ["tree", "juniper", "berries", "green"];

    var setupWithTemplate = function () {
        var opts = {
            tags: tagsArray,
            templateURL: "../../../../components/tags/html/TagsTemplate.html",
            listeners: {
                afterInit: function () {                    
                    start();
                }
            }
        };    

        stop();
        myTags = fluid.tags(".tags", opts);
    };
    var tagsTestsWithTemplate = jqUnit.testCase("Tags Tests With Template", setupWithTemplate);

    var createNoTemplateTestCase = function () {
        var setupNoTemplate = function () {
            var opts = {
                tags: tagsArray
            };
            
            myTags = fluid.tags(".tags-no-template", opts);
        };
        return jqUnit.testCase("Tags Tests No Template", setupNoTemplate);
    };
    
    var initTest = function () {
        expect(4);
        jqUnit.assertDeepEq("The model has been set correctly", tagsArray, myTags.model);
        for (var sName in myTags.options.selectors) {
            var selector = myTags.container.selector + " " + myTags.options.selectors[sName];
            jqUnit.exists(sName + " was found in the DOM at " + selector, selector);
        }        
    };
    
    $(document).ready(function () {    
    
        tagsTestsWithTemplate.test("Initialize", initTest);


        /*
         * Start of tests for tags with no template
         */
        var tagsTestsNoTemplate = createNoTemplateTestCase();
        tagsTestsNoTemplate.test("Initialize", initTest);
         
    });
})(jQuery);
