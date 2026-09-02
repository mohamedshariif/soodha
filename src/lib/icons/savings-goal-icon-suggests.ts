import {
  Home,
  Car,
  Plane,
  GraduationCap,
  HeartPlus,
  Shield,
  Smartphone,
  Laptop,
  Cable,
  Gift,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICON_MAP: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["house", "home", "apartment", "rent"], icon: Home },
  { keywords: ["car", "vehicle", "auto"], icon: Car },
  { keywords: ["vacation", "trip", "travel", "holiday"], icon: Plane },
  { keywords: ["school", "tuition", "course", "study"], icon: GraduationCap },
  { keywords: ["health", "medical", "surgery"], icon: HeartPlus },
  { keywords: ["emergency", "found", "safety"], icon: Shield },
  { keywords: ["phone", "iphone", "samsung"], icon: Smartphone},
  { keywords: ["laptop", "computer", "monitor"], icon: Laptop},
  { keywords: ["gadget", "electronics"], icon: Cable },
  { keywords: ["gift", "weading", "present"], icon: Gift },
];

export function guessSavingsGoalIcon(name: string): LucideIcon {
  const normalized = name.toLocaleLowerCase();

  const match = KEYWORD_ICON_MAP.find(({ keywords }) => 
    keywords.some((keyword) => normalized.includes(keyword))
  );

  return match?.icon ?? HandCoins;
}