import { useRef, useEffect } from 'react'
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier'
import { useRobotMotion } from '../hooks/useRobotMotion'
import { useSimulationStore } from '../stores/simulationStore'

interface Props {
  id: string
  initX: number
  initZ: number
  radius: number
  mass: number
  speed: number
  noise: number
  friction: number
}

export function Robot({ id, initX, initZ, radius, mass, speed, noise, friction }: Props) {
  const robotRef = useRef<RapierRigidBody>(null)
  const motionPattern = useSimulationStore((s) => s.motionPattern)
  const registerRobotReset = useSimulationStore((s) => s.registerRobotReset)
  const unregisterRobotReset = useSimulationStore((s) => s.unregisterRobotReset)

  useEffect(() => {
    registerRobotReset(id, () => {
      const body = robotRef.current
      if (!body) return
      body.setTranslation({ x: initX, y: radius + 0.1, z: initZ }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    })
    return () => unregisterRobotReset(id)
  }, [id, initX, initZ, radius, registerRobotReset, unregisterRobotReset])

  useRobotMotion({ robotRef, pattern: motionPattern, speed, noise })

  return (
    <RigidBody
      ref={robotRef}
      position={[initX, radius + 0.1, initZ]}
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
