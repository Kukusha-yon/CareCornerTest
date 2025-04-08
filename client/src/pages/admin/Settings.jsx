import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    currency: 'USD',
    logo: null,
    favicon: null
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings');
      return response.data;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      const response = await api.put('/admin/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Settings updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-[#39b54a] text-white rounded-lg hover:bg-[#2d8f3a] transition-colors"
        >
          {isEditing ? 'Cancel Editing' : 'Edit Settings'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
              General Settings
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  value={formData.siteDescription}
                  onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a] sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a] sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a] sm:text-sm"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a] sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <PhotoIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
              Branding
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  {formData.logo && (
                    <img
                      src={typeof formData.logo === 'string' ? formData.logo : URL.createObjectURL(formData.logo)}
                      alt="Logo preview"
                      className="h-12 w-auto"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'logo')}
                    disabled={!isEditing}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#39b54a] file:text-white hover:file:bg-[#2d8f3a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Favicon
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  {formData.favicon && (
                    <img
                      src={typeof formData.favicon === 'string' ? formData.favicon : URL.createObjectURL(formData.favicon)}
                      alt="Favicon preview"
                      className="h-8 w-8"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'favicon')}
                    disabled={!isEditing}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#39b54a] file:text-white hover:file:bg-[#2d8f3a]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
              Currency Settings
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Currency
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a] sm:text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#39b54a] text-white rounded-lg hover:bg-[#2d8f3a] transition-colors"
                disabled={updateSettingsMutation.isLoading}
              >
                {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings; 