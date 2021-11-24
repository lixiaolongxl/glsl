// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
    
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.shadowMap.enable = true;

  // WebGL background color
    renderer.setClearColor("#fff", 1);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;


  // Setup a camera
  const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1000 );
//   const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(160, 40, 10);
//   camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);
  
  controls.minDistance = 20;
  controls.maxDistance = 500;
  controls.enablePan = false;
  // Setup your scene
  const scene = new THREE.Scene();

  //set your lights
  const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    scene.add( ambient );

    const spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 15, 40, 35 );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 400;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = window.innerWidth;
    spotLight.shadow.mapSize.height = window.innerHeight;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.focus = 2;
    scene.add( spotLight );
    const targetObject = new THREE.Object3D();
	scene.add(targetObject);

	spotLight.target = targetObject;

    lightHelper = new THREE.SpotLightHelper( spotLight );
				scene.add( lightHelper );

				shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
				scene.add( shadowCameraHelper );
                //

				let material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );

				let geometry = new THREE.PlaneGeometry( 2000, 2000 );

				let mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( 0, - 1, 0 );
				mesh.rotation.x = - Math.PI * 0.5;
				mesh.receiveShadow = true;
				scene.add( mesh );

				//

				material = new THREE.MeshPhongMaterial( { color: 0x4080ff, dithering: true } );

				geometry = new THREE.CylinderGeometry( 5, 5, 2, 32, 1, false );

				mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( 0, 5, 0 );
				mesh.castShadow = true;
				scene.add( mesh );    



    

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time,playhead }) {
      
      // material.wireframe = true;
      shadowCameraHelper.update();
      lightHelper.update();
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
