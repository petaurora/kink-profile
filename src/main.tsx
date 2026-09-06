import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ProfileAppRoot from "./ProfileAppRoot";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProfileAppRoot />
  </StrictMode>,
);
