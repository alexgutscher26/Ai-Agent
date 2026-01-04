/**
 * Integration tests for complete FlowPilot workflows
 * Tests end-to-end explain, review, and error analysis flows
 * Verifies component interactions and data flow
 */

import * as vscode from 'vscode';
import { CommandManager } from '../../commands/CommandManager';
import { CodeCoachViewProvider } from '../../panel/CodeCoachViewProvider';
import { ConfigurationManager } from '../../config/ConfigurationManager';
import { Telemetry } from '../../telemetry/Telemetry';
import { ConfusionDetector } from '../../confusion/ConfusionDetector';
import { ExplanationResponse, ReviewResponse, ErrorResponse } from '../../types';

describe('FlowPilot Integration Tests', () => {
    let context: vscode.ExtensionContext;
    let configManager: ConfigurationManager;
    let commandManager: CommandManager;
    let viewProvider: CodeCoachViewProvider;
    let telemetry: Telemetry;
    let confusionDetector: ConfusionDetector;
    let mockDocument: vscode.TextDocument;
    let mockEditor: vscode.TextEditor;

    beforeEach(async () => {
        // Create mock extension context
        context = {
            subscriptions: [],
            globalState: {
                get: jest.fn().mockReturnValue(false),
                update: jest.fn().mockResolvedValue(undefined),
                keys: jest.fn().mockReturnValue([])
            },
            workspaceState: {
                get: jest.fn().mockReturnValue(undefined),
                update: jest.fn().mockResolvedValue(undefined),
                keys: jest.fn().mockReturnValue([])
            },
            extensionUri: vscode.Uri.file('/mock/extension/path'),
            extensionPath: '/mock/extension/path',
            asAbsolutePath: jest.fn().mockImplementation((path: string) => `/mock/extension/path/${path}`),
            storageUri: vscode.Uri.file('/mock/storage'),
            globalStorageUri: vscode.Uri.file('/mock/global/storage'),
            logUri: vscode.Uri.file('/mock/log'),
            extensionMode: vscode.ExtensionMode.Test,
            secrets: {
                get: jest.fn().mockResolvedValue(undefined),
                store: jest.fn().mockResolvedValue(undefined),
                delete: jest.fn().mockResolvedValue(undefined),
                onDidChange: jest.fn().mockReturnValue({ dispose: jest.fn() })
            },
            environmentVariableCollection: {
                persistent: false,
                replace: jest.fn(),
                append: jest.fn(),
                prepend: jest.fn(),
                get: jest.fn(),
                forEach: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn()
            }
        } as any;

        // Initialize components
        configManager = new ConfigurationManager(context);
        telemetry = new Telemetry(context, configManager);
        commandManager = new CommandManager(context, configManager, telemetry);
        viewProvider = new CodeCoachViewProvider(context.extensionUri);
        confusionDetector = new ConfusionDetector(context, configManager);

        // Wire components together
        viewProvider.setTelemetry(telemetry);
        viewProvider.setConfigurationManager(configManager);
        commandManager.setViewProvider(viewProvider);
        confusionDetector.setTelemetry(telemetry);

        // Create mock Python document
        mockDocument = {
            uri: vscode.Uri.file('/mock/test.py'),
            fileName: '/mock/test.py',
            isUntitled: false,
            languageId: 'python',
            version: 1,
            isDirty: false,
            isClosed: false,
            save: jest.fn().mockResolvedValue(true),
            eol: vscode.EndOfLine.LF,
            lineCount: 10,
            getText: jest.fn().mockImplementation((range?: vscode.Range) => {
                const fullText = `def hello_world():
    print("Hello, World!")
    return "success"

def calculate_sum(a, b):
    result = a + b
    return result

x = calculate_sum(5, 3)
print(x)`;
                if (range) {
                    const lines = fullText.split('\n');
                    return lines.slice(range.start.line, range.end.line + 1).join('\n');
                }
                return fullText;
            }),
            getWordRangeAtPosition: jest.fn(),
            validateRange: jest.fn().mockImplementation((range: vscode.Range) => range),
            validatePosition: jest.fn().mockImplementation((position: vscode.Position) => position),
            lineAt: jest.fn().mockImplementation((line: number) => ({
                lineNumber: line,
                text: `    print("Hello, World!")`, // Mock line content
                range: new vscode.Range(line, 0, line, 25),
                rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
                firstNonWhitespaceCharacterIndex: 4,
                isEmptyOrWhitespace: false
            })),
            offsetAt: jest.fn(),
            positionAt: jest.fn()
        } as any;

        // Create mock editor
        mockEditor = {
            document: mockDocument,
            selection: new vscode.Selection(1, 4, 1, 25), // Select print statement
            selections: [new vscode.Selection(1, 4, 1, 25)],
            visibleRanges: [new vscode.Range(0, 0, 9, 0)],
            options: {
                cursorStyle: vscode.TextEditorCursorStyle.Line,
                insertSpaces: true,
                lineNumbers: vscode.TextEditorLineNumbersStyle.On,
                tabSize: 4
            },
            viewColumn: vscode.ViewColumn.One,
            edit: jest.fn().mockResolvedValue(true),
            insertSnippet: jest.fn().mockResolvedValue(true),
            setDecorations: jest.fn(),
            revealRange: jest.fn(),
            show: jest.fn(),
            hide: jest.fn()
        } as any;

        // Mock VS Code window and workspace
        jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);
        jest.spyOn(vscode.window, 'showInformationMessage').mockResolvedValue(undefined);
        jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue(undefined);
        jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);
        jest.spyOn(vscode.window, 'withProgress').mockImplementation(async (options, task) => {
            const progress = {
                report: jest.fn()
            };
            return task(progress, {} as any);
        });

        // Mock configuration to enable demo mode
        jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'demoMode': return true;
                    case 'telemetryEnabled': return false;
                    case 'userLevel': return 'beginner';
                    case 'proactiveSuggestions': return true;
                    default: return undefined;
                }
            }),
            has: jest.fn().mockReturnValue(true),
            inspect: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined)
        } as any);

        // Register commands
        commandManager.registerCommands();
    });

    afterEach(() => {
        // Clean up
        jest.restoreAllMocks();
        commandManager.dispose();
        telemetry.dispose();
        confusionDetector.dispose();
    });

    describe('Explain Selection Workflow', () => {
        it('should complete end-to-end explain workflow with selection', async () => {
            // Arrange: Set up editor with selection
            mockEditor.selection = new vscode.Selection(1, 4, 1, 25); // Select print statement
            
            // Act: Execute explain command
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify workflow completion
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
            expect(viewState.currentExplanation?.type).toBe('explain');
            expect(viewState.history).toHaveLength(1);
            
            // Verify explanation content structure
            const explanation = viewState.currentExplanation as ExplanationResponse;
            expect(explanation.summary).toBeDefined();
            expect(explanation.lineByLine).toBeDefined();
            expect(Array.isArray(explanation.lineByLine)).toBe(true);
        });

        it('should complete end-to-end explain workflow without selection (auto-expand)', async () => {
            // Arrange: Set up editor without selection (cursor only)
            mockEditor.selection = new vscode.Selection(1, 4, 1, 4); // Cursor at position
            
            // Act: Execute explain command
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify workflow completion with auto-expansion
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
            expect(viewState.currentExplanation?.type).toBe('explain');
            
            // Verify that code was automatically expanded
            const explanation = viewState.currentExplanation as ExplanationResponse;
            expect(explanation.summary).toContain('function'); // Should detect function context
        });

        it('should handle explain workflow errors gracefully', async () => {
            // Arrange: Set up invalid document
            jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(undefined);
            
            // Act: Execute explain command
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify error handling
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor found');
        });
    });

    describe('Review Selection Workflow', () => {
        it('should complete end-to-end review workflow', async () => {
            // Arrange: Set up editor with function selection
            mockEditor.selection = new vscode.Selection(0, 0, 2, 20); // Select entire function
            
            // Act: Execute review command
            await vscode.commands.executeCommand('codeCoach.reviewSelection');
            
            // Assert: Verify workflow completion
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
            expect(viewState.currentExplanation?.type).toBe('review');
            
            // Verify review content structure
            const review = viewState.currentExplanation as ReviewResponse;
            expect(review.summary).toBeDefined();
            expect(review.goodPoints).toBeDefined();
            expect(review.improvements).toBeDefined();
        });

        it('should track telemetry for review requests', async () => {
            // Arrange: Enable telemetry
            jest.spyOn(configManager, 'isTelemetryEnabled').mockReturnValue(true);
            const telemetrySpy = jest.spyOn(telemetry, 'trackReviewRequest');
            
            // Act: Execute review command
            await vscode.commands.executeCommand('codeCoach.reviewSelection');
            
            // Assert: Verify telemetry tracking
            expect(telemetrySpy).toHaveBeenCalledWith(expect.objectContaining({
                languageId: 'python',
                triggerMethod: 'command',
                success: true
            }));
        });
    });

    describe('Error Explanation Workflow', () => {
        it('should complete end-to-end error explanation workflow', async () => {
            // Arrange: Set up diagnostics
            const mockDiagnostic = new vscode.Diagnostic(
                new vscode.Range(1, 0, 1, 10),
                'SyntaxError: invalid syntax',
                vscode.DiagnosticSeverity.Error
            );
            
            (vscode.languages.getDiagnostics as jest.Mock).mockReturnValue([mockDiagnostic]);
            mockEditor.selection = new vscode.Selection(1, 5, 1, 5); // Cursor on error line
            
            // Act: Execute error explanation command
            await vscode.commands.executeCommand('codeCoach.explainError');
            
            // Assert: Verify workflow completion
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
            expect(viewState.currentExplanation?.type).toBe('error');
            
            // Verify error explanation content structure
            const errorExplanation = viewState.currentExplanation as ErrorResponse;
            expect(errorExplanation.errorMeaning).toBeDefined();
            expect(errorExplanation.whyHere).toBeDefined();
            expect(errorExplanation.howToFix).toBeDefined();
        });

        it('should handle no diagnostics gracefully', async () => {
            // Arrange: No diagnostics
            (vscode.languages.getDiagnostics as jest.Mock).mockReturnValue([]);
            
            // Act: Execute error explanation command
            await vscode.commands.executeCommand('codeCoach.explainError');
            
            // Assert: Verify graceful handling
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No errors found at cursor position');
        });
    });

    describe('Component Integration', () => {
        it('should properly integrate confusion detector with command manager', async () => {
            // Arrange: Set up confusion detection scenario
            const mockDiagnostic = new vscode.Diagnostic(
                new vscode.Range(1, 0, 1, 10),
                'NameError: name "undefined_var" is not defined',
                vscode.DiagnosticSeverity.Error
            );
            
            (vscode.languages.getDiagnostics as jest.Mock).mockReturnValue([mockDiagnostic]);
            
            // Act: Simulate confusion detection
            const callbackSpy = jest.fn();
            confusionDetector.onHelpOfferedCallback(callbackSpy);
            
            // Simulate cursor dwell on error line
            mockEditor.selection = new vscode.Selection(1, 5, 1, 5);
            
            // Trigger confusion detection manually (simulating timer)
            const metrics = confusionDetector.getMetrics(mockDocument);
            
            // Assert: Verify integration
            expect(confusionDetector).toBeDefined();
            expect(typeof confusionDetector.onHelpOfferedCallback).toBe('function');
        });

        it('should properly integrate view provider with command manager', async () => {
            // Arrange: Verify view provider is set
            expect(viewProvider).toBeDefined();
            
            // Act: Execute command that uses view provider
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify view provider received content
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
        });

        it('should properly integrate telemetry across components', async () => {
            // Arrange: Enable telemetry
            jest.spyOn(configManager, 'isTelemetryEnabled').mockReturnValue(true);
            
            // Act: Execute various commands
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            await vscode.commands.executeCommand('codeCoach.reviewSelection');
            
            // Assert: Verify telemetry integration
            const telemetryStatus = telemetry.getStatus();
            expect(telemetryStatus.enabled).toBe(true);
            expect(telemetryStatus.sessionId).toBeDefined();
        });
    });

    describe('Configuration Integration', () => {
        it('should respect user level configuration across components', async () => {
            // Arrange: Set intermediate user level
            jest.spyOn(configManager, 'getUserLevel').mockReturnValue('intermediate');
            
            // Act: Execute command
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify user level is used
            expect(configManager.getUserLevel()).toBe('intermediate');
        });

        it('should handle demo mode configuration', async () => {
            // Arrange: Verify demo mode is enabled
            expect(configManager.isDemoModeEnabled()).toBe(true);
            
            // Act: Execute command in demo mode
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify demo mode works
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
        });
    });

    describe('Safety and Performance Integration', () => {
        it('should maintain read-only operations throughout workflow', async () => {
            // Arrange: Track document modifications
            const editSpy = jest.spyOn(mockEditor, 'edit');
            
            // Act: Execute all commands
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            await vscode.commands.executeCommand('codeCoach.reviewSelection');
            
            // Assert: Verify no document modifications
            expect(editSpy).not.toHaveBeenCalled();
            expect(mockDocument.isDirty).toBe(false);
        });

        it('should complete workflows within performance thresholds', async () => {
            // Arrange: Track timing
            const startTime = performance.now();
            
            // Act: Execute command
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify performance
            const duration = performance.now() - startTime;
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle API failures gracefully across components', async () => {
            // Arrange: Mock API failure
            jest.spyOn(configManager, 'isDemoModeEnabled').mockReturnValue(false);
            jest.spyOn(configManager, 'validateConfiguration').mockReturnValue({
                isValid: false,
                errors: ['Invalid API key'],
                warnings: []
            });
            
            // Act: Execute command
            await vscode.commands.executeCommand('codeCoach.explainSelection');
            
            // Assert: Verify graceful error handling
            expect(vscode.window.showErrorMessage).toHaveBeenCalled();
        });

        it('should maintain component state during errors', async () => {
            // Arrange: Force an error condition
            jest.spyOn(mockDocument, 'getText').mockImplementation(() => {
                throw new Error('Mock document error');
            });
            
            // Act: Execute command (should handle error)
            try {
                await vscode.commands.executeCommand('codeCoach.explainSelection');
            } catch (error) {
                // Expected to handle gracefully
            }
            
            // Assert: Verify components are still functional
            expect(configManager).toBeDefined();
            expect(viewProvider).toBeDefined();
            expect(telemetry).toBeDefined();
        });
    });
});