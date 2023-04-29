import * as THREE from 'three';
export function randomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function generatePointsInRange(N: number, min: number, max: number): Array<THREE.Vector3> {
    const arrays = [];
    for (let i = 0; i < N; i++) {
        let vec = new THREE.Vector3(
            randomRange(min, max),
            randomRange(min, max),
            randomRange(min, max)
        );
        arrays.push(vec);
    }
    return arrays;
}