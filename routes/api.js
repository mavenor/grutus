// An Express.JS submodule for internal application user management API

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

router.get('/oauth2_callback', (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    const code = req.query.code;
    if (code) {
        oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
                console.error('Error retrieving access token', err);
                return;
            }
            oauth2Client.setCredentials(tokens);
            res.redirect('/api/success');
        });
    }
});
