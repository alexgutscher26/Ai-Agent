# FlowPilot - AI Coding Coach VSCode Extension

A VSCode extension that provides an AI coding coach to help developers understand their code better with real-time explanations and suggestions.

## Features

- **Code Review**: Analyze your entire file and get comprehensive explanations
- **Code Explanation**: Select any code snippet and get detailed explanations
- **Logic Breakdown**: Step-by-step analysis of complex code sections
- **Interactive Chat**: Ask questions about your code and get instant answers
- **Code Optimization**: Get suggestions to improve your code performance
- **Documentation**: Add docstrings and improve code documentation

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new Extension Development Host window
4. The extension will be active in the new window

## Usage

### Opening FlowPilot Panel
- Click on the FlowPilot icon in the Activity Bar
- Use the command palette: `FlowPilot: Open FlowPilot Panel`

### Reviewing Code
- Open any file in VSCode
- Click the "Review entire file" button in the FlowPilot panel
- Get comprehensive analysis and explanations

### Explaining Selected Code
- Select any code in the editor
- Right-click and choose "Explain Selected Code"
- Get detailed explanation in the FlowPilot panel

### Chatting with FlowPilot
- Type your questions in the chat input
- Get instant answers about your code
- Ask about best practices, optimizations, or clarifications

## Development

### Building
```bash
npm run compile
```

### Watching for changes
```bash
npm run watch
```

### Linting
```bash
npm run lint
```

## Architecture

The extension consists of:
- **Extension Entry Point**: `src/extension.ts` - Main activation logic
- **Webview Provider**: `src/flowPilotProvider.ts` - Handles the UI panel
- **Webview Assets**: `src/webview.css` and `src/webview.js` - UI styling and interactions

## Design

The UI is designed to match VSCode's native appearance with:
- Dark theme colors matching VSCode's color scheme
- Material Design icons for consistency
- Responsive layout that adapts to panel size
- Smooth animations and transitions

## API Integration

The extension is designed to integrate with FlowPilot's AI backend API for:
- Code analysis and explanation
- Optimization suggestions
- Chat-based Q&A

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the FlowPilot SAS platform.