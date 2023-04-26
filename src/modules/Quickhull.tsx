import * as THREE from 'three'

interface QuickhullProps {
  points: Array<THREE.Vector3>
}
export type TrianglePointsPair = [THREE.Triangle, Array<THREE.Vector3>]


function trianglePointDistance(point: THREE.Vector3, triangle: THREE.Triangle) {
  let plane = new THREE.Plane();
  triangle.getPlane(plane);
  var distance = plane.distanceToPoint(point);
  return distance
}

function isPointInFrontOfTriangle(point: THREE.Vector3, triangle: THREE.Triangle): boolean {
  let distance = trianglePointDistance(point, triangle)
  const eps_error = 1e-10
  return distance > eps_error;
}


export function initTrianglesPoints(points: Array<THREE.Vector3>): Array<TrianglePointsPair> {
  // let extremePoints : Array<THREE.Vector3> = ExtremePoints(points)
  // let initialVertices: Array<THREE.Vector3> = getInitialTetrahedronVertices(extremePoints);

  let initialVertices = points.splice(0, 4);

  //init 4 triangles to form initial tetrahedron so its normal vectors point outwards
  let initialTriangles = tetrahedronFromVertices(initialVertices)
  //init triangles with points
  let trianglesPoints: Array<TrianglePointsPair> = initialTriangles.map((triangle) => [triangle, []]);

  //filter points which are not in initialVertices
  let pointsOut = points.filter((point) => !initialVertices.includes(point))
  //add points to triangles
  for (const point of pointsOut) {
    for (const trianglePoints of trianglesPoints) {
      //point in front of triangle and not any of points of all triangles
      if (isPointInFrontOfTriangle(point, trianglePoints[0])) {
        trianglePoints[1].push(point);
        break;
      }

    }
  }
  trianglesPoints.sort((a, b) => b[1].length - a[1].length)
  return trianglesPoints;
}

function tetrahedronFromVertices(vertices: Array<THREE.Vector3>, returnBasePlane: boolean = true) {
  let tetrahedron: Array<THREE.Triangle> = [
    new THREE.Triangle(vertices[0], vertices[1], vertices[2]),
    new THREE.Triangle(vertices[0], vertices[1], vertices[3]),
    new THREE.Triangle(vertices[1], vertices[2], vertices[3]),
    new THREE.Triangle(vertices[2], vertices[0], vertices[3])
  ];

  const centroid = new THREE.Vector3();
  centroid.add(vertices[0]);
  centroid.add(vertices[1]);
  centroid.add(vertices[2]);
  centroid.add(vertices[3]);
  centroid.multiplyScalar(1 / 4);



  for (let i = 0; i < tetrahedron.length; i++) {
    const triangle = tetrahedron[i];
    const normal = new THREE.Vector3();
    triangle.getNormal(normal);
    // Determine the direction of the normal vector using the right-hand rule
    const testVec = new THREE.Vector3().subVectors(triangle.a, centroid);
    const isFacingTowardsCentroid = normal.dot(testVec) >= 0;
    if (!isFacingTowardsCentroid) {
      // If the normal vector is pointing towards the centroid, flip its direction
      tetrahedron[i] = new THREE.Triangle(triangle.c, triangle.b, triangle.a);
    }
  }

  if (!returnBasePlane) {
    //remove base plane
    tetrahedron.shift()
  }
  return tetrahedron;
}


//returns updated stack of triangular points to process and processed planes with no more points in front of them
export function QuickhullStep(trianglePlanesStack: Array<TrianglePointsPair>): [Array<TrianglePointsPair>, Array<THREE.Triangle>] {


  // const index = trianglePlanesStack.findIndex((trianglePlane) => trianglePlane[1].length > 0);

  if (trianglePlanesStack.some(trianglePlane => trianglePlane[1].length > 0)) {
      let triangle = trianglePlanesStack.shift();
      if(triangle !== undefined){
  
      let currentTrianglePlane = triangle[0]
      let pointsInFront = triangle[1]
      //find point with max distance from triangle
      let maxDistance = 0;
      let pointWithMaxDistance: THREE.Vector3 = new THREE.Vector3()
      for (let point of pointsInFront) {
        let distance = trianglePointDistance(point, currentTrianglePlane)
        if (distance > maxDistance) {
          maxDistance = distance
          pointWithMaxDistance = point
        }
      }
  
      // //create tetrahedron from triangle and point with max distance, discard base plane
  
  
      //iteratively find all triangles adjacent to current triangle and its points merged to one array
      let adjacentPlanes: Array<THREE.Triangle> = [currentTrianglePlane];
      let adjacentPlanesPoints: Array<THREE.Vector3> = pointsInFront
      let foundAny: boolean = false
      do {
        foundAny = false
        for (let i = 0; i < trianglePlanesStack.length; i++) {
          if (isPointInFrontOfTriangle(pointWithMaxDistance, trianglePlanesStack[i][0]) && adjacentPlanes.some(plane => trianglesAreAdjacent(trianglePlanesStack[i][0], plane))) {
            adjacentPlanes.push(trianglePlanesStack[i][0])
            adjacentPlanesPoints.push(...trianglePlanesStack[i][1])
            trianglePlanesStack.splice(i, 1)
            i--
            foundAny = true
          }
        }
      } while (foundAny)
  
      //create tetrahedrons from all adjacent planes
      let newTrianglePlanes: Array<THREE.Triangle> = adjacentPlanes.map(plane => tetrahedronFromVertices([plane.a, plane.b, plane.c, pointWithMaxDistance], false)).flat()
      let planesToDelete: Array<THREE.Triangle> = []
  
  
  
  
      //if 2 tetrahedrons are equal, dont keep any of them
      for (let i = 0; i < newTrianglePlanes.length; i++) {
        let newPlane = newTrianglePlanes[i];
        if (newTrianglePlanes.findIndex((plane, index) => trianglesAreEqual(plane, newPlane) && index !== i) !== -1) {
          planesToDelete.push(newPlane);
        }
      }
  
  
      for (let i = 0; i < newTrianglePlanes.length; i++) {
        if (planesToDelete.some(plane => plane.equals(newTrianglePlanes[i]))) {
          newTrianglePlanes.splice(i, 1)
          i--
        }
      }
  
      //create triangles points pairs from tetrahedrons and ajdacentPlanesPoints
      let hullPlanesPointsPairs: Array<TrianglePointsPair> = TrianglesPointsPair(newTrianglePlanes, adjacentPlanesPoints)
  
  
      //push triangles with some points on stack and others to result hull
      for (let trianglePlane of hullPlanesPointsPairs) {
        trianglePlanesStack.push(trianglePlane)
      }
      trianglePlanesStack.sort((a, b) => b[1].length - a[1].length)
      return [trianglePlanesStack, []]
    }
  }
  
  else {
    console.log("konec")
    return [[], trianglePlanesStack.map(plane => plane[0])]
  }
  return [[], []]
}

function trianglesAreAdjacent(triangle1: THREE.Triangle, triangle2: THREE.Triangle): boolean {
  let commonVertices = 0;
  if (triangle1.a.equals(triangle2.a) || triangle1.a.equals(triangle2.b) || triangle1.a.equals(triangle2.c)) {
    commonVertices++;
  }
  if (triangle1.b.equals(triangle2.a) || triangle1.b.equals(triangle2.b) || triangle1.b.equals(triangle2.c)) {
    commonVertices++;
  }
  if (triangle1.c.equals(triangle2.a) || triangle1.c.equals(triangle2.b) || triangle1.c.equals(triangle2.c)) {
    commonVertices++;
  }
  return commonVertices === 2;
}


//equality of triangles regardless of vertex order
function trianglesAreEqual(triangle1: THREE.Triangle, triangle2: THREE.Triangle): boolean {
  return (triangle1.a.equals(triangle2.a) && triangle1.b.equals(triangle2.b) && triangle1.c.equals(triangle2.c)) ||
    (triangle1.a.equals(triangle2.a) && triangle1.b.equals(triangle2.c) && triangle1.c.equals(triangle2.b)) ||
    (triangle1.a.equals(triangle2.b) && triangle1.b.equals(triangle2.a) && triangle1.c.equals(triangle2.c)) ||
    (triangle1.a.equals(triangle2.b) && triangle1.b.equals(triangle2.c) && triangle1.c.equals(triangle2.a)) ||
    (triangle1.a.equals(triangle2.c) && triangle1.b.equals(triangle2.a) && triangle1.c.equals(triangle2.b)) ||
    (triangle1.a.equals(triangle2.c) && triangle1.b.equals(triangle2.b) && triangle1.c.equals(triangle2.a))

}


//returns array of triangles and points in front of them
function TrianglesPointsPair(triangles: Array<THREE.Triangle>, points: Array<THREE.Vector3>): Array<TrianglePointsPair> {
  let facesPoints: Array<TrianglePointsPair> = triangles.map((triangle) => [triangle, []]);
  for (const point of points) {
    for (const facePoints of facesPoints) {
      //point in front of triangle and not any of points of all triangles
      if (isPointInFrontOfTriangle(point, facePoints[0])) {
        facePoints[1].push(point);
        break;
      }
    }
  }
  return facesPoints;
}