import { OrbitControls } from '@react-three/drei'

export function Camera() {
  return (
    <OrbitControls
      target={[0, 0, 0]}
      minDistance={3}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2}
    />
  )
}
