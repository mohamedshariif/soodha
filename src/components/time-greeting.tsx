"use client";

import { useEffect, useState } from "react";

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

export function TimeGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    setGreeting(getTimeGreeting(new Date()));
  }, []);

  return (
    <>
      {greeting}, {name}
    </>
  );
}