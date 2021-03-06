	var esc_colors = {
		30 : 'black',          	
		31 : 'red',            	
		32 : 'green',          	
		33 : 'yellow',         	
		34 : 'blue',           	
		35 : 'magenta',        	
		36 : 'cyan',           	
		37 : 'white',          	

		40 : 'bgblack',        	
		41 : 'bgred',          	
		42 : 'bggreen',        	
		43 : 'bgyellow',       	
		44 : 'bgblue',         	
		45 : 'bgmagenta',      	
		46 : 'bgcyan',         	
		47 : 'bgwhite',        	

		4 : 'underline',       	
		1 : 'bright',            	
		5 : 'blink',           		
		8 : 'hidden',
		7 : 'reverse',
		2 : 'dim',
		0 : 'mudtext'
	};
	
	function esc_classes(match,color,background,flags) {
		var codes=match.split(/;/);
		for (i=0;i<codes.length;i++) {
			var code = codes[i] % 10;
			if (codes[i] == 0) {
			    color=null;background=null;flags=Array();
			}
			else if (codes[i] == 7) {
				if (background != null) color = background; else color = 0;
				if (color!=null) background = color; else background = 7;
			}
			else if (codes[i] < 10) {
			    var cmp="^"+codes[i]+"$";
				var found = false;
			    for (j = 0; j < flags.length;j++) {
				   if (flags[i].match(cmp)) found=true;
				}
				if (!found) {
					flags.push(codes[i]);
				}
			} else if (codes[i] < 40) {
			    color = color | code;
			} else {
			    background = background | code;
			}
	    }
		flags.sort();
//		console.log('Codes: '+ codes.join(' '));
		res = { color: color, background: background, flags: flags};
//		console.log(' State: color '+color+" background "+background+" flags "+flags);
		return res;
	}

    var ANSI_RE = /(\x1B\[([\d<;]+)m)/g;
    var ANSI_RE2 = /(\x1B\[([\d<;]+)m)/;

	function split_ansi(result) {
		if (!result.line.match(ANSI_RE)) {
			return false;
		}
		var line = result.line;
		result.history.push(result.line);
		result.line = "";
		var parts=line.replace(ANSI_RE,"\x00$1\x00").split(/\x00/);
	  	var color=null, background = null,flags = Array();
		for (var i=0;i<parts.length;i++) {
			var match;
			if (match=parts[i].match(ANSI_RE2)) {
				var tmp=flags.slice(); // copy array
				var res = esc_classes(match[2],color,background,tmp);
				var ncolor = res.color; nbackground = res.background; nflags = res.flags;
				var styles=[];
				if (color!=ncolor || nbackground != background || flags.join('') != nflags.join('')) {
				    if (color || background || flags.length) { // clear old
					  styles.push("clear");
				    }
					if (ncolor) {
						styles.push(esc_colors[30+ncolor]);
					}
					if (nbackground) {
						styles.push(esc_colors[40+nbackground]);
					}
					for (j=0;j<nflags.length;j++) {
						styles.push(esc_colors[nflags[j]]);
					}
				}
				color=ncolor; background=nbackground; flags=nflags;
				var style_pos = {pos:result.line.length, style:styles};
				result.styles.push(style_pos);
			} else {
				result.line += parts[i];
			}
		}
		return true;
	}
	
	function strip_esc_colors(text) {
		return text.replace(ANSI_RE,"");
	}
 	function color_escapes(text) {
      if (text == null) return text;
	  var color=null, background = null,flags = Array();
	  var result="";
	  var match;
	  while (match = text.match(/^(.*?)\x1B\[([0-9<;]+)m/m)) {
//		    console.log(match);
			var tmp=flags.slice();
			var res = esc_classes(match[2],color,background,tmp);;
			var ncolor = res.color; nbackground = res.background; nflags = res.flags;
//			console.log(' State: color '+color+" background "+background+" flags "+flags);
//			console.log(' State: ncolor '+ncolor+" nbackground "+nbackground+" nflags "+nflags);
			result += match[1];
			if (color!=ncolor || nbackground != background || flags.join('') != nflags.join('')) {
			    if (color!=null || background!=null || flags.length>0) {
				  result+='</span>';
			    }
			    if (ncolor!=null || nbackground!=null || nflags.length>0) {
     				result +='<span class="';
					if (ncolor!=null) {
     					result +=esc_colors[30+ncolor]+" ";
					}
					if (nbackground != null) {
     					result +=esc_colors[40+nbackground]+" ";
					}
					for (i=0;i<nflags.length;i++) {
     				    result += esc_colors[nflags[i]] + " ";
					}
     				result +='">';
     			 }
			}
			color=ncolor; background=nbackground; flags=nflags;
			text=text.substring(match[0].length);
	    }
		result +=text;
		return result;
	}
	function escapeHTML(result) {
        var text = result.line.replace(/&/g, "&amp;").replace(/</g, "&lt;"); // .replace(/>/g, "&gt;")
        if (text!=result.line) {
            result.history.push(result.line);
            result.line = text;
            return true;
        }
        return false;
	}
	