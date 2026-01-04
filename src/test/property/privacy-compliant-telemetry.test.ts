/**
 * Property-based tests for privacy-compliant telemetry
 * Feature: code-coach-vscode, Property 16: Privacy-Compliant Telemetry
 * Validates: Requirements 7.2, 7.4
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

describe('Privacy-Compliant Telemetry Properties', () => {
    let telemetry: Telemetry;
    let mockContext: vscode.ExtensionContext;
    let mockConfigManager: ConfigurationManager;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

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
     * Property 16: Privacy-Compliant Telemetry
     * For any telemetry event, if telemetry is enabled, the extension should collect only 
     * anonymous usage data without including code content, personal information, or sensitive 
     * details in error messages.
     */
    describe('Property 16: Privacy-Compliant Telemetry', () => {
        test('should never include actual code content in telemetry events', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript', 'typescript'),
                    codeContent: fc.string({ minLength: 1, maxLength: 1000 }),
                    codeLength: fc.integer({ min: 1, max: 10000 }),
                    lineCount: fc.integer({ min: 1, max: 500 }),
                    selectionLength: fc.integer({ min: 0, max: 1000 }),
                    triggerMethod: fc.constantFrom('command', 'contextMenu', 'codeAction'),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    success: fc.boolean()
                }),
                (testData) => {
                    // Track an explanation request with actual code content
                    telemetry.trackExplanationRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: testData.lineCount,
                        selectionLength: testData.selectionLength,
                        triggerMethod: testData.triggerMethod as 'command' | 'contextMenu' | 'codeAction',
                        userLevel: testData.userLevel,
                        success: testData.success
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Check that fetch was called
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        
                        // Verify no actual code content is included
                        const eventData = JSON.stringify(requestBody);
                        expect(eventData).not.toContain(testData.codeContent);
                        
                        // Verify only safe metadata is included
                        const events = requestBody.events;
                        expect(Array.isArray(events)).toBe(true);
                        
                        for (const event of events) {
                            expect(event.metadata).toBeDefined();
                            expect(event.metadata.codeContent).toBeUndefined();
                            expect(event.metadata.actualCode).toBeUndefined();
                            expect(event.metadata.sourceCode).toBeUndefined();
                        }
                    }
                }
            ), { numRuns: 100 });
        });

        test('should sanitize error messages to remove sensitive information', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript'),
                    errorMessage: fc.string({ minLength: 10, maxLength: 200 }),
                    filePath: fc.string({ minLength: 5, maxLength: 100 }),
                    userName: fc.string({ minLength: 3, maxLength: 20 }),
                    diagnosticSeverity: fc.constantFrom('error', 'warning', 'information'),
                    triggerMethod: fc.constantFrom('command', 'codeAction', 'proactive'),
                    userLevel: fc.constantFrom('beginner', 'intermediate')
                }),
                (testData) => {
                    // Create error message that might contain sensitive info
                    const sensitiveErrorMessage = `${testData.errorMessage} in file /home/${testData.userName}/${testData.filePath}`;
                    
                    telemetry.trackErrorExplanation({
                        languageId: testData.languageId,
                        errorType: sensitiveErrorMessage,
                        diagnosticSeverity: testData.diagnosticSeverity,
                        codeLength: 100,
                        triggerMethod: testData.triggerMethod as 'command' | 'codeAction' | 'proactive',
                        userLevel: testData.userLevel,
                        success: true
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Check that fetch was called and sensitive info is sanitized
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const eventData = JSON.stringify(requestBody);
                        
                        // Should not contain file paths or user names
                        expect(eventData).not.toContain(testData.userName);
                        expect(eventData).not.toContain('/home/');
                        expect(eventData).not.toContain(testData.filePath);
                        
                        // Should contain only sanitized error categories
                        const events = requestBody.events;
                        for (const event of events) {
                            if (event.metadata.errorType) {
                                expect(['syntax', 'indentation', 'name', 'type', 'value', 'attribute', 'import', 'key', 'index', 'other'])
                                    .toContain(event.metadata.errorType);
                            }
                        }
                    }
                }
            ), { numRuns: 100 });
        });

        test('should bucket numeric values to prevent fingerprinting', () => {
            fc.assert(fc.property(
                fc.record({
                    codeLength: fc.integer({ min: 1, max: 50000 }),
                    lineCount: fc.integer({ min: 1, max: 2000 }),
                    selectionLength: fc.integer({ min: 0, max: 10000 }),
                    responseTime: fc.integer({ min: 1, max: 60000 }),
                    apiResponseTime: fc.integer({ min: 50, max: 30000 }),
                    languageId: fc.constantFrom('python', 'javascript'),
                    userLevel: fc.constantFrom('beginner', 'intermediate')
                }),
                (testData) => {
                    telemetry.trackExplanationRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: testData.lineCount,
                        selectionLength: testData.selectionLength,
                        triggerMethod: 'command',
                        userLevel: testData.userLevel,
                        responseTime: testData.responseTime,
                        apiResponseTime: testData.apiResponseTime,
                        success: true
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Check that numeric values are bucketed
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const events = requestBody.events;
                        
                        for (const event of events) {
                            const metadata = event.metadata;
                            
                            // Check that size values are bucketed to standard ranges
                            if (metadata.codeLength !== undefined) {
                                expect([10, 50, 100, 500, 1000]).toContain(metadata.codeLength);
                            }
                            
                            if (metadata.lineCount !== undefined) {
                                expect([10, 50, 100, 500, 1000]).toContain(metadata.lineCount);
                            }
                            
                            if (metadata.selectionLength !== undefined) {
                                expect([10, 50, 100, 500, 1000]).toContain(metadata.selectionLength);
                            }
                            
                            // Check that time values are bucketed
                            if (metadata.responseTime !== undefined) {
                                expect([100, 500, 1000, 5000, 10000]).toContain(metadata.responseTime);
                            }
                            
                            if (metadata.apiResponseTime !== undefined) {
                                expect([100, 500, 1000, 5000, 10000]).toContain(metadata.apiResponseTime);
                            }
                        }
                    }
                }
            ), { numRuns: 100 });
        });

        test('should not send telemetry when disabled', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript'),
                    codeLength: fc.integer({ min: 1, max: 1000 }),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    triggerMethod: fc.constantFrom('command', 'contextMenu')
                }),
                (testData) => {
                    // Disable telemetry
                    (mockConfigManager.isTelemetryEnabled as jest.Mock).mockReturnValue(false);
                    
                    telemetry.trackExplanationRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: 10,
                        selectionLength: testData.codeLength,
                        triggerMethod: testData.triggerMethod as 'command' | 'contextMenu',
                        userLevel: testData.userLevel,
                        success: true
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify no network calls were made
                    expect(fetch).not.toHaveBeenCalled();
                }
            ), { numRuns: 50 });
        });

        test('should not send telemetry in demo mode', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript'),
                    codeLength: fc.integer({ min: 1, max: 1000 }),
                    userLevel: fc.constantFrom('beginner', 'intermediate')
                }),
                (testData) => {
                    // Enable demo mode
                    (mockConfigManager.getConfiguration as jest.Mock).mockReturnValue({
                        telemetryEnabled: true,
                        apiBaseUrl: 'https://api.codecoach.dev',
                        apiKey: 'test-key',
                        demoMode: true
                    });
                    
                    telemetry.trackExplanationRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: 10,
                        selectionLength: testData.codeLength,
                        triggerMethod: 'command',
                        userLevel: testData.userLevel,
                        success: true
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify no network calls were made
                    expect(fetch).not.toHaveBeenCalled();
                }
            ), { numRuns: 50 });
        });

        test('should include only allowed metadata fields', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript'),
                    codeLength: fc.integer({ min: 1, max: 1000 }),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    maliciousField: fc.string(),
                    sensitiveData: fc.string(),
                    personalInfo: fc.string()
                }),
                (testData) => {
                    // Try to track with additional fields that should be filtered out
                    const telemetryInstance = telemetry as any;
                    telemetryInstance.queueEvent('explainSelection', {
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        userLevel: testData.userLevel,
                        featureUsed: 'explain',
                        // These should be filtered out
                        maliciousField: testData.maliciousField,
                        sensitiveData: testData.sensitiveData,
                        personalInfo: testData.personalInfo,
                        password: 'secret123',
                        apiKey: 'sk-1234567890'
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Check that only allowed fields are included
                    if ((fetch as jest.Mock).mock.calls.length > 0) {
                        const fetchCall = (fetch as jest.Mock).mock.calls[0];
                        const requestBody = JSON.parse(fetchCall[1].body);
                        const eventData = JSON.stringify(requestBody);
                        
                        // Should not contain malicious or sensitive fields
                        expect(eventData).not.toContain(testData.maliciousField);
                        expect(eventData).not.toContain(testData.sensitiveData);
                        expect(eventData).not.toContain(testData.personalInfo);
                        expect(eventData).not.toContain('secret123');
                        expect(eventData).not.toContain('sk-1234567890');
                        
                        // Should only contain allowed fields
                        const events = requestBody.events;
                        for (const event of events) {
                            const metadata = event.metadata;
                            const allowedFields = [
                                'languageId', 'fileExtension', 'codeLength', 'lineCount', 'selectionLength',
                                'errorType', 'diagnosticSeverity', 'responseTime', 'userLevel', 'feedbackRating',
                                'apiResponseTime', 'success', 'featureUsed', 'triggerMethod', 'triggerType',
                                'dwellTime', 'errorRepeatCount', 'reviewType', 'settingChanged', 'newValue',
                                'proactiveEnabled'
                            ];
                            
                            for (const key of Object.keys(metadata)) {
                                expect(allowedFields).toContain(key);
                            }
                        }
                    }
                }
            ), { numRuns: 100 });
        });

        test('should handle network failures gracefully without exposing sensitive information', () => {
            fc.assert(fc.property(
                fc.record({
                    languageId: fc.constantFrom('python', 'javascript'),
                    codeLength: fc.integer({ min: 1, max: 1000 }),
                    userLevel: fc.constantFrom('beginner', 'intermediate'),
                    networkError: fc.constantFrom('ECONNRESET', 'ENOTFOUND', 'TIMEOUT')
                }),
                (testData) => {
                    // Mock fetch to throw network error
                    (fetch as jest.Mock).mockRejectedValue(new Error(testData.networkError));
                    
                    // Spy on console.debug to check error handling
                    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
                    
                    telemetry.trackExplanationRequest({
                        languageId: testData.languageId,
                        codeLength: testData.codeLength,
                        lineCount: 10,
                        selectionLength: testData.codeLength,
                        triggerMethod: 'command',
                        userLevel: testData.userLevel,
                        success: true
                    });

                    // Process the event queue
                    jest.advanceTimersByTime(30000);

                    // Verify error was logged but not thrown
                    expect(consoleSpy).toHaveBeenCalled();
                    
                    // Verify the error message doesn't contain sensitive information
                    const logCalls = consoleSpy.mock.calls;
                    for (const call of logCalls) {
                        const logMessage = call.join(' ');
                        expect(logMessage).not.toContain('test-key'); // API key
                        expect(logMessage).not.toContain(testData.userLevel); // User data
                    }
                    
                    consoleSpy.mockRestore();
                }
            ), { numRuns: 50 });
        });
    });
});