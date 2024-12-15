const {google} = require("googleapis")

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

module.exports = oauth2Client;