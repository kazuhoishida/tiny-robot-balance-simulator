import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RapierRigidBody } from '@react-three/rapier'
import { useSimulationStore } from '../stores/simulationStore'

const SAMPLE_EVERY = 2
const JUMP_THRESHOLD = 4
const INITIAL_CAPACITY = 600

interface Props {
  bodyRef: React.RefObject<RapierRigidBody | null>
  color?: string
}

const _invQ = new THREE.Quaternion()
const _worldP = new THREE.Vector3()

export function TrailRenderer({ bodyRef, color = '#ff3333' }: Props) {
  const dataRef = useRef<number[]>([])
  const frameRef = useRef(0)
  const capacityRef = useRef(INITIAL_CAPACITY)
  const groupRef = useRef<THREE.Group>(null)

  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const arr = new Float32Array(INITIAL_CAPACITY * 3)
    geom.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    geom.setDrawRange(0, 0)
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })
    return new THREE.Line(geom, mat)
  }, [color])

  useFrame(() => {
    const body = bodyRef.current
    if (!body) return

    const diskBody = useSimulationStore.getState().diskBody

    // Keep group rotation in sync with disk so local-space trail tilts with it
    if (groupRef.current && diskBody) {
      const dq = diskBody.rotation()
      groupRef.current.quaternion.set(dq.x, dq.y, dq.z, dq.w)
    }

    frameRef.current++
    if (frameRef.current % SAMPLE_EVERY !== 0) return

    const p = body.translation()
    _worldP.set(p.x, p.y, p.z)

    // Convert to disk-local space (disk center is always at world origin)
    if (diskBody) {
      const dq = diskBody.rotation()
      _invQ.set(dq.x, dq.y, dq.z, dq.w).invert()
      _worldP.applyQuaternion(_invQ)
    }

    const lx = _worldP.x, ly = _worldP.y, lz = _worldP.z

    // Clear on RESTART (position jump in local space)
    const len = dataRef.current.length
    if (len >= 3) {
      const dx = lx - dataRef.current[len - 3]
      const dy = ly - dataRef.current[len - 2]
      const dz = lz - dataRef.current[len - 1]
      if (dx * dx + dy * dy + dz * dz > JUMP_THRESHOLD * JUMP_THRESHOLD) {
        dataRef.current = []
      }
    }

    dataRef.current.push(lx, ly, lz)
    const count = dataRef.current.length / 3

    // Grow buffer if needed
    if (count > capacityRef.current) {
      capacityRef.current = Math.ceil(capacityRef.current * 1.5)
      const newArr = new Float32Array(capacityRef.current * 3)
      line.geometry.setAttribute('position', new THREE.BufferAttribute(newArr, 3))
    }

    if (count >= 2) {
      const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < dataRef.current.length; i++) {
        (attr.array as Float32Array)[i] = dataRef.current[i]
      }
      attr.needsUpdate = true
      line.geometry.setDrawRange(0, count)
      line.geometry.computeBoundingSphere()
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={line} />
    </group>
  )
}
