/*
Copyright 2007 University of Toronto

Licensed under the GNU General Public License or the MIT license.
You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the GPL and MIT License at
https://source.fluidproject.org/svn/sandbox/tabindex/trunk/LICENSE.txt
*/

// Constants.
var LIST_WITH_SEL = "#listWithTabIndex";
var LINK_WITH_SEL = "#linkWithTabIndex";
var LINK_NEGATIVE_SEL = "#linkWithNegativeTabIndex";
var HEADING_WITHOUT_SEL = "#headingWithNoTabIndex";
var LINK_WITHOUT_SEL = "#linkNoTabIndex";
var LIST_ITEM_WITHOUT_SEL = "#foodNoTabIndex";

function exposeTestFunctionNames () {
    return [
        "testGetTabIndex",
        "testSetTabIndex_NoPreviousTabIndex",
        "testSetTabIndex_ExistingTabIndex",
        "testRemoveTabIndex",
        "testHasTabIndex"
    ];
}

var setUpPageStatus;
var cleanPageContents;

function setUpPage () {
	// Make a deep copy of the whole page and set it aside because jsUnit sucks.
	cleanPageContents = jQuery ("#pageContents").clone (true);
	setUpPageStatus = "complete";
};

function tearDown () {
	// After a test has run, swap out the current, dirty page with the clean one.
	var pageClone = jQuery (cleanPageContents).clone (true);
	jQuery ("#pageContents").replaceWith (pageClone);
};

function testGetTabIndex () {
	// Test an element with a tabindex of 0.
	var element = jQuery (LIST_WITH_SEL);
	assertEquals ("The element should return a tabindex of 0.", 0, element.tabindex ());

	// And one with a postive tabindex.
	element = jQuery (LINK_WITH_SEL);
	assertEquals ("The link should have a positive tabindex.", 2, element.tabindex ());

	// And one with a negative tabindex.
	element = jQuery (LINK_NEGATIVE_SEL);
	assertEquals ("The link should have a negative tabindex.", -1, element.tabindex ());

	// And a regular element without a tabindex.
	element = jQuery (HEADING_WITHOUT_SEL);
	assertUndefined ("The heading should have an undefined tabindex.", element.tabindex ());

	// And a link without a tabindex.
	element = jQuery (LINK_WITHOUT_SEL);
	assertUndefined ("The link should have an undefined tabindex.", element.tabindex ());
}

function testSetTabIndex_NoPreviousTabIndex () {
	var element = jQuery (HEADING_WITHOUT_SEL);
	assertUndefined ("The heading should have an undefined tabindex.", element.tabindex ());

	// Set a positive string
	element.tabindex ("1");
	assertEquals ("The heading should have a tabindex of 1.", 1, element.tabindex ());

	// Set a zero string
	element.tabindex ("0");
	assertEquals ("The heading should now have a tabindex of 0.", 0, element.tabindex ());

	// Set a negative string
	element.tabindex ("-1");
	assertEquals ("The heading should now have a tabindex of -1.", -1, element.tabindex ());

	// Set a positive number
	element.tabindex (12);
	assertEquals ("The heading should now have a tabindex of 12.", 12, element.tabindex ());

	// Set a zero number
	element.tabindex (0);
	assertEquals ("The heading should now have a tabindex of 0.", 0, element.tabindex ());

	// Set a negative string
	element.tabindex (-1);
	assertEquals ("The heading should now have a tabindex of -1.", -1, element.tabindex ());
}

function testSetTabIndex_ExistingTabIndex () {
	var element = jQuery (LINK_WITH_SEL);
	assertEquals ("To start with, the link should have a tabindex of 2.", 2, element.tabindex ());

	element.tabindex (-1);
	assertEquals ("After setting it, the link should now have a tabindex of -1.", -1, element.tabindex ());
}

function testRemoveTabIndex () {
	// Grab an element that already has a tabindex and remove it.
	var element = jQuery (LINK_WITH_SEL);
	assertEquals ("Before removing, the link should have a tabindex of 2.", 2, element.tabindex ());
	element.removeTabindex ();
	assertUndefined ("After removing it, the link's tabindex should be undefined.", element.tabindex ());

	// Grab an element without a tabindex, give it one, then remove it.
	element = jQuery (LIST_ITEM_WITHOUT_SEL);
	assertUndefined("Before adding one, the link should have an undefined tabindex.", element.tabindex ());
	element.tabindex ("0");
	assertEquals ("After adding it, the link should have a tabindex of 0.", 0, element.tabindex ());
	element.removeTabindex ();
	assertUndefined("After removing it, the link should have an undefined tabindex again.", element.tabindex ());

	// Grab an element with no tabindex and try to remove it.
	element = jQuery (HEADING_WITHOUT_SEL);
	assertUndefined ("Before removing it, the headings's tabindex should be undefined.", element.tabindex ());
	element.removeTabindex ();
	assertUndefined ("After removing it, the headings's tabindex should still be undefined.", element.tabindex ());
}

function testHasTabIndex () {
	// Test an element with a positive tab index.
	var element = jQuery (LINK_WITH_SEL);
	assertTrue ("A link with a postive tabindex should report as having a tabindex.", element.hasTabindex());

	// One with a zero tabindex.
	element = jQuery (LIST_WITH_SEL);
	assertTrue ("A list with a zero tabindex should report as having a tabindex.", element.hasTabindex());

	// One with a negative tabindex.
	element = jQuery (LINK_NEGATIVE_SEL);
	assertTrue ("A link with a negative tabindex should report as having a tabindex.", element.hasTabindex());

	// And a few without.
	element = jQuery (HEADING_WITHOUT_SEL);
	assertFalse ("A heading without a tabindex should not report as having a tabindex.", element.hasTabindex());

	element = jQuery (LINK_WITHOUT_SEL);
	assertFalse ("A link without a tabindex should not report as having a tabindex.", element.hasTabindex());
}
