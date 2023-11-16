import React from "react"

interface QuantizeFactorRangeInputProps {
  name: string
  quantizeFactor: number
  onChange: React.ChangeEventHandler<HTMLInputElement>
  min?: number
  max?: number
}

const QuantizeFactorRangeInput = (props: QuantizeFactorRangeInputProps) => {
  const { name, quantizeFactor, onChange, min, max } = props

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
        onChange={onChange}
        min={min ? `${min}` : "0"}
        max={max ? `${max}` : "255"}
      />
    </div>
  )
}

export default QuantizeFactorRangeInput
