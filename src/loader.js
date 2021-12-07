import {
  TextureLoader, 
  FileLoader
} from 'three';

import { App } from './app.js';

import topo from './images/topo.png';
import asc from './images/mdt.asc';

class AssetsLoader {

  constructor () {
    this.app = new App();
  }

  init () {
    const loader = new TextureLoader();

    let t1 = new Promise( resolve => {
      loader.load( topo, ( t ) => {
        this.app.topoTexture = t;

        resolve( );
      });
    });

    const l = new FileLoader();

    let t2 = new Promise( resolve => {
      l.load( asc, data => {
        const d = data.split( /\r\n|\n/ );
        d.splice( 0, 6 );
        const e = d.map( elem => {
          return elem.substring( 1 );
        });
        const f = e.join( ' ' ).split( ' ' );
        f.pop();
        const g = new Float32Array( f );
        this.app.mdtData = g;

        console.log( g[200] );
        for ( let i = 0; i < 400 * 400; i++ ) {
          this.app.terrainGeometry.attributes.position.array[ i * 3 + 2 ] = ( g[ i ] / 700. ) - 1;
        }

        resolve( );
      });
    });

    let t3 = new Promise( resolve => {
      let a = new Uint8Array( 256 * 256 * 4 );
      for ( let i= 0; i < 256 * 256; i++ ) {
        a[ i * 4 ] = 0;
        a[ i * 4 + 1 ] = 255;
        a[ i * 4 + 2 ] = 0;
        a[ i * 4 + 3 ] = 255;
      }
      this.app.fireData = a;

      resolve( );
    });

    Promise.all( [ t1, t2, t3 ] ).then( () => {
      this.app.init();
    });

  }
}

export { AssetsLoader }
