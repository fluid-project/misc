/*global fluid, jQuery, window*/

var fluid = fluid || {};

(function ($, fluid) {
    /*
     * TOOD: accessibility review
     */

    // Private functions
    var findTarget = function (el) {
        var url;
        var found = $(el).closest("a");
        if (found.length !== 0) {
            url = found.attr("href");
            return (url.charAt(0) === "#") ? url : found;
        } else {
            return null;
        }
    };
    var extractKeysFromObject = function (obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    };
    var getObjectLength = function (obj) {
        return extractKeysFromObject(obj).length;
    };
    
    var setup = function (that) {
        that.firstRun = true;
        that.viewsHash = {};
        that.currentPath = "";

        var coreContainer = that.locate("viewContainer");
        // Webkit CSS event to listent to
        coreContainer.bind("webkitTransitionEnd", that.animationEventComplete);
        coreContainer.bind("orientationchange", that.orientationChange);

        ///////////////////////////////////////////////////
        // Events
        ///////////////////////////////////////////////////
        
        that.container.bind("touchstart", function (event) {
            var target = findTarget(event.target);
            //if (target) target.addClass(that.options.styles.loadingIndicator);
        }); 
        
        
        
        
        
        // Click
        // noClickDelay to remove 300ms delay on iPhone for click events
        //new NoClickDelay(that.locate("viewContainer")[0]); // destroys page scrolling gesture

        // click event binding
        that.container.bind("click", function (event) {            
            var target = findTarget(event.target);
            // Handle different kinds of anchor links...
            if (target) {
                that.events.onSelected.fire(event); // when a link is found, fire intercept event
                event.preventDefault();                
                if (typeof(target) !== "string" && !target.is(that.options.selectors.backButton)) {                    
                    target.addClass(that.options.styles.loadingIndicator);
                    that.loadView(target.attr("href"), 1);
                    
                } else if (typeof(target) !== "string" && target.is(that.options.selectors.backButton)) {
                    that.loadView(target.attr("href"), -1);
                    
                } else if (typeof(target) === "string") {
                    // TODO: show fragments different? Could slide into view like other views?
                }
            }
        });

        that.loadView(that.options.startUrl, 0); 
    };
    
    /************************************************************************************/
    /*
     * Manage content loading and positioning
     * @param {Object} container
     * @param {Object} options
     */
    fluid.screenNavigator = function (container, options) {
        var that = fluid.initView("fluid.screenNavigator", container, options);

        /**
         * Set a flag to identify the orientation of the device
         * @param {Object} event
         */
        that.orientationChange = function (event) {
            var orientation = "";
            switch (window.orientation)
            {
            case 0:
                orientation = "portraitNormal";
                break;
            case -90:
                orientation = "landscapeClockwise";
                break;
            case 90:
                orientation = "landscapeCounterClockwise";
                break;
            case 180:
                orientation = "portraitReverse";
                break;
            }            
            that.locate("viewContainer").attr("orientation", orientation);
            that.events.afterOrientationChange.fire(window.orientation);
        };

        /**
         * Load View
         * If a view is new, fetch via ajax
         * else just use the existing content
         * @param {Object} url
         */        
        that.loadView = function (url, direction) {
            that.navDirection = direction;
            if (that.viewsHash[url]) {
                // content already exists, show it
                // if desired view is current view, ignore it
                if (that.currentPath !== url) {
                    that.showView(url);
                }                
            } else {
                // content is new, get via ajax
                that.events.onFetchContent.fire(url, that.navDirection);
                that.options.viewFetcher(that, url);
            }
        };
        
        /**
         * Takes an element and prepares its position based on the navigation direction 
         * BEFORE any transitions are applied to it
         * @param {Object} el
         */
        that.prepViewPos = function (el, direction, phase) {
            var classNames;

            if (direction === -1) {
                classNames = (phase === "outgoing") ? that.options.styles.current : that.options.styles.previous;
            } else if (direction === 1) {
                classNames = (phase === "outgoing") ? that.options.styles.current : that.options.styles.next;
            } else {
                classNames = that.options.styles.current;
            }

            el.attr('class', classNames);
        };
        
        /**
         * Insert a new View into the DOM and return it for further uses
         * fire event when content has been injected into the DOM
         * @param {Object} url
         * @param {Object} ajaxContent
         */
        that.createView = function (url, direction, content) {
            var theView;
            theView = $('<div></div>').html(content);
            theView.addClass(that.options.styles.prepNext);
            that.locate("viewContainer").append(theView);
            
            return theView;            
        };
             
        /**
         * Use a URL to bring content into view. 
         * Direction identifies which animation direction to use
         * @param {Object} url
         * @param {Object} dir
         */
        that.showView = function (url) {
            var currentView = that.currentPath; // previous content path
            var nextView = url; // latest content path
            
            // update global content paths
            that.currentPath = nextView;
            that.previousPath = currentView;
            
            // event for when content is accessible in the DOM, BEFORE animations are fired
            that.events.afterContentReady.fire(that.viewsHash[url]);            

            if (that.firstRun) {
                that.firstRun = false;                
                that.prepViewPos(that.viewsHash[url], that.navDirection);
                                
                if (that.options.toggleVisibility) {
                    that.viewsHash[url].show();
                }                
				that.events.afterTransition.fire(event, that); // on first run, the "transition" would just snap 
            } else {
                // NOT FIRST RUN
                
                // Prep view positioning before animation runs
                that.prepViewPos(that.viewsHash[currentView], that.navDirection, "outgoing");
                that.prepViewPos(that.viewsHash[nextView], that.navDirection, "incoming");

                // Unhide if required
                if (that.options.toggleVisibility) {
                    //that.viewsHash[currentView].show();
                    that.viewsHash[nextView].show();
                }
                
                // Identify views (screenSelectors control which element has which class name at a given time)
                that.viewsHash[currentView].addClass(that.options.screenSelectors.current);
                that.viewsHash[nextView].addClass(that.options.screenSelectors.next);
                
                // Run animations
                setTimeout(function () {
                    $.each(that.options.animations, function (element, animationFunction) {
                        animationFunction(that.locate(element), that.navDirection, that);
                    });
                }, 0);

            }
        };

        /**
         * When a transition is finished
         * excersise cleanup and fire event for any further options
         * @param {Object} event
         */
        that.animationEventComplete = function (event) {
            that.locate("loadingIndicator").removeClass(that.options.styles.loadingIndicator); // turn off loading indicator
            if (that.options.toggleVisibility && that.viewsHash[that.previousPath]) {
                that.viewsHash[that.previousPath].hide();
            }
            that.events.afterTransition.fire(event, that);
        };
        
        setup(that);
        return that;
    };


    /************************************************************************************/
    /* Public overwriteable functions */
    fluid.screenNavigator.ajaxViewFetcher = function (that, url) {
        var direction = that.navDirection;

        $.ajax({            
            url: that.options.pathPrefix + url,
            error: function (XMLHttpRequest, status, error) {
                that.events.afterFetchContent.fire(false, status, XMLHttpRequest);
                that.locate("loadingIndicator").removeClass(that.options.styles.loadingIndicator);
            },            

            success: function (data, status) {
                 // incoming nodes within the <body> are innjected, including scripts
                var content = $("<div/>").append(data).find(">*");
                that.events.afterFetchContent.fire(true, status, data);
                
                that.viewsHash[url] = that.createView(url, direction, content);            
                that.showView(url);
            }
        });
    };

    fluid.screenNavigator.slideOutAnimation = function (el, direction, that) {
        var newPosition = (direction > 0) ? that.options.styles.previous : that.options.styles.next;        
        el.attr('class', newPosition);
    };

    fluid.screenNavigator.slideInAnimation = function (el, direction, that) {
        el.attr('class', that.options.styles.current);
    };

    fluid.screenNavigator.fadeOut = function (el, direction, that) {
        // remove all previously applied fadeout fx
        $(".fl-screenNavigator-fadeout").removeClass("fl-screenNavigator-fadeout");
        
        // if this navbar is within the outgoing screen, use a fade out        
        var navbar = $(that.viewsHash[that.previousPath]).children(that.options.selectors.header);        
        navbar.addClass('fl-screenNavigator-fadeout');
    };

    /************************************************************************************/
    /* Defaults storage */
    fluid.defaults("fluid.screenNavigator", {
        pathPrefix: "",
        startUrl: "home.html",
        toggleVisibility: true,
        selectors: {
            header: ".flc-screenNavigator-navbar",
            nextView: ".flc-screenNavigator-nextView",
            currentView: ".flc-screenNavigator-currentView",
            backButton: ".flc-screenNavigator-backButton",
            viewContainer: ".flc-screenNavigator-view-container",
            loadingIndicator: ".fl-link-loading"
        },
        styles : {
            current: "fl-screenNavigator-view fl-transition-slide",
            previous: "fl-screenNavigator-view fl-screenNavigator-hide-left fl-transition-slide",
            next: "fl-screenNavigator-view fl-screenNavigator-hide-right fl-transition-slide",
            loadingIndicator: "fl-link-loading",
            prepPrevious: "fl-screenNavigator-view fl-screenNavigator-hide-left",
            prepNext: "fl-screenNavigatorl-view fl-screenNavigator-hide-right"
        },
        screenSelectors : {
            next :  "flc-screenNavigator-nextView",
            current : "flc-screenNavigator-currentView"
        },
        events : {
            onSelected : null,
            onTouched : null,
            onFetchContent: null,
            afterFetchContent: null,
            afterContentReady : null,
            afterTransition : null,
            afterOrientationChange : null
        },
        animations : {
            "currentView": fluid.screenNavigator.slideOutAnimation,
            "nextView": fluid.screenNavigator.slideInAnimation,
            "header": fluid.screenNavigator.fadeOut
        },
        viewFetcher: fluid.screenNavigator.ajaxViewFetcher
    });    
    
})(jQuery, fluid);