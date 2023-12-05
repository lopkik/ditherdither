import { useEffect, useState } from "react"
import QuantizeFactorRangeInput from "@components/QuantizeFactorRangeInput"
import PanZoomCanvas from "@/components/PanZoomCanvas"

const Home = () => {
  const [usingAllQuantizeFactor, setUsingAllQuantizeFactor] = useState(false)
  const [allQuantizeFactor, setAllQuantizeFactor] = useState(5)
  const [redQuantizeFactor, setRedQuantizeFactor] = useState(5)
  const [greenQuantizeFactor, setGreenQuantizeFactor] = useState(8)
  const [blueQuantizeFactor, setBlueQuantizeFactor] = useState(4)

  const onQuantizeFactorChange = (
    newQuantizeFactorValue: number,
    quantizeFactorName: QuantizeFactorNames
  ) => {
    switch (quantizeFactorName) {
      case "redQuantizeFactor":
        setRedQuantizeFactor(newQuantizeFactorValue)
        break
      case "blueQuantizeFactor":
        setBlueQuantizeFactor(newQuantizeFactorValue)
        break
      case "greenQuantizeFactor":
        setGreenQuantizeFactor(newQuantizeFactorValue)
        break
      default:
        console.error(`Invalid quantizeFactorName: ${quantizeFactorName}`)
    }
  }

  const onAllQuantizeFactorChange = (newQuantizeFactorValue: number) => {
    setAllQuantizeFactor(newQuantizeFactorValue)
  }

  const randomizeQuantizeFactors = () => {
    if (usingAllQuantizeFactor) {
      setAllQuantizeFactor(Math.round(Math.random() * 255))
    } else {
      setRedQuantizeFactor(Math.round(Math.random() * 255))
      setGreenQuantizeFactor(Math.round(Math.random() * 255))
      setBlueQuantizeFactor(Math.round(Math.random() * 255))
    }
  }

  useEffect(() => {
    // TODO: make window.onresize to make canvas kinda responsive maybe
  }, [])

  return (
    <main style={{ padding: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
        <div>
          <PanZoomCanvas
            usingAllQuantizeFactor={usingAllQuantizeFactor}
            allQuantizeFactor={allQuantizeFactor}
            redQuantizeFactor={redQuantizeFactor}
            greenQuantizeFactor={greenQuantizeFactor}
            blueQuantizeFactor={blueQuantizeFactor}
          />
        </div>

        <div>
          <p>image controls</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 0rem",
            }}
          >
            <div>
              <input
                type='checkbox'
                name='using_all_quantize_factor'
                id='using_all_quantize_factor'
                value={usingAllQuantizeFactor + ""}
                onChange={() => {
                  setUsingAllQuantizeFactor((prev) => !prev)
                }}
              />
              <label htmlFor='using_all_quantize_factor'>
                All Quantize Factor Enabled
              </label>
            </div>
            <div>
              <button onClick={randomizeQuantizeFactors}>
                Randomize Values
              </button>
            </div>
          </div>
          <QuantizeFactorRangeInput
            name='All Quantize Factor'
            quantizeFactor={allQuantizeFactor}
            onChange={(event) => {
              onAllQuantizeFactorChange(+event.target.value)
            }}
            disabled={!usingAllQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Red Quantize Factor'
            quantizeFactor={redQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "redQuantizeFactor")
            }}
            disabled={usingAllQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Green Quantize Factor'
            quantizeFactor={greenQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "greenQuantizeFactor")
            }}
            disabled={usingAllQuantizeFactor}
          />
          <QuantizeFactorRangeInput
            name='Blue Quantize Factor'
            quantizeFactor={blueQuantizeFactor}
            onChange={(event) => {
              onQuantizeFactorChange(+event.target.value, "blueQuantizeFactor")
            }}
            disabled={usingAllQuantizeFactor}
          />
        </div>
      </div>
    </main>
  )
}

export default Home
