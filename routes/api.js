// A skeletal Google OAuth 2.0 component to initialise the OAuth2Client
// and handle the callback from Google

const express = require('express');
const router = express.Router();
const oauth2 = require('@googleapis/oauth2');
const { orgClient } = require('@google-cloud/resource-manager');


// Initialise the OAuth2Client
const oauth2Client = new oauth2.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

router.get('/oauth2-callback', (req, res) => {
    if (!req.query.code) {
        res.status(400).send('No code provided!');
        if (req.query.error === 'access_denied') {
            res.status(403).send('Access denied by the user!');
            return;
        }
    }
    
    const code = req.query.code;
    if (code) {
        oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
                // use morgan to log the error
                console.error('Error retrieving access token', err);
                return;
            }
            oauth2Client.setCredentials(tokens);
            // Successfully retrieved the access token!
            // Using the token to retrieve email address
            
            const resourceManager = new orgClient({
                auth: oauth2Client
            });
            resourceManager.searchOrganizationsAsync({
                query: 'domain:' + process.env.DOMAIN
            }).then(
                responses => {
                    var domainFound = false;
                    for (const response of responses) {
                        if (response.domain === process.env.DOMAIN) {
                            domainFound = true;
                            break;
                        }
                    }
                    if (domainFound) {
                        // The user is a member of the domain
                        res.redirect('/webauthn-register');
                    } else {
                        // The user is not a member of the domain
                        res.status(403).send('Access denied! You are not a member of ' + process.env.DOMAIN + '!');
                    }
                }
            )
        });
    }

});

module.exports = router;
