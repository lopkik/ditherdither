import { useRef } from "react"
import examplePicture from "./assets/Michelangelo's_David_-_63_grijswaarden.png"

function App() {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const thresholdCanvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = () => {
    if (
      !imageRef.current ||
      !baseCanvasRef.current ||
      !thresholdCanvasRef.current
    )
      return
    baseCanvasRef.current.width = imageRef.current.width
    baseCanvasRef.current.height = imageRef.current.height
    thresholdCanvasRef.current.width = imageRef.current.width
    thresholdCanvasRef.current.height = imageRef.current.height

    let context = baseCanvasRef.current.getContext("2d")
    if (!context) return
    context.drawImage(imageRef.current, 0, 0)

    let imageData = context.getImageData(
      0,
      0,
      imageRef.current.width,
      imageRef.current.height
    )
    for (let i = 0; i < imageData.data.length; i += 4) {
      let r = imageData.data[i + 0]
      let g = imageData.data[i + 1]
      let b = imageData.data[i + 2]
      if ((r + g + b) / 3 > 127) {
        imageData.data[i + 0] = 255
        imageData.data[i + 1] = 255
        imageData.data[i + 2] = 255
        imageData.data[i + 3] = 255
      } else {
        imageData.data[i + 0] = 0
        imageData.data[i + 1] = 0
        imageData.data[i + 2] = 0
        imageData.data[i + 3] = 255
      }
    }
    thresholdCanvasRef.current.getContext("2d")?.putImageData(imageData, 0, 0)
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
