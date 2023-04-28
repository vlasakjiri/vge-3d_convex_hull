
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import React, { useEffect, useState, useMemo, forwardRef, useRef, Ref } from "react";
import { AlgorithmSceneRef } from "../App";
import Point from "../components/Point";
import Triangle from "../components/Triangle";


import * as THREE from "three";




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
  const randomPoints = useMemo(() => generateArraysInRange(40, -10, 10), []);

  // let hull = computeConvexHull(randomPoints);

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
      if (false)
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
      <Point position={[3, 3, 3]} color='red'></Point>
      <Point position={[3, 0, 0]} color='red'></Point>
      <Point position={[0, 3, 0]} color='red'></Point>
      <Point position={[0, 0, 3]} color='red'></Point>

      <Triangle
        vertices={[new THREE.Vector3(0, 0, 3), new THREE.Vector3(0, 3, 0), new THREE.Vector3(3, 0, 0)]}
        color='green'
        opacity={0.5}
      ></Triangle>
      <Triangle
        vertices={[new THREE.Vector3(3, 3, 3), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 3)]}
        color='green'
        opacity={0.5}
      ></Triangle>
      <Triangle
        vertices={[new THREE.Vector3(0, 0, 3), new THREE.Vector3(3, 0, 0), new THREE.Vector3(3, 3, 3)]}
        color='green'
        opacity={0.5}
      ></Triangle>
      <Triangle
        vertices={[new THREE.Vector3(3, 3, 3), new THREE.Vector3(3, 0, 0), new THREE.Vector3(0, 3, 0)]}
        color='green'
        opacity={0.5}
      ></Triangle>

      {/* {randomPoints.map(point =>
      {
        return <Point color='red' position={point} />;
      })}
      {
        hull["points"].map(point =>
        {
          return <Point color='blue' position={point} />;
        })
      } */}
      {/* <mesh>
        <boxBufferGeometry args={[10, 10, 10]} />
        <meshBasicMaterial color="white" />
      </mesh> */}

    </>
  );
});
export default AlgoScene;


