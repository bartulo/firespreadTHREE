precision highp float;

uniform sampler2D fire;
uniform sampler2D mdt;

varying vec2 vUv;

void main(void) 
{
  vec2 st = vUv;
  vec2 dx = vec2(0.004, 0.0);
  vec2 dy = vec2(0.0, 0.004);
  vec2 r = gl_FragCoord.xy;
  vec4 f01 = texture2D(fire, st - dy);
  vec4 f10 = texture2D(fire, st - dx);
  vec4 f11 = texture2D(fire, st);
  vec4 f12 = texture2D(fire, st + dx);
  vec4 f21 = texture2D(fire, st + dy);

  vec4 p01 = texture2D(mdt, st - dy);
  vec4 p10 = texture2D(mdt, st - dx);
  vec4 p11 = texture2D(mdt, st);
  vec4 p12 = texture2D(mdt, st + dx);
  vec4 p21 = texture2D(mdt, st + dy);

  float coefPend = 1.;
  float pendS = clamp((((p11.r - p01.r) * coefPend) + 1.) / 2., 0.15, 1.0);
  float pendW = clamp((((p11.r - p10.r) * coefPend) + 1.) / 2., 0.15, 1.0);
  float pendE = clamp((((p11.r - p12.r) * coefPend) + 1.) / 2., 0.15, 1.0);
  float pendN = clamp((((p11.r - p21.r) * coefPend) + 1.) / 2., 0.15, 1.0);

  // hay fuego a partir de una temperatura determinada 
  float temp = f11.b;
  float c = step(0.5, f11.b);
  float f = temp * c;

  // La siguiente constante equivale a un if. Si hay vegetación hay fuego. Si no, no
  float cv = step( 0.1, f11.g );
  
  float PrFire = ( f01.b * pendS + f10.b * pendW + f12.b * pendE + f21.b * pendN ) * cv - 0.1;
  PrFire = PrFire * 0.1;
  

  gl_FragColor = vec4( f, f11.g - 0.1 * f* c, f11.b + PrFire, 1. );
}
