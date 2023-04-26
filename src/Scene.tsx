import React, { useEffect, useState, useMemo } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Line from "./components/Line";
import Point from "./components/Point";
import MultiLine from "./components/MultiLine";
import * as THREE from  "three";
import Triangle from "./components/Triangle";
import {initTrianglesPoints, QuickhullStep, TrianglePointsPair} from "./modules/Quickhull";
import { Html } from "@react-three/drei";
import { forwardRef } from "react";
import { useRef } from "react";
interface SceneProps {

}

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
//forwarded ref to access scene methods from parent
interface SceneRef {
    step(): void;
    startAnimation(): void,
    stopAnimation(): void,
    reset(): void
  }
  
const Scene = forwardRef<SceneRef>((props, ref) =>{


    
      React.useImperativeHandle(ref, () => ({
        step,
        startAnimation,
        stopAnimation,
        reset
      }));
    //switch value to trigger points regeneration
    const [pointsRegenerateTrigger, setpointsRegenerateTrigger] = useState(false);
    const randomPoints = useMemo(() => generateArraysInRange(40, -10, 10), [pointsRegenerateTrigger]);
    const [currentStack, setcurrentStack] = useState(new Array<TrianglePointsPair>())
    const [currentResultHull, setcurrentResultHull] = useState(new Array<THREE.Triangle>())
    //animation interval
    const [intervalId, setIntervalId] = React.useState<NodeJS.Timer | undefined>();

    //references on states so interval has access to correct state values
    const resultHullRef = useRef(currentResultHull);
    const stackRef = useRef(currentStack);
    useEffect(() => {
        resultHullRef.current = currentResultHull;
        stackRef.current = currentStack;
      }, [currentResultHull, currentStack]);


    //one step of algorithm
    const step = () => {
        if(stackRef.current.length === 0 && resultHullRef.current.length === 0)
        {
            let initTriangles = initTrianglesPoints(randomPoints)
            setcurrentStack([...initTriangles])
            setcurrentResultHull([])

        }
        else if(stackRef.current.length !== 0)
        {
            let [newStack, newResultHull] = QuickhullStep(stackRef.current)
            setcurrentStack([...newStack])
            setcurrentResultHull([...newResultHull])
        }
    }

    const startAnimation = () => {
        const intervalId= setInterval(() => {
            step()
            if(resultHullRef.current.length !== 0)
            {
                clearInterval(intervalId);
            }
        }, 1000);
        setIntervalId(intervalId)
    }

    const stopAnimation = () => {
        clearInterval(intervalId);
        setIntervalId(undefined);
    }

    const reset = () => {
        setcurrentStack([])
        setcurrentResultHull([])
        setpointsRegenerateTrigger(!pointsRegenerateTrigger)
        stopAnimation()
    }

    return (
        <>
            <OrbitControls />
            <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[20, 20, 20]} />
            {randomPoints.map(point => {
                return <Point color='red' position={point} />
            })}
            {currentStack.map((triangle, index) => <Triangle key={index} vertices={[triangle[0].a, triangle[0].b, triangle[0].c]} color={0x259443} outlineColor={0xff0000} opacity={0.8}/>)}
            {currentResultHull.map((triangle, index) => <Triangle key={index} vertices={[triangle.a, triangle.b, triangle.c]} color={0x016b28} outlineColor={0xffffff} opacity={1}/>)}
            {currentStack.length !== 0 && <Triangle vertices={[currentStack[0][0].a, currentStack[0][0].b, currentStack[0][0].c]} color={0xff9d1c} outlineColor={0xff0000} opacity={0.8}/>}
        </>
    )
})
export default Scene;


  