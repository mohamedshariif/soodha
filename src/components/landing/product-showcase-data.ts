import type { LucideIcon } from "lucide-react";

export type ProductTabKey =
  | "dashboard"
  | "transactions"
  | "accounts"
  | "bills"
  | "budgets"
  | "savings"
  | "debts"
  | "reports";

export type ProductTab = {
  key: ProductTabKey;
  label: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  points: readonly string[];
  imageLight: string;
  imageDark: string;
};

export type MarqueeTab = Pick<ProductTab, "key" | "label" | "icon">;
