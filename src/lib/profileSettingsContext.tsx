import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
} from "react";
import type { ProfileSettings } from "./profileSettings";

export type ProfileSettingsContextValue = {
  settings: ProfileSettings;
  setSettings: Dispatch<SetStateAction<ProfileSettings>>;
};

const ProfileSettingsContext = createContext<ProfileSettingsContextValue | null>(null);

export function ProfileSettingsProvider({
  value,
  children,
}: {
  value: ProfileSettingsContextValue;
  children: ReactNode;
}) {
  return (
    <ProfileSettingsContext.Provider value={value}>
      {children}
    </ProfileSettingsContext.Provider>
  );
}

export function useProfileSettings() {
  const value = useContext(ProfileSettingsContext);
  if (!value) {
    throw new Error("useProfileSettings must be used inside ProfileSettingsProvider");
  }
  return value;
}
