
var reps = 5;

var thing = " The String is a Thing, My Lord";

var ten = "Characters";

var sizes = {};

function generate(size) {
  var togo = "";
  var limit = size/10;
  for (var i = 0; i < limit; ++ i) {
    togo += ten;
    }
    return togo;
  }

function makeSizes() {
  sizes[1] = "1";
  sizes[5] = "FiveC";
  var size = 10;
  for (var i = 0; i < 4; ++ i) {
    sizes[size] = generate(size);
    sizes[size * 5] = generate(size * 5);
    size *= 10;
    }
  }

function blank() {
  }

blank.name = "Bare Function Call";

function newObject() {
  var togo = {};
  }
  
function newObject2Int() {
  var togo = {};
  togo.thing1 = 1;
  togo.thing2 = 2;
  }

function localInt() {
  var localInt = 5;
  var localInt2 = localInt;
  }
  
function globalInt() {
  var localInt = reps;
  var localInt2 = reps;
  }

function stringConcat() {
  var togo = thing + thing;
  }


function indexOf(size) {
  var trial = sizes[size];
  return trial.indexOf("scr=contribute-") === -1;
}

function startsWith1() {
  return thing.indexOf("scr=contribute-") === -1;
  }

function startsWith2() {
  var head = thing.substring("scr=contribute-".length);
  return head === "scr=contribute-";
  }
  
function startsWithChar1() {
  return thing.charAt(0) === "T";
  }

function startsWithChar2() {
  return thing.charCodeAt(0) === 84;
  }

var tenArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function allIn1() {
  for (var i in tenArray) {
    var j = tenArray[i];
  }
}

function allIn2() {
  for (var i = 0; i < tenArray.length; ++ i) {
    var j = tenArray[i];
  }
}


var WHITESPACE = " \t\n\r"; 

function nonWhite1() {
  var val = thing;
  var limit = val.length;
  for (var i = 0; i < limit; ++ i) { 
    if (WHITESPACE.indexOf(val.charAt(i)) === -1) {
      return i;
      }
    }
  }
  
function nonWhite2() {
  var val = thing;
  var limit = val.length;
  for (var i = 0; i < limit; ++ i) { 
    var c = val.charAt(i);
    if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') return i;
    }
  }

function nonWhite3() {
  var val = thing;
  var match = thing.match(/([ \t\n\r]*)/)[0].length;
  }

function white3() {
  var val = thing;
  var ind1 = val.indexOf(' ');
  var min = ind1 === -1? 65536 : ind1;
  var ind2 = val.indexOf('\t');
  min = ind2 === -1? min : (ind2 < min? ind2 : min);
  var ind3 = val.indexOf('\n');
  min = ind3 === -1? min : (ind3 < min? ind3 : min);
  var ind4 = val.indexOf('\r');
  min = ind4 === -1? min : (ind4 < min? ind4 : min);
  return min;
  }
  
function mismatch1() {
  var val = thing;
  return (val === "href" || val === "src" || val === "codebase" || val === "action");
  }

var matchex = /^(href|src|codebase|action)/;

function mismatch2() {
  return matchex.test(thing);
  }

var matchhash = {href: true, src: true, codebase: true, action: true};
matchhash[thing] = false;

function mismatch3() {
  return matchhash[thing];
}

var mismatch4 = 
(function() {
  //var matchhash2 = {href: true, src: true, codebase: true, action: true};
  //matchhash2[thing] = false;
  return function() {
    return matchhash[thing];
  }
})();

function concat(num) {
  var cat = "";
  for (var i = 0; i < num; ++ i) {
    cat = cat + ten;
    }
  }

function join(num) {
  var list = new Array(num);
  for (var i = 0; i < num; ++ i) {
    list[i] = ten;
    }
  var cat = list.join("");
  }

function writeOutput(string) {
  document.body.innerHTML = document.body.innerHTML + string;
  }


function testLoop(times) {
  var time = new Date();
  for (var i = 0; i < times; ++ i) {
    }
  var delay = (new Date() - time);
//  alert(delay);
  var usdelay = delay / (times/1000);
  writeOutput(times + " empty loop in " +  delay + "ms: " + usdelay + "us per iteration</br>");
  }

function testOne(toinvoke, times) {
  var exargs = [];
  if (arguments.length > 2) {
    for (var i = 2; i < arguments.length; ++ i) {
      exargs[exargs.length] = arguments[i];
      }
    }
  var time = new Date();
  for (var i = 0; i < times; ++ i) {
    toinvoke.apply(null, exargs);
    }
  var delay = (new Date() - time);
//  alert(delay);
  var usdelay = delay / (times/1000);
  var exargsn = exargs.length === 0? "" : ("("+exargs[0]+")");
  return {delay: delay, usdelay: usdelay, title: toinvoke.name + exargsn};
  writeOutput(times + " invocations of " + toinvoke.name + exargsn + " in " +  delay + "ms: " + usdelay + "us per call</br>");
  }

function formatResult(result) {
  return result.delay.toPrecision(4) + "ms: (" + result.usdelay.toPrecision(4) + "us/call)";
  }

var queue = [];

function test(toinvoke, times) {
  var args = []; // for some reason "arguments" is not a proper array
  for (var i = 0; i < arguments.length; ++ i) {
    args[i] = arguments[i];
    }
  queue[queue.length] = args;
}

function runTests() {
  testImpl.apply(null, queue[0]);
  queue = queue.slice(1);
  if (queue.length > 0) {
    window.setTimeout("runTests()", 1);
    }
  }

function $it(id) {
  return document.getElementById(id);
  }

function testImpl(toinvoke, times) {
  var row = "";
  var results = [];
  for (var i = 0; i < reps; ++ i) {
    results[i] = testOne.apply(null, arguments);
    }
  row += "<td>" + times + "</td><td>" + results[0].title + "</td>";
  for (var i = 0; i < reps; ++ i) {
    row += "<td>" + formatResult(results[i]) + "</td>";
    } 
  results.sort(function (a, b) {
    return a.usdelay - b.usdelay;
    });
  var sumdelay = 0, sumusdelay = 0;
  for (var i = 1; i < reps - 1; ++ i) {
    sumdelay += results[i].delay;
    sumusdelay += results[i].usdelay;
    }
  var medresult = {delay: (sumdelay / (reps - 2)), usdelay: (sumusdelay / (reps - 2))};
  row += "<td>" + formatResult(medresult) + "</td>";
  var element = document.createElement("tr");
  $it("table-body").insertBefore(element, document.getElementById("placeholder"));

  element.innerHTML = row;
}

function writeHeader() {
  var tree = {"header:": []};
  for (var i = 0; i < reps; ++ i) {
    tree["header:"][i] = i + 1;
    }
  fluid.selfRender($it("table-header"), tree);
    
//  var header = "<th>Count</th><th>Name</th>";
//  for (var i = 0; i < reps; ++ i) {
//    header += "<th>" + (i + 1) + "</th>";
//    }
//  header += "<th>Median ave</th>";
//  $it("table-header").innerHTML = header;
    
  document.getElementById("table-body").innerHTML = '<tr id="placeholder" style="display:none"></tr>';
}

function basicTests() {
  writeHeader();
  testLoop(1000000);
  test(blank, 100000);
  }

function runSingleTests() {
  basicTests();
  test(allIn1, 10000);
  test(allIn2, 10000);
  test(nonWhite3, 10000);
  test(nonWhite1, 10000);
  test(nonWhite2, 10000);
  test(mismatch1, 20000);
  test(mismatch2, 20000);
  test(mismatch3, 20000);
  test(mismatch4, 20000);
  test(startsWithChar1, 20000);
  test(startsWithChar2, 20000);
  test(newObject, 20000);
  test(newObject2Int, 20000);
  test(localInt, 20000);
  test(globalInt, 20000);
  test(stringConcat, 20000);
  test(startsWith1, 20000);
  test(startsWith2, 20000);
  test(concat, 5000, 10);
  test(join, 5000, 10);
  test(concat, 1000, 100);
  test(join, 1000, 100);

  runTests();
  }

function runJoinTests() {
  basicTests();
  var joinSize = [10, 50, 100, 500];
  for (var i in joinSize) {
    var size = parseInt(joinSize[i]);
    test(concat, 1000, size);
    test(join, 1000, size);  
    }
  runTests();
  }
  
function runScaleTests() {
  basicTests();
  makeSizes();
  for (var i in sizes) {
    var size = parseInt(i);
    test(indexOf, 10000, size);  
    }
  runTests();
  }