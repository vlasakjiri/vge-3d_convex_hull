import React from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
interface Scene {

}
const Scene = ({ }: Scene) => {
    return (
        <>
        <OrbitControls/>
        <PerspectiveCamera makeDefault fov={75} position={[0,0,30]}/>
            <ambientLight/>
            <pointLight position={[10, 10, 0]} />
            <mesh>
                <boxGeometry args={[10,10, 10]}/>
                <meshStandardMaterial />
            </mesh>
        </>
    )
}

export default Scene;