"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { SettingsCard } from "./settings-card";

export function AppearanceSettingstile() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      description={`${displayLabel}. ${sourceLabel}`}
    />
  );
}
