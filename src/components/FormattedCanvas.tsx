import { forwardRef } from "react"

interface FormattedCanvasProps {
  title: string
}

const FormattedCanvas = forwardRef<HTMLCanvasElement, FormattedCanvasProps>(
  (props, ref) => {
    return (
      <div style={{ display: "inline-block", paddingRight: "1rem" }}>
        <p>{props.title}</p>
        <canvas ref={ref}></canvas>
      </div>
    )
  }
)

export default FormattedCanvas
