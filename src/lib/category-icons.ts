import {
  Wallet,
  Briefcase,
  PlusCircle,
  Utensils,
  Receipt,
  Circle,
  Coffee,
  Car,
  ShoppingBag,
  ShoppingCart,
  HeartPulse,
  Gamepad2,
  Plane,
  GraduationCap,
  Dumbbell,
  Gift,
  Phone,
  Wifi,
  Shield,
  Dog,
  Baby,
  Home,
  type LucideIcon,
  HeartPlus,
} from "lucide-react";

export const categoryIconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  briefcase: Briefcase,
  "plus-circle": PlusCircle,
  utensils: Utensils,
  receipt: Receipt,
  circle: Circle,
  coffee: Coffee,
  car: Car,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  "heart-pluse": HeartPulse,
  Gamepad: Gamepad2,
  plane: Plane,
  "gratuation-cap": GraduationCap,
  dumbbell: Dumbbell,
  gift: Gift,
  phone: Phone,
  wifi: Wifi,
  shield: Shield,
  dog: Dog,
  baby: Baby,
  home: Home,
};

export const DEFAULT_CATEGORY_ICON = "circle";

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return categoryIconMap[DEFAULT_CATEGORY_ICON];
  return categoryIconMap[iconName] ?? categoryIconMap[DEFAULT_CATEGORY_ICON];
}