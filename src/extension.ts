import * as vscode from 'vscode';
import { ConfigurationManager } from './config/ConfigurationManager';
import { CommandManager } from './commands/CommandManager';
import { CodeCoachViewProvider } from './panel/CodeCoachViewProvider';
import { Telemetry } from './telemetry/Telemetry';
import { ConfusionDetector } from './confusion/ConfusionDetector';
import { FileSafetyGuard } from './safety/FileSafetyGuard';
import { PerformanceMonitor } from './performance/PerformanceMonitor';

// Global extension state
let configurationManager: ConfigurationManager | undefined;
let commandManager: CommandManager | undefined;
let viewProvider: CodeCoachViewProvider | undefined;
let telemetry: Telemetry | undefined;
let confusionDetector: ConfusionDetector | undefined;
let safetyGuard: FileSafetyGuard | undefined;
let performanceMonitor: PerformanceMonitor | undefined;

/**
 * Extension activation function
 * Called when the extension is activated
 * Requirements: 5.4 - Proper VS Code API integration
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('FlowPilot extension is now active');

    try {
        // Initialize safety guard first to ensure all operations are monitored
        safetyGuard = FileSafetyGuard.getInstance();
        console.log('FlowPilot Safety Guard initialized');

        // Initialize performance monitor to ensure non-blocking operations
        performanceMonitor = PerformanceMonitor.getInstance();
        console.log('FlowPilot Performance Monitor initialized');

        // Initialize configuration manager
        configurationManager = new ConfigurationManager(context);
        
        // Initialize telemetry system
        telemetry = new Telemetry(context, configurationManager);
        
        // Validate initial configuration
        const validation = configurationManager.validateConfiguration();
        if (!validation.isValid) {
            // Show configuration errors but don't prevent activation
            configurationManager.showConfigurationErrors(validation.errors);
        }

        // Initialize command manager
        commandManager = new CommandManager(context, configurationManager, telemetry);
        
        // Initialize and register webview view provider with proper error handling
        viewProvider = new CodeCoachViewProvider(context.extensionUri);
        viewProvider.setTelemetry(telemetry);
        viewProvider.setConfigurationManager(configurationManager);
        
        // Register webview provider with proper disposal handling
        const webviewProviderDisposable = vscode.window.registerWebviewViewProvider(
            CodeCoachViewProvider.viewType,
            viewProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true // Improve performance and user experience
                }
            }
        );
        context.subscriptions.push(webviewProviderDisposable);

        // Connect the view provider to the command manager
        commandManager.setViewProvider(viewProvider);
        
        // Register commands after view provider is set up
        commandManager.registerCommands();

        // Initialize confusion detector
        confusionDetector = new ConfusionDetector(context, configurationManager);
        confusionDetector.setTelemetry(telemetry);

        // Wire confusion detector to command manager for proactive help
        confusionDetector.onHelpOfferedCallback((diagnostic, reason) => {
            console.log(`FlowPilot: Confusion detected (${reason}) for diagnostic: ${diagnostic.message}`);
            
            if (configurationManager?.areProactiveSuggestionsEnabled()) {
                const editor = vscode.window.activeTextEditor;
                if (editor && configurationManager.shouldActivateForDocument(editor.document)) {
                    vscode.commands.executeCommand(
                        'codeCoach.explainErrorAtPosition',
                        editor.document.uri,
                        diagnostic.range.start
                    );
                }
            }
            
            // Track confusion detection in telemetry
            if (telemetry && configurationManager) {
                telemetry.trackConfusionDetection({
                    triggerType: reason === 'dwell' ? 'dwellTime' : 'repeatedError',
                    dwellTime: reason === 'dwell' ? 15000 : undefined,
                    errorRepeatCount: reason === 'repeat' ? 3 : undefined,
                    languageId: 'python',
                    userLevel: configurationManager.getUserLevel(),
                    proactiveEnabled: configurationManager.areProactiveSuggestionsEnabled()
                });
            }
        });

        // Wire all components together for complete integration
        wireComponentsForIntegration(context, {
            configurationManager,
            commandManager,
            viewProvider,
            telemetry,
            confusionDetector,
            safetyGuard,
            performanceMonitor
        });

        // Register extension compatibility listeners
        registerExtensionCompatibilityHandlers(context);

        // Register diagnostic change listeners for better integration
        registerDiagnosticHandlers(context);

        // Log successful activation
        console.log('FlowPilot extension activated successfully');
        
        // Show welcome message for first-time users
        const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
        if (!hasShownWelcome) {
            showWelcomeMessage(context);
        }

    } catch (error) {
        console.error('Failed to activate FlowPilot extension:', error);
        vscode.window.showErrorMessage(`FlowPilot activation failed: ${error}`);
        
        // Ensure partial cleanup on activation failure
        deactivate();
    }
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate() {
    console.log('FlowPilot extension is being deactivated');
    
    try {
        // Clean up resources
        if (confusionDetector) {
            confusionDetector.dispose();
            confusionDetector = undefined;
        }

        if (telemetry) {
            telemetry.dispose();
            telemetry = undefined;
        }

        if (configurationManager) {
            configurationManager.dispose();
            configurationManager = undefined;
        }

        if (commandManager) {
            commandManager.dispose();
            commandManager = undefined;
        }

        if (viewProvider) {
            viewProvider = undefined;
        }

        if (safetyGuard) {
            safetyGuard.dispose();
            safetyGuard = undefined;
        }

        if (performanceMonitor) {
            performanceMonitor.dispose();
            performanceMonitor = undefined;
        }

        // Clean up view provider
        viewProvider = undefined;

        console.log('FlowPilot extension deactivated successfully');
    } catch (error) {
        console.error('Error during FlowPilot deactivation:', error);
    }
}

/**
 * Wire all components together for complete integration
 * Requirements: All requirements integration
 */
interface ComponentWiring {
    configurationManager: ConfigurationManager;
    commandManager: CommandManager;
    viewProvider: CodeCoachViewProvider;
    telemetry: Telemetry;
    confusionDetector: ConfusionDetector;
    safetyGuard: FileSafetyGuard;
    performanceMonitor: PerformanceMonitor;
}

function wireComponentsForIntegration(context: vscode.ExtensionContext, components: ComponentWiring): void {
    const {
        configurationManager,
        confusionDetector,
        safetyGuard    } = components;

    // Ensure all components have proper cross-references
    console.log('FlowPilot: Wiring components for complete integration...');

    // Wire configuration changes to all components
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('codeCoach')) {
            console.log('FlowPilot: Configuration changed, updating all components');
            
            // Notify all components of configuration changes
            if (e.affectsConfiguration('codeCoach.proactiveSuggestions')) {
                // Confusion detector will handle this automatically via its own listener
                console.log('FlowPilot: Proactive suggestions setting changed');
            }
            
            if (e.affectsConfiguration('codeCoach.telemetryEnabled')) {
                console.log('FlowPilot: Telemetry setting changed');
                // Telemetry component handles this automatically
            }
            
            if (e.affectsConfiguration('codeCoach.userLevel')) {
                console.log('FlowPilot: User level setting changed');
                // All components will get updated user level via configuration manager
            }
        }
    });
    context.subscriptions.push(configChangeListener);

    // Wire document lifecycle events to maintain component state
    const documentOpenListener = vscode.workspace.onDidOpenTextDocument(document => {
        if (configurationManager.shouldActivateForDocument(document)) {
            console.log('FlowPilot: Python document opened, ensuring components are ready');
            
            // Ensure confusion detector is tracking this document
            // (It will automatically start tracking when cursor moves to it)
            
            // Validate safety for the new document
            safetyGuard.validateReadPath(document.uri.fsPath);
        }
    });
    context.subscriptions.push(documentOpenListener);

    const documentCloseListener = vscode.workspace.onDidCloseTextDocument(document => {
        if (configurationManager.shouldActivateForDocument(document)) {
            console.log('FlowPilot: Python document closed, cleaning up component state');
            
            // Clean up confusion detector state for closed document
            confusionDetector.resetMetrics(document);
        }
    });
    context.subscriptions.push(documentCloseListener);

    // Wire window state changes for proper component lifecycle
    const windowStateListener = vscode.window.onDidChangeWindowState(state => {
        if (!state.focused) {
            console.log('FlowPilot: Window lost focus, pausing active monitoring');
            // Components will naturally pause when window is not focused
        } else {
            console.log('FlowPilot: Window gained focus, resuming active monitoring');
            // Components will naturally resume when window gains focus
        }
    });
    context.subscriptions.push(windowStateListener);

    // Wire extension host lifecycle for proper cleanup
    const extensionChangeListener = vscode.extensions.onDidChange(() => {
        console.log('FlowPilot: Extension environment changed, validating component state');
        
        // Ensure our components are still properly integrated
        // This helps with compatibility when other extensions are installed/uninstalled
        validateComponentIntegration(components);
    });
    context.subscriptions.push(extensionChangeListener);

    // Set up periodic health checks for component integration
    const healthCheckInterval = setInterval(() => {
        validateComponentIntegration(components);
    }, 300000); // Check every 5 minutes

    context.subscriptions.push({
        dispose: () => {
            clearInterval(healthCheckInterval);
        }
    });

    console.log('FlowPilot: Component wiring completed successfully');
}

/**
 * Validate that all components are properly integrated and functioning
 */
function validateComponentIntegration(components: ComponentWiring): void {
    const {
        configurationManager,
        viewProvider,
        telemetry,
        safetyGuard,
        performanceMonitor
    } = components;

    try {
        // Validate configuration manager
        const configValidation = configurationManager.validateConfiguration();
        if (!configValidation.isValid && !configurationManager.isDemoModeEnabled()) {
            console.warn('FlowPilot: Configuration validation failed during health check');
        }

        // Validate view provider state
        const viewState = viewProvider.getState();
        if (viewState) {
            console.log(`FlowPilot: View provider healthy - ${viewState.history.length} items in history`);
        }

        // Validate safety guard
        safetyGuard.validateOperation('healthCheck', { type: 'integration-check' });

        // Validate performance monitor
        const perfStats = performanceMonitor.getStats();
        if (perfStats) {
            console.log('FlowPilot: Performance monitor healthy - tracking operations');
        }

        console.log('FlowPilot: Component integration health check passed');
    } catch (error) {
        console.error('FlowPilot: Component integration health check failed:', error);
        
        // Track integration issues in telemetry
        if (telemetry) {
            telemetry.trackError({
                errorType: 'integration-health-check',
                errorMessage: error instanceof Error ? error.message : 'Unknown integration error',
                component: 'extension-integration',
                userLevel: configurationManager.getUserLevel()
            });
        }
    }
}

/**
 * Show welcome message to new users
 */
async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
    const action = await vscode.window.showInformationMessage(
        'Welcome to FlowPilot! 🎓 Start learning by selecting Python code and using the context menu.',
        'Open Settings',
        'Got it'
    );

    if (action === 'Open Settings') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'codeCoach');
    }

    // Mark welcome as shown
    await context.globalState.update('hasShownWelcome', true);
}

/**
 * Register extension compatibility handlers
 * Requirements: 5.4 - Test integration with other extensions
 */
function registerExtensionCompatibilityHandlers(context: vscode.ExtensionContext): void {
    // Listen for other extensions that might affect diagnostics
    const diagnosticChangeListener = vscode.languages.onDidChangeDiagnostics(e => {
        // Handle diagnostic changes from other extensions gracefully
        // This ensures FlowPilot works well with linters, type checkers, etc.
        if (e.uris.length > 0) {
            console.log(`FlowPilot: Diagnostics changed for ${e.uris.length} files`);
            // Refresh confusion detector state if needed
            if (confusionDetector) {
                confusionDetector.handleDiagnosticChanges(e.uris);
            }
        }
    });
    
    context.subscriptions.push(diagnosticChangeListener);

    // Listen for active editor changes to ensure proper integration
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && configurationManager?.shouldActivateForDocument(editor.document)) {
            // Ensure FlowPilot is ready for the new Python file
            console.log('FlowPilot: Active editor changed to Python file');
        }
    });
    
    context.subscriptions.push(editorChangeListener);

    // Listen for workspace folder changes
    const workspaceChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        console.log('FlowPilot: Workspace folders changed');
        // Handle workspace changes gracefully
        if (configurationManager) {
            configurationManager.handleWorkspaceChange();
        }
    });
    
    context.subscriptions.push(workspaceChangeListener);
}

/**
 * Register diagnostic handlers for better VS Code integration
 * Requirements: 5.4 - Ensure compatibility with diagnostic systems
 */
function registerDiagnosticHandlers(context: vscode.ExtensionContext): void {
    // Monitor diagnostic collections to ensure we don't interfere with other tools
    const diagnosticCollections = new Map<string, vscode.DiagnosticCollection>();
    
    // Create our own diagnostic collection for any future use (currently read-only)
    const codeCoachDiagnostics = vscode.languages.createDiagnosticCollection('codeCoach');
    context.subscriptions.push(codeCoachDiagnostics);
    
    // Store reference for potential future use (ensuring we never modify existing diagnostics)
    diagnosticCollections.set('codeCoach', codeCoachDiagnostics);
    
    // Listen for text document changes to maintain diagnostic awareness
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(e => {
        // Only monitor Python files
        if (e.document.languageId === 'python') {
            // Reset confusion detector state when document changes
            if (confusionDetector) {
                confusionDetector.handleDocumentChange(e.document.uri);
            }
        }
    });
    
    context.subscriptions.push(documentChangeListener);
}
