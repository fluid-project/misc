/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_8*/

fluid_0_8 = fluid_0_8 || {};

(function ($, fluid) {
// GENERAL UTILITIES, but which currently are used only in this component:
    
    /** Returns an array of size count, filled with increasing integers, 
     *  starting at 0 or at the index specified by first. 
     */
    
    fluid.iota = function (count, first) {
        first = first | 0;
        var togo = [];
        for (var i = 0; i < count; ++ i) {
            togo[togo.length] = first++;
            }
        return togo;
        };
    
    fluid.countedSet = function () {
        that.map = {};
        that.count = 0;
        that.set = function (name, newVal) {
            var exist = map[name];
            if (!exist && exist !== 0) {
                map[name] = exist = 0;
            }
            count += (newVal - exist);
            map[name] = newVal;
        }
        that.copy = function (other) {
            for (var i in other) {
                that.set(i, 1);
            }
        }
        return that;
    };
    
    fluid.eventPenter = function(upstream) {
        var required = fluid.countedSet();
        var requiredNow = fluid.countedSet();

        var that = {}
        that.register = function(name) {
            required.set(name, 1);
            requiredNow.set(name, 1);
            };
        that.fire = function(name) {
            requiredNow.set(name, 0);
            if (requiredNow.count === 0) {
                upstream.fire();
                requiredNow.copy(required.map);
                }
            };
        return that;
        };


    /******************
     * Pager Bar View *
     ******************/

    
    function updateStyles(pageListThat, newModel, oldModel) {
        if (oldModel.pageIndex !== undefined) {
            var oldLink = pageListThat.pageLinks.eq(oldModel.pageIndex);
            oldLink.removeClass(pageListThat.options.styles.currentPage);
        }
        var pageLink = pageListThat.pageLinks.eq(newModel.pageIndex);
        pageLink.addClass(pageListThat.options.styles.currentPage); 


    }
    
    function bindLinkClick(link, events, eventArg) {
       link.unbind("click.fluid.pager");
       link.bind("click.fluid.pager", function() {events.initiatePageChange.fire(eventArg);});
    }
    
    // 10 -> 1, 11 -> 2
    function computePageCount(model) {
        model.pageCount = Math.max(1, Math.floor((model.totalRange - 1)/ model.pageSize) + 1);
    }
    
    function computePageLimit(model) {
        return Math.min(model.totalRange, (model.pageIndex + 1)*model.pageSize);
    }

    fluid.pager = function() {
        return fluid.pagerImpl.apply(null, arguments);
    };
    
    fluid.pager.directPageList = function (container, events, options) {
        var that = fluid.initView("fluid.pager.directPageList", container, options);
        that.pageLinks = that.locate("pageLinks");
        for (var i = 0; i < that.pageLinks.length; ++ i) {
            var pageLink = that.pageLinks.eq(i);
            bindLinkClick(pageLink, events, {pageIndex: i});
        }
        events.onModelChange.addListener(
            function (newModel, oldModel) {
                updateStyles(that, newModel, oldModel);
            }
        );
        that.defaultModel = {
            pageIndex: undefined,
            pageSize: 1,
            totalRange: that.pageLinks.length
        };
        return that;
    };
    
    fluid.pager.everyPageStrategy = fluid.iota;
    
    fluid.pager.gappedPageStrategy = function(locality, midLocality) {
        if (!locality) {
            locality = 3;
        }
        if (!midLocality) {
            midLocality = locality;
        }
        return function(count, first, mid) {
            var togo = [];
            var j = 0;
            var lastSkip = false;
            for (var i = 0; i < count; ++ i) {
                if (i < locality || (count - i - 1) < locality || (i >= mid - midLocality && i <= mid + midLocality)) {
                    togo[j++] = i;
                    lastSkip = false;
                }
                else if (!lastSkip){
                    togo[j++] = -1;
                    lastSkip = true;
                }
            }
            return togo;
        }
    };
    
    fluid.pager.renderedPageList = function(container, overallThat, pagerBarOptions, options) {
        var strings = overallThat.strings;       // TODO: proper IoC
        var penter = overallThat.onRenderPenter; // TODO: proper IoC
        var us = "fluid.pager.renderedPageList"; // TODO: proper IoC
        var options = $.extend(true, paerBarOptions, options);
        var that = fluid.initView("fluid.pager.renderedPageList", container, options);
        options = that.options; // pick up any defaults
        
        penter.register(us);
        
        var renderOptions = {
            cutpoints: [ {
              id: "page-link:link",
              selector: pagerBarOptions.selectors.pageLinks
            },
            {
              id: "page-link:skip",
              selector: pagerBarOptions.selectors.pageLinkSkip
            },
            {
              id: "page-link:disabled",
              selector: pagerBarOptions.selectors.pageLinkDisabled
            }
            ]};
        
        if (options.linkBody) {
            renderOptions.cutpoints[renderOptions.cutpoints.length] = {
                id: "payload-component",
                selector: options.linkBody
            };
          }
        function pageToComponent(current) {
          return function(page) {
            return page === -1? {
              ID: "page-link:skip"
            } : 
              {
              ID: page === current? "page-link:disabled": "page-link:link",
              value: page + 1,
              decorators: {
                jQuery: ["click", function() {events.initiatePageChange.fire({pageIndex: page});}]
              } 
            };
          };
        }
        var root = that.locate("root");
        fluid.expectFilledSelector(root, "Error finding root template for fluid.pager.renderedPageList");
        
        var template = fluid.selfRender(root, {}, renderOptions);
        events.onModelChange.addListener(
            function (newModel, oldModel) {
                if (!oldModel || newModel.pageCount !== oldModel.pageCount || newModel.pageIndex !== oldModel.pageIndex) {
                    var pages = that.options.pageStrategy(newModel.pageCount, 0, newModel.pageIndex);
                    var pageTree = fluid.transform(pages, pageToComponent(newModel.pageIndex));
                    pageTree[pageTree.length - 1].value = pageTree[pageTree.length - 1].value + strings.last;
                    fluid.reRender(template, root, pageTree, renderOptions);
                    // TODO: improve renderer so that it can locate these inline
                    that.pageLinks = that.locate("pageLinks");
                }
               updateStyles(that, newModel, oldModel);
               penter.fire(us);
            }
        );
        return that;
    };
    
    fluid.defaults("fluid.pager.renderedPageList",
        {
          selectors: {
            root: ".pager-links"
          },
          linkBody: "a",
          pageStrategy: fluid.pager.everyPageStrategy
        }
        );
    
    var updatePreviousNext = function (that, options, newModel) {
        if (newModel.pageIndex === 0) {
            that.previous.addClass(options.styles.disabled);
        } else {
            that.previous.removeClass(options.styles.disabled);
        }
        
        if (newModel.pageIndex === newModel.pageCount - 1) {
            that.next.addClass(options.styles.disabled);
        } else {
            that.next.removeClass(options.styles.disabled);
        }
    };
    
    fluid.pager.previousNext = function (container, events, options) {
        var that = fluid.initView("fluid.pager.previousNext", container, options);
        that.previous = that.locate("previous");
        bindLinkClick(that.previous, events, {relativePage: -1});
        that.next = that.locate("next");
        bindLinkClick(that.next, events, {relativePage: +1});
        events.onModelChange.addListener(
            function (newModel, oldModel, overallThat) {
                updatePreviousNext(that, options, newModel);
            }
        );
        return that;
    };

    fluid.pager.pagerBar = function (overallThat, container, options) {
        var that = fluid.initView("fluid.pager.pagerBar", container, options);
        that.pageList = fluid.initSubcomponent(that, "pageList", 
           [container, overallThat, that.options, fluid.COMPONENT_OPTIONS]);
        that.previousNext = fluid.initSubcomponent(that, "previousNext", 
           [container, overallThat.events, that.options, fluid.COMPONENT_OPTIONS, overallThat.strings]);
        
        return that;
    };

    
    fluid.defaults("fluid.pager.pagerBar", {
            
       previousNext: {
           type: "fluid.pager.previousNext"
       },
      
       pageList: {
           type: "fluid.pager.directPageList"
       },
        
       selectors: {
           pageLinks: ".page-link",
           pageLinkSkip: ".page-link-skip",
           pageLinkDisabled: ".page-link-disabled",
           previous: ".previous",
           next: ".next"
       },
       
       styles: {
           currentPage: "current-page",
           disabled: "disabled"
       }
    });

    
    fluid.pager.directModelFilter = function (model, pagerModel) {
        var togo = [];
        var limit = computePageLimit(pagerModel);
        for (var i = pagerModel.pageIndex * pagerModel.pageSize; i < limit; ++ i) {
            togo[togo.length] = {index: i, row: model[i]};
        }
        return togo;
    };
   
  
    function expandPath(EL, shortRoot, longRoot) {
        if (EL.charAt(0) === "*") {
            return longRoot + EL.substring(1); 
        }
        else {
            return EL.replace("*", shortRoot);
        }
    }
    
    function expandVariables(value, opts) {
        var togo = "";
        var index = 0;
        while (true) {
            var nextindex = value.indexOf("${", index);
            if (nextindex === -1) {
                togo += value.substring(index);
                break;
            }
            else {
                togo += value.substring(index, nextindex);
                var endi = value.indexOf("}", nextindex + 2);
                var EL = value.substring(nextindex + 2, endi);
                if (EL === "VALUE") {
                    EL = opts.EL;
                }
                else {
                    EL = expandPath(EL, opts.shortRoot, opts.longRoot);
                }

                var value = fluid.model.getBeanValue(opts.dataModel, EL)
                togo += value;
                index = endi + 1;
            }
        }
        return togo;
    }
   
    function expandPaths(target, tree, opts) {
        for (i in tree) {
            var val = tree[i];
            if (val === fluid.VALUE) {
                if (i === "valuebinding") {
                    target[i] = opts.EL;
                }
                else {
                    target[i] = {"valuebinding" : opts.EL};
                }
            }
            else if (i === "valuebinding") {
                target[i] = expandPath(tree[i], opts);
            }
            else if (typeof(val) === 'object') {
                 target[i] = val.length !== undefined? [] : {};
                 expandPaths(target[i], val, opts);
            }
            else if (typeof(val) === 'string') {
                target[i] = expandVariables(val, opts);
            }
            else target[i] = tree[i];
        }
        return target;
    }
   
    function expandColumnDefs(filteredRow, opts) {
        var options = opts.options;
        var tree = fluid.transform(options.columnDefs, function(columnDef){
            var EL = columnDef.valuebinding;
            var key = columnDef.key;
            if (!EL) {
                fluid.fail("Error in definition for column with key " + key + ": valuebinding is not set");
            }
            opts.EL = expandPath(EL, opts.shortRoot, opts.longRoot);
            if (!key) {
                var segs = fluid.model.parseEL(EL);
                key = segs[segs.length - 1];
            }
            var ID = (options.keyPrefix? options.keyPrefix : "") + key;
            var togo;
            if (!columnDef.components) {
              return {
                  ID: ID,
                  valuebinding: opts.EL
              };
            }
            else if (typeof columnDef.components === 'function'){
                togo = columnDef.components(filteredRow.row, filteredRow.index);
            }
            else {
                togo = columnDef.components;
            }
            togo = expandPaths({}, togo, opts);
            togo.ID = ID;
            return togo;
        });
        return tree;
    }
   
    function fetchModel(overallThat) {
        return fluid.model.getBeanValue(overallThat.options.dataModel, 
            overallThat.options.dataOffset);
    }
   
    /** A body renderer implementation which uses the Fluid renderer to render a table section **/
   
    fluid.pager.selfRender = function (overallThat, options) {
        var root = $(options.root);
        var penter = overallThat.onRenderPenter; // TODO: proper IoC
        var us = "fluid.pager.selfRender"; // TODO: proper IoC
        penter.register(us);
        var template = fluid.selfRender(root, {}, options.renderOptions);
        return {
            returnedOptions: {
                listeners: {
                    onModelChange: function (newModel, oldModel) {
                        var dataModel = fetchModel(overallThat);
                        var filtered = overallThat.options.modelFilter(dataModel, newModel);
                        var dataModel = overallThat.options.dataModel;
                        var tree = fluid.transform(filtered, 
                            function(filteredRow) {
                                var cellRoot = (overallThat.options.dataOffset? overallThat.options.dataOffset + ".": "");
                                var shortRoot = filteredRow.index;
                                var longRoot = cellRoot + shortRoot; 
                                if (options.columnDefs === "explode") {
                                    return fluid.explode(filteredRow.row, root);
                                }
                                else if (options.columnDefs.length) {
                                    var tree = expandColumnDefs(filteredRow, {shortRoot: shortRoot,
                                        longRoot: longRoot,
                                        dataModel: dataModel,
                                        options: options});
                                    return tree;
                                }
                            }
                            );
                        var fullTree = {};
                        fullTree[options.row] = tree;
                        options.renderOptions = options.renderOptions || {};
                        options.renderOptions.model = dataModel;
                        fluid.reRender(template, root, fullTree, options.renderOptions);
                        penter.fire(us);
                    }
                }
            }
        };
    };

    fluid.defaults("fluid.pager.selfRender", {
         // strategy for generating a tree row, either "explode" or a function accepting data row
        columnDefs: "explode",
        keyStrategy: "id",
        keyPrefix: "",
        // Options passed upstream to the renderer
        renderOptions: undefined
      });


    fluid.pager.summary = function (dom, options) {
        var node = dom.locate("summary");
        return {
            returnedOptions: {
                listeners: {
                    onModelChange: function (newModel, oldModel) {
                        var text = fluid.stringTemplate(options.message, {
                          first: newModel.pageIndex * newModel.pageSize + 1,
                          last: computePageLimit(newModel),
                          total: newModel.totalRange});
                        if (node.length > 0) {
                            node.text(text);
                        }
                    }
                }
            }
        };
    };
    
    fluid.pager.directPageSize = function (that) {
        var node = that.locate("pageSize");
        if (node.length > 0) {
            that.events.onModelChange.addListener(
                function(newModel, oldModel) {
                    if (node.val() !== newModel.pageSize) {
                        node.val(newModel.pageSize);
                    }
                }
            );
            node.change(function() {
                that.events.initiatePageSizeChange.fire(node.val());
                });
        }
        return that;
    };

    fluid.pager.rangeAnnotator = function (that, options) {
        that.events.onRender.addListener( function () {
            var column = that.options.annotateRangeColumn;
            var dataModel = fetchModel(that);
            var columnDefs = that.columnDefs;
            if (!column || !dataModel || !columnDefs) {
                return;
            }
            
    });}

    /*******************
     * Pager Component *
     *******************/
    
    fluid.pagerImpl = function (container, options) {
        var that = fluid.initView("fluid.pager", container, options);
        
        function fireModelChange(newModel) {
               computePageCount(newModel);
               if (newModel.pageIndex >= newModel.pageCount) {
                   newModel.pageIndex = newModel.pageCount - 1;
               }
               if (newModel.pageIndex !== that.model.pageIndex || newModel.pageSize !== that.model.pageSize) {
                   that.events.onModelChange.fire(newModel, that.model, that);
                   fluid.model.copyModel(that.model, newModel);
               }            
        }
        
        that.events.initiatePageChange.addListener(
            function(arg) {
               var newModel = fluid.copy(that.model);
               if (arg.relativePage !== undefined) {
                   newModel.pageIndex = that.model.pageIndex + arg.relativePage;
               }
               else {
                   newModel.pageIndex = arg.pageIndex;
               }
               if (newModel.pageIndex === undefined || newModel.pageIndex < 0) {
                   newModel.pageIndex = 0;
               }
               fireModelChange(newModel);
            }
        );
        
        that.events.initiatePageSizeChange.addListener(
            function(arg) {
                var newModel = fluid.copy(that.model);
                newModel.pageSize = arg;
                fireModelChange(newModel);     
            }
            );

        // Setup the top and bottom pager bars.
        var pagerBarElement = that.locate("pagerBar");
        if (pagerBarElement.length > 0) {
            that.pagerBar = fluid.initSubcomponent(that, "pagerBar", 
            [that, pagerBarElement, fluid.COMPONENT_OPTIONS]);
        }
        
        var pagerBarSecondaryElement = that.locate("pagerBarSecondary");
        if (pagerBarSecondaryElement.length > 0) {
            that.pagerBarSecondary = fluid.initSubcomponent(that, "pagerBar",
               [that, pagerBarSecondaryElement, fluid.COMPONENT_OPTIONS]);
        }
 
        that.bodyRenderer = fluid.initSubcomponent(that, "bodyRenderer", [that, fluid.COMPONENT_OPTIONS]);
        
        that.summary = fluid.initSubcomponent(that, "summary", [that.dom, fluid.COMPONENT_OPTIONS]);
        
        that.pageSize = fluid.initSubcomponent(that, "pageSize", [that]);
        
        that.rangeAnnotator = fluid.initSubcomponent(that, "rangeAnnotator", [that, fluid.COMPONENT_OPTIONS]);
 
        that.model = fluid.copy(that.options.model);
        var dataModel = fetchModel(that);
        if (dataModel) {
            that.model.totalRange = dataModel.length;
        }
        if (that.model.totalRange === undefined) {
            if (!that.pagerBar) {
                fluid.fail("Error in Pager configuration - cannot determine total range, "
                + " since not configured in model.totalRange and no PagerBar is configured");
            }
            that.model = that.pagerBar.pageList.defaultModel;
        }

        that.onRenderPenter = fluid.eventPenter(that.events.onRenderComplete);

        that.events.initiatePageChange.fire({pageIndex: 0});

        return that;
    };
    
    fluid.defaults("fluid.pager", {
        pagerBar: {type: "fluid.pager.pagerBar", 
            options: null},
        
        summary: {type: "fluid.pager.summary", options: {
            message: "%first-%last of %total items"
        }},
        
        pageSize: {
            type: "fluid.pager.directPageSize"
        },
        
        modelFilter: fluid.pager.directModelFilter,
        
        bodyRenderer: {
            type: "fluid.emptySubcomponent"
        },
        
        model: {
            pageIndex: undefined,
            pageSize: 10,
            totalRange: undefined
        },
        
        dataModel: undefined,
        // Offset of the tree's "main" data from the overall dataModel root
        dataOffset: "",
        
        annotateRangeColumn: undefined,
        
        rangeAnnotator: {
            type: "fluid.pager.rangeAnnotator"
        },
        
        selectors: {
            pagerBar: ".pager-top",
            pagerBarSecondary: ".pager-bottom",
            summary: ".pager-summary",
            pageSize: ".pager-page-size"
        },
        
        strings: {
            last: " (last)"
        },
        
        events: {
            initiatePageChange: null,
            initiatePageSizeChange: null,
            onModelChange: null,
            onRenderComplete: null
        }
    });
})(jQuery, fluid_0_8);
