
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import React, { useEffect, useState, useMemo, forwardRef, useRef, Ref } from "react";
import { AlgorithmSceneRef } from "../App";
import Point from "../components/Point";
import Triangle from "../components/Triangle";
import { IterativeConvexHull, Point3D, Face, Edge } from "../modules/Iterative";

import * as THREE from "three";
import Line from "../components/Line";




type AlgoSceneProps = {
  animationState: boolean;
  setanimationState: React.Dispatch<React.SetStateAction<boolean>>;
  // other props
};


function randomRange(min: number, max: number)
{
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateArraysInRange(N: number, min: number, max: number): Array<THREE.Vector3>
{
  const arrays = [];
  for (let i = 0; i < N; i++)
  {
    let vec = new THREE.Vector3(
      randomRange(min, max),
      randomRange(min, max),
      randomRange(min, max)
    );
    arrays.push(vec);
  }
  return arrays;
}

type State = {
  currentResultHull: Array<Face>;
  pointIdx: number;
  shouldClean: boolean;
  edgesToRemove: Array<Edge>;
};

const AlgoScene = forwardRef<AlgorithmSceneRef, AlgoSceneProps>((props, ref: Ref<AlgorithmSceneRef>) =>
{

  const [intervalId, setIntervalId] = React.useState<NodeJS.Timer | undefined>();
  const [pointsRegenerateTrigger, setpointsRegenerateTrigger] = useState(false);
  const randomPoints = useMemo(() => generateArraysInRange(40, -10, 10).map(point => Point3D.fromVector3(point)), [pointsRegenerateTrigger]);

  const [currentStack, setcurrentStack] = useState(new Array<State>());
  const [stackIdx, setstackIdx] = useState(0);


  const [currentResultHull, setcurrentResultHull] = useState(new Array<Face>());
  const [pointIdx, setPointIdx] = useState(0);
  const [shouldClean, setshouldClean] = useState(false);
  const [edgesToRemove, setedgesToRemove] = useState(new Array<Edge>());


  // const hullObj = useMemo(() => , []);
  const hullObjRef = useRef(new IterativeConvexHull());
  const pointIdxRef = useRef(pointIdx);
  const shouldCleanRef = useRef(shouldClean);
  const stackIdxRef = useRef(stackIdx);
  const currentStackRef = useRef(currentStack);
  const edgesToRemoveRef = useRef(edgesToRemove);

  useEffect(() =>
  {
    pointIdxRef.current = pointIdx;
    shouldCleanRef.current = shouldClean;
    stackIdxRef.current = stackIdx;
    currentStackRef.current = currentStack;
    edgesToRemoveRef.current = edgesToRemove;
  }, [pointIdx, shouldClean, stackIdx, currentStack, edgesToRemove]);




  // let hull = new IterativeConvexHull().ConstructHull(points) as Face[];

  //handle function calls from parent
  React.useImperativeHandle(ref, () => ({
    step,
    startAnimation,
    stopAnimation,
    reset,
    stepBack
  }));



  const step = () =>
  {
    if (stackIdxRef.current < currentStackRef.current.length - 1)
    {
      let stack = currentStackRef.current;
      let state = stack[stackIdxRef.current + 1];
      setcurrentResultHull(state.currentResultHull);
      setPointIdx(state.pointIdx);
      setshouldClean(state.shouldClean);
      setedgesToRemove(state.edgesToRemove);
      setstackIdx(stackIdxRef.current + 1);
    }
    else
    {
      console.log(pointIdxRef.current);
      // let edgesToRemove: Edge[] = [];
      if (pointIdxRef.current < randomPoints.length - 1)
      {
        setcurrentResultHull(hullObjRef.current.faces);
        setcurrentStack([...currentStackRef.current,
        {
          currentResultHull: [...hullObjRef.current.faces],
          pointIdx: pointIdxRef.current,
          shouldClean: shouldCleanRef.current,
          edgesToRemove: [...edgesToRemoveRef.current]
        }]);
        setstackIdx(stackIdxRef.current + 1);
      }
      if (shouldCleanRef.current)
      {
        hullObjRef.current.cleanUp();
        setshouldClean(false);
        setedgesToRemove([]);
        console.log("cleaned");
      }
      else if (pointIdxRef.current < randomPoints.length)
      {
        if (pointIdxRef.current === 0)
        {
          hullObjRef.current.buildFirstHull(randomPoints);
          setPointIdx(4);
        }
        else
        {
          let addedNew = hullObjRef.current.increHull(randomPoints[pointIdxRef.current]);
          setshouldClean(addedNew);
          let edgesToRemove = addedNew ? hullObjRef.current.edges.filter(edge => edge.remove) : [];
          setedgesToRemove([...edgesToRemove]);
          setPointIdx(pointIdxRef.current + 1);
        }
      }

    }
  };


  const stepBack = () =>
  {
    if (stackIdxRef.current > 0)
    {
      let stack = currentStackRef.current;
      let state = stack[stackIdxRef.current - 1];
      setcurrentResultHull(state.currentResultHull);
      setPointIdx(state.pointIdx);
      setshouldClean(state.shouldClean);
      setedgesToRemove(state.edgesToRemove);
      setstackIdx(stackIdxRef.current - 1);
    }
  };

  const startAnimation = () =>
  {
    const intervalId = setInterval(() =>
    {
      props.setanimationState(true);

      step();
      //stop animation condition
      if (pointIdxRef.current === randomPoints.length - 1)
      {
        clearInterval(intervalId);
        props.setanimationState(false);
      }
    }, 100);
    setIntervalId(intervalId);
  };

  const stopAnimation = () =>
  {
    props.setanimationState(false);
    clearInterval(intervalId);
    setIntervalId(undefined);
  };

  const reset = () =>
  {
    stopAnimation();
    setpointsRegenerateTrigger(!pointsRegenerateTrigger);
    props.setanimationState(false);
    setPointIdx(0);
    hullObjRef.current = new IterativeConvexHull();
    setstackIdx(0);
    setcurrentStack([]);
    setcurrentResultHull([]);
    setshouldClean(false);
    setedgesToRemove([]);
  };


  return (

    <>
      <OrbitControls />
      <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
      <ambientLight intensity={0.2} />

      {/* <pointLight position={[20, 20, 20]} /> */}


      {randomPoints.map(point =>
      {
        return <Point color='red' position={point.toVector3()} />;
      })}
      {!shouldClean && pointIdx > 0 && pointIdx < randomPoints.length - 1 &&
        <Point color="#ffff00" position={randomPoints[pointIdx]?.toVector3()} />
      }
      {
        currentResultHull.map(triangle =>
        {
          return <Triangle opacity={0.0} color='green' vertices={[
            triangle.vertices[0].toVector3(),
            triangle.vertices[1].toVector3(),
            triangle.vertices[2].toVector3()
          ]} />;
        })
      }
      {
        edgesToRemove.map(edge =>
        {
          return <Line color={"#ffff00"} start={edge.endpoints[0].toVector3()} end={edge.endpoints[1].toVector3()}  ></Line>;
        })

      }


    </>
  );
});
export default AlgoScene;


