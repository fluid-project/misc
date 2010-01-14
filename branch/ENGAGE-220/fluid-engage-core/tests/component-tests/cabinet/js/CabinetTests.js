/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, expect, window*/


(function ($) {
    
    var setup = function (options, container) {
        var obj = {};
        obj.that = fluid.cabinet(container || ".cabinet", options);
        obj.selectors = obj.that.options.selectors;
        obj.styles = obj.that.options.styles;
        obj.drawers = obj.that.locate("drawer");
        obj.contents = obj.that.locate("contents");
        obj.handles = obj.that.locate("handle");
        
        return obj;
    };
    
    function simulateKeyDown(onElement, withKeycode, modifier) {
        var modifiers = {
            ctrl: (modifier === $.ui.keyCode.CTRL) ? true : false,
            shift: (modifier === $.ui.keyCode.SHIFT) ? true : false,
            alt: (modifier === $.ui.keyCode.ALT) ? true : false
        };

        var keyEvent = document.createEvent("KeyEvents");
        keyEvent.initKeyEvent("keydown", true, true, window, modifiers.ctrl, modifiers.alt, modifiers.shift, false, withKeycode, 0);

        onElement = fluid.unwrap(onElement);

        onElement.dispatchEvent(keyEvent);
    }
    
    var hasClasses = function (selector, classes) {
        if (typeof classes === "string") {
            classes = [classes];
        }
        
        for (var i = 0; i < classes.length; i++) {
            if (!selector.hasClass(classes[i])) {
                return false;
            }
        }
        
        return true;
    };
    
    var hasAttribute = function (selector, attribute, value) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var attrValue = $(element).attr(attribute);
            if (attrValue !== (value || !null)) {
                return false;
            }
        });
        
        return true;
    };
    
    var hasStyle = function (selector, style, value) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var styleValue = $(element).css(style);
            if (styleValue !== value) {
                return false;
            }
        });
        
        return true;
    };
    
    var assertStyling = function (selector, styles, expected, message) {
        selector = fluid.wrap(selector);
        styles = styles.split(" ");
        selector.each(function (index, element) {
            jqUnit[expected ? "assertTrue" : "assertFalse"](message, hasClasses(fluid.wrap(element), styles));
        });
    };
    
    var closeStylingTests = function (drawerSelector, contentSelector, openStyle, closeStyle) {
        
        assertStyling(drawerSelector, closeStyle, true, "All specified drawers have close styling");
        assertStyling(drawerSelector, openStyle, false, "No specified drawer has open styling");
        
        jqUnit.assertTrue("Drawer has aria-expended set to false", hasAttribute(drawerSelector, "aria-expanded", "false"));
        jqUnit.assertTrue("Contents are hidden", hasStyle(contentSelector, "display", "none"));
    };
    
    var openStylingTests = function (drawerSelector, contentSelector, openStyle, closeStyle) {
        assertStyling(drawerSelector, openStyle, true, "All specified drawers have open styling");
        assertStyling(drawerSelector, closeStyle, false, "No specified drawer has close styling");
        
        jqUnit.assertTrue("Drawer has aria-expanded set to true", hasAttribute(drawerSelector, "aria-expanded", "true"));
        jqUnit.assertTrue("Contents are visible", hasStyle(contentSelector, "display", "block"));
    };
    
    var assembleMessage = function (condition, beginning, end) {
        var m = condition ? " " : " not ";
        var b = beginning || "";
        var e = end || "";
        return b + m + e; 
    };
    
    var apiBasedTests = function (func, startOpen, drawers, options) {
        var cab = setup(fluid.merge("merge", {startOpen: startOpen}, options));
        var drawer = typeof drawers === "number" ? cab.drawers.eq(drawers) : cab.drawers;
        var content = typeof drawers === "number" ? cab.contents.eq(drawers) : cab.contents;
        
        if (typeof func === "function") {
            func(cab);
        } else {
            cab.that[func](drawer);
        }

        (startOpen ? closeStylingTests : openStylingTests)(drawer, content, cab.styles.drawerOpened, cab.styles.drawerClosed);
        (startOpen ? openStylingTests : closeStylingTests)(cab.drawers.not(drawer), cab.contents.not(content), cab.styles.drawerOpened, cab.styles.drawerClosed);
    };
    
    var simulateKeyTest = function (keyCode, startOpen, drawers, options) {
        if (!$.browser.mozilla) {
            return;
        }
        function keyboardActivate(cab) {
            simulateKeyDown(cab.handles.eq(drawers), $.ui.keyCode.SPACE);
        }
        apiBasedTests(keyboardActivate, startOpen, drawers, options);
        return true;
    };
    
    var eventBasedTests = function (startOpen, prevent, funcName, drawers) {
        var openedEventFired, closedEventFired, openShouldFire, closeShouldFire;
        var options = {
                preventEventFireOnInit: prevent,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            
        openShouldFire = !startOpen;
        closeShouldFire = startOpen;
        
        switch (funcName) {
        case "mouse":
            function mouseClick(cab) {
                cab.handles.eq(drawers).click();
            }
            apiBasedTests(mouseClick, startOpen, drawers, options);
            break;
        case "space":
            if (!simulateKeyTest($.ui.keyCode.SPACE, startOpen, drawers, options)) {
                return;
            }
            break;
        case "enter":
            if (!simulateKeyTest($.ui.keyCode.ENTER, startOpen, drawers, options)) {
                return;
            }
            break;
        case null:
        case undefined: 
            openShouldFire = !prevent && startOpen;
            closeShouldFire = !prevent && !startOpen;
            setup(fluid.merge("merge", {startOpen: startOpen}, options));
            break;
        default:
            apiBasedTests(funcName, startOpen, drawers, options);
        }     
        jqUnit[openShouldFire ? "assertTrue" : "assertFalse"](assembleMessage(openShouldFire, "Opened events", "fired"), openedEventFired);
        jqUnit[closeShouldFire ? "assertTrue" : "assertFalse"](assembleMessage(closeShouldFire, "Closed events", "fired"), closedEventFired);
    };
        
    var cabinetTests = function () {
        var tests = jqUnit.testCase("Cabinet Tests");
                    
        tests.test("CSS class insertion", function () {
            var cab = setup();
            
            var string = cab.selectors.drawer + "," + cab.selectors.handle + "," + cab.selectors.contents;
            expect($(string).length);

            assertStyling(cab.drawers, cab.styles.drawer, true, "All drawers have CSS styling");
            assertStyling(cab.handles, cab.styles.handle, true, "All handles have CSS styling");
            assertStyling(cab.contents, cab.styles.contents, true, "All content has CSS styling");
        });
        
        tests.test("Aria insertion", function () {
            var cab = setup();
            expect(4);
           
            jqUnit.assertTrue("Cabinet has role of tablist", hasAttribute(cab.that.container, "role", "tablist"));
            jqUnit.assertTrue("Cabinet has attribute aria-multiselectable set to true", hasAttribute(cab.that.container, "aria-multiselectable", "true"));
            jqUnit.assertTrue("Drawer has role of tab", hasAttribute(cab.drawers, "role", "tab"));
            jqUnit.assertTrue("Drawer has attribute of aria-expanded set", hasAttribute(cab.drawers));
        });
        
        tests.test("Start Closed", function () {
            var cab = setup({startOpen: false});
            expect(cab.drawers.length * 2 + 2);

            closeStylingTests(cab.drawers, cab.contents, cab.styles.drawerOpened, cab.styles.drawerClosed);
        });
        
        tests.test("Start Open", function () {
            var cab = setup({startOpen: true});
            expect(cab.drawers.length * 2 + 2);

            openStylingTests(cab.drawers, cab.contents, cab.styles.drawerOpened, cab.styles.drawerClosed);
        });
        
        tests.test("Close a Single Drawer", function () {
            apiBasedTests("closeDrawers", true, 0);
        });
        
        tests.test("Open a Single Drawer", function () {
            apiBasedTests("openDrawers", false, 0);
        });
        
        tests.test("Toggle Close a Single Drawer", function () {
            apiBasedTests("toggleDrawers", true, 0);
        });
        
        tests.test("Toggle Open a Single Drawer", function () {
            apiBasedTests("toggleDrawers", false, 0);
        });
        
        tests.test("Close All Drawers", function () {
            apiBasedTests("closeDrawers", true);
        });
        
        tests.test("Open All Drawers", function () {
            apiBasedTests("openDrawers", false);
        });
        
        tests.test("Toggle Closed All Drawers", function () {
            apiBasedTests("toggleDrawers", true);
        });
        
        tests.test("Toggle Open All Drawers", function () {
            apiBasedTests("toggleDrawers", false);
        });
        
        tests.test("Prevent Events on Init Closed Drawers", function () {
            eventBasedTests(false, true);
        });
        
        tests.test("Prevent Events on Init Opened Drawers", function () {
            eventBasedTests(true, true);
        });
        
        tests.test("Fire Events on Init Closed Drawers", function () {
            eventBasedTests(false, false);
        });
        
        tests.test("Fire Events on Init Opened Drawers", function () {
            eventBasedTests(true, false);
        });
        
        tests.test("Fire Events on Drawer Closed", function () {
            eventBasedTests(true, true, "closeDrawers");
        });
        
        tests.test("Fire Events on Drawer Opened", function () {
            eventBasedTests(false, true, "openDrawers");
        });
        
        tests.test("Fire Events on Toggle Closed", function () {
            eventBasedTests(true, true, "toggleDrawers");
        });
        
        tests.test("Fire Events on Toggle Opened", function () {
            eventBasedTests(false, true, "toggleDrawers");
        });
        
        tests.test("Close Drawer With a Click", function () {
            eventBasedTests(true, true, "mouse", 0);
        });
        
        tests.test("Open Drawer With a Click", function () {
            eventBasedTests(false, true, "mouse", 0);
        });
        
        tests.test("Close Drawer With a Space Key", function () {
            eventBasedTests(true, true, "space", 0);
        });
        
        tests.test("Open Drawer With a Space Key", function () {
            eventBasedTests(true, true, "space", 0);
        });
        
        tests.test("Close Drawer With a Enter Key", function () {
            eventBasedTests(false, true, "enter", 0);
        });
        
        tests.test("Open Drawer With a Enter Key", function () {
            eventBasedTests(true, true, "enter", 0);
        });
    };
    
    $(document).ready(function () {
        cabinetTests();
    });
})(jQuery);
