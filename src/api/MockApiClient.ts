/**
 * Mock API Client for demo mode
 * Provides realistic responses without requiring a real API key
 */

import {
    ExplainRequest,
    ReviewRequest,
    ErrorRequest,
    ExplanationResponse,
    ReviewResponse,
    ErrorResponse,
    TelemetryEvent
} from '../types';
import { ApiClient } from './CodeCoachApiClient';

export class MockApiClient implements ApiClient {
    private userLevel: 'beginner' | 'intermediate';

    constructor(userLevel: 'beginner' | 'intermediate' = 'beginner') {
        this.userLevel = userLevel;
    }

    /**
     * Mock explanation for selected code
     */
    async explainSelection(request: ExplainRequest): Promise<ExplanationResponse> {
        // Simulate API delay
        await this.delay(800 + Math.random() * 400);

        const lines = request.code.split('\n');
        const lineExplanations = lines.map((line, index) => ({
            lineOffset: index,
            code: line,
            explanation: this.generateLineExplanation(line, this.userLevel)
        }));

        return {
            type: 'explain',
            summary: this.generateSummary(request.code, this.userLevel),
            lineByLine: lineExplanations,
            pitfalls: this.generatePitfalls(request.code),
            tryItYourself: this.generateTryItYourself(request.code),
            relatedConcepts: this.generateRelatedConcepts(request.code)
        };
    }

    /**
     * Mock code review
     */
    async reviewSelection(request: ReviewRequest): Promise<ReviewResponse> {
        // Simulate API delay
        await this.delay(1000 + Math.random() * 500);

        return {
            type: 'review',
            summary: this.generateReviewSummary(request.code, this.userLevel),
            goodPoints: this.generateGoodPoints(request.code),
            improvementPoints: this.generateImprovementPoints(request.code),
            improvements: this.generateImprovements(request.code),
            tryItYourself: this.generateReviewExercise(request.code)
        };
    }

    /**
     * Mock error explanation
     */
    async explainError(request: ErrorRequest): Promise<ErrorResponse> {
        // Simulate API delay
        await this.delay(600 + Math.random() * 300);

        return {
            type: 'error',
            errorMeaning: this.generateErrorMeaning(request.errorMessage, this.userLevel),
            whyHere: this.generateWhyHere(request.errorMessage, request.code),
            howToFix: this.generateHowToFix(request.errorMessage, request.code, this.userLevel),
            relatedConcepts: this.generateErrorConcepts(request.errorMessage),
            tryItYourself: this.generateErrorExercise(request.errorMessage)
        };
    }

    /**
     * Mock telemetry logging (no-op in demo mode)
     */
    async logEvent(event: TelemetryEvent): Promise<void> {
        // In demo mode, just log to console for debugging
        console.log('[Demo Mode] Telemetry event:', event.type, event.metadata);
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
     * Update configuration (for compatibility)
     */
    updateConfig(config: any): void {
        this.userLevel = config.userLevel || 'beginner';
    }

    // Private helper methods for generating realistic responses

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private generateLineExplanation(line: string, userLevel: 'beginner' | 'intermediate'): string {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
            return 'Empty line for readability';
        }

        // Common Python patterns
        if (trimmedLine.startsWith('def ')) {
            return userLevel === 'beginner' 
                ? 'This line defines a new function. Functions are reusable blocks of code that perform specific tasks.'
                : 'Function definition using the def keyword. This creates a callable object in the current namespace.';
        }
        
        if (trimmedLine.startsWith('class ')) {
            return userLevel === 'beginner'
                ? 'This line defines a new class. Classes are blueprints for creating objects with shared properties and methods.'
                : 'Class definition creating a new type. Classes encapsulate data and behavior in object-oriented programming.';
        }
        
        if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('from ')) {
            return userLevel === 'beginner'
                ? 'This line imports code from another module, making its functions and classes available in this file.'
                : 'Import statement bringing external modules into the current namespace for use.';
        }
        
        if (trimmedLine.startsWith('if ')) {
            return userLevel === 'beginner'
                ? 'This line starts a conditional statement. The code inside will only run if the condition is true.'
                : 'Conditional statement using if keyword. Executes the following block only when the condition evaluates to True.';
        }
        
        if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ')) {
            return userLevel === 'beginner'
                ? 'This line starts a loop. Loops repeat code multiple times, either for each item in a collection or while a condition is true.'
                : 'Loop construct for iteration. Repeats the following code block according to the specified iteration pattern.';
        }
        
        if (trimmedLine.startsWith('return ')) {
            return userLevel === 'beginner'
                ? 'This line returns a value from the function and ends the function execution.'
                : 'Return statement that exits the function and optionally passes a value back to the caller.';
        }
        
        if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
            return userLevel === 'beginner'
                ? 'This line assigns a value to a variable. Variables store data that can be used later in the program.'
                : 'Variable assignment using the assignment operator. Binds a value to a name in the current scope.';
        }
        
        if (trimmedLine.includes('print(')) {
            return userLevel === 'beginner'
                ? 'This line prints output to the console, showing information to the user.'
                : 'Print function call that outputs the given arguments to the standard output stream.';
        }

        // Default explanation
        return userLevel === 'beginner'
            ? 'This line executes a Python statement or expression.'
            : 'Python statement or expression execution.';
    }

    private generateSummary(code: string, userLevel: 'beginner' | 'intermediate'): string {
        const hasFunction = code.includes('def ');
        const hasClass = code.includes('class ');
        const hasLoop = code.includes('for ') || code.includes('while ');
        const hasConditional = code.includes('if ');

        if (userLevel === 'beginner') {
            if (hasClass) {
                return 'This code defines a class, which is like a blueprint for creating objects. Classes help organize related data and functions together.';
            } else if (hasFunction) {
                return 'This code defines a function, which is a reusable block of code that performs a specific task. Functions help keep code organized and avoid repetition.';
            } else if (hasLoop) {
                return 'This code uses a loop to repeat actions multiple times. Loops are essential for processing collections of data efficiently.';
            } else if (hasConditional) {
                return 'This code uses conditional statements to make decisions. It will execute different actions based on whether certain conditions are true or false.';
            } else {
                return 'This code performs a sequence of operations. Each line executes in order to accomplish the overall task.';
            }
        } else {
            if (hasClass) {
                return 'Object-oriented code defining a class with encapsulated data and methods. Demonstrates inheritance, polymorphism, or composition patterns.';
            } else if (hasFunction) {
                return 'Functional code block with defined input parameters and return values. Implements specific business logic or utility operations.';
            } else if (hasLoop) {
                return 'Iterative code structure for processing collections or repeated operations. Demonstrates control flow and data manipulation patterns.';
            } else if (hasConditional) {
                return 'Conditional logic implementing branching behavior based on runtime conditions. Shows decision-making patterns in program flow.';
            } else {
                return 'Sequential code execution implementing specific algorithmic steps or data transformations.';
            }
        }
    }

    private generatePitfalls(code: string): string[] {
        const pitfalls: string[] = [];
        
        if (code.includes('==') && code.includes('=')) {
            pitfalls.push('Be careful not to confuse assignment (=) with comparison (==)');
        }
        
        if (code.includes('input(')) {
            pitfalls.push('Remember that input() always returns a string - convert to numbers when needed');
        }
        
        if (code.includes('range(')) {
            pitfalls.push('Range excludes the end value - range(5) gives 0,1,2,3,4 not 1,2,3,4,5');
        }
        
        if (code.includes('append(') || code.includes('list')) {
            pitfalls.push('Lists are mutable - changes affect all references to the same list object');
        }

        return pitfalls.length > 0 ? pitfalls : ['Watch for proper indentation - Python uses whitespace to define code blocks'];
    }

    private generateTryItYourself(code: string): string {
        if (code.includes('def ')) {
            return 'Try calling this function with different arguments to see how it behaves. What happens with edge cases like empty inputs or very large numbers?';
        } else if (code.includes('class ')) {
            return 'Try creating instances of this class and calling its methods. Experiment with different attribute values to understand the behavior.';
        } else if (code.includes('for ') || code.includes('while ')) {
            return 'Try modifying the loop condition or range to see how it affects the output. What happens with an empty collection?';
        } else {
            return 'Try running this code step by step in a Python interpreter to see the intermediate values and understand the flow.';
        }
    }

    private generateRelatedConcepts(code: string): string[] {
        const concepts: string[] = [];
        
        if (code.includes('def ')) {concepts.push('Functions', 'Parameters', 'Return values', 'Scope');}
        if (code.includes('class ')) {concepts.push('Object-oriented programming', 'Inheritance', 'Methods', 'Attributes');}
        if (code.includes('for ') || code.includes('while ')) {concepts.push('Iteration', 'Collections', 'Control flow');}
        if (code.includes('if ')) {concepts.push('Boolean logic', 'Conditional statements', 'Comparison operators');}
        if (code.includes('import ')) {concepts.push('Modules', 'Packages', 'Namespaces');}
        
        return concepts.length > 0 ? concepts : ['Python syntax', 'Code structure', 'Best practices'];
    }

    private generateReviewSummary(code: string, userLevel: 'beginner' | 'intermediate'): string {
        if (userLevel === 'beginner') {
            return 'Your code works correctly! Here are some observations about what you did well and areas where you could improve to make your code even better.';
        } else {
            return 'Code analysis complete. The implementation is functional with several opportunities for optimization and adherence to Python best practices.';
        }
    }

    private generateGoodPoints(code: string): string[] {
        const points: string[] = [];
        
        if (code.includes('def ')) {
            points.push('Good use of functions to organize code');
        }
        
        if (code.match(/^\s*#/m)) {
            points.push('Nice job adding comments to explain your code');
        }
        
        if (code.includes('try:') || code.includes('except:')) {
            points.push('Excellent error handling with try/except blocks');
        }
        
        if (code.split('\n').some(line => line.trim().length > 0 && line.trim().length < 80)) {
            points.push('Code lines are appropriately sized and readable');
        }

        return points.length > 0 ? points : ['Your code successfully accomplishes its intended purpose'];
    }

    private generateImprovementPoints(code: string): string[] {
        const points: string[] = [];
        
        if (!code.match(/^\s*#/m)) {
            points.push('Consider adding comments to explain complex logic');
        }
        
        if (code.includes('print(') && !code.includes('def ')) {
            points.push('Consider using functions to organize your code better');
        }
        
        if (code.split('\n').some(line => line.length > 80)) {
            points.push('Some lines are quite long - consider breaking them up for readability');
        }
        
        if (code.includes('==') && code.includes('True')) {
            points.push('You can simplify "== True" comparisons by using the boolean value directly');
        }

        return points.length > 0 ? points : ['Your code follows good Python practices'];
    }

    private generateImprovements(code: string): Array<{description: string, improvedCode?: string, reasoning: string}> {
        const improvements = [];
        
        if (code.includes('== True')) {
            improvements.push({
                description: 'Simplify boolean comparisons',
                improvedCode: code.replace(/== True/g, ''),
                reasoning: 'Comparing to True is redundant since the expression already evaluates to a boolean'
            });
        }
        
        if (code.includes('range(len(')) {
            improvements.push({
                description: 'Use direct iteration instead of range(len())',
                improvedCode: 'for item in my_list:\n    # work with item directly',
                reasoning: 'Direct iteration is more Pythonic and less error-prone than using indices'
            });
        }

        return improvements.length > 0 ? improvements : [{
            description: 'Code structure looks good',
            reasoning: 'Your code follows Python best practices and is well-organized'
        }];
    }

    private generateReviewExercise(code: string): string {
        return 'Try refactoring this code to use different Python features or patterns. Can you make it more concise while maintaining readability?';
    }

    private generateErrorMeaning(errorMessage: string, userLevel: 'beginner' | 'intermediate'): string {
        if (errorMessage.includes('SyntaxError')) {
            return userLevel === 'beginner'
                ? 'A SyntaxError means Python cannot understand your code because it does not follow the correct Python grammar rules.'
                : 'SyntaxError indicates the code violates Python\'s grammatical rules and cannot be parsed by the interpreter.';
        }
        
        if (errorMessage.includes('NameError')) {
            return userLevel === 'beginner'
                ? 'A NameError means you are trying to use a variable or function name that Python does not recognize.'
                : 'NameError occurs when attempting to access a name that is not defined in the current scope or namespace.';
        }
        
        if (errorMessage.includes('TypeError')) {
            return userLevel === 'beginner'
                ? 'A TypeError means you are trying to use a value in a way that does not match its type (like adding a number to text).'
                : 'TypeError indicates an operation or function is applied to an object of inappropriate type.';
        }
        
        if (errorMessage.includes('IndentationError')) {
            return userLevel === 'beginner'
                ? 'An IndentationError means your code is not properly indented. Python uses indentation to group code blocks.'
                : 'IndentationError occurs when the indentation level does not match the expected block structure.';
        }

        return userLevel === 'beginner'
            ? 'This error means something in your code is not working as expected. Let\'s figure out what went wrong.'
            : 'Runtime error indicating an issue with code execution that needs to be resolved.';
    }

    private generateWhyHere(errorMessage: string, code: string): string {
        if (errorMessage.includes('SyntaxError')) {
            return 'This happened because there is a mistake in how the code is written - perhaps a missing colon, parenthesis, or incorrect indentation.';
        }
        
        if (errorMessage.includes('NameError')) {
            return 'This happened because you are using a variable or function name before defining it, or there might be a typo in the name.';
        }
        
        if (errorMessage.includes('TypeError')) {
            return 'This happened because you are trying to perform an operation between incompatible data types, like adding a string to a number.';
        }

        return 'This error occurred because of an issue in how the code is structured or the values being used.';
    }

    private generateHowToFix(errorMessage: string, code: string, userLevel: 'beginner' | 'intermediate'): string {
        if (errorMessage.includes('SyntaxError')) {
            return userLevel === 'beginner'
                ? 'Check for missing colons after if/for/def statements, make sure parentheses and quotes are balanced, and verify your indentation is consistent.'
                : 'Review the syntax around the error location for missing punctuation, unbalanced delimiters, or incorrect keyword usage.';
        }
        
        if (errorMessage.includes('NameError')) {
            return userLevel === 'beginner'
                ? 'Make sure you have defined the variable before using it, check for typos in variable names, and ensure you are in the right scope.'
                : 'Verify the name is defined in the current scope, check for typos, and ensure proper import statements for external modules.';
        }
        
        if (errorMessage.includes('TypeError')) {
            return userLevel === 'beginner'
                ? 'Check the types of your variables and convert them if needed (like using int() or str()), or make sure you are using the right operation for the data type.'
                : 'Verify data types are compatible for the operation, add type conversion where necessary, or implement appropriate type checking.';
        }

        return userLevel === 'beginner'
            ? 'Read the error message carefully, check the line number mentioned, and look for common issues like typos or missing punctuation.'
            : 'Analyze the error traceback, verify the problematic line, and apply appropriate debugging techniques to resolve the issue.';
    }

    private generateErrorConcepts(errorMessage: string): string[] {
        if (errorMessage.includes('SyntaxError')) {
            return ['Python syntax', 'Code structure', 'Indentation', 'Punctuation'];
        }
        
        if (errorMessage.includes('NameError')) {
            return ['Variable scope', 'Variable declaration', 'Namespaces', 'Import statements'];
        }
        
        if (errorMessage.includes('TypeError')) {
            return ['Data types', 'Type conversion', 'Type checking', 'Operations'];
        }

        return ['Debugging', 'Error handling', 'Code testing', 'Python fundamentals'];
    }

    private generateErrorExercise(errorMessage: string): string {
        return 'Try creating a simple test case that reproduces this error, then fix it step by step. This will help you recognize and avoid similar errors in the future.';
    }
}
