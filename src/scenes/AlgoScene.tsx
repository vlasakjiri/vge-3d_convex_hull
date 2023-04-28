
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

const AlgoScene = forwardRef<AlgorithmSceneRef, AlgoSceneProps>((props, ref: Ref<AlgorithmSceneRef>) =>
{

  const [intervalId, setIntervalId] = React.useState<NodeJS.Timer | undefined>();
  const randomPoints = useMemo(() => generateArraysInRange(40, -10, 10).map(point => Point3D.fromVector3(point)), []);

  const [currentResultHull, setcurrentResultHull] = useState(new Array<Face>());
  const [idx, setidx] = useState(0);
  const [shouldClean, setshouldClean] = useState(false);
  const [edgesToRemove, setedgesToRemove] = useState(new Array<Edge>());

  const hullObj = useMemo(() => new IterativeConvexHull(), []);


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
    if (shouldClean)
    {
      hullObj.cleanUp();
      setshouldClean(false);
      setedgesToRemove([]);
    }
    else if (idx < randomPoints.length)
    {
      if (idx === 0)
      {
        hullObj.buildFirstHull(randomPoints);
        setidx(4);
      }
      else
      {
        let addedNew = hullObj.increHull(randomPoints[idx]);
        setshouldClean(addedNew);
        setedgesToRemove(hullObj.edges.filter(edge => edge.remove));
        setidx(idx + 1);
      }
    }
    setcurrentResultHull(hullObj.faces);
  };
  const stepBack = () =>
  {
  };

  const startAnimation = () =>
  {
    const intervalId = setInterval(() =>
    {
      props.setanimationState(true);

      step();
      //stop animation condition
      if (currentResultHull.length !== 0)
      {
        clearInterval(intervalId);
        props.setanimationState(false);
      }
    }, 1000);
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
  };


  return (

    <>
      <OrbitControls />
      <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
      <ambientLight intensity={0.2} />

      <pointLight position={[20, 20, 20]} />


      {randomPoints.map(point =>
      {
        return <Point color='red' position={point.toVector3()} />;
      })}
      {!shouldClean && idx > 0 && idx < randomPoints.length - 1 &&
        <Point color="#ffff00" position={randomPoints[idx]?.toVector3()} />
      }
      {
        currentResultHull.map(triangle =>
        {
          return <Triangle opacity={idx === randomPoints.length - 1 ? 1 : 0.8} color='green' vertices={[
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


