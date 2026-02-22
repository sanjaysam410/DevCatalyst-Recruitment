
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this endpoint is never cached

export async function GET() {
    try {
        // 1. Prepare Authentication
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
            throw new Error('Missing Google Credentials');
        }

        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/"/g, '');

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

        // 2. Load the document
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // 3. Fetch Rows
        const rows = await sheet.getRows();

        // 4. Map Rows to Dashboard Format
        const formattedSubmissions = rows.map((row) => ({
            timestamp: row.get('Timestamp'),
            full_name: row.get('Full Name'),
            roll_number: row.get('Roll Number'),
            branch: row.get('Branch'),
            section: row.get('Section'),
            selected_track: row.get('Selected Track'),
            email: row.get('Email'),
            phone: row.get('Phone'),

            // General
            why_join: row.get('Why Join'),

            // Track A: Technical
            tech_skills: row.get('Tech Skills'),
            github_link: row.get('GitHub'),
            linkedin_link: row.get('LinkedIn'),
            portfolio_link_tech: row.get('Portfolio'),

            // Track B: Social
            social_platforms: row.get('Social Platforms'),
            instagram_handle: row.get('Insta Handle'),
            twitter_handle: row.get('Twitter Handle'),
            linkedin_handle_social: row.get('LinkedIn (Social)'), // New field
            other_socials: row.get('Other Socials'), // New field
            social_analysis: row.get('Social Analysis'),

            // Track C: Content
            content_type: row.get('Content Type'),
            content_portfolio: row.get('Portfolio Link'),
            content_ig: row.get('Content IG'),
            content_yt: row.get('Content YT'),
            content_other: row.get('Content Other'),
            tools_familiarity: row.get('Tools'),

            // Track D: Outreach
            cold_outreach_exp: row.get('Cold Outreach'),
            outreach_comfort: row.get('Comfort'),
            sponsorship_strategy: row.get('Strategy'),
        }));

        return NextResponse.json({ success: true, data: formattedSubmissions });

    } catch (error: any) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}
