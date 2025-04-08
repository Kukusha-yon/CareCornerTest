import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { ensureStringId } from '../utils/formatHelpers';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Function to validate cart items
const validateCartItem = async (item) => {
  try {
    // First try to check if this is a featured product
    if (item._id) {
      try {
        const safeId = ensureStringId(item._id);
        
        // Try to get the featured product
        const featuredResponse = await api.get(`/featured-products/${safeId}`);
        
        // If this is a featured product, use its productId for stock validation if it exists
        if (featuredResponse?.data && featuredResponse.data.productId) {
          // Make sure we get the string ID value, not an object
          const actualProductId = ensureStringId(featuredResponse.data.productId);
          
          item.isFeatured = true;
          item.actualProductId = actualProductId;
          
          try {
            // Check if the linked product exists
            await api.get(`/products/${actualProductId}`);
            return true;
          } catch (productError) {
            // If we can't validate with the actualProductId, try one more approach
            // Sometimes the actualProductId might be stored as a stringified object
            if (typeof item.actualProductId === 'string' && item.actualProductId.includes('{')) {
              try {
                // Try to parse it if it's a stringified object
                const parsedId = JSON.parse(item.actualProductId);
                if (parsedId && parsedId._id) {
                  await api.get(`/products/${parsedId._id}`);
                  return true;
                }
              } catch (parseError) {
                // Parsing failed, continue with other checks
              }
            }
            
            // The featured product exists but the linked product doesn't
            // In this case, we'll still allow it since the featured product exists
            return true;
          }
        }
        // Featured product exists but doesn't have a linked productId
        return true;
      } catch (featuredError) {
        // Not a featured product or featured product not found
        // Continue to check other product types
      }
    }

    // Check if this is a new arrival
    if (item.isNewArrival && item._id) {
      try {
        const safeId = ensureStringId(item._id);
        await api.get(`/new-arrivals/${safeId}`);
        return true;
      } catch (error) {
        // Continue to check as regular product
      }
    }

    // Default: check as regular product
    if (item._id) {
      try {
        const safeId = ensureStringId(item._id);
        await api.get(`/products/${safeId}`);
        return true;
      } catch (error) {
        // Product not found
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    if (user && user._id) {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          const totalQuantity = parsedCart.reduce((count, item) => count + item.quantity, 0);
          setCartCount(totalQuantity);
        } catch (error) {
          toast.error('Failed to load your cart');
        }
      }
    } else {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          const parsedCart = JSON.parse(guestCart);
          setCartItems(parsedCart);
          const totalQuantity = parsedCart.reduce((count, item) => count + item.quantity, 0);
          setCartCount(totalQuantity);
        } catch (error) {
          toast.error('Failed to load guest cart');
        }
      }
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user && user._id) {
      try {
        localStorage.setItem(`cart_${user._id}`, JSON.stringify(cartItems));
        const totalQuantity = cartItems.reduce((count, item) => count + item.quantity, 0);
        setCartCount(totalQuantity);
      } catch (error) {
        toast.error('Failed to save your cart');
      }
    } else {
      // Save guest cart to localStorage
      try {
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        const totalQuantity = cartItems.reduce((count, item) => count + item.quantity, 0);
        setCartCount(totalQuantity);
      } catch (error) {
        toast.error('Failed to save guest cart');
      }
    }
  }, [cartItems, user]);

  // Add to cart function
  const addToCart = async (product, quantity = 1) => {
    try {
      if (!product || !product._id) {
        toast.error('Invalid product data');
        return;
      }
      
      // Ensure we have the string ID, not an object reference
      const productId = ensureStringId(product._id);
      
      // Determine if this is a featured product by checking its properties or source
      const isFeatured = product.productId || product.type === 'featured' || false;
      const isNewArrival = product.isNewArrival || product.type === 'newArrival' || false;
      
      // Create cart item
      const cartItem = {
        _id: productId,
        name: product.name || product.title,
        price: product.price || 0,
        image: product.image || '',
        quantity: quantity,
        isFeatured: isFeatured,
        isNewArrival: isNewArrival
      };
      
      if (isFeatured && product.productId) {
        // Ensure we have the string ID for the actual product, not an object reference
        cartItem.actualProductId = ensureStringId(product.productId);
      }
      
      const isValid = await validateCartItem(cartItem);
      
      if (!isValid) {
        toast.error(`Sorry, ${cartItem.name || 'this product'} is no longer available.`);
        return;
      }

      setCartItems(prevItems => {
        // Check if product already exists in cart
        const itemIndex = prevItems.findIndex(item => 
          typeof item._id === 'object' && typeof productId === 'object' 
            ? item._id._id === productId._id 
            : item._id === productId
        );
        
        if (itemIndex > -1) {
          // Update existing item
          const updatedItems = [...prevItems];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: updatedItems[itemIndex].quantity + quantity
          };
          
          // Save to localStorage
          localStorage.setItem('cartItems', JSON.stringify(updatedItems));
          return updatedItems;
        } else {
          // Add new item
          const newItems = [...prevItems, cartItem];
          
          // Save to localStorage
          localStorage.setItem('cartItems', JSON.stringify(newItems));
          return newItems;
        }
      });
      
      toast.success(`${product.name || product.title || 'Product'} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart.');
    }
  };

  const removeFromCart = (productId) => {
    try {
      setCartItems(prevItems => {
        const itemToRemove = prevItems.find(item => item._id === productId);
        return prevItems.filter(item => item._id !== productId);
      });
      toast.success('Removed from cart!');
    } catch (error) {
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = (productId, quantity) => {
    try {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      );
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = () => {
    try {
      setCartItems([]);
      setCartCount(0);
      if (user) {
        localStorage.removeItem(`cart_${user._id}`);
      } else {
        localStorage.removeItem('guest_cart');
      }
      toast.success('Cart cleared!');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Add this function to validate cart before checkout
  const validateCart = async () => {
    const invalidItems = [];
    
    for (const item of cartItems) {
      const isValid = await validateCartItem(item);
      if (!isValid) {
        invalidItems.push(item);
      }
    }
    
    if (invalidItems.length > 0) {
      // Remove invalid items from cart
      invalidItems.forEach(item => {
        removeFromCart(item._id);
        toast.error(`${item.name || item.title} is no longer available and has been removed from your cart.`);
      });
      return false;
    }
    
    return true;
  };

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    validateCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 