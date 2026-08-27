type KeywordRule = {
  keywords: string[];
  icon: string;
};

const KEYWORD_ICON_RULES: KeywordRule[] = [
  { keywords: ["coffee", "cafe", "starbucks"], icon: "coffee" },
  { keywords: ["car", "uber", "taxi", "transport", "fuel", "gas", "parking", "bus", "train"], icon: "car" },
  { keywords: ["food", "restaurant", "dining", "lunch", "dinner", "breakfast", "eat"], icon: "utensils" },
  { keywords: ["grocery", "groceries", "market", "supermarket"], icon: "shopping-cart" },
  { keywords: ["shop", "shopping", "clothes", "clothing", "mall"], icon: "shopping-bag" },
  { keywords: ["car", "uber", "taxi", "transport", "fuel", "gas", "parking", "bus", "train"], icon: "car" },
  { keywords: ["bill", "bills", "utility", "utilities", "electric", "water"], icon: "receipt" },
  { keywords: ["health", "medical", "doctor", "pharmacy", "hospital"], icon: "heart-pulse" },
  { keywords: ["entertainment", "game", "games", "movie", "netflix", "cinema"], icon: "gamepad" },
  { keywords: ["travel", "flight", "vacation", "trip", "hotel"], icon: "plane" },
  { keywords: ["education", "school", "course", "tuition", "university"], icon: "graduation-cap" },
  { keywords: ["gym", "fitness", "sport", "workout"], icon: "dumbbell" },
  { keywords: ["gift", "present", "birthday"], icon: "gift" },
  { keywords: ["phone", "mobile"], icon: "phone" },
  { keywords: ["internet", "wifi", "broadband"], icon: "wifi" },
  { keywords: ["insurance"], icon: "shield" },
  { keywords: ["pet", "pets", "dog", "cat", "vet"], icon: "dog" },
  { keywords: ["kid", "kids", "child", "children", "baby"], icon: "baby" },
  { keywords: ["rent", "home", "house", "mortgage"], icon: "home" },
  { keywords: ["salary", "income", "paycheck"], icon: "wallet" },
  { keywords: ["business", "freelance", "work", "client"], icon: "briefcase" },
];

export function suggestCategoryIcon(name: string): string {
  const normalized = name.toLowerCase();

  for (const rule of KEYWORD_ICON_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.icon;
    }
  }

  return "circle";
}