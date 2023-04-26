import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import { createRef } from 'react';
import { useRef } from 'react';

interface SceneRef {
  step(): void;
  startAnimation(): void,
  stopAnimation(): void,
  reset(): void
}
function App() {
  const sceneRef = React.useRef<SceneRef>({ step: () => { }, startAnimation: () => { }, stopAnimation: () => { }, reset: () => { } });
  return (
    <>
      <button onClick={() => sceneRef.current.step()}>Step</button>
      <button onClick={() => sceneRef.current.startAnimation()}>startAnimation</button>
      <button onClick={() => sceneRef.current.stopAnimation()}>stopAnimation</button>
      <button onClick={() => sceneRef.current.reset()}>reset</button>
      <Canvas>
        <Scene ref={sceneRef} />
      </Canvas>
    </>
  );
}

export default App;
