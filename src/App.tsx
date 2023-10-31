import { useRef } from "react"
import examplePicture from "./assets/Michelangelo's_David_-_63_grijswaarden.png"
import { createThresholdImageData } from "./utils"

function App() {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const thresholdCanvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = () => {
    const canvasRefs = [baseCanvasRef, thresholdCanvasRef]
    if (!imageRef.current || canvasRefs.some((canvasRef) => !canvasRef.current))
      return
    canvasRefs.forEach((canvasRef) => {
      canvasRef.current!.width = imageRef.current!.width
      canvasRef.current!.height = imageRef.current!.height
    })

    let context = baseCanvasRef.current!.getContext("2d")
    if (!context) return
    context.drawImage(imageRef.current, 0, 0)
    let imageData = context.getImageData(
      0,
      0,
      imageRef.current.width,
      imageRef.current.height
    )

    const thresholdImageData = createThresholdImageData(imageData, context)
    thresholdCanvasRef
      .current!.getContext("2d")
      ?.putImageData(thresholdImageData, 0, 0)
    console.log(imageData)
  }

  return (
    <div>
      <img ref={imageRef} src={examplePicture} onLoad={onImageLoad} />
      <canvas ref={baseCanvasRef} />
      <canvas ref={thresholdCanvasRef} />
    </div>
  )
}

export default App
