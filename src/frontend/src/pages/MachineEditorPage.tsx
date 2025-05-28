import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useHardware } from '../contexts/HardwareContext';
import { Machine } from '../types';

const MachineEditorPage: React.FC = () => {
  const { machineId } = useParams<{ machineId?: string }>();
  const navigate = useNavigate();
  const { machines, addMachine, updateMachine, deleteMachine } = useHardware();
  
  const isNew = !machineId || machineId === 'new';
  const existingMachine = machines.find(m => m.id === machineId);
  
  const [formData, setFormData] = useState<Partial<Machine>>(() => ({
    name: '',
    type: 'raspberry_pi',
    ipAddress: '',
    port: 1880,
    status: 'offline',
    ...existingMachine
  }));

  useEffect(() => {
    if (existingMachine) {
      setFormData(existingMachine);
    }
  }, [existingMachine]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) {
        await addMachine(formData as Omit<Machine, 'id' | 'createdAt'>);
        toast.success('Machine added successfully');
      } else {
        await updateMachine(machineId, formData as Partial<Machine>);
        toast.success('Machine updated successfully');
      }
      navigate('/machines');
    } catch (error) {
      toast.error(`Failed to ${isNew ? 'add' : 'update'} machine`);
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!machineId || isNew) return;
    
    if (window.confirm('Are you sure you want to delete this machine? This action cannot be undone.')) {
      try {
        await deleteMachine(machineId);
        toast.success('Machine deleted successfully');
        navigate('/machines');
      } catch (error) {
        toast.error('Failed to delete machine');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">
            {isNew ? 'Add New Machine' : 'Edit Machine'}
          </h1>
        </div>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <FiTrash2 className="inline mr-2" />
            Delete Machine
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Machine Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Machine Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="raspberry_pi">Raspberry Pi</option>
              <option value="arduino">Arduino</option>
              <option value="esp32">ESP32</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              IP Address
            </label>
            <input
              type="text"
              id="ipAddress"
              name="ipAddress"
              value={formData.ipAddress || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Port
            </label>
            <input
              type="number"
              id="port"
              name="port"
              min="1"
              max="65535"
              value={formData.port || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/machines')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {isNew ? 'Create Machine' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MachineEditorPage;
