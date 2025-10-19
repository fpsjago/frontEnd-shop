import { useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import type { ListProductsOptions, Product } from "../../services/productService";
import { productService } from "../../services/productService";
import ProductCard from "./ProductCard";
import "../../styles/components/product.css";

export interface ProductShowcaseProps extends ListProductsOptions {
  heading?: string;
  description?: string;
  eyebrow?: string;
  statusBadge?: string;
  emptyMessage?: string;
  actionLabel?: string;
  fallbackItems?: Product[];
  onProductSelect?: (product: Product) => void;
  displayLimit?: number;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "foundations-ui-kit",
    name: "Foundations UI Kit",
    description: "Layered components, typography scales, and iconography for modern SaaS dashboards.",
    price: { amount: 49, originalAmount: 79, currency: "USD" },
    tags: ["Figma", "Design", "Components"],
    badges: ["Bestseller"],
    rating: 4.8,
    reviewCount: 124,
    inventoryStatus: "IN_STOCK",
    featured: true,
  },
  {
    id: "commerce-starter",
    name: "Commerce Starter Theme",
    description: "Headless commerce storefront wired for Astro and ready for your product catalog.",
    price: { amount: 129, originalAmount: 199, currency: "USD" },
    tags: ["Astro", "Starter", "Ecommerce"],
    badges: ["New"],
    rating: 4.6,
    reviewCount: 86,
    inventoryStatus: "LOW_STOCK",
    featured: true,
  },
  {
    id: "motion-presets",
    name: "Motion Presets Pack",
    description: "A library of micro-interaction presets tuned for Framer Motion and React Spring.",
    price: { amount: 39, currency: "USD" },
    tags: ["Animation", "React", "Framer"],
    badges: ["Staff Pick"],
    rating: 4.9,
    reviewCount: 64,
    inventoryStatus: "IN_STOCK",
    featured: true,
  },
];

const ProductShowcase = ({
  heading = "Featured Products",
  description = "Discover our handpicked collection of premium frontend products",
  eyebrow = "Shop",
  statusBadge,
  emptyMessage = "No products matched your filters.",
  actionLabel = "Add to Cart",
  fallbackItems = FALLBACK_PRODUCTS,
  onProductSelect,
  displayLimit,
  search: initialSearch,
  category: initialCategory,
  tags: initialTags,
  minPrice,
  maxPrice,
  sort: initialSort,
  page,
  limit = 12,
  featured: initialFeatured,
}: ProductShowcaseProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Interactive filters
  const [search, setSearch] = useState(initialSearch || "");
  const [sortBy, setSortBy] = useState(initialSort || "featured");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const tagsKey = Array.isArray(initialTags) ? initialTags.join(",") : "";

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      setUsingFallback(false);
      const filterOptions: ClientFilterOptions = {
        search,
        category: selectedCategory,
        tags: initialTags,
        minPrice,
        maxPrice,
        sort: sortBy,
        featured: initialFeatured,
        page,
        limit,
      };

      try {
        const options: ListProductsOptions = {
          search: search || undefined,
          category: selectedCategory,
          tags: initialTags,
          minPrice,
          maxPrice,
          sort: sortBy,
          page,
          limit,
          featured: initialFeatured,
        };

        const { items } = await productService.list(options);
        if (cancelled) return;

        if (items.length === 0 && (fallbackItems?.length ?? 0) > 0) {
          const filteredFallback = applyClientFilters(fallbackItems, filterOptions);
          setProducts(filteredFallback);
          setUsingFallback(true);
          setError(null);
        } else {
          const filteredItems = applyClientFilters(items, filterOptions);
          setProducts(filteredItems);
          setUsingFallback(false);
        }
      } catch (err) {
        console.error("[ProductShowcase] Failed to load products:", err);
        if (!cancelled) {
          const fallback = fallbackItems ?? [];
          if (fallback.length) {
            const filteredFallback = applyClientFilters(fallback, filterOptions);
            setProducts(filteredFallback);
            setUsingFallback(true);
          }
          setError(extractErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    selectedCategory,
    tagsKey,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
    initialFeatured,
    fallbackItems,
  ]);

  const showEmptyState = !isLoading && !error && products.length === 0;
  const itemsToRender = displayLimit ? products.slice(0, displayLimit) : products;
  const itemsCountLabel = isLoading ? "Loading..." : `${itemsToRender.length} products`;

  return (
    <section className="product-showcase">
      <header className="product-showcase__header">
        <div className="product-showcase__header-content">
          {eyebrow ? <p className="product-showcase__eyebrow">{eyebrow}</p> : null}
          <h2 className="product-showcase__title">{heading}</h2>
          {description ? <p className="product-showcase__description">{description}</p> : null}
        </div>
        {statusBadge ? <span className="product-showcase__badge">{statusBadge}</span> : null}
      </header>

      {/* Filters & Controls */}
      <div className="product-showcase__controls">
        <div className="product-showcase__search">
          <svg className="product-showcase__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <circle cx="9" cy="9" r="6" strokeWidth="2"/>
            <path d="M13.5 13.5L17 17" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            className="product-showcase__search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="product-showcase__filters">
          <select
            className="product-showcase__select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest First</option>
          </select>

          <div className="product-showcase__view-toggle">
            <button
              className={`product-showcase__view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2" width="7" height="7" rx="1"/>
                <rect x="11" y="2" width="7" height="7" rx="1"/>
                <rect x="2" y="11" width="7" height="7" rx="1"/>
                <rect x="11" y="11" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              className={`product-showcase__view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="3" width="16" height="3" rx="1"/>
                <rect x="2" y="8" width="16" height="3" rx="1"/>
                <rect x="2" y="13" width="16" height="3" rx="1"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="product-showcase__results-info">
          <span className="product-showcase__count">{itemsCountLabel}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="product-showcase__loading">
          <div className="product-showcase__spinner"></div>
          <p>Loading amazing products...</p>
        </div>
      ) : null}

      {error && !usingFallback ? (
        <div className="product-showcase__error" role="alert">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
            <circle cx="24" cy="24" r="20" strokeWidth="2"/>
            <path d="M24 16v12M24 32v.5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="product-showcase__error-message">{error}</p>
          <p className="product-showcase__error-hint">Try refreshing the page or adjusting your filters</p>
        </div>
      ) : null}

      {showEmptyState && !usingFallback ? (
        <div className="product-showcase__empty">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor">
            <rect x="8" y="16" width="48" height="40" rx="4" strokeWidth="2"/>
            <path d="M8 24h48M24 16v-8M40 16v-8" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="20" cy="36" r="2" fill="currentColor"/>
            <circle cx="32" cy="36" r="2" fill="currentColor"/>
            <circle cx="44" cy="36" r="2" fill="currentColor"/>
          </svg>
          <p className="product-showcase__empty-message">{emptyMessage}</p>
          <button
            className="product-showcase__empty-action"
            onClick={() => {
              setSearch("");
              setSelectedCategory(undefined);
              setSortBy("featured");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : null}

      {!isLoading && itemsToRender.length > 0 ? (
        <div className={`product-grid product-grid--${viewMode}`} aria-live="polite">
          {itemsToRender.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              actionLabel={actionLabel}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

function extractErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const data = error.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    return error.message || "Unable to load products.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to load products.";
}

interface ClientFilterOptions {
  search?: string | null;
  category?: string;
  tags?: string[] | null;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

function applyClientFilters(products: Product[], options: ClientFilterOptions): Product[] {
  let filtered = [...products];

  const searchQuery = options.search?.trim().toLowerCase();
  if (searchQuery) {
    filtered = filtered.filter((product) => {
      const combined = [
        product.name,
        product.summary,
        product.description,
        product.serialNumber,
        ...(product.tags ?? []),
        ...(product.badges ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return combined.includes(searchQuery);
    });
  }

  if (options.tags && options.tags.length > 0) {
    const tagSet = new Set(options.tags.map((tag) => tag.toLowerCase()));
    filtered = filtered.filter((product) => {
      const productTags = product.tags?.map((tag) => tag.toLowerCase()) ?? [];
      return productTags.some((tag) => tagSet.has(tag));
    });
  }

  if (options.category) {
    const categoryQuery = options.category.toLowerCase();
    filtered = filtered.filter((product) => {
      const tags = product.tags?.map((tag) => tag.toLowerCase()) ?? [];
      return tags.includes(categoryQuery);
    });
  }

  if (typeof options.minPrice === "number") {
    filtered = filtered.filter((product) => {
      const price = product.price?.amount;
      return typeof price === "number" ? price >= options.minPrice! : false;
    });
  }

  if (typeof options.maxPrice === "number") {
    filtered = filtered.filter((product) => {
      const price = product.price?.amount;
      return typeof price === "number" ? price <= options.maxPrice! : false;
    });
  }

  if (typeof options.featured === "boolean") {
    filtered = filtered.filter((product) => Boolean(product.featured) === options.featured);
  }

  switch (options.sort) {
    case "price_asc":
      filtered.sort((a, b) => (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity));
      break;
    case "price_desc":
      filtered.sort((a, b) => (b.price?.amount ?? -Infinity) - (a.price?.amount ?? -Infinity));
      break;
    case "rating":
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "newest":
      filtered.sort((a, b) => {
        const aDate = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bDate = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bDate - aDate;
      });
      break;
    default:
      filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
      break;
  }

  const limit = options.limit;
  if (typeof limit === "number" && limit > 0) {
    const page = Math.max(options.page ? Math.floor(options.page) : 1, 1);
    const start = (page - 1) * limit;
    filtered = filtered.slice(start, start + limit);
  }

  return filtered;
}

export default ProductShowcase;
