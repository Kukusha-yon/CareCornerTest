import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory, PRODUCT_CATEGORIES } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import CategoryHero from '../components/ui/CategoryHero';

const Charger = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', PRODUCT_CATEGORIES.CHARGER],
    queryFn: () => getProductsByCategory(PRODUCT_CATEGORIES.CHARGER)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading products. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CategoryHero
        title="Professional Chargers"
        description="High-quality chargers and power solutions for all your devices."
        image="https://images.unsplash.com/photo-1603539444875-76e7684265f6?auto=format&fit=crop&q=80"
        ctaText="Browse Chargers"
        ctaLink="/products?category=Charger"
      />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Charger; 