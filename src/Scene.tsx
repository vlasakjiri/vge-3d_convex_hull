import React, { useEffect, useState, useMemo } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Line from "./components/Line";
import Point from "./components/Point";
import MultiLine from "./components/MultiLine";
import * as THREE from  "three";
import Triangle from "./components/Triangle";
import {getInitialTetrahedronFromExtremePoints, QuickhullStep} from "./modules/Quickhull";

interface SceneProps {

}

const pointsArray: Array<Array<number>> = [
    [0, 0, 0],
    [-1, 5, 0],
    [0, 0, 2],
    [3, 0, 0],
    [0, 0, 0]
]

function randomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateArraysInRange(N: number, min: number, max: number): Array<THREE.Vector3> {
    const arrays = [];
    for (let i = 0; i < N; i++) {
        let vec = new THREE.Vector3(
            randomRange(min, max),
            randomRange(min, max),
            randomRange(min, max)
        );
        arrays.push(vec);
    }
    return arrays;
}


const Scene = ({ }: SceneProps) => {
    const randomPoints = useMemo(() => generateArraysInRange(20, -7, 7), []);
    const [currentHull, setcurrentHull] = useState(getInitialTetrahedronFromExtremePoints(randomPoints))
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log(currentHull)
            setcurrentHull([...QuickhullStep(randomPoints, currentHull)]);
        }, 1000);
    
        return () => {
          clearInterval(intervalId);
        };
      }, []);
    return (
        <>
            <OrbitControls />
            <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[20, 20, 20]} />
            {randomPoints.map(point => {
                return <Point color='red' position={point} />
            })}
            {currentHull.map((triangle, index) => <Triangle key={index} vertices={[triangle.a, triangle.b, triangle.c]} color={0x259443} outlineColor={0xff0000} opacity={0.8}/>)}

        </>
    )
}
export default Scene;


  