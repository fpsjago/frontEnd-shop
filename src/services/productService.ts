import { apiClient } from "../lib/api";

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";

export interface ProductPrice {
  amount: number;
  currency?: string;
  originalAmount?: number;
}

export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  summary?: string;
  price?: ProductPrice;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  badges?: string[];
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  inventoryStatus?: InventoryStatus;
  featured?: boolean;
  serialNumber?: string;
  stock?: number;
  currency?: string;
}

export interface ListProductsOptions {
  search?: string;
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

interface RawProductPrice {
  amount?: number;
  currency?: string;
  originalAmount?: number;
}

interface RawProduct {
  id: string | number;
  name: string;
  slug?: string;
  summary?: string;
  description?: string;
  price?: number | RawProductPrice;
  originalPrice?: number;
  currency?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  badges?: unknown;
  tags?: unknown;
  rating?: number;
  reviewCount?: number;
  inventoryStatus?: string;
  featured?: boolean;
  serialNumber?: string;
  stock?: number;
}

export interface ProductListResponse {
  items: Product[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  summary?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  badges?: string[];
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  inventoryStatus?: InventoryStatus;
  featured?: boolean;
  serialNumber?: string;
  stock?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

function toQueryRecord(options: ListProductsOptions) {
  const query: Record<string, string> = {};
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length) {
        query[key] = value.join(",");
      }
      return;
    }
    query[key] = typeof value === "boolean" ? String(Number(value)) : String(value);
  });
  return query;
}

interface RawProductListResponse {
  items?: RawProduct[];
  total?: number;
  page?: number;
  pageSize?: number;
}

function normalizeListResponse(
  response: RawProductListResponse | RawProduct[],
): Required<Omit<ProductListResponse, "items">> & { items: RawProduct[] } {
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      page: 1,
      pageSize: response.length,
    };
  }
  const items = Array.isArray(response?.items) ? response.items : [];
  return {
    items,
    total: response?.total ?? items.length,
    page: response?.page ?? 1,
    pageSize: response?.pageSize ?? items.length,
  };
}

function mapProduct(raw: RawProduct): Product {
  const priceAmount =
    typeof raw.price === "number"
      ? raw.price
      : typeof raw.price === "object"
        ? raw.price?.amount
        : undefined;

  const originalAmount =
    typeof raw.originalPrice === "number"
      ? raw.originalPrice
      : typeof raw.price === "object"
        ? raw.price?.originalAmount
        : undefined;

  const badgesList = Array.isArray(raw.badges)
    ? (raw.badges as unknown[]).map(String).filter(Boolean)
    : [];

  const tagsList = Array.isArray(raw.tags)
    ? (raw.tags as unknown[]).map(String).filter(Boolean)
    : [];

  const status = raw.inventoryStatus?.toUpperCase() as InventoryStatus | undefined;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    summary: raw.summary,
    description: raw.description,
    price:
      priceAmount !== undefined
        ? {
            amount: priceAmount,
            originalAmount: originalAmount,
            currency:
              raw.currency ||
              (typeof raw.price === "object" ? raw.price?.currency : undefined) ||
              "USD",
          }
        : undefined,
    imageUrl: raw.imageUrl,
    thumbnailUrl: raw.thumbnailUrl,
    badges: badgesList.length ? badgesList : undefined,
    tags: tagsList.length ? tagsList : undefined,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    inventoryStatus: status,
    featured: raw.featured,
    serialNumber: raw.serialNumber,
    stock: raw.stock,
    currency:
      raw.currency || (typeof raw.price === "object" ? raw.price?.currency : undefined) || "USD",
  };
}

export const productService = {
  /**
   * Retrieve a paginated list of products from the backend.
   * Accepts optional filters which are converted into query parameters.
   */
  async list(options: ListProductsOptions = {}) {
    ensureAuthHeader();
    const query = toQueryRecord(options);
    const response = await apiClient.get<RawProductListResponse | RawProduct[]>("/products", {
      query,
    });
    const normalized = normalizeListResponse(response);
    const mappedItems = normalized.items.map(mapProduct);
    const result: ProductListResponse = {
      items: mappedItems,
      total: normalized.total,
      page: normalized.page,
      pageSize: normalized.pageSize,
    };
    console.log("[productService] /products response:", result);
    return result;
  },

  /**
   * Retrieve a single product by identifier.
   */
  async getById(productId: string | number) {
    if (!productId) {
      throw new Error("A product id must be provided to fetch product details.");
    }
    ensureAuthHeader();
    const raw = await apiClient.get<RawProduct>(`/products/${encodeURIComponent(String(productId))}`);
    return mapProduct(raw);
  },

  /**
   * Create a new product record in the backend.
   */
  async create(payload: CreateProductPayload) {
    if (!payload?.name) {
      throw new Error("Product name is required.");
    }
    ensureAuthHeader();
    const raw = await apiClient.post<RawProduct>("/products", payload);
    return mapProduct(raw);
  },

  /**
   * Update an existing product by identifier.
   */
  async update(productId: string | number, payload: UpdateProductPayload) {
    if (!productId && productId !== 0) {
      throw new Error("A product id must be provided to update a product.");
    }
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("At least one field must be provided to update a product.");
    }
    ensureAuthHeader();
    const raw = await apiClient.put<RawProduct>(
      `/products/${encodeURIComponent(String(productId))}`,
      payload,
    );
    return mapProduct(raw);
  },

  /**
   * Remove a product by identifier.
   */
  async delete(productId: string | number) {
    if (!productId && productId !== 0) {
      throw new Error("A product id must be provided to delete a product.");
    }
    ensureAuthHeader();
    return apiClient.delete<void>(`/products/${encodeURIComponent(String(productId))}`);
  },
};

export type { Product as ProductModel };

function ensureAuthHeader() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("frontend_shop_token");
  if (!token) {
    apiClient.removeHeader("Authorization");
    return;
  }
  apiClient.setHeader("Authorization", `Bearer ${token}`);
}




