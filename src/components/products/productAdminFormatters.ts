import type { Product } from "../../services/productService";

export function formatCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatPrice(price?: Product["price"], fallbackCurrency?: string) {
  if (!price || typeof price !== "object" || typeof price.amount !== "number") {
    return null;
  }
  return formatCurrency(price.amount, price.currency || fallbackCurrency);
}

export function formatOriginalPrice(price?: Product["price"], fallbackCurrency?: string) {
  if (
    !price ||
    typeof price !== "object" ||
    typeof price.originalAmount !== "number" ||
    price.originalAmount <= 0
  ) {
    return null;
  }
  return formatCurrency(price.originalAmount, price.currency || fallbackCurrency);
}

export function formatInventoryStatus(status?: Product["inventoryStatus"]) {
  switch (status) {
    case "IN_STOCK":
      return "In stock";
    case "LOW_STOCK":
      return "Low stock";
    case "OUT_OF_STOCK":
      return "Out of stock";
    case "PREORDER":
      return "Preorder";
    default:
      return null;
  }
}

export function formatRating(rating?: number, reviewCount?: number) {
  if (typeof rating !== "number") return null;
  const rounded = rating.toFixed(1);
  if (typeof reviewCount === "number" && reviewCount > 0) {
    return `\u2605 ${rounded} (${reviewCount})`;
  }
  return `\u2605 ${rounded}`;
}

export function formatStock(stock?: number) {
  if (typeof stock !== "number") return null;
  return stock > 0 ? `Stock: ${stock}` : "Stock: 0";
}

export function firstLetter(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
}

export function toTitleCase(text: string) {
  return text
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
