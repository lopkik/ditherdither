import FormattedCanvas from "@/components/FormattedCanvas"
import {
  createRandomThresholdImageData,
  createThresholdImageData,
} from "@/utils"

import examplePicture from "@assets/Michelangelo's_David_-_63_grijswaarden.png"

import { useRef } from "react"

const WikiExamples = () => {
  const imageRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const thresholdCanvasRef = useRef<HTMLCanvasElement>(null)
  const randomCanvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = () => {
    const canvasRefs = [baseCanvasRef, thresholdCanvasRef, randomCanvasRef]
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
    </div>
  )
}

export default WikiExamples
