import * as THREE from 'three';

export default class Particle {
  constructor(particle) {
    this.geom = new THREE.SphereGeometry(.3, 32, 32);
    this.mat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.4,
      depthWrite: true
    });

    for (let i = 0;i < 1000;i ++) {
      const mesh = new THREE.Mesh(this.geom, this.mat);
      mesh.position.set(Math.random() - .5, Math.random() - .7, Math.random() - 1) .normalize();
      mesh.position.multiplyScalar(120 + (Math.random() * 800));
      mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);

      particle.add(mesh);
    }
    this.mesh = new THREE.Mesh(this.geom, this.mat);
    this.mesh.receiveShadow = true;
  }
}
