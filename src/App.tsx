import { useControls } from "leva"
import { useState, useEffect } from "react"
import { Scene, RobotConfig } from "./components/Scene"
import { UI } from "./components/UI"
import { useSimulationStore, MotionPattern } from "./stores/simulationStore"

const MOTION_PATTERNS: Record<string, MotionPattern> = {
  傾き上方向: "uphill",
  ホッピング: "hopping",
}

function randomRobot(diskRadiusM: number): RobotConfig {
  const angle = Math.random() * Math.PI * 2
  const r = Math.random() * diskRadiusM * 0.7
  return {
    id: `robot-${Date.now()}-${Math.random()}`,
    initX: Math.cos(angle) * r,
    initZ: Math.sin(angle) * r,
  }
}

export function App() {
  const setMotionPattern = useSimulationStore((s) => s.setMotionPattern)
  const resetAllRobots = useSimulationStore((s) => s.resetAllRobots)

  const diskParams = useControls("円盤 (CFRP)", {
    radius: { value: 2800, min: 500, max: 8000, step: 100, label: "半径 (mm)" },
    thickness: { value: 5, min: 1, max: 300, step: 1, label: "厚み (mm)" },
    density: { value: 1400, min: 1000, max: 1700, step: 10, label: "密度 (kg/m³)" },
    pivotDamping: { value: 1.1, min: 0, max: 10, step: 0.1, label: "支点摩擦" },
    friction: { value: 0.8, min: 0, max: 1, step: 0.05, label: "摩擦" },
  })

  const robotConfig = useControls("ロボット", {
    radius: 50,
    mass: { value: 50, min: 1, max: 2000, step: 1, label: "質量 (g)" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1, label: "移動速度" },
    motionPattern: {
      value: "傾き上方向",
      options: Object.keys(MOTION_PATTERNS),
      label: "移動パターン",
    },
  })

  const noiseConfig = useControls("ノイズ", {
    enabled: { value: false, label: "ノイズ" },
    intensity: { value: 0.02, min: 0, max: 0.5, step: 0.005, label: "強度" },
  })

  const [debug, setDebug] = useState(false)
  const [robots, setRobots] = useState<RobotConfig[]>([{ id: "robot-initial", initX: 1, initZ: 0 }])

  const diskRadiusM = diskParams.radius / 1000
  const diskThicknessM = diskParams.thickness / 1000
  const diskMass = diskParams.density * Math.PI * diskRadiusM ** 2 * diskThicknessM

  useEffect(() => {
    const pattern = MOTION_PATTERNS[robotConfig.motionPattern]
    if (pattern) setMotionPattern(pattern)
  }, [robotConfig.motionPattern, setMotionPattern])

  const params = {
    disk: {
      radius: diskRadiusM,
      thickness: diskThicknessM,
      mass: diskMass,
      friction: diskParams.friction,
      pivotDamping: diskParams.pivotDamping,
    },
    robot: {
      radius: 0.04,
      mass: robotConfig.mass / 1000,
      speed: robotConfig.speed,
      noise: noiseConfig.enabled ? noiseConfig.intensity : 0,
    },
    robots,
    debug,
  }

  return (
    <div className="app">
      <Scene params={params} />
      <UI debug={debug} onToggleDebug={() => setDebug((v) => !v)} onAddRobot={() => setRobots((prev) => [...prev, randomRobot(diskRadiusM)])} onRestart={resetAllRobots} />
    </div>
  )
}
