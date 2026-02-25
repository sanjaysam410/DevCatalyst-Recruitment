import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { candidate, team, scores, remarks, evaluator } = body;

        // 1. Prepare Authentication
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
            throw new Error('Missing Google Credentials in Environment Variables');
        }

        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/"/g, '');

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // The user specified that they have multiple sheets (tabs) in the single specific spreadsheet.
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

        // 2. Load the document
        await doc.loadInfo();

        // 3. Find correct sheet tab
        let targetTabName = "";
        const teamLower = team.toLowerCase();
        if (teamLower.includes('core')) targetTabName = 'core';
        else if (teamLower.includes('tech')) targetTabName = 'tech';
        else if (teamLower.includes('content')) targetTabName = 'content';
        else if (teamLower.includes('social')) targetTabName = 'social';
        else if (teamLower.includes('outreach')) targetTabName = 'outreach';

        // Find the sheet by case-insensitive title match
        let targetSheet = null;
        for (const sheet of doc.sheetsByIndex) {
            if (sheet.title.toLowerCase().includes(targetTabName)) {
                targetSheet = sheet;
                break;
            }
        }

        if (!targetSheet) {
            return NextResponse.json({ success: false, error: `Sheet tab containing '${targetTabName}' not found in the Spreadsheet` }, { status: 404 });
        }

        // 4. Map evaluation data to row
        const timestamp = new Date().toISOString(); // Evaluation timestamp

        const rowData: Record<string, string | number> = {
            "Evaluation Timestamp": timestamp,
            "Evaluator": evaluator || "Anonymous",
            "Candidate Name": candidate.full_name,
            "Roll Number": candidate.roll_number,
            "Branch": candidate.branch,
            "Remarks": remarks || "",
        };

        // Inject dynamic scores
        Object.keys(scores).forEach(param => {
            rowData[param] = scores[param];
        });

        // 5. Check/Set headers and Add Row
        let headersLoaded = false;
        try {
            await targetSheet.loadHeaderRow();
            headersLoaded = true;
        } catch (e) {
            // Headers missing or sheet is empty
        }

        const requiredColumns = Object.keys(rowData).length;
        if (targetSheet.columnCount < requiredColumns + 5) {
            await targetSheet.resize({ rowCount: targetSheet.rowCount, columnCount: requiredColumns + 5 });
        }

        if (!headersLoaded || targetSheet.rowCount === 0 || targetSheet.headerValues.length === 0) {
            await targetSheet.setHeaderRow(Object.keys(rowData));
        } else {
            const currentHeaders = [...targetSheet.headerValues];
            let needsUpdate = false;
            Object.keys(rowData).forEach(key => {
                if (!currentHeaders.includes(key)) {
                    currentHeaders.push(key);
                    needsUpdate = true;
                }
            });
            if (needsUpdate) {
                await targetSheet.setHeaderRow(currentHeaders);
            }
        }

        // Add the scoring row
        await targetSheet.addRow(rowData);

        return NextResponse.json({ success: true, message: 'Evaluation saved successfully' });
    } catch (error: any) {
        console.error("Evaluation Submit Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to submit evaluation' }, { status: 500 });
    }
}
