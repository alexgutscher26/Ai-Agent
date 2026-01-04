/**
 * Simple integration tests for FlowPilot component wiring
 * Tests basic component integration without complex VS Code API mocking
 */

import { ConfigurationManager } from '../../config/ConfigurationManager';
import { Telemetry } from '../../telemetry/Telemetry';
import { CodeCoachViewProvider } from '../../panel/CodeCoachViewProvider';
import { ConfusionDetector } from '../../confusion/ConfusionDetector';
import { FileSafetyGuard } from '../../safety/FileSafetyGuard';
import { PerformanceMonitor } from '../../performance/PerformanceMonitor';

describe('FlowPilot Simple Integration Tests', () => {
    let mockContext: any;

    beforeEach(() => {
        // Create minimal mock context
        mockContext = {
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
            extensionUri: { scheme: 'file', path: '/mock/path' },
            extensionPath: '/mock/path',
            asAbsolutePath: jest.fn().mockImplementation((path: string) => `/mock/path/${path}`)
        };

        // Mock VS Code workspace configuration
        jest.spyOn(require('vscode').workspace, 'getConfiguration').mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'demoMode': return true;
                    case 'telemetryEnabled': return false;
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
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Initialization', () => {
        it('should initialize all components without errors', () => {
            // Act: Initialize all components
            const configManager = new ConfigurationManager(mockContext);
            const telemetry = new Telemetry(mockContext, configManager);
            const viewProvider = new CodeCoachViewProvider(mockContext.extensionUri);
            const confusionDetector = new ConfusionDetector(mockContext, configManager);
            const safetyGuard = FileSafetyGuard.getInstance();
            const performanceMonitor = PerformanceMonitor.getInstance();

            // Assert: All components should be initialized
            expect(configManager).toBeDefined();
            expect(telemetry).toBeDefined();
            expect(viewProvider).toBeDefined();
            expect(confusionDetector).toBeDefined();
            expect(safetyGuard).toBeDefined();
            expect(performanceMonitor).toBeDefined();

            // Cleanup
            telemetry.dispose();
            confusionDetector.dispose();
            safetyGuard.dispose();
            performanceMonitor.dispose();
        });

        it('should wire components together correctly', () => {
            // Arrange: Initialize components
            const configManager = new ConfigurationManager(mockContext);
            const telemetry = new Telemetry(mockContext, configManager);
            const viewProvider = new CodeCoachViewProvider(mockContext.extensionUri);
            const confusionDetector = new ConfusionDetector(mockContext, configManager);

            // Act: Wire components together
            viewProvider.setTelemetry(telemetry);
            viewProvider.setConfigurationManager(configManager);
            confusionDetector.setTelemetry(telemetry);

            // Assert: Components should be wired correctly
            expect(viewProvider).toBeDefined();
            expect(confusionDetector).toBeDefined();

            // Cleanup
            telemetry.dispose();
            confusionDetector.dispose();
        });
    });

    describe('Configuration Integration', () => {
        it('should share configuration across components', () => {
            // Arrange: Initialize components
            const configManager = new ConfigurationManager(mockContext);
            const telemetry = new Telemetry(mockContext, configManager);

            // Act: Get configuration from different components
            const userLevel = configManager.getUserLevel();
            const telemetryEnabled = configManager.isTelemetryEnabled();
            const demoMode = configManager.isDemoModeEnabled();

            // Assert: Configuration should be consistent
            expect(userLevel).toBe('beginner');
            expect(telemetryEnabled).toBe(false);
            expect(demoMode).toBe(true);

            // Cleanup
            telemetry.dispose();
        });

        it('should validate configuration properly', () => {
            // Arrange: Initialize configuration manager
            const configManager = new ConfigurationManager(mockContext);

            // Act: Validate configuration
            const validation = configManager.validateConfiguration();

            // Assert: Validation should work
            expect(validation).toHaveProperty('isValid');
            expect(validation).toHaveProperty('errors');
            expect(validation).toHaveProperty('warnings');
            expect(Array.isArray(validation.errors)).toBe(true);
            expect(Array.isArray(validation.warnings)).toBe(true);
        });
    });

    describe('Safety Integration', () => {
        it('should validate operations through safety guard', () => {
            // Arrange: Get safety guard instance
            const safetyGuard = FileSafetyGuard.getInstance();

            // Act & Assert: Test safe operations
            expect(() => safetyGuard.validateOperation('showExplanation', { type: 'explain' })).not.toThrow();
            expect(() => safetyGuard.validateOperation('showReview', { type: 'review' })).not.toThrow();
            expect(() => safetyGuard.validateOperation('showError', { type: 'error' })).not.toThrow();

            // Cleanup
            safetyGuard.dispose();
        });

        it('should prevent unsafe operations', () => {
            // Arrange: Get safety guard instance
            const safetyGuard = FileSafetyGuard.getInstance();

            // Act & Assert: Test unsafe operations are prevented
            expect(() => safetyGuard.validateOperation('writeFile', { path: '/system/file' })).toThrow();
            expect(() => safetyGuard.validateOperation('deleteFile', { path: '/important/file' })).toThrow();

            // Cleanup
            safetyGuard.dispose();
        });
    });

    describe('Performance Integration', () => {
        it('should track operations through performance monitor', () => {
            // Arrange: Get performance monitor instance
            const performanceMonitor = PerformanceMonitor.getInstance();

            // Act: Track an operation
            const operationId = performanceMonitor.startOperation('testOperation');
            const metrics = performanceMonitor.endOperation(operationId, true);

            // Assert: Performance tracking should work
            expect(metrics).toBeDefined();
            expect(metrics?.operationName).toBe('testOperation');
            expect(metrics?.success).toBe(true);
            expect(typeof metrics?.duration).toBe('number');

            // Cleanup
            performanceMonitor.dispose();
        });

        it('should provide performance statistics', () => {
            // Arrange: Get performance monitor instance
            const performanceMonitor = PerformanceMonitor.getInstance();

            // Act: Get performance stats
            const stats = performanceMonitor.getStats();

            // Assert: Stats should have correct structure
            expect(stats).toHaveProperty('totalOperations');
            expect(stats).toHaveProperty('averageDuration');
            expect(stats).toHaveProperty('successRate');
            expect(stats).toHaveProperty('activeOperations');
            expect(typeof stats.totalOperations).toBe('number');
            expect(typeof stats.averageDuration).toBe('number');
            expect(typeof stats.successRate).toBe('number');
            expect(typeof stats.activeOperations).toBe('number');

            // Cleanup
            performanceMonitor.dispose();
        });
    });

    describe('Telemetry Integration', () => {
        it('should handle telemetry events properly', () => {
            // Arrange: Initialize telemetry
            const configManager = new ConfigurationManager(mockContext);
            const telemetry = new Telemetry(mockContext, configManager);

            // Act: Track various events
            telemetry.trackExplanationRequest({
                languageId: 'python',
                codeLength: 100,
                lineCount: 5,
                selectionLength: 50,
                triggerMethod: 'command',
                userLevel: 'beginner',
                success: true
            });

            telemetry.trackFeedback({
                helpful: true,
                featureUsed: 'explain',
                userLevel: 'beginner'
            });

            // Assert: Telemetry should handle events without errors
            const status = telemetry.getStatus();
            expect(status).toHaveProperty('enabled');
            expect(status).toHaveProperty('sessionId');
            expect(status).toHaveProperty('queueLength');
            expect(status).toHaveProperty('extensionVersion');

            // Cleanup
            telemetry.dispose();
        });
    });

    describe('View Provider Integration', () => {
        it('should handle different response types', () => {
            // Arrange: Initialize view provider
            const viewProvider = new CodeCoachViewProvider(mockContext.extensionUri);

            // Act: Show different types of responses
            const mockExplanation = {
                type: 'explain' as const,
                summary: 'Test explanation',
                lineByLine: []
            };

            const mockReview = {
                type: 'review' as const,
                summary: 'Test review',
                goodPoints: ['Good structure'],
                improvements: [],
                improvementPoints: ['Could be improved']
            };

            const mockError = {
                type: 'error' as const,
                errorMeaning: 'Test error meaning',
                whyHere: 'Test context',
                howToFix: 'Test fix'
            };

            viewProvider.showExplanation(mockExplanation);
            viewProvider.showReview(mockReview);
            viewProvider.showError(mockError);

            // Assert: View provider should handle all response types
            const state = viewProvider.getState();
            expect(state.history).toHaveLength(3);
            expect(state.currentExplanation).toEqual(mockError); // Last one shown
        });
    });

    describe('Component Lifecycle', () => {
        it('should dispose all components cleanly', () => {
            // Arrange: Initialize all components
            const configManager = new ConfigurationManager(mockContext);
            const telemetry = new Telemetry(mockContext, configManager);
            const confusionDetector = new ConfusionDetector(mockContext, configManager);
            const safetyGuard = FileSafetyGuard.getInstance();
            const performanceMonitor = PerformanceMonitor.getInstance();

            // Act: Dispose all components
            expect(() => {
                telemetry.dispose();
                confusionDetector.dispose();
                safetyGuard.dispose();
                performanceMonitor.dispose();
            }).not.toThrow();

            // Assert: Components should dispose cleanly (no errors thrown)
        });
    });
});