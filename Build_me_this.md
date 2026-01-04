


Account

Upgrade
Install
Build me a mvp for an FlowPilot - AI That Writes Your Code While Teaching You How It Works
⏰Perfect Timing
🚀10x Better
⚡Unfair Advantage
+14 More
A hundred tutorials watched. Every concept explained. But when the cursor blinks on an empty file, nothing comes. The gap between following along and knowing how to code is wider than any YouTube video can fix.

AI tools made shipping easier. They also made learning optional. The code gets written. The understanding doesn't. Autocomplete becomes a crutch. The crutch becomes permanent. FlowPilot doesn't write code. It teaches it. Lives in the editor. Explains what code does line by line. When something breaks, it shows why. When the logic gets confusing, it walks through the thinking. Not just the fix. The reason behind it.

Highlight a function you don't understand. Get a plain-English breakdown. Hover over an error. See what caused it and how to fix it. Write a loop that works but feels wrong. Learn why it's inefficient and what's better. The teaching happens inside the work, not in a separate tab.

$19/month. Built for self-taught developers and bootcamp grads who can ship but can't explain what they shipped. Grow through r/learnprogramming, coding YouTube creators, bootcamp partnerships. Begin with Python. Expand to JavaScript, React, data science. Build the MVP as a VS Code extension. Detect pauses, errors, moments of confusion. Test with 100 Reddit users. Iterate based on what helps them understand.

Most AI tools make coders faster. This one makes them better. That's the whole pitch.
Reviewed 20 sources
This AI VS Code extension actually works with large codebases! trailer
This AI VS Code extension actually works with large codebases!
VS Code's AI Toolkit: Fine-Tune Models, Build Agents ... trailer
VS Code's AI Toolkit: Fine-Tune Models, Build Agents ...
Roo Code is AMAZING - AI VSCode Extension (better than ... trailer
Roo Code is AMAZING - AI VSCode Extension (better than ...
FlowPilot can launch as a focused VS Code extension that explains code inline, reacts to errors and “stuck” moments, and logs what users struggle with, using an LLM behind the scenes and starting with Python only.
​

Below is a concrete, buildable MVP plan tailored to your pitch.

1. Core MVP Scope
Goal: Help self-taught devs understand the code they’re already writing in VS Code, not generate more of it.
​

Ship one environment + one language + three core actions:

Environment: VS Code extension only.
​

Language: Python only (start).
​

Core actions:

Explain selection

Explain error

Explain “why this is bad / how to improve”

Defer until v2+:

Multi-language support (JS/React, data science-specific patterns).
​

Whole-project reasoning.

Advanced analytics dashboards.

2. User Story → Feature Mapping
Target: self-taught devs / bootcamp grads who can “make it work” but can’t explain it.
​

Key flows:

Highlight a function → explanation panel

Command palette: “FlowPilot: Explain Selection”.

Behavior:

Grab selected code + few lines of surrounding context.

Send to backend with prompt: “Explain line by line, then summarize the intent in plain English, then note common pitfalls.”

Render in a right-side panel with sections:

“Line-by-line”

“What this is doing”

“Things to watch out for”

Hover over an error → root-cause + fix

On diagnostic event (from Python extension / language server), add FlowPilot code action: “Explain this error”.

Request:

Error message, stack trace snippet, and surrounding code.

Response sections:

“What the error means”

“Why it happens here”

“How to fix it (with reasoning)”

Ask ‘Is this good code?’ → refactor with rationale

Command: “FlowPilot: Review Selection”.

Output:

“What’s okay”

“What could be improved”

“Improved version”

“Why this version is better” (complexity, readability, Pythonic patterns).

Learning in the flow

Each response ends with an optional “Try It Yourself” micro-task:

Example: “Rewrite this using a list comprehension” or “Add a type hint version of this function.”

3. VS Code MVP Architecture
Focus on minimum glue to talk to an LLM and intercept VS Code events.
​

Extension pieces
Activation

activationEvents:

onCommand:codeCoach.explainSelection

onCommand:codeCoach.reviewSelection

onLanguage:python

Commands

codeCoach.explainSelection

codeCoach.reviewSelection

codeCoach.explainError (invoked via code action on diagnostic)

UI

Single Webview / Sidebar view: “FlowPilot”.

Shows last interaction: code snippet, question, explanation.

Detection of “moments of confusion” (MVP version)
You can stub this with simple heuristics before doing hard telemetry:

Timer-based:

If cursor stays on same line for N seconds while there is an error, show a subtle status bar hint: “Need help understanding this error? FlowPilot can explain.”

Error-based:

On repeated run of same file with same error (you can detect via file save + unchanged region, or repeated diagnostics), show suggestion: “Explain why this error keeps happening.”

Keep all nudges opt-in to avoid becoming annoying.

Backend / LLM
Backend microservice (Node/Next or fast Python/FastAPI) that:

Accepts:

Code snippet, context, type (explain, error, review).

Optional user skill level (later).

Calls hosted LLM API (OpenAI / Anthropic / local via AI Toolkit).
​

Applies system prompt focused on:

Teaching, not just fixing.

Explicit reasoning, no “magic” jumps.

No full file rewrites unless asked.

MVP server routes:

POST /explain

POST /error

POST /review

Include a mode: "beginner" | "intermediate" field later for tailoring depth.

4. Data + Telemetry for Iteration
To “test with 100 Reddit users and iterate,” you need to log what actually confuses them.

Track (with explicit consent):

Event: explainSelection

Language, file extension, snippet size, type of construct (function, loop, class – heuristic).

Event: explainError

Error type (e.g., TypeError, IndexError) and whether user requested help.

Event: reviewSelection

Complexity metrics (lines, nesting level estimate).

Outcome:

Simple “Was this helpful?” thumbs up/down.

Optional short text feedback.

Aggregate:

Top 10 error types explained.

Top 10 patterns where users ask “Is this good?”

Time-of-day usage for outreach / content scheduling.

This gives the content roadmap: you can turn most common confusions into onboarding flows, emails, or in-product “playlists”.

5. Pricing, Positioning, and Launch
Market validation and angle
Coding bootcamps and self-taught devs are a large and growing segment (tens of thousands of new grads annually, >60k in 2023 and projected growth into 2024–2025).
​

Most AI extensions optimize speed (Copilot, Codeium, Cody, etc.), not comprehension-first explanations.
​

Your wedge:

Tagline: “AI that makes you explain your own code.”

Promise:

“Ship code you can defend in an interview.”

“Every error becomes a lesson, not just a fix.”

Pricing
MVP:

Free tier: X explanations per day (e.g., 10).

Paid: $19/month for unlimited, plus “learning history” and saved explanations.

Discount offers for bootcamps / cohort licenses.

Distribution
r/learnprogramming, r/cscareerquestions, r/Python, r/vscode:

“Built a VS Code extension that explains your code line-by-line. Want 100 early testers.”

YouTube/shorts:

Partner with Python YouTubers: “Live coding with FlowPilot: every bug becomes a lesson.”

Bootcamps:

Offer free cohort trial:

Features: instructor view of “top confusions” per cohort (later versions).

6. Implementation Checklist (Concrete)
You could give this as a ticket breakdown to a contractor or build it yourself.

Week 1–2: Foundation

 VS Code extension scaffold (TypeScript).

 Implement codeCoach.explainSelection command and Webview panel.

 Wire to backend /explain with API key config in extension settings.

Week 2–3: Error explanations + review

 Listen to diagnostics for Python; add code action “Explain with FlowPilot”.

 Implement /error endpoint with specialized prompt.

 Implement codeCoach.reviewSelection command + /review endpoint.

Week 3–4: UX polish + telemetry

 Simple Timer/heuristic “Need help?” nudge in status bar.

 Add “Was this helpful?” feedback in Webview.

 Capture anonymous usage metrics with opt-in.

Week 4–5: Beta + Reddit cohort

 Ship to VS Code Marketplace as private/early-access listing.

 Build simple landing page describing the problem and link to extension.

 Recruit 100 users from Reddit and YouTube; run a short intake form (experience level, language, main struggle).

From there, the data will tell you which next bets to prioritize: more Python depth (e.g., async, data science), or JS/React support, or better “playlist”/curriculum features.

If you want, the next step can be drafting the exact LLM prompts and minimal file structure for the VS Code extension so you can hand it to a dev or scaffold it quickly yourself.

Design VS Code extension architecture for this product
Reviewed 20 sources
How to fix this error in Visual Studio Code | Open a folder or ... trailer
How to fix this error in Visual Studio Code | Open a folder or ...
How do debug a VS Code extension that uses a Webview - YouTube trailer
How do debug a VS Code extension that uses a Webview - YouTube
A clean architecture is: thin VS Code client (commands, UI, events) + small API client layer + backend LLM service, all optimized for Python files and “explain / error / review” flows.
​

Below is a concrete architecture you can hand to a dev.

Extension manifest and activation
Define a minimal, language-scoped extension in package.json.
​

Key fields

activationEvents:

onLanguage:python

onCommand:codeCoach.explainSelection

onCommand:codeCoach.reviewSelection

onCommand:codeCoach.explainError

contributes.commands:

codeCoach.explainSelection – “FlowPilot: Explain Selected Code”

codeCoach.reviewSelection – “FlowPilot: Review Selected Code”

codeCoach.explainError – “FlowPilot: Explain This Error”

contributes.menus:

editor/context: add explain/review when a Python file is active.

editor/title: a small FlowPilot icon button.

editor/codeAction:

Quick fix: Explain error with FlowPilot on diagnostics.

contributes.viewsContainers / views:

Sidebar view container codeCoach with a single view: “FlowPilot Panel”.
​

This ensures the extension activates only when needed (Python or explicit commands).

Client-side layers (VS Code side)
1. Activation and wiring (extension.ts)
Responsibilities:
​

On activate(context):

Register commands:

explainSelectionCommand

reviewSelectionCommand

explainErrorCommand

Instantiate:

CodeCoachPanel (webview / sidebar manager).

CodeCoachApiClient (HTTP client wrapper).

ConfusionDetector (simple heuristics).

On deactivate():

Dispose subscriptions and diagnostic collections if any.

2. Commands
Each command is a small orchestrator:

explainSelectionCommand

Get active editor + selected range.

If empty selection, auto-expand to current block/function (simple heuristic).

Collect:

code, languageId, file path, maybe previous lines for context.

Call apiClient.explainSelection(payload).

Pass response to CodeCoachPanel.showExplanation(response).

reviewSelectionCommand

Same selection logic.

Call apiClient.reviewSelection(payload).

Panel renders:

“What’s okay / Needs improvement / Improved version / Why it’s better”.

explainErrorCommand

Get diagnostics for current cursor line using languages.getDiagnostics(document.uri) and filter by range.
​

Pick the most relevant diagnostic.

Collect:

Error message, range, snippet around error, full stack if available.

Call apiClient.explainError(payload).

Panel renders error explanation.

3. Webview / sidebar UI layer
Use a webview-based view for rich teaching UX.
​

Class CodeCoachPanel:

Manages a single sidebar webview (or panel).

Provides:

showExplanation(data)

showErrorExplanation(data)

showReview(data)

Embeds HTML/JS UI:

Sections: prompt summary, code snippet, explanation, reasoning, “Try it yourself” micro-task.

Uses webview.postMessage to send data from extension → webview, and onDidReceiveMessage for feedback from UI (e.g., thumbs up/down, “too advanced”).
​

Webview JS:

Renders explanation content.

Sends back:

feedback events.

Possible “ask follow-up” questions.

This keeps VS Code API usage minimal and pushes teaching UX into standard HTML/CSS.

4. Diagnostics and confusion detection
Use existing diagnostics and simple timers as your “moments of confusion” MVP.
​

Diagnostic hook

Listen on languages.onDidChangeDiagnostics.

When diagnostics appear for a Python file:

Optionally set a LanguageStatusItem (“FlowPilot available for explaining this error”).
​

ConfusionDetector

Uses:

window.onDidChangeTextEditorSelection

window.onDidChangeActiveTextEditor

Tracks:

Time spent on a line with diagnostics.

Repeated errors (same diagnostic reappearing after edits).

When threshold hit:

Show non-intrusive status bar item:

Text: “Stuck? Explain this with FlowPilot”.

Command: codeCoach.explainError.

No heavy data analysis on the client; just enough to nudge.

API client and configuration
1. Config
Use workspace.getConfiguration('codeCoach') with settings:

codeCoach.apiBaseUrl

codeCoach.apiKey

codeCoach.telemetry.enabled

codeCoach.level (“beginner|intermediate”).

Expose a Settings UI via contributes.configuration.
​

2. CodeCoachApiClient
Thin wrapper over fetch / axios:

Methods:

explainSelection({ code, languageId, filePath, context, level })

reviewSelection({ code, ... })

explainError({ code, errorMessage, range, ... })

logEvent({ type, metadata }) (fire-and-forget).

Handles:

API key injection.

Timeouts and basic error messages.

Mapping backend response → strongly typed DTOs used by CodeCoachPanel.

Backend service (high level, for completeness)
Not part of the VS Code extension package, but the architecture expects:

/explain

/review

/error

/events

Each endpoint returns a structured payload:

type

summary

lineByLine: { line: number; explanation: string }[]

improvements?: [...]

tryItYourself?: string

This structure is what the webview renders and what you iterate on.

Files and module layout
A simple TypeScript layout:

src/extension.ts – activation, command registration.

src/panel/CodeCoachPanel.ts – webview manager.

src/api/CodeCoachApiClient.ts – HTTP client.

src/confusion/ConfusionDetector.ts – timers + nudges.

src/telemetry/Telemetry.ts – wrapper for sending aggregated events.

media/panel/index.html – webview HTML shell.

media/panel/main.js – webview UI logic.

package.json – manifest, contributions, config.

This gives you a clear separation:

VS Code integration (commands, diagnostics, webview host).

Product logic (what events to log, when to nudge).

Presentation (teaching UI).

Backend (LLM prompts, explanation strategy) decoupled behind CodeCoachApiClient.

If you want next, can outline the package.json and extension.ts skeletons with concrete TypeScript signatures.

Craft and build a highly detailed prompt for an ide to build this
Use the following prompt as the “master spec” for your IDE / agent. It’s written so you can paste it into a “build me this project” workflow and let it scaffold + implement the VS Code extension.

System / High‑Level Role
You are an expert TypeScript + Node.js engineer who specializes in building high‑quality VS Code extensions. You will design and implement a VS Code extension called “FlowPilot” that explains code, errors, and code quality inside the editor, with a teaching‑first UX (no auto‑completion or full code generation).

Your job is to:

Scaffold the entire extension project.

Implement the core features end‑to‑end.

Keep the design modular and easy to iterate on.

Do not generate filler boilerplate; generate production‑ready, idiomatic code and configuration.

Product Concept
FlowPilot – AI That Writes Your Understanding (Not Your Code)

Target users: self‑taught developers and bootcamp grads who can make code work but struggle to explain it.

Environment: VS Code, starting with Python files only.

Goal: inside the editor, users can:

Highlight code and get a line‑by‑line explanation plus a plain‑English summary.

Explain errors: what they mean, why they happen here, and how to fix them.

Ask “Is this good code?” on a selection and get teaching‑oriented review & refactor suggestions.

The extension calls an external HTTP API (backend/LLM service) that returns structured explanations. The extension never directly generates new code into the file automatically; it only explains and suggests.

Functional Requirements
Language / Scope
Initial scope:

Language: Python only.

File types: .py (later extensible to others).

The extension should still activate only when useful (Python or explicit commands).

Commands (Editor UX)
Implement the following commands:

codeCoach.explainSelection – “FlowPilot: Explain Selected Code”

Trigger:

Command palette.

Editor context menu (right‑click on selection in a Python file).

Behavior:

If user has a selection:

Use that range.

If no selection:

Expand to the “current block” (for MVP: the current line plus a small window around it, e.g., ±5 lines).

Gather:

code: selected text.

languageId: VS Code language id (Python).

filePath: document path.

surroundingContext: a limited number of lines before/after.

Call backend endpoint:

POST /explain with a JSON body.

Display response in the FlowPilot panel (sidebar) with:

Line‑by‑line explanation.

Plain English summary (“What this is doing”).

Pitfalls / gotchas.

Small “Try it yourself” suggestion (if provided by backend).

codeCoach.reviewSelection – “FlowPilot: Review Selected Code”

Trigger:

Command palette.

Editor context menu.

Behavior:

Similar selection logic as explainSelection.

Call backend endpoint:

POST /review.

Display in panel:

What’s good about the code.

What could be improved (readability, complexity, Pythonic style).

Suggested improved version.

Explanation of why the suggested version is better.

Never auto‑apply the suggested code; just show it.

codeCoach.explainError – “FlowPilot: Explain This Error”

Trigger:

Code action / quick fix on diagnostics in Python files.

Command palette (applies to the diagnostic on the current line).

Behavior:

From active editor, get diagnostics for the current document.

Find diagnostics that intersect the current cursor line.

Pick the most relevant (e.g., first).

Gather:

Error message.

Diagnostic range (start/end).

Snippet around the error (a few lines before/after).

Language id and file path.

Call backend endpoint:

POST /error.

Display in panel:

What the error means in plain English.

Why it occurs here (with reference to snippet).

How to fix it and what to learn from it.

“Moments of Confusion” Nudges (MVP Heuristics)
Implement a lightweight “ConfusionDetector” with the following behavior:

Track:

Cursor staying on a line with an active diagnostic for more than N seconds (e.g., 15–20s).

Repeated appearance of the same diagnostic in the same file (e.g., same error message & range within short time).

When a threshold is met:

Show a status bar item:

Text like: Stuck on an error? Ask FlowPilot.

Clicking it triggers codeCoach.explainError.

Keep this non‑intrusive:

No pop‑ups or blocking UI.

Respect a simple cooldown to avoid spam.

Telemetry (Opt‑In, Anonymous)
Implement minimal telemetry to help iterate (no PII):

Respect a boolean setting: codeCoach.telemetry.enabled.

Events (fire‑and‑forget to backend /events):

explainSelection:

file language id, selection length, rough kind (if possible).

reviewSelection.

explainError:

error message, error code (if present).

feedback:

explanation id, helpful: true/false.

Use best‑effort sending; do not break UX on failures.

Non‑Functional Requirements
Language: TypeScript for extension code.

Use official VS Code APIs and idiomatic patterns.

Separation of concerns:

Activation / wiring.

API client.

Panel / webview rendering.

Confusion detection & nudging.

Telemetry wrapper.

Code should be readable, strongly typed, and well‑structured.

VS Code Manifest (package.json) Requirements
Define at least:

name: code-coach

displayName: FlowPilot

description: Teaching‑first AI FlowPilot for Python in VS Code.

publisher: Use a placeholder like your-name (can be changed later).

engines.vscode: Reasonable minimum (e.g., ^1.90.0 or current).

categories: ["Other", "Education"]

activationEvents:

"onLanguage:python"

"onCommand:codeCoach.explainSelection"

"onCommand:codeCoach.reviewSelection"

"onCommand:codeCoach.explainError"

contributes.commands:

Three commands listed above with titles.

contributes.menus:

editor/context:

Show explain/review commands when resourceLangId == python.

editor/codeAction:

Show “Explain error with FlowPilot” when there is a diagnostic on that range.

contributes.viewsContainers and views:

Sidebar container codeCoach with view id codeCoachPanel, name “FlowPilot”.

contributes.configuration:

codeCoach.apiBaseUrl (string).

codeCoach.apiKey (string, secret).

codeCoach.telemetry.enabled (boolean, default true or false).

codeCoach.level (enum: "beginner", "intermediate").

Project Structure
Generate the following structure:

package.json – VS Code extension manifest.

tsconfig.json – TypeScript config.

src/extension.ts – main entry; activation & deactivation.

src/panel/CodeCoachPanel.ts

Manages the sidebar webview/panel.

Exposes methods:

showExplanation(data: ExplanationPayload)

showErrorExplanation(data: ErrorExplanationPayload)

showReview(data: ReviewPayload)

src/api/CodeCoachApiClient.ts

Wraps HTTP calls to backend:

explainSelection

reviewSelection

explainError

logEvent

Reads configuration from workspace.getConfiguration('codeCoach').

src/confusion/ConfusionDetector.ts

Hooks into:

window.onDidChangeTextEditorSelection

languages.onDidChangeDiagnostics

Exposes a start() and dispose() API.

src/telemetry/Telemetry.ts

Abstract layer for sending events via CodeCoachApiClient.

media/panel/index.html

HTML shell for the webview.

media/panel/main.js (or TypeScript compiled to JS)

Handles acquireVsCodeApi(), message receiving, UI rendering, and sending feedback messages back to the extension.

Webview / Panel UX Requirements
Implement a simple but clear teaching layout:

Sections (for explanations & reviews):

Header with:

Question type (Explain selection / Error / Review).

File name.

Code snippet (read‑only, nicely formatted).

“Line by line” section:

Each line or small group of lines with explanation text.

“What this does” section:

Short summary in plain English.

“Things to watch out for” section.

For reviews:

“What’s good”

“What could be improved”

“Improved version”

“Why the new version is better”

“Try it yourself”:

Optional small task from the backend (e.g., “Rewrite this with a list comprehension”).

Interaction:

Feedback controls:

“Was this helpful?” [Yes] [No].

On click:

Post message back to extension with feedback event.

Support basic scrolling and responsive layout.

Backend Contract (Assume Existing API)
Assume the IDE environment provides or will connect to a backend with endpoints:

POST /explain

Request:

code: string

languageId: string

filePath?: string

surroundingContext?: string

level?: "beginner" | "intermediate"

Response (example shape):

json
{
  "type": "explain",
  "summary": "Short plain-English summary.",
  "lineByLine": [
    { "lineOffset": 0, "code": "for i in range(10):", "explanation": "Loops from 0 to 9." }
  ],
  "pitfalls": ["Off-by-one errors if you expect inclusive upper bound."],
  "tryItYourself": "Modify the loop to step by 2."
}
POST /review

Response includes:

goodPoints, improvementPoints, improvedCode, whyBetter, tryItYourself.

POST /error

Response includes:

errorMeaning, whyHere, howToFix, relatedConcepts, tryItYourself.

POST /events

Fire‑and‑forget, no need to parse response.

The IDE should define TypeScript interfaces that match this contract and use them throughout the code for type safety.

Implementation Instructions
Scaffold the project with the above structure and configuration.

Fully implement:

extension.ts:

Activation.

Command registration and handlers.

Integration with CodeCoachPanel, CodeCoachApiClient, ConfusionDetector, and Telemetry.

CodeCoachApiClient.ts with real HTTP calls using fetch or axios.

CodeCoachPanel.ts with webview creation, HTML/bootstrap, and message passing.

ConfusionDetector.ts:

Basic heuristics and status bar item nudging.

Telemetry.ts:

Thin wrapper around CodeCoachApiClient.logEvent.

Use idiomatic VS Code APIs and TypeScript patterns.

Include brief comments only where helpful; avoid excessive commentary.

Use this prompt to generate all source files, config files, and any necessary README notes so that the project can be opened in VS Code, built with npm run compile (or similar), and run/debugged as a normal VS Code extension.