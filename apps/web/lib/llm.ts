export async function generateTip(context: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn("OPENROUTER_API_KEY is not set. Returning mock tip.");
        return "Did you know? You can use `console.table()` to display arrays of objects in a readable tabular format.";
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://flowpilot.dev", // Optional, but good practice
                "X-Title": "FlowPilot", // Optional
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Use a fast, cheap model
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful coding mentor for a user named FlowPilot.
            Generate a short, actionable "Tip of the Day" for a software developer.
            The tip should be concise (max 2 sentences).
            Focus on best practices, productivity hacks, or language-specific tricks (TS/JS/React).
            If context is provided about what the user is working on, TAILOR the tip to that context.
            Do not include "Tip of the Day:" prefix. Just the tip content.`
                    },
                    {
                        role: "user",
                        content: `Context: ${context || "General web development"}`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Always comment your code!";
    } catch (error) {
        console.error("Failed to generate tip:", error);
        return "Did you know? Consistent code formatting helps reduce bugs and improves readability.";
    }
}
