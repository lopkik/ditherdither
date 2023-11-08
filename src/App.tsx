import React, { useRef, useState } from "react"
import examplePicture from "./assets/Michelangelo's_David_-_63_grijswaarden.png"
import {
  createOrderedBayerImageData,
  createRandomThresholdImageData,
  createSussyImageData,
  createThresholdImageData,
} from "./utils"
import FormattedCanvas from "./components/FormattedCanvas"
import QuantizeFactorRangeInput from "./components/QuantizeFactorRangeInput"

function App() {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const thresholdCanvasRef = useRef<HTMLCanvasElement>(null)
  const randomCanvasRef = useRef<HTMLCanvasElement>(null)
  // const bayerDim1CanvasRef = useRef<HTMLCanvasElement>(null)
  // const bayerDim2CanvasRef = useRef<HTMLCanvasElement>(null)
  // const bayerDim3CanvasRef = useRef<HTMLCanvasElement>(null)
  // const bayerDim4CanvasRef = useRef<HTMLCanvasElement>(null)
  const sussyCanvasRef = useRef<HTMLCanvasElement>(null)

  const [redQuantizeFactor, setRedQuantizeFactor] = useState(4)
  const [greenQuantizeFactor, setGreenQuantizeFactor] = useState(4)
  const [blueQuantizeFactor, setBlueQuantizeFactor] = useState(4)

  const onImageLoad = () => {
    const canvasRefs = [
      baseCanvasRef,
      thresholdCanvasRef,
      randomCanvasRef,
      // bayerDim1CanvasRef,
      // bayerDim2CanvasRef,
      // bayerDim3CanvasRef,
      // bayerDim4CanvasRef,
      sussyCanvasRef,
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
    // const bayerDim1ImageData = createOrderedBayerImageData(
    //   imageData,
    //   context,
    //   0
    // )
    // bayerDim1CanvasRef
    //   .current!.getContext("2d")
    //   ?.putImageData(bayerDim1ImageData, 0, 0)
    // const bayerDim2ImageData = createOrderedBayerImageData(
    //   imageData,
    //   context,
    //   1
    // )
    // bayerDim2CanvasRef
    //   .current!.getContext("2d")
    //   ?.putImageData(bayerDim2ImageData, 0, 0)
    // const bayerDim3ImageData = createOrderedBayerImageData(
    //   imageData,
    //   context,
    //   2
    // )
    // bayerDim3CanvasRef
    //   .current!.getContext("2d")
    //   ?.putImageData(bayerDim3ImageData, 0, 0)
    // const bayerDim4ImageData = createOrderedBayerImageData(
    //   imageData,
    //   context,
    //   3
    // )
    // bayerDim4CanvasRef.current
    //   ?.getContext("2d")
    //   ?.putImageData(bayerDim4ImageData, 0, 0)

    // Sussy dithering
    const sussyImageData = createSussyImageData(
      imageData,
      context,
      redQuantizeFactor,
      greenQuantizeFactor,
      blueQuantizeFactor
    )
    sussyCanvasRef.current?.getContext("2d")?.putImageData(sussyImageData, 0, 0)
  }

  React.useEffect(() => {
    if (!imageRef.current || !baseCanvasRef.current) return
    let context = baseCanvasRef.current!.getContext("2d")
    if (!context) return
    context.drawImage(imageRef.current, 0, 0)
    try {
      let imageData = context.getImageData(
        0,
        0,
        imageRef.current.width,
        imageRef.current.height
      )

      const sussyImageData = createSussyImageData(
        imageData,
        context,
        redQuantizeFactor,
        greenQuantizeFactor,
        blueQuantizeFactor
      )
      sussyCanvasRef.current
        ?.getContext("2d")
        ?.putImageData(sussyImageData, 0, 0)
    } catch (error) {
      console.error(`Couldn't draw new sussy image data to canvas: ${error}`)
    }
  }, [redQuantizeFactor, greenQuantizeFactor, blueQuantizeFactor])

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

      {/* <p>Ordered dithering</p>
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
      <hr /> */}

      <p>Sussy(?) dithering</p>
      <div style={{ display: "flex" }}>
        <FormattedCanvas title='Sussy dithering' ref={sussyCanvasRef} />
        <div>
          <p>image controls</p>
          <QuantizeFactorRangeInput
            name='Red Quantize Factor'
            quantizeFactor={redQuantizeFactor}
            setQuantizeFactor={setRedQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Green Quantize Factor'
            quantizeFactor={greenQuantizeFactor}
            setQuantizeFactor={setGreenQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Blue Quantize Factor'
            quantizeFactor={blueQuantizeFactor}
            setQuantizeFactor={setBlueQuantizeFactor}
          />
        </div>
      </div>
    </div>
  )
}

export default App
