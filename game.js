function Game(gl, audioContext) {
    this.gl = gl;
    this.audioContext = audioContext;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.5;

    this.debugConsole = new DebugConsole($('#debug_overlay'));
    this.debugConsole.setVariable("FPS", 0);
    this.debugConsole.setVariable("Width", 0);
    this.debugConsole.setVariable("Height", 0);
    this.debugConsole.setVariable("X", 0);
    this.debugConsole.setVariable("Y", 0);

    this.loader = new Loader(this.audioContext, this.debugConsole);
    this.loader.loadText("shader.vert", "vertexShader0");
    this.loader.loadText("shader.frag", "fragmentShader0");
    this.loader.loadSound("gameOver.wav", "gameOver");
    this.loader.loadSound("win.wav", "win");
    this.loader.loadSound("blip.wav", "blip");
    this.loader.loadSound("counter.wav", "counter");
    this.doneLoading = false;
    
    this.width = 0;
    this.height = 0;

    this.program = null;

    this.collide = null
    this.camera = null
    this.world = null;
    this.player = null
    this.marker = null;
    //this.enemies = [];
    this.test = false;

    this.moveXN = 0.0;
    this.moveXP = 0.0;
    this.moveZN = 0.0;
    this.moveZP = 0.0;
    this.move = vec3.create();

    this.drag = false;
    this.prevX = null;
    this.prevY = null;
    
    this.resize();

    this.endOverlay = $("#end_overlay");

    this.state = 0;
    
    this.debugConsole.showMessage("Game object created");
}

Game.prototype.resize = function() {
    this.width = this.gl.drawingBufferWidth;
    this.height = this.gl.drawingBufferHeight;
    if (this.camera != null) {
	this.camera.resize(this.width, this.height);
    }
    this.debugConsole.setVariable("Width", this.width);
    this.debugConsole.setVariable("Height", this.height);
}

Game.prototype.keyDown = function(key) {
    //this.playSound("hit0");
    this.debugConsole.showMessage("KeyDown: " + key);
    if (key == 87 || key == 38) { // up
	this.moveZN = 1.0;
    }
    if (key == 65 || key == 37) { // left
	this.moveXN = 1.0;
    }
    if (key == 83 || key == 40) { // down
	this.moveZP = 1.0;
    }
    if (key == 68 || key == 39) { // right
	this.moveXP = 1.0;
    }
    var moveX = this.moveXP - this.moveXN;
    var moveZ = this.moveZP - this.moveZN;
    this.move[0] = moveX;
    this.move[1] = 0.0;
    this.move[2] = moveZ;
    vec3.normalize(this.move, this.move);

    if (key == 32) this.test = !this.test;
}

Game.prototype.keyUp = function(key) {
    this.debugConsole.showMessage("KeyUp: " + key);
    if (key == 87 || key == 38) { // up
	this.moveZN = 0.0;
    }
    if (key == 65 || key == 37) { // left
	this.moveXN = 0.0;
    }
    if (key == 83 || key == 40) { // down
	this.moveZP = 0.0;
    }
    if (key == 68 || key == 39) { // right
	this.moveXP = 0.0;
    }
    var moveX = this.moveXP - this.moveXN;
    var moveZ = this.moveZP - this.moveZN;
    this.move[0] = moveX;
    this.move[1] = 0.0;
    this.move[2] = moveZ;
    vec3.normalize(this.move, this.move);
}

Game.prototype.mouseDown = function(button) {
    if (this.state == 0) {
	this.state = 1;
	return;
    }
    if (this.state == 3) {
	this.init();
	this.state = 1;
	return;
    }
    if (button == 2) {
	this.drag = true;
    }
    if (button == 0) {
	var target = this.camera.screenToXZPlane(this.prevX, this.prevY);
	this.marker.setTranslation(target);
	this.player.setTarget(target);
    }
}

Game.prototype.mouseUp = function(button) {
    if (button == 2) {
	this.drag = false;
    }
}

Game.prototype.mouseMove = function(x, y) {
    this.debugConsole.setVariable("X", x);
    this.debugConsole.setVariable("Y", y);
    var relX = 0;
    var relY = 0;
    if (this.prevX == null) {
	this.prevX = x;
	this.prevY = y;
    } else {
	relX = x - this.prevX;
	relY = y - this.prevY;
	this.prevX = x;
	this.prevY = y;
    }
    if (this.drag == true) {
	this.camera.rotate(relY / 100.0, relX / 100.0);
    }
}

Game.prototype.mouseWheel = function(delta) {
    //this.debugConsole.showMessage("MouseWheel: " + delta);
    //this.camera.zoom(delta / 10.0);
}

Game.prototype.init = function() {
    var gl = this.gl;

    this.collide = new Collide();
    this.camera = new Camera(this.width, this.height);
    
    this.countDown = 4.0;
    this.count = 4;
    
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    // create the shader program
    this.program = new GLProgram(gl);
    this.program.load(this.loader.texts["vertexShader0"],
		      this.loader.texts["fragmentShader0"]);

    this.world = new World(gl, this.collide);
    this.player = this.world.player;
    
    var markerGeometry = cubeGeometry(0.25, 0.25, 0.25);
    this.marker = new GameObject(gl, markerGeometry);
    this.marker.setColor(vec3.fromValues(1.0, 0.0, 0.0));
    this.debugConsole.showMessage("Loading Complete");
}

Game.prototype.update = function(dt) {
    var gl = this.gl;

    this.debugConsole.setVariable("FPS", Math.round(1.0/dt));

    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //this.debugConsole.update(dt);
    
    if (this.doneLoading == false) {
	this.doneLoading = this.loader.done();
	if (this.doneLoading == false) {
	    return;
	}
	this.init();
    }

    // Update the scene
    this.xAngle += dt;
    while (this.xAngle > 2.0 * Math.PI) {
	this.xAngle -= 2.0 * Math.PI;
    }

    this.yAngle += dt;
    while (this.yAngle > 2.0 * Math.PI) {
	this.yAngle -= 2.0 * Math.PI;
    }

    if (this.state == 0) {
	this.show("Click to Start");
    } else if (this.state == 1) {
	this.camera.setCenter(this.player.translation);
	if (this.countDown > 0.0) {
	    this.countDown -= dt;
	    if (this.countDown > 3.0) {
		this.show("3");
		if (this.count > 3) {
		    this.count = 3;
		    this.playSound("counter");
		}
	    } else if (this.countDown > 2.0) {
		this.show("2");
		if (this.count > 2) {
		    this.count = 2;
		    this.playSound("counter");
		}
	    } else if (this.countDown > 1.0) {
		this.show("1");
		if (this.count > 1) {
		    this.count = 1;
		    this.playSound("counter");
		}
	    } else {
		this.show("GO!");
		if (this.count > 0) {
		    this.count = 0;
		    this.playSound("counter");
		}
	    }
	} else {
	    if (this.player.dead == false && this.player.winner == false) {
		this.endOverlay.empty();
	    }
	    this.world.update(dt);
	}
    } else if (this.state == 2) {
	this.countDown -= dt;
	if (this.countDown < 0.0) {
	    if (this.player.dead == true) {
		this.show("Game Over<div id='sub_title_overlay'>Click to Restart</div>");
	    } else {
		this.show("You Win!<div id='sub_title_overlay'>Click to Restart</div>");
	    }
	    this.state = 3;
	}
    }

    if (this.world.blip == true) {
	this.playSound("blip");
	this.world.blip = false
    }

    // Draw the scene
    this.camera.update();
    var V = this.camera.V;
    var P = this.camera.P;

    this.world.draw(this.program, V, P);
    if (this.player.dead == false && this.player.winner == false) {
	this.marker.draw(this.program, V, P);
    } else if (this.state == 1) {
	this.state = 2;
	this.countDown = 1.0;
	if (this.player.dead == true) {
	    this.show("Game Over");
	    this.playSound("gameOver");
	} else {
	    this.show("You Win!");
	    this.playSound("win");
	}
    }
}

Game.prototype.playSound = function(name) {
    var source = this.audioContext.createBufferSource();
    source.buffer = this.loader.sounds[name];
    source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    source.start(0);
}

Game.prototype.show = function(text) {
    this.endOverlay.empty();
    this.endOverlay.append(text);
    var top = 0.5 * this.height - 0.5 * this.endOverlay.height();
    var left = 0.5 * this.width - 0.5 * this.endOverlay.width();
    this.endOverlay.offset({top: top, left: left});
}
