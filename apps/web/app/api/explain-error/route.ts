
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    // Initialize OpenAI client inside handler to avoid top-level errors if env vars are missing
    let openai;
    try {
        openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY || 'dummy', // Prevent throw on init
        });
    } catch (e) {
        console.error('[Explain Error API] Failed to initialize OpenAI client:', e);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.error('[Explain Error API] Failed to parse JSON body');
            return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
        }

        if (!body) {
            console.error('[Explain Error API] Empty request body');
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }

        const { errors, codeSnippet, fileName, languageId } = body;

        console.log('[Explain Error API] Received request:', {
            fileName,
            languageId,
            errorCount: errors?.length,
            hasKey: !!process.env.OPENROUTER_API_KEY
        });

        if (!process.env.OPENROUTER_API_KEY) {
            console.error('[Explain Error API] Missing OPENROUTER_API_KEY');
            return NextResponse.json({ error: 'Server misconfiguration: Missing API Key' }, { status: 500 });
        }

        if (!errors || !Array.isArray(errors) || errors.length === 0) {
            console.error('[Explain Error API] Invalid or empty errors array');
            return NextResponse.json({ error: 'No errors provided for explanation' }, { status: 400 });
        }

        // Get the first error for explanation
        const primaryError = errors[0];

        if (!primaryError || !primaryError.message) {
            console.error('[Explain Error API] Invalid error object:', primaryError);
            return NextResponse.json({ error: 'Invalid error object' }, { status: 400 });
        }

        const systemPrompt = `
You are a patient coding tutor helping developers understand and fix errors.
Your task is to explain the error in a clear, educational way.
You must return a valid JSON object with the following structure:
{
    "plainEnglish": "A simple, jargon-free explanation of what the error means",
    "whyItHappens": "The root cause - why this error occurred in this specific code",
    "howToFix": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "prevention": "Best practices to avoid this error in the future"
}

Be concise but thorough. Use beginner-friendly language.
Do not include markdown formatting (like \`\`\`json) in your response, just the raw JSON object.
`;

        const userPrompt = `
File: ${fileName}
Language: ${languageId}
Error: ${primaryError.message}
Line: ${primaryError.line}

Code around the error:
${codeSnippet}

Please explain this error and how to fix it.
`;

        // Use fast, reliable paid models with fallback
        const models = [
            'openai/gpt-4o-mini',           // Fastest, most reliable
            'anthropic/claude-3-5-haiku',   // Fast, high quality
            'google/gemini-2.0-flash-exp:free'  // Free fallback
        ];

        let accumulatedContent = '';
        let selectedModel = models[0];

        // Try models in sequence until one works
        for (const model of models) {
            try {
                console.log(`[Explain Error API] Trying model: ${model}`);
                selectedModel = model;

                const stream = await openai.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    response_format: { type: 'json_object' },
                    stream: true
                });

                // Create a streaming response
                const encoder = new TextEncoder();
                const readable = new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of stream) {
                                const content = chunk.choices[0]?.delta?.content || '';
                                if (content) {
                                    accumulatedContent += content;
                                    // Send each chunk as SSE
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: content, accumulated: accumulatedContent })}\n\n`));
                                }
                            }

                            // Send final complete message
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, content: accumulatedContent })}\n\n`));
                            controller.close();
                        } catch (error) {
                            console.error('[Explain Error API] Streaming error:', error);
                            controller.error(error);
                        }
                    }
                });

                // Log the usage
                try {
                    const logEntry = {
                        timestamp: new Date().toISOString(),
                        userId: 'anonymous-user',
                        eventType: 'error-explanation',
                        language: languageId,
                        fileName: fileName,
                        errorMessage: primaryError.message,
                        model: selectedModel
                    };
                    const fs = require('fs');
                    const path = require('path');
                    const logDir = path.join(process.cwd(), 'logs');
                    if (!fs.existsSync(logDir)) {
                        fs.mkdirSync(logDir);
                    }
                    fs.appendFileSync(path.join(logDir, 'usage.jsonl'), JSON.stringify(logEntry) + '\n');
                } catch (logError) {
                    console.error('[Explain Error API] Logging failed:', logError);
                }

                return new Response(readable, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    },
                });

            } catch (error: any) {
                console.warn(`[Explain Error API] Model ${model} failed:`, error?.message || error);

                // If this is the last model, throw the error
                if (model === models[models.length - 1]) {
                    throw error;
                }
                // Otherwise, try the next model
                continue;
            }
        }

        // This should never be reached due to the throw above
        throw new Error('All models failed');

    } catch (error) {
        console.error('[Explain Error API] Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
