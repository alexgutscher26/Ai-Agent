import * as vscode from 'vscode';
import { ConfusionMetrics } from '../types';
import { StatusBarNotificationManager } from './StatusBarNotificationManager';
import { Telemetry } from '../telemetry/Telemetry';
import { ConfigurationManager } from '../config/ConfigurationManager';

/**
 * ConfusionDetector monitors user behavior to identify moments when they might need help
 * Tracks cursor dwell time on diagnostic lines and detects repeated error patterns
 */
export class ConfusionDetector implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private readonly dwellThreshold = 15000; // 15 seconds in milliseconds
    private readonly cooldownPeriod = 300000; // 5 minutes in milliseconds
    private readonly maxRepeatCount = 3; // Maximum repeated errors before suggesting help
    
    private currentMetrics: Map<string, ConfusionMetrics> = new Map();
    private dwellTimer: NodeJS.Timeout | undefined;
    private lastCursorPosition: vscode.Position | undefined;
    private lastCursorChangeTime: number = 0;
    private diagnosticHistory: Map<string, { count: number; lastSeen: number }> = new Map();
    
    private statusBarNotificationManager: StatusBarNotificationManager;
    private onHelpOffered: ((diagnostic: vscode.Diagnostic, reason: 'dwell' | 'repeat') => void) | undefined;
    private telemetry?: Telemetry;

    constructor(
        private configurationManager: ConfigurationManager
    ) {
        this.statusBarNotificationManager = new StatusBarNotificationManager();
        this.disposables.push(this.statusBarNotificationManager);
        
        this.setupEventListeners();
    }

    /**
     * Set the telemetry instance for tracking confusion events
     */
    public setTelemetry(telemetry: Telemetry): void {
        this.telemetry = telemetry;
    }

    /**
     * Set callback for when help is offered
     */
    public onHelpOfferedCallback(callback: (diagnostic: vscode.Diagnostic, reason: 'dwell' | 'repeat') => void): void {
        this.onHelpOffered = callback;
    }

    /**
     * Setup VS Code event listeners for confusion detection
     */
    private setupEventListeners(): void {
        // Listen for cursor position changes
        this.disposables.push(
            vscode.window.onDidChangeTextEditorSelection(this.onCursorPositionChanged.bind(this))
        );

        // Listen for diagnostic changes to detect repeated errors
        this.disposables.push(
            vscode.languages.onDidChangeDiagnostics(this.onDiagnosticsChanged.bind(this))
        );

        // Listen for active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this))
        );

        // Listen for configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(this.onConfigurationChanged.bind(this))
        );
    }

    /**
     * Handle cursor position changes to track dwell time
     */
    private onCursorPositionChanged(event: vscode.TextEditorSelectionChangeEvent): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        const editor = event.textEditor;
        const position = event.selections[0]?.active;

        if (!editor || !position || !this.isPythonFile(editor.document)) {
            this.clearDwellTimer();
            return;
        }

        // Check if cursor moved to a different line
        if (!this.lastCursorPosition || !position.isEqual(this.lastCursorPosition)) {
            this.clearDwellTimer();
            this.lastCursorPosition = position;
            this.lastCursorChangeTime = Date.now();

            // Check if current line has diagnostics
            const diagnostics = this.getDiagnosticsForLine(editor.document, position.line);
            if (diagnostics.length > 0) {
                this.startDwellTimer(editor.document, position.line, diagnostics);
            }
        }
    }

    /**
     * Handle diagnostic changes to detect repeated errors
     */
    private onDiagnosticsChanged(event: vscode.DiagnosticChangeEvent): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        for (const uri of event.uris) {
            const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
            if (!document || !this.isPythonFile(document)) {
                continue;
            }

            const diagnostics = vscode.languages.getDiagnostics(uri);
            this.trackRepeatedErrors(document, diagnostics);
        }
    }

    /**
     * Handle active editor changes
     */
    private onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
        this.clearDwellTimer();
        this.lastCursorPosition = undefined;
        
        if (editor && this.isPythonFile(editor.document)) {
            // Reset metrics for new file
            const fileKey = this.getFileKey(editor.document);
            if (!this.currentMetrics.has(fileKey)) {
                this.currentMetrics.set(fileKey, {
                    dwellTime: 0,
                    errorRepeatCount: 0,
                    editCycleCount: 0,
                    lastNotificationTime: 0
                });
            }
        }
    }

    /**
     * Handle configuration changes
     */
    private onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('codeCoach.proactiveSuggestions')) {
            if (!this.isProactiveSuggestionsEnabled()) {
                this.clearDwellTimer();
                this.statusBarNotificationManager.hideNotification();
            }
        }
    }

    /**
     * Start dwell timer for current position
     */
    private startDwellTimer(document: vscode.TextDocument, line: number, diagnostics: vscode.Diagnostic[]): void {
        this.clearDwellTimer();
        
        this.dwellTimer = setTimeout(() => {
            this.onDwellThresholdReached(document, line, diagnostics);
        }, this.dwellThreshold);
    }

    /**
     * Clear the current dwell timer
     */
    private clearDwellTimer(): void {
        if (this.dwellTimer) {
            clearTimeout(this.dwellTimer);
            this.dwellTimer = undefined;
        }
    }

    /**
     * Handle when dwell threshold is reached
     */
    private onDwellThresholdReached(document: vscode.TextDocument, line: number, diagnostics: vscode.Diagnostic[]): void {
        const fileKey = this.getFileKey(document);
        const metrics = this.currentMetrics.get(fileKey);
        
        if (!metrics) {
            return;
        }

        // Check cooldown period
        const now = Date.now();
        if (now - metrics.lastNotificationTime < this.cooldownPeriod) {
            return;
        }

        // Update metrics
        metrics.lastNotificationTime = now;
        metrics.dwellTime += this.dwellThreshold;

        // Get the most relevant diagnostic
        const primaryDiagnostic = this.getPrimaryDiagnostic(diagnostics);
        if (primaryDiagnostic) {
            this.offerHelp(primaryDiagnostic, 'dwell');
        }
    }

    /**
     * Track repeated errors in the same location
     */
    private trackRepeatedErrors(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
        const now = Date.now();
        const fileKey = this.getFileKey(document);
        
        for (const diagnostic of diagnostics) {
            const diagnosticKey = this.getDiagnosticKey(document, diagnostic);
            const history = this.diagnosticHistory.get(diagnosticKey);
            
            if (history) {
                // Check if this is a recent repeat (within 5 minutes)
                if (now - history.lastSeen < 300000) {
                    history.count++;
                    history.lastSeen = now;
                    
                    // Check if we've hit the repeat threshold
                    if (history.count >= this.maxRepeatCount) {
                        const metrics = this.currentMetrics.get(fileKey);
                        if (metrics && now - metrics.lastNotificationTime >= this.cooldownPeriod) {
                            metrics.lastNotificationTime = now;
                            metrics.errorRepeatCount = history.count;
                            this.offerHelp(diagnostic, 'repeat');
                        }
                    }
                } else {
                    // Reset count for old errors
                    history.count = 1;
                    history.lastSeen = now;
                }
            } else {
                // First time seeing this error
                this.diagnosticHistory.set(diagnosticKey, {
                    count: 1,
                    lastSeen: now
                });
            }
        }
        
        // Clean up old diagnostic history (older than 10 minutes)
        const cutoffTime = now - 600000;
        for (const [key, history] of this.diagnosticHistory.entries()) {
            if (history.lastSeen < cutoffTime) {
                this.diagnosticHistory.delete(key);
            }
        }
    }

    /**
     * Offer help to the user
     */
    private offerHelp(diagnostic: vscode.Diagnostic, reason: 'dwell' | 'repeat'): void {
        if (reason === 'dwell') {
            this.statusBarNotificationManager.showDwellNotification(diagnostic);
        } else {
            this.statusBarNotificationManager.showRepeatErrorNotification(diagnostic);
        }
        
        // Track confusion detection event
        if (this.telemetry) {
            this.telemetry.trackConfusionDetection({
                triggerType: reason === 'dwell' ? 'dwellTime' : 'repeatedError',
                dwellTime: reason === 'dwell' ? this.dwellThreshold : undefined,
                errorRepeatCount: reason === 'repeat' ? this.maxRepeatCount : undefined,
                languageId: 'python',
                userLevel: this.configurationManager.getUserLevel(),
                proactiveEnabled: this.isProactiveSuggestionsEnabled()
            });
        }
        
        // Notify callback if set
        if (this.onHelpOffered) {
            this.onHelpOffered(diagnostic, reason);
        }
    }

    /**
     * Show status bar notification
     * @deprecated Use statusBarNotificationManager instead
     */
    private showStatusBarNotification(message: string, diagnostic: vscode.Diagnostic): void {
        // This method is kept for backward compatibility but delegates to the notification manager
        if (message.includes('keeps appearing')) {
            this.statusBarNotificationManager.showRepeatErrorNotification(diagnostic);
        } else {
            this.statusBarNotificationManager.showDwellNotification(diagnostic);
        }
    }

    /**
     * Hide status bar notification
     * @deprecated Use statusBarNotificationManager instead
     */
    private hideStatusBarItem(): void {
        this.statusBarNotificationManager.hideNotification();
    }

    /**
     * Get diagnostics for a specific line
     */
    private getDiagnosticsForLine(document: vscode.TextDocument, line: number): vscode.Diagnostic[] {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        return diagnostics.filter(diagnostic => 
            diagnostic.range.start.line <= line && diagnostic.range.end.line >= line
        );
    }

    /**
     * Get the primary (most relevant) diagnostic from a list
     */
    private getPrimaryDiagnostic(diagnostics: vscode.Diagnostic[]): vscode.Diagnostic | undefined {
        if (diagnostics.length === 0) {
            return undefined;
        }
        
        // Prioritize errors over warnings over info
        const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
        if (errors.length > 0) {
            return errors[0];
        }
        
        const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
        if (warnings.length > 0) {
            return warnings[0];
        }
        
        return diagnostics[0];
    }

    /**
     * Check if proactive suggestions are enabled
     */
    private isProactiveSuggestionsEnabled(): boolean {
        const config = vscode.workspace.getConfiguration('codeCoach');
        return config.get<boolean>('proactiveSuggestions', true);
    }

    /**
     * Check if document is a Python file
     */
    private isPythonFile(document: vscode.TextDocument): boolean {
        return document.languageId === 'python';
    }

    /**
     * Generate a unique key for a file
     */
    private getFileKey(document: vscode.TextDocument): string {
        return document.uri.toString();
    }

    /**
     * Generate a unique key for a diagnostic
     */
    private getDiagnosticKey(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): string {
        return `${document.uri.toString()}:${diagnostic.range.start.line}:${diagnostic.range.start.character}:${diagnostic.message}`;
    }

    /**
     * Get current confusion metrics for a file
     */
    public getMetrics(document: vscode.TextDocument): ConfusionMetrics | undefined {
        const fileKey = this.getFileKey(document);
        return this.currentMetrics.get(fileKey);
    }

    /**
     * Reset metrics for a file
     */
    public resetMetrics(document: vscode.TextDocument): void {
        const fileKey = this.getFileKey(document);
        this.currentMetrics.delete(fileKey);
        
        // Clear related diagnostic history
        const prefix = `${document.uri.toString()}:`;
        for (const key of this.diagnosticHistory.keys()) {
            if (key.startsWith(prefix)) {
                this.diagnosticHistory.delete(key);
            }
        }
    }

    /**
     * Handle diagnostic changes from external sources
     * Requirements: 5.4 - Integration with other extensions
     */
    public handleDiagnosticChanges(uris: readonly vscode.Uri[]): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        // Process diagnostic changes from other extensions
        for (const uri of uris) {
            const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
            if (document && this.isPythonFile(document)) {
                const diagnostics = vscode.languages.getDiagnostics(uri);
                this.trackRepeatedErrors(document, diagnostics);
                
                // If current editor is showing this document, update dwell tracking
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor && activeEditor.document.uri.toString() === uri.toString()) {
                    const position = activeEditor.selection.active;
                    const lineDiagnostics = this.getDiagnosticsForLine(document, position.line);
                    
                    if (lineDiagnostics.length > 0) {
                        // Restart dwell timer with updated diagnostics
                        this.startDwellTimer(document, position.line, lineDiagnostics);
                    } else {
                        // Clear timer if no diagnostics on current line
                        this.clearDwellTimer();
                    }
                }
            }
        }
    }

    /**
     * Handle document changes to reset confusion state
     * Requirements: 5.4 - Maintain proper state during document changes
     */
    public handleDocumentChange(uri: vscode.Uri): void {
        const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
        if (document && this.isPythonFile(document)) {
            // Clear dwell timer when document changes
            this.clearDwellTimer();
            
            // Reset position tracking
            this.lastCursorPosition = undefined;
            this.lastCursorChangeTime = Date.now();
            
            // Clean up old diagnostic history for this document
            const prefix = `${uri.toString()}:`;
            const keysToDelete: string[] = [];
            for (const key of this.diagnosticHistory.keys()) {
                if (key.startsWith(prefix)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.diagnosticHistory.delete(key));
        }
    }

    /**
     * Dispose of all resources
     */
    public dispose(): void {
        this.clearDwellTimer();
        this.statusBarNotificationManager.hideNotification();
        
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables.length = 0;
        
        this.currentMetrics.clear();
        this.diagnosticHistory.clear();
    }
}
