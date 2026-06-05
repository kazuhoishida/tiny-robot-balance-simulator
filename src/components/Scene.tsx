import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"
import { Suspense } from "react"
import { Camera } from "./Camera"
import { Disk } from "./Disk"
import { Robot } from "./Robot"
import { Ground } from "./Ground"
import { DebugHelpers } from "./DebugHelpers"
import { PhysicsFloor } from "./PhysicsFloor"
import { Figure } from "./Figure"

export interface RobotConfig {
  id: string
  initX: number
  initZ: number
}

interface SceneParams {
  disk: {
    radius: number
    thickness: number
    mass: number
    friction: number
    pivotDamping: number
  }
  robot: {
    radius: number
    mass: number
    speed: number
    noise: number
  }
  robots: RobotConfig[]
  debug: boolean
}

interface Props {
  params: SceneParams
}

export function Scene({ params }: Props) {
  return (
    <Canvas camera={{ position: [0, 4, 7], fov: 50 }} shadows style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={["#457983"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 15, -8]} intensity={0.7} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#ffffff" />

      <Camera />

      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          <Disk radius={params.disk.radius} thickness={params.disk.thickness} mass={params.disk.mass} friction={params.disk.friction} pivotDamping={params.disk.pivotDamping} />
          {params.robots.map((r) => (
            <Robot key={r.id} id={r.id} initX={r.initX} initZ={r.initZ} radius={params.robot.radius} mass={params.robot.mass} speed={params.robot.speed} noise={params.robot.noise} friction={params.disk.friction} showTrail={params.debug} />
          ))}
          <DebugHelpers diskRadius={params.disk.radius} diskThickness={params.disk.thickness} show={params.debug} />
          <PhysicsFloor />
        </Physics>
      </Suspense>

      <Ground />
      <Figure />
    </Canvas>
  )
}
