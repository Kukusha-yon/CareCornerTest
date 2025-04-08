import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory, PRODUCT_CATEGORIES } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import CategoryHero from '../components/ui/CategoryHero';
import { Link } from 'react-router-dom';
import DatabaseStatusIndicator from '../components/ui/DatabaseStatusIndicator';

const Server = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', PRODUCT_CATEGORIES.SERVER],
    queryFn: async () => {
      try {
        const result = await getProductsByCategory(PRODUCT_CATEGORIES.SERVER);
        console.log('Fetched server products:', result);
        return result;
      } catch (err) {
        console.error('Error fetching server products:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('Server products state:', { products, isLoading, error });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading server products:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading products. Please try again later.</div>
        <div className="mt-2 text-sm text-gray-500">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CategoryHero
        title="Enterprise Servers"
        description="High-performance servers and storage solutions designed for demanding workloads."
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80"
        ctaText="Explore Servers"
        ctaLink="/products?category=Server"
      />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => {
              console.log('Rendering product:', product);
              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  state={{ fromCategory: true }}
                  className="block"
                >
                  <ProductCard product={product} linkDisabled={true} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No server products found.</p>
            <p className="text-sm text-gray-400 mt-2">Try adding some server products in the admin dashboard.</p>
          </div>
        )}
      </div>

      <DatabaseStatusIndicator />
    </div>
  );
};

export default Server; 