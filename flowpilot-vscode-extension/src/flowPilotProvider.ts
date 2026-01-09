import * as vscode from 'vscode';

export class FlowPilotProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'flowpilotPanel';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage((data: any) => {
            switch (data.type) {
                case 'sendMessage':
                    this.handleUserMessage(data.text);
                    break;
                case 'reviewFile':
                    this.reviewFile(data.content, data.filename);
                    break;
                case 'optimizeCode':
                    this.optimizeCode();
                    break;
                case 'addDocstring':
                    this.addDocstring();
                    break;
            }
        });
    }

    public reviewFile(content: string, filename: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'reviewFile',
                content: content,
                filename: filename
            });
        }
    }

    public explainCode(code: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'explainCode',
                code: code
            });
        }
    }

    private handleUserMessage(text: string) {
        // Simulate AI response
        setTimeout(() => {
            if (this._view) {
                this._view.webview.postMessage({
                    type: 'aiResponse',
                    text: `I understand you're asking about: "${text}". Let me help you with that...`
                });
            }
        }, 1000);
    }

    private optimizeCode() {
        vscode.window.showInformationMessage('Code optimization suggestion: Consider using memoization for better performance.');
    }

    private addDocstring() {
        vscode.window.showInformationMessage('Docstring added to your function.');
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview.css'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        const robotIcon = `<svg viewBox="0 0 24 24" class="fp-icon-svg" aria-hidden="true"><path fill="currentColor" d="M11 2h2v2.08c2.83.48 5 2.94 5 5.92v6c0 3.31-2.69 6-6 6h-2c-3.31 0-6-2.69-6-6v-6c0-2.98 2.17-5.44 5-5.92V2Zm-1 6c-2.21 0-4 1.79-4 4v4c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4v-4c0-2.21-1.79-4-4-4h-2Zm-1.25 3.5a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm6.5 1.25a1.25 1.25 0 1 0-2.5 0a1.25 1.25 0 0 0 2.5 0ZM8 17h8a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/></svg>`;
        const refreshIcon = `<svg viewBox="0 0 24 24" class="fp-icon-svg" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 13.65-6.65Z"/></svg>`;
        const moreIcon = `<svg viewBox="0 0 24 24" class="fp-icon-svg" aria-hidden="true"><path fill="currentColor" d="M6 10.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z"/></svg>`;
        const bugIcon = `<svg viewBox="0 0 24 24" class="fp-icon-svg" aria-hidden="true"><path fill="currentColor" d="M20 8h-3.81A5.99 5.99 0 0 0 13 5.07V4h-2v1.07A5.99 5.99 0 0 0 7.81 8H4v2h3.09c-.05.33-.09.66-.09 1v1H4v2h3v2H4v2h3.81A6 6 0 0 0 11 21.93V22h2v-.07A6 6 0 0 0 16.19 18H20v-2h-3v-2h3v-2h-3v-1c0-.34-.03-.67-.09-1H20V8Zm-5 8a4 4 0 0 1-4 4a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4a4 4 0 0 1 4 4v5Z"/></svg>`;
        const bulbIcon = `<svg viewBox="0 0 24 24" class="fp-icon-svg" aria-hidden="true"><path fill="currentColor" d="M9 21h6v-1H9v1Zm3-20a7 7 0 0 0-4 12.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.26A7 7 0 0 0 12 1Zm3 11.6-1 .76V16h-4v-2.64l-1-.76A5 5 0 1 1 15 12.6Z"/></svg>`;
        const sendIcon = `<svg viewBox="0 0 24 24" class="fp-icon-svg" aria-hidden="true"><path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2v7Z"/></svg>`;

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:; font-src ${webview.cspSource};">
                <link href="${styleUri}" rel="stylesheet">
                <title>FlowPilot - AI Coding Coach</title>
            </head>
            <body>
                <div class="flowpilot-container">
                    <template id="fp-icon-robot">${robotIcon}</template>
                    <!-- Panel Header -->
                    <div class="panel-header">
                        <div class="header-left">
                            <span class="fp-icon fp-icon-primary">${robotIcon}</span>
                            <span class="header-title">Code Coach</span>
                        </div>
                        <div class="header-actions">
                            <button class="icon-button" id="refresh-btn" type="button" aria-label="Refresh">
                                <span class="fp-icon">${refreshIcon}</span>
                            </button>
                            <button class="icon-button" id="more-btn" type="button" aria-label="More options">
                                <span class="fp-icon">${moreIcon}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Panel Content -->
                    <div class="panel-content">
                        <!-- Main CTA -->
                        <button class="cta-button" id="review-file-btn">
                            <span class="fp-icon">${bugIcon}</span>
                            Review entire file
                        </button>

                        <!-- Logic Breakdown Card -->
                        <div class="explanation-card hidden" id="explanation-card">
                            <div class="card-header">
                                <div class="card-title">
                                    <span class="fp-icon fp-icon-accent">${bulbIcon}</span>
                                    <span>Logic Breakdown</span>
                                </div>
                                <span class="line-badge" id="line-badge">Lines 6-11</span>
                            </div>
                            <p class="card-description" id="card-description">
                                You've selected a recursive implementation of the Fibonacci sequence. Here is how it works step-by-step:
                            </p>
                            <div class="explanation-steps" id="explanation-steps">
                                <!-- Steps will be populated dynamically -->
                            </div>
                            <div class="card-actions">
                                <button class="action-button" id="optimize-btn">Optimize Code</button>
                                <button class="action-button" id="docstring-btn">Add Docstring</button>
                            </div>
                        </div>

                        <!-- Chat Messages -->
                        <div class="chat-messages" id="chat-messages">
                            <!-- Messages will be populated dynamically -->
                        </div>
                    </div>

                    <!-- Chat Input -->
                    <div class="chat-input-container">
                        <div class="input-wrapper">
                            <input 
                                type="text" 
                                class="chat-input" 
                                id="chat-input"
                                placeholder="Ask FlowPilot about your code..."
                            />
                            <button class="send-button" id="send-btn">
                                <span class="fp-icon">${sendIcon}</span>
                            </button>
                        </div>
                        <div class="input-footer">
                            <span class="powered-by">Powered by Code Coach AI</span>
                            <span class="history-link">History</span>
                        </div>
                    </div>
                </div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
