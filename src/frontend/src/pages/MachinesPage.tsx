import React, { useState } from 'react';
import { useHardware } from '../contexts/HardwareContext';
import { Machine, MachineState } from '../types';
import { 
  FiPlus, FiEdit2, FiTrash2, FiPower, FiRefreshCw, FiSearch, 
  FiServer, FiWifi, FiWifiOff, FiAlertCircle, FiClock, FiCpu
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MachinesPage: React.FC = () => {
  const { 
    machines, 
    machineStates, 
    isLoading, 
    error, 
    createMachine, 
    updateMachine, 
    deleteMachine,
    fetchMachines
  } = useHardware();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<string | null>(null);
  const [newMachine, setNewMachine] = useState<Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>>({ 
    name: '',
    description: '',
    type: 'raspberry-pi',
    status: 'offline',
    config: {
      connection: {
        type: 'network',
        address: '',
        port: 22
      },
      inputs: [],
      outputs: [],
      settings: {}
    }
  });

  // Filter machines based on search query
  const filteredMachines = React.useMemo(() => {
    if (!searchQuery.trim()) return machines;
    const query = searchQuery.toLowerCase();
    return machines.filter(machine => 
      machine.name.toLowerCase().includes(query) || 
      machine.description?.toLowerCase().includes(query) ||
      machine.type.toLowerCase().includes(query) ||
      machine.status.toLowerCase().includes(query)
    );
  }, [machines, searchQuery]);

  // Get the latest state for a machine
  const getMachineState = (machineId: string): MachineState | null => {
    return machineStates[machineId] || null;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (editingMachine) {
      setEditingMachine({
        ...editingMachine,
        [name]: value
      });
    } else {
      setNewMachine({
        ...newMachine,
        [name]: value
      });
    }
  };

  // Handle config changes
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    
    if (editingMachine) {
      setEditingMachine({
        ...editingMachine,
        config: {
          ...editingMachine.config,
          [parent]: {
            ...editingMachine.config[parent as keyof typeof editingMachine.config],
            [child]: value
          }
        }
      });
    } else {
      setNewMachine({
        ...newMachine,
        config: {
          ...newMachine.config,
          [parent]: {
            ...newMachine.config[parent as keyof typeof newMachine.config],
            [child]: value
          }
        }
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await updateMachine(editingMachine.id, editingMachine);
        setEditingMachine(null);
      } else {
        await createMachine(newMachine);
        setNewMachine({ 
          name: '',
          description: '',
          type: 'raspberry-pi',
          status: 'offline',
          config: {
            connection: {
              type: 'network',
              address: '',
              port: 22
            },
            inputs: [],
            outputs: [],
            settings: {}
          }
        });
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Error saving machine:', err);
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (machineToDelete) {
      try {
        await deleteMachine(machineToDelete);
        setIsDeleteModalOpen(false);
        setMachineToDelete(null);
      } catch (err) {
        console.error('Error deleting machine:', err);
      }
    }
  };

  // Toggle machine status
  const toggleMachineStatus = async (machine: Machine) => {
    const newStatus = machine.status === 'online' ? 'offline' : 'online';
    await updateMachine(machine.id, { status: newStatus });
  };

  // Refresh machine data
  const refreshMachines = async () => {
    await fetchMachines();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Machines</h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={refreshMachines}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingMachine(null);
              setIsCreating(true);
            }}
            className="btn btn-primary"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Machine
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
            placeholder="Search machines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredMachines.length} {filteredMachines.length === 1 ? 'machine' : 'machines'} found
          </span>
        </div>
      </div>

      {/* Machines grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && filteredMachines.length === 0 ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiServer className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No machines</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding a new machine.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                New Machine
              </button>
            </div>
          </div>
        ) : (
          filteredMachines.map((machine) => {
            const state = getMachineState(machine.id);
            const isOnline = machine.status === 'online';
            
            return (
              <div key={machine.id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
                          isOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                        <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                          {machine.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {machine.description || 'No description'}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isOnline 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {machine.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <div className="flex items-center">
                        <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                          isOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`}></span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {machine.status}
                        </span>
                      </div>
                    </div>
                    
                    {state && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Uptime</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {state.uptime ? `${Math.floor(state.uptime / 3600)}h ${Math.floor((state.uptime % 3600) / 60)}m` : 'N/A'}
                          </span>
                        </div>
                        {state.cpu && (
                          <div className="mt-1">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>CPU</span>
                              <span>{state.cpu.usage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${state.cpu.usage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 px-5 py-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleMachineStatus(machine)}
                      className={`p-2 rounded-md ${
                        isOnline 
                          ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30' 
                          : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                      title={isOnline ? 'Turn Off' : 'Turn On'}
                    >
                      {isOnline ? <FiPower className="h-5 w-5" /> : <FiPower className="h-5 w-5" />}
                    </button>
                    <Link
                      to={`/machines/${machine.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                      title="View Details"
                    >
                      <FiCpu className="h-5 w-5" />
                    </Link>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingMachine(machine)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                      title="Edit"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setMachineToDelete(machine.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md"
                      title="Delete"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Machine Modal */}
      {(isCreating || editingMachine) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editingMachine ? 'Edit Machine' : 'Add New Machine'}
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
                      value={editingMachine ? editingMachine.name : newMachine.name}
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
                      rows={2}
                      value={editingMachine ? editingMachine.description || '' : newMachine.description || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="form-label">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={editingMachine ? editingMachine.type : newMachine.type}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="raspberry-pi">Raspberry Pi</option>
                      <option value="arduino">Arduino</option>
                      <option value="esp32">ESP32</option>
                      <option value="esp8266">ESP8266</option>
                      <option value="simulator">Simulator</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Connection Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="connection.type" className="form-label">
                          Connection Type
                        </label>
                        <select
                          id="connection.type"
                          name="connection.type"
                          value={editingMachine ? editingMachine.config.connection.type : newMachine.config.connection.type}
                          onChange={handleConfigChange}
                          className="form-input"
                        >
                          <option value="network">Network</option>
                          <option value="serial">Serial</option>
                          <option value="bluetooth">Bluetooth</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="connection.address" className="form-label">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="connection.address"
                          name="connection.address"
                          value={editingMachine ? editingMachine.config.connection.address || '' : newMachine.config.connection.address || ''}
                          onChange={handleConfigChange}
                          className="form-input"
                          required
                          placeholder={editingMachine?.config.connection.type === 'network' ? 'e.g., 192.168.1.100' : 'e.g., /dev/ttyUSB0'}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="connection.port" className="form-label">
                          Port
                        </label>
                        <input
                          type="number"
                          id="connection.port"
                          name="connection.port"
                          value={editingMachine ? editingMachine.config.connection.port || '' : newMachine.config.connection.port || ''}
                          onChange={handleConfigChange}
                          className="form-input"
                          min="1"
                          max="65535"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="connection.baudRate" className="form-label">
                          Baud Rate (Serial)
                        </label>
                        <select
                          id="connection.baudRate"
                          name="connection.baudRate"
                          value={editingMachine?.config.connection.baudRate || ''}
                          onChange={handleConfigChange}
                          className="form-input"
                        >
                          <option value="">Select baud rate</option>
                          <option value="9600">9600</option>
                          <option value="19200">19200</option>
                          <option value="38400">38400</option>
                          <option value="57600">57600</option>
                          <option value="115200">115200</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingMachine(null);
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
                    {isLoading ? 'Saving...' : 'Save Machine'}
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
                    Delete Machine
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete this machine? This action cannot be undone.
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
                    setMachineToDelete(null);
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

export default MachinesPage;
