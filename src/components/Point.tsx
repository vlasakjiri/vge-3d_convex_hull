import { Color, Vector3 } from "@react-three/fiber"
interface PointProps {
    position: Vector3,
    color?: Color
}
const Point = ({ position, color = "white" }: PointProps) => {
    return (
        <mesh position={position}>
            <sphereBufferGeometry args={[0.1, 16, 16]} />

            <meshBasicMaterial color={color} />
        </mesh>
    )
}

export default Point;