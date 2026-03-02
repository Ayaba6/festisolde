import { ProductCard, ProductSkeleton } from './ProductCard';

export default function ProductGrid({ products, loading }) {
  // On génère 8 squelettes pour le chargement
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="text-4xl text-gray-200">📦</div>
        <p className="text-caption">Aucun article trouvé dans cette collection</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}