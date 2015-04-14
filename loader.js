function Loader(audioContext, debug) {
    this.audioContext = audioContext;
    this.debug = debug;
    
    this.texts = {};
    this.sounds = {};
    this.images = {};
    
    this.pending = 0;
    this.loaded = 0;
}

Loader.prototype.loadText = function(url, name) {
    this.texts[name] = null;
    this.pending++;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    var me = this;
    request.onload = function() {
	me.texts[name] = request.response;
	me.pending--;
	me.loaded++;
	me.debug.showMessage("Done loading: " + url);
    }
    request.send();
}

Loader.prototype.loadSound = function(url, name) {
    this.sounds[name] = null;
    this.pending++;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    
    var me = this;
    request.onload = function() {
	me.audioContext.decodeAudioData(request.response, function(buffer) {
	    me.sounds[name] = buffer;
	    me.pending--;
	    me.loaded++;
	    me.debug.showMessage("Done loading: " + url);
	}, function() {
	    me.debug.showMessage("Unable to decode: " + url);
	});
    }
    request.send();
}

Loader.prototype.loadImage = function(url, name) {
    this.images[name] = null;
    this.pending++;
    var image = new Image();
    var me = this;
    image.onload = function() {
	me.images[name] = image;
	me.pending--;
	me.loaded++;
	me.debug.showMessage("Done loading: " + url);
    };
    image.src = url;
}

Loader.prototype.done = function() {
    return this.pending == 0;
}
