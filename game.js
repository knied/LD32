function Game(gl, audioContext) {
    this.gl = gl;
    this.audioContext = audioContext;

    this.debugConsole = new DebugConsole($('#debug_overlay'));
    this.debugConsole.setVariable("FPS", 0);
    this.debugConsole.setVariable("Width", 0);
    this.debugConsole.setVariable("Height", 0);
    this.debugConsole.setVariable("X", 0);
    this.debugConsole.setVariable("Y", 0);

    this.loader = new Loader(this.audioContext, this.debugConsole);
    this.loader.loadText("shader.vert", "vertexShader0");
    this.loader.loadText("shader.frag", "fragmentShader0");
    this.loader.loadSound("hit.wav", "hit0");
    this.loader.loadImage("test.png", "test");
    this.doneLoading = false;
    
    this.width = 0;
    this.height = 0;

    this.program = null;
    this.texture = null;
    this.mesh = null;

    this.distance = 5.0;
    this.drag = false;
    this.prevX = null;
    this.prevY = null;
    this.rotation = quat.create();
    
    this.resize();
    
    this.debugConsole.showMessage("Game object created");
}

Game.prototype.resize = function() {
    this.width = this.gl.drawingBufferWidth;
    this.height = this.gl.drawingBufferHeight;
    this.debugConsole.setVariable("Width", this.width);
    this.debugConsole.setVariable("Height", this.height);
}

Game.prototype.keyDown = function(key) {
    this.playSound("hit0");
    this.debugConsole.showMessage("KeyDown: " + key);
}

Game.prototype.keyUp = function(key) {
    this.debugConsole.showMessage("KeyUp: " + key);
}

Game.prototype.mouseDown = function(button) {
    if (button == 0) {
	this.drag = true;
    }
}

Game.prototype.mouseUp = function(button) {
    if (button == 0) {
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
	var rotX = quat.create();
	var rotY = quat.create();
	quat.rotateY(rotX, rotX, relX / 100.0);
	quat.rotateX(rotY, rotY, relY / 100.0);
	quat.mul(this.rotation, rotX, this.rotation);
	quat.mul(this.rotation, rotY, this.rotation);
    }
}

Game.prototype.mouseWheel = function(delta) {
    //this.debugConsole.showMessage("MouseWheel: " + delta);
    this.distance += delta / 10.0;
    if (this.distance < 2.5) this.distance = 2.5;
    if (this.distance > 50.0) this.distance = 50.0;
}

Game.prototype.update = function(dt) {
    var gl = this.gl;
    var width = this.width;
    var height = this.height;

    this.debugConsole.setVariable("FPS", Math.round(1.0/dt));
    
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.debugConsole.update(dt);
    
    if (this.doneLoading == false) {
	this.doneLoading = this.loader.done();
	if (this.doneLoading == false) {
	    return;
	}

	gl.enable(gl.CULL_FACE);
	
	// create the shader program
	this.program = new GLProgram(gl);
	this.program.load(this.loader.texts["vertexShader0"],
			  this.loader.texts["fragmentShader0"]);
	
	// create textures
	this.texture = new GLTexture(gl);
	this.texture.load(this.loader.images["test"]);

	// Create geometry data
	var cube = cubeGeometry(2.0, 1.0, 1.0);

	// create vertex buffer
	this.mesh = new GLBuffer(gl);
	this.mesh.load(cube.positions, cube.normals, cube.uvs);

	this.debugConsole.showMessage("Loading Complete");
    }

    // Draw the scene
    var translation = vec3.fromValues(0.0, 0.0, -this.distance);
    var MV = mat4.create();
    mat4.fromRotationTranslation(MV, this.rotation, translation);
    var P = mat4.create();
    mat4.perspective(P, 60.0 * 180.0 / Math.PI, this.width / this.height, 0.1, 100.0);
    var N = mat3.create();
    mat3.normalFromMat4(N, MV);
    
    this.mesh.draw(this.program, this.texture, {MV: MV, P: P, N: N});

    // Update the scene
    this.xAngle += dt;
    while (this.xAngle > 2.0 * Math.PI) {
	this.xAngle -= 2.0 * Math.PI;
    }

    this.yAngle += dt;
    while (this.yAngle > 2.0 * Math.PI) {
	this.yAngle -= 2.0 * Math.PI;
    }
}

Game.prototype.playSound = function(name) {
    var source = this.audioContext.createBufferSource();
    source.buffer = this.loader.sounds[name];
    source.connect(this.audioContext.destination);
    source.start(0);
}
