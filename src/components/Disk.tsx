import { useEffect, useMemo, Fragment } from "react"
import { RigidBody, ConvexHullCollider, RapierRigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useSimulationStore } from "../stores/simulationStore"
import { Robot } from "./Robot"
import * as THREE from "three"
import { PILLAR_HEIGHT } from "./Ground"

interface RobotParams {
  radius: number
  mass: number
  speed: number
  showTrail: boolean
}

interface Props {
  radius: number
  thickness: number
  mass: number
  friction: number
  pivotDamping: number
  robot: RobotParams
}

const PILLAR_CENTER_Y = -PILLAR_HEIGHT // -0.15 m

// Equilateral triangle with circumradius r.
// World XZ: v1=(r,0,0), v2=(-r/2,0,+h), v3=(-r/2,0,-h) where h=r√3/2
function makeVertices(r: number, thickness: number): Float32Array {
  const h = (r * Math.sqrt(3)) / 2
  const t = thickness / 2
  return new Float32Array([r, t, 0, -r / 2, t, h, -r / 2, t, -h, r, -t, 0, -r / 2, -t, h, -r / 2, -t, -h])
}

// Shape in XY, rotateX(-π/2) → lies flat in XZ.
function makeGeometry(r: number, thickness: number): THREE.BufferGeometry {
  const h = (r * Math.sqrt(3)) / 2
  const shape = new THREE.Shape()
  shape.moveTo(r, 0)
  shape.lineTo(-r / 2, -h)
  shape.lineTo(-r / 2, h)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })
  geo.translate(0, 0, -thickness / 2)
  geo.rotateX(-Math.PI / 2)
  return geo
}

const COUNT = 6
const GAP = 0.05 // outward offset per triangle (m)
const DISK_Y = -0.15 // vertical position of each triangle (m)

export function Disk({ radius, thickness, mass, friction, pivotDamping, robot }: Props) {
  const diskRefs = useMemo(() => Array.from({ length: COUNT }, (): { current: RapierRigidBody | null } => ({ current: null })), [])

  const setTilt = useSimulationStore((s) => s.setTilt)
  const setDiskBody = useSimulationStore((s) => s.setDiskBody)

  useEffect(() => {
    setDiskBody(diskRefs[0].current)
    return () => setDiskBody(null)
  }, [])

  useFrame(() => {
    const body = diskRefs[0].current
    if (!body) return
    const { x: qx, y: qy, z: qz, w: qw } = body.rotation()
    const nx = 2 * (qx * qy - qw * qz)
    const nz = 2 * (qy * qz + qw * qx)
    const tiltX = Math.asin(Math.max(-1, Math.min(1, nz)))
    const tiltZ = Math.asin(Math.max(-1, Math.min(1, -nx)))
    setTilt(tiltX, tiltZ)
  })

  const triRadius = radius / 2
  const vertices = useMemo(() => makeVertices(triRadius, thickness), [triRadius, thickness])
  const geometry = useMemo(() => makeGeometry(triRadius, thickness), [triRadius, thickness])

  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (30 + i * 60) * (Math.PI / 180)
        const d = triRadius + GAP
        const px = d * Math.cos(angle)
        const pz = d * Math.sin(angle)
        const ry = (i * 60 + 30) * (Math.PI / 180)

        return (
          <Fragment key={i}>
            <RigidBody
              ref={(body: RapierRigidBody | null) => {
                diskRefs[i].current = body
              }}
              position={[px, DISK_Y, pz]}
              rotation={[0, ry, 0]}
              colliders={false}
              mass={mass / COUNT}
              linearDamping={0}
              angularDamping={pivotDamping}
              enabledRotations={[true, false, true]}
              enabledTranslations={[false, false, false]}
            >
              <ConvexHullCollider args={[vertices]} friction={friction} restitution={0} />
              <mesh castShadow receiveShadow geometry={geometry}>
                <meshStandardMaterial color="#424242" metalness={0.2} roughness={0.35} />
              </mesh>
              <mesh position={[0, thickness / 2 + 0.01, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
                <meshStandardMaterial color="#cdbf6f" />
              </mesh>
            </RigidBody>
            <Robot id={`robot-hex-${i}`} initX={px} initZ={pz} diskBodyRef={diskRefs[i]} {...robot} friction={friction} />

            {/* Central pivot pillar */}
            <mesh position={[px, PILLAR_CENTER_Y, pz]}>
              <cylinderGeometry args={[0.01, 0.04, PILLAR_HEIGHT, 12]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.7} roughness={0.3} />
            </mesh>
          </Fragment>
        )
      })}
    </>
  )
}
