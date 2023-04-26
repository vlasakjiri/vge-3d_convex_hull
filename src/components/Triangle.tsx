import * as THREE from "three";

interface TriangleProps {
  vertices: THREE.Vector3[];
  color: THREE.ColorRepresentation;
  opacity?: number;
  outlineColor?: THREE.ColorRepresentation
}

export default function Triangle({outlineColor = 0xffffff,  vertices, color, opacity = 1 }: TriangleProps) {
  const geometry = new THREE.BufferGeometry();

  const verticesArray = new Float32Array(vertices.length * 3);

  for (let i = 0; i < vertices.length; i++) {
    verticesArray[i * 3] = vertices[i].x;
    verticesArray[i * 3 + 1] = vertices[i].y;
    verticesArray[i * 3 + 2] = vertices[i].z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(verticesArray, 3));

  const indices = new Uint16Array([0, 1, 2]);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const planeMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    opacity: opacity,
    transparent: true
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: outlineColor ,
    wireframe: true,
  });

  const mesh = new THREE.Group();

  //render triangle normal
  const triangle = new THREE.Triangle(vertices[0], vertices[1], vertices[2]);
  const normal = triangle.getNormal(new THREE.Vector3());
  const center = triangle.getMidpoint(new THREE.Vector3());
  const normalLength = 2;
  const normalHelper = new THREE.ArrowHelper(
    normal,
    center,
    normalLength,
    0xff0000
  );
  mesh.add(normalHelper);


  const planeMesh = new THREE.Mesh(geometry, planeMaterial);
  mesh.add(planeMesh);

  const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
  mesh.add(wireframeMesh);

  return <primitive object={mesh} />;
}
