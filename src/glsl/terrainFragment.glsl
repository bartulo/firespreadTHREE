precision highp float;

uniform sampler2D fire;
uniform sampler2D topo;

varying vec2 vUv;

void main(void) 
{
  vec2 st = vUv;

  vec4 fire = texture2D(fire, st);
  vec4 o = texture2D(topo, st);

//  gl_FragColor = vec4( fire.r, fire.g, fire.b, 1.0 );
  gl_FragColor = ((1. - 0.2) * fire.g + 0.2) * o;
}
