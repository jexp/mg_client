var history = Array()
var histoffset = 0;

function addToHistory(text) {
	if (text==null) return;
	var idx=jQuery.inArray(text,history);
	if (idx>-1) {
		history.splice(idx,1);
	}
	history.unshift(text);
	histoffset = 0;
}

function history_prev() {
	var result = history[histoffset];
	histoffset += 1;
	if (histoffset >= history.length) histoffset = history.length - 1;
	return result;
}

function history_next() {
	var result = history[histoffset];
	histoffset -= 1;
	if (histoffset < 0) histoffset = 0;
	return result;
}