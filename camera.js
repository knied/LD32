function Camera(width, height) {
    this.P = mat4.create();
    this.V = mat4.create();
    this.resize(width, height);

    this.center = vec3.create();
    this.distance = 40.0;
    this.angleY = Math.PI * 3.0 / 4.0;
    this.angleX = Math.PI * 2.0 / 8.0;
    this.rotation = quat.create();
    this.recalculate = true;
}

Camera.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this.fov = 60.0 * 180.0 / Math.PI;
    this.near = 0.1;
    this.far = 150.0;
    mat4.perspective(this.P, this.fov, this.width / this.height, this.near, this.far);
}

Camera.prototype.update = function() {
    if (this.recalculate == true) {
	this.recalculate = false;
	quat.identity(this.rotation);
	quat.rotateX(this.rotation, this.rotation, this.angleX);
	quat.rotateY(this.rotation, this.rotation, this.angleY);
	var distance = vec3.fromValues(0.0, -10.0, -this.distance);
	var offset = vec3.fromValues(-this.center[0], -this.center[1], -this.center[2]);
	mat4.fromRotationTranslation(this.V, this.rotation, distance);
	mat4.translate(this.V, this.V, offset);
    }
}

Camera.prototype.setCenter = function(center) {
    this.center = vec3.clone(center);
    this.recalculate = true;
}

Camera.prototype.zoom = function(d) {
    this.distance += d;
    if (this.distance < 1.0) this.distance = 1.0;
    if (this.distance > 50.0) this.distance = 50.0;
    this.recalculate = true;
}

Camera.prototype.rotate = function(dx, dy) {
    this.angleY += dy;
    while (this.angleY < 0.0) this.angleY += 2.0 * Math.PI;
    while (this.angleY > 2.0 * Math.PI) this.angleY -= 2.0 * Math.PI;
    this.angleX += dx;
    if (this.angleX < Math.PI / 8.0) this.angleX = Math.PI / 8.0;
    if (this.angleX > Math.PI * 3.0 / 8.0) this.angleX = Math.PI * 3.0 / 8.0;
    this.recalculate = true;
}

Camera.prototype.eye = function() {
    var invV = mat4.create();
    mat4.invert(invV, this.V);
    var invRot = quat.create();
    quat.invert(invRot, this.rotation);
    var origin = vec3.create();
    var forward = vec3.fromValues(0.0, 0.0, -1.0);
    var right = vec3.fromValues(1.0, 0.0, 0.0);
    var up = vec3.fromValues(0.0, 1.0, 0.0);
    vec3.transformMat4(origin, origin, invV);
    vec3.transformQuat(forward, forward, invRot);
    vec3.transformQuat(right, right, invRot);
    vec3.transformQuat(up, up, invRot);
    return {origin: origin, forward: forward, right: right, up: up};
}

Camera.prototype.screenToXZPlane = function(x, y) {
    var eye = this.eye();
    var farHeight = 2.0 * this.far * Math.tan(this.fov / 2.0);
    var farWidth = this.width / this.height * farHeight;
    var onFar = vec3.clone(eye.forward);
    vec3.scale(onFar, onFar, this.far);
    vec3.add(onFar, onFar, eye.origin);
    var dx = x / this.width - 0.5;
    var dy = y / this.height - 0.5;
    
    vec3.scale(eye.right, eye.right, farWidth * dx);
    vec3.scale(eye.up, eye.up, -farHeight * dy);
    vec3.add(onFar, onFar, eye.up);
    vec3.add(onFar, onFar, eye.right);
    var planeNormal = vec3.fromValues(0.0, 1.0, 0.0);
    var lineNormal = vec3.clone(onFar);
    vec3.sub(lineNormal, lineNormal, eye.origin);
    vec3.normalize(lineNormal, lineNormal);
    var linePoint = eye.origin;
    var d = -vec3.dot(linePoint, planeNormal) / vec3.dot(lineNormal, planeNormal);
    var p = vec3.clone(lineNormal);
    vec3.scale(p, p, d);
    vec3.add(p, p, linePoint);
    return p;
}
