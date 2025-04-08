import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Upload } from 'lucide-react';

const NewArrivalForm = ({ existingNewArrival, onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    detailedDescription: '',
    price: '',
    category: '',
    image: null,
    galleryImages: [],
    isActive: true,
    startDate: '',
    endDate: '',
    features: [''],
    specifications: new Map(),
    seoMetadata: {
      title: '',
      description: '',
      keywords: []
    }
  });
  const [imagePreview, setImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [errors, setErrors] = useState({});

  // Set form data if editing an existing new arrival
  useEffect(() => {
    if (existingNewArrival) {
      setFormData({
        name: existingNewArrival.name || '',
        description: existingNewArrival.description || '',
        detailedDescription: existingNewArrival.detailedDescription || '',
        price: existingNewArrival.price || '',
        category: existingNewArrival.category || '',
        image: null,
        galleryImages: [],
        isActive: existingNewArrival.isActive ?? true,
        startDate: existingNewArrival.startDate ? new Date(existingNewArrival.startDate).toISOString().split('T')[0] : '',
        endDate: existingNewArrival.endDate ? new Date(existingNewArrival.endDate).toISOString().split('T')[0] : '',
        features: existingNewArrival.features || [''],
        specifications: new Map(Object.entries(existingNewArrival.specifications || {})),
        seoMetadata: existingNewArrival.seoMetadata || {
          title: '',
          description: '',
          keywords: []
        }
      });
      setImagePreview(existingNewArrival.image || '');
      setGalleryPreviews(existingNewArrival.galleryImages?.map(img => img.url) || []);
    }
  }, [existingNewArrival]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle gallery images change
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, galleryImages: files }));
    
    // Create preview URLs
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle feature changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  // Add new feature field
  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  // Remove feature field
  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  // Handle specification changes
  const handleSpecificationChange = (key, value) => {
    const newSpecifications = new Map(formData.specifications);
    if (value) {
      newSpecifications.set(key, value);
    } else {
      newSpecifications.delete(key);
    }
    setFormData(prev => ({ ...prev, specifications: newSpecifications }));
  };

  // Add new specification field
  const addSpecification = () => {
    const newSpecifications = new Map(formData.specifications);
    newSpecifications.set('', '');
    setFormData(prev => ({ ...prev, specifications: newSpecifications }));
  };

  // Remove specification field
  const removeSpecification = (key) => {
    const newSpecifications = new Map(formData.specifications);
    newSpecifications.delete(key);
    setFormData(prev => ({ ...prev, specifications: newSpecifications }));
  };

  // Handle SEO metadata changes
  const handleSeoMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        [field]: value
      }
    }));
  };

  // Handle keyword changes
  const handleKeywordChange = (index, value) => {
    const newKeywords = [...formData.seoMetadata.keywords];
    newKeywords[index] = value;
    setFormData(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        keywords: newKeywords
      }
    }));
  };

  // Add new keyword field
  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        keywords: [...prev.seoMetadata.keywords, '']
      }
    }));
  };

  // Remove keyword field
  const removeKeyword = (index) => {
    const newKeywords = formData.seoMetadata.keywords.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        keywords: newKeywords
      }
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!existingNewArrival && !formData.image) {
      newErrors.image = 'Image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create FormData object for file upload
    const formDataToSubmit = new FormData();
    
    // Add basic fields
    formDataToSubmit.append('name', formData.name);
    formDataToSubmit.append('description', formData.description);
    formDataToSubmit.append('detailedDescription', formData.detailedDescription);
    formDataToSubmit.append('price', formData.price);
    formDataToSubmit.append('category', formData.category);
    formDataToSubmit.append('isActive', formData.isActive);
    
    // Add dates if they exist
    if (formData.startDate) {
      formDataToSubmit.append('startDate', formData.startDate);
    }
    if (formData.endDate) {
      formDataToSubmit.append('endDate', formData.endDate);
    }
    
    // Add arrays and objects as JSON strings
    formDataToSubmit.append('features', JSON.stringify(formData.features.filter(f => f.trim())));
    formDataToSubmit.append('specifications', JSON.stringify(Object.fromEntries(formData.specifications)));
    formDataToSubmit.append('seoMetadata', JSON.stringify(formData.seoMetadata));
    
    // Add images
    if (formData.image) {
      formDataToSubmit.append('image', formData.image);
    }
    
    if (formData.galleryImages.length > 0) {
      formData.galleryImages.forEach((image, index) => {
        formDataToSubmit.append('galleryImages', image);
      });
    }
    
    try {
      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'Error submitting form' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Detailed Description */}
        <div className="col-span-2">
          <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Description
          </label>
          <textarea
            id="detailedDescription"
            name="detailedDescription"
            value={formData.detailedDescription}
            onChange={handleInputChange}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className="col-span-2">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Main Image {!existingNewArrival && <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.image ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preview:</p>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs h-auto rounded-md border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <div className="col-span-2">
          <label htmlFor="galleryImages" className="block text-sm font-medium text-gray-700 mb-1">
            Gallery Images
          </label>
          <input
            type="file"
            id="galleryImages"
            name="galleryImages"
            onChange={handleGalleryChange}
            accept="image/*"
            multiple
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          
          {/* Gallery Previews */}
          {galleryPreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Status */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        {/* Date Range */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter feature"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center text-blue-600 hover:text-blue-800"
              disabled={isSubmitting}
            >
              <Plus size={16} className="mr-1" />
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
                  onChange={(e) => handleSpecificationChange(e.target.value, value)}
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Specification name"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleSpecificationChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Specification value"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="p-2 text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center text-blue-600 hover:text-blue-800"
              disabled={isSubmitting}
            >
              <Plus size={16} className="mr-1" />
              Add Specification
            </button>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Metadata
          </label>
          <div className="space-y-4">
            <div>
              <label htmlFor="seoTitle" className="block text-sm text-gray-600 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                id="seoTitle"
                value={formData.seoMetadata.title}
                onChange={(e) => handleSeoMetadataChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="seoDescription" className="block text-sm text-gray-600 mb-1">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                value={formData.seoMetadata.description}
                onChange={(e) => handleSeoMetadataChange('description', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                SEO Keywords
              </label>
              <div className="space-y-2">
                {formData.seoMetadata.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleKeywordChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter keyword"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      disabled={isSubmitting}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addKeyword}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                  disabled={isSubmitting}
                >
                  <Plus size={16} className="mr-1" />
                  Add Keyword
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/admin/new-arrivals')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : existingNewArrival ? 'Update New Arrival' : 'Create New Arrival'}
        </button>
      </div>
    </form>
  );
};

export default NewArrivalForm; 