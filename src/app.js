import {
  Mesh,
  PerspectiveCamera,
  Scene, 
  WebGLRenderer,
  PlaneGeometry,
  WebGLRenderTarget,
  ShaderMaterial,
  OrthographicCamera,
  DataTexture,
  RedFormat,
  FloatType,
  RGBAFormat,
  Vector2,
  Raycaster,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

class App {

  constructor () {
    this.camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 300 );
    this.camera.position.set( 0, 5, 0);
    this.orthoCamera = new OrthographicCamera( -128, 128, 128, -128, .1, 1000 );
    this.orthoCamera.position.z = 5;
    this.scene = new Scene();
    this.fireSpreadScene = new Scene();

    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.stats = new Stats();
    document.body.appendChild( this.stats.dom );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.maxPolarAngle = Math.PI /2;
    this.controls.update();

    this.textureA = new WebGLRenderTarget( 256, 256 );
    this.textureB = new WebGLRenderTarget( 256, 256 );

    this.terrainGeometry = new PlaneGeometry( 2, 2, 399, 399 );
    document.addEventListener('mousedown', this.mouseClicked.bind( this ))
  }

  init () {

    //
    // FIRESPREAD
    //
    
    window.addEventListener('resize', this.onWindowResize.bind( this ), false );

    const vShader = require('./glsl/vertex.glsl');
    const fShader = require('./glsl/fragment.glsl');

    const mdtDataTexture = new DataTexture( this.mdtData, 400, 400, RedFormat, FloatType );
    const fireDataTexture = new DataTexture( this.fireData, 256, 256, RGBAFormat );
    mdtDataTexture.flipY = true;
    fireDataTexture.flipY = true;

    const fireSpreadGeometry = new PlaneGeometry( 256, 256 );
    this.fireSpreadMaterial = new ShaderMaterial( {
      uniforms: {
        fire: { type: 't', value: fireDataTexture },
        mdt: { type: 't', value: mdtDataTexture }
      },
      vertexShader: vShader,
      fragmentShader: fShader
    } );
    const fireSpreadPlane = new Mesh( fireSpreadGeometry, this.fireSpreadMaterial );
    
    this.fireSpreadScene.add( fireSpreadPlane );

    //
    // TERRAIN
    //
    
    const terrainVShader = require('./glsl/terrainVertex.glsl');
    const terrainFShader = require('./glsl/terrainFragment.glsl');

    const terrainMaterial = new ShaderMaterial( {
      uniforms: {
        fire: { type: 't', value: this.textureA.texture },
        topo: { type: 't', value: this.topoTexture },
        dataText: { type: 't', value: mdtDataTexture }
      },
      vertexShader: terrainVShader,
      fragmentShader: terrainFShader
    } );
  const plane = new Mesh( this.terrainGeometry, terrainMaterial );
    plane.rotation.set( Math.PI / 2, Math.PI, Math.PI );

    this.scene.add( plane );

    this.animate();
  }

  mouseClicked () {
    const mouse = new Vector2();
    const raycaster = new Raycaster();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    let fData = this.fireData;
    raycaster.setFromCamera( mouse, this.camera );
    const intersect = raycaster.intersectObjects( this.scene.children )

    const fireX = parseInt( ( intersect[0].point.x + 1 ) * 255 / 2 );
    const fireY = parseInt( ( intersect[0].point.z + 1 ) * 255 / 2 );
    const ident = ( 256 * fireY + fireX ) * 4 + 2;

    fData[ident] = 255;
    let fDataTexture = new DataTexture( fData, 256, 256, RGBAFormat );
    fDataTexture.flipY = true;

    this.fireSpreadMaterial.uniforms.fire.value = fDataTexture;
  }

  onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }

  animate() {

    requestAnimationFrame( this.animate.bind( this ) );
    this.controls.update();
    this.stats.update();
    this.render();

  }

  render() {

    this.renderer.setRenderTarget( this.textureB );
    this.renderer.render( this.fireSpreadScene, this.orthoCamera );
    this.renderer.setRenderTarget( null );
    this.renderer.render( this.scene, this.camera );

    let temp = this.textureA;
    this.textureA = this.textureB;
    this.textureB = temp; 

    this.fireSpreadMaterial.uniforms.fire.value = this.textureA.texture;

  }
}

export { App }
