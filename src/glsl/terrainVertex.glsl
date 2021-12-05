varying vec2 vUv;
uniform sampler2D mdt;

void main()
{
  vUv =  uv;
  vec4 m = texture2D(mdt, uv);
  vec3 p = vec3(position.x, position.y, m.r / 2.);
  vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
