import React, { useEffect, useState, useMemo } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Line from "./components/Line";
import Point from "./components/Point";
import MultiLine from "./components/MultiLine";
import * as THREE from  "three";
import Triangle from "./components/Triangle";
import {initTrianglesPoints, QuickhullStep, TrianglePointsPair} from "./modules/Quickhull";
import { Html } from "@react-three/drei";

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
    // const randomPoints = useMemo(() => [
    //     new THREE.Vector3(-15,0,0), 
    //     new THREE.Vector3(6,0,0), 
    //     new THREE.Vector3(3,8,0), 
    //     new THREE.Vector3(4,-5,4),
    //     new THREE.Vector3(0,0,-3), 
    //     new THREE.Vector3(-1,3,8)], []);

    const [currentStack, setcurrentStack] = useState(new Array<TrianglePointsPair>())
    const [currentResultHull, setcurrentResultHull] = useState(new Array<THREE.Triangle>())

    function step() {
        if(currentStack.length === 0 && currentResultHull.length === 0)
        {
            let initTriangles = initTrianglesPoints(randomPoints)
            setcurrentStack([...initTriangles])
            setcurrentResultHull([])

        }
        else if(currentStack.length !== 0)
        {
            let [newStack, newResultHull] = QuickhullStep(currentStack)
            setcurrentStack([...newStack])
            setcurrentResultHull([...newResultHull])
        }
    }
    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         console.log("haloo")
    //         console.log("stack", currentStack)
    //         console.log("hull", currentResultHull)

    //         if(currentStack.length === 0 && currentResultHull.length === 0)
    //         {
    //             let initTriangles = initTrianglesPoints(randomPoints)
    //             setcurrentStack([...initTriangles])
    //             setcurrentResultHull([])

    //         }
    //         else if(currentStack.length !== 0)
    //         {
    //             let [newStack, newResultHull] = QuickhullStep(currentStack, currentResultHull)
    //             setcurrentStack([...newStack])
    //             setcurrentResultHull([...newResultHull])
    //         }
    //         else
    //         {
    //             clearInterval(intervalId);
    //         }
            
    //         // setcurrentHull([...QuickhullStep(currentHull)]);
    //     }, 1000);
    
    //     return () => {
    //       clearInterval(intervalId);
    //     };
    //   }, [currentResultHull, currentStack]);
    return (
        <>
            <OrbitControls />
            <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[20, 20, 20]} />
         <Html position={[5,5,0]}>
            <button style={{position: 'absolute', marginTop:0}} onClick={step} >Animation step!</button>
            </Html>
            {randomPoints.map(point => {
                return <Point color='red' position={point} />
            })}
            {currentStack.map((triangle, index) => <Triangle key={index} vertices={[triangle[0].a, triangle[0].b, triangle[0].c]} color={0x259443} outlineColor={0xff0000} opacity={0.8}/>)}
            {currentResultHull.map((triangle, index) => <Triangle key={index} vertices={[triangle.a, triangle.b, triangle.c]} color={0xff0000} outlineColor={0xffffff} opacity={0.8}/>)}
            {currentStack.length !== 0 && <Triangle vertices={[currentStack[0][0].a, currentStack[0][0].b, currentStack[0][0].c]} color={0xff9d1c} outlineColor={0xff0000} opacity={0.8}/>}
            {/* <Triangle vertices={[currentHull[0][0].a, currentHull[0][0].b, currentHull[0][0].c]}  color={0xff0000} outlineColor={0x00ff00} opacity={0.8} /> */}
        </>
    )
}



export default Scene;


  