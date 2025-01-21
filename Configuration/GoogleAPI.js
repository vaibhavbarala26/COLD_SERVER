require("dotenv").config();
const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const OAuth2Client = new google.auth.OAuth2(
   process.env.GOOGLE_SECRET_ID, // This should hold the Client ID
  process.env.GOOGLE_CLIENT_KEY , // This should hold the Client Secret
  "http://localhost:1042/user/oauth2callback" // Redirect URI for local development
);

module.exports = { OAuth2Client, SCOPES };
