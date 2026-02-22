const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function test() {
    console.log("Testing connection...");

    // Require environment variables (simulate how Next.js backend reads them from .env.local)
    require('dotenv').config({ path: '.env.local' });

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '');
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.loadHeaderRow();
    console.log("HEADERS:");
    console.log(sheet.headerValues);

    const rows = await sheet.getRows();
    console.log(`\nFound ${rows.length} rows.`);

    // Print the last row's Section data explicitly
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        console.log("\nLast Row Dump:");
        console.log("Name:", lastRow.get("Full Name"));
        console.log("Branch:", lastRow.get("Branch"));
        console.log("Section:", lastRow.get("Section"));
        console.log("Email:", lastRow.get("Email"));
    }
}

test().catch(console.error);
