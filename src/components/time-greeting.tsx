"use client";

import { useSyncExternalStore } from "react";

function getTimeGreeting(date: Date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}

export function TimeGreeting({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const greeting = useSyncExternalStore(
    () => () => undefined,
    () => getTimeGreeting(new Date()),
    () => "Hello",
  );

  return (
    <div>
      <h1 className={`text-xl font-bold text-foreground ${className}`}>
        {greeting}, {name}
      </h1>
    </div>
  );
}
