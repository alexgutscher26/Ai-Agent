/**
 * Property-based tests for extension activation
 * Feature: code-coach-vscode, Property 3: Python-Only Activation
 */

import * as fc from 'fast-check';
import { ConfigurationManager } from '../../config/ConfigurationManager';

// Mock VS Code API
const mockContext = {
    subscriptions: [],
    globalState: {
        get: jest.fn(),
        update: jest.fn()
    },
    workspaceState: {
        get: jest.fn(),
        update: jest.fn()
    }
} as any;

const mockDocument = {
    languageId: '',
    uri: { fsPath: '' },
    fileName: ''
} as any;

describe('Extension Activation Properties', () => {
    let configManager: ConfigurationManager;

    beforeEach(() => {
        jest.clearAllMocks();
        configManager = new ConfigurationManager(mockContext);
    });

    afterEach(() => {
        configManager.dispose();
    });

    // Feature: code-coach-vscode, Property 3: Python-Only Activation
    test('Property 3: Extension should only activate for Python files', () => {
        fc.assert(fc.property(
            // Generate various file types and language IDs
            fc.record({
                languageId: fc.oneof(
                    fc.constant('python'),
                    fc.constant('javascript'),
                    fc.constant('typescript'),
                    fc.constant('java'),
                    fc.constant('cpp'),
                    fc.constant('csharp'),
                    fc.constant('go'),
                    fc.constant('rust'),
                    fc.constant('php'),
                    fc.constant('ruby'),
                    fc.constant('plaintext'),
                    fc.constant('markdown'),
                    fc.constant('json'),
                    fc.constant('xml'),
                    fc.constant('html'),
                    fc.constant('css')
                ),
                fileName: fc.oneof(
                    fc.constant('test.py'),
                    fc.constant('main.js'),
                    fc.constant('app.ts'),
                    fc.constant('Main.java'),
                    fc.constant('program.cpp'),
                    fc.constant('script.cs'),
                    fc.constant('server.go'),
                    fc.constant('lib.rs'),
                    fc.constant('index.php'),
                    fc.constant('app.rb'),
                    fc.constant('readme.txt'),
                    fc.constant('README.md'),
                    fc.constant('config.json'),
                    fc.constant('data.xml'),
                    fc.constant('index.html'),
                    fc.constant('styles.css')
                )
            }),
            (fileInfo) => {
                // Create mock document with the generated language ID
                const testDocument = {
                    ...mockDocument,
                    languageId: fileInfo.languageId,
                    fileName: fileInfo.fileName
                };

                // Test activation decision
                const shouldActivate = configManager.shouldActivateForDocument(testDocument);

                // Property: Extension should only activate for Python files
                if (fileInfo.languageId === 'python') {
                    expect(shouldActivate).toBe(true);
                } else {
                    expect(shouldActivate).toBe(false);
                }

                // Additional validation: Python files should always activate regardless of filename
                if (fileInfo.languageId === 'python') {
                    expect(shouldActivate).toBe(true);
                }

                // Non-Python files should never activate regardless of filename
                if (fileInfo.languageId !== 'python') {
                    expect(shouldActivate).toBe(false);
                }
            }
        ), { numRuns: 100 });
    });

    test('Property 3: Python file activation should be consistent regardless of file path', () => {
        fc.assert(fc.property(
            // Generate various Python file paths
            fc.record({
                filePath: fc.oneof(
                    fc.constant('/home/user/project/main.py'),
                    fc.constant('C:\\Users\\dev\\code\\script.py'),
                    fc.constant('./src/utils/helper.py'),
                    fc.constant('../tests/test_module.py'),
                    fc.constant('/tmp/temp_script.py'),
                    fc.constant('~/Documents/learning/example.py'),
                    fc.constant('project/subdir/deep/nested/file.py'),
                    fc.constant('single.py'),
                    fc.constant('file-with-dashes.py'),
                    fc.constant('file_with_underscores.py'),
                    fc.constant('FileWithCamelCase.py'),
                    fc.constant('123numeric.py'),
                    fc.constant('special@chars$.py')
                ),
                languageId: fc.constant('python')
            }),
            (pythonFile) => {
                // Create mock document for Python file
                const testDocument = {
                    ...mockDocument,
                    languageId: pythonFile.languageId,
                    fileName: pythonFile.filePath,
                    uri: { fsPath: pythonFile.filePath }
                };

                // Test activation decision
                const shouldActivate = configManager.shouldActivateForDocument(testDocument);

                // Property: All Python files should activate regardless of path
                expect(shouldActivate).toBe(true);

                // Verify language ID is the determining factor, not file path
                expect(testDocument.languageId).toBe('python');
            }
        ), { numRuns: 100 });
    });

    test('Property 3: Non-Python files should never activate regardless of filename extension', () => {
        fc.assert(fc.property(
            // Generate non-Python files with various extensions
            fc.record({
                languageId: fc.oneof(
                    fc.constant('javascript'),
                    fc.constant('typescript'),
                    fc.constant('java'),
                    fc.constant('plaintext')
                ),
                fileName: fc.oneof(
                    // Files that might look like Python but aren't
                    fc.constant('not_python.py.txt'),
                    fc.constant('python_like.js'),
                    fc.constant('script.py.bak'),
                    fc.constant('fake.py.old'),
                    fc.constant('python.java'),
                    fc.constant('test.py.disabled')
                )
            }),
            (nonPythonFile) => {
                // Create mock document for non-Python file
                const testDocument = {
                    ...mockDocument,
                    languageId: nonPythonFile.languageId,
                    fileName: nonPythonFile.fileName
                };

                // Test activation decision
                const shouldActivate = configManager.shouldActivateForDocument(testDocument);

                // Property: Non-Python files should never activate
                expect(shouldActivate).toBe(false);

                // Verify language ID is the determining factor, not filename
                expect(testDocument.languageId).not.toBe('python');
            }
        ), { numRuns: 100 });
    });

    test('Property 3: Activation decision should be deterministic for same input', () => {
        fc.assert(fc.property(
            // Generate document properties
            fc.record({
                languageId: fc.oneof(
                    fc.constant('python'),
                    fc.constant('javascript'),
                    fc.constant('typescript')
                ),
                fileName: fc.string({ minLength: 1, maxLength: 50 })
            }),
            (docProps) => {
                // Create identical documents
                const document1 = {
                    ...mockDocument,
                    languageId: docProps.languageId,
                    fileName: docProps.fileName
                };

                const document2 = {
                    ...mockDocument,
                    languageId: docProps.languageId,
                    fileName: docProps.fileName
                };

                // Test activation decision for both
                const result1 = configManager.shouldActivateForDocument(document1);
                const result2 = configManager.shouldActivateForDocument(document2);

                // Property: Same input should always produce same result
                expect(result1).toBe(result2);

                // Property: Result should be based on language ID
                const expectedResult = docProps.languageId === 'python';
                expect(result1).toBe(expectedResult);
                expect(result2).toBe(expectedResult);
            }
        ), { numRuns: 100 });
    });
});