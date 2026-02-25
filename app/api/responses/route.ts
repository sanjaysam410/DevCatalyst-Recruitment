import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this endpoint is never cached

export async function GET() {
    try {
        // 1. Fetch Candidate Data from CSV
        const filePath = path.join(process.cwd(), 'public', 'assets', 'DevCatalyst-recruitment-forms.csv');
        const fileContent = fs.readFileSync(filePath, 'utf8');

        const parsedData = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
        });

        // 2. Fetch Core Scores from Google Sheets
        let coreScores: Record<string, string> = {};

        try {
            if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID) {
                const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '');
                const auth = new JWT({
                    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    key: privateKey,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
                await doc.loadInfo();

                const coreSheet = doc.sheetsByIndex.find(s => s.title.toLowerCase().includes('core'));
                if (coreSheet) {
                    try {
                        await coreSheet.loadHeaderRow();
                        const rows = await coreSheet.getRows();
                        rows.forEach(row => {
                            const roll = row.get("Roll Number");
                            const score = row.get("Response Score");
                            if (roll && score) {
                                coreScores[roll] = score;
                            }
                        });
                    } catch (e) {
                        // This happens if the sheet tab exists but is completely empty (no headers)
                        console.log("Core sheet exists but has no headers yet. Skipping score merge.");
                    }
                }
            }
        } catch (sheetError) {
            console.error("Score Fetch Error:", sheetError);
            // Non-critical error, continue with empty scores
        }

        // 3. Map Rows and Merge Scores
        const formattedSubmissions = parsedData.data.map((row: any) => {
            const roll_number = row['Roll Number'] || '';
            const submission: any = {
                timestamp: row['Timestamp'] || '',
                full_name: row['Full Name'] || '',
                roll_number: roll_number,
                branch: row['Branch'] || '',
                section: row['Section'] || '',
                selected_track: row['Selected Track'] || '',
                email: row['Email'] || '',
                phone: row['Phone'] || '',
                core_response_score: coreScores[roll_number] || null
            };

            const coreFields = ['Timestamp', 'Full Name', 'Roll Number', 'Branch', 'Section', 'Selected Track', 'Phone'];

            for (const key of Object.keys(row)) {
                if (!coreFields.includes(key) && row[key] !== undefined && row[key] !== '') {
                    submission[key] = row[key];
                }
            }

            return submission;
        });

        return NextResponse.json({ success: true, data: formattedSubmissions });

    } catch (error: any) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}
