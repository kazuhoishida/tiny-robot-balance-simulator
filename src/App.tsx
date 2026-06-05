import { useControls } from "leva"
import { useState, useEffect } from "react"
import { Scene, RobotConfig } from "./components/Scene"
import { useSimulationStore, MotionPattern } from "./stores/simulationStore"
import { radToDeg } from "./utils/math"

const MOTION_PATTERNS: Record<string, MotionPattern> = {
  傾き上方向: "uphill",
  ホッピング: "hopping",
}

const ROBOT_RADIUS = 0.04

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
  const tiltX = useSimulationStore((s) => s.tiltX)
  const tiltZ = useSimulationStore((s) => s.tiltZ)

  const diskParams = useControls("円盤 (CFRP)", {
    radius: { value: 2800, min: 500, max: 8000, step: 100, label: "半径 (mm)" },
    thickness: { value: 5, min: 1, max: 300, step: 1, label: "厚み (mm)" },
    density: { value: 1400, min: 1000, max: 1700, step: 10, label: "密度 (kg/m³)" },
    pivotDamping: { value: 1.1, min: 0, max: 10, step: 0.1, label: "支点摩擦" },
    friction: { value: 0.8, min: 0, max: 1, step: 0.05, label: "摩擦" },
  })

  const robotConfig = useControls("ロボット", {
    mass: { value: 50, min: 1, max: 2000, step: 1, label: "質量 (g)" },
    speed: { value: 1, min: 0.1, max: 5, step: 0.1, label: "移動速度" },
    motionPattern: {
      value: "傾き上方向",
      options: Object.keys(MOTION_PATTERNS),
      label: "移動パターン",
    },
  })

  const [debug, setDebug] = useState(false)

  const noiseConfig = useControls("ノイズ", {
    enabled: { value: false, label: "ノイズ" },
    intensity: { value: 0.02, min: 0, max: 0.5, step: 0.005, label: "強度" },
  })

  const diskRadiusM = diskParams.radius / 1000
  const diskThicknessM = diskParams.thickness / 1000
  const diskMass = diskParams.density * Math.PI * diskRadiusM ** 2 * diskThicknessM

  const [robots, setRobots] = useState<RobotConfig[]>([{ id: "robot-initial", initX: 1, initZ: 0 }])

  useEffect(() => {
    const pattern = MOTION_PATTERNS[robotConfig.motionPattern]
    if (pattern) setMotionPattern(pattern)
  }, [robotConfig.motionPattern, setMotionPattern])

  const addRobot = () => setRobots((prev) => [...prev, randomRobot(diskRadiusM)])

  const btnStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.6)",
    color: "#ffffff",
    fontFamily: "monospace",
    fontSize: 13,
    padding: "8px 20px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    letterSpacing: "0.05em",
  }

  const params = {
    disk: {
      radius: diskRadiusM,
      thickness: diskThicknessM,
      mass: diskMass,
      friction: diskParams.friction,
      pivotDamping: diskParams.pivotDamping,
    },
    robot: {
      radius: ROBOT_RADIUS,
      mass: robotConfig.mass / 1000,
      speed: robotConfig.speed,
      noise: noiseConfig.enabled ? noiseConfig.intensity : 0,
    },
    robots,
    debug,
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Scene params={params} />

      {/* Top center buttons */}
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        <button style={btnStyle} onClick={addRobot}>
          + ロボット追加
        </button>
        <button style={{ ...btnStyle, border: "1px solid rgba(255,100,100,0.4)" }} onClick={resetAllRobots}>
          RESTART
        </button>
        <button
          style={{ ...btnStyle, border: debug ? "1px solid rgba(0,255,136,0.6)" : "1px solid rgba(255,255,255,0.25)", color: debug ? "#00ff88" : "#ffffff" }}
          onClick={() => setDebug((v) => !v)}
        >
          DEBUG
        </button>
      </div>

      {/* Bottom-left info */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "rgba(0,0,0,0.6)",
          color: "#00ff88",
          fontFamily: "monospace",
          fontSize: 13,
          padding: "8px 12px",
          borderRadius: 6,
          lineHeight: 1.8,
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(0,255,136,0.2)",
        }}
      >
        <div style={{ color: "#aaa", fontSize: 11, marginBottom: 2 }}>傾き角度</div>
        <div>X: {radToDeg(tiltX).toFixed(2)}°</div>
        <div>Z: {radToDeg(tiltZ).toFixed(2)}°</div>
        {/* <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 6, paddingTop: 6, color: "#aaa", fontSize: 11 }}>
          円盤質量: {diskMass.toFixed(1)} kg　ロボット: {robots.length}体
        </div> */}
      </div>
    </div>
  )
}
