import axios from 'axios';

class MarketDataError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'MarketDataError';
    this.code = code;
    this.details = details;
  }
}

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Get stock data
export const getStockData = async (symbol = 'AAPL') => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: API_KEY,
        outputsize: 'compact'
      }
    });

    if (!response.data) {
      throw new MarketDataError('No data received from API', 'NO_DATA');
    }

    // Check for rate limit message
    if (response.data.Information && response.data.Information.includes('API call frequency')) {
      throw new MarketDataError(
        'API rate limit reached. Please try again later.',
        'RATE_LIMIT_ERROR',
        { details: response.data.Information }
      );
    }

    if (response.data.Note) {
      throw new MarketDataError(
        'API rate limit reached. Please try again later.',
        'RATE_LIMIT_ERROR',
        { details: response.data.Note }
      );
    }

    if (response.data['Error Message']) {
      throw new MarketDataError(response.data['Error Message'], 'API_ERROR');
    }

    if (!response.data['Time Series (Daily)']) {
      return getMockStockData();
    }

    return response.data;
  } catch (error) {
    if (error instanceof MarketDataError) {
      throw error;
    }
    if (error.response && error.response.status === 429) {
      throw new MarketDataError(
        'API rate limit reached. Please try again later.',
        'RATE_LIMIT_ERROR',
        { status: error.response.status }
      );
    }
    throw new MarketDataError(
      'Failed to fetch stock data',
      'FETCH_ERROR',
      { originalError: error.message }
    );
  }
};

// Mock stock data for fallback
const getMockStockData = () => {
  const today = new Date();
  const mockData = {
    'Time Series (Daily)': {}
  };
  
  // Generate 30 days of mock data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate a random price between 150 and 200
    const basePrice = 175;
    const randomFactor = 0.1; // 10% variation
    const price = basePrice + (Math.random() * 2 - 1) * basePrice * randomFactor;
    
    mockData['Time Series (Daily)'][dateStr] = {
      '1. open': price.toFixed(2),
      '2. high': (price * 1.02).toFixed(2),
      '3. low': (price * 0.98).toFixed(2),
      '4. close': (price * 1.01).toFixed(2),
      '5. volume': Math.floor(Math.random() * 10000000).toString()
    };
  }
  
  return mockData;
};

// Get company overview
export const getCompanyOverview = async (symbol) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: API_KEY
      }
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      throw new MarketDataError('Invalid company overview data received', 'INVALID_DATA');
    }

    return response.data;
  } catch (error) {
    if (error instanceof MarketDataError) {
      throw error;
    }
    throw new MarketDataError(
      'Failed to fetch company overview',
      'FETCH_ERROR',
      { originalError: error.message }
    );
  }
};

// Get news data
export const getNewsData = async (symbol = 'AAPL') => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: symbol,
        apikey: API_KEY,
        topics: 'technology,earnings,forex,crypto'
      }
    });

    if (!response.data) {
      throw new MarketDataError('No data received from API', 'NO_DATA');
    }

    if (response.data.Information && response.data.Information.includes('API call frequency')) {
      throw new MarketDataError(
        'API rate limit reached. Please try again later.',
        'RATE_LIMIT_ERROR',
        { details: response.data.Information }
      );
    }

    if (response.data.Note) {
      throw new MarketDataError(
        'API rate limit reached. Please try again later.',
        'RATE_LIMIT_ERROR',
        { details: response.data.Note }
      );
    }

    if (response.data['Error Message']) {
      throw new MarketDataError(response.data['Error Message'], 'API_ERROR');
    }

    if (!response.data.feed) {
      return getMockNewsData();
    }

    return response.data.feed;
  } catch (error) {
    if (error instanceof MarketDataError) {
      throw error;
    }
    if (error.response && error.response.status === 429) {
      throw new MarketDataError(
        'API rate limit reached. Please try again later.',
        'RATE_LIMIT_ERROR',
        { status: error.response.status }
      );
    }
    throw new MarketDataError(
      'Failed to fetch news data',
      'FETCH_ERROR',
      { originalError: error.message }
    );
  }
};

// Mock news data for fallback
const getMockNewsData = () => {
  const mockNews = [
    {
      title: 'Apple Announces New iPhone with Advanced AI Features',
      description: 'Apple has unveiled its latest iPhone with groundbreaking AI capabilities that promise to revolutionize mobile computing.',
      link: 'https://example.com/news/1',
      pubDate: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80'
    },
    {
      title: 'Tech Industry Sees Surge in Semiconductor Demand',
      description: 'Global semiconductor manufacturers are ramping up production to meet the increasing demand from various tech sectors.',
      link: 'https://example.com/news/2',
      pubDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80'
    },
    {
      title: 'New Breakthrough in Quantum Computing Research',
      description: 'Scientists have achieved a significant milestone in quantum computing, bringing practical applications closer to reality.',
      link: 'https://example.com/news/3',
      pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80'
    },
    {
      title: 'Tech Giants Collaborate on Open AI Standards',
      description: 'Major technology companies are joining forces to establish industry standards for artificial intelligence development.',
      link: 'https://example.com/news/4',
      pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80'
    }
  ];
  
  return mockNews;
};

// Get global news
export const getGlobalNews = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        function: 'NEWS_SENTIMENT',
        apikey: API_KEY,
        topics: 'technology,earnings,forex,crypto'
      }
    });

    if (!response.data || !response.data.feed) {
      throw new MarketDataError('Invalid global news data received', 'INVALID_DATA');
    }

    return response.data.feed;
  } catch (error) {
    if (error instanceof MarketDataError) {
      throw error;
    }
    throw new MarketDataError(
      'Failed to fetch global news',
      'FETCH_ERROR',
      { originalError: error.message }
    );
  }
};

// Cache for storing data between updates
let stockDataCache = null;
let newsDataCache = null;
let lastStockUpdate = 0;
let lastNewsUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fetch stock market data for tech companies
export const fetchStockData = async () => {
  try {
    const now = Date.now();
    if (stockDataCache && (now - lastStockUpdate < CACHE_DURATION)) {
      return stockDataCache;
    }

    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: 'AAPL',
        apikey: API_KEY,
        outputsize: 'compact'
      }
    });

    if (!response.data || !response.data['Time Series (Daily)']) {
      throw new MarketDataError('Invalid stock data structure received', 'INVALID_DATA');
    }

    stockDataCache = response.data;
    lastStockUpdate = now;
    return response.data;
  } catch (error) {
    if (error instanceof MarketDataError) {
      throw error;
    }
    throw new MarketDataError(
      'Failed to fetch stock data',
      'FETCH_ERROR',
      { originalError: error.message }
    );
  }
};

// Fetch electronics news
export const fetchNews = async () => {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (newsDataCache && (now - lastNewsUpdate < CACHE_DURATION)) {
      console.log('Using cached news data');
      return newsDataCache;
    }

    const response = await axios.get(BASE_URL, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: 'AAPL',
        apikey: API_KEY,
        topics: 'technology,earnings,forex,crypto'
      }
    });
    
    // Ensure we have a valid response structure
    if (!response.data || !response.data.feed) {
      console.log('Invalid news data structure, using mock data');
      return generateMockNewsData();
    }
    
    // Cache the successful response
    newsDataCache = response.data;
    lastNewsUpdate = now;
    
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return generateMockNewsData();
  }
};

// Process stock data for Chart.js
export const processStockDataForChart = (timeSeriesData) => {
  if (!timeSeriesData) {
    console.log('No time series data available');
    return null;
  }
  
  console.log('Processing time series data:', timeSeriesData);
  
  // Get the last 10 data points
  const dataPoints = Object.entries(timeSeriesData)
    .slice(0, 10)
    .reverse(); // Reverse to show oldest to newest
  
  return {
    labels: dataPoints.map(([timestamp]) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Stock Price',
        data: dataPoints.map(([, data]) => parseFloat(data['4. close'])),
        borderColor: '#39b54a',
        backgroundColor: 'rgba(57, 181, 74, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
}; 