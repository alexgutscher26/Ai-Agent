/**
 * Property-based tests for UI content completeness
 * Tests Properties 1, 4, and 7 from the design document
 */

import * as fc from 'fast-check';
import * as vscode from 'vscode';
import { CodeCoachPanel } from '../../panel/CodeCoachPanel';
import {
    ExplanationResponse,
    ErrorResponse,
    ReviewResponse,
    LineExplanation,
    Improvement
} from '../../types';

// Mock VS Code API
jest.mock('vscode', () => ({
    Uri: {
        file: jest.fn((path: string) => ({ fsPath: path, path })),
        joinPath: jest.fn((base: any, ...paths: string[]) => ({ 
            fsPath: `${base.fsPath}/${paths.join('/')}`, 
            path: `${base.path}/${paths.join('/')}` 
        }))
    },
    ViewColumn: {
        One: 1,
        Beside: 2
    },
    window: {
        createWebviewPanel: jest.fn(),
        showInformationMessage: jest.fn()
    },
    EventEmitter: jest.fn(() => ({
        event: jest.fn(),
        fire: jest.fn()
    })),
    Disposable: {
        from: jest.fn()
    }
}));

// Mock webview panel
const mockWebview = {
    html: '',
    options: {},
    cspSource: 'vscode-webview:',
    onDidReceiveMessage: jest.fn(),
    postMessage: jest.fn(),
    asWebviewUri: jest.fn((uri: any) => uri)
};

const mockWebviewPanel = {
    viewType: 'codeCoachPanel',
    title: 'FlowPilot',
    webview: mockWebview,
    options: {},
    viewColumn: 1,
    active: true,
    visible: true,
    onDidDispose: jest.fn(),
    onDidChangeViewState: jest.fn(),
    reveal: jest.fn(),
    dispose: jest.fn()
};

// Setup mock before tests
beforeAll(() => {
    (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockWebviewPanel);
});

const mockExtensionUri = vscode.Uri.file('/test/extension');

// Generators for test data
const lineExplanationArb = fc.record({
    lineOffset: fc.integer({ min: 0, max: 100 }),
    code: fc.string({ minLength: 1, maxLength: 200 }),
    explanation: fc.string({ minLength: 10, maxLength: 500 })
});

const improvementArb = fc.record({
    description: fc.string({ minLength: 10, maxLength: 200 }),
    improvedCode: fc.option(fc.string({ minLength: 1, maxLength: 300 }), { nil: undefined }),
    reasoning: fc.string({ minLength: 10, maxLength: 300 })
});

const explanationResponseArb = fc.record({
    type: fc.constant('explain' as const),
    summary: fc.string({ minLength: 20, maxLength: 500 }),
    lineByLine: fc.array(lineExplanationArb, { minLength: 1, maxLength: 20 }),
    pitfalls: fc.option(fc.array(fc.string({ minLength: 10, maxLength: 200 }), { maxLength: 10 }), { nil: undefined }),
    tryItYourself: fc.option(fc.string({ minLength: 20, maxLength: 300 }), { nil: undefined }),
    relatedConcepts: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 10 }), { nil: undefined })
});

const errorResponseArb = fc.record({
    type: fc.constant('error' as const),
    errorMeaning: fc.string({ minLength: 20, maxLength: 300 }),
    whyHere: fc.string({ minLength: 20, maxLength: 300 }),
    howToFix: fc.string({ minLength: 20, maxLength: 300 }),
    relatedConcepts: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { maxLength: 10 }), { nil: undefined }),
    tryItYourself: fc.option(fc.string({ minLength: 20, maxLength: 300 }), { nil: undefined })
});

const reviewResponseArb = fc.record({
    type: fc.constant('review' as const),
    summary: fc.string({ minLength: 20, maxLength: 500 }),
    goodPoints: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 10 }),
    improvementPoints: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { maxLength: 10 }),
    improvements: fc.array(improvementArb, { minLength: 1, maxLength: 10 }),
    tryItYourself: fc.option(fc.string({ minLength: 20, maxLength: 300 }), { nil: undefined })
});

describe('UI Content Completeness Properties', () => {
    let panel: CodeCoachPanel;

    beforeEach(() => {
        // Create a fresh panel for each test
        panel = CodeCoachPanel.createOrShow(mockExtensionUri);
    });

    afterEach(() => {
        // Clean up panel after each test
        if (panel) {
            panel.dispose();
        }
    });

    // Feature: code-coach-vscode, Property 1: Code Explanation Workflow Completeness
    test('Property 1: Code Explanation Workflow Completeness', () => {
        fc.assert(fc.property(explanationResponseArb, (explanation) => {
            // When showing an explanation
            panel.showExplanation(explanation);
            
            // Then the panel state should contain all required sections
            const state = panel.getState();
            
            // Verify the explanation is stored
            expect(state.currentExplanation).toBeDefined();
            expect(state.currentExplanation?.type).toBe('explain');
            
            // Type guard to ensure we have an explanation response
            const currentExplanation = state.currentExplanation as ExplanationResponse;
            expect(currentExplanation.summary).toBe(explanation.summary);
            
            // Verify line-by-line explanations are present
            expect(currentExplanation.lineByLine).toBeDefined();
            expect(Array.isArray(currentExplanation.lineByLine)).toBe(true);
            expect(currentExplanation.lineByLine.length).toBeGreaterThan(0);
            
            // Verify each line explanation has required fields
            currentExplanation.lineByLine.forEach((line: LineExplanation) => {
                expect(typeof line.lineOffset).toBe('number');
                expect(typeof line.code).toBe('string');
                expect(line.code.length).toBeGreaterThan(0);
                expect(typeof line.explanation).toBe('string');
                expect(line.explanation.length).toBeGreaterThan(0);
            });
            
            // Verify explanation is added to history
            expect(state.history).toContain(explanation);
            
            return true;
        }), { numRuns: 100 });
    });

    // Feature: code-coach-vscode, Property 4: Error Explanation Workflow
    test('Property 4: Error Explanation Workflow', () => {
        fc.assert(fc.property(errorResponseArb, (errorResponse) => {
            // When showing an error explanation
            panel.showError(errorResponse);
            
            // Then the panel state should contain complete error analysis
            const state = panel.getState();
            
            // Verify the error explanation is stored
            expect(state.currentExplanation).toBeDefined();
            expect(state.currentExplanation?.type).toBe('error');
            
            // Type guard to ensure we have an error response
            const currentError = state.currentExplanation as ErrorResponse;
            
            // Verify all required error analysis sections are present
            expect(currentError.errorMeaning).toBeDefined();
            expect(typeof currentError.errorMeaning).toBe('string');
            expect(currentError.errorMeaning.length).toBeGreaterThan(0);
            
            expect(currentError.whyHere).toBeDefined();
            expect(typeof currentError.whyHere).toBe('string');
            expect(currentError.whyHere.length).toBeGreaterThan(0);
            
            expect(currentError.howToFix).toBeDefined();
            expect(typeof currentError.howToFix).toBe('string');
            expect(currentError.howToFix.length).toBeGreaterThan(0);
            
            // Verify error explanation is added to history
            expect(state.history).toContain(errorResponse);
            
            return true;
        }), { numRuns: 100 });
    });

    // Feature: code-coach-vscode, Property 7: Code Review Completeness
    test('Property 7: Code Review Completeness', () => {
        fc.assert(fc.property(reviewResponseArb, (review) => {
            // When showing a code review
            panel.showReview(review);
            
            // Then the panel state should contain complete review information
            const state = panel.getState();
            
            // Verify the review is stored
            expect(state.currentExplanation).toBeDefined();
            expect(state.currentExplanation?.type).toBe('review');
            
            // Type guard to ensure we have a review response
            const currentReview = state.currentExplanation as ReviewResponse;
            expect(currentReview.summary).toBe(review.summary);
            
            // Verify good points are present
            expect(currentReview.goodPoints).toBeDefined();
            expect(Array.isArray(currentReview.goodPoints)).toBe(true);
            expect(currentReview.goodPoints.length).toBeGreaterThan(0);
            
            // Verify improvements are present and well-formed
            expect(currentReview.improvements).toBeDefined();
            expect(Array.isArray(currentReview.improvements)).toBe(true);
            expect(currentReview.improvements.length).toBeGreaterThan(0);
            
            // Verify each improvement has required fields
            currentReview.improvements.forEach((improvement: Improvement) => {
                expect(typeof improvement.description).toBe('string');
                expect(improvement.description.length).toBeGreaterThan(0);
                expect(typeof improvement.reasoning).toBe('string');
                expect(improvement.reasoning.length).toBeGreaterThan(0);
                
                // improvedCode is optional but if present should be a string
                if (improvement.improvedCode !== undefined) {
                    expect(typeof improvement.improvedCode).toBe('string');
                }
            });
            
            // Verify review is added to history
            expect(state.history).toContain(review);
            
            return true;
        }), { numRuns: 100 });
    });

    // Additional property: UI state consistency
    test('UI state remains consistent across different content types', () => {
        fc.assert(fc.property(
            fc.oneof(explanationResponseArb, errorResponseArb, reviewResponseArb),
            (content) => {
                // When showing any type of content
                switch (content.type) {
                    case 'explain':
                        panel.showExplanation(content);
                        break;
                    case 'error':
                        panel.showError(content);
                        break;
                    case 'review':
                        panel.showReview(content);
                        break;
                }
                
                // Then the panel state should be consistent
                const state = panel.getState();
                
                // Current explanation should match the content
                expect(state.currentExplanation).toEqual(content);
                
                // History should contain the content
                expect(state.history).toContain(content);
                
                // User feedback should be initialized as empty array
                expect(Array.isArray(state.userFeedback)).toBe(true);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    // Property: Panel disposal cleans up resources
    test('Panel disposal properly cleans up resources', () => {
        fc.assert(fc.property(explanationResponseArb, (explanation) => {
            // Given a panel with content
            panel.showExplanation(explanation);
            expect(panel.getState().currentExplanation).toBeDefined();
            
            // When disposing the panel
            panel.dispose();
            
            // Then the static reference should be cleared
            expect(CodeCoachPanel.currentPanel).toBeUndefined();
            
            return true;
        }), { numRuns: 50 });
    });

    // Property: Clear functionality resets state
    test('Clear functionality properly resets panel state', () => {
        fc.assert(fc.property(explanationResponseArb, (explanation) => {
            // Given a panel with content
            panel.showExplanation(explanation);
            expect(panel.getState().currentExplanation).toBeDefined();
            expect(panel.getState().history.length).toBeGreaterThan(0);
            
            // When clearing the panel
            panel.clear();
            
            // Then the state should be reset
            const state = panel.getState();
            expect(state.currentExplanation).toBeUndefined();
            expect(state.history).toEqual([]);
            expect(state.userFeedback).toEqual([]);
            
            return true;
        }), { numRuns: 50 });
    });
});