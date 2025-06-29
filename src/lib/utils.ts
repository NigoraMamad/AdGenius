import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isToday(dateObj)) {
    return "Today";
  }

  if (isYesterday(dateObj)) {
    return "Yesterday";
  }

  return format(dateObj, "MMM dd, yyyy");
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function calculateROAS(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return revenue / spend;
}

export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return clicks / impressions;
}

export function calculateCPC(spend: number, clicks: number): number {
  if (clicks === 0) return 0;
  return spend / clicks;
}

export function calculateCPA(spend: number, conversions: number): number {
  if (conversions === 0) return 0;
  return spend / conversions;
}

export function getPerformanceColor(
  value: number,
  type: "roas" | "ctr" | "cpc" | "cpa"
): string {
  switch (type) {
    case "roas":
      if (value >= 4) return "text-green-600";
      if (value >= 2) return "text-yellow-600";
      return "text-red-600";
    case "ctr":
      if (value >= 0.02) return "text-green-600";
      if (value >= 0.01) return "text-yellow-600";
      return "text-red-600";
    case "cpc":
      if (value <= 1) return "text-green-600";
      if (value <= 3) return "text-yellow-600";
      return "text-red-600";
    case "cpa":
      if (value <= 20) return "text-green-600";
      if (value <= 50) return "text-yellow-600";
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function validateTelegramWebAppData(initData: string): boolean {
  // Implementation for validating Telegram Web App init data
  // This should verify the hash using the bot token
  return true; // Simplified for now
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
