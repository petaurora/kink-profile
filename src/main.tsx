import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./app/AppRouter";
import { installPreviewStorageNamespace } from "./lib/previewStorageNamespace";
import { registerAppServiceWorker } from "./pwa";
import "./styles.css";
import "./mobile-touch.css";

installPreviewStorageNamespace();
registerAppServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
