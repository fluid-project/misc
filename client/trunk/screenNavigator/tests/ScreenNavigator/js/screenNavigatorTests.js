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
/*global jqUnit, expect*/


(function ($) {
    
    
    $(document).ready(function () {
        /**
         * Get the properties of an object as an array
         * @param {Object} obj
         */
        var extractKeysFromObject = function (obj) {
            var keys = [];
            for (var key in obj) {
                keys.push(key);
            }
            return keys;
        }
        /**
         * Make start() a referenceable thing for add/removeListener
         */
        var continueTest = function () {
            start();
        }

        var myContentManager;
        var setupComponent = function () {
            stop();
            myContentManager = fluid_1_2.screenNavigator("body", {
                pathPrefix: "../../../../mccord_demo/html/",
                startUrl : "explore.html",
                eventType : "click"
            });
            myContentManager.events.afterContentReady.addListener(continueTest);
        }


        //////////////////////////////////////////////////////////////////////////////////
        var tests = jqUnit.testCase("View Manager Test", setupComponent);

        tests.test("Startup", function () {
            expect(2);
            var viewsHashEntries = extractKeysFromObject(myContentManager.viewsHash);
            
            jqUnit.assertEquals("View Table has 1 cached view", 1, viewsHashEntries.length);
            jqUnit.assertTrue("AJAX is injected into view container", myContentManager.viewsHash[viewsHashEntries[0]].hasClass('fl-view'));
        });


        tests.test("Moving Forward", function () {            
            expect(2);
            stop();            

            var runAsyncTests = function () {                
                var viewsHashEntries = extractKeysFromObject(myContentManager.viewsHash);
                jqUnit.assertEquals("Loaded new content into cache", 2, viewsHashEntries.length);
                start();
            };
    
            myContentManager.events.afterContentReady.removeListener(continueTest);
            myContentManager.events.afterContentReady.addListener(runAsyncTests);

            var linkForward = $('.fl-container-auto li:first-child a');   
            linkForward.simulate("click");
            
            jqUnit.assertTrue("Clicked Link has a loading indicator", linkForward.hasClass('fl-link-loading'));

        });            

    });
})(jQuery);






