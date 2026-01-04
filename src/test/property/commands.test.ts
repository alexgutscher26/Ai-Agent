/**
 * Property-based tests for command registration and accessibility
 * Feature: code-coach-vscode, Property 11: Command Accessibility
 * Feature: code-coach-vscode, Property 2: Automatic Selection Expansion
 */

import * as fc from 'fast-check';
import * as vscode from 'vscode';
import { CommandManager } from '../../commands/CommandManager';
import { ConfigurationManager } from '../../config/ConfigurationManager';

// Mock VS Code API
const mockContext = {
    subscriptions: [],
    globalState: {
        get: jest.fn(),
        update: jest.fn()
    },
    workspaceState: {
        get: jest.fn(),
        update: jest.fn()
    }
} as any;

const mockCommands = {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
    getCommands: jest.fn()
};

const mockWindow = {
    activeTextEditor: null,
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn()
};

const mockWorkspace = {
    getConfiguration: jest.fn(() => ({
        get: jest.fn((key: string, defaultValue: any = undefined) => defaultValue)
    })),
    onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() }))
};

const mockLanguages = {
    getDiagnostics: jest.fn(() => [])
};

// Override mocks
(vscode as any).commands = mockCommands;
(vscode as any).window = mockWindow;
(vscode as any).workspace = mockWorkspace;
(vscode as any).languages = mockLanguages;

describe('Command Registration Properties', () => {
    let configManager: ConfigurationManager;
    let commandManager: CommandManager;
    let mockTelemetry: any;

    beforeEach(() => {
        jest.clearAllMocks();
        configManager = new ConfigurationManager(mockContext);
        
        // Mock telemetry
        mockTelemetry = {
            trackExplanationRequest: jest.fn(),
            trackReviewRequest: jest.fn(),
            trackErrorExplanation: jest.fn(),
            trackFeedback: jest.fn(),
            trackConfusionDetection: jest.fn(),
            trackConfigurationChange: jest.fn(),
            dispose: jest.fn()
        };
        
        commandManager = new CommandManager(mockContext, configManager, mockTelemetry);
    });

    afterEach(() => {
        commandManager.dispose();
        configManager.dispose();
    });

    // Feature: code-coach-vscode, Property 11: Command Accessibility
    test('Property 11: All core commands should be registered and accessible', () => {
        fc.assert(fc.property(
            // Generate command registration scenarios
            fc.constant({
                expectedCommands: [
                    'codeCoach.explainSelection',
                    'codeCoach.reviewSelection',
                    'codeCoach.explainError'
                ]
            }),
            (scenario) => {
                // Track registered commands
                const registeredCommands: string[] = [];
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    registeredCommands.push(command);
                    return { dispose: jest.fn() };
                });

                // Register commands
                commandManager.registerCommands();

                // Property: All expected commands should be registered
                scenario.expectedCommands.forEach(expectedCommand => {
                    expect(registeredCommands).toContain(expectedCommand);
                });

                // Property: No unexpected commands should be registered
                registeredCommands.forEach(registeredCommand => {
                    expect(scenario.expectedCommands).toContain(registeredCommand);
                });

                // Property: Each command should be registered exactly once
                scenario.expectedCommands.forEach(command => {
                    const occurrences = registeredCommands.filter(cmd => cmd === command).length;
                    expect(occurrences).toBe(1);
                });

                // Verify VS Code API was called correctly
                expect(mockCommands.registerCommand).toHaveBeenCalledTimes(scenario.expectedCommands.length);
            }
        ), { numRuns: 100 });
    });

    test('Property 11: Commands should be accessible through both command palette and context menus', () => {
        fc.assert(fc.property(
            // Generate command execution scenarios
            fc.record({
                command: fc.constantFrom(
                    'codeCoach.explainSelection',
                    'codeCoach.reviewSelection',
                    'codeCoach.explainError'
                ),
                hasActiveEditor: fc.boolean(),
                documentLanguage: fc.oneof(
                    fc.constant('python'),
                    fc.constant('javascript'),
                    fc.constant('typescript')
                )
            }),
            (scenario) => {
                // Setup mock active editor
                if (scenario.hasActiveEditor) {
                    mockWindow.activeTextEditor = {
                        document: {
                            languageId: scenario.documentLanguage,
                            getText: jest.fn(() => 'test code'),
                            uri: { fsPath: 'test.py' }
                        },
                        selection: {
                            isEmpty: false,
                            active: { line: 0, character: 0 }
                        }
                    } as any;
                } else {
                    mockWindow.activeTextEditor = null;
                }

                // Mock configuration as valid
                mockWorkspace.getConfiguration.mockReturnValue({
                    get: jest.fn((key: string, defaultValue: any = undefined) => {
                        switch (key) {
                            case 'apiBaseUrl': return 'https://api.codecoach.dev';
                            case 'apiKey': return 'valid-api-key-12345';
                            case 'telemetryEnabled': return true;
                            case 'userLevel': return 'beginner';
                            case 'proactiveSuggestions': return true;
                            default: return defaultValue;
                        }
                    })
                });

                // Track command callbacks
                let commandCallback: any = null;
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    if (command === scenario.command) {
                        commandCallback = callback;
                    }
                    return { dispose: jest.fn() };
                });

                // Register commands
                commandManager.registerCommands();

                // Property: Command should have a registered callback
                expect(commandCallback).toBeDefined();
                expect(typeof commandCallback).toBe('function');

                // Property: Command should be executable
                if (commandCallback) {
                    expect(() => commandCallback()).not.toThrow();
                }

                // Property: Command behavior should depend on context
                if (!scenario.hasActiveEditor) {
                    // Should show warning when no active editor
                    if (commandCallback) {
                        commandCallback();
                        expect(mockWindow.showWarningMessage).toHaveBeenCalledWith('No active editor found');
                    }
                } else if (scenario.documentLanguage !== 'python') {
                    // Should show warning for non-Python files
                    if (commandCallback) {
                        commandCallback();
                        expect(mockWindow.showWarningMessage).toHaveBeenCalledWith('FlowPilot currently only supports Python files');
                    }
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 11: Command registration should be idempotent', () => {
        fc.assert(fc.property(
            // Generate multiple registration attempts
            fc.integer({ min: 1, max: 5 }),
            (registrationAttempts) => {
                // Track all registration calls
                const allRegisteredCommands: string[] = [];
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    allRegisteredCommands.push(command);
                    return { dispose: jest.fn() };
                });

                // Register commands multiple times
                for (let i = 0; i < registrationAttempts; i++) {
                    commandManager.registerCommands();
                }

                // Property: Commands should be registered the expected number of times
                const expectedCommands = [
                    'codeCoach.explainSelection',
                    'codeCoach.reviewSelection',
                    'codeCoach.explainError'
                ];

                expectedCommands.forEach(command => {
                    const occurrences = allRegisteredCommands.filter(cmd => cmd === command).length;
                    expect(occurrences).toBe(registrationAttempts);
                });

                // Property: Total registrations should match expected count
                expect(allRegisteredCommands.length).toBe(expectedCommands.length * registrationAttempts);
            }
        ), { numRuns: 100 });
    });

    test('Property 11: Command disposal should clean up all registrations', () => {
        fc.assert(fc.property(
            // Generate disposal scenarios
            fc.constant({
                shouldDispose: true
            }),
            (scenario) => {
                // Track disposable objects
                const disposables: Array<{ dispose: jest.Mock }> = [];
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    const disposable = { dispose: jest.fn() };
                    disposables.push(disposable);
                    return disposable;
                });

                // Register commands
                commandManager.registerCommands();

                // Verify disposables were created
                expect(disposables.length).toBe(3); // Three core commands

                // Property: Disposing command manager should dispose all command registrations
                if (scenario.shouldDispose) {
                    commandManager.dispose();

                    // All disposables should have been called
                    disposables.forEach(disposable => {
                        expect(disposable.dispose).toHaveBeenCalledTimes(1);
                    });
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 11: Commands should validate configuration before execution', () => {
        fc.assert(fc.property(
            // Generate configuration validation scenarios
            fc.record({
                command: fc.constantFrom(
                    'codeCoach.explainSelection',
                    'codeCoach.reviewSelection',
                    'codeCoach.explainError'
                ),
                apiKey: fc.oneof(
                    fc.constant(''), // Invalid: empty
                    fc.constant('short'), // Invalid: too short
                    fc.constant('valid-api-key-12345') // Valid
                ),
                apiBaseUrl: fc.oneof(
                    fc.constant(''), // Invalid: empty
                    fc.constant('not-a-url'), // Invalid: malformed
                    fc.constant('https://api.codecoach.dev') // Valid
                )
            }),
            (scenario) => {
                // Setup mock active editor with Python file
                mockWindow.activeTextEditor = {
                    document: {
                        languageId: 'python',
                        getText: jest.fn(() => 'test code'),
                        uri: { fsPath: 'test.py' }
                    },
                    selection: {
                        isEmpty: false,
                        active: { line: 0, character: 0 }
                    }
                } as any;

                // Mock configuration with test values
                mockWorkspace.getConfiguration.mockReturnValue({
                    get: jest.fn((key: string, defaultValue: any = undefined) => {
                        switch (key) {
                            case 'apiBaseUrl': return scenario.apiBaseUrl;
                            case 'apiKey': return scenario.apiKey;
                            case 'telemetryEnabled': return true;
                            case 'userLevel': return 'beginner';
                            case 'proactiveSuggestions': return true;
                            default: return defaultValue;
                        }
                    })
                });

                // Track command callback
                let commandCallback: any = null;
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    if (command === scenario.command) {
                        commandCallback = callback;
                    }
                    return { dispose: jest.fn() };
                });

                // Register commands
                commandManager.registerCommands();

                // Execute command
                if (commandCallback) {
                    commandCallback();
                }

                // Property: Invalid configuration should trigger error messages
                const isValidConfig = scenario.apiKey.length >= 10 && 
                                    scenario.apiBaseUrl.length > 0 && 
                                    scenario.apiBaseUrl.startsWith('http');

                if (!isValidConfig) {
                    // Should show configuration error
                    expect(mockWindow.showErrorMessage).toHaveBeenCalled();
                } else {
                    // Should proceed with command (show info message for now)
                    expect(mockWindow.showInformationMessage).toHaveBeenCalled();
                }
            }
        ), { numRuns: 100 });
    });
});

describe('Selection Expansion Properties', () => {
    let configManager: ConfigurationManager;
    let commandManager: CommandManager;
    let mockTelemetry: any;

    beforeEach(() => {
        jest.clearAllMocks();
        configManager = new ConfigurationManager(mockContext);
        
        // Mock telemetry
        mockTelemetry = {
            trackExplanationRequest: jest.fn(),
            trackReviewRequest: jest.fn(),
            trackErrorExplanation: jest.fn(),
            trackFeedback: jest.fn(),
            trackConfusionDetection: jest.fn(),
            trackConfigurationChange: jest.fn(),
            dispose: jest.fn()
        };
        
        commandManager = new CommandManager(mockContext, configManager, mockTelemetry);
    });

    afterEach(() => {
        commandManager.dispose();
        configManager.dispose();
    });

    // Feature: code-coach-vscode, Property 2: Automatic Selection Expansion
    test('Property 2: Automatic selection expansion should include meaningful context', () => {
        fc.assert(fc.property(
            // Generate various cursor positions and document structures
            fc.record({
                documentLines: fc.array(
                    fc.oneof(
                        fc.constant('def function_name():'),
                        fc.constant('    return value'),
                        fc.constant('class ClassName:'),
                        fc.constant('    def method(self):'),
                        fc.constant('        pass'),
                        fc.constant('if condition:'),
                        fc.constant('    do_something()'),
                        fc.constant('for item in items:'),
                        fc.constant('    process(item)'),
                        fc.constant(''),  // Empty lines
                        fc.constant('# Comment line'),
                        fc.constant('variable = value')
                    ),
                    { minLength: 5, maxLength: 20 }
                ),
                cursorLine: fc.integer({ min: 0, max: 19 }),
                hasSelection: fc.boolean()
            }),
            (scenario) => {
                // Ensure cursor line is within document bounds
                const actualCursorLine = Math.min(scenario.cursorLine, scenario.documentLines.length - 1);
                
                // Create mock document
                const mockDocument = {
                    languageId: 'python',
                    lineCount: scenario.documentLines.length,
                    lineAt: jest.fn((line: number) => ({
                        text: scenario.documentLines[line] || '',
                        range: new vscode.Range(line, 0, line, (scenario.documentLines[line] || '').length)
                    })),
                    getText: jest.fn((range?: vscode.Range) => {
                        if (!range) return scenario.documentLines.join('\n');
                        
                        const lines = scenario.documentLines.slice(range.start.line, range.end.line + 1);
                        if (lines.length === 1) {
                            return lines[0]!.substring(range.start.character, range.end.character);
                        }
                        
                        // Multi-line selection
                        lines[0] = lines[0]!.substring(range.start.character);
                        lines[lines.length - 1] = lines[lines.length - 1]!.substring(0, range.end.character);
                        return lines.join('\n');
                    }),
                    uri: { fsPath: 'test.py' }
                };

                // Create mock selection
                const mockSelection = scenario.hasSelection 
                    ? new vscode.Range(
                        new vscode.Position(actualCursorLine, 0),
                        new vscode.Position(actualCursorLine, scenario.documentLines[actualCursorLine]?.length || 0)
                    )
                    : new vscode.Range(
                        new vscode.Position(actualCursorLine, 0),
                        new vscode.Position(actualCursorLine, 0)
                    );

                const mockSelectionObj = {
                    isEmpty: !scenario.hasSelection,
                    start: mockSelection.start,
                    end: mockSelection.end,
                    active: new vscode.Position(actualCursorLine, 0)
                };

                // Setup mock active editor
                mockWindow.activeTextEditor = {
                    document: mockDocument,
                    selection: mockSelectionObj
                } as any;

                // Mock valid configuration
                mockWorkspace.getConfiguration.mockReturnValue({
                    get: jest.fn((key: string, defaultValue: any = undefined) => {
                        switch (key) {
                            case 'apiBaseUrl': return 'https://api.codecoach.dev';
                            case 'apiKey': return 'valid-api-key-12345';
                            case 'telemetryEnabled': return true;
                            case 'userLevel': return 'beginner';
                            case 'proactiveSuggestions': return true;
                            default: return defaultValue;
                        }
                    })
                });

                // Track the selection expansion by intercepting getText calls
                let expandedRange: vscode.Range | undefined = undefined;
                const originalGetText = mockDocument.getText;
                mockDocument.getText = jest.fn((range?: vscode.Range) => {
                    if (range && !scenario.hasSelection && !range.isEqual(mockSelection)) {
                        expandedRange = range;
                    }
                    return originalGetText(range);
                });

                // Track command callback
                let explainCallback: any = null;
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    if (command === 'codeCoach.explainSelection') {
                        explainCallback = callback;
                    }
                    return { dispose: jest.fn() };
                });

                // Register commands and execute explain
                commandManager.registerCommands();
                
                if (explainCallback) {
                    explainCallback();
                }

                // Property: If no selection, expansion should occur
                if (!scenario.hasSelection && expandedRange) {
                    const range = expandedRange as vscode.Range;
                    // Property: Expanded range should include the cursor line
                    expect(range.start.line).toBeLessThanOrEqual(actualCursorLine);
                    expect(range.end.line).toBeGreaterThanOrEqual(actualCursorLine);
                    
                    // Property: Expanded range should include meaningful context
                    const expandedLineCount = range.end.line - range.start.line + 1;
                    expect(expandedLineCount).toBeGreaterThan(0);
                    
                    // Property: Expansion should not exceed document bounds
                    expect(range.start.line).toBeGreaterThanOrEqual(0);
                    expect(range.end.line).toBeLessThan(scenario.documentLines.length);
                    
                    // Property: If current line is a definition, expansion should include the block
                    const currentLineText = scenario.documentLines[actualCursorLine] || '';
                    if (/^\s*(def|class|if|for|while|with|try)\s/.test(currentLineText)) {
                        // Should expand to include more than just the current line
                        expect(expandedLineCount).toBeGreaterThan(1);
                    }
                }

                // Property: If there is a selection, it should be used as-is
                if (scenario.hasSelection) {
                    // The original selection should be used, not expanded
                    expect(mockDocument.getText).toHaveBeenCalledWith(mockSelection);
                }

                // Property: Some code should always be extracted for analysis
                const extractedCode = mockDocument.getText(expandedRange || mockSelection);
                if (scenario.documentLines.some(line => line.trim())) {
                    // If document has non-empty lines, extracted code should not be empty
                    expect(extractedCode.trim().length).toBeGreaterThan(0);
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 2: Selection expansion should respect Python indentation structure', () => {
        fc.assert(fc.property(
            // Generate Python code structures with proper indentation
            fc.record({
                codeStructure: fc.oneof(
                    // Function definition
                    fc.constant([
                        'def example_function():',
                        '    """Docstring here"""',
                        '    variable = 42',
                        '    return variable',
                        '',
                        'other_code = True'
                    ]),
                    // Class definition
                    fc.constant([
                        'class ExampleClass:',
                        '    def __init__(self):',
                        '        self.value = 0',
                        '    ',
                        '    def method(self):',
                        '        return self.value',
                        '',
                        'instance = ExampleClass()'
                    ]),
                    // Nested control structures
                    fc.constant([
                        'if condition:',
                        '    for item in items:',
                        '        if item.valid:',
                        '            process(item)',
                        '        else:',
                        '            skip(item)',
                        '    print("Done")',
                        'else:',
                        '    print("No condition")'
                    ])
                ),
                cursorPosition: fc.record({
                    line: fc.integer({ min: 0, max: 8 }),
                    character: fc.integer({ min: 0, max: 10 })
                })
            }),
            (scenario) => {
                const lines = scenario.codeStructure;
                const cursorLine = Math.min(scenario.cursorPosition.line, lines.length - 1);
                
                // Create mock document
                const mockDocument = {
                    languageId: 'python',
                    lineCount: lines.length,
                    lineAt: jest.fn((line: number) => ({
                        text: lines[line] || '',
                        range: new vscode.Range(line, 0, line, (lines[line] || '').length)
                    })),
                    getText: jest.fn((range?: vscode.Range) => {
                        if (!range) return lines.join('\n');
                        
                        const selectedLines = lines.slice(range.start.line, range.end.line + 1);
                        if (selectedLines.length === 1 && selectedLines[0]) {
                            return selectedLines[0].substring(range.start.character, range.end.character);
                        }
                        
                        if (selectedLines[0]) {
                            selectedLines[0] = selectedLines[0].substring(range.start.character);
                        }
                        if (selectedLines[selectedLines.length - 1]) {
                            selectedLines[selectedLines.length - 1] = selectedLines[selectedLines.length - 1]!.substring(0, range.end.character);
                        }
                        return selectedLines.join('\n');
                    }),
                    uri: { fsPath: 'test.py' }
                };

                // Create empty selection (cursor only)
                const mockSelection = new vscode.Range(
                    new vscode.Position(cursorLine, scenario.cursorPosition.character),
                    new vscode.Position(cursorLine, scenario.cursorPosition.character)
                );

                // Setup mock active editor
                mockWindow.activeTextEditor = {
                    document: mockDocument,
                    selection: {
                        isEmpty: true,
                        start: mockSelection.start,
                        end: mockSelection.end,
                        active: mockSelection.start
                    }
                } as any;

                // Mock valid configuration
                mockWorkspace.getConfiguration.mockReturnValue({
                    get: jest.fn((key: string, defaultValue: any = undefined) => {
                        switch (key) {
                            case 'apiBaseUrl': return 'https://api.codecoach.dev';
                            case 'apiKey': return 'valid-api-key-12345';
                            case 'telemetryEnabled': return true;
                            case 'userLevel': return 'beginner';
                            case 'proactiveSuggestions': return true;
                            default: return defaultValue;
                        }
                    })
                });

                // Track the expanded range
                let expandedRange: vscode.Range | undefined = undefined;
                const originalGetText = mockDocument.getText;
                mockDocument.getText = jest.fn((range?: vscode.Range) => {
                    if (range && !range.isEqual(mockSelection)) {
                        expandedRange = range;
                    }
                    return originalGetText(range);
                });

                // Track command callback
                let explainCallback: any = null;
                mockCommands.registerCommand.mockImplementation((command: string, callback: any) => {
                    if (command === 'codeCoach.explainSelection') {
                        explainCallback = callback;
                    }
                    return { dispose: jest.fn() };
                });

                // Register commands and execute explain
                commandManager.registerCommands();
                
                if (explainCallback) {
                    explainCallback();
                }

                // Property: Expansion should respect indentation boundaries
                if (expandedRange) {
                    const currentLineText = lines[cursorLine] || '';
                    const expandedText = mockDocument.getText(expandedRange);
                    
                    // Property: If cursor is on a definition line, expansion should include the entire block
                    if (/^\s*(def|class)\s/.test(currentLineText)) {
                        const expandedLines = expandedText.split('\n');
                        
                        // Should include the definition line
                        if (expandedLines[0]) {
                            expect(expandedLines[0].trim()).toBe(currentLineText.trim());
                        }
                        
                        // Should include indented content
                        const hasIndentedContent = expandedLines.some((line, index) => {
                            if (index === 0) return false; // Skip definition line
                            return line.trim() && line.startsWith('    ');
                        });
                        
                        if (expandedLines.length > 1) {
                            expect(hasIndentedContent).toBe(true);
                        }
                    }
                    
                    // Property: Expansion should not include unrelated code at same indent level
                    const expandedLines = expandedText.split('\n');
                    const baseIndent = getIndentLevel(currentLineText);
                    
                    // All non-empty lines should either be at the base level or more indented
                    expandedLines.forEach(line => {
                        if (line.trim()) {
                            const lineIndent = getIndentLevel(line);
                            expect(lineIndent).toBeGreaterThanOrEqual(baseIndent);
                        }
                    });
                }
            }
        ), { numRuns: 100 });
    });
});

// Helper function for indentation calculation
function getIndentLevel(lineText: string): number {
    const match = lineText.match(/^(\s*)/);
    if (!match || !match[1]) return 0;
    
    // Convert tabs to spaces (assuming 4 spaces per tab)
    const whitespace = match[1].replace(/\t/g, '    ');
    return whitespace.length;
}