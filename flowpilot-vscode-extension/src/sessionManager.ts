import * as vscode from 'vscode';
import fetch from 'node-fetch';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

interface Session {
    id: string;
    started: number;
    explains: number;
    errors: number;
    reviews: number;
    concepts: Set<string>;
}

let session: Session | null = null;
const SESSION_UPDATE_THRESHOLD = 5;

// Helper to get or create session
function getSession(): Session {
    if (!session) {
        session = {
            id: generateUUID(),
            started: Date.now(),
            explains: 0,
            errors: 0,
            reviews: 0,
            concepts: new Set()
        };
        console.log('[SessionManager] New session started:', session.id);
    }
    return session;
}

export async function trackExplain(type: 'selection' | 'error' | 'review') {
    const s = getSession();

    if (type === 'selection') s.explains++;
    if (type === 'error') s.errors++;
    if (type === 'review') s.reviews++;

    const totalEvents = s.explains + s.errors + s.reviews;

    // Send update every 5 events
    if (totalEvents > 0 && totalEvents % SESSION_UPDATE_THRESHOLD === 0) {
        await sendSessionUpdate(s);
    }
}

async function sendSessionUpdate(s: Session) {
    try {
        console.log('[SessionManager] Sending session update:', s);
        // Convert Set to Array for JSON serialization
        const payload = {
            ...s,
            concepts: Array.from(s.concepts)
        };

        const response = await fetch('http://localhost:3000/api/sessions', { // Assuming this is the endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.warn('[SessionManager] Failed to update session:', response.status);
        } else {
            console.log('[SessionManager] Session updated successfully');
        }
    } catch (error) {
        console.error('[SessionManager] Error sending session update:', error);
    }
}

// Optionally export a function to force send (e.g. on deactivate)
export async function endSession() {
    if (session) {
        await sendSessionUpdate(session);
        session = null;
    }
}
