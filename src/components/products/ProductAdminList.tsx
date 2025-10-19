import type { Product } from "../../services/productService";
import {
  firstLetter,
  formatInventoryStatus,
  formatOriginalPrice,
  formatPrice,
  formatRating,
  formatStock,
  toTitleCase,
} from "./productAdminFormatters";

export interface ProductAdminListProps {
  products: Product[];
  isFetching: boolean;
  productCount: number;
  activeProductId: Product["id"] | null;
  onEdit: (product: Product) => void;
  onDelete: (productId: Product["id"]) => void;
}

const ProductAdminList = ({
  products,
  isFetching,
  productCount,
  activeProductId,
  onEdit,
  onDelete,
}: ProductAdminListProps) => {
  return (
    <section className="admin-products__list">
      <div className="admin-products__list-header">
        <div>
          <h3>Catalog</h3>
          <p className="admin-products__list-subtitle">
            {productCount ? `Displaying ${productCount} catalog items.` : "No products yet."}
          </p>
        </div>
      </div>

      <div className="admin-products__toolbar">
        <div className="admin-products__tabs" role="tablist" aria-label="Catalog filters">
          {["All", "Published", "Drafts", "Low stock", "Out of stock"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={`admin-products__tab ${index === 0 ? "is-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-products__filters">
          <label className="admin-products__search">
            <span className="sr-only">Search products</span>
            <input placeholder="Search products" type="search" />
          </label>
          <select className="admin-products__select" defaultValue="email">
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
          <select className="admin-products__select" defaultValue="all">
            <option value="all">All statuses</option>
            <option value="featured">Featured</option>
            <option value="inStock">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <button className="admin-products__filter-button" type="button">
            More filters
          </button>
        </div>
      </div>

      {isFetching && products.length === 0 ? (
        <p className="admin-products__list-status">Loading products...</p>
      ) : null}

      {!isFetching && products.length === 0 ? (
        <p className="admin-products__list-status">
          No products found. Try adding your first product.
        </p>
      ) : null}

      <ul className="admin-products__list-items">
        {products.map((product) => {
          const priceDisplay = formatPrice(product.price, product.currency);
          const originalDisplay = formatOriginalPrice(product.price, product.currency);
          const inventoryLabel = formatInventoryStatus(product.inventoryStatus);
          const statusClass = product.inventoryStatus
            ? `status-pill status-pill--${product.inventoryStatus.toLowerCase()}`
            : "status-pill";
          const ratingDisplay = formatRating(product.rating, product.reviewCount);
          const stockDisplay = formatStock(product.stock);
          const badgeList = product.badges ?? [];
          const tagList = product.tags ?? [];
          const isActive = activeProductId === product.id;
          const itemClassName = `admin-products__item${isActive ? " is-editing" : ""}`;
          const editLabel = isActive ? "Editing" : "Edit";

          return (
            <li key={product.id} className={itemClassName}>
              <div className="admin-products__item-media">
                {product.thumbnailUrl || product.imageUrl ? (
                  <img
                    className="admin-products__item-thumb"
                    src={product.thumbnailUrl ?? product.imageUrl ?? ""}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="admin-products__item-placeholder">
                    {firstLetter(product.name)}
                  </span>
                )}
              </div>

              <div className="admin-products__item-body">
                <div className="admin-products__item-heading">
                  <strong className="admin-products__item-name">{product.name}</strong>
                  {product.featured ? (
                    <span className="admin-products__pill admin-products__pill--featured">Featured</span>
                  ) : null}
                  {badgeList.map((badge) => (
                    <span className="admin-products__pill" key={badge}>
                      {toTitleCase(badge)}
                    </span>
                  ))}
                </div>

                {product.summary ? (
                  <p className="admin-products__item-summary">{product.summary}</p>
                ) : null}

                <div className="admin-products__item-meta">
                  {priceDisplay ? (
                    <span className="admin-products__price">
                      {priceDisplay}
                      {originalDisplay ? <s>{originalDisplay}</s> : null}
                    </span>
                  ) : (
                    <span className="admin-products__price admin-products__price--muted">
                      Price pending
                    </span>
                  )}
                  {stockDisplay ? <span>{stockDisplay}</span> : null}
                  {ratingDisplay ? <span>{ratingDisplay}</span> : null}
                  {product.serialNumber ? (
                    <span className="admin-products__serial">#{product.serialNumber}</span>
                  ) : null}
                </div>

                {tagList.length ? (
                  <div className="admin-products__item-tags">
                    {tagList.map((tag) => (
                      <span key={tag}>{toTitleCase(tag)}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="admin-products__item-sidebar">
                {inventoryLabel ? <span className={statusClass}>{inventoryLabel}</span> : null}
                <div className="admin-products__item-actions">
                  <button
                    type="button"
                    className="admin-products__item-edit"
                    onClick={() => onEdit(product)}
                    disabled={isActive}
                  >
                    {editLabel}
                  </button>
                  <button
                    type="button"
                    className="admin-products__item-delete"
                    onClick={() => onDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProductAdminList;
