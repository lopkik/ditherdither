import React, { useRef, useState } from "react"

import examplePicture from "@assets/Michelangelo's_David_-_63_grijswaarden.png"

import FormattedCanvas from "@components/FormattedCanvas"
import QuantizeFactorRangeInput from "@components/QuantizeFactorRangeInput"
import { createSussyImageData } from "../utils"

const Home = () => {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const sussyCanvasRef = useRef<HTMLCanvasElement>(null)

  const [redQuantizeFactor, setRedQuantizeFactor] = useState(4)
  const [greenQuantizeFactor, setGreenQuantizeFactor] = useState(4)
  const [blueQuantizeFactor, setBlueQuantizeFactor] = useState(4)

  const onImageLoad = () => {
    const canvasRefs = [baseCanvasRef, sussyCanvasRef]
    if (!imageRef.current || !baseCanvasRef.current || !sussyCanvasRef.current)
      return
    canvasRefs.forEach((canvasRef) => {
      canvasRef.current!.width = imageRef.current!.width
      canvasRef.current!.height = imageRef.current!.height
    })

    let context = baseCanvasRef.current.getContext("2d")
    if (!context) return
    context.drawImage(imageRef.current, 0, 0)
    let imageData = context.getImageData(
      0,
      0,
      imageRef.current.width,
      imageRef.current.height
    )

    // Sussy dithering
    const sussyImageData = createSussyImageData(imageData, context, {
      redQuantizeFactor,
      greenQuantizeFactor,
      blueQuantizeFactor,
    })
    sussyCanvasRef.current.getContext("2d")?.putImageData(sussyImageData, 0, 0)
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

      const sussyImageData = createSussyImageData(imageData, context, {
        redQuantizeFactor,
        greenQuantizeFactor,
        blueQuantizeFactor,
      })
      sussyCanvasRef.current
        ?.getContext("2d")
        ?.putImageData(sussyImageData, 0, 0)
    } catch (error) {
      console.error(`Couldn't draw new sussy image data to canvas: ${error}`)
    }
  }, [redQuantizeFactor, greenQuantizeFactor, blueQuantizeFactor])

  return (
    <div style={{ padding: "1rem", display: "flex" }}>
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
        <FormattedCanvas title='Base Canvas' ref={baseCanvasRef} />
      </div>

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

export default Home
