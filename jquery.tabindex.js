(function ($) {
	// Private functions.
	var getValue = function (elements) {
		if (!elements.hasTabIndex ()) {
			return null;
		}

		// Normalize to a number value.
		return Number(elements.attr ("tabIndex"));
	};
	
	var setValue = function (elements, toIndex) {
		return elements.each (function () {
			$ (this).attr ("tabIndex", toIndex);
		});
	};
	
	var tabIndexExistsIE = function (elements) {
		// This will report wrong on old versions if IE that don't have the getAttributeNode function.
		// As far as I know, there's simply no reliable way of determining if a tabindex exists in IE < 6.
		if (!elements[0].getAttributeNode || !elements[0].getAttributeNode ("tabIndex").specified) {
			return false;
		}
		
		return true;
	};
	
	var tabIndexExistsNonIE = function (elements) {
		var tabIndexValue = elements.attr ("tabIndex");
		// Be careful; some browsers will return number values for real tab indexes,
		// so we can't just check if the tabindex value is falsey.
		if (tabIndexValue === null || tabIndexValue === undefined) {
			return false;
		}
		
		return true;
	};
	
	// Public functions.
	$.fn.tabIndex = function (toIndex) {
		if (toIndex !== null && toIndex !== undefined) {
			return setValue (this, toIndex);
		} else {
			return getValue (this);
		}
	};
	
	$.fn.removeTabIndex = function () {
		return this.each(function () {
			$ (this).removeAttr ("tabIndex");
		});
	};
	
	$.fn.hasTabIndex = function () {
		if ($.browser.msie) {
			return tabIndexExistsIE (this);
		}
		return tabIndexExistsNonIE (this);
	};
}) (jQuery);