import type { FormEvent } from "react";
import type { Product, InventoryStatus } from "../../services/productService";
import type { ProductFormFieldChange, ProductFormState } from "./useProductAdmin";

export interface ProductAdminFormProps {
  form: ProductFormState;
  inventoryOptions: InventoryStatus[];
  isSaving: boolean;
  isEditing: boolean;
  editingProduct?: Product | null;
  onChange: ProductFormFieldChange;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onImageFileChange?: (file: File | null) => void;
  imagePreviewUrl?: string | null;
  isUploadingImage?: boolean;
  activeSection?: "general" | "pricing" | "inventory" | "media" | "metadata" | "ratings" | null;
}

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

const ProductAdminForm = ({
  form,
  inventoryOptions,
  isSaving,
  isEditing,
  editingProduct,
  onChange,
  onSubmit,
  onCancelEdit,
  onImageFileChange,
  imagePreviewUrl,
  isUploadingImage = false,
  activeSection = null,
}: ProductAdminFormProps) => {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {/* Form Header */}
      <div className="admin-form__header">
        <div>
          <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
          <p>
            {isEditing
              ? "Update merchandising details and publish your changes."
              : "Create a new product with complete details."}
          </p>
        </div>
        <button
          type="button"
          className="admin-form__cancel-btn"
          onClick={onCancelEdit}
          disabled={isSaving}
        >
          Close
        </button>
      </div>

      {/* General Section */}
      {activeSection === "general" && (
      <section className="admin-form__section admin-form__section--visible" id="general">
        <h3 className="admin-form__section-title">General Information</h3>

        <div className="admin-form__field" id="name">
          <label htmlFor="product-name" className="admin-form__label">
            Product Name *
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            required
            className="admin-form__input"
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Enter product name"
          />
          <p className="admin-form__hint">The name customers will see on your store.</p>
        </div>

        <div className="admin-form__field" id="description">
          <label htmlFor="product-description" className="admin-form__label">
            Full Description
          </label>
          <textarea
            id="product-description"
            name="description"
            className="admin-form__textarea"
            placeholder="Detailed product information, features, specifications..."
            rows={6}
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
          <p className="admin-form__hint">Complete product details displayed on the product page.</p>
        </div>

        <div className="admin-form__field">
          <label htmlFor="product-summary" className="admin-form__label">
            Summary
          </label>
          <input
            id="product-summary"
            name="summary"
            type="text"
            className="admin-form__input"
            placeholder="Brief, compelling description"
            value={form.summary}
            onChange={(event) => onChange("summary", event.target.value)}
          />
          <p className="admin-form__hint">A short tagline that appears in product cards.</p>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field" id="slug">
            <label htmlFor="product-slug" className="admin-form__label">
              URL Slug
            </label>
            <input
              id="product-slug"
              name="slug"
              type="text"
              className="admin-form__input"
              placeholder="auto-generated"
              value={form.slug}
              onChange={(event) => onChange("slug", event.target.value)}
            />
            <p className="admin-form__hint">Leave blank to auto-generate from name.</p>
          </div>

          <div className="admin-form__field" id="serial">
            <label htmlFor="product-serial" className="admin-form__label">
              Serial Number
            </label>
            <input
              id="product-serial"
              name="serialNumber"
              type="text"
              className="admin-form__input"
              value={form.serialNumber}
              onChange={(event) => onChange("serialNumber", event.target.value)}
              placeholder="SKU-123"
            />
            <p className="admin-form__hint">Internal product identifier.</p>
          </div>
        </div>
      </section>
      )}

      {/* Pricing Section */}
      {activeSection === "pricing" && (
      <section className="admin-form__section admin-form__section--visible" id="pricing">
        <h3 className="admin-form__section-title">Pricing</h3>

        <div className="admin-form__row admin-form__row--three">
          <div className="admin-form__field" id="price">
            <label htmlFor="product-price" className="admin-form__label">
              Current Price *
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              className="admin-form__input"
              placeholder="0.00"
              value={form.price}
              onChange={(event) => onChange("price", event.target.value)}
            />
          </div>

          <div className="admin-form__field" id="original-price">
            <label htmlFor="product-original-price" className="admin-form__label">
              Original Price
            </label>
            <input
              id="product-original-price"
              name="originalPrice"
              type="number"
              step="0.01"
              min="0"
              className="admin-form__input"
              placeholder="0.00"
              value={form.originalPrice}
              onChange={(event) => onChange("originalPrice", event.target.value)}
            />
            <p className="admin-form__hint">For showing discounts</p>
          </div>

          <div className="admin-form__field" id="currency">
            <label htmlFor="product-currency" className="admin-form__label">
              Currency
            </label>
            <select
              id="product-currency"
              name="currency"
              className="admin-form__select"
              value={form.currency}
              onChange={(event) => onChange("currency", event.target.value)}
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
      )}

      {/* Inventory Section */}
      {activeSection === "inventory" && (
      <section className="admin-form__section admin-form__section--visible" id="inventory">
        <h3 className="admin-form__section-title">Inventory Management</h3>

        <div className="admin-form__row">
          <div className="admin-form__field" id="stock">
            <label htmlFor="product-stock" className="admin-form__label">
              Stock Quantity
            </label>
            <input
              id="product-stock"
              name="stock"
              type="number"
              min="0"
              className="admin-form__input"
              placeholder="0"
              value={form.stock}
              onChange={(event) => onChange("stock", event.target.value)}
            />
            <p className="admin-form__hint">Available units in inventory</p>
          </div>

          <div className="admin-form__field" id="inventory-status">
            <label htmlFor="product-inventory" className="admin-form__label">
              Inventory Status
            </label>
            <select
              id="product-inventory"
              name="inventoryStatus"
              className="admin-form__select"
              value={form.inventoryStatus}
              onChange={(event) =>
                onChange("inventoryStatus", event.target.value as InventoryStatus)
              }
            >
              {inventoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
      )}

      {/* Media Section */}
      {activeSection === "media" && (
      <section className="admin-form__section admin-form__section--visible" id="media">
        <h3 className="admin-form__section-title">Media & Images</h3>

        <div className="admin-form__field" id="image-upload">
          <label htmlFor="product-image-file" className="admin-form__label">
            Upload Image
          </label>
          <input
            id="product-image-file"
            name="imageFile"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="admin-form__file"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              if (onImageFileChange) {
                onImageFileChange(file);
              }
            }}
            disabled={isUploadingImage || isSaving}
          />
          <p className="admin-form__hint">
            Upload product image (JPEG, PNG, WebP, or GIF - max 5MB).
          </p>
          {isUploadingImage && (
            <p className="admin-form__status">Uploading image...</p>
          )}
        </div>

        {(imagePreviewUrl || form.imageUrl) && (
          <div className="admin-form__preview">
            <label className="admin-form__label">Image Preview</label>
            <div className="admin-form__preview-box">
              <img src={imagePreviewUrl || form.imageUrl} alt="Product preview" />
            </div>
          </div>
        )}

        <div className="admin-form__field" id="image-url">
          <label htmlFor="product-image-url" className="admin-form__label">
            Image URL (Optional)
          </label>
          <input
            id="product-image-url"
            name="imageUrl"
            type="url"
            className="admin-form__input"
            placeholder="https://example.com/images/product.jpg"
            value={form.imageUrl}
            onChange={(event) => onChange("imageUrl", event.target.value)}
            disabled={isUploadingImage}
          />
          <p className="admin-form__hint">Or enter an external image URL manually.</p>
        </div>

        <div className="admin-form__field" id="thumbnail">
          <label htmlFor="product-thumbnail-url" className="admin-form__label">
            Thumbnail URL (Optional)
          </label>
          <input
            id="product-thumbnail-url"
            name="thumbnailUrl"
            type="url"
            className="admin-form__input"
            placeholder="https://example.com/images/product-thumb.jpg"
            value={form.thumbnailUrl}
            onChange={(event) => onChange("thumbnailUrl", event.target.value)}
            disabled={isUploadingImage}
          />
          <p className="admin-form__hint">Leave empty to use main image.</p>
        </div>
      </section>
      )}

      {/* Metadata Section */}
      {activeSection === "metadata" && (
      <section className="admin-form__section admin-form__section--visible" id="metadata">
        <h3 className="admin-form__section-title">Metadata & Marketing</h3>

        <div className="admin-form__row">
          <div className="admin-form__field" id="badges">
            <label htmlFor="product-badges" className="admin-form__label">
              Promotional Badges
            </label>
            <textarea
              id="product-badges"
              name="badges"
              className="admin-form__textarea admin-form__textarea--small"
              placeholder="Bestseller, Limited Edition, New Arrival"
              rows={3}
              value={form.badges}
              onChange={(event) => onChange("badges", event.target.value)}
            />
            <p className="admin-form__hint">Comma-separated list of badges.</p>
          </div>

          <div className="admin-form__field" id="tags">
            <label htmlFor="product-tags" className="admin-form__label">
              Product Tags
            </label>
            <textarea
              id="product-tags"
              name="tags"
              className="admin-form__textarea admin-form__textarea--small"
              placeholder="Electronics, Premium, Wireless"
              rows={3}
              value={form.tags}
              onChange={(event) => onChange("tags", event.target.value)}
            />
            <p className="admin-form__hint">Comma-separated tags for search.</p>
          </div>
        </div>

        <div className="admin-form__field admin-form__field--toggle" id="featured">
          <label className="admin-form__toggle">
            <input
              id="product-featured"
              name="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(event) => onChange("featured", event.target.checked)}
            />
            <span className="admin-form__toggle-slider"></span>
            <span className="admin-form__toggle-label">
              <strong>Featured Product</strong>
              <small>Highlight this item in homepage carousels and promotional sections</small>
            </span>
          </label>
        </div>
      </section>
      )}

      {/* Ratings Section */}
      {activeSection === "ratings" && (
      <section className="admin-form__section admin-form__section--visible" id="ratings">
        <h3 className="admin-form__section-title">Ratings & Reviews</h3>

        <div className="admin-form__row">
          <div className="admin-form__field" id="rating">
            <label htmlFor="product-rating" className="admin-form__label">
              Average Rating
            </label>
            <input
              id="product-rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="admin-form__input"
              placeholder="4.5"
              value={form.rating}
              onChange={(event) => onChange("rating", event.target.value)}
            />
            <p className="admin-form__hint">Rating from 0 to 5 stars</p>
          </div>

          <div className="admin-form__field" id="review-count">
            <label htmlFor="product-review-count" className="admin-form__label">
              Number of Reviews
            </label>
            <input
              id="product-review-count"
              name="reviewCount"
              type="number"
              min="0"
              className="admin-form__input"
              placeholder="120"
              value={form.reviewCount}
              onChange={(event) => onChange("reviewCount", event.target.value)}
            />
            <p className="admin-form__hint">Total customer reviews</p>
          </div>
        </div>
      </section>
      )}

      {/* Form Footer - Always visible */}
      {activeSection && (
      <div className="admin-form__footer">
        {isEditing && (
          <button
            type="button"
            className="admin-form__button admin-form__button--secondary"
            onClick={onCancelEdit}
            disabled={isSaving}
          >
            Cancel
          </button>
        )}
        <button
          className="admin-form__button admin-form__button--primary"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
        </button>
      </div>
      )}
    </form>
  );
};

export default ProductAdminForm;
