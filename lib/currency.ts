/**
 * Central Currency and Pricing Logic for DomicCare
 * Default currency: USD ($)
 * Platform fee: 12%
 */

export const CURRENCY = {
  CODE: "USD",
  SYMBOL: "$",
  PLATFORM_FEE_RATE: 0.12,
} as const;

/**
 * Format any numeric value as standard USD currency ("$84.00")
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$0.00";
  }
  return `$${Number(amount).toFixed(2)}`;
}

/**
 * Format hourly rate as USD ("$25.00/hr")
 */
export function formatRate(hourlyRate: number | null | undefined): string {
  if (hourlyRate === null || hourlyRate === undefined || isNaN(hourlyRate)) {
    return "$0.00/hr";
  }
  return `$${Number(hourlyRate).toFixed(2)}/hr`;
}

/**
 * Calculate rate, platform fee, and total amount
 */
export function calculatePricing(hours: number, hourlyRate: number) {
  const safeHours = Math.max(0.5, hours);
  const caregiverPayout = Number((safeHours * hourlyRate).toFixed(2));
  const platformFee = Number((caregiverPayout * CURRENCY.PLATFORM_FEE_RATE).toFixed(2));
  const totalAmount = Number((caregiverPayout + platformFee).toFixed(2));

  return {
    hours: safeHours,
    hourlyRate,
    caregiverPayout,
    platformFee,
    totalAmount,
    currency: CURRENCY.CODE,
    formattedTotal: formatCurrency(totalAmount),
    formattedRate: `${formatCurrency(hourlyRate)}/hr`,
    formattedFee: formatCurrency(platformFee),
    formattedPayout: formatCurrency(caregiverPayout),
  };
}
