import React from "react"

interface QuantizeFactorRangeInputProps {
  name: string
  quantizeFactor: number
  setQuantizeFactor: React.Dispatch<React.SetStateAction<number>>
  min?: number
  max?: number
}

const QuantizeFactorRangeInput = (props: QuantizeFactorRangeInputProps) => {
  const { name, quantizeFactor, setQuantizeFactor, min, max } = props

  return (
    <div>
      <label htmlFor={name.split(" ").join("-")}>
        {name}: {quantizeFactor}
      </label>
      <br />
      <input
        type='range'
        name={name.split(" ").join("-")}
        id={name.split(" ").join("-")}
        value={quantizeFactor}
        onChange={(event) => setQuantizeFactor(+event.target.value)}
        min={min ? `${min}` : "0"}
        max={max ? `${max}` : "255"}
      />
    </div>
  )
}

export default QuantizeFactorRangeInput
