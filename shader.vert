attribute vec4 vPosition;
attribute vec3 vNormal;
attribute vec2 vUV;

varying vec3 normal;
varying vec2 uv;

uniform mat4 uMV;
uniform mat4 uP;
uniform mat3 uN;

void main() {
     normal = uN * vNormal;
     uv = vUV;
     gl_Position = uP * uMV * vPosition;
}