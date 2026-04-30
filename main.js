import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 2, 6, 20 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 2, 0);
controls.update();

/* const planeSize = 40;
     
const loader = new THREE.TextureLoader();
const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh); */

const waterGeometry = new THREE.PlaneGeometry(10, 10, 40, 40);
const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x006994,
    metalness: 0.1,
    roughness: 0.0,      // 0 = mirror-like
    transmission: 0.5,   // transparency
    thickness: 0.5,
    envMapIntensity: 1,  // reflection strength
    side: THREE.DoubleSide,
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2; // makes it lay flat
water.position.y = 0; // adjust height

/* water.material = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    side: THREE.DoubleSide,
    wireframe: true  // wireframe so you can see it even if it overlaps something
  }); */

//water.scale.set(10, 10, 10);

console.log(scene.children); // should show water in the list
console.log(water.rotation);
console.log(water.geometry.parameters);
console.log(water.geometry.attributes.position.count); 
scene.add(water);



{
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
  {
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
  }

  const color = 0xFFFFFF;
  const intensity = 150;
  const light = new THREE.PointLight(color, intensity);
  light.position.set(0, 7, 0);
  
  scene.add(light);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

  const helper = new THREE.PointLightHelper(light);
  scene.add(helper);

  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }
  
  class ColorGUIHelper {
      constructor(object, prop) {
        this.object = object;
        this.prop = prop;
      }
      get value() {
        return '#' + this.object[this.prop].getHexString();
      }
      set value(hexString) {
        this.object[this.prop].set(hexString);
      }
    }

function updateLight() {
    
    helper.update();
    }

  const gui = new GUI();
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 250, 1);
gui.add(light, 'distance', 0, 40).onChange(updateLight);
/* gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10); */

makeXYZGUI(gui, light.position, 'position', updateLight);
/* makeXYZGUI(gui, light.target.position, 'target', updateLight); */

camera.position.z = 12;

const timer = new THREE.Timer();

function animate() { //used to have (time)
    
    timer.update();
    const time = timer.getElapsed();
    const positions = water.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        
      const x = positions.getX(i);
      const y = positions.getY(i);
      //positions.setY(i, Math.sin(x * 2 + time) * 0.1 + Math.sin(z * 2 + time) * 0.1);
      positions.setZ(i, Math.sin(x * 5 + time) * 0.1 + Math.sin(y * 5 + time) * 0.1); //big multi = higher frequency
    }
    positions.needsUpdate = true;
    water.geometry.computeVertexNormals();
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );