import React from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Line from "./components/Line";
import Point from "./components/Point";
import MultiLine from "./components/MultiLine";
import { Vector3 } from "three";
interface SceneProps {

}

const pointsArray: Array<Array<number>> = [
    [0,0,0],
    [-1,5,0],
    [0,0,2],
    [3,0,0],
    [0,0,0]
]

const Scene = ({ }: SceneProps) => {
    return (
        <>
            <OrbitControls />
            <PerspectiveCamera makeDefault fov={75} position={[0, 0, 30]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[20, 20, 20]} />
            <Line start={new Vector3(...[3,3,5])} end={new Vector3(...[0,5,0])}/>
            <MultiLine color='hotpink' points={pointsArray.map(point => new Vector3(...point))} />
            {pointsArray.map(point =>
                <Point color='hotpink' position={new Vector3(...point)} />
            )}
            <Point color='red' position={[1, 2, 0]} />


        </>
    )
}

export default Scene;