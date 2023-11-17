declare global {
  type SusMatrixValue = "susGuy" | "nonSus" | "susEye"
  type QuantizeFactorNames =
    | "redQuantizeFactor"
    | "greenQuantizeFactor"
    | "blueQuantizeFactor"

  interface SussyDitherOptions {
    redQuantizeFactor?: number
    greenQuantizeFactor?: number
    blueQuantizeFactor?: number
  }
}

export {}
