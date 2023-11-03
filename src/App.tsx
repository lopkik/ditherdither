import { useRef } from "react"
import examplePicture from "./assets/Michelangelo's_David_-_63_grijswaarden.png"
import {
  createOrderedBayerImageData,
  createRandomThresholdImageData,
  createThresholdImageData,
} from "./utils"
import FormattedCanvas from "./components/FormattedCanvas"

function App() {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const thresholdCanvasRef = useRef<HTMLCanvasElement>(null)
  const randomCanvasRef = useRef<HTMLCanvasElement>(null)
  const bayerDim1CanvasRef = useRef<HTMLCanvasElement>(null)
  const bayerDim2CanvasRef = useRef<HTMLCanvasElement>(null)
  const bayerDim3CanvasRef = useRef<HTMLCanvasElement>(null)
  const bayerDim4CanvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = () => {
    const canvasRefs = [
      baseCanvasRef,
      thresholdCanvasRef,
      randomCanvasRef,
      bayerDim1CanvasRef,
      bayerDim2CanvasRef,
      bayerDim3CanvasRef,
      bayerDim4CanvasRef,
    ]
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

    const randomThresholdImageData = createRandomThresholdImageData(
      imageData,
      context
    )
    randomCanvasRef
      .current!.getContext("2d")
      ?.putImageData(randomThresholdImageData, 0, 0)

    // ORDERED (BAYER)
    const bayerDim1ImageData = createOrderedBayerImageData(
      imageData,
      context,
      0
    )
    bayerDim1CanvasRef
      .current!.getContext("2d")
      ?.putImageData(bayerDim1ImageData, 0, 0)
    const bayerDim2ImageData = createOrderedBayerImageData(
      imageData,
      context,
      1
    )
    bayerDim2CanvasRef
      .current!.getContext("2d")
      ?.putImageData(bayerDim2ImageData, 0, 0)
    const bayerDim3ImageData = createOrderedBayerImageData(
      imageData,
      context,
      2
    )
    bayerDim3CanvasRef
      .current!.getContext("2d")
      ?.putImageData(bayerDim3ImageData, 0, 0)
    const bayerDim4ImageData = createOrderedBayerImageData(
      imageData,
      context,
      3
    )
    bayerDim4CanvasRef.current
      ?.getContext("2d")
      ?.putImageData(bayerDim4ImageData, 0, 0)
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div>
        <p>Original</p>
        <img ref={imageRef} src={examplePicture} onLoad={onImageLoad} />
      </div>
      <hr />
      <FormattedCanvas title='Base Canvas' ref={baseCanvasRef} />
      <FormattedCanvas title='Set threshold' ref={thresholdCanvasRef} />
      <FormattedCanvas title='Random threshold' ref={randomCanvasRef} />
      <hr />
      <p>Ordered dithering</p>
      <FormattedCanvas
        title='2**1 dimension bayer matrix'
        ref={bayerDim1CanvasRef}
      />
      <FormattedCanvas
        title='2**2 dimension bayer matrix'
        ref={bayerDim2CanvasRef}
      />
      <FormattedCanvas
        title='2**3 dimension bayer matrix'
        ref={bayerDim3CanvasRef}
      />
      <FormattedCanvas
        title='2**4 dimension bayer matrix'
        ref={bayerDim4CanvasRef}
      />
    </div>
  )
}

export default App
