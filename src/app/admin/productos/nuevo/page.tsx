import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/admin/productos/actions";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-extrabold text-ink">Nuevo producto</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
