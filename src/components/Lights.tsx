export function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 15, -8]} intensity={0.7} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-5, 5, 5]} intensity={0.3} color="#ffffff" />
    </>
  )
}
