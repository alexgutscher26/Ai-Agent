/**
 * Code Action Provider for FlowPilot extension
 * Provides code actions for explaining errors and diagnostics
 * Requirements: 2.3, 2.5
 * Safety: 2.4, 3.5 - Only provides explanations, never modifies files
 */

import * as vscode from 'vscode';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { FileSafetyGuard } from '../safety/FileSafetyGuard';

export class CodeCoachCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    private safetyGuard: FileSafetyGuard;

    constructor(private configManager: ConfigurationManager) {
        this.safetyGuard = FileSafetyGuard.getInstance();
    }

    /**
     * Provide code actions for diagnostics
     * Requirements: 2.3 - offer code action to explain errors
     * Safety: 2.4, 3.5 - Only provides explanations, never file modifications
     */
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        
        // Validate this is a safe read-only operation
        this.safetyGuard.validateOperation('provideCodeActions', { 
            documentUri: document.uri.toString(),
            range: range.toString()
        });
        
        // Ensure we're only reading from the document
        this.safetyGuard.validateReadPath(document.uri.fsPath);
        
        // Only provide actions for Python files
        if (!this.configManager.shouldActivateForDocument(document)) {
            return [];
        }

        // Only provide actions when there are diagnostics
        if (!context.diagnostics || context.diagnostics.length === 0) {
            return [];
        }

        const actions: vscode.CodeAction[] = [];

        // Filter diagnostics that are within the range
        const relevantDiagnostics = context.diagnostics.filter(diagnostic =>
            range.intersection(diagnostic.range) !== undefined
        );

        if (relevantDiagnostics.length === 0) {
            return [];
        }

        // Prioritize diagnostics (Requirement 2.5)
        const prioritizedDiagnostic = this.prioritizeDiagnostic(relevantDiagnostics);

        // Create code action for explaining the error
        const explainAction = this.createExplainErrorAction(prioritizedDiagnostic, document);
        actions.push(explainAction);

        // If there are multiple diagnostics, offer to explain all
        if (relevantDiagnostics.length > 1) {
            const explainAllAction = this.createExplainAllErrorsAction(relevantDiagnostics, document);
            actions.push(explainAllAction);
        }

        return actions;
    }

    /**
     * Create a code action to explain a specific error
     */
    private createExplainErrorAction(diagnostic: vscode.Diagnostic, document: vscode.TextDocument): vscode.CodeAction {
        const action = new vscode.CodeAction(
            `🎓 Explain this error: ${this.truncateMessage(diagnostic.message)}`,
            vscode.CodeActionKind.QuickFix
        );

        action.command = {
            command: 'codeCoach.explainErrorAtPosition',
            title: 'Explain Error',
            arguments: [document.uri, diagnostic.range.start]
        };

        action.diagnostics = [diagnostic];
        action.isPreferred = true; // Make this the preferred quick fix

        return action;
    }

    /**
     * Create a code action to explain all errors at the current position
     */
    private createExplainAllErrorsAction(diagnostics: vscode.Diagnostic[], document: vscode.TextDocument): vscode.CodeAction {
        const action = new vscode.CodeAction(
            `🎓 Explain all ${diagnostics.length} errors here`,
            vscode.CodeActionKind.QuickFix
        );

        action.command = {
            command: 'codeCoach.explainAllErrorsAtPosition',
            title: 'Explain All Errors',
            arguments: [document.uri, diagnostics[0]!.range.start, diagnostics]
        };

        action.diagnostics = diagnostics;

        return action;
    }

    /**
     * Prioritize diagnostics when multiple exist
     * Same logic as in CommandManager for consistency
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
     * Truncate error message for display in code action
     */
    private truncateMessage(message: string, maxLength: number = 50): string {
        if (message.length <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength - 3) + '...';
    }
}