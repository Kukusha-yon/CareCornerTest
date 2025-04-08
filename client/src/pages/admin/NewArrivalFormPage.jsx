import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import NewArrivalForm from '../../components/admin/NewArrivalForm';
import { getNewArrivalById, createNewArrival, updateNewArrival } from '../../services/newArrivalService';
import Spinner from '../../components/common/Spinner';

const NewArrivalFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(id);

  // Fetch existing new arrival if editing
  const { data: existingNewArrival, isLoading: isLoadingNewArrival } = useQuery({
    queryKey: ['newArrival', id],
    queryFn: () => getNewArrivalById(id),
    enabled: isEditing,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createNewArrival,
    onSuccess: () => {
      queryClient.invalidateQueries(['newArrivals']);
      toast.success('New arrival created successfully');
      navigate('/admin/new-arrivals');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error creating new arrival');
      setIsLoading(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateNewArrival(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['newArrivals']);
      toast.success('New arrival updated successfully');
      navigate('/admin/new-arrivals');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating new arrival');
      setIsLoading(false);
    },
  });

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
    }
  };

  if (isLoadingNewArrival) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit New Arrival' : 'Add New Arrival'}
      </h1>
      <NewArrivalForm
        existingNewArrival={existingNewArrival}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NewArrivalFormPage; 