import {
  TextureLoader, 
  FileLoader
} from 'three';

import { App } from './app.js';

import topo from './images/topo.png';
import asc from './images/mdt.asc';
import ang from './images/mdt_0_10_20m_ang.asc';
import vel from './images/mdt_0_10_20m_vel.asc';
import ang_45 from './images/mdt_45_10_20m_ang.asc';
import vel_45 from './images/mdt_45_10_20m_vel.asc';
import ang_90 from './images/mdt_90_10_20m_ang.asc';
import vel_90 from './images/mdt_90_10_20m_vel.asc';
import ang_135 from './images/mdt_135_10_20m_ang.asc';
import vel_135 from './images/mdt_135_10_20m_vel.asc';
import ang_180 from './images/mdt_180_10_20m_ang.asc';
import vel_180 from './images/mdt_180_10_20m_vel.asc';
import ang_225 from './images/mdt_225_10_20m_ang.asc';
import vel_225 from './images/mdt_225_10_20m_vel.asc';
import ang_270 from './images/mdt_270_10_20m_ang.asc';
import vel_270 from './images/mdt_270_10_20m_vel.asc';
import ang_315 from './images/mdt_315_10_20m_ang.asc';
import vel_315 from './images/mdt_315_10_20m_vel.asc';

const angulos = [ang, ang_45, ang_90, ang_135, ang_180, ang_225, ang_270, ang_315];
const velocidades = [vel, vel_45, vel_90, vel_135, vel_180, vel_225, vel_270, vel_315]

let app = new App();

class AssetsLoader {

  constructor () {
  }

  init () {
    const loader = new TextureLoader();
    let promises = []

    promises.push( new Promise( resolve => {
      loader.load( topo, ( t ) => {
        app.topoTexture = t;

        resolve( );
      });
    }));

    const l = new FileLoader();

    promises.push( new Promise( resolve => {
      l.load( asc, data => {
        app.mdtData = this.loadASC( data, 6 );

        for ( let i = 0; i < 400 * 400; i++ ) {
          app.terrainGeometry.attributes.position.array[ i * 3 + 2 ] = ( app.mdtData[ i ] / 700. ) - 2;
        }

        resolve( );
      });
    }));

    app.angData = [];
    angulos.forEach( value => {
    promises.push( new Promise( resolve => {
      l.load( value, data => {
        const d = data.split( /\r\n|\n/ );
        d.splice( 0, 6 );
        const e = d.map( elem => {
          const f =  elem.split( '\t' );
          f.pop();
          return f;
        });

        app.angData.push( new Float32Array( e.flat() ) );

        resolve( );
      });
    }));
    });

    app.velData = []
    velocidades.forEach( value => {
    promises.push( new Promise( resolve => {
      l.load( value, data => {
        const d = data.split( /\r\n|\n/ );
        d.splice( 0, 6 );
        const e = d.map( elem => {
          const f =  elem.split( '\t' );
          f.pop();
          return f;
        });

        app.velData.push( new Float32Array( e.flat() ) );

        resolve( );
      });
    }));
    });

    promises.push( new Promise( resolve => {
      let a = new Uint8Array( 256 * 256 * 4 );
      for ( let i= 0; i < 256 * 256; i++ ) {
        a[ i * 4 ] = 0;
        a[ i * 4 + 1 ] = 255;
        a[ i * 4 + 2 ] = 0;
        a[ i * 4 + 3 ] = 255;
      }
      app.fireData = a;

      resolve( );
    }));

    Promise.all( promises ).then( () => {
      document.querySelector('#spinner').style.display = 'none';
      app.init();
    });

  }

  loadASC ( data ) {
    const d = data.split( /\r\n|\n/ );
    d.splice( 0, 6 );
    const e = d.map( elem => {
      return elem.substring( 1 );
    });
    const f = e.join( ' ' ).split( ' ' );
    f.pop();
    return new Float32Array( f );
  }


}

export { AssetsLoader }
export { app }
