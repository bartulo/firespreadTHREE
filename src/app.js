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
  Clock,
} from 'three';

import { OrbitControlsMod } from './OrbitControlsMod';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

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
    document.body.appendChild( this.stats.domElement );
    this.gui = new GUI();
    this.prueba = {
      'fps': 30,
      'viento': 0.2,
      'direccion': 0
    }
    this.gui.add( this.prueba, 'fps', 0, 60, 1 ).onChange( this.fpsUpdate.bind( this ) );
    this.gui.add( this.prueba, 'viento', 0, 2, 0.05 ).onChange( this.vientoUpdate.bind( this ) );
    this.gui.add( this.prueba, 'direccion', 0, 316, 45 ).onChange( this.direccionUpdate.bind( this ) );

    this.controls = new OrbitControlsMod( this.camera, this.renderer.domElement, this );
    this.controls.maxPolarAngle = Math.PI /2;
    this.controls.update();

    this.textureA = new WebGLRenderTarget( 256, 256 );
    this.textureB = new WebGLRenderTarget( 256, 256 );

    this.terrainGeometry = new PlaneGeometry( 2, 2, 399, 399 );

    this.clock = new Clock();
    this.delta = 0;
    this.interval = 1 / 30;
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
    this.angDataTexture = []
    this.velDataTexture = []
    this.angData.forEach( value => {
      let b = new DataTexture( value, 100, 103, RedFormat, FloatType );
      this.angDataTexture.push( b );
    });
    this.velData.forEach( value => {
      let b = new DataTexture( value, 100, 103, RedFormat, FloatType );
      this.velDataTexture.push( b );
    });
    mdtDataTexture.flipY = true;
    fireDataTexture.flipY = true;
    this.angDataTexture.forEach( value => {
      value.flipY = true;
    });
    this.velDataTexture.forEach( value => {
      value.flipY = true;
    });

    const fireSpreadGeometry = new PlaneGeometry( 256, 256 );
    this.fireSpreadMaterial = new ShaderMaterial( {
      uniforms: {
        windfactor: { value: this.prueba.viento },
        fire: { type: 't', value: fireDataTexture },
        mdt: { type: 't', value: mdtDataTexture },
        ang: { type: 't', value: this.angDataTexture[0] },
        vel: { type: 't', value: this.velDataTexture[0] }
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
      },
      vertexShader: terrainVShader,
      fragmentShader: terrainFShader
    } );
  const plane = new Mesh( this.terrainGeometry, terrainMaterial );
    plane.rotation.set( Math.PI / 2, Math.PI, Math.PI );

    this.scene.add( plane );

    this.animate();
  }

  fpsUpdate () {
    this.interval = 1 / this.prueba.fps;
  }

  vientoUpdate () {
    this.fireSpreadMaterial.uniforms.windfactor.value = this.prueba.viento;
  }
  
  direccionUpdate () {
    const ind = parseInt( this.prueba.direccion ) / 45;
    this.fireSpreadMaterial.uniforms.ang.value = this.angDataTexture[ind];
    this.fireSpreadMaterial.uniforms.vel.value = this.velDataTexture[ind];
    console.log( this.angData[ind] );
  }

  onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }

  animate() {

    requestAnimationFrame( this.animate.bind( this ) );
    this.stats.update();

    this.renderer.setRenderTarget( null );
    this.renderer.render( this.scene, this.camera );

    this.delta += this.clock.getDelta();
    if ( this.delta > this.interval ) {
      this.render();
      this.delta = this.delta % this.interval;
    }

  }

  render() {

    this.renderer.setRenderTarget( this.textureB );
    this.renderer.render( this.fireSpreadScene, this.orthoCamera );

    let temp = this.textureA;
    this.textureA = this.textureB;
    this.textureB = temp; 

    this.fireSpreadMaterial.uniforms.fire.value = this.textureA.texture;

  }
}

export { App }
