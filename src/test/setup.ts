/**
 * Jest test setup file
 * Configures the testing environment for the FlowPilot extension
 */

import * as fc from 'fast-check';

// Configure fast-check for property-based testing
beforeAll(() => {
    // Set global configuration for property-based tests
    fc.configureGlobal({
        numRuns: 100, // Minimum 100 iterations per property test
        verbose: process.env.NODE_ENV === 'test',
        seed: process.env.FC_SEED ? parseInt(process.env.FC_SEED) : undefined
    });
});

// Mock VS Code API for testing
const mockVscode = {
    workspace: {
        getConfiguration: jest.fn(),
        onDidChangeConfiguration: jest.fn()
    },
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        createStatusBarItem: jest.fn(),
        createWebviewPanel: jest.fn(),
        onDidChangeTextEditorSelection: jest.fn(),
        onDidChangeActiveTextEditor: jest.fn()
    },
    commands: {
        registerCommand: jest.fn(),
        executeCommand: jest.fn()
    },
    languages: {
        getDiagnostics: jest.fn(),
        onDidChangeDiagnostics: jest.fn(),
        registerCodeActionsProvider: jest.fn()
    },
    Uri: {
        file: jest.fn(),
        parse: jest.fn()
    },
    Range: jest.fn().mockImplementation((start, end) => ({
        start,
        end
    })),
    Position: jest.fn().mockImplementation((line, character) => ({
        line,
        character
    })),
    Disposable: {
        from: jest.fn()
    },
    StatusBarAlignment: {
        Left: 1,
        Right: 2
    },
    ViewColumn: {
        One: 1,
        Two: 2,
        Three: 3
    },
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
    },
    CodeActionKind: {
        QuickFix: 'quickfix'
    },
    Selection: jest.fn().mockImplementation((start, end) => ({
        start,
        end,
        isEmpty: start.line === end.line && start.character === end.character,
        active: end,
        anchor: start,
        isEqual: jest.fn(),
        contains: jest.fn(),
        intersection: jest.fn(),
        union: jest.fn(),
        with: jest.fn()
    })),
    Diagnostic: jest.fn().mockImplementation((range, message, severity) => ({
        range,
        message,
        severity,
        source: 'test',
        code: undefined,
        relatedInformation: []
    })),
    EndOfLine: {
        LF: 1,
        CRLF: 2
    },
    ExtensionMode: {
        Production: 1,
        Development: 2,
        Test: 3
    }
};

// Make the mock available globally
(global as any).vscode = mockVscode;

// Mock the vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});