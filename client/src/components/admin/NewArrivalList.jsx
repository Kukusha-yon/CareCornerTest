import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminNewArrivals, deleteNewArrival } from '../../services/newArrivalService';

const NewArrivalList = () => {
  const [selectedNewArrival, setSelectedNewArrival] = useState(null);
  const queryClient = useQueryClient();

  const { data: newArrivals, isLoading } = useQuery({
    queryKey: ['adminNewArrivals'],
    queryFn: getAdminNewArrivals
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNewArrival,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminNewArrivals']);
      setSelectedNewArrival(null);
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this new arrival?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting new arrival:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Arrivals Management</h1>
        <Link
          to="/admin/new-arrivals/create"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Add New Arrival
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {newArrivals?.map((newArrival) => (
              <tr key={newArrival._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={newArrival.image}
                    alt={newArrival.title}
                    className="h-16 w-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {newArrival.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {newArrival.description.substring(0, 50)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {newArrival.productId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${newArrival.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      newArrival.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : newArrival.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {newArrival.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/admin/new-arrivals/edit/${newArrival._id}`}
                    className="text-primary hover:text-primary-dark mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(newArrival._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewArrivalList; 