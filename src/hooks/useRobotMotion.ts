import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RapierRigidBody } from "@react-three/rapier"
import { MotionPattern, useSimulationStore } from "../stores/simulationStore"

interface Props {
  robotRef: React.RefObject<RapierRigidBody | null>
  pattern: MotionPattern
  speed: number
  initX: number
  initZ: number
}

const UPHILL_SCALE = 3
const HOP_INTERVAL = 0.65
const HOP_VELOCITY = 3.5
const STARTUP_DURATION = 5.0 // seconds
const INITIAL_PUSH_SPEED = 0.6 // m/s at t=0, fades to 0 over STARTUP_DURATION

export function useRobotMotion({ robotRef, pattern, speed, initX, initZ }: Props) {
  const hopTimerRef = useRef(0)
  const elapsedRef = useRef(0)

  // Tangent direction: perpendicular to radial direction (rotate 90°)
  const len = Math.sqrt(initX * initX + initZ * initZ)
  const outX = len > 0.001 ? -initZ / len : 1
  const outZ = len > 0.001 ? initX / len : 0

  useFrame((_, delta) => {
    const body = robotRef.current
    if (!body) return

    elapsedRef.current += delta

    const { tiltX, tiltZ } = useSimulationStore.getState()
    const dx = Math.sin(tiltZ)
    const dz = -Math.sin(tiltX)
    const tiltMag = Math.sqrt(dx * dx + dz * dz)

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

    // Initial outward push — fades linearly over STARTUP_DURATION
    if (elapsedRef.current < STARTUP_DURATION) {
      const t = elapsedRef.current / STARTUP_DURATION
      const push = (1 - t) * INITIAL_PUSH_SPEED
      vx += outX * push
      vz += outZ * push
    }

    body.setLinvel({ x: vx, y: vy, z: vz }, true)
  })
}
