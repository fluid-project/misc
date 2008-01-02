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
	assertEquals ("The element should return a tabindex of 0.", 0, element.tabIndex ());
	
	// And one with a postive tabindex.	
	element = jQuery (LINK_WITH_SEL);
	assertEquals ("The link should have a positive tabindex.", 2, element.tabIndex ());
	
	// And one with a negative tabindex.
	element = jQuery (LINK_NEGATIVE_SEL);
	assertEquals ("The link should have a negative tabindex.", -1, element.tabIndex ());
	
	// And a regular element without a tabindex.
	element = jQuery (HEADING_WITHOUT_SEL);
	assertNull ("The heading should have a null tabindex.", element.tabIndex ());
	
	// And a link without a tabindex.
	element = jQuery (LINK_WITHOUT_SEL);
	assertNull ("The link should have a null tabindex.", element.tabIndex ());
}

function testSetTabIndex_NoPreviousTabIndex () {
	var element = jQuery (HEADING_WITHOUT_SEL);
	assertNull ("The heading should have a null tabindex.", element.tabIndex ());
	
	// Set a positive string
	element.tabIndex ("1");
	assertEquals ("The heading should have a tabindex of 1.", 1, element.tabIndex ());
	
	// Set a zero string
	element.tabIndex ("0");
	assertEquals ("The heading should now have a tabindex of 0.", 0, element.tabIndex ());
	
	// Set a negative string
	element.tabIndex ("-1");
	assertEquals ("The heading should now have a tabindex of -1.", -1, element.tabIndex ());
	
	// Set a positive number
	element.tabIndex (12);
	assertEquals ("The heading should now have a tabindex of 12.", 12, element.tabIndex ());
	
	// Set a zero number
	element.tabIndex (0);
	assertEquals ("The heading should now have a tabindex of 0.", 0, element.tabIndex ());
	
	// Set a negative string
	element.tabIndex (-1);
	assertEquals ("The heading should now have a tabindex of -1.", -1, element.tabIndex ());
}

function testSetTabIndex_ExistingTabIndex () {
	var element = jQuery (LINK_WITH_SEL);
	assertEquals ("To start with, the link should have a tabindex of 2.", 2, element.tabIndex ());
	
	element.tabIndex (-1);
	assertEquals ("After setting it, the link should now have a tabindex of -1.", -1, element.tabIndex ());
}

function testRemoveTabIndex () {
	// Grab an element that already has a tabindex and remove it.
	var element = jQuery (LINK_WITH_SEL);
	assertEquals ("Before removing, the link should have a tabindex of 2.", 2, element.tabIndex ());
	element.removeTabIndex ();
	assertNull ("After removing it, the link's tabindex should be null.", element.tabIndex ());

	// Grab an element without a tabindex, give it one, then remove it.
	element = jQuery (LIST_ITEM_WITHOUT_SEL);
	assertNull("Before adding one, the link should have a null tabindex.", element.tabIndex ());
	element.tabIndex ("0");
	assertEquals ("After adding it, the link should have a tabindex of 0.", 0, element.tabIndex ());
	element.removeTabIndex ();
	assertNull("After removing it, the link should have a null tabindex again.", element.tabIndex ());

	// Grab an element with no tabindex and try to remove it.
	element = jQuery (HEADING_WITHOUT_SEL);
	assertNull ("Before removing it, the headings's tabindex should be null.", element.tabIndex ());
	element.removeTabIndex ();
	assertNull ("After removing it, the headings's tabindex should still be null.", element.tabIndex ());
}

function testHasTabIndex () {
	// Test an element with a positive tab index.
	var element = jQuery (LINK_WITH_SEL);
	assertTrue ("A link with a postive tabindex should report as having a tabindex.", element.hasTabIndex());	
	
	// One with a zero tabindex.
	element = jQuery (LIST_WITH_SEL);
	assertTrue ("A list with a zero tabindex should report as having a tabindex.", element.hasTabIndex());
	
	// One with a negative tabindex.
	element = jQuery (LINK_NEGATIVE_SEL);
	assertTrue ("A link with a negative tabindex should report as having a tabindex.", element.hasTabIndex());
	
	// And a few without.
	element = jQuery (HEADING_WITHOUT_SEL);
	assertFalse ("A heading without a tabindex should not report as having a tabindex.", element.hasTabIndex());
	
	element = jQuery (LINK_WITHOUT_SEL);
	assertFalse ("A link without a tabindex should not report as having a tabindex.", element.hasTabIndex());
}
