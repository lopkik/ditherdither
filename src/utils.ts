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
