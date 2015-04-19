function Collide() {
    this.dynamic = [];
    this.walls = [];
}

Collide.prototype.addDynamic = function(gameObject) {
    this.dynamic.push(gameObject);
}

Collide.prototype.removeDynamic = function(gameObject) {
    var i = this.dynamic.indexOf(gameObject);
    if (i < 0) return;
    this.dynamic.splice(i, 1);
}

Collide.prototype.update = function(dt) {
    var d = vec3.create();
    var v = vec3.create();
    var n = vec3.create();
    var w = vec3.create();
    var t = vec3.create();
    for (var it = 0; it < 2; ++it) {
	for (var i = 0; i < this.dynamic.length-1; ++i) {
	    for (var j = i+1; j < this.dynamic.length; ++j) {
		var p0 = this.dynamic[i].translation;
		var p1 = this.dynamic[j].translation;
		vec3.sub(d, p1, p0);
		var l = vec3.length(d);
		if (l > 5.0) continue;
		
		var v0 = this.dynamic[i].dP;
		var v1 = this.dynamic[j].dP;
		var r0 = this.dynamic[i].radius;
		var r1 = this.dynamic[j].radius;
		
		vec3.normalize(n, d);
		vec3.sub(v, v1, v0);
		var rel = vec3.dot(v, n);
		var futureDistance = l - r0 - r1 + dt * rel;
		vec3.scale(n, n, 0.5 * Math.min(0.0, futureDistance / dt));
		if (this.dynamic[i].isKing == true && this.dynamic[j].isKing == false) {
		    vec3.sub(v1, v1, n);
		    vec3.sub(v1, v1, n);
		} else if (this.dynamic[j].isKing == true && this.dynamic[i].isKing == false) {
		    vec3.add(v0, v0, n);
		    vec3.add(v0, v0, n);
		} else {
		    vec3.add(v0, v0, n);
		    vec3.sub(v1, v1, n);
		}
	    }
	}
	
	for (var i = 0; i < this.dynamic.length; ++i) {
	    var p0 = this.dynamic[i].translation;
	    var v0 = this.dynamic[i].dP;
	    var r0 = this.dynamic[i].radius;
	    for (var j = 0; j < this.walls.length; ++j) {
		var a = this.walls[j].a;
		var b = this.walls[j].b;
		var r1 = 0.125;
		vec3.sub(w, b, a);
		var l = vec3.length(w);
		vec3.normalize(w, w);
		vec3.sub(t, p0, a);
		var dot =  vec3.dot(w, t);
		if (dot < 0) {
		    vec3.sub(d, a, p0);
		}
		else if (dot > l) {
		    vec3.sub(d, b, p0);
		} else {
		    vec3.scale(w, w, dot);
		    vec3.add(t, a, w);
		    vec3.sub(d, t, p0);
		}
		vec3.normalize(n, d);
		var rel = -vec3.dot(v0, n);
		var futureDistance = vec3.length(d) - r0 - r1 + dt * rel;
		vec3.scale(n, n, Math.min(0.0, futureDistance / dt));
		vec3.add(v0, v0, n);
	    }
	}
    }
}

Collide.prototype.addWall = function(a, b) {
    this.walls.push({a: a, b: b});
}
