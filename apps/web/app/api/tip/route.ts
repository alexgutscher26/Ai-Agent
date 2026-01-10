import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { generateTip } from "@/lib/llm";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Check if a recent tip exists (created within last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTip = await db.tip.findFirst({
            where: {
                userId: userId,
                createdAt: {
                    gt: oneDayAgo
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (recentTip) {
            return NextResponse.json({ tip: recentTip.content, isNew: false });
        }

        // 2. If no recent tip, generate a new one
        // Fetch recent coding session context
        const recentSessions = await db.codingSession.findMany({
            where: { userId: userId },
            orderBy: { startedAt: 'desc' },
            take: 3
        });

        let context = "The user is a developer.";
        if (recentSessions.length > 0) {
            const languages = recentSessions.map(s => s.language).filter(Boolean).join(", ");
            const activity = recentSessions[0].interactionType || "coding";
            context = `User has been working with ${languages}. Recent activity: ${activity}.`;
        }

        const newTipContent = await generateTip(context);

        // 3. Save the new tip
        const newTip = await db.tip.create({
            data: {
                userId: userId,
                content: newTipContent
            }
        });

        return NextResponse.json({ tip: newTip.content, isNew: true });

    } catch (error) {
        console.error("Error in /api/tip:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
