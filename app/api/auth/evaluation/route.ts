import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { team, password } = await req.json();

        // Define password vars for each team (falling back to DASHBOARD_PASSWORD if needed)
        const passwords: Record<string, string | undefined> = {
            "technical": process.env.EVAL_TECHNICAL_PASSWORD || process.env.DASHBOARD_PASSWORD,
            "social": process.env.EVAL_SOCIAL_PASSWORD || process.env.DASHBOARD_PASSWORD,
            "content": process.env.EVAL_CONTENT_PASSWORD || process.env.DASHBOARD_PASSWORD,
            "outreach": process.env.EVAL_OUTREACH_PASSWORD || process.env.DASHBOARD_PASSWORD,
            "core": process.env.EVAL_CORE_PASSWORD || process.env.DASHBOARD_PASSWORD,
        };

        const targetTeam = team?.toLowerCase()?.replace(/\s+/g, "");
        let correctPassword = process.env.DASHBOARD_PASSWORD; // default fallback

        if (targetTeam?.includes("tech")) correctPassword = passwords.technical;
        else if (targetTeam?.includes("social")) correctPassword = passwords.social;
        else if (targetTeam?.includes("content")) correctPassword = passwords.content;
        else if (targetTeam?.includes("outreach")) correctPassword = passwords.outreach;
        else if (targetTeam?.includes("core")) correctPassword = passwords.core;

        if (!correctPassword) {
            return NextResponse.json(
                { success: false, message: "Evaluation password not configured on server." },
                { status: 500 }
            );
        }

        if (password === correctPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { success: false, message: "Incorrect password" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        );
    }
}
