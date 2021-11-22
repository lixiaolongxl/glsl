// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
const Random = require("canvas-sketch-util/random");
const canvasSketch = require("canvas-sketch");
const glsl = require("glslify");
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
  // console.log(points);
  points.forEach(points => {
    const mash = new THREE.Mesh(circleGem,
      new THREE.MeshBasicMaterial({
        color: "black",
        // wireframe:true,
        side: THREE.BackSide
      }))
      // .multiplyScalar(1.1) //放大倍数
      mash.position.copy(points);
      // mash.scale.setScalar(0.15);
      mash.scale.setScalar(Random.range(0.5,1)*0.25);

      mash.lookAt(new THREE.Vector3())
      scene.add(mash)
  })
  
//   const geometry = new THREE.TorusGeometry(1,0.5,32, 16);
  const vertexShader = /* glsl*/ `
  varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;
  const fragmentShader =glsl( /* glsl */`
  #pragma glslify: noise = require(glsl-noise/simplex/3d) 
  varying vec2 vUv;
  uniform vec3 color;
  uniform float time;
    void main() {
        vec2 center =  vec2(0.5,0.5);
        vec2 q = vUv;
        q.x *=2.0;
        vec2 pos = mod(q * 10.0, 1.0);
        float d = distance(pos,center);
        
        // float mask = step(0.25 + sin(time + vUv.x * 2.0) * 0.25,d);


        // float offset = noise(vec3(vUv.xy * 5.0,time));

        // vec2 noiseInput = q * 10.0;

        vec2 noiseInput = (q * 10.0);
        float offset = noise(vec3(noiseInput.xy ,time))*0.25;
        float mask = step(0.25 + offset ,d);
        mask = 1.0 - mask;
        vec3 fragColor = mix(color,vec3(1.0),mask);
        gl_FragColor = vec4(vec3( color),1.0);
    }
  `);

  // Setup a material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms:{
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
    render({ time }) {
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
