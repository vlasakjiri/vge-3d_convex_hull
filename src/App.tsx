import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import QuickhullScene from './scenes/QuickhullScene';
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import IterativeScene from './scenes/IterativeScene';
import { useState} from 'react';
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaPause } from "@react-icons/all-files/fa/FaPause";
import { FaStepBackward } from "@react-icons/all-files/fa/FaStepBackward";
import { FaStepForward } from "@react-icons/all-files/fa/FaStepForward";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";
import BruteForceScene from './scenes/BruteForceScene';



export interface AlgorithmSceneRef {
  step(): void;
  startAnimation(): void,
  stopAnimation(): void,
  reset(): void,
  stepBack(): void;
  delay?: number;
}

function App() {
  const [delay, setDelay] = useState<number>(500);
  const [opacity, setopacity] = useState<number>(70);

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
  const [pointsCount, setpointsCount] = useState<number>(20)
  const handleDelayChange = (event: any) => {
    setDelay(Number(event.target.value));
    //recreate interval with new delay
    algorithmSceneRef.current.stopAnimation()
    algorithmSceneRef.current.startAnimation()
  };

  const scenesComponents = [
    {
      "path": "/",
      "SceneComponent": QuickhullScene
    },
    {
      "path": "/iterative",
      "SceneComponent": IterativeScene
    },
    {
      "path": "/bruteforce",
      "SceneComponent": BruteForceScene
    }
  ];

  return (
    <>
      <HashRouter>
        <div id="menu">
          <div id="animationControls">

            <button onClick={() => algorithmSceneRef.current.stepBack()}><FaStepBackward size={16}/></button>

            {!animationState ?
              <button onClick={() => algorithmSceneRef.current.startAnimation()}><FaPlay size={16}/></button>
              :
              <button onClick={() => algorithmSceneRef.current.stopAnimation()}><FaPause size={16}/></button>}
            <button onClick={() => algorithmSceneRef.current.step()}><FaStepForward size={16} /></button>


            <button style={
              {
                padding: "4px 14px"
              }
            } disabled={pointsCount < 4 || pointsCount > 1000} onClick={() => algorithmSceneRef.current.reset()}><MdRefresh size={28} /></button>
            <div className='inputContainer'>

              <label htmlFor='pointsCount'>Points count:</label>
              <input
                type='number'
                id='pointsCount'
                min={4}
                max={1000}
                className='pointsCount'
                value={pointsCount}
                onChange={(event) => setpointsCount(Number(event.target.value))} />
            </div>

            <div className='inputContainer'>
              <label htmlFor="delay">Animation step (ms):</label>
              <input
                type="range"
                id="delay"
                name="delay"
                min="10"
                max="2000"
                value={delay}
                onChange={handleDelayChange}
              />
              {delay}ms
            </div>
            <div className='inputContainer'>
              <label htmlFor="opacity">Opacity:</label>
              <input
                type="range"
                id="opacity"
                name="opacity"
                min="0"
                max="100"
                value={opacity}
                onChange={event => setopacity(Number(event.target.value))}
              />
              {opacity}%
            </div>
          </div>

          <div id="menuLinks">
            <Link to="/">Quickhull</Link>
            <Link to="/iterative">Iterative algorithm</Link>
            <Link to="/bruteforce">Bruteforce</Link>

          </div>
        </div>
        <Canvas>
          <Routes>
            {scenesComponents.map(({ path, SceneComponent }) => (
              <Route
                key={path}
                path={path}
                element={<SceneComponent ref={algorithmSceneRef}
                  animationState={animationState}
                  setanimationState={setAnimationState}
                  animationStepSpeed={delay}
                  pointsCount={pointsCount}
                  opacity={(opacity / 100)} />}

              />
            ))}

                    
            
          </Routes>
        </Canvas>
      </HashRouter >
    </>
  );
}

export default App;
