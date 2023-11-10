import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        width: "100%",
        padding: "1rem",
      }}
    >
      <div>
        <NavLink to={"/"}>ditherdither</NavLink>
      </div>
      <div>
        <NavLink to={"/ordered-bayer"}>Ordered Bayer Examples</NavLink>
      </div>
      <div>
        <NavLink to={"/wiki-examples"}>
          Dithering Examples from Wikipedia
        </NavLink>
      </div>
    </div>
  )
}

export default Navbar
