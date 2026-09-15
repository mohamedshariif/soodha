export function getManagedSourceLabel(sourceType: string) {
  switch (sourceType) {
    case "BILL_PAYMENT":
      return "Bill payments";
    case "SAVINGS_CONTRIBUTION":
      return "Savings contributions";
    case "DEBT_PAYMENT":
      return "Debt payments";
    case "MANUAL":
      return "Manual records";
    default:
      return "Other records";
  }
}