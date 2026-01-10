import * as vscode from 'vscode';

export interface ErrorContext {
    errors: Array<{
        message: string;
        line: number;
        range: vscode.Range;
        severity: 'error' | 'warning';
    }>;
    codeSnippet: string;
    fileName: string;
    languageId: string;
}

/**
 * Get lines around a specific line number
 * @param document The text document
 * @param lineNumber The center line number
 * @param contextLines Number of lines to grab before and after
 */
function getLinesAround(document: vscode.TextDocument, lineNumber: number, contextLines: number): string {
    const startLine = Math.max(0, lineNumber - contextLines);
    const endLine = Math.min(document.lineCount - 1, lineNumber + contextLines);

    const range = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
    return document.getText(range);
}

/**
 * Extract error context from the active editor
 * @param editor The active text editor
 * @returns ErrorContext or null if no errors found
 */
export function getErrorContext(editor: vscode.TextEditor): ErrorContext | null {
    const uri = editor.document.uri;
    const diagnostics = vscode.languages.getDiagnostics(uri);

    if (!diagnostics || diagnostics.length === 0) {
        return null;
    }

    // Prioritize errors over warnings
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);

    // Use errors if available, otherwise use warnings
    const relevantDiagnostics = errors.length > 0 ? errors : warnings;

    if (relevantDiagnostics.length === 0) {
        return null;
    }

    // Get the first error/warning
    const firstDiagnostic = relevantDiagnostics[0];

    // Grab 5 lines around the first error
    const codeSnippet = getLinesAround(editor.document, firstDiagnostic.range.start.line, 5);

    // Map diagnostics to our error format (limit to first 3)
    const errorList = relevantDiagnostics.slice(0, 3).map(d => ({
        message: d.message,
        line: d.range.start.line + 1, // Convert to 1-based line numbers
        range: d.range,
        severity: d.severity === vscode.DiagnosticSeverity.Error ? 'error' as const : 'warning' as const
    }));

    return {
        errors: errorList,
        codeSnippet,
        fileName: editor.document.fileName,
        languageId: editor.document.languageId
    };
}
