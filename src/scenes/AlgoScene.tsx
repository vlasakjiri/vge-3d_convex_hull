
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import React, { useEffect, useState, useMemo, forwardRef, useRef, Ref } from "react";
import { AlgorithmSceneRef } from "../App";



type AlgoSceneProps = {
  animationState: boolean;
  setanimationState: React.Dispatch<React.SetStateAction<boolean>>
  // other props
};


const AlgoScene = forwardRef<AlgorithmSceneRef, AlgoSceneProps>((props, ref: Ref<AlgorithmSceneRef>) =>{
 
  const [intervalId, setIntervalId] = React.useState<NodeJS.Timer | undefined>();

  //handle function calls from parent
    React.useImperativeHandle(ref, () => ({
      step,
      startAnimation,
      stopAnimation,
      reset,
      stepBack
    }));

  const step = () => {
  }
  const stepBack = () => {	
  }

  const startAnimation = () => {
      const intervalId= setInterval(() => {
        props.setanimationState(true)

          step()
          //stop animation condition
          if(false)
          {
              clearInterval(intervalId);
              props.setanimationState(false)
          }
      }, 1000);
      setIntervalId(intervalId)
  }

  const stopAnimation = () => {
      props.setanimationState(false)
      clearInterval(intervalId);
      setIntervalId(undefined);
  }

  const reset = () => {
      stopAnimation()
  }


  return (

    <>
      <OrbitControls />
      <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
      <ambientLight intensity={0.2} />

      <pointLight position={[20, 20, 20]} />
      <mesh>
      <boxBufferGeometry args={[10, 10, 10]} />
      <meshBasicMaterial color="white" />
    </mesh>
    
    </>
  )
})
export default AlgoScene;


