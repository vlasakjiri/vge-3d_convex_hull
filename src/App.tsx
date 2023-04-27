import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import QuickhullScene from './QuickhullScene';
import { QuickhullSceneRef } from './QuickhullScene';

function App() {
  const algorithmSceneRef = React.useRef<QuickhullSceneRef>({ step: () => { }, startAnimation: () => { }, stopAnimation: () => { }, reset: () => { }, stepBack: () => { } });
  return (
    <>
      <button onClick={() => algorithmSceneRef.current.step()}>Step</button>
      <button onClick={() => algorithmSceneRef.current.startAnimation()}>startAnimation</button>
      <button onClick={() => algorithmSceneRef.current.stopAnimation()}>stopAnimation</button>
      <button onClick={() => algorithmSceneRef.current.reset()}>reset</button>
      <button onClick={() => algorithmSceneRef.current.stepBack()}>stepBack</button>
      <Canvas>
        <QuickhullScene ref={algorithmSceneRef} />
      </Canvas>
    </>
  );
}

export default App;
