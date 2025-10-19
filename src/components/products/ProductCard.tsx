import type { Product } from "../../services/productService";

export interface ProductCardProps {
  product: Product;
  actionLabel?: string;
  onSelect?: (product: Product) => void;
}

const ProductCard = ({ product, actionLabel = "View product", onSelect }: ProductCardProps) => {
  const {
    name,
    description,
    summary,
    price,
    imageUrl,
    thumbnailUrl,
    rating,
    reviewCount,
    inventoryStatus,
    stock,
    serialNumber,
    tags = [],
    badges = [],
    featured,
  } = product;

  const displayImage = imageUrl ?? thumbnailUrl ?? "";
  const hasDiscount =
    price?.originalAmount !== undefined &&
    price?.amount !== undefined &&
    price.originalAmount > price.amount;

  const discountPercent =
    hasDiscount && price?.originalAmount
      ? Math.round(((price.originalAmount - (price.amount ?? 0)) / price.originalAmount) * 100)
      : undefined;

  const formattedPrice =
    typeof price?.amount === "number" ? formatCurrency(price.amount, price.currency) : "Contact sales";

  const originalPrice =
    hasDiscount && price?.originalAmount
      ? formatCurrency(price.originalAmount, price.currency)
      : undefined;

  const inventoryLabel = resolveInventoryLabel(inventoryStatus);
  const inventoryClass = inventoryStatus
    ? ` product-card__inventory--${inventoryStatus.toLowerCase()}`
    : "";

  const displayDescription = summary || description;

  return (
    <article className={`product-card ${featured ? "product-card--featured" : ""}`}>
      <div className="product-card__figure">
        {badges?.length ? (
          <div className="product-card__badges">
            {badges.map((badge) => (
              <span className="product-card__badge" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        {featured ? (
          <div className="product-card__featured-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0l2.4 5.1 5.6.8-4 4 .9 5.6L8 13l-4.9 2.5.9-5.6-4-4 5.6-.8z"/>
            </svg>
            <span>Featured</span>
          </div>
        ) : null}

        {displayImage ? (
          <img
            className="product-card__image"
            src={displayImage}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true">
            <span>{name?.slice(0, 1)?.toUpperCase() ?? "?"}</span>
          </div>
        )}

        <div className="product-card__image-overlay">
          <button
            className="product-card__quick-view"
            onClick={() => onSelect?.(product)}
            aria-label="Quick view"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M10 3C5 3 1 10 1 10s4 7 9 7 9-7 9-7-4-7-9-7z" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="3" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="product-card__body">
        <div className="product-card__header">
          <h3 className="product-card__title">{name}</h3>
          {serialNumber ? (
            <span className="product-card__serial" title="Serial Number">
              #{serialNumber}
            </span>
          ) : null}
        </div>

        {displayDescription ? (
          <p className="product-card__description">{displayDescription}</p>
        ) : null}

        {tags?.length ? (
          <ul className="product-card__tags">
            {tags.slice(0, 3).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
            {tags.length > 3 ? (
              <li className="product-card__tags-more">+{tags.length - 3}</li>
            ) : null}
          </ul>
        ) : null}
      </div>

      <footer className="product-card__footer">
        <div className="product-card__pricing-section">
          <div className="product-card__pricing">
            <span className="product-card__price">{formattedPrice}</span>
            {originalPrice ? (
              <span className="product-card__original">{originalPrice}</span>
            ) : null}
          </div>
          {discountPercent ? (
            <span className="product-card__discount">Save {discountPercent}%</span>
          ) : null}
        </div>

        <div className="product-card__meta">
          {typeof rating === "number" ? (
            <div className="product-card__rating-box">
              <div className="product-card__rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(rating) ? "star-filled" : "star-empty"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="product-card__rating-text">
                {rating.toFixed(1)}
                {typeof reviewCount === "number" ? (
                  <small> ({reviewCount})</small>
                ) : null}
              </span>
            </div>
          ) : null}

          <div className="product-card__stock-info">
            {inventoryLabel ? (
              <span className={`product-card__inventory${inventoryClass}`}>
                <span className="product-card__inventory-dot"></span>
                {inventoryLabel}
              </span>
            ) : null}
            {typeof stock === "number" && stock > 0 && stock <= 10 ? (
              <span className="product-card__stock-count">
                Only {stock} left
              </span>
            ) : null}
          </div>
        </div>

        <button
          className="product-card__action"
          type="button"
          onClick={() => onSelect?.(product)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 2L9 6M15 2L15 6M3 10L21 10M4 6L20 6C20.5523 6 21 6.44772 21 7L21 19C21 19.5523 20.5523 20 20 20L4 20C3.44772 20 3 19.5523 3 19L3 7C3 6.44772 3.44772 6 4 6Z" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="14" r="1" fill="currentColor"/>
            <circle cx="15" cy="14" r="1" fill="currentColor"/>
          </svg>
          <span>{actionLabel}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <path d="M6 12L10 8L6 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </footer>
    </article>
  );
};

function formatCurrency(value: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function resolveInventoryLabel(status?: Product["inventoryStatus"]) {
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
      return undefined;
  }
}

export default ProductCard;
