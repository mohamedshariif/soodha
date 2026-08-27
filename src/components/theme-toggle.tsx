"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-border bg-card" />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  const currentOption =
    options.find((option) => option.value === theme) ?? options[2];
  
  const CurrentIcon = currentOption.icon;

  function handleThemeChange(value: "light" | "dark" | "system") {
    setTheme(value);
    setOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          flex items-center
          rounded-lg border border-border
          bg-card p-2 text-foreground
          transition-colors
          hover:bg-muted
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-border-focus
        "
      >
        <CurrentIcon className="size-4"/>
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute right-0 mt-1 z-50
            w-35 rounded-xl border border-border
            bg-card p-1 shadow-lg
          "
        >
          {options.map(({ value, label, icon: Icon}) => {
            const isActive = theme === value;

            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                onClick={() => handleThemeChange(value)}
                className={`
                  flex w-full items-center gap-2
                  rounded-lg p-2 text-left text-sm
                  transition-colors
                  focus-visible:outline-none
                  focus-visible:bg-muted
                  ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon className={`size-4 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}/>
                <span>{label}</span>

                {isActive && (
                  <Check className="ml-auto size-4 text-primary"/>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}