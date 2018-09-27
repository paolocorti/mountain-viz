import {
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
  Geometry,
  Face3,
  Color,
  AmbientLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PointsMaterial,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  Points,
  LineBasicMaterial,
  VertexColors,
  Group,
} from 'three';
import OrbitControls from 'orbit-controls-es6'
import './index.css'

const scene = new Scene();
const { innerWidth, innerHeight } = window;
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.05, 3000);
const renderer = new WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement)
controls.enabled = true;


const dataset = []
const triangles = 20
for (let i = 0; i < triangles; i++) {
  dataset.push([-50 + (Math.random() * 40 - 20), 0, i * 50])
  dataset.push([50 + (Math.random() * 40 - 20), 0, i * 50])
  dataset.push([0, Math.random() * 100, i * 50 + 25])
  // dataset.push([-50, 0, i * 50 + 50])
  // dataset.push([50, 0, i * 50  + 50])
}

let group
let particlesData = []
const maxParticleCount = triangles * 3
const particleCount = triangles * 3
const r = 400
const rHalf = r / 2;
const segments = maxParticleCount * maxParticleCount
const positions = new Float32Array(segments * 3)
const colors = new Float32Array(segments * 3)
const pMaterial = new PointsMaterial({
  color: 0xFFFFFF,
  size: 3,
  transparent: true,
  sizeAttenuation: false
})
const particles = new BufferGeometry()
const particlePositions = new Float32Array(maxParticleCount * 3)
const convexPositions = []
const normals = []
for (let i = 0; i < maxParticleCount; i++) {
  const x = dataset[i][0]
  const y = dataset[i][1]
  const z = dataset[i][2]
  //console.log(x,y,z);
  particlePositions[ i * 3     ] = x
  particlePositions[ i * 3 + 1 ] = y
  particlePositions[ i * 3 + 2 ] = z
  convexPositions.push(new Vector3(x,y,z))
  normals.push( 0, 0, 1 )
  // add it to the geometry
  particlesData.push({
    velocity: new Vector3(-1 + Math.random() * 2,-1 + Math.random() * 2,-1 + Math.random() * 2),
    numConnections: 0
  })
}

scene.add(new AmbientLight(0xdedfe0, 1))
//console.log(particlePositions);

group = new Group()
scene.add(group)

particles.setDrawRange(0, particleCount)
particles.addAttribute('position', new BufferAttribute(particlePositions, 3).setDynamic(true))
// create the particle system
//console.log(particles);
particles.center();
const pointCloud = new Points(particles, pMaterial)
group.add(pointCloud)

const geometry = new BufferGeometry()
geometry.addAttribute('position', new BufferAttribute(positions, 3).setDynamic(true))
geometry.addAttribute('color', new BufferAttribute(colors, 3).setDynamic(true))
geometry.computeBoundingSphere()
geometry.setDrawRange(0,0)
const material = new LineBasicMaterial({
  transparent: false
})
// const linesMesh = new LineSegments(geometry, material)
// linesMesh.visible = true
// group.add(linesMesh)

const width = Math.ceil(Math.random() * 4) * 50
const height = 50
const depth = 50

// console.log(ConvexBufferGeometry);
// const meshGeometry = new PolyhedronGeometry(geometry)
// const meshMaterial = new MeshBasicMaterial({color: 0xff00ff})
// const mesh = new Mesh(meshGeometry, meshMaterial)

var indicesOfFaces = [
    0,1,2, 0,1,3,
    2,1,4, 3,1,4,
    3,5,4,
];

const trianglesMesh = new Geometry();

for (let i = 0; i < (dataset.length); i++) {
  trianglesMesh.vertices.push(new Vector3(dataset[i][0], dataset[i][1], dataset[i][2]));
}

for (let i = 3; i < (dataset.length - 1); i+=3) {
  trianglesMesh.faces.push(new Face3(i-3,i-2,i-1));
  trianglesMesh.faces.push(new Face3(i-3,i-1,i));
  trianglesMesh.faces.push(new Face3(i-2,i-1,i+1));
  trianglesMesh.faces.push(new Face3(i-1,i,i+1));
}

for (let i = 0; i < trianglesMesh.faces.length; i++) {
  const vertexIndexA = trianglesMesh.faces[i].a
  const vertexIndexB = trianglesMesh.faces[i].b
  const vertexIndexC = trianglesMesh.faces[i].c
  const pointA = trianglesMesh.vertices[vertexIndexA]
  const pointB = trianglesMesh.vertices[vertexIndexB]
  const pointC = trianglesMesh.vertices[vertexIndexC]

  trianglesMesh.faces[i].vertexColors[0] = new Color(0xFF0000);
  trianglesMesh.faces[i].vertexColors[0].setRGB(pointA.y / 100, pointA.y / 100, pointA.y / 100);
  trianglesMesh.faces[i].vertexColors[1] = new Color(0x00FF00);
  trianglesMesh.faces[i].vertexColors[1].setRGB(pointB.y / 100, pointB.y / 100, pointB.y / 100);
  trianglesMesh.faces[i].vertexColors[2] = new Color(0x0000FF);
  trianglesMesh.faces[i].vertexColors[2].setRGB(pointC.y / 100, pointC.y / 100, pointC.y / 100);
}

console.log(trianglesMesh);
trianglesMesh.center();

const meshMaterial = new MeshBasicMaterial({
  // shading: FlatShading,
  vertexColors: VertexColors,
  side: DoubleSide,
  opacity: 1,
  transparent: true,
})
const mesh = new Mesh(trianglesMesh, meshMaterial )
scene.add(mesh)

renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 800;
camera.position.y = 100;

const render = () => {
  renderer.render(scene, camera)
}

// const animate = () => {
//   let vertexpos = 0;
//   let colorpos = 0;
//   let numConnected = 0;
//   for (let i = 0; i < particleCount; i++)
//     particlesData[i].numConnections = 0;
//     for (let i = 0; i < particleCount; i++) {
//       // get the particle
//       const particleData = particlesData[i];
//       // particlePositions[ i * 3     ] += particleData.velocity.x;
//       // particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
//       // particlePositions[ i * 3 + 2 ] += particleData.velocity.z;
//       if ( particlePositions[ i * 3 + 1 ] < -rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
//       particleData.velocity.y = -particleData.velocity.y;
//       if ( particlePositions[ i * 3 ] < -rHalf || particlePositions[ i * 3 ] > rHalf )
//       particleData.velocity.x = -particleData.velocity.x;
//       if ( particlePositions[ i * 3 + 2 ] < -rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
//       particleData.velocity.z = -particleData.velocity.z;
//       if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
//       continue;
//       // Check collision
//       for (let j = i + 1; j < particleCount; j++) {
//         const particleDataB = particlesData[j];
//         if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
//         continue;
//         const dx = particlePositions[ i * 3     ] - particlePositions[ j * 3     ];
//         const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
//         const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
//         const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
//         if (dist < effectController.minDistance) {
//           particleData.numConnections++
//           particleDataB.numConnections++
//           const alpha = 1.0 - dist / effectController.minDistance;
//           positions[ vertexpos++ ] = particlePositions[ i * 3     ];
//           positions[ vertexpos++ ] = particlePositions[ i * 3 + 1 ];
//           positions[ vertexpos++ ] = particlePositions[ i * 3 + 2 ];
//           positions[ vertexpos++ ] = particlePositions[ j * 3     ];
//           positions[ vertexpos++ ] = particlePositions[ j * 3 + 1 ];
//           positions[ vertexpos++ ] = particlePositions[ j * 3 + 2 ];
//           colors[ colorpos++ ] = alpha;
//           colors[ colorpos++ ] = alpha;
//           colors[ colorpos++ ] = alpha;
//           colors[ colorpos++ ] = alpha;
//           colors[ colorpos++ ] = alpha;
//           colors[ colorpos++ ] = alpha;
//           numConnected++;
//         }
//       }
//     }
//     linesMesh.geometry.setDrawRange(0, numConnected * 2)
//     linesMesh.geometry.attributes.position.needsUpdate = true
//     linesMesh.geometry.attributes.color.needsUpdate = true
//     pointCloud.geometry.attributes.position.needsUpdate = true
//     requestAnimationFrame(animate)
//     render()
// }

const animate = () => {
  requestAnimationFrame(animate)
  mesh.rotation.y += 0.005
  pointCloud.rotation.y += 0.005
  render()
}
animate()
