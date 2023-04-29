import React, { useEffect, useState, useMemo, forwardRef, useRef, Ref } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Point from "../components/Point";
import * as THREE from "three";
import Triangle from "../components/Triangle";
import { initTrianglesPoints, QuickhullStep, TrianglePointsPair, mostDistantPoint } from "../modules/Quickhull";
import { AlgorithmSceneRef } from "../App";
import { generatePointsInRange } from "../modules/Utils";
type QuickhullSceneProps = {
    animationState: boolean,
    setanimationState: React.Dispatch<React.SetStateAction<boolean>>,
    animationStepSpeed?: number,
    pointsCount?: number,
    opacity?: number,
    // other props
};


//forwarded ref to access scene methods from parent


const QuickhullScene = forwardRef<AlgorithmSceneRef, QuickhullSceneProps>((
    {
        animationState,
        setanimationState,
        animationStepSpeed = 500,
        pointsCount = 10,
        opacity = 0.5
    }: QuickhullSceneProps,
    ref: Ref<AlgorithmSceneRef>) => {
    //handle function calls from parent
    React.useImperativeHandle(ref, () => ({
        step,
        startAnimation,
        stopAnimation,
        reset,
        stepBack
    }));

    //switch value to trigger points regeneration
    const [pointsRegenerateTrigger, setpointsRegenerateTrigger] = useState(false);
    const randomPoints = useMemo(() => generatePointsInRange(pointsCount, -10, 10), [pointsRegenerateTrigger, pointsCount]);
    const [currentStack, setcurrentStack] = useState(new Array<Array<TrianglePointsPair>>())
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
        if (stackRef.current.length === 0 && resultHullRef.current.length === 0) {
            let initTriangles = initTrianglesPoints(randomPoints)
            setcurrentStack([[...initTriangles]])
            setcurrentResultHull([])

        }
        else if (resultHullRef.current.length === 0) {
            let [newStack, newResultHull] = QuickhullStep([...stackRef.current[stackRef.current.length - 1]])
            if (newResultHull.length === 0) {
                setcurrentStack([...stackRef.current, newStack])

            }
            setcurrentResultHull(newResultHull)
        }
    }
    const stepBack = () => {
        if (resultHullRef.current.length !== 0) {
            setcurrentResultHull([])
        }
        else {
            let currentStack = stackRef.current;
            currentStack.pop();
            setcurrentStack([...currentStack])
        }
    }

    const startAnimation = () => {
        setanimationState(true)
        const intervalId = setInterval(() => {
            step()
            if (resultHullRef.current.length !== 0) {
                clearInterval(intervalId);
                setanimationState(false)
            }
        }, animationStepSpeed);
        setIntervalId(intervalId)
    }

    const stopAnimation = () => {
        setanimationState(false)
        clearInterval(intervalId);
        setIntervalId(undefined);
    }

    const reset = () => {
        setcurrentStack([])
        setcurrentResultHull([])
        setpointsRegenerateTrigger(!pointsRegenerateTrigger)
        stopAnimation()
        setanimationState(false)
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

            {currentStack.length !== 0 && currentStack[currentStack.length - 1].map((triangle, index) =>
                <Triangle
                    key={index}
                    vertices={[
                        triangle[0].a,
                        triangle[0].b,
                        triangle[0].c
                    ]}
                    color={0x016b28}
                    outlineColor={0xff0000}
                    opacity={opacity}
                />
            )}

            {currentResultHull.map((triangle, index) =>
                <Triangle
                    key={index}
                    vertices={[
                        triangle.a,
                        triangle.b,
                        triangle.c
                    ]}
                    color={0x016b28}
                    outlineColor={0xffffff}
                    opacity={opacity} />
            )}

            {currentStack.length !== 0 &&
                currentResultHull.length === 0 &&
                <Triangle
                    vertices={[
                        currentStack[currentStack.length - 1][0][0].a,
                        currentStack[currentStack.length - 1][0][0].b,
                        currentStack[currentStack.length - 1][0][0].c
                    ]}
                    color={0xff9d1c}
                    outlineColor={0xff0000}
                    opacity={opacity} />
            }

            {currentStack.length !== 0 &&
                currentResultHull.length === 0 &&
                <Point color={0xff9d1c} position={mostDistantPoint(currentStack[currentStack.length - 1][0][0], currentStack[currentStack.length - 1][0][1])} />

            }



        </>
    )
})
export default QuickhullScene;


