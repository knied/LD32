attribute vec4 vPosition;
attribute vec3 vNormal;
//attribute vec2 vUV;

varying vec3 normal;
//varying vec2 uv;
varying vec3 lightDirection;

uniform mat4 uM;
uniform mat4 uV;
uniform mat4 uP;
uniform mat3 uN;

void main() {
     normal = uN * vNormal;
     //uv = vUV;
     lightDirection = normalize((uV * vec4(0.6, -1.0, -0.8, 0.0)).xyz);
     gl_Position = uP * uV * uM * vPosition;
}