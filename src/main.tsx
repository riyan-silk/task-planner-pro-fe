import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./assets/styles/globals.css";
import { Toaster } from "react-hot-toast";
import "./index.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>
);
