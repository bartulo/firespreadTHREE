precision highp float;

uniform sampler2D fire;
uniform sampler2D topo;

varying vec2 vUv;

void main(void) 
{
  vec2 st = vUv;

  vec4 fire = texture2D(fire, st);
  vec4 o = texture2D(topo, st);
  
  float fireBool = step(-0.99, -fire.g);
  vec3 fColorA = vec3(0., 1., 0.);
  vec3 fColorB = vec3(1., 0., 0.);
  vec3 pct = vec3(0., 0., 0.);
  pct.x = smoothstep(0., 1., fire.r * 2.);
  pct.y = cos(fire.r * 3.141596 / 2.);

  vec3 color = mix(fColorA, fColorB, pct);
  vec3 final = mix(o.rgb, color, fireBool * 0.6);

  gl_FragColor = vec4( final.r, final.g, final.b, 1.0 );
// gl_FragColor = ((1. - 0.2) * fire.g + 0.2) * o;
}
