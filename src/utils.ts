export const createThresholdImageData = (
  baseImageData: ImageData,
  context: CanvasRenderingContext2D
) => {
  const thresholdImageData = context.createImageData(baseImageData)
  for (let i = 0; i < baseImageData.data.length; i += 4) {
    let r = baseImageData.data[i + 0]
    let g = baseImageData.data[i + 1]
    let b = baseImageData.data[i + 2]
    if ((r + g + b) / 3 > 127) {
      thresholdImageData.data[i + 0] = 255
      thresholdImageData.data[i + 1] = 255
      thresholdImageData.data[i + 2] = 255
      thresholdImageData.data[i + 3] = 255
    } else {
      thresholdImageData.data[i + 0] = 0
      thresholdImageData.data[i + 1] = 0
      thresholdImageData.data[i + 2] = 0
      thresholdImageData.data[i + 3] = 255
    }
  }
  return thresholdImageData
}

export const createRandomThresholdImageData = (
  baseImageData: ImageData,
  context: CanvasRenderingContext2D
) => {
  const randomThresholdImageData = context.createImageData(baseImageData)
  for (let i = 0; i < baseImageData.data.length; i += 4) {
    const randomThreshold = Math.floor(Math.random() * 256)
    let r = baseImageData.data[i + 0]
    let g = baseImageData.data[i + 1]
    let b = baseImageData.data[i + 2]
    if ((r + g + b) / 3 > randomThreshold) {
      randomThresholdImageData.data[i + 0] = 255
      randomThresholdImageData.data[i + 1] = 255
      randomThresholdImageData.data[i + 2] = 255
      randomThresholdImageData.data[i + 3] = 255
    } else {
      randomThresholdImageData.data[i + 0] = 0
      randomThresholdImageData.data[i + 1] = 0
      randomThresholdImageData.data[i + 2] = 0
      randomThresholdImageData.data[i + 3] = 255
    }
  }
  return randomThresholdImageData
}

/**
 * Generates Bayer Matrix with dimensions equal to 2**power
 * @param power Power of 2 that determines the final dimension of the returned matrix
 *  (i.e. power = 2 returns a 2^2 x 2^2 matrix)
 * @returns Bayer Matrix with dimensions equal to 2**power
 */
const generateBayerMatrix = (power: number): number[][] => {
  const n = 2 ** power
  if (n === 1) {
    return [
      [0, 128],
      [192, 64],
    ]
  }

  const halftoneMatrix = generateBayerMatrix(power - 1)
  const step = 256 / (2 * n) ** 2
  return [
    ...halftoneMatrix.map((row) => [
      ...row.map((num) => num),
      ...row.map((num) => (num + 2 * step) % 256),
    ]),
    ...halftoneMatrix.map((row) => [
      ...row.map((num) => (num + 3 * step) % 256),
      ...row.map((num) => (num + 1 * step) % 256),
    ]),
  ]
}

export const createOrderedBayerImageData = (
  baseImageData: ImageData,
  context: CanvasRenderingContext2D,
  halftoneDimenision: number
) => {
  const halftoneImageData = context.createImageData(baseImageData)
  const halftoneMatrix = generateBayerMatrix(halftoneDimenision)
  let currentRow = 0
  let pixelId = 0

  for (let i = 0; i < baseImageData.data.length; i += 4) {
    currentRow = Math.floor(i / 4 / baseImageData.width)
    let r = baseImageData.data[i + 0]
    let g = baseImageData.data[i + 1]
    let b = baseImageData.data[i + 2]
    if (
      (r + g + b) / 3 >
      halftoneMatrix[currentRow % halftoneMatrix.length][
        pixelId % halftoneMatrix.length
      ]
    ) {
      halftoneImageData.data[i + 0] = 255
      halftoneImageData.data[i + 1] = 255
      halftoneImageData.data[i + 2] = 255
      halftoneImageData.data[i + 3] = 255
    } else {
      halftoneImageData.data[i + 0] = 0
      halftoneImageData.data[i + 1] = 0
      halftoneImageData.data[i + 2] = 0
      halftoneImageData.data[i + 3] = 255
    }
    pixelId += 1
  }
  return halftoneImageData
}

const calculateAverageRGB = (
  imageData: ImageData,
  sussyMatrix: SusMatrixValue[][],
  startIndex: number
) => {
  let totalR = 0
  let totalG = 0
  let totalB = 0
  let sussyPixelCount = 0
  for (let y = 0; y < sussyMatrix.length; y += 1) {
    for (let x = 0; x < sussyMatrix[0].length; x += 1) {
      const imageDataIndex = startIndex + x * 4 + y * imageData.width * 4
      if (imageDataIndex > imageData.data.length || imageDataIndex < 0) continue
      if (sussyMatrix[y][x] === "susGuy") {
        sussyPixelCount += 1
        let r = imageData.data[imageDataIndex + 0]
        let g = imageData.data[imageDataIndex + 1]
        let b = imageData.data[imageDataIndex + 2]
        totalR += Math.pow(r, 2)
        totalG += Math.pow(g, 2)
        totalB += Math.pow(b, 2)
      }
    }
  }

  return {
    avgR: Math.round(Math.sqrt(totalR / sussyPixelCount)),
    avgG: Math.round(Math.sqrt(totalG / sussyPixelCount)),
    avgB: Math.round(Math.sqrt(totalB / sussyPixelCount)),
  }
}

const quantizeColorValue = (colorValue: number, quantizeFactor: number) => {
  return Math.round(
    (Math.round((quantizeFactor * colorValue) / 255) * 255) / quantizeFactor
  )
}

const paintSussyMatrix = (
  imageData: ImageData,
  sussyImageData: ImageData,
  sussyMatrix: SusMatrixValue[][],
  startIndex: number,
  options: SussyDitherOptions
) => {
  const redQuantizeFactor = options.redQuantizeFactor ?? 255
  const greenQuantizeFactor = options.greenQuantizeFactor ?? 255
  const blueQuantizeFactor = options.blueQuantizeFactor ?? 255
  const { avgR, avgG, avgB } = calculateAverageRGB(
    imageData,
    sussyMatrix,
    startIndex
  )

  for (let y = 0; y < sussyMatrix.length; y += 1) {
    for (let x = 0; x < sussyMatrix[0].length; x += 1) {
      const imageDataIndex = startIndex + x * 4 + y * imageData.width * 4
      const baseR = imageData.data[imageDataIndex + 0]
      const baseG = imageData.data[imageDataIndex + 1]
      const baseB = imageData.data[imageDataIndex + 2]
      if (imageDataIndex > imageData.data.length) continue
      if (sussyMatrix[y][x] === "nonSus") {
        sussyImageData.data[imageDataIndex + 0] = quantizeColorValue(
          baseR,
          redQuantizeFactor / 2
        )
        sussyImageData.data[imageDataIndex + 1] = quantizeColorValue(
          baseG,
          greenQuantizeFactor / 2
        )
        sussyImageData.data[imageDataIndex + 2] = quantizeColorValue(
          baseB,
          blueQuantizeFactor / 2
        )
        sussyImageData.data[imageDataIndex + 3] = 255
      } else if (sussyMatrix[y][x] === "susGuy") {
        sussyImageData.data[imageDataIndex + 0] = quantizeColorValue(
          avgR,
          redQuantizeFactor
        )
        sussyImageData.data[imageDataIndex + 1] = quantizeColorValue(
          avgG,
          greenQuantizeFactor
        )
        sussyImageData.data[imageDataIndex + 2] = quantizeColorValue(
          avgB,
          blueQuantizeFactor
        )
        sussyImageData.data[imageDataIndex + 3] = 255
      } else if (sussyMatrix[y][x] === "susEye") {
        sussyImageData.data[imageDataIndex + 0] = 255
        sussyImageData.data[imageDataIndex + 1] = 255
        sussyImageData.data[imageDataIndex + 2] = 255
        sussyImageData.data[imageDataIndex + 3] = 255
      }
    }
  }
}

export const createSussyImageData = (
  baseImageData: ImageData,
  context: CanvasRenderingContext2D,
  options: SussyDitherOptions
) => {
  const sussyImageData = context.createImageData(baseImageData)
  const sussyMatrix: SusMatrixValue[][] = [
    ["nonSus", "susGuy", "susGuy", "susGuy", "nonSus"],
    ["susGuy", "susGuy", "susEye", "susEye", "nonSus"],
    ["susGuy", "susGuy", "susGuy", "susGuy", "nonSus"],
    ["nonSus", "susGuy", "susGuy", "susGuy", "nonSus"],
    ["nonSus", "susGuy", "nonSus", "susGuy", "nonSus"],
    ["nonSus", "nonSus", "nonSus", "nonSus", "nonSus"],
  ]

  for (let y = 0; y < baseImageData.height; y += sussyMatrix.length) {
    for (let x = 0; x < baseImageData.width; x += sussyMatrix[0].length) {
      let imageDataIndex
      // offset sussyMatrix on odd columns
      if (x % 2 === 0) {
        imageDataIndex = x * 4 + y * baseImageData.width * 4
      } else {
        imageDataIndex =
          x * 4 + (y - sussyMatrix.length / 2) * baseImageData.width * 4
      }
      paintSussyMatrix(
        baseImageData,
        sussyImageData,
        sussyMatrix,
        imageDataIndex,
        options
      )

      // on last row, fill in odd column leftovers
      if (x % 2 === 1 && y + sussyMatrix.length >= baseImageData.height) {
        const nextImageDataIndex =
          x * 4 + (y + sussyMatrix.length / 2) * baseImageData.width * 4
        if (nextImageDataIndex < baseImageData.data.length) {
          paintSussyMatrix(
            baseImageData,
            sussyImageData,
            sussyMatrix,
            nextImageDataIndex,
            options
          )
        }
      }
    }
  }
  return sussyImageData
}

export const drawToSussyCanvas = (
  baseCanvas: HTMLCanvasElement | null,
  baseImageData: ImageData | null,
  sussyCanvas: HTMLCanvasElement | null,
  usingAllQuantizeFactor: boolean,
  allQuantizeFactor: number,
  redQuantizeFactor: number,
  greenQuantizeFactor: number,
  blueQuantizeFactor: number
) => {
  if (!baseCanvas || !baseImageData || !sussyCanvas) return
  let context = baseCanvas.getContext("2d")
  if (!context) return

  let options: SussyDitherOptions = {}
  if (usingAllQuantizeFactor) {
    options.redQuantizeFactor = allQuantizeFactor
    options.greenQuantizeFactor = allQuantizeFactor
    options.blueQuantizeFactor = allQuantizeFactor
  } else {
    options.redQuantizeFactor = redQuantizeFactor
    options.greenQuantizeFactor = greenQuantizeFactor
    options.blueQuantizeFactor = blueQuantizeFactor
  }

  const sussyImageData = createSussyImageData(baseImageData, context, options)
  const sussyContext = sussyCanvas.getContext("2d")
  if (!sussyContext) return
  createImageBitmap(sussyImageData).then((sussyImageBitMap) => {
    sussyContext.drawImage(sussyImageBitMap, 0, 0)
  })
}
