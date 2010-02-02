fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {

    var addURLFragment = function (url) {
        // This is really barely a sketch, and needs to be much more thoroughly thought out.
        var loc = window.location.href;
        var fragIdx = loc.indexOf("#");
        var newFrag = "#" + url;
        window.location = fragIdx > -1 ? loc.substring(0, fragIdx ) + newFrag : loc + newFrag;
    };
    
    var injectElementsOfType = function (container, elementType, elements) {
        if (!elements || elements.length < 1) {
            return;
        }
        
        var elementsOfType = $(elementType, container);
        var repeat = elementsOfType.length === 0 ? function (idx, element) {
            container.append(element);
        } : function (idx, element) {
            var lastEl = $(elementType + ":last", container);
            lastEl.after(element);
        };
        
        $.each(elements, repeat);
    };
    
    var inject = function (doc, container) {
        if (!doc || doc === "") {
            return;
        }
        
        var headTag = doc.match( /<head(.|\s)*?\/head>/gi)[0],
            bodyTag = doc.match(/<body(.|\s)*?\/body>/gi)[0], // TODO: this regexp needs to be refined to exclude the body tags
            linkTags = [].concat(headTag.match(/<link(.|\s)*?\/>/gi)).concat(headTag.match(/<link(.|\s)*?\/link>/gi)),
            scriptTags = headTag.match(/<script(.|\s)*?\/script>/gi);
        
        var head = $("head");
        injectElementsOfType(head, "link", linkTags);
        injectElementsOfType(head, "script", scriptTags);
        container.html(bodyTag); 
    };
    
    var setupScreenNavigatorLite = function (that) {
        // Bind a live click event that will override all natural page transitions and do them via Ajax instead.
        $("a:not([href^=#])").live("click", function (evt) {
            var url = $(this).attr("href");
            that.injectPage(url);
            // Use URL fragments to retain the vaguest semblance of sanity.
            addURLFragment(url);
            evt.preventDefault();
        });
    };
    
    fluid.engage.screenNavigatorLite = function (container) {
        var that = {
            container: container ? fluid.container(container) : $("body")
        };
        
        that.injectPage = function (url) {
            $.ajax({
                url: url,
                dataType: "text",
                success: function (doc) {
                    inject(doc, that.container);
                },
                error: function (xhr, textstatus, errthrown) {
                    fluid.log("An error occurred while trying to fetch a page: " + textstatus);
                }
            });
        };
        
        setupScreenNavigatorLite(that);
        return that;
    };
    
})(jQuery);
