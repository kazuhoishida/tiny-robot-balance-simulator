import { useRef } from 'react'
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier'
import { useRobotMotion } from '../hooks/useRobotMotion'
import { useSimulationStore } from '../stores/simulationStore'

interface Props {
  radius: number
  mass: number
  speed: number
  friction: number
}

export function Robot({ radius, mass, speed, friction }: Props) {
  const robotRef = useRef<RapierRigidBody>(null)
  const motionPattern = useSimulationStore((s) => s.motionPattern)

  useRobotMotion({ robotRef, pattern: motionPattern, speed })

  return (
    <RigidBody
      ref={robotRef}
      position={[1, radius + 0.1, 0]}
      colliders={false}
      mass={mass}
      linearDamping={1}
      angularDamping={1}
    >
      <BallCollider args={[radius]} friction={friction} restitution={0} />
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color="#fff" metalness={0.2} roughness={0.5} />
      </mesh>
    </RigidBody>
  )
}
