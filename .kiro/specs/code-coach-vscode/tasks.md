# Implementation Plan: FlowPilot VS Code Extension

## Overview

This implementation plan breaks down the FlowPilot VS Code extension into discrete, manageable coding tasks. Each task builds incrementally toward a complete teaching-focused extension that explains code, analyzes errors, and provides code quality reviews. The implementation follows a modular architecture with clear separation between VS Code integration, API communication, UI rendering, and user interaction detection.

## Tasks

- [x] 1. Project Setup and Foundation
  - Create VS Code extension project structure with TypeScript
  - Configure package.json with extension manifest, commands, and contributions
  - Set up build system with webpack/esbuild for extension and webview compilation
  - Configure testing framework (Jest) with fast-check for property-based testing
  - _Requirements: 6.1, 6.4_

- [x] 1.1 Write property test for project configuration
  - **Property 15: Configuration System Integration**
  - **Validates: Requirements 6.1, 6.4, 6.5**

- [x] 2. Core Extension Infrastructure
  - [x] 2.1 Implement extension activation and lifecycle management
    - Create extension.ts with activate/deactivate functions
    - Register commands for explain, review, and error analysis
    - Set up configuration management using VS Code settings API
    - _Requirements: 1.5, 5.1, 6.1_

  - [x] 2.2 Write property test for extension activation
    - **Property 3: Python-Only Activation**
    - **Validates: Requirements 1.5**

  - [x] 2.3 Write property test for command registration
    - **Property 11: Command Accessibility**
    - **Validates: Requirements 5.1**

- [ ] 3. API Client Implementation
  - [x] 3.1 Create CodeCoachApiClient class with HTTP communication
    - Implement explainSelection, reviewSelection, explainError methods
    - Add configuration-based endpoint and authentication handling
    - Include request/response TypeScript interfaces
    - _Requirements: 8.1, 8.2, 6.1_

  - [x] 3.2 Write property test for API communication protocol
    - **Property 18: API Communication Protocol**
    - **Validates: Requirements 8.1, 8.2**

  - [x] 3.3 Implement error handling and resilience
    - Add timeout handling, retry logic, and graceful failure modes
    - Implement response validation and fallback behaviors
    - _Requirements: 8.3, 8.5, 7.4_

  - [x] 3.4 Write property test for error resilience
    - **Property 19: Error Resilience**
    - **Validates: Requirements 8.3, 8.5**

- [x] 4. Webview Panel and UI
  - [x] 4.1 Create CodeCoachPanel class for webview management
    - Implement webview creation, disposal, and message passing
    - Create HTML template with sections for explanations, reviews, and errors
    - Add CSS styling for clear, readable layout
    - _Requirements: 5.2, 1.3, 2.2, 3.2_

  - [x] 4.2 Implement webview JavaScript for interactive UI
    - Handle message receiving from extension
    - Render explanation content with line-by-line breakdowns
    - Add feedback controls (helpful/not helpful buttons)
    - _Requirements: 5.3, 1.3, 2.2, 3.2_

  - [ ] 4.3 Write property test for UI content completeness
    - **Property 1: Code Explanation Workflow Completeness**
    - **Property 4: Error Explanation Workflow**
    - **Property 7: Code Review Completeness**
    - **Validates: Requirements 1.1, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3**

  - [x] 4.4 Write property test for feedback mechanism presence
    - **Property 12: Feedback Mechanism Presence**
    - **Validates: Requirements 5.3**

- [-] 5. Command Handlers and Selection Logic
  - [x] 5.1 Implement explainSelection command handler
    - Add selection detection and automatic expansion logic
    - Gather code context and surrounding lines
    - Integrate with API client and webview panel
    - _Requirements: 1.1, 1.2, 1.4_

  - [-] 5.2 Write property test for automatic selection expansion
    - **Property 2: Automatic Selection Expansion**
    - **Validates: Requirements 1.2**

  - [x] 5.3 Implement reviewSelection command handler
    - Add code quality analysis request handling
    - Display review results with improvements and explanations
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.4 Implement explainError command handler and code actions
    - Integrate with VS Code diagnostics |
    - Add code action provider for error explanations
    - Handle multiple diagnostics prioritization
    - _Requirements: 2.1, 2.3, 2.5_

  - [ ] 5.5 Write property test for code action integration
    - **Property 5: Code Action Integration**
    - **Validates: Requirements 2.3, 2.5**

- [x] 6. Checkpoint - Core Functionality Complete
  - Ensure all basic commands work endto-end`
  - Verify webview displays explanations correctly
  - Test API integration with mock responses
  - Ask the user if questions arise

- [x] 7. Confusion Detection System
  - [x] 7.1 Implement ConfusionDetector class
    - Track cursor dwell time on diagnostic lines
    - Detect repeated error patterns
    - Implement cooldown and rate limiting
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 7.2 Add status bar notifications for proactive help
    - Create non-intrusive status bar items
    - Integrate with user preference settings
    - _Requirements: 4.1, 4.3, 4.5_

  - [x] 7.3 Write property test for confusion detection timing
    - **Property 8: Confusion Detection Timing**
    - **Validates: Requirements 4.1, 4.4**

  - [x] 7.4 Write property test for repeated error detection
    - **Property 9: Repeated Error Detection**
    - **Validates: Requirements 4.2**

- [x] 8. Configuration and Settings Management
  - [x] 8.1 Implement configuration validation and error handling
    - Add setting change listeners and validation
    - Provide helpful error messages for invalid configurations
    - _Requirements: 6.5, 4.5_

  - [x] 8.2 Add skill level and preference integration
    - Include user skill level in API requests
    - Respect telemetry and proactive suggestion preferences
    - _Requirements: 6.2, 4.5, 7.1_

  - [x] 8.3 Write property test for configuration respect
    - **Property 10: Configuration Respect**
    - **Validates: Requirements 4.5, 6.2, 7.1**

- [x] 9. Telemetry and Privacy System
  - [x] 9.1 Implement Telemetry class with privacy controls
    - Add anonymous event tracking with user consent
    - Ensure no code content or personal information is collected
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 9.2 Integrate telemetry with user actions
    - Track explanation requests, error analyses, and feedback
    - Implement fire-and-forget event sending
    - _Requirements: 7.3, 7.4_

  - [x] 9.3 Write property test for privacy-compliant telemetry
    - **Property 16: Privacy-Compliant Telemetry**
    - **Validates: Requirements 7.2, 7.4**

  - [x] 9.4 Write property test for telemetry event completeness
    - **Property 17: Telemetry Event Completeness**
    - **Validates: Requirements 7.3**

- [-] 10. Safety and Security Implementation
  - [x] 10.1 Implement file modification safety checks
    - Add safeguards to prevent any file modifications
    - Ensure all operations are read-only
    - _Requirements: 2.4, 3.5_

  - [x] 10.2 Write property test for file modification safety
    - **Property 6: File Modification Safety**
    - **Validates: Requirements 2.4, 3.5**

  - [x] 10.3 Add performance monitoring and non-blocking operations
    - Ensure API calls don't block VS Code editor
    - Implement async/await patterns throughout
    - _Requirements: 5.5_

  - [ ] 10.4 Write property test for performance non-blocking
    - **Property 14: Performance Non-Blocking**
    - **Validates: Requirements 5.5**

- [x] 11. VS Code Integration and Compliance
  - [x] 11.1 Implement proper VS Code API integration
    - Ensure compatibility with diagnostic and code action systems
    - Test integration with other extensions
    - _Requirements: 5.4_

  - [x] 11.2 Write property test for VS Code integration compliance
    - **Property 13: VS Code Integration Compliance**
    - **Validates: Requirements 5.4**

- [x] 12. Final Integration and Polish
  - [x] 12.1 Wire all components together
    - Connect command handlers to API client and webview
    - Integrate confusion detector with main extension
    - Ensure proper component lifecycle management
    - _Requirements: All requirements integration_

  - [x] 12.2 Write integration tests for complete workflows
    - Test end-to-end explain, review, and error analysis flows
    - Verify component interactions and data flow

- [x] 13. Final Checkpoint - Complete Extension Testing
  - Run full test suite including all property-based tests
  - Verify extension packaging and installation
  - Test with various Python code samples and error conditions
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive development including full testing coverage
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties using fast-check
- Unit tests focus on specific examples, edge cases, and integration points
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation prioritizes safety (no file modifications) and privacy (anonymous telemetry only)