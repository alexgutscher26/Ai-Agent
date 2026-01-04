# Requirements Document

## Introduction

FlowPilot is a VS Code extension designed to help self-taught developers and bootcamp graduates understand the code they write, rather than just making it work. The extension provides in-editor explanations, error analysis, and code quality reviews with a teaching-first approach, focusing on comprehension over code generation.

## Glossary

- **Code_Coach**: The VS Code extension that provides teaching-oriented code explanations
- **Extension**: The VS Code extension package and its components
- **Backend_API**: The external HTTP service that processes code and returns structured explanations
- **Webview_Panel**: The sidebar UI component that displays explanations and reviews
- **Confusion_Detector**: The component that identifies moments when users might need help
- **Diagnostic**: VS Code's representation of errors, warnings, and other code issues
- **Selection**: User-highlighted code in the editor
- **Context_Menu**: Right-click menu in the VS Code editor

## Requirements

### Requirement 1: Code Explanation

**User Story:** As a self-taught developer, I want to get line-by-line explanations of code I've written, so that I can understand what each part does and learn programming concepts.

#### Acceptance Criteria

1. WHEN a user selects code in a Python file and triggers explain command, THE Extension SHALL send the code to the Backend_API and display a structured explanation
2. WHEN no code is selected and explain command is triggered, THE Extension SHALL automatically expand to include the current line plus surrounding context
3. WHEN displaying explanations, THE Webview_Panel SHALL show line-by-line breakdowns, plain English summaries, and potential pitfalls
4. WHEN an explanation is displayed, THE Webview_Panel SHALL include optional "Try it yourself" suggestions from the backend
5. THE Extension SHALL only activate for Python files initially to maintain focused scope

### Requirement 2: Error Analysis and Teaching

**User Story:** As a bootcamp graduate, I want to understand why my code has errors and how to fix them, so that I can learn from mistakes rather than just copying solutions.

#### Acceptance Criteria

1. WHEN a Python file contains diagnostics and user requests error explanation, THE Extension SHALL gather error context and send it to the Backend_API
2. WHEN explaining errors, THE Webview_Panel SHALL display what the error means, why it occurs in this context, and how to fix it with reasoning
3. WHEN diagnostics are present on the current line, THE Extension SHALL offer a code action to explain the error
4. THE Extension SHALL never automatically modify user code, only provide explanations and suggestions
5. WHEN multiple diagnostics exist on a line, THE Extension SHALL prioritize the most relevant diagnostic for explanation

### Requirement 3: Code Quality Review

**User Story:** As a developer learning best practices, I want to know if my working code follows good patterns, so that I can improve code quality and learn better approaches.

#### Acceptance Criteria

1. WHEN a user selects code and requests a review, THE Extension SHALL analyze the code for quality and style improvements
2. WHEN displaying reviews, THE Webview_Panel SHALL show what's good about the code, what could be improved, and suggested improvements with explanations
3. WHEN suggesting improved code, THE Webview_Panel SHALL explain why the new version is better in terms of readability, performance, or Python conventions
4. THE Extension SHALL focus on teaching principles rather than just providing fixes
5. THE Extension SHALL never automatically apply suggested improvements to the user's file

### Requirement 4: Proactive Learning Assistance

**User Story:** As a developer who gets stuck on errors, I want the extension to notice when I'm struggling and offer help, so that I don't waste time being confused.

#### Acceptance Criteria

1. WHEN a user's cursor remains on a line with diagnostics for more than 15 seconds, THE Confusion_Detector SHALL offer help via status bar notification
2. WHEN the same diagnostic appears repeatedly in the same location, THE Confusion_Detector SHALL suggest using FlowPilot to understand the error
3. WHEN offering help, THE Extension SHALL use non-intrusive notifications that don't interrupt the coding flow
4. THE Confusion_Detector SHALL implement cooldown periods to prevent notification spam
5. THE Extension SHALL respect user preferences for enabling or disabling proactive suggestions

### Requirement 5: User Interface and Experience

**User Story:** As a VS Code user, I want the FlowPilot interface to be intuitive and integrated into my existing workflow, so that learning doesn't disrupt my development process.

#### Acceptance Criteria

1. WHEN the extension is active, THE Extension SHALL provide commands accessible via command palette and context menus
2. WHEN displaying explanations, THE Webview_Panel SHALL use a clear, readable layout with distinct sections for different types of information
3. WHEN users interact with explanations, THE Webview_Panel SHALL provide feedback mechanisms to improve future responses
4. THE Extension SHALL integrate with VS Code's existing diagnostic and code action systems
5. THE Extension SHALL maintain responsive performance and not block the editor during API calls

### Requirement 6: Configuration and Personalization

**User Story:** As a user with different skill levels and preferences, I want to configure the extension to match my learning needs, so that explanations are appropriately detailed for my experience level.

#### Acceptance Criteria

1. THE Extension SHALL provide configuration options for API endpoint, authentication, and user skill level
2. WHEN users set their skill level, THE Extension SHALL include this information in API requests for tailored explanations
3. THE Extension SHALL allow users to enable or disable telemetry collection
4. THE Extension SHALL store configuration in VS Code's standard settings system
5. THE Extension SHALL validate configuration and provide helpful error messages for invalid settings

### Requirement 7: Privacy and Telemetry

**User Story:** As a privacy-conscious developer, I want control over what data is collected and how it's used, so that I can use the extension while maintaining my privacy preferences.

#### Acceptance Criteria

1. THE Extension SHALL collect telemetry only with explicit user consent
2. WHEN telemetry is enabled, THE Extension SHALL collect anonymous usage data without including code content or personal information
3. THE Extension SHALL track explanation requests, error types, and user feedback to improve the service
4. THE Extension SHALL handle API failures gracefully without exposing sensitive information
5. THE Extension SHALL provide clear information about what data is collected and how it's used

### Requirement 8: Backend Integration

**User Story:** As a system architect, I want clean separation between the VS Code extension and the AI backend, so that the system is maintainable and the backend can be updated independently.

#### Acceptance Criteria

1. THE Extension SHALL communicate with the Backend_API using well-defined HTTP endpoints for explain, review, and error operations
2. WHEN making API calls, THE Extension SHALL include necessary context like code, language, file path, and user preferences
3. THE Extension SHALL handle API timeouts, network errors, and invalid responses gracefully
4. THE Backend_API SHALL return structured responses with consistent formats for different explanation types
5. THE Extension SHALL validate API responses and provide fallback behavior for malformed data