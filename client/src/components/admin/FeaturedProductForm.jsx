import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  getFeaturedProduct, 
  createFeaturedProduct, 
  updateFeaturedProduct 
} from '../../services/featuredProductService';
import { Plus, X, Upload } from 'lucide-react';

const FeaturedProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    image: '',
    galleryImages: [],
    order: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    link: '',
    productId: '',
    buttonText: '',
    highlightText: '',
    features: [''],
    specifications: new Map(),
    seoMetadata: {
      title: '',
      description: '',
      keywords: []
    }
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Fetch featured product data if editing
  const { data: featuredProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['featuredProduct', id],
    queryFn: () => getFeaturedProduct(id),
    enabled: isEditing
  });

  // Set form data when featured product is loaded
  useEffect(() => {
    if (featuredProduct) {
      setFormData({
        ...featuredProduct,
        startDate: featuredProduct.startDate ? new Date(featuredProduct.startDate).toISOString().split('T')[0] : '',
        endDate: featuredProduct.endDate ? new Date(featuredProduct.endDate).toISOString().split('T')[0] : '',
        features: featuredProduct.features || [''],
        specifications: new Map(Object.entries(featuredProduct.specifications || {})),
        seoMetadata: featuredProduct.seoMetadata || {
          title: '',
          description: '',
          keywords: []
        }
      });
      setPreviewUrls(featuredProduct.galleryImages?.map(img => img.url) || []);
    }
  }, [featuredProduct]);

  const createMutation = useMutation({
    mutationFn: createFeaturedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['featuredProducts']);
      toast.success('Featured product created successfully');
      navigate('/admin/featured-products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create featured product');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFeaturedProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['featuredProducts']);
      queryClient.invalidateQueries(['featuredProduct', id]);
      toast.success('Featured product updated successfully');
      navigate('/admin/featured-products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update featured product');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
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
    setFormData(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
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

  const handleSpecificationChange = (key, value) => {
    setFormData(prev => {
      const newSpecs = new Map(prev.specifications);
      newSpecs.set(key, value);
      return { ...prev, specifications: newSpecs };
    });
  };

  const addSpecification = () => {
    setFormData(prev => {
      const newSpecs = new Map(prev.specifications);
      newSpecs.set('', '');
      return { ...prev, specifications: newSpecs };
    });
  };

  const removeSpecification = (key) => {
    setFormData(prev => {
      const newSpecs = new Map(prev.specifications);
      newSpecs.delete(key);
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles([file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    
    // Append basic fields
    Object.keys(formData).forEach(key => {
      if (key !== 'image' && key !== 'galleryImages' && key !== 'specifications') {
        if (key === 'features') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'seoMetadata') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      }
    });

    // Append specifications
    const specsObject = Object.fromEntries(formData.specifications);
    submitData.append('specifications', JSON.stringify(specsObject));

    // Append images
    if (imageFiles[0]) {
      submitData.append('image', imageFiles[0]);
    }
    galleryFiles.forEach((file, index) => {
      submitData.append(`galleryImages`, file);
    });

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Featured Product' : 'Add New Featured Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description
              </label>
              <textarea
                name="detailedDescription"
                value={formData.detailedDescription}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="5"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    cursor-pointer"
                  required={!isEditing}
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gallery Images
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    cursor-pointer"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Link */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Product ID */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product ID
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter the ID of the product to feature"
              />
              <p className="mt-1 text-sm text-gray-500">
                This is the ID of the product you want to feature. You can find this in the product management page.
              </p>
            </div>

            {/* Display Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Link and Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Highlight Text */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlight Text
              </label>
              <input
                type="text"
                name="highlightText"
                value={formData.highlightText}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Features */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Feature ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus size={20} className="mr-1" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications
              </label>
              <div className="space-y-2">
                {Array.from(formData.specifications.entries()).map(([key, value], index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newSpecs = new Map(formData.specifications);
                        newSpecs.delete(key);
                        newSpecs.set(e.target.value, value);
                        setFormData(prev => ({ ...prev, specifications: newSpecs }));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Specification name"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleSpecificationChange(key, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Specification value"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecification}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus size={20} className="mr-1" />
                  Add Specification
                </button>
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                name="seoMetadata.title"
                value={formData.seoMetadata.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                name="seoMetadata.description"
                value={formData.seoMetadata.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Keywords
              </label>
              <input
                type="text"
                name="seoMetadata.keywords"
                value={formData.seoMetadata.keywords.join(', ')}
                onChange={(e) => {
                  const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                  setFormData(prev => ({
                    ...prev,
                    seoMetadata: {
                      ...prev.seoMetadata,
                      keywords
                    }
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter keywords separated by commas"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/featured-products')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? 'Update Featured Product' : 'Create Featured Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeaturedProductForm; 