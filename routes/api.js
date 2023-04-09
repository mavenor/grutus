// A skeletal Google OAuth 2.0 component to initialise the OAuth2Client
// and handle the callback from Google

const express = require('express');
const router = express.Router();
const oauth2 = require('@googleapis/oauth2');

// Initialise the OAuth2Client
const oauth2Client = new oauth2.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

router.get('/oauth2-callback', (req, res) => {

    const code = req.query.code;
    if (code) {
        oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
                // use morgan to log the error
                console.error('Error retrieving access token', err);
                return;
            }
            oauth2Client.setCredentials(tokens);
            res.redirect('/api/success');
        });
    }
});

module.exports = router;
