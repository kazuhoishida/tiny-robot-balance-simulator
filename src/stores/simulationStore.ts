import { create } from "zustand"

export type MotionPattern = "uphill" | "hopping"

interface SimulationStore {
  tiltX: number
  tiltZ: number
  setTilt: (x: number, z: number) => void
  motionPattern: MotionPattern
  setMotionPattern: (pattern: MotionPattern) => void
  resetRobot: () => void
  setResetRobot: (fn: () => void) => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  tiltX: 0,
  tiltZ: 0,
  setTilt: (x, z) => set({ tiltX: x, tiltZ: z }),
  motionPattern: "uphill",
  setMotionPattern: (pattern) => set({ motionPattern: pattern }),
  resetRobot: () => {},
  setResetRobot: (fn) => set({ resetRobot: fn }),
}))
