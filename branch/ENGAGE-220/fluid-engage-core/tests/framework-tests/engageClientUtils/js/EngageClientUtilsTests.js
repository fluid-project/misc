/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {  

    function hasSameValues(obj1, obj2) {
        var result;
        
        if (obj1.length === obj2.length) {
            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    if (obj1[key] !== obj2[key]) {
                        return false;
                    }
                    result = true;
                }
            }
        }
        return result;
    }
    
    function testPaging(initTestFunc, otherTests, options) {
        function testAccessor(url, callback, data) {
            return initTestFunc ? initTestFunc(url, callback, data) : {};
        }
        var p = fluid.engage.paging(fluid.merge("merge", {dataAccessor: testAccessor}, options));
        
        if (otherTests) {
            otherTests(p);
        }
    }
    
    function pagingAjaxAsserts(url, expectedData, actualData) {
        jqUnit.assertTrue("URL is a string", typeof url === "string");
        jqUnit.assertTrue("Data is an object", typeof actualData === "object");
        jqUnit.assertEquals("Data value is correct", JSON.stringify(expectedData), JSON.stringify(actualData));
    }
    
    function pagingNextTests(pager) {
        pager.options.dataAccessor = function (url, callback, data) {
            pagingAjaxAsserts(url, {limit: 20, skip: 0}, data);
        };
        
        jqUnit.assertTrue("Has next", pager.hasNext());
        jqUnit.assertFalse("Doesn't have previous", pager.hasPrevious());
        
        pager.next();
    }
    
    function testCookies(name, value, message) {
        fluid.engage.setCookie(name, value);
        
        if (typeof value === "object") {
            jqUnit.assertTrue(message, hasSameValues(value, fluid.engage.getCookie(name)));
        } else {
            jqUnit.assertEquals(message, value, fluid.engage.getCookie(name));
        }
    }
    
    function engageClientUtilsTests() {
        var tests = jqUnit.testCase("EngageClientUtils Tests");
        
        tests.test("Cookies Test:", function () {
            testCookies("test", "value1", "Cookie set and retrieved");
            testCookies("test", "value2", "Cookie reset and retrieved");
            testCookies("test2", "value3", "New Cookie saved and retrieved");
            testCookies("test3", {test3: "value4"}, "Cookie Value is an object");
        });
        
        tests.test("Paging Test: Initial ajax call (caching on)", function () {
            testPaging(function (url, callback, data) {
                pagingAjaxAsserts(url, {limit: 20}, data);
            });
        });
        
        tests.test("Paging Test: Initial ajax call (caching off)", function () {
            testPaging(function (url, callback, data) {
                pagingAjaxAsserts(url, {limit: 1}, data);
            }, null, {useCaching: false});
        });
        
        tests.test("Paging Test: Changed maxPageSize", function () {
            testPaging(function (url, callback, data) {
                pagingAjaxAsserts(url, {limit: 6}, data);
            }, null, {maxPageSize: 6});
        });
        
        tests.test("Paging Test: Next with fixed data size", function () {
            testPaging(function (url, callback) {
                callback({});
            }, pagingNextTests, {dataSetSize: 5, useCaching: false});
        });
        
        tests.test("Paging Test: Next with el path to datasize", function () {
            testPaging(function (url, callback) {
                callback({size: 10});
            }, pagingNextTests, {dataSetSize: "size", useCaching: false});
        });
    }
    
    $(document).ready(function () {
        engageClientUtilsTests();
    });
})(jQuery);
