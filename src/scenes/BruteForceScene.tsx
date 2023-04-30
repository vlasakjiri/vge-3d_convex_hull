import React, { useEffect, useState, useMemo, forwardRef, useRef, Ref } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Point from "../components/Point";
import * as THREE from "three";
import Triangle from "../components/Triangle";
import BruteForceConvexHull from "../modules/BruteForce";
import { AlgorithmSceneRef } from "../App";
import { generatePointsInRange } from "../modules/Utils";
type SceneProps = {
    animationState: boolean,
    setanimationState: React.Dispatch<React.SetStateAction<boolean>>,
    animationStepSpeed?: number,
    pointsCount?: number,
    opacity?: number,
};

const BruteForceScene = forwardRef<AlgorithmSceneRef, SceneProps>((
    {
        animationState,
        setanimationState,
        animationStepSpeed = 500,
        pointsCount = 10,
        opacity = 0.5
    }: SceneProps,
    ref: Ref<AlgorithmSceneRef>) =>
{
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
    const randomPoints = useMemo(() => generatePointsInRange(pointsCount, -10, 10), [pointsCount]);
    //animation interval
    const [intervalId, setIntervalId] = React.useState<NodeJS.Timer | undefined>();

    const [i, setI] = useState(0);
    const [j, setJ] = useState(1);
    const [k, setK] = useState(2);
    const [prevState, setPrevState] = useState([{
        i: 0,
        j: 1,
        k: 2,
        hull: new Array<THREE.Triangle>(),
        triangle: new THREE.Triangle()
    }]);
    const [triangle, setTriangle] = useState(new THREE.Triangle());
    const [hull, setHull] = useState(new Array<THREE.Triangle>());

    //references on states so interval has access to correct state values
    const iRef = useRef(i);
    const jRef = useRef(j);
    const kRef = useRef(k);
    const hullRef = useRef(hull);
    const triangleRef = useRef(triangle);
    const prevStateRef = useRef(prevState);
    useEffect(() =>
    {
        iRef.current = i;
        jRef.current = j;
        kRef.current = k;
        hullRef.current = hull;
        triangleRef.current = triangle;
        prevStateRef.current = prevState;
    }, [i, j, k, hull, triangle, prevState]);


    //one step of algorithm
    const step = () =>
    {
        let a = randomPoints[iRef.current];
        let b = randomPoints[jRef.current];
        let c = randomPoints[kRef.current];
        let triangle = new THREE.Triangle(a, b, c);
        setTriangle(triangle);

        const n = randomPoints.length;
        let triangleContained = BruteForceConvexHull(randomPoints,
            iRef.current, jRef.current, kRef.current);
        if (triangleContained)
        {
            setHull([...hullRef.current, triangle]);
        }

        if (kRef.current + 1 < n)
        {
            setK(kRef.current + 1);
        }
        else if (jRef.current + 2 < n)
        {
            setJ(jRef.current + 1);
            setK(jRef.current + 2);
        }
        else if (iRef.current + 3 < n)
        {
            setI(iRef.current + 1);
            setJ(iRef.current + 2);
            setK(iRef.current + 3);
        }
        setPrevState([
            ...prevStateRef.current,
            {
                i: iRef.current,
                j: jRef.current,
                k: kRef.current,
                hull: [...hullRef.current],
                triangle: triangleRef.current
            }
        ]);
    };

    const stepBack = () =>
    {
        if (prevStateRef.current.length > 0)
        {
            const state = prevStateRef.current.pop();
            if (state)
            {
                setI(state.i);
                setJ(state.j);
                setK(state.k);
                setHull(state.hull);
                setTriangle(state.triangle);
            }
            setPrevState([...prevStateRef.current]);
        }
    };

    const startAnimation = () =>
    {
        setanimationState(true);
        const intervalId = setInterval(() =>
        {
            step();
            if (iRef.current === randomPoints.length - 3
                && jRef.current === randomPoints.length - 2
                && kRef.current === randomPoints.length - 1)
            {
                clearInterval(intervalId);
                setanimationState(false);
            }
        }, animationStepSpeed);
        setIntervalId(intervalId);
    };

    const stopAnimation = () =>
    {
        setanimationState(false);
        clearInterval(intervalId);
        setIntervalId(undefined);
    };

    const reset = () =>
    {
        setHull([]);
        setTriangle(new THREE.Triangle());
        setI(0);
        setJ(1);
        setK(2);
        setPrevState([{
            i: 0,
            j: 1,
            k: 2,
            hull: new Array<THREE.Triangle>(),
            triangle: new THREE.Triangle()
        }]);
        setpointsRegenerateTrigger(!pointsRegenerateTrigger);
        stopAnimation();
        setanimationState(false);
    };

    return (
        <>
            <OrbitControls />
            <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[20, 20, 20]} />
            {randomPoints.map(point =>
            {
                return <Point color='red' position={point} />;
            })}
            {hull.map((triangle, index) => <Triangle key={index}
                vertices={[triangle.a, triangle.b, triangle.c]}
                color={0x016b28}
                side={THREE.DoubleSide}
                outlineColor={0xffffff}
                opacity={opacity} />)
            }
            {<Triangle vertices={[triangle.a, triangle.b, triangle.c]}
                color={0xff9d1c}
                outlineColor={0xff0000}
                opacity={opacity} />
            }
        </>
    );
});
export default BruteForceScene;
