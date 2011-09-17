var inputHistory = [];
var histoffset = 0;

function addToHistory(text) {
	if (text==null) return;
	var idx=jQuery.inArray(text,inputHistory);
	if (idx>-1) {
		inputHistory = inputHistory.splice(idx,1);
	}
	inputHistory.push(text);
	histoffset = inputHistory.length-1;
}

function history_prev() {
	var result = inputHistory[histoffset];
	histoffset -= 1;
	if (histoffset < 0) histoffset = 0;
	return result;
}

function history_next() {
	var result = inputHistory[histoffset];
	histoffset += 1;
	if (histoffset >= inputHistory.length) histoffset = inputHistory.length - 1;
	return result;
}