import React, { useState } from 'react';
import { useHardware } from '../contexts/HardwareContext';
import { Event, EventExecution, EventStep } from '../types';
import { 
  FiPlus, FiEdit2, FiTrash2, FiPlay, FiStopCircle, FiRefreshCw, 
  FiSearch, FiClock, FiCheckCircle, FiAlertCircle, FiPause, FiPlayCircle 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EventsPage: React.FC = () => {
  const { 
    events, 
    activeExecutions, 
    isLoading, 
    error, 
    createEvent, 
    updateEvent, 
    deleteEvent,
    executeEvent,
    stopExecution,
    fetchEvents
  } = useHardware();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'lastStatus'>>({ 
    name: '',
    description: '',
    enabled: true,
    steps: []
  });

  // Filter events based on search query
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.name.toLowerCase().includes(query) || 
      event.description?.toLowerCase().includes(query) ||
      event.id.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  // Check if an event is currently running
  const isEventRunning = (eventId: string): boolean => {
    return activeExecutions.some(exec => exec.eventId === eventId && 
      (exec.status === 'running' || exec.status === 'pending'));
  };

  // Get the latest execution for an event
  const getLatestExecution = (eventId: string): EventExecution | undefined => {
    return activeExecutions
      .filter(exec => exec.eventId === eventId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        [name]: type === 'checkbox' ? checked : value
      });
    } else {
      setNewEvent({
        ...newEvent,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, editingEvent);
        setEditingEvent(null);
      } else {
        await createEvent(newEvent);
        setNewEvent({ 
          name: '',
          description: '',
          enabled: true,
          steps: []
        });
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete);
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  // Toggle event status
  const toggleEventStatus = async (event: Event) => {
    await updateEvent(event.id, { enabled: !event.enabled });
  };

  // Refresh events data
  const refreshEvents = async () => {
    await fetchEvents();
  };

  // Format date to a readable format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'stopped':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={refreshEvents}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsCreating(true);
            }}
            className="btn btn-primary"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Create Event
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <FiAlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10 w-full"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
          </span>
        </div>
      </div>

      {/* Events list */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading && filteredEvents.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </li>
          ) : filteredEvents.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <FiClock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No events</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new event.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="btn btn-primary"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Event
                </button>
              </div>
            </li>
          ) : (
            filteredEvents.map((event) => {
              const isRunning = isEventRunning(event.id);
              const latestExecution = getLatestExecution(event.id);
              
              return (
                <li key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-3 w-3 rounded-full ${
                            isRunning ? 'bg-blue-400' : 
                            event.enabled ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <p className="ml-3 text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                          {event.name}
                        </p>
                        {latestExecution && (
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(latestExecution.status)
                          }`}>
                            {latestExecution.status}
                          </span>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex space-x-1">
                        {isRunning ? (
                          <button
                            onClick={() => {
                              const exec = activeExecutions.find(e => e.eventId === event.id && e.status === 'running');
                              if (exec) {
                                stopExecution(exec.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                            title="Stop Execution"
                          >
                            <FiStopCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => executeEvent(event.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                            title="Run Event"
                            disabled={!event.enabled}
                          >
                            <FiPlay className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-full"
                          title="Edit"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEventToDelete(event.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-full"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {event.description || 'No description'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          Last run: {formatDate(event.lastRun)}
                        </p>
                      </div>
                    </div>
                    {latestExecution && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Progress</span>
                          <span>{latestExecution.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${latestExecution.progress || 0}%` }}
                          ></div>
                        </div>
                        {latestExecution.currentStep && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            Step: {latestExecution.currentStep.name || latestExecution.currentStep.type}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Create/Edit Event Modal */}
      {(isCreating || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editingEvent ? editingEvent.name : newEvent.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={editingEvent ? editingEvent.description || '' : newEvent.description || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="enabled"
                      name="enabled"
                      type="checkbox"
                      checked={editingEvent ? editingEvent.enabled : newEvent.enabled}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enable this event
                    </label>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Event Steps
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {editingEvent?.steps?.length || 0} steps defined
                      </p>
                      
                      <div className="space-y-3">
                        {editingEvent?.steps?.map((step, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {step.name || `Step ${index + 1}`}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {step.type}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No steps defined yet. Add steps to create your automation workflow.
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <button
                          type="button"
                          className="btn btn-secondary w-full"
                        >
                          <FiPlus className="mr-2 h-4 w-4" />
                          Add Step
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingEvent(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                  <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Delete Event
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete this event? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setEventToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
