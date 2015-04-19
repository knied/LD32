precision mediump float;

varying vec3 normal;
//varying vec2 uv;
varying vec3 lightDirection;

//uniform sampler2D uTexture;
uniform vec3 uColor;

void main() {
     //vec3 lightDirection = normalize(vec3(0.0, 0.0, -1.0));
     float i = max(0.0, dot(-lightDirection, normalize(normal)));
     i = max(i, 0.25);
     i = min(1.0, i);
     gl_FragColor = vec4(i * uColor, 1.0);
     //gl_FragColor = vec4(i * texture2D(uTexture, uv).rgb, 1.0);
     //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}