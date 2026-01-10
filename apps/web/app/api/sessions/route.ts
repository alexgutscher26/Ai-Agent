
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const sessionData = await req.json();

        console.log('[Sessions API] Received update:', sessionData.id);

        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            ...sessionData
        };

        // Append to sessions.jsonl
        fs.appendFileSync(path.join(logDir, 'sessions.jsonl'), JSON.stringify(logEntry) + '\n');

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Sessions API] Error:', error);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}
