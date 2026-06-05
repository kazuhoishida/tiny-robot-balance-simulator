import { create } from 'zustand'

export type MotionPattern = 'uphill' | 'hopping' | 'circle' | 'leftRight' | 'figure8' | 'randomWalk'

interface SimulationStore {
  tiltX: number
  tiltZ: number
  setTilt: (x: number, z: number) => void
  motionPattern: MotionPattern
  setMotionPattern: (pattern: MotionPattern) => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  tiltX: 0,
  tiltZ: 0,
  setTilt: (x, z) => set({ tiltX: x, tiltZ: z }),
  motionPattern: 'circle',
  setMotionPattern: (pattern) => set({ motionPattern: pattern }),
}))
