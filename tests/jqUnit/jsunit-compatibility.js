// Eventually these should be moved into the TestCase object.
function assertEquals (msg, expected, actual) {
    equals (actual, expected, msg);
}

function assertTrue (msg, expected) {
    ok (expected, msg);
}

function assertFalse(msg, expected) {
    ok (!expected, msg);
}

function assertUndefined(msg, expected) {
    equals ((typeof expected), 'undefined', msg);
}

function assertNotUndefined (msg, expected) {
    ok (!(typeof expected === 'undefined'), msg);
}

function assertNull (msg, expected) {
    equals (expected, null, msg);
}

function assertNotNull (msg, expected) {
    ok (!(expcted === null), msg);
}
