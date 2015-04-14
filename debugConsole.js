function DebugConsole(container) {
    this.container = container;
    this.variables = {};
    this.messages = [];
    this.updateTimer = 0.0;
    this.fadeOutTimer = 5.0;
}

DebugConsole.prototype.setVariable = function(name, value) {
    this.variables[name] = value;
}

DebugConsole.prototype.removeVariable = function(name) {
    delete this.variables[name];
}

DebugConsole.prototype.showMessage = function(message) {
    this.messages.push(message);
    while (this.messages.length > 20) {
	this.messages.splice(0, 1);
    }
    this.fadeOutTimer = 5.0;
}

DebugConsole.prototype.update = function(dt) {
    var updateInterval = 0.1;
    this.updateTimer -= dt;
    if (this.updateTimer > 0.0) {
	return;
    }
    this.updateTimer = updateInterval;

    this.container.empty();
    for(var name in this.variables) {
	var value = this.variables[name];
	$("<div><b>" + name + ":</b> " + value + "</div>").appendTo(this.container);
    }

    this.fadeOutTimer -= updateInterval;
    if (this.fadeOutTimer > 0.01) {
	var opacity = 1.0;
	if (this.fadeOutTimer < 2.0) {
	    opacity = this.fadeOutTimer / 2.0;
	}
	
	for(var i in this.messages) {
	    var message = this.messages[i];
	    $("<div>" + message + "</div>").css({opacity: opacity}).appendTo(this.container);
	}
    }
}
