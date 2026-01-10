
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, fileName, languageId } = body;

        console.log('[Review Snippet API] Received request:', { fileName, languageId, codeLength: code?.length });

        if (!process.env.OPENROUTER_API_KEY) {
            console.error('[Review Snippet API] Missing OPENROUTER_API_KEY');
            return NextResponse.json({ error: 'Server misconfiguration: Missing API Key' }, { status: 500 });
        }

        const systemPrompt = `
You are an expert coding assistant used in a VS Code extension "FlowPilot".
Your task is to review the provided code snippet.
First confirm what it does, then critique it based on:
- Readability (0-10)
- Performance concerns (e.g. time complexity)
- Edge cases missed
- More idiomatic ("Pythonic" or "TypeScript-y", etc.) version

You must return a valid JSON object with the following structure:
{
  "does": "A brief confirmation of what the code does.",
  "score": <number 0-10>,
  "issues": ["<issue1>", "<issue2>", ...],
  "improvedCode": "<the full improved code snippet>",
  "whyBetter": "Explanation of why the improved version is better."
}

Do not include markdown formatting (like \`\`\`json) in your response, just the raw JSON object.
`;

        const userPrompt = `
File: ${fileName}
Language: ${languageId}
Code to review:
${code}
`;

        const models = [
            'openai/gpt-4o-mini',
            'anthropic/claude-3-5-haiku',
            'google/gemini-2.0-flash-exp:free'
        ];

        let selectedModel = models[0];

        // Simple retry logic
        for (const model of models) {
            try {
                console.log(`[Review Snippet API] Trying model: ${model}`);
                selectedModel = model;

                const response = await openai.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    response_format: { type: 'json_object' }
                });

                const content = response.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('No content received from LLM');
                }

                const jsonResponse = JSON.parse(content);

                // Log usage
                try {
                    const logEntry = {
                        timestamp: new Date().toISOString(),
                        userId: 'anonymous-user',
                        type: 'review-snippet',
                        language: languageId,
                        fileName: fileName,
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
                    console.error('[Review Snippet API] Logging failed:', logError);
                }

                return NextResponse.json(jsonResponse);

            } catch (error: any) {
                console.warn(`[Review Snippet API] Model ${model} failed:`, error?.message || error);
                if (model === models[models.length - 1]) {
                    throw error;
                }
            }
        }

        throw new Error('All models failed');

    } catch (error) {
        console.error('[Review Snippet API] Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
