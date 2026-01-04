import * as vscode from 'vscode';

/**
 * Manages status bar notifications for proactive help suggestions
 * Provides non-intrusive notifications that respect user preferences
 */
export class StatusBarNotificationManager implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private statusBarItem: vscode.StatusBarItem;
    private currentNotification: {
        message: string;
        command?: vscode.Command;
        timeout?: NodeJS.Timeout;
    } | undefined;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.disposables.push(this.statusBarItem);
        
        this.setupConfigurationListener();
    }

    /**
     * Setup configuration change listener
     */
    private setupConfigurationListener(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(this.onConfigurationChanged.bind(this))
        );
    }

    /**
     * Handle configuration changes
     */
    private onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('codeCoach.proactiveSuggestions')) {
            if (!this.isProactiveSuggestionsEnabled()) {
                this.hideNotification();
            }
        }
    }

    /**
     * Show a help notification for cursor dwell
     */
    public showDwellNotification(diagnostic: vscode.Diagnostic): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        const message = 'Having trouble with this error? FlowPilot can explain it!';
        const command: vscode.Command = {
            command: 'codeCoach.explainError',
            title: 'Explain Error',
            arguments: [diagnostic]
        };

        this.showNotification(message, command, 10000); // Auto-hide after 10 seconds
    }

    /**
     * Show a help notification for repeated errors
     */
    public showRepeatErrorNotification(diagnostic: vscode.Diagnostic): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        const message = 'This error keeps appearing. Let FlowPilot help you understand it!';
        const command: vscode.Command = {
            command: 'codeCoach.explainError',
            title: 'Explain Error',
            arguments: [diagnostic]
        };

        this.showNotification(message, command, 15000); // Auto-hide after 15 seconds
    }

    /**
     * Show a general learning suggestion
     */
    public showLearningSuggestion(message: string, command?: vscode.Command, duration: number = 8000): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        this.showNotification(message, command, duration);
    }

    /**
     * Show a notification with optional command and auto-hide
     */
    private showNotification(message: string, command?: vscode.Command, autoHideDuration?: number): void {
        // Clear any existing notification
        this.hideNotification();

        // Set up the status bar item
        this.statusBarItem.text = `$(lightbulb) ${message}`;
        this.statusBarItem.tooltip = command ? command.title : message;
        this.statusBarItem.command = command;
        this.statusBarItem.show();

        // Store current notification info
        this.currentNotification = {
            message,
            command
        };

        // Set up auto-hide if duration is specified
        if (autoHideDuration && autoHideDuration > 0) {
            this.currentNotification.timeout = setTimeout(() => {
                this.hideNotification();
            }, autoHideDuration);
        }
    }

    /**
     * Hide the current notification
     */
    public hideNotification(): void {
        if (this.currentNotification?.timeout) {
            clearTimeout(this.currentNotification.timeout);
        }
        
        this.statusBarItem.hide();
        this.currentNotification = undefined;
    }

    /**
     * Check if there's currently a notification showing
     */
    public hasActiveNotification(): boolean {
        return this.currentNotification !== undefined;
    }

    /**
     * Get the current notification message
     */
    public getCurrentNotificationMessage(): string | undefined {
        return this.currentNotification?.message;
    }

    /**
     * Show a welcome notification for new users
     */
    public showWelcomeNotification(): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        const message = 'Welcome to FlowPilot! Select Python code and right-click to get explanations.';
        const command: vscode.Command = {
            command: 'workbench.action.openSettings',
            title: 'Open Settings',
            arguments: ['codeCoach']
        };

        this.showNotification(message, command, 12000);
    }

    /**
     * Show a configuration reminder
     */
    public showConfigurationReminder(): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        const message = 'Configure FlowPilot API settings to start getting explanations.';
        const command: vscode.Command = {
            command: 'workbench.action.openSettings',
            title: 'Open Settings',
            arguments: ['codeCoach']
        };

        this.showNotification(message, command, 10000);
    }

    /**
     * Show a success notification
     */
    public showSuccessNotification(message: string, duration: number = 5000): void {
        if (!this.isProactiveSuggestionsEnabled()) {
            return;
        }

        this.statusBarItem.text = `$(check) ${message}`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.command = undefined;
        this.statusBarItem.show();

        // Auto-hide success notifications
        setTimeout(() => {
            this.hideNotification();
        }, duration);
    }

    /**
     * Show an error notification
     */
    public showErrorNotification(message: string, duration: number = 8000): void {
        // Error notifications are shown regardless of proactive suggestions setting
        this.statusBarItem.text = `$(error) ${message}`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.command = undefined;
        this.statusBarItem.show();

        // Auto-hide error notifications
        setTimeout(() => {
            this.hideNotification();
        }, duration);
    }

    /**
     * Check if proactive suggestions are enabled in configuration
     */
    private isProactiveSuggestionsEnabled(): boolean {
        const config = vscode.workspace.getConfiguration('codeCoach');
        return config.get<boolean>('proactiveSuggestions', true);
    }

    /**
     * Dispose of all resources
     */
    public dispose(): void {
        this.hideNotification();
        
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables.length = 0;
    }
}