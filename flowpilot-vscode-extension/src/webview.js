// FlowPilot Webview JavaScript
(function() {
    const vscode = acquireVsCodeApi();
    
    // DOM Elements
    const reviewFileBtn = document.getElementById('review-file-btn');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const explanationCard = document.getElementById('explanation-card');
    const optimizeBtn = document.getElementById('optimize-btn');
    const docstringBtn = document.getElementById('docstring-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const moreBtn = document.getElementById('more-btn');
    const robotIcon = document.getElementById('fp-icon-robot')?.innerHTML ?? '';

    // Initialize
    function initialize() {
        setupEventListeners();
        addWelcomeMessage();
    }

    function setupEventListeners() {
        // Review file button
        reviewFileBtn.addEventListener('click', () => {
            vscode.postMessage({
                type: 'reviewFile',
                content: '',
                filename: ''
            });
        });

        // Chat input
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Action buttons
        optimizeBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'optimizeCode' });
        });

        docstringBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'addDocstring' });
        });

        // Header buttons
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });

        moreBtn.addEventListener('click', () => {
            // Show more options menu
            console.log('More options clicked');
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            vscode.postMessage({
                type: 'sendMessage',
                text: message
            });
            chatInput.value = '';
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span class="fp-icon">${robotIcon}</span>
                </div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function addWelcomeMessage() {
        const welcomeMessage = "Hello! I'm FlowPilot, your AI coding coach. I can help you understand your code better. Select some code and I'll explain it to you!";
        addMessage(welcomeMessage, 'ai');
    }

    function addExplanation(explanation) {
        const explanationSteps = document.getElementById('explanation-steps');
        explanationSteps.innerHTML = '';
        
        explanation.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'explanation-step';
            stepDiv.innerHTML = `
                <div class="step-number">${step.line}</div>
                <div class="step-content">
                    <strong>${step.title}:</strong> ${step.description}
                </div>
            `;
            explanationSteps.appendChild(stepDiv);
        });
        
        // Show the explanation card
        explanationCard.classList.remove('hidden');
        explanationCard.classList.add('fade-in');
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'aiResponse':
                addMessage(message.text, 'ai');
                break;
                
            case 'reviewFile':
                // Simulate a code review
                const mockExplanation = {
                    steps: [
                        {
                            line: '06',
                            title: 'Function Definition',
                            description: 'Defines calculate_fib taking a single integer n.'
                        },
                        {
                            line: '07',
                            title: 'Base Case 1',
                            description: 'If input n is 0 or negative, it immediately returns 0.'
                        },
                        {
                            line: '09',
                            title: 'Base Case 2',
                            description: 'If n is 1, it returns 1. This prevents infinite recursion.'
                        },
                        {
                            line: '11',
                            title: 'Recursive Step',
                            description: 'The function calls itself for n-1 and n-2 and adds the results together.'
                        }
                    ]
                };
                addExplanation(mockExplanation);
                break;
                
            case 'explainCode':
                addMessage(`I'll explain this code: "${message.code}"`, 'ai');
                break;
        }
    });

    // Initialize the webview
    initialize();
})();
