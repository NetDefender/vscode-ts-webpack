import {
  BoxGeometry,
  Camera,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Renderer,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer,
} from "three";
import img from "./image.jpg";

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer;
let boxMesh: Mesh, spehereMesh: Mesh;

init();
animate();

function init() {
  camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 400;

  const texture = new TextureLoader().load(img);
  const boxGeometry = new BoxGeometry(50, 50, 50);
  const sphereGeometry = new SphereGeometry(25);
  const material = new MeshBasicMaterial({ map: texture });

  boxMesh = new Mesh(boxGeometry, material);
  spehereMesh = new Mesh(sphereGeometry, material);
  spehereMesh.position.set(-150, 0, 10);
  scene = new Scene();
  scene.add(boxMesh, spehereMesh);

  renderer = new WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  boxMesh.rotation.x += 0.007;
  boxMesh.rotation.y -= 0.011;

  spehereMesh.rotation.x -= 0.007;
  spehereMesh.rotation.y += 0.011;

  renderer.render(scene, camera);
}
