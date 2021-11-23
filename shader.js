// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
const Random = require("canvas-sketch-util/random");
const canvasSketch = require("canvas-sketch");
const glsl = require("glslify");
const settings = {
    duration:5,
    dimensions:[1080,1080],
    fps:60,
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

  // WebGL background color
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const baseGem  = new THREE.IcosahedronGeometry(1, 1);
  const circleGem = new THREE.CircleGeometry(1,32);
  const points = baseGem.vertices;
//   console.log(points);
  
  
//   const geometry = new THREE.TorusGeometry(1,0.5,32, 16);
  const vertexShader = /* glsl*/ `
  varying vec2 vUv;
  varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition= position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;
  const fragmentShader =glsl( /* glsl */`
  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: aastep = require('glsl-aastep');
  varying vec2 vUv;
  uniform vec3 color;
  uniform float time;
  varying vec3 vPosition;
  uniform vec3 points[POINT_COUNT];
  uniform mat4 modelMatrix;

    float sphereRim (vec3 spherePosition) {
        vec3 normal = normalize(spherePosition.xyz);
        vec3 worldNormal = normalize(mat3(modelMatrix) * normal.xyz);
        vec3 worldPosition = (modelMatrix * vec4(spherePosition, 1.0)).xyz;
        vec3 V = normalize(cameraPosition - worldPosition);
        float rim = 1.0 - max(dot(V, worldNormal), 0.0);
        return pow(smoothstep(0.0, 1.0, rim), 0.5);
    }

    void main() {
        float dist = 1000.0;
        for (int i = 0; i < POINT_COUNT; i++) {
          vec3 point = points[i];
          float curDist = distance(vPosition, point);
          dist = min(curDist, dist);
        }
        float mask = aastep(0.15,dist);
        mask = 1.0 - mask;
        
        vec3 fragColor = mix(color, vec3(1.0), mask);
        float rim = sphereRim(vPosition);
        fragColor += rim * 0.25;
        gl_FragColor = vec4(vec3( fragColor),1.0);
    }
  `);

  // Setup a material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines:{
        POINT_COUNT:points.length
    },
    extensions:{
        derivatives:true,
    },
    uniforms:{
    points:{value:points},
      time:{value:0},
      color:{value:new THREE.Color('tomato')}
    },
    // wireframe: true
  });
 
  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

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
      mesh.rotation.y = playhead*Math.PI*2;
      material.uniforms.time.value = time;
      // material.wireframe = true;
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
