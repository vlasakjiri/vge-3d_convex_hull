import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import QuickhullScene from './scenes/QuickhullScene';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AlgoScene from './scenes/AlgoScene';
import AlgoScene2 from './scenes/AlgoScene2';
import { useState, useRef } from 'react';

export interface AlgorithmSceneRef {
  step(): void;
  startAnimation(): void,
  stopAnimation(): void,
  reset(): void,
  stepBack(): void,
}

function App() {
  const algorithmSceneRef = React.useRef<AlgorithmSceneRef>({ step: () => { }, startAnimation: () => { }, stopAnimation: () => { }, reset: () => { }, stepBack: () => { } });
  const [animationState, setAnimationState] = useState(false);

  return (
    <>
      <BrowserRouter>
        <div id="menu">
          <div id="animationControls">
            <button onClick={() => algorithmSceneRef.current.step()}>Step forward</button>
            <button onClick={() => algorithmSceneRef.current.stepBack()}>Step back</button>

            {!animationState ?
              <button onClick={() => algorithmSceneRef.current.startAnimation()}>Start animation</button>
              :
              <button onClick={() => algorithmSceneRef.current.stopAnimation()}>Pause animation</button>}

            <button onClick={() => algorithmSceneRef.current.reset()}>Reset</button>
          </div>
          <div id="menuLinks">
            <Link to="/">Quickhull</Link>
            <Link to="/algo2">Algo 2</Link>
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
            <Route path="/algo2" element={
              <AlgoScene
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
