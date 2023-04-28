import React from 'react';
import { Vector3, Triangle } from 'three';

const BruteForceConvexHull = (points: Vector3[]): Triangle[] => {
  const n = points.length;
  let hullTriangles: Triangle[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {

        // calculate the normal vector of the triangle
        let a = points[i];
        let b = points[j];
        let c = points[k];
        let q = new Vector3().crossVectors(
          new Vector3().subVectors(b, a),
          new Vector3().subVectors(c, a)
        );

        // check if all points are on the same side of the triangle
        let sign = 0;
        let allSameSide = true;
        for (let pIndex = 0; pIndex < n && allSameSide; pIndex++) {
          if (pIndex !== i && pIndex !== j && pIndex !== k) {
            let p = points[pIndex];
            let side = new Vector3().subVectors(p, a).dot(q);
            if (side <= 0 && sign <= 0) {
              sign = -1;
            } else if (side >= 0 && sign >= 0) {
              sign = 1;              
            }
            else{
              allSameSide = false;
              break;
            }
          }
        }

        if (allSameSide) {
          hullTriangles.push(new Triangle(a, b, c));
        }
      }
    }
  }

  return hullTriangles;
};

export default BruteForceConvexHull;
