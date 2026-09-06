import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.VITE_BASE_PATH ?? "/kink-profile/";

export default defineConfig({
  base,
  plugins: [react()],
});
