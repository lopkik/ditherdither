import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import * as React from "react"

import examplePicture from "@assets/Michelangelo's_David_-_63_grijswaarden.png"
import { drawToSussyCanvas } from "@/utils"
import { PX_VALUE_OF_1REM } from "@/constants"

// Original PanZoom Canvas code from here: https://codesandbox.io/p/sandbox/react-typescript-zoom-pan-html-canvas-p3itj
interface CanvasProps {
  usingAllQuantizeFactor: boolean
  allQuantizeFactor: number
  redQuantizeFactor: number
  greenQuantizeFactor: number
  blueQuantizeFactor: number
}

type Point = {
  x: number
  y: number
}

const ORIGIN = Object.freeze({ x: 0, y: 0 })
const CANVAS_HEIGHT = 500

// adjust to device to avoid blur
const { devicePixelRatio: ratio = 1 } = window

function diffPoints(p1: Point, p2: Point) {
  return { x: p1.x - p2.x, y: p1.y - p2.y }
}

function addPoints(p1: Point, p2: Point) {
  return { x: p1.x + p2.x, y: p1.y + p2.y }
}

function scalePoint(p1: Point, scale: number) {
  return { x: p1.x / scale, y: p1.y / scale }
}

const ZOOM_SENSITIVITY = 500 // bigger for lower zoom per scroll

export default function PanZoomCanvas(props: CanvasProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sussyCanvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [sussyContext, setSussyContext] =
    useState<CanvasRenderingContext2D | null>(null)
  const [scale, setScale] = useState<number>(1)
  const [offset, setOffset] = useState<Point>(ORIGIN)
  const [mousePos, setMousePos] = useState<Point>(ORIGIN)
  const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN)
  const isResetRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<Point>(ORIGIN)
  const lastOffsetRef = useRef<Point>(ORIGIN)

  const baseImageData = useRef<ImageData | null>(null)
  const canvasContainerWidthRef = useRef<number | null>(null)

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset
  }, [offset])

  // reset
  const reset = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (context && !isResetRef.current) {
        // adjust for device pixel density
        context.canvas.width = canvasContainerWidthRef.current! * ratio
        context.canvas.height = CANVAS_HEIGHT * ratio
        context.scale(ratio, ratio)

        setScale(1)

        // reset state and refs
        setOffset(ORIGIN)
        setMousePos(ORIGIN)
        setViewportTopLeft(ORIGIN)
        lastOffsetRef.current = ORIGIN
        lastMousePosRef.current = ORIGIN

        // this thing is so multiple resets in a row don't clear canvas
        isResetRef.current = true
      }
    },
    [canvasContainerWidthRef.current]
  )

  // functions for panning
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      if (context && sussyContext) {
        const lastMousePos = lastMousePosRef.current
        const currentMousePos = { x: event.pageX, y: event.pageY } // use document so can pan off element
        lastMousePosRef.current = currentMousePos

        const mouseDiff = diffPoints(currentMousePos, lastMousePos)
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))
      }
    },
    [context, sussyContext]
  )

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove)
    document.removeEventListener("mouseup", mouseUp)
  }, [mouseMove])

  const startPan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      document.addEventListener("mousemove", mouseMove)
      document.addEventListener("mouseup", mouseUp)
      lastMousePosRef.current = { x: event.pageX, y: event.pageY }
    },
    [mouseMove, mouseUp]
  )

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current && sussyCanvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d")
      const sussyRenderCtx = sussyCanvasRef.current.getContext("2d")
      if (renderCtx && sussyRenderCtx) {
        setContext(renderCtx)
        reset(renderCtx)

        setSussyContext(sussyRenderCtx)
        reset(sussyRenderCtx)
      }
    }
  }, [reset, canvasContainerWidthRef.current])

  // pan when offset or scale changes
  useLayoutEffect(() => {
    if (context && sussyContext && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      )
      context.translate(offsetDiff.x, offsetDiff.y)
      sussyContext.translate(offsetDiff.x, offsetDiff.y)
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff))
      isResetRef.current = false
    }
  }, [context, sussyContext, offset, scale])

  // draw
  useLayoutEffect(() => {
    if (context && sussyContext && imageRef.current && baseImageData.current) {
      // clear canvas but maintain transform
      const storedTransform = context.getTransform()
      context.canvas.width = context.canvas.width
      sussyContext.canvas.width = sussyContext.canvas.width
      context.setTransform(storedTransform)
      sussyContext.setTransform(storedTransform)

      context.drawImage(imageRef.current, 0, 0)

      drawToSussyCanvas(
        canvasRef.current,
        baseImageData.current,
        sussyCanvasRef.current,
        props.usingAllQuantizeFactor,
        props.allQuantizeFactor,
        props.redQuantizeFactor,
        props.greenQuantizeFactor,
        props.blueQuantizeFactor
      )
    }
  }, [
    canvasContainerWidthRef.current,
    context,
    sussyContext,
    scale,
    offset,
    viewportTopLeft,
  ])

  // add event listener on canvas for mouse position
  useEffect(() => {
    const canvasElem = canvasRef.current
    const sussyCanvasElem = sussyCanvasRef.current
    if (canvasElem === null || sussyCanvasElem === null) return

    // calculate 1/3 of main div width to find width of canvasContainer
    canvasContainerWidthRef.current =
      Math.floor((window.innerWidth - 2 * PX_VALUE_OF_1REM) / 3) -
      PX_VALUE_OF_1REM

    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault()
      if (!event.target) return
      const canvasTarget = event.target as HTMLCanvasElement
      const viewportMousePos = { x: event.clientX, y: event.clientY }
      const topLeftCanvasPos = {
        x: canvasTarget.offsetLeft,
        y: canvasTarget.offsetTop,
      }
      setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos))
    }

    canvasElem.addEventListener("mousemove", handleUpdateMouse)
    sussyCanvasElem.addEventListener("mousemove", handleUpdateMouse)
    return () => {
      canvasElem.removeEventListener("mousemove", handleUpdateMouse)
      sussyCanvasElem.removeEventListener("mousemove", handleUpdateMouse)
    }
  }, [])

  // add event listener on canvas for zoom
  useEffect(() => {
    const canvasElem = canvasRef.current
    const sussyCanvasElem = sussyCanvasRef.current
    if (canvasElem === null || sussyCanvasElem === null) {
      return
    }

    // this is tricky. Update the viewport's "origin" such that
    // the mouse doesn't move during scale - the 'zoom point' of the mouse
    // before and after zoom is relatively the same position on the viewport
    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      if (context && sussyContext) {
        const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY
        const viewportTopLeftDelta = {
          x: (mousePos.x / scale) * (1 - 1 / zoom),
          y: (mousePos.y / scale) * (1 - 1 / zoom),
        }
        const newViewportTopLeft = addPoints(
          viewportTopLeft,
          viewportTopLeftDelta
        )

        context.translate(viewportTopLeft.x, viewportTopLeft.y)
        context.scale(zoom, zoom)
        context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y)

        sussyContext.translate(viewportTopLeft.x, viewportTopLeft.y)
        sussyContext.scale(zoom, zoom)
        sussyContext.translate(-newViewportTopLeft.x, -newViewportTopLeft.y)

        setViewportTopLeft(newViewportTopLeft)
        setScale(scale * zoom)
        isResetRef.current = false
      }
    }

    canvasElem.addEventListener("wheel", handleWheel)
    sussyCanvasElem.addEventListener("wheel", handleWheel)
    return () => {
      canvasElem.removeEventListener("wheel", handleWheel)
      sussyCanvasElem.removeEventListener("wheel", handleWheel)
    }
  }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale])

  useEffect(() => {
    drawToSussyCanvas(
      canvasRef.current,
      baseImageData.current,
      sussyCanvasRef.current,
      props.usingAllQuantizeFactor,
      props.allQuantizeFactor,
      props.redQuantizeFactor,
      props.greenQuantizeFactor,
      props.blueQuantizeFactor
    )
  }, [
    props.usingAllQuantizeFactor,
    props.allQuantizeFactor,
    props.redQuantizeFactor,
    props.greenQuantizeFactor,
    props.blueQuantizeFactor,
  ])

  // sets baseImageData and loads new image to canvas
  // TODO: overlaps with useeffect a little bit, maybe optimize that
  const onImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    if (
      !canvasRef.current ||
      !sussyCanvasRef.current ||
      !context ||
      !sussyContext
    )
      return
    const imgElem = event.target as HTMLImageElement
    context.drawImage(imgElem, 0, 0)
    baseImageData.current = context.getImageData(
      0,
      0,
      imgElem.width,
      imgElem.height
    )

    drawToSussyCanvas(
      canvasRef.current,
      baseImageData.current,
      sussyCanvasRef.current,
      props.usingAllQuantizeFactor,
      props.allQuantizeFactor,
      props.redQuantizeFactor,
      props.greenQuantizeFactor,
      props.blueQuantizeFactor
    )
  }

  return (
    <div>
      <div style={{ padding: "1rem 0rem" }}>
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
        <img
          ref={imageRef}
          src={examplePicture}
          onLoad={onImageLoad}
          style={{ display: "none" }}
        />
        <button onClick={() => context && reset(context)}>Reset</button>
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
      </div>
      <div>
        <canvas
          onMouseDown={startPan}
          ref={canvasRef}
          width={canvasContainerWidthRef.current! * ratio}
          height={CANVAS_HEIGHT * ratio}
          style={{
            outline: "1px solid #000",
            width: `${canvasContainerWidthRef.current!}px`,
            height: `${CANVAS_HEIGHT}px`,
            marginRight: "1rem",
          }}
        />
        <canvas
          onMouseDown={startPan}
          ref={sussyCanvasRef}
          width={canvasContainerWidthRef.current! * ratio}
          height={CANVAS_HEIGHT * ratio}
          style={{
            outline: "1px solid #000",
            width: `${canvasContainerWidthRef.current!}px`,
            height: `${CANVAS_HEIGHT}px`,
          }}
        />
      </div>
    </div>
  )
}