import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../../lib/api";
import {
  productService,
  type CreateProductPayload,
  type Product,
  type InventoryStatus,
  type UpdateProductPayload,
} from "../../services/productService";
import { imageUploadService } from "../../services/imageUploadService";

export interface ProductFormState {
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: string;
  originalPrice: string;
  currency: string;
  imageUrl: string;
  thumbnailUrl: string;
  badges: string;
  tags: string;
  rating: string;
  reviewCount: string;
  inventoryStatus: InventoryStatus;
  featured: boolean;
  serialNumber: string;
  stock: string;
}

export type ProductFormFieldChange = <Field extends keyof ProductFormState>(
  field: Field,
  value: ProductFormState[Field],
) => void;

export const INVENTORY_OPTIONS: InventoryStatus[] = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "PREORDER",
];

export const DEFAULT_PRODUCT_FORM: ProductFormState = {
  name: "",
  slug: "",
  summary: "",
  description: "",
  price: "",
  originalPrice: "",
  currency: "USD",
  imageUrl: "",
  thumbnailUrl: "",
  badges: "",
  tags: "",
  rating: "",
  reviewCount: "",
  inventoryStatus: "IN_STOCK",
  featured: false,
  serialNumber: "",
  stock: "",
};

export function useProductAdmin() {
  const [form, setForm] = useState<ProductFormState>({ ...DEFAULT_PRODUCT_FORM });
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const productCount = products.length;
  const isEditing = Boolean(editingProduct);
  const activeProductId = editingProduct?.id ?? null;

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aName = a.name?.toLowerCase() ?? "";
      const bName = b.name?.toLowerCase() ?? "";
      return aName.localeCompare(bName);
    });
  }, [products]);

  const resetFormState = useCallback(() => {
    setForm({ ...DEFAULT_PRODUCT_FORM });
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
  }, []);

  const handleInputChange = useCallback<ProductFormFieldChange>((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleImageFileChange = useCallback(async (file: File | null) => {
    setSelectedImageFile(file);

    if (!file) {
      setImagePreviewUrl(null);
      return;
    }

    const validation = imageUploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid image file");
      setSelectedImageFile(null);
      return;
    }

    try {
      const previewUrl = await imageUploadService.createPreviewUrl(file);
      setImagePreviewUrl(previewUrl);

      // Clear the URL fields when a file is selected - the upload will populate them
      setForm((prev) => ({
        ...prev,
        imageUrl: "",
        thumbnailUrl: "",
      }));

      setError(null);
    } catch (err) {
      console.error("Failed to create preview:", err);
      setError("Failed to create image preview");
      setSelectedImageFile(null);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const { items } = await productService.list({ limit: 50 });
      setProducts(items);
      setEditingProduct((current) => {
        if (!current) return current;
        return items.find((item) => item.id === current.id) ?? null;
      });
    } catch (err) {
      console.error("[useProductAdmin] Failed to load products:", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const startEditing = useCallback(
    (product: Product) => {
      setEditingProduct(product);
      setForm(productToFormState(product));
      setFeedback(null);
      setError(null);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [],
  );

  const cancelEditing = useCallback(() => {
    setEditingProduct(null);
    resetFormState();
    setFeedback(null);
  }, [resetFormState]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setFeedback(null);

      const payloadResult = buildPayload(form);
      if (payloadResult.error) {
        setError(payloadResult.error);
        return;
      }

      const payload = payloadResult.payload;

      try {
        setIsSaving(true);

        if (selectedImageFile) {
          setIsUploadingImage(true);
          try {
            const uploadResult = await imageUploadService.uploadProductImage({
              file: selectedImageFile,
            });
            // Use the same URL for both imageUrl and thumbnailUrl
            payload.imageUrl = uploadResult.imageUrl;
            payload.thumbnailUrl = uploadResult.imageUrl;

            // Update form state with the uploaded URL
            setForm((prev) => ({
              ...prev,
              imageUrl: uploadResult.imageUrl,
              thumbnailUrl: uploadResult.imageUrl,
            }));
          } catch (uploadErr) {
            console.error("Failed to upload image:", uploadErr);
            setError("Failed to upload image to S3. Please try again.");
            setIsSaving(false);
            setIsUploadingImage(false);
            return;
          } finally {
            setIsUploadingImage(false);
          }
        }

        if (!payload.thumbnailUrl && payload.imageUrl) {
          payload.thumbnailUrl = payload.imageUrl;
        }

        if (isEditing && editingProduct) {
          if (selectedImageFile && editingProduct.imageUrl) {
            try {
              await imageUploadService.deleteProductImage(editingProduct.imageUrl);
            } catch (deleteErr) {
              console.warn("Failed to delete old image:", deleteErr);
            }
          }

          const updatePayload: UpdateProductPayload = { ...payload };
          await productService.update(editingProduct.id, updatePayload);
          setFeedback(`Product "${editingProduct.name}" updated.`);
          setEditingProduct(null);
          resetFormState();
        } else {
          await productService.create(payload);
          setFeedback("Product created successfully.");
          resetFormState();
        }
        await loadProducts();
      } catch (err) {
        console.error("[useProductAdmin] Failed to submit product:", err);
        setError(extractErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    },
    [form, isEditing, editingProduct, loadProducts, resetFormState, selectedImageFile],
  );

  const handleDelete = useCallback(
    async (productId: Product["id"]) => {
      if (!productId) return;
      const confirmed = window.confirm("Delete this product? This action cannot be undone.");
      if (!confirmed) return;

      try {
        setError(null);

        // Backend handles S3 image deletion automatically
        await productService.delete(productId);

        if (editingProduct && editingProduct.id === productId) {
          setEditingProduct(null);
          resetFormState();
        }
        setFeedback("Product deleted successfully.");
        await loadProducts();
      } catch (err) {
        console.error("[useProductAdmin] Failed to delete product:", err);
        setError(extractErrorMessage(err));
      }
    },
    [editingProduct, loadProducts, resetFormState],
  );

  return {
    form,
    products: sortedProducts,
    inventoryOptions: INVENTORY_OPTIONS,
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
    refresh: loadProducts,
    handleImageFileChange,
    imagePreviewUrl,
    isUploadingImage,
  };
}

function buildPayload(form: ProductFormState): { payload: CreateProductPayload; error?: string } {
  const priceValue = Number(form.price);
  if (Number.isNaN(priceValue) || priceValue <= 0) {
    return { payload: {} as CreateProductPayload, error: "Price must be a positive number." };
  }

  const originalPriceValue =
    form.originalPrice.trim() !== "" ? Number(form.originalPrice) : undefined;
  if (originalPriceValue !== undefined && Number.isNaN(originalPriceValue)) {
    return { payload: {} as CreateProductPayload, error: "Original price must be a number." };
  }

  const ratingValue = form.rating.trim() !== "" ? Number(form.rating) : undefined;
  if (ratingValue !== undefined && (Number.isNaN(ratingValue) || ratingValue < 0)) {
    return { payload: {} as CreateProductPayload, error: "Rating must be a valid number." };
  }

  const reviewCountValue =
    form.reviewCount.trim() !== "" ? Number(form.reviewCount) : undefined;
  if (reviewCountValue !== undefined && Number.isNaN(reviewCountValue)) {
    return { payload: {} as CreateProductPayload, error: "Review count must be a valid number." };
  }

  const stockValue = form.stock.trim() !== "" ? Number(form.stock) : undefined;
  if (stockValue !== undefined && Number.isNaN(stockValue)) {
    return { payload: {} as CreateProductPayload, error: "Stock must be a valid number." };
  }

  const badgesList = toList(form.badges);
  const tagsList = toList(form.tags);
  const imageUrl = form.imageUrl.trim();
  const thumbnailUrl = form.thumbnailUrl.trim();

  const payload: CreateProductPayload = {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    summary: form.summary.trim() || undefined,
    description: form.description.trim() || undefined,
    price: priceValue,
    originalPrice: originalPriceValue,
    currency: form.currency.trim() || undefined,
    imageUrl:
      imageUrl && !imageUrl.startsWith("data:") ? imageUrl : undefined,
    thumbnailUrl:
      thumbnailUrl && !thumbnailUrl.startsWith("data:") ? thumbnailUrl : undefined,
    badges: badgesList.length ? badgesList : undefined,
    tags: tagsList.length ? tagsList : undefined,
    rating: ratingValue,
    reviewCount: reviewCountValue,
    inventoryStatus: form.inventoryStatus,
    featured: form.featured,
    serialNumber: form.serialNumber.trim() || undefined,
    stock: stockValue,
  };

  return { payload };
}

function toList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function productToFormState(product: Product): ProductFormState {
  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    summary: product.summary ?? "",
    description: product.description ?? "",
    price: typeof product.price?.amount === "number" ? String(product.price.amount) : "",
    originalPrice:
      typeof product.price?.originalAmount === "number"
        ? String(product.price.originalAmount)
        : "",
    currency: product.price?.currency ?? product.currency ?? DEFAULT_PRODUCT_FORM.currency,
    imageUrl: product.imageUrl ?? "",
    thumbnailUrl: product.thumbnailUrl ?? "",
    badges: (product.badges ?? []).join(", "),
    tags: (product.tags ?? []).join(", "),
    rating: typeof product.rating === "number" ? String(product.rating) : "",
    reviewCount:
      typeof product.reviewCount === "number" ? String(product.reviewCount) : "",
    inventoryStatus: product.inventoryStatus ?? DEFAULT_PRODUCT_FORM.inventoryStatus,
    featured: Boolean(product.featured),
    serialNumber: product.serialNumber ?? "",
    stock: typeof product.stock === "number" ? String(product.stock) : "",
  };
}

function extractErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const data = error.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    return error.message || "Request failed.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Request failed.";
}








