import "./css/pico-overrides.css";
import "./css/table-fixed-header.css";
import "./css/layout.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Could not find root!");
}
