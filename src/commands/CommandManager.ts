import * as vscode from 'vscode';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { CodeCoachApiClient, ApiClient } from '../api/CodeCoachApiClient';
import { MockApiClient } from '../api/MockApiClient';
import { CodeCoachViewProvider } from '../panel/CodeCoachViewProvider';
import { CodeCoachCodeActionProvider } from './CodeActionProvider';
import { ExplainRequest, ReviewRequest, ErrorRequest } from '../types';
import { Telemetry } from '../telemetry/Telemetry';
import { FileSafetyGuard } from '../safety/FileSafetyGuard';
import { PerformanceMonitor } from '../performance/PerformanceMonitor';
import { PromptTemplates } from '../prompt/PromptTemplates';

/**
 * Command Manager for FlowPilot extension
 * Handles registration and execution of VS Code commands
 * Ensures all operations are read-only, safe, and non-blocking
 */

export class CommandManager {
    private disposables: vscode.Disposable[] = [];
    private apiClient: ApiClient | undefined;
    private codeActionProvider: CodeCoachCodeActionProvider;
    private viewProvider: CodeCoachViewProvider | undefined;
    private safetyGuard: FileSafetyGuard;
    private performanceMonitor: PerformanceMonitor;

    constructor(
        private context: vscode.ExtensionContext,
        private configManager: ConfigurationManager,
        private telemetry: Telemetry
    ) {
        // Initialize safety guard
        this.safetyGuard = FileSafetyGuard.getInstance();
        
        // Initialize performance monitor
        this.performanceMonitor = PerformanceMonitor.getInstance();
        
        // Initialize API client with current configuration
        this.initializeApiClient();
        
        // Initialize code action provider
        this.codeActionProvider = new CodeCoachCodeActionProvider(configManager);
        
        // Listen for configuration changes to update API client
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('codeCoach')) {
                this.initializeApiClient();
            }
        }, null, this.disposables);
    }

    /**
     * Set the view provider (called from extension.ts after registration)
     */
    public setViewProvider(viewProvider: CodeCoachViewProvider): void {
        this.viewProvider = viewProvider;
    }

    /**
     * Initialize or update the API client based on current configuration
     */
    private initializeApiClient(): void {
        const validatedConfig = this.configManager.getValidatedConfiguration();
        
        // Check if demo mode is enabled
        if (this.configManager.isDemoModeEnabled()) {
            console.log('Demo mode enabled - using mock API client');
            this.apiClient = new MockApiClient(this.configManager.getUserLevel());
            return;
        }
        
        if (!validatedConfig.isValid) {
            console.warn('Invalid configuration detected, API client may not work properly:', validatedConfig.errors);
            return;
        }

        const clientConfig = validatedConfig.config!;

        if (this.apiClient instanceof CodeCoachApiClient) {
            this.apiClient.updateConfig(clientConfig);
        } else {
            this.apiClient = new CodeCoachApiClient(clientConfig);
        }
    }

    /**
     * Register all extension commands
     */
    public registerCommands(): void {
        // Register core commands
        this.registerCommand('codeCoach.explainSelection', this.explainSelection.bind(this));
        this.registerCommand('codeCoach.reviewSelection', this.reviewSelection.bind(this));
        this.registerCommand('codeCoach.explainError', this.explainError.bind(this));
        this.registerCommand('codeCoach.openTutor', this.openTutor.bind(this));
        
        // Register code action commands (Requirements: 2.3)
        this.registerCommand('codeCoach.explainErrorAtPosition', this.explainErrorAtPosition.bind(this));
        this.registerCommand('codeCoach.explainAllErrorsAtPosition', this.explainAllErrorsAtPosition.bind(this));
        
        // Register code action provider for Python files (Requirements: 2.3)
        const pythonSelector: vscode.DocumentSelector = { language: 'python', scheme: 'file' };
        const codeActionProviderDisposable = vscode.languages.registerCodeActionsProvider(
            pythonSelector,
            this.codeActionProvider,
            {
                providedCodeActionKinds: CodeCoachCodeActionProvider.providedCodeActionKinds
            }
        );
        this.disposables.push(codeActionProviderDisposable);
        this.context.subscriptions.push(codeActionProviderDisposable);

        const hoverDisposable = vscode.languages.registerHoverProvider(
            pythonSelector,
            {
                provideHover: (document, position) => {
                    if (!this.configManager.shouldActivateForDocument(document)) return undefined;
                    const diags = vscode.languages.getDiagnostics(document.uri).filter(d => d.range.contains(position));
                    if (diags.length === 0) return undefined;
                    const md = new vscode.MarkdownString('[Ask FlowPilot about this error](command:codeCoach.explainError)');
                    md.isTrusted = true;
                    return new vscode.Hover(md);
                }
            }
        );
        this.disposables.push(hoverDisposable);
        this.context.subscriptions.push(hoverDisposable);
    }

    private async tryGetStackTrace(): Promise<string[] | undefined> {
        try {
            const session = vscode.debug.activeDebugSession;
            if (!session) return undefined;
            const threadsResp: any = await session.customRequest('threads', {});
            const threads: any[] = threadsResp?.threads || [];
            if (!threads.length) return undefined;
            const threadId = threads[0]?.id;
            if (!threadId) return undefined;
            const stResp: any = await session.customRequest('stackTrace', { threadId, startFrame: 0, levels: 20 });
            const frames: any[] = stResp?.stackFrames || [];
            if (!frames.length) return undefined;
            return frames.map(f => {
                const src = f.source?.path || f.source?.name || 'unknown';
                return `${f.name} (${src}:${f.line ?? '?'})`;
            });
        } catch {
            return undefined;
        }
    }

    private async openTutor(): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.view.extension.codeCoach');
        } catch {
            vscode.window.showErrorMessage('Unable to open FlowPilot view');
        }
    }

    /**
     * Validate configuration and API client availability
     */
    private async validateApiClient(): Promise<boolean> {
        // Skip validation in demo mode
        if (!this.configManager.isDemoModeEnabled()) {
            const validation = this.configManager.validateConfiguration();
            if (!validation.isValid) {
                await this.configManager.showConfigurationErrors(validation.errors);
                return false;
            }
        }

        if (!this.apiClient) {
            if (this.configManager.isDemoModeEnabled()) {
                vscode.window.showErrorMessage('Demo mode is enabled but mock API client failed to initialize.');
            } else {
                vscode.window.showErrorMessage('FlowPilot API client is not initialized. Please check your configuration.');
            }
            return false;
        }

        return true;
    }

    /**
     * Register a single command
     */
    private registerCommand(command: string, callback: (...args: any[]) => any): void {
        const disposable = vscode.commands.registerCommand(command, callback);
        this.disposables.push(disposable);
        this.context.subscriptions.push(disposable);
    }

    /**
     * Handle explain selection command
     * Requirements: 1.1, 1.2, 1.4
     * Safety: 2.4, 3.5 - Read-only operation, no file modifications
     * Performance: 5.5 - Non-blocking operation
     */
    private async explainSelection(): Promise<void> {
        return this.performanceMonitor.ensureNonBlocking('explainSelection', async () => {
            // Validate this is a safe read-only operation
            this.safetyGuard.validateOperation('explainSelection', { command: 'explainSelection' });
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            // Ensure we're only reading from the editor, not modifying
            this.safetyGuard.validateReadOnlyEditor(editor, 'explainSelection');
            this.safetyGuard.validateReadPath(editor.document.uri.fsPath);

            // Check if this is a Python file (Requirement 1.5)
            if (!this.configManager.shouldActivateForDocument(editor.document)) {
                vscode.window.showWarningMessage('FlowPilot currently only supports Python files');
                return;
            }

            // Validate configuration and API client
            if (!(await this.validateApiClient())) {
                return;
            }

            try {
                // Show progress indicator
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "FlowPilot",
                    cancellable: false
                }, async (progress) => {
                    progress.report({ message: "Analyzing your code..." });

                    // Get selection or expand to current context (Requirements 1.1, 1.2)
                    const selection = this.getSelectionOrExpand(editor);
                    let code = editor.document.getText(selection);

                    if (!code.trim()) {
                        vscode.window.showWarningMessage('No code selected or found at cursor position');
                        return;
                    }

                    const cfg = vscode.workspace.getConfiguration('codeCoach');
                    const maxChars = cfg.get<number>('maxSnippetChars', 6000);
                    if (code.length > maxChars) {
                        let startLine = selection.start.line;
                        let endLine = selection.start.line;
                        let total = 0;
                        while (endLine < editor.document.lineCount) {
                            const text = editor.document.lineAt(endLine).text + '\n';
                            if (total + text.length > maxChars) {
                                break;
                            }
                            total += text.length;
                            endLine++;
                            if (endLine > selection.end.line) {
                                break;
                            }
                        }
                        const trimmedRange = new vscode.Range(
                            new vscode.Position(startLine, 0),
                            new vscode.Position(Math.max(startLine, endLine - 1), editor.document.lineAt(Math.max(startLine, endLine - 1)).text.length)
                        );
                        code = editor.document.getText(trimmedRange);
                    }

                    // Gather surrounding context for better analysis
                    const surroundingContext = this.getSurroundingContext(editor, selection);

                    // Prepare API request
                    const filePath = editor.document.uri.fsPath;
                    const fileName = (() => {
                        const fn = editor.document.fileName;
                        const idx = Math.max(fn.lastIndexOf('\\'), fn.lastIndexOf('/'));
                        return idx >= 0 ? fn.substring(idx + 1) : fn;
                    })();
                    const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
                    const prompt = PromptTemplates.getExplainTemplate();
                    const request: ExplainRequest = {
                        code: code,
                        languageId: editor.document.languageId,
                        filePath: filePath,
                        fileName: fileName,
                        relativePath: relativePath,
                        surroundingContext: surroundingContext,
                        userLevel: this.configManager.getUserLevel(),
                        promptVersion: prompt.version,
                        promptId: prompt.id
                    };

                    progress.report({ message: "Getting explanation from FlowPilot..." });

                    // Call API to get explanation with performance monitoring and timeout
                    const explanation = await this.performanceMonitor.withTimeout(
                        'apiExplainSelection',
                        () => this.apiClient!.explainSelection(request),
                        30000 // 30 second timeout
                    );

                    // Create or show webview panel and display explanation (Requirement 1.4)
                    if (this.viewProvider) {
                        this.viewProvider.setSelectionContext(fileName, relativePath, selection.start.line);
                        this.viewProvider.showExplanation(explanation);
                    } else {
                        vscode.window.showErrorMessage('FlowPilot view is not available. Please try reloading the window.');
                    }

                    // Track telemetry event
                    this.telemetry.trackExplanationRequest({
                        languageId: editor.document.languageId,
                        fileExtension: this.getFileExtension(editor.document.fileName),
                        codeLength: code.length,
                        lineCount: code.split('\n').length,
                        selectionLength: editor.selection.isEmpty ? 0 : code.length,
                        triggerMethod: 'command',
                        userLevel: this.configManager.getUserLevel(),
                        constructType: this.detectConstructType(code),
                        success: true
                    });
                });
                
            } catch (error) {
                console.error('Failed to explain code:', error);
                vscode.window.showErrorMessage(`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`);
                
                // Track failed telemetry event
                this.telemetry.trackExplanationRequest({
                    languageId: editor.document.languageId,
                    codeLength: 0,
                    lineCount: 0,
                    selectionLength: 0,
                    triggerMethod: 'command',
                    userLevel: this.configManager.getUserLevel(),
                    success: false
                });
            }
        });
    }

    /**
     * Handle review selection command
     * Requirements: 3.1, 3.2, 3.3
     * Safety: 2.4, 3.5 - Read-only operation, no file modifications
     * Performance: 5.5 - Non-blocking operation
     */
    private async reviewSelection(): Promise<void> {
        return this.performanceMonitor.ensureNonBlocking('reviewSelection', async () => {
            // Validate this is a safe read-only operation
            this.safetyGuard.validateOperation('reviewSelection', { command: 'reviewSelection' });
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            // Ensure we're only reading from the editor, not modifying
            this.safetyGuard.validateReadOnlyEditor(editor, 'reviewSelection');
            this.safetyGuard.validateReadPath(editor.document.uri.fsPath);

            // Check if this is a Python file
            if (!this.configManager.shouldActivateForDocument(editor.document)) {
                vscode.window.showWarningMessage('FlowPilot currently only supports Python files');
                return;
            }

            // Validate configuration and API client
            if (!(await this.validateApiClient())) {
                return;
            }

            try {
                // Show progress indicator
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "FlowPilot",
                    cancellable: false
                }, async (progress) => {
                    progress.report({ message: "Analyzing your code for quality and style..." });

                    // Get selection or expand to current context (Requirement 3.1)
                    const selection = this.getSelectionOrExpand(editor);
                    const code = editor.document.getText(selection);

                    if (!code.trim()) {
                        vscode.window.showWarningMessage('No code selected or found at cursor position');
                        return;
                    }

                    // Prepare API request for code quality analysis
                    const focusPerformance = vscode.workspace.getConfiguration('codeCoach').get<boolean>('reviewFocus.performance', true);
                    const focusReadability = vscode.workspace.getConfiguration('codeCoach').get<boolean>('reviewFocus.readability', true);
                    const focusStyle = vscode.workspace.getConfiguration('codeCoach').get<boolean>('reviewFocus.style', true);
                    const contextSig = this.getEnclosingFunctionSignature(editor, selection);
                    const contextType = this.detectContextType(editor, selection);
                    const request: ReviewRequest = {
                        code: code,
                        languageId: editor.document.languageId,
                        filePath: editor.document.uri.fsPath,
                        reviewType: 'quality',
                        userLevel: this.configManager.getUserLevel(),
                        focusPerformance,
                        focusReadability,
                        focusStyle,
                        contextSignature: contextSig || undefined,
                        contextType,
                        originalSnippet: code
                    };

                    progress.report({ message: "Getting code review from FlowPilot..." });

                    // Call API to get code review with performance monitoring and timeout
                    const review = await this.performanceMonitor.withTimeout(
                        'apiReviewSelection',
                        () => this.apiClient!.reviewSelection(request),
                        30000 // 30 second timeout
                    );

                    // Create or show webview panel and display review (Requirements 3.2, 3.3)
                    if (this.viewProvider) {
                        this.viewProvider.showReview(review);
                        // Send original snippet to webview for diff rendering
                        (this.viewProvider as any)._sendMessageToWebview?.({
                            type: 'reviewContext',
                            data: {
                                originalSnippet: code
                            }
                        });
                    } else {
                        vscode.window.showErrorMessage('FlowPilot view is not available. Please try reloading the window.');
                    }

                    // Track telemetry event
                    this.telemetry.trackReviewRequest({
                        languageId: editor.document.languageId,
                        fileExtension: this.getFileExtension(editor.document.fileName),
                        codeLength: code.length,
                        lineCount: code.split('\n').length,
                        selectionLength: editor.selection.isEmpty ? 0 : code.length,
                        reviewType: request.reviewType,
                        complexityNestingEstimate: this.estimateNestingLevel(code),
                        triggerMethod: 'command',
                        userLevel: this.configManager.getUserLevel(),
                        success: true
                    });
                });
                
            } catch (error) {
                console.error('Failed to review code:', error);
                vscode.window.showErrorMessage(`Failed to review code: ${error instanceof Error ? error.message : 'Unknown error'}`);
                
                // Track failed telemetry event
                this.telemetry.trackReviewRequest({
                    languageId: editor.document.languageId,
                    codeLength: 0,
                    lineCount: 0,
                    selectionLength: 0,
                    reviewType: 'quality',
                    triggerMethod: 'command',
                    userLevel: this.configManager.getUserLevel(),
                    success: false
                });
            }
        });
    }

    private getEnclosingFunctionSignature(editor: vscode.TextEditor, selection: vscode.Range): string | null {
        const document = editor.document;
        for (let line = selection.start.line; line >= 0; line--) {
            const text = document.lineAt(line).text;
            if (/^\s*def\s+\w+\s*\(.*\)\s*:/.test(text)) {
                return text.trim();
            }
        }
        return null;
    }

    private detectContextType(editor: vscode.TextEditor, selection: vscode.Range): 'function' | 'classMethod' | 'loop' | 'module' {
        const document = editor.document;
        const startLine = selection.start.line;
        let inClass = false;
        for (let line = startLine; line >= 0; line--) {
            const text = document.lineAt(line).text;
            if (/^\s*class\s+\w+/.test(text)) {
                inClass = true;
                break;
            }
            if (/^\s*def\s+\w+\s*\(.*\)\s*:/.test(text)) {
                return inClass ? 'classMethod' : 'function';
            }
            if (/^\s*(for|while)\s+.*:/.test(text)) {
                return 'loop';
            }
        }
        return 'module';
    }

    /**
     * Handle explain error command
     * Requirements: 2.1, 2.3, 2.5
     * Safety: 2.4, 3.5 - Read-only operation, no file modifications
     * Performance: 5.5 - Non-blocking operation
     */
    private async explainError(arg?: any, contextArg?: any): Promise<void> {
        return this.performanceMonitor.ensureNonBlocking('explainError', async () => {
            // Validate this is a safe read-only operation
            this.safetyGuard.validateOperation('explainError', { command: 'explainError' });
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            // Ensure we're only reading from the editor, not modifying
            this.safetyGuard.validateReadOnlyEditor(editor, 'explainError');
            this.safetyGuard.validateReadPath(editor.document.uri.fsPath);

            // Check if this is a Python file
            if (!this.configManager.shouldActivateForDocument(editor.document)) {
                vscode.window.showWarningMessage('FlowPilot currently only supports Python files');
                return;
            }

            // Validate configuration and API client
            if (!(await this.validateApiClient())) {
                return;
            }

            try {
                // Show progress indicator
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "FlowPilot",
                    cancellable: false
                }, async (progress) => {
                    progress.report({ message: "Analyzing error..." });

                    let diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
                    if (diagnostics.length === 0) {
                        const allDiagnostics = vscode.languages.getDiagnostics();
                        const entry = allDiagnostics.find(([uri]) => uri.toString() === editor.document.uri.toString());
                        diagnostics = entry ? entry[1] : [];
                    }
                    const currentPosition = editor.selection.active;

                    // Find diagnostics at current cursor position or within selection if present
                    const selection = editor.selection;
                    let relevantDiagnostics: vscode.Diagnostic[] = [];
                    
                    if (selection && !selection.isEmpty) {
                        relevantDiagnostics = diagnostics.filter(diagnostic =>
                            diagnostic.range.intersection(selection) !== undefined
                        );
                    } else {
                        relevantDiagnostics = diagnostics.filter(diagnostic => 
                            diagnostic.range.contains(currentPosition)
                        );
                    }

                    // Fallback: if none exactly at position, try diagnostics on the same line
                    if (relevantDiagnostics.length === 0) {
                        relevantDiagnostics = diagnostics.filter(diagnostic =>
                            diagnostic.range.start.line <= currentPosition.line &&
                            diagnostic.range.end.line >= currentPosition.line
                        );
                    }

                    // Fallback: if still none, use any diagnostic in the file
                    if (relevantDiagnostics.length === 0 && diagnostics.length > 0) {
                        relevantDiagnostics = diagnostics;
                    }

                    if (relevantDiagnostics.length === 0) {
                        vscode.window.showWarningMessage('No errors found at cursor position');
                        return;
                    }

                    // Prioritize diagnostics (Requirement 2.5)
                    const diagnostic = this.prioritizeDiagnostic(relevantDiagnostics);
                    
                    // Get code context around the error
                    const errorRange = diagnostic.range;
                    const surroundingRange = this.getErrorContext(editor, errorRange);
                    const code = editor.document.getText(surroundingRange);

                    // Prepare API request for error analysis
                    const request: ErrorRequest = {
                        code: code,
                        errorMessage: diagnostic.message,
                        errorRange: diagnostic.range,
                        diagnosticCode: diagnostic.code?.toString(),
                        languageId: editor.document.languageId,
                        stackTrace: await this.tryGetStackTrace()
                    };

                    progress.report({ message: "Getting error explanation from FlowPilot..." });

                    // Call API to get error explanation with performance monitoring and timeout
                    const errorExplanation = await this.performanceMonitor.withTimeout(
                        'apiExplainError',
                        () => this.apiClient!.explainError(request),
                        30000 // 30 second timeout
                    );

                    // Create or show webview panel and display error explanation (Requirement 2.2)
                    if (this.viewProvider) {
                        this.viewProvider.showError(errorExplanation);
                    } else {
                        vscode.window.showErrorMessage('FlowPilot view is not available. Please try reloading the window.');
                    }

                    // Track telemetry event
                    const triggerSource = contextArg?.source === 'proactive' ? 'proactive' : 'command';
                    this.telemetry.trackErrorExplanation({
                        languageId: editor.document.languageId,
                        fileExtension: this.getFileExtension(editor.document.fileName),
                        errorType: diagnostic.message,
                        diagnosticSeverity: this.getSeverityString(diagnostic.severity),
                        codeLength: code.length,
                        triggerMethod: triggerSource,
                        requestedHelp: true,
                        userLevel: this.configManager.getUserLevel(),
                        success: true
                    });
                });
                
            } catch (error) {
                console.error('Failed to explain error:', error);
                vscode.window.showErrorMessage(`Failed to explain error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                
                // Track failed telemetry event
                this.telemetry.trackErrorExplanation({
                    languageId: editor.document.languageId,
                    errorType: 'unknown',
                    diagnosticSeverity: 'error',
                    codeLength: 0,
                    triggerMethod: 'command',
                    userLevel: this.configManager.getUserLevel(),
                    success: false
                });
            }
        });
    }

    /**
     * Handle explain error at specific position (called from code actions)
     * Requirements: 2.3 - code action integration
     */
    private async explainErrorAtPosition(uri: vscode.Uri, position: vscode.Position): Promise<void> {
        // Open the document if it's not already open
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        
        // Set cursor to the specified position
        editor.selection = new vscode.Selection(position, position);
        
        // Call the regular explainError method
        await this.explainError();
    }

    /**
     * Handle explain all errors at specific position (called from code actions)
     * Requirements: 2.3, 2.5 - code action integration with multiple diagnostics
     */
    private async explainAllErrorsAtPosition(
        uri: vscode.Uri, 
        position: vscode.Position, 
        diagnostics: vscode.Diagnostic[]
    ): Promise<void> {
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        
        // Set cursor to the specified position
        editor.selection = new vscode.Selection(position, position);

        // Validate configuration and API client
        if (!(await this.validateApiClient())) {
            return;
        }

        try {
            // Show progress indicator
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "FlowPilot",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: `Analyzing ${diagnostics.length} errors...` });

                // Process each diagnostic and combine explanations
                const errorExplanations: string[] = [];
                
                for (let i = 0; i < diagnostics.length; i++) {
                    const diagnostic = diagnostics[i]!;
                    progress.report({ 
                        message: `Analyzing error ${i + 1} of ${diagnostics.length}: ${diagnostic.message.substring(0, 30)}...` 
                    });

                    // Get code context around the error
                    const errorRange = diagnostic.range;
                    const surroundingRange = this.getErrorContext(editor, errorRange);
                    const code = editor.document.getText(surroundingRange);

                    // Prepare API request for error analysis
                    const request: ErrorRequest = {
                        code: code,
                        errorMessage: diagnostic.message,
                        errorRange: diagnostic.range,
                        diagnosticCode: diagnostic.code?.toString(),
                        languageId: editor.document.languageId
                    };

                    try {
                        const errorExplanation = await this.apiClient!.explainError(request);
                        errorExplanations.push(`**Error ${i + 1}: ${diagnostic.message}**\n\n${errorExplanation.errorMeaning}\n\n**Why it happened:** ${errorExplanation.whyHere}\n\n**How to fix:** ${errorExplanation.howToFix}`);
                    } catch (error) {
                        console.error(`Failed to explain error ${i + 1}:`, error);
                        errorExplanations.push(`**Error ${i + 1}: ${diagnostic.message}**\n\nFailed to get explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }

                // Create combined error response
                const combinedResponse = {
                    type: 'error' as const,
                    errorMeaning: `Multiple errors found at this location (${diagnostics.length} total)`,
                    whyHere: 'Multiple issues detected in your code',
                    howToFix: errorExplanations.join('\n\n---\n\n'),
                    relatedConcepts: ['Error handling', 'Code debugging', 'Python syntax']
                };

                // Create or show webview panel and display combined explanation
                if (this.viewProvider) {
                    this.viewProvider.showError(combinedResponse);
                } else {
                    vscode.window.showErrorMessage('FlowPilot view is not available. Please try reloading the window.');
                }

                // Log telemetry event
                if (this.configManager.isTelemetryEnabled()) {
                    await this.apiClient!.logEvent({
                        type: 'explainError',
                        metadata: {
                            errorCount: diagnostics.length,
                            errorMessages: diagnostics.map(d => d.message),
                            languageId: editor.document.languageId,
                            isMultipleErrors: true,
                            userLevel: this.configManager.getUserLevel()
                        },
                        timestamp: Date.now()
                    });
                }

                // Track telemetry event
                this.telemetry.trackErrorExplanation({
                    languageId: editor.document.languageId,
                    errorType: 'multiple',
                    diagnosticSeverity: 'error',
                    codeLength: editor.document.getText().length,
                    triggerMethod: 'codeAction',
                    userLevel: this.configManager.getUserLevel(),
                    success: true
                });
            });
            
        } catch (error) {
            console.error('Failed to explain multiple errors:', error);
            vscode.window.showErrorMessage(`Failed to explain errors: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            // Track failed telemetry event
            this.telemetry.trackErrorExplanation({
                languageId: document.languageId,
                errorType: 'multiple',
                diagnosticSeverity: 'error',
                codeLength: 0,
                triggerMethod: 'codeAction',
                userLevel: this.configManager.getUserLevel(),
                success: false
            });
        }
    }

    /**
     * Get current selection or expand to meaningful context
     * Implements automatic selection expansion (Requirement 1.2)
     */
    private getSelectionOrExpand(editor: vscode.TextEditor): vscode.Range {
        const selection = editor.selection;
        
        // If there's a selection, use it (Requirement 1.1)
        if (!selection.isEmpty) {
            return selection;
        }

        // Otherwise, expand to current line plus context (Requirement 1.2)
        const currentLine = selection.active.line;
        const document = editor.document;
        
        // Try to find logical boundaries (function, class, or statement block)
        const expandedRange = this.findLogicalBlock(document, currentLine);
        if (expandedRange) {
            return expandedRange;
        }

        // Fallback: Get surrounding context (±3 lines or document bounds)
        const startLine = Math.max(0, currentLine - 3);
        const endLine = Math.min(document.lineCount - 1, currentLine + 3);
        
        return new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
    }

    /**
     * Find logical code block around the current line (function, class, etc.)
     */
    private findLogicalBlock(document: vscode.TextDocument, currentLine: number): vscode.Range | null {
        const currentLineText = document.lineAt(currentLine).text;
        const indentLevel = this.getIndentLevel(currentLineText);
        
        // If current line is a definition (def, class), expand to include the whole block
        if (/^\s*(def|class|if|for|while|with|try)\s/.test(currentLineText)) {
            return this.expandToBlock(document, currentLine);
        }

        // Look backwards for a function or class definition at the same or lower indent level
        for (let line = currentLine - 1; line >= 0; line--) {
            const lineText = document.lineAt(line).text;
            const lineIndent = this.getIndentLevel(lineText);
            
            // Found a definition at same or lower indent level
            if (lineIndent <= indentLevel && /^\s*(def|class)\s/.test(lineText)) {
                return this.expandToBlock(document, line);
            }
            
            // Stop if we hit a line with lower indent that's not a definition
            if (lineIndent < indentLevel && lineText.trim()) {
                break;
            }
        }

        // If no logical block found, return null to use fallback
        return null;
    }

    /**
     * Expand from a definition line to include the entire block
     */
    private expandToBlock(document: vscode.TextDocument, startLine: number): vscode.Range {
        const startLineText = document.lineAt(startLine).text;
        const baseIndent = this.getIndentLevel(startLineText);
        
        let endLine = startLine;
        
        // Find the end of the block by looking for the next line at same or lower indent
        for (let line = startLine + 1; line < document.lineCount; line++) {
            const lineText = document.lineAt(line).text;
            
            // Skip empty lines
            if (!lineText.trim()) {
                continue;
            }
            
            const lineIndent = this.getIndentLevel(lineText);
            
            // If we find a line at same or lower indent, we've reached the end
            if (lineIndent <= baseIndent) {
                break;
            }
            
            endLine = line;
        }
        
        return new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
    }

    /**
     * Get the indentation level of a line (number of spaces/tabs)
     */
    private getIndentLevel(lineText: string): number {
        const match = lineText.match(/^(\s*)/);
        if (!match) return 0;
        
        // Convert tabs to spaces (assuming 4 spaces per tab)
        const whitespace = match[1]!.replace(/\t/g, '    ');
        return whitespace.length;
    }

    /**
     * Get surrounding context lines for better API analysis
     */
    private getSurroundingContext(editor: vscode.TextEditor, selection: vscode.Range): string {
        const document = editor.document;
        const contextLines = 5; // Number of lines before and after
        
        const startLine = Math.max(0, selection.start.line - contextLines);
        const endLine = Math.min(document.lineCount - 1, selection.end.line + contextLines);
        
        const contextRange = new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
        
        return document.getText(contextRange);
    }

    private getFileExtension(fileName: string): string {
        const idx = fileName.lastIndexOf('.');
        if (idx === -1) return '';
        return fileName.substring(idx + 1).toLowerCase();
    }

    private detectConstructType(code: string): 'function' | 'class' | 'loop' | 'conditional' | 'other' {
        const trimmed = code.trim();
        if (/\bdef\s+/.test(trimmed)) return 'function';
        if (/\bclass\s+/.test(trimmed)) return 'class';
        if (/\b(for|while)\s+/.test(trimmed)) return 'loop';
        if (/\bif\s+/.test(trimmed)) return 'conditional';
        return 'other';
    }

    private estimateNestingLevel(code: string): number {
        const lines = code.split('\n');
        let maxIndent = 0;
        for (const line of lines) {
            const match = line.match(/^(\s+)/);
            if (match) {
                const spaces = match[1]!.replace(/\t/g, '    ').length;
                if (spaces > maxIndent) maxIndent = spaces;
            }
        }
        return Math.floor(maxIndent / 4);
    }

    /**
     * Prioritize diagnostics when multiple exist on the same line
     * Requirements: 2.5 - prioritize the most relevant diagnostic
     */
    private prioritizeDiagnostic(diagnostics: vscode.Diagnostic[]): vscode.Diagnostic {
        if (diagnostics.length === 1) {
            return diagnostics[0]!;
        }

        // Priority order: Error > Warning > Information > Hint
        const severityPriority = [
            vscode.DiagnosticSeverity.Error,
            vscode.DiagnosticSeverity.Warning,
            vscode.DiagnosticSeverity.Information,
            vscode.DiagnosticSeverity.Hint
        ];

        // Sort by severity first, then by range start position
        const sortedDiagnostics = diagnostics.sort((a, b) => {
            const aSeverityIndex = severityPriority.indexOf(a.severity);
            const bSeverityIndex = severityPriority.indexOf(b.severity);
            
            if (aSeverityIndex !== bSeverityIndex) {
                return aSeverityIndex - bSeverityIndex;
            }

            // If same severity, prioritize by position (earlier in line first)
            return a.range.start.compareTo(b.range.start);
        });

        return sortedDiagnostics[0]!;
    }

    /**
     * Get code context around an error for better analysis
     * Requirements: 2.1 - gather error context
     */
    private getErrorContext(editor: vscode.TextEditor, errorRange: vscode.Range): vscode.Range {
        const document = editor.document;
        const contextLines = 3; // Lines before and after the error
        
        // Expand to include surrounding context
        const startLine = Math.max(0, errorRange.start.line - contextLines);
        const endLine = Math.min(document.lineCount - 1, errorRange.end.line + contextLines);
        
        return new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
    }

    /**
     * Convert VS Code diagnostic severity to string
     */
    private getSeverityString(severity: vscode.DiagnosticSeverity): string {
        switch (severity) {
            case vscode.DiagnosticSeverity.Error:
                return 'error';
            case vscode.DiagnosticSeverity.Warning:
                return 'warning';
            case vscode.DiagnosticSeverity.Information:
                return 'information';
            case vscode.DiagnosticSeverity.Hint:
                return 'hint';
            default:
                return 'unknown';
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
