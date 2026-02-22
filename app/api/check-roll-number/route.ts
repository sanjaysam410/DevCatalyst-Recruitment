import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { roll_number } = body;

        if (!roll_number) {
            return NextResponse.json({ error: 'Roll number is required' }, { status: 400 });
        }

        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
            throw new Error('Missing Google Credentials in Environment Variables');
        }

        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/"/g, '');

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        try {
            await sheet.loadHeaderRow();
            const rows = await sheet.getRows();
            const isDuplicate = rows.some(row => row.get("Roll Number") === roll_number);

            if (isDuplicate) {
                return NextResponse.json({ exists: true, message: 'Application already exists' });
            }
        } catch (e) {
            // If headers don't exist yet, it's likely an empty sheet
        }

        return NextResponse.json({ exists: false });

    } catch (error: any) {
        console.error("Duplicate check error:", error);
        return NextResponse.json({ error: 'Failed to verify roll number' }, { status: 500 });
    }
}
