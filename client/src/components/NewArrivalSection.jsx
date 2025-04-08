import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getNewArrivals } from '../services/newArrivalService';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, FreeMode } from 'swiper/modules';
import formatCurrency from '../utils/formatCurrency';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const NewArrivalSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const swiperRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  const { data: newArrivals, isLoading, error } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: async () => {
      try {
        const data = await getNewArrivals();
        return data;
      } catch (err) {
        setLoadError(err.message || 'Failed to load new arrivals');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Effect to handle errors
  useEffect(() => {
    // No need to log errors, just handle them in the UI
  }, [error]);

  if (isLoading) {
    return (
      <div className="w-full py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 mb-4 sm:mb-6">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/4 mb-3 sm:mb-4"></div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex space-x-3 sm:space-x-4 overflow-x-auto px-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 sm:w-64">
                <div className="h-36 sm:h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded mt-2"></div>
                <div className="h-4 bg-gray-200 rounded mt-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || loadError) {
    return (
      <div className="w-full py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-600">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">New Arrivals</h2>
            <p className="text-gray-600">Unable to load new arrivals at this moment. Please check back later.</p>
            {process.env.NODE_ENV !== 'production' && (
              <p className="text-sm text-gray-500 mt-1">{(error || loadError).toString()}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!newArrivals || newArrivals.length === 0) {
    return (
      <div className="w-full py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">New Arrivals</h2>
          <div className="text-center text-gray-600">
            No new arrivals available at the moment.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">New Arrivals</h2>
          <Link 
            to="/products" 
            className="text-primary hover:text-primary-dark transition-colors text-xs sm:text-sm md:text-base"
          >
            View All Products
          </Link>
        </div>
      </div>

      <div 
        className="relative w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Swiper
          ref={swiperRef}
          modules={[Autoplay, Pagination, Navigation, FreeMode]}
          spaceBetween={12}
          slidesPerView={1.2}
          centeredSlides={false}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            480: {
              slidesPerView: 1.5,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3.2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 4.2,
              spaceBetween: 30,
            },
          }}
          className="pb-10 sm:pb-12"
        >
          {newArrivals.map((newArrival) => (
            <SwiperSlide key={newArrival._id}>
              <Link
                to={`/new-arrivals/${newArrival._id}`}
                className="block"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg h-[380px] w-full flex flex-col">
                  <div className="h-[280px] w-full overflow-hidden">
                    <img
                      src={newArrival.image}
                      alt={newArrival.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#39b54a] transition-colors line-clamp-2">
                      {newArrival.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
                      {newArrival.description}
                    </p>
                    <p className="mt-3 text-lg font-bold text-gray-900">
                      {formatCurrency(newArrival.price)}
                    </p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
          <div className="swiper-button-next !text-[#39b54a] !right-2 !bottom-16 sm:!bottom-14 !w-8 sm:!w-10 !h-8 sm:!h-10 !bg-white/80 !rounded-full"></div>
          <div className="swiper-button-prev !text-[#39b54a] !left-2 !bottom-16 sm:!bottom-14 !w-8 sm:!w-10 !h-8 sm:!h-10 !bg-white/80 !rounded-full"></div>
        </Swiper>
      </div>
    </div>
  );
};

export default NewArrivalSection; 