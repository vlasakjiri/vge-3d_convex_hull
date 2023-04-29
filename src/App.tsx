import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import QuickhullScene from './scenes/QuickhullScene';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import IterativeScene from './scenes/IterativeScene';
import AlgoScene2 from './scenes/AlgoScene2';
import { useState, useRef } from 'react';
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaPause } from "@react-icons/all-files/fa/FaPause";
import { FaStepBackward } from "@react-icons/all-files/fa/FaStepBackward";
import { FaStepForward } from "@react-icons/all-files/fa/FaStepForward";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";



export interface AlgorithmSceneRef
{
  step(): void;
  startAnimation(): void,
  stopAnimation(): void,
  reset(): void,
  stepBack(): void;
  delay?: number;
}

function App()
{
  const [delay, setDelay] = useState(1000);
  const [algorithmScene, setAlgorithmScene] = useState<AlgorithmSceneRef>(
    {
      step: () => { },
      startAnimation: () => { },
      stopAnimation: () => { },
      reset: () => { },
      stepBack: () => { },
    }
  );
  const algorithmSceneRef = React.useRef<AlgorithmSceneRef>(algorithmScene);
  const [animationState, setAnimationState] = useState(false);

  const handleDelayChange = (event: any) =>
  {
    setDelay(Number(event.target.value));
    // setAlgorithmScene({ ...algorithmSceneRef.current, delay: Number(event.target.value) });
  };

  return (
    <>
      <BrowserRouter>
        <div id="menu">
          <div id="animationControls">
            <button onClick={() => algorithmSceneRef.current.stepBack()}><FaStepBackward /></button>

            {!animationState ?
              <button onClick={() => algorithmSceneRef.current.startAnimation()}><FaPlay /></button>
              :
              <button onClick={() => algorithmSceneRef.current.stopAnimation()}><FaPause /></button>}
            <button onClick={() => algorithmSceneRef.current.step()}><FaStepForward /></button>


            <button onClick={() => algorithmSceneRef.current.reset()}><MdRefresh /></button>

            <label htmlFor="delay">Animation delay:</label>
            <input
              type="range"
              id="delay"
              name="delay"
              min="0"
              max="2000"
              value={delay}
              onChange={handleDelayChange}
            />
            {delay}ms
          </div>
          <div id="menuLinks">
            <Link to="/">Quickhull</Link>
            <Link to="/iterative">Iterative algorithm</Link>
            <Link to="/algo3">Algo 3</Link>
          </div>
        </div>
        <Canvas>
          <Routes>
            <Route path="/" element={
              <QuickhullScene ref={algorithmSceneRef}
                animationState={animationState}
                setanimationState={setAnimationState} />
            }
            />
            <Route path="/iterative" element={
              <IterativeScene
                ref={algorithmSceneRef}
                animationState={animationState}
                setanimationState={setAnimationState}
              />}
            />

            <Route path="/algo3" element={
              <AlgoScene2
                ref={algorithmSceneRef}
                animationState={animationState}
                setanimationState={setAnimationState}
              />}
            />




          </Routes>

        </Canvas>
      </BrowserRouter>
    </>
  );
}

export default App;
