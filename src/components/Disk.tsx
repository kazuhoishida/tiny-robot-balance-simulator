import { useRef, useEffect } from "react"
import { RigidBody, CylinderCollider, RapierRigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useSimulationStore } from "../stores/simulationStore"

interface Props {
  radius: number
  thickness: number
  mass: number
  friction: number
  pivotDamping: number
}

export function Disk({ radius, thickness, mass, friction, pivotDamping }: Props) {
  const diskRef = useRef<RapierRigidBody>(null)
  const setTilt = useSimulationStore((s) => s.setTilt)
  const setDiskBody = useSimulationStore((s) => s.setDiskBody)

  useEffect(() => {
    setDiskBody(diskRef.current)
    return () => setDiskBody(null)
  }, [])

  useFrame(() => {
    const body = diskRef.current
    if (!body) return

    const { x: qx, y: qy, z: qz, w: qw } = body.rotation()
    const sinX = 2 * (qw * qx - qy * qz)
    const tiltX = Math.abs(sinX) >= 1 ? (Math.sign(sinX) * Math.PI) / 2 : Math.asin(sinX)
    const tiltZ = Math.atan2(2 * (qw * qz + qx * qy), 1 - 2 * (qx * qx + qz * qz))
    setTilt(tiltX, tiltZ)
  })

  return (
    <RigidBody ref={diskRef} position={[0, 0, 0]} colliders={false} mass={mass} linearDamping={0} angularDamping={pivotDamping} enabledRotations={[true, false, true]} enabledTranslations={[false, false, false]}>
      <CylinderCollider args={[thickness / 2, radius]} friction={friction} restitution={0} />
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, thickness, 64]} />
        <meshStandardMaterial color="#424242" metalness={0.2} roughness={0.35} />
      </mesh>

      <mesh position={[0, thickness / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        <meshStandardMaterial color="#cdbf6f" />
      </mesh>
    </RigidBody>
  )
}
