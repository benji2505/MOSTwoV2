# MOSTwo Project TODO List

## Phase 0: Project Setup & General
- [ ] **P0.1**: Set up Git repository.
- [ ] **P0.2**: Establish development environment (Python, Node.js, VS Code extensions).
- [ ] **P0.3**: Set up Docker for development and deployment consistency.
- [ ] **P0.4**: Choose and set up a test MQTT broker (e.g., local Mosquitto, public HiveMQ for testing).
- [ ] **P0.5**: Define coding standards and linting/formatting tools (e.g., Black, Flake8 for Python; Prettier, ESLint for TS/JS).
- [ ] **P0.6**: Basic CI/CD pipeline setup (e.g., GitHub Actions for linting and automated tests).

## Phase 1: Core Backend and Plugin System (3 weeks)

### Backend Core Infrastructure
- [ ] **P1.1.1**: Initialize FastAPI project structure.
- [ ] **P1.1.2**: Implement basic REST API scaffolding (health check endpoint).
- [ ] **P1.1.3**: Set up `asyncio` for core operations.
- [ ] **P1.1.4**: Integrate `paho-mqtt` client for basic MQTT connection.
- [ ] **P1.1.5**: Set up SQLite for logging/metadata storage.

### Hardware Abstraction & Components
- [ ] **P1.2.1**: Define and implement `HardwareInterface` abstract base class.
- [ ] **P1.2.2**: Implement `RaspberryPiInterface` (stub for now, full GPIO/ADC later).
- [ ] **P1.2.3**: Implement `ArduinoInterface` (stub for serial comms).
- [ ] **P1.2.4**: Define and implement `Component` abstract base class.
- [ ] **P1.2.5**: Implement `DigitalInput` component class.
- [ ] **P1.2.6**: Implement `DigitalOutput` component class.
- [ ] **P1.2.7**: Implement `AnalogInput` component class (stub for ADC).
- [ ] **P1.2.8**: Implement `AnalogOutput` component class (stub for PWM/DAC).

### Machine & Event Management
- [ ] **P1.3.1**: Define and implement `Machine` class.
    - [ ] **P1.3.1.1**: Logic for managing hardware components.
    - [ ] **P1.3.1.2**: Support for saving/loading machine configurations from/to JSON (FR6.1, FR6.2).
    - [ ] **P1.3.1.3**: Define JSON schema for "machine" files (FR6.3).
- [ ] **P1.3.2**: Define and implement basic `Event` class (core structure, advanced features in Phase 4).
    - [ ] **P1.3.2.1**: Support for saving/loading event sequences from/to JSON (FR7.1).
    - [ ] **P1.3.2.2**: Define JSON schema for "event" files (FR7.4, basic steps).
- [ ] **P1.3.3**: Implement API endpoints for managing machines (CRUD).
- [ ] **P1.3.4**: Implement API endpoints for managing events (CRUD).

### Plugin System
- [ ] **P1.4.1**: Define and implement `PluginManager` for dynamic loading.
- [ ] **P1.4.2**: Define Plugin API for hardware interfaces (FR11.2).
- [ ] **P1.4.3**: Define Plugin API for logic operations (FR11.2).
- [ ] **P1.4.4**: Implement basic plugin loading mechanism.

### Simulation & Error Handling
- [ ] **P1.5.1**: Implement core simulation mode logic in `HardwareInterface` and components (FR1.3).
- [ ] **P1.5.2**: Implement basic error handling and logging framework (NFR2.1, NFR2.2).
- [ ] **P1.5.3**: Implement basic recovery mechanisms (e.g., component re-initialization attempt).

### Real-time Communication
- [ ] **P1.6.1**: Integrate Socket.IO (or FastAPI's WebSocket) for real-time updates.
- [ ] **P1.6.2**: Implement WebSocket handlers for broadcasting hardware state changes (FR9.1).

### Initial Testing
- [ ] **P1.7.1**: Unit tests for core classes (`Machine`, `Event`, `Component` stubs).
- [ ] **P1.7.2**: Test saving/loading machine and event JSON files.
- [ ] **P1.7.3**: Test basic simulation mode functionality.

## Phase 2: Frontend Development (2 weeks)

### Frontend Setup
- [ ] **P2.1.1**: Initialize React project with TypeScript.
- [ ] **P2.1.2**: Integrate Tailwind CSS for styling.
- [ ] **P2.1.3**: Set up React Flow for visual editor.
- [ ] **P2.1.4**: Integrate Axios for API calls and Socket.IO client for real-time.
- [ ] **P2.1.5**: Basic application layout and routing (App component).

### Visual Editors
- [ ] **P2.2.1**: Develop `MachineEditor` component (FR8.2).
    - [ ] **P2.2.1.1**: Drag-and-drop interface for adding/configuring inputs & outputs.
    - [ ] **P2.2.1.2**: Connect visual elements to backend `Machine` configuration.
    - [ ] **P2.2.1.3**: Visualization of dependencies (e.g., input to logic to output).
- [ ] **P2.2.2**: Develop `EventEditor` component (FR8.2).
    - [ ] **P2.2.2.1**: Interface for defining event steps (set_output, wait - basic first).
    - [ ] **P2.2.2.2**: Connect visual elements to backend `Event` configuration.

### Dashboard & Monitoring
- [ ] **P2.3.1**: Develop `Dashboard` component with tabbed interface (FR8.3).
- [ ] **P2.3.2**: Implement "Real-time Monitoring" tab (FR8.3.a).
    - [ ] **P2.3.2.1**: Display digital/analog input/output states (FR9.2).
    - [ ] **P2.3.2.2**: Integrate WebSocket for real-time state updates from backend.
- [ ] **P2.3.3**: Implement "Time-series Graphs" tab (FR8.3.b).
    - [ ] **P2.3.3.1**: Integrate a charting library (e.g., Chart.js as per FR9.3).
    - [ ] **P2.3.3.2**: Display mock data for time-series charts initially.

### File Management
- [ ] **P2.4.1**: Develop `FileManager` interface/component (FR8.4).
    - [ ] **P2.4.1.1**: UI for listing, loading, and saving machine files via API.
    - [ ] **P2.4.1.2**: UI for listing, loading, and saving event files via API.

### Frontend Testing
- [ ] **P2.5.1**: Unit/component tests for key React components (Jest, React Testing Library).
- [ ] **P2.5.2**: Test API integration for machine/event CRUD.
- [ ] **P2.5.3**: Test WebSocket integration for basic real-time updates.

## Phase 3: Hardware Integration and Testing (2 weeks)

### Raspberry Pi Integration
- [ ] **P3.1.1**: Fully implement `RaspberryPiInterface` using `RPi.GPIO`.
- [ ] **P3.1.2**: Implement digital input/output on Raspberry Pi.
- [ ] **P3.1.3**: Integrate MCP3008 ADC support using `adafruit-circuitpython` for analog inputs on Raspberry Pi (FR1.1).
- [ ] **P3.1.4**: Test RPi GPIO and ADC communication with physical hardware.

### Arduino Integration
- [ ] **P3.2.1**: Fully implement `ArduinoInterface` using `pyserial` (FR1.1).
- [ ] **P3.2.2**: Develop a simple Arduino sketch for handling serial commands (e.g., set pin, read pin).
- [ ] **P3.2.3**: Test Arduino serial communication with physical hardware.

### Advanced Component Features
- [ ] **P3.3.1**: Implement logical operations (AND, OR, NOT) for combining input states (FR3.1).
- [ ] **P3.3.2**: Implement timed operations (delays, periodic triggers - FR4.1, FR4.2) within `Machine` or relevant components.
- [ ] **P3.3.3**: Implement counting operations (thresholds, resets - FR5.1, FR5.2) within `Machine` or relevant components.

### Validation
- [ ] **P3.4.1**: Validate plugin loading with a simple custom hardware/logic plugin example (FR1.2, FR11.1).
- [ ] **P3.4.2**: Thoroughly test simulation mode against actual hardware behavior (FR1.3, NFR2.3).
- [ ] **P3.4.3**: Test error handling and recovery mechanisms with hardware failures (e.g., disconnects - NFR2.1, NFR2.2).
- [ ] **P3.4.4**: Connect Dashboard's time-series charts to actual analog input data (FR9.3).

## Phase 4: Event Execution and IoT (1 week)

### Advanced Event Features
- [ ] **P4.1.1**: Implement looping (fixed iterations) in `Event` execution logic (FR7.2).
- [ ] **P4.1.2**: Implement conditional branching (based on input states) in `Event` execution logic (FR7.2).
- [ ] **P4.1.3**: Implement parallel execution of steps in `Event` execution logic (FR7.2).
- [ ] **P4.1.4**: Update `EventEditor` in frontend to support configuration of looping, branching, and parallel steps.
- [ ] **P4.1.5**: Update JSON schema for "event" files to include these advanced steps (FR7.4).

### IoT Integration
- [ ] **P4.2.1**: Implement MQTT publishing for event statuses (FR10.1).
- [ ] **P4.2.2**: Allow event steps to publish custom messages to MQTT topics (FR7.4 - `mqtt_publish`, FR10.2).
- [ ] **P4.2.3**: Allow receiving external commands via MQTT (e.g., trigger an event) (FR10.1).
- [ ] **P4.2.4**: Test MQTT integration with an external broker and client.
- [ ] **P4.2.5**: Ensure MQTT uses secure broker configurations if deployed client-server (NFR4.2).

### Performance and Scalability Testing
- [ ] **P4.3.1**: Test concurrent execution of multiple machines and events (NFR1.1, NFR3.1).
- [ ] **P4.3.2**: Measure input processing latency (<100ms goal - NFR1.1).
- [ ] **P4.3.3**: Validate real-time monitoring update rate (10Hz goal - NFR1.2).
- [ ] **P4.3.4**: Test plugin system with multiple (e.g., up to 10) custom plugins (NFR3.2).

## Phase 5: Documentation and Deployment (1 week)

### Documentation
- [ ] **P5.1.1**: Write User Documentation:
    - [ ] **P5.1.1.1**: Getting Started Guide.
    - [ ] **P5.1.1.2**: How to configure Machines.
    - [ ] **P5.1.1.3**: How to create and use Events.
    - [ ] **P5.1.1.4**: Using the Dashboard and visual editors.
- [ ] **P5.1.2**: Write Developer Documentation:
    - [ ] **P5.1.2.1**: System Architecture overview.
    - [ ] **P5.1.2.2**: Plugin Development Guide (API details, examples - FR11.2).
    - [ ] **P5.1.2.3**: Backend API Reference.
- [ ] **P5.1.3**: Add inline code comments and docstrings.

### Deployment Packaging
- [ ] **P5.2.1**: Create Dockerfile and Docker Compose setup for client-server deployment (NFR6.2, NFR6.3).
- [ ] **P5.2.2**: Create build/packaging scripts for local deployment on Raspberry Pi (Raspberry Pi OS - NFR6.1).
- [ ] **P5.2.3**: Test deployment in both local and client-server modes.

### Final Testing & Release Prep
- [ ] **P5.3.1**: Conduct comprehensive end-to-end testing against all Acceptance Criteria (Section 11).
- [ ] **P5.3.2**: Usability testing for frontend interface (NFR5.1, NFR5.2).
- [ ] **P5.3.3**: Gather feedback from stakeholders/test users.
- [ ] **P5.3.4**: Address critical bugs and feedback.
- [ ] **P5.3.5**: Final code review and merge to main/release branch.
- [ ] **P5.3.6**: Tag release version 1.0.

## Post-Release / Future Enhancements (Tracked Separately)
- [ ] **FUTURE**: Cloud storage for machines/events.
- [ ] **FUTURE**: Mobile app for remote monitoring/control.
- [ ] **FUTURE**: Advanced analytics for measurement trends.
- [ ] **FUTURE**: Support for additional IoT protocols (e.g., CoAP).