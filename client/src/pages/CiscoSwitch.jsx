import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory, PRODUCT_CATEGORIES } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import CategoryHero from '../components/ui/CategoryHero';
import { Link } from 'react-router-dom';
import DatabaseStatusIndicator from '../components/ui/DatabaseStatusIndicator';

const CiscoSwitch = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', PRODUCT_CATEGORIES.CISCO_SWITCH],
    queryFn: () => getProductsByCategory(PRODUCT_CATEGORIES.CISCO_SWITCH)
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
        title="CISCO Switches"
        description="Enterprise-grade network switches with advanced security features and high performance."
        image="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80"
        ctaText="View All Switches"
        ctaLink="/products?category=CISCO Switch"
      />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products?.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              state={{ fromCategory: true }}
              className="block"
            >
              <ProductCard key={product._id} product={product} linkDisabled={true} />
            </Link>
          ))}
        </div>
      </div>

      <DatabaseStatusIndicator />
    </div>
  );
};

export default CiscoSwitch; 