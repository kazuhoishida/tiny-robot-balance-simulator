import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RapierRigidBody } from "@react-three/rapier"
import { MotionPattern } from "../stores/simulationStore"

interface Props {
  robotRef: React.RefObject<RapierRigidBody | null>
  diskBodyRef: { current: RapierRigidBody | null }
  pattern: MotionPattern
  speed: number
  initX: number
  initZ: number
}

const UPHILL_SCALE = 3
const HOP_INTERVAL = 0.65
const HOP_VELOCITY = 3.5
const STARTUP_DURATION = 3.0
const INITIAL_PUSH_SPEED = 0.5

export function useRobotMotion({ robotRef, diskBodyRef, pattern, speed, initX, initZ }: Props) {
  const hopTimerRef = useRef(0)
  const elapsedRef = useRef(0)

  const len = Math.sqrt(initX * initX + initZ * initZ)
  const outX = len > 0.001 ? -initZ / len : 1
  const outZ = len > 0.001 ? initX / len : 0

  useFrame((_, delta) => {
    const body = robotRef.current
    if (!body) return

    elapsedRef.current += delta

    // Compute uphill direction from the disk's world-space surface normal.
    // Rotating local Y by quaternion q gives: n_x = 2(qx·qy - qw·qz), n_z = 2(qy·qz + qw·qx).
    // This is invariant to the RigidBody's initial Y rotation, unlike Euler extraction.
    let dx = 0,
      dz = 0,
      tiltMag = 0
    const disk = diskBodyRef.current
    if (disk) {
      const { x: qx, y: qy, z: qz, w: qw } = disk.rotation()
      const nx = 2 * (qx * qy - qw * qz)
      const nz = 2 * (qy * qz + qw * qx)
      dx = -nx
      dz = -nz
      tiltMag = Math.sqrt(nx * nx + nz * nz)
    }

    let vy = body.linvel().y

    if (pattern === "hopping") {
      hopTimerRef.current -= delta
      if (hopTimerRef.current <= 0) {
        if (vy > -0.8 && vy < 0.3) {
          hopTimerRef.current = HOP_INTERVAL / speed
          vy = HOP_VELOCITY
        } else {
          hopTimerRef.current = 0
        }
      }
    }

    let vx = 0
    let vz = 0
    if (tiltMag > 0.005) {
      const v = tiltMag * UPHILL_SCALE * speed
      const baseAngle = Math.atan2(dz, dx)
      vx = Math.cos(baseAngle) * v
      vz = Math.sin(baseAngle) * v
    }

    if (elapsedRef.current < STARTUP_DURATION) {
      const t = elapsedRef.current / STARTUP_DURATION
      const push = (1 - t) * INITIAL_PUSH_SPEED
      vx += outX * push + Math.random() * 0.1
      vz += outZ * push + Math.random() * 0.1
    }

    body.setLinvel({ x: vx, y: vy, z: vz }, true)
  })

  return {
    reset: () => {
      elapsedRef.current = 0
      hopTimerRef.current = 0
    },
  }
}
