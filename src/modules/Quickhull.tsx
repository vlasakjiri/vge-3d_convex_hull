import * as THREE from 'three'

interface QuickhullProps {
  points: Array<THREE.Vector3>
}
export type TrianglePointsPair = [THREE.Triangle, Array<THREE.Vector3>]

//find points with x,y,z extreme values from points array
function ExtremePoints(points: Array<THREE.Vector3>): Array<THREE.Vector3>{
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let minPoint: THREE.Vector3 | undefined;
  let maxPoint: THREE.Vector3 | undefined;
  let minYPoint: THREE.Vector3 | undefined;
  let maxYPoint: THREE.Vector3 | undefined;
  let minZPoint: THREE.Vector3 | undefined;
  let maxZPoint: THREE.Vector3 | undefined;
  for (const point of points) {
    if (point.x < minX) {
      minX = point.x;
      minPoint = point;
    }
    if (point.x > maxX) {
      maxX = point.x;
      maxPoint = point;
    }
    if (point.y < minY) {
      minY = point.y;
      minYPoint = point;
    }
    if (point.y > maxY) {
      maxY = point.y;
      maxYPoint = point;
    }
    if (point.z < minZ) {
      minZ = point.z;
      minZPoint = point;
    }
    if (point.z > maxZ) {
      maxZ = point.z;
      maxZPoint = point;
    }
  }
  if (!minPoint || !maxPoint || !minYPoint || !maxYPoint || !minZPoint || !maxZPoint) {
    throw new Error("No extreme points found");
  }
  

  return [minPoint, maxPoint, minYPoint, maxYPoint, minZPoint, maxZPoint];
}

function trianglePointDistance(point: THREE.Vector3, triangle: THREE.Triangle)
{
  let plane = new THREE.Plane();
  triangle.getPlane(plane);
  var distance = plane.distanceToPoint(point);
  return distance
}

function isPointInFrontOfTriangle(point: THREE.Vector3, triangle: THREE.Triangle ): boolean {
  let distance = trianglePointDistance(point, triangle)
  const eps_error = 1e-10
  return  distance > eps_error ;
}
function getInitialTetrahedronVertices(extremePoints: Array<THREE.Vector3>): Array<THREE.Vector3>{
  //find 2 most distant points from extreme points and create line from them
  let maxDistance = 0;
  let baseLine : THREE.Line3 = new THREE.Line3()
  for(let point of extremePoints){
    for(let point2 of extremePoints){
      let distance = point.distanceTo(point2)
      if(distance > maxDistance){
        maxDistance = distance
        baseLine = new THREE.Line3(point, point2)
      } 
    }
  }
  //find point most distant from base line
  let maxDistance2 = 0;
  let point3 : THREE.Vector3 = new THREE.Vector3()
  for(let point of extremePoints){
    let target = new THREE.Vector3()
    baseLine.closestPointToPoint(point,false, target)
    let distance = target.distanceTo(point);
    
    if(distance > maxDistance2){
      maxDistance2 = distance
      point3 = point
    }
  }
  let baseTriangle : THREE.Triangle = new THREE.Triangle()
  //find point most distant from base triangle
  let maxDistance3 = 0;
  let point4 : THREE.Vector3 = new THREE.Vector3()
  for(let point of extremePoints){
    let distance = trianglePointDistance(point, baseTriangle)    
    if(distance > maxDistance3){
      maxDistance3 = distance
      point4 = point
    }
  }


  return [baseLine.start, baseLine.end, point3, point4]
}

export function initTrianglesPoints( points: Array<THREE.Vector3>): Array<TrianglePointsPair> {
  // let extremePoints : Array<THREE.Vector3> = ExtremePoints(points)
  // let initialVertices: Array<THREE.Vector3> = getInitialTetrahedronVertices(extremePoints);

  let initialVertices = points.splice(0,4);

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
  return trianglesPoints;  
}

function tetrahedronFromVertices(vertices: Array<THREE.Vector3>, returnBasePlane: boolean = true)
{
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

  if(!returnBasePlane)
  {
    //remove base plane
    tetrahedron.shift()
  }
  return tetrahedron;
}


//returns updated stack of triangular points to process and processed planes with no more points in front of them
export function QuickhullStep(trianglePlanesStack: Array<TrianglePointsPair>, currentHull: Array<THREE.Triangle>) : [Array<TrianglePointsPair>, Array<THREE.Triangle>]
{
  if(trianglePlanesStack.length !== 0)
  {
    let triangle = trianglePlanesStack.shift()
    if(triangle != undefined)
    {
      console.log(triangle)
      if(triangle[1].length === 0)
      {
        //no points in front of triangle
        currentHull.push(triangle[0])
        return [trianglePlanesStack, currentHull]
      }
      let currentTrianglePlane = triangle[0]
      let pointsInFront = triangle[1]
      //find point with max distance from triangle
      let maxDistance = 0;
      let pointWithMaxDistance : THREE.Vector3 = new THREE.Vector3()
      for(let point of pointsInFront){
        let distance = trianglePointDistance(point, currentTrianglePlane)
        if(distance > maxDistance){
          maxDistance = distance
          pointWithMaxDistance = point
        }
      }

      let newTetrahedron = tetrahedronFromVertices([currentTrianglePlane.a, currentTrianglePlane.b, currentTrianglePlane.c, pointWithMaxDistance], false)

      //push tetrahedron and its points to trianglesPointsPairs
      
      let trianglesPointsPairs: Array<TrianglePointsPair> = []
      for(let i = 0; i < newTetrahedron.length; i++)
      {
        trianglesPointsPairs.push([newTetrahedron[i], []])
      }

      for(let  point of pointsInFront)
      {
        for(let i = 0; i< trianglesPointsPairs.length; i++)
        {
          let triangle = trianglesPointsPairs[i][0]
          if(isPointInFrontOfTriangle(point, triangle))
          {
            trianglesPointsPairs[i][1].push(point)
            break
          }
        }
      }

      for(let trianglePlane of trianglesPointsPairs)
      {
        if(trianglePlane[1].length !== 0)
        {
          trianglePlanesStack.push(trianglePlane)
        }
        else
        {
          currentHull.push(trianglePlane[0])
        }
      }
      return [trianglePlanesStack, currentHull]
    }
  }
  else
  {
    return [[], currentHull]
  }
  return [[], currentHull]
}