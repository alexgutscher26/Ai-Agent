# FlowPilot - VS Code Extension

A teaching-first AI FlowPilot that helps developers understand their code rather than just making it work. FlowPilot provides in-editor explanations, error analysis, and code quality reviews with a focus on learning and comprehension.

## Features

- **Code Explanations**: Get line-by-line explanations of your Python code
- **Error Analysis**: Understand what errors mean, why they occur, and how to fix them
- **Code Reviews**: Learn about code quality, style improvements, and best practices
- **Proactive Learning**: Detects when you're stuck and offers contextual help
- **Privacy-First**: Anonymous telemetry with explicit user consent

## Requirements

- VS Code 1.90.0 or higher
- Python files (initial scope)
- FlowPilot API access (API key required) OR Demo Mode for testing

## Getting Started

### Option 1: Demo Mode (No API Key Required)
Perfect for trying out FlowPilot without setting up an API key:

1. Install the extension from the VS Code Marketplace
2. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
3. Search for "FlowPilot"
4. Enable "Demo Mode" (`codeCoach.demoMode: true`)
5. Start using FlowPilot with realistic mock responses!

### Option 2: Full API Access
For production use with the real FlowPilot service:

1. Install the extension from the VS Code Marketplace
2. Get your API key from [FlowPilot Dashboard](https://dashboard.codecoach.dev)
3. Configure your API key in VS Code settings (`codeCoach.apiKey`)
4. Set your experience level (`codeCoach.userLevel`)
5. Start learning!

## Usage

### Explain Code
1. Select Python code in the editor
2. Right-click and choose "FlowPilot: Explain Selected Code"
3. View the explanation in the FlowPilot panel

### Review Code Quality
1. Select Python code you want to review
2. Use Command Palette: "FlowPilot: Review Selected Code"
3. See suggestions for improvements with explanations

### Understand Errors
1. When you have Python errors, click the lightbulb icon
2. Choose "FlowPilot: Explain This Error"
3. Learn what the error means and how to fix it

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `codeCoach.apiBaseUrl` | API service endpoint | `https://api.codecoach.dev` |
| `codeCoach.apiKey` | Authentication key | (empty) |
| `codeCoach.userLevel` | Experience level for tailored explanations | `beginner` |
| `codeCoach.telemetryEnabled` | Enable anonymous usage analytics | `true` |
| `codeCoach.proactiveSuggestions` | Enable confusion detection and suggestions | `true` |
| `codeCoach.demoMode` | Enable demo mode with mock responses (no API key required) | `false` |

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- VS Code

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd code-coach-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Build webview assets
npm run build:webview
```

### Testing
The extension uses both unit tests and property-based tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Building
```bash
# Compile for production
npm run vscode:prepublish

# Package extension
npm run package
```

## Architecture

The extension follows a modular architecture:

- **Extension Host** (`src/extension.ts`): Main entry point and lifecycle management
- **API Client** (`src/api/`): HTTP communication with backend service
- **Webview Panel** (`src/panel/`): UI for displaying explanations and reviews
- **Command Handlers** (`src/commands/`): VS Code command implementations
- **Confusion Detector** (`src/confusion/`): Proactive learning assistance
- **Telemetry** (`src/telemetry/`): Privacy-compliant usage analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Privacy

FlowPilot respects your privacy:
- Telemetry is opt-in and anonymous
- No code content is stored or transmitted in telemetry
- API communication is encrypted
- You control what data is shared

## License

MIT License - see LICENSE file for details

## Support

- [Documentation](https://docs.codecoach.dev)
- [Issue Tracker](https://github.com/codecoach/vscode-extension/issues)
- [Community Forum](https://community.codecoach.dev)