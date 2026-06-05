import { Line, Text } from '@react-three/drei'
import { useSimulationStore } from '../stores/simulationStore'
import { radToDeg } from '../utils/math'

interface Props {
  diskRadius: number
  diskThickness: number
  show: boolean
}

export function DebugHelpers({ diskRadius, diskThickness, show }: Props) {
  const tiltX = useSimulationStore((s) => s.tiltX)
  const tiltZ = useSimulationStore((s) => s.tiltZ)

  if (!show) return null

  const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltZ * tiltZ)
  const arrowLength = tiltMagnitude * diskRadius * 2

  return (
    <group>
      {/* Vertical center line */}
      <Line
        points={[[0, -diskThickness / 2, 0], [0, diskRadius, 0]]}
        color="#00ff88"
        lineWidth={1}
        dashed
      />
      {/* Tilt direction arrow */}
      {tiltMagnitude > 0.01 && (
        <Line
          points={[[0, diskThickness / 2, 0], [-tiltZ * arrowLength, diskThickness / 2, tiltX * arrowLength]]}
          color="#ff8800"
          lineWidth={2}
        />
      )}
      {/* Disk edge circle */}
      <Line
        points={Array.from({ length: 65 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2
          return [Math.cos(a) * diskRadius, diskThickness / 2 + 0.01, Math.sin(a) * diskRadius] as [number, number, number]
        })}
        color="#ffffff"
        lineWidth={0.5}
        opacity={0.3}
        transparent
      />
      {/* Tilt angle label */}
      <Text
        position={[-diskRadius - 0.3, 0.5, 0]}
        fontSize={0.12}
        color="#00ff88"
        anchorX="right"
      >
        {`X: ${radToDeg(tiltX).toFixed(1)}°\nZ: ${radToDeg(tiltZ).toFixed(1)}°`}
      </Text>
    </group>
  )
}
