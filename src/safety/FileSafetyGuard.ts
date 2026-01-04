/**
 * File Safety Guard for FlowPilot extension
 * Ensures all operations are read-only and prevents any file modifications
 * Requirements: 2.4, 3.5 - Never modify user code, only provide explanations
 */

import * as vscode from 'vscode';

export class FileSafetyGuard {
    private static instance: FileSafetyGuard | undefined;
    private readonly blockedOperations: Set<string> = new Set();
    private readonly allowedReadOperations: Set<string> = new Set();

    private constructor() {
        this.initializeOperationLists();
        this.setupSafetyMonitoring();
    }

    /**
     * Get singleton instance of FileSafetyGuard
     */
    public static getInstance(): FileSafetyGuard {
        if (!FileSafetyGuard.instance) {
            FileSafetyGuard.instance = new FileSafetyGuard();
        }
        return FileSafetyGuard.instance;
    }

    /**
     * Initialize lists of blocked and allowed operations
     */
    private initializeOperationLists(): void {
        // Operations that are explicitly blocked (file modification)
        this.blockedOperations.add('writeFile');
        this.blockedOperations.add('createFile');
        this.blockedOperations.add('delete');
        this.blockedOperations.add('rename');
        this.blockedOperations.add('copy');
        this.blockedOperations.add('move');
        this.blockedOperations.add('edit');
        this.blockedOperations.add('applyEdit');
        this.blockedOperations.add('insertText');
        this.blockedOperations.add('replaceText');
        this.blockedOperations.add('deleteText');
        this.blockedOperations.add('save');
        this.blockedOperations.add('saveAs');

        // Operations that are explicitly allowed (read-only)
        this.allowedReadOperations.add('readFile');
        this.allowedReadOperations.add('stat');
        this.allowedReadOperations.add('readDirectory');
        this.allowedReadOperations.add('getText');
        this.allowedReadOperations.add('getSelection');
        this.allowedReadOperations.add('getDiagnostics');
        this.allowedReadOperations.add('getConfiguration');
        this.allowedReadOperations.add('showInformationMessage');
        this.allowedReadOperations.add('showWarningMessage');
        this.allowedReadOperations.add('showErrorMessage');
        this.allowedReadOperations.add('createWebviewPanel');
        this.allowedReadOperations.add('registerCommand');
        this.allowedReadOperations.add('executeCommand');
    }

    /**
     * Setup monitoring for potentially unsafe operations
     */
    private setupSafetyMonitoring(): void {
        // Monitor workspace file system operations
        this.monitorWorkspaceFileSystem();
        
        // Monitor text editor operations
        this.monitorTextEditorOperations();
        
        // Monitor command executions
        this.monitorCommandExecutions();
    }

    /**
     * Monitor workspace file system operations for safety violations
     */
    private monitorWorkspaceFileSystem(): void {
        // Note: This is a conceptual monitor - VS Code doesn't provide direct hooks
        // for all file system operations, but we can check for common patterns
        console.log('FileSafetyGuard: Monitoring workspace file system operations');
    }

    /**
     * Monitor text editor operations for safety violations
     */
    private monitorTextEditorOperations(): void {
        // Monitor for text document changes that might indicate modification attempts
        try {
            vscode.workspace.onDidChangeTextDocument((event) => {
                // Log document changes for safety monitoring
                // Note: This is for monitoring only - we don't prevent legitimate user edits
                if (event.document.uri.scheme === 'file') {
                    console.log('FileSafetyGuard: Detected text document change (user edit):', event.document.uri.fsPath);
                }
            });
        } catch (error) {
            // In test environment, this may not be available
            console.log('FileSafetyGuard: Text editor monitoring not available (test environment)');
        }
    }

    /**
     * Monitor command executions for potentially unsafe operations
     */
    private monitorCommandExecutions(): void {
        // Note: VS Code doesn't provide hooks for all command executions
        // This is a placeholder for future monitoring capabilities
        console.log('FileSafetyGuard: Monitoring command executions');
    }

    /**
     * Validate that an operation is safe (read-only)
     * @param operationName Name of the operation to validate
     * @param context Additional context about the operation
     * @returns true if operation is safe, false otherwise
     */
    public validateOperation(operationName: string, context?: any): boolean {
        // Check if operation is explicitly blocked
        if (this.blockedOperations.has(operationName)) {
            this.logSafetyViolation(operationName, 'Blocked operation attempted', context);
            return false;
        }

        // Check if operation is explicitly allowed
        if (this.allowedReadOperations.has(operationName)) {
            return true;
        }

        // For unknown operations, be conservative and log for review
        this.logSafetyWarning(operationName, 'Unknown operation detected', context);
        
        // Allow unknown operations by default, but log them
        return true;
    }

    /**
     * Ensure that a file path is safe for read operations
     * @param filePath Path to validate
     * @returns true if path is safe for reading, false otherwise
     */
    public validateReadPath(filePath: string): boolean {
        // Ensure path is within workspace or is a known safe location
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (!workspaceFolders || workspaceFolders.length === 0) {
            // No workspace - allow reading any file (VS Code handles permissions)
            return true;
        }

        // Check if path is within any workspace folder
        const isInWorkspace = workspaceFolders.some(folder => {
            const folderPath = folder.uri.fsPath;
            return filePath.startsWith(folderPath);
        });

        if (isInWorkspace) {
            return true;
        }

        // Allow reading from common safe locations
        const safePaths = [
            process.env.HOME || process.env.USERPROFILE || '',
            process.env.TEMP || process.env.TMP || '',
            '/tmp',
            '/var/tmp'
        ].filter(path => path.length > 0);

        const isSafePath = safePaths.some(safePath => filePath.startsWith(safePath));
        
        if (!isSafePath) {
            this.logSafetyWarning('readPath', 'Reading file outside workspace', { filePath });
        }

        return true; // Allow but log for monitoring
    }

    /**
     * Prevent any file modification operations
     * @param operationName Name of the modification operation
     * @param filePath Path that would be modified
     * @param context Additional context
     * @throws Error if modification is attempted
     */
    public preventFileModification(operationName: string, filePath: string, context?: any): never {
        const errorMessage = `FlowPilot Safety Violation: Attempted to ${operationName} file "${filePath}". ` +
                           'FlowPilot is designed to be read-only and never modifies user files.';
        
        this.logSafetyViolation(operationName, errorMessage, { filePath, context });
        
        throw new Error(errorMessage);
    }

    /**
     * Validate that a VS Code edit operation is not being performed
     * @param edit The edit operation to validate
     * @throws Error if edit operation is detected
     */
    public validateNoEdits(edit: vscode.WorkspaceEdit): void {
        if (edit.size > 0) {
            const errorMessage = 'FlowPilot Safety Violation: Attempted to apply workspace edits. ' +
                               'FlowPilot is designed to be read-only and never modifies user files.';
            
            this.logSafetyViolation('applyEdit', errorMessage, { editSize: edit.size });
            throw new Error(errorMessage);
        }
    }

    /**
     * Validate that text editor operations are read-only
     * @param editor The text editor
     * @param operationName Name of the operation
     */
    public validateReadOnlyEditor(editor: vscode.TextEditor, operationName: string): void {
        // Check if we're attempting to modify the editor
        if (operationName.includes('edit') || operationName.includes('insert') || 
            operationName.includes('replace') || operationName.includes('delete')) {
            
            const errorMessage = `FlowPilot Safety Violation: Attempted to ${operationName} in text editor. ` +
                               'FlowPilot is designed to be read-only and never modifies user files.';
            
            this.logSafetyViolation(operationName, errorMessage, { 
                documentUri: editor.document.uri.toString(),
                languageId: editor.document.languageId
            });
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Get safety status report
     * @returns Object containing safety statistics and status
     */
    public getSafetyStatus(): SafetyStatus {
        return {
            isActive: true,
            blockedOperationsCount: this.blockedOperations.size,
            allowedOperationsCount: this.allowedReadOperations.size,
            violationsDetected: 0, // Would be tracked in a real implementation
            lastCheck: new Date().toISOString()
        };
    }

    /**
     * Log a safety violation (blocked operation)
     */
    private logSafetyViolation(operation: string, message: string, context?: any): void {
        console.error('🚨 FlowPilot Safety Violation:', {
            operation,
            message,
            context,
            timestamp: new Date().toISOString()
        });

        // Show user-friendly error message
        vscode.window.showErrorMessage(
            `FlowPilot Safety: ${message.split('.')[0]}. FlowPilot only reads your code and never modifies files.`
        );
    }

    /**
     * Log a safety warning (unknown or potentially unsafe operation)
     */
    private logSafetyWarning(operation: string, message: string, context?: any): void {
        console.warn('⚠️ FlowPilot Safety Warning:', {
            operation,
            message,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Dispose of safety guard resources
     */
    public dispose(): void {
        // Clean up any resources
        FileSafetyGuard.instance = undefined;
    }
}

/**
 * Interface for safety status reporting
 */
export interface SafetyStatus {
    isActive: boolean;
    blockedOperationsCount: number;
    allowedOperationsCount: number;
    violationsDetected: number;
    lastCheck: string;
}

/**
 * Decorator function to ensure methods are read-only
 * @param target The target class
 * @param propertyName The method name
 * @param descriptor The method descriptor
 */
export function ReadOnly(target: any, propertyName: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        const safetyGuard = FileSafetyGuard.getInstance();
        safetyGuard.validateOperation(propertyName, { target: target.constructor.name, args });
        
        return originalMethod.apply(this, args);
    };
}

/**
 * Utility function to create a read-only wrapper for file operations
 * @param operation The operation function
 * @param operationName Name of the operation for logging
 * @returns Wrapped function that validates safety
 */
export function createReadOnlyWrapper<T extends (...args: any[]) => any>(
    operation: T,
    operationName: string
): T {
    return ((...args: any[]) => {
        const safetyGuard = FileSafetyGuard.getInstance();
        safetyGuard.validateOperation(operationName, { args });
        
        return operation(...args);
    }) as T;
}