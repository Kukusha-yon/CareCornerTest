import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPartners, createPartner, updatePartner, deletePartner } from '../../services/partnerService';
import { toast } from 'react-hot-toast';

const Partners = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    link: '',
    order: 0
  });
  const [previewUrl, setPreviewUrl] = useState('');

  // Fetch partners
  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: getPartners
  });

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['partners']);
      toast.success('Partner added successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error adding partner');
    }
  });

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: ({ id, data }) => updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['partners']);
      toast.success('Partner updated successfully');
      setIsModalOpen(false);
      setEditingPartner(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating partner');
    }
  });

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries(['partners']);
      toast.success('Partner deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error deleting partner');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPartner) {
      updatePartnerMutation.mutate({ id: editingPartner._id, data: formData });
    } else {
      createPartnerMutation.mutate(formData);
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo: null,
      link: partner.link,
      order: partner.order
    });
    setPreviewUrl(partner.logo);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      deletePartnerMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: null,
      link: '',
      order: 0
    });
    setPreviewUrl('');
    setEditingPartner(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Partners Management</h1>
        <button
          onClick={openModal}
          className="bg-[#39b54a] text-white px-4 py-2 rounded-lg hover:bg-[#2d8f3a] transition-colors"
        >
          Add New Partner
        </button>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Logo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners?.map((partner) => (
              <tr key={partner._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-10 w-auto object-contain"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{partner.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#39b54a] hover:text-[#2d8f3a]"
                  >
                    {partner.link}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{partner.order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(partner)}
                    className="text-[#39b54a] hover:text-[#2d8f3a] mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(partner._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="mt-1 flex items-center">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mr-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39b54a]"
                  >
                    Choose Image
                  </label>
                </div>
                {!editingPartner && !formData.logo && (
                  <p className="mt-1 text-sm text-red-600">Logo is required</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#39b54a]"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#39b54a] text-white rounded-lg hover:bg-[#2d8f3a]"
                >
                  {editingPartner ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners; 