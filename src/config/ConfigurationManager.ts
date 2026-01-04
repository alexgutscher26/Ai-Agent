/**
 * Configuration Manager for FlowPilot extension
 * Handles VS Code settings integration and validation
 */

import * as vscode from 'vscode';
import { CodeCoachConfig } from '../types';

export class ConfigurationManager {
    private static readonly SECTION = 'codeCoach';
    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.setupConfigurationWatcher();
    }

    /**
     * Get the current configuration
     */
    public getConfiguration(): CodeCoachConfig {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.SECTION);
        
        return {
            apiBaseUrl: config.get<string>('apiBaseUrl', 'https://api.codecoach.dev'),
            apiKey: config.get<string>('apiKey', ''),
            telemetryEnabled: config.get<boolean>('telemetryEnabled', true),
            userLevel: config.get<'beginner' | 'intermediate'>('userLevel', 'beginner'),
            proactiveSuggestions: config.get<boolean>('proactiveSuggestions', true),
            demoMode: config.get<boolean>('demoMode', false)
        };
    }

    /**
     * Update a configuration value
     */
    public async updateConfiguration<K extends keyof CodeCoachConfig>(
        key: K,
        value: CodeCoachConfig[K],
        target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.SECTION);
        await config.update(key, value, target);
    }

    /**
     * Validate the current configuration
     */
    public validateConfiguration(): { isValid: boolean; errors: string[]; warnings: string[] } {
        const config = this.getConfiguration();
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate API Base URL
        if (!config.apiBaseUrl) {
            errors.push('API Base URL is required');
        } else {
            try {
                const url = new URL(config.apiBaseUrl);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    errors.push(`Invalid API URL protocol: ${url.protocol}. Only HTTP and HTTPS are supported.`);
                }
                if (url.protocol === 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
                    warnings.push('Using HTTP for non-local API endpoint. Consider using HTTPS for security.');
                }
            } catch {
                errors.push(`Invalid API URL: ${config.apiBaseUrl}. Please provide a valid HTTP/HTTPS URL.`);
            }
        }

        // Validate API Key (skip validation in demo mode)
        if (!config.demoMode) {
            if (!config.apiKey) {
                errors.push('API Key is required. Please configure your FlowPilot API key in settings, or enable Demo Mode for testing.');
            } else if (config.apiKey.length < 10) {
                errors.push('API Key appears to be too short. Please check your FlowPilot API key.');
            } else if (config.apiKey.includes(' ')) {
                errors.push('API Key should not contain spaces. Please check your FlowPilot API key.');
            }
        } else {
            warnings.push('Demo Mode is enabled. The extension will use mock responses instead of the real API.');
        }

        // Validate User Level
        if (!['beginner', 'intermediate'].includes(config.userLevel)) {
            errors.push(`Invalid user level: ${config.userLevel}. Must be 'beginner' or 'intermediate'.`);
        }

        // Validate boolean settings
        if (typeof config.telemetryEnabled !== 'boolean') {
            errors.push(`Invalid telemetry setting: ${config.telemetryEnabled}. Must be true or false.`);
        }

        if (typeof config.proactiveSuggestions !== 'boolean') {
            errors.push(`Invalid proactive suggestions setting: ${config.proactiveSuggestions}. Must be true or false.`);
        }

        // Validate demo mode setting
        if (typeof config.demoMode !== 'boolean') {
            errors.push(`Invalid demo mode setting: ${config.demoMode}. Must be true or false.`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Show configuration errors to the user
     */
    public async showConfigurationErrors(errors: string[], warnings: string[] = []): Promise<void> {
        if (errors.length > 0) {
            const message = `FlowPilot configuration errors:\n${errors.join('\n')}`;
            const action = await vscode.window.showErrorMessage(
                message,
                'Open Settings',
                'Dismiss'
            );

            if (action === 'Open Settings') {
                await vscode.commands.executeCommand('workbench.action.openSettings', 'codeCoach');
            }
        }

        if (warnings.length > 0) {
            const warningMessage = `FlowPilot configuration warnings:\n${warnings.join('\n')}`;
            vscode.window.showWarningMessage(warningMessage);
        }
    }

    /**
     * Check if the extension should activate for the given document
     */
    public shouldActivateForDocument(document: vscode.TextDocument): boolean {
        // Only activate for Python files initially (Requirement 1.5)
        return document.languageId === 'python';
    }

    /**
     * Setup configuration change watcher
     */
    private setupConfigurationWatcher(): void {
        const disposable = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(ConfigurationManager.SECTION)) {
                this.onConfigurationChanged();
            }
        });

        this.disposables.push(disposable);
        this.context.subscriptions.push(disposable);
    }

    /**
     * Handle configuration changes
     */
    private onConfigurationChanged(): void {
        const validation = this.validateConfiguration();
        
        if (!validation.isValid) {
            // Show validation errors to user
            this.showConfigurationErrors(validation.errors, validation.warnings);
        } else if (validation.warnings.length > 0) {
            // Show warnings even if configuration is valid
            this.showConfigurationErrors([], validation.warnings);
        }

        // Emit configuration change event for other components
        this.context.globalState.update('configurationChanged', Date.now());
    }

    /**
     * Check if telemetry is enabled
     */
    public isTelemetryEnabled(): boolean {
        const config = this.getConfiguration();
        return config.telemetryEnabled;
    }

    /**
     * Check if proactive suggestions are enabled
     */
    public areProactiveSuggestionsEnabled(): boolean {
        const config = this.getConfiguration();
        return config.proactiveSuggestions;
    }

    /**
     * Get configuration with user preferences for API requests
     */
    public getConfigurationForApiRequest(): { userLevel: string; telemetryEnabled: boolean; proactiveSuggestions: boolean } {
        const config = this.getConfiguration();
        return {
            userLevel: config.userLevel,
            telemetryEnabled: config.telemetryEnabled,
            proactiveSuggestions: config.proactiveSuggestions
        };
    }

    /**
     * Check if demo mode is enabled
     */
    public isDemoModeEnabled(): boolean {
        const config = this.getConfiguration();
        return config.demoMode;
    }

    /**
     * Get user skill level for API requests
     */
    public getUserLevel(): 'beginner' | 'intermediate' {
        const config = this.getConfiguration();
        return config.userLevel;
    }

    /**
     * Validate configuration on startup and show errors if needed
     */
    public async validateOnStartup(): Promise<boolean> {
        const validation = this.validateConfiguration();
        
        if (!validation.isValid) {
            await this.showConfigurationErrors(validation.errors, validation.warnings);
            return false;
        } else if (validation.warnings.length > 0) {
            await this.showConfigurationErrors([], validation.warnings);
        }

        return true;
    }

    /**
     * Get configuration with validation
     */
    public getValidatedConfiguration(): { config: CodeCoachConfig | null; isValid: boolean; errors: string[] } {
        const validation = this.validateConfiguration();
        
        if (validation.isValid) {
            return {
                config: this.getConfiguration(),
                isValid: true,
                errors: []
            };
        }

        return {
            config: null,
            isValid: false,
            errors: validation.errors
        };
    }

    /**
     * Handle workspace folder changes
     * Requirements: 5.4 - Proper integration with VS Code workspace system
     */
    public handleWorkspaceChange(): void {
        // Re-validate configuration when workspace changes
        const validation = this.validateConfiguration();
        
        if (!validation.isValid) {
            console.log('FlowPilot: Configuration validation failed after workspace change');
            // Don't show errors immediately on workspace change to avoid spam
            // They will be shown when user tries to use the extension
        }
        
        // Update configuration change timestamp
        this.context.globalState.update('workspaceChanged', Date.now());
        
        // Log workspace change for debugging
        console.log('FlowPilot: Workspace folders changed, configuration re-validated');
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}