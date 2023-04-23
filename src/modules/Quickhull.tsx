import * as THREE from 'three'

interface QuickhullProps {
  points: Array<THREE.Vector3>
}


export default function Quickhull(points  :Array<THREE.Vector3>) : Array<Array<THREE.Triangle>>
{
  let abc = points.slice(0,3);
  let triangleABC: THREE.Triangle = new THREE.Triangle(...abc);
  let triangleACB: THREE.Triangle = new THREE.Triangle(abc[0], abc[2], abc[1]);
  
  let pointsABC : Array<THREE.Vector3> = [];
  let pointsACB : Array<THREE.Vector3> = [];
  
  for(let point of points)
  {
    let distance = trianglePointDistance(point, triangleABC)
    if(distance == 0) continue 
    if(distance > 0)
    {
      pointsABC.push(point);
    }
    else
    {
      pointsACB.push(point)
    }
  }
  
  let hullABC : Array<THREE.Triangle> = quickhullFindHull(triangleABC, pointsABC);
  let hullACB : Array<THREE.Triangle> = quickhullFindHull(triangleACB, pointsACB);
  // let convexHull : Array<THREE.Triangle> = hullABC.concat(hullACB);
  return [hullABC, hullACB]


}


function quickhullFindHull(triangle: THREE.Triangle, pointsInFront: Array<THREE.Vector3>): Array<THREE.Triangle>
{
  if(pointsInFront.length === 0)
  {
    return [triangle];
  }
  const mostDistant = pointsInFront.reduce((acc, currValue) => {
    const accResult = trianglePointDistance(acc, triangle);
    const currResult = trianglePointDistance(currValue, triangle);
    return accResult > currResult ? acc : currValue;
  });
  
  //All triangles have normal into the tetrahedron
  let triangle1 :THREE.Triangle = new THREE.Triangle(triangle.a, triangle.b, mostDistant);
  let triangle2 :THREE.Triangle = new THREE.Triangle(triangle.b, triangle.c, mostDistant);
  let triangle3 :THREE.Triangle = new THREE.Triangle(triangle.c, triangle.a, mostDistant);


  let pointsTriangle1 = pointsInFront.filter(point => isPointInFrontOfTriangle(point, triangle1)) 
  let pointsTriangle2 = pointsInFront.filter(point => isPointInFrontOfTriangle(point, triangle2)) 
  let pointsTriangle3 = pointsInFront.filter(point => isPointInFrontOfTriangle(point, triangle3)) 


  return [...quickhullFindHull(triangle1, pointsTriangle1), ...quickhullFindHull(triangle2, pointsTriangle2), ...quickhullFindHull(triangle3, pointsTriangle3) ];
}




function trianglePointDistance(point: THREE.Vector3, triangle: THREE.Triangle)
{
  //vector from point to some point on plane/triangle
  const planeToPointVec = new THREE.Vector3().subVectors(point, triangle.a);
  let normal: THREE.Vector3 = new THREE.Vector3();
  triangle.getNormal(normal);
  return planeToPointVec.dot(normal);

}

function isPointInFrontOfTriangle(point: THREE.Vector3, triangle: THREE.Triangle ): boolean {
  let distance = trianglePointDistance(point, triangle)
  const eps_error = 1e-10
  return  distance > eps_error ;
}





