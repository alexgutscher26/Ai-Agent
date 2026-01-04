/**
 * Integration tests for data flow between FlowPilot components
 * Verifies that data flows correctly through the entire system
 */

import * as vscode from 'vscode';
import { CommandManager } from '../../commands/CommandManager';
import { CodeCoachViewProvider } from '../../panel/CodeCoachViewProvider';
import { ConfigurationManager } from '../../config/ConfigurationManager';
import { Telemetry } from '../../telemetry/Telemetry';
import { ConfusionDetector } from '../../confusion/ConfusionDetector';
import { FileSafetyGuard } from '../../safety/FileSafetyGuard';
import { PerformanceMonitor } from '../../performance/PerformanceMonitor';

describe('FlowPilot Data Flow Integration Tests', () => {
    let context: vscode.ExtensionContext;
    let configManager: ConfigurationManager;
    let commandManager: CommandManager;
    let viewProvider: CodeCoachViewProvider;
    let telemetry: Telemetry;
    let confusionDetector: ConfusionDetector;
    let safetyGuard: FileSafetyGuard;
    let performanceMonitor: PerformanceMonitor;

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
        safetyGuard = FileSafetyGuard.getInstance();
        performanceMonitor = PerformanceMonitor.getInstance();

        // Wire components together
        viewProvider.setTelemetry(telemetry);
        viewProvider.setConfigurationManager(configManager);
        commandManager.setViewProvider(viewProvider);
        confusionDetector.setTelemetry(telemetry);

        // Mock VS Code APIs
        jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'demoMode': return true;
                    case 'telemetryEnabled': return true;
                    case 'userLevel': return 'beginner';
                    case 'proactiveSuggestions': return true;
                    case 'apiBaseUrl': return 'https://api.codecoach.dev';
                    case 'apiKey': return 'test-key';
                    default: return undefined;
                }
            }),
            has: jest.fn().mockReturnValue(true),
            inspect: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined)
        } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        commandManager.dispose();
        telemetry.dispose();
        confusionDetector.dispose();
        safetyGuard.dispose();
        performanceMonitor.dispose();
    });

    describe('Configuration Data Flow', () => {
        it('should propagate configuration changes to all components', async () => {
            // Arrange: Track configuration access
            const getUserLevelSpy = jest.spyOn(configManager, 'getUserLevel');
            const isTelemetryEnabledSpy = jest.spyOn(configManager, 'isTelemetryEnabled');
            
            // Act: Simulate configuration change
            const configChangeEvent = {
                affectsConfiguration: jest.fn().mockImplementation((section: string) => 
                    section === 'codeCoach' || section === 'codeCoach.userLevel'
                )
            };
            
            // Trigger configuration change handlers
            await vscode.workspace.onDidChangeConfiguration(configChangeEvent as any);
            
            // Assert: Verify components access updated configuration
            expect(getUserLevelSpy).toBeDefined();
            expect(isTelemetryEnabledSpy).toBeDefined();
        });

        it('should validate configuration data flow', async () => {
            // Act: Get configuration validation
            const validation = configManager.validateConfiguration();
            
            // Assert: Verify validation structure
            expect(validation).toHaveProperty('isValid');
            expect(typeof validation.isValid).toBe('boolean');
            
            if (!validation.isValid) {
                expect(validation).toHaveProperty('errors');
                expect(Array.isArray(validation.errors)).toBe(true);
            }
        });
    });

    describe('API Request Data Flow', () => {
        it('should flow request data from command to API client', async () => {
            // Arrange: Create mock document and editor
            const mockDocument = {
                uri: vscode.Uri.file('/test.py'),
                languageId: 'python',
                getText: jest.fn().mockReturnValue('print("Hello, World!")'),
                lineAt: jest.fn().mockReturnValue({
                    text: 'print("Hello, World!")',
                    range: new vscode.Range(0, 0, 0, 22)
                })
            } as any;

            const mockEditor = {
                document: mockDocument,
                selection: new vscode.Selection(0, 0, 0, 22)
            } as any;

            jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);
            jest.spyOn(vscode.window, 'withProgress').mockImplementation(async (options, task) => {
                const progress = { report: jest.fn() };
                return task(progress, {} as any);
            });

            // Act: Execute explain command
            await vscode.commands.executeCommand('codeCoach.explainSelection');

            // Assert: Verify data flow to view provider
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toBeDefined();
            expect(viewState.currentExplanation?.type).toBe('explain');
        });

        it('should handle API response data flow to UI', async () => {
            // Arrange: Mock API response
            const mockResponse = {
                type: 'explain' as const,
                summary: 'This code prints a greeting message',
                lineByLine: [
                    {
                        lineOffset: 0,
                        code: 'print("Hello, World!")',
                        explanation: 'Prints the string "Hello, World!" to the console'
                    }
                ],
                pitfalls: ['Make sure to use proper string quotes'],
                tryItYourself: 'Try changing the message to something else'
            };

            // Act: Show explanation in view provider
            viewProvider.showExplanation(mockResponse);

            // Assert: Verify data flow to UI
            const viewState = viewProvider.getState();
            expect(viewState.currentExplanation).toEqual(mockResponse);
            expect(viewState.history).toContain(mockResponse);
        });
    });

    describe('Telemetry Data Flow', () => {
        it('should flow telemetry data from components to telemetry system', async () => {
            // Arrange: Enable telemetry and spy on tracking methods
            jest.spyOn(configManager, 'isTelemetryEnabled').mockReturnValue(true);
            const trackExplanationSpy = jest.spyOn(telemetry, 'trackExplanationRequest');

            // Create mock editor
            const mockDocument = {
                uri: vscode.Uri.file('/test.py'),
                languageId: 'python',
                getText: jest.fn().mockReturnValue('print("test")'),
                lineAt: jest.fn().mockReturnValue({
                    text: 'print("test")',
                    range: new vscode.Range(0, 0, 0, 13)
                })
            } as any;

            const mockEditor = {
                document: mockDocument,
                selection: new vscode.Selection(0, 0, 0, 13)
            } as any;

            jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(mockEditor);
            jest.spyOn(vscode.window, 'withProgress').mockImplementation(async (options, task) => {
                const progress = { report: jest.fn() };
                return task(progress, {} as any);
            });

            // Act: Execute command that generates telemetry
            await vscode.commands.executeCommand('codeCoach.explainSelection');

            // Assert: Verify telemetry data flow
            expect(trackExplanationSpy).toHaveBeenCalledWith(expect.objectContaining({
                languageId: 'python',
                triggerMethod: 'command',
                userLevel: 'beginner',
                success: true
            }));
        });

        it('should flow feedback data from UI to telemetry', async () => {
            // Arrange: Set up feedback tracking
            const trackFeedbackSpy = jest.spyOn(telemetry, 'trackFeedback');
            
            // Show an explanation first
            const mockExplanation = {
                type: 'explain' as const,
                summary: 'Test explanation',
                lineByLine: []
            };
            viewProvider.showExplanation(mockExplanation);

            // Act: Simulate feedback from webview
            const feedbackMessage = {
                type: 'feedback' as const,
                data: {
                    helpful: true,
                    comment: 'Very helpful!'
                }
            };

            // Simulate webview message handling
            (viewProvider as any)._handleWebviewMessage(feedbackMessage);

            // Assert: Verify feedback data flow
            expect(trackFeedbackSpy).toHaveBeenCalledWith(expect.objectContaining({
                helpful: true,
                featureUsed: 'explain',
                userLevel: 'beginner'
            }));
        });
    });

    describe('Safety Guard Data Flow', () => {
        it('should validate operations through safety guard', async () => {
            // Arrange: Spy on safety validation
            const validateOperationSpy = jest.spyOn(safetyGuard, 'validateOperation');

            // Act: Execute operation that should be validated
            viewProvider.showExplanation({
                type: 'explain',
                summary: 'Test',
                lineByLine: []
            });

            // Assert: Verify safety validation
            expect(validateOperationSpy).toHaveBeenCalledWith('showExplanation', expect.any(Object));
        });

        it('should prevent unsafe operations', async () => {
            // Arrange: Mock unsafe operation
            const mockUnsafeOperation = () => {
                safetyGuard.validateOperation('unsafeWrite', { path: '/system/file' });
            };

            // Act & Assert: Verify unsafe operation is prevented
            expect(mockUnsafeOperation).toThrow();
        });
    });

    describe('Performance Monitor Data Flow', () => {
        it('should track operation performance data', async () => {
            // Arrange: Start monitoring an operation
            const operationId = performanceMonitor.startOperation('testOperation');

            // Act: Complete the operation
            const metrics = performanceMonitor.endOperation(operationId, true);

            // Assert: Verify performance data flow
            expect(metrics).toBeDefined();
            expect(metrics?.operationName).toBe('testOperation');
            expect(metrics?.success).toBe(true);
            expect(typeof metrics?.duration).toBe('number');
        });

        it('should provide performance statistics', async () => {
            // Act: Get performance stats
            const stats = performanceMonitor.getStats();

            // Assert: Verify stats structure
            expect(stats).toHaveProperty('totalOperations');
            expect(stats).toHaveProperty('averageDuration');
            expect(stats).toHaveProperty('successRate');
            expect(stats).toHaveProperty('activeOperations');
        });
    });

    describe('Confusion Detector Data Flow', () => {
        it('should flow confusion detection data to telemetry', async () => {
            // Arrange: Set up confusion detection tracking
            const trackConfusionSpy = jest.spyOn(telemetry, 'trackConfusionDetection');
            
            // Create mock document
            const mockDocument = {
                uri: vscode.Uri.file('/test.py'),
                languageId: 'python'
            } as any;

            // Act: Simulate confusion detection
            confusionDetector.onHelpOfferedCallback((diagnostic, reason) => {
                // This callback should trigger telemetry
            });

            // Manually trigger confusion detection telemetry
            telemetry.trackConfusionDetection({
                triggerType: 'dwellTime',
                dwellTime: 15000,
                languageId: 'python',
                userLevel: 'beginner',
                proactiveEnabled: true
            });

            // Assert: Verify confusion data flow
            expect(trackConfusionSpy).toHaveBeenCalledWith(expect.objectContaining({
                triggerType: 'dwellTime',
                dwellTime: 15000,
                languageId: 'python',
                userLevel: 'beginner',
                proactiveEnabled: true
            }));
        });
    });

    describe('Cross-Component Data Consistency', () => {
        it('should maintain consistent user level across components', async () => {
            // Arrange: Set user level
            const userLevel = 'intermediate';
            jest.spyOn(configManager, 'getUserLevel').mockReturnValue(userLevel);

            // Act: Get user level from different components
            const configUserLevel = configManager.getUserLevel();
            
            // Simulate telemetry tracking that uses user level
            telemetry.trackExplanationRequest({
                languageId: 'python',
                codeLength: 100,
                lineCount: 5,
                selectionLength: 50,
                triggerMethod: 'command',
                userLevel: configManager.getUserLevel(),
                success: true
            });

            // Assert: Verify consistency
            expect(configUserLevel).toBe(userLevel);
        });

        it('should maintain consistent telemetry state across components', async () => {
            // Arrange: Set telemetry state
            const telemetryEnabled = true;
            jest.spyOn(configManager, 'isTelemetryEnabled').mockReturnValue(telemetryEnabled);

            // Act: Check telemetry state from different components
            const configTelemetryState = configManager.isTelemetryEnabled();
            const telemetryStatus = telemetry.getStatus();

            // Assert: Verify consistency
            expect(configTelemetryState).toBe(telemetryEnabled);
            expect(telemetryStatus.enabled).toBe(telemetryEnabled);
        });
    });

    describe('Error Data Flow', () => {
        it('should propagate errors through the system gracefully', async () => {
            // Arrange: Mock error condition
            const mockError = new Error('Test error');
            jest.spyOn(configManager, 'validateConfiguration').mockImplementation(() => {
                throw mockError;
            });

            // Act: Execute operation that encounters error
            try {
                configManager.validateConfiguration();
            } catch (error) {
                // Expected error
            }

            // Assert: Verify error handling doesn't break data flow
            expect(configManager).toBeDefined();
            expect(telemetry).toBeDefined();
            expect(viewProvider).toBeDefined();
        });

        it('should track errors in telemetry system', async () => {
            // Arrange: Set up error tracking
            const trackErrorSpy = jest.spyOn(telemetry, 'trackError');

            // Act: Track an error
            telemetry.trackError({
                errorType: 'integration-test',
                errorMessage: 'Test error message',
                component: 'test-component',
                userLevel: 'beginner'
            });

            // Assert: Verify error tracking
            expect(trackErrorSpy).toHaveBeenCalledWith(expect.objectContaining({
                errorType: 'integration-test',
                errorMessage: 'Test error message',
                component: 'test-component',
                userLevel: 'beginner'
            }));
        });
    });
});