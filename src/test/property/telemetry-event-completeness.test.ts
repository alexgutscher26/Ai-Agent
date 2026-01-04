/**
 * Property-based tests for telemetry event completeness
 * Feature: code-coach-vscode, Property 17: Telemetry Event Completeness
 * Validates: Requirements 7.3
 */

import * as fc from 'fast-check';
import * as vscode from 'vscode';
import { Telemetry } from '../../telemetry/Telemetry';
import { ConfigurationManager } from '../../config/ConfigurationManager';

// Mock VS Code API
jest.mock('vscode', () => ({
    version: '1.70.0',
    Disposable: {
        from: jest.fn(() => ({ dispose: jest.fn() }))
    }
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Telemetry Event Completeness Properties', () => {
    let telemetry: Telemetry;
    let mockContext: vscode.ExtensionContext;
    let mockConfigManager: ConfigurationManager;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Mock fetch to return successful response
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true })
        });

        // Mock extension context
        mockContext = {
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

        // Mock configuration manager
        mockConfigManager = {
            isTelemetryEnabled: jest.fn(() => true),
            getConfiguration: jest.fn(() => ({
                telemetryEnabled: true,
                apiBaseUrl: 'https://api.codecoach.dev',
                apiKey: 'test-key',
                demoMode: false
            })),
            getUserLevel: jest.fn(() => 'beginner')
        } as any;

        telemetry = new Telemetry(mockContext, mockConfigManager);
    });

    afterEach(() => {
        telemetry.dispose();
        jest.useRealTimers();
    });

    /**
     * Property 17: Telemetry Event Completeness
     * For any user action (explanation request, error analysis, review request, feedback), 
     * if telemetry is enabled, appropriate anonymous events should be tracked to improve the service.
     */
    describe('Property 17: Telemetry Event Completeness', () => {
        test('should track explanation requests with complete metadata', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript', 'typescript'),
                    codeLength: fc.integer({ min: 1, max: 10000 }),
                    lineCount: fc.integer({ min: 1, max: 500 }),
                    selectionLength: fc.integer({ min: 0, max: 1000 }),
                    triggerMethod: fc.constantFrom('command', 'contextMenu', 'codeAction'),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    responseTime: fc.integer({ min: 100, max: 30000 }),
                    apiResponseTime: fc.integer({ min: 50, max: 10000 }),
                    success: fc.boolean()
                }),
                (testData) => {
                    // Track explanation request
                    telemetry.trackExplanationRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: testData.lineCount,
                        selectionLength: testData.selectionLength,
                        triggerMethod: testData.triggerMethod as 'command' | 'contextMenu' | 'codeAction',
                        userLevel: testData.userLevel,
                        responseTime: testData.responseTime,
                        apiResponseTime: testData.apiResponseTime,
                        success: testData.success
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        expect(event.eventType).toBe('explainSelection');
                        expect(event.metadata).toBeDefined();
                        expect(event.sessionId).toBeDefined();
                        expect(event.extensionVersion).toBeDefined();
                        expect(event.vscodeVersion).toBeDefined();
                        expect(event.timestamp).toBeDefined();
                        
                        // Verify required metadata fields are present
                        const metadata = event.metadata;
                        expect(metadata.languageId).toBeDefined();
                        expect(metadata.featureUsed).toBe('explain');
                        expect(metadata.userLevel).toBeDefined();
                        expect(metadata.success).toBeDefined();
                        expect(metadata.triggerMethod).toBeDefined();
                    }
                }
            ), { numRuns: 100 });
        });

        test('should track review requests with complete metadata', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript', 'typescript'),
                    codeLength: fc.integer({ min: 1, max: 10000 }),
                    lineCount: fc.integer({ min: 1, max: 500 }),
                    selectionLength: fc.integer({ min: 0, max: 1000 }),
                    reviewType: fc.constantFrom('quality', 'style', 'performance'),
                    triggerMethod: fc.constantFrom('command', 'contextMenu'),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    responseTime: fc.integer({ min: 100, max: 30000 }),
                    success: fc.boolean()
                }),
                (testData) => {
                    // Track review request
                    telemetry.trackReviewRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: testData.lineCount,
                        selectionLength: testData.selectionLength,
                        reviewType: testData.reviewType,
                        triggerMethod: testData.triggerMethod as 'command' | 'contextMenu',
                        userLevel: testData.userLevel,
                        responseTime: testData.responseTime,
                        success: testData.success
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        expect(event.eventType).toBe('reviewSelection');
                        expect(event.metadata).toBeDefined();
                        
                        // Verify required metadata fields are present
                        const metadata = event.metadata;
                        expect(metadata.languageId).toBeDefined();
                        expect(metadata.featureUsed).toBe('review');
                        expect(metadata.userLevel).toBeDefined();
                        expect(metadata.success).toBeDefined();
                        expect(metadata.triggerMethod).toBeDefined();
                        expect(metadata.reviewType).toBeDefined();
                    }
                }
            ), { numRuns: 100 });
        });

        test('should track error explanations with complete metadata', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript', 'typescript'),
                    errorType: fc.constantFrom('SyntaxError', 'TypeError', 'NameError', 'ValueError'),
                    diagnosticSeverity: fc.constantFrom('error', 'warning', 'information'),
                    codeLength: fc.integer({ min: 1, max: 5000 }),
                    triggerMethod: fc.constantFrom('command', 'codeAction', 'proactive'),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    responseTime: fc.integer({ min: 100, max: 30000 }),
                    success: fc.boolean()
                }),
                (testData) => {
                    // Track error explanation
                    telemetry.trackErrorExplanation({
                        languageId: testData.languageId,
                        errorType: testData.errorType,
                        diagnosticSeverity: testData.diagnosticSeverity,
                        codeLength: testData.codeLength,
                        triggerMethod: testData.triggerMethod as 'command' | 'codeAction' | 'proactive',
                        userLevel: testData.userLevel,
                        responseTime: testData.responseTime,
                        success: testData.success
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        expect(event.eventType).toBe('explainError');
                        expect(event.metadata).toBeDefined();
                        
                        // Verify required metadata fields are present
                        const metadata = event.metadata;
                        expect(metadata.languageId).toBeDefined();
                        expect(metadata.featureUsed).toBe('errorExplanation');
                        expect(metadata.userLevel).toBeDefined();
                        expect(metadata.success).toBeDefined();
                        expect(metadata.triggerMethod).toBeDefined();
                        expect(metadata.errorType).toBeDefined();
                        expect(metadata.diagnosticSeverity).toBeDefined();
                    }
                }
            ), { numRuns: 100 });
        });

        test('should track feedback events with complete metadata', () => {
            fc.assert(fc.property(
                fc.record({
                    helpful: fc.boolean(),
                    featureUsed: fc.constantFrom('explain', 'review', 'errorExplanation'),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    responseTime: fc.integer({ min: 1000, max: 60000 })
                }),
                (testData) => {
                    // Track feedback
                    telemetry.trackFeedback({
                        helpful: testData.helpful,
                        featureUsed: testData.featureUsed as 'explain' | 'review' | 'errorExplanation',
                        userLevel: testData.userLevel,
                        responseTime: testData.responseTime
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        expect(event.eventType).toBe('feedback');
                        expect(event.metadata).toBeDefined();
                        
                        // Verify required metadata fields are present
                        const metadata = event.metadata;
                        expect(metadata.feedbackRating).toBe(testData.helpful);
                        expect(metadata.featureUsed).toBe(testData.featureUsed);
                        expect(metadata.userLevel).toBeDefined();
                    }
                }
            ), { numRuns: 100 });
        });

        test('should track confusion detection events with complete metadata', () => {
            fc.assert(fc.property(
                fc.record({
                    triggerType: fc.constantFrom('dwellTime', 'repeatedError', 'editCycle'),
                    dwellTime: fc.integer({ min: 15000, max: 120000 }),
                    errorRepeatCount: fc.integer({ min: 3, max: 10 }),
                    languageId: fc.constantFrom('python', 'javascript'),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    proactiveEnabled: fc.boolean()
                }),
                (testData) => {
                    // Track confusion detection
                    telemetry.trackConfusionDetection({
                        triggerType: testData.triggerType as 'dwellTime' | 'repeatedError' | 'editCycle',
                        dwellTime: testData.triggerType === 'dwellTime' ? testData.dwellTime : undefined,
                        errorRepeatCount: testData.triggerType === 'repeatedError' ? testData.errorRepeatCount : undefined,
                        languageId: testData.languageId,
                        userLevel: testData.userLevel,
                        proactiveEnabled: testData.proactiveEnabled
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        expect(event.eventType).toBe('confusion');
                        expect(event.metadata).toBeDefined();
                        
                        // Verify required metadata fields are present
                        const metadata = event.metadata;
                        expect(metadata.triggerType).toBe(testData.triggerType);
                        expect(metadata.languageId).toBeDefined();
                        expect(metadata.userLevel).toBeDefined();
                        expect(metadata.featureUsed).toBe('confusionDetection');
                        expect(metadata.proactiveEnabled).toBe(testData.proactiveEnabled);
                        
                        // Verify conditional fields
                        if (testData.triggerType === 'dwellTime') {
                            expect(metadata.dwellTime).toBeDefined();
                        }
                        if (testData.triggerType === 'repeatedError') {
                            expect(metadata.errorRepeatCount).toBeDefined();
                        }
                    }
                }
            ), { numRuns: 100 });
        });

        test('should track configuration changes with complete metadata', () => {
            fc.assert(fc.property(
                fc.record({
                    settingChanged: fc.constantFrom('telemetryEnabled', 'userLevel', 'proactiveSuggestions', 'apiKey'),
                    newValue: fc.constantFrom('enabled', 'disabled', 'beginner', 'intermediate', 'true', 'false'),
                    userLevel: fc.constantFrom('beginner', 'intermediate')
                }),
                (testData) => {
                    // Track configuration change
                    telemetry.trackConfigurationChange({
                        settingChanged: testData.settingChanged,
                        newValue: testData.newValue,
                        userLevel: testData.userLevel
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        expect(event.eventType).toBe('configuration');
                        expect(event.metadata).toBeDefined();
                        
                        // Verify required metadata fields are present
                        const metadata = event.metadata;
                        expect(metadata.settingChanged).toBe(testData.settingChanged);
                        expect(metadata.newValue).toBe(testData.newValue);
                        expect(metadata.userLevel).toBeDefined();
                        expect(metadata.featureUsed).toBe('configuration');
                    }
                }
            ), { numRuns: 100 });
        });

        test('should include session and extension metadata in all events', () => {
            fc.assert(fc.property(
                fc.record({
                    eventType: fc.constantFrom('explanation', 'review', 'error', 'feedback', 'confusion'),
                    languageId: fc.constantFrom('python', 'javascript'),
                    userLevel: fc.constantFrom('beginner', 'intermediate')
                }),
                (testData) => {
                    // Track different types of events
                    switch (testData.eventType) {
                        case 'explanation':
                            telemetry.trackExplanationRequest({
                                languageId: testData.languageId,
                                codeLength: 100,
                                lineCount: 10,
                                selectionLength: 50,
                                triggerMethod: 'command',
                                userLevel: testData.userLevel,
                                success: true
                            });
                            break;
                        case 'review':
                            telemetry.trackReviewRequest({
                                languageId: testData.languageId,
                                codeLength: 100,
                                lineCount: 10,
                                selectionLength: 50,
                                reviewType: 'quality',
                                triggerMethod: 'command',
                                userLevel: testData.userLevel,
                                success: true
                            });
                            break;
                        case 'error':
                            telemetry.trackErrorExplanation({
                                languageId: testData.languageId,
                                errorType: 'SyntaxError',
                                diagnosticSeverity: 'error',
                                codeLength: 100,
                                triggerMethod: 'command',
                                userLevel: testData.userLevel,
                                success: true
                            });
                            break;
                        case 'feedback':
                            telemetry.trackFeedback({
                                helpful: true,
                                featureUsed: 'explain',
                                userLevel: testData.userLevel
                            });
                            break;
                        case 'confusion':
                            telemetry.trackConfusionDetection({
                                triggerType: 'dwellTime',
                                dwellTime: 15000,
                                languageId: testData.languageId,
                                userLevel: testData.userLevel,
                                proactiveEnabled: true
                            });
                            break;
                    }

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify telemetry event was sent with complete metadata
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBeGreaterThan(0);
                        
                        const event = events[0];
                        
                        // Verify all events have required session and extension metadata
                        expect(event.sessionId).toBeDefined();
                        expect(typeof event.sessionId).toBe('string');
                        expect(event.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
                        
                        expect(event.extensionVersion).toBeDefined();
                        expect(typeof event.extensionVersion).toBe('string');
                        
                        expect(event.vscodeVersion).toBeDefined();
                        expect(event.vscodeVersion).toBe('1.70.0');
                        
                        expect(event.timestamp).toBeDefined();
                        expect(typeof event.timestamp).toBe('number');
                        expect(event.timestamp).toBeGreaterThan(0);
                        
                        // Verify batch metadata
                        expect(requestBody.batchId).toBeDefined();
                        expect(typeof requestBody.batchId).toBe('string');
                        expect(requestBody.batchId).toMatch(/^batch_\d+_[a-z0-9]+$/);
                        
                        expect(requestBody.timestamp).toBeDefined();
                        expect(typeof requestBody.timestamp).toBe('number');
                    }
                }
            ), { numRuns: 100 });
        });

        test('should batch multiple events correctly', () => {
            fc.assert(fc.property(
                fc.array(
                    fc.record({
                        languageId: fc.constantFrom('python', 'javascript'),
                        userLevel: fc.constantFrom('beginner', 'intermediate'),
                        success: fc.boolean()
                    }),
                    { minLength: 2, maxLength: 5 }
                ),
                (testEvents) => {
                    // Track multiple events
                    for (const eventData of testEvents) {
                        telemetry.trackExplanationRequest({
                            languageId: eventData.languageId,
                            codeLength: 100,
                            lineCount: 10,
                            selectionLength: 50,
                            triggerMethod: 'command',
                            userLevel: eventData.userLevel,
                            success: eventData.success
                        });
                    }

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify all events were batched and sent
                    expect(fetch).toHaveBeenCalled();
                    
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        expect(Array.isArray(events)).toBe(true);
                        expect(events.length).toBe(testEvents.length);
                        
                        // Verify each event has complete metadata
                        for (let i = 0; i < events.length; i++) {
                            const event = events[i];
                            const originalData = testEvents[i]!; // Use non-null assertion since we know the array length matches
                            
                            expect(event.eventType).toBe('explainSelection');
                            expect(event.metadata.languageId).toBe(originalData.languageId);
                            expect(event.metadata.userLevel).toBe(originalData.userLevel);
                            expect(event.metadata.success).toBe(originalData.success);
                            expect(event.sessionId).toBeDefined();
                            expect(event.timestamp).toBeDefined();
                        }
                    }
                }
            ), { numRuns: 50 });
        });
    });
});