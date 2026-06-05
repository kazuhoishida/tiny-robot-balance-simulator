import { RigidBody, CylinderCollider } from '@react-three/rapier'

// Used by Ground.tsx to derive pillar/pedestal geometry
export const FLOOR_Y = -0.6

// Pedestal geometry (must match Ground.tsx constants)
const PEDESTAL_CENTER_Y = -0.4
const PEDESTAL_HALF_HEIGHT = 0.1  // thickness 0.2m
const PEDESTAL_RADIUS = 3.5

export function PhysicsFloor() {
  return (
    <RigidBody type="fixed" position={[0, PEDESTAL_CENTER_Y, 0]}>
      <CylinderCollider
        args={[PEDESTAL_HALF_HEIGHT, PEDESTAL_RADIUS]}
        friction={0.05}
        restitution={0}
      />
    </RigidBody>
  )
}
