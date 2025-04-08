import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts } from '../services/featuredProductService';
import { useCart } from '../context/CartContext';
import OptimizedImage from '../components/ui/OptimizedImage';
import { toast } from 'react-hot-toast';
import MarketNewsSection from '../components/MarketNewsSection';
import PageTransition from '../components/ui/PageTransition';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import NewArrivalSection from '../components/NewArrivalSection';
import formatCurrency from '../utils/formatCurrency';

const heroSlides = [
  {
    title: 'CISCO Network Solutions',
    subtitle: 'Enterprise-Grade Networking',
    description: 'Discover our comprehensive range of CISCO switches and networking equipment for your business needs.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80',
    cta: 'Explore Network Solutions',
    link: '/products?category=cisco',
    theme: 'dark'
  },
  {
    title: 'Premium Servers',
    subtitle: 'High-Performance Computing',
    description: 'Enterprise-grade servers and storage solutions for your growing business infrastructure.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80',
    cta: 'View Server Collection',
    link: '/products?category=server',
    theme: 'light'
  },
  {
    title: 'Professional Monitors',
    subtitle: 'Crystal Clear Display',
    description: 'High-resolution monitors for enhanced productivity and immersive viewing experience.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80',
    cta: 'Browse Monitors',
    link: '/products?category=monitors',
    theme: 'dark'
  },
  {
    title: 'Logitech World',
    subtitle: 'Premium Peripherals',
    description: 'Experience the perfect blend of comfort and performance with our premium Logitech accessories.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80',
    cta: 'Explore Logitech',
    link: '/products?category=logitech',
    theme: 'light'
  },
  {
    title: 'Professional Bags',
    subtitle: 'Style Meets Functionality',
    description: 'Durable and stylish bags designed for your professional needs, perfect for carrying your tech gear.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80',
    cta: 'Shop Bags',
    link: '/products?category=bags',
    theme: 'dark'
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const maxProductsToShow = 4;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [category, setCategory] = useState('all');
  const [loadedImages, setLoadedImages] = useState({});

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentHero = heroSlides[currentSlide];

  const handleAddToCart = async (product) => {
    try {
      addToCart(product, 1);
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleProductClick = (product) => {
    // Set the selected product for animation
    setSelectedProduct(product._id);
    
    // Check if productId exists and is an object (populated) or a string (ID)
    const productId = product.productId && typeof product.productId === 'object' 
      ? product.productId._id 
      : product.productId;
    
    if (!productId) {
      toast.error('Product ID not found');
      return;
    }
    
    // Navigate to the product detail page with state
    navigate(`/products/${productId}`, {
      state: { 
        from: 'featured',
        transition: 'slide'
      }
    });
  };

  // Handle image load
  const handleImageLoad = (productId) => {
    setLoadedImages(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  if (featuredLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative w-screen h-[80vh] sm:h-[90vh] md:h-[100vh] overflow-hidden -mt-16 -mx-[calc(50vw-50%)]">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 w-screen h-full">
              <div
                className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-1000"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100vw',
                  height: '100%'
                }}
              />
            </div>

            {/* Overlay */}
            <div
              className={`absolute inset-0 ${
                slide.theme === 'dark'
                  ? 'bg-black/60'
                  : 'bg-white/60'
              }`}
            />

            {/* Content */}
            <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
              <div className="max-w-7xl mx-auto text-center">
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 transition-colors duration-300 ${
                    slide.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {slide.title}
                </h1>
                <h2
                  className={`text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 md:mb-6 transition-colors duration-300 ${
                    slide.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {slide.subtitle}
                </h2>
                <p
                  className={`text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto transition-colors duration-300 ${
                    slide.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {slide.description}
                </p>
                <Link
                  to={slide.link}
                  className={`inline-block px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 ${
                    slide.theme === 'dark'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-[#39b54a] text-white hover:bg-[#2d8f3a]'
                  }`}
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-[#39b54a] w-4 sm:w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <NewArrivalSection />

      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#39b54a]" />
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts
                  .filter(product => category === 'all' || product.category === category)
                  .sort((a, b) => {
                    if (sortBy === 'price-low') return a.price - b.price;
                    if (sortBy === 'price-high') return b.price - a.price;
                    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                    return a.featuredOrder - b.featuredOrder; // Default to featured order
                  })
                  .slice(0, maxProductsToShow)
                  .map((product) => {
                    // Check if productId exists and is an object (populated) or a string (ID)
                    const productId = product.productId && typeof product.productId === 'object' 
                      ? product.productId._id 
                      : product.productId;
                      
                    return (
                      <Link
                        key={product._id}
                        to={`/products/${productId}`}
                        className="group"
                      >
                        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg h-[380px] flex flex-col">
                          <div className="h-[220px] w-full relative">
                            {!loadedImages[product._id] && (
                              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                              </div>
                            )}
                            <img
                              src={product.featuredImage || product.image}
                              alt={product.featuredTitle || product.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!loadedImages[product._id] ? 'opacity-0' : 'opacity-100'}`}
                              onLoad={() => handleImageLoad(product._id)}
                            />
                            {product.featuredHighlightText && (
                              <div className="absolute top-3 left-3 bg-[#39b54a] text-white px-3 py-1 rounded-full text-xs font-medium z-10 shadow-sm">
                                {product.featuredHighlightText}
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#39b54a] transition-colors line-clamp-1 mb-2">
                                {product.featuredTitle || product.name}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {product.featuredDescription || product.description}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-gray-900 mt-3">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured products available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Market News Section */}
      <MarketNewsSection />
    </PageTransition>
  );
};

export default Home; 