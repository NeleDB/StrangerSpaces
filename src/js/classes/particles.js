let scene, fieldOfView, camera, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
  renderer, container, particle;

let hemisphereLight, shadowLight;


const init = () => {
  createScene();
  createLights();
  createParticle();
  loop();
};

const createLights = () => {
  hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 10);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0x000000, .9);

  // Set the direction of the light
  shadowLight.position.set(120, 350, 350);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = - 400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = - 500;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  scene.add(hemisphereLight);
  scene.add(shadowLight);
};

const createScene = () => {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  scene = new THREE.Scene();
  particle = new THREE.Object3D();
  scene.add(particle);

  scene.fog = new THREE.Fog(0x123248, 0, 475);

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 30;
  nearPlane = 1;
  farPlane = 500;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;

  container = document.getElementById(`world`);
  container.appendChild(renderer.domElement);

  window.addEventListener(`resize`, handleWindowResize, false);
};

const handleWindowResize = () => {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
};


class Particle {
  constructor() {
    const geom = new THREE.SphereGeometry(.3, 32, 32);
    const mat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.4,
      depthWrite: true
    });

    for (let i = 0;i < 1000;i ++) {
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(Math.random() - .5, Math.random() - .7, Math.random() - 1) .normalize();
      mesh.position.multiplyScalar(120 + (Math.random() * 800));
      mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);

      particle.add(mesh);
    }
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
  }
}

const createParticle = () => {
  const particle = new Particle();
  particle.mesh.position.x = - 300;
  particle.mesh.position.y = - 800;
  scene.add(particle.mesh);
};

const loop = () => {
  const time = Date.now() * 0.005;
  particle.position.x += .03;
  particle.position.y += .03;

  for (let i = 0;i < particle.children.length;i ++) {
    // console.log(particle.children[i]);
    particle.children[i].material.opacity = .06 * (3 + Math.sin(2 * i + time));
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
};

init();
