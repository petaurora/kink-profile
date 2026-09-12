import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./app/AppRouter";
import "./styles.css";
import "./mobile-touch.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
