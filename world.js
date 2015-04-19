function World(gl, collide) {
    this.gl = gl;

    this.color = vec3.fromValues(1.0, 1.0, 1.0);
    this.colors = [
	vec3.fromValues(0.2, 1.0, 0.4),
	vec3.fromValues(1.0, 0.4, 0.2),
	vec3.fromValues(0.2, 0.4, 1.0),
	vec3.fromValues(1.0, 0.8, 0.0)
    ];

    this.collide = collide;

    this.tileSize = 8.0;
    this.wallThickness = 0.25;
    this.width = 6;
    this.height = 6;
    this.offset = vec3.fromValues(0.0, -0.75, 0.0);

    var floorGeometry = cubeGeometry(this.tileSize, this.wallThickness, this.tileSize);
    this.floor = new GameObject(gl, floorGeometry);
    this.floor.setColor(this.color);

    var wall0Geometry = cubeGeometry(this.tileSize + this.wallThickness, 1.0, this.wallThickness);
    this.wall0 = new GameObject(gl, wall0Geometry);
    this.wall0.setColor(this.color);
    
    var wall1Geometry = cubeGeometry(this.wallThickness, 1.0, this.tileSize + this.wallThickness);
    this.wall1 = new GameObject(gl, wall1Geometry);
    this.wall1.setColor(this.color);

    this.tiles = [];
    for (var x = 0; x < this.width; ++x) {
	this.tiles.push([]);
	for (var y = 0; y < this.height; ++y) {
	    this.tiles[x].push({
		x: x,
		y: y,
		xp: 0,
		yp: 0,
		t: -1,
		n: [],
		minions: []
	    });
	}
    }
    
    var visited = [{x: 0, y: 0}];
    var wasVisited = function(x, y) {
	for (var i in visited) {
	    if (visited[i].x == x && visited[i].y == y) return true;
	}
	return false;
    }
    var next = [{x: 0, y: 0, dx: 1, dy: 0}, {x: 0, y: 0, dx: 0, dy: 1}];
    while (next.length > 0) {
	// Select one
	var i = Math.floor(Math.random() * next.length);
	var n = next[i];
	next.splice(i, 1);
	var x = n.x + n.dx;
	var y = n.y + n.dy;
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
	if (wasVisited(x, y) == true) continue;
	visited.push({x: x, y: y});
	// Remove wall
	this.tiles[n.x][n.y].n.push(this.tiles[x][y]);
	this.tiles[x][y].n.push(this.tiles[n.x][n.y]);
	if (n.dx > 0) this.tiles[n.x][n.y].xp = 1;
	if (n.dx < 0) this.tiles[x][y].xp = 1;
	if (n.dy > 0) this.tiles[n.x][n.y].yp = 1;
	if (n.dy < 0) this.tiles[x][y].yp = 1;
	next.push({x: x, y: y, dx: 1, dy: 0});
	next.push({x: x, y: y, dx: -1, dy: 0});
	next.push({x: x, y: y, dx: 0, dy: 1});
	next.push({x: x, y: y, dx: 0, dy: -1});
    }

    // Make the walls collide
    for (var x = 0; x < this.width; ++x) {
	var a = vec3.create();
	var b = vec3.create();
	a[0] = x * this.tileSize - 0.5 * this.tileSize;
	a[1] = 0.0;
	a[2] = 0.0 - 0.5 * this.tileSize;
	b[0] = (x + 1) * this.tileSize - 0.5 * this.tileSize;
	b[1] = 0.0;
	b[2] = 0.0 - 0.5 * this.tileSize
	this.collide.addWall(a, b);
    }
    for (var y = 0; y < this.height; ++y) {
	var a = vec3.create();
	var b = vec3.create();
	a[2] = y * this.tileSize - 0.5 * this.tileSize;
	a[1] = 0.0;
	a[0] = 0.0 - 0.5 * this.tileSize;
	b[2] = (y + 1) * this.tileSize - 0.5 * this.tileSize;
	b[1] = 0.0;
	b[0] = 0.0 - 0.5 * this.tileSize
	this.collide.addWall(a, b);
    }
    for (var x = 0; x < this.width; ++x) {
	for (var y = 0; y < this.height; ++y) {
	    var tile = this.tiles[x][y];
	    if (tile.xp == 0) {
		var a = vec3.create();
		var b = vec3.create();
		a[2] = y * this.tileSize - 0.5 * this.tileSize;
		a[1] = 0.0;
		a[0] = (x + 1) * this.tileSize - 0.5 * this.tileSize;
		b[2] = (y + 1) * this.tileSize - 0.5 * this.tileSize;
		b[1] = 0.0;
		b[0] = (x + 1) * this.tileSize - 0.5 * this.tileSize
		this.collide.addWall(a, b);
	    }
	    if (tile.yp == 0) {
		var a = vec3.create();
		var b = vec3.create();
		a[0] = x * this.tileSize - 0.5 * this.tileSize;
		a[1] = 0.0;
		a[2] = (y + 1) * this.tileSize - 0.5 * this.tileSize;
		b[0] = (x + 1) * this.tileSize - 0.5 * this.tileSize;
		b[1] = 0.0;
		b[2] = (y + 1) * this.tileSize - 0.5 * this.tileSize
		this.collide.addWall(a, b);
	    }
	}
    }

    this.minions = [];
    this.kings = [];
    this.ais = [];
    var kingGeometry = cubeGeometry(1.0, 1.5, 1.0);
    for (var i = 0; i < 4; ++i) {
	var king = new GameObject(gl, kingGeometry);
	king.t = i;
	king.isKing = true;
	king.setColor(this.colors[i]);
	king.radius = 0.7;
	this.collide.addDynamic(king);
	this.kings.push(king);
    }
    this.kings[0].setTranslation(vec3.fromValues(0.0, 0.0, 0.0));
    this.kings[1].setTranslation(vec3.fromValues((this.width - 1) * this.tileSize, 0.0, 0.0));
    this.kings[2].setTranslation(vec3.fromValues(0.0, 0.0, (this.height - 1) * this.tileSize));
    this.kings[3].setTranslation(vec3.fromValues((this.width -1) * this.tileSize, 0.0, (this.height - 1) * this.tileSize));

    this.tiles[0][0].t = 0;
    this.tiles[this.width-1][0].t = 1;
    this.tiles[0][this.height-1].t = 2;
    this.tiles[this.width-1][this.height-1].t = 3;

    for (var i = 1; i < this.kings.length; ++i) {
	var ai = new AI(this.kings[i], this);
	this.ais.push(ai);
    }
    
    this.player = this.kings[0];
    this.deadCounter = 0;
    
    var minionGeometry = cubeGeometry(0.5, 1.25, 0.5);
    for (var x = 0; x < this.width; ++x) {
	for (var y = 0; y < this.height; ++y) {
	    var tile = this.tiles[x][y];
	    for (var i = 0; i < 5; ++i) {
		var minion = new GameObject(gl, minionGeometry);
		tile.minions.push(minion);
		minion.tile = tile;
		minion.t = tile.t;
		minion.maxSpeed = 4.0;
		minion.setColor(vec3.fromValues(0.9, 0.9, 0.9));
		var rx = Math.random() * this.tileSize - 0.5 * this.tileSize;
		var ry = Math.random() * this.tileSize - 0.5 * this.tileSize;
		minion.setTranslation(vec3.fromValues(x * this.tileSize + rx, 0.0, y * this.tileSize + ry));
		this.minions.push(minion);
		this.collide.addDynamic(minion);
	    }
	}
    }

    this.blip = false;
}

World.prototype.draw = function(program, V, P) {
    // Draw the outer walls
    var position = vec3.create();
    for (var x = 0; x < this.width; ++x) {
	vec3.copy(position, this.offset);
	position[0] += x * this.tileSize;
	position[1] += 0.375;
	position[2] += 0.0 - 0.5 * this.tileSize;
	this.wall0.setTranslation(position);
	this.wall0.draw(program, V, P);
    }
    for (var y = 0; y < this.height; ++y) {
	vec3.copy(position, this.offset);
	position[0] += 0.0 - 0.5 * this.tileSize;
	position[1] += 0.375;
	position[2] += y * this.tileSize;
	this.wall1.setTranslation(position);
	this.wall1.draw(program, V, P);
    }

    // Draw the floors and inner walls
    for (var x = 0; x < this.width; ++x) {
	for (var y = 0; y < this.height; ++y) {
	    var tile = this.tiles[x][y];
	    vec3.copy(position, this.offset);
	    position[0] += x * this.tileSize;
	    position[2] += y * this.tileSize;
	    
	    this.floor.setTranslation(position);
	    if (tile.t < 0) {
		this.floor.setColor(this.color);
	    } else {
		this.floor.setColor(this.colors[tile.t]);
	    }
	    this.floor.draw(program, V, P);
	    if (tile.xp == 0) {
		vec3.copy(position, this.offset);
		position[0] += x * this.tileSize + 0.5 * this.tileSize;
		position[1] += 0.375;
		position[2] += y * this.tileSize;
		this.wall1.setTranslation(position);
		this.wall1.draw(program, V, P);
	    }
	    if (tile.yp == 0) {
		vec3.copy(position, this.offset);
		position[0] += x * this.tileSize;
		position[1] += 0.375;
		position[2] += y * this.tileSize + 0.5 * this.tileSize;
		this.wall0.setTranslation(position);
		this.wall0.draw(program, V, P);
	    }
	}
    }

    for (var i in this.minions) {
	var minion = this.minions[i];
	if (minion.t < 0) {
	    minion.setColor(this.color);
	} else {
	    minion.setColor(this.colors[minion.t]);
	}
	minion.draw(program, V, P);
    }
    for (var i in this.kings) {
	var king = this.kings[i];
	if (king.dead == false) {
	    king.draw(program, V, P);
	}
    }
}

World.prototype.tileFromPosition = function(position) {
    var x = Math.floor((position[0] + 0.5 * this.tileSize) / this.tileSize);
    var y = Math.floor((position[2] + 0.5 * this.tileSize) / this.tileSize);
    return this.tiles[x][y];
}

World.prototype.path = function(fromX, fromY, t) {
    console.log('from:', fromX, fromY, t);
    var startNode = {x: fromX, y: fromY, back: null}
    var visited = [startNode];
    var wasVisited = function(node) {
	for (var i in visited) {
	    if (visited[i].x == node.x && visited[i].y == node.y) return true;
	}
	return false;
    }
    var queue = [startNode];
    while (queue.length > 0) {
	var node = queue[0];
	queue.splice(0, 1);
	var tile = this.tiles[node.x][node.y];

	if (tile.t != t && (tile.x != fromX || tile.y != fromY)) {
	    console.log('to:', tile.x, tile.y, tile.t);
	    var path = [];
	    while (node.back != null) {
		path.push({x: node.x * this.tileSize, y: node.y * this.tileSize});
		node = node.back;
	    }
	    path.reverse();
	    return path;
	}

	tile.n.reverse();
	for (var i in tile.n) {
	    var next = {x: tile.n[i].x, y: tile.n[i].y, back: node};
	    if (wasVisited(next) == true) continue;
	    visited.push(next);
	    queue.push(next);
	}
    }
    return [];
}

World.prototype.calculateOwner = function(tile) {
    var prevT = tile.t;
    var max = 0;
    if (tile.t >= 0) {
	for (var j in tile.minions) {
	    var minion = tile.minions[j];
	    if (minion.t == tile.t) max++;
	}
    }
    for (var i in this.kings) {
	var sum = 0;
	for (var j in tile.minions) {
	    var minion = tile.minions[j];
	    if (minion.t == i) sum++;
	}
	if (sum > max) {
	    tile.t = i;
	    max = sum;
	}
    }

    if (prevT != tile.t) {
	this.blip = true;
	for (var j in tile.minions) {
	    var minion = tile.minions[j];
	    minion.t = tile.t;
	}
    }
}

World.prototype.kingDead = function(king) {
    // Tiles left?
    var count = 0;
    for (var x = 0; x < this.width; ++x) {
	for (var y = 0; y < this.height; ++y) {
	    var tile = this.tiles[x][y];
	    if (tile.t == king.t) {
		count++;
		break;
	    }
	}
    }
    if (count == 0) return true;
    
    // Minions left?
    for (var i in this.minions) {
	var minion = this.minions[i];
	if (minion.t == king.t) return false;
    }
    
    return true;
}

World.prototype.update = function(dt) {
    for (var i in this.ais) {
	var ai = this.ais[i];
	ai.update(dt);
    }
    
    for (var i in this.minions) {
	var minion = this.minions[i];
	if (minion.t >= 0) {
	    minion.setTarget(this.kings[minion.t].translation);
	}
	minion.updateTarget(dt);
    }
    for (var i in this.kings) {
	var king = this.kings[i];
	if (king.dead == false) {
	    king.updateTarget(dt);
	}
    }

    this.collide.update(dt);

    for (var i in this.minions) {
	var minion = this.minions[i];
	minion.update(dt);
	var tile = this.tileFromPosition(minion.translation);
	if (minion.tile != tile) {
	    var oldTile = minion.tile;
	    var j = minion.tile.minions.indexOf(minion);
	    minion.tile.minions.splice(j, 1);
	    minion.tile = tile;
	    tile.minions.push(minion);
	    this.calculateOwner(tile);
	    this.calculateOwner(oldTile);
	}
    }
    
    for (var i in this.kings) {
	var king = this.kings[i];
	if (king.dead == false) {
	    if (this.deadCounter == this.kings.length-1) {
		king.winner = true;
	    }
	    king.update(dt);
	    if (this.kingDead(king)) {
		for (var j in this.minions) {
		    var minion = this.minions[j];
		    if (minion.t == king.t) {
			minion.t = -1;
		    }
		}
		for (var x = 0; x < this.width; ++x) {
		    for (var y = 0; y < this.height; ++y) {
			var tile = this.tiles[x][y];
			if (tile.t == king.t) {
			    tile.t = -1;
			}
		    }
		}
		this.deadCounter++;
		king.dead = true;
		this.collide.removeDynamic(king);
	    }
	}
    }
}
