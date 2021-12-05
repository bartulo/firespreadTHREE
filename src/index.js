import { App } from './app.js';
import { TextureLoader, FileLoader } from 'three';
import test from './images/test3.png';
import prueba from './images/prueba.png';
import orto from './images/orto.png';
import asc from './images/pr.asc';
const app = new App();

const loader = new TextureLoader();
let t1 = new Promise(resolve => {
  loader.load( test, (t) => {
    resolve(t);
  });
});

let t2 = new Promise(resolve => {
  loader.load( prueba, (t) => {
    resolve(t);
  });
});

let t3 = new Promise(resolve => {
  loader.load( orto, (t) => {
    resolve(t);
  });
});

const l = new FileLoader();

let t4 = new Promise( resolve => {
  l.load(asc, ( data ) => {
    const d = data.split(/\r\n|\n/);
    d.splice(0, 6);
    const e = d.map( ( elem ) => {
      return elem.substring(1);
    });
    const f = e.join(' ').split(' ');
    f.pop();
    const g = new Float32Array( f );
    resolve(g);
  });
});

Promise.all([t1, t2, t3, t4]).then( values => {
  app.init( values );
});

