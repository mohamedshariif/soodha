import {
  Wifi,
  Home,
  Zap,
  Flame,
  Tv,
  Phone,
  Droplet,
  Car,
  CreditCard,
  ShieldCheck,
  Dumbbell,
  GraduationCap,
  Receipt,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICON_MAP: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["internet", "wifi", "broadband"], icon: Wifi },
  { keywords: ["home", "house", "residence", "rent", "mortgage", "housing", "kiro"], icon: Home },
  { keywords: ["electricity", "electric", "power", "energy", "koronto"], icon: Zap },
  { keywords: ["gas", "fuel", "natural gas"], icon: Flame },
  { keywords: ["television", "tv", "subscription", "streaming", "netflix", "spotify", "disney+", "youtube"], icon: Tv },
  { keywords: ["phone", "telephone", "mobile", "smartphone", "cell"], icon: Phone },
  { keywords: ["water", "droplet", "sewer", "biyo"], icon: Droplet },
  { keywords: ["car", "vehicle", "automobile"], icon: Car },
  { keywords: ["credit", "card", "loan"], icon: CreditCard },
  { keywords: ["security", "shield", "protection", "insurance"], icon: ShieldCheck },
  { keywords: ["gym", "dumbbell", "fitness", "workout"], icon: Dumbbell },
  { keywords: ["education", "graduation", "school", "university", "college", "tuition", "fees"], icon: GraduationCap },
  { keywords: ["receipt", "invoice"], icon: Receipt },
  { keywords: ["shopping", "cart"], icon: ShoppingCart }
];

export function guessBillIcon(name: string, categoryName?: string | null): LucideIcon {
  const lowerCaseName = name.toLowerCase();

  const nameMatch = KEYWORD_ICON_MAP.find(({ keywords }) => 
  keywords.some((keyword) => lowerCaseName.includes(keyword))
  );
  if (nameMatch) return nameMatch.icon;

  if (categoryName) {
    const normalizedCategory = categoryName.toLowerCase();
    const categoryMatch = KEYWORD_ICON_MAP.find(({ keywords }) => 
      keywords.some((keyword) => normalizedCategory.includes(keyword))
    );
    if (categoryMatch) return categoryMatch.icon;
  }

  return Receipt;
}