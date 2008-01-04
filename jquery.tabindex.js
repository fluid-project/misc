(function ($) {
	// Private functions.
	var normalizeTabIndexName = function () {
	    return jQuery.browser.msie ? "tabIndex" : "tabindex";
	}

	var getValue = function (elements) {
		if (!elements.hasTabIndex ()) {
			return null;
		}

        // Get the attribute (.attr () doesn't work) and return it as a number value.
		var value = elements[0].getAttribute (normalizeTabIndexName ());
		return Number (value);
	};

	var setValue = function (elements, toIndex) {
		return elements.each (function () {
			$ (this).attr (normalizeTabIndexName (), toIndex);
		});
	};

	// Public methods.
	$.fn.tabIndex = function (toIndex) {
		if (toIndex !== null && toIndex !== undefined) {
			return setValue (this, toIndex);
		} else {
			return getValue (this);
		}
	};

	$.fn.removeTabIndex = function () {
		return this.each(function () {
			$ (this).removeAttr (normalizeTabIndexName ());
		});
	};

	$.fn.hasTabIndex = function () {
	    var attributeNode = this[0].getAttributeNode (normalizeTabIndexName ());
        return attributeNode ? attributeNode.specified : false;
	};
}) (jQuery);
