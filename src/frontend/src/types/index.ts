// Base types
export interface BaseEntity {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Machine types
export interface Machine extends BaseEntity {
  type: 'raspberry-pi' | 'arduino' | 'simulator' | string;
  config: MachineConfig;
  status: 'online' | 'offline' | 'error';
  lastSeen?: string;
}

export interface MachineConfig {
  connection: {
    type: 'local' | 'network' | 'serial';
    address?: string;
    port?: number;
    baudRate?: number;
  };
  inputs: MachineInput[];
  outputs: MachineOutput[];
  settings: Record<string, any>;
}

export interface MachineInput {
  id: string;
  name: string;
  type: 'digital' | 'analog' | 'i2c' | 'spi' | 'uart';
  pin: number | string;
  mode?: 'input' | 'input_pullup' | 'input_pulldown';
  inverted?: boolean;
  minValue?: number;
  maxValue?: number;
  debounceMs?: number;
}

export interface MachineOutput {
  id: string;
  name: string;
  type: 'digital' | 'pwm' | 'servo' | 'i2c' | 'spi' | 'uart';
  pin: number | string;
  initialState?: boolean | number;
  minValue?: number;
  maxValue?: number;
  inverted?: boolean;
}

export interface MachineState {
  timestamp: string;
  inputs: Record<string, boolean | number>;
  outputs: Record<string, boolean | number>;
  cpu?: {
    usage: number;
    temperature: number;
  };
  memory?: {
    total: number;
    used: number;
    free: number;
  };
  uptime?: number;
  error?: string;
}

// Event types
export interface Event extends BaseEntity {
  steps: EventStep[];
  enabled: boolean;
  lastRun?: string;
  lastStatus?: 'success' | 'error' | 'running' | 'stopped';
}

export type EventStep =
  | SetOutputStep
  | WaitStep
  | ConditionalStep
  | LoopStep
  | ParallelStep
  | MQTTPublishStep
  | HTTPRequestStep;

export interface BaseStep {
  id: string;
  type: string;
  name?: string;
  description?: string;
}

export interface SetOutputStep extends BaseStep {
  type: 'set_output';
  outputId: string;
  value: boolean | number;
  machineId?: string; // If not specified, applies to all machines with this output
}

export interface WaitStep extends BaseStep {
  type: 'wait';
  duration: number; // in milliseconds
}

export interface ConditionalStep extends BaseStep {
  type: 'conditional';
  condition: Condition;
  trueSteps: EventStep[];
  falseSteps?: EventStep[];
}

export interface LoopStep extends BaseStep {
  type: 'loop';
  count?: number; // If not specified, loops forever until stopped
  steps: EventStep[];
}

export interface ParallelStep extends BaseStep {
  type: 'parallel';
  steps: EventStep[];
}

export interface MQTTPublishStep extends BaseStep {
  type: 'mqtt_publish';
  topic: string;
  payload: string | Record<string, any>;
  qos?: 0 | 1 | 2;
  retain?: boolean;
}

export interface HTTPRequestStep extends BaseStep {
  type: 'http_request';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus?: number | number[];
}

export type Condition =
  | AndCondition
  | OrCondition
  | NotCondition
  | InputCondition
  | TimeCondition
  | CompareCondition;

export interface AndCondition {
  type: 'and';
  conditions: Condition[];
}

export interface OrCondition {
  type: 'or';
  conditions: Condition[];
}

export interface NotCondition {
  type: 'not';
  condition: Condition;
}

export interface InputCondition {
  type: 'input';
  inputId: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
  value: any;
  value2?: any; // For 'between' operator
  machineId?: string;
}

export interface TimeCondition {
  type: 'time';
  operator: 'before' | 'after' | 'between' | 'weekday';
  time: string; // HH:MM
  time2?: string; // For 'between' operator
  weekdays?: number[]; // 0-6 (Sunday-Saturday)
  timezone?: string; // IANA timezone (e.g., 'America/New_York')
}

export interface CompareCondition {
  type: 'compare';
  left: { type: 'input' | 'value'; value: any; inputId?: string; machineId?: string };
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  right: { type: 'input' | 'value'; value: any; inputId?: string; machineId?: string };
}

// Execution types
export interface EventExecution {
  id: string;
  eventId: string;
  eventName: string;
  machineId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  currentStep?: {
    id: string;
    name?: string;
    type: string;
    startedAt: string;
  };
  progress?: number; // 0-100
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// UI types
export interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
  roles?: string[];
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'password' | 'date' | 'time' | 'datetime-local' | 'color' | 'range' | 'file';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  validate?: (value: any) => string | undefined;
  disabled?: boolean;
  hidden?: boolean;
  helpText?: string;
  className?: string;
}

// Chart types
export interface TimeSeriesDataPoint {
  timestamp: string | Date;
  [key: string]: string | number | Date | undefined;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'doughnut' | 'radar' | 'gauge' | 'status';
  title?: string;
  xAxis?: {
    field: string;
    label?: string;
    type?: 'time' | 'category' | 'linear';
    timeFormat?: string;
  };
  yAxis?: {
    label?: string;
    min?: number;
    max?: number;
    unit?: string;
  };
  series: Array<{
    field: string;
    label: string;
    color?: string;
    type?: 'line' | 'bar' | 'scatter';
    fill?: boolean;
    tension?: number;
  }>;
  legend?: boolean;
  tooltip?: boolean;
  grid?: boolean;
  height?: number | string;
  width?: number | string;
}
