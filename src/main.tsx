import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Grid } from "@mui/material";
import Navbar from "./components/Navbar.tsx";
import App from "./pages/App.tsx";
import NewGame from "./pages/NewGame.tsx";
import JoinGame from "./pages/JoinGame.tsx";
import CurrentGame from "./pages/CurrentGame.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/new",
    element: <NewGame />,
  },
  {
    path: "/join",
    element: <JoinGame />,
  },
  {
    path: "/games/:id",
    element: <CurrentGame />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastContainer position="top-right" autoClose={5000} closeOnClick />
    <MetaMaskUIProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Advanced RPS",
          url: window.location.href,
        },
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: "white",
            width: "50vw",
            height: "100vh",
            padding: "16px",
          }}
        >
          <Grid container spacing={2}>
            <Navbar />
            <div style={{ height: "100px" }}></div>
            <RouterProvider router={router} />
          </Grid>
        </div>
      </div>
    </MetaMaskUIProvider>
  </React.StrictMode>
);
