import { create } from 'zustand'

export type MotionPattern = 'uphill' | 'hopping'

interface SimulationStore {
  tiltX: number
  tiltZ: number
  setTilt: (x: number, z: number) => void
  motionPattern: MotionPattern
  setMotionPattern: (pattern: MotionPattern) => void
  robotResets: Record<string, () => void>
  registerRobotReset: (id: string, fn: () => void) => void
  unregisterRobotReset: (id: string) => void
  resetAllRobots: () => void
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  tiltX: 0,
  tiltZ: 0,
  setTilt: (x, z) => set({ tiltX: x, tiltZ: z }),
  motionPattern: 'uphill',
  setMotionPattern: (pattern) => set({ motionPattern: pattern }),
  robotResets: {},
  registerRobotReset: (id, fn) =>
    set((s) => ({ robotResets: { ...s.robotResets, [id]: fn } })),
  unregisterRobotReset: (id) =>
    set((s) => {
      const next = { ...s.robotResets }
      delete next[id]
      return { robotResets: next }
    }),
  resetAllRobots: () => {
    Object.values(get().robotResets).forEach((fn) => fn())
  },
}))
