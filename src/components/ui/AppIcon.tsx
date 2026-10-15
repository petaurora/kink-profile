import type { CSSProperties } from "react";
import { appIcons, appIconDefaults, type AppIconMeaning } from "./appIcons";
import "./icons.css";

/** Decorative glyph; the containing control or adjacent text owns its name. */
export function AppIcon({ name, size = appIconDefaults.size, inline = false, className = "", style }: {
  name: AppIconMeaning;
  size?: number;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = appIcons[name];
  return <Icon size={size} stroke={appIconDefaults.stroke} aria-hidden="true" focusable="false"
    className={`kp-icon${inline ? " kp-icon--inline" : ""}${className ? " " + className : ""}`} style={style} />;
}
