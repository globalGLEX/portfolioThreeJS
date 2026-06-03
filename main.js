import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { TextureLoader } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import './main.css';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0.43, 2.66, 19);
const originalCameraPos = camera.position.clone();

const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x160b00);
scene.fog = new THREE.FogExp2(0x111111, 0.03); // match fog color to background
renderer.setPixelRatio(1);
document.body.appendChild( renderer.domElement );


/* const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0);
controls.update();
 */

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const diffuse = textureLoader.load('tallgrass/textures/M_FoliageAtlas2_diffuse.png');
diffuse.colorSpace = THREE.SRGBColorSpace;
diffuse.flipY = false;

loader.load('dock/scene.gltf', (gltf) => {

  const dock = gltf.scene;
  dock.position.set(-6, -2, 20);
  scene.add(gltf.scene);
  onModelLoaded();
});

const width = 11;
const height = 18;
const geometry = new THREE.PlaneGeometry(9, 16, 20, 20);
/* const positions = geometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);
  positions.setZ(i, 
    Math.sin(x * 0.5) * 0.3 +   // wave along x axis
    Math.sin(y * 0.9) * 0.3      // wave along y axis
  );
}
positions.needsUpdate = true;
geometry.computeVertexNormals(); */

const material = new THREE.MeshPhysicalMaterial({
  color: 0xC266FF,     
  metalness: 0.9,
  roughness: 0.15,
  reflectivity: 1.0,
  clearcoat: 1.0,       // adds extra glossy top layer
  clearcoatRoughness: 0.1,
  sheen: 0.8,           // gives it a slight fabric/foil sheen
  sheenColor: 0x69B905, 
});
let modelsLoaded = 0;
const totalModels = 3; 

function onModelLoaded() {
  modelsLoaded++;
  if (modelsLoaded === totalModels) {
    document.getElementById('moon-container').style.display = 'block';
    document.getElementById('volume').style.display = 'block';
    document.getElementById('sound-btn').style.display = 'block';
    startPlaneAnimation();
  }
}

const plane = new THREE.Mesh(geometry, material);
function startPlaneAnimation() {
// set starting position
plane.position.set(0, -20, -4);
plane.visible = true;


// animate to final position
gsap.to(plane.position, {
  y: 4,
  duration: 2.5,
  ease: 'expo.out', // easing in from fast to slow
  delay: 2,         // optional delay before starting
});
}
plane.visible = false;
plane.rotateZ(1.57)
plane.rotateY(0);
plane.rotateX(0);
scene.add(plane);

let textMesh;
const fontLoader = new FontLoader();
fontLoader.load('public/Blacksword_Regular.json', (font) => {
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xB7F76E }), // front face
    new THREE.MeshStandardMaterial({ color: 0xC266FF })
  ];
  
  const geometry = new TextGeometry('Projects', {
    font: font,
    size: 30,
    depth: 0,      // extrusion depth
    bevelEnabled: false,
   
  });
 

  textMesh = new THREE.Mesh(geometry, materials); // pass array
  textMesh.scale.set(0.1, 0.1, 0.1);
  textMesh.rotateZ(-1.57);
  textMesh.position.set(-1, 7.5, 0.1);

  plane.add(textMesh);
  
  
});

const hitbox = document.getElementById('model-hitbox');
let isZoomedIn = false;

document.getElementById('overlay').addEventListener('click', (e) => {
  e.stopPropagation();
});

hitbox.addEventListener('click', (e) => {
  e.stopPropagation(); 
  if (!isZoomedIn) {
    isZoomedIn = true;
    
    hitbox.style.display = 'none'; // hide on zoom in
    document.getElementById('moon-container').style.opacity = '0';
    gsap.to(camera.position, {
      x: 0, y: 4, z: 2,
      duration: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('overlay').classList.add('visible');
        if (textMesh) textMesh.visible = false;
        console.log(textMesh.visible);
       
      }
    });
  }
});
document.addEventListener('click', (e) => {
  if (!hitbox.contains(e.target) && isZoomedIn) {
    isZoomedIn = false;
    document.getElementById('overlay').classList.remove('visible'); // hide immediately
    gsap.to(camera.position, {
      x: originalCameraPos.x,
      y: originalCameraPos.y,
      z: originalCameraPos.z,
      duration: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        document.getElementById('moon-container').style.opacity = '1';
        hitbox.style.display = 'block'; // show again after zoom out finishes
        if (textMesh) textMesh.visible = true;
      }
    });
  }
});

loader.load('plants/scene.gltf', (gltf) => {
  
  const plant = gltf.scene;
  plant.position.set(18, 0, 5);
  plant.scale.set(0.02,0.02,0.02);
  plant.rotateY(140);
  scene.add(gltf.scene);
  onModelLoaded();

  gltf.scene.traverse((child) => {
    if (child.isMesh && child.material.map) {
      child.material.map.minFilter = THREE.NearestFilter;
      child.material.map.magFilter = THREE.NearestFilter;
      child.material.color.multiplyScalar(0.1); // 0-1, lower = darker
      child.material.map.needsUpdate = true;
    }
  });
});
let tallgrass, originalPositions;
let maxY = -Infinity;//for animation
let threshold = 0; // only move top 20%
loader.load(
  'tallgrass/scene.gltf', (gltf) => {
    let geometry, material;
   

    tallgrass = gltf.scene; //save reference
    gltf.scene.scale.set(6,6,6);
    gltf.scene.position.set(-13, -1, 6);
    gltf.scene.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const positions = child.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            maxY = Math.max(maxY, positions.getY(i));
          }

          geometry = child.geometry;
          material = child.material;
            child.material.map = diffuse;
            child.material.color.set(0xffffff);
            child.material.needsUpdate = true; 
            //for animating grass
            originalPositions = positions.array.slice();
            
        
         
        }
      });
      threshold = maxY * 0.6; //0.6 should animate top 40% of model
   /*    
   without animation:
   
   gltf.scene.traverse((child) => {
        if (child.isMesh) {
          geometry = child.geometry;
          material = child.material;
            child.material.map = diffuse;
            child.material.color.set(0xffffff);
            child.material.needsUpdate = true; 
            //for animating grass
            originalPositions = child.geometry.attributes.position.array.slice();
            
        
         
        }
      }); */



       // define positions and rotations
       const instances = [
        { position: [-7, -4, 2], rotationY: 20 },
        { position: [-13, -2, 2], rotationY: 0 },
        { position: [-14, 0, 2], rotationY: 145 },
        { position: [-13, -2, -2], rotationY: 120 },
        { position: [-15, -2, 2], rotationY: 0 },
        { position: [-17, -2, 2], rotationY: 30 },
        { position: [-19, -2, 2], rotationY: 60 },
        { position: [-21, -2, 2], rotationY: 120 },
        { position: [-23, -2, 2], rotationY: 40 },
        { position: [-25, -2, 2], rotationY: 70 },
        { position: [-27, -2, 2], rotationY: 100 },
        { position: [-29, -2, 2], rotationY: 0 },
        { position: [-31, -2, 2], rotationY: 10 },
        { position: [-31, -2, -2], rotationY: 0 },
        { position: [-31, -2, -2], rotationY: 20 },
        { position: [-31, -4, 2], rotationY: 0 },
        { position: [-29, -8, 2], rotationY: 0 },
        { position: [13, 2, 0],  rotationY: 0 },
        { position: [-10, 0, 0],  rotationY: 16 },
        { position: [13, 0, 2], rotationY: 150 },
        { position: [14, 0, 2], rotationY: 45 },
        { position: [13, 0, -2], rotationY: 90 },
        { position: [15, 0, 2], rotationY: 0 },
        { position: [17, 0, 2], rotationY: 30 },
        { position: [19, 0, 2], rotationY: 70 },
        { position: [21, 0, 2], rotationY: 120 },
        { position: [23, 0, 2], rotationY: 30 },
        { position: [25, 0, 2], rotationY: 70 },
        { position: [27, 0, 2], rotationY: 90 },
        { position: [27, 0, -2], rotationY: 0 },
        { position: [29, 0, -2], rotationY: 120 },
        { position: [29, 0, 2], rotationY: 130 },
        { position: [31, 0, -4], rotationY: 120 },
        { position: [33, 0, 2], rotationY: 0 },
        { position: [35, 0, -4], rotationY: 120 },
        { position: [31, 0, -3], rotationY: 0 },
        { position: [29, 0, 1], rotationY: 120 },
        { position: [29, 0, 2], rotationY: 0 },
        { position: [15, 0, -19], rotationY: 0 },
        { position: [16, 0, -19], rotationY: 120 },
        { position: [18, 0, -18], rotationY: 90 },
        { position: [20, 0, -19], rotationY: 45 },
        { position: [22, 0, -19], rotationY: 0 },
        { position: [24, 0, -18], rotationY: 90 },
        { position: [26, 0, -19], rotationY: 0 },
        { position: [28, 0, -19], rotationY: 120 },
        { position: [30, 0, -18], rotationY: 90 },
        
        { position: [4, -3, 18], rotationY: 0 },
        { position: [5, -3, 18], rotationY: 100 },
      ];
      const instancedMesh = new THREE.InstancedMesh(geometry, material, instances.length);

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const rotation = new THREE.Euler();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(0.1, 0.1, 0.1);

      instances.forEach((inst, i) => {
        position.set(...inst.position);
        rotation.set(0, inst.rotationY, 0);
        quaternion.setFromEuler(rotation);
        matrix.compose(position, quaternion, scale);
        instancedMesh.setMatrixAt(i, matrix);
      });

      
  instancedMesh.instanceMatrix.needsUpdate = true;
  scene.add(instancedMesh);

  scene.add(gltf.scene);
  onModelLoaded();//for waiting before plane animation

  },
  (progress) => {
    console.log('loading...', (progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('error loading model:', error);
  }
  
);

const skyGeometry = new THREE.SphereGeometry(100, 16, 16);
const skyMaterial = new THREE.MeshBasicMaterial({
  color: 0x16000d,
  side: THREE.BackSide, // render inside of sphere
  depthWrite: false,
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

const waterGeometry = new THREE.PlaneGeometry(100, 100);

const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  waterNormals: new TextureLoader().load('waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xbf9000,
  waterColor: 0xa64d79,
  distortionScale: 0.8,
});

water.rotation.x = -Math.PI / 2;
scene.add(water);


const color = 0xFFFFFF;
const intensity = 200;
const light = new THREE.PointLight(color, intensity);
light.position.set(12.64, 7.47, 5.34);
  
scene.add(light);
  
/*   const spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(10, 5, 0);
spotLight.angle = Math.PI / 8; // beam width
spotLight.penumbra = 0.3;       // soft edges
scene.add(spotLight);
 */

// Three.js audio setup
let audioStarted = false; 
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('audio.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.3);
  //sound.play();
});
const soundBtn = document.getElementById('sound-btn');

soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (listener.context.state === 'suspended') {
    listener.context.resume();
  }
  if (!audioStarted) {
    audioStarted = true;
    sound.play();
    soundBtn.textContent = '🔊';
  } else if (sound.isPlaying) {
    sound.pause();
    soundBtn.textContent = '🔇';
  } else {
    sound.play();
    soundBtn.textContent = '🔊';
  }
});

// connect slider to volume
document.getElementById('volume').addEventListener('input', (e) => {
  sound.setVolume(e.target.value);
});

const directionalLight = new THREE.DirectionalLight(0xffffff, 9.5);
directionalLight.intensity = 9.5; 
directionalLight.position.set(0, 10, 15);
scene.add(directionalLight);

/* const helper = new THREE.PointLightHelper(light);
scene.add(helper); */

function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -20, 20).onChange(onChangeFn);
    folder.add(vector3, 'y', -10, 20).onChange(onChangeFn);
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

const timer = new THREE.Timer();

const sun = new THREE.Vector3();
sun.set(0, 10, 0).normalize();
water.material.uniforms['sunDirection'].value.copy(sun);
water.material.uniforms['waterColor'].value.set(0x111111);
water.material.uniforms['distortionScale'].value = 0.2;
water.material.uniforms['sunColor'].value.set(0x111111);
water.material.uniforms['alpha'].value = 1; //reflection strength
console.log(Object.keys(water.material.uniforms));

function animate() { //used to have (time)
    
    timer.update();

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
      
    water.material.uniforms['time'].value += 0.002; //water speed
    

    //for animating grass
    if (tallgrass && originalPositions) {
      tallgrass.traverse((child) => {
        if (child.isMesh && child.geometry) { 
        const positions = child.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const oy = originalPositions[i * 3 + 1];
          if (oy > threshold) {
            const ox = originalPositions[i * 3];
            const oz = originalPositions[i * 3 + 2];
            const influence = (oy - threshold) / (maxY - threshold); // 0 at threshold, 1 at top
            positions.setX(i, ox + Math.sin(oy * 2 + time) * 0.45 * influence);
            positions.setZ(i, oz + Math.cos(oy * 2 + time) * 0.45 * influence);
          }
        }
        positions.needsUpdate = true;
        child.geometry.computeVertexNormals();
      }//if stmt
      });
    }
 
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );