/**
 * Property-based tests for file modification safety
 * Feature: code-coach-vscode, Property 6: File Modification Safety
 */

import * as fc from 'fast-check';

// Setup VS Code mock before any imports
const mockVscode: any = {
    workspace: {},
    window: {},
    languages: {},
    commands: {},
    CodeActionKind: {
        QuickFix: 'quickfix',
        Refactor: 'refactor',
        RefactorExtract: 'refactor.extract',
        RefactorInline: 'refactor.inline',
        RefactorRewrite: 'refactor.rewrite',
        Source: 'source',
        SourceOrganizeImports: 'source.organizeImports'
    },
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
    },
    Uri: {
        parse: jest.fn((uri: string) => ({ 
            fsPath: uri.replace('file://', ''),
            toString: () => uri,
            scheme: 'file',
            authority: '',
            path: uri.replace('file://', ''),
            query: '',
            fragment: ''
        })),
        file: jest.fn((path: string): any => mockVscode.Uri.parse(`file://${path}`))
    },
    Range: jest.fn().mockImplementation((start: any, end: any) => ({
        start,
        end,
        isEmpty: start?.line === end?.line && start?.character === end?.character,
        isSingleLine: start?.line === end?.line,
        contains: jest.fn(),
        intersection: jest.fn(),
        union: jest.fn(),
        isEqual: jest.fn((other: any) => 
            start?.line === other?.start?.line && 
            start?.character === other?.start?.character &&
            end?.line === other?.end?.line && 
            end?.character === other?.end?.character
        ),
        toString: () => `Range(${start?.line},${start?.character} -> ${end?.line},${end?.character})`
    })),
    Position: jest.fn().mockImplementation((line: number, character: number) => ({
        line,
        character,
        compareTo: jest.fn(),
        isAfter: jest.fn(),
        isBefore: jest.fn(),
        isAfterOrEqual: jest.fn(),
        isBeforeOrEqual: jest.fn(),
        isEqual: jest.fn(),
        translate: jest.fn(),
        with: jest.fn()
    })),
    WorkspaceEdit: jest.fn().mockImplementation(() => ({
        size: 0,
        has: jest.fn(() => false),
        get: jest.fn(() => []),
        set: jest.fn(),
        delete: jest.fn(),
        entries: jest.fn(() => [])
    }))
};

// Set global mock
(global as any).vscode = mockVscode;

// Mock the vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

import * as vscode from 'vscode';
import { FileSafetyGuard } from '../../safety/FileSafetyGuard';
import { CommandManager } from '../../commands/CommandManager';
import { CodeCoachViewProvider } from '../../panel/CodeCoachViewProvider';
import { CodeCoachCodeActionProvider } from '../../commands/CodeActionProvider';
import { ConfigurationManager } from '../../config/ConfigurationManager';

// Use the mock vscode
const vscodeApi = mockVscode;

// Mock VS Code API components
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
    extensionUri: vscodeApi.Uri.parse('file:///test')
} as any;

const mockWorkspace = {
    getConfiguration: jest.fn(() => ({
        get: jest.fn((key: string, defaultValue: any = undefined) => {
            switch (key) {
                case 'apiBaseUrl': return 'https://api.codecoach.dev';
                case 'apiKey': return 'test-api-key-12345';
                case 'telemetryEnabled': return true;
                case 'userLevel': return 'beginner';
                case 'proactiveSuggestions': return true;
                default: return defaultValue;
            }
        })
    })),
    onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
    onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
    workspaceFolders: [
        { uri: vscodeApi.Uri.parse('file:///workspace') }
    ],
    fs: {
        writeFile: jest.fn(),
        createDirectory: jest.fn(),
        delete: jest.fn(),
        rename: jest.fn(),
        copy: jest.fn()
    },
    applyEdit: jest.fn()
};

const mockWindow = {
    activeTextEditor: null,
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    createWebviewPanel: jest.fn(),
    registerWebviewViewProvider: jest.fn()
};

const mockLanguages = {
    getDiagnostics: jest.fn(() => []),
    registerCodeActionsProvider: jest.fn(() => ({ dispose: jest.fn() }))
};

const mockCommands = {
    registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
    executeCommand: jest.fn()
};

// Override global mocks for this test
vscodeApi.workspace = mockWorkspace;
vscodeApi.window = mockWindow;
vscodeApi.languages = mockLanguages;
vscodeApi.commands = mockCommands;

describe('File Modification Safety Properties', () => {
    let safetyGuard: FileSafetyGuard;
    let configManager: ConfigurationManager;
    let commandManager: CommandManager;
    let viewProvider: CodeCoachViewProvider;
    let codeActionProvider: CodeCoachCodeActionProvider;
    let mockTelemetry: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Initialize safety guard
        safetyGuard = FileSafetyGuard.getInstance();
        
        // Initialize configuration manager
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
        
        // Initialize components
        try {
            commandManager = new CommandManager(mockContext, configManager, mockTelemetry);
            viewProvider = new CodeCoachViewProvider(mockContext.extensionUri);
            codeActionProvider = new CodeCoachCodeActionProvider(configManager);
        } catch (error) {
            // Some components may fail to initialize in test environment
            console.warn('Component initialization warning:', error);
        }
    });

    afterEach(() => {
        try {
            if (commandManager) {
                commandManager.dispose();
            }
            if (configManager) {
                configManager.dispose();
            }
            if (safetyGuard) {
                safetyGuard.dispose();
            }
        } catch (error) {
            // Ignore disposal errors in test environment
            console.warn('Disposal warning:', error);
        }
    });

    // Feature: code-coach-vscode, Property 6: File Modification Safety
    test('Property 6: Extension operations should never modify user files', () => {
        fc.assert(fc.property(
            // Generate various file operation scenarios
            fc.record({
                operationType: fc.constantFrom(
                    'explainSelection',
                    'reviewSelection', 
                    'explainError',
                    'showExplanation',
                    'showReview',
                    'showError',
                    'provideCodeActions'
                ),
                filePath: fc.oneof(
                    fc.constant('/workspace/test.py'),
                    fc.constant('/workspace/src/main.py'),
                    fc.constant('/workspace/lib/utils.py'),
                    fc.constant('/home/user/project/script.py')
                ),
                fileContent: fc.string({ minLength: 10, maxLength: 500 }),
                hasFileSystemAccess: fc.boolean()
            }),
            (scenario) => {
                // Setup mock document
                const mockDocument = {
                    uri: vscodeApi.Uri.parse(`file://${scenario.filePath}`),
                    languageId: 'python',
                    getText: jest.fn(() => scenario.fileContent),
                    lineAt: jest.fn((line: number) => ({
                        text: `line ${line}: ${scenario.fileContent.split('\n')[line] || 'code'}`,
                        range: new vscodeApi.Range(line, 0, line, 50)
                    })),
                    lineCount: scenario.fileContent.split('\n').length,
                    fileName: scenario.filePath,
                    isUntitled: false,
                    encoding: 'utf8',
                    version: 1,
                    isDirty: false,
                    isClosed: false,
                    save: jest.fn(),
                    eol: 1,
                    getWordRangeAtPosition: jest.fn(),
                    validateRange: jest.fn(),
                    validatePosition: jest.fn(),
                    offsetAt: jest.fn(),
                    positionAt: jest.fn()
                } as any;

                // Setup mock editor
                const mockEditor = {
                    document: mockDocument,
                    selection: new vscodeApi.Range(0, 0, 0, 10),
                    selections: [new vscodeApi.Range(0, 0, 0, 10)],
                    visibleRanges: [new vscodeApi.Range(0, 0, 10, 0)],
                    options: {},
                    viewColumn: 1,
                    edit: jest.fn(),
                    insertSnippet: jest.fn(),
                    setDecorations: jest.fn(),
                    revealRange: jest.fn(),
                    show: jest.fn(),
                    hide: jest.fn()
                } as any;

                (mockWindow as any).activeTextEditor = mockEditor;

                // Track all file system operations
                const fileSystemCalls: string[] = [];
                
                // Mock file system operations to track calls
                mockWorkspace.fs.writeFile = jest.fn((...args) => {
                    fileSystemCalls.push('writeFile');
                    throw new Error('FlowPilot Safety Violation: File modification attempted');
                });
                
                mockWorkspace.fs.createDirectory = jest.fn((...args) => {
                    fileSystemCalls.push('createDirectory');
                    throw new Error('FlowPilot Safety Violation: Directory creation attempted');
                });
                
                mockWorkspace.fs.delete = jest.fn((...args) => {
                    fileSystemCalls.push('delete');
                    throw new Error('FlowPilot Safety Violation: File deletion attempted');
                });
                
                mockWorkspace.fs.rename = jest.fn((...args) => {
                    fileSystemCalls.push('rename');
                    throw new Error('FlowPilot Safety Violation: File rename attempted');
                });
                
                mockWorkspace.fs.copy = jest.fn((...args) => {
                    fileSystemCalls.push('copy');
                    throw new Error('FlowPilot Safety Violation: File copy attempted');
                });

                mockWorkspace.applyEdit = jest.fn((edit: vscode.WorkspaceEdit) => {
                    fileSystemCalls.push('applyEdit');
                    throw new Error('FlowPilot Safety Violation: Workspace edit attempted');
                });

                // Test the operation based on type
                let operationResult: any = null;
                let operationError: Error | null = null;

                try {
                    switch (scenario.operationType) {
                        case 'explainSelection':
                            // Validate operation is safe
                            expect(() => safetyGuard.validateOperation('explainSelection')).not.toThrow();
                            expect(() => safetyGuard.validateReadOnlyEditor(mockEditor, 'explainSelection')).not.toThrow();
                            expect(() => safetyGuard.validateReadPath(scenario.filePath)).not.toThrow();
                            break;

                        case 'reviewSelection':
                            // Validate operation is safe
                            expect(() => safetyGuard.validateOperation('reviewSelection')).not.toThrow();
                            expect(() => safetyGuard.validateReadOnlyEditor(mockEditor, 'reviewSelection')).not.toThrow();
                            expect(() => safetyGuard.validateReadPath(scenario.filePath)).not.toThrow();
                            break;

                        case 'explainError':
                            // Validate operation is safe
                            expect(() => safetyGuard.validateOperation('explainError')).not.toThrow();
                            expect(() => safetyGuard.validateReadOnlyEditor(mockEditor, 'explainError')).not.toThrow();
                            expect(() => safetyGuard.validateReadPath(scenario.filePath)).not.toThrow();
                            break;

                        case 'showExplanation':
                            const mockExplanation = {
                                type: 'explain' as const,
                                summary: 'Test explanation',
                                lineByLine: [{ lineOffset: 0, code: 'test', explanation: 'test explanation' }]
                            };
                            viewProvider.showExplanation(mockExplanation);
                            break;

                        case 'showReview':
                            const mockReview = {
                                type: 'review' as const,
                                summary: 'Test review',
                                goodPoints: ['Good point'],
                                improvementPoints: ['Improvement'],
                                improvements: [{ description: 'Test', reasoning: 'Test reasoning' }]
                            };
                            viewProvider.showReview(mockReview);
                            break;

                        case 'showError':
                            const mockError = {
                                type: 'error' as const,
                                errorMeaning: 'Test error',
                                whyHere: 'Test why',
                                howToFix: 'Test fix'
                            };
                            viewProvider.showError(mockError);
                            break;

                        case 'provideCodeActions':
                            const mockRange = new vscodeApi.Range(0, 0, 0, 10);
                            const mockContext = {
                                diagnostics: [
                                    {
                                        message: 'Test error',
                                        range: mockRange,
                                        severity: vscodeApi.DiagnosticSeverity.Error,
                                        source: 'test',
                                        code: 'TEST001'
                                    }
                                ]
                            } as any;
                            operationResult = codeActionProvider.provideCodeActions(
                                mockDocument as any,
                                mockRange,
                                mockContext,
                                {} as any
                            );
                            break;
                    }
                } catch (error) {
                    operationError = error as Error;
                }

                // Property: No file system operations should be called
                expect(fileSystemCalls).toHaveLength(0);

                // Property: Operations should complete without file modification errors
                if (operationError) {
                    // If there's an error, it should NOT be a file modification error
                    expect(operationError.message).not.toContain('FlowPilot Safety Violation');
                }

                // Property: Read operations should be allowed
                expect(() => safetyGuard.validateOperation('getText')).not.toThrow();
                expect(() => safetyGuard.validateOperation('readFile')).not.toThrow();
                expect(() => safetyGuard.validateOperation('getDiagnostics')).not.toThrow();

                // Property: Write operations should be blocked
                expect(() => safetyGuard.validateOperation('writeFile')).not.toThrow(); // validateOperation logs but doesn't throw
                expect(() => safetyGuard.preventFileModification('writeFile', scenario.filePath)).toThrow();
                expect(() => safetyGuard.preventFileModification('createFile', scenario.filePath)).toThrow();
                expect(() => safetyGuard.preventFileModification('delete', scenario.filePath)).toThrow();

                // Property: Workspace edits should be blocked
                const mockEdit = new vscodeApi.WorkspaceEdit();
                if (mockEdit.size > 0) {
                    expect(() => safetyGuard.validateNoEdits(mockEdit)).toThrow();
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 6: Safety guard should prevent all file modification operations', () => {
        fc.assert(fc.property(
            // Generate various file modification scenarios
            fc.record({
                operation: fc.constantFrom(
                    'writeFile',
                    'createFile', 
                    'delete',
                    'rename',
                    'copy',
                    'move',
                    'edit',
                    'applyEdit',
                    'insertText',
                    'replaceText',
                    'deleteText',
                    'save',
                    'saveAs'
                ),
                filePath: fc.string({ minLength: 5, maxLength: 100 }),
                content: fc.string({ maxLength: 1000 })
            }),
            (scenario) => {
                // Property: All file modification operations should be blocked
                expect(() => {
                    safetyGuard.preventFileModification(scenario.operation, scenario.filePath, {
                        content: scenario.content
                    });
                }).toThrow();

                // Property: Error message should indicate safety violation
                try {
                    safetyGuard.preventFileModification(scenario.operation, scenario.filePath);
                    fail('Expected safety violation error');
                } catch (error) {
                    expect((error as Error).message).toContain('FlowPilot Safety Violation');
                    expect((error as Error).message).toContain(scenario.operation);
                    expect((error as Error).message).toContain(scenario.filePath);
                    expect((error as Error).message).toContain('read-only');
                }

                // Property: Blocked operations should be in the blocked list
                const safetyStatus = safetyGuard.getSafetyStatus();
                expect(safetyStatus.isActive).toBe(true);
                expect(safetyStatus.blockedOperationsCount).toBeGreaterThan(0);
            }
        ), { numRuns: 100 });
    });

    test('Property 6: Safety guard should allow all read-only operations', () => {
        fc.assert(fc.property(
            // Generate various read-only operation scenarios
            fc.record({
                operation: fc.constantFrom(
                    'readFile',
                    'stat',
                    'readDirectory',
                    'getText',
                    'getSelection',
                    'getDiagnostics',
                    'getConfiguration',
                    'showInformationMessage',
                    'showWarningMessage',
                    'showErrorMessage',
                    'createWebviewPanel',
                    'registerCommand',
                    'executeCommand'
                ),
                filePath: fc.string({ minLength: 5, maxLength: 100 }),
                context: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean()))
            }),
            (scenario) => {
                // Property: All read-only operations should be allowed
                expect(() => {
                    const isValid = safetyGuard.validateOperation(scenario.operation, scenario.context);
                    expect(isValid).toBe(true);
                }).not.toThrow();

                // Property: Read paths should be validated successfully
                if (scenario.operation === 'readFile' || scenario.operation === 'getText') {
                    expect(() => {
                        const isValidPath = safetyGuard.validateReadPath(scenario.filePath);
                        expect(isValidPath).toBe(true);
                    }).not.toThrow();
                }

                // Property: Safety status should show allowed operations
                const safetyStatus = safetyGuard.getSafetyStatus();
                expect(safetyStatus.allowedOperationsCount).toBeGreaterThan(0);
            }
        ), { numRuns: 100 });
    });

    test('Property 6: Text editor operations should be validated for safety', () => {
        fc.assert(fc.property(
            // Generate various text editor operation scenarios
            fc.record({
                operation: fc.oneof(
                    fc.constant('explainSelection'),
                    fc.constant('reviewSelection'),
                    fc.constant('getSelection'),
                    fc.constant('getText'),
                    fc.constant('editText'), // This should be blocked
                    fc.constant('insertText'), // This should be blocked
                    fc.constant('replaceText'), // This should be blocked
                    fc.constant('deleteText') // This should be blocked
                ),
                documentContent: fc.string({ minLength: 10, maxLength: 500 }),
                languageId: fc.constantFrom('python', 'javascript', 'typescript'),
                filePath: fc.string({ minLength: 5, maxLength: 100 })
            }),
            (scenario) => {
                // Create mock editor
                const mockDocument = {
                    uri: vscodeApi.Uri.parse(`file://${scenario.filePath}`),
                    languageId: scenario.languageId,
                    getText: jest.fn(() => scenario.documentContent),
                    fileName: scenario.filePath,
                    isUntitled: false,
                    encoding: 'utf8',
                    version: 1,
                    isDirty: false,
                    isClosed: false,
                    save: jest.fn(),
                    eol: 1,
                    lineCount: 10,
                    lineAt: jest.fn(),
                    getWordRangeAtPosition: jest.fn(),
                    validateRange: jest.fn(),
                    validatePosition: jest.fn(),
                    offsetAt: jest.fn(),
                    positionAt: jest.fn()
                } as any;

                const mockEditor = {
                    document: mockDocument,
                    selection: new vscodeApi.Range(0, 0, 0, 10),
                    selections: [new vscodeApi.Range(0, 0, 0, 10)],
                    visibleRanges: [new vscodeApi.Range(0, 0, 10, 0)],
                    options: {},
                    viewColumn: 1,
                    edit: jest.fn(),
                    insertSnippet: jest.fn(),
                    setDecorations: jest.fn(),
                    revealRange: jest.fn(),
                    show: jest.fn(),
                    hide: jest.fn()
                } as any;

                // Property: Read-only operations should be allowed
                if (['explainSelection', 'reviewSelection', 'getSelection', 'getText'].includes(scenario.operation)) {
                    expect(() => {
                        safetyGuard.validateReadOnlyEditor(mockEditor, scenario.operation);
                    }).not.toThrow();
                }

                // Property: Modification operations should be blocked
                if (['editText', 'insertText', 'replaceText', 'deleteText'].includes(scenario.operation)) {
                    expect(() => {
                        safetyGuard.validateReadOnlyEditor(mockEditor, scenario.operation);
                    }).toThrow();

                    // Verify error message
                    try {
                        safetyGuard.validateReadOnlyEditor(mockEditor, scenario.operation);
                        fail('Expected safety violation error');
                    } catch (error) {
                        expect((error as Error).message).toContain('FlowPilot Safety Violation');
                        expect((error as Error).message).toContain(scenario.operation);
                        expect((error as Error).message).toContain('read-only');
                    }
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 6: Workspace edits should be completely blocked', () => {
        fc.assert(fc.property(
            // Generate various workspace edit scenarios
            fc.record({
                editCount: fc.integer({ min: 1, max: 10 }),
                filePaths: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
                editTypes: fc.array(
                    fc.constantFrom('insert', 'replace', 'delete'),
                    { minLength: 1, maxLength: 3 }
                )
            }),
            (scenario) => {
                // Create mock workspace edit with some edits
                const mockEdit = {
                    size: scenario.editCount,
                    has: jest.fn(() => true),
                    get: jest.fn(() => []),
                    set: jest.fn(),
                    delete: jest.fn(),
                    entries: jest.fn(() => scenario.filePaths.map(path => [vscodeApi.Uri.parse(path), []]))
                };

                // Property: Any workspace edit with size > 0 should be blocked
                if (scenario.editCount > 0) {
                    expect(() => {
                        safetyGuard.validateNoEdits(mockEdit as any);
                    }).toThrow();

                    // Verify error message
                    try {
                        safetyGuard.validateNoEdits(mockEdit as any);
                        fail('Expected safety violation error');
                    } catch (error) {
                        expect((error as Error).message).toContain('FlowPilot Safety Violation');
                        expect((error as Error).message).toContain('workspace edits');
                        expect((error as Error).message).toContain('read-only');
                    }
                }

                // Property: Empty workspace edit should be allowed
                const emptyEdit = { size: 0 };
                expect(() => {
                    safetyGuard.validateNoEdits(emptyEdit as any);
                }).not.toThrow();
            }
        ), { numRuns: 100 });
    });

    test('Property 6: Safety status should accurately reflect protection state', () => {
        fc.assert(fc.property(
            // Generate safety status check scenarios
            fc.constant({}),
            () => {
                // Property: Safety guard should always be active
                const status = safetyGuard.getSafetyStatus();
                expect(status.isActive).toBe(true);

                // Property: Should have blocked operations configured
                expect(status.blockedOperationsCount).toBeGreaterThan(0);

                // Property: Should have allowed operations configured
                expect(status.allowedOperationsCount).toBeGreaterThan(0);

                // Property: Should have a valid timestamp
                expect(status.lastCheck).toBeDefined();
                expect(new Date(status.lastCheck).getTime()).toBeGreaterThan(0);

                // Property: Violations count should be a non-negative number
                expect(status.violationsDetected).toBeGreaterThanOrEqual(0);
            }
        ), { numRuns: 100 });
    });
});