# CSB Form Backend Setup (Google Sheets)

This site has two forms that submit to a Google Sheet:

1. **CSB Fan Club** — email signup on the homepage/footer
2. **Reservation Request** — table booking form on the contact page

Both forms POST to a single Google Apps Script web app URL.

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it **CSB Website Forms**.
3. In the first sheet, add these headers in row 1:

```
Timestamp | Form Type | Name | Email | Phone | Date | Time | Party Size | Favourite Team | Message | Source
```

4. Note the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## Step 2: Add the Apps Script

1. In the spreadsheet, click **Extensions → Apps Script**.
2. Replace the default code with the script below.
3. Replace `YOUR_SPREADSHEET_ID` with the ID from Step 1.
4. Replace `YOUR_EMAIL@example.com` with `csbsportsbar.ca@gmail.com` if you want email notifications.
5. Click **Save** (disk icon) and name the project **CSB Forms**.

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const NOTIFY_EMAIL = 'csbsportsbar.ca@gmail.com'; // optional, leave blank to disable
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const data = e.parameter || {};
    const formType = data.formType || 'general';
    const timestamp = new Date();

    const row = [
      timestamp,
      formType,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.date || '',
      data.time || '',
      data.partySize || '',
      data.favouriteTeam || '',
      data.message || '',
      data.source || ''
    ];

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      const subject = `New CSB ${formType} form submission`;
      const body = Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      try {
        MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
      } catch (err) {
        console.error('Email failed', err);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CSB Forms API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set:
   - **Description:** CSB Website Forms
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Authorize the script when prompted.
6. Copy the **Web app URL**.

## Step 4: Add the URL to the Website

1. Open `js/main.js`.
2. Find this line near the top:

```javascript
const GSHEET_FORM_URL = '';
```

3. Paste your web app URL between the quotes:

```javascript
const GSHEET_FORM_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

4. Redeploy the site.

## Test It

- Submit the Fan Club form on the homepage.
- Submit the reservation form on the contact page.
- Check the Google Sheet for new rows.
