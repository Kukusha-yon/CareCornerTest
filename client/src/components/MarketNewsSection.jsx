import { useState, useRef, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStockData, getNewsData } from '../services/marketNewsService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketNewsSection = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const swiperRef = useRef(null);

  const { data: stockData, isLoading: stockLoading, error: stockError } = useQuery({
    queryKey: ['stockData'],
    queryFn: getStockData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error) => {
      if (error.message.includes('rate limit')) {
        setIsRateLimited(true);
      }
    },
    onSuccess: (data) => {
      // Check if the response contains a rate limit message
      if (data && data.Information && data.Information.includes('API call frequency')) {
        setIsRateLimited(true);
      }
    }
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['newsData'],
    queryFn: getNewsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onSuccess: (data) => {
      // Check if the response contains a rate limit message
      if (data && data.Information && data.Information.includes('API call frequency')) {
        setIsRateLimited(true);
      }
    }
  });

  // Process stock data for chart
  const chartData = useMemo(() => {
    // Default empty chart data structure
    const defaultChartData = {
      labels: [],
      datasets: [{
        label: 'Stock Price',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };

    // If no stock data, return default
    if (!stockData) return defaultChartData;
    
    // Check if we have the required data structure
    if (!stockData['Time Series (Daily)']) return defaultChartData;
    
    const timeSeries = stockData['Time Series (Daily)'];
    
    // If time series is empty, return default
    if (Object.keys(timeSeries).length === 0) return defaultChartData;
    
    // Process the data
    const sortedData = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        close: parseFloat(values['4. close'])
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
    
    // If no data after processing, return default
    if (sortedData.length === 0) return defaultChartData;
    
    return {
      labels: sortedData.map(item => item.date),
      datasets: [{
        label: 'Stock Price',
        data: sortedData.map(item => item.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }, [stockData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Stock Market Trends',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Poppins', sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Poppins', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 10
          }
        }
      }
    }
  };

  if (stockLoading || newsLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  if (stockError) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">API Rate Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              We've reached the daily limit for market data API calls. This is a limitation of the free tier API service.
              The data will automatically refresh when the limit resets (usually after 24 hours).
            </p>
            <p className="text-sm text-gray-500 mb-4">
              In the meantime, you can still browse our products and other features of the site.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#39b54a] text-white rounded-lg hover:bg-[#2d8f3a] transition-colors duration-300 shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center relative">
        <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#39b54a] to-[#2d8f3a]">
          Market Insights & Electronics News
        </span>
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-1 bg-gradient-to-r from-[#39b54a] to-[#2d8f3a]"></span>
      </h2>
      
      {isRateLimited && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">API Rate Limit Reached</p>
              <p className="text-sm mt-1">We're currently displaying sample data due to API rate limits. The free tier of Alpha Vantage API has strict limits (5 calls per minute, 500 per day).</p>
              <p className="text-xs mt-2 text-yellow-700">This is normal behavior and doesn't affect the functionality of the site. Data will refresh automatically when limits reset.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
        {/* Stock Market Section */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-4 sm:p-6 md:p-8 transform transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39b54a]/20 to-[#2d8f3a]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#39b54a]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Stock Market Trends</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">AAPL</span>
              <span className="px-3 py-1 bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-600 rounded-full text-xs font-semibold">Live</span>
            </div>
          </div>
          
          <div className="h-36 sm:h-48 md:h-60 lg:h-72 xl:h-80 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4">
            {chartData && chartData.datasets.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex flex-col justify-center items-center h-full">
                <p className="text-gray-500 mb-4">No stock data available</p>
              </div>
            )}
          </div>
          
          {/* Stock Market Explanation */}
          <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-gray-800">About This Chart</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This chart shows the real-time stock price of Apple Inc. (AAPL) over the last 50 minutes, 
                  with data points every 5 minutes. The green line represents the closing price at each interval, 
                  giving you a quick view of market trends. Rising prices indicate positive market sentiment, 
                  while falling prices may suggest market concerns.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Data by Alpha Vantage</p>
            </div>
            <span className="text-[#39b54a]">Updates every 5 minutes</span>
          </div>
        </div>
        
        {/* News Section */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-4 sm:p-6 md:p-8 transform transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39b54a]/20 to-[#2d8f3a]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#39b54a]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Latest Electronics News</h3>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 rounded-full text-xs font-semibold">Updated</span>
          </div>
          
          {newsData && newsData.length > 0 ? (
            <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4">
              <Swiper
                ref={swiperRef}
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={16}
                slidesPerView={1}
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
                }}
                className="pb-16"
              >
                {newsData.map((news, index) => (
                  <SwiperSlide key={index}>
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-2/5 h-48 sm:h-100 overflow-hidden rounded-xl">
                          <img
                            src={news.image || 'https://placehold.co/400x200?text=No+Image'}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/400x200?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="w-full sm:w-3/5">
                          <h4 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-[#39b54a] transition-colors duration-300 line-clamp-2">
                            {news.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {news.description}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500">{new Date(news.pubDate).toLocaleDateString()}</span>
                            <span className="text-xs text-[#39b54a] font-medium group-hover:underline">Read More →</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </SwiperSlide>
                ))}
                <div className="swiper-button-next after:!text-[#39b54a] !w-10 !h-10 !bg-white !shadow-lg !rounded-full"></div>
                <div className="swiper-button-prev after:!text-[#39b54a] !w-10 !h-10 !bg-white !shadow-lg !rounded-full"></div>
              </Swiper>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-xl">
              <p className="text-gray-500 text-center">No news available</p>
            </div>
          )}
          
          {/* News Explanation */}
          <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-gray-800">About This News</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This section displays the latest news from the electronics industry, curated from reliable sources. 
                  The news carousel automatically updates every 5 minutes to keep you informed about the latest developments, 
                  product launches, and industry trends. Click on any news item to read the full article on the source website.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Data by NewsData.io</p>
            </div>
            <span className="text-[#39b54a]">Updates every 5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketNewsSection; 