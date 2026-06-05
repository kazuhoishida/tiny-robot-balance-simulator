import { useControls } from "leva"
import { Scene } from "./components/Scene"
import { useSimulationStore, MotionPattern } from "./stores/simulationStore"
import { radToDeg } from "./utils/math"
import { useEffect } from "react"

const MOTION_PATTERNS: Record<string, MotionPattern> = {
  傾き上方向: "uphill",
  ホッピング: "hopping",
  円運動: "circle",
  左右往復: "leftRight",
  "8の字": "figure8",
  ランダム: "randomWalk",
}

export function App() {
  const setMotionPattern = useSimulationStore((s) => s.setMotionPattern)
  const tiltX = useSimulationStore((s) => s.tiltX)
  const tiltZ = useSimulationStore((s) => s.tiltZ)

  const diskParams = useControls("円盤 (CFRP)", {
    radius: { value: 3000, min: 500, max: 8000, step: 100, label: "半径 (mm)" },
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

  const { debug } = useControls("表示", {
    debug: { value: false, label: "デバッグ表示" },
  })

  useEffect(() => {
    const pattern = MOTION_PATTERNS[robotConfig.motionPattern]
    if (pattern) setMotionPattern(pattern)
  }, [robotConfig.motionPattern, setMotionPattern])

  const diskRadiusM = diskParams.radius / 1000
  const diskThicknessM = diskParams.thickness / 1000
  const diskMass = diskParams.density * Math.PI * diskRadiusM ** 2 * diskThicknessM

  const params = {
    disk: {
      radius: diskRadiusM,
      thickness: diskThicknessM,
      mass: diskMass,
      friction: diskParams.friction,
      pivotDamping: diskParams.pivotDamping,
    },
    robot: {
      radius: 0.05,
      mass: robotConfig.mass / 1000,
      speed: robotConfig.speed,
    },
    debug,
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Scene params={params} />

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
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 6, paddingTop: 6, color: "#aaa", fontSize: 11 }}>円盤質量: {diskMass.toFixed(1)} kg</div>
      </div>
    </div>
  )
}
