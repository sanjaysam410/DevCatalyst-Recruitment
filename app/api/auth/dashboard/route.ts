import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();
        const correctPassword = process.env.DASHBOARD_PASSWORD;

        if (!correctPassword) {
            return NextResponse.json(
                { success: false, message: "Dashboard password not configured on server." },
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
