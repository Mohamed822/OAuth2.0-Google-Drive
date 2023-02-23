const express = require("express");
const db = require("./app/models/db.js")
const cors = require("cors");
const { google } = require('googleapis');
const app = express();
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '578997768196-p0u13lmul3p4vf028eu10d32b8jtl5un.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:8080/auth/callback';

// Create an instance of the OAuth2 client
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
  });
  res.redirect(url);
})

app.get('auth/callback', async (req, res) => {
 
  console.log('ok');
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code')
  }
  console.log(code)
try{
  const { tokens } = await oauth2Client.getToken(code);
  const sql = `
  INSERT INTO access_tokens (user_id, access_token, refresh_token, token_expiry)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), refresh_token = VALUES(refresh_token), token_expiry = VALUES(token_expiry)
`;
const values = [user.id, tokens.access_token, tokens.refresh_token, new Date(tokens.expiry_date)];

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

// const clientIds = {
//     account1: '116101226349-q41oo9eudktkvmfgbjhcttdj5n571bs7.apps.googleusercontent.com',
//     account2: '116101226349-p9unc63vjd3u2kq5sidfqsb3ontgsd88.apps.googleusercontent.com'
// }
// const clientSecrets = {
//     account1: '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',
//     account2: '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',
// };

// const redirectUris = {
//     account1: 'http://localhost:8080/auth/account1/callback',
//     account2: 'http://localhost:8080/auth/account2/callback',
// };

// // The scopes that you want to request access to for each account
// const scopes = {
//     account1: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
//     account2: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
// };

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


// app.get('/auth/:account', (req, res) => {
//     const account = req.params.account;
//       // Set up the OAuth2.0 client for this account
//     const oAuthCli = new google.auth.OAuth2(
//     clientIds[account],
//     clientSecrets[account],
//     redirectUris[account]
//   );
//   // Generate the authorization URL
//   const authUrl = oAuthCli.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes[account],
//   });
//   // Store the OAuth2.0 client for this account
//   oAuth2Clients[account] = oAuthCli;
//   // Redirect the user to the authorization URL
//   res.redirect(authUrl);
// });

// let drive = '';
// app.get('/auth/:account/callback', async (req, res) => {
//     const account = req.params.account;
//     const code = req.query.code;

//     if (!code) {
//         return res.status(400).send('Missing authorization code')
//       }

//   try {
//     const { tokens } = await oAuth2Clients[account].getToken(code)
//     oAuth2Clients[account].setCredentials(tokens)
//      drive = google.drive({
//       version: 'v3',
//       auth: oAuth2Clients[account]
//     })
//     res.redirect('/drive')
//   } catch (err) {
//     console.error(err)
//     res.status(500).send('Error exchanging authorization code for access token')
//   }

// });

  //  app.get('/drive', async (req, res) => {
  //    const { data } = await drive.files.list({
  //      fields: 'files(id, name)'
  //    })
  //    res.json(data)
  //  })



  require("./app/routes/user.routes.js")(app);
  // set port, listen for requests
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
});