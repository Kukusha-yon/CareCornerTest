import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  getFeaturedProducts,
  createFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct,
  updateFeaturedProductOrder
} from '../../services/featuredProductService';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star, Calendar, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';

const FeaturedProducts = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: featuredProducts, isLoading, error } = useQuery({
    queryKey: ['featuredProducts', showInactive],
    queryFn: () => getFeaturedProducts(showInactive)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeaturedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['featuredProducts']);
      toast.success('Featured product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete featured product');
    }
  });

  const orderMutation = useMutation({
    mutationFn: ({ id, order }) => updateFeaturedProductOrder(id, order),
    onSuccess: () => {
      queryClient.invalidateQueries(['featuredProducts']);
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this featured product?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting featured product:', error);
      }
    }
  };

  const handleOrderChange = async (id, currentOrder, direction) => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    try {
      await orderMutation.mutateAsync({ id, order: newOrder });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading featured products</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Featured Products</h1>
          <p className="text-gray-500 mt-1">Manage products featured on your homepage</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            {showInactive ? <EyeOff size={20} className="mr-2" /> : <Eye size={20} className="mr-2" />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
          <Link
            to="/admin/featured-products/new"
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Add Featured Product
          </Link>
        </div>
      </div>

      {featuredProducts?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Featured Products</h3>
          <p className="text-gray-500 mb-6">Start by adding your first featured product</p>
          <Link
            to="/admin/featured-products/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            <Plus size={18} className="mr-2" />
            Add Featured Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts?.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="relative">
                <img
                  src={product.featuredImage || product.image}
                  alt={product.featuredTitle || product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.featuredTitle || product.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.featuredDescription || product.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar size={16} className="mr-1.5" />
                  <span>
                    {product.startDate ? new Date(product.startDate).toLocaleDateString() : 'No start date'} - 
                    {product.endDate ? new Date(product.endDate).toLocaleDateString() : 'No end date'}
                  </span>
                </div>
                
                {product.link && (
                  <div className="flex items-center text-sm text-blue-600 mb-4">
                    <LinkIcon size={16} className="mr-1.5" />
                    <span className="truncate">{product.link}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOrderChange(product._id, product.featuredOrder, 'up')}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                      disabled={product.featuredOrder === 0}
                    >
                      <ArrowUp size={18} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Order: {product.featuredOrder}</span>
                    <button
                      onClick={() => handleOrderChange(product._id, product.featuredOrder, 'down')}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/featured-products/${product._id}/edit`}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts; 