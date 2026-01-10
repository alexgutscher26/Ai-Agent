import * as vscode from 'vscode';
import { getExplainContext } from './context';
import { getErrorContext } from './errorContext';
// Dynamic import reference for type usage only if needed, or rely on inference
import type { FlowPilotProvider as FlowPilotProviderType } from './flowPilotProvider';

export async function activate(context: vscode.ExtensionContext) {
    console.log('FlowPilot: Attempting to activate extension...');
    try {
        console.log('FlowPilot extension is now active!');

        // Dynamically import the provider to handle potential load errors (e.g. missing dependencies)
        const { FlowPilotProvider } = await import('./flowPilotProvider');

        // Register the webview provider
        const provider = new FlowPilotProvider(context.extensionUri);

        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(FlowPilotProvider.viewType, provider)
        );

        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand('flowpilot.openPanel', () => {
                console.log('FlowPilot: Opening panel...');
                vscode.commands.executeCommand('workbench.view.extension.flowpilot');
            })
        );

        // Test command to verify extension is working
        context.subscriptions.push(
            vscode.commands.registerCommand('flowpilot.test', () => {
                vscode.window.showInformationMessage('FlowPilot extension is working!');
                console.log('FlowPilot: Test command executed');
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('flowpilot.reviewFile', async () => {
                // Open the FlowPilot panel first
                await vscode.commands.executeCommand('workbench.view.extension.flowpilot');

                // Trigger the review
                await provider.handleReviewFile();
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('flowpilot.explainSelection', async () => {
                try {
                    console.log('FlowPilot: explainSelection command triggered');
                    const explainContext = getExplainContext();
                    if (explainContext) {
                        // Send context to webview provider which will call the backend
                        provider.explainCode(explainContext);

                        vscode.window.showInformationMessage('FlowPilot is analyzing your code...');
                    } else {
                        vscode.window.showWarningMessage('Please open a file to explain code.');
                    }
                } catch (error) {
                    console.error('FlowPilot: Error in explainSelection command:', error);
                    vscode.window.showErrorMessage('FlowPilot: Error analyzing code. Check output for details.');
                }
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('flowpilot.explainError', async () => {
                try {
                    console.log('FlowPilot: explainError command triggered');
                    const editor = vscode.window.activeTextEditor;

                    if (!editor) {
                        vscode.window.showWarningMessage('Please open a file to explain errors.');
                        return;
                    }

                    const errorContext = getErrorContext(editor);

                    if (!errorContext || errorContext.errors.length === 0) {
                        vscode.window.showInformationMessage('No errors found! 🎉');
                        return;
                    }

                    // Open the FlowPilot panel first
                    await vscode.commands.executeCommand('workbench.view.extension.flowpilot');

                    // Send error context to webview provider which will call the backend
                    provider.explainError(errorContext);

                    vscode.window.showInformationMessage('FlowPilot is analyzing your error...');
                } catch (error) {
                    console.error('FlowPilot: Error in explainError command:', error);
                    vscode.window.showErrorMessage('FlowPilot: Error analyzing error. Check output for details.');
                }
            })
        );
        console.log('FlowPilot: Activation completed successfully.');
    } catch (error) {
        console.error('FlowPilot: Extension activation failed:', error);
        vscode.window.showErrorMessage(`FlowPilot: Extension activation failed: ${error}`);
    }
}

export function deactivate() {
    console.log('FlowPilot extension is now deactivated');
}