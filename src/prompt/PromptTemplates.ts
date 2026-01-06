export class PromptTemplates {
    static getExplainTemplate() {
        return {
            id: 'explain-tutor-v1',
            version: '1.0.0',
            description: 'Explain as tutor: Overview, Line-by-line, Concepts, Pitfalls'
        };
    }

    static getReviewTemplate() {
        return {
            id: 'review-tutor-v1',
            version: '1.0.0',
            description: 'Review as tutor: Summary, Good points, Improvements, Diff'
        };
    }

    static getErrorTemplate() {
        return {
            id: 'error-tutor-v1',
            version: '1.0.0',
            description: 'Explain errors: Meaning, Why here, How to fix'
        };
    }

    static getTemplateForMode(mode: 'explain' | 'review' | 'error') {
        if (mode === 'explain') {return this.getExplainTemplate();}
        if (mode === 'review') {return this.getReviewTemplate();}
        return this.getErrorTemplate();
    }
}
