var tests_triggers={
	name : "TriggerTest",
	setUp : function() {
		triggers = {};
	}
    , run_trigger : function() {
		addTrigger('test',function(line) { return "bbb"} );
		assertEquals("bbb",runTriggers('aaa'));
    }
    , trigger_line : function() {
		addTrigger('test',function(line) { if (line.match(/aaa/)) return "bbb"; else return line; } );
		assertEquals("bbb",runTriggers('aaa'));
    }
    , property_update : function() {
	    var player = {};
		addTrigger('test', withPlayer(property_update(/b(.)b/,'test'),player));
		assertEquals("bab",runTriggers('bab'));
		assertEquals("a",player.test);
   }
   , property_update_multipe : function() {
	    var player = {};
		addTrigger('test', withPlayer(property_update(/b(.)b/,'test,test1'),player));
		assertEquals("bab",runTriggers('bab'));
		assertEquals("a",player.test);
		assertEquals("a",player.test1);
   }
   , _highlight_style : function() {
		addTrigger('test', highlight({ trigger: /b(.)b/, style: {color:"red"}}));
		assertEquals("b<span style='color:red'>a</span>b",runTriggers({line:'bab'}).line);
   }
}
function runTestSuite() {
	runTests([tests_triggers]);
}

function runTests(testCases) {
	$('<pre>').attr("id","test-results").appendTo('body').dialog({width: 500, height:500});
	for (var i=0;i<testCases.length;i++) {
		runTestCase(testCases[i]);
	}
}

function runSetUp(testCase) {
	var setUp = testCase["setUp"];
	if (typeof(setUp)=="function") {
		try {
			setUp();
		} catch(e) {
			results.setUp = "Failed setUp: "+e.message;
		}
	}
}

function runTestCase(testCase) {
	var results={ name : testCase.name, count : 0, errors : []}
	for (test in testCase) {
		if (test == "setUp") continue;
		runSetUp(testCase);
		if (testCase.hasOwnProperty(test) && typeof(testCase[test])=="function") {
			runTest(testCase,test,results);
		}
	}
	showTestResults(results);
}

function showTestResults(results) {
	var resultDialog=$('#test-results');
	var errorCount = results.errors.length;
	for (var i=0;i<errorCount;i++) {
		resultDialog.append(results.errors[i]+"\n");
	}
	var msg="Test: "+results.name+" Tests "+results.count+" Success: "+(results.count - errorCount) +" Failed "+errorCount;
	resultDialog.append($('<span>').css({color: errorCount > 0 ? "red" : "green"}).text(msg));
}

function runTest(testCase, test, results) {
	if (test.charAt(0)=='_') return;
	try {
		results.count+=1;
		testCase[test]();
	} catch(e) {
		results.errors.push("Failed "+test+": "+e);
	}
}
function assertEquals(expected, value) {
	if (expected!=value) {
		throw "Assert failed: "+expected+"!="+value;
	}
}	
