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
  sussyMatrix: string[][],
  startIndex: number
) => {
  let totalR = 0
  let totalG = 0
  let totalB = 0
  for (let y = 0; y < sussyMatrix.length; y += 1) {
    for (let x = 0; x < sussyMatrix[0].length; x += 1) {
      const imageDataIndex = startIndex + x * 4 + y * imageData.width * 4
      if (sussyMatrix[y][x] === "avg") {
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
    avgR: Math.round(Math.sqrt(totalR / 14)),
    avgG: Math.round(Math.sqrt(totalG / 14)),
    avgB: Math.round(Math.sqrt(totalB / 14)),
  }
}

const paintSussyDither = (
  imageData: ImageData,
  sussyImageData: ImageData,
  sussyMatrix: string[][],
  startIndex: number
) => {
  const { avgR, avgG, avgB } = calculateAverageRGB(
    imageData,
    sussyMatrix,
    startIndex
  )

  for (let y = 0; y < sussyMatrix.length; y += 1) {
    for (let x = 0; x < sussyMatrix[0].length; x += 1) {
      const imageDataIndex = startIndex + x * 4 + y * imageData.width * 4
      if (sussyMatrix[y][x] === "same") {
        sussyImageData.data[imageDataIndex + 0] =
          imageData.data[imageDataIndex + 0]
        sussyImageData.data[imageDataIndex + 1] =
          imageData.data[imageDataIndex + 1]
        sussyImageData.data[imageDataIndex + 2] =
          imageData.data[imageDataIndex + 2]
        sussyImageData.data[imageDataIndex + 3] =
          imageData.data[imageDataIndex + 3]
      } else if (sussyMatrix[y][x] === "avg") {
        sussyImageData.data[imageDataIndex + 0] = avgR
        sussyImageData.data[imageDataIndex + 1] = avgG
        sussyImageData.data[imageDataIndex + 2] = avgB
        sussyImageData.data[imageDataIndex + 3] = 255
      } else if (sussyMatrix[y][x] === "white") {
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
  context: CanvasRenderingContext2D
) => {
  const sussyImageData = context.createImageData(baseImageData)
  let sussyMatrix = [
    ["same", "avg", "avg", "avg"],
    ["avg", "avg", "white", "white"],
    ["avg", "avg", "avg", "avg"],
    ["same", "avg", "avg", "avg"],
    ["same", "avg", "same", "avg"],
  ]

  for (let y = 0; y < baseImageData.height; y += 5) {
    for (let x = 0; x < baseImageData.width; x += 4) {
      const imageDataIndex = x * 4 + y * baseImageData.width * 4

      paintSussyDither(
        baseImageData,
        sussyImageData,
        sussyMatrix,
        imageDataIndex
      )
    }
  }
  return sussyImageData
}
