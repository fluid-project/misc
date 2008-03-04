var fluid = fluid || {};

fluid.accessibleTabs =  function () {

    function activateTabHandler (tabsContainer, tabs) {
        return function (elementToActivate) {
            tabsContainer.tabs ('select', tabs.index (elementToActivate));
        };
    }

    return {
        setupTabs: function (tabsId) {
            jQuery("#" + tabsId).tabs ();
        },

        makeTabsKeyNavigable: function (tabsId) {
            var tabsContainer = jQuery("#" + tabsId).tabbable ();
            var tabs = tabsContainer.children("li");

            // Make the tabs selectable:
            //  * Pass in the container for the tabs (the <ul>)--the plugin binds keyboard handlers to this.
            //  * null because we don't want to have any special callbacks during selection
            //  * lastly, the options object allows to simply specify the direction (which defaults to vertical)
            tabs.selectable (tabsContainer, null, {direction: jQuery.a11y.orientation.HORIZONTAL});

            // Make the tabs activatable. Pass in a handler that just calls the standard tabs select function.
            tabs.activatable (activateTabHandler (tabsContainer, tabs));
        },

        initializeTabs: function (tabsId) {
            this.setupTabs (tabsId);
            this.makeTabsKeyNavigable (tabsId);
        }
    };
} ();
