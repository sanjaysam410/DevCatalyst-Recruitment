
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Prepare Authentication
        console.log("BACKEND: Attempting submission...");

        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
            console.error("BACKEND: Missing Credentials");
            throw new Error('Missing Google Credentials in Environment Variables');
        }

        console.log("BACKEND: Credentials present. Processing key...");

        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            .replace(/\\n/g, '\n') // Replace literal \n with actual newlines
            .replace(/"/g, '');    // Remove any surrounding quotes if they exist

        console.log("BACKEND: Key processed. Length:", privateKey.length);

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: privateKey,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

        // 2. Load the document
        await doc.loadInfo();

        // 3. Select the first sheet
        const sheet = doc.sheetsByIndex[0];

        // 4. Map Form Data to Sheet Row
        // We flatten the structure a bit for the sheet columns
        const row = {
            Timestamp: new Date().toISOString(),
            "Full Name": body.full_name,
            "Roll Number": body.roll_number,
            "Branch": body.branch,
            "Section": body.section,
            "Email": body.email,
            "Phone": body.phone,
            "Why Join": body.why_join,
            "Goals": body.goals,
            "Prioritization": body.prioritization_scenario,
            "Commitment": body.time_commitment,
            "Team Failure": body.team_failure_experience,
            "Unlimited Resources": body.unlimited_resources || '',
            "Event Exp": body.event_experience,
            "Event Details": body.event_experience_details,
            "Crisis Mgmt": body.crisis_management,
            "Success Factors": body.event_success_factors,
            "Selected Track": body.selected_track,

            // Track A
            "Tech Skills": Array.isArray(body.tech_skills) ? body.tech_skills.join(', ') : '',
            "GitHub": body.github_link || '',
            "LinkedIn": body.linkedin_link || '',
            "Portfolio": body.portfolio_link_tech || '',
            "Appr. Learning": body.learning_approach || '',
            "Struggle": body.tech_struggle || '',
            "Blocker": body.tech_blocker || '',
            "Collab Style": body.collaboration_style || '',
            "Explain Simple": body.tech_explain_simple || '',

            // Track B
            "Social Platforms": Array.isArray(body.social_platforms) ? body.social_platforms.join(', ') : '',
            "Insta Handle": body.instagram_handle_social || '',
            "LinkedIn (Social)": body.linkedin_handle_social || '',
            "Twitter Handle": body.twitter_handle_social || '',
            "Other Socials": body.other_socials || '',
            "Social Analysis": body.social_analysis || '',
            "Writing Task": body.social_writing_task || '',
            "Influencers": body.social_influencers || '',
            "Viral Idea": body.social_viral_idea || '',
            "Trend Critique": body.social_trend_critique || '',

            // Track C
            "Content Type": Array.isArray(body.content_type) ? body.content_type.join(', ') : '',
            "Portfolio Link": body.portfolio_link || '',
            "Content IG": body.content_socials_ig || '',
            "Content YT": body.content_socials_yt || '',
            "Content Other": body.content_socials_behance || '',
            "Process": body.creative_process || '',
            "Philosophy": body.design_philosophy || '',
            "Feedback": body.feedback_handling || '',
            "Tools": Array.isArray(body.tools_familiarity) ? body.tools_familiarity.join(', ') : '',
            "Perfect Content": body.perfect_content || '',

            // Track D
            "Cold Outreach": body.cold_outreach_exp || '',
            "Email Task": body.email_writing_exercise || '',
            "Comfort": body.outreach_comfort || '',
            "Strategy": body.sponsorship_strategy || '',
            "Persuasion": body.persuasion_task || '',

            // Closing
            "Culture Fit": body.culture_fit,
            "Conflict": body.conflict_resolution,
            "Honesty": body.honesty_check,
            "Questions": body.any_questions || ''
        };

        // 5. Add Row or Set Headers
        let headersLoaded = false;
        try {
            await sheet.loadHeaderRow();
            headersLoaded = true;
        } catch (e) {
            // Headers likely don't exist or loading failed
            // We will set them below
        }

        // Resize if needed
        const requiredColumns = Object.keys(row).length;
        if (sheet.columnCount < requiredColumns) {
            await sheet.resize({ rowCount: sheet.rowCount, columnCount: requiredColumns + 5 }); // Add buffer
        }

        // Only check headerValues if loaded successfully, otherwise headers are needed
        if (!headersLoaded || sheet.rowCount === 0 || (headersLoaded && sheet.headerValues.length === 0)) {
            await sheet.setHeaderRow(Object.keys(row));
        } else {
            // Check if the spreadsheet is missing any headers we are trying to insert (like Section)
            const currentHeaders = [...sheet.headerValues];
            let needsUpdate = false;
            Object.keys(row).forEach(key => {
                if (!currentHeaders.includes(key)) {
                    currentHeaders.push(key);
                    needsUpdate = true;
                }
            });
            if (needsUpdate) {
                await sheet.setHeaderRow(currentHeaders);
            }
        }

        await sheet.loadHeaderRow(); // Ensure exact mapping before row injection
        await sheet.addRow(row);

        return NextResponse.json({ success: true, message: 'Submitted successfully' });
    } catch (error: any) {
        console.error("Sheet Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
    }
}
