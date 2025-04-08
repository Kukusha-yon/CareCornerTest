import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getProduct, createProduct, updateProduct } from '../../services/productService';
import { PRODUCT_CATEGORIES } from '../../services/productService';
import { Plus, X, Upload } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    manufacturer: '',
    modelNumber: '',
    description: '',
    detailedDescription: '',
    brand: '',
    category: '',
    price: '',
    countInStock: '',
    image: '',
    galleryImages: [],
    features: [''],
    technicalSpecs: new Map(),
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    weight: {
      value: '',
      unit: 'g'
    },
    warranty: {
      duration: '',
      unit: 'months'
    },
    tags: [],
    seoMetadata: {
      title: '',
      description: '',
      keywords: []
    },
    isActive: true,
    isBestSeller: false,
    isOnSale: false,
    salePrice: '',
    saleStartDate: '',
    saleEndDate: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Fetch product data if editing
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: isEditing
  });

  // Helper function to ensure we have a valid Map
  const ensureMap = (value) => {
    if (!value) return new Map();
    if (value instanceof Map) return value;
    if (typeof value === 'object') {
      try {
        return new Map(Object.entries(value));
      } catch (error) {
        console.error('Error converting to Map:', error);
        return new Map();
      }
    }
    return new Map();
  };

  // Set form data when product is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        manufacturer: product.manufacturer || '',
        modelNumber: product.modelNumber || '',
        description: product.description || '',
        detailedDescription: product.detailedDescription || '',
        brand: product.brand || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        countInStock: product.countInStock?.toString() || '',
        image: product.image || '',
        galleryImages: product.galleryImages || [],
        features: product.features || [''],
        technicalSpecs: ensureMap(product.technicalSpecs),
        dimensions: {
          length: product.dimensions?.length || '',
          width: product.dimensions?.width || '',
          height: product.dimensions?.height || '',
          unit: product.dimensions?.unit || 'cm'
        },
        weight: {
          value: product.weight?.value || '',
          unit: product.weight?.unit || 'g'
        },
        warranty: {
          duration: product.warranty?.duration || '',
          unit: product.warranty?.unit || 'months'
        },
        tags: product.tags || [],
        seoMetadata: product.seoMetadata || {
          title: '',
          description: '',
          keywords: []
        },
        isActive: product.isActive || true,
        isBestSeller: product.isBestSeller || false,
        isOnSale: product.isOnSale || false,
        salePrice: product.salePrice?.toString() || '',
        saleStartDate: product.saleStartDate || '',
        saleEndDate: product.saleEndDate || ''
      });
      setPreviewUrls(product.galleryImages?.map(img => img.url) || []);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFeatureChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? value : feature
      )
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      technicalSpecs: new Map(prev.technicalSpecs).set(key, value)
    }));
  };

  const addSpec = () => {
    const key = prompt('Enter specification name:');
    if (key) {
      handleSpecChange(key, '');
    }
  };

  const removeSpec = (key) => {
    setFormData(prev => {
      const newSpecs = new Map(prev.technicalSpecs);
      newSpecs.delete(key);
      return { ...prev, technicalSpecs: newSpecs };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles([file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          galleryImages: [
            ...prev.galleryImages,
            { url: reader.result, alt: file.name, order: prev.galleryImages.length }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSubmit = new FormData();
      
      // Ensure all required fields are present
      const requiredFields = {
        name: formData.name || '',
        sku: formData.sku || '',
        manufacturer: formData.manufacturer || '',
        brand: formData.brand || '',
        category: formData.category || '',
        description: formData.description || '',
        price: formData.price || 0,
        countInStock: formData.countInStock || 0,
      };

      // Append required fields
      Object.entries(requiredFields).forEach(([key, value]) => {
        formDataToSubmit.append(key, value);
      });

      // Append optional fields
      if (formData.modelNumber) formDataToSubmit.append('modelNumber', formData.modelNumber);
      if (formData.detailedDescription) formDataToSubmit.append('detailedDescription', formData.detailedDescription);
      
      // Append complex fields as JSON strings
      if (formData.features) {
        formDataToSubmit.append('features', JSON.stringify(formData.features));
      }
      if (formData.technicalSpecs) {
        formDataToSubmit.append('technicalSpecs', JSON.stringify(Object.fromEntries(ensureMap(formData.technicalSpecs))));
      }
      if (formData.dimensions) {
        formDataToSubmit.append('dimensions', JSON.stringify(formData.dimensions));
      }
      if (formData.weight) {
        formDataToSubmit.append('weight', JSON.stringify(formData.weight));
      }
      if (formData.warranty) {
        formDataToSubmit.append('warranty', JSON.stringify(formData.warranty));
      }
      if (formData.tags) {
        formDataToSubmit.append('tags', JSON.stringify(formData.tags));
      }
      if (formData.seoMetadata) {
        formDataToSubmit.append('seoMetadata', JSON.stringify(formData.seoMetadata));
      }

      // Append boolean fields
      formDataToSubmit.append('isActive', formData.isActive ? 'true' : 'false');
      formDataToSubmit.append('isBestSeller', formData.isBestSeller ? 'true' : 'false');
      formDataToSubmit.append('isOnSale', formData.isOnSale ? 'true' : 'false');

      // Append images
      if (imageFiles[0]) {
        formDataToSubmit.append('image', imageFiles[0]);
      }
      
      // Append gallery images
      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          formDataToSubmit.append('galleryImages', file);
        });
      }

      if (isEditing) {
        await updateProduct(id, formDataToSubmit);
        toast.success('Product updated successfully');
      } else {
        await createProduct(formDataToSubmit);
        toast.success('Product created successfully');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.response?.data?.message || error.message || 'Error saving product');
    }
  };

  if (isLoadingProduct) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Model Number</label>
          <input
            type="text"
            name="modelNumber"
            value={formData.modelNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            name="countInStock"
            value={formData.countInStock}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
        <textarea
          name="detailedDescription"
          value={formData.detailedDescription}
          onChange={handleChange}
          rows="5"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Features</label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Technical Specifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Technical Specifications</label>
        <div className="space-y-2">
          {Array.from(ensureMap(formData.technicalSpecs).entries()).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key}
                disabled
                className="w-1/3 rounded-md border-gray-300 bg-gray-50"
              />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleSpecChange(key, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeSpec(key)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpec}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Specification
          </button>
        </div>
      </div>

      {/* Dimensions and Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Dimensions</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              name="dimensions.length"
              value={formData.dimensions.length}
              onChange={handleChange}
              placeholder="Length"
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="number"
              name="dimensions.width"
              value={formData.dimensions.width}
              onChange={handleChange}
              placeholder="Width"
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="number"
              name="dimensions.height"
              value={formData.dimensions.height}
              onChange={handleChange}
              placeholder="Height"
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="weight.value"
              value={formData.weight.value}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select
              name="weight.unit"
              value={formData.weight.unit}
              onChange={handleChange}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warranty */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Warranty</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-2">
            <input
              type="number"
              name="warranty.duration"
              value={formData.warranty.duration}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select
              name="warranty.unit"
              value={formData.warranty.unit}
              onChange={handleChange}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Main Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full"
        />
        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="mt-2 h-32 w-32 object-cover rounded"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="mt-1 block w-full"
        />
        <div className="mt-2 grid grid-cols-4 gap-4">
          {formData.galleryImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={image.alt}
                className="h-24 w-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Product Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Active</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isBestSeller"
            checked={formData.isBestSeller}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Best Seller</label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 