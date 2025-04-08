import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory, PRODUCT_CATEGORIES } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import CategoryHero from '../components/ui/CategoryHero';

const Bags = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', PRODUCT_CATEGORIES.BAGS],
    queryFn: () => getProductsByCategory(PRODUCT_CATEGORIES.BAGS)
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
        title="Professional Bags"
        description="Durable and stylish bags designed for professionals on the go."
        image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80"
        ctaText="Browse Bags"
        ctaLink="/products?category=Bags"
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

export default Bags; 