import React from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Line from "./components/Line";
import Point from "./components/Point";
interface SceneProps {

}

const Scene = ({ }: SceneProps) => {
    return (
        <>
        <OrbitControls/>
        <PerspectiveCamera makeDefault fov={75} position={[0,0,30]}/>
            <ambientLight intensity={0.2}/>
            <pointLight  position={[20, 20, 20]} />
            <Line start={[0,0,0]} end={[0,5,0]}/>
            <Point position={[0,0,0]} />
            <Point position={[0,5,0]} />
            <Point position={[0,0,2]} />
            <Point position={[3,0,0]} />


        </>
    )
}

export default Scene;