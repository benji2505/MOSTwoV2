import React from 'react';
import { useHardware } from '../contexts/HardwareContext';
import { FiAlertCircle, FiCheckCircle, FiClock, FiCpu, FiPlay, FiRefreshCw, FiServer, FiStopCircle } from 'react-icons/fi';

const DashboardPage: React.FC = () => {
  const { machines, machineStates, events, activeExecutions, isLoading, error } = useHardware();

  // Calculate dashboard statistics
  const stats = React.useMemo(() => ({
    totalMachines: machines.length,
    onlineMachines: machines.filter(m => m.status === 'online').length,
    totalEvents: events.length,
    activeExecutions: activeExecutions.length,
  }), [machines, events, activeExecutions]);

  // Get the latest machine states
  const latestStates = React.useMemo(() => {
    return machines.slice(0, 5).map(machine => ({
      ...machine,
      state: machineStates[machine.id],
    }));
  }, [machines, machineStates]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <FiAlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <FiServer className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Machines</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalMachines}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                      {stats.onlineMachines} online
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <FiCheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Events</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalEvents}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <FiPlay className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Executions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.activeExecutions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FiCpu className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">System Status</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                      Operational
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Machines */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Machines</h2>
          </div>
          <div className="overflow-hidden">
            <div className="flow-root">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {latestStates.length > 0 ? (
                  latestStates.map((machine) => (
                    <li key={machine.id} className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-3 w-3 rounded-full ${
                            machine.status === 'online' ? 'bg-green-400' : 
                            machine.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {machine.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                {machine.type}
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="truncate">
                              {machine.description || 'No description'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {isLoading ? 'Loading machines...' : 'No machines found'}
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-right border-t border-gray-200 dark:border-gray-700">
              <a
                href="/machines"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all machines<span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Active Executions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Executions</h2>
          </div>
          <div className="overflow-hidden">
            <div className="flow-root">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeExecutions.length > 0 ? (
                  activeExecutions.map((execution) => (
                    <li key={execution.id} className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FiPlay className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {execution.eventName}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                                {execution.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>Started {new Date(execution.startedAt).toLocaleTimeString()}</span>
                          </div>
                          {execution.currentStep && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${execution.progress || 0}%` }}
                                ></div>
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {execution.currentStep.name || execution.currentStep.type}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {isLoading ? 'Loading executions...' : 'No active executions'}
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-right border-t border-gray-200 dark:border-gray-700">
              <a
                href="/events"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all events<span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
