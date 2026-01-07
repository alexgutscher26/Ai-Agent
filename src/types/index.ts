/**
 * Core type definitions for the FlowPilot extension
 */

import * as vscode from 'vscode';

// Configuration interfaces
export interface CodeCoachConfig {
    enabled?: boolean;
    apiBaseUrl: string;
    apiKey: string;
    telemetryEnabled: boolean;
    userLevel: 'beginner' | 'intermediate';
    proactiveSuggestions: boolean;
    demoMode: boolean; // New: Enable demo mode for testing without API key
    strictValidation?: boolean;
    dashboardUrl?: string;
}

// API Request interfaces
export interface ExplainRequest {
    code: string;
    languageId: string;
    filePath?: string;
    fileName?: string;
    relativePath?: string;
    surroundingContext?: string;
    userLevel?: string;
    promptVersion?: string;
    promptId?: string;
    explanationDepth?: 'short' | 'normal' | 'detailed';
}

export interface ReviewRequest {
    code: string;
    languageId: string;
    filePath?: string;
    reviewType: 'quality' | 'style' | 'performance';
    userLevel?: string;
    promptVersion?: string;
    promptId?: string;
    focusPerformance?: boolean;
    focusReadability?: boolean;
    focusStyle?: boolean;
    contextSignature?: string;
    contextType?: 'function' | 'classMethod' | 'loop' | 'module';
    originalSnippet?: string;
}

export interface ErrorRequest {
    code: string;
    errorMessage: string;
    errorRange: vscode.Range;
    diagnosticCode?: string;
    languageId: string;
    userLevel?: string;
    promptVersion?: string;
    promptId?: string;
    stackTrace?: string[];
}

// API Response interfaces
export interface LineExplanation {
    lineOffset: number;
    code: string;
    explanation: string;
}

export interface Improvement {
    description: string;
    improvedCode?: string;
    reasoning: string;
}

export interface ExplanationResponse {
    type: 'explain';
    summary: string;
    lineByLine: LineExplanation[];
    pitfalls?: string[];
    tryItYourself?: string;
    relatedConcepts?: string[];
}

export interface ReviewResponse {
    type: 'review';
    summary: string;
    goodPoints: string[];
    improvementPoints: string[];
    improvements: Improvement[];
    tryItYourself?: string;
}

export interface ErrorResponse {
    type: 'error';
    errorMeaning: string;
    whyHere: string;
    howToFix: string;
    relatedConcepts?: string[];
    tryItYourself?: string;
}

// Telemetry interfaces
export interface TelemetryEvent {
    type: 'explainSelection' | 'reviewSelection' | 'explainError' | 'feedback';
    metadata: Record<string, any>;
    timestamp: number;
}

export interface FeedbackEvent {
    explanationId: string;
    helpful: boolean;
    comment?: string;
    timestamp: number;
}

// UI State interfaces
export interface PanelState {
    currentExplanation?: ExplanationResponse | ReviewResponse | ErrorResponse;
    history: (ExplanationResponse | ReviewResponse | ErrorResponse)[];
    userFeedback: FeedbackEvent[];
}

// Confusion Detection interfaces
export interface ConfusionMetrics {
    dwellTime: number;
    errorRepeatCount: number;
    editCycleCount: number;
    lastNotificationTime: number;
}
