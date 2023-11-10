declare global {
  type SusMatrixValue = "susGuy" | "nonSus" | "susEye"

  interface SussyDitherOptions {
    redQuantizeFactor?: number
    greenQuantizeFactor?: number
    blueQuantizeFactor?: number
  }
}

export {}
