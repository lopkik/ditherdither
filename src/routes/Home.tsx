import { useEffect, useRef, useState } from "react"

import examplePicture from "@assets/Michelangelo's_David_-_63_grijswaarden.png"

import FormattedCanvas from "@components/FormattedCanvas"
import QuantizeFactorRangeInput from "@components/QuantizeFactorRangeInput"
import { createSussyImageData, drawToSussyCanvas } from "../utils"
import { PX_VALUE_OF_1REM } from "@/constants"

const Home = () => {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const sussyCanvasRef = useRef<HTMLCanvasElement>(null)
  const baseImageDataRef = useRef<ImageData | null>(null)
  const canvasContainerWidthRef = useRef<number | null>(null)

  const [usingAllQuantizeFactor, setUsingAllQuantizeFactor] = useState(false)
  const [allQuantizeFactor, setAllQuantizeFactor] = useState(5)
  const [redQuantizeFactor, setRedQuantizeFactor] = useState(5)
  const [greenQuantizeFactor, setGreenQuantizeFactor] = useState(8)
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
    quantizeFactorName: QuantizeFactorNames
  ) => {
    if (
      !baseCanvasRef.current ||
      !baseImageDataRef.current ||
      !sussyCanvasRef.current
    )
      return

    drawToSussyCanvas(
      baseCanvasRef.current,
      baseImageDataRef.current,
      sussyCanvasRef.current,
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
  }

  const onAllQuantizeFactorChange = (newQuantizeFactorValue: number) => {
    if (
      !baseCanvasRef.current ||
      !baseImageDataRef.current ||
      !sussyCanvasRef.current
    )
      return
    drawToSussyCanvas(
      baseCanvasRef.current,
      baseImageDataRef.current,
      sussyCanvasRef.current,
      {
        redQuantizeFactor: newQuantizeFactorValue,
        greenQuantizeFactor: newQuantizeFactorValue,
        blueQuantizeFactor: newQuantizeFactorValue,
      }
    )

    setAllQuantizeFactor(newQuantizeFactorValue)
  }

  const randomizeQuantizeFactors = () => {
    let randomAllQuantizeFactor
    let randomRedQuantizeFactor
    let randomGreenQuantizeFactor
    let randomBlueQuantizeFactor
    if (usingAllQuantizeFactor) {
      randomAllQuantizeFactor = Math.round(Math.random() * 255)
      setAllQuantizeFactor(randomAllQuantizeFactor)
    } else {
      randomRedQuantizeFactor = Math.round(Math.random() * 255)
      randomGreenQuantizeFactor = Math.round(Math.random() * 255)
      randomBlueQuantizeFactor = Math.round(Math.random() * 255)
      setRedQuantizeFactor(randomRedQuantizeFactor)
      setGreenQuantizeFactor(randomGreenQuantizeFactor)
      setBlueQuantizeFactor(randomBlueQuantizeFactor)
    }

    if (
      !baseCanvasRef.current ||
      !baseImageDataRef.current ||
      !sussyCanvasRef.current
    )
      return
    drawToSussyCanvas(
      baseCanvasRef.current,
      baseImageDataRef.current,
      sussyCanvasRef.current,
      {
        redQuantizeFactor: randomAllQuantizeFactor ?? randomRedQuantizeFactor,
        greenQuantizeFactor:
          randomAllQuantizeFactor ?? randomGreenQuantizeFactor,
        blueQuantizeFactor: randomAllQuantizeFactor ?? randomBlueQuantizeFactor,
      }
    )
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 0rem",
            }}
          >
            <div>
              <input
                type='checkbox'
                name='using_all_quantize_factor'
                id='using_all_quantize_factor'
                value={usingAllQuantizeFactor + ""}
                onChange={() => {
                  setUsingAllQuantizeFactor((prev) => {
                    if (!prev) {
                      // switched to using all quantize factor
                      drawToSussyCanvas(
                        baseCanvasRef.current,
                        baseImageDataRef.current,
                        sussyCanvasRef.current,
                        {
                          redQuantizeFactor: allQuantizeFactor,
                          greenQuantizeFactor: allQuantizeFactor,
                          blueQuantizeFactor: allQuantizeFactor,
                        }
                      )
                    } else {
                      // switched to using red green and blue separately
                      drawToSussyCanvas(
                        baseCanvasRef.current,
                        baseImageDataRef.current,
                        sussyCanvasRef.current,
                        {
                          redQuantizeFactor,
                          greenQuantizeFactor,
                          blueQuantizeFactor,
                        }
                      )
                    }
                    return !prev
                  })
                }}
              />
              <label htmlFor='using_all_quantize_factor'>
                All Quantize Factor Enabled
              </label>
            </div>
            <div>
              <button onClick={randomizeQuantizeFactors}>
                Randomize Values
              </button>
            </div>
          </div>
          <QuantizeFactorRangeInput
            name='All Quantize Factor'
            quantizeFactor={allQuantizeFactor}
            onChange={(event) => {
              onAllQuantizeFactorChange(+event.target.value)
            }}
            disabled={!usingAllQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Red Quantize Factor'
            quantizeFactor={redQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "redQuantizeFactor")
            }}
            disabled={usingAllQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Green Quantize Factor'
            quantizeFactor={greenQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "greenQuantizeFactor")
            }}
            disabled={usingAllQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Blue Quantize Factor'
            quantizeFactor={blueQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "blueQuantizeFactor")
            }}
            disabled={usingAllQuantizeFactor}
          />
        </div>
      </div>
    </main>
  )
}

export default Home
