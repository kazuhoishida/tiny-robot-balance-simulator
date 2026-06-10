import { useSimulationStore } from "../stores/simulationStore"
import { radToDeg } from "../utils/math"

interface Props {
  debug: boolean
  onToggleDebug: () => void
  onRestart: () => void
}

export function UI({ debug, onToggleDebug, onRestart }: Props) {
  const tiltX = useSimulationStore((s) => s.tiltX)
  const tiltZ = useSimulationStore((s) => s.tiltZ)

  return (
    <>
      <div className="ui-buttons">
        <button className="ui-btn ui-btn--restart" onClick={onRestart}>
          RESTART
        </button>
        {/* <button className={`ui-btn ui-btn--debug${debug ? ' active' : ''}`} onClick={onToggleDebug}>
          DEBUG
        </button> */}
      </div>

      <div className="ui-tilt">
        <div className="ui-tilt__label">傾き角度</div>
        <div>X: {radToDeg(tiltX).toFixed(2)}°</div>
        <div>Z: {radToDeg(tiltZ).toFixed(2)}°</div>
      </div>
    </>
  )
}
