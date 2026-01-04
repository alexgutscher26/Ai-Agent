/**
 * Property-based tests for feedback mechanism presence
 * Tests Property 12 from the design document
 */

import * as fc from 'fast-check';
import * as vscode from 'vscode';
import { CodeCoachPanel } from '../../panel/CodeCoachPanel';
import {
    ExplanationResponse,
    ErrorResponse,
    ReviewResponse,
    FeedbackEvent
} from '../../types';

// Mock VS Code API
const mockExtensionUri = vscode.Uri.file('/test/extension');

// Mock webview panel for testing
class MockWebviewPanel implements vscode.WebviewPanel {
    readonly viewType = 'codeCoachPanel';
    readonly title = 'FlowPilot';
    readonly webview: vscode.Webview;
    readonly options = {};
    readonly viewColumn = vscode.ViewColumn.One;
    active = true;
    visible = true;
    
    private _onDidDispose = new vscode.EventEmitter<void>();
    readonly onDidDispose = this._onDidDispose.event;
    
    private _onDidChangeViewState = new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>();
    readonly onDidChangeViewState = this._onDidChangeViewState.event;

    constructor() {
        this.webview = new MockWebview();
    }

    reveal(viewColumn?: vscode.ViewColumn, preserveFocus?: boolean): void {
        // Mock implementation
    }

    dispose(): void {
        this._onDidDispose.fire();
    }
}

class MockWebview implements vscode.Webview {
    options = {};
    html = '';
    cspSource = 'vscode-webview:';
    
    private _onDidReceiveMessage = new vscode.EventEmitter<any>();
    readonly onDidReceiveMessage = this._onDidReceiveMessage.event;

    postMessage(message: any): Thenable<boolean> {
        return Promise.resolve(true);
    }

    asWebviewUri(localResource: vscode.Uri): vscode.Uri {
        return localResource;
    }

    // Method to simulate receiving messages from webview
    simulateMessage(message: any): void {
        this._onDidReceiveMessage.fire(message);
    }
}

// Generators for test data
const explanationResponseArb = fc.record({
    type: fc.constant('explain' as const),
    summary: fc.string({ minLength: 20, maxLength: 500 }),
    lineByLine: fc.array(fc.record({
        lineOffset: fc.integer({ min: 0, max: 100 }),
        code: fc.string({ minLength: 1, maxLength: 200 }),
        explanation: fc.string({ minLength: 10, maxLength: 500 })
    }), { minLength: 1, maxLength: 20 }),
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
    improvements: fc.array(fc.record({
        description: fc.string({ minLength: 10, maxLength: 200 }),
        improvedCode: fc.option(fc.string({ minLength: 1, maxLength: 300 }), { nil: undefined }),
        reasoning: fc.string({ minLength: 10, maxLength: 300 })
    }), { minLength: 1, maxLength: 10 }),
    tryItYourself: fc.option(fc.string({ minLength: 20, maxLength: 300 }), { nil: undefined })
});

const feedbackDataArb = fc.record({
    helpful: fc.boolean(),
    comment: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined })
});

describe('Feedback Mechanism Presence Properties', () => {
    let panel: CodeCoachPanel;
    let mockPanel: MockWebviewPanel;

    beforeEach(() => {
        // Mock vscode.window.createWebviewPanel
        mockPanel = new MockWebviewPanel();
        jest.spyOn(vscode.window, 'createWebviewPanel').mockReturnValue(mockPanel);
        
        // Create a fresh panel for each test
        panel = CodeCoachPanel.createOrShow(mockExtensionUri);
    });

    afterEach(() => {
        // Clean up panel after each test
        if (panel) {
            panel.dispose();
        }
        jest.restoreAllMocks();
    });

    // Feature: code-coach-vscode, Property 12: Feedback Mechanism Presence
    test('Property 12: Feedback Mechanism Presence - Explanations', () => {
        fc.assert(fc.property(explanationResponseArb, (explanation) => {
            // When showing an explanation
            panel.showExplanation(explanation);
            
            // Then the webview HTML should contain feedback controls
            const html = mockPanel.webview.html;
            
            // Verify feedback section is present
            expect(html).toContain('feedback-section');
            expect(html).toContain('Was this helpful?');
            
            // Verify feedback buttons are present
            expect(html).toContain('helpful-btn');
            expect(html).toContain('not-helpful-btn');
            expect(html).toContain('👍 Yes, helpful');
            expect(html).toContain('👎 Not helpful');
            
            // Verify feedback comment area is present
            expect(html).toContain('feedback-comment');
            expect(html).toContain('feedback-text');
            expect(html).toContain('submit-feedback-btn');
            expect(html).toContain('cancel-feedback-btn');
            
            return true;
        }), { numRuns: 100 });
    });

    test('Property 12: Feedback Mechanism Presence - Reviews', () => {
        fc.assert(fc.property(reviewResponseArb, (review) => {
            // When showing a review
            panel.showReview(review);
            
            // Then the webview HTML should contain feedback controls
            const html = mockPanel.webview.html;
            
            // Verify feedback section is present
            expect(html).toContain('feedback-section');
            expect(html).toContain('Was this helpful?');
            
            // Verify feedback buttons are present
            expect(html).toContain('helpful-btn');
            expect(html).toContain('not-helpful-btn');
            expect(html).toContain('👍 Yes, helpful');
            expect(html).toContain('👎 Not helpful');
            
            return true;
        }), { numRuns: 100 });
    });

    test('Property 12: Feedback Mechanism Presence - Error Analysis', () => {
        fc.assert(fc.property(errorResponseArb, (errorResponse) => {
            // When showing an error analysis
            panel.showError(errorResponse);
            
            // Then the webview HTML should contain feedback controls
            const html = mockPanel.webview.html;
            
            // Verify feedback section is present
            expect(html).toContain('feedback-section');
            expect(html).toContain('Was this helpful?');
            
            // Verify feedback buttons are present
            expect(html).toContain('helpful-btn');
            expect(html).toContain('not-helpful-btn');
            
            return true;
        }), { numRuns: 100 });
    });

    // Property: Feedback mechanism handles user interactions correctly
    test('Feedback mechanism processes user feedback correctly', () => {
        fc.assert(fc.property(
            fc.tuple(explanationResponseArb, feedbackDataArb),
            ([explanation, feedbackData]) => {
                // Given an explanation is displayed
                panel.showExplanation(explanation);
                
                // When user provides feedback
                (mockPanel.webview as MockWebview).simulateMessage({
                    type: 'feedback',
                    data: feedbackData
                });
                
                // Then the feedback should be recorded in panel state
                const state = panel.getState();
                
                // Verify feedback is recorded
                expect(state.userFeedback.length).toBeGreaterThan(0);
                
                const lastFeedback = state.userFeedback[state.userFeedback.length - 1];
                expect(lastFeedback).toBeDefined();
                expect(lastFeedback!.helpful).toBe(feedbackData.helpful);
                
                if (feedbackData.comment) {
                    expect(lastFeedback!.comment).toBe(feedbackData.comment);
                }
                
                // Verify feedback has required metadata
                expect(typeof lastFeedback!.explanationId).toBe('string');
                expect(lastFeedback!.explanationId.length).toBeGreaterThan(0);
                expect(typeof lastFeedback!.timestamp).toBe('number');
                expect(lastFeedback!.timestamp).toBeGreaterThan(0);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    // Property: Feedback mechanism is always accessible
    test('Feedback controls are always accessible when content is displayed', () => {
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
                
                // Then feedback controls should be present and accessible
                const html = mockPanel.webview.html;
                
                // Verify feedback section exists
                expect(html).toContain('id="feedback-section"');
                
                // Verify both feedback buttons exist
                expect(html).toContain('id="helpful-btn"');
                expect(html).toContain('id="not-helpful-btn"');
                
                // Verify buttons have proper data attributes
                expect(html).toContain('data-helpful="true"');
                expect(html).toContain('data-helpful="false"');
                
                // Verify comment functionality exists
                expect(html).toContain('id="feedback-comment"');
                expect(html).toContain('id="feedback-text"');
                
                return true;
            }
        ), { numRuns: 100 });
    });

    // Property: Multiple feedback submissions are handled correctly
    test('Multiple feedback submissions are handled correctly', () => {
        fc.assert(fc.property(
            fc.tuple(
                explanationResponseArb,
                fc.array(feedbackDataArb, { minLength: 1, maxLength: 5 })
            ),
            ([explanation, feedbackList]) => {
                // Given an explanation is displayed
                panel.showExplanation(explanation);
                
                // When multiple feedback submissions occur
                feedbackList.forEach(feedbackData => {
                    (mockPanel.webview as MockWebview).simulateMessage({
                        type: 'feedback',
                        data: feedbackData
                    });
                });
                
                // Then all feedback should be recorded
                const state = panel.getState();
                expect(state.userFeedback.length).toBe(feedbackList.length);
                
                // Verify each feedback entry
                state.userFeedback.forEach((feedback: FeedbackEvent, index: number) => {
                    const feedbackItem = feedbackList[index];
                    expect(feedbackItem).toBeDefined();
                    expect(feedback.helpful).toBe(feedbackItem!.helpful);
                    if (feedbackItem!.comment) {
                        expect(feedback.comment).toBe(feedbackItem!.comment);
                    }
                    expect(typeof feedback.explanationId).toBe('string');
                    expect(typeof feedback.timestamp).toBe('number');
                });
                
                return true;
            }
        ), { numRuns: 50 });
    });

    // Property: Feedback mechanism persists across content changes
    test('Feedback history persists when content changes', () => {
        fc.assert(fc.property(
            fc.tuple(explanationResponseArb, reviewResponseArb, feedbackDataArb),
            ([explanation, review, feedbackData]) => {
                // Given an explanation with feedback
                panel.showExplanation(explanation);
                (mockPanel.webview as MockWebview).simulateMessage({
                    type: 'feedback',
                    data: feedbackData
                });
                
                const stateAfterFirstFeedback = panel.getState();
                expect(stateAfterFirstFeedback.userFeedback.length).toBe(1);
                
                // When showing different content
                panel.showReview(review);
                
                // Then previous feedback should still be in history
                const stateAfterContentChange = panel.getState();
                expect(stateAfterContentChange.userFeedback.length).toBe(1);
                expect(stateAfterContentChange.userFeedback[0]).toEqual(stateAfterFirstFeedback.userFeedback[0]);
                
                return true;
            }
        ), { numRuns: 50 });
    });
});