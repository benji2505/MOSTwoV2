import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiTrash2, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useHardware } from '../contexts/HardwareContext';
import { Event, EventStep, EventTrigger, EventAction } from '../types';

const EventEditorPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const { events, machines, addEvent, updateEvent, deleteEvent } = useHardware();
  
  const isNew = !eventId || eventId === 'new';
  const existingEvent = events.find(e => e.id === eventId);
  
  const [formData, setFormData] = useState<Partial<Event>>(() => ({
    name: '',
    description: '',
    enabled: true,
    trigger: { type: 'schedule', schedule: '0 * * * *' },
    actions: [],
    ...existingEvent
  }));

  const [newAction, setNewAction] = useState<Partial<EventAction>>({
    type: 'http_request',
    targetMachineId: '',
    endpoint: '',
    method: 'GET',
    body: ''
  });

  useEffect(() => {
    if (existingEvent) {
      setFormData(existingEvent);
    }
  }, [existingEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'enabled' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTriggerChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        [name]: name === 'type' ? value as EventTrigger['type'] : value
      }
    }));
  };

  const handleNewActionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNewAction = () => {
    if (!newAction.type || !newAction.targetMachineId) {
      toast.error('Please fill in all required fields for the action');
      return;
    }

    setFormData(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction as EventAction]
    }));

    // Reset new action form
    setNewAction({
      type: 'http_request',
      targetMachineId: '',
      endpoint: '',
      method: 'GET',
      body: ''
    });
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNew) {
        await addEvent(formData as Omit<Event, 'id' | 'createdAt'>);
        toast.success('Event created successfully');
      } else {
        await updateEvent(eventId, formData as Partial<Event>);
        toast.success('Event updated successfully');
      }
      navigate('/events');
    } catch (error) {
      toast.error(`Failed to ${isNew ? 'create' : 'update'} event`);
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!eventId || isNew) return;
    
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
        toast.success('Event deleted successfully');
        navigate('/events');
      } catch (error) {
        toast.error('Failed to delete event');
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
            {isNew ? 'Create New Event' : 'Edit Event'}
          </h1>
        </div>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <FiTrash2 className="inline mr-2" />
            Delete Event
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-medium">Event Details</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Name
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enabled
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-medium">Trigger</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="trigger-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trigger Type
              </label>
              <select
                id="trigger-type"
                name="type"
                value={formData.trigger?.type || 'schedule'}
                onChange={handleTriggerChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="schedule">Schedule</option>
                <option value="webhook">Webhook</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {formData.trigger?.type === 'schedule' && (
              <div>
                <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cron Schedule
                </label>
                <input
                  type="text"
                  id="schedule"
                  name="schedule"
                  value={formData.trigger?.schedule || ''}
                  onChange={handleTriggerChange}
                  placeholder="0 * * * *"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Cron format: minute hour day month day-of-week
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-medium">Actions</h2>
          
          {(formData.actions || []).length > 0 ? (
            <div className="space-y-4">
              {formData.actions?.map((action, index) => (
                <div key={index} className="p-4 border rounded-md border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {action.type === 'http_request' ? 'HTTP Request' : 'Action'} {index + 1}
                      </h3>
                      {action.type === 'http_request' && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {action.method} {machines.find(m => m.id === action.targetMachineId)?.name || 'Unknown Machine'}
                          {action.endpoint && `: ${action.endpoint}`}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No actions added yet.</p>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-md font-medium mb-4">Add New Action</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="action-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Action Type
                  </label>
                  <select
                    id="action-type"
                    name="type"
                    value={newAction.type}
                    onChange={handleNewActionChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="http_request">HTTP Request</option>
                    <option value="script" disabled>Script (Coming Soon)</option>
                    <option value="notification" disabled>Notification (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="target-machine" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Target Machine
                  </label>
                  <select
                    id="target-machine"
                    name="targetMachineId"
                    value={newAction.targetMachineId}
                    onChange={handleNewActionChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select a machine</option>
                    {machines.map(machine => (
                      <option key={machine.id} value={machine.id}>
                        {machine.name} ({machine.ipAddress})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newAction.type === 'http_request' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="http-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      HTTP Method
                    </label>
                    <select
                      id="http-method"
                      name="method"
                      value={newAction.method}
                      onChange={handleNewActionChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Endpoint
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                        /
                      </span>
                      <input
                        type="text"
                        id="endpoint"
                        name="endpoint"
                        value={newAction.endpoint || ''}
                        onChange={handleNewActionChange}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="api/endpoint"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(newAction.method === 'POST' || newAction.method === 'PUT') && (
                <div>
                  <label htmlFor="request-body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Request Body (JSON)
                  </label>
                  <textarea
                    id="request-body"
                    name="body"
                    rows={4}
                    value={newAction.body || ''}
                    onChange={handleNewActionChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                    placeholder='{"key": "value"}'
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addNewAction}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Action
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {isNew ? 'Create Event' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventEditorPage;
