var jqUnit = function () {
    // TestCase object
    function TestCase (moduleName, setUpFn, tearDownFn) {
        this.moduleName = moduleName;
        this.setUp = setUpFn || null;
        this.tearDown = tearDownFn || null;

        module(this.moduleName);
    };

    TestCase.prototype.test = function (string, testFn) {
        if (this.setUp) {
            this.setUp ();
        }

        test (string, testFn);

        if (this.tearDown) {
            this.tearDown ();
        }
    };

    TestCase.prototype.assertEquals = function (msg, expected, actual) {
        equals (actual, expected, msg);
    };

    TestCase.prototype.assertTrue = function (msg, expected) {
        ok (expected, msg);
    };

    TestCase.prototype.assertFalse = function (msg, expected) {
        ok (!expected, msg);
    };

    TestCase.prototype.assertUndefined = function (msg, expected) {
        equals ((typeof expected), 'undefined', msg);
    };

    TestCase.prototype.assertNotUndefined = function (msg, expected) {
        ok (!(typeof expected === 'undefined'), msg);
    }

    TestCase.prototype.assertNull = function (msg, expected) {
        equals (expected, null, msg);
    };

    TestCase.prototype.assertNotNull = function (msg, expected) {
        ok (!(expected === null), msg);
    };

    //  jqUnit namespace.
    return {
        TestCase: TestCase
    };
} ();
