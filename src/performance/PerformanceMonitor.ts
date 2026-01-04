/**
 * Performance Monitor for FlowPilot extension
 * Ensures API calls don't block VS Code editor and monitors performance
 * Requirements: 5.5 - Maintain responsive performance and not block editor
 */

import * as vscode from 'vscode';

export interface PerformanceMetrics {
    operationName: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    errorMessage?: string;
}

export interface PerformanceThresholds {
    warning: number;  // milliseconds
    critical: number; // milliseconds
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor | undefined;
    private metrics: PerformanceMetrics[] = [];
    private activeOperations: Map<string, number> = new Map();
    private thresholds: PerformanceThresholds;
    private maxMetricsHistory: number = 100;

    private constructor() {
        this.thresholds = {
            warning: 2000,   // 2 seconds
            critical: 5000   // 5 seconds
        };
    }

    /**
     * Get singleton instance of PerformanceMonitor
     */
    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Start monitoring an operation
     * @param operationName Name of the operation being monitored
     * @returns Operation ID for tracking
     */
    public startOperation(operationName: string): string {
        const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now();
        
        this.activeOperations.set(operationId, startTime);
        
        console.log(`🚀 Performance Monitor: Started operation "${operationName}" (ID: ${operationId})`);
        
        return operationId;
    }

    /**
     * End monitoring an operation
     * @param operationId Operation ID returned from startOperation
     * @param success Whether the operation succeeded
     * @param errorMessage Optional error message if operation failed
     */
    public endOperation(operationId: string, success: boolean = true, errorMessage?: string): PerformanceMetrics | null {
        const startTime = this.activeOperations.get(operationId);
        if (!startTime) {
            console.warn(`⚠️ Performance Monitor: Unknown operation ID: ${operationId}`);
            return null;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        const operationName = operationId.split('-')[0] || 'unknown';

        const metrics: PerformanceMetrics = {
            operationName,
            startTime,
            endTime,
            duration,
            success,
            errorMessage
        };

        // Remove from active operations
        this.activeOperations.delete(operationId);

        // Store metrics
        this.addMetrics(metrics);

        // Check performance thresholds
        this.checkPerformanceThresholds(metrics);

        console.log(`✅ Performance Monitor: Completed operation "${operationName}" in ${duration.toFixed(2)}ms (Success: ${success})`);

        return metrics;
    }

    /**
     * Monitor an async operation with automatic timing
     * @param operationName Name of the operation
     * @param operation The async operation to monitor
     * @returns Promise with the operation result
     */
    public async monitorAsync<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
        const operationId = this.startOperation(operationName);
        
        try {
            // Ensure operation is truly async and doesn't block
            const result = await Promise.resolve(operation());
            this.endOperation(operationId, true);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.endOperation(operationId, false, errorMessage);
            throw error;
        }
    }

    /**
     * Monitor a synchronous operation with automatic timing
     * @param operationName Name of the operation
     * @param operation The synchronous operation to monitor
     * @returns The operation result
     */
    public monitorSync<T>(operationName: string, operation: () => T): T {
        const operationId = this.startOperation(operationName);
        
        try {
            const result = operation();
            this.endOperation(operationId, true);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.endOperation(operationId, false, errorMessage);
            throw error;
        }
    }

    /**
     * Ensure an operation is non-blocking by wrapping it in setImmediate
     * @param operationName Name of the operation
     * @param operation The operation to make non-blocking
     * @returns Promise with the operation result
     */
    public async ensureNonBlocking<T>(operationName: string, operation: () => T | Promise<T>): Promise<T> {
        return this.monitorAsync(operationName, () => {
            return new Promise<T>((resolve, reject) => {
                setImmediate(async () => {
                    try {
                        const result = await Promise.resolve(operation());
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        });
    }

    /**
     * Check if current operations are within performance thresholds
     */
    private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
        if (metrics.duration > this.thresholds.critical) {
            console.error(`🚨 Performance Monitor: CRITICAL - Operation "${metrics.operationName}" took ${metrics.duration.toFixed(2)}ms (threshold: ${this.thresholds.critical}ms)`);
            
            // Show user notification for critical performance issues
            vscode.window.showWarningMessage(
                `FlowPilot: Operation "${metrics.operationName}" is running slowly. This may affect VS Code performance.`
            );
        } else if (metrics.duration > this.thresholds.warning) {
            console.warn(`⚠️ Performance Monitor: WARNING - Operation "${metrics.operationName}" took ${metrics.duration.toFixed(2)}ms (threshold: ${this.thresholds.warning}ms)`);
        }
    }

    /**
     * Add metrics to history with size limit
     */
    private addMetrics(metrics: PerformanceMetrics): void {
        this.metrics.push(metrics);
        
        // Keep only the most recent metrics
        if (this.metrics.length > this.maxMetricsHistory) {
            this.metrics = this.metrics.slice(-this.maxMetricsHistory);
        }
    }

    /**
     * Get performance statistics
     */
    public getPerformanceStats(): PerformanceStats {
        if (this.metrics.length === 0) {
            return {
                totalOperations: 0,
                averageDuration: 0,
                successRate: 0,
                slowOperations: 0,
                activeOperations: this.activeOperations.size,
                recentMetrics: []
            };
        }

        const totalOperations = this.metrics.length;
        const successfulOperations = this.metrics.filter(m => m.success).length;
        const averageDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
        const slowOperations = this.metrics.filter(m => m.duration > this.thresholds.warning).length;
        const successRate = (successfulOperations / totalOperations) * 100;

        return {
            totalOperations,
            averageDuration,
            successRate,
            slowOperations,
            activeOperations: this.activeOperations.size,
            recentMetrics: this.metrics.slice(-10) // Last 10 operations
        };
    }

    /**
     * Get basic performance statistics (alias for getPerformanceStats)
     */
    public getStats(): PerformanceStats {
        return this.getPerformanceStats();
    }

    /**
     * Get metrics for a specific operation type
     */
    public getOperationMetrics(operationName: string): PerformanceMetrics[] {
        return this.metrics.filter(m => m.operationName === operationName);
    }

    /**
     * Check if VS Code is currently responsive
     */
    public async checkEditorResponsiveness(): Promise<boolean> {
        const startTime = performance.now();
        
        try {
            // Test VS Code responsiveness by executing a simple command
            await vscode.commands.executeCommand('workbench.action.ping');
            const duration = performance.now() - startTime;
            
            // If the ping takes too long, VS Code might be blocked
            const isResponsive = duration < 100; // 100ms threshold
            
            if (!isResponsive) {
                console.warn(`⚠️ Performance Monitor: VS Code responsiveness check took ${duration.toFixed(2)}ms`);
            }
            
            return isResponsive;
        } catch (error) {
            console.error('❌ Performance Monitor: VS Code responsiveness check failed:', error);
            return false;
        }
    }

    /**
     * Set custom performance thresholds
     */
    public setThresholds(thresholds: Partial<PerformanceThresholds>): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
        console.log('🔧 Performance Monitor: Updated thresholds:', this.thresholds);
    }

    /**
     * Clear all metrics history
     */
    public clearMetrics(): void {
        this.metrics = [];
        console.log('🧹 Performance Monitor: Cleared metrics history');
    }

    /**
     * Get currently active operations
     */
    public getActiveOperations(): string[] {
        return Array.from(this.activeOperations.keys());
    }

    /**
     * Force timeout for long-running operations
     */
    public async withTimeout<T>(
        operationName: string,
        operation: () => Promise<T>,
        timeoutMs: number = 30000
    ): Promise<T> {
        return this.monitorAsync(operationName, () => {
            return Promise.race([
                operation(),
                new Promise<never>((_, reject) => {
                    setTimeout(() => {
                        reject(new Error(`Operation "${operationName}" timed out after ${timeoutMs}ms`));
                    }, timeoutMs);
                })
            ]);
        });
    }

    /**
     * Dispose of performance monitor resources
     */
    public dispose(): void {
        this.metrics = [];
        this.activeOperations.clear();
        PerformanceMonitor.instance = undefined;
        console.log('🗑️ Performance Monitor: Disposed');
    }
}

/**
 * Interface for performance statistics
 */
export interface PerformanceStats {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    slowOperations: number;
    activeOperations: number;
    recentMetrics: PerformanceMetrics[];
}

/**
 * Decorator to automatically monitor method performance
 */
export function MonitorPerformance(operationName?: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const methodName = operationName || `${target.constructor.name}.${propertyName}`;
        
        descriptor.value = async function (...args: any[]) {
            const monitor = PerformanceMonitor.getInstance();
            
            if (originalMethod.constructor.name === 'AsyncFunction') {
                // Async method
                return monitor.monitorAsync(methodName, () => originalMethod.apply(this, args));
            } else {
                // Sync method
                return monitor.monitorSync(methodName, () => originalMethod.apply(this, args));
            }
        };
        
        return descriptor;
    };
}

/**
 * Utility function to create a non-blocking wrapper for any function
 */
export function makeNonBlocking<T extends (...args: any[]) => any>(
    fn: T,
    operationName: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    const monitor = PerformanceMonitor.getInstance();
    
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        return monitor.ensureNonBlocking(operationName, () => fn(...args));
    };
}