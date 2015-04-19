function GLProgram(gl) {
    this.gl = gl;
    this.program = gl.createProgram();
    this.vPositionLocation = null;
    this.vNormalLocation = null;
    this.vUVLocation = null;
    this.uColorLocation = null;
    //this.uTextureLocation = null;
    //this.uMVLocation = null;
    this.uMLocation = null;
    this.uVLocation = null;
    this.uPLocation = null;
    this.uNLocation = null;
}

function GLTexture(gl) {
    this.gl = gl;
    this.texture = gl.createTexture();
}

function GLBuffer(gl) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.size = 0;
    this.stride = 0;
}

GLProgram.prototype.load = function(vertexShaderSource, fragmentShaderSource) {
    var gl = this.gl;
    var program = this.program;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    
    gl.compileShader(vertexShader);
    var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!compiled) {
	var log = gl.getShaderInfoLog(vertexShader);
	errorLog += "Error while compiling shader:\n";
	errorLog += log + "\n";
	gl.deleteShader(vertexShader);
	return;
    }
    
    gl.compileShader(fragmentShader);
    var compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!compiled) {
	var log = gl.getShaderInfoLog(fragmentShader);
	errorLog += "Error while compiling shader:\n";
	errorLog += log + "\n"
	gl.deleteShader(fragmentShader);
	gl.deleteShader(vertexShader);
	return;
    }
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
	var log = gl.getProgramInfoLog(program);
	errorLog += "Error while linking shader program:\n";
	errorLog += log + "\n"
	
	gl.deleteShader(fragmentShader);
	gl.deleteShader(vertexShader);
	return;
    }
    
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);

    this.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    this.vNormalLocation = gl.getAttribLocation(program, "vNormal");
    this.vUVLocation = gl.getAttribLocation(program, "vUV");
    this.uColorLocation = gl.getUniformLocation(program, "uColor");
    //this.uTextureLocation = gl.getUniformLocation(program, "uTexture");
    //this.uMVLocation = gl.getUniformLocation(program, "uMV");
    this.uMLocation = gl.getUniformLocation(program, "uM");
    this.uVLocation = gl.getUniformLocation(program, "uV");
    this.uPLocation = gl.getUniformLocation(program, "uP");
    this.uNLocation = gl.getUniformLocation(program, "uN");
}

GLTexture.prototype.load = function(image) {
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

GLTexture.prototype.bind = function() {
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
}

GLBuffer.prototype.load = function(positions, normals, uvs) {
    var ab = null;
    if (uvs == undefined) {
	this.size = positions.length;
	this.stride = 12 + 12;
	if (normals.length != this.size) {
	    console.error("attribute size mismatch.");
	    return;
	}

	ab = new ArrayBuffer(this.size * this.stride);
	dv = new DataView(ab);
	for (i = 0; i < this.size; i++) {
            var byteOffset = i * this.stride;
            dv.setFloat32(byteOffset + 0, positions[i][0], true);
            dv.setFloat32(byteOffset + 4, positions[i][1], true);
            dv.setFloat32(byteOffset + 8, positions[i][2], true);
	    
            dv.setFloat32(byteOffset + 12, normals[i][0], true);
            dv.setFloat32(byteOffset + 16, normals[i][1], true);
            dv.setFloat32(byteOffset + 20, normals[i][2], true);
	}
    } else {
	this.size = positions.length;
	this.stride = 12 + 12 + 8;
	if (normals.length != this.size) {
	    console.error("attribute size mismatch.");
	    return;
	}
	if (uvs.length != this.size) {
	    console.error("attribute size mismatch.");
	    return;
	}
	
	ab = new ArrayBuffer(this.size * this.stride);
	dv = new DataView(ab);
	for (i = 0; i < this.size; i++) {
            var byteOffset = i * this.stride;
            dv.setFloat32(byteOffset + 0, positions[i][0], true);
            dv.setFloat32(byteOffset + 4, positions[i][1], true);
            dv.setFloat32(byteOffset + 8, positions[i][2], true);
	    
            dv.setFloat32(byteOffset + 12, normals[i][0], true);
            dv.setFloat32(byteOffset + 16, normals[i][1], true);
            dv.setFloat32(byteOffset + 20, normals[i][2], true);
	    
            dv.setFloat32(byteOffset + 24, uvs[i][0], true);
            dv.setFloat32(byteOffset + 28, uvs[i][1], true);
	}
    }
    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ab, gl.STATIC_DRAW);
}

GLBuffer.prototype.draw = function(program, uniforms) {
    var gl = this.gl;

    gl.useProgram(program.program);

    //gl.uniformMatrix4fv(program.uMVLocation, false, uniforms.MV);
    gl.uniformMatrix4fv(program.uMLocation, false, uniforms.M);
    gl.uniformMatrix4fv(program.uVLocation, false, uniforms.V);
    gl.uniformMatrix4fv(program.uPLocation, false, uniforms.P);
    gl.uniformMatrix3fv(program.uNLocation, false, uniforms.N);

    if (uniforms.color != undefined) {
	gl.uniform3fv(program.uColorLocation, uniforms.color);
    }

    if (uniforms.texture != undefined) {
	gl.activeTexture(gl.TEXTURE0);
	uniforms.texture.bind();
	gl.uniform1i(program.uTextureLocation, 0);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 3, gl.FLOAT, false, this.stride, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
    gl.vertexAttribPointer(program.vNormalLocation, 3, gl.FLOAT, false, this.stride, 12);
    gl.enableVertexAttribArray(program.vNormalLocation);
    if (uniforms.texture != undefined) {
	gl.vertexAttribPointer(program.vUVLocation, 2, gl.FLOAT, false, this.stride, 24);
	gl.enableVertexAttribArray(program.vUVLocation);
    }
    gl.drawArrays(gl.TRIANGLES, 0, this.size);
}
