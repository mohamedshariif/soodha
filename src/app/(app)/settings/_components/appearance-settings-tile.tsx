"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { SettingsCard } from "./settings-card";

const emptySubscribe = () => () => {};

const getClientSnapshot = () => true;

const getServerSnapshot = () => false;

export function AppearanceSettingstile() {
  const { theme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const displayLabel = !mounted
    ? "Loading..."
    : resolvedTheme === "dark"
      ? "Dark mode"
      : "Light mode";

  const sourceLabel = !mounted
    ? ""
    : theme === "system"
      ? " (following system)"
      : "";

  return (
    <SettingsCard
      icon={Palette}
      title="Appearance"
      description={`${displayLabel}.${sourceLabel}`}
    />
  );
}