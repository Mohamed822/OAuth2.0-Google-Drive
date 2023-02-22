const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
//const drive = google.drive({ version: 'v3', auth: oauth2Client });


const clientID = '116101226349-q41oo9eudktkvmfgbjhcttdj5n571bs7.apps.googleusercontent.com';
const clientSecret = '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';
const redirectURI = 'http://localhost:3000/auth/google/callback';

const oauth2Client = new OAuth2Client(clientID, clientSecret, redirectURI);

function authenticate(req, res) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
        ],
    });
    
    res.redirect(authUrl);
  }

  async function authenticateCallback(req, res) {
    const { code } = req.query;
  
    try {
      const { tokens } = await oauth2Client.getToken(code);
  
      // Set the access token and refresh token for the client
      oauth2Client.setCredentials(tokens);
  
      // Redirect the user to the main page
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error authenticating with Google');
    }
  }

//   async function listFiles() {
//     try {
//       const response = await drive.files.list({
//         q: "mimeType='application/pdf'",
//         fields: 'nextPageToken, files(id, name)',
//       });
  
//       const { files } = response.data;
  
//       console.log(`Found ${files.length} PDF files:`);
  
//       files.forEach((file) => {
//         console.log(`${file.name} (${file.id})`);
  