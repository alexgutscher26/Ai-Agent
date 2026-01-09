import * as vscode from 'vscode';
import { FlowPilotProvider } from './flowPilotProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('FlowPilot extension is now active!');

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
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const fileContent = document.getText();
                
                // Send file content to webview for review
                provider.reviewFile(fileContent, document.fileName);
                
                vscode.window.showInformationMessage('FlowPilot is reviewing your file...');
            } else {
                vscode.window.showWarningMessage('No active file to review');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('flowpilot.explainSelection', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && !editor.selection.isEmpty) {
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                
                // Send selection to webview for explanation
                provider.explainCode(selectedText);
                
                vscode.window.showInformationMessage('FlowPilot is explaining your selection...');
            } else {
                vscode.window.showWarningMessage('No code selected');
            }
        })
    );
}

export function deactivate() {
    console.log('FlowPilot extension is now deactivated');
}