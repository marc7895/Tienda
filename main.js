import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
//import gsap from "gsap";
import './style.css'




//Instanciem el loader de models GLTF
const loader = new GLTFLoader();

const rotationSpeed = 0.001;

// array d’objectes dels quals hem d’actualitzar la rotació.
const objects = [];

const mouse = new THREE.Vector2();


const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
const cubo = new THREE.Mesh(geometry, material)
cubo.position.y = 10
scene.add(cubo);
objects.push(cubo);

const sizes = { width: window.innerWidth, height: window.innerHeight }

//PLA
const planeGeo = new THREE.PlaneGeometry(10, 10);
const planeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.receiveShadow = true;
plane.rotation.x = Math.PI * -0.5;
//scene.add(plane);

//LLUM
const llum = new THREE.AmbientLight(0XFFFFFF, 1)
llum.intensity = 3
scene.add(llum)


//CAMARA
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
);
camera.position.set(0, 4, 5);
camera.lookAt(plane.position);

//RAYCAST
const raycaster = new THREE.Raycaster();

//CARREGARMODELS 3D
let F1Car = null;
loadModel(
  "Models/ayrton_senna_f1_car_mclaren/scene.gltf",
  F1Car,
  new THREE.Vector3(-4, 1, 0),
  new THREE.Vector3(0.06,0.06,0.06),
  new THREE.Vector3(0,130,0),
  scene,
  "F1"
);

let Clio = null;
loadModel(
  "Models/Clio/scene.gltf",
  Clio,
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0.1,0.1,0.1),
  new THREE.Vector3(0,20,0),
  scene,
  "Renault"
);

let P206 = null;
loadModel(
  "Models/206/scene.gltf",
  P206,
  new THREE.Vector3(4, 0, 0),
  new THREE.Vector3(1,1,1),
  new THREE.Vector3(0,7,0),
  scene,
  "Peugeot"
);




const renderer = new THREE.WebGLRenderer()
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement);

//ANIMACIO
const clock = new THREE.Clock()
function animate() {
    const elapsedTime = clock.getElapsedTime()

    //    cubo.position.y = Math.sin(elapsedTime * 0.8) * 1.5


    rayCasting();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

//RAYCAST
function rayCasting() {
    //Raycast que sale desde la camara
    raycaster.setFromCamera(mouse, camera);
    //Objetos de la escena en un array
    
    const intersects = raycaster.intersectObjects(objects);
    console.log(intersects.length)
    //Cuando intersecciona cambia el tamaño
    for (const intersect of intersects) {
        
        const object = intersect.object;
        
        while (object.name != "Renault" || "F1" || "Peugeot"){
          object = object.parent
        }
        
        console.log(object)
        if (!object.originalScale) object.originalScale = object.scale.clone();
        object.scale.x = 2 * object.originalScale.x;
        object.scale.y = 2 * object.originalScale.y;
        object.scale.z = 2 * object.originalScale.z;
        
    }

    //No intersecciona vuelve al tamaño original
    for (const object of objects) {
        if (!intersects.find((intersect) => intersect.object === object)) {
            if (object.originalScale) {
                object.scale.x = object.originalScale.x;
                object.scale.y = object.originalScale.y;
                object.scale.z = object.originalScale.z;
            }
        }
    }

}

window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
    //console.log(mouse)
});

function loadModel(path, object3d, position, scale, rotation ,systemToAdd, name) {
    //Carregam el fitxer
    loader.load(
      path,
      //FUNCIONS DE CALLBACK
      function (gltf) {
        //Si es carrega correctament l'afegim a l'escena
        object3d = gltf.scene;
        object3d.position.set(position.x, position.y, position.z);
        object3d.scale.set(scale.x, scale.y, scale.z);
        object3d.rotation.set(rotation.x, rotation.y, rotation.z)
        systemToAdd.add(object3d);
        object3d.name;
        objects.push(object3d);
        
      },
      function (xhr) {
        //Aquesta funció de callback es crida mentre es carrega el model
        //i podem mostrar el progrés de càrrega
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        //callback per quan hi ha un error. El podem mostrar per consola.
        console.error(error);
      }
    );
  }