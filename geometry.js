function cubeGeometry(x, y, z) {
    var a = x / 2.0;
    var b = y / 2.0;
    var c = z / 2.0;

    var positions = [vec3.fromValues(-a, -b, c), // front
		     vec3.fromValues(a, -b, c),
		     vec3.fromValues(a, b, c),
		     
		     vec3.fromValues(-a, -b, c),
		     vec3.fromValues(a, b, c),
		     vec3.fromValues(-a, b, c),
		     
		     vec3.fromValues(-a, b, c), // top
		     vec3.fromValues(a, b, c),
		     vec3.fromValues(a, b, -c),
		     
		     vec3.fromValues(-a, b, c),
		     vec3.fromValues(a, b, -c),
		     vec3.fromValues(-a, b, -c),
		     
		     vec3.fromValues(-a, b, -c), // back
		     vec3.fromValues(a, b, -c),
		     vec3.fromValues(a, -b, -c),
		     
		     vec3.fromValues(-a, b, -c),
		     vec3.fromValues(a, -b, -c),
		     vec3.fromValues(-a, -b, -c),

		     vec3.fromValues(-a, -b, -c), // bottom
		     vec3.fromValues(a, -b, -c),
		     vec3.fromValues(a, -b, c),
		     
		     vec3.fromValues(-a, -b, -c),
		     vec3.fromValues(a, -b, c),
		     vec3.fromValues(-a, -b, c),
		     
		     vec3.fromValues(a, -b, c), // right
		     vec3.fromValues(a, -b, -c),
		     vec3.fromValues(a, b, -c),
		     
		     vec3.fromValues(a, -b, c),
		     vec3.fromValues(a, b, -c),
		     vec3.fromValues(a, b, c),
		     
		     vec3.fromValues(-a, -b, -c), // left
		     vec3.fromValues(-a, -b, c),
		     vec3.fromValues(-a, b, c),

		     vec3.fromValues(-a, -b, -c),
		     vec3.fromValues(-a, b, c),
		     vec3.fromValues(-a, b, -c)];
    var normals = [vec3.fromValues(0.0, 0.0, 1.0),
		   vec3.fromValues(0.0, 0.0, 1.0),
		   vec3.fromValues(0.0, 0.0, 1.0),
		   
		   vec3.fromValues(0.0, 0.0, 1.0),
		   vec3.fromValues(0.0, 0.0, 1.0),
		   vec3.fromValues(0.0, 0.0, 1.0),

		   vec3.fromValues(0.0, 1.0, 0.0),
		   vec3.fromValues(0.0, 1.0, 0.0),
		   vec3.fromValues(0.0, 1.0, 0.0),
		   
		   vec3.fromValues(0.0, 1.0, 0.0),
		   vec3.fromValues(0.0, 1.0, 0.0),
		   vec3.fromValues(0.0, 1.0, 0.0),
		   
		   vec3.fromValues(0.0, 0.0, -1.0),
		   vec3.fromValues(0.0, 0.0, -1.0),
		   vec3.fromValues(0.0, 0.0, -1.0),

		   vec3.fromValues(0.0, 0.0, -1.0),
		   vec3.fromValues(0.0, 0.0, -1.0),
		   vec3.fromValues(0.0, 0.0, -1.0),
		   
		   vec3.fromValues(0.0, -1.0, 0.0),
		   vec3.fromValues(0.0, -1.0, 0.0),
		   vec3.fromValues(0.0, -1.0, 0.0),
		   
		   vec3.fromValues(0.0, -1.0, 0.0),
		   vec3.fromValues(0.0, -1.0, 0.0),
		   vec3.fromValues(0.0, -1.0, 0.0),
		   
		   vec3.fromValues(1.0, 0.0, 0.0),
		   vec3.fromValues(1.0, 0.0, 0.0),
		   vec3.fromValues(1.0, 0.0, 0.0),
		   
		   vec3.fromValues(1.0, 0.0, 0.0),
		   vec3.fromValues(1.0, 0.0, 0.0),
		   vec3.fromValues(1.0, 0.0, 0.0),
		   
		   vec3.fromValues(-1.0, 0.0, 0.0),
		   vec3.fromValues(-1.0, 0.0, 0.0),
		   vec3.fromValues(-1.0, 0.0, 0.0),
		   
		   vec3.fromValues(-1.0, 0.0, 0.0),
		   vec3.fromValues(-1.0, 0.0, 0.0),
		   vec3.fromValues(-1.0, 0.0, 0.0)];
    var uvs = [vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       vec2.fromValues(0.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       vec2.fromValues(0.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       vec2.fromValues(0.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       vec2.fromValues(0.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       vec2.fromValues(0.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       
	       vec2.fromValues(0.0, 0.0),
	       vec2.fromValues(1.0, 1.0),
	       vec2.fromValues(0.0, 1.0)];
    return {positions: positions, normals: normals, uvs: uvs};
}
