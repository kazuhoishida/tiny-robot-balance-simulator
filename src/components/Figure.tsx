import { useGLTF } from "@react-three/drei"
import { useMemo } from "react"
import { Mesh } from "three"
import { GROUND_Y } from "./Ground"

export function Figure() {
  const { scene } = useGLTF("/figure/rp_posed_00178_29.glb")

  useMemo(() => {
    scene.traverse((child) => (child.castShadow = child instanceof Mesh))
  }, [scene])

  return <primitive object={scene} position={[-1.5, GROUND_Y, 4]} scale={10} rotation={[0, Math.PI * 0.8, 0]} />
}

useGLTF.preload("/figure/rp_posed_00178_29.glb")
