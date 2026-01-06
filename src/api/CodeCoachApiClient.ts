/**
 * API Client for communicating with the FlowPilot backend service
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as vscode from 'vscode';
import {
    ExplainRequest,
    ReviewRequest,
    ErrorRequest,
    ExplanationResponse,
    ReviewResponse,
    ErrorResponse,
    TelemetryEvent,
    CodeCoachConfig
} from '../types';

export interface ApiClient {
    explainSelection(request: ExplainRequest): Promise<ExplanationResponse>;
    reviewSelection(request: ReviewRequest): Promise<ReviewResponse>;
    explainError(request: ErrorRequest): Promise<ErrorResponse>;
    logEvent(event: TelemetryEvent): Promise<void>;
    runCoach(
        mode: 'explain' | 'review' | 'error',
        request: ExplainRequest | ReviewRequest | ErrorRequest
    ): Promise<ExplanationResponse | ReviewResponse | ErrorResponse>;
}

interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    retryableStatusCodes: number[];
}

export class CodeCoachApiClient implements ApiClient {
    private httpClient: AxiosInstance;
    private config: CodeCoachConfig;
    private retryConfig: RetryConfig;

    constructor(config: CodeCoachConfig) {
        this.config = { ...config, strictValidation: config.strictValidation ?? true };
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000, // 1 second
            maxDelay: 10000, // 10 seconds
            retryableStatusCodes: [408, 429, 500, 502, 503, 504]
        };

        this.httpClient = axios.create({
            baseURL: config.apiBaseUrl,
            timeout: 30000, // 30 second timeout
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'User-Agent': 'CodeCoach-VSCode/0.1.0'
            }
        });

        // Add request interceptor to include user level in all requests
        this.httpClient.interceptors.request.use((config) => {
            if (config.data && typeof config.data === 'object') {
                config.data.userLevel = this.config.userLevel;
            }
            return config;
        });

        // Add response interceptor for global error handling
        this.httpClient.interceptors.response.use(
            (response) => response,
            (error) => {
                // Log error for debugging (without sensitive data)
                console.warn('API request failed:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    message: error.message
                });
                return Promise.reject(error);
            }
        );
    }

    /**
     * Explains selected code by sending it to the backend API
     */
    async explainSelection(request: ExplainRequest): Promise<ExplanationResponse> {
        return this.executeWithRetry(async () => {
            const response: AxiosResponse<any> = await this.httpClient.post(
                '/api/v1/explain',
                {
                    ...request,
                    userLevel: this.config.userLevel
                }
            );
            try {
                this.validateExplanationResponse(response.data);
                return response.data as ExplanationResponse;
            } catch (e: any) {
                if (this.config.strictValidation) {
                    throw e instanceof Error ? e : new Error('Invalid explanation response format');
                }
                return this.buildFallbackExplanation(response.data);
            }
        }, 'explainSelection');
    }

    /**
     * Reviews selected code for quality and style improvements
     */
    async reviewSelection(request: ReviewRequest): Promise<ReviewResponse> {
        return this.executeWithRetry(async () => {
            const response: AxiosResponse<any> = await this.httpClient.post(
                '/api/v1/review',
                {
                    ...request,
                    userLevel: this.config.userLevel
                }
            );
            try {
                this.validateReviewResponse(response.data);
                return response.data as ReviewResponse;
            } catch (e: any) {
                if (this.config.strictValidation) {
                    throw e instanceof Error ? e : new Error('Invalid review response format');
                }
                return this.buildFallbackReview(response.data);
            }
        }, 'reviewSelection');
    }

    /**
     * Explains errors and diagnostics in the code
     */
    async explainError(request: ErrorRequest): Promise<ErrorResponse> {
        return this.executeWithRetry(async () => {
            // Convert VS Code Range to serializable format
            const serializedRequest = {
                ...request,
                errorRange: {
                    start: {
                        line: request.errorRange.start.line,
                        character: request.errorRange.start.character
                    },
                    end: {
                        line: request.errorRange.end.line,
                        character: request.errorRange.end.character
                    }
                },
                userLevel: this.config.userLevel
            };
            const response: AxiosResponse<any> = await this.httpClient.post(
                '/api/v1/explain-error',
                serializedRequest
            );
            try {
                this.validateErrorResponse(response.data);
                return response.data as ErrorResponse;
            } catch (e: any) {
                if (this.config.strictValidation) {
                    throw e instanceof Error ? e : new Error('Invalid error response format');
                }
                return this.buildFallbackError(response.data);
            }
        }, 'explainError');
    }

    /**
     * Logs telemetry events to the backend (if telemetry is enabled)
     */
    async logEvent(event: TelemetryEvent): Promise<void> {
        if (!this.config.telemetryEnabled) {
            return; // Skip if telemetry is disabled
        }

        try {
            // Telemetry should not use retry logic to avoid blocking user experience
            await this.httpClient.post('/api/v1/telemetry', event);
        } catch (error) {
            // Telemetry failures should not affect user experience
            // Log error but don't throw
            console.warn('Failed to send telemetry event:', this.sanitizeErrorForLogging(error));
        }
    }

    async runCoach(
        mode: 'explain' | 'review' | 'error',
        request: ExplainRequest | ReviewRequest | ErrorRequest
    ): Promise<ExplanationResponse | ReviewResponse | ErrorResponse> {
        if (mode === 'explain') {
            return this.explainSelection(request as ExplainRequest);
        }
        if (mode === 'review') {
            return this.reviewSelection(request as ReviewRequest);
        }
        return this.explainError(request as ErrorRequest);
    }

    /**
     * Executes an API request with retry logic for transient failures
     */
    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        let lastError: any;
        
        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Don't retry on the last attempt
                if (attempt === this.retryConfig.maxRetries) {
                    break;
                }

                // Check if error is retryable
                if (!this.isRetryableError(error)) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(2, attempt),
                    this.retryConfig.maxDelay
                );

                console.warn(`API request failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}), retrying in ${delay}ms:`, {
                    operation: operationName,
                    error: this.sanitizeErrorForLogging(error)
                });

                // Wait before retrying
                await this.delay(delay);
            }
        }

        // All retries exhausted, throw the last error
        throw this.handleApiError(lastError, operationName);
    }

    /**
     * Determines if an error is retryable based on error type and status code
     */
    private isRetryableError(error: any): boolean {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            
            // Network errors are retryable
            if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNRESET') {
                return true;
            }

            // Check status codes
            if (axiosError.response?.status) {
                return this.retryConfig.retryableStatusCodes.includes(axiosError.response.status);
            }

            // No response means network error, which is retryable
            if (!axiosError.response) {
                return true;
            }
        }

        return false;
    }

    /**
     * Creates a delay for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Sanitizes error information for logging (removes sensitive data)
     */
    private sanitizeErrorForLogging(error: any): any {
        if (axios.isAxiosError(error)) {
            return {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                method: error.config?.method
                // Explicitly exclude headers, data, and other potentially sensitive info
            };
        }

        return {
            message: error.message || 'Unknown error',
            name: error.name
        };
    }

    /**
     * Updates the configuration and recreates the HTTP client if needed
     */
    updateConfig(newConfig: CodeCoachConfig): void {
        const needsNewClient = 
            newConfig.apiBaseUrl !== this.config.apiBaseUrl ||
            newConfig.apiKey !== this.config.apiKey;

        this.config = newConfig;

        if (needsNewClient) {
            this.httpClient = axios.create({
                baseURL: newConfig.apiBaseUrl,
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newConfig.apiKey}`,
                    'User-Agent': 'CodeCoach-VSCode/0.1.0'
                }
            });

            // Re-add request interceptor
            this.httpClient.interceptors.request.use((config) => {
                if (config.data && typeof config.data === 'object') {
                    config.data.userLevel = this.config.userLevel;
                }
                return config;
            });
        }
    }

    /**
     * Validates explanation response structure with detailed error messages
     */
    private validateExplanationResponse(response: any): asserts response is ExplanationResponse {
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format: Expected a valid explanation object from the server.');
        }

        if (response.type !== 'explain') {
            throw new Error(`Invalid response type: Expected 'explain' response, but received '${response.type}'. This may indicate a server configuration issue.`);
        }

        if (typeof response.summary !== 'string') {
            throw new Error('Invalid response format: Explanation summary is missing or invalid. The server may have returned incomplete data.');
        }

        if (!Array.isArray(response.lineByLine)) {
            throw new Error('Invalid response format: Line-by-line explanations are missing or invalid. The server may have returned incomplete data.');
        }

        // Validate each line explanation with detailed error context
        for (let i = 0; i < response.lineByLine.length; i++) {
            const line = response.lineByLine[i];
            if (typeof line.lineOffset !== 'number' ||
                typeof line.code !== 'string' ||
                typeof line.explanation !== 'string') {
                throw new Error(`Invalid line explanation format at index ${i}: Each line explanation must have lineOffset (number), code (string), and explanation (string).`);
            }
        }

        // Validate optional fields if present
        if (response.pitfalls !== undefined && !Array.isArray(response.pitfalls)) {
            throw new Error('Invalid response format: Pitfalls field must be an array if provided.');
        }

        if (response.tryItYourself !== undefined && typeof response.tryItYourself !== 'string') {
            throw new Error('Invalid response format: TryItYourself field must be a string if provided.');
        }
    }

    /**
     * Validates review response structure with detailed error messages
     */
    private validateReviewResponse(response: any): asserts response is ReviewResponse {
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format: Expected a valid review object from the server.');
        }

        if (response.type !== 'review') {
            throw new Error(`Invalid response type: Expected 'review' response, but received '${response.type}'. This may indicate a server configuration issue.`);
        }

        if (typeof response.summary !== 'string') {
            throw new Error('Invalid response format: Review summary is missing or invalid. The server may have returned incomplete data.');
        }

        if (!Array.isArray(response.goodPoints)) {
            throw new Error('Invalid response format: Good points are missing or invalid. The server may have returned incomplete data.');
        }

        if (!Array.isArray(response.improvementPoints)) {
            throw new Error('Invalid response format: Improvement points are missing or invalid. The server may have returned incomplete data.');
        }

        if (!Array.isArray(response.improvements)) {
            throw new Error('Invalid response format: Improvements are missing or invalid. The server may have returned incomplete data.');
        }

        // Validate improvement objects
        for (let i = 0; i < response.improvements.length; i++) {
            const improvement = response.improvements[i];
            if (typeof improvement.description !== 'string' ||
                typeof improvement.reasoning !== 'string') {
                throw new Error(`Invalid improvement format at index ${i}: Each improvement must have description (string) and reasoning (string).`);
            }
        }
    }

    /**
     * Validates error response structure with detailed error messages
     */
    private validateErrorResponse(response: any): asserts response is ErrorResponse {
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format: Expected a valid error explanation object from the server.');
        }

        if (response.type !== 'error') {
            throw new Error(`Invalid response type: Expected 'error' response, but received '${response.type}'. This may indicate a server configuration issue.`);
        }

        if (typeof response.errorMeaning !== 'string' ||
            typeof response.whyHere !== 'string' ||
            typeof response.howToFix !== 'string') {
            throw new Error('Invalid error response format: Missing required fields (errorMeaning, whyHere, howToFix). The server may have returned incomplete data.');
        }

        // Validate optional fields if present
        if (response.relatedConcepts !== undefined && !Array.isArray(response.relatedConcepts)) {
            throw new Error('Invalid response format: Related concepts field must be an array if provided.');
        }

        if (response.tryItYourself !== undefined && typeof response.tryItYourself !== 'string') {
            throw new Error('Invalid response format: TryItYourself field must be a string if provided.');
        }
    }

    private buildFallbackExplanation(raw: any): ExplanationResponse {
        const text = this.safeStringify(raw);
        return {
            type: 'explain',
            summary: text.substring(0, 2000),
            lineByLine: [],
            pitfalls: [],
            tryItYourself: undefined,
            relatedConcepts: []
        };
    }

    private buildFallbackReview(raw: any): ReviewResponse {
        const text = this.safeStringify(raw);
        return {
            type: 'review',
            summary: text.substring(0, 2000),
            goodPoints: [],
            improvementPoints: [],
            improvements: []
        };
    }

    private buildFallbackError(raw: any): ErrorResponse {
        const text = this.safeStringify(raw);
        return {
            type: 'error',
            errorMeaning: text.substring(0, 2000),
            whyHere: 'Unable to parse server response into expected schema.',
            howToFix: 'Review the message above. If this persists, try again later.'
        };
    }

    private safeStringify(value: any): string {
        if (typeof value === 'string') {return value;}
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return 'Unstructured response received from server.';
        }
    }

    /**
     * Handles API errors and converts them to user-friendly messages
     */
    private handleApiError(error: any, operation: string): Error {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            
            if (axiosError.code === 'ECONNABORTED') {
                return new Error(`Request timeout: The ${operation} operation took too long to complete. Please check your internet connection and try again.`);
            }

            if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNRESET') {
                return new Error(`Network error: Unable to connect to FlowPilot service. Please check your internet connection and API endpoint configuration.`);
            }

            if (axiosError.response) {
                // Server responded with error status
                const status = axiosError.response.status;
                const data = axiosError.response.data;

                switch (status) {
                    case 400:
                        const badRequestMessage = (data as any)?.message || 'Invalid request format';
                        return new Error(`Bad request: ${badRequestMessage}. Please check your code selection and try again.`);
                    case 401:
                        return new Error('Authentication failed: Please check your API key in FlowPilot settings.');
                    case 403:
                        return new Error('Access denied: Your API key may not have permission for this operation, or you may have exceeded your usage quota.');
                    case 404:
                        return new Error('Service not found: The FlowPilot API endpoint may be incorrect. Please check your settings.');
                    case 413:
                        return new Error('Request too large: The selected code is too large to process. Please select a smaller code snippet.');
                    case 429:
                        return new Error('Rate limit exceeded: You are making requests too quickly. Please wait a moment before trying again.');
                    case 500:
                        return new Error('Server error: The FlowPilot service is experiencing issues. Please try again in a few minutes.');
                    case 502:
                    case 503:
                    case 504:
                        return new Error('Service unavailable: The FlowPilot service is temporarily unavailable. Please try again later.');
                    default:
                        const message = (data as any)?.message || (data as any)?.error || `HTTP ${status} error`;
                        return new Error(`API error: ${message}. If this problem persists, please check the FlowPilot service status.`);
                }
            } else if (axiosError.request) {
                // Network error - no response received
                return new Error('Network error: Unable to connect to FlowPilot service. Please check your internet connection and firewall settings.');
            }
        }

        // Unknown error - provide fallback behavior guidance
        const errorMessage = error.message || 'Unknown error occurred';
        return new Error(`Unexpected error during ${operation}: ${errorMessage}. Please try again, and if the problem persists, consider restarting VS Code.`);
    }

    /**
     * Provides fallback explanation when API is unavailable
     */
    private getFallbackExplanation(operation: string): any {
        const fallbackMessages = {
            explainSelection: {
                type: 'explain',
                summary: 'FlowPilot is currently unavailable. Please check your internet connection and API configuration.',
                lineByLine: [],
                pitfalls: ['Unable to analyze code due to service unavailability'],
                tryItYourself: 'Please try again when the service is available.'
            },
            reviewSelection: {
                type: 'review',
                summary: 'FlowPilot is currently unavailable. Please check your internet connection and API configuration.',
                goodPoints: [],
                improvementPoints: ['Unable to review code due to service unavailability'],
                improvements: []
            },
            explainError: {
                type: 'error',
                errorMeaning: 'FlowPilot is currently unavailable.',
                whyHere: 'Unable to analyze error due to service unavailability.',
                howToFix: 'Please check your internet connection and API configuration, then try again.'
            }
        };

        return fallbackMessages[operation as keyof typeof fallbackMessages] || null;
    }
}

/**
 * Factory function to create API client from VS Code configuration
 */
export function createApiClient(): CodeCoachApiClient {
    const config = vscode.workspace.getConfiguration('codeCoach');
    
    const clientConfig: CodeCoachConfig = {
        enabled: config.get<boolean>('enabled', true),
        apiBaseUrl: config.get<string>('apiBaseUrl', 'https://api.codecoach.dev'),
        apiKey: config.get<string>('apiKey', ''),
        telemetryEnabled: config.get<boolean>('telemetryEnabled', true),
        userLevel: config.get<'beginner' | 'intermediate'>('userLevel', 'beginner'),
        proactiveSuggestions: config.get<boolean>('proactiveSuggestions', true),
        demoMode: config.get<boolean>('demoMode', false),
        strictValidation: config.get<boolean>('strictValidation', false)
    };

    return new CodeCoachApiClient(clientConfig);
}
