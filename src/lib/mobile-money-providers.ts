export const MOBILE_MONEY_PROVIDERS = ["Hormuud", "Zaad", "E-Dahab"] as const;

export type MobileMoneyProvider = (typeof MOBILE_MONEY_PROVIDERS)[number];