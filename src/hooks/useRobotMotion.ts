import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { MotionPattern, useSimulationStore } from '../stores/simulationStore'

interface Props {
  robotRef: React.RefObject<RapierRigidBody | null>
  pattern: MotionPattern
  speed: number
}

const UPHILL_SCALE = 3
const HOP_INTERVAL = 0.65
const HOP_VELOCITY = 3.5

export function useRobotMotion({ robotRef, pattern, speed }: Props) {
  const hopTimerRef = useRef(0)

  useFrame((_, delta) => {
    const body = robotRef.current
    if (!body) return

    const { tiltX, tiltZ } = useSimulationStore.getState()
    const dx = Math.sin(tiltZ)
    const dz = -Math.sin(tiltX)
    const tiltMag = Math.sqrt(dx * dx + dz * dz)

    let vy = body.linvel().y

    if (pattern === 'hopping') {
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

    if (tiltMag > 0.005) {
      const v = tiltMag * UPHILL_SCALE * speed
      body.setLinvel({ x: (dx / tiltMag) * v, y: vy, z: (dz / tiltMag) * v }, true)
    } else {
      body.setLinvel({ x: 0, y: vy, z: 0 }, true)
    }
  })
}
