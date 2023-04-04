
import { useFrame ,Color} from "@react-three/fiber";
import { Vector3 } from "three";
import { useRef } from "react";
type lineProps = {
    points: Array<Vector3>,
    color?: Color
}

const MultiLine = ({points, color="white"}: lineProps) => {
    const ref = useRef<any>()
    //call setFromPoints function on buffer geometry
    useFrame(() => {
        if (ref.current) {
            ref.current.geometry.setFromPoints(points);
        }
    })
    return (
        <line  ref={ref}>
            <bufferGeometry />
            <lineBasicMaterial color={color} />
        </line>
    )
}

export default MultiLine;




