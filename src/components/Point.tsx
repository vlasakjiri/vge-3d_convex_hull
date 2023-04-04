import { Vector3 } from "@react-three/fiber"
interface PointProps {
    position: Vector3
}
const Point = ({ position }: PointProps) => {
    return (
        <mesh position={position}>
            <sphereBufferGeometry args={[0.1, 16, 16]} />

            <meshBasicMaterial color="hotpink" />
        </mesh>
    )
}

export default Point;