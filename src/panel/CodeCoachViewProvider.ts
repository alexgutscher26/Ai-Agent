/**
 * CodeCoachViewProvider manages the webview view in the sidebar
 * Safety: 2.4, 3.5 - Only displays information, never modifies files
 */

import * as vscode from 'vscode';
import * as path from 'path';
import {
    ExplanationResponse,
    ReviewResponse,
    ErrorResponse,
    FeedbackEvent,
    PanelState
} from '../types';
import { Telemetry } from '../telemetry/Telemetry';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { FileSafetyGuard } from '../safety/FileSafetyGuard';

export interface WebviewMessage {
    type: 'feedback' | 'ready' | 'error';
    data?: any;
}

export class CodeCoachViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeCoachPanel';
    
    private _view?: vscode.WebviewView;
    private _state: PanelState;
    private _telemetry?: Telemetry;
    private _configManager?: ConfigurationManager;
    private _safetyGuard: FileSafetyGuard;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._state = {
            history: [],
            userFeedback: []
        };
        this._safetyGuard = FileSafetyGuard.getInstance();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media'),
                vscode.Uri.joinPath(this._extensionUri, 'out', 'media')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            (message: WebviewMessage) => {
                this._handleWebviewMessage(message);
            }
        );
    }

    /**
     * Set the telemetry instance for tracking feedback
     */
    public setTelemetry(telemetry: Telemetry): void {
        this._telemetry = telemetry;
    }

    /**
     * Set the configuration manager for getting user preferences
     */
    public setConfigurationManager(configManager: ConfigurationManager): void {
        this._configManager = configManager;
    }

    /**
     * Display an explanation in the webview
     * Safety: 2.4, 3.5 - Only displays information, no file modifications
     */
    public showExplanation(explanation: ExplanationResponse): void {
        // Validate this is a safe display operation
        this._safetyGuard.validateOperation('showExplanation', { type: explanation.type });
        
        this._state.currentExplanation = explanation;
        this._state.history.push(explanation);
        this._updateWebview();
        
        // Show the FlowPilot view if it's not visible
        if (this._view) {
            this._view.show?.(true);
        }
    }

    /**
     * Display a review in the webview
     * Safety: 2.4, 3.5 - Only displays information, no file modifications
     */
    public showReview(review: ReviewResponse): void {
        // Validate this is a safe display operation
        this._safetyGuard.validateOperation('showReview', { type: review.type });
        
        this._state.currentExplanation = review;
        this._state.history.push(review);
        this._updateWebview();
        
        // Show the FlowPilot view if it's not visible
        if (this._view) {
            this._view.show?.(true);
        }
    }

    /**
     * Display an error explanation in the webview
     * Safety: 2.4, 3.5 - Only displays information, no file modifications
     */
    public showError(error: ErrorResponse): void {
        // Validate this is a safe display operation
        this._safetyGuard.validateOperation('showError', { type: error.type });
        
        this._state.currentExplanation = error;
        this._state.history.push(error);
        this._updateWebview();
        
        // Show the FlowPilot view if it's not visible
        if (this._view) {
            this._view.show?.(true);
        }
    }

    /**
     * Get the current panel state
     */
    public getState(): PanelState {
        return { ...this._state };
    }

    /**
     * Clear the current explanation and history
     */
    public clear(): void {
        this._state.currentExplanation = undefined;
        this._state.history = [];
        this._updateWebview();
    }

    private _updateWebview(): void {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }

    private _handleWebviewMessage(message: WebviewMessage): void {
        switch (message.type) {
            case 'feedback':
                this._handleFeedback(message.data);
                break;
            case 'ready':
                // Webview is ready, send current state if available
                if (this._state.currentExplanation) {
                    this._sendMessageToWebview({
                        type: 'update',
                        data: this._state.currentExplanation
                    });
                }
                break;
            case 'error':
                console.error('Webview error:', message.data);
                vscode.window.showErrorMessage(`FlowPilot webview error: ${message.data?.message || 'Unknown error'}`);
                break;
        }
    }

    private _handleFeedback(feedbackData: any): void {
        if (!feedbackData || typeof feedbackData.helpful !== 'boolean') {
            console.warn('Invalid feedback data received:', feedbackData);
            return;
        }

        const feedback: FeedbackEvent = {
            explanationId: this._generateExplanationId(),
            helpful: feedbackData.helpful,
            comment: feedbackData.comment,
            timestamp: Date.now()
        };

        this._state.userFeedback.push(feedback);

        // Emit feedback event for telemetry
        this._emitFeedbackEvent(feedback);

        // Show confirmation to user
        const message = feedback.helpful 
            ? 'Thanks for the positive feedback!' 
            : 'Thanks for the feedback. We\'ll work to improve our explanations.';
        
        vscode.window.showInformationMessage(message);
    }

    private _generateExplanationId(): string {
        // Generate a simple ID based on current explanation and timestamp
        const explanation = this._state.currentExplanation;
        if (!explanation) {
            return `unknown-${Date.now()}`;
        }

        const content = explanation.type === 'explain' 
            ? explanation.summary 
            : explanation.type === 'review' 
                ? explanation.summary 
                : explanation.errorMeaning;

        // Create a simple hash-like ID
        const hash = content.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        return `${explanation.type}-${Math.abs(hash)}-${Date.now()}`;
    }

    private _emitFeedbackEvent(feedback: FeedbackEvent): void {
        // Track feedback with telemetry system
        if (this._telemetry && this._state.currentExplanation) {
            const featureUsed = this._state.currentExplanation.type === 'explain' 
                ? 'explain' as const
                : this._state.currentExplanation.type === 'review' 
                    ? 'review' as const
                    : 'errorExplanation' as const;

            const userLevel = this._configManager?.getUserLevel() || 'beginner';

            this._telemetry.trackFeedback({
                helpful: feedback.helpful,
                featureUsed,
                userLevel
            });
        }
    }

    private _sendMessageToWebview(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'panel', 'main.js'));

        // Do the same for the stylesheet
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'panel', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'panel', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'panel', 'styles.css'));

        // Use a nonce to only allow a specific script to be run
        const nonce = this._getNonce();

        // Detect current VS Code theme
        const themeKind = vscode.window.activeColorTheme.kind;
        const themeName = (vscode.window.activeColorTheme as any).name || 'unknown';
        
        // Map theme kind to CSS class
        const themeClass = this._getThemeClass(themeKind);
        const themeDataAttribute = this._getThemeDataAttribute(themeKind);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>FlowPilot</title>
            </head>
            <body class="${themeClass}" ${themeDataAttribute}>
                <div class="container">
                    <header class="header">
                        <h1 class="title">
                            <span class="icon">🎓</span>
                            FlowPilot
                        </h1>
                        <p class="subtitle">Understanding your code</p>
                    </header>

                    <main class="content" id="content">
                        <div class="modern-card modern-card--info modern-card--large" id="welcome">
                            <div class="card-header">
                                <span class="card-icon">📚</span>
                                <div>
                                    <h2 class="card-title">Welcome!</h2>
                                    <p class="card-subtitle">Understanding your code</p>
                                </div>
                            </div>
                            <div class="card-body">
                                <p>Select Python code and use:</p>
                                <ul class="command-list">
                                    <li><strong>Explain Code</strong></li>
                                    <li><strong>Review Code</strong></li>
                                    <li><strong>Explain Error</strong></li>
                                </ul>
                            </div>
                            <div class="card-footer">
                                <p class="tip">💡 Right-click for quick access!</p>
                            </div>
                        </div>

                        <!-- Explanation content will be dynamically inserted here -->
                        <div class="explanation-content" id="explanation" style="display: none;">
                            <!-- Context header -->
                            <div class="modern-card modern-card--summary modern-card--compact" id="context-header">
                                <div class="card-header">
                                    <span class="card-icon">🎯</span>
                                    <div>
                                        <div class="operation-type card-title" id="operation-type"></div>
                                        <div class="file-info card-subtitle" id="file-info"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="main-content" id="main-content">
                                <!-- Summary section -->
                                <section class="modern-card modern-card--summary" id="summary-section">
                                    <div class="card-header">
                                        <span class="card-icon">📋</span>
                                        <h3 class="card-title">Summary</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="summary-content" id="summary-content"></div>
                                    </div>
                                </section>

                                <!-- Line-by-line section (for explanations) -->
                                <section class="modern-card modern-card--code" id="line-by-line-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">🔍</span>
                                        <h3 class="card-title">Line-by-Line</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="line-explanations" id="line-explanations"></div>
                                    </div>
                                </section>

                                <!-- Error analysis sections (for errors) -->
                                <section class="modern-card modern-card--error" id="error-meaning-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">❓</span>
                                        <h3 class="card-title">What This Means</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="error-meaning-content" id="error-meaning-content"></div>
                                    </div>
                                </section>

                                <section class="modern-card modern-card--warning" id="error-context-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">🎯</span>
                                        <h3 class="card-title">Why It Happened</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="error-context-content" id="error-context-content"></div>
                                    </div>
                                </section>

                                <section class="modern-card modern-card--success" id="error-fix-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">🔧</span>
                                        <h3 class="card-title">How to Fix</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="error-fix-content" id="error-fix-content"></div>
                                    </div>
                                </section>

                                <!-- Review sections (for reviews) -->
                                <section class="modern-card modern-card--success" id="good-points-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">✅</span>
                                        <h3 class="card-title">What's Good</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="good-points-content" id="good-points-content"></div>
                                    </div>
                                </section>

                                <section class="modern-card modern-card--info" id="improvements-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">🚀</span>
                                        <h3 class="card-title">Improvements</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="improvements-content" id="improvements-content"></div>
                                    </div>
                                </section>

                                <!-- Common sections -->
                                <section class="modern-card modern-card--warning" id="pitfalls-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">⚠️</span>
                                        <h3 class="card-title">Pitfalls</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="pitfalls-content" id="pitfalls-content"></div>
                                    </div>
                                </section>

                                <section class="modern-card modern-card--info" id="try-it-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">🧪</span>
                                        <h3 class="card-title">Try It</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="try-it-content" id="try-it-content"></div>
                                    </div>
                                </section>

                                <section class="modern-card modern-card--info" id="related-concepts-section" style="display: none;">
                                    <div class="card-header">
                                        <span class="card-icon">🔗</span>
                                        <h3 class="card-title">Related</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="related-concepts-content" id="related-concepts-content"></div>
                                    </div>
                                </section>
                            </div>

                            <!-- Feedback section -->
                            <div class="modern-card modern-card--feedback" id="feedback-section">
                                <div class="card-header">
                                    <span class="card-icon">💬</span>
                                    <h3 class="card-title feedback-title">Helpful?</h3>
                                </div>
                                <div class="card-body">
                                    <div class="feedback-controls">
                                        <button class="modern-button modern-button--success feedback-btn helpful-btn" id="helpful-btn" data-helpful="true">
                                            👍 Yes
                                        </button>
                                        <button class="modern-button modern-button--error feedback-btn not-helpful-btn" id="not-helpful-btn" data-helpful="false">
                                            👎 No
                                        </button>
                                    </div>
                                    <div class="feedback-comment" id="feedback-comment" style="display: none;">
                                        <textarea 
                                            class="modern-input modern-textarea"
                                            id="feedback-text" 
                                            placeholder="How can we improve?"
                                            rows="3"
                                        ></textarea>
                                        <div class="feedback-comment-actions">
                                            <button class="modern-button modern-button--primary submit-feedback-btn" id="submit-feedback-btn">Submit</button>
                                            <button class="modern-button modern-button--secondary cancel-feedback-btn" id="cancel-feedback-btn">Cancel</button>
                                        </div>
                                    </div>
                                    <div class="feedback-thanks" id="feedback-thanks" style="display: none;">
                                        <span class="thanks-message">Thanks! 🙏</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <script nonce="${nonce}">
                    // Pass theme information to the webview
                    window.initialTheme = {
                        kind: ${themeKind},
                        name: "${themeName}",
                        className: "${themeClass}"
                    };
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private _getThemeClass(themeKind: vscode.ColorThemeKind): string {
        switch (themeKind) {
            case vscode.ColorThemeKind.Light:
                return 'theme-light';
            case vscode.ColorThemeKind.Dark:
                return 'theme-dark';
            case vscode.ColorThemeKind.HighContrast:
                return 'theme-high-contrast';
            default:
                return 'theme-dark'; // Default fallback
        }
    }

    private _getThemeDataAttribute(themeKind: vscode.ColorThemeKind): string {
        switch (themeKind) {
            case vscode.ColorThemeKind.Light:
                return 'data-vscode-theme-kind="vscode-light"';
            case vscode.ColorThemeKind.Dark:
                return 'data-vscode-theme-kind="vscode-dark"';
            case vscode.ColorThemeKind.HighContrast:
                return 'data-vscode-theme-kind="vscode-high-contrast"';
            default:
                return 'data-vscode-theme-kind="vscode-dark"';
        }
    }

    private _getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}