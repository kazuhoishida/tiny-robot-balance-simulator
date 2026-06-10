import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"
import { Suspense } from "react"
import { Camera } from "./Camera"
import { Disk } from "./Disk"
import { Ground } from "./Ground"
import { DebugHelpers } from "./DebugHelpers"
import { PedestalCollider } from "./PedestalCollider"
import { Figure } from "./Figure"
import { Lights } from "./Lights"

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
  }
  debug: boolean
}

function SimulationWorld({ params }: { params: SceneParams }) {
  return (
    <Suspense fallback={null}>
      <Physics gravity={[0, -9.81, 0]}>
        <Disk
          {...params.disk}
          robot={{ ...params.robot, showTrail: params.debug }}
        />
        <DebugHelpers diskRadius={params.disk.radius} diskThickness={params.disk.thickness} show={params.debug} />
        <PedestalCollider />
      </Physics>
    </Suspense>
  )
}

export function Scene({ params }: { params: SceneParams }) {
  return (
    <Canvas camera={{ position: [0, 4, 7], fov: 50 }} shadows style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={["#457983"]} />
      <Lights />
      <Camera />
      <SimulationWorld params={params} />
      <Ground />
      <Figure />
    </Canvas>
  )
}
