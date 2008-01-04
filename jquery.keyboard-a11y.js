(function ($) {
    // Public methods.
    $.fn.tabbable = function () {
        fluid.access.makeTabFocussable (this);
        return this;
    };

    $.fn.selectable = function (container, handlers, options) {
        var ctx = fluid.access.makeSelectable(container, this, handlers, options);
        this.selectable.selectionContext = ctx;
        this.selectable.userHandlers = handlers;
        return this;
    };

    $.fn.activatable = function (fn) {
        fluid.access.makeActivatable (this, fn);
        return this;
    };

    $.fn.selectNext = function () {
        fluid.access.selectNext(this.selectable.selectionContext, this.selectable.userHandlers);
        return this;
    };

    $.fn.selectPrevious = function () {
        fluid.access.selectPrevious(this.selectable.selectionContext, this.selectable.userHandlers);
        return this;
    };

    $.fn.drawSelection = function () {
        fluid.access.drawSelection (this, this.selectable.handlers.willSelect);
        return this;
    };

    $.fn.eraseSelection = function () {
        fluid.access.eraseSelection (this, this.selectable.handlers.willUnselect);
        return this;
    };
}) (jQuery);
