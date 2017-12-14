export default class vr {
  constructor(img) {
    this.manualControl = false;
    this.longitude = 0;
    this.latitude = 0;
    this.savedX;
    this.savedY;
    this.savedLongitude;
    this.savedLatitude;

    // panoramas background
    const panoramasArray = img;

    // setting up the renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth / 1.5, window.innerHeight / 1.5);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add(`vr`);

    // creating a new scene
    this.scene = new THREE.Scene();

    // adding a camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.target = new THREE.Vector3(0, 0, 0);

    // creation of a big sphere geometry
    this.sphere = new THREE.SphereGeometry(100, 100, 40);
    this.sphere.applyMatrix(new THREE.Matrix4().makeScale(- 1, 1, 1));

    // creation of the sphere material
    this.sphereMaterial = new THREE.MeshBasicMaterial();
    this.sphereMaterial.map = THREE.ImageUtils.loadTexture(panoramasArray);

    // geometry + material = mesh (actual object)
    const sphereMesh = new THREE.Mesh(this.sphere, this.sphereMaterial);
    this.scene.add(sphereMesh);

    // listeners
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

    // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
    this.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this.latitude)) * Math.cos(THREE.Math.degToRad(this.longitude));
    this.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this.latitude));
    this.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this.latitude)) * Math.sin(THREE.Math.degToRad(this.longitude));
    this.camera.lookAt(this.camera.target);

    // calling again render function
    this.renderer.render(this.scene, this.camera);

  };

  // when the mouse is pressed, we switch to manual control and save current coordinates
  onDocumentMouseDown = event => {

    event.preventDefault();

    this.manualControl = true;

    this.savedX = event.clientX;
    this.savedY = event.clientY;

    this.savedLongitude = this.longitude;
    this.savedLatitude = this.latitude;

  };

  // when the mouse moves, if in manual contro we adjust coordinates
  onDocumentMouseMove = event => {

    if (this.manualControl) {
      this.longitude = (this.savedX - event.clientX) * 0.1 + this.savedLongitude;
      this.latitude = (event.clientY - this.savedY) * 0.1 + this.savedLatitude;
    }

  };

  // when the mouse is released, we turn manual control off
  onDocumentMouseUp = () => {
    this.manualControl = false;

  };
}
