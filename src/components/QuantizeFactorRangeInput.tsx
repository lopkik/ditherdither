import React from "react"

interface QuantizeFactorRangeInputProps {
  name: string
  quantizeFactor: number
  onChange: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
  min?: number
  max?: number
}

const QuantizeFactorRangeInput = (props: QuantizeFactorRangeInputProps) => {
  const { name, quantizeFactor, onChange, disabled, min, max } = props

  return (
    <div>
      <label htmlFor={name.split(" ").join("-")}>{name}</label>
      <div style={{ display: "flex" }}>
        <input
          type='range'
          name={name.split(" ").join("-")}
          id={name.split(" ").join("-")}
          value={quantizeFactor}
          onChange={onChange}
          min={min ? `${min}` : "0"}
          max={max ? `${max}` : "255"}
          disabled={disabled ?? false}
          style={{ width: "75%", height: "20px" }}
        />
        <input
          type='number'
          name=''
          id=''
          value={quantizeFactor}
          onChange={onChange}
          min={min ? `${min}` : "0"}
          max={max ? `${max}` : "255"}
          disabled={disabled ?? false}
          style={{ width: "25%", height: "20px" }}
        />
      </div>
    </div>
  )
}

export default QuantizeFactorRangeInput
