var store = new Persist.Store('MG-Client');
// store trigger, window(s), button basisobjekte ?
// separat liste der gespeicherten dinge
// scripte -> id -> fun
function storeData(id, data, doIndex) {
	if (doIndex) {
		addToIndex(id)
	}
	store.set(id, data);
	return data;
}

function addToIndex(id) {
	store.get("__index__", function(ok,index) {
		if (!ok || index==null) {
			index = Array()
		} else {
			index = index.split(/\x00/)
		}
		var idx=jQuery.inArray(id,index);
		if (idx==-1) {
			console.log(" add index "+index+" typ "+typeof(index))
			index.push(id);
			store.set("__index__",index.join("\x00"))
		}
	})
}

function removeFromIndex(id) {
	store.get("__index__", function(ok,index) {
		if (ok && index!=null) {
			index = index.split(/\x00/)
			var idx=jQuery.inArray(id,index);
			if (idx!=-1) {
				index.slice(idx,1)
				store.set("__index__",index.join("\x00"))
			}
	}})
}

function getIndex(fun) {
	store.get("__index__", function(ok,index) {
		console.log(" get index "+index+" typ "+typeof(index))
		if (!ok || index==null) {
			fun(Array())
		} else {
			fun(index.split(/\x00/))
		}
	})
}

function loadData(id, fun) {
	store.get(id, function(ok, data) {
	  if (ok)
	    fun(data)
	  else
	    fun(null)
	});
}

function removeData(id) {
	store.remove(id);	
	removeFromIndex(id);
}
