import {
  Mesh,
  PerspectiveCamera,
  Scene, 
  WebGLRenderer,
  PlaneGeometry,
  WebGLRenderTarget,
  ShaderMaterial,
  OrthographicCamera,
  MeshBasicMaterial,
  DataTexture,
  RedFormat,
  FloatType,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let camera, orthoCamera, scene, fireSpreadScene, renderer, fireSpreadMaterial, controls, textureA, textureB;

class App {

  init( textures ) {

    camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 300 );
    camera.position.set( 0, 5, 0);
    orthoCamera = new OrthographicCamera( -128, 128, 128, -128, .1, 1000 );
    orthoCamera.position.z = 5;

    renderer = new WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI /2;
    controls.update();

    //
    // FIRESPREAD
    //
    
    fireSpreadScene = new Scene();
    
    window.addEventListener('resize', onWindowResize, false );

    textureA = new WebGLRenderTarget( 256, 256 );
    textureB = new WebGLRenderTarget( 256, 256 );

    const vShader = require('./glsl/vertex.glsl');
    const fShader = require('./glsl/fragment.glsl');

    const mdtDataTexture = new DataTexture( textures[3], 400, 400, RedFormat, FloatType );
    mdtDataTexture.flipY = true;

    const fireSpreadGeometry = new PlaneGeometry( 256, 256 );
    fireSpreadMaterial = new ShaderMaterial( {
      uniforms: {
        fire: { type: 't', value: textures[0] },
        mdt: { type: 't', value: mdtDataTexture }
      },
      vertexShader: vShader,
      fragmentShader: fShader
    } );
    const fireSpreadPlane = new Mesh( fireSpreadGeometry, fireSpreadMaterial );
    
    fireSpreadScene.add( fireSpreadPlane );

    //
    // TERRAIN
    //
    
    scene = new Scene();
    const geometry = new PlaneGeometry( 2, 2, 399, 399 );

    const terrainVShader = require('./glsl/terrainVertex.glsl');
    const terrainFShader = require('./glsl/terrainFragment.glsl');

    const material = new ShaderMaterial( {
      uniforms: {
        fire: { type: 't', value: textureA.texture },
        mdt: { type: 't', value: textures[1] },
        orto: { type: 't', value: textures[2] },
        dataText: { type: 't', value: mdtDataTexture }
      },
      vertexShader: terrainVShader,
      fragmentShader: terrainFShader
    } );
    const plane = new Mesh( geometry, material );
    plane.rotation.set( Math.PI / 2, Math.PI, Math.PI );

    scene.add( plane );

    animate();
  }
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );
  controls.update();
  render();

}

function render() {

  renderer.setRenderTarget( textureB );
  renderer.render( fireSpreadScene, orthoCamera );
  renderer.setRenderTarget( null );
  renderer.render( scene, camera );

  let temp = textureA;
  textureA = textureB;
  textureB = temp; 

  fireSpreadMaterial.uniforms.fire.value = textureA.texture;

}

export { App }
