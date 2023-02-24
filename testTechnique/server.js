const express = require("express");
const db = require("./app/models/db.js")
const cors = require("cors");
const { google } = require('googleapis');
const app = express();
//const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '578997768196-p0u13lmul3p4vf028eu10d32b8jtl5un.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:8080/auth/google/callback';

// Create an instance of the OAuth2 client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

//, 'https://www.googleapis.com/auth/userinfo.profile'
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
  });
  res.redirect(url);
})

app.get('/auth/google/callback', async (req, res) => {
 
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code')
  }
try{
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const sql = `
  INSERT INTO access_tokens (access_token,  token_expiry)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), token_expiry = VALUES(token_expiry)
`;
const values = [ tokens.access_token,  new Date(tokens.expiry_date)];

await db.query(sql, values);
res.redirect('/drive');
}catch (err) {
   console.error(err)
   res.status(500).send('Error exchanging authorization code for access token')
 }

})

app.get('/drive', async (req, res) => {
  const { data } = await drive.files.list({
    fields: 'files(id, name)'
  })
    res.json(data)
})

const drive = google.drive({
         version: 'v3',
         auth: oauth2Client
       });
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


require("./app/routes/user.routes.js")(app);
  // set port, listen for requests
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
});