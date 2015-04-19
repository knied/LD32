function GameObject (gl, geometry) {
    this.gl = gl;

    this.mesh = new GLBuffer(gl);
    this.mesh.load(geometry.positions, geometry.normals);
    this.color = vec3.fromValues(1.0, 1.0, 1.0);

    this.translation = vec3.create();
    this.rotation = quat.create();

    this.targetTranslation = vec3.create();
    this.targetRotation = quat.create();
    this.dP = vec3.create();
    this.maxSpeed = 6.0;
    this.acceleration = 40.0;

    this.M = mat4.create();
    this.recalculate = true;

    this.radius = 0.5;

    this.t = -1;
    this.isKing = false;
    this.dead = false;
    this.winner = false;
}

GameObject.prototype.updateTarget = function(dt) {
    var d = vec3.create();
    vec3.sub(d, this.targetTranslation, this.translation);
    var f0 = vec3.clone(d);
    vec3.scale(f0, f0, this.acceleration * dt);
    var f1 = vec3.clone(this.dP);
    vec3.scale(f1, f1, -2.0 * Math.sqrt(this.acceleration) * dt);
    vec3.add(this.dP, this.dP, f0);
    vec3.add(this.dP, this.dP, f1);
    var speed = vec3.length(this.dP);
    if (speed > this.maxSpeed) {
	vec3.scale(this.dP, this.dP, this.maxSpeed / speed);
    }
    quat.slerp(this.rotation, this.rotation, this.targetRotation, 10.0 * dt);
}

GameObject.prototype.update = function(dt) {
    var d = vec3.create();
    vec3.scale(d, this.dP, dt);
    vec3.add(this.translation, this.translation, d);
    this.recalculate = true;
}

GameObject.prototype.draw = function(program, V, P) {
    if (this.recalculate == true) {
	this.recalculate = false;
	mat4.fromRotationTranslation(this.M, this.rotation, this.translation);
    }
    var MV = mat4.create();
    mat4.mul(MV, V, this.M);
    var N = mat3.create();
    mat3.normalFromMat4(N, MV);
    this.mesh.draw(program, {M: this.M, V: V, P: P, N: N, color: this.color});
}

GameObject.prototype.setColor = function(color) {
    vec3.copy(this.color, color);
}

GameObject.prototype.setTranslation = function(translation) {
    vec3.copy(this.translation, translation);
    vec3.copy(this.targetTranslation, translation);
    this.recalculate = true;
}

GameObject.prototype.setTarget = function(targetTranslation) {
    vec3.copy(this.targetTranslation, targetTranslation);
    var direction = vec3.fromValues(0.0, 0.0, -1.0);
    vec3.transformQuat(direction, direction, this.rotation);
    var targetDirection = vec3.create();
    vec3.sub(targetDirection, this.targetTranslation, this.translation);
    vec3.normalize(targetDirection, targetDirection);
    quat.rotationTo(this.targetRotation, direction, targetDirection);
    quat.mul(this.targetRotation, this.targetRotation, this.rotation);
}

GameObject.prototype.setRotation = function(rotation) {
    quat.copy(this.rotation, rotation);
    quat.copy(this.targetRotation, rotation);
    this.recalculate = true;
}
