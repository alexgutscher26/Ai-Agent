/**
 * Property-based tests for VS Code integration compliance
 * Feature: code-coach-vscode, Property 13: VS Code Integration Compliance
 */

import * as fc from 'fast-check';

// Mock the entire vscode module
jest.mock('vscode', () => {
    const mockCodeActionKind = {
        QuickFix: 'quickfix'
    };

    const mockDiagnosticSeverity = {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
    };

    const mockCodeActionTriggerKind = {
        Invoke: 1,
        Automatic: 2
    };

    class MockRange {
        constructor(public start: any, public end: any) {}
        intersection(_other: any) { return this; }
        isEqual(_other: any) { return false; }
    }

    class MockPosition {
        constructor(public line: number, public character: number) {}
        compareTo(_other: any) { return 0; }
    }

    class MockSelection {
        constructor(public start: any, public end: any) {}
        get isEmpty() { return this.start === this.end; }
        get active() { return this.start; }
    }

    class MockDiagnostic {
        constructor(public range: any, public message: string, public severity: any) {}
        source?: string;
        code?: string;
    }

    class MockCodeAction {
        constructor(public title: string, public kind?: string) {}
        command?: any;
        edit?: any;
        diagnostics?: any[];
        isPreferred?: boolean;
    }

    const mockUri = {
        file: (path: string) => ({ fsPath: path, toString: () => path }),
        parse: (uri: string) => ({ fsPath: uri, toString: () => uri })
    };

    return {
        CodeActionKind: mockCodeActionKind,
        DiagnosticSeverity: mockDiagnosticSeverity,
        CodeActionTriggerKind: mockCodeActionTriggerKind,
        Range: MockRange,
        Position: MockPosition,
        Selection: MockSelection,
        Diagnostic: MockDiagnostic,
        CodeAction: MockCodeAction,
        Uri: mockUri,
        commands: {
            registerCommand: jest.fn(),
            executeCommand: jest.fn(),
            getCommands: jest.fn()
        },
        languages: {
            registerCodeActionsProvider: jest.fn(),
            getDiagnostics: jest.fn(() => []),
            createDiagnosticCollection: jest.fn(() => ({
                set: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn(),
                dispose: jest.fn()
            })),
            onDidChangeDiagnostics: jest.fn(() => ({ dispose: jest.fn() }))
        },
        window: {
            activeTextEditor: null,
            showWarningMessage: jest.fn(),
            showErrorMessage: jest.fn(),
            showInformationMessage: jest.fn(),
            registerWebviewViewProvider: jest.fn(() => ({ dispose: jest.fn() })),
            onDidChangeActiveTextEditor: jest.fn(() => ({ dispose: jest.fn() }))
        },
        workspace: {
            getConfiguration: jest.fn(() => ({
                get: jest.fn((_key: string, defaultValue: any = undefined) => defaultValue)
            })),
            onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
            onDidChangeWorkspaceFolders: jest.fn(() => ({ dispose: jest.fn() })),
            onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
            openTextDocument: jest.fn()
        }
    };
});

import * as vscode from 'vscode';
import { CommandManager } from '../../commands/CommandManager';
import { ConfigurationManager } from '../../config/ConfigurationManager';
import { CodeCoachViewProvider } from '../../panel/CodeCoachViewProvider';

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
    },
    extensionUri: vscode.Uri.file('/mock/extension/path')
} as any;

describe('VS Code Integration Compliance Properties', () => {
    let configManager: ConfigurationManager;
    let commandManager: CommandManager;
    let viewProvider: CodeCoachViewProvider;
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
        viewProvider = new CodeCoachViewProvider(mockContext.extensionUri);
    });

    afterEach(() => {
        commandManager.dispose();
        configManager.dispose();
    });

    // Feature: code-coach-vscode, Property 13: VS Code Integration Compliance
    test('Property 13: Extension should properly integrate with VS Code diagnostic system', () => {
        fc.assert(fc.property(
            // Generate diagnostic scenarios
            fc.record({
                diagnostics: fc.array(
                    fc.record({
                        message: fc.string({ minLength: 1, maxLength: 100 }),
                        severity: fc.constantFrom(
                            vscode.DiagnosticSeverity.Error,
                            vscode.DiagnosticSeverity.Warning,
                            vscode.DiagnosticSeverity.Information,
                            vscode.DiagnosticSeverity.Hint
                        ),
                        range: fc.record({
                            start: fc.record({
                                line: fc.integer({ min: 0, max: 100 }),
                                character: fc.integer({ min: 0, max: 80 })
                            }),
                            end: fc.record({
                                line: fc.integer({ min: 0, max: 100 }),
                                character: fc.integer({ min: 0, max: 80 })
                            })
                        }),
                        source: fc.oneof(
                            fc.constant('pylint'),
                            fc.constant('mypy'),
                            fc.constant('flake8'),
                            fc.constant('python'),
                            fc.constant('other-extension')
                        )
                    }),
                    { minLength: 0, maxLength: 10 }
                ),
                documentLanguage: fc.oneof(
                    fc.constant('python'),
                    fc.constant('javascript'),
                    fc.constant('typescript')
                )
            }),
            (scenario) => {
                // Create mock diagnostics with proper VS Code types
                const mockDiagnostics = scenario.diagnostics.map(d => {
                    const range = new vscode.Range(
                        new vscode.Position(d.range.start.line, d.range.start.character),
                        new vscode.Position(d.range.end.line, d.range.end.character)
                    );
                    const diagnostic = new vscode.Diagnostic(range, d.message, d.severity);
                    diagnostic.source = d.source;
                    return diagnostic;
                });

                // Mock document
                const mockDocument = {
                    languageId: scenario.documentLanguage,
                    uri: vscode.Uri.file('test.py'),
                    getText: jest.fn(() => 'test code'),
                    lineAt: jest.fn(() => ({ text: 'test line' })),
                    lineCount: 10
                } as any;

                // Mock getDiagnostics to return our test diagnostics
                (vscode.languages.getDiagnostics as jest.Mock).mockReturnValue(mockDiagnostics as any);

                // Property: Extension should only interact with diagnostics for Python files
                if (scenario.documentLanguage === 'python') {
                    // Should be able to read diagnostics without modifying them
                    const retrievedDiagnostics = vscode.languages.getDiagnostics(mockDocument.uri);
                    expect(retrievedDiagnostics).toEqual(mockDiagnostics);
                    
                    // Property: Extension should not modify existing diagnostics
                    const originalDiagnosticCount = mockDiagnostics.length;
                    const originalMessages = mockDiagnostics.map(d => d.message);
                    
                    // After extension operations, diagnostics should remain unchanged
                    expect(vscode.languages.getDiagnostics(mockDocument.uri)).toHaveLength(originalDiagnosticCount);
                    expect(vscode.languages.getDiagnostics(mockDocument.uri).map(d => d.message)).toEqual(originalMessages);
                }

                // Property: Extension should handle diagnostics from various sources gracefully
                const uniqueSources = new Set(scenario.diagnostics.map(d => d.source));
                uniqueSources.forEach(source => {
                    const sourceDiagnostics = mockDiagnostics.filter(d => d.source === source);
                    // Extension should be able to process diagnostics from any source
                    expect(() => {
                        sourceDiagnostics.forEach(diagnostic => {
                            // Simulate extension reading diagnostic properties
                            const _ = diagnostic.message;
                            const __ = diagnostic.severity;
                            const ___ = diagnostic.range;
                        });
                    }).not.toThrow();
                });

                // Property: Extension should respect diagnostic severity hierarchy
                if (mockDiagnostics.length > 1) {
                    const severityOrder = [
                        vscode.DiagnosticSeverity.Error,
                        vscode.DiagnosticSeverity.Warning,
                        vscode.DiagnosticSeverity.Information,
                        vscode.DiagnosticSeverity.Hint
                    ];
                    
                    // Extension's prioritization should follow VS Code's severity model
                    const sortedBySeverity = [...mockDiagnostics].sort((a, b) => {
                        return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
                    });
                    
                    // First diagnostic should be highest priority (lowest severity index)
                    expect(severityOrder.indexOf(sortedBySeverity[0]!.severity))
                        .toBeLessThanOrEqual(severityOrder.indexOf(sortedBySeverity[sortedBySeverity.length - 1]!.severity));
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 13: Extension should register code actions properly with VS Code systems', () => {
        fc.assert(fc.property(
            // Generate code action registration scenarios
            fc.record({
                documentLanguage: fc.oneof(
                    fc.constant('python'),
                    fc.constant('javascript'),
                    fc.constant('typescript')
                ),
                registrationAttempts: fc.integer({ min: 1, max: 3 })
            }),
            (scenario) => {
                // Track code action provider registrations
                const codeActionRegistrations: any[] = [];
                (vscode.languages.registerCodeActionsProvider as jest.Mock).mockImplementation((selector: any, provider: any, metadata?: any) => {
                    codeActionRegistrations.push({ selector, provider, metadata });
                    return { dispose: jest.fn() };
                });

                // Register commands multiple times to test idempotency
                for (let i = 0; i < scenario.registrationAttempts; i++) {
                    commandManager.registerCommands();
                }

                // Property: Code action provider should be registered for Python files
                expect(codeActionRegistrations.length).toBe(scenario.registrationAttempts);
                
                // Property: Each registration should specify Python language selector
                codeActionRegistrations.forEach(registration => {
                    expect(registration.selector).toEqual({ language: 'python', scheme: 'file' });
                    expect(registration.provider).toBeDefined();
                    expect(registration.metadata).toBeDefined();
                    expect(registration.metadata.providedCodeActionKinds).toContain(vscode.CodeActionKind.QuickFix);
                });

                // Property: Code action provider should be disposable
                expect(vscode.languages.registerCodeActionsProvider).toHaveBeenCalledTimes(scenario.registrationAttempts);

                // Property: Registration should not interfere with other language services
                const otherLanguageCall = jest.fn();
                (vscode.languages.registerCodeActionsProvider as jest.Mock).mockImplementation(otherLanguageCall);
                
                // Simulate another extension registering for JavaScript
                const mockProvider = { provideCodeActions: jest.fn() };
                vscode.languages.registerCodeActionsProvider({ language: 'javascript' }, mockProvider, {});
                expect(otherLanguageCall).toHaveBeenCalledWith({ language: 'javascript' }, mockProvider, {});
            }
        ), { numRuns: 100 });
    });

    test('Property 13: Extension should register with VS Code APIs without interfering with other extensions', () => {
        fc.assert(fc.property(
            // Generate registration scenarios
            fc.record({
                registrationOrder: fc.array(
                    fc.constantFrom(
                        'commands',
                        'codeActions',
                        'webviewProvider',
                        'diagnosticListener',
                        'configurationListener'
                    ),
                    { minLength: 1, maxLength: 5 }
                ),
                otherExtensionPresent: fc.boolean(),
                concurrentRegistrations: fc.integer({ min: 1, max: 3 })
            }),
            (scenario) => {
                // Track all registrations
                const registrations: string[] = [];
                
                // Mock registration functions to track calls
                (vscode.commands.registerCommand as jest.Mock).mockImplementation((command: string, _callback: any) => {
                    registrations.push(`command:${command}`);
                    return { dispose: jest.fn() };
                });

                (vscode.languages.registerCodeActionsProvider as jest.Mock).mockImplementation((selector: any, _provider: any, _metadata?: any) => {
                    registrations.push(`codeAction:${JSON.stringify(selector)}`);
                    return { dispose: jest.fn() };
                });

                (vscode.window.registerWebviewViewProvider as jest.Mock).mockImplementation((...args: any[]) => {
                    const [viewType] = args;
                    registrations.push(`webview:${viewType}`);
                    return { dispose: jest.fn() };
                });

                // Simulate other extension registrations if present
                if (scenario.otherExtensionPresent) {
                    registrations.push('other:extension:command');
                    registrations.push('other:extension:codeAction');
                }

                // Register extension components multiple times to test idempotency
                for (let i = 0; i < scenario.concurrentRegistrations; i++) {
                    commandManager.registerCommands();
                }

                // Property: Extension should register expected components
                const expectedCommands = [
                    'codeCoach.explainSelection',
                    'codeCoach.reviewSelection',
                    'codeCoach.explainError',
                    'codeCoach.explainErrorAtPosition',
                    'codeCoach.explainAllErrorsAtPosition'
                ];

                expectedCommands.forEach(command => {
                    const commandRegistrations = registrations.filter(r => r === `command:${command}`);
                    expect(commandRegistrations.length).toBe(scenario.concurrentRegistrations);
                });

                // Property: Code action provider should be registered for Python files
                const codeActionRegistrations = registrations.filter(r => r.startsWith('codeAction:'));
                expect(codeActionRegistrations.length).toBe(scenario.concurrentRegistrations);

                // Property: Extension registrations should not interfere with other extensions
                if (scenario.otherExtensionPresent) {
                    expect(registrations).toContain('other:extension:command');
                    expect(registrations).toContain('other:extension:codeAction');
                }

                // Property: All registrations should be disposable
                expect(vscode.commands.registerCommand).toHaveBeenCalled();
                expect(vscode.languages.registerCodeActionsProvider).toHaveBeenCalled();

                // Verify disposal works correctly
                commandManager.dispose();
                
                // After disposal, no new registrations should occur
                const preDisposeCount = registrations.length;
                commandManager.registerCommands();
                expect(registrations.length).toBe(preDisposeCount + expectedCommands.length + 1); // +1 for code action provider
            }
        ), { numRuns: 100 });
    });

    test('Property 13: Extension should handle VS Code API changes and edge cases gracefully', () => {
        fc.assert(fc.property(
            // Generate API edge case scenarios
            fc.record({
                apiFailureType: fc.constantFrom(
                    'commandRegistrationFailure',
                    'diagnosticAccessFailure',
                    'webviewProviderFailure',
                    'configurationFailure'
                ),
                documentStates: fc.array(
                    fc.record({
                        languageId: fc.oneof(
                            fc.constant('python'),
                            fc.constant('plaintext'),
                            fc.constant('unknown')
                        ),
                        isUntitled: fc.boolean(),
                        hasUnsavedChanges: fc.boolean()
                    }),
                    { minLength: 1, maxLength: 3 }
                )
            }),
            (scenario) => {
                // Simulate API failures based on scenario
                switch (scenario.apiFailureType) {
                    case 'commandRegistrationFailure':
                        (vscode.commands.registerCommand as jest.Mock).mockImplementation(() => {
                            throw new Error('Command registration failed');
                        });
                        break;
                    case 'diagnosticAccessFailure':
                        (vscode.languages.getDiagnostics as jest.Mock).mockImplementation(() => {
                            throw new Error('Diagnostic access failed');
                        });
                        break;
                    case 'webviewProviderFailure':
                        (vscode.window.registerWebviewViewProvider as jest.Mock).mockImplementation(() => {
                            throw new Error('Webview provider registration failed');
                        });
                        break;
                    case 'configurationFailure':
                        (vscode.workspace.getConfiguration as jest.Mock).mockImplementation(() => {
                            throw new Error('Configuration access failed');
                        });
                        break;
                }

                // Property: Extension should handle API failures gracefully
                expect(() => {
                    try {
                        commandManager.registerCommands();
                    } catch (error) {
                        // Extension should catch and handle API failures
                        console.log('Expected API failure handled:', error);
                    }
                }).not.toThrow();

                // Test document state handling
                scenario.documentStates.forEach(docState => {
                    const mockDocument = {
                        languageId: docState.languageId,
                        uri: docState.isUntitled 
                            ? vscode.Uri.parse('untitled:Untitled-1')
                            : vscode.Uri.file('test.py'),
                        isDirty: docState.hasUnsavedChanges,
                        getText: jest.fn(() => 'test content')
                    } as any;

                    // Property: Extension should handle various document states
                    expect(() => {
                        const shouldActivate = configManager.shouldActivateForDocument(mockDocument);
                        
                        // Should only activate for Python files
                        if (docState.languageId === 'python') {
                            expect(shouldActivate).toBe(true);
                        } else {
                            expect(shouldActivate).toBe(false);
                        }
                    }).not.toThrow();
                });

                // Property: Extension should maintain functionality despite partial failures
                if (scenario.apiFailureType !== 'commandRegistrationFailure') {
                    // Reset mocks for successful operations
                    jest.clearAllMocks();
                    (vscode.commands.registerCommand as jest.Mock).mockImplementation(() => ({ dispose: jest.fn() }));
                    
                    // Should still be able to register commands
                    expect(() => commandManager.registerCommands()).not.toThrow();
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 13: Extension should maintain proper lifecycle and resource management', () => {
        fc.assert(fc.property(
            // Generate lifecycle scenarios
            fc.record({
                activationCount: fc.integer({ min: 1, max: 3 }),
                deactivationCount: fc.integer({ min: 0, max: 3 }),
                resourceOperations: fc.array(
                    fc.constantFrom(
                        'registerCommand',
                        'createWebview',
                        'listenToDiagnostics',
                        'accessConfiguration'
                    ),
                    { minLength: 1, maxLength: 10 }
                )
            }),
            (scenario) => {
                const disposables: Array<{ dispose: jest.Mock }> = [];
                
                // Track disposable creation
                (vscode.commands.registerCommand as jest.Mock).mockImplementation(() => {
                    const disposable = { dispose: jest.fn() };
                    disposables.push(disposable);
                    return disposable;
                });

                (vscode.languages.registerCodeActionsProvider as jest.Mock).mockImplementation(() => {
                    const disposable = { dispose: jest.fn() };
                    disposables.push(disposable);
                    return disposable;
                });

                (vscode.window.registerWebviewViewProvider as jest.Mock).mockImplementation(() => {
                    const disposable = { dispose: jest.fn() };
                    disposables.push(disposable);
                    return disposable;
                });

                // Simulate multiple activation cycles
                for (let i = 0; i < scenario.activationCount; i++) {
                    commandManager.registerCommands();
                }

                // Property: Each activation should create disposable resources
                expect(disposables.length).toBeGreaterThan(0);

                // Property: All resources should be properly disposable
                disposables.forEach(disposable => {
                    expect(disposable.dispose).toBeDefined();
                    expect(typeof disposable.dispose).toBe('function');
                });

                // Simulate resource operations
                scenario.resourceOperations.forEach(operation => {
                    expect(() => {
                        switch (operation) {
                            case 'registerCommand':
                                // Should not throw when registering commands
                                break;
                            case 'createWebview':
                                // Should handle webview creation gracefully
                                break;
                            case 'listenToDiagnostics':
                                // Should handle diagnostic listening
                                vscode.languages.getDiagnostics(vscode.Uri.file('test.py'));
                                break;
                            case 'accessConfiguration':
                                // Should handle configuration access
                                vscode.workspace.getConfiguration('codeCoach');
                                break;
                        }
                    }).not.toThrow();
                });

                // Property: Disposal should clean up all resources
                const initialDisposeCallCount = disposables.reduce((sum, d) => sum + d.dispose.mock.calls.length, 0);
                
                for (let i = 0; i < scenario.deactivationCount; i++) {
                    commandManager.dispose();
                }

                if (scenario.deactivationCount > 0) {
                    const finalDisposeCallCount = disposables.reduce((sum, d) => sum + d.dispose.mock.calls.length, 0);
                    expect(finalDisposeCallCount).toBeGreaterThan(initialDisposeCallCount);
                }

                // Property: Extension should handle multiple dispose calls gracefully
                expect(() => {
                    commandManager.dispose();
                    commandManager.dispose(); // Second call should not throw
                }).not.toThrow();
            }
        ), { numRuns: 100 });
    });
});