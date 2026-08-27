import { Landmark, MoreHorizontal, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import type { AccountType } from "@/generated/prisma/enums";

export type { AccountType };

type AccountTypeMeta = {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const ACCOUNT_TYPE_META: Record<AccountType, AccountTypeMeta> = {
  CASH: { 
    label: "Cash", 
    icon: Wallet, 
    color: "#F59E0B" 
  },
  BANK: { 
    label: "Bank", 
    icon: Landmark, 
    color: "#3B82F6" 
  },
  MOBILE_MONEY: { 
    label: "Mobile money", 
    icon: Smartphone,
    color: "#059669"
  },
};

export function getAccountTypeMeta(type: AccountType): AccountTypeMeta {
  return ACCOUNT_TYPE_META[type];
}