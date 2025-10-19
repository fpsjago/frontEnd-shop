import { useState } from "react";
import "../../styles/components/admin-products.css";
import ProductAdminForm from "./ProductAdminForm";
import ProductAdminList from "./ProductAdminList";
import { useProductAdmin } from "./useProductAdmin";

type FormSection = "general" | "pricing" | "inventory" | "media" | "metadata" | "ratings" | null;

const ProductAdminPanel = () => {
  const {
    form,
    inventoryOptions,
    products,
    isFetching,
    isSaving,
    error,
    feedback,
    productCount,
    editingProduct,
    isEditing,
    activeProductId,
    handleInputChange,
    handleSubmit,
    handleDelete,
    startEditing,
    cancelEditing,
    refresh,
    handleImageFileChange,
    imagePreviewUrl,
    isUploadingImage,
  } = useProductAdmin();

  // Form visibility state
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState<FormSection>("general");

  const featuredCount = products.filter((product) => product.featured).length;
  const lowStockCount = products.filter((product) => product.inventoryStatus === "LOW_STOCK").length;
  const totalInventory = products.reduce((total, product) => total + (product.stock ?? 0), 0);

  const stats = [
    { label: "Products", value: productCount, helper: "Published catalogue items." },
    { label: "Featured", value: featuredCount, helper: "Highlighted across surfaces." },
    { label: "Low stock", value: lowStockCount, helper: "Items below safety threshold." },
    { label: "Units available", value: totalInventory, helper: "Current on-hand inventory." },
  ];

  // Handle sidebar section click
  const handleSectionClick = (section: FormSection) => {
    if (!showForm) {
      setShowForm(true);
    }
    setActiveSection(activeSection === section ? null : section);
  };

  // Handle create product button
  const handleCreateProduct = () => {
    setShowForm(true);
    setActiveSection("general");
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setActiveSection(null);
    if (isEditing) {
      cancelEditing();
    }
  };

  // Handle edit - show form with all sections
  const handleEdit = (productId: string) => {
    startEditing(productId);
    setShowForm(true);
    setActiveSection("general");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <nav className="admin-sidebar__nav">
          {/* General Section */}
          <div className="admin-sidebar__section">
            <button
              type="button"
              className={`admin-sidebar__section-btn ${activeSection === "general" ? "is-open" : ""}`}
              onClick={() => handleSectionClick("general")}
            >
              <svg className="admin-sidebar__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
              <span>General</span>
              <svg className="admin-sidebar__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </div>

          {/* Pricing Section */}
          <div className="admin-sidebar__section">
            <button
              type="button"
              className={`admin-sidebar__section-btn ${activeSection === "pricing" ? "is-open" : ""}`}
              onClick={() => handleSectionClick("pricing")}
            >
              <svg className="admin-sidebar__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span>Pricing</span>
              <svg className="admin-sidebar__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </div>

          {/* Inventory Section */}
          <div className="admin-sidebar__section">
            <button
              type="button"
              className={`admin-sidebar__section-btn ${activeSection === "inventory" ? "is-open" : ""}`}
              onClick={() => handleSectionClick("inventory")}
            >
              <svg className="admin-sidebar__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Inventory</span>
              <svg className="admin-sidebar__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </div>

          {/* Media Section */}
          <div className="admin-sidebar__section">
            <button
              type="button"
              className={`admin-sidebar__section-btn ${activeSection === "media" ? "is-open" : ""}`}
              onClick={() => handleSectionClick("media")}
            >
              <svg className="admin-sidebar__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span>Media & Images</span>
              <svg className="admin-sidebar__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </div>

          {/* Metadata Section */}
          <div className="admin-sidebar__section">
            <button
              type="button"
              className={`admin-sidebar__section-btn ${activeSection === "metadata" ? "is-open" : ""}`}
              onClick={() => handleSectionClick("metadata")}
            >
              <svg className="admin-sidebar__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>Metadata</span>
              <svg className="admin-sidebar__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </div>

          {/* Ratings Section */}
          <div className="admin-sidebar__section">
            <button
              type="button"
              className={`admin-sidebar__section-btn ${activeSection === "ratings" ? "is-open" : ""}`}
              onClick={() => handleSectionClick("ratings")}
            >
              <svg className="admin-sidebar__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Ratings & Reviews</span>
              <svg className="admin-sidebar__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Sidebar Stats */}
        <div className="admin-sidebar__stats">
          <h3>Quick Stats</h3>
          {stats.map((stat) => (
            <div key={stat.label} className="admin-sidebar__stat">
              <span className="admin-sidebar__stat-label">{stat.label}</span>
              <span className="admin-sidebar__stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-main__header">
          <div>
            <h1>Product Management</h1>
            <p>Manage your product catalog, pricing, inventory, and keep everything in sync.</p>
          </div>
          <div className="admin-main__header-actions">
            <button
              type="button"
              className="admin-main__header-button admin-main__header-button--secondary"
              onClick={refresh}
              disabled={isFetching}
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              className="admin-main__header-button admin-main__header-button--primary"
              onClick={handleCreateProduct}
            >
              + Create Product
            </button>
          </div>
        </header>

        {/* Alerts */}
        {(feedback || error) && (
          <div className="admin-main__alerts">
            {feedback ? (
              <p className="admin-main__alert admin-main__alert--success" role="status">
                {feedback}
              </p>
            ) : null}
            {error ? (
              <p className="admin-main__alert admin-main__alert--error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}

        {/* Product Form - Only show if showForm is true */}
        {showForm && (
          <div className="admin-main__form-container">
            <ProductAdminForm
              form={form}
              inventoryOptions={inventoryOptions}
              isSaving={isSaving}
              isEditing={isEditing}
              editingProduct={editingProduct}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancelEdit={handleCloseForm}
              onImageFileChange={handleImageFileChange}
              imagePreviewUrl={imagePreviewUrl}
              isUploadingImage={isUploadingImage}
              activeSection={activeSection}
            />
          </div>
        )}

        {/* Product List */}
        <div className="admin-main__list-container">
          <ProductAdminList
            products={products}
            isFetching={isFetching}
            productCount={productCount}
            activeProductId={activeProductId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductAdminPanel;
