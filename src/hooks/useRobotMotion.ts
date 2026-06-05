import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { Vector3 } from 'three'
import { MotionPattern, useSimulationStore } from '../stores/simulationStore'

interface Props {
  robotRef: React.RefObject<RapierRigidBody | null>
  pattern: MotionPattern
  speed: number
}

const _target = new Vector3()
const _current = new Vector3()
const _vel = new Vector3()

const UPHILL_SCALE = 3
const PATTERN_RADIUS = 1.5
const HOP_INTERVAL = 0.65
const HOP_VELOCITY = 3.5

export function useRobotMotion({ robotRef, pattern, speed }: Props) {
  const timeRef = useRef(0)
  const randomTargetRef = useRef(new Vector3(PATTERN_RADIUS, 0, 0))
  const randomTimerRef = useRef(0)
  const hopTimerRef = useRef(0)

  useFrame((_, delta) => {
    const body = robotRef.current
    if (!body) return

    if (pattern === 'uphill' || pattern === 'hopping') {
      const { tiltX, tiltZ } = useSimulationStore.getState()
      const dx = Math.sin(tiltZ)
      const dz = -Math.sin(tiltX)
      const tiltMag = Math.sqrt(dx * dx + dz * dz)

      let vy = body.linvel().y

      if (pattern === 'hopping') {
        hopTimerRef.current -= delta
        if (hopTimerRef.current <= 0) {
          // Only jump when grounded: vy near zero means touching a surface
          if (vy > -0.8 && vy < 0.3) {
            hopTimerRef.current = HOP_INTERVAL / speed
            vy = HOP_VELOCITY
          } else {
            hopTimerRef.current = 0 // retry next frame until grounded
          }
        }
      }

      if (tiltMag > 0.005) {
        const v = tiltMag * UPHILL_SCALE * speed
        body.setLinvel({ x: (dx / tiltMag) * v, y: vy, z: (dz / tiltMag) * v }, true)
      } else {
        body.setLinvel({ x: 0, y: vy, z: 0 }, true)
      }
      return
    }

    timeRef.current += delta * speed
    const t = timeRef.current

    switch (pattern) {
      case 'circle':
        _target.set(Math.cos(t) * PATTERN_RADIUS, 0, Math.sin(t) * PATTERN_RADIUS)
        break
      case 'leftRight':
        _target.set(Math.sin(t) * PATTERN_RADIUS, 0, 0)
        break
      case 'figure8':
        _target.set(Math.sin(t) * PATTERN_RADIUS, 0, Math.sin(t * 2) * PATTERN_RADIUS * 0.5)
        break
      case 'randomWalk':
        randomTimerRef.current -= delta
        if (randomTimerRef.current <= 0) {
          randomTimerRef.current = 1.5 + Math.random() * 2
          const angle = Math.random() * Math.PI * 2
          randomTargetRef.current.set(
            Math.cos(angle) * Math.random() * PATTERN_RADIUS,
            0,
            Math.sin(angle) * Math.random() * PATTERN_RADIUS,
          )
        }
        _target.copy(randomTargetRef.current)
        break
    }

    const pos = body.translation()
    _current.set(pos.x, pos.y, pos.z)
    _vel.set((_target.x - _current.x) * 3, body.linvel().y, (_target.z - _current.z) * 3)
    body.setLinvel({ x: _vel.x, y: _vel.y, z: _vel.z }, true)
  })
}
