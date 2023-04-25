import * as THREE from 'three'

interface QuickhullProps {
  points: Array<THREE.Vector3>
}

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

export function getInitialTetrahedronFromExtremePoints(points: Array<THREE.Vector3>): Array<THREE.Triangle>{
  let extremePoints : Array<THREE.Vector3> = ExtremePoints(points)
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
  for(let point of points){
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
  for(let point of points){
    let distance = trianglePointDistance(point, baseTriangle)    
    if(distance > maxDistance3){
      maxDistance3 = distance
      point4 = point
    }
  }

  //create tetrahedron as vector of triangles
  let tetrahedron : Array<THREE.Triangle> = []
  tetrahedron.push(new THREE.Triangle(baseLine.start, baseLine.end, point3))
  tetrahedron.push(new THREE.Triangle(baseLine.start, baseLine.end, point4))
  tetrahedron.push(new THREE.Triangle(baseLine.start, point3, point4))
  tetrahedron.push(new THREE.Triangle(baseLine.end, point3, point4))
  return tetrahedron
}






function trianglePointDistance(point: THREE.Vector3, triangle: THREE.Triangle)
{
  //vector from point to some point on plane/triangle
  let closestPoint: THREE.Vector3 = new THREE.Vector3();
  triangle.closestPointToPoint(point, closestPoint);
  return closestPoint.distanceTo(point);
}



function isPointInFrontOfTriangle(point: THREE.Vector3, triangle: THREE.Triangle): boolean {
  const v1 = triangle.a;
  const v2 = triangle.b;
  const v3 = triangle.c;

  // Calculate the dot product of the triangle's normal vector and the vector from one of its vertices to the point
  const normal = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(v2, v1), new THREE.Vector3().subVectors(v3, v1)).normalize();
  const vectorToPt = new THREE.Vector3().subVectors(point, v1);
  const dotProduct = normal.dot(vectorToPt);

  return dotProduct > 0;
}



export function QuickhullStep(points  :Array<THREE.Vector3>, currentHull: Array<THREE.Triangle>) : Array<THREE.Triangle>
{
    let first = currentHull.shift()
    if(first != undefined)
    {
      let currentTrianglePlane = first
      let pointsInFront = points.filter(point => isPointInFrontOfTriangle(point, currentTrianglePlane))
      
      let tetrahedron = tetrahedronFromFurthest(currentTrianglePlane, pointsInFront)
      
      if(tetrahedron.length === 1)
      {
        return []
      }
      else
      {
        currentHull.push(...tetrahedron)
        return currentHull
      }
    }
    return []
}



function tetrahedronFromFurthest(triangle: THREE.Triangle, points: Array<THREE.Vector3>) : Array<THREE.Triangle>
{
  if(points.length === 0)
  {
    return []
  }
  const mostDistant = points.reduce((acc, currValue) => {
    const accResult = trianglePointDistance(acc, triangle);
    const currResult = trianglePointDistance(currValue, triangle);
    return accResult > currResult ? acc : currValue;
  });
  

  const plane1 = new THREE.Triangle(triangle.a, mostDistant, triangle.c);
  const plane2 = new THREE.Triangle(triangle.c, mostDistant, triangle.b);
  const plane3 = new THREE.Triangle(triangle.b, mostDistant, triangle.a);

  return [plane1, plane2, plane3]
}



