import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Water } from 'three/examples/jsm/objects/Water.js';
import { TextureLoader } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0.43, 1.66, 6.8 );
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0);
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
// use CubeCamera positioned at water level
// replace your water mesh with Reflector




/* const waterGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
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
water.position.y = 0; // adjust height */

/* water.material = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    side: THREE.DoubleSide,
    wireframe: true  // wireframe so you can see it even if it overlaps something
  }); */

//water.scale.set(10, 10, 10);


/* console.log(water.rotation);
console.log(water.geometry.parameters);
console.log(water.geometry.attributes.position.count);  */
/* scene.add(water); */

/* const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
cubeCamera.position.set(0, 0.1, 0);
scene.add(cubeCamera); */

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const diffuse = textureLoader.load('tallgrass/textures/M_FoliageAtlas2_diffuse.png');
diffuse.colorSpace = THREE.SRGBColorSpace;
diffuse.flipY = false;

let tallgrass;
loader.load(
  'tallgrass/scene.gltf', (gltf) => {
    tallgrass = gltf.scene; //save reference
    gltf.scene.scale.set(3, 3, 3);
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material.map = diffuse;
            child.material.color.set(0xffffff);
            child.material.needsUpdate = true; 
            
        
         
        }
      });
    
    scene.add(gltf.scene);

    const model1 = gltf.scene.clone();
    model1.position.set(1, 0, 0);
    model1.rotateY(95);
    scene.add(model1);
    const model2 = gltf.scene.clone();
    model2.position.set(2, 0, 0);
    scene.add(model2);

  },
  (progress) => {
    console.log('loading...', (progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('error loading model:', error);
  }
);


/* const waterGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
const water = new Reflector(waterGeometry, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: 0x006994,
});
water.material = new THREE.MeshStandardMaterial({
    color: 0x006994,
    envMap: cubeRenderTarget.texture,
    envMapIntensity: 0.3,
    roughness: 0.1,
    metalness: 0.9,
  });
  
water.rotation.x = -Math.PI / 2;
scene.add(water); */
const waterGeometry = new THREE.PlaneGeometry(100, 100);

const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new TextureLoader().load('waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0xa64d79,
  distortionScale: 0.3,
});

water.rotation.x = -Math.PI / 2;
scene.add(water);

/* {
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
  } */

  const color = 0xFFFFFF;
  const intensity = 20;
  const light = new THREE.PointLight(color, intensity);
  light.position.set(1.4, 2.75, 0.5);
  
  scene.add(light);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.intensity = 1.5; 
  directionalLight.position.set(50, 20, 50);
  scene.add(directionalLight);

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

const sun = new THREE.Vector3();
sun.set(0, 10, 0).normalize();
water.material.uniforms['sunDirection'].value.copy(sun);
water.material.uniforms['waterColor'].value.set(0x6c5a40);
water.material.uniforms['distortionScale'].value = 0.2;
water.material.uniforms['sunColor'].value.set(0x111111);
water.material.uniforms['alpha'].value = 1; //reflection strength
console.log(Object.keys(water.material.uniforms));
function animate() { //used to have (time)
    
    timer.update();

    // sync cubeCamera position to model each frame
   /*  if (tallgrass) { // check it's loaded before using
        cubeCamera.position.x = tallgrass.position.x;
        cubeCamera.position.z = tallgrass.position.z;
        cubeCamera.position.y = 0.1;
        
      } */

    water.visible = false;      // hide water so it doesn't reflect itself
 // cubeCamera.update(renderer, scene);
  water.visible = true;
    const time = timer.getElapsed();
    const positions = water.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        
      const x = positions.getX(i);
      const y = positions.getY(i);
      //positions.setY(i, Math.sin(x * 2 + time) * 0.1 + Math.sin(z * 2 + time) * 0.1);
      positions.setZ(i, 
        Math.sin(x * 5 + time) * 0.01 +
        Math.sin(y * 5 + time) * 0.01 +
        Math.sin(x * 2.7 + time * 0.4) * 0.05 +   // different frequency and speed
        Math.sin(y * 3.3 + time * 1.9) * 0.05 +   // different frequency and speed
        Math.sin((x + y) * 4.1 + time * 1.6) * 0.03 // diagonal wave
      );    }
    positions.needsUpdate = true;
    water.geometry.computeVertexNormals();
      
    water.material.uniforms['time'].value += 0.002;
    
    
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );