import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"
import Home from "@routes/Home.tsx"
import OrderedBayer from "@routes/OrderedBayer.tsx"
import WikiExamples from "@routes/WikiExamples.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "ordered-bayer",
        element: <OrderedBayer />,
      },
      {
        path: "wiki-examples",
        element: <WikiExamples />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
