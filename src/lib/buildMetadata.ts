import packageMetadata from "../../package.json";
import { PROFILE_SCHEMA_VERSION } from "./profileStorage";

export const LOCAL_BUILD_IDENTIFIER = "local";

export function resolveBuildIdentifier(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || LOCAL_BUILD_IDENTIFIER;
}

export const APP_VERSION = packageMetadata.version;
export const BUILD_IDENTIFIER = resolveBuildIdentifier(
  import.meta.env.VITE_BUILD_COMMIT,
);
export const DATA_SCHEMA_VERSION = PROFILE_SCHEMA_VERSION;
