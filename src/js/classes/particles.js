import * as THREE from 'three';

let scene, fieldOfView, camera, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
  renderer, container, particle;

let hemisphereLight, shadowLight;

import Particle from './Particle';

export default class Particles {
  constructor() {
    this.createScene();
    this.createLights();
    this.createParticle();
    this.loop();
  }

  createLights = () => {
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
  }

  createScene = () => {
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

    window.addEventListener(`resize`, this.handleWindowResize, false);
  }

  handleWindowResize = () => {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  };

  createParticle = () => {
    const part = new Particle(particle);
    part.mesh.position.x = - 300;
    part.mesh.position.y = - 800;
    scene.add(part.mesh);
  };

  loop = () => {
    const time = Date.now() * 0.005;
    particle.position.x += .03;
    particle.position.y += .03;

    for (let i = 0;i < particle.children.length;i ++) {
      // console.log(particle.children[i]);
      particle.children[i].material.opacity = .06 * (3 + Math.sin(2 * i + time));
    }

    renderer.render(scene, camera);
    requestAnimationFrame(this.loop);
  };
}
