// Main script for the FlowPilot webview panel

// Get VS Code API
const vscode = acquireVsCodeApi();

// State management
let currentExplanation: any = null;
let feedbackSubmitted = false;

// Initialize the webview
document.addEventListener('DOMContentLoaded', () => {
    console.log('FlowPilot webview loaded');
    
    // Initialize theme detection and monitoring
    initializeThemeDetection();
    
    // Initialize animation system
    initializeAnimationSystem();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Send ready message to extension
    vscode.postMessage({
        type: 'ready'
    });
});

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
        case 'update':
            updateContentWithAnimation(message.data);
            break;
        case 'error':
            showError(message.data);
            break;
        case 'clear':
            clearContentWithAnimation();
            break;
    }
});

function clearContent() {
    // Show welcome message and hide explanation content
    const welcomeElement = document.getElementById('welcome');
    const explanationElement = document.getElementById('explanation');
    
    if (welcomeElement) {
        welcomeElement.style.display = 'block';
    }
    
    if (explanationElement) {
        explanationElement.style.display = 'none';
    }

    currentExplanation = null;
    feedbackSubmitted = false;
}

function clearContentWithAnimation() {
    const welcomeElement = document.getElementById('welcome');
    const explanationElement = document.getElementById('explanation');
    
    if (explanationElement && explanationElement.style.display !== 'none') {
        // Animate out the explanation content
        animateContentExit(explanationElement, () => {
            explanationElement.style.display = 'none';
            
            // Animate in the welcome message
            if (welcomeElement) {
                welcomeElement.style.display = 'block';
                animateContentEntry(welcomeElement, 'fade-in');
            }
        });
    } else if (welcomeElement) {
        // Just show welcome if explanation is already hidden
        welcomeElement.style.display = 'block';
        animateContentEntry(welcomeElement, 'fade-in');
    }

    currentExplanation = null;
    feedbackSubmitted = false;
}

function initializeEventListeners() {
    // Feedback button listeners
    const helpfulBtn = document.getElementById('helpful-btn');
    const notHelpfulBtn = document.getElementById('not-helpful-btn');
    const submitFeedbackBtn = document.getElementById('submit-feedback-btn');
    const cancelFeedbackBtn = document.getElementById('cancel-feedback-btn');

    if (helpfulBtn) {
        helpfulBtn.addEventListener('click', () => handleFeedbackClick(true));
    }

    if (notHelpfulBtn) {
        notHelpfulBtn.addEventListener('click', () => handleFeedbackClick(false));
    }

    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', submitFeedback);
    }

    if (cancelFeedbackBtn) {
        cancelFeedbackBtn.addEventListener('click', cancelFeedback);
    }
}

function updateContent(data: any) {
    console.log('Updating content:', data);
    currentExplanation = data;
    feedbackSubmitted = false;

    // Hide welcome message and show explanation content
    const welcomeElement = document.getElementById('welcome');
    const explanationElement = document.getElementById('explanation');
    
    if (welcomeElement) {
        welcomeElement.style.display = 'none';
    }
    
    if (explanationElement) {
        explanationElement.style.display = 'block';
    }

    // Update context header
    updateContextHeader(data);

    // Update content based on type
    switch (data.type) {
        case 'explain':
            renderExplanation(data);
            break;
        case 'review':
            renderReview(data);
            break;
        case 'error':
            renderError(data);
            break;
        default:
            console.warn('Unknown content type:', data.type);
    }

    // Reset feedback section
    resetFeedbackSection();
}

function updateContextHeader(data: any) {
    const operationTypeElement = document.getElementById('operation-type');
    const fileInfoElement = document.getElementById('file-info');

    if (operationTypeElement) {
        let operationText = '';
        switch (data.type) {
            case 'explain':
                operationText = '📖 Code Explanation';
                break;
            case 'review':
                operationText = '🔍 Code Review';
                break;
            case 'error':
                operationText = '🚨 Error Analysis';
                break;
        }
        operationTypeElement.textContent = operationText;
    }

    if (fileInfoElement) {
        // This would be populated with actual file info from the extension
        fileInfoElement.textContent = 'Python file';
    }
}

function renderExplanation(data: any) {
    // Show/hide relevant sections
    showSection('summary-section');
    showSection('line-by-line-section');
    hideSection('error-meaning-section');
    hideSection('error-context-section');
    hideSection('error-fix-section');
    hideSection('good-points-section');
    hideSection('improvements-section');

    // Update summary
    updateElementContent('summary-content', data.summary);

    // Update line-by-line explanations
    renderLineByLineExplanations(data.lineByLine || []);

    // Update optional sections
    if (data.pitfalls && data.pitfalls.length > 0) {
        showSection('pitfalls-section');
        renderList('pitfalls-content', data.pitfalls);
    } else {
        hideSection('pitfalls-section');
    }

    if (data.tryItYourself) {
        showSection('try-it-section');
        updateElementContent('try-it-content', data.tryItYourself);
    } else {
        hideSection('try-it-section');
    }

    if (data.relatedConcepts && data.relatedConcepts.length > 0) {
        showSection('related-concepts-section');
        renderList('related-concepts-content', data.relatedConcepts);
    } else {
        hideSection('related-concepts-section');
    }
}

function renderReview(data: any) {
    // Show/hide relevant sections
    showSection('summary-section');
    hideSection('line-by-line-section');
    hideSection('error-meaning-section');
    hideSection('error-context-section');
    hideSection('error-fix-section');
    showSection('good-points-section');
    showSection('improvements-section');

    // Update summary
    updateElementContent('summary-content', data.summary);

    // Update good points
    renderList('good-points-content', data.goodPoints || [], 'good-point');

    // Update improvements
    renderImprovements(data.improvements || []);

    // Update optional sections
    if (data.tryItYourself) {
        showSection('try-it-section');
        updateElementContent('try-it-content', data.tryItYourself);
    } else {
        hideSection('try-it-section');
    }

    hideSection('pitfalls-section');
    hideSection('related-concepts-section');
}

function renderError(data: any) {
    // Show/hide relevant sections
    hideSection('summary-section');
    hideSection('line-by-line-section');
    showSection('error-meaning-section');
    showSection('error-context-section');
    showSection('error-fix-section');
    hideSection('good-points-section');
    hideSection('improvements-section');

    // Update error sections
    updateElementContent('error-meaning-content', data.errorMeaning);
    updateElementContent('error-context-content', data.whyHere);
    updateElementContent('error-fix-content', data.howToFix);

    // Update optional sections
    if (data.tryItYourself) {
        showSection('try-it-section');
        updateElementContent('try-it-content', data.tryItYourself);
    } else {
        hideSection('try-it-section');
    }

    if (data.relatedConcepts && data.relatedConcepts.length > 0) {
        showSection('related-concepts-section');
        renderList('related-concepts-content', data.relatedConcepts);
    } else {
        hideSection('related-concepts-section');
    }

    hideSection('pitfalls-section');
}

function renderLineByLineExplanations(lineExplanations: any[]) {
    const container = document.getElementById('line-explanations');
    if (!container) return;

    container.innerHTML = '';

    lineExplanations.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-explanation';

        const lineNumber = document.createElement('div');
        lineNumber.className = 'line-number';
        lineNumber.textContent = `Line ${line.lineOffset + 1}`;

        const lineCode = document.createElement('div');
        lineCode.className = 'line-code';
        lineCode.textContent = line.code;

        const lineText = document.createElement('div');
        lineText.className = 'line-text';
        lineText.textContent = line.explanation;

        lineDiv.appendChild(lineNumber);
        lineDiv.appendChild(lineCode);
        lineDiv.appendChild(lineText);

        container.appendChild(lineDiv);
    });
}

function renderImprovements(improvements: any[]) {
    const container = document.getElementById('improvements-content');
    if (!container) return;

    container.innerHTML = '';

    improvements.forEach((improvement, index) => {
        const improvementDiv = document.createElement('div');
        improvementDiv.className = 'improvement-item';

        const description = document.createElement('div');
        description.className = 'improvement-description';
        description.textContent = improvement.description;

        improvementDiv.appendChild(description);

        if (improvement.improvedCode) {
            const code = document.createElement('div');
            code.className = 'improvement-code';
            code.textContent = improvement.improvedCode;
            improvementDiv.appendChild(code);
        }

        const reasoning = document.createElement('div');
        reasoning.className = 'improvement-reasoning';
        reasoning.textContent = improvement.reasoning;
        improvementDiv.appendChild(reasoning);

        container.appendChild(improvementDiv);
    });
}

function renderList(containerId: string, items: string[], itemClass?: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) return;

    const ul = document.createElement('ul');
    items.forEach(item => {
        const li = document.createElement('li');
        if (itemClass) {
            li.className = itemClass;
        }
        li.textContent = item;
        ul.appendChild(li);
    });

    container.appendChild(ul);
}

function showSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

function hideSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
    }
}

function updateElementContent(elementId: string, content: string) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

// Animation and Micro-interaction System Functions
function initializeAnimationSystem() {
    console.log('Initializing animation system...');
    
    // Initialize content loading animations
    initializeContentAnimations();
    
    // Initialize collapsible sections
    initializeCollapsibleSections();
    
    // Initialize intersection observer for scroll animations
    initializeScrollAnimations();
    
    // Initialize ripple effects
    initializeRippleEffects();
    
    // Initialize loading states
    initializeLoadingStates();
    
    // Apply initial animations to existing content
    applyInitialAnimations();
}

function initializeContentAnimations() {
    // Add fade-in animation to content sections when they appear
    const contentSections = document.querySelectorAll('.modern-card, .main-content section');
    
    contentSections.forEach((section, index) => {
        // Add staggered fade-in animation
        section.classList.add('modern-stagger-fade-in');
        
        // Apply delay based on index
        const delay = Math.min(index * 50, 300); // Max 300ms delay
        (section as HTMLElement).style.animationDelay = `${delay}ms`;
    });
}

function initializeCollapsibleSections() {
    // Find all collapsible sections and add toggle functionality
    const collapsibleSections = document.querySelectorAll('[data-collapsible]');
    
    collapsibleSections.forEach(section => {
        const toggle = section.querySelector('[data-collapse-toggle]');
        const content = section.querySelector('[data-collapse-content]');
        
        if (toggle && content) {
            // Set initial state
            const isExpanded = section.getAttribute('data-expanded') === 'true';
            updateCollapsibleState(section as HTMLElement, content as HTMLElement, toggle as HTMLElement, isExpanded);
            
            // Add click handler
            toggle.addEventListener('click', () => {
                const currentlyExpanded = section.getAttribute('data-expanded') === 'true';
                const newState = !currentlyExpanded;
                
                section.setAttribute('data-expanded', newState.toString());
                updateCollapsibleState(section as HTMLElement, content as HTMLElement, toggle as HTMLElement, newState);
            });
        }
    });
}

function updateCollapsibleState(section: HTMLElement, content: HTMLElement, toggle: HTMLElement, isExpanded: boolean) {
    if (isExpanded) {
        content.classList.remove('modern-collapsible--collapsed');
        content.classList.add('modern-collapsible--expanded');
        toggle.classList.remove('modern-collapse-toggle--collapsed');
        toggle.classList.add('modern-collapse-toggle--expanded');
        section.setAttribute('aria-expanded', 'true');
    } else {
        content.classList.remove('modern-collapsible--expanded');
        content.classList.add('modern-collapsible--collapsed');
        toggle.classList.remove('modern-collapse-toggle--expanded');
        toggle.classList.add('modern-collapse-toggle--collapsed');
        section.setAttribute('aria-expanded', 'false');
    }
}

function initializeScrollAnimations() {
    // Create intersection observer for scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('modern-in-view');
            }
        });
    }, observerOptions);
    
    // Observe elements with scroll animation classes
    const scrollElements = document.querySelectorAll('.modern-animate-on-scroll, .modern-stagger-scroll');
    scrollElements.forEach(element => {
        observer.observe(element);
    });
}

function initializeRippleEffects() {
    // Add ripple effect to buttons and interactive elements
    const rippleElements = document.querySelectorAll('.modern-button, .feedback-btn, [data-ripple]');
    
    rippleElements.forEach(element => {
        element.classList.add('modern-ripple-effect');
        
        element.addEventListener('click', (e) => {
            // Create ripple effect
            createRippleEffect(e.target as HTMLElement, e as MouseEvent);
        });
    });
}

function createRippleEffect(element: HTMLElement, event: MouseEvent) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'modern-ripple';
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: modernRipple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

function initializeLoadingStates() {
    // Initialize skeleton screens for loading content
    const loadingElements = document.querySelectorAll('[data-loading]');
    
    loadingElements.forEach(element => {
        if (element.getAttribute('data-loading') === 'true') {
            showLoadingState(element as HTMLElement);
        }
    });
}

function showLoadingState(element: HTMLElement) {
    const loadingType = element.getAttribute('data-loading-type') || 'skeleton';
    
    // Store original content
    const originalContent = element.innerHTML;
    element.setAttribute('data-original-content', originalContent);
    
    switch (loadingType) {
        case 'skeleton':
            element.innerHTML = createSkeletonContent(element);
            break;
        case 'spinner':
            element.innerHTML = '<div class="modern-spinner"></div>';
            break;
        case 'dots':
            element.innerHTML = '<div class="modern-loading-dots"></div>';
            break;
        default:
            element.classList.add('modern-skeleton');
    }
    
    element.classList.add('modern-loading-active');
}

function hideLoadingState(element: HTMLElement) {
    const originalContent = element.getAttribute('data-original-content');
    
    if (originalContent) {
        element.innerHTML = originalContent;
        element.removeAttribute('data-original-content');
    }
    
    element.classList.remove('modern-loading-active', 'modern-skeleton');
    element.removeAttribute('data-loading');
    
    // Add fade-in animation to restored content
    element.classList.add('modern-content-fade-in');
}

function createSkeletonContent(element: HTMLElement): string {
    const elementType = element.tagName.toLowerCase();
    
    switch (elementType) {
        case 'h1':
        case 'h2':
        case 'h3':
            return '<div class="modern-skeleton modern-skeleton--heading"></div>';
        case 'p':
            return `
                <div class="modern-skeleton modern-skeleton--paragraph"></div>
                <div class="modern-skeleton modern-skeleton--paragraph"></div>
                <div class="modern-skeleton modern-skeleton--paragraph"></div>
            `;
        case 'button':
            return '<div class="modern-skeleton modern-skeleton--button"></div>';
        default:
            return '<div class="modern-skeleton modern-skeleton--card"></div>';
    }
}

function applyInitialAnimations() {
    // Apply initial animations to content that's already visible
    const visibleContent = document.querySelectorAll('.modern-card:not(.modern-stagger-fade-in)');
    
    visibleContent.forEach((element, index) => {
        // Add entrance animation with delay
        setTimeout(() => {
            element.classList.add('modern-content-fade-in');
        }, index * 100);
    });
}

// Animation utility functions
function animateContentEntry(element: HTMLElement, animationType: string = 'fade-in') {
    element.classList.add(`modern-content-${animationType}`);
}

function animateContentExit(element: HTMLElement, callback?: () => void) {
    element.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-8px)';
    
    setTimeout(() => {
        if (callback) callback();
    }, 250);
}

function createFloatingAnimation(element: HTMLElement) {
    element.classList.add('modern-float');
}

function createBounceAnimation(element: HTMLElement) {
    element.classList.add('modern-bounce');
    
    // Remove class after animation completes
    setTimeout(() => {
        element.classList.remove('modern-bounce');
    }, 1000);
}

function createShakeAnimation(element: HTMLElement) {
    element.classList.add('modern-shake');
    
    // Remove class after animation completes
    setTimeout(() => {
        element.classList.remove('modern-shake');
    }, 500);
}

function createGlowEffect(element: HTMLElement, duration: number = 2000) {
    element.classList.add('modern-glow');
    
    setTimeout(() => {
        element.classList.remove('modern-glow');
    }, duration);
}

// Performance optimization for animations
function optimizeAnimationPerformance() {
    // Add will-change property to elements that will be animated
    const animatedElements = document.querySelectorAll(`
        .modern-card,
        .modern-button,
        .feedback-btn,
        .modern-collapsible,
        .modern-skeleton
    `);
    
    animatedElements.forEach(element => {
        (element as HTMLElement).style.willChange = 'transform, opacity';
    });
    
    // Remove will-change after animations complete to free up resources
    setTimeout(() => {
        animatedElements.forEach(element => {
            (element as HTMLElement).style.willChange = 'auto';
        });
    }, 1000);
}

// Enhanced content update function with animations
function updateContentWithAnimation(data: any) {
    console.log('Updating content with animations:', data);
    
    // Show loading state first
    const contentElement = document.getElementById('explanation');
    if (contentElement) {
        showLoadingState(contentElement);
        
        // Simulate loading delay for smooth transition
        setTimeout(() => {
            // Update content using existing function
            updateContent(data);
            
            // Hide loading state and show content with animation
            hideLoadingState(contentElement);
            
            // Apply entrance animations to new content
            applyInitialAnimations();
            
            // Optimize performance
            optimizeAnimationPerformance();
        }, 500); // Short delay for better UX
    } else {
        // Fallback to regular update if element not found
        updateContent(data);
    }
}

function handleFeedbackClick(helpful: boolean) {
    if (feedbackSubmitted) return;

    const feedbackComment = document.getElementById('feedback-comment');
    if (feedbackComment) {
        // Add entrance animation to feedback comment section
        feedbackComment.style.display = 'block';
        animateContentEntry(feedbackComment, 'slide-in');
        
        // Store the feedback choice for later submission
        (feedbackComment as any).helpfulChoice = helpful;
        
        // Focus on textarea with slight delay for smooth animation
        setTimeout(() => {
            const textarea = document.getElementById('feedback-text') as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
            }
        }, 150);
        
        // Add visual feedback to the clicked button
        const clickedButton = helpful ? 
            document.getElementById('helpful-btn') : 
            document.getElementById('not-helpful-btn');
        
        if (clickedButton) {
            createBounceAnimation(clickedButton);
        }
    }
}

function submitFeedback() {
    if (feedbackSubmitted) return;

    const feedbackComment = document.getElementById('feedback-comment');
    const textarea = document.getElementById('feedback-text') as HTMLTextAreaElement;
    
    if (!feedbackComment || !textarea) return;

    const helpful = (feedbackComment as any).helpfulChoice;
    const comment = textarea.value.trim();

    // Add loading animation to submit button
    const submitButton = document.getElementById('submit-feedback-btn');
    if (submitButton) {
        submitButton.innerHTML = '<div class="modern-spinner modern-spinner--small"></div> Submitting...';
        submitButton.setAttribute('disabled', 'true');
    }

    // Send feedback to extension
    vscode.postMessage({
        type: 'feedback',
        data: {
            helpful: helpful,
            comment: comment || undefined
        }
    });

    // Show thanks message with animation after short delay
    setTimeout(() => {
        showFeedbackThanksWithAnimation();
        feedbackSubmitted = true;
    }, 500);
}

function showFeedbackThanksWithAnimation() {
    const feedbackComment = document.getElementById('feedback-comment');
    const feedbackThanks = document.getElementById('feedback-thanks');
    const feedbackControls = document.querySelector('.feedback-controls');
    
    // Animate out the comment section
    if (feedbackComment) {
        animateContentExit(feedbackComment, () => {
            feedbackComment.style.display = 'none';
        });
    }
    
    // Hide feedback controls
    if (feedbackControls) {
        (feedbackControls as HTMLElement).style.display = 'none';
    }
    
    // Animate in the thanks message
    if (feedbackThanks) {
        setTimeout(() => {
            feedbackThanks.style.display = 'block';
            animateContentEntry(feedbackThanks, 'scale-in');
            
            // Add a subtle glow effect
            createGlowEffect(feedbackThanks, 1500);
        }, 250);
    }
}

function cancelFeedback() {
    const feedbackComment = document.getElementById('feedback-comment');
    const textarea = document.getElementById('feedback-text') as HTMLTextAreaElement;
    
    if (feedbackComment) {
        // Animate out the feedback comment section
        animateContentExit(feedbackComment, () => {
            feedbackComment.style.display = 'none';
        });
    }
    
    if (textarea) {
        textarea.value = '';
    }
}

function resetFeedbackSection() {
    const feedbackComment = document.getElementById('feedback-comment');
    const feedbackThanks = document.getElementById('feedback-thanks');
    const textarea = document.getElementById('feedback-text') as HTMLTextAreaElement;
    
    if (feedbackComment) {
        feedbackComment.style.display = 'none';
    }
    
    if (feedbackThanks) {
        feedbackThanks.style.display = 'none';
    }
    
    if (textarea) {
        textarea.value = '';
    }
    
    feedbackSubmitted = false;
}

function showFeedbackThanks() {
    showFeedbackThanksWithAnimation();
}

function showError(error: any) {
    console.error('Error:', error);
    
    // Show a simple error message in the content area with animation
    const contentElement = document.getElementById('content');
    if (contentElement) {
        // Create error content with animation
        const errorHtml = `
            <div class="modern-card modern-card--error modern-content-fade-in">
                <div class="card-header">
                    <span class="card-icon">⚠️</span>
                    <h3 class="card-title">Error</h3>
                </div>
                <div class="card-body">
                    <p>${error.message || 'An unexpected error occurred.'}</p>
                    <p><em>Please try again or check your FlowPilot configuration.</em></p>
                </div>
            </div>
        `;
        
        // Animate out existing content first
        animateContentExit(contentElement, () => {
            contentElement.innerHTML = errorHtml;
            
            // Add shake animation to draw attention to error
            const errorCard = contentElement.querySelector('.modern-card--error');
            if (errorCard) {
                createShakeAnimation(errorCard as HTMLElement);
            }
        });
    }
}

// Theme Detection and Monitoring Functions
function initializeThemeDetection() {
    // Apply initial theme class based on VS Code theme data
    applyThemeClass();
    
    // Monitor for theme changes
    monitorThemeChanges();
    
    // Validate color contrast on load
    validateColorContrast();
    
    // Apply emergency fallback if theme detection fails
    setTimeout(() => {
        if (!isThemeDetected()) {
            applyEmergencyFallback();
        }
    }, 1000);
}

function applyThemeClass() {
    const body = document.body;
    
    // Get theme information from window.initialTheme (set by extension)
    const themeInfo = (window as any).initialTheme;
    
    if (themeInfo) {
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
        
        // Apply appropriate theme class
        body.classList.add(themeInfo.className);
        
        // Set data attribute for CSS targeting
        if (themeInfo.kind === 1) { // Light
            body.setAttribute('data-vscode-theme-kind', 'vscode-light');
        } else if (themeInfo.kind === 2) { // Dark
            body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
        } else if (themeInfo.kind === 3) { // High Contrast
            body.setAttribute('data-vscode-theme-kind', 'vscode-high-contrast');
        }
        
        // Set theme name attribute for specific theme targeting
        if (themeInfo.name) {
            body.setAttribute('data-vscode-theme-name', themeInfo.name.toLowerCase());
        }
        
        console.log('Applied theme:', themeInfo.className, themeInfo.name);
    } else {
        // Fallback to system preference
        applySystemThemePreference();
    }
}

function applySystemThemePreference() {
    const body = document.body;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('theme-dark');
        body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
    } else {
        body.classList.add('theme-light');
        body.setAttribute('data-vscode-theme-kind', 'vscode-light');
    }
    
    console.log('Applied system theme preference');
}

function monitorThemeChanges() {
    // Listen for system theme changes as fallback
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            if (!isThemeDetected()) {
                applySystemThemePreference();
                validateColorContrast();
            }
        });
    }
    
    // Monitor for VS Code theme changes via mutation observer
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'data-vscode-theme-kind' || 
                 mutation.attributeName === 'data-vscode-theme-name')) {
                validateColorContrast();
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-vscode-theme-kind', 'data-vscode-theme-name', 'class']
    });
}

function isThemeDetected(): boolean {
    const body = document.body;
    return body.hasAttribute('data-vscode-theme-kind') || 
           body.classList.contains('theme-light') || 
           body.classList.contains('theme-dark') || 
           body.classList.contains('theme-high-contrast');
}

function applyEmergencyFallback() {
    console.warn('Theme detection failed, applying emergency fallback');
    const body = document.body;
    body.classList.add('theme-emergency-fallback');
    
    // Apply basic dark theme as fallback
    body.classList.add('theme-dark');
    body.setAttribute('data-vscode-theme-kind', 'vscode-dark');
}

function validateColorContrast() {
    // Check for elements that might have low contrast
    const elementsToCheck = document.querySelectorAll('.modern-text--secondary, .modern-text--muted');
    
    elementsToCheck.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple contrast check - in a real implementation, you'd calculate the actual contrast ratio
        if (isLowContrast(color, backgroundColor)) {
            element.classList.add('low-contrast-fix');
        }
    });
}

function isLowContrast(color: string, backgroundColor: string): boolean {
    // Simplified contrast check - in production, you'd use a proper contrast ratio calculation
    // This is a placeholder that could be enhanced with a proper contrast calculation library
    
    // For now, we'll apply the fix to elements that might need it based on theme
    const body = document.body;
    
    if (body.classList.contains('theme-light')) {
        // In light theme, secondary text might need contrast boost
        return true;
    }
    
    if (body.classList.contains('theme-high-contrast')) {
        // High contrast theme usually doesn't need fixes
        return false;
    }
    
    // Default to applying contrast fix for safety
    return false;
}

// Color Contrast Utilities
function calculateContrastRatio(color1: string, color2: string): number {
    // This would implement the WCAG contrast ratio calculation
    // For now, returning a placeholder value
    return 4.5; // Minimum acceptable ratio
}

function ensureMinimumContrast(element: HTMLElement, minRatio: number = 4.5) {
    // This would ensure the element meets minimum contrast requirements
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    const ratio = calculateContrastRatio(color, backgroundColor);
    
    if (ratio < minRatio) {
        element.classList.add('low-contrast-fix');
    }
}

// Theme-aware animation control
function respectReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        document.body.classList.add('reduced-motion');
        
        // Disable animations for accessibility
        const style = document.createElement('style');
        style.textContent = `
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize reduced motion support
document.addEventListener('DOMContentLoaded', () => {
    respectReducedMotion();
    
    // Monitor for changes in motion preferences
    if (window.matchMedia) {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addEventListener('change', respectReducedMotion);
    }
});