import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Machine, MachineState, Event, EventExecution } from '../types';

interface HardwareContextType {
  machines: Machine[];
  machineStates: Record<string, MachineState>;
  events: Event[];
  activeExecutions: EventExecution[];
  isLoading: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  fetchMachines: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  createMachine: (machine: Omit<Machine, 'id'>) => Promise<Machine>;
  updateMachine: (id: string, machine: Partial<Machine>) => Promise<void>;
  deleteMachine: (id: string) => Promise<void>;
  createEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  executeEvent: (eventId: string, machineId?: string) => Promise<void>;
  stopExecution: (executionId: string) => Promise<void>;
}

const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

export const HardwareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineStates, setMachineStates] = useState<Record<string, MachineState>>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<EventExecution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      path: '/ws/socket.io',
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setError('Disconnected from server. Attempting to reconnect...');
    });

    newSocket.on('machine_state_update', (data: { machineId: string; state: MachineState }) => {
      setMachineStates((prev) => ({
        ...prev,
        [data.machineId]: data.state,
      }));
    });

    newSocket.on('event_execution_started', (execution: EventExecution) => {
      setActiveExecutions((prev) => [...prev, execution]);
    });

    newSocket.on('event_execution_updated', (updatedExecution: EventExecution) => {
      setActiveExecutions((prev) =>
        prev.map((exec) =>
          exec.id === updatedExecution.id ? { ...exec, ...updatedExecution } : exec
        )
      );
    });

    newSocket.on('event_execution_completed', (completedExecution: EventExecution) => {
      setActiveExecutions((prev) =>
        prev.filter((exec) => exec.id !== completedExecution.id)
      );
    });

    newSocket.on('error', (err: Error) => {
      console.error('WebSocket error:', err);
      setError(`WebSocket error: ${err.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [socket]);

  // Fetch machines from API
  const fetchMachines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/machines');
      if (!response.ok) throw new Error('Failed to fetch machines');
      const data = await response.json();
      setMachines(data);
    } catch (err) {
      console.error('Error fetching machines:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch machines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new machine
  const createMachine = useCallback(async (machine: Omit<Machine, 'id'>): Promise<Machine> => {
    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machine),
      });
      if (!response.ok) throw new Error('Failed to create machine');
      const newMachine = await response.json();
      setMachines((prev) => [...prev, newMachine]);
      return newMachine;
    } catch (err) {
      console.error('Error creating machine:', err);
      throw err;
    }
  }, []);

  // Update a machine
  const updateMachine = useCallback(async (id: string, updates: Partial<Machine>): Promise<void> => {
    try {
      const response = await fetch(`/api/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update machine');
      const updatedMachine = await response.json();
      setMachines((prev) =>
        prev.map((machine) => (machine.id === id ? { ...machine, ...updatedMachine } : machine))
      );
    } catch (err) {
      console.error('Error updating machine:', err);
      throw err;
    }
  }, []);

  // Delete a machine
  const deleteMachine = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/machines/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete machine');
      setMachines((prev) => prev.filter((machine) => machine.id !== id));
    } catch (err) {
      console.error('Error deleting machine:', err);
      throw err;
    }
  }, []);

  // Create a new event
  const createEvent = useCallback(async (event: Omit<Event, 'id'>): Promise<Event> => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error('Failed to create event');
      const newEvent = await response.json();
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  }, []);

  // Update an event
  const updateEvent = useCallback(async (id: string, updates: Partial<Event>): Promise<void> => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update event');
      const updatedEvent = await response.json();
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, ...updatedEvent } : event))
      );
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  }, []);

  // Delete an event
  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  }, []);

  // Execute an event
  const executeEvent = useCallback(
    async (eventId: string, machineId?: string): Promise<void> => {
      try {
        const response = await fetch('/api/executions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, machineId }),
        });
        if (!response.ok) throw new Error('Failed to execute event');
      } catch (err) {
        console.error('Error executing event:', err);
        throw err;
      }
    },
    []
  );

  // Stop an execution
  const stopExecution = useCallback(async (executionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/executions/${executionId}/stop`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop execution');
    } catch (err) {
      console.error('Error stopping execution:', err);
      throw err;
    }
  }, []);

  // Connect on component mount
  useEffect(() => {
    connect();
    fetchMachines();
    fetchEvents();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchMachines, fetchEvents]);

  return (
    <HardwareContext.Provider
      value={{
        machines,
        machineStates,
        events,
        activeExecutions,
        isLoading,
        error,
        connect,
        disconnect,
        fetchMachines,
        fetchEvents,
        createMachine,
        updateMachine,
        deleteMachine,
        createEvent,
        updateEvent,
        deleteEvent,
        executeEvent,
        stopExecution,
      }}
    >
      {children}
    </HardwareContext.Provider>
  );
};

export const useHardware = (): HardwareContextType => {
  const context = useContext(HardwareContext);
  if (context === undefined) {
    throw new Error('useHardware must be used within a HardwareProvider');
  }
  return context;
};
