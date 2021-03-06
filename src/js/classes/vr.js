import * as THREE from 'three';

export default class vr {
  constructor(img) {
    this.manualControl = false;
    this.longitude = 0;
    this.latitude = 0;
    this.savedX;
    this.savedY;
    this.savedLongitude;
    this.savedLatitude;

    const panoramasArray = img;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth * 1.1, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add(`vr`);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.target = new THREE.Vector3(0, 0, 0);

    this.sphere = new THREE.SphereGeometry(150, 150, 150);
    this.sphere.applyMatrix(new THREE.Matrix4().makeScale(- 1, 1, 1));

    this.sphereMaterial = new THREE.MeshBasicMaterial();
    this.sphereMaterial.map = THREE.ImageUtils.loadTexture(panoramasArray);

    const sphereMesh = new THREE.Mesh(this.sphere, this.sphereMaterial);
    this.scene.add(sphereMesh);

    document.addEventListener(`mousedown`, this.onDocumentMouseDown, false);
    document.addEventListener(`mousemove`, this.onDocumentMouseMove, false);
    document.addEventListener(`mouseup`, this.onDocumentMouseUp, false);

    this.render();
  }

  render = () => {
    requestAnimationFrame(this.render);

    if (!this.manualControl) {
      this.longitude += 0.1;
    }

    // limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
    this.latitude = Math.max(- 85, Math.min(85, this.latitude));

    //camera movement
    this.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this.latitude)) * Math.cos(THREE.Math.degToRad(this.longitude));
    this.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this.latitude));
    this.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this.latitude)) * Math.sin(THREE.Math.degToRad(this.longitude));
    this.camera.lookAt(this.camera.target);

    this.renderer.render(this.scene, this.camera);
  };

  onDocumentMouseDown = event => {
    event.preventDefault();

    this.manualControl = true;

    this.savedX = event.clientX;
    this.savedY = event.clientY;

    this.savedLongitude = this.longitude;
    this.savedLatitude = this.latitude;
  };

  onDocumentMouseMove = event => {
    if (this.manualControl) {
      this.longitude = (this.savedX - event.clientX) * 0.1 + this.savedLongitude;
      this.latitude = (event.clientY - this.savedY) * 0.1 + this.savedLatitude;
    }
  };
  onDocumentMouseUp = () => {
    this.manualControl = false;
  };
}
