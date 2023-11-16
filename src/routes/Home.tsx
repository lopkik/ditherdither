import { useEffect, useRef, useState } from "react"

import examplePicture from "@assets/Michelangelo's_David_-_63_grijswaarden.png"

import FormattedCanvas from "@components/FormattedCanvas"
import QuantizeFactorRangeInput from "@components/QuantizeFactorRangeInput"
import { createSussyImageData } from "../utils"
import { PX_VALUE_OF_1REM } from "@/constants"

const Home = () => {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const sussyCanvasRef = useRef<HTMLCanvasElement>(null)
  const baseImageDataRef = useRef<ImageData | null>(null)
  const canvasContainerWidthRef = useRef<number | null>(null)

  const [redQuantizeFactor, setRedQuantizeFactor] = useState(4)
  const [greenQuantizeFactor, setGreenQuantizeFactor] = useState(4)
  const [blueQuantizeFactor, setBlueQuantizeFactor] = useState(4)

  const onImageLoad = () => {
    if (
      !imageRef.current ||
      !baseCanvasRef.current ||
      !sussyCanvasRef.current ||
      !canvasContainerWidthRef.current
    )
      return
    const canvasRefs = [baseCanvasRef, sussyCanvasRef]
    const maxScaleCanvas = Math.floor(
      canvasContainerWidthRef.current / imageRef.current.width
    )
    canvasRefs.forEach((canvasRef) => {
      canvasRef.current!.width = imageRef.current!.width * maxScaleCanvas
      canvasRef.current!.height = imageRef.current!.height * maxScaleCanvas
    })

    const context = baseCanvasRef.current.getContext("2d")
    if (!context) return
    context.drawImage(imageRef.current, 0, 0)
    let imageData = context.getImageData(
      0,
      0,
      imageRef.current.width,
      imageRef.current.height
    )
    baseImageDataRef.current = imageData
    context.scale(maxScaleCanvas, maxScaleCanvas)
    context.drawImage(imageRef.current, 0, 0)

    // Sussy dithering
    const sussyImageData = createSussyImageData(imageData, context, {
      redQuantizeFactor,
      greenQuantizeFactor,
      blueQuantizeFactor,
    })
    const sussyContext = sussyCanvasRef.current.getContext("2d")
    if (!sussyContext) return
    sussyContext.scale(maxScaleCanvas, maxScaleCanvas)
    createImageBitmap(sussyImageData).then((sussyImageBitMap) => {
      sussyContext.drawImage(sussyImageBitMap, 0, 0)
    })
  }

  const onQuantizeFactorChange = (
    newQuantizeFactorValue: number,
    quantizeFactorName:
      | "redQuantizeFactor"
      | "greenQuantizeFactor"
      | "blueQuantizeFactor"
  ) => {
    if (
      !imageRef.current ||
      !baseCanvasRef.current ||
      !baseImageDataRef.current ||
      !sussyCanvasRef.current
    )
      return
    let context = baseCanvasRef.current!.getContext("2d")
    if (!context) return

    try {
      const sussyImageData = createSussyImageData(
        baseImageDataRef.current,
        context,
        {
          redQuantizeFactor:
            quantizeFactorName === "redQuantizeFactor"
              ? newQuantizeFactorValue
              : redQuantizeFactor,
          greenQuantizeFactor:
            quantizeFactorName === "greenQuantizeFactor"
              ? newQuantizeFactorValue
              : greenQuantizeFactor,
          blueQuantizeFactor:
            quantizeFactorName === "blueQuantizeFactor"
              ? newQuantizeFactorValue
              : blueQuantizeFactor,
        }
      )
      const sussyContext = sussyCanvasRef.current.getContext("2d")
      if (!sussyContext) return
      createImageBitmap(sussyImageData).then((sussyImageBitMap) => {
        sussyContext.drawImage(sussyImageBitMap, 0, 0)
      })

      switch (quantizeFactorName) {
        case "redQuantizeFactor":
          setRedQuantizeFactor(newQuantizeFactorValue)
          break
        case "blueQuantizeFactor":
          setBlueQuantizeFactor(newQuantizeFactorValue)
          break
        case "greenQuantizeFactor":
          setGreenQuantizeFactor(newQuantizeFactorValue)
          break
        default:
          console.error(`Invalid quantizeFactorName: ${quantizeFactorName}`)
      }
    } catch (error) {
      console.error(`Couldn't draw new sussy image data to canvas: ${error}`)
    }
  }

  useEffect(() => {
    // calculate 1/3 of main div width to find width of canvasContainer
    canvasContainerWidthRef.current = Math.floor(
      (window.innerWidth - 2 * PX_VALUE_OF_1REM) / 3
    )

    // TODO: make window.onresize to make canvas kinda responsive maybe
  }, [])

  return (
    <main style={{ padding: "1rem" }}>
      <img
        ref={imageRef}
        src={examplePicture}
        onLoad={onImageLoad}
        style={{ display: "none" }}
      />
      <div>
        <input
          type='file'
          accept='image/*'
          name='picture'
          id='picture'
          onChange={(event) => {
            if (!imageRef.current || !imageRef.current.src) return
            imageRef.current.src = URL.createObjectURL(event.target.files![0])
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div>
          <FormattedCanvas title='Base Canvas' ref={baseCanvasRef} />
        </div>

        <div>
          <FormattedCanvas title='Sussy dithering' ref={sussyCanvasRef} />
        </div>

        <div>
          <p>image controls</p>
          <QuantizeFactorRangeInput
            name='Red Quantize Factor'
            quantizeFactor={redQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "redQuantizeFactor")
            }}
          />
          <QuantizeFactorRangeInput
            name='Green Quantize Factor'
            quantizeFactor={greenQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "greenQuantizeFactor")
            }}
          />
          <QuantizeFactorRangeInput
            name='Blue Quantize Factor'
            quantizeFactor={blueQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "blueQuantizeFactor")
            }}
          />
        </div>
      </div>
    </main>
  )
}

export default Home
