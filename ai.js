function AI(king, world) {
    this.king = king;
    this.world = world;
    this.path = [];
    this.pathTarget = vec3.clone(this.king.targetTranslation);
    this.refresh = 60;
}

AI.prototype.update = function(dt) {
    if (this.king.dead == true) return;
    this.refresh--;
    if (this.path.length == 0 || this.refresh <= 0) {
	// get a new target
	var tile = this.world.tileFromPosition(this.king.targetTranslation);
	//var rx = Math.floor(Math.random() * this.world.width);
	//var ry = Math.floor(Math.random() * this.world.height);
	this.path = this.world.path(tile.x, tile.y, this.king.t);
	this.refresh = 60;
    }

    var d = vec3.create();
    vec3.sub(d, this.pathTarget, this.king.translation);
    if (vec3.length(d) < 1.5) {
	// next way point
	if (this.path.length > 0) {
	    this.pathTarget[0] = this.path[0].x;
	    this.pathTarget[2] = this.path[0].y;
	    this.path.splice(0, 1);
	    this.king.setTarget(this.pathTarget);
	}
    }
}
