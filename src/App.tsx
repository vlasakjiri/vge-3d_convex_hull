import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

interface QuickhullSceneRef {
  step(): void;
  startAnimation(): void,
  stopAnimation(): void,
  reset(): void
}
function App() {
  const quickhullSceneRef = React.useRef<QuickhullSceneRef>({ step: () => { }, startAnimation: () => { }, stopAnimation: () => { }, reset: () => { } });
  return (
    <>
      <button onClick={() => quickhullSceneRef.current.step()}>Step</button>
      <button onClick={() => quickhullSceneRef.current.startAnimation()}>startAnimation</button>
      <button onClick={() => quickhullSceneRef.current.stopAnimation()}>stopAnimation</button>
      <button onClick={() => quickhullSceneRef.current.reset()}>reset</button>
      <Canvas>
        <Scene ref={quickhullSceneRef} />
      </Canvas>
    </>
  );
}

export default App;
