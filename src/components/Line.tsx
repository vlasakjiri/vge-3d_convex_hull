
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useRef } from "react";
type lineProps = {
    start: number[],
    end: number[]
}

const Line = ({start, end}: lineProps) => {
    const ref = useRef<any>()

    useFrame(() => {
        if (ref.current) {
            ref.current.geometry.setFromPoints([start, end].map((point) => new Vector3(...point)));
        }
    })
    return (
        <line  ref={ref}>
            <bufferGeometry />
            <lineBasicMaterial color="hotpink" />
        </line>
    )
}

export default Line;




