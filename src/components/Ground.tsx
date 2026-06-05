import { Grid } from "@react-three/drei"
import { FLOOR_Y } from "./PedestalCollider"

const PILLAR_HEIGHT = Math.abs(FLOOR_Y) / 2 // 0.3 m
const PILLAR_CENTER_Y = -PILLAR_HEIGHT / 2 // -0.15 m

const PEDESTAL_THICKNESS = 0.35
const PEDESTAL_TOP_Y = -PILLAR_HEIGHT // -0.3 m
const PEDESTAL_CENTER_Y = PEDESTAL_TOP_Y - PEDESTAL_THICKNESS / 2 // -0.4 m
const PEDESTAL_RADIUS = 3.6

export const GROUND_Y = PEDESTAL_TOP_Y - PEDESTAL_THICKNESS // -0.5 m

export function Ground() {
  return (
    <>
      {/* Floor plate — outside pedestal, figure stands on this */}
      <mesh position={[0, GROUND_Y - 0.025, 0]} receiveShadow>
        <boxGeometry args={[40, 0.05, 40]} />
        <meshStandardMaterial color="#555555" roughness={0.9} metalness={0.05} />
      </mesh>

      <Grid position={[0, GROUND_Y + 0.001, 0]} args={[40, 40]} cellSize={0.5} cellThickness={0.5} cellColor="#6f6f6f" sectionSize={2} sectionThickness={1} sectionColor="#005d5d" fadeDistance={30} fadeStrength={1} infiniteGrid />

      {/* Pedestal */}
      <mesh position={[0, PEDESTAL_CENTER_Y, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[PEDESTAL_RADIUS * 0.96, PEDESTAL_RADIUS, PEDESTAL_THICKNESS, 128]} />
        <meshStandardMaterial color="#c3c3c3" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Central pivot pillar */}
      <mesh position={[0, PILLAR_CENTER_Y, 0]}>
        <cylinderGeometry args={[0.01, 0.04, PILLAR_HEIGHT, 12]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.7} roughness={0.3} />
      </mesh>
    </>
  )
}
